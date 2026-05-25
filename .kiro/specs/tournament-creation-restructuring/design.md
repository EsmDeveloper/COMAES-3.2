# Design - Reestruturação do Fluxo de Criação de Torneios

## Arquitetura de Componentes

### Frontend - Estrutura de Pastas
```
FrontEnd/src/Administrador/
├── TournamentWizard/
│   ├── TournamentWizard.jsx          (Componente principal do wizard)
│   ├── Step1BasicInfo.jsx             (Passo 1: Informações Básicas)
│   ├── Step2Configuration.jsx         (Passo 2: Configuração)
│   ├── Step3Questions.jsx             (Passo 3: Questões)
│   ├── Step4Review.jsx                (Passo 4: Revisão)
│   ├── WizardContext.js               (Context para estado do wizard)
│   └── wizardService.js               (Lógica de negócio)
├── TournamentDetails/
│   ├── TournamentDetails.jsx          (Página principal)
│   ├── TabOverview.jsx                (Aba: Visão Geral)
│   ├── TabQuestions.jsx               (Aba: Questões)
│   ├── TabParticipants.jsx            (Aba: Participantes)
│   ├── TabRanking.jsx                 (Aba: Ranking)
│   ├── TabStatistics.jsx              (Aba: Estatísticas)
│   ├── TabSettings.jsx                (Aba: Configurações)
│   └── tournamentDetailsService.js    (Lógica de negócio)
└── shared/
    ├── ProgressBar.jsx                (Barra de progresso)
    ├── ValidationMessage.jsx          (Mensagens de validação)
    └── LoadingState.jsx               (Estados de carregamento)
```

### Backend - Estrutura de Pastas
```
BackEnd/
├── controllers/
│   ├── TorneoController.js            (Atualizado com novos endpoints)
│   └── QuestoesControllerRefactored.js (Integração com torneio_id)
├── routes/
│   ├── tournamentsRoutes.js           (Rotas de torneios)
│   └── questoesRoutesRefactored.js    (Rotas de questões)
├── services/
│   ├── tournamentService.js           (Lógica de negócio de torneios)
│   └── questionsService.js            (Lógica de negócio de questões)
└── middlewares/
    └── tournamentValidation.js        (Validações de torneio)
```

---

## Fluxo de Dados

### Criação de Torneio (Wizard)
```
Step1 (Básico) → WizardContext
                    ↓
Step2 (Config) → WizardContext
                    ↓
Step3 (Questões) → WizardContext
                    ↓
Step4 (Revisão) → POST /api/tournaments
                    ↓
Backend: TorneoController.create()
                    ↓
Database: INSERT INTO torneios
                    ↓
Response: { torneio_id, status: 'created' }
                    ↓
Frontend: Redirect to TournamentDetails
```

### Adição de Questões
```
TournamentDetails (Tab: Questões)
                    ↓
CreateQuestaoForm (com torneio_id pré-preenchido)
                    ↓
POST /api/questoes (com torneio_id)
                    ↓
Backend: QuestoesControllerRefactored.create()
                    ↓
Database: INSERT INTO questoes (torneio_id, ...)
                    ↓
Response: { questao_id, torneio_id }
                    ↓
Frontend: Atualiza lista de questões automaticamente
```

---

## Componentes Principais

### 1. TournamentWizard.jsx
```javascript
Props:
  - onComplete: (tournamentData) => void
  - initialData?: TournamentData

State:
  - currentStep: 1-4
  - formData: WizardFormData
  - errors: ValidationErrors
  - isSaving: boolean
  - draftId: string

Methods:
  - handleNext()
  - handlePrevious()
  - handleSave()
  - handleDraftSave()
  - validateStep()
```

### 2. WizardContext
```javascript
Context Values:
  - formData: WizardFormData
  - currentStep: number
  - errors: ValidationErrors
  - setFormData: (data) => void
  - setCurrentStep: (step) => void
  - setErrors: (errors) => void
  - saveDraft: () => Promise
  - submitWizard: () => Promise
```

### 3. TournamentDetails.jsx
```javascript
Props:
  - tournamentId: string

State:
  - tournament: TournamentData
  - activeTab: 'overview' | 'questions' | 'participants' | 'ranking' | 'statistics' | 'settings'
  - isLoading: boolean
  - error: string | null

Methods:
  - loadTournament()
  - handleTabChange()
  - handleTournamentUpdate()
  - handleQuestionAdd()
  - handleQuestionRemove()
```

### 4. wizardService.js
```javascript
Functions:
  - validateBasicInfo(data): ValidationResult
  - validateConfiguration(data): ValidationResult
  - validateQuestions(data): ValidationResult
  - saveDraft(data): Promise<draftId>
  - loadDraft(draftId): Promise<data>
  - submitTournament(data): Promise<tournament>
  - calculateTotalPoints(questions): number
```

### 5. tournamentDetailsService.js
```javascript
Functions:
  - getTournament(id): Promise<tournament>
  - updateTournament(id, data): Promise<tournament>
  - getTournamentQuestions(id): Promise<questions[]>
  - getTournamentParticipants(id): Promise<participants[]>
  - getTournamentRanking(id): Promise<ranking[]>
  - getTournamentStatistics(id): Promise<statistics>
```

---

## Estrutura de Dados

### WizardFormData
```javascript
{
  // Passo 1
  basicInfo: {
    nome: string,
    descricao: string,
    disciplina: string,
    modalidade: string,
    nivel: string,
    imagem: File | null,
    regras: string
  },
  
  // Passo 2
  configuration: {
    dataInicio: Date,
    dataEncerramento: Date,
    maxParticipantes: number,
    maxTentativas: number,
    tempoLimite: number,
    rankingAtivo: boolean,
    certificadosAtivos: boolean
  },
  
  // Passo 3
  questions: {
    questoes: Questao[],
    totalPontos: number,
    distribuicaoDificuldade: {
      facil: number,
      medio: number,
      dificil: number
    }
  },
  
  // Passo 4
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

## Endpoints da API

### Torneios
```
POST   /api/tournaments                 (Criar torneio)
GET    /api/tournaments/:id             (Obter torneio)
PUT    /api/tournaments/:id             (Atualizar torneio)
DELETE /api/tournaments/:id             (Deletar torneio)
GET    /api/tournaments/:id/questions   (Listar questões do torneio)
GET    /api/tournaments/:id/participants (Listar participantes)
GET    /api/tournaments/:id/ranking     (Obter ranking)
GET    /api/tournaments/:id/statistics  (Obter estatísticas)

POST   /api/tournaments/:id/draft       (Salvar rascunho)
GET    /api/tournaments/:id/draft       (Carregar rascunho)
```

### Questões (Integração)
```
POST   /api/questoes                    (Criar questão com torneio_id)
GET    /api/questoes?torneio_id=:id     (Listar questões do torneio)
PUT    /api/questoes/:id                (Atualizar questão)
DELETE /api/questoes/:id                (Deletar questão)
POST   /api/questoes/:id/duplicate      (Duplicar questão)
```

---

## Validações

### Passo 1 - Informações Básicas
```javascript
{
  nome: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-áéíóúãõç]+$/
  },
  descricao: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  disciplina: {
    required: true,
    enum: ['Matemática', 'Programação', 'Inglês', ...]
  },
  modalidade: {
    required: true,
    enum: ['Individual', 'Equipe']
  },
  nivel: {
    required: true,
    enum: ['Iniciante', 'Intermediário', 'Avançado']
  }
}
```

### Passo 2 - Configuração
```javascript
{
  dataInicio: {
    required: true,
    type: 'date',
    minDate: today
  },
  dataEncerramento: {
    required: true,
    type: 'date',
    minDate: dataInicio,
    custom: (value, dataInicio) => value > dataInicio
  },
  maxParticipantes: {
    required: true,
    type: 'number',
    min: 1,
    max: 1000
  },
  maxTentativas: {
    required: true,
    type: 'number',
    min: 1,
    max: 100
  },
  tempoLimite: {
    required: true,
    type: 'number',
    min: 1,
    max: 480 // 8 horas em minutos
  }
}
```

---

## Estados de UI

### Wizard
- `loading`: Carregando dados iniciais
- `editing`: Editando passo atual
- `saving`: Salvando rascunho
- `validating`: Validando passo
- `error`: Erro na validação
- `success`: Passo completado com sucesso

### TournamentDetails
- `loading`: Carregando dados do torneio
- `loaded`: Dados carregados
- `editing`: Editando configurações
- `saving`: Salvando alterações
- `error`: Erro ao carregar/salvar
- `empty`: Sem dados para exibir

---

## Integração com Questao.js

### Garantias
1. Toda questão criada dentro do torneio recebe `torneio_id`
2. Questões aparecem imediatamente na aba Questões
3. Não é necessário selecionar o torneio novamente
4. Sistema utiliza exclusivamente `Questao.js`

### Implementação
```javascript
// CreateQuestaoForm.jsx
// Recebe torneio_id como prop
<CreateQuestaoForm 
  torneoId={tournamentId}
  onQuestionCreated={handleQuestionAdded}
/>

// questionsService.js
// Adiciona torneio_id automaticamente
async function createQuestion(questionData, torneoId) {
  return await api.post('/api/questoes', {
    ...questionData,
    torneio_id: torneoId
  });
}
```

---

## Fluxo de Auditoria

### Verificações
1. ✓ Fluxo Admin → Torneio → Questões
2. ✓ Fluxo Torneio → Participantes
3. ✓ Fluxo Participantes → Ranking
4. ✓ Fluxo Ranking → Resultados
5. ✓ Todos os módulos utilizam os mesmos IDs
6. ✓ Relacionamentos mantidos

### Testes de Integração
- Criar torneio → Adicionar questões → Verificar torneio_id
- Criar torneio → Inscrever participante → Verificar ranking
- Criar torneio → Completar tentativa → Verificar certificado
