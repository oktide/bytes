-- Allow users to view households they've been invited to
create policy "Invitees can view household they are invited to"
  on households for select
  using (
    exists (
      select 1 from household_invitations
      where household_invitations.household_id = id
        and household_invitations.email = (select email from auth.users where id = auth.uid())
        and household_invitations.status = 'pending'
    )
  );
