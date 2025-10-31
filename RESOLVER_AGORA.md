# 🆘 RESOLVER PROBLEMA DE LOGIN AGORA

## ⚡ Siga estes passos EXATAMENTE

### ✅ PASSO 1: Abrir Supabase Dashboard

1. Abra: https://supabase.com/dashboard
2. Faça login no Supabase
3. Selecione o projeto: **jjfqljrbgoymwwvyyvam**
4. Clique em **"SQL Editor"** (ícone `</>` no menu lateral esquerdo)
5. Clique em **"New query"**

### ✅ PASSO 2: Verificar o Problema

1. Copie TODO o conteúdo do ficheiro: **`supabase/DIAGNOSTICO_COMPLETO.sql`**
2. Cole no SQL Editor
3. Clique em **"Run"** (botão verde) ou pressione `Ctrl+Enter`
4. **LEIA os resultados** e veja qual é o problema

### ✅ PASSO 3: Aplicar a Solução

1. Copie TODO o conteúdo do ficheiro: **`supabase/RESET_COMPLETO.sql`**
2. Cole no SQL Editor (pode substituir o conteúdo anterior)
3. Clique em **"Run"** ou pressione `Ctrl+Enter`
4. Você deve ver mensagens como:
   - ✅ Utilizador encontrado! A continuar...
   - ✅ Status Email: Confirmado
   - ✅ Role: admin

### ✅ PASSO 4: Fazer Login

1. Abra o browser
2. Vá para: **http://localhost:8080/auth**
3. Digite EXATAMENTE:
   - **Email:** `catarinarebocho30@gmail.com`
   - **Password:** `123456`
4. Clique em **"Entrar"**

### 🎉 DEVE FUNCIONAR AGORA!

---

## ❌ SE APARECER ERRO no PASSO 3

### Erro: "Utilizador não encontrado"

**Causa:** A conta ainda não existe na base de dados

**Solução:**
1. Vá para: http://localhost:8080/auth
2. Clique em **"Não tem conta? Criar conta"**
3. Preencha:
   - Email: `catarinarebocho30@gmail.com`
   - Password: qualquer uma (ex: `temporaria123`)
4. Clique em **"Criar Conta"**
5. **Volte ao PASSO 3** e execute `RESET_COMPLETO.sql` novamente

### Erro: "function crypt() does not exist"

**Solução:** Execute isto PRIMEIRO no SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Depois volte ao PASSO 3.

---

## ❌ SE CONTINUAR A DAR "PASSWORD INCORRETA" no PASSO 4

### Solução 1: Verificar se a password foi realmente alterada

Execute isto no SQL Editor:

```sql
SELECT
  email,
  TO_CHAR(updated_at, 'DD/MM/YYYY HH24:MI:SS') as ultima_atualizacao,
  email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';
```

Se `ultima_atualizacao` NÃO for de agora (últimos 5 minutos), o script não funcionou.

### Solução 2: Tentar password diferente no script

Edite o ficheiro `supabase/RESET_COMPLETO.sql`:

**Linha 35:** Troque `'123456'` por outra password SIMPLES:

```sql
encrypted_password = crypt('test123', gen_salt('bf')),
```

Execute o script novamente e tente fazer login com `test123`.

### Solução 3: Verificar configurações do Supabase Auth

1. No Supabase Dashboard
2. Vá para: **Authentication** > **Settings**
3. Procure por: **"Enable email confirmations"**
4. Se estiver **ativado (ON)**:
   - Desative temporariamente
   - Clique em **"Save"**
   - Volte ao PASSO 3 e execute o script novamente

### Solução 4: Criar nova conta do zero

Se nada funcionar, vamos criar uma conta completamente nova:

1. **No SQL Editor do Supabase**, execute:

```sql
-- Deletar conta antiga (CUIDADO: isto apaga tudo!)
DELETE FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'catarinarebocho30@gmail.com'
);

DELETE FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';
```

2. **No site** (http://localhost:8080/auth):
   - Clique em "Criar conta"
   - Email: `catarinarebocho30@gmail.com`
   - Password: `123456` (use uma password SIMPLES)
   - Clique em "Criar Conta"

3. **Volte ao SQL Editor** e execute:

```sql
-- Confirmar email e adicionar admin
UPDATE auth.users
SET
  email_confirmed_at = now(),
  confirmed_at = now()
WHERE email = 'catarinarebocho30@gmail.com';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

4. **Tente fazer login** com:
   - Email: `catarinarebocho30@gmail.com`
   - Password: `123456` (ou a que usou ao criar a conta)

---

## 🔍 AINDA NÃO FUNCIONA?

Por favor, partilhe estas informações:

### 1. Console do Browser

1. Abra o site: http://localhost:8080/auth
2. Pressione **F12** para abrir Developer Tools
3. Vá ao separador **"Console"**
4. Tente fazer login
5. Copie TODOS os logs que aparecem (especialmente os que têm 🔐, 📧, 🔑, ❌)

### 2. Estado do Utilizador no Supabase

Execute isto no SQL Editor e copie o resultado:

```sql
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  updated_at,
  encrypted_password IS NOT NULL as tem_password,
  encrypted_password as hash_password,  -- Mostrar o hash (não é a password em texto)
  last_sign_in_at
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';
```

### 3. Configurações de Auth

No Supabase Dashboard > Authentication > Settings, verifique:
- "Enable email confirmations" está ON ou OFF?
- "Disable email confirmations" está ON ou OFF?

---

## 💡 Dica Final

A forma mais garantida de resolver é:

1. **Desativar** "Enable email confirmations" no Supabase
2. **Deletar** a conta antiga completamente
3. **Criar** nova conta no site com password SUPER SIMPLES (`123456`)
4. **Confirmar** email via SQL
5. **Adicionar** role de admin via SQL

Isto garante que a password é exatamente a que você escolheu, sem nenhuma transformação.
