create type public.app_role as enum ('staff', 'storekeeper', 'admin');   -- order matters
create type public.account_status as enum ('pending', 'active', 'disabled');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        public.app_role not null default 'staff',
  status      public.account_status not null default 'pending',
  created_at  timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users (id)
);

alter table public.profiles enable row level security;

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_active_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and status = 'active' and role = 'admin'
  );
$$;

create policy "read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "admins read all profiles" on public.profiles
  for select to authenticated using (public.is_active_admin());

revoke update on public.profiles from authenticated, anon;
grant update (full_name) on public.profiles to authenticated;
create policy "update own name" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create function public.get_my_access()
returns table (id uuid, email text, full_name text, role public.app_role, status public.account_status)
language sql stable security invoker set search_path = '' as $$
  select id, email, full_name, role, status from public.profiles where id = (select auth.uid());
$$;

create function public.admin_set_access(target uuid, new_role public.app_role, new_status public.account_status)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_active_admin() then
    raise exception 'forbidden';
  end if;
  if target = (select auth.uid()) and (new_role <> 'admin' or new_status <> 'active') then
    raise exception 'admins cannot demote or disable themselves';
  end if;
  update public.profiles
     set role = new_role,
         status = new_status,
         approved_at = case when new_status = 'active' and approved_at is null then now() else approved_at end,
         approved_by = case when new_status = 'active' and approved_by is null then (select auth.uid()) else approved_by end
   where id = target;
end;
$$;

revoke execute on function public.admin_set_access(uuid, public.app_role, public.account_status) from anon;
revoke execute on function public.get_my_access() from anon;
