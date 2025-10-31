-- ============================================
-- CRIAR USUÁRIO ADMINISTRADOR
-- ============================================
-- Este script adiciona permissões de admin para um usuário existente
--
-- INSTRUÇÕES:
-- 1. Primeiro, crie uma conta no site através da página /auth
-- 2. Depois, execute este script no SQL Editor do Supabase
-- 3. Substitua 'SEU-EMAIL@EXEMPLO.COM' pelo email que você usou para criar a conta
--
-- ============================================

-- Adicionar role de admin para o usuário especificado
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'SEU-EMAIL@EXEMPLO.COM'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar se o admin foi criado com sucesso
SELECT
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'SEU-EMAIL@EXEMPLO.COM';
