# 🚀 Como Criar o Pull Request

## Link Direto para Criar o PR

Clique neste link para criar o pull request automaticamente:

```
https://github.com/rebohoart/rebohoart-heartfelt-boho-landing/compare/main...claude/webhook-template-test-011CV2XGALfkXjrtbYksJuMo
```

Ou este (alternativo):

```
https://github.com/rebohoart/rebohoart-heartfelt-boho-landing/pull/new/claude/webhook-template-test-011CV2XGALfkXjrtbYksJuMo
```

## Informações do PR

### Título
```
Configuração e diagnóstico do webhook n8n para transformação de imagens IA
```

### Descrição

Copie o conteúdo completo do arquivo `PR_TEMPLATE.md` para a descrição do pull request.

Ou use este resumo:

---

## Resumo

Configura o webhook n8n de teste para transformação de imagens com IA e adiciona ferramentas completas de diagnóstico para identificar problemas de formato de payload.

## Mudanças

### Configuração
- ✅ Webhook configurado: `https://vibecodingc1.app.n8n.cloud/webhook-test/generate-from-upload`
- ✅ Variável de ambiente `VITE_N8N_WEBHOOK_URL` adicionada ao `.env`

### Ferramentas de Teste (4)
- `test-webhook.html` - Teste básico com melhor tratamento de erros
- `test-webhook.js` - Script Node.js para testes automatizados
- `diagnostico-webhook.html` - Testa 6 formatos diferentes de payload
- `test-avancado-webhook.html` - **NOVO**: Testa 4 variações (JSON + FormData)

### Melhorias no Código
- `AIImageGenerator.tsx` - Logs detalhados e melhor tratamento de erros
- Mensagens de erro mais úteis e descritivas

### Documentação (3)
- `WEBHOOK_DIAGNOSTICO.md` - Guia completo de troubleshooting
- `PROXIMO_PASSO.md` - **NOVO**: Guia após identificar resposta vazia
- `N8N_SETUP.md` - Seção de troubleshooting expandida

## Problema Identificado

O webhook retorna:
- ✅ Status 200 OK
- ❌ Resposta vazia
- ❌ Erro no n8n: "Nenhuma imagem foi enviada"

## Próximos Passos

1. Testar com `test-avancado-webhook.html` (Teste 3: Múltiplos Campos)
2. Verificar logs do n8n em "Executions"
3. Ajustar formato do payload conforme necessário

## Commits (5)

- `2a12f45` - Feat: Configurar webhook n8n de teste
- `5a9f23a` - Fix: Melhorar diagnóstico de erros
- `eed6ae6` - Docs: Adicionar PR template
- `16ef623` - Feat: Adicionar teste avançado
- `08f26b9` - Docs: Atualizar PR template

---

## Labels Sugeridos

Adicione estas labels ao PR:
- `enhancement` (melhoria)
- `documentation` (documentação)
- `bug` (correção - integração n8n)

## Após Criar o PR

1. Revise as mudanças no GitHub
2. Teste os formatos pendentes
3. Atualize o PR com os resultados dos testes
4. Solicite review se necessário
