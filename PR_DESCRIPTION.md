# Pull Request: Fix - Melhorar tratamento de erros de quota da API Gemini

## 🎯 Objetivo

Resolver o erro 429 de quota da API Gemini com mensagens claras e específicas, distinguindo entre diferentes tipos de erro.

## 🔍 Problema Resolvido

O sistema estava mostrando erro genérico "quota excedida" quando na verdade a API não estava ativada no Google Cloud. Agora detecta corretamente 3 tipos de erro 429:

1. **🚫 API NÃO ATIVADA** (limit: 0 em free_tier)
   - Detecta quando "Generative Language API" não está ativada
   - Mensagem com instruções passo-a-passo
   - Toast de 20 segundos com link direto

2. **🚫 QUOTA DIÁRIA ESGOTADA** (após usar 2.000 imagens)
   - Detecta quando quota real foi consumida
   - Instruções para aguardar reset ou criar nova API Key
   - Toast de 15 segundos

3. **⏱️ RATE LIMIT TEMPORÁRIO** (15 req/min)
   - Detecta quando limite de velocidade foi atingido
   - Mostra tempo de espera específico extraído da resposta
   - Toast warning de 10 segundos

## 🛠️ Mudanças Técnicas

### Edge Function (`supabase/functions/generate-image-gemini/index.ts`)
- Parseia resposta de erro JSON do Gemini
- Extrai `RetryInfo.retryDelay` para saber quanto aguardar
- Detecta `QuotaFailure.violations` com "limit: 0"
- Verifica se erro contém "free_tier" para identificar API não ativada
- Mensagens de erro específicas e acionáveis
- Logs detalhados para debugging

### Frontend (`src/components/AIImageGenerator.tsx`)
- Detecta tipo de erro via string matching
- Toasts específicos (error vs warning) com durações apropriadas
- Extrai tempo de espera da mensagem de erro
- Logs no console para debugging
- UX melhorado com instruções claras

## 📚 Documentação Adicionada

### 1. `GEMINI_QUOTA_ERROR_FIX.md`
- Explicação completa do problema e solução
- Fluxogramas de como funciona cada tipo de erro
- 4 opções para resolver quota esgotada
- Tabela de limites do free tier
- Dicas de otimização de uso

### 2. `GEMINI_API_ACTIVATION_GUIDE.md`
- 3 métodos de ativação (AI Studio, Cloud Console, gcloud CLI)
- Como verificar se funcionou (curl + backoffice)
- FAQ completa
- Troubleshooting de problemas comuns
- Checklist final

### 3. `COMO_TESTAR_GEMINI_AI_STUDIO.md`
- Guia passo-a-passo para testar no Google AI Studio
- Interpretação de cada resultado possível
- Próximos passos baseado no resultado
- Tempo estimado: 5-10 minutos

### 4. Scripts de Teste
- **`test-gemini-api.sh`** (Linux/Mac): Script bash para teste rápido via curl
- **`test-gemini-api.bat`** (Windows): Script batch interativo
- **`verify-gemini-setup.sh`**: Script de verificação do setup

## ✅ Benefícios

- ✅ Usuários sabem exatamente o que fazer em cada situação
- ✅ Mensagens claras em português
- ✅ Links diretos para resolver problemas
- ✅ Logs detalhados facilitam debugging
- ✅ Scripts de teste para validar configuração
- ✅ Documentação completa para diferentes níveis técnicos

## 🧪 Como Testar

1. Execute o script de teste apropriado:
   - **Windows**: `test-gemini-api.bat`
   - **Linux/Mac**: `./test-gemini-api.sh`

2. Se API não estiver ativa, siga o guia: `GEMINI_API_ACTIVATION_GUIDE.md`

3. Teste no backoffice:
   - Acesse `/backoffice`
   - Aba "Geração de Imagens com IA"
   - Faça upload de uma imagem
   - Clique em "Gerar Nova Versão com IA"
   - Veja mensagem de erro específica (se houver)

## 📊 Limites do Free Tier (Confirmados)

| Recurso | Limite Grátis |
|---------|---------------|
| Imagens/dia | 500-1.500 |
| Requests/minuto | 15-60 |
| Custo | $0.00 |
| Billing necessário | NÃO |

## 🔗 Links Úteis

- Documentação Gemini: https://ai.google.dev/gemini-api/docs/image-generation
- API Keys: https://aistudio.google.com/app/apikey
- Cloud Console: https://console.cloud.google.com/apis/library
- Rate Limits: https://ai.google.dev/gemini-api/docs/rate-limits

---

**Resolves:** Erro 429 de quota da API Gemini agora tem mensagens claras e específicas, permitindo ao usuário entender exatamente o que fazer em cada situação.
