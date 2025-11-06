# Logout de Todas as Contas (Localhost)

## Métodos para Fazer Logout Completo

### Método 1: Usar a Função signOut Melhorada

A função `signOut()` no `AuthContext` foi melhorada para fazer limpeza completa de todos os dados:

1. Navegue para qualquer página da aplicação
2. Clique no botão de logout (se estiver autenticado)
3. Isso irá automaticamente:
   - Limpar a sessão mock do admin (localStorage)
   - Limpar os dados do carrinho
   - Fazer signOut do Supabase
   - Limpar todas as chaves do Supabase no localStorage

### Método 2: Usar o Utilitário clearAllAuth (Console do Navegador)

1. Abra o console do navegador (F12 → Console)
2. Execute:

```javascript
// Limpar tudo e recarregar
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Ou use o utilitário dedicado (importar primeiro em algum componente):

```javascript
// Importar o utilitário
import { clearAllAuthData } from '@/utils/clearAllAuth';

// Executar
clearAllAuthData();
location.reload();
```

### Método 3: Limpeza Manual via DevTools

1. Abra DevTools (F12)
2. Vá para a aba "Application" (Chrome) ou "Storage" (Firefox)
3. Expanda "Local Storage" no painel esquerdo
4. Clique com o botão direito e selecione "Clear"
5. Faça o mesmo para "Session Storage"
6. Recarregue a página (F5)

## Dados que São Limpos

- `mock_admin_session` - Sessão mock do admin para localhost
- `rebohoart-cart` - Dados do carrinho de compras
- `sb-*` - Todas as chaves do Supabase Auth
- Quaisquer outras chaves relacionadas ao Supabase

## Importante

Esta limpeza completa é particularmente útil em localhost para:
- Testar fluxos de autenticação do zero
- Resolver problemas de sessão presa
- Limpar estados inconsistentes
- Testar comportamento sem autenticação
