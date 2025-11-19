# 🤖 Guia de Configuração - Google Gemini API para Geração de Imagens

Este guia explica como configurar a integração com a **API gratuita do Google Gemini 2.5 Flash** para gerar imagens com inteligência artificial diretamente do backoffice.

## 📋 Visão Geral da Arquitetura

```
Frontend (AIImageGenerator.tsx)
    ↓ [POST] imagem base64 + prompt
Supabase Edge Function (generate-image-gemini)
    ↓ [POST] chamada à API do Gemini
Google Gemini 2.5 Flash API
    ↓ [RESPONSE] imagem gerada em base64
Supabase Edge Function
    ↓ [RESPONSE] image_url
Frontend (exibe e salva imagem)
```

## 🔑 Passo 1: Obter a API Key do Gemini (GRÁTIS)

### Método 1: Acesso Direto (Recomendado)

1. **Acesse Google AI Studio**:
   - URL principal: https://aistudio.google.com
   - Ou URL direto para API Keys: https://aistudio.google.com/app/apikey

2. **Faça login** com sua conta Google (Gmail)

3. Na primeira vez, você verá:
   - Popup para aceitar os **Termos de Serviço** → Aceite
   - Pode pedir para selecionar país → Selecione o seu país

4. No dashboard, clique em **"Get API key"** (canto superior direito)

5. Uma janela aparecerá com 2 opções:
   - **"Create API key in new project"** (Recomendado para iniciantes)
   - **"Create API key in existing project"** (Se já tem projeto Google Cloud)

6. Escolha uma opção e clique no botão

7. **Copie a API Key gerada** (formato: `AIzaSy...`)
   - ⚠️ **IMPORTANTE**: Guarde esta chave em local seguro!
   - Clique no ícone de **copiar** ao lado da chave
   - Nunca exponha a chave no código frontend ou em repositórios públicos

### Método 2: Se o Link Não Funcionar

Caso o link direto dê erro, siga este caminho:

1. Acesse: https://makersuite.google.com
   - Este é o nome antigo do Google AI Studio e pode redirecionar corretamente

2. Ou acesse: https://console.cloud.google.com
   - Vá para **APIs & Services** → **Credentials**
   - Clique em **"Create credentials"** → **"API key"**
   - Depois, habilite a **Generative Language API** no projeto

### Possíveis Problemas e Soluções

**❌ "Failed to list models"** (Erro mais comum):

Este erro geralmente indica problema de disponibilidade regional. Soluções:

**SOLUÇÃO 1: Via Google Cloud Console (Recomendado se AI Studio não funcionar)**
1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto (ou selecione um existente)
3. Vá para **APIs & Services** → **Library**
4. Procure por **"Generative Language API"**
5. Clique em **"Enable"** para ativar a API
6. Depois, vá para **APIs & Services** → **Credentials**
7. Clique em **"+ Create Credentials"** → **"API key"**
8. Copie a API Key gerada
9. (Opcional) Clique em **"Restrict Key"** para adicionar restrições de segurança

**SOLUÇÃO 2: Usar VPN**
- O Google AI Studio não está disponível em todos os países
- Use uma VPN conectada a EUA, Reino Unido ou Europa Ocidental
- Acesse https://aistudio.google.com novamente
- Crie a API Key
- Depois de criada, a chave funciona de qualquer país

**SOLUÇÃO 3: API Key via gcloud CLI** (Para usuários avançados)
```bash
# Instalar gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Fazer login
gcloud auth login

# Criar projeto (se necessário)
gcloud projects create meu-projeto-gemini

# Ativar a API
gcloud services enable generativelanguage.googleapis.com --project=meu-projeto-gemini

# Criar API Key
gcloud alpha services api-keys create --display-name="Gemini API Key" --project=meu-projeto-gemini
```

**❌ Erro de região/país:**
- O Google AI Studio pode não estar disponível em todos os países
- Use a SOLUÇÃO 1 (Google Cloud Console) ou SOLUÇÃO 2 (VPN)

**❌ Página em branco ou erro 403:**
- Limpe o cache do navegador
- Tente em navegador anónimo/privado
- Use outro navegador (Chrome, Firefox, Edge)
- Desative extensões de bloqueio

**❌ "Service not available":**
- Aguarde alguns minutos e tente novamente
- Verifique se tem uma conta Google válida e ativa
- Use a SOLUÇÃO 1 (Google Cloud Console)

### Limites da API Gratuita

A API do Gemini 2.5 Flash oferece um tier gratuito generoso:

- **Modelos Flash**: 1.500 requests/dia
- **Límite de taxa**: 15 RPM (requests por minuto)
- **Contexto**: Até 1 milhão de tokens

Para mais detalhes: https://ai.google.dev/pricing

## 🚀 Passo 2: Configurar a Edge Function no Supabase

### 2.1 - Instalar Supabase CLI (se ainda não tiver)

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (via scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Ou via NPM (qualquer SO)
npm install -g supabase
```

### 2.2 - Fazer Login no Supabase CLI

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

### 2.3 - Vincular ao Projeto

```bash
# Na raiz do projeto
supabase link --project-ref seu-project-id
```

Para encontrar o `project-id`:
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. O project-id está na URL: `https://app.supabase.com/project/[PROJECT-ID]`

### 2.4 - Configurar o Secret da API Key

**MÉTODO 1: Via Dashboard (Recomendado)**

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá para: **Edge Functions** (menu lateral)
4. Clique em **"Manage secrets"** (ou "Function Secrets")
5. Adicione um novo secret:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Sua chave API do Gemini (ex: `AIzaSy...`)
6. Clique em **"Save"**

**MÉTODO 2: Via CLI**

```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...
```

### 2.5 - Deploy da Edge Function

```bash
# Deploy da função específica
supabase functions deploy generate-image-gemini

# Ou deploy de todas as funções
supabase functions deploy
```

Aguarde a mensagem de sucesso:
```
Deployed Function generate-image-gemini on project [PROJECT-ID]
```

### 2.6 - Verificar o Deploy

1. Acesse o Supabase Dashboard
2. Vá para **Edge Functions**
3. Verifique se `generate-image-gemini` aparece na lista
4. Status deve estar **"Deployed"**

## 🔧 Passo 3: Testar a Integração

### 3.1 - Testar via CLI (Opcional)

```bash
# Criar arquivo de teste
cat > test-gemini.json <<EOF
{
  "image": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQ...",
  "prompt": "Faz um desenho em single-line art com base nesta foto",
  "mimeType": "image/jpeg"
}
EOF

# Invocar função
supabase functions invoke generate-image-gemini \
  --body "$(cat test-gemini.json)"
```

### 3.2 - Testar via Backoffice

1. Acesse o backoffice da aplicação: `/backoffice`
2. Faça login como admin
3. Vá para a aba **"Geração de Imagens com IA"**
4. Faça upload de uma imagem (PNG, JPG ou WEBP)
5. Clique em **"Gerar Nova Versão com IA"**
6. Aguarde o processamento (pode levar 10-30 segundos)
7. A imagem gerada será exibida abaixo

### 3.3 - Verificar Logs (Em caso de erro)

**Via Dashboard:**
1. Supabase Dashboard → **Edge Functions**
2. Clique em `generate-image-gemini`
3. Clique na aba **"Logs"**
4. Verifique erros e mensagens de debug

**Via CLI:**
```bash
supabase functions logs generate-image-gemini
```

## 🐛 Solução de Problemas

### Erro: "GEMINI_API_KEY not configured"

**Causa**: A variável de ambiente não está configurada na Edge Function.

**Solução**:
1. Verifique se adicionou o secret no Supabase Dashboard (Passo 2.4)
2. Aguarde 1-2 minutos para propagação
3. Faça re-deploy da função: `supabase functions deploy generate-image-gemini`

### Erro: "Gemini API error: 400"

**Possíveis causas**:
- API Key inválida ou expirada
- Formato da imagem incorreto
- Imagem muito grande (>20MB)

**Solução**:
1. Verifique se a API Key está correta
2. Teste a API Key diretamente em: https://aistudio.google.com
3. Reduza o tamanho da imagem se for muito grande
4. Verifique os logs para mais detalhes

### Erro: "Gemini API error: 429 - Quota exceeded"

**Causa**: Limite de requests do tier gratuito foi atingido.

**Solução**:
- Aguarde até o reset diário (meia-noite Pacific Time)
- Ou faça upgrade para tier pago: https://ai.google.dev/pricing

### Erro: "No image or text content in Gemini response"

**Causa**: O Gemini não conseguiu gerar uma imagem com o prompt fornecido.

**Solução**:
1. Tente com uma imagem diferente
2. Ajuste o prompt (ver seção abaixo)
3. Verifique se a imagem de entrada é válida

### Timeout após 5 minutos

**Causa**: A geração está demorando muito (raro com Gemini Flash).

**Solução**:
1. Reduza o tamanho da imagem de entrada
2. Verifique a conexão de rede
3. Tente novamente

## ✏️ Personalizar o Prompt

Por padrão, o sistema usa o prompt:
```
"Faz um desenho em single-line art com base nesta foto"
```

Para alterar, edite o arquivo:
**`src/components/AIImageGenerator.tsx`**, linha 84:

```typescript
const FIXED_PROMPT = "Seu novo prompt aqui";
```

### Exemplos de Prompts

```typescript
// Estilo aquarela
"Create a watercolor painting based on this photo"

// Estilo cartoon
"Transform this photo into a colorful cartoon illustration"

// Estilo minimalista
"Create a minimalist line drawing from this image"

// Estilo vintage
"Transform this into a vintage sepia-toned artistic photo"

// Arte abstrata
"Create an abstract geometric art piece inspired by this image"
```

**Dica**: Prompts em inglês tendem a funcionar melhor com o Gemini.

## 🔄 Atualizar a Edge Function

Quando fizer alterações no código da Edge Function:

```bash
# 1. Edite o arquivo
nano supabase/functions/generate-image-gemini/index.ts

# 2. Faça deploy novamente
supabase functions deploy generate-image-gemini

# 3. Verifique os logs
supabase functions logs generate-image-gemini --tail
```

## 📊 Monitoramento de Uso

Para monitorar o uso da API do Gemini:

1. Acesse: https://aistudio.google.com
2. Vá para a seção **"API Usage"** ou **"Quotas"**
3. Veja quantos requests você fez hoje
4. Configure alertas se necessário

## 🔒 Segurança

### Boas Práticas

✅ **FAÇA**:
- Mantenha a API Key apenas nos secrets do Supabase
- Use autenticação no frontend (já implementado)
- Monitore o uso da API regularmente
- Rotacione a API Key periodicamente

❌ **NÃO FAÇA**:
- Nunca coloque a API Key no código frontend (.env local)
- Nunca commite a API Key no Git
- Nunca compartilhe a API Key publicamente
- Não exponha a Edge Function sem autenticação

### Política de CORS

A Edge Function já está configurada com CORS para aceitar requests do seu domínio. Se precisar ajustar:

Edite `supabase/functions/generate-image-gemini/index.ts`:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://seu-dominio.com', // Seu domínio
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## 📚 Recursos Adicionais

- **Documentação Gemini API**: https://ai.google.dev/docs
- **Preços**: https://ai.google.dev/pricing
- **Playground**: https://aistudio.google.com
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Limites e Quotas**: https://ai.google.dev/models/gemini#model-variations

## 🎯 Próximos Passos

Depois de configurar a integração:

1. ✅ Teste a geração de imagens no backoffice
2. ✅ Salve imagens geradas no Supabase Storage
3. ✅ Use as URLs das imagens em produtos
4. 🔄 Ajuste os prompts conforme necessário
5. 📊 Monitore o uso da API

## 💡 Dicas de Otimização

1. **Comprima imagens antes do upload** para acelerar o processamento
2. **Use formatos eficientes** (WEBP > JPG > PNG)
3. **Implemente cache** para imagens já processadas (opcional)
4. **Configure rate limiting** para evitar abuso (se aplicação for pública)

---

**Última atualização**: 2025-11-19
**Versão do Gemini**: 2.5 Flash (gemini-2.0-flash-exp)
**Autor**: Claude Code
