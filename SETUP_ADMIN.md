# 🔐 Como Configurar o Primeiro Usuário Administrador

Se você está a ver uma mensagem de erro ao tentar fazer login ou não consegue aceder ao backoffice, siga estes passos para criar o seu primeiro usuário administrador.

## ✅ Pré-requisitos

Antes de começar, certifique-se de que:

1. ✅ As migrações SQL foram executadas no Supabase SQL Editor
2. ✅ As variáveis de ambiente estão configuradas no `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

## 📋 Passo a Passo

### Passo 1: Criar uma Conta de Usuário

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Abra o navegador e vá para: `http://localhost:8080/auth`

3. Clique em **"Não tem conta? Criar conta"**

4. Preencha o formulário:
   - Email: o email que você quer usar como admin
   - Password: uma password segura (mínimo 6 caracteres)

5. Clique em **"Criar Conta"**

6. **Importante**: Dependendo da configuração do Supabase:
   - Se "Email Confirmations" estiver ativado: Verifique seu email e clique no link de confirmação
   - Se estiver desativado: A conta é criada imediatamente

7. Neste ponto, a conta foi criada mas ainda não tem permissões de admin

### Passo 2: Adicionar Permissões de Admin

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard

2. Selecione o seu projeto: `gyvtgzdkuhypteiyhtaq`

3. No menu lateral, clique em **SQL Editor**

4. Abra o arquivo `supabase/CREATE_ADMIN_USER.sql` no seu editor de código

5. **Copie o conteúdo do arquivo** e cole no SQL Editor

6. **IMPORTANTE**: Substitua `SEU-EMAIL@EXEMPLO.COM` pelo email que você usou no Passo 1

   Exemplo:
   ```sql
   -- ANTES
   WHERE email = 'SEU-EMAIL@EXEMPLO.COM'

   -- DEPOIS
   WHERE email = 'admin@rebohoart.com'
   ```

7. Clique em **Run** para executar o script

8. Você deve ver uma mensagem de sucesso e uma tabela mostrando:
   - O seu email
   - A role: `admin`
   - A data de criação

### Passo 3: Fazer Login como Admin

1. Volte para: `http://localhost:8080/auth`

2. Faça login com o mesmo email e password que usou no Passo 1

3. **Sucesso!** 🎉 Você será redirecionado para `/backoffice`

## 🔍 Verificar se o Admin foi Criado

Se quiser verificar manualmente se o admin foi criado:

1. Vá para o **Supabase Dashboard** > **Table Editor**

2. Selecione a tabela `user_roles`

3. Você deve ver uma linha com:
   - `user_id`: UUID do seu usuário
   - `role`: admin
   - `created_at`: Data de criação

## ❌ Problemas Comuns

### "Invalid login credentials"

**Causa**: O usuário ainda não foi criado no sistema de autenticação.

**Solução**:
1. Tente fazer login primeiro (vai falhar mas vai criar o usuário)
2. Depois execute o script SQL para adicionar permissões de admin
3. Faça login novamente

### "Não consigo aceder ao /backoffice"

**Causa**: O usuário não tem permissões de admin.

**Solução**: Execute o script `CREATE_ADMIN_USER.sql` substituindo o email pelo seu.

### "Email já existe"

**Causa**: Você já criou um usuário com esse email.

**Solução**:
- Use o mesmo email no script SQL do Passo 2
- Ou use um email diferente e comece do Passo 1 novamente

## 🔐 Segurança

⚠️ **IMPORTANTE**:
- Nunca commite o arquivo `CREATE_ADMIN_USER.sql` com o seu email real
- Use passwords fortes para contas de admin
- Não partilhe as credenciais de admin

## 📚 Próximos Passos

Depois de configurar o admin, você pode:

1. ✅ Aceder ao backoffice: `http://localhost:8080/backoffice`
2. ✅ Adicionar produtos
3. ✅ Gerir encomendas
4. ✅ Ver pedidos personalizados

## 💡 Dica

Para adicionar mais administradores no futuro, pode:

1. Pedir-lhes para criar uma conta através de `/auth`
2. Depois, como admin existente, executar o script SQL com o email deles
3. Ou criar uma interface no backoffice para gerir permissões (funcionalidade futura)
