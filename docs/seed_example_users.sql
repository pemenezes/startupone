-- MoveCorp: 3 example logins for local / demo testing
-- Run this in Supabase → SQL Editor → New query → Run
--
-- Logins after running:
--   Funcionário:  funcionario@movecorp.test  /  Senha123!
--   Motorista:    motorista@movecorp.test    /  Senha123!
--   Admin:        admin@movecorp.test        /  Senha123!
--
-- Safe to re-run: deletes these emails first if they already exist.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Cleanup previous demo users (optional but helps re-runs)
-- ---------------------------------------------------------------------------
delete from public.profiles
where email in (
  'funcionario@movecorp.test',
  'motorista@movecorp.test',
  'admin@movecorp.test'
);

delete from auth.identities
where user_id in (
  select id from auth.users
  where email in (
    'funcionario@movecorp.test',
    'motorista@movecorp.test',
    'admin@movecorp.test'
  )
);

delete from auth.users
where email in (
  'funcionario@movecorp.test',
  'motorista@movecorp.test',
  'admin@movecorp.test'
);

-- ---------------------------------------------------------------------------
-- 1) EMPLOYEE — Ana Silva
--    email: funcionario@movecorp.test
--    password: Senha123!
-- ---------------------------------------------------------------------------
do $$
declare
  uid uuid := gen_random_uuid();
  user_email text := 'funcionario@movecorp.test';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
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
    uid,
    'authenticated',
    'authenticated',
    user_email,
    crypt('Senha123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ana Silva"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    uid,
    jsonb_build_object('sub', uid::text, 'email', user_email),
    'email',
    uid::text,
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, email, full_name, role)
  values (uid, user_email, 'Ana Silva', 'employee');
end $$;

-- ---------------------------------------------------------------------------
-- 2) DRIVER — Carlos Roberto
--    email: motorista@movecorp.test
--    password: Senha123!
-- ---------------------------------------------------------------------------
do $$
declare
  uid uuid := gen_random_uuid();
  user_email text := 'motorista@movecorp.test';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
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
    uid,
    'authenticated',
    'authenticated',
    user_email,
    crypt('Senha123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Carlos Roberto"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    uid,
    jsonb_build_object('sub', uid::text, 'email', user_email),
    'email',
    uid::text,
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, email, full_name, role)
  values (uid, user_email, 'Carlos Roberto', 'driver');
end $$;

-- ---------------------------------------------------------------------------
-- 3) ADMIN — Admin TechCorp
--    email: admin@movecorp.test
--    password: Senha123!
-- ---------------------------------------------------------------------------
do $$
declare
  uid uuid := gen_random_uuid();
  user_email text := 'admin@movecorp.test';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
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
    uid,
    'authenticated',
    'authenticated',
    user_email,
    crypt('Senha123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin TechCorp"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    uid,
    jsonb_build_object('sub', uid::text, 'email', user_email),
    'email',
    uid::text,
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, email, full_name, role)
  values (uid, user_email, 'Admin TechCorp', 'admin');
end $$;
