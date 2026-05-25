# 🧪 Guia de Testes - Criar e Editar Torneios

**Objetivo**: Validar funcionalidade de criar e editar torneios  
**Tempo Estimado**: 30 minutos  
**Pré-requisitos**: Estar logado como admin

---

## ✅ Testes de Criação

### Teste 1.1: Abrir Modal de Criação ✅

**Passos**:
1. Ir para AdminDashboard
2. Clicar em "Gerenciar Torneios"
3. Clicar em "Criar Torneio"

**Resultado Esperado**:
- ✅ Modal abre
- ✅ Título: "Criar Novo Torneio"
- ✅ Campos vazios
- ✅ Status padrão: "rascunho"
- ✅ Checkbox "Público" marcado

---

### Teste 1.2: Criar Torneio Válido ✅

**Passos**:
1. Abrir modal de criação
2. Preencher:
   - Título: "Torneio de Matemática 2026"
   - Descrição: "Torneio de matemática para alunos do ensino médio"
   - Data de Início: Data futura (ex: 25/05/2026 10:00)
   - Data de Término: Data posterior (ex: 26/05/2026 18:00)
   - Status: "agendado"
3. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Toast de sucesso: "Torneio criado com sucesso!"
- ✅ Modal fecha
- ✅ Torneio aparece na lista
- ✅ Dados corretos na tabela

---

### Teste 1.3: Validação - Título Vazio ❌

**Passos**:
1. Abrir modal de criação
2. Deixar título vazio
3. Preencher outros campos
4. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Erro: "Título é obrigatório"
- ✅ Campo destacado em vermelho
- ✅ Modal não fecha
- ✅ Torneio não é criado

---

### Teste 1.4: Validação - Título Muito Curto ❌

**Passos**:
1. Abrir modal de criação
2. Título: "AB" (2 caracteres)
3. Preencher outros campos
4. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Erro: "Título deve ter pelo menos 3 caracteres"
- ✅ Campo destacado em vermelho
- ✅ Modal não fecha

---

### Teste 1.5: Validação - Descrição Vazia ❌

**Passos**:
1. Abrir modal de criação
2. Preencher título
3. Deixar descrição vazia
4. Preencher datas
5. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Erro: "Descrição é obrigatória"
- ✅ Campo destacado em vermelho
- ✅ Modal não fecha

---

### Teste 1.6: Validação - Descrição Muito Curta ❌

**Passos**:
1. Abrir modal de criação
2. Descrição: "Teste" (5 caracteres)
3. Preencher outros campos
4. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Erro: "Descrição deve ter pelo menos 10 caracteres"
- ✅ Campo destacado em vermelho
- ✅ Modal não fecha

---

### Teste 1.7: Validação - Data de Início no Passado ❌

**Passos**:
1. Abrir modal de criação
2. Preencher título e descrição
3. Data de Início: Data passada (ex: 20/05/2026)
4. Data de Término: Data futura
5. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Erro: "Data de início não pode ser no passado"
- ✅ Campo destacado em vermelho
- ✅ Modal não fecha

---

### Teste 1.8: Validação - Data de Término Antes do Início ❌

**Passos**:
1. Abrir modal de criação
2. Preencher título e descrição
3. Data de Início: 25/05/2026 10:00
4. Data de Término: 25/05/2026 09:00 (antes do início)
5. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Erro: "Data de término deve ser após a data de início"
- ✅ Campo destacado em vermelho
- ✅ Modal não fecha

---

### Teste 1.9: Validação - Status Não Selecionado ❌

**Passos**:
1. Abrir modal de criação
2. Preencher todos os campos
3. Deixar status vazio (se possível)
4. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Erro: "Status é obrigatório"
- ✅ Campo destacado em vermelho
- ✅ Modal não fecha

---

### Teste 1.10: Cancelar Criação ✅

**Passos**:
1. Abrir modal de criação
2. Preencher alguns campos
3. Clicar "Cancelar"

**Resultado Esperado**:
- ✅ Modal fecha
- ✅ Dados não são salvos
- ✅ Nenhum torneio é criado

---

## ✏️ Testes de Edição

### Teste 2.1: Abrir Modal de Edição ✅

**Passos**:
1. Na tabela de torneios, clicar no ícone de editar (lápis)

**Resultado Esperado**:
- ✅ Modal abre
- ✅ Título: "Editar Torneio"
- ✅ Campos preenchidos com dados do torneio
- ✅ Dados corretos

---

### Teste 2.2: Editar Torneio Válido ✅

**Passos**:
1. Abrir modal de edição
2. Alterar:
   - Título: "Torneio de Matemática 2026 - Edição"
   - Descrição: "Descrição atualizada"
3. Clicar "Salvar Alterações"

**Resultado Esperado**:
- ✅ Toast de sucesso: "Torneio atualizado com sucesso!"
- ✅ Modal fecha
- ✅ Dados atualizados na tabela
- ✅ Alterações persistem

---

### Teste 2.3: Editar Apenas Descrição ✅

**Passos**:
1. Abrir modal de edição
2. Alterar apenas descrição
3. Clicar "Salvar Alterações"

**Resultado Esperado**:
- ✅ Toast de sucesso
- ✅ Descrição atualizada
- ✅ Outros campos mantêm valores originais

---

### Teste 2.4: Editar Status ✅

**Passos**:
1. Abrir modal de edição
2. Alterar status: "rascunho" → "ativo"
3. Clicar "Salvar Alterações"

**Resultado Esperado**:
- ✅ Toast de sucesso
- ✅ Status atualizado na tabela
- ✅ Badge de status muda de cor

---

### Teste 2.5: Validação ao Editar - Título Vazio ❌

**Passos**:
1. Abrir modal de edição
2. Limpar título
3. Clicar "Salvar Alterações"

**Resultado Esperado**:
- ✅ Erro: "Título é obrigatório"
- ✅ Campo destacado em vermelho
- ✅ Modal não fecha
- ✅ Dados não são salvos

---

### Teste 2.6: Cancelar Edição ✅

**Passos**:
1. Abrir modal de edição
2. Alterar alguns campos
3. Clicar "Cancelar"

**Resultado Esperado**:
- ✅ Modal fecha
- ✅ Alterações não são salvas
- ✅ Dados originais mantêm-se

---

## 🔍 Testes de Interface

### Teste 3.1: Responsividade - Desktop ✅

**Passos**:
1. Abrir em desktop (1920x1080)
2. Clicar "Criar Torneio"
3. Verificar layout

**Resultado Esperado**:
- ✅ Modal bem dimensionado
- ✅ Campos bem espaçados
- ✅ Botões visíveis
- ✅ Sem scroll horizontal

---

### Teste 3.2: Responsividade - Tablet ✅

**Passos**:
1. Abrir em tablet (768x1024)
2. Clicar "Criar Torneio"
3. Verificar layout

**Resultado Esperado**:
- ✅ Modal adaptado
- ✅ Campos em coluna única
- ✅ Botões acessíveis
- ✅ Sem problemas de layout

---

### Teste 3.3: Responsividade - Mobile ✅

**Passos**:
1. Abrir em mobile (375x667)
2. Clicar "Criar Torneio"
3. Verificar layout

**Resultado Esperado**:
- ✅ Modal otimizado
- ✅ Campos em coluna única
- ✅ Botões grandes e acessíveis
- ✅ Scroll vertical funciona

---

### Teste 3.4: Feedback Visual - Carregamento ✅

**Passos**:
1. Abrir modal de criação
2. Preencher formulário
3. Clicar "Criar Torneio"
4. Observar durante o envio

**Resultado Esperado**:
- ✅ Botão mostra spinner
- ✅ Botão fica desabilitado
- ✅ Campos ficam desabilitados
- ✅ Após sucesso, modal fecha

---

### Teste 3.5: Mensagens de Erro ✅

**Passos**:
1. Tentar criar torneio com dados inválidos
2. Observar mensagens de erro

**Resultado Esperado**:
- ✅ Mensagens claras
- ✅ Campos destacados
- ✅ Cores apropriadas (vermelho)
- ✅ Fácil de entender

---

## 🔒 Testes de Segurança

### Teste 4.1: Sem Autenticação ❌

**Passos**:
1. Fazer logout
2. Tentar acessar AdminDashboard
3. Tentar criar torneio

**Resultado Esperado**:
- ✅ Redirecionado para login
- ✅ Não consegue acessar
- ✅ Não consegue criar torneio

---

### Teste 4.2: Usuário Não-Admin ❌

**Passos**:
1. Fazer login como usuário comum
2. Tentar acessar AdminDashboard

**Resultado Esperado**:
- ✅ Acesso negado
- ✅ Redirecionado para home
- ✅ Mensagem de erro

---

### Teste 4.3: XSS - Título com HTML ❌

**Passos**:
1. Abrir modal de criação
2. Título: `<script>alert('XSS')</script>`
3. Preencher outros campos
4. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Script não é executado
- ✅ Texto é sanitizado
- ✅ Torneio é criado com texto literal

---

### Teste 4.4: SQL Injection - Descrição ❌

**Passos**:
1. Abrir modal de criação
2. Descrição: `'; DROP TABLE torneios; --`
3. Preencher outros campos
4. Clicar "Criar Torneio"

**Resultado Esperado**:
- ✅ Comando não é executado
- ✅ Texto é tratado como string
- ✅ Torneio é criado com texto literal

---

## 📊 Testes de Performance

### Teste 5.1: Criação Rápida ✅

**Passos**:
1. Criar 5 torneios rapidamente
2. Observar performance

**Resultado Esperado**:
- ✅ Sem lag
- ✅ Sem erros
- ✅ Todos os torneios criados
- ✅ Lista atualiza corretamente

---

### Teste 5.2: Edição Rápida ✅

**Passos**:
1. Editar 5 torneios rapidamente
2. Observar performance

**Resultado Esperado**:
- ✅ Sem lag
- ✅ Sem erros
- ✅ Todas as edições salvas
- ✅ Lista atualiza corretamente

---

## 📋 Checklist de Testes

- [ ] Teste 1.1: Abrir modal de criação
- [ ] Teste 1.2: Criar torneio válido
- [ ] Teste 1.3: Validação - título vazio
- [ ] Teste 1.4: Validação - título curto
- [ ] Teste 1.5: Validação - descrição vazia
- [ ] Teste 1.6: Validação - descrição curta
- [ ] Teste 1.7: Validação - data no passado
- [ ] Teste 1.8: Validação - data término antes início
- [ ] Teste 1.9: Validação - status não selecionado
- [ ] Teste 1.10: Cancelar criação
- [ ] Teste 2.1: Abrir modal de edição
- [ ] Teste 2.2: Editar torneio válido
- [ ] Teste 2.3: Editar apenas descrição
- [ ] Teste 2.4: Editar status
- [ ] Teste 2.5: Validação ao editar
- [ ] Teste 2.6: Cancelar edição
- [ ] Teste 3.1: Responsividade desktop
- [ ] Teste 3.2: Responsividade tablet
- [ ] Teste 3.3: Responsividade mobile
- [ ] Teste 3.4: Feedback visual
- [ ] Teste 3.5: Mensagens de erro
- [ ] Teste 4.1: Sem autenticação
- [ ] Teste 4.2: Usuário não-admin
- [ ] Teste 4.3: XSS
- [ ] Teste 4.4: SQL Injection
- [ ] Teste 5.1: Criação rápida
- [ ] Teste 5.2: Edição rápida

---

## 🎯 Conclusão

Após completar todos os testes, a funcionalidade de criar e editar torneios estará validada e pronta para uso em produção.

**Status**: ✅ Pronto para testes

---

**Última Atualização**: 21/05/2026

