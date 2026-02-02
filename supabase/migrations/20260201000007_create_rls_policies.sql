-- Helper function: Check if user is member of a household
create or replace function is_household_member(hh_id uuid)
returns boolean as $$
  select exists (
    select 1 from household_members
    where household_id = hh_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- Households: Users can view households they belong to
create policy "Users can view their households"
  on households for select
  using (is_household_member(id));

create policy "Users can update their households"
  on households for update
  using (is_household_member(id));

create policy "Users can insert households"
  on households for insert
  with check (true);

-- Household Members: Users can view members of their households
create policy "Users can view household members"
  on household_members for select
  using (is_household_member(household_id));

create policy "Owners can insert household members"
  on household_members for insert
  with check (
    exists (
      select 1 from household_members
      where household_id = household_members.household_id
        and user_id = auth.uid()
        and role = 'owner'
    )
    or user_id = auth.uid()  -- Allow user to join their own household
  );

create policy "Owners can delete household members"
  on household_members for delete
  using (
    exists (
      select 1 from household_members hm
      where hm.household_id = household_members.household_id
        and hm.user_id = auth.uid()
        and hm.role = 'owner'
    )
    or user_id = auth.uid()  -- Users can remove themselves
  );

-- Profiles: Users can view profiles of fellow household members, update own
create policy "Users can view profiles of household members"
  on profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from household_members hm1
      join household_members hm2 on hm1.household_id = hm2.household_id
      where hm1.user_id = auth.uid() and hm2.user_id = profiles.id
    )
  );

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on profiles for insert
  with check (id = auth.uid());

-- Household Invitations: Members can view/create/cancel; invitees can accept/decline
create policy "Users can view invitations for their households"
  on household_invitations for select
  using (
    is_household_member(household_id)
    or email = (select email from auth.users where id = auth.uid())
  );

create policy "Members can create invitations"
  on household_invitations for insert
  with check (is_household_member(household_id));

create policy "Inviters can cancel, invitees can accept/decline"
  on household_invitations for update
  using (
    invited_by = auth.uid()
    or email = (select email from auth.users where id = auth.uid())
  );

create policy "Inviters can delete invitations"
  on household_invitations for delete
  using (invited_by = auth.uid());

-- Meal Preferences: Household members have full CRUD
create policy "Household members can view meal preferences"
  on meal_preferences for select
  using (is_household_member(household_id));

create policy "Household members can insert meal preferences"
  on meal_preferences for insert
  with check (is_household_member(household_id));

create policy "Household members can update meal preferences"
  on meal_preferences for update
  using (is_household_member(household_id));

create policy "Household members can delete meal preferences"
  on meal_preferences for delete
  using (is_household_member(household_id));

-- Meal Plans: Household members can view/create/delete
create policy "Household members can view meal plans"
  on meal_plans for select
  using (is_household_member(household_id));

create policy "Household members can insert meal plans"
  on meal_plans for insert
  with check (is_household_member(household_id));

create policy "Household members can delete meal plans"
  on meal_plans for delete
  using (is_household_member(household_id));

-- Trigger: Auto-create household, profile, and membership on signup
create or replace function handle_new_user()
returns trigger as $$
declare
  new_household_id uuid;
begin
  -- Create a household for the new user
  insert into households (name)
  values (coalesce(new.raw_user_meta_data->>'name', 'My') || '''s Household')
  returning id into new_household_id;

  -- Create profile with active_household set
  insert into profiles (id, display_name, avatar_url, active_household_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    new_household_id
  );

  -- Add user as owner of their household
  insert into household_members (household_id, user_id, role)
  values (new_household_id, new.id, 'owner');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
