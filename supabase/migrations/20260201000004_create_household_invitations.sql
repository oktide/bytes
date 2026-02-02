-- Create household_invitations table
create table household_invitations (
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
