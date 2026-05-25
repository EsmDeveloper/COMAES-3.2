# Spec: Reestruturação Completa do Fluxo de Criação de Torneios

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Documentos](#documentos)
3. [Status](#status)
4. [Próximos Passos](#próximos-passos)

---

## Visão Geral

Este spec detalha a reestruturação completa do fluxo de criação de torneios, transformando um processo fragmentado em uma experiência profissional, intuitiva e totalmente integrada.

### Problema
- Fluxo fragmentado entre múltiplas áreas
- Administrador precisa navegar por várias seções
- Confusão operacional e redução de produtividade
- Falta de integração automática

### Solução
- Wizard multi-step de criação (4 passos)
- Página unificada de gestão (6 abas)
- Integração automática com sistema de questões
- Melhorias significativas de UX

### Resultado Esperado
O administrador consegue criar um torneio, configurar regras, adicionar questões, gerenciar participantes e acompanhar ranking tudo num fluxo contínuo, intuitivo e profissional.

---

## Documentos

### 1. [requirements.md](./requirements.md)
**Requisitos Funcionais e Não-Funcionais**

Contém:
- Requisitos funcionais detalhados (RF1-RF5)
- Requisitos não-funcionais (RNF1-RNF4)
- Fluxos de integração a validar
- Critérios de aceitação

**Leia quando**: Precisa entender o que deve ser implementado

---

### 2. [design.md](./design.md)
**Arquitetura, Componentes e Estrutura de Dados**

Contém:
- Arquitetura de componentes (Frontend e Backend)
- Fluxo de dados
- Componentes principais com props e métodos
- Estrutura de dados (WizardFormData, TournamentData)
- Endpoints da API
- Validações
- Estados de UI
- Integração com Questao.js

**Leia quando**: Precisa entender como implementar

---

### 3. [tasks.md](./tasks.md)
**Tarefas Detalhadas e Checklist**

Contém:
- 6 fases de implementação
- 24 tarefas específicas
- Critérios de aceitação para cada tarefa
- Timeline estimada
- Entregáveis consolidados

**Leia quando**: Precisa saber o que fazer passo a passo

---

## Status

### Fase 1: Preparação e Auditoria
- [ ] Task 1.1: Auditoria de Integração Atual
- [ ] Task 1.2: Preparar Backend para Integração
- [ ] Task 1.3: Preparar Frontend - Estrutura de Pastas

### Fase 2: Wizard Multi-Step
- [ ] Task 2.1: Criar WizardContext e wizardService
- [ ] Task 2.2: Implementar Passo 1 - Informações Básicas
- [ ] Task 2.3: Implementar Passo 2 - Configuração
- [ ] Task 2.4: Implementar Passo 3 - Questões
- [ ] Task 2.5: Implementar Passo 4 - Revisão
- [ ] Task 2.6: Criar Componente Principal TournamentWizard
- [ ] Task 2.7: Criar Componentes Compartilhados

### Fase 3: Página de Detalhes do Torneio
- [ ] Task 3.1: Criar TournamentDetails Principal
- [ ] Task 3.2: Implementar Aba - Visão Geral
- [ ] Task 3.3: Implementar Aba - Questões
- [ ] Task 3.4: Implementar Aba - Participantes
- [ ] Task 3.5: Implementar Aba - Ranking
- [ ] Task 3.6: Implementar Aba - Estatísticas
- [ ] Task 3.7: Implementar Aba - Configurações
- [ ] Task 3.8: Criar tournamentDetailsService

### Fase 4: Integração com Questões
- [ ] Task 4.1: Garantir Integração Automática
- [ ] Task 4.2: Atualizar QuestoesControllerRefactored
- [ ] Task 4.3: Atualizar questoesService

### Fase 5: Validações e Testes
- [ ] Task 5.1: Implementar Validações de Negócio
- [ ] Task 5.2: Testes Unitários
- [ ] Task 5.3: Testes de Integração
- [ ] Task 5.4: Testes E2E

### Fase 6: Auditoria e Documentação
- [ ] Task 6.1: Auditoria de Integração Completa
- [ ] Task 6.2: Documentação de Usuário
- [ ] Task 6.3: Documentação Técnica
- [ ] Task 6.4: Relatório Final

---

## Próximos Passos

1. **Revisar Spec**: Leia os três documentos (requirements, design, tasks)
2. **Iniciar Fase 1**: Comece com a auditoria de integração
3. **Criar Estrutura**: Prepare backend e frontend
4. **Implementar Wizard**: Desenvolva os 4 passos
5. **Implementar Detalhes**: Desenvolva as 6 abas
6. **Integrar Questões**: Garanta integração automática
7. **Testar**: Execute testes unitários, integração e E2E
8. **Auditar**: Valide todos os fluxos
9. **Documentar**: Crie guias e documentação técnica
10. **Entregar**: Relatório final e publicação

---

## Restrições

- ✓ Não criar modelos legados
- ✓ Não criar tabelas duplicadas
- ✓ Utilizar apenas modelos atuais
- ✓ Manter compatibilidade com sistema existente
- ✓ Garantir que Questao.js continua como única fonte de questões

---

## Entregáveis

### Frontend
- Novo formulário Wizard de criação de torneios
- Página unificada de gestão do torneio
- Componentes compartilhados
- Services de integração

### Backend
- Novos endpoints de torneios
- Integração automática com Questao.js
- Services de negócio
- Validações de negócio

### Testes
- Testes unitários (80%+ cobertura)
- Testes de integração
- Testes E2E

### Documentação
- Guias de usuário
- Documentação técnica
- Diagramas de fluxo
- Relatório final

---

## Timeline

| Fase | Duração | Status |
|------|---------|--------|
| Fase 1: Preparação | 2 dias | ⏳ Pendente |
| Fase 2: Wizard | 5 dias | ⏳ Pendente |
| Fase 3: Detalhes | 5 dias | ⏳ Pendente |
| Fase 4: Integração | 2 dias | ⏳ Pendente |
| Fase 5: Testes | 3 dias | ⏳ Pendente |
| Fase 6: Auditoria | 2 dias | ⏳ Pendente |
| **Total** | **19 dias** | **⏳ Pendente** |

---

## Contato e Suporte

Para dúvidas ou esclarecimentos sobre este spec, consulte:
- Requirements: [requirements.md](./requirements.md)
- Design: [design.md](./design.md)
- Tasks: [tasks.md](./tasks.md)

---

**Última atualização**: 22 de Maio de 2026
**Status**: Pronto para implementação
