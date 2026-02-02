-- Create household_members junction table (users can belong to multiple households)
create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  unique (household_id, user_id)
);

alter table household_members enable row level security;
