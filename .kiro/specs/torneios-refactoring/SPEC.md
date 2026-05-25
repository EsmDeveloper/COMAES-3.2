# 🏆 ESPECIFICAÇÃO: Refatoração Completa de Torneios & Competições

**Status**: Em Planejamento  
**Prioridade**: CRÍTICA  
**Data de Início**: 21/05/2026  
**Objetivo**: Refatorar completamente o módulo de Torneios & Competições com foco em gestão de questões

---

## 📌 RESUMO EXECUTIVO

O módulo atual de Torneios & Competições apresenta problemas críticos na gestão de questões:
- ❌ Formulário de criação desorganizado e pouco intuitivo
- ❌ Possível falha na associação de questões aos torneios
- ❌ Falta de validação adequada
- ❌ Sem preview antes de salvar
- ❌ Sem edição posterior de questões
- ❌ Sem busca/filtro de questões

**Resultado esperado**: Sistema totalmente funcional, intuitivo e pronto para produção.

---

## 🎯 OBJETIVOS PRINCIPAIS

### 1. Refatorar Formulário de Criação de Questões
- [ ] Analisar implementação atual
- [ ] Reconstruir formulário com interface moderna
- [ ] Exibir apenas campos relevantes por modalidade
- [ ] Implementar validação completa
- [ ] Adicionar preview antes de salvar
- [ ] Permitir edição posterior
- [ ] Mensagens claras de sucesso/erro

### 2. Validar Três Modalidades de Questões
- [ ] Matemática: campos, persistência, edição, exclusão
- [ ] Inglês: campos, persistência, edição, exclusão
- [ ] Programação: campos, persistência, edição, exclusão

### 3. Corrigir Associação Questão ↔ Torneio
- [ ] Auditoria completa do fluxo
- [ ] Garantir torneio_id correto
- [ ] Validar persistência na BD
- [ ] Evitar questões órfãs
- [ ] Testar integridade referencial

### 4. Revisar Fluxo Completo de Gestão
- [ ] Selecionar torneio
- [ ] Criar questão
- [ ] Salvar questão
- [ ] Recuperar da BD
- [ ] Exibir no torneio correto
- [ ] Editar questão
- [ ] Excluir questão
- [ ] Atualizar listagens

### 5. Melhorar Experiência do Admin
- [ ] Lista organizada de questões
- [ ] Busca por título
- [ ] Filtro por modalidade
- [ ] Contador total
- [ ] Indicadores visuais
- [ ] Botão duplicar questão
- [ ] Confirmação antes de exclusão

### 6. Auditoria Técnica
- [ ] Erros de state management
- [ ] Sincronização frontend/backend
- [ ] Falhas de envio
- [ ] Campos não persistidos
- [ ] Problemas de relacionamento BD
- [ ] Erros de carregamento assíncrono
- [ ] Inconsistências frontend/backend

---

## 📊 ESTRUTURA DE TAREFAS

### FASE 1: ANÁLISE E DIAGNÓSTICO (2-3 horas)

#### Tarefa 1.1: Auditoria do Código Atual
- [ ] Ler todos os componentes de questões
- [ ] Ler todos os modelos de questões
- [ ] Ler todas as rotas de questões
- [ ] Ler todos os controllers de questões
- [ ] Documentar problemas encontrados

#### Tarefa 1.2: Teste Manual do Fluxo Atual
- [ ] Criar torneio de teste
- [ ] Tentar criar questão de Matemática
- [ ] Tentar criar questão de Inglês
- [ ] Tentar criar questão de Programação
- [ ] Verificar se questões aparecem no torneio
- [ ] Tentar editar questão
- [ ] Tentar excluir questão
- [ ] Documentar erros encontrados

#### Tarefa 1.3: Auditoria de Banco de Dados
- [ ] Verificar schema das tabelas de questões
- [ ] Verificar relacionamentos (foreign keys)
- [ ] Verificar índices
- [ ] Verificar dados órfãos
- [ ] Documentar inconsistências

### FASE 2: REFATORAÇÃO BACKEND (4-5 horas)

#### Tarefa 2.1: Criar Serviço Centralizado de Questões
- [x] Criar `BackEnd/services/questoesService.js`
- [x] Implementar métodos CRUD para cada modalidade
- [x] Implementar validação centralizada
- [x] Implementar busca e filtro
- [x] Implementar duplicação de questão
- [x] Implementar busca de questões órfãs
- [x] Implementar validação de integridade

#### Tarefa 2.2: Criar Controller Especializado
- [x] Criar `BackEnd/controllers/QuestoesController.js`
- [x] Implementar endpoints para cada modalidade
- [x] Implementar validação de entrada
- [x] Implementar tratamento de erros
- [x] Implementar logging

#### Tarefa 2.3: Criar Rotas Especializadas
- [x] Criar `BackEnd/routes/questoesRoutes.js`
- [x] Endpoints para criar questão
- [x] Endpoints para listar questões do torneio
- [x] Endpoints para editar questão
- [x] Endpoints para excluir questão
- [x] Endpoints para duplicar questão
- [x] Endpoints para buscar/filtrar
- [x] Registrar rotas em index.js

#### Tarefa 2.4: Validação Backend
- [x] Criar validadores para Matemática
- [x] Criar validadores para Inglês
- [x] Criar validadores para Programação
- [x] Testar validação com dados inválidos

#### Tarefa 2.5: Testes de Integração Backend
- [ ] Testar criação de questão
- [ ] Testar edição de questão
- [ ] Testar exclusão de questão
- [ ] Testar busca/filtro
- [ ] Testar duplicação
- [ ] Testar integridade referencial

#### Tarefa 2.6: Script de Auditoria
- [x] Criar `BackEnd/scripts/auditarQuestoes.js`
- [x] Validar integridade
- [x] Buscar questões órfãs
- [x] Contar questões por torneio

### FASE 3: REFATORAÇÃO FRONTEND (5-6 horas)

#### Tarefa 3.1: Criar Componente de Formulário Unificado
- [ ] Criar `FrontEnd/src/Administrador/QuestaoForm.jsx`
- [ ] Implementar seleção de modalidade
- [ ] Implementar campos dinâmicos por modalidade
- [ ] Implementar validação em tempo real
- [ ] Implementar preview
- [ ] Implementar modo criar/editar

#### Tarefa 3.2: Criar Componente de Listagem
- [ ] Criar `FrontEnd/src/Administrador/QuestoesList.jsx`
- [ ] Implementar tabela de questões
- [ ] Implementar busca
- [ ] Implementar filtro por modalidade
- [ ] Implementar ações (editar, excluir, duplicar)
- [ ] Implementar paginação

#### Tarefa 3.3: Criar Serviço de API
- [ ] Criar `FrontEnd/src/Administrador/questoesService.js`
- [ ] Implementar métodos CRUD
- [ ] Implementar tratamento de erros
- [ ] Implementar cache local

#### Tarefa 3.4: Integrar com AdminDashboard
- [ ] Adicionar aba "Gerenciar Questões" em TorneiosTab
- [ ] Integrar QuestaoForm
- [ ] Integrar QuestoesList
- [ ] Implementar fluxo completo

#### Tarefa 3.5: Testes de Integração Frontend
- [ ] Testar criação de questão
- [ ] Testar edição de questão
- [ ] Testar exclusão de questão
- [ ] Testar busca/filtro
- [ ] Testar duplicação
- [ ] Testar validação

### FASE 4: TESTES E VALIDAÇÃO (2-3 horas)

#### Tarefa 4.1: Testes End-to-End
- [ ] Criar torneio
- [ ] Criar questão de cada modalidade
- [ ] Verificar persistência
- [ ] Editar questão
- [ ] Excluir questão
- [ ] Verificar integridade

#### Tarefa 4.2: Testes de Segurança
- [ ] Testar XSS em campos de texto
- [ ] Testar SQL injection
- [ ] Testar autorização (apenas admin)
- [ ] Testar validação de entrada

#### Tarefa 4.3: Testes de Performance
- [ ] Testar com 100 questões
- [ ] Testar com 1000 questões
- [ ] Testar busca/filtro
- [ ] Testar carregamento

#### Tarefa 4.4: Testes de Usabilidade
- [ ] Testar interface
- [ ] Testar mensagens de erro
- [ ] Testar feedback visual
- [ ] Testar acessibilidade

### FASE 5: DOCUMENTAÇÃO E DEPLOY (1-2 horas)

#### Tarefa 5.1: Documentação
- [ ] Documentar API
- [ ] Documentar componentes
- [ ] Documentar fluxo de uso
- [ ] Criar guia do admin

#### Tarefa 5.2: Deploy
- [ ] Fazer backup do banco
- [ ] Deploy do backend
- [ ] Deploy do frontend
- [ ] Testes em produção

---

## 🔍 PROBLEMAS IDENTIFICADOS (Preliminar)

### Backend
- [ ] Falta de serviço centralizado para questões
- [ ] Validação incompleta
- [ ] Sem tratamento de erros adequado
- [ ] Sem logging
- [ ] Sem testes

### Frontend
- [ ] Sem componente especializado para questões
- [ ] Sem preview
- [ ] Sem busca/filtro
- [ ] Sem edição
- [ ] Sem duplicação
- [ ] Interface desorganizada

### Banco de Dados
- [ ] Possível falta de índices
- [ ] Possível falta de constraints
- [ ] Possível dados órfãos

---

## 📈 MÉTRICAS DE SUCESSO

- ✅ 100% das questões criadas vinculadas ao torneio correto
- ✅ 0 questões órfãs
- ✅ 100% de validação de entrada
- ✅ 0 erros de persistência
- ✅ Interface intuitiva e moderna
- ✅ Tempo de criação < 30 segundos
- ✅ Tempo de edição < 20 segundos
- ✅ Tempo de busca < 1 segundo
- ✅ 100% de cobertura de testes

---

## 📝 NOTAS IMPORTANTES

1. **Não quebrar funcionalidades existentes**: Manter compatibilidade com código existente
2. **Testes em cada fase**: Validar antes de prosseguir
3. **Documentação contínua**: Documentar conforme avança
4. **Backup de dados**: Fazer backup antes de alterações críticas
5. **Comunicação**: Informar stakeholders sobre progresso

---

## 🚀 PRÓXIMOS PASSOS

1. Iniciar FASE 1: Análise e Diagnóstico
2. Documentar todos os problemas encontrados
3. Criar plano detalhado de correção
4. Iniciar FASE 2: Refatoração Backend
5. Iniciar FASE 3: Refatoração Frontend
6. Executar FASE 4: Testes
7. Executar FASE 5: Deploy

