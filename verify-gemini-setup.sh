#!/bin/bash

# Script para verificar status da API Gemini
# Execute para ver se a ativação está funcionando

echo "🔍 Verificando status da API Gemini 2.5 Flash Image..."
echo ""

# Verificar se tem a API Key configurada no Supabase
echo "📋 Passo 1: Verificar se GEMINI_API_KEY está no Supabase"
echo ""
echo "Acesse: https://app.supabase.com"
echo "→ Seu projeto → Edge Functions → Manage secrets"
echo "→ Verifique se 'GEMINI_API_KEY' está listada"
echo ""
read -p "A GEMINI_API_KEY está configurada no Supabase? (s/n): " has_key

if [ "$has_key" != "s" ]; then
    echo ""
    echo "❌ Configure primeiro a API Key no Supabase:"
    echo "   supabase secrets set GEMINI_API_KEY=sua_chave_aqui"
    exit 1
fi

echo ""
echo "📋 Passo 2: Verificar qual projeto a API Key pertence"
echo ""
echo "1. Acesse: https://aistudio.google.com/app/apikey"
echo "2. Clique na sua API Key"
echo "3. Veja o nome do projeto (ex: 'My First Project')"
echo ""
read -p "Qual o nome do projeto? " project_name

echo ""
echo "📋 Passo 3: Verificar se API está ativa no projeto correto"
echo ""
echo "1. Acesse: https://console.cloud.google.com/apis/dashboard"
echo "2. No topo, verifique se o projeto selecionado é: $project_name"
echo "3. Procure por 'Generative Language API' na lista"
echo ""
read -p "A API aparece como 'Enabled' nesse projeto? (s/n): " is_enabled

if [ "$is_enabled" != "s" ]; then
    echo ""
    echo "❌ A API não está ativa no projeto correto!"
    echo ""
    echo "Solução:"
    echo "1. No Cloud Console, selecione o projeto: $project_name"
    echo "2. Vá para: https://console.cloud.google.com/apis/library"
    echo "3. Busque: 'Generative Language API'"
    echo "4. Clique em 'ENABLE'"
    exit 1
fi

echo ""
echo "📋 Passo 4: Verificar há quanto tempo foi ativada"
echo ""
read -p "Ativou há mais de 15 minutos? (s/n): " waited

if [ "$waited" != "s" ]; then
    echo ""
    echo "⏰ Aguarde pelo menos 15 minutos após ativar"
    echo "   A propagação pode demorar um pouco"
    echo ""
    echo "Enquanto aguarda, você pode:"
    echo "1. Testar no Google AI Studio: https://aistudio.google.com"
    echo "2. Verificar logs do Supabase"
    echo ""
    exit 0
fi

echo ""
echo "✅ Tudo parece correto!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Re-deploy da Edge Function (força refresh):"
echo "   supabase functions deploy generate-image-gemini"
echo ""
echo "2. Teste no backoffice:"
echo "   - Acesse /backoffice"
echo "   - Aba 'Geração de Imagens com IA'"
echo "   - Faça upload de uma imagem"
echo "   - Clique em 'Gerar'"
echo ""
echo "3. Verifique os logs:"
echo "   - Abra o console do navegador (F12)"
echo "   - Ou veja logs do Supabase: https://app.supabase.com"
echo "   - Edge Functions → generate-image-gemini → Logs"
echo ""
echo "4. Se ainda der erro 429 com 'limit: 0':"
echo "   - Copie o erro completo dos logs"
echo "   - Verifique se menciona 'free_tier'"
echo "   - Compartilhe o erro para análise"
echo ""
