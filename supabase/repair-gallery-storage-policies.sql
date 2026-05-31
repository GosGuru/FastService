-- FastService Storage repair.
-- Ejecutar en Supabase SQL Editor si las fotos/videos fallan con:
--   new row violates row-level security policy
--   403 / RLS / permisos al subir a fastservice-gallery
--
-- Esto no cambia el contenido publicado. Solo asegura:
-- - tabla admin_users
-- - helper app_private.is_admin()
-- - bucket publico fastservice-gallery
-- - policies necesarias para leer, subir, actualizar y borrar archivos

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
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  );
$$;

revoke all on function app_private.is_admin() from public;
grant execute on function app_private.is_admin() to authenticated;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

drop policy if exists "admin users can read own row" on public.admin_users;
create policy "admin users can read own row"
on public.admin_users for select
to authenticated
using (user_id = auth.uid() or app_private.is_admin());

drop policy if exists "admins can manage admin users" on public.admin_users;
create policy "admins can manage admin users"
on public.admin_users for all
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fastservice-gallery',
  'fastservice-gallery',
  true,
  209715200,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read fastservice gallery" on storage.objects;
create policy "public can read fastservice gallery"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'fastservice-gallery');

drop policy if exists "admins can upload fastservice gallery" on storage.objects;
create policy "admins can upload fastservice gallery"
on storage.objects for insert
to authenticated
with check (bucket_id = 'fastservice-gallery' and app_private.is_admin());

drop policy if exists "admins can update fastservice gallery" on storage.objects;
create policy "admins can update fastservice gallery"
on storage.objects for update
to authenticated
using (bucket_id = 'fastservice-gallery' and app_private.is_admin())
with check (bucket_id = 'fastservice-gallery' and app_private.is_admin());

drop policy if exists "admins can delete fastservice gallery" on storage.objects;
create policy "admins can delete fastservice gallery"
on storage.objects for delete
to authenticated
using (bucket_id = 'fastservice-gallery' and app_private.is_admin());

-- Si el usuario admin todavia no esta registrado, ejecuta despues:
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where email = 'tu-email@dominio.com'
-- on conflict (user_id) do update set email = excluded.email;
