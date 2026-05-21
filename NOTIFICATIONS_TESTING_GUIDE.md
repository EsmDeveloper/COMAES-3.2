# Guia de Testes - Sistema de Notificações

## 🧪 Testes Funcionais

### 1. Teste: Criar Notificação para Um Usuário

**Pré-requisitos:**
- Estar logado como admin
- Ter pelo menos 1 usuário cadastrado

**Passos:**
1. Ir para `/administrador`
2. Clicar em "Notificações" no menu lateral
3. Na aba "Enviar Notificações":
   - Selecionar 1 usuário da lista
   - Preencher:
     - Tipo: "Geral"
     - Título: "Teste de Notificação"
     - Mensagem: "Esta é uma mensagem de teste"
   - Clicar "Enviar Notificações"

**Resultado Esperado:**
- ✅ Mensagem de sucesso: "Notificações enviadas para 1 usuário(s)"
- ✅ Formulário limpo
- ✅ Usuário deseleccionado

**Validação:**
- Fazer login como o usuário que recebeu a notificação
- Clicar no ícone de sino na navbar
- Verificar se a notificação aparece

---

### 2. Teste: Criar Notificação para Múltiplos Usuários

**Pré-requisitos:**
- Estar logado como admin
- Ter pelo menos 3 usuários cadastrados

**Passos:**
1. Ir para `/administrador` → "Notificações"
2. Na aba "Enviar Notificações":
   - Selecionar 3 usuários diferentes
   - Preencher:
     - Tipo: "Torneio"
     - Título: "Novo Torneio Disponível"
     - Mensagem: "Um novo torneio foi criado. Participe agora!"
   - Clicar "Enviar Notificações"

**Resultado Esperado:**
- ✅ Mensagem de sucesso: "Notificações enviadas para 3 usuário(s)"
- ✅ Contador mostra "3 usuário(s) selecionado(s)"

**Validação:**
- Fazer login como cada um dos 3 usuários
- Verificar se cada um recebeu a notificação

---

### 3. Teste: Selecionar Todos os Usuários

**Pré-requisitos:**
- Estar logado como admin
- Ter múltiplos usuários cadastrados

**Passos:**
1. Ir para `/administrador` → "Notificações"
2. Na aba "Enviar Notificações":
   - Clicar no checkbox "Selecionar todos"
   - Verificar se todos os usuários são selecionados
   - Preencher formulário
   - Clicar "Enviar Notificações"

**Resultado Esperado:**
- ✅ Todos os usuários são selecionados
- ✅ Contador mostra o número total de usuários
- ✅ Notificações enviadas para todos

---

### 4. Teste: Buscar Usuários

**Pré-requisitos:**
- Estar logado como admin
- Ter usuários com nomes diferentes

**Passos:**
1. Ir para `/administrador` → "Notificações"
2. Na aba "Enviar Notificações":
   - Digitar um nome parcial no campo de busca
   - Verificar se apenas usuários com esse nome aparecem
   - Tentar buscar por email
   - Tentar buscar por ID

**Resultado Esperado:**
- ✅ Busca por nome funciona
- ✅ Busca por email funciona
- ✅ Busca por ID funciona
- ✅ Lista atualiza em tempo real

---

### 5. Teste: Filtrar por Tipo de Usuário

**Pré-requisitos:**
- Estar logado como admin
- Ter usuários admin e usuários normais

**Passos:**
1. Ir para `/administrador` → "Notificações"
2. Na aba "Enviar Notificações":
   - Selecionar filtro "Tipo de Usuário" = "Admin"
   - Verificar se apenas admins aparecem
   - Selecionar "Usuário"
   - Verificar se apenas usuários normais aparecem

**Resultado Esperado:**
- ✅ Filtro por tipo funciona
- ✅ Lista atualiza corretamente

---

### 6. Teste: Ordenar Usuários

**Pré-requisitos:**
- Estar logado como admin
- Ter múltiplos usuários

**Passos:**
1. Ir para `/administrador` → "Notificações"
2. Na aba "Enviar Notificações":
   - Selecionar "Ordenar por" = "Nome"
   - Verificar se lista está ordenada alfabeticamente
   - Selecionar "Email"
   - Verificar se lista está ordenada por email
   - Selecionar "ID"
   - Verificar se lista está ordenada por ID

**Resultado Esperado:**
- ✅ Ordenação por nome funciona
- ✅ Ordenação por email funciona
- ✅ Ordenação por ID funciona

---

### 7. Teste: Marcar Notificação como Lida

**Pré-requisitos:**
- Ter uma notificação não lida

**Passos:**
1. Fazer login como usuário
2. Clicar no ícone de sino
3. Clicar em uma notificação não lida
4. Verificar se é marcada como lida

**Resultado Esperado:**
- ✅ Notificação muda de cor (de azul para cinza)
- ✅ Indicador de não-lida desaparece
- ✅ Contador de não-lidas diminui

---

### 8. Teste: Marcar Todas como Lidas

**Pré-requisitos:**
- Ter múltiplas notificações não lidas

**Passos:**
1. Fazer login como usuário
2. Clicar no ícone de sino
3. Clicar "Marcar todas como lidas"
4. Verificar se todas são marcadas como lidas

**Resultado Esperado:**
- ✅ Todas as notificações mudam de cor
- ✅ Contador de não-lidas vai para 0
- ✅ Botão "Marcar todas" desaparece

---

### 9. Teste: Página Dedicada de Notificações

**Pré-requisitos:**
- Ter notificações

**Passos:**
1. Fazer login como usuário
2. Ir para `/notificacoes`
3. Verificar se todas as notificações aparecem
4. Testar filtros (tipo, status)
5. Testar busca
6. Testar ordenação

**Resultado Esperado:**
- ✅ Página carrega corretamente
- ✅ Todas as notificações aparecem
- ✅ Filtros funcionam
- ✅ Busca funciona
- ✅ Ordenação funciona

---

### 10. Teste: Deletar Notificação

**Pré-requisitos:**
- Ter uma notificação

**Passos:**
1. Ir para `/notificacoes`
2. Clicar no ícone de lixeira em uma notificação
3. Confirmar a exclusão
4. Verificar se a notificação foi removida

**Resultado Esperado:**
- ✅ Notificação é deletada
- ✅ Lista atualiza
- ✅ Mensagem de sucesso aparece

---

## 🔒 Testes de Segurança

### 1. Teste: Usuário Não Pode Ver Notificações de Outro

**Passos:**
1. Fazer login como Usuário A
2. Abrir DevTools → Network
3. Tentar acessar `/usuarios/2/notificacoes` (outro usuário)
4. Verificar resposta da API

**Resultado Esperado:**
- ✅ Erro 403 (Acesso Negado)
- ✅ Mensagem: "Acesso negado"

---

### 2. Teste: Apenas Admin Pode Criar Notificações

**Passos:**
1. Fazer login como usuário normal
2. Abrir DevTools → Console
3. Tentar fazer POST para `/notificacoes`
4. Verificar resposta

**Resultado Esperado:**
- ✅ Erro 403 (Acesso Negado)
- ✅ Mensagem: "Acesso negado"

---

### 3. Teste: Validação de Entrada (XSS)

**Passos:**
1. Fazer login como admin
2. Tentar enviar notificação com:
   - Título: `<script>alert('XSS')</script>`
   - Mensagem: `<img src=x onerror="alert('XSS')">`
3. Verificar se o script é executado

**Resultado Esperado:**
- ✅ Script NÃO é executado
- ✅ Conteúdo é escapado/sanitizado
- ✅ Notificação é criada com conteúdo seguro

---

### 4. Teste: Autenticação Obrigatória

**Passos:**
1. Fazer logout
2. Tentar acessar `/notificacoes`
3. Tentar fazer requisição para `/notificacoes/usuario/1`

**Resultado Esperado:**
- ✅ Redirecionado para login
- ✅ Erro 401 (Não Autenticado) na API

---

## ⚡ Testes de Performance

### 1. Teste: Carregar 100+ Notificações

**Passos:**
1. Criar 100+ notificações para um usuário
2. Fazer login como esse usuário
3. Ir para `/notificacoes`
4. Medir tempo de carregamento
5. Verificar se a página fica responsiva

**Resultado Esperado:**
- ✅ Página carrega em < 2 segundos
- ✅ Scroll é suave
- ✅ Filtros são responsivos

---

### 2. Teste: Polling Não Causa Lag

**Passos:**
1. Abrir DevTools → Performance
2. Ir para `/notificacoes`
3. Deixar a página aberta por 1 minuto
4. Verificar se há picos de CPU/memória

**Resultado Esperado:**
- ✅ Polling não causa lag visível
- ✅ CPU/memória estáveis
- ✅ Página permanece responsiva

---

### 3. Teste: Busca é Rápida

**Passos:**
1. Ter 100+ notificações
2. Ir para `/notificacoes`
3. Digitar no campo de busca
4. Medir tempo de resposta

**Resultado Esperado:**
- ✅ Resultados aparecem em < 500ms
- ✅ Busca é responsiva

---

## 📱 Testes de Responsividade

### 1. Teste: Mobile (< 768px)

**Passos:**
1. Abrir DevTools → Device Toolbar
2. Selecionar "iPhone 12"
3. Testar todas as funcionalidades:
   - Enviar notificação
   - Ver notificações
   - Filtros
   - Busca
   - Deletar

**Resultado Esperado:**
- ✅ Layout se adapta corretamente
- ✅ Botões são clicáveis
- ✅ Texto é legível
- ✅ Sem scroll horizontal

---

### 2. Teste: Tablet (768px - 1023px)

**Passos:**
1. Abrir DevTools → Device Toolbar
2. Selecionar "iPad"
3. Testar todas as funcionalidades

**Resultado Esperado:**
- ✅ Layout se adapta corretamente
- ✅ Sem problemas de espaçamento

---

### 3. Teste: Desktop (1024px+)

**Passos:**
1. Abrir em navegador desktop
2. Testar todas as funcionalidades
3. Redimensionar janela

**Resultado Esperado:**
- ✅ Layout se adapta corretamente
- ✅ Sem problemas de espaçamento

---

## 🎨 Testes de UI/UX

### 1. Teste: Cores e Ícones

**Passos:**
1. Criar notificações de cada tipo:
   - Geral (cinza)
   - Torneio (amarelo)
   - Resultado (azul)
   - Sistema (vermelho)
   - Conquista (verde)
   - Lembrete (roxo)
2. Verificar se cores e ícones aparecem corretamente

**Resultado Esperado:**
- ✅ Cada tipo tem cor e ícone corretos
- ✅ Cores são distinguíveis
- ✅ Ícones são claros

---

### 2. Teste: Animações

**Passos:**
1. Abrir modal de notificações
2. Verificar se há animação de entrada
3. Marcar notificação como lida
4. Verificar se há transição suave

**Resultado Esperado:**
- ✅ Animações são suaves
- ✅ Não há lag
- ✅ Animações melhoram UX

---

### 3. Teste: Mensagens de Feedback

**Passos:**
1. Enviar notificação
2. Verificar mensagem de sucesso
3. Tentar enviar sem selecionar usuários
4. Verificar mensagem de erro
5. Tentar enviar sem título
6. Verificar mensagem de erro

**Resultado Esperado:**
- ✅ Mensagens de sucesso aparecem
- ✅ Mensagens de erro aparecem
- ✅ Mensagens são claras

---

## 📊 Testes de Integração

### 1. Teste: Integração com AdminDashboard

**Passos:**
1. Ir para `/administrador`
2. Clicar em "Notificações"
3. Verificar se NotificationsTab carrega
4. Testar todas as funcionalidades

**Resultado Esperado:**
- ✅ NotificationsTab carrega corretamente
- ✅ Integração com AdminDashboard funciona
- ✅ Sem erros no console

---

### 2. Teste: Integração com Navbar

**Passos:**
1. Fazer login como usuário
2. Verificar se ícone de sino aparece na navbar
3. Clicar no ícone
4. Verificar se modal abre
5. Receber uma notificação
6. Verificar se badge atualiza

**Resultado Esperado:**
- ✅ Ícone de sino aparece
- ✅ Modal abre corretamente
- ✅ Badge atualiza em tempo real

---

### 3. Teste: Integração com Rota `/notificacoes`

**Passos:**
1. Fazer login como usuário
2. Ir para `/notificacoes`
3. Verificar se página carrega
4. Testar todas as funcionalidades

**Resultado Esperado:**
- ✅ Página carrega corretamente
- ✅ Todas as funcionalidades funcionam
- ✅ Sem erros no console

---

## 🐛 Testes de Casos Extremos

### 1. Teste: Notificação com Conteúdo Muito Longo

**Passos:**
1. Criar notificação com:
   - Título: 100 caracteres (máximo)
   - Mensagem: 500 caracteres (máximo)
2. Verificar se é criada corretamente
3. Verificar se é exibida corretamente

**Resultado Esperado:**
- ✅ Notificação é criada
- ✅ Conteúdo é exibido corretamente
- ✅ Sem truncamento indesejado

---

### 2. Teste: Usuário com Muitas Notificações

**Passos:**
1. Criar 1000 notificações para um usuário
2. Fazer login como esse usuário
3. Ir para `/notificacoes`
4. Verificar performance

**Resultado Esperado:**
- ✅ Página carrega (pode levar mais tempo)
- ✅ Sem crash
- ✅ Paginação ou limite funciona

---

### 3. Teste: Deletar Notificação Enquanto Está Aberta

**Passos:**
1. Abrir modal de notificações
2. Em outra aba, deletar uma notificação
3. Voltar para a primeira aba
4. Atualizar manualmente
5. Verificar se notificação foi removida

**Resultado Esperado:**
- ✅ Notificação é removida após atualização
- ✅ Sem erros

---

## ✅ Checklist de Testes

- [ ] Teste 1: Criar notificação para um usuário
- [ ] Teste 2: Criar notificação para múltiplos usuários
- [ ] Teste 3: Selecionar todos os usuários
- [ ] Teste 4: Buscar usuários
- [ ] Teste 5: Filtrar por tipo de usuário
- [ ] Teste 6: Ordenar usuários
- [ ] Teste 7: Marcar notificação como lida
- [ ] Teste 8: Marcar todas como lidas
- [ ] Teste 9: Página dedicada de notificações
- [ ] Teste 10: Deletar notificação
- [ ] Teste Segurança 1: Usuário não pode ver notificações de outro
- [ ] Teste Segurança 2: Apenas admin pode criar notificações
- [ ] Teste Segurança 3: Validação de entrada (XSS)
- [ ] Teste Segurança 4: Autenticação obrigatória
- [ ] Teste Performance 1: Carregar 100+ notificações
- [ ] Teste Performance 2: Polling não causa lag
- [ ] Teste Performance 3: Busca é rápida
- [ ] Teste Responsividade 1: Mobile
- [ ] Teste Responsividade 2: Tablet
- [ ] Teste Responsividade 3: Desktop
- [ ] Teste UI/UX 1: Cores e ícones
- [ ] Teste UI/UX 2: Animações
- [ ] Teste UI/UX 3: Mensagens de feedback
- [ ] Teste Integração 1: AdminDashboard
- [ ] Teste Integração 2: Navbar
- [ ] Teste Integração 3: Rota `/notificacoes`
- [ ] Teste Casos Extremos 1: Conteúdo muito longo
- [ ] Teste Casos Extremos 2: Muitas notificações
- [ ] Teste Casos Extremos 3: Deletar enquanto aberta

---

## 📝 Relatório de Testes

**Data:** _______________  
**Testador:** _______________  
**Navegador:** _______________  
**Sistema Operacional:** _______________

### Resumo
- Total de Testes: 30
- Testes Passados: ___
- Testes Falhados: ___
- Taxa de Sucesso: ___%

### Testes Falhados
1. _______________
2. _______________
3. _______________

### Observações
_______________________________________________
_______________________________________________
_______________________________________________

---

**Versão:** 1.0.0  
**Data de Criação:** 21 de Maio de 2026
