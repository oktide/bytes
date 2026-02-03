-- Create a helper function to get current user's email (security definer to access auth.users)
create or replace function auth_user_email()
returns text as $$
  select email from auth.users where id = auth.uid()
$$ language sql security definer;

-- Fix the invitation select policy to use helper function
drop policy if exists "Users can view invitations for their households" on household_invitations;
create policy "Users can view invitations for their households" on household_invitations
for select using (
  is_household_member(household_id)
  or lower(email) = lower(auth_user_email())
);

-- Fix the invitation update policy to use helper function
drop policy if exists "Inviters can cancel, invitees can accept/decline" on household_invitations;
create policy "Inviters can cancel, invitees can accept/decline" on household_invitations
for update using (
  invited_by = auth.uid()
  or lower(email) = lower(auth_user_email())
);
