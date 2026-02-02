-- Create meal_preferences table
create table meal_preferences (
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
