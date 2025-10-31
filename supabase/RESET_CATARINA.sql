-- ============================================
-- RESET PASSWORD - CATARINA
-- ============================================
-- Este script é específico para: catarinarebocho30@gmail.com
--
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard: https://supabase.com/dashboard
-- 2. Vá ao projeto: jjfqljrbgoymwwvyyvam
-- 3. Clique em "SQL Editor" > "New query"
-- 4. Copie e cole este script completo
-- 5. EDITE a linha 17 e coloque a SUA nova password
-- 6. Clique em "Run" ou pressione Ctrl+Enter
-- ============================================

-- Passo 1: Garantir que a extensão pgcrypto está ativa
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Passo 2: Resetar password e confirmar email
UPDATE auth.users
SET
  encrypted_password = crypt('SuaNovaPassword123', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'catarinarebocho30@gmail.com';

-- Passo 3: Adicionar permissões de admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Passo 4: Verificar resultado
SELECT
  '🎯 RESULTADO DO RESET' as etapa,
  '' as espaco;

SELECT
  email as "📧 Email",
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ NÃO confirmado'
  END as "Status Email",
  TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as "Última Atualização"
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';

SELECT
  '🔐 PERMISSÕES' as etapa,
  '' as espaco;

SELECT
  u.email as "📧 Email",
  ur.role as "👤 Role"
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'catarinarebocho30@gmail.com';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Você deve ver:
-- ✅ Status Email: Confirmado
-- ✅ Role: admin
-- ✅ Última Atualização: (data e hora de agora)
--
-- Depois de executar:
-- 1. Vá para: http://localhost:8080/auth
-- 2. Email: catarinarebocho30@gmail.com
-- 3. Password: (a password que definiu na linha 17)
-- 4. Clique em "Entrar"
--
-- ✅ Deve funcionar!
-- ============================================
