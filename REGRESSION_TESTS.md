# Testes de Regressão - Sistema de Autenticação

## Resumo das Alterações

### Problemas Identificados e Resolvidos
- **Problema**: Não era possível aceder à página de recuperação de password
- **Solução**:
  - Adicionados logs detalhados para debugging em todo o fluxo de recuperação
  - Melhorada a visibilidade do processo de recuperação com console logs
  - Adicionada mensagem informativa quando o utilizador clica no link do email

### Melhorias Implementadas
1. **Logs de Debugging**:
   - Logs ao alternar entre modos (login, signup, recovery, reset)
   - Logs ao enviar email de recuperação
   - Logs ao receber evento PASSWORD_RECOVERY
   - Logs ao atualizar password

2. **Experiência do Utilizador**:
   - Toast informativo quando o evento PASSWORD_RECOVERY é detectado
   - Melhor feedback em caso de erros de validação

## Fluxo de Recuperação de Password

### 1. Aceder à Página de Recuperação
**Passos**:
1. Navegar para `/auth`
2. Clicar no botão "Esqueceu a password?"

**Resultado Esperado**:
- ✅ O formulário muda para modo de recuperação
- ✅ O título muda para "Recuperar Password"
- ✅ Aparece uma mensagem explicativa
- ✅ Apenas o campo de email é visível
- ✅ O botão muda para "Enviar Email"
- ✅ Aparece o botão "Voltar ao login"
- ✅ Console log: "🔑 Switching to password recovery mode"

### 2. Enviar Email de Recuperação
**Passos**:
1. Inserir um email válido no campo
2. Clicar no botão "Enviar Email"

**Resultado Esperado**:
- ✅ Console logs:
  - "📧 Password recovery mode - sending reset email"
  - "🔐 Sending password reset email to: [email]"
  - "🔗 Redirect URL: [url]"
  - "✅ Password reset email sent successfully"
- ✅ Toast de sucesso: "Email de recuperação enviado! Verifique a sua caixa de entrada."
- ✅ O formulário volta ao modo de login
- ✅ O campo de email é limpo

**Resultado em Caso de Erro**:
- ✅ Console log: "❌ Error sending password reset email: [error]"
- ✅ Toast de erro: "Erro ao enviar email de recuperação"

### 3. Clicar no Link do Email
**Passos**:
1. Abrir o email de recuperação
2. Clicar no link de recuperação

**Resultado Esperado**:
- ✅ O utilizador é redirecionado para `/auth`
- ✅ Console logs:
  - "🔔 Auth state changed: PASSWORD_RECOVERY [email]"
  - "🔐 PASSWORD_RECOVERY event detected - switching to password reset mode"
- ✅ Toast informativo: "Por favor, defina a sua nova password"
- ✅ O formulário muda para modo de reset de password
- ✅ O título muda para "Definir Nova Password"
- ✅ Aparecem dois campos: "Nova Password" e "Confirmar Password"
- ✅ O botão muda para "Atualizar Password"

### 4. Definir Nova Password
**Passos**:
1. Inserir a nova password (mínimo 6 caracteres)
2. Confirmar a password
3. Clicar no botão "Atualizar Password"

**Resultado Esperado**:
- ✅ Console logs:
  - "🔄 Password reset mode - updating password"
  - "✅ Password updated successfully"
- ✅ Toast de sucesso: "Password atualizada com sucesso! Pode agora fazer login."
- ✅ O formulário volta ao modo de login
- ✅ Os campos são limpos

**Resultado em Caso de Erro de Validação**:
- ✅ Console log: "❌ Password validation failed: [mensagem]"
- ✅ Toast de erro com mensagem de validação (ex: "As passwords não coincidem")

**Resultado em Caso de Erro na Atualização**:
- ✅ Console log: "❌ Error updating password: [error]"
- ✅ Toast de erro: "Erro ao atualizar password"

## Testes de Regressão Completos

### A. Testes de Login

#### A1. Login com Credenciais Válidas
**Passos**:
1. Navegar para `/auth`
2. Inserir email válido
3. Inserir password válida
4. Clicar em "Entrar"

**Resultado Esperado**:
- ✅ Console logs de autenticação aparecem
- ✅ Login bem-sucedido
- ✅ Redirecionado para `/backoffice` (se for admin)
- ✅ Sessão criada corretamente

#### A2. Login com Credenciais Inválidas
**Passos**:
1. Navegar para `/auth`
2. Inserir email ou password inválidos
3. Clicar em "Entrar"

**Resultado Esperado**:
- ✅ Console logs de erro aparecem
- ✅ Toast de erro: "Email ou password incorretos"
- ✅ O utilizador permanece na página de login
- ✅ O botão volta ao estado normal (não fica em "A processar...")

#### A3. Login com Email Inválido (Formato)
**Passos**:
1. Navegar para `/auth`
2. Inserir email com formato inválido (ex: "teste@")
3. Tentar submeter

**Resultado Esperado**:
- ✅ Validação HTML5 impede submissão OU
- ✅ Toast de erro: "Email inválido"

#### A4. Login com Password Curta
**Passos**:
1. Navegar para `/auth`
2. Inserir email válido
3. Inserir password com menos de 6 caracteres
4. Tentar submeter

**Resultado Esperado**:
- ✅ Validação HTML5 impede submissão OU
- ✅ Toast de erro: "Password deve ter pelo menos 6 caracteres"

### B. Testes de Signup

#### B1. Criar Conta com Dados Válidos
**Passos**:
1. Navegar para `/auth`
2. Clicar em "Não tem conta? Criar conta"
3. Inserir email válido (novo)
4. Inserir password válida (mínimo 6 caracteres)
5. Clicar em "Criar Conta"

**Resultado Esperado**:
- ✅ Console log: "🔄 Switching to signup mode"
- ✅ O título muda para "Criar Conta"
- ✅ Aparece mensagem explicativa sobre permissões de admin
- ✅ Toast de sucesso: "Conta criada com sucesso! Por favor, verifique o seu email para confirmar."
- ✅ O formulário volta ao modo de login
- ✅ Os campos são limpos
- ✅ Email de confirmação é enviado

#### B2. Criar Conta com Email Já Existente
**Passos**:
1. Navegar para `/auth`
2. Clicar em "Não tem conta? Criar conta"
3. Inserir email já registado
4. Inserir password válida
5. Clicar em "Criar Conta"

**Resultado Esperado**:
- ✅ Toast de erro com mensagem apropriada
- ✅ O utilizador permanece no formulário de signup

### C. Testes de Navegação entre Modos

#### C1. Alternar de Login para Signup
**Passos**:
1. Estar no modo de login
2. Clicar em "Não tem conta? Criar conta"

**Resultado Esperado**:
- ✅ Console log: "🔄 Switching to signup mode"
- ✅ O formulário muda para modo de signup
- ✅ Campos de password são limpos
- ✅ Visibilidade de password é resetada

#### C2. Alternar de Login para Recovery
**Passos**:
1. Estar no modo de login
2. Clicar em "Esqueceu a password?"

**Resultado Esperado**:
- ✅ Console log: "🔑 Switching to password recovery mode"
- ✅ O formulário muda para modo de recovery
- ✅ Campos de password são limpos e ocultados
- ✅ Apenas campo de email é visível

#### C3. Voltar ao Login de Qualquer Modo
**Passos**:
1. Estar em modo de signup, recovery ou password reset
2. Clicar em "Voltar ao login"

**Resultado Esperado**:
- ✅ Console log: "🔙 Returning to login mode"
- ✅ O formulário volta ao modo de login
- ✅ Todos os campos são limpos
- ✅ Estados de visibilidade são resetados

### D. Testes de UI/UX

#### D1. Visibilidade de Password
**Passos**:
1. Inserir password em qualquer campo de password
2. Clicar no ícone de olho

**Resultado Esperado**:
- ✅ Password torna-se visível ao clicar
- ✅ Ícone muda de Eye para EyeOff
- ✅ Clicar novamente oculta a password
- ✅ A funcionalidade funciona em todos os campos de password

#### D2. Estado de Loading
**Passos**:
1. Submeter qualquer formulário
2. Observar o botão durante o processamento

**Resultado Esperado**:
- ✅ O botão muda para "A processar..."
- ✅ O botão fica desabilitado durante o processamento
- ✅ Não é possível submeter novamente enquanto processa
- ✅ O botão volta ao estado normal após conclusão

#### D3. Validação de Campos
**Passos**:
1. Tentar submeter formulário com campos vazios
2. Tentar inserir valores inválidos

**Resultado Esperado**:
- ✅ Campos marcados como required impedem submissão
- ✅ Validações HTML5 funcionam (email, minLength, maxLength)
- ✅ Mensagens de erro são claras e em português

### E. Testes de Integração com Supabase

#### E1. Configuração de Redirect URL
**Verificação Manual**:
1. Verificar no Supabase Dashboard > Authentication > URL Configuration
2. Confirmar que o URL de redirect está na whitelist

**URLs a verificar**:
- `http://localhost:8080/auth` (desenvolvimento)
- `https://[dominio-producao]/auth` (produção)

#### E2. Auth State Change Listener
**Passos**:
1. Navegar para `/auth`
2. Verificar console logs

**Resultado Esperado**:
- ✅ Console log: "🔍 Setting up auth state change listener"
- ✅ Listener configurado corretamente
- ✅ Eventos de autenticação são capturados

### F. Testes de Casos Extremos

#### F1. Email com Espaços
**Passos**:
1. Inserir email com espaços antes/depois (ex: " teste@example.com ")
2. Submeter formulário

**Resultado Esperado**:
- ✅ Espaços são removidos (trim) antes de enviar
- ✅ Autenticação funciona corretamente

#### F2. Password com Espaços
**Passos**:
1. Inserir password com espaços
2. Submeter formulário

**Resultado Esperado**:
- ✅ Password NÃO é trimmed (espaços são preservados)
- ✅ Password é usada exatamente como inserida

#### F3. Campos com Comprimento Máximo
**Passos**:
1. Inserir email com 255+ caracteres
2. Inserir password com 100+ caracteres
3. Tentar submeter

**Resultado Esperado**:
- ✅ HTML maxLength impede inserção de caracteres extras
- ✅ Validação backend também valida comprimento

#### F4. Múltiplas Tentativas de Envio
**Passos**:
1. Submeter formulário
2. Tentar submeter novamente rapidamente

**Resultado Esperado**:
- ✅ Botão fica desabilitado durante processamento
- ✅ Não é possível fazer múltiplas submissões simultâneas
- ✅ Loading state previne duplicação

## Checklist de Testes Manuais

### Antes de Fazer Push:
- [ ] Servidor de desenvolvimento inicia sem erros
- [ ] Página `/auth` carrega corretamente
- [ ] Botão "Esqueceu a password?" é visível e clicável
- [ ] Clicar no botão muda o formulário para modo de recovery
- [ ] É possível enviar email de recuperação
- [ ] Logs de debugging aparecem no console
- [ ] Build de produção completa sem erros
- [ ] Testes de TypeScript passam (sem erros de tipo)

### Testes de Fluxo Completo:
- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas mostra erro apropriado
- [ ] Signup cria nova conta corretamente
- [ ] Recuperação de password envia email
- [ ] Link de recuperação redireciona para página correta
- [ ] Definir nova password funciona
- [ ] Logout funciona corretamente
- [ ] Navegação entre modos funciona (login/signup/recovery)

### Testes de Regressão de Outras Funcionalidades:
- [ ] Navegação geral do site funciona
- [ ] Carrinho de compras funciona
- [ ] Backoffice é acessível para admins
- [ ] Produtos são carregados corretamente
- [ ] Formulário de contacto funciona

## Comandos de Teste

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
# Aceder: http://localhost:8080/auth

# Build de produção
npm run build

# Preview de build de produção
npm run preview

# Executar linter
npm run lint
```

## Configuração Necessária do Supabase

### URL Configuration (Supabase Dashboard)
1. Navegar para: Authentication > URL Configuration
2. Adicionar à whitelist de "Redirect URLs":
   - `http://localhost:8080/auth` (desenvolvimento)
   - URL de produção + `/auth` (quando deploy)

### Email Templates (Supabase Dashboard)
1. Navegar para: Authentication > Email Templates
2. Verificar template de "Reset Password":
   - Deve conter link com `{{ .ConfirmationURL }}`
   - Link deve redirecionar para `/auth`

## Notas Importantes

1. **Console Logs**: Os logs de debugging foram adicionados para facilitar troubleshooting. Em produção, considerar remover ou usar um sistema de logging apropriado.

2. **Redirect URL**: CRÍTICO - O URL de redirect DEVE estar na whitelist do Supabase, caso contrário a recuperação de password falhará silenciosamente.

3. **Password Trimming**: Por design, passwords NÃO são trimmed. Espaços no início/fim da password são preservados.

4. **Validação**: Há validação tanto no frontend (HTML5 + Zod) quanto no backend (Supabase).

5. **Erros de Rede**: Em caso de erros de rede, o utilizador verá mensagens de erro apropriadas.

## Troubleshooting

### "Email de recuperação não chega"
1. Verificar spam/lixo
2. Verificar configuração SMTP no Supabase
3. Verificar logs do Supabase Dashboard > Logs

### "Link de recuperação não funciona"
1. Verificar se redirect URL está na whitelist
2. Verificar console para logs do evento PASSWORD_RECOVERY
3. Verificar se o link não expirou (válido por 1 hora por padrão)

### "Password reset não funciona"
1. Verificar console logs
2. Verificar se passwords coincidem
3. Verificar se password tem pelo menos 6 caracteres
4. Verificar logs de erro no Supabase

### "Botão fica eternamente em 'A processar...'"
1. Este bug foi corrigido em commits anteriores
2. Verificar se há erros de autenticação no console
3. Verificar conectividade com Supabase
