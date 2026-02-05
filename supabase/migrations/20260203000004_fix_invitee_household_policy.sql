-- Fix the policy to use auth_user_email() helper instead of direct auth.users access
drop policy if exists "Invitees can view household they are invited to" on households;

create policy "Invitees can view household they are invited to"
  on households for select
  using (
    exists (
      select 1 from household_invitations
      where household_invitations.household_id = id
        and lower(household_invitations.email) = lower(auth_user_email())
        and household_invitations.status = 'pending'
    )
  );
