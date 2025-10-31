-- ============================================
-- VERIFICAR ESTADO DO UTILIZADOR
-- ============================================
-- Use este script para diagnosticar problemas de login
--
-- INSTRUÇÕES:
-- 1. Substitua 'SEU-EMAIL@EXEMPLO.COM' pelo email que está a tentar usar
-- 2. Execute no SQL Editor do Supabase Dashboard
-- 3. Analise os resultados para identificar o problema
-- ============================================

-- Verificar se o utilizador existe e o seu estado
SELECT
  id as user_id,
  email,
  created_at as conta_criada_em,

  -- Status de confirmação de email
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado em ' || email_confirmed_at::text
    ELSE '❌ Email NÃO confirmado (isto pode causar erro de login!)'
  END as status_email,

  -- Última atualização
  updated_at as ultima_atualizacao,

  -- Último login
  CASE
    WHEN last_sign_in_at IS NOT NULL THEN '✅ Último login: ' || last_sign_in_at::text
    ELSE '❌ Nunca fez login'
  END as historico_login,

  -- Status geral da conta
  CASE
    WHEN banned_until IS NOT NULL THEN '🚫 CONTA BANIDA até ' || banned_until::text
    WHEN email_confirmed_at IS NULL THEN '⚠️ AGUARDANDO CONFIRMAÇÃO DE EMAIL'
    WHEN deleted_at IS NOT NULL THEN '🗑️ CONTA DELETADA'
    ELSE '✅ CONTA ATIVA'
  END as status_conta

FROM auth.users
WHERE email = 'SEU-EMAIL@EXEMPLO.COM';

-- Se o resultado estiver vazio, o utilizador NÃO EXISTE
-- Neste caso, crie uma nova conta através da página /auth


-- ============================================
-- VERIFICAR PERMISSÕES DE ADMIN (Opcional)
-- ============================================
-- Descomente as linhas abaixo para verificar se o utilizador tem permissões de admin

/*
SELECT
  u.email,
  CASE
    WHEN ur.role IS NOT NULL THEN '✅ Tem permissões de ' || ur.role::text
    ELSE '❌ NÃO tem permissões de admin'
  END as permissoes_admin,
  ur.created_at as admin_desde
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'SEU-EMAIL@EXEMPLO.COM';
*/


-- ============================================
-- ANÁLISE DE RESULTADOS
-- ============================================
--
-- RESULTADO VAZIO (0 linhas):
-- → O utilizador NÃO EXISTE
-- → Solução: Crie uma conta através da página /auth
--
-- ❌ Email NÃO confirmado:
-- → Este é o problema mais comum!
-- → Solução: Execute o script RESET_PASSWORD_SIMPLE.sql
-- → Este script confirma o email automaticamente E reseta a password
--
-- ✅ Email confirmado mas login falha:
-- → A password pode estar incorreta
-- → Solução: Execute o script RESET_PASSWORD_SIMPLE.sql para definir nova password
--
-- 🚫 Conta banida:
-- → A conta foi banida por um administrador
-- → Solução: Contacte o administrador do sistema
--
-- 🗑️ Conta deletada:
-- → A conta foi eliminada
-- → Solução: Crie uma nova conta através da página /auth
--
-- ============================================
