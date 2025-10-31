# Guia de Diagnóstico - Erro de Login "Invalid Credentials"

## 🔍 Diagnóstico Rápido

O erro `AuthApiError: Invalid login credentials` pode ter 4 causas principais:

### 1. ✉️ Email Não Confirmado
**Sintoma:** Supabase rejeita o login se a confirmação de email estiver ativada e o utilizador não confirmou.

**Como verificar:**
```sql
-- Execute no SQL Editor do Supabase Dashboard
SELECT
  email,
  email_confirmed_at,
  CASE
    WHEN email_confirmed_at IS NULL THEN '❌ Email NÃO confirmado'
    ELSE '✅ Email confirmado'
  END as status
FROM auth.users
WHERE email = 'SEU-EMAIL@EXEMPLO.COM';
```

**Solução:** Use o script `CHECK_USER_STATUS.sql` (incluído) e depois `RESET_PASSWORD_SIMPLE.sql` para confirmar o email.

---

### 2. 🔑 Password Incorreta
**Sintoma:** A password que está a tentar usar não corresponde à password guardada.

**Possíveis razões:**
- Password tem espaços no início/fim (o código agora faz `.trim()` mas passwords antigas podem ter espaços)
- Password foi criada com caps lock ativado
- Password esquecida

**Solução:** Use o script `RESET_PASSWORD_SIMPLE.sql` para definir uma nova password.

---

### 3. 👤 Utilizador Não Existe
**Sintoma:** O email não está registado no sistema.

**Como verificar:** Execute o script `CHECK_USER_STATUS.sql`

**Solução:**
- Criar nova conta através da página `/auth`
- Ou criar manualmente na base de dados (não recomendado)

---

### 4. 🔐 Problemas de Configuração do Supabase Auth
**Sintoma:** Configuração do Supabase Auth pode estar a bloquear logins.

**Como verificar:**
1. Vá ao Supabase Dashboard
2. Authentication > Settings
3. Verifique:
   - "Enable email confirmations" - se estiver ON, todos os utilizadores precisam confirmar email
   - "Secure email change" - pode causar problemas se estiver mal configurado

---

## 🛠️ Scripts de Diagnóstico e Correção

### Passo 1: Verificar Estado do Utilizador
```bash
# Use o script CHECK_USER_STATUS.sql
# Execute no SQL Editor do Supabase Dashboard
```

### Passo 2: Corrigir Problemas
Dependendo do resultado, use um destes scripts:

**Se email não estiver confirmado:**
```bash
# Use RESET_PASSWORD_SIMPLE.sql
# Este script confirma o email E reseta a password
```

**Se utilizador não existir:**
- Crie conta através da página `/auth` do site
- Depois use `CREATE_ADMIN_USER.sql` se precisar de permissões de admin

---

## 📋 Checklist de Diagnóstico

Execute estes passos pela ordem:

- [ ] **Passo 1:** Execute `CHECK_USER_STATUS.sql` com o seu email
  - Se não encontrar o utilizador → crie conta em `/auth`
  - Se encontrar utilizador, continue

- [ ] **Passo 2:** Verifique se email está confirmado
  - Se `email_confirmed_at` for NULL → execute `RESET_PASSWORD_SIMPLE.sql`
  - Se estiver confirmado, continue

- [ ] **Passo 3:** Resete a password
  - Execute `RESET_PASSWORD_SIMPLE.sql` com uma nova password
  - Use uma password simples para testar (ex: `teste123`)

- [ ] **Passo 4:** Teste o login
  - Vá a `/auth`
  - Use o email e a nova password
  - **IMPORTANTE:** A password deve ter entre 6 e 100 caracteres

- [ ] **Passo 5:** (Apenas para backoffice) Adicione permissões admin
  - Execute `CREATE_ADMIN_USER.sql` com o seu email

---

## 🚀 Solução Rápida (Recomendada)

Se quiser resolver rapidamente sem diagnosticar:

1. Execute `CHECK_USER_STATUS.sql` para ver o estado atual
2. Execute `RESET_PASSWORD_SIMPLE.sql` com:
   - Seu email
   - Uma nova password simples (ex: `senha123456`)
3. Tente fazer login com a nova password

**Scripts necessários:**
- ✅ `CHECK_USER_STATUS.sql` (novo - criado agora)
- ✅ `RESET_PASSWORD_SIMPLE.sql` (já existe)
- ✅ `CREATE_ADMIN_USER.sql` (já existe)

---

## 💡 Dicas Importantes

1. **Passwords com espaços:** O código agora remove espaços automaticamente (`.trim()`), mas passwords antigas podem ter espaços guardados

2. **Caps Lock:** Verifique se o caps lock está desligado

3. **Comprimento da password:** Deve ter 6-100 caracteres

4. **Confirmação de email:** Se criar nova conta, pode precisar confirmar o email (ou usar o script de reset para confirmar automaticamente)

5. **Consola do browser:** Os logs mostram informações úteis:
   - `Password length` - comprimento da password
   - `Password characters breakdown` - analisa caracteres especiais/espaços

---

## 📞 Precisa de Mais Ajuda?

Se depois de seguir todos os passos ainda tiver problemas:

1. Verifique a consola do browser (F12) para logs detalhados
2. Verifique as configurações de Auth no Supabase Dashboard
3. Confirme que o projeto Supabase está ativo e acessível
4. Verifique as variáveis de ambiente (.env):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
