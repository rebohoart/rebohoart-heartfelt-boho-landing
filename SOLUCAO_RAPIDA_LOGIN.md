# 🚨 SOLUÇÃO RÁPIDA: Não Consigo Fazer Login

**Problema:** "Email ou password incorretos" + Não recebo emails de recuperação

**Solução:** Resetar a password diretamente no Supabase (sem precisar de email!)

---

## 🎯 Solução em 5 Passos (3 minutos)

### ✅ PASSO 1: Abrir o Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Faça login no Supabase
3. Selecione o projeto: **jjfqljrbgoymwwvyyvam**

### ✅ PASSO 2: Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"**

### ✅ PASSO 3: Executar o Script de Reset

Copie e cole este script no SQL Editor:

```sql
-- Resetar password e confirmar email
UPDATE auth.users
SET
  encrypted_password = crypt('SuaNovaPassword123', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'catarinarebocho30@gmail.com';

-- Verificar resultado
SELECT
  email,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN 'Email confirmado ✅'
    ELSE 'Email NÃO confirmado ❌'
  END as status_email,
  updated_at as ultima_atualizacao
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';
```

**⚠️ IMPORTANTE - Antes de executar:**
- **Linha 4:** Troque `'SuaNovaPassword123'` pela password que VOCÊ quer usar
- **Linha 7:** Confirme que o email está correto: `catarinarebocho30@gmail.com`
- **Linha 16:** Use o mesmo email

### ✅ PASSO 4: Executar o Script

1. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
2. Você deve ver uma tabela com:
   - ✅ Email confirmado
   - Data e hora da atualização

### ✅ PASSO 5: Fazer Login

1. Vá para: http://localhost:8080/auth (ou o URL onde está o seu site)
2. Digite:
   - **Email:** `catarinarebocho30@gmail.com`
   - **Password:** A password que definiu no Passo 3
3. Clique em **"Entrar"**

🎉 **Deve funcionar agora!**

---

## ❓ E Se o Erro "function crypt() does not exist"?

Se aparecer este erro, execute PRIMEIRO este script:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Depois execute o script do PASSO 3 novamente.

---

## 🔐 Adicionar Permissões de Admin (Opcional)

Se precisar de aceder ao `/backoffice`, execute também este script:

```sql
-- Adicionar role de admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'catarinarebocho30@gmail.com';
```

Deve mostrar: `role: admin` ✅

---

## 🆘 Ainda Não Funciona?

### Problema 1: "0 rows returned" no PASSO 4

**Causa:** O utilizador não existe na base de dados

**Solução:**
1. Vá a `http://localhost:8080/auth`
2. Clique em "Não tem conta? Criar conta"
3. Crie a conta com o email `catarinarebocho30@gmail.com`
4. Volte ao PASSO 3 e execute o script novamente

### Problema 2: Continua a dar "Invalid credentials"

**Solução:** Execute este script para ver o estado atual:

```sql
SELECT
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  CASE
    WHEN email_confirmed_at IS NULL THEN '❌ Email NÃO confirmado'
    ELSE '✅ Email confirmado'
  END as status
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';
```

Copie o resultado e partilhe para diagnóstico.

### Problema 3: Configurar Supabase para NÃO exigir confirmação de email

Esta é a causa raiz do problema! Para evitar isto no futuro:

1. No **Supabase Dashboard**
2. Vá a **Authentication** → **Settings** → **Email Auth**
3. Desative: **"Enable email confirmations"**
4. Clique em **Save**

Assim, novos utilizadores não precisarão confirmar email!

---

## 📋 Checklist

- [ ] Abri o Supabase Dashboard
- [ ] Executei o script do PASSO 3 com a MINHA password
- [ ] Vi a mensagem "Email confirmado ✅"
- [ ] Fiz login no site com a nova password
- [ ] ✅ Consegui entrar com sucesso!

---

## 💡 Dicas de Segurança

### Para Testar (Desenvolvimento):
```
test123456
admin123456
MinhaPassword123
```

### Para Produção (Recomendado):
- Mínimo 12 caracteres
- Letras maiúsculas e minúsculas
- Números
- Símbolos especiais
- Exemplo: `R3b0h0@rt2024!Secure`

**⚠️ IMPORTANTE:** Depois de testar, troque para uma password segura!

---

## 📚 Mais Informações

Para diagnósticos avançados e outras soluções, consulte:
- `COMO_RESOLVER_ERRO_LOGIN.md` - Guia rápido
- `GUIA_DIAGNOSTICO_LOGIN.md` - Diagnóstico completo
- `GUIA_RESET_PASSWORD.md` - Guia detalhado de reset

---

**Tempo estimado:** 3 minutos
**Dificuldade:** Muito fácil
**Requer:** Acesso ao Supabase Dashboard
