# 🔧 Como Resolver o Erro "Invalid Credentials"

## ⚡ Solução Rápida (3 minutos)

### Passo 1: Verificar o Estado do Utilizador

1. Abra o **Supabase Dashboard** (https://supabase.com/dashboard)
2. Vá ao seu projeto
3. Clique em **SQL Editor** (ícone de código no menu lateral)
4. Abra o ficheiro `supabase/CHECK_USER_STATUS.sql` deste repositório
5. Copie o conteúdo
6. Cole no SQL Editor
7. **IMPORTANTE:** Substitua `'SEU-EMAIL@EXEMPLO.COM'` pelo seu email real
8. Clique em **RUN** ou pressione `Ctrl+Enter`

### Passo 2: Analisar o Resultado

O script vai mostrar uma das seguintes situações:

#### ❌ Resultado Vazio (0 linhas)
**Problema:** O utilizador não existe

**Solução:**
1. Vá a `http://localhost:8080/auth` (ou o URL do seu site)
2. Clique em "Não tem conta? Criar conta"
3. Crie a conta
4. Depois continue para o Passo 3

#### ⚠️ "Email NÃO confirmado"
**Problema:** Esta é a causa mais comum do erro!

**Solução:** Continue para o Passo 3

#### ✅ "Email confirmado" mas login falha
**Problema:** Password incorreta

**Solução:** Continue para o Passo 3

### Passo 3: Resetar Password e Confirmar Email

1. No **SQL Editor** do Supabase
2. Abra o ficheiro `supabase/RESET_PASSWORD_SIMPLE.sql` deste repositório
3. Copie o conteúdo
4. Cole no SQL Editor
5. **IMPORTANTE:** Faça estas substituições:
   - Linha 18: Substitua `'admin@rebohoart.com'` pelo seu email
   - Linha 15: Substitua `'senha123456'` pela nova password que quer usar
6. Clique em **RUN**

O script vai:
- ✅ Confirmar o email automaticamente
- ✅ Definir a nova password
- ✅ Mostrar o status final

### Passo 4: Testar o Login

1. Vá a `http://localhost:8080/auth`
2. Use o seu email
3. Use a password que definiu no Passo 3
4. Clique em "Entrar"

**Deve funcionar agora! ✅**

---

## 🔐 Passo Extra: Adicionar Permissões de Admin (Opcional)

Se precisar de aceder ao backoffice (`/backoffice`):

1. No **SQL Editor** do Supabase
2. Abra o ficheiro `supabase/CREATE_ADMIN_USER.sql` deste repositório
3. Copie o conteúdo
4. Cole no SQL Editor
5. **IMPORTANTE:** Substitua `'SEU-EMAIL@EXEMPLO.COM'` pelo seu email (linha 17)
6. Clique em **RUN**

Agora tem permissões de administrador! 🎉

---

## 📚 Para Mais Detalhes

Consulte o ficheiro `GUIA_DIAGNOSTICO_LOGIN.md` para:
- Explicação detalhada de cada tipo de erro
- Diagnóstico avançado
- Outras soluções alternativas
- Troubleshooting adicional

---

## 🆘 Ainda Não Funciona?

Se depois de seguir todos os passos ainda tiver problemas:

### Verifique a Configuração do Supabase Auth

1. Vá ao **Supabase Dashboard**
2. Clique em **Authentication** > **Settings**
3. Verifique estas configurações:

   **Enable email confirmations:**
   - Se estiver **ON** → Todos os utilizadores precisam confirmar email
   - O script `RESET_PASSWORD_SIMPLE.sql` já resolve isto automaticamente

   **Disable email confirmations (Recomendado para desenvolvimento):**
   - Se quiser evitar este problema no futuro
   - Vá a "Email Auth" section
   - Desative "Enable email confirmations"
   - Guarde as alterações

### Verifique as Variáveis de Ambiente

Certifique-se que o ficheiro `.env` tem:
```
VITE_SUPABASE_URL=https://jjfqljrbgoymwwvyyvam.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-aqui
```

### Verifique a Consola do Browser

1. Abra a consola (F12)
2. Vá ao separador "Console"
3. Tente fazer login novamente
4. Procure por:
   - `Password length` - deve mostrar o comprimento correto (6-100 caracteres)
   - `Password characters breakdown` - mostra se há espaços ou caracteres especiais

---

## ✅ Checklist Rápida

- [ ] Executei `CHECK_USER_STATUS.sql` e vi o estado do utilizador
- [ ] Executei `RESET_PASSWORD_SIMPLE.sql` com o meu email e nova password
- [ ] Testei fazer login com a nova password
- [ ] (Opcional) Executei `CREATE_ADMIN_USER.sql` para ter acesso ao backoffice
- [ ] Consegui fazer login com sucesso ✅

---

**Tempo estimado:** 3-5 minutos
**Dificuldade:** Fácil
**Ferramentas necessárias:** Acesso ao Supabase Dashboard
