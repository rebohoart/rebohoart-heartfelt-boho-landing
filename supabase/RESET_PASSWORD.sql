-- ============================================
-- RESET PASSWORD DIRETAMENTE NO SUPABASE
-- ============================================
-- Este script reseta a password de um utilizador diretamente na base de dados
-- Útil quando o sistema de envio de emails ainda não está configurado
--
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard > SQL Editor
-- 2. Cole este script
-- 3. Substitua 'SEU-EMAIL@EXEMPLO.COM' pelo email do utilizador
-- 4. Substitua 'NOVA_PASSWORD_AQUI' pela nova password desejada
-- 5. Clique em "Run" para executar
-- 6. Use a nova password para fazer login
--
-- IMPORTANTE: Este script requer privilégios de admin no Supabase
-- ============================================

-- Método 1: Usando a API interna do Supabase (RECOMENDADO)
-- Esta é a forma mais segura e correta

-- Passo 1: Encontrar o user_id
DO $$
DECLARE
  user_id_var UUID;
BEGIN
  -- Encontra o user_id pelo email
  SELECT id INTO user_id_var
  FROM auth.users
  WHERE email = 'SEU-EMAIL@EXEMPLO.COM';

  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'Utilizador não encontrado com esse email';
  END IF;

  -- Mostra o user_id encontrado
  RAISE NOTICE 'User ID encontrado: %', user_id_var;
END $$;

-- Passo 2: Atualizar a password
-- ATENÇÃO: Substitua 'NOVA_PASSWORD_AQUI' pela password que deseja usar
-- A password será encriptada automaticamente pelo Supabase

UPDATE auth.users
SET
  encrypted_password = crypt('NOVA_PASSWORD_AQUI', gen_salt('bf')),
  updated_at = now(),
  email_confirmed_at = COALESCE(email_confirmed_at, now()), -- Confirma o email se ainda não estiver confirmado
  confirmation_token = NULL, -- Remove token de confirmação antigo
  recovery_token = NULL -- Remove token de recovery antigo
WHERE email = 'SEU-EMAIL@EXEMPLO.COM';

-- Passo 3: Verificar se a atualização funcionou
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ Não confirmado'
  END as status
FROM auth.users
WHERE email = 'SEU-EMAIL@EXEMPLO.COM';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ Password resetada com sucesso!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Agora pode fazer login com:';
  RAISE NOTICE 'Email: SEU-EMAIL@EXEMPLO.COM';
  RAISE NOTICE 'Password: NOVA_PASSWORD_AQUI';
  RAISE NOTICE '==============================================';
END $$;
