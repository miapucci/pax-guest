-- Restore auto-creation of hosts + profiles rows for new auth users.
-- Root cause of the onboarding FK failure (Jun 12): properties.host_id
-- references hosts(id), and the trigger that created hosts rows on signup
-- was dropped during the iOS era ("Drop Auth User Trigger and Handler").
-- Web signups therefore had no hosts row → property inserts failed.

-- 1) Function: create both rows for every new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.hosts (id) values (new.id) on conflict (id) do nothing;
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

-- 2) Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Backfill: every existing auth user missing either row
insert into public.hosts (id)
select u.id from auth.users u
left join public.hosts h on h.id = u.id
where h.id is null;

insert into public.profiles (id)
select u.id from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
