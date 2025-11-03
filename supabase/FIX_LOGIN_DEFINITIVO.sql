-- ============================================
-- 🚨 CORREÇÃO DEFINITIVA DO PROBLEMA DE LOGIN
-- ============================================
-- Este script resolve o problema de login de forma definitiva
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- PASSO 0: Garantir que a extensão pgcrypto está instalada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- PASSO 1: VERIFICAR SE O UTILIZADOR EXISTE
-- ============================================

SELECT
  '🔍 VERIFICANDO SE O UTILIZADOR EXISTE...' as passo;

SELECT
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmado,
  created_at
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';

-- Se retornou 0 linhas: O utilizador NÃO EXISTE
-- SOLUÇÃO: Vá a http://localhost:8080/auth e crie a conta primeiro!

-- ============================================
-- PASSO 2: CONFIRMAR EMAIL E RESETAR PASSWORD
-- ============================================
-- IMPORTANTE: Se o utilizador não existe, este passo não fará nada

UPDATE auth.users
SET
  encrypted_password = crypt('Admin123456', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'catarinarebocho30@gmail.com';

-- ============================================
-- PASSO 3: ADICIONAR PERMISSÕES DE ADMIN
-- ============================================

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- PASSO 4: VERIFICAÇÃO FINAL
-- ============================================

SELECT
  '✅ VERIFICAÇÃO FINAL' as passo;

SELECT
  u.email as email,
  u.id as user_id,
  CASE
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '❌ Email NÃO confirmado - PROBLEMA!'
  END as status_email,
  CASE
    WHEN ur.role = 'admin' THEN '✅ É admin'
    WHEN ur.role IS NULL THEN '❌ NÃO tem permissões de admin - PROBLEMA!'
    ELSE '⚠️ Tem role: ' || ur.role::text
  END as status_permissoes,
  CASE
    WHEN u.email_confirmed_at IS NOT NULL AND ur.role = 'admin' THEN '✅ PRONTO! Pode fazer login com: Email: catarinarebocho30@gmail.com | Password: Admin123456'
    ELSE '❌ HÁ PROBLEMAS - Veja os detalhes acima'
  END as resultado_final
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'catarinarebocho30@gmail.com';

-- ============================================
-- 🎯 PRÓXIMOS PASSOS
-- ============================================
--
-- SE VIU "✅ PRONTO!" acima:
-- 1. Vá para: http://localhost:8080/auth
-- 2. Email: catarinarebocho30@gmail.com
-- 3. Password: Admin123456
-- 4. Clique em "Entrar"
-- 5. Deve ser redirecionado para /backoffice
--
-- SE VIU "0 rows" (nenhum resultado):
-- 1. O utilizador NÃO EXISTE na base de dados
-- 2. Vá para: http://localhost:8080/auth
-- 3. Clique em "Não tem conta? Criar conta"
-- 4. Crie conta com email: catarinarebocho30@gmail.com
-- 5. Use qualquer password (será resetada)
-- 6. Volte aqui e execute este script novamente
--
-- SE VIU "❌ PROBLEMAS":
-- 1. Verifique os detalhes na tabela acima
-- 2. Execute este script novamente
-- 3. Se continuar com problemas, contacte o suporte
--
-- ============================================
