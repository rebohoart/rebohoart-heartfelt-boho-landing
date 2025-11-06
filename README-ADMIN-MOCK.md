# Admin Mock para Localhost

## 🔐 Credenciais de Admin Mock

Para facilitar o desenvolvimento no localhost, foi implementado um sistema de autenticação mock que permite login ilimitado sem dependência do Supabase.

### Credenciais

```
Email: admin@localhost.com
Password: admin123
```

## ✨ Como Funciona

1. **Detecção Automática**: O sistema detecta automaticamente se está a correr em localhost (localhost, 127.0.0.1 ou ::1)

2. **Autenticação Mock**: Quando usa as credenciais acima no localhost, o login é autenticado localmente sem chamadas ao Supabase

3. **Persistência**: A sessão mock é guardada em `localStorage`, permitindo que mantenha login mesmo após refresh da página

4. **Logout**: O logout limpa a sessão mock do `localStorage`

## 🚀 Como Usar

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Aceda a `http://localhost:8080/auth`

3. Insira as credenciais mock:
   - Email: `admin@localhost.com`
   - Password: `admin123`

4. Será redirecionado para o backoffice com permissões de admin

5. Pode fazer logout e login quantas vezes quiser - funciona sempre!

## 🎯 Vantagens

- ✅ Login ilimitado sem problemas de sessão
- ✅ Não depende de conexão com Supabase
- ✅ Persistente após refresh
- ✅ Simples e rápido para desenvolvimento
- ✅ Apenas ativo em localhost (seguro para produção)

## ⚠️ Importante

Este sistema **APENAS** funciona em localhost. Em produção ou ambientes de staging, o sistema usa a autenticação normal do Supabase.

## 🔧 Implementação Técnica

A implementação está no ficheiro `src/contexts/AuthContext.tsx`:
- Função `isLocalhost()` detecta ambiente local
- Credenciais definidas em constantes `MOCK_ADMIN_EMAIL` e `MOCK_ADMIN_PASSWORD`
- Mock user criado com `createMockUser()`
- Sessão guardada em `localStorage` com chave `mock_admin_session`
