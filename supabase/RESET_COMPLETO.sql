-- ============================================
-- RESET COMPLETO - SOLUÇÃO DEFINITIVA
-- ============================================
-- Este script vai resolver TODOS os problemas de uma vez
-- ============================================

-- ATENÇÃO:
-- Este script vai definir a password como: 123456
-- Depois de fazer login, pode mudar para outra password!
-- ============================================

-- Passo 1: Ativar extensão pgcrypto (necessária para encriptar passwords)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Passo 2: Verificar se o utilizador existe
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count
  FROM auth.users
  WHERE email = 'catarinarebocho30@gmail.com';

  IF user_count = 0 THEN
    RAISE NOTICE '❌ ERRO: Utilizador não existe!';
    RAISE NOTICE 'Por favor, crie a conta primeiro em: http://localhost:8080/auth';
    RAISE NOTICE 'Clique em "Não tem conta? Criar conta"';
    RAISE EXCEPTION 'Utilizador não encontrado';
  ELSE
    RAISE NOTICE '✅ Utilizador encontrado! A continuar...';
  END IF;
END $$;

-- Passo 3: Resetar password e confirmar email
UPDATE auth.users
SET
  encrypted_password = crypt('123456', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmed_at = COALESCE(confirmed_at, now()),
  updated_at = now(),
  last_sign_in_at = NULL  -- Resetar último login
WHERE email = 'catarinarebocho30@gmail.com';

-- Passo 4: Adicionar role de admin (se ainda não existir)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Passo 5: Limpar possíveis sessões antigas
DELETE FROM auth.sessions
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'catarinarebocho30@gmail.com'
);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

SELECT
  '═══════════════════════════════════════════' as separador;

SELECT
  '✅ RESULTADO FINAL' as titulo;

SELECT
  '═══════════════════════════════════════════' as separador;

-- Mostrar estado do utilizador
SELECT
  email as "📧 Email",
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ NÃO confirmado'
  END as "Status Email",
  CASE
    WHEN confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ NÃO confirmado'
  END as "Status Conta",
  TO_CHAR(updated_at, 'DD/MM/YYYY HH24:MI:SS') as "📅 Última Atualização"
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';

SELECT
  '═══════════════════════════════════════════' as separador;

-- Mostrar permissões
SELECT
  u.email as "📧 Email",
  ur.role as "👤 Role"
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'catarinarebocho30@gmail.com';

SELECT
  '═══════════════════════════════════════════' as separador;

-- Instruções finais
SELECT
  '🎯 PRÓXIMOS PASSOS:' as instrucoes
UNION ALL
SELECT '1. Vá para: http://localhost:8080/auth'
UNION ALL
SELECT '2. Email: catarinarebocho30@gmail.com'
UNION ALL
SELECT '3. Password: 123456'
UNION ALL
SELECT '4. Clique em "Entrar"'
UNION ALL
SELECT '5. ✅ DEVE FUNCIONAR AGORA!'
UNION ALL
SELECT ''
UNION ALL
SELECT '⚠️ IMPORTANTE: Depois de entrar, mude a password!'
UNION ALL
SELECT '   Vá ao perfil e defina uma password segura.';

SELECT
  '═══════════════════════════════════════════' as separador;

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- Se AINDA assim não funcionar:
--
-- 1. Copie os logs do console do browser (F12)
-- 2. Execute esta query e copie o resultado:
--
--    SELECT
--      email,
--      email_confirmed_at,
--      confirmed_at,
--      updated_at,
--      encrypted_password IS NOT NULL as tem_password
--    FROM auth.users
--    WHERE email = 'catarinarebocho30@gmail.com';
--
-- 3. Verifique se está a usar o email EXATO:
--    catarinarebocho30@gmail.com
--    (sem espaços, com letras minúsculas)
--
-- 4. Verifique as configurações de Auth no Supabase:
--    Dashboard > Authentication > Settings
--    - "Enable email confirmations" pode estar a causar problemas
--
-- ============================================
