#!/bin/bash
# Script para criar o ficheiro .env no Lovable

echo "🔧 A criar ficheiro .env..."

cat > .env << 'EOF'
# 🔑 CONFIGURAÇÃO DO SUPABASE
#
# ⚠️ IMPORTANTE: Substitui os valores abaixo pelas tuas credenciais reais
#
# 📍 Como obter:
# 1. Acede a: https://app.supabase.com
# 2. Seleciona o teu projeto
# 3. Vai a: Settings → API
# 4. Copia os valores e substitui aqui em baixo

# Project URL (exemplo: https://abcdefghijklmnop.supabase.co)
VITE_SUPABASE_URL=SUBSTITUI_AQUI_PELO_TEU_URL

# Anon/Public Key (exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
VITE_SUPABASE_PUBLISHABLE_KEY=SUBSTITUI_AQUI_PELA_TUA_KEY
EOF

echo "✅ Ficheiro .env criado com sucesso!"
echo ""
echo "📝 Próximo passo:"
echo "   Edita o ficheiro .env e substitui os valores pelos teus"
echo "   Depois guarda o ficheiro e o Lovable vai recarregar automaticamente"
