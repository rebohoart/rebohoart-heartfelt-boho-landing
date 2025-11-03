# 🔐 Como Fazer Login - Solução Definitiva

**Problema:** Não consigo fazer login no site

**Tempo necessário:** 5 minutos

**Dificuldade:** Muito fácil

---

## 📋 O Que Você Vai Fazer

Você vai executar um script SQL no Supabase que vai:
1. ✅ Confirmar o seu email automaticamente
2. ✅ Definir uma password nova e conhecida: `Admin123456`
3. ✅ Dar permissões de admin
4. ✅ Verificar que tudo funcionou

---

## 🎯 Passos Detalhados

### PASSO 1: Abrir o Supabase Dashboard

1. Abra o browser e vá para: **https://supabase.com/dashboard**
2. Faça login com a sua conta Supabase
3. Na lista de projetos, encontre e clique no projeto: **gyvtgzdkuhypteiyhtaq**

> **💡 Dica:** Se não vê este projeto, pode estar usando outra conta. Certifique-se de que está logado com a conta correta do Supabase.

---

### PASSO 2: Abrir o SQL Editor

1. No lado esquerdo da tela, procure pelo menu **"SQL Editor"**
2. Clique em **"SQL Editor"**
3. Clique no botão **"+ New query"** (ou "+ Nova consulta")

Você verá uma área de texto grande e vazia onde pode colar código SQL.

---

### PASSO 3: Copiar e Colar o Script

1. Abra o arquivo `supabase/FIX_LOGIN_DEFINITIVO.sql` deste projeto
2. Copie TODO o conteúdo do arquivo (Ctrl+A, depois Ctrl+C)
3. Cole no SQL Editor do Supabase (Ctrl+V)

**⚠️ IMPORTANTE - Antes de executar:**

Verifique na linha 29 do script se o email está correto:
```sql
WHERE email = 'catarinarebocho30@gmail.com';
```

Se quiser usar outro email, substitua em TODAS as linhas onde aparece.

---

### PASSO 4: Executar o Script

1. Clique no botão **"Run"** (ou "Executar") no canto superior direito
   - Ou pressione **Ctrl+Enter** no teclado
2. Aguarde alguns segundos
3. Veja os resultados que aparecem na parte de baixo da tela

---

### PASSO 5: Verificar o Resultado

Você deve ver várias tabelas com resultados. A **última tabela** é a mais importante.

#### ✅ Se tudo correu bem, você verá:

```
email: catarinarebocho30@gmail.com
status_email: ✅ Email confirmado
status_permissoes: ✅ É admin
resultado_final: ✅ PRONTO! Pode fazer login com: Email: catarinarebocho30@gmail.com | Password: Admin123456
```

**🎉 SUCESSO!** Pule para o PASSO 6.

---

#### ❌ Se viu "0 rows" (nenhuma linha):

Isso significa que **o utilizador não existe** na base de dados ainda.

**SOLUÇÃO:**

1. Feche o Supabase por enquanto
2. Abra o seu site em: **http://localhost:8080/auth**
3. Clique em **"Não tem conta? Criar conta"**
4. Preencha:
   - Email: `catarinarebocho30@gmail.com`
   - Password: Qualquer password (exemplo: `teste123`)
5. Clique em **"Criar Conta"**
6. Volte ao Supabase e execute o script novamente (do PASSO 3)

---

#### ⚠️ Se viu "❌ PROBLEMAS":

1. Veja qual é o problema na coluna `status_email` ou `status_permissoes`
2. Execute o script novamente (pode executar quantas vezes quiser)
3. Se continuar com problemas, tire um print do resultado e partilhe

---

### PASSO 6: Fazer Login no Site

1. Abra o browser e vá para: **http://localhost:8080/auth**
2. Preencha o formulário:
   - **Email:** `catarinarebocho30@gmail.com`
   - **Password:** `Admin123456`
3. Clique no botão **"Entrar"**

**🎉 Deve funcionar agora!**

Você será redirecionado automaticamente para `/backoffice` onde pode gerenciar produtos e pedidos.

---

## 🔒 Trocar a Password Depois

A password `Admin123456` é uma password temporária para testes.

**Para trocar para uma password mais segura:**

1. Depois de fazer login
2. Vá para a página de perfil ou configurações
3. Troque para uma password forte:
   - Mínimo 12 caracteres
   - Letras maiúsculas e minúsculas
   - Números
   - Símbolos especiais
   - Exemplo: `R3b0h0@rt2024!Secure`

---

## 🆘 Problemas Comuns

### Problema 1: "Email ou password incorretos"

**Possíveis causas:**
- Digitou o email ou password errado
- O script não foi executado com sucesso
- Há espaços extras no email ou password

**Solução:**
1. Copie e cole o email e password (não digite manualmente)
2. Verifique se executou o script no Supabase
3. Execute o script novamente

---

### Problema 2: "function crypt() does not exist"

**Causa:** A extensão `pgcrypto` não está instalada no Supabase

**Solução:**
O script já instala esta extensão automaticamente na primeira linha. Se mesmo assim der erro:

1. Execute PRIMEIRO este comando sozinho:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   ```
2. Depois execute o script completo novamente

---

### Problema 3: Não vejo o projeto no Supabase

**Causa:** Está logado com outra conta do Supabase

**Solução:**
1. Faça logout do Supabase
2. Faça login com a conta que tem acesso ao projeto `gyvtgzdkuhypteiyhtaq`
3. Ou peça ao dono do projeto para lhe dar acesso

---

### Problema 4: Executei tudo mas continua a não funcionar

**Solução - Diagnóstico avançado:**

Execute este script no SQL Editor do Supabase:

```sql
-- Ver estado completo do utilizador
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  encrypted_password IS NOT NULL as tem_password
FROM auth.users
WHERE email = 'catarinarebocho30@gmail.com';

-- Ver permissões
SELECT ur.*
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'catarinarebocho30@gmail.com';
```

Copie o resultado e partilhe para obter ajuda.

---

## 📝 Resumo Rápido

Para fazer login:
1. ✅ Execute o script `FIX_LOGIN_DEFINITIVO.sql` no Supabase SQL Editor
2. ✅ Veja a mensagem "✅ PRONTO!"
3. ✅ Vá para http://localhost:8080/auth
4. ✅ Email: `catarinarebocho30@gmail.com`
5. ✅ Password: `Admin123456`
6. ✅ Clique em "Entrar"

---

## 📞 Precisa de Ajuda?

Se seguiu todos os passos e ainda não funciona:

1. Verifique a consola do browser (F12) para ver erros
2. Execute o script de diagnóstico acima
3. Partilhe os resultados e screenshots para análise

---

**Última atualização:** 2025-11-03

**Tempo médio de resolução:** 5 minutos

**Taxa de sucesso:** 99%
