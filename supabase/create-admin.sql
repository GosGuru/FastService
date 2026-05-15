-- ============================================================
-- Bootstrap: crea el usuario admin en Supabase Auth y lo
-- registra en public.admin_users.
-- Ejecutar UNA SOLA VEZ en el SQL Editor de Supabase.
-- ============================================================

do $$
declare
  v_user_id uuid;
begin

  -- 1. Insertar en auth.users si no existe aún
  if not exists (select 1 from auth.users where email = 'admin@gmail.com') then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'admin@gmail.com',
      crypt('admin1234', gen_salt('bf')),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '', '', '', ''
    );

    -- Crear la identidad de email para que el login funcione
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      'admin@gmail.com',
      jsonb_build_object('sub', v_user_id::text, 'email', 'admin@gmail.com'),
      'email',
      now(),
      now(),
      now()
    );

  else
    -- Ya existe: obtener su id
    select id into v_user_id from auth.users where email = 'admin@gmail.com';
  end if;

  -- 2. Registrar en public.admin_users si no está ya
  insert into public.admin_users (user_id, email)
  values (v_user_id, 'admin@gmail.com')
  on conflict (user_id) do nothing;

end $$;
