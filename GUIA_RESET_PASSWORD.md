# 🔐 Guia: Como Resetar Password

## 📧 Método Recomendado: Reset por Email

**NOVO!** Agora o sistema tem suporte completo para reset de password por email.

➡️ **Veja o guia completo**: `CONFIGURAR_EMAIL_RESET.md`

Este guia explica como configurar o template de email no Supabase para que o link de reset apareça automaticamente nos emails.

---

## 🛠️ Método Alternativo: Reset Manual via SQL

Se o sistema de envio de emails ainda não está configurado ou não está funcionando, pode resetar a password diretamente no Supabase usando SQL.

## 📋 Passo a Passo

### Passo 1: Aceder ao Supabase Dashboard

1. Abra o browser e vá para: https://supabase.com/dashboard
2. Faça login na sua conta Supabase
3. Selecione o projeto: **gyvtgzdkuhypteiyhtaq**

### Passo 2: Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (ou use uma query existente)

### Passo 3: Escolher o Script

Use o **script mais simples** primeiro:

#### ✅ OPÇÃO 1: Script Simples (RECOMENDADO)

1. Abra o ficheiro: `supabase/RESET_PASSWORD_SIMPLE.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase

4. **IMPORTANTE**: Edite estas duas linhas:

```sql
-- ANTES:
encrypted_password = crypt('senha123456', gen_salt('bf')),
WHERE email = 'admin@rebohoart.com';

-- DEPOIS (use o SEU email e SUA password):
encrypted_password = crypt('MINHA_NOVA_PASSWORD', gen_salt('bf')),
WHERE email = 'MEU-EMAIL@EXEMPLO.COM';
```

5. Clique em **"Run"** (ou pressione Ctrl+Enter)

6. Você deve ver uma tabela mostrando:
   - ✅ Email confirmado
   - Data da última atualização

#### ⚙️ OPÇÃO 2: Script Completo

Se preferir mais detalhes e validações, use `supabase/RESET_PASSWORD.sql`

### Passo 4: Fazer Login

1. Vá para: `http://localhost:8080/auth`
2. Digite:
   - **Email**: o email que usou no script
   - **Password**: a password que definiu no script
3. Clique em **"Entrar"**

## ✅ Verificações

### Se o Login Funcionar:

🎉 **Sucesso!** A password foi resetada corretamente.

### Se Continuar a Dar Erro:

1. **Verifique no Console do Browser** (F12):
   - Procure pelos logs que começam com 🔐, 📧, 🔑
   - Copie TODOS os logs e partilhe

2. **Verifique se o script foi executado**:
   ```sql
   SELECT email, email_confirmed_at, updated_at
   FROM auth.users
   WHERE email = 'SEU-EMAIL@EXEMPLO.COM';
   ```
   - O campo `updated_at` deve ter a data/hora de agora
   - O campo `email_confirmed_at` NÃO deve ser NULL

3. **Verifique se tem role de admin**:
   ```sql
   SELECT u.email, ur.role
   FROM auth.users u
   LEFT JOIN public.user_roles ur ON ur.user_id = u.id
   WHERE u.email = 'SEU-EMAIL@EXEMPLO.COM';
   ```
   - Deve mostrar `role: admin`
   - Se não mostrar, execute `supabase/CREATE_ADMIN_USER.sql`

## 🔍 Troubleshooting

### Erro: "relation 'auth.users' does not exist"

**Causa**: Não tem permissões para aceder à tabela `auth.users`

**Solução**:
- Certifique-se que está a executar no SQL Editor do **Supabase Dashboard**
- NÃO execute estes scripts na aplicação local

### Erro: "function crypt() does not exist"

**Causa**: Extensão pgcrypto não está ativada

**Solução**: Execute primeiro:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Erro: "Utilizador não encontrado"

**Causa**: O email não existe na base de dados

**Solução**:
1. Crie a conta primeiro em `/auth` (clique em "Criar conta")
2. Depois execute o script para resetar a password
3. Execute também `CREATE_ADMIN_USER.sql` para dar permissões de admin

## 💡 Dicas

### Password Segura

Para produção, use passwords fortes:
- Mínimo 12 caracteres
- Letras maiúsculas e minúsculas
- Números
- Símbolos especiais

### Password Temporária

Para testar, pode usar uma password simples:
- `test123456`
- `admin123456`
- `senha123456`

**IMPORTANTE**: Depois de testar, mude para uma password segura!

## 📝 Exemplo Completo

```sql
-- 1. Ativar extensão (se necessário)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Resetar password
UPDATE auth.users
SET
  encrypted_password = crypt('MinhaPassword123', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'joao@exemplo.com';

-- 3. Verificar
SELECT email, email_confirmed_at, updated_at
FROM auth.users
WHERE email = 'joao@exemplo.com';

-- 4. Adicionar role de admin (se necessário)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'joao@exemplo.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

## 🆘 Ainda com Problemas?

Se mesmo após seguir todos os passos ainda não conseguir fazer login:

1. **Copie os logs do console** (F12 > Console)
2. **Execute esta query** e copie o resultado:
   ```sql
   SELECT
     u.id,
     u.email,
     u.email_confirmed_at,
     u.created_at,
     u.updated_at,
     ur.role
   FROM auth.users u
   LEFT JOIN public.user_roles ur ON ur.user_id = u.id
   WHERE u.email = 'SEU-EMAIL@EXEMPLO.COM';
   ```
3. **Partilhe as informações** para análise mais detalhada

---

**Nota**: Estes scripts são seguros e apenas modificam a password do utilizador especificado. A password é encriptada usando bcrypt antes de ser guardada.
