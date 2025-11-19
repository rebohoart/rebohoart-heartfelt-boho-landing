#!/bin/bash

# Script de teste da API Gemini 2.5 Flash Image
# Substitua YOUR_API_KEY pela sua chave real

echo "🧪 Testando Gemini 2.5 Flash Image API..."
echo ""

# IMPORTANTE: Substitua pela sua API Key
API_KEY="YOUR_API_KEY"

if [ "$API_KEY" = "YOUR_API_KEY" ]; then
    echo "❌ ERRO: Você precisa substituir YOUR_API_KEY pela sua chave real!"
    echo ""
    echo "Edite este arquivo e coloque sua API Key na linha 7:"
    echo "API_KEY=\"sua_chave_aqui\""
    exit 1
fi

echo "📋 Configuração:"
echo "  • API Key: ${API_KEY:0:20}..."
echo "  • Modelo: gemini-2.5-flash-image"
echo "  • Endpoint: generativelanguage.googleapis.com"
echo ""
echo "⏳ Enviando requisição..."
echo ""

# Fazer requisição
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Generate a simple red circle"
      }]
    }],
    "generationConfig": {
      "responseModalities": ["IMAGE"]
    }
  }')

# Extrair status HTTP
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "📥 Resposta recebida:"
echo "  • Status HTTP: $http_status"
echo ""

# Analisar resultado
case $http_status in
  200)
    echo "✅ SUCESSO! A API está funcionando!"
    echo ""
    echo "🎉 Você TEM acesso ao free tier do Gemini 2.5 Flash Image!"
    echo ""
    echo "Resposta (primeiros 500 caracteres):"
    echo "$response_body" | head -c 500
    echo ""
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Ative a 'Generative Language API' no Google Cloud Console"
    echo "2. Configure a GEMINI_API_KEY no Supabase"
    echo "3. Aguarde 10-15 minutos"
    echo "4. Teste no backoffice"
    ;;

  400)
    echo "⚠️ ERRO 400 - Bad Request"
    echo ""
    echo "Possíveis causas:"
    echo "  • Formato da requisição incorreto"
    echo "  • Modelo não disponível"
    echo "  • Parâmetros inválidos"
    echo ""
    echo "Resposta completa:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    ;;

  401)
    echo "❌ ERRO 401 - Unauthorized"
    echo ""
    echo "Sua API Key é inválida ou expirou!"
    echo ""
    echo "Soluções:"
    echo "1. Verifique se copiou a API Key corretamente"
    echo "2. Crie nova API Key em: https://aistudio.google.com/app/apikey"
    echo "3. Certifique-se que não tem espaços extras"
    ;;

  403)
    echo "❌ ERRO 403 - Forbidden"
    echo ""
    echo "API Key válida mas sem permissão!"
    echo ""
    echo "Possíveis causas:"
    echo "  • API não ativada no projeto"
    echo "  • Restrições de região"
    echo "  • Requer billing ativado"
    echo ""
    echo "Resposta:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    ;;

  429)
    echo "⚠️ ERRO 429 - Rate Limit / Quota Exceeded"
    echo ""

    # Verificar se é free_tier com limit: 0
    if echo "$response_body" | grep -q "free_tier.*limit: 0"; then
        echo "🚫 API NÃO ATIVADA"
        echo ""
        echo "A 'Generative Language API' não está ativada no seu projeto!"
        echo ""
        echo "📋 Como ativar (GRÁTIS - 500 imagens/dia):"
        echo "1. Acesse: https://console.cloud.google.com/apis/library"
        echo "2. Busque: 'Generative Language API'"
        echo "3. Clique em 'ENABLE'"
        echo "4. Aguarde 10-15 minutos"
        echo "5. Execute este script novamente"
    else
        echo "⏱️ QUOTA EXCEDIDA OU RATE LIMIT"
        echo ""
        echo "Você atingiu o limite de requisições."
        echo ""
        echo "Verifique seu uso em: https://ai.dev/usage"
    fi
    echo ""
    echo "Resposta completa:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    ;;

  500|503)
    echo "⚠️ ERRO $http_status - Erro do Servidor"
    echo ""
    echo "O servidor do Google está com problemas."
    echo "Aguarde alguns minutos e tente novamente."
    ;;

  *)
    echo "❓ ERRO DESCONHECIDO - Status: $http_status"
    echo ""
    echo "Resposta completa:"
    echo "$response_body"
    ;;
esac

echo ""
echo "---"
echo "📚 Documentação: https://ai.google.dev/gemini-api/docs/image-generation"
echo "🔑 API Keys: https://aistudio.google.com/app/apikey"
echo "☁️ Cloud Console: https://console.cloud.google.com/apis/library"
