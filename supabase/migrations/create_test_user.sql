-- Criar usuário de teste para o sistema de usuários online
-- Este script cria um usuário administrador para testes

-- Verificar se o usuário já existe antes de inserir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@prime.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@prime.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- Inserir perfil correspondente na tabela profiles
DO $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    role,
    created_at,
    updated_at
  ) 
  SELECT 
    u.id,
    u.email,
    'Administrador Teste',
    'Administrador'::user_role,
    NOW(),
    NOW()
  FROM auth.users u 
  WHERE u.email = 'admin@prime.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
END $$;

-- Criar mais alguns usuários para teste
DO $$
BEGIN
  -- Motorista
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'motorista@prime.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'motorista@prime.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
  
  -- Financeiro
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'financeiro@prime.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'financeiro@prime.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- Inserir perfis correspondentes
DO $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    role,
    created_at,
    updated_at
  ) 
  SELECT 
    u.id,
    u.email,
    CASE 
      WHEN u.email = 'motorista@prime.com' THEN 'Motorista Teste'
      WHEN u.email = 'financeiro@prime.com' THEN 'Financeiro Teste'
    END,
    CASE 
      WHEN u.email = 'motorista@prime.com' THEN 'Motorista'::user_role
      WHEN u.email = 'financeiro@prime.com' THEN 'Financeiro'::user_role
    END,
    NOW(),
    NOW()
  FROM auth.users u 
  WHERE u.email IN ('motorista@prime.com', 'financeiro@prime.com')
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
END $$;