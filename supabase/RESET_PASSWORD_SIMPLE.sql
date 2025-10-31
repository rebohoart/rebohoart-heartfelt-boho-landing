-- ============================================
-- RESET PASSWORD - VERSÃO SIMPLIFICADA
-- ============================================
-- Se o script RESET_PASSWORD.sql não funcionar, use este
--
-- INSTRUÇÕES RÁPIDAS:
-- 1. Substitua 'admin@rebohoart.com' pelo seu email
-- 2. Substitua 'senha123456' pela nova password (mínimo 6 caracteres)
-- 3. Execute no SQL Editor do Supabase
-- ============================================

-- Resetar password e confirmar email em um único comando
UPDATE auth.users
SET
  encrypted_password = crypt('senha123456', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'admin@rebohoart.com';

-- Verificar resultado
SELECT
  email,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN 'Email confirmado ✅'
    ELSE 'Email NÃO confirmado ❌'
  END as status_email,
  updated_at as ultima_atualizacao
FROM auth.users
WHERE email = 'admin@rebohoart.com';
