-- Add week_start_date column to meal_plans
alter table meal_plans add column if not exists week_start_date date;

-- Backfill existing plans with the Monday of their created_at week
-- date_trunc('week', date) returns Monday in PostgreSQL (ISO week starts Monday)
update meal_plans
set week_start_date = date_trunc('week', created_at)::date
where week_start_date is null;

-- Delete duplicate plans per household per week, keeping only the most recent
delete from meal_plans
where id not in (
  select distinct on (household_id, week_start_date) id
  from meal_plans
  order by household_id, week_start_date, created_at desc
);

-- Add unique constraint on (household_id, week_start_date)
-- This ensures one plan per household per week
alter table meal_plans add constraint meal_plans_household_week_unique
  unique (household_id, week_start_date);
