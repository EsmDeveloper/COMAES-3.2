# Tasks - Reestruturação do Fluxo de Criação de Torneios

## Fase 1: Preparação e Auditoria

### Task 1.1: Auditoria de Integração Atual
**Objetivo**: Mapear estado atual do sistema
**Descrição**: 
- Revisar TorneoController.js e identificar endpoints existentes
- Revisar QuestoesControllerRefactored.js e verificar integração com torneio_id
- Mapear fluxo atual de criação de torneios
- Identificar gaps e inconsistências
- Documentar relacionamentos entre tabelas

**Critérios de Aceitação**:
- [ ] Relatório de auditoria criado
- [ ] Endpoints mapeados
- [ ] Gaps identificados
- [ ] Plano de migração definido

---

### Task 1.2: Preparar Backend para Integração
**Objetivo**: Garantir que backend está pronto para novos endpoints
**Descrição**:
- Criar `tournamentService.js` com lógica de negócio
- Criar `questionsService.js` com lógica de integração
- Criar `tournamentValidation.js` middleware
- Atualizar `TorneoController.js` com novos endpoints
- Atualizar `QuestoesControllerRefactored.js` para garantir torneio_id

**Critérios de Aceitação**:
- [ ] Services criados
- [ ] Middleware de validação implementado
- [ ] Controllers atualizados
- [ ] Testes unitários passando

---

### Task 1.3: Preparar Frontend - Estrutura de Pastas
**Objetivo**: Criar estrutura de componentes
**Descrição**:
- Criar pasta `TournamentWizard/`
- Criar pasta `TournamentDetails/`
- Criar pasta `shared/`
- Criar arquivos base de componentes
- Configurar imports e exports

**Critérios de Aceitação**:
- [ ] Estrutura de pastas criada
- [ ] Arquivos base criados
- [ ] Imports configurados
- [ ] Sem erros de compilação

---

## Fase 2: Wizard Multi-Step

### Task 2.1: Criar WizardContext e wizardService
**Objetivo**: Implementar gerenciamento de estado do wizard
**Descrição**:
- Criar `WizardContext.js` com Context API
- Criar `wizardService.js` com funções de validação
- Implementar auto-save de rascunho
- Implementar carregamento de rascunho

**Critérios de Aceitação**:
- [ ] Context criado e funcional
- [ ] Service com validações implementado
- [ ] Auto-save funcionando
- [ ] Testes passando

---

### Task 2.2: Implementar Passo 1 - Informações Básicas
**Objetivo**: Criar formulário do passo 1
**Descrição**:
- Criar `Step1BasicInfo.jsx`
- Implementar campos: nome, descrição, disciplina, modalidade, nível, imagem, regras
- Implementar validações em tempo real
- Implementar upload de imagem
- Integrar com WizardContext

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Todos os campos funcionando
- [ ] Validações em tempo real
- [ ] Upload de imagem funcionando
- [ ] Integração com Context OK

---

### Task 2.3: Implementar Passo 2 - Configuração
**Objetivo**: Criar formulário do passo 2
**Descrição**:
- Criar `Step2Configuration.jsx`
- Implementar campos: datas, limites, toggles
- Implementar validações (data final > data inicial, etc)
- Exibir resumo visual das configurações
- Integrar com WizardContext

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Todos os campos funcionando
- [ ] Validações funcionando
- [ ] Resumo visual exibido
- [ ] Integração com Context OK

---

### Task 2.4: Implementar Passo 3 - Questões
**Objetivo**: Criar interface de gerenciamento de questões
**Descrição**:
- Criar `Step3Questions.jsx`
- Implementar: criar nova, importar existente, duplicar
- Exibir quantidade por disciplina
- Mostrar: total de questões, total de pontos, distribuição por dificuldade
- Integrar com WizardContext

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Opções de questões funcionando
- [ ] Métricas exibidas corretamente
- [ ] Integração com Context OK

---

### Task 2.5: Implementar Passo 4 - Revisão
**Objetivo**: Criar tela de revisão final
**Descrição**:
- Criar `Step4Review.jsx`
- Exibir resumo completo: dados, configurações, questões, pontuação
- Implementar botão de confirmação
- Implementar chamada para API de criação
- Exibir loading state e mensagens de sucesso/erro

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Resumo completo exibido
- [ ] Confirmação funcionando
- [ ] API chamada corretamente
- [ ] Feedback visual OK

---

### Task 2.6: Criar Componente Principal TournamentWizard
**Objetivo**: Integrar todos os passos
**Descrição**:
- Criar `TournamentWizard.jsx`
- Implementar navegação entre passos
- Implementar barra de progresso
- Implementar validação antes de avançar
- Implementar redirecionamento após sucesso

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Navegação funcionando
- [ ] Barra de progresso exibida
- [ ] Validações funcionando
- [ ] Redirecionamento OK

---

### Task 2.7: Criar Componentes Compartilhados
**Objetivo**: Implementar componentes reutilizáveis
**Descrição**:
- Criar `ProgressBar.jsx`
- Criar `ValidationMessage.jsx`
- Criar `LoadingState.jsx`
- Implementar estilos consistentes
- Documentar props e uso

**Critérios de Aceitação**:
- [ ] Componentes criados
- [ ] Estilos consistentes
- [ ] Documentação completa
- [ ] Reutilizáveis em todo o projeto

---

## Fase 3: Página de Detalhes do Torneio

### Task 3.1: Criar TournamentDetails Principal
**Objetivo**: Implementar página unificada de gestão
**Descrição**:
- Criar `TournamentDetails.jsx`
- Implementar sistema de abas
- Implementar carregamento de dados
- Implementar tratamento de erros
- Integrar com tournamentDetailsService

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Abas funcionando
- [ ] Dados carregados corretamente
- [ ] Erros tratados
- [ ] Service integrado

---

### Task 3.2: Implementar Aba - Visão Geral
**Objetivo**: Criar dashboard do torneio
**Descrição**:
- Criar `TabOverview.jsx`
- Exibir: nome, descrição, datas, status
- Exibir: métricas (participantes, questões, ranking)
- Exibir: botões de ação (editar, publicar, arquivar)
- Implementar cards informativos

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Todas as informações exibidas
- [ ] Botões de ação funcionando
- [ ] Design responsivo

---

### Task 3.3: Implementar Aba - Questões
**Objetivo**: Gerenciar questões do torneio
**Descrição**:
- Criar `TabQuestions.jsx`
- Exibir lista de questões com paginação
- Implementar: adicionar, editar, deletar, duplicar
- Exibir: disciplina, dificuldade, pontos
- Integrar com CreateQuestaoForm

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Lista de questões exibida
- [ ] Ações funcionando
- [ ] Paginação implementada
- [ ] Integração com CreateQuestaoForm OK

---

### Task 3.4: Implementar Aba - Participantes
**Objetivo**: Gerenciar participantes do torneio
**Descrição**:
- Criar `TabParticipants.jsx`
- Exibir lista de participantes com paginação
- Implementar: validar, remover, exportar
- Exibir: nome, email, status, data de inscrição
- Implementar filtros e busca

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Lista de participantes exibida
- [ ] Ações funcionando
- [ ] Filtros e busca OK
- [ ] Paginação implementada

---

### Task 3.5: Implementar Aba - Ranking
**Objetivo**: Visualizar ranking em tempo real
**Descrição**:
- Criar `TabRanking.jsx`
- Exibir ranking com posição, nome, pontos, tempo
- Implementar atualização em tempo real (WebSocket ou polling)
- Implementar filtros por disciplina
- Implementar exportação de ranking

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Ranking exibido corretamente
- [ ] Atualização em tempo real OK
- [ ] Filtros funcionando
- [ ] Exportação implementada

---

### Task 3.6: Implementar Aba - Estatísticas
**Objetivo**: Exibir análises e relatórios
**Descrição**:
- Criar `TabStatistics.jsx`
- Exibir: taxa de acerto, tempo médio, distribuição de pontos
- Implementar gráficos (Chart.js ou similar)
- Implementar filtros por período
- Implementar exportação de relatórios

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Estatísticas exibidas
- [ ] Gráficos funcionando
- [ ] Filtros OK
- [ ] Exportação implementada

---

### Task 3.7: Implementar Aba - Configurações
**Objetivo**: Editar configurações do torneio
**Descrição**:
- Criar `TabSettings.jsx`
- Permitir edição de: datas, limites, toggles
- Implementar validações
- Implementar confirmação de alterações
- Implementar histórico de alterações

**Critérios de Aceitação**:
- [ ] Componente criado
- [ ] Edição funcionando
- [ ] Validações OK
- [ ] Confirmação implementada
- [ ] Histórico registrado

---

### Task 3.8: Criar tournamentDetailsService
**Objetivo**: Implementar lógica de negócio
**Descrição**:
- Criar `tournamentDetailsService.js`
- Implementar: getTournament, updateTournament
- Implementar: getTournamentQuestions, getTournamentParticipants
- Implementar: getTournamentRanking, getTournamentStatistics
- Implementar cache e invalidação

**Critérios de Aceitação**:
- [ ] Service criado
- [ ] Todas as funções implementadas
- [ ] Cache funcionando
- [ ] Testes passando

---

## Fase 4: Integração com Questões

### Task 4.1: Garantir Integração Automática
**Objetivo**: Validar que torneio_id é atribuído automaticamente
**Descrição**:
- Revisar CreateQuestaoForm
- Garantir que recebe torneio_id como prop
- Garantir que torneio_id é enviado na requisição
- Testar criação de questão dentro do torneio
- Testar que questão aparece imediatamente

**Critérios de Aceitação**:
- [ ] CreateQuestaoForm recebe torneio_id
- [ ] torneio_id enviado na requisição
- [ ] Questão criada com torneio_id
- [ ] Questão aparece imediatamente na aba
- [ ] Testes passando

---

### Task 4.2: Atualizar QuestoesControllerRefactored
**Objetivo**: Garantir que controller trata torneio_id
**Descrição**:
- Revisar QuestoesControllerRefactored.js
- Garantir que torneio_id é validado
- Garantir que torneio_id é salvo no banco
- Implementar filtro por torneio_id
- Testar endpoints

**Critérios de Aceitação**:
- [ ] Controller atualizado
- [ ] torneio_id validado
- [ ] torneio_id salvo corretamente
- [ ] Filtro funcionando
- [ ] Testes passando

---

### Task 4.3: Atualizar questoesService
**Objetivo**: Implementar lógica de integração
**Descrição**:
- Revisar questoesService.js
- Adicionar função: createQuestionForTournament
- Adicionar função: getQuestionsByTournament
- Adicionar função: duplicateQuestion
- Implementar validações

**Critérios de Aceitação**:
- [ ] Service atualizado
- [ ] Funções implementadas
- [ ] Validações OK
- [ ] Testes passando

---

## Fase 5: Validações e Testes

### Task 5.1: Implementar Validações de Negócio
**Objetivo**: Garantir integridade dos dados
**Descrição**:
- Implementar validação: data final > data inicial
- Implementar validação: torneio sem nome
- Implementar validação: torneio sem disciplina
- Implementar validação: torneio publicado sem questões
- Implementar validação: limite de participantes inválido

**Critérios de Aceitação**:
- [ ] Todas as validações implementadas
- [ ] Mensagens de erro claras
- [ ] Testes passando
- [ ] Feedback visual OK

---

### Task 5.2: Testes Unitários
**Objetivo**: Testar componentes e services
**Descrição**:
- Criar testes para WizardContext
- Criar testes para wizardService
- Criar testes para tournamentDetailsService
- Criar testes para validações
- Atingir 80% de cobertura

**Critérios de Aceitação**:
- [ ] Testes criados
- [ ] Todos passando
- [ ] Cobertura >= 80%
- [ ] Sem warnings

---

### Task 5.3: Testes de Integração
**Objetivo**: Testar fluxos completos
**Descrição**:
- Testar: Criar torneio → Adicionar questões → Verificar torneio_id
- Testar: Criar torneio → Inscrever participante → Verificar ranking
- Testar: Criar torneio → Completar tentativa → Verificar certificado
- Testar: Editar torneio → Verificar atualização em tempo real

**Critérios de Aceitação**:
- [ ] Todos os fluxos testados
- [ ] Testes passando
- [ ] Sem erros de integração
- [ ] Documentação de testes

---

### Task 5.4: Testes E2E
**Objetivo**: Testar fluxo completo do usuário
**Descrição**:
- Criar teste: Admin cria torneio via wizard
- Criar teste: Admin adiciona questões
- Criar teste: Admin gerencia participantes
- Criar teste: Admin visualiza ranking
- Usar Cypress ou Playwright

**Critérios de Aceitação**:
- [ ] Testes E2E criados
- [ ] Todos passando
- [ ] Sem flakiness
- [ ] Documentação de testes

---

## Fase 6: Auditoria e Documentação

### Task 6.1: Auditoria de Integração Completa
**Objetivo**: Validar todos os fluxos
**Descrição**:
- Validar: Fluxo Admin → Torneio → Questões
- Validar: Fluxo Torneio → Participantes
- Validar: Fluxo Participantes → Ranking
- Validar: Fluxo Ranking → Resultados
- Criar relatório de auditoria

**Critérios de Aceitação**:
- [ ] Todos os fluxos validados
- [ ] Relatório criado
- [ ] Sem inconsistências
- [ ] Documentação atualizada

---

### Task 6.2: Documentação de Usuário
**Objetivo**: Criar guias para administradores
**Descrição**:
- Criar guia: Como criar um torneio
- Criar guia: Como adicionar questões
- Criar guia: Como gerenciar participantes
- Criar guia: Como visualizar ranking
- Criar guia: Como gerar certificados

**Critérios de Aceitação**:
- [ ] Guias criados
- [ ] Screenshots inclusos
- [ ] Exemplos práticos
- [ ] Publicado no wiki/docs

---

### Task 6.3: Documentação Técnica
**Objetivo**: Documentar arquitetura e APIs
**Descrição**:
- Documentar: Arquitetura de componentes
- Documentar: APIs e endpoints
- Documentar: Fluxo de dados
- Documentar: Validações
- Criar diagrama de fluxo

**Critérios de Aceitação**:
- [ ] Documentação completa
- [ ] Diagramas inclusos
- [ ] Exemplos de código
- [ ] Publicado no repositório

---

### Task 6.4: Relatório Final
**Objetivo**: Consolidar entregáveis
**Descrição**:
- Criar relatório de implementação
- Listar todas as mudanças
- Listar testes realizados
- Listar problemas encontrados e soluções
- Listar recomendações futuras

**Critérios de Aceitação**:
- [ ] Relatório criado
- [ ] Completo e detalhado
- [ ] Assinado e datado
- [ ] Publicado

---

## Resumo de Entregáveis

### Frontend
- ✓ TournamentWizard (4 passos)
- ✓ TournamentDetails (6 abas)
- ✓ Componentes compartilhados
- ✓ Services de integração
- ✓ Validações em tempo real

### Backend
- ✓ Novos endpoints de torneios
- ✓ Integração com questões
- ✓ Services de negócio
- ✓ Validações de negócio
- ✓ Middleware de autenticação

### Testes
- ✓ Testes unitários
- ✓ Testes de integração
- ✓ Testes E2E
- ✓ Cobertura >= 80%

### Documentação
- ✓ Guias de usuário
- ✓ Documentação técnica
- ✓ Diagramas de fluxo
- ✓ Relatório final

---

## Timeline Estimada

| Fase | Duração | Status |
|------|---------|--------|
| Fase 1: Preparação | 2 dias | Pendente |
| Fase 2: Wizard | 5 dias | Pendente |
| Fase 3: Detalhes | 5 dias | Pendente |
| Fase 4: Integração | 2 dias | Pendente |
| Fase 5: Testes | 3 dias | Pendente |
| Fase 6: Auditoria | 2 dias | Pendente |
| **Total** | **19 dias** | **Pendente** |

---

## Notas Importantes

- Manter compatibilidade com sistema existente
- Não criar modelos legados
- Utilizar apenas modelos atuais
- Garantir que Questao.js continua como única fonte de questões
- Testar em múltiplos navegadores
- Testar responsividade em mobile/tablet/desktop
- Documentar todas as mudanças
- Revisar código antes de merge
