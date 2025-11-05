#!/bin/bash

# Script para auxiliar na configuração do GLM-4.6 MCP Server no Claude Code
# Uso: ./scripts/setup-glm-mcp.sh

set -e

echo "=========================================="
echo "GLM-4.6 MCP Server - Script de Instalação"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js não encontrado!${NC}"
    echo "Por favor, instale o Node.js (versão 16 ou superior)"
    echo "Visite: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js encontrado: $NODE_VERSION${NC}"
echo ""

# Verificar Claude Code
echo "Verificando Claude Code..."
if ! command -v claude &> /dev/null; then
    echo -e "${RED}✗ Claude Code não encontrado!${NC}"
    echo "Por favor, instale o Claude Code primeiro"
    exit 1
fi

echo -e "${GREEN}✓ Claude Code encontrado${NC}"
echo ""

# Solicitar API Key
echo -e "${YELLOW}Por favor, forneça sua API Key do GLM-4.6${NC}"
echo "Se você ainda não tem uma, visite: https://open.bigmodel.cn/"
echo ""
read -p "GLM API Key: " GLM_API_KEY

if [ -z "$GLM_API_KEY" ]; then
    echo -e "${RED}✗ API Key não fornecida. Abortando.${NC}"
    exit 1
fi

# Solicitar caminho do servidor
echo ""
echo -e "${YELLOW}Onde o servidor MCP do GLM-4.6 está instalado?${NC}"
echo "Opções:"
echo "1) Instalar via npm (globalmente)"
echo "2) Clonar do GitHub"
echo "3) Já tenho o servidor instalado (fornecer caminho)"
echo ""
read -p "Escolha (1-3): " INSTALL_OPTION

case $INSTALL_OPTION in
    1)
        echo ""
        echo "Tentando instalar via npm..."
        echo "Nota: O pacote pode não estar disponível no npm ainda"
        npm search glm-mcp-server
        echo ""
        read -p "Continuar com instalação npm? (s/n): " CONTINUE_NPM
        if [ "$CONTINUE_NPM" = "s" ]; then
            npm install -g glm-mcp-server
            MCP_PATH=$(npm root -g)/glm-mcp-server/build/index.js
        else
            echo "Instalação cancelada"
            exit 0
        fi
        ;;
    2)
        echo ""
        echo "Clonando do GitHub..."
        read -p "URL do repositório (ex: https://github.com/bobvasic/glm-mcp-server): " REPO_URL

        if [ -z "$REPO_URL" ]; then
            echo -e "${RED}✗ URL não fornecida. Abortando.${NC}"
            exit 1
        fi

        CLONE_DIR="$HOME/glm-mcp-server"
        echo "Clonando para: $CLONE_DIR"

        git clone "$REPO_URL" "$CLONE_DIR"
        cd "$CLONE_DIR"

        echo "Instalando dependências..."
        npm install

        echo "Fazendo build..."
        npm run build

        MCP_PATH="$CLONE_DIR/build/index.js"
        ;;
    3)
        echo ""
        read -p "Caminho completo para o build/index.js: " MCP_PATH

        if [ ! -f "$MCP_PATH" ]; then
            echo -e "${RED}✗ Arquivo não encontrado: $MCP_PATH${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}✗ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✓ Servidor localizado: $MCP_PATH${NC}"
echo ""

# Escolher escopo
echo "Escolha o escopo da configuração:"
echo "1) User (recomendado) - disponível em todos os projetos"
echo "2) Local - apenas este projeto"
echo "3) Project - compartilhado com a equipe via git"
echo ""
read -p "Escolha (1-3): " SCOPE_OPTION

case $SCOPE_OPTION in
    1) SCOPE="user" ;;
    2) SCOPE="local" ;;
    3) SCOPE="project" ;;
    *)
        echo -e "${RED}✗ Opção inválida${NC}"
        exit 1
        ;;
esac

# Detectar sistema operacional e arquivo de configuração
if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CONFIG_FILE="$HOME/.claude.json"
else
    # Windows
    CONFIG_FILE="$APPDATA/Claude/claude_desktop_config.json"
fi

echo ""
echo "Configuração será adicionada em: $CONFIG_FILE"
echo ""

# Criar backup
if [ -f "$CONFIG_FILE" ]; then
    BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup criado: $BACKUP_FILE${NC}"
fi

# Criar diretório se não existir
mkdir -p "$(dirname "$CONFIG_FILE")"

# Criar ou atualizar configuração
if [ ! -f "$CONFIG_FILE" ]; then
    # Arquivo não existe, criar novo
    cat > "$CONFIG_FILE" <<EOF
{
  "mcpServers": {
    "glm-4.6": {
      "command": "node",
      "args": ["$MCP_PATH"],
      "env": {
        "GLM_API_KEY": "$GLM_API_KEY"
      }
    }
  }
}
EOF
    echo -e "${GREEN}✓ Arquivo de configuração criado${NC}"
else
    # Arquivo existe, precisa adicionar/atualizar
    echo -e "${YELLOW}⚠ Arquivo de configuração já existe${NC}"
    echo "Por favor, adicione manualmente a seguinte configuração:"
    echo ""
    cat <<EOF
{
  "mcpServers": {
    "glm-4.6": {
      "command": "node",
      "args": ["$MCP_PATH"],
      "env": {
        "GLM_API_KEY": "$GLM_API_KEY"
      }
    }
  }
}
EOF
    echo ""
fi

# Se for project scope, criar .mcp.json
if [ "$SCOPE" = "project" ]; then
    cat > ".mcp.json" <<EOF
{
  "mcpServers": {
    "glm-4.6": {
      "command": "node",
      "args": ["$MCP_PATH"],
      "env": {
        "GLM_API_KEY": "\${GLM_API_KEY}"
      }
    }
  }
}
EOF

    # Criar .env.example
    cat > ".env.example" <<EOF
GLM_API_KEY=sua_api_key_aqui
EOF

    # Adicionar ao .gitignore
    if [ ! -f ".gitignore" ]; then
        echo ".env" > .gitignore
    elif ! grep -q "^\.env$" .gitignore; then
        echo ".env" >> .gitignore
    fi

    echo -e "${GREEN}✓ Arquivos .mcp.json e .env.example criados${NC}"
    echo -e "${YELLOW}⚠ IMPORTANTE: Crie um arquivo .env com sua API key (não comite no git!)${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Configuração concluída!${NC}"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Reinicie o Claude Code completamente"
echo "2. Execute: claude mcp list"
echo "3. Verifique se 'glm-4.6' está listado"
echo "4. Dentro do Claude Code, use /mcp para verificar conexão"
echo ""
echo "Para mais informações, consulte: GLM-MCP-INSTALLATION.md"
echo ""
