# Guia de Deploy para Produção

Este documento descreve como preparar e publicar o projeto Rebohoart em produção.

## Pré-requisitos

Antes de fazer deploy, certifica-te de que:

1. Todas as dependências estão instaladas:
   ```bash
   npm install
   ```

2. As variáveis de ambiente estão configuradas corretamente no ficheiro `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
   ```

3. A base de dados Supabase está configurada (ver `SETUP_SUPABASE.md`)

## Verificações Pré-Deploy

Execute os seguintes comandos para garantir que o projeto está pronto:

### 1. Linting
```bash
npm run lint
```
Deve executar sem erros (warnings são aceitáveis).

### 2. Build de Produção
```bash
npm run build
```
Deve completar sem erros e criar a pasta `dist/` com os ficheiros otimizados.

### 3. Preview Local
```bash
npm run preview
```
Testa o build de produção localmente antes de publicar.

## Deploy via Lovable

A forma mais simples de fazer deploy é através do Lovable:

1. Acede ao [projeto no Lovable](https://lovable.dev/projects/4fe76022-4fb8-4f5e-8f0f-92d4db1dd338)
2. Clica em **Share** → **Publish**
3. Segue as instruções para publicar o site

O Lovable irá:
- Fazer build automático do projeto
- Publicar numa URL do tipo `https://your-project.lovable.app`
- Configurar HTTPS automaticamente
- Fornecer opções para domínio personalizado

## Deploy Manual (Alternativa)

Se preferires fazer deploy manual, podes usar qualquer plataforma que suporte aplicações React/Vite:

### Vercel

1. Instala a Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Faz login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

### Netlify

1. Instala a Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Faz login:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Outras Plataformas

O projeto é compatível com:
- AWS Amplify
- Firebase Hosting
- GitHub Pages
- Cloudflare Pages

## Configuração de Variáveis de Ambiente em Produção

**IMPORTANTE:** Nunca committes o ficheiro `.env` ao repositório!

Para cada plataforma de deploy, precisas configurar as variáveis de ambiente:

### Lovable
As variáveis de ambiente são configuradas automaticamente através do painel do Lovable.

### Vercel
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
```

### Netlify
```bash
netlify env:set VITE_SUPABASE_URL "your-url"
netlify env:set VITE_SUPABASE_PUBLISHABLE_KEY "your-key"
```

## Domínio Personalizado

### Via Lovable

1. No painel do Lovable, vai a **Project** → **Settings** → **Domains**
2. Clica em **Connect Domain**
3. Segue as instruções para configurar DNS

Mais informações: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain)

### Via Outras Plataformas

Consulta a documentação específica da plataforma escolhida.

## Checklist de Deploy

Antes de publicar, confirma:

- [ ] Build de produção executa sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Base de dados Supabase configurada e funcional
- [ ] Testado localmente com `npm run preview`
- [ ] Commits e push feitos para o repositório
- [ ] Documentação atualizada

## Troubleshooting

### Erro: "Cannot find module..."
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build falha com erro de memória
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Aplicação não carrega após deploy
1. Verifica se as variáveis de ambiente estão configuradas corretamente
2. Verifica os logs da plataforma de deploy
3. Testa com `npm run preview` localmente
4. Confirma que a base de dados Supabase está acessível

## Suporte

Para mais informações:
- Documentação Lovable: https://docs.lovable.dev
- Supabase: `SETUP_SUPABASE.md`
- Claude Code: `CLAUDE.md`
