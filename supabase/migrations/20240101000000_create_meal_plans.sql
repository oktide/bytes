create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  family_size int,
  weekly_budget numeric,
  plan jsonb not null
);

alter table meal_plans enable row level security;

create policy "Allow anonymous access" on meal_plans
  for all
  using (true)
  with check (true);
