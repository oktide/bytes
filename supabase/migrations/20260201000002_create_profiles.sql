-- Create profiles table (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  active_household_id uuid references households(id) on delete set null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
