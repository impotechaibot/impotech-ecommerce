-- ImpoTech shared Website/Admin settings table.
-- Schema: key text primary key, value jsonb, updated_at timestamptz.
-- This script uses the existing Admin app's Auth + admin_users table.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and coalesce(role, 'admin') in ('admin', 'owner')
  );
$$;

alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;

-- Public website may read site config, but only a registered Admin may write.
drop policy if exists "public read settings" on public.site_settings;
drop policy if exists "site_settings_public_read" on public.site_settings;
drop policy if exists "site_settings_anon_insert" on public.site_settings;
drop policy if exists "site_settings_anon_update" on public.site_settings;
drop policy if exists "admin all settings" on public.site_settings;
drop policy if exists "admin all site_settings" on public.site_settings;
drop policy if exists "site_settings_public_read_v2" on public.site_settings;
drop policy if exists "site_settings_admin_insert_v2" on public.site_settings;
drop policy if exists "site_settings_admin_update_v2" on public.site_settings;
drop policy if exists "site_settings_admin_delete_v2" on public.site_settings;
create policy "site_settings_public_read_v2"
  on public.site_settings for select to anon, authenticated using (true);
create policy "site_settings_admin_insert_v2"
  on public.site_settings for insert to authenticated with check (public.is_admin());
create policy "site_settings_admin_update_v2"
  on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "site_settings_admin_delete_v2"
  on public.site_settings for delete to authenticated using (public.is_admin());

drop policy if exists "admin read admins" on public.admin_users;
create policy "admin read admins" on public.admin_users for select to authenticated
  using (public.is_admin());

insert into public.site_settings (key, value, updated_at)
values ('site', '{}'::jsonb, now()), ('identity', '{}'::jsonb, now()),
       ('checkout', '{}'::jsonb, now()), ('theme', '{}'::jsonb, now()),
       ('contact', '{}'::jsonb, now())
on conflict (key) do nothing;

-- Enable live setting updates for the storefront when the publication exists.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'site_settings') then
    execute 'alter publication supabase_realtime add table public.site_settings';
  end if;
end $$;
