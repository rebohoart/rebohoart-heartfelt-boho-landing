# 🔄 Sincronização Automática com Git

Este documento explica como manter os arquivos do seu PC sempre atualizados com a última versão do repositório Git, sem precisar fazer `git pull` manualmente.

## 🎯 Solução Implementada

Foi criado um script (`auto-sync-git.mjs`) que:
- ✅ Monitora o repositório remoto automaticamente
- ✅ Verifica se há novas versões a cada 30 segundos
- ✅ Faz `git pull` automaticamente quando detecta mudanças
- ✅ Mantém seus arquivos locais sempre atualizados

## 🚀 Como Usar

### Opção 1: Executar o script de sincronização

Em um terminal separado, execute:

```bash
npm run dev:sync
```

Deixe este terminal rodando em background. Sempre que houver mudanças no repositório remoto, o script irá baixar automaticamente.

### Opção 2: Executar junto com o servidor de desenvolvimento

Você pode rodar ambos ao mesmo tempo em terminais separados:

**Terminal 1 - Servidor de desenvolvimento:**
```bash
npm run dev
```

**Terminal 2 - Sincronização Git:**
```bash
npm run dev:sync
```

## 📋 O que o script faz

1. **Verifica a cada 30 segundos** se há mudanças no branch remoto
2. **Compara** o commit local com o commit remoto
3. **Se houver diferenças**, automaticamente:
   - Mostra qual versão está local e remota
   - Faz `git pull` para baixar as mudanças
   - Atualiza seus arquivos locais
4. **Se não houver mudanças**, apenas mostra um "✓" para indicar que está ativo

## 🎛️ Configuração

Para alterar o intervalo de verificação, edite o arquivo `auto-sync-git.mjs`:

```javascript
const CHECK_INTERVAL = 30000; // 30 segundos (em milissegundos)
```

Valores sugeridos:
- `15000` = 15 segundos (verificação mais frequente)
- `60000` = 1 minuto (verificação mais espaçada)
- `300000` = 5 minutos (verificação ocasional)

## 🛑 Como Parar

Para parar o script de sincronização, pressione `Ctrl+C` no terminal onde ele está rodando.

## 💡 Dicas

- **Use terminais separados** para facilitar o gerenciamento
- **No Windows**, use dois prompts CMD ou PowerShell
- **No Linux/Mac**, use `tmux` ou `screen` para gerenciar múltiplos terminais
- **Alternativa**: Use um gerenciador de processos como `concurrently` ou `pm2`

## 🔧 Troubleshooting

### O script não está detectando mudanças

1. Verifique se está no branch correto:
   ```bash
   git branch
   ```

2. Teste manualmente se consegue fazer pull:
   ```bash
   git pull
   ```

3. Verifique a conexão com o repositório remoto:
   ```bash
   git remote -v
   ```

### Conflitos de merge

Se houver mudanças locais não commitadas e o script tentar fazer pull, pode ocorrer conflito. Neste caso:

1. Faça stash das suas mudanças locais:
   ```bash
   git stash
   ```

2. O script irá fazer pull automaticamente

3. Recupere suas mudanças:
   ```bash
   git stash pop
   ```

## 🎁 Bônus: Usando com concurrently

Se quiser rodar dev server e sincronização em um único comando, instale o `concurrently`:

```bash
npm install --save-dev concurrently
```

Depois adicione ao `package.json`:

```json
"scripts": {
  "dev:full": "concurrently \"npm run dev\" \"npm run dev:sync\""
}
```

Agora você pode rodar tudo com:

```bash
npm run dev:full
```
