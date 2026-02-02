-- Run this entire file in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create households table
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null default 'My Household'
);
alter table households enable row level security;

-- 2. Create profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  active_household_id uuid references households(id) on delete set null,
  created_at timestamptz default now()
);
alter table profiles enable row level security;

-- 3. Create household_members table
create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  unique (household_id, user_id)
);
alter table household_members enable row level security;

-- 4. Create household_invitations table
create table if not exists household_invitations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  email text not null,
  invited_by uuid references profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days',
  unique (household_id, email)
);
alter table household_invitations enable row level security;

-- 5. Modify meal_plans table
alter table meal_plans add column if not exists household_id uuid references households(id) on delete cascade;
alter table meal_plans add column if not exists created_by uuid references profiles(id) on delete set null;
drop policy if exists "Allow anonymous access" on meal_plans;

-- 6. Create meal_preferences table
create table if not exists meal_preferences (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  meal_description text not null,
  preference text not null check (preference in ('liked', 'disliked')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  unique (household_id, meal_type, meal_description)
);
alter table meal_preferences enable row level security;

-- 7. Helper function
create or replace function is_household_member(hh_id uuid)
returns boolean as $$
  select exists (
    select 1 from household_members
    where household_id = hh_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- 8. RLS Policies
drop policy if exists "Users can view their households" on households;
create policy "Users can view their households" on households for select using (is_household_member(id));

drop policy if exists "Users can update their households" on households;
create policy "Users can update their households" on households for update using (is_household_member(id));

drop policy if exists "Users can insert households" on households;
create policy "Users can insert households" on households for insert with check (true);

drop policy if exists "Users can view household members" on household_members;
create policy "Users can view household members" on household_members for select using (is_household_member(household_id));

drop policy if exists "Owners can insert household members" on household_members;
create policy "Owners can insert household members" on household_members for insert with check (
  exists (select 1 from household_members where household_id = household_members.household_id and user_id = auth.uid() and role = 'owner')
  or user_id = auth.uid()
);

drop policy if exists "Owners can delete household members" on household_members;
create policy "Owners can delete household members" on household_members for delete using (
  exists (select 1 from household_members hm where hm.household_id = household_members.household_id and hm.user_id = auth.uid() and hm.role = 'owner')
  or user_id = auth.uid()
);

drop policy if exists "Users can view profiles of household members" on profiles;
create policy "Users can view profiles of household members" on profiles for select using (
  id = auth.uid()
  or exists (select 1 from household_members hm1 join household_members hm2 on hm1.household_id = hm2.household_id where hm1.user_id = auth.uid() and hm2.user_id = profiles.id)
);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (id = auth.uid());

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles for insert with check (id = auth.uid());

drop policy if exists "Users can view invitations for their households" on household_invitations;
create policy "Users can view invitations for their households" on household_invitations for select using (
  is_household_member(household_id) or email = (select email from auth.users where id = auth.uid())
);

drop policy if exists "Members can create invitations" on household_invitations;
create policy "Members can create invitations" on household_invitations for insert with check (is_household_member(household_id));

drop policy if exists "Inviters can cancel, invitees can accept/decline" on household_invitations;
create policy "Inviters can cancel, invitees can accept/decline" on household_invitations for update using (
  invited_by = auth.uid() or email = (select email from auth.users where id = auth.uid())
);

drop policy if exists "Inviters can delete invitations" on household_invitations;
create policy "Inviters can delete invitations" on household_invitations for delete using (invited_by = auth.uid());

drop policy if exists "Household members can view meal preferences" on meal_preferences;
create policy "Household members can view meal preferences" on meal_preferences for select using (is_household_member(household_id));

drop policy if exists "Household members can insert meal preferences" on meal_preferences;
create policy "Household members can insert meal preferences" on meal_preferences for insert with check (is_household_member(household_id));

drop policy if exists "Household members can update meal preferences" on meal_preferences;
create policy "Household members can update meal preferences" on meal_preferences for update using (is_household_member(household_id));

drop policy if exists "Household members can delete meal preferences" on meal_preferences;
create policy "Household members can delete meal preferences" on meal_preferences for delete using (is_household_member(household_id));

drop policy if exists "Household members can view meal plans" on meal_plans;
create policy "Household members can view meal plans" on meal_plans for select using (is_household_member(household_id));

drop policy if exists "Household members can insert meal plans" on meal_plans;
create policy "Household members can insert meal plans" on meal_plans for insert with check (is_household_member(household_id));

drop policy if exists "Household members can delete meal plans" on meal_plans;
create policy "Household members can delete meal plans" on meal_plans for delete using (is_household_member(household_id));

-- 9. Trigger for new user signup
create or replace function handle_new_user()
returns trigger as $$
declare
  new_household_id uuid;
begin
  insert into households (name) values (coalesce(new.raw_user_meta_data->>'name', 'My') || '''s Household') returning id into new_household_id;
  insert into profiles (id, display_name, avatar_url, active_household_id) values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), new.raw_user_meta_data->>'avatar_url', new_household_id);
  insert into household_members (household_id, user_id, role) values (new_household_id, new.id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
