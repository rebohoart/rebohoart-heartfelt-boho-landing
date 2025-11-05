# Como Instalar o GLM-4.6 (Guia Simples)

Este guia vai te ajudar a adicionar uma ferramenta chamada GLM-4.6 ao Claude Code. É um modelo de inteligência artificial que pode responder perguntas técnicas sobre programação.

## O que você precisa ter instalado antes

1. **Node.js** - Um programa que permite executar outros programas. Você pode verificar se já tem digitando `node --version` no terminal
2. **Claude Code** - Já deve estar instalado se você está lendo isto
3. **Uma chave de acesso ao GLM-4.6** - É como uma senha para usar o serviço

## PASSO 1: Conseguir a chave de acesso

1. Entre no site: https://open.bigmodel.cn/
2. Crie uma conta (ou faça login se já tiver)
3. Procure pela seção "API Keys" (Chaves de API)
4. Clique para criar uma nova chave
5. Copie essa chave e guarde num local seguro (como num arquivo de texto no seu computador)

⚠️ **ATENÇÃO**: Este serviço pode ser pago. Verifique os preços no site antes de usar.

## PASSO 2: Copiar e instalar o programa

Abra o terminal (ou prompt de comando no Windows) e digite:

```bash
# Para procurar o programa
npm search glm-mcp-server

# Para instalar
npm install -g glm-mcp-server
```

💡 **Se não funcionar**, existe outra forma de baixar, mas é mais complicada. Nesse caso, peça ajuda a alguém com mais experiência.

## PASSO 3: Adicionar ao Claude Code

Esta é a parte mais simples. No terminal, digite:

```bash
claude mcp add glm-4.6
```

O Claude vai fazer algumas perguntas. Responda assim:
- **Command**: digite `npx`
- **Args**: digite `glm-mcp-server`
- **Env vars**: digite `GLM_API_KEY=` e cole a chave que você guardou no Passo 1

## PASSO 4: Verificar se funcionou

1. Feche o Claude Code completamente
2. Abra novamente
3. No terminal, digite:
   ```bash
   claude mcp list
   ```
4. Você deve ver "glm-4.6" na lista

Se aparecer uma marca de ✓ (check) ao lado, está tudo certo!

## Como usar

Depois de tudo configurado, você pode conversar normalmente com o Claude. Quando necessário, ele vai consultar o GLM-4.6 automaticamente.

Você também pode pedir diretamente:
```
Claude, pergunte ao GLM-4.6 sobre [sua pergunta aqui]
```

## Se algo der errado

### Se aparecer "servidor não conecta"

1. Verifique se o Node.js está instalado digitando: `node --version`
2. Tente fechar e abrir o Claude Code novamente

### Se aparecer "chave inválida"

- Verifique se você copiou a chave corretamente (sem espaços extras)
- Entre no site da Zhipu AI e confirme que a chave está ativa

### Ainda não funciona?

1. Tente remover e adicionar novamente:
   ```bash
   claude mcp remove glm-4.6
   claude mcp add glm-4.6
   ```

2. Se continuar com problemas, peça ajuda a alguém com mais experiência técnica

## Links úteis

- Site oficial do GLM-4.6: https://open.bigmodel.cn/dev/api
- Documentação do Claude Code: https://docs.claude.com/en/docs/claude-code/mcp

## ⚠️ IMPORTANTE - Leia isto!

1. **Custos**: Este serviço pode cobrar pelo uso. Fique de olho no quanto você está usando.
2. **Segurança**: NUNCA compartilhe sua chave de acesso com ninguém. É como uma senha do banco.
3. **Privacidade**: As perguntas que você fizer serão enviadas para os servidores da Zhipu AI (a empresa que criou o GLM-4.6).

---

**Precisa de ajuda?** Peça para alguém com experiência em programação te auxiliar. Mostre este guia para essa pessoa.
