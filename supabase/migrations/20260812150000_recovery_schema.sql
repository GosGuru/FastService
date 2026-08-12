create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;

create or replace function app_private.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()); $$;

revoke all on function app_private.is_admin() from public;
grant execute on function app_private.is_admin() to authenticated;

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('boatCollections', 'boats', 'servicePages', 'vehicles', 'waterToys', 'seoPages', 'faqs', 'settings')),
  content_id text not null,
  payload jsonb not null,
  status text not null default 'published' check (status = 'published'),
  visibility text not null default 'listed' check (visibility in ('listed', 'hidden')),
  robots_index boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_type, content_id)
);

create index if not exists content_items_public_idx on public.content_items (content_type, status, visibility, sort_order);
create index if not exists content_items_payload_gin_idx on public.content_items using gin (payload);

grant usage on schema public to anon, authenticated;
grant select on public.content_items to anon, authenticated;
grant insert, update, delete on public.content_items to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists content_items_set_updated_at on public.content_items;
create trigger content_items_set_updated_at before update on public.content_items
for each row execute function public.set_updated_at();

alter table public.content_items enable row level security;

drop policy if exists "admin users can read own row" on public.admin_users;
create policy "admin users can read own row" on public.admin_users for select to authenticated
using (user_id = auth.uid() or app_private.is_admin());

drop policy if exists "admins can manage admin users" on public.admin_users;
create policy "admins can manage admin users" on public.admin_users for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());

drop policy if exists "public can read published content" on public.content_items;
create policy "public can read published content" on public.content_items for select to anon, authenticated
using (status = 'published');

drop policy if exists "admins can manage all content" on public.content_items;
create policy "admins can manage all content" on public.content_items for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());

drop function if exists public.is_admin();
