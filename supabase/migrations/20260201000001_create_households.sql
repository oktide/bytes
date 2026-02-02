-- Create households table
create table households (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null default 'My Household'
);

alter table households enable row level security;
