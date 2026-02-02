-- Add household_id and created_by columns to meal_plans
alter table meal_plans add column household_id uuid references households(id) on delete cascade;
alter table meal_plans add column created_by uuid references profiles(id) on delete set null;

-- Delete all existing anonymous meal plan data (as per migration note)
delete from meal_plans;

-- Drop the old anonymous access policy
drop policy if exists "Allow anonymous access" on meal_plans;
