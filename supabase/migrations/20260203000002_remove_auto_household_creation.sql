-- Update trigger to only create profile, not auto-create household
create or replace function handle_new_user()
returns trigger as $$
begin
  -- Create profile without active_household
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$ language plpgsql security definer;
