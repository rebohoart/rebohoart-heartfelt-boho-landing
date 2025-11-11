# 🤖 Guia de Configuração n8n - Transformação de Imagens com IA

Este guia explica como configurar a integração com n8n para transformar imagens usando inteligência artificial no backoffice da Rebohoart.

## 📋 Pré-requisitos

- Conta n8n (self-hosted ou n8n Cloud)
- API key de um serviço de IA image-to-image (ex: DALL-E, Stable Diffusion, Replicate, etc.)
- Acesso ao backoffice da Rebohoart

## 🔧 Passo 1: Criar Workflow n8n

### 1.1 Estrutura Básica do Workflow

Crie um novo workflow no n8n com a seguinte estrutura:

```
Webhook → Processar Imagem Base64 → Gerar Nova Imagem com IA → Responder
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
  "image": "iVBORw0KGgoAAAANSUhEUgAA...",
  "filename": "produto.jpg",
  "mimeType": "image/jpeg",
  "timestamp": "2025-01-10T12:00:00Z"
}
```

**Nota:** O campo `image` contém a imagem em formato **base64** (sem o prefixo `data:image/...;base64,`).

#### Nó 2: Decodificar Base64 e Preparar Imagem
- **Tipo**: `Code`
- **Função**: Converter base64 para buffer ou criar data URI para a API de IA

Exemplo de código (JavaScript):
```javascript
// Reconstruir data URI com base64
const base64Image = $input.item.json.image;
const mimeType = $input.item.json.mimeType || 'image/jpeg';
const dataUri = `data:${mimeType};base64,${base64Image}`;

// Prompt fixo configurável (altere conforme necessário)
const FIXED_PROMPT = "Transform this into a beautiful boho-style product photo with natural lighting, warm earth tones, and artistic composition";

return {
  json: {
    imageDataUri: dataUri,
    base64Image: base64Image,
    prompt: FIXED_PROMPT,
    mimeType: mimeType
  }
};
```

#### Nó 3: Gerar Nova Imagem com IA
Escolha um dos serviços abaixo conforme o seu template:

##### Opção A: DALL-E 2 Edit (OpenAI)
Para editar/transformar uma imagem existente:

- **Tipo**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://api.openai.com/v1/images/edits`
- **Authentication**: `Header Auth`
  - **Name**: `Authorization`
  - **Value**: `Bearer SUA_API_KEY_OPENAI`
- **Body Type**: `Form-Data (multipart/form-data)`
- **Fields**:
  - `image`: Binary data da imagem
  - `prompt`: `={{ $json.prompt }}`
  - `n`: `1`
  - `size`: `1024x1024`

##### Opção B: Stable Diffusion img2img (Replicate)
Para transformar imagem com Stable Diffusion:

- **Tipo**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://api.replicate.com/v1/predictions`
- **Authentication**: `Header Auth`
  - **Name**: `Authorization`
  - **Value**: `Bearer SUA_API_KEY_REPLICATE`
- **Body (JSON)**:
```json
{
  "version": "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
  "input": {
    "image": "={{ $json.imageDataUri }}",
    "prompt": "={{ $json.prompt }}",
    "negative_prompt": "ugly, blurry, low quality, distorted",
    "strength": 0.8,
    "num_inference_steps": 50
  }
}
```

##### Opção C: InstantID ou ControlNet (Replicate)
Para manter estrutura/pose da imagem:

- **Tipo**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://api.replicate.com/v1/predictions`
- **Body (JSON)**:
```json
{
  "version": "MODELO_ID",
  "input": {
    "image": "={{ $json.imageDataUri }}",
    "prompt": "={{ $json.prompt }}",
    "control_type": "canny",
    "num_inference_steps": 30
  }
}
```

##### Opção D: Leonardo.ai Image-to-Image
Se usar Leonardo.ai, configure conforme a API deles.

**Nota:** Para alguns serviços, pode ser necessário aguardar o processamento (polling) se a geração for assíncrona.

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

## 🎨 Dicas para Configurar o Prompt Fixo

Como o workflow usa um **prompt fixo** que você configura no n8n, escolha um prompt que funcione bem para transformar diferentes tipos de imagens de produto. Aqui estão sugestões:

### Prompts Fixos Recomendados:

**1. Para estilo Boho Geral:**
```
Transform this into a beautiful boho-style product photo with natural lighting, warm earth tones, artistic composition, soft shadows, and an elegant aesthetic. Professional photography quality.
```

**2. Para Fundo Limpo e Minimalista:**
```
Professional product photography with clean white background, soft natural lighting, studio quality, minimalist composition, high resolution, commercial photography style.
```

**3. Para Ambiente Natural/Lifestyle:**
```
Product styled in a natural boho environment with warm earth tones, natural textures, soft lighting, cozy atmosphere, artisanal aesthetic, rustic elements, professional lifestyle photography.
```

**4. Para Manter Estrutura mas Melhorar Estilo:**
```
Enhance this product photo with boho aesthetic, improve lighting and colors, add warm earth tones, maintain product structure, professional photography quality, artistic composition.
```

### Parâmetros Importantes (img2img):

- **Strength (0.0-1.0)**:
  - `0.3-0.5`: Mudanças sutis, mantém muito da imagem original
  - `0.6-0.8`: Transformação moderada (recomendado)
  - `0.9-1.0`: Transformação radical, pode perder características originais

- **Negative Prompt** (o que evitar):
```
ugly, blurry, low quality, distorted, deformed, bad proportions, watermark, text, signature, amateur, pixelated
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
