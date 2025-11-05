# 🔴 RESOLVER: Login só funciona 1 vez, depois falha

## 🚨 Problema

**Sintoma:**
- ✅ Primeira vez que faz login → Funciona perfeitamente
- ❌ Depois disso → Nunca mais consegue entrar com as mesmas credenciais
- 🔄 Precisa resetar a senha **TODA VEZ** para entrar novamente

Este problema é **CRÍTICO** e indica um bug no sistema de autenticação.

---

## 🔍 Possíveis Causas

### 1. Email não está confirmado automaticamente
### 2. Configurações de URL no Supabase Auth
### 3. Políticas RLS bloqueando acesso
### 4. Problema com persistência de sessão

---

## ✅ SOLUÇÃO 1: Confirmar Email Automaticamente (MAIS PROVÁVEL)

Este é o problema mais comum. O Supabase pode estar a exigir confirmação de email.

### Passo 1: Verificar configuração no Supabase

1. **Vá ao Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/auth/settings
   ```

2. **Procure a secção "Email Auth"**

3. **Verifique esta configuração:**
   ```
   Enable email confirmations
   ```

4. **Se estiver ATIVADA (✓):**
   - **DESATIVE** esta opção
   - Ou configure o email para confirmação automática

5. **Configuração correta:**
   ```
   [  ] Enable email confirmations
   ```
   (Caixa VAZIA - desativada)

### Passo 2: Confirmar usuários existentes manualmente

Se já tem contas criadas, precisa confirmá-las:

1. **Vá ao SQL Editor:**
   ```
   https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/sql
   ```

2. **Execute esta query:**

```sql
-- Confirmar TODOS os utilizadores existentes
-- NOTA: confirmed_at é uma coluna gerada, atualiza automaticamente
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Verificar resultado
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ Não confirmado'
  END as status
FROM auth.users
ORDER BY created_at DESC;
```

3. **Verifique que todos os usuários têm status "✅ Confirmado"**

---

## ✅ SOLUÇÃO 2: Configurar URLs de Redirecionamento

### Passo 1: Adicionar Site URLs

1. **Vá às configurações de Auth:**
   ```
   https://supabase.com/dashboard/project/gyvtgzdkuhypteiyhtaq/auth/settings
   ```

2. **Procure por "Site URL":**
   - Adicione: `https://seu-site.netlify.app`
   - **OU** se ainda está em desenvolvimento: `http://localhost:8080`

3. **Procure por "Redirect URLs":**
   - Adicione estas URLs:
     ```
     https://seu-site.netlify.app/auth
     https://seu-site.netlify.app/
     http://localhost:8080/auth
     http://localhost:8080/
     ```

4. **Clique em "Save"**

---

## ✅ SOLUÇÃO 3: Verificar Políticas RLS

Pode haver uma política RLS bloqueando o acesso à tabela `user_roles`.

### Verificar políticas existentes:

1. **Vá ao SQL Editor**

2. **Execute:**

```sql
-- Ver políticas da tabela user_roles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_roles';
```

### Criar política para permitir leitura:

Se não existir política de SELECT, execute:

```sql
-- Permitir que utilizadores autenticados vejam os seus próprios roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Verificar que a política foi criada
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_roles';
```

---

## ✅ SOLUÇÃO 4: Limpar Sessões Antigas

Pode haver sessões antigas a causar conflito.

### No SQL Editor, execute:

```sql
-- Ver sessões ativas
SELECT
  id,
  user_id,
  created_at,
  updated_at,
  not_after
FROM auth.sessions
ORDER BY updated_at DESC;

-- Se houver muitas sessões antigas (mais de 1 semana), pode limpá-las:
-- CUIDADO: Isto vai fazer logout de todos os utilizadores!
-- DELETE FROM auth.sessions WHERE updated_at < NOW() - INTERVAL '7 days';
```

---

## ✅ SOLUÇÃO 5: Verificar Senha no Banco de Dados

Vamos confirmar que a senha está realmente gravada:

```sql
-- Ver informações de autenticação (SEM mostrar a senha!)
SELECT
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  confirmed_at IS NOT NULL as account_confirmed,
  last_sign_in_at,
  created_at
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';
```

**Resultado esperado:**
- `has_password`: `true` ✅
- `email_confirmed`: `true` ✅
- `account_confirmed`: `true` ✅

**Se algum for `false`:**
- Execute a SOLUÇÃO 1 acima

---

## 🧪 TESTE COMPLETO

Depois de aplicar as soluções acima:

### 1. Limpar cache do navegador
```
Ctrl + Shift + R (ou Cmd + Shift + R no Mac)
```

### 2. Limpar localStorage
No Console do navegador (F12 → Console):
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### 3. Criar conta de teste

1. Vá para: `https://seu-site.netlify.app/auth`
2. Solicite reset de senha para: `catarinarebocho30@gmail.com`
3. Defina uma nova senha (ex: `Teste123!`)
4. **Anote a senha que definiu!**

### 4. Testar login múltiplas vezes

1. Faça login → Deve funcionar ✅
2. Faça logout
3. Faça login NOVAMENTE com a mesma senha → **Deve funcionar!** ✅
4. Repita 3-5 vezes para confirmar

---

## 📊 Checklist de Diagnóstico

Execute este checklist em ordem:

- [ ] **SOLUÇÃO 1**: Desativei "Enable email confirmations" no Supabase Auth
- [ ] **SOLUÇÃO 1**: Confirmei todos os usuários existentes via SQL
- [ ] **SOLUÇÃO 2**: Configurei Site URL e Redirect URLs
- [ ] **SOLUÇÃO 3**: Verifiquei e criei políticas RLS para user_roles
- [ ] **SOLUÇÃO 4**: Limpei sessões antigas (se necessário)
- [ ] **SOLUÇÃO 5**: Confirmei que usuário tem senha e está confirmado
- [ ] **TESTE**: Limpei cache do navegador
- [ ] **TESTE**: Limpei localStorage
- [ ] **TESTE**: Fiz login 3x consecutivas com sucesso

---

## 🎯 Causa Raiz Mais Provável

**90% das vezes, o problema é:**

> **"Enable email confirmations" está ATIVADA** no Supabase Auth

**O que acontece:**
1. Primeira vez → Faz login e cria sessão temporária ✅
2. Sessão expira ou logout
3. Segunda vez → Supabase verifica: "Email confirmado?" → ❌ NÃO → **BLOQUEIA**
4. Precisa resetar senha → Isso confirma o email → Por isso funciona 1 vez

**Solução:**
```
Desativar "Enable email confirmations"
OU
Confirmar todos os emails manualmente via SQL
```

---

## 📞 Depois de Resolver

Quando conseguir fazer login múltiplas vezes com sucesso:

1. **Delete este ficheiro** (já não é necessário)
2. **Continue com o PASSO 5** do `DEPLOY_NETLIFY.md` (Atribuir role de admin)

---

## 🆘 Se Nada Funcionar

Se depois de todas as soluções acima o problema persistir:

### Opção Final: Recriar o usuário do zero

```sql
-- 1. Deletar completamente o usuário
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'catarinarebocho30@gmail.com'
);
DELETE FROM auth.users WHERE email = 'catarinarebocho30@gmail.com';
```

**Depois:**

1. No Supabase Dashboard → Authentication → Users
2. **"Add user"**:
   - Email: `catarinarebocho30@gmail.com`
   - Password: `SuaSenhaSegura123!`
   - **Auto Confirm User: ✅ SIM** (IMPORTANTE!)
3. **Clique em "Create user"**
4. Teste fazer login

---

**Data:** 2025-11-05
**Prioridade:** 🔴 CRÍTICA
**Status:** Aguardando aplicação das soluções
