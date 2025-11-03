-- ============================================
-- 🚀 CRIAR UTILIZADOR ADMIN (se não existir)
-- ============================================
-- Este script CRIA o utilizador se ele não existir
-- Ou ATUALIZA se já existir
-- ============================================

-- ATENÇÃO: Este script insere diretamente na tabela auth.users
-- É uma solução para casos onde o utilizador não consegue criar conta pela interface

-- PASSO 0: Instalar extensão necessária
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PASSO 1: Criar ou atualizar o utilizador
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verificar se o utilizador já existe
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'catarinarebocho30@gmail.com';

  IF v_user_id IS NULL THEN
    -- Utilizador não existe, criar novo
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    )
    VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'catarinarebocho30@gmail.com',
      crypt('Admin123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO v_user_id;

    RAISE NOTICE '✅ Utilizador CRIADO com sucesso! ID: %', v_user_id;
  ELSE
    -- Utilizador já existe, atualizar password e confirmar email
    UPDATE auth.users
    SET
      encrypted_password = crypt('Admin123456', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = v_user_id;

    RAISE NOTICE '✅ Utilizador ATUALIZADO com sucesso! ID: %', v_user_id;
  END IF;

  -- Adicionar permissões de admin (se não existir)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE '✅ Permissões de admin adicionadas!';
END $$;

-- PASSO 2: Verificar resultado
SELECT
  '🎯 RESULTADO FINAL' as passo;

SELECT
  u.id as user_id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  u.created_at,
  ur.role as permissao,
  CASE
    WHEN u.email_confirmed_at IS NOT NULL AND ur.role = 'admin' THEN
      '✅ PRONTO! Faça login com: Email: catarinarebocho30@gmail.com | Password: Admin123456'
    ELSE
      '❌ Algo correu mal - Execute o script novamente'
  END as status_final
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'catarinarebocho30@gmail.com';

-- ============================================
-- 🎯 COMO USAR
-- ============================================
--
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Veja a mensagem "✅ PRONTO!" na última linha
-- 3. Vá para: http://localhost:8080/auth
-- 4. Email: catarinarebocho30@gmail.com
-- 5. Password: Admin123456
-- 6. Clique em "Entrar"
--
-- ============================================

-- ============================================
-- 📝 NOTAS IMPORTANTES
-- ============================================
--
-- Este script é mais avançado e CRIA o utilizador diretamente
-- na tabela auth.users se ele não existir.
--
-- Use este script se:
-- - O outro script retornou "0 rows"
-- - Não consegue criar conta pela interface /auth
-- - Quer criar o admin automaticamente
--
-- ATENÇÃO:
-- - Este script requer permissões elevadas no Supabase
-- - A password será: Admin123456
-- - O email será confirmado automaticamente
-- - As permissões de admin serão adicionadas automaticamente
--
-- ============================================
