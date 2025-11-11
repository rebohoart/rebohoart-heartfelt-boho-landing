# 🤖 Guia de Configuração n8n - Geração de Imagens IA

Este guia explica como configurar a integração com n8n para gerar imagens com inteligência artificial no backoffice da Rebohoart.

## 📋 Pré-requisitos

- Conta n8n (self-hosted ou n8n Cloud)
- API key de um serviço de geração de imagens IA (ex: DALL-E, Midjourney, Stable Diffusion, etc.)
- Acesso ao backoffice da Rebohoart

## 🔧 Passo 1: Criar Workflow n8n

### 1.1 Estrutura Básica do Workflow

Crie um novo workflow no n8n com a seguinte estrutura:

```
Webhook → Processar Prompt → Gerar Imagem → Responder
```

### 1.2 Configuração dos Nós

#### Nó 1: Webhook
- **Tipo**: `Webhook`
- **HTTP Method**: `POST`
- **Path**: `gerar-imagem` (ou o que preferir)
- **Response Mode**: `Last Node`
- **Response Data**: `No Response Body`

Exemplo de dados recebidos:
```json
{
  "prompt": "Uma tigela de cerâmica artesanal...",
  "timestamp": "2025-01-10T12:00:00Z"
}
```

#### Nó 2: Processar Prompt (Opcional)
- **Tipo**: `Code` ou `Set`
- **Função**: Validar, limpar ou enriquecer o prompt
- Exemplo de código (JavaScript):

```javascript
// Adicionar estilo padrão ao prompt
const prompt = $input.item.json.prompt;
const enhancedPrompt = `${prompt}, high quality, professional photography, natural lighting, boho aesthetic`;

return {
  json: {
    prompt: enhancedPrompt
  }
};
```

#### Nó 3: Gerar Imagem
Escolha um dos serviços abaixo:

##### Opção A: DALL-E 3 (OpenAI)
- **Tipo**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://api.openai.com/v1/images/generations`
- **Authentication**: `Header Auth`
  - **Name**: `Authorization`
  - **Value**: `Bearer SUA_API_KEY_OPENAI`
- **Body (JSON)**:
```json
{
  "model": "dall-e-3",
  "prompt": "={{ $json.prompt }}",
  "n": 1,
  "size": "1024x1024",
  "quality": "standard"
}
```

##### Opção B: Stable Diffusion (Replicate)
- **Tipo**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://api.replicate.com/v1/predictions`
- **Authentication**: `Header Auth`
  - **Name**: `Authorization`
  - **Value**: `Bearer SUA_API_KEY_REPLICATE`
- **Body (JSON)**:
```json
{
  "version": "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
  "input": {
    "prompt": "={{ $json.prompt }}",
    "negative_prompt": "ugly, blurry, low quality",
    "width": 1024,
    "height": 1024
  }
}
```

##### Opção C: Outros serviços
- Leonardo.ai
- Midjourney (via API não oficial)
- Stability AI
- Hugging Face

#### Nó 4: Extrair URL da Imagem
- **Tipo**: `Code`
- **Função**: Extrair a URL da imagem da resposta da API

Exemplo para DALL-E:
```javascript
// DALL-E retorna: { data: [{ url: "https://..." }] }
const imageUrl = $input.item.json.data[0].url;

return {
  json: {
    image_url: imageUrl,
    success: true
  }
};
```

Exemplo para Stable Diffusion:
```javascript
// Replicate pode retornar array de URLs
const imageUrl = $input.item.json.output[0];

return {
  json: {
    image_url: imageUrl,
    success: true
  }
};
```

#### Nó 5: Responder ao Webhook
- **Tipo**: `Respond to Webhook`
- **Response Mode**: `Using Fields Below`
- **Response Data**: `JSON`
- **Body**:
```json
{
  "image_url": "={{ $json.image_url }}",
  "success": true
}
```

### 1.3 Tratamento de Erros

Adicione um nó de erro para capturar falhas:

- **Tipo**: `Error Trigger`
- Conecte a um nó `Respond to Webhook` com:
```json
{
  "success": false,
  "error": "Erro ao gerar imagem",
  "message": "={{ $json.message }}"
}
```

## 🔗 Passo 2: Obter URL do Webhook

1. No n8n, **ative o workflow** (toggle no canto superior direito)
2. Clique no nó **Webhook**
3. Copie a **Production URL** (ou Test URL para desenvolvimento)
   - Exemplo: `https://seu-n8n.app.n8n.cloud/webhook/gerar-imagem`

## ⚙️ Passo 3: Configurar no Projeto Rebohoart

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione/atualize a variável:
   ```env
   VITE_N8N_WEBHOOK_URL=https://seu-n8n.app.n8n.cloud/webhook/gerar-imagem
   ```
3. Salve o arquivo
4. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🧪 Passo 4: Testar a Integração

1. Acesse o backoffice: `http://localhost:8080/backoffice`
2. Faça login como admin
3. Vá até a aba **"Geração IA"**
4. Insira um prompt de teste:
   ```
   Uma tigela de cerâmica artesanal com padrões boho em tons terrosos, sobre uma mesa de madeira rústica com luz natural suave
   ```
5. Clique em **"Gerar Imagem com IA"**
6. Aguarde a geração (pode levar 10-30 segundos)
7. A imagem deve aparecer abaixo do formulário

### Verificação de Logs

No n8n, vá em **Executions** para ver os logs e debugar erros.

## 💾 Funcionalidades

### 1. Gerar Imagem
- Insira descrição detalhada
- Clique em "Gerar Imagem com IA"
- Aguarde processamento

### 2. Guardar no Armazenamento
- Após gerar, clique em "Guardar no Armazenamento"
- A imagem será salva no Supabase Storage
- URL será atualizada para a versão permanente

### 3. Baixar Imagem
- Clique em "Baixar Imagem" para download local

### 4. Usar em Produtos
- Copie a URL da imagem
- Use ao criar/editar produtos na aba "Produtos"

## 🎨 Dicas para Melhores Resultados

1. **Seja específico**: Descreva cores, materiais, ambiente
2. **Inclua estilo**: "boho", "rústico", "natural"
3. **Mencione iluminação**: "luz natural", "golden hour", "soft lighting"
4. **Adicione detalhes**: texturas, padrões, composição
5. **Evite negações**: Em vez de "sem fundo", use "fundo branco limpo"

### Exemplos de Prompts Eficazes:

**Para produtos:**
```
Tapete de palha artesanal com padrão geométrico boho em tons creme e terracota, vista de cima, sobre piso de madeira clara, luz natural difusa, fotografia profissional
```

**Para ambiente:**
```
Sala de estar boho com sofá de linho bege, almofadas com estampas étnicas, tapete juta, plantas tropicais, parede terracota, janela grande com luz natural suave, fotografia interior de revista
```

**Para detalhes:**
```
Close-up macro de textura de cerâmica artesanal com acabamento rústico em tons de areia e marrom, pequenas imperfeições naturais, fundo desfocado neutro, luz lateral suave
```

## 🔒 Segurança

⚠️ **Importante:**

- **Nunca commit** o arquivo `.env` com API keys reais
- Use **variáveis de ambiente** no n8n para armazenar API keys
- Configure **CORS** no n8n se necessário
- Considere adicionar **autenticação** ao webhook para produção
- Limite a **taxa de requisições** para evitar custos excessivos

## 🐛 Resolução de Problemas

### Erro: "URL do webhook n8n não configurada"
- Verifique se `VITE_N8N_WEBHOOK_URL` está no `.env`
- Reinicie o servidor de desenvolvimento

### Erro: "Imagem não encontrada na resposta"
- Verifique a estrutura da resposta do n8n
- Ajuste o código que extrai a URL no Nó 4
- Verifique logs no n8n (Executions)

### Imagem não carrega
- Verifique CORS do serviço de IA
- Tente copiar a URL e abrir em nova aba
- Verifique se a URL é pública e acessível

### Timeout/Erro de rede
- Aumente timeout no n8n
- Verifique conexão com internet
- API key válida e com créditos

## 💰 Custos Estimados

| Serviço | Custo por Imagem | Qualidade | Velocidade |
|---------|------------------|-----------|------------|
| DALL-E 3 Standard | ~$0.040 | Alta | Rápida |
| DALL-E 3 HD | ~$0.080 | Muito Alta | Rápida |
| Stable Diffusion | ~$0.002-0.01 | Alta | Média |
| Leonardo.ai | ~$0.01 | Alta | Rápida |

## 📚 Recursos Adicionais

- [Documentação n8n](https://docs.n8n.io/)
- [OpenAI DALL-E API](https://platform.openai.com/docs/guides/images)
- [Replicate Stable Diffusion](https://replicate.com/stability-ai/stable-diffusion)
- [Guia de Prompts](https://prompthero.com/)

## 🆘 Suporte

Se encontrar problemas, verifique:
1. Logs no n8n (Executions)
2. Console do navegador (F12)
3. Variáveis de ambiente configuradas corretamente
4. API keys válidas e com créditos

---

**Desenvolvido para Rebohoart** 🌿
Integração n8n + IA para geração de imagens de produtos artesanais
