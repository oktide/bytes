-- Add household_name to invitations for easier display
alter table household_invitations
add column household_name text;

-- Backfill existing invitations
update household_invitations
set household_name = households.name
from households
where household_invitations.household_id = households.id;

-- Make it not null after backfill
alter table household_invitations
alter column household_name set not null;
