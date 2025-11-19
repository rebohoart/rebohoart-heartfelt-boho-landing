# 🔧 Correção: Tratamento de Erros de Quota da API Gemini

## Problema Resolvido

O sistema agora distingue corretamente entre dois tipos de erros 429 da API Gemini:

1. **Quota Diária Esgotada** (limit: 0) - Não pode retry, precisa aguardar reset
2. **Rate Limiting Temporário** (15 RPM) - Pode retry após alguns segundos

## Melhorias Implementadas

### 1. Edge Function (`supabase/functions/generate-image-gemini/index.ts`)

#### Detecção Inteligente de Erro 429

O código agora:
- ✅ Parseia a resposta de erro da API Gemini
- ✅ Extrai o `retryDelay` do campo `RetryInfo`
- ✅ Detecta se é quota esgotada (limit: 0) ou rate limiting
- ✅ Fornece mensagens específicas para cada caso

```typescript
// Exemplo de detecção
const quotaFailure = errorDetails?.error?.details?.find(
  (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
);

if (quotaFailure?.violations) {
  const hasZeroLimit = quotaFailure.violations.some((v: any) => {
    const message = errorDetails?.error?.message || '';
    return message.includes('limit: 0');
  });

  isQuotaExhausted = hasZeroLimit;
}
```

#### Mensagens de Erro Específicas

**Quota Diária Esgotada:**
```
🚫 QUOTA DIÁRIA ESGOTADA

A API Key do Gemini atingiu o limite diário de requisições (2.000 imagens/dia grátis).

📋 O QUE FAZER:

1. ⏰ Aguarde o reset da quota:
   • A quota reseta diariamente às 00:00 UTC (21:00 horário de Brasília)
   • Verifique seu uso em: https://ai.dev/usage?tab=rate-limit

2. 💳 Ou faça upgrade para plano pago:
   • Acesse: https://ai.google.dev/pricing
   • Custo após limite grátis: ~$0.039 por imagem

3. 🔑 Ou use outra API Key:
   • Crie uma nova em: https://aistudio.google.com/app/apikey
   • Configure no Supabase Dashboard → Edge Functions → Secrets

💡 DICA: Planeje o uso para não exceder 2.000 gerações por dia no tier gratuito.
```

**Rate Limiting Temporário:**
```
⏱️ RATE LIMIT TEMPORÁRIO

Muitas requisições em curto período. A API do Gemini tem limite de 15 requisições por minuto no tier gratuito.

📋 O QUE FAZER:

1. ⏰ Aguarde 4s e tente novamente
2. 📊 Evite múltiplas gerações simultâneas
3. 💳 Considere upgrade para limites maiores: https://ai.google.dev/pricing

💡 A requisição será bem-sucedida se você aguardar o tempo indicado.
```

### 2. Frontend (`src/components/AIImageGenerator.tsx`)

#### Toasts Específicos

O frontend agora mostra toasts diferentes baseados no tipo de erro:

**Quota Esgotada:**
```typescript
toast.error(
  "Quota diária do Gemini esgotada (2.000 imagens/dia grátis). " +
  "Aguarde o reset às 00:00 UTC ou configure nova API Key.",
  { duration: 15000 }
);
```

**Rate Limiting:**
```typescript
toast.warning(
  `Rate limit atingido. Aguarde ${waitTimeStr} e tente novamente. ` +
  `Limite: 15 requisições/minuto no tier gratuito.`,
  { duration: 10000 }
);
```

#### Extração do Tempo de Espera

```typescript
const waitTimeMatch = errorMessage.match(/Aguarde (\d+s|\d+ segundos)/);
const waitTimeStr = waitTimeMatch ? waitTimeMatch[1] : '60 segundos';
```

## Como Funciona

### Fluxo de Erro com Quota Esgotada

```
1. Frontend envia requisição → Edge Function
2. Edge Function chama Gemini API
3. Gemini retorna 429 com:
   {
     "error": {
       "code": 429,
       "message": "...limit: 0...",
       "details": [
         {
           "@type": "type.googleapis.com/google.rpc.QuotaFailure",
           "violations": [...]
         },
         {
           "@type": "type.googleapis.com/google.rpc.RetryInfo",
           "retryDelay": "4s"
         }
       ]
     }
   }

4. Edge Function detecta "limit: 0"
5. Edge Function lança erro específico: "🚫 QUOTA DIÁRIA ESGOTADA"
6. Frontend captura erro
7. Frontend detecta "QUOTA DIÁRIA ESGOTADA"
8. Frontend mostra toast com instruções claras
9. Frontend loga erro completo no console para debug
```

### Fluxo de Erro com Rate Limiting

```
1. Frontend envia múltiplas requisições rapidamente
2. Gemini retorna 429 mas sem "limit: 0"
3. Edge Function detecta rate limiting temporário
4. Edge Function extrai "retryDelay": "4s"
5. Edge Function lança erro: "⏱️ RATE LIMIT TEMPORÁRIO...Aguarde 4s"
6. Frontend extrai "4s" da mensagem
7. Frontend mostra toast: "Aguarde 4s e tente novamente"
8. Usuário pode tentar novamente após aguardar
```

## Limites da API Gemini (Free Tier)

| Métrica | Limite | Reset |
|---------|--------|-------|
| **Imagens/dia** | 2.000 | 00:00 UTC diária |
| **Requisições/minuto (RPM)** | 15 | A cada minuto |
| **Input tokens/minuto** | Variável | A cada minuto |

## Como Resolver o Erro Atual

Baseado no erro que você mostrou, a quota está completamente esgotada (limit: 0 em todas as métricas). Para resolver:

### Opção 1: Aguardar o Reset (GRÁTIS)
- A quota reseta às **00:00 UTC** (21:00 Brasília)
- Verifique o horário atual e aguarde o reset
- Monitore uso em: https://ai.dev/usage?tab=rate-limit

### Opção 2: Usar Nova API Key (GRÁTIS)
1. Acesse: https://aistudio.google.com/app/apikey
2. Crie uma nova API Key em um projeto diferente
3. Configure no Supabase:
   ```bash
   supabase secrets set GEMINI_API_KEY=AIzaSy_nova_key_aqui
   ```
4. Re-deploy da Edge Function:
   ```bash
   supabase functions deploy generate-image-gemini
   ```

### Opção 3: Fazer Upgrade (PAGO)
1. Acesse: https://ai.google.dev/pricing
2. Configure billing no Google Cloud
3. Custo: ~$0.039 por imagem após o tier gratuito
4. Limites maiores: 1000 RPM, sem limite diário

### Opção 4: Otimizar Uso (RECOMENDADO)

**Evitar Desperdício:**
- ❌ Não faça múltiplas gerações da mesma imagem
- ❌ Evite testes repetidos com a mesma imagem
- ✅ Planeje o uso: 2.000 imagens/dia = ~83 imagens/hora
- ✅ Implemente cache no frontend para imagens já geradas
- ✅ Adicione confirmação antes de gerar ("Tem certeza?")

**Adicionar Rate Limiting no Frontend:**
```typescript
// Exemplo: Limitar a 10 gerações por hora por usuário
const MAX_GENERATIONS_PER_HOUR = 10;
const userGenerations = localStorage.getItem('gemini_generations_hour') || 0;

if (userGenerations >= MAX_GENERATIONS_PER_HOUR) {
  toast.error("Limite de gerações por hora atingido. Aguarde...");
  return;
}
```

## Logs para Debug

### Verificar Logs da Edge Function

**Via Supabase Dashboard:**
1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Edge Functions → `generate-image-gemini` → Logs

Procure por:
```
🚫 [requestId] ERRO DE QUOTA: A chave API do Gemini atingiu o limite
📊 [requestId] Quota completamente esgotada: true
⏱️ [requestId] Retry sugerido após: 4s
```

**Via CLI:**
```bash
supabase functions logs generate-image-gemini --tail
```

### Verificar Console do Navegador

Procure por:
```javascript
🚫 QUOTA DIÁRIA ESGOTADA
⏱️ RATE LIMIT TEMPORÁRIO DETECTADO
```

## Testes

### Testar Error Handling

Para testar se o tratamento de erro está funcionando sem esgotar quota:

1. **Simular Rate Limiting:**
   - Faça 16 requisições seguidas em menos de 1 minuto
   - Deve mostrar: "⏱️ RATE LIMIT TEMPORÁRIO"

2. **Verificar Mensagens:**
   - Erros devem ser claros e específicos
   - Toasts devem indicar próximos passos
   - Console deve ter informações detalhadas

## Próximas Melhorias (Opcional)

1. **Automatic Retry com Exponential Backoff:**
   ```typescript
   async function generateWithRetry(maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await generate();
       } catch (error) {
         if (isRateLimited && i < maxRetries - 1) {
           await sleep(Math.pow(2, i) * 1000);
           continue;
         }
         throw error;
       }
     }
   }
   ```

2. **Quota Dashboard:**
   - Mostrar uso diário no backoffice
   - Alerta quando próximo do limite
   - Contador de gerações restantes

3. **Cache de Imagens:**
   - Detectar imagens já processadas
   - Evitar regerar a mesma imagem
   - Usar hash da imagem como chave

## Conclusão

✅ **Problema resolvido:** O sistema agora distingue entre quota esgotada e rate limiting

✅ **Mensagens claras:** Usuários sabem exatamente o que fazer em cada caso

✅ **Logs detalhados:** Facilita debugging e monitoramento

✅ **User-friendly:** Toasts com instruções específicas e tempos de espera

Para o erro atual (quota esgotada), siga a **Opção 1** (aguardar reset) ou **Opção 2** (nova API Key).

---

**Data:** 2025-11-19
**Versão:** 1.0
**Modelo:** gemini-2.5-flash-image
