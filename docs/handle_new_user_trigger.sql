-- MoveCorp: auto-create a `profiles` row whenever a new auth user signs up.
--
-- Run this ONCE in Supabase -> SQL Editor -> New query -> Run.
-- After this is installed, self-registration (supabase.auth.signUp from the app)
-- automatically creates the matching profile with the correct role, using the
-- metadata the app sends in options.data ({ full_name, role }).
--
-- Safe to re-run: uses "create or replace" and drops/recreates the trigger.

-- 1) Function: insert a profile row from the new auth user's metadata.
--    SECURITY DEFINER lets it bypass RLS for this controlled insert.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    -- Fall back to 'employee' if no (or empty) role was provided in metadata.
    coalesce(
      nullif(new.raw_user_meta_data ->> 'role', '')::public.app_role,
      'employee'::public.app_role
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 2) Trigger: run the function after each new auth user is created.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
