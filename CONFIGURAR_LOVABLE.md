# 🚀 Como Configurar Variáveis de Ambiente no Lovable

## ⚡ SOLUÇÃO RÁPIDA (2 minutos)

### **Passo 1: Usar o Chat do Lovable**

O Lovable funciona através de **chat com IA**. Aqui está o que fazer:

1. **Encontra o chat do Lovable**:
   - Procura por um ícone de mensagem 💬
   - Ou procura "Chat" ou "AI Assistant"
   - Geralmente está no fundo ou canto da página

2. **Copia e cola esta mensagem NO CHAT DO LOVABLE**:

```
Cria um ficheiro chamado .env na raiz do projeto com este conteúdo:

VITE_SUPABASE_URL=SUBSTITUI_PELO_TEU_URL
VITE_SUPABASE_PUBLISHABLE_KEY=SUBSTITUI_PELA_TUA_KEY
```

3. **O Lovable vai criar o ficheiro automaticamente** ✅

---

### **Passo 2: Obter as Credenciais do Supabase**

1. Abre em nova tab: **https://app.supabase.com**

2. **Faz login** e seleciona o teu projeto
   - Se não tens projeto: clica "New Project" e cria um

3. No menu lateral esquerdo:
   - Clica **Settings** ⚙️
   - Depois clica **API**

4. **Copia estes 2 valores**:

   📍 **Project URL**:
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   *(Substitui pelas tuas letras/números)*

   🔑 **anon public key**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exemplo...
   ```
   *(É uma chave muito longa)*

---

### **Passo 3: Editar o Ficheiro no Lovable**

**Opção A: Pedir ao Chat AI** (Mais fácil)

No chat do Lovable, escreve:

```
Edita o ficheiro .env e substitui os valores por:

VITE_SUPABASE_URL=https://[COLA_AQUI_O_TEU_URL]
VITE_SUPABASE_PUBLISHABLE_KEY=[COLA_AQUI_A_TUA_KEY]
```

*(Substitui as partes entre [ ] pelos valores que copiaste do Supabase)*

**Opção B: Editar Manualmente**

1. No Lovable, encontra o ficheiro `.env` no explorador de ficheiros
2. Clica para abrir
3. Substitui `SUBSTITUI_PELO_TEU_URL` pelo URL que copiaste
4. Substitui `SUBSTITUI_PELA_TUA_KEY` pela key que copiaste
5. Guarda (Ctrl+S ou Cmd+S)

---

### **Passo 4: Verificar**

1. **Aguarda 10-20 segundos** para o Lovable recarregar

2. **Verifica o preview**:
   - ✅ **Funcionou**: Não há banner amarelo
   - ❌ **Não funcionou**: Ainda aparece banner amarelo

3. Se não funcionou:
   - Abre o Console do browser (F12)
   - Verifica se há erros
   - Confirma que os valores estão corretos

---

## 🎯 Exemplo Visual

**Antes de configurar:**
```
Preview do Lovable:
┌─────────────────────────────────────┐
│ ⚠️ Configuração em Falta: Supabase │ ← Banner Amarelo
├─────────────────────────────────────┤
│                                     │
│    (site pode estar vazio)          │
│                                     │
└─────────────────────────────────────┘
```

**Depois de configurar:**
```
Preview do Lovable:
┌─────────────────────────────────────┐
│  🏠 ReBoho Art                      │ ← Sem banner!
├─────────────────────────────────────┤
│                                     │
│  ✨ Produtos                        │
│  🛒 Carrinho funciona               │
│  📧 Formulários funcionam           │
│                                     │
└─────────────────────────────────────┘
```

---

## 💬 Mensagens para Copiar no Chat do Lovable

### **Criar o ficheiro .env:**
```
Cria um ficheiro .env na raiz do projeto com estas linhas:

VITE_SUPABASE_URL=PLACEHOLDER_URL
VITE_SUPABASE_PUBLISHABLE_KEY=PLACEHOLDER_KEY
```

### **Editar com os valores reais:**
```
Edita o ficheiro .env e atualiza os valores para:

VITE_SUPABASE_URL=https://[O_MEU_URL].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[A_MINHA_KEY]
```
*(Substitui [O_MEU_URL] e [A_MINHA_KEY] pelos valores reais)*

---

## 🆘 Problemas Comuns

### "Não encontro o chat no Lovable"

Procura por:
- Ícone de mensagem 💬 ou 🤖
- Botão "Chat" ou "Assistant"
- Barra de pesquisa com "Ask AI" ou similar
- Menu lateral com opção de chat

Se não encontras, tenta:
1. Clica no logo do Lovable
2. Procura em Settings/Configurações
3. Ou contacta suporte do Lovable

### "O banner amarelo não desaparece"

**Causa 1**: Valores incorretos
- ✅ Verifica se copiaste as credenciais corretas
- ✅ Confirma que não há espaços extra
- ✅ Confirma que o URL começa com `https://`

**Causa 2**: Ficheiro não guardado
- ✅ Guarda o ficheiro .env
- ✅ Aguarda 15-20 segundos
- ✅ Faz refresh do preview

**Causa 3**: Projeto Supabase inativo
- ✅ Vai a https://app.supabase.com
- ✅ Verifica se o projeto está ativo (não pausado)

### "Erro 401/403 no console"

Significa: credenciais inválidas
- ✅ Usa a key **anon public**, não a service_role
- ✅ Copia novamente do Supabase
- ✅ Verifica se o projeto Supabase tem as tabelas criadas

---

## ✅ Checklist Final

- [ ] Abri o chat do Lovable
- [ ] Pedi para criar ficheiro .env
- [ ] Ficheiro .env foi criado
- [ ] Copiei URL do Supabase
- [ ] Copiei Key do Supabase
- [ ] Colei os valores no .env
- [ ] Guardei o ficheiro
- [ ] Aguardei 15 segundos
- [ ] Banner amarelo desapareceu
- [ ] Site funciona normalmente

---

## 📞 Ainda com Dúvidas?

Se continuares com problemas, tira um **screenshot** de:
1. O ficheiro .env (esconde parte da key por segurança)
2. O console do browser (F12 → Console)
3. O erro que aparece

E pede ajuda com essas informações!

---

**💡 Dica Final**: O ficheiro `.env` é local e não é enviado para o git (por segurança). É normal que não apareça no GitHub.
