# 🚀 Como Configurar o Projeto no Lovable

## ⚠️ Problema: Preview Vazio ou Banner Amarelo

Se vês um preview vazio ou um banner amarelo dizendo "Configuração em Falta", precisas configurar as variáveis de ambiente do Supabase.

---

## 📝 Método 1: Criar Ficheiro .env no Lovable (RECOMENDADO)

### Passo a Passo:

1. **No Lovable, abre o teu projeto**

2. **Cria um novo ficheiro `.env`**:
   - Clica em "+" ou "New File" no explorador de ficheiros
   - Nome do ficheiro: `.env` (exatamente assim, com o ponto no início)
   - Localização: na raiz do projeto (mesmo nível que package.json)

3. **Cola este conteúdo no ficheiro `.env`**:

```env
VITE_SUPABASE_URL=COLA_AQUI_O_TEU_URL
VITE_SUPABASE_PUBLISHABLE_KEY=COLA_AQUI_A_TUA_KEY
```

4. **Obtém as tuas credenciais do Supabase**:

   a. Acede a: https://app.supabase.com

   b. Faz login e seleciona o teu projeto (ou cria um novo projeto)

   c. No menu lateral, vai a: **Settings** (ícone de engrenagem) → **API**

   d. Copia estes valores:
      - **Project URL**: Algo como `https://abcdefghijklmnop.supabase.co`
      - **Anon/Public Key**: Uma chave longa que começa com `eyJ...`

5. **Cola os valores no ficheiro .env**:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODMxNjgwMCwiZXhwIjoxOTUzODkyODAwfQ.exemplo_de_signature
```

6. **Guarda o ficheiro** (Ctrl+S ou Cmd+S)

7. **Aguarda 10-15 segundos** para o Lovable recarregar o preview

8. **✅ Pronto!** O banner amarelo desaparece e o site funciona completamente

---

## 📝 Método 2: Usar Ficheiro Existente

Se não consegues criar o ficheiro `.env` no Lovable:

1. **Copia o ficheiro `.env.example`**:
   - No Lovable, encontra o ficheiro `.env.example`
   - Duplica-o ou copia o conteúdo
   - Renomeia a cópia para `.env`

2. **Edita o `.env`** com as tuas credenciais do Supabase (ver Método 1, passo 4)

---

## 📝 Método 3: Configurar via Interface do Lovable (Se disponível)

Alguns projetos Lovable têm interface para env vars:

1. **No Lovable**, procura por:
   - Ícone de **Settings** / **Configurações** (⚙️)
   - Menu **"Environment"** ou **"Variables"**
   - Botão **"Secrets"** ou **"Config"**

2. **Se encontrares**, adiciona estas variáveis:
   ```
   Nome: VITE_SUPABASE_URL
   Valor: https://xxxxx.supabase.co

   Nome: VITE_SUPABASE_PUBLISHABLE_KEY
   Valor: eyJhbGc...
   ```

3. **Guarda e reinicia o preview**

---

## 🔍 Verificar se Funcionou

### ✅ Indicadores de Sucesso:

1. **Console do Browser** (F12 → Console):
   - ❌ Antes: Vês mensagens de erro vermelhas sobre Supabase
   - ✅ Depois: Sem erros de Supabase

2. **Preview do Lovable**:
   - ❌ Antes: Banner amarelo no topo ou página vazia
   - ✅ Depois: Site carrega normalmente, sem banner amarelo

3. **Funcionalidades**:
   - ✅ Produtos aparecem na página inicial
   - ✅ Carrinho de compras funciona
   - ✅ Botão "Peça Personalizada" abre popup
   - ✅ Pode fazer login no backoffice (/backoffice)

---

## 🆘 Problemas Comuns

### "Não consigo criar o ficheiro .env"

**Solução**: Alguns editores não mostram ficheiros que começam com ponto (`.`).

- Tenta criar com o nome completo incluindo o ponto: `.env`
- Ou usa o terminal/console do Lovable: `touch .env`

### "O banner amarelo continua a aparecer"

**Causas possíveis**:

1. **Valores incorretos**: Verifica se copiaste as credenciais certas
2. **Espaços extras**: Remove espaços antes/depois dos valores
3. **Aspas**: NÃO uses aspas à volta dos valores no .env
   - ❌ Errado: `VITE_SUPABASE_URL="https://..."`
   - ✅ Certo: `VITE_SUPABASE_URL=https://...`

### "Erro 401 ou 403 do Supabase"

**Causa**: Credenciais incorretas ou projeto Supabase não configurado.

**Solução**:
1. Verifica se o projeto Supabase está ativo (não pausado)
2. Confirma que estás a usar o **anon/public key**, não a service role key
3. Vai a Supabase → Settings → API e copia novamente

---

## 📚 Recursos Adicionais

- **Supabase Docs**: https://supabase.com/docs
- **Vite Env Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Setup Guide**: Ver ficheiro `CLAUDE.md` na raiz do projeto

---

## ✅ Checklist Final

- [ ] Ficheiro `.env` criado na raiz do projeto
- [ ] `VITE_SUPABASE_URL` configurado
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` configurado
- [ ] Valores copiados corretamente do Supabase
- [ ] Ficheiro guardado
- [ ] Preview reiniciado/recarregado
- [ ] Banner amarelo desapareceu
- [ ] Site funciona normalmente

---

**💡 Dica**: O ficheiro `.env` não deve ser commitado ao git (por segurança). Cada developer deve ter o seu próprio .env local.
