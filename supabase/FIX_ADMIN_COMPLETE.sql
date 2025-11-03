-- ============================================
-- CORREÇÃO COMPLETA DO ADMIN - VERSÃO RÁPIDA
-- ============================================
-- Este script resolve TODOS os problemas de login do admin:
-- ✅ Confirma o email automaticamente
-- ✅ Define/reseta a password
-- ✅ Adiciona permissões de admin
-- ✅ Verifica se tudo funcionou
--
-- INSTRUÇÕES:
-- 1. Substitua 'catarinarebocho30@gmail.com' pelo seu email
-- 2. Substitua 'senha123456' pela password que quer usar (mínimo 6 caracteres)
-- 3. Execute no SQL Editor do Supabase Dashboard
-- 4. Veja os resultados para confirmar que funcionou
-- ============================================

-- PASSO 1: Resetar password e confirmar email
UPDATE auth.users
SET
  encrypted_password = crypt('senha123456', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'catarinarebocho30@gmail.com';

-- PASSO 2: Adicionar permissões de admin (se ainda não existir)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Se tudo correu bem, deve ver:
-- - Email confirmado ✅
-- - Tem permissões de admin ✅
-- - Password atualizada ✅

SELECT
  u.email as "📧 Email",
  u.id as "🆔 User ID",

  -- Status de confirmação
  CASE
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '❌ Email NÃO confirmado'
  END as "📬 Status Email",

  -- Permissões
  CASE
    WHEN ur.role IS NOT NULL THEN '✅ É ' || ur.role::text
    ELSE '❌ SEM permissões de admin'
  END as "🔐 Permissões",

  -- Última atualização
  u.updated_at as "🕐 Última Atualização",

  -- Instruções finais
  CASE
    WHEN u.email_confirmed_at IS NOT NULL AND ur.role = 'admin' THEN '✅ TUDO PRONTO! Pode fazer login agora em /auth'
    ELSE '❌ ALGO FALHOU - Verifique os dados acima'
  END as "📋 Status Final"

FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'catarinarebocho30@gmail.com';

-- ============================================
-- SE O RESULTADO ESTIVER VAZIO:
-- ============================================
-- Isso significa que o utilizador NÃO EXISTE ainda!
--
-- SOLUÇÃO:
-- 1. Vá a http://localhost:8080/auth (ou o URL do seu site)
-- 2. Clique em "Não tem conta? Criar conta"
-- 3. Crie a conta com o email: catarinarebocho30@gmail.com
-- 4. Use qualquer password (será resetada por este script)
-- 5. Depois volte aqui e execute este script novamente
-- ============================================

-- ============================================
-- PRÓXIMOS PASSOS:
-- ============================================
-- 1. Vá para: http://localhost:8080/auth
-- 2. Use email: catarinarebocho30@gmail.com
-- 3. Use password: senha123456 (ou a que definiu acima)
-- 4. Clique em "Entrar"
-- 5. Deve ser redirecionado para /backoffice 🎉
-- ============================================
