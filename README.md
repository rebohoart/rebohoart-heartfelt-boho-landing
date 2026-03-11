# Rebohoart

Loja online de peças artesanais boho, feitas com o coração para decorar com significado.

## Tech Stack

- React 18 + TypeScript
- Vite + SWC
- Tailwind CSS + shadcn/ui
- Supabase (base de dados, autenticação, storage, edge functions)
- Netlify (deploy)

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (porta 8080)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Variáveis de Ambiente

Cria um ficheiro `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_ANON_KEY
```

As credenciais estão disponíveis em: Supabase Dashboard → Settings → API

## Deploy

O projeto está configurado para deploy automático no **Netlify** a partir do branch `main`.
