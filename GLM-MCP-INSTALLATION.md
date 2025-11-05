# Guia de Instalação: GLM-4.6 MCP Server no Claude Code

Este guia explica como integrar o GLM-4.6 (ChatGLM) ao Claude Code via Model Context Protocol (MCP).

## O que é este servidor MCP?

O **GLM-4.6 MCP Server** é uma ponte de protocolo que permite ao Claude Code consultar o modelo GLM-4.6 da Zhipu AI para:
- Arquitetura de sistemas distribuídos
- Padrões de microserviços
- Engenharia de escalabilidade
- Consultas técnicas avançadas

## Pré-requisitos

1. **Node.js** instalado (versão 16 ou superior)
2. **Claude Code** instalado e funcionando
3. **API Key do GLM-4.6** (da Zhipu AI)

## Passo 1: Obter API Key do GLM-4.6

Para usar o GLM-4.6, você precisa de uma API key da Zhipu AI:

1. Acesse o site oficial da Zhipu AI: https://open.bigmodel.cn/
2. Crie uma conta ou faça login
3. Navegue até a seção de API Keys
4. Gere uma nova API key para o GLM-4.6
5. Copie e guarde a chave em local seguro

**Nota:** A API do GLM-4.6 pode ter custos associados. Verifique os preços no site oficial.

## Passo 2: Instalar o Servidor MCP

### Opção A: Via NPM (se disponível)

```bash
# Procurar pelo pacote no npm
npm search glm-mcp-server

# Instalar globalmente
npm install -g glm-mcp-server
```

### Opção B: Clonar do GitHub

```bash
# Procurar o repositório
# O servidor está listado sob o autor "bobvasic" ou "cyberlinksec"
git clone https://github.com/[autor]/glm-mcp-server.git
cd glm-mcp-server

# Instalar dependências
npm install

# Build do projeto
npm run build
```

**Importante:** O repositório exato pode variar. Procure por:
- `bobvasic/glm-mcp-server`
- `cyberlinksec/glm-mcp-server`

## Passo 3: Configurar no Claude Code

Existem três formas de configurar servidores MCP no Claude Code:

### Método 1: Via Linha de Comando (Mais Fácil)

```bash
# Adicionar servidor MCP
claude mcp add glm-4.6

# O assistente irá perguntar:
# - Command: node (ou npx se instalado globalmente)
# - Args: caminho para o build/index.js
# - Env vars: GLM_API_KEY=sua_chave_aqui
```

### Método 2: Edição Direta do Arquivo de Configuração (Recomendado)

#### No macOS:
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### No Linux:
```bash
nano ~/.claude.json
```

#### No Windows:
```
notepad %APPDATA%\Claude\claude_desktop_config.json
```

Adicione a seguinte configuração:

```json
{
  "mcpServers": {
    "glm-4.6": {
      "command": "node",
      "args": ["/caminho/completo/para/glm-mcp-server/build/index.js"],
      "env": {
        "GLM_API_KEY": "sua_api_key_aqui"
      }
    }
  }
}
```

**Importante:** Substitua:
- `/caminho/completo/para/glm-mcp-server/build/index.js` pelo caminho real onde você clonou/instalou o servidor
- `sua_api_key_aqui` pela sua API key do GLM-4.6

### Método 3: Configuração por Projeto

Para compartilhar com a equipe, crie um arquivo `.mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "glm-4.6": {
      "command": "npx",
      "args": ["glm-mcp-server"],
      "env": {
        "GLM_API_KEY": "${GLM_API_KEY}"
      }
    }
  }
}
```

E adicione a variável de ambiente no `.env` (NÃO COMITE ESTE ARQUIVO):

```
GLM_API_KEY=sua_api_key_aqui
```

## Passo 4: Verificar Instalação

1. Reinicie o Claude Code completamente
2. Execute o comando:
   ```bash
   claude mcp list
   ```
3. Você deve ver o servidor `glm-4.6` listado
4. Dentro do Claude Code, use o comando `/mcp` para ver o status da conexão

Você deve ver algo como:
```
✓ glm-4.6: connected
```

## Passo 5: Usar o Servidor

Depois de configurado, o Claude Code pode automaticamente consultar o GLM-4.6 quando necessário. Você também pode solicitar explicitamente:

```
"Claude, consulte o GLM-4.6 sobre padrões de microserviços para e-commerce"
```

## Escopos de Configuração

Você pode configurar o servidor em três níveis:

1. **Local** (padrão): Apenas para o projeto atual
   ```bash
   claude mcp add glm-4.6 --scope local
   ```

2. **User**: Para todos os seus projetos
   ```bash
   claude mcp add glm-4.6 --scope user
   ```

3. **Project**: Para compartilhar com a equipe (commita no git)
   ```bash
   claude mcp add glm-4.6 --scope project
   ```

## Troubleshooting

### Servidor não conecta

1. Verifique se o Node.js está instalado:
   ```bash
   node --version
   ```

2. Verifique se o caminho para o arquivo está correto

3. Teste o servidor manualmente:
   ```bash
   node /caminho/para/build/index.js
   ```

### API Key inválida

- Verifique se a chave está correta
- Confirme que a chave tem permissões para o GLM-4.6
- Verifique se há créditos disponíveis na conta

### Servidor aparece como "failed"

1. Veja os logs do Claude Code
2. Verifique se todas as dependências foram instaladas (`npm install`)
3. Certifique-se de que o build foi executado (`npm run build`)

## Comandos Úteis

```bash
# Listar servidores MCP
claude mcp list

# Remover servidor
claude mcp remove glm-4.6

# Testar conexão
claude mcp get glm-4.6
```

## Recursos Adicionais

- **Model Context Protocol**: https://modelcontextprotocol.io/
- **GLM-4.6 Docs**: https://open.bigmodel.cn/dev/api
- **Claude Code MCP Docs**: https://docs.claude.com/en/docs/claude-code/mcp
- **LobeHub MCP Directory**: https://lobehub.com/mcp/

## Notas Importantes

1. **Custos**: A API do GLM-4.6 pode ter custos. Monitore seu uso.
2. **Rate Limits**: Respeite os limites de taxa da API.
3. **Segurança**: NUNCA comite sua API key no git. Use variáveis de ambiente.
4. **Privacidade**: Dados enviados ao GLM-4.6 são processados pela Zhipu AI.

## Alternativas

Se você não conseguir encontrar o servidor MCP específico do GLM-4.6, você pode:

1. **Usar via OpenRouter**: O GLM-4.6 está disponível no OpenRouter (https://openrouter.ai/z-ai/glm-4.6)
2. **Criar seu próprio servidor MCP**: Use a especificação MCP para criar um wrapper customizado
3. **Usar outros servidores MCP**: Existem dezenas de servidores MCP disponíveis para diferentes propósitos

---

**Dúvidas?** Consulte a documentação oficial do Claude Code ou abra uma issue no repositório do servidor MCP.
