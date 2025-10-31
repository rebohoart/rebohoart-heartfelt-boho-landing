-- ============================================
-- DIAGNÓSTICO COMPLETO DO PROBLEMA DE LOGIN
-- ============================================
-- Execute este script para ver EXATAMENTE qual é o problema
-- ============================================

-- PASSO 1: Verificar se o utilizador existe
SELECT
  '🔍 PASSO 1: Verificar se utilizador existe' as diagnostico;

SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  encrypted_password IS NOT NULL as tem_password,
  CASE
    WHEN email_confirmed_at IS NULL THEN '❌ Email NÃO confirmado - ESTE É O PROBLEMA!'
    ELSE '✅ Email confirmado'
  END as status_email,
  CASE
    WHEN encrypted_password IS NULL THEN '❌ Password NÃO definida'
    ELSE '✅ Password definida'
  END as status_password
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';

-- Se a query acima retornou 0 linhas, o utilizador NÃO EXISTE!
-- Solução: Criar a conta em http://localhost:8080/auth primeiro

-- ============================================

-- PASSO 2: Verificar role de admin
SELECT
  '🔐 PASSO 2: Verificar permissões de admin' as diagnostico;

SELECT
  u.email,
  ur.role,
  CASE
    WHEN ur.role = 'admin' THEN '✅ É admin'
    WHEN ur.role IS NULL THEN '❌ NÃO tem role de admin'
    ELSE '⚠️ Tem role: ' || ur.role::text
  END as status_admin
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'catarinarebocho30@gmail.com';

-- ============================================

-- PASSO 3: Verificar tabela user_roles
SELECT
  '📊 PASSO 3: Ver todas as roles do utilizador' as diagnostico;

SELECT
  ur.user_id,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'catarinarebocho30@gmail.com';

-- ============================================

-- 🔧 INTERPRETAÇÃO DOS RESULTADOS
-- ============================================
--
-- PROBLEMA 1: "0 rows" no PASSO 1
--   Causa: Utilizador não existe
--   Solução: Criar conta em /auth primeiro
--
-- PROBLEMA 2: "Email NÃO confirmado" no PASSO 1
--   Causa: O Supabase exige confirmação de email
--   Solução: Execute o script RESET_COMPLETO.sql (abaixo)
--
-- PROBLEMA 3: "0 rows" no PASSO 2 ou "NÃO tem role de admin"
--   Causa: Utilizador não tem permissões de admin
--   Solução: Execute o script RESET_COMPLETO.sql (abaixo)
--
-- ============================================
