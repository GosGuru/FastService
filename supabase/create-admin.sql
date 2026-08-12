-- 1. Create the owner in Supabase Dashboard > Authentication > Users.
-- 2. Replace the placeholder below with that user's UUID and run this once.
-- The password must never be stored in SQL or Git.

insert into public.admin_users (user_id, email, role)
select id, email, 'admin'
from auth.users
where id = '<AUTH_USER_UUID>'::uuid
on conflict (user_id) do update
set email = excluded.email, role = 'admin';
