# 🏗️ Arquitetura - Reestruturação do Fluxo de Criação de Torneios

**Data**: 22 de Maio de 2026  
**Status**: Pronto para Implementação  
**Versão**: 1.0

---

## 📐 Diagrama de Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              TournamentWizard Component                  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │   Step 1    │→ │   Step 2    │→ │   Step 3    │→ ... │   │
│  │  │  Básico     │  │  Config     │  │  Questões   │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │         ↓              ↓              ↓                   │   │
│  │    WizardContext (State Management)                      │   │
│  │         ↓              ↓              ↓                   │   │
│  │    wizardService (Validações + Auto-save)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           TournamentDetails Component                    │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │   │
│  │  │ Aba1 │ │ Aba2 │ │ Aba3 │ │ Aba4 │ │ Aba5 │ │ Aba6 │ │   │
│  │  │ Over │ │Quest │ │Part  │ │Rank  │ │Stat  │ │Conf  │ │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │   │
│  │         ↓              ↓              ↓                   │   │
│  │    tournamentDetailsService (Lógica de Negócio)         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    API REST (HTTP/HTTPS)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Routes Layer                          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  POST   /api/tournaments                                 │   │
│  │  GET    /api/tournaments/:id                             │   │
│  │  PUT    /api/tournaments/:id                             │   │
│  │  DELETE /api/tournaments/:id                             │   │
│  │  GET    /api/tournaments/:id/questions                   │   │
│  │  GET    /api/tournaments/:id/participants                │   │
│  │  GET    /api/tournaments/:id/ranking                     │   │
│  │  GET    /api/tournaments/:id/statistics                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Controllers Layer                        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │ TorneoController │  │ QuestoesControllerRefactored│ │   │
│  │  │ (Atualizado)     │  │ (Atualizado)                │ │   │
│  │  └──────────────────┘  └──────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Services Layer                          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │ tournamentService│  │ questionsService            │ │   │
│  │  │ (Novo)           │  │ (Novo)                      │ │   │
│  │  └──────────────────┘  └──────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │ auth.js          │  │ tournamentValidation.js      │ │   │
│  │  │ (Existente)      │  │ (Novo)                       │ │   │
│  │  └──────────────────┘  └──────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Models Layer                            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │ Torneio.js       │  │ Questao.js                   │ │   │
│  │  │ (Existente)      │  │ (Existente - Única Fonte)    │ │   │
│  │  └──────────────────┘  └──────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Database Layer                          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │ torneios table   │  │ questoes table               │ │   │
│  │  │ (Existente)      │  │ (Existente)                  │ │   │
│  │  └──────────────────┘  └──────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas - Frontend

```
FrontEnd/src/Administrador/
│
├── TournamentWizard/
│   ├── TournamentWizard.jsx          ← Componente principal
│   ├── Step1BasicInfo.jsx            ← Passo 1: Informações Básicas
│   ├── Step2Configuration.jsx        ← Passo 2: Configuração
│   ├── Step3Questions.jsx            ← Passo 3: Questões
│   ├── Step4Review.jsx               ← Passo 4: Revisão
│   ├── WizardContext.js              ← Context API para estado
│   └── wizardService.js              ← Lógica de validação e auto-save
│
├── TournamentDetails/
│   ├── TournamentDetails.jsx         ← Componente principal (6 abas)
│   ├── TabOverview.jsx               ← Aba 1: Visão Geral
│   ├── TabQuestions.jsx              ← Aba 2: Questões
│   ├── TabParticipants.jsx           ← Aba 3: Participantes
│   ├── TabRanking.jsx                ← Aba 4: Ranking
│   ├── TabStatistics.jsx             ← Aba 5: Estatísticas
│   ├── TabSettings.jsx               ← Aba 6: Configurações
│   └── tournamentDetailsService.js   ← Lógica de negócio
│
└── shared/
    ├── ProgressBar.jsx               ← Barra de progresso
    ├── ValidationMessage.jsx         ← Mensagens de validação
    └── LoadingState.jsx              ← Estados de carregamento
```

---

## 📁 Estrutura de Pastas - Backend

```
BackEnd/
│
├── controllers/
│   ├── TorneoController.js           ← Atualizado com novos endpoints
│   └── QuestoesControllerRefactored.js ← Atualizado para torneio_id
│
├── routes/
│   ├── tournamentsRoutes.js          ← Rotas de torneios (atualizado)
│   └── questoesRoutesRefactored.js   ← Rotas de questões (atualizado)
│
├── services/
│   ├── tournamentService.js          ← Novo: Lógica de torneios
│   └── questionsService.js           ← Novo: Lógica de questões
│
├── middlewares/
│   ├── auth.js                       ← Existente: Autenticação
│   ├── isAdmin.js                    ← Existente: Autorização
│   └── tournamentValidation.js       ← Novo: Validações de torneio
│
└── models/
    ├── Torneio.js                    ← Existente: Modelo de torneio
    └── Questao.js                    ← Existente: Modelo de questão
```

---

## 🔄 Fluxo de Dados - Criação de Torneio

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND - Wizard                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Step1BasicInfo.jsx
                    (Nome, Descrição, etc)
                              ↓
                    WizardContext.setFormData()
                              ↓
                    Step2Configuration.jsx
                    (Datas, Limites, etc)
                              ↓
                    WizardContext.setFormData()
                              ↓
                    Step3Questions.jsx
                    (Questões do torneio)
                              ↓
                    WizardContext.setFormData()
                              ↓
                    Step4Review.jsx
                    (Resumo completo)
                              ↓
                    wizardService.submitTournament()
                              ↓
                    POST /api/tournaments
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - Controller                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    TorneoController.create()
                              ↓
                    tournamentValidation middleware
                    (Validar dados)
                              ↓
                    tournamentService.createTournament()
                              ↓
                    Torneio.create() (Sequelize)
                              ↓
                    INSERT INTO torneios
                              ↓
                    Response: { torneio_id, status: 'created' }
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND - Redirect                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Redirect to TournamentDetails
                    (com torneio_id)
                              ↓
                    TournamentDetails.jsx
                    (Carrega dados do torneio)
                              ↓
                    tournamentDetailsService.getTournament()
                              ↓
                    GET /api/tournaments/:id
                              ↓
                    Exibe página com 6 abas
```

---

## 🔄 Fluxo de Dados - Adição de Questões

```
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND - TournamentDetails                        │
│              (Aba: Questões)                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    TabQuestions.jsx
                    (Exibe lista de questões)
                              ↓
                    Clica em "Adicionar Questão"
                              ↓
                    CreateQuestaoForm.jsx
                    (Recebe torneio_id como prop)
                              ↓
                    Preenche formulário
                              ↓
                    questionsService.createQuestion()
                    (com torneio_id)
                              ↓
                    POST /api/questoes
                    { ...questionData, torneio_id }
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - Controller                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    QuestoesControllerRefactored.create()
                              ↓
                    Valida torneio_id
                              ↓
                    questionsService.createQuestion()
                              ↓
                    Questao.create() (Sequelize)
                    { ...data, torneio_id }
                              ↓
                    INSERT INTO questoes
                    (com torneio_id)
                              ↓
                    Response: { questao_id, torneio_id }
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND - Update                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    TabQuestions.jsx
                    (Atualiza lista automaticamente)
                              ↓
                    Questão aparece na lista
                    (com torneio_id confirmado)
```

---

## 🔗 Integração de Componentes

### WizardContext
```javascript
Context Values:
├── formData: WizardFormData
├── currentStep: number (1-4)
├── errors: ValidationErrors
├── setFormData: (data) => void
├── setCurrentStep: (step) => void
├── setErrors: (errors) => void
├── saveDraft: () => Promise
└── submitWizard: () => Promise
```

### wizardService
```javascript
Functions:
├── validateBasicInfo(data): ValidationResult
├── validateConfiguration(data): ValidationResult
├── validateQuestions(data): ValidationResult
├── saveDraft(data): Promise<draftId>
├── loadDraft(draftId): Promise<data>
├── submitTournament(data): Promise<tournament>
└── calculateTotalPoints(questions): number
```

### tournamentDetailsService
```javascript
Functions:
├── getTournament(id): Promise<tournament>
├── updateTournament(id, data): Promise<tournament>
├── getTournamentQuestions(id): Promise<questions[]>
├── getTournamentParticipants(id): Promise<participants[]>
├── getTournamentRanking(id): Promise<ranking[]>
└── getTournamentStatistics(id): Promise<statistics>
```

---

## 📊 Estrutura de Dados

### WizardFormData
```javascript
{
  basicInfo: {
    nome: string,
    descricao: string,
    disciplina: string,
    modalidade: string,
    nivel: string,
    imagem: File | null,
    regras: string
  },
  configuration: {
    dataInicio: Date,
    dataEncerramento: Date,
    maxParticipantes: number,
    maxTentativas: number,
    tempoLimite: number,
    rankingAtivo: boolean,
    certificadosAtivos: boolean
  },
  questions: {
    questoes: Questao[],
    totalPontos: number,
    distribuicaoDificuldade: {
      facil: number,
      medio: number,
      dificil: number
    }
  },
  review: {
    confirmado: boolean,
    timestamp: Date
  }
}
```

### TournamentData (Banco de Dados)
```javascript
{
  id: UUID,
  nome: string,
  descricao: string,
  disciplina: string,
  modalidade: string,
  nivel: string,
  imagem: string | null,
  regras: string | null,
  dataInicio: Date,
  dataEncerramento: Date,
  maxParticipantes: number,
  maxTentativas: number,
  tempoLimite: number,
  rankingAtivo: boolean,
  certificadosAtivos: boolean,
  status: 'draft' | 'active' | 'finished',
  criadoEm: Date,
  atualizadoEm: Date,
  criadoPor: UUID
}
```

---

## 🔐 Segurança e Validação

### Middleware de Autenticação
```
┌─────────────────────────────────────────────────────────────────┐
│                    auth.js Middleware                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Verifica token JWT                                           │
│  2. Extrai user_id                                               │
│  3. Passa para próximo middleware                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    isAdmin.js Middleware                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Verifica se user é admin                                     │
│  2. Retorna 403 se não for admin                                 │
│  3. Passa para próximo middleware                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              tournamentValidation.js Middleware                  │
├─────────────────────────────────────────────────────────────────┤
│  1. Valida dados do torneio                                      │
│  2. Valida datas (final > inicial)                               │
│  3. Valida limites (1-1000 participantes)                        │
│  4. Retorna 400 se inválido                                      │
│  5. Passa para controller                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    TorneoController.create()
```

### Validações em Tempo Real (Frontend)
```
┌─────────────────────────────────────────────────────────────────┐
│                    Step1BasicInfo.jsx                            │
├─────────────────────────────────────────────────────────────────┤
│  onChange → wizardService.validateBasicInfo()                    │
│  ↓                                                                │
│  Validações:                                                     │
│  ├─ Nome: required, 3-100 chars, pattern                         │
│  ├─ Descrição: required, 10-500 chars                            │
│  ├─ Disciplina: required, enum                                   │
│  ├─ Modalidade: required, enum                                   │
│  └─ Nível: required, enum                                        │
│  ↓                                                                │
│  Exibe mensagens de erro em tempo real                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Estratégia de Testes

### Testes Unitários
```
wizardService.test.js
├─ validateBasicInfo()
├─ validateConfiguration()
├─ validateQuestions()
├─ saveDraft()
└─ loadDraft()

tournamentDetailsService.test.js
├─ getTournament()
├─ updateTournament()
├─ getTournamentQuestions()
├─ getTournamentParticipants()
├─ getTournamentRanking()
└─ getTournamentStatistics()

TournamentWizard.test.js
├─ Renderiza 4 passos
├─ Navega entre passos
├─ Valida antes de avançar
└─ Submete dados corretamente
```

### Testes de Integração
```
tournament-integration.test.js
├─ Criar torneio → Adicionar questões → Verificar torneio_id
├─ Criar torneio → Inscrever participante → Verificar ranking
├─ Criar torneio → Completar tentativa → Verificar certificado
└─ Editar torneio → Verificar atualização em tempo real
```

### Testes E2E
```
tournament-e2e.test.js (Cypress/Playwright)
├─ Admin cria torneio via wizard
├─ Admin adiciona questões
├─ Admin gerencia participantes
├─ Admin visualiza ranking
└─ Admin gera certificados
```

---

## 📈 Performance

### Otimizações
```
Frontend:
├─ Code splitting por rota
├─ Lazy loading de componentes
├─ Memoização de componentes
├─ Debounce em validações
└─ Cache de dados

Backend:
├─ Índices no banco de dados
├─ Paginação em listagens
├─ Cache de queries
├─ Connection pooling
└─ Compressão de respostas
```

### Métricas Esperadas
```
Frontend:
├─ Carregamento do wizard: < 2s
├─ Auto-save: < 500ms
├─ Validação: < 100ms
└─ Renderização: 60 FPS

Backend:
├─ Criar torneio: < 500ms
├─ Listar questões: < 1s
├─ Obter ranking: < 2s
└─ Atualizar torneio: < 500ms
```

---

## 🔄 Ciclo de Vida do Torneio

```
┌─────────────────────────────────────────────────────────────────┐
│                    DRAFT (Rascunho)                              │
├─────────────────────────────────────────────────────────────────┤
│  • Admin cria torneio no wizard                                  │
│  • Auto-save de rascunho                                         │
│  • Pode editar a qualquer momento                                │
│  • Não aparece para participantes                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Admin clica "Publicar"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ACTIVE (Ativo)                                │
├─────────────────────────────────────────────────────────────────┤
│  • Torneio publicado                                             │
│  • Participantes podem se inscrever                              │
│  • Participantes podem fazer tentativas                          │
│  • Ranking atualiza em tempo real                                │
│  • Admin pode editar configurações                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Data de encerramento atingida
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FINISHED (Finalizado)                         │
├─────────────────────────────────────────────────────────────────┤
│  • Torneio encerrado                                             │
│  • Participantes não podem mais fazer tentativas                 │
│  • Ranking final disponível                                      │
│  • Certificados gerados                                          │
│  • Admin pode visualizar estatísticas                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📞 Referências

- **Spec Principal**: `.kiro/specs/tournament-creation-restructuring/spec.md`
- **Requisitos**: `.kiro/specs/tournament-creation-restructuring/requirements.md`
- **Design**: `.kiro/specs/tournament-creation-restructuring/design.md`
- **Tasks**: `.kiro/specs/tournament-creation-restructuring/tasks.md`
- **Auditoria**: `TOURNAMENT_RESTRUCTURING_AUDIT.md`
- **Sumário**: `TOURNAMENT_RESTRUCTURING_SUMMARY.md`

---

**Última Atualização**: 22 de Maio de 2026  
**Status**: Pronto para Implementação  
**Versão**: 1.0
