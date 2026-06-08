# 📋 MAPEAMENTO COMPLETO - FICHEIROS FLUXO DE QUESTÕES

**Data**: 7 de Junho de 2026  
**Sistema**: COMAES 3.2  
**Objetivo**: Localizar TODOS os ficheiros relacionados ao fluxo completo das questões  
**Status**: ✅ MAPEAMENTO CONCLUÍDO

---

## 📊 RESUMO EXECUTIVO

- **Total de Ficheiros Identificados**: 150+
- **Componentes Frontend**: 70+
- **Controllers Backend**: 15
- **Modelos de Dados**: 35+
- **Rotas/Endpoints**: 18
- **Serviços**: 15+
- **Migrations**: 15+

---

# 🎯 PARTE 1: FRONTEND

## 📖 PÁGINAS PRINCIPAIS

### Questões & Blocos
```
FrontEnd/src/Paginas/Secundarias/
├── Teste.jsx                              ← Main test/question flow page
├── MinhasQuestoes.jsx                     ← User's questions
├── Dashboard.jsx                          ← Student dashboard
└── Home.jsx                               ← Home page

FrontEnd/src/Administrador/
├── AdminDashboard.jsx                     ← Admin main dashboard (13 tabs)
├── AdminDashboardRestructured.jsx         ← Alternative admin dashboard
└── AdminStats.jsx                         ← Statistics & metrics
```

### Torneios
```
FrontEnd/src/Paginas/Secundarias/
├── Torneios.jsx                           ← Tournament management
├── EntrarTorneio.jsx                      ← Join tournament
├── Ranking.jsx                            ← User ranking
├── RankingCompleto.jsx                    ← Complete ranking
└── RankingGlobal.jsx                      ← Global ranking

FrontEnd/src/Administrador/
└── TorneiosTab.jsx                        ← Admin tournament management
```

### Colaborador
```
FrontEnd/src/Paginas/Secundarias/
├── ColaboradorDashboard.jsx               ← V1 dashboard
├── ColaboradorDashboardV2.jsx             ← V2 dashboard
├── ColaboradorDashboardV2_NEW.jsx         ← V3 dashboard
└── ColaboradorBlocosTab.jsx               ← Blocks tab

FrontEnd/src/Colaborador/
└── ColaboradorDashboard.jsx               ← Component version

FrontEnd/src/Paginas/Primarias/
└── CollaboratorRegisterForm.jsx           ← Registration form
```

---

## 📝 FORMULÁRIOS & MODAIS

### Criar/Editar Questões
```
FrontEnd/src/Administrador/
├── CreateQuestaoForm.jsx                  ← ✅ CORRIGIDO - Create questions
├── EditQuestaoForm.jsx                    ← Edit questions
├── CreateQuestaoTesteForm.jsx             ← Create test knowledge
└── EditQuestaoTesteForm.jsx               ← Edit test knowledge

FrontEnd/src/components/Forms/
├── CreateQuestaoForm.jsx                  ← Alternative form
└── CreateBlocoForm.jsx                    ← Create blocks
```

### Gerenciadores
```
FrontEnd/src/Administrador/
├── QuestoesManager.jsx                    ← CRUD questions
├── BlocoQuestoesManager.jsx               ← CRUD blocks
├── TesteConhecimentoManager.jsx           ← CRUD test knowledge
└── TableManager.jsx                       ← Generic table manager

FrontEnd/src/Administrador/components/
├── TournamentForm.jsx                     ← Tournament creation
└── TournamentModal.jsx                    ← Tournament modal
```

### Modals & UI
```
FrontEnd/src/components/
├── ComaesModal.jsx                        ← Generic modal
├── ConfirmModal.jsx                       ← Confirmation modal
├── ModalVencedores.jsx                    ← Winners modal
├── TournamentFinishedModal.jsx            ← Tournament finished
├── LogoutModal.jsx                        ← Logout confirmation
├── WaitingScreen.jsx                      ← Loading screen
├── TableModal.jsx                         ← Table modal
├── StatusBadge.jsx                        ← Status badge
├── NivelBadge.jsx                         ← Level badge
└── StreakBadge.jsx                        ← Streak badge
```

---

## 🗂️ ABAS ADMINISTRATIVAS

### Questões
```
FrontEnd/src/Administrador/
├── QuestoesPendentesTab.jsx               ← ⚠️ Pending questions (Bug: breaks panel)
├── AdminQuestionsColaboradorPendentesTab.jsx ← Pending from collaborators
├── QuestoesColaboradoresTab.jsx           ← Collaborator questions
├── QuestoesTorneiosTab.jsx                ← Tournament questions
├── QuestoesTestesTab.jsx                  ← Test questions
└── QuestoesBlocosUnificadas.jsx           ← Unified questions + blocks
```

### Blocos
```
FrontEnd/src/Administrador/
├── BlocosColaboradoresTab.jsx             ← Blocks by collaborators
└── AdminBlocosColaboradoresPendentesTab.jsx ← Pending collaborator blocks
```

### Outros
```
FrontEnd/src/Administrador/
├── TorneiosTab.jsx                        ← Tournament tab
├── CertificadosTab.jsx                    ← Certificates tab
└── QuestionsColaboradorPendentesTab.jsx   ← Alternative pending view
```

---

## 🧩 COMPONENTES REUTILIZÁVEIS

### Cards & Display
```
FrontEnd/src/components/components_teste/
├── questioncard.jsx                       ← Question card
├── QuestionCardEnhanced.jsx               ← Enhanced version
├── resultscreen.jsx                       ← Result display
├── ResultScreenEnhanced.jsx               ← Enhanced result
├── loadingscreen.jsx                      ← Loading display
├── tutormessage.jsx                       ← Tutor messages
└── (outros componentes de teste)
```

### Ranking
```
FrontEnd/src/components/ranking/
├── RankingTable.jsx                       ← Ranking table
├── RankingTab.jsx                         ← Ranking tab
├── PosBadge.jsx                           ← Position badge
└── RankingSkeleton.jsx                    ← Skeleton loader
```

### Certificados
```
FrontEnd/src/certificados/
├── CertProgramacao.jsx                    ← Programming cert
├── CertMatematica.jsx                     ← Math cert
├── CertIngles.jsx                         ← English cert
├── CertificadoBase.jsx                    ← Base template
└── CertificadoDownload.jsx                ← Download component

FrontEnd/src/certificates/pages/
└── MeusCertificados.jsx                   ← My certificates

FrontEnd/src/certificates/preview/
└── CertificatePreview.jsx                 ← Preview component

FrontEnd/src/components/certificates/
├── CertificadoBase.jsx                    ← Alt base
├── CertificateDisplay.jsx                 ← Display
└── CertificateActions.jsx                 ← Actions
```

---

## 🎣 HOOKS (Custom React Hooks)

```
FrontEnd/src/hooks/
├── useQuiz.js                             ← Quiz/test logic
├── useTorneioParticipante.js              ← Tournament participant
├── useVencedores.js                       ← Winners/champions
├── useCertificado.js                      ← Certificate management
├── useNivel.js                            ← User level
├── useColaboradorStatus.js                ← Collaborator status
├── useRankingPolling.js                   ← Ranking polling
└── useStreak.js                           ← Streak tracking
```

---

## 🛡️ CONTEXTOS & AUTENTICAÇÃO

```
FrontEnd/src/context/
├── AuthContext.jsx                        ← Authentication context
├── ProtectedAdminRoute.jsx                ← Admin route protection
├── ProtectedEstudanteRoute.jsx            ← Student protection
└── ProtectedColaboradorRoute.jsx          ← Collaborator protection

FrontEnd/src/components/
└── ProtectedColaboradorRoute.jsx          ← Alt collaborator route
```

---

## 📡 SERVIÇOS (API & Lógica)

```
FrontEnd/src/services/
├── questoesService.js                     ← Questions API
├── tentativasService.js                   ← Submissions/attempts
├── colaboradorService.js                  ← Collaborator API
├── gamificacaoService.js                  ← Gamification
├── adminService.js                        ← Admin general
└── (em Administrador/services/)
    ├── BlocosService.js                   ← Blocks
    ├── TournamentService.js               ← Tournaments
    └── adminService.js                    ← Admin service (alt)
```

---

## 🔧 UTILITÁRIOS

```
FrontEnd/src/utils/
├── validators.js                          ← Form validation
├── evaluation.js                          ← Evaluation utilities
├── security/formValidators.js             ← Security validators
└── lib/utils.js                           ← General utilities
```

---

## 🌐 LAYOUT & PAGES

```
FrontEnd/src/Paginas/Secundarias/
├── Layout.jsx                             ← Main layout
├── Dashboard.jsx                          ← Student dashboard
├── MinhaJornada.jsx                       ← User journey
├── Perfil.jsx                             ← User profile
├── Notificacoes.jsx                       ← Notifications
├── NotificacoesPage.jsx                   ← Notifications page
├── Configuracoes.jsx                      ← Settings
└── (layout estrutural)
```

---

# 🎮 PARTE 2: BACKEND

## 🎯 CONTROLLERS

### Questões & Testes
```
BackEnd/controllers/
├── QuestoesController.js                  ← ✅ CORRIGIDO - Main questions
├── BlocosController.js                    ← Block management
├── TesteConhecimentoController.js         ← Test knowledge
├── TentativasController.js                ← Attempts/submissions
└── ResultadoTesteController.js            ← Test results
```

### Torneios (DUPLICADOS ⚠️)
```
BackEnd/controllers/
├── TorneioController.js                   ← V1 - Active
└── TorneoController.js                    ← V2 - Legacy (duplicate)
```

### Colaborador (DUPLICADOS ⚠️)
```
BackEnd/controllers/
├── ColaboradorBlocosQuestoesController.js ← V1 - Original
├── ColaboradorBlocosQuestoesControllerV2.js ← V2 - Refactored
├── ColaboradorController.js               ← Main collaborator
└── colaboradorRegistroController.js       ← Registration
```

### Gamificação & Sistema
```
BackEnd/controllers/
├── rankingController.js                   ← Ranking logic
├── nivelController.js                     ← Level system
├── streakController.js                    ← Streak tracking
├── missoesController.js                   ← Mission system
├── adminStatsController.js                ← Statistics
├── UserController.js                      ← User management
└── GenericController.js                   ← Generic CRUD
```

---

## 📦 MODELOS (ORM Sequelize)

### Questões
```
BackEnd/models/
├── Questao.js                             ← ✅ NEW - Unified model
├── QuestaoTesteConhecimento.js            ← Active - Test questions
├── QuestaoMatematica.js                   ← Legacy - Math
├── QuestaoIngles.js                       ← Legacy - English
├── QuestaoProgramacao.js                  ← Legacy - Programming
├── Pergunta.js                            ← Legacy - Unknown purpose
└── (tabelas específicas desabilitadas)
```

### Blocos & Estrutura
```
BackEnd/models/
├── BlocoQuestoes.js                       ← Question blocks
├── BlocoQuestaoItem.js                    ← Block items (N:M)
└── TorneioBloco.js                        ← Tournament blocks
```

### Torneios & Participação
```
BackEnd/models/
├── Torneio.js                             ← Tournament main
├── TorneioBloco.js                        ← Tournament blocks
├── ParticipanteTorneio.js                 ← Tournament participants
└── (relacionamentos definidos em associations)
```

### Tentativas & Resultados
```
BackEnd/models/
├── TentativaResposta.js                   ← User answers
├── TentativaTeste.js                      ← Test attempts
└── ResultadoTeste.js                      ← Test results
```

### Gamificação
```
BackEnd/models/
├── Ranking.js                             ← Ranking data
├── Nivel.js                               ← User levels
├── Missao.js                              ← Missions
├── MissaoUsuario.js                       ← User missions
├── Conquista.js                           ← Achievements
└── ConquistaUsuario.js                    ← User achievements
```

### Certificados (DUPLICADOS ⚠️)
```
BackEnd/models/
├── Certificado.js                         ← Portuguese version
└── Certificate.js                         ← English version (duplicate)
```

### Usuários & Sistema
```
BackEnd/models/
├── User.js                                ← User accounts
├── Funcao.js                              ← Roles/functions
├── SequenciaAprendizagem.js               ← Learning sequences
├── Notificacao.js                         ← Notifications
├── Noticia.js                             ← News
├── TicketSuporte.js                       ← Support tickets
├── RedefinicaoSenha.js                    ← Password reset
├── ConfiguracaoUsuario.js                 ← User config
└── associations.js                        ← All relationships
```

---

## 🛣️ ROTAS (Endpoints)

### Questões
```
BackEnd/routes/
└── questoesRoutes.js
    POST   /api/questoes                   ← Create
    GET    /api/questoes                   ← List all
    GET    /api/questoes/:id               ← Get by ID
    PUT    /api/questoes/:id               ← Update
    DELETE /api/questoes/:id               ← Delete
    GET    /api/questoes/torneio/:id       ← By tournament
    GET    /api/questoes/quiz/:area        ← For quiz
    PATCH  /api/questoes/:id/aprovacao     ← Approve/reject
```

### Blocos
```
BackEnd/routes/
└── blocosRoutes.js
    POST   /api/blocos                     ← Create
    GET    /api/blocos                     ← List
    GET    /api/blocos/:id                 ← Get
    PUT    /api/blocos/:id                 ← Update
    DELETE /api/blocos/:id                 ← Delete
    POST   /api/blocos/:id/questoes        ← Add question
    DELETE /api/blocos/:id/questoes/:qid   ← Remove question
```

### Torneios
```
BackEnd/routes/
└── tournamentsRoutes.js
    POST   /api/admin/torneos              ← Create
    GET    /api/admin/torneos              ← List
    GET    /api/admin/torneos/:id          ← Get
    PUT    /api/admin/torneos/:id          ← Update
    DELETE /api/admin/torneos/:id          ← Delete
    POST   /api/torneios/:id/blocos        ← Assoc block
    GET    /api/torneios/:id/blocos        ← Get blocks
```

### Colaborador
```
BackEnd/routes/
└── colaboradorBlocosQuestoesRoutes.js
    POST   /api/colaborador/questoes       ← Submit question
    GET    /api/colaborador/questoes       ← My questions
    POST   /api/colaborador/blocos         ← Submit block
    GET    /api/colaborador/blocos         ← My blocks
    POST   /api/colaborador/questoes/:id/submeter
    POST   /api/admin/questoes/:id/aprovar ← Approve
    POST   /api/admin/questoes/:id/rejeitar ← Reject
```

### Tentativas & Testes
```
BackEnd/routes/
├── tentativasRoutes.js
│   POST   /api/tentativas                 ← Save answer
│   GET    /api/tentativas/:usuarioId      ← Get attempts
│   └── (mais endpoints)
│
└── testeConhecimentoRoutes.js
    GET    /api/teste-conhecimento         ← List tests
    POST   /api/teste-conhecimento         ← Create
    └── (mais endpoints)
```

### Gamificação
```
BackEnd/routes/
├── rankingRoutes.js              ← Ranking endpoints
├── nivelRoutes.js                ← Level endpoints
├── streakRoutes.js               ← Streak endpoints
├── missoesRoutes.js              ← Mission endpoints
└── (outros)
```

### Certificados
```
BackEnd/routes/
├── certificadosRoutes.js         ← Portuguese certs
├── certificatesRoutes.js         ← English certs
└── (duplicate routes ⚠️)
```

---

## 🔐 MIDDLEWARES

```
BackEnd/middlewares/
├── auth.js                                ← JWT verification
├── isAdmin.js                             ← Admin check
├── canManageQuestoes.js                   ← Question management auth
├── isNotColaborador.js                    ← Block collaborators
├── rankingEvents.js                       ← Ranking logic
├── validate.js                            ← Validation
└── security/                              ← Security middlewares
    └── (formValidators, etc)
```

---

## 🔧 SERVIÇOS BACKEND

```
BackEnd/services/
├── questoesService.js                     ← Question logic
├── torneioService.js                      ← Tournament logic
├── TournamentFinalizerService.js          ← Tournament end
├── rankingService.js                      ← Ranking calc
├── streakService.js                       ← Streak logic
├── missoesService.js                      ← Mission logic
├── xpService.js                           ← XP system
├── emailService.js                        ← Email sending
├── iaEvaluators.js                        ← AI evaluation
├── manualEvaluator.js                     ← Manual eval
├── socketService.js                       ← WebSocket
└── (outros serviços)
```

---

## 🗄️ MIGRAÇÕES (Database)

```
BackEnd/migrations/
├── 20260601000000-create-blocos-questoes.cjs
├── 20260522000002-create-questoes-table.cjs       ← ✅ NEW model
├── 20260522000003-disable-legacy-tables.cjs       ← Disable legacy
├── 20260523000000-fix-questoes-cascade.cjs
├── 20260524000000-create-questoes-teste-conhecimento.cjs
├── 20260526000000-create-resultados-teste-table.cjs
├── 20260528000000-add-visualizacoes-to-noticias.cjs
├── 20260601000000-add-colaborador-role-and-question-review.cjs
├── 20260602000000-add-status-colaborador.cjs
├── 20260603000000-create-niveis-and-xp-columns.cjs
├── 20260603000000-create-rankings-table.cjs
├── 20260603100000-create-sequencias-aprendizagem.cjs
├── 20260603200000-create-missoes-tables.cjs
├── 20260605000000-update-bloco-questoes-status.cjs
├── 20260605100000-fix-bloco-status-to-publish.cjs
└── 20260606000000-add-colaborador-extended-fields.cjs
```

---

## 🌱 SEEDS (Dados Iniciais)

```
BackEnd/seeds/
├── insert_45_questoes_torneio_ativo.sql          ← 45 questions
├── seed_teste_conhecimento.sql                   ← Test knowledge
└── seed_torneio_questoes.sql                     ← Tournament questions
```

---

## 📋 SCRIPTS UTILITÁRIOS

```
BackEnd/
├── add_slug.js                            ← Add slug field
├── check_users.js                         ← Verify users
├── create_pending_colaborador.js          ← Create collaborators
├── create_students.js                     ← Create students
├── criar_blocos_para_questoes.js          ← Create blocks
├── fix_bloco_status.js                    ← Fix status
├── get_users_credentials.js               ← Get credentials
├── insert_questoes.js                     ← Insert questions v1
├── insert_questoes_v2.js                  ← Insert questions v2
├── populate_blocos_questoes.js            ← Populate blocks
├── verify_data.js                         ← Verify integrity
├── executar_migration.js                  ← Run migrations
└── (mais scripts de teste/validação)
```

---

## ⚙️ CONFIGURAÇÃO

```
BackEnd/
├── config/
│   ├── db.js                              ← Database config
│   ├── cache.js                           ← Cache config
│   └── sequelize.config.json              ← Sequelize config
├── .sequelizerc                           ← Sequelize CLI config
├── index.js                               ← Server entry point
└── schema.sql                             ← Database schema
```

---

# 📊 PARTE 3: ESTRUTURA DE DADOS

## 🗄️ TABELAS PRINCIPAIS

```
QUESTÕES:
├── questoes                     ← Main questions table
├── questoes_teste_conhecimento  ← Test knowledge specific
├── bloco_questao_items          ← Block items (N:M)
└── (legacy: questoes_matematica, questoes_ingles, etc - DISABLED)

BLOCOS:
├── blocos_questoes              ← Question blocks
├── torneio_blocos               ← Tournament blocks (N:M)
└── bloco_questao_items          ← Items inside blocks

TORNEIOS:
├── torneios                     ← Tournament data
├── torneio_blocos               ← Tournament blocks (N:M)
└── participantes_torneio        ← Tournament participants

TENTATIVAS:
├── tentativa_respostas          ← User answers
├── tentativas_teste             ← Test attempts
└── resultados_teste             ← Test results

GAMIFICAÇÃO:
├── rankings                     ← Ranking data
├── niveis                       ← User levels
├── missoes                      ← Missions
├── missoes_usuarios             ← User missions
├── conquistas                   ← Achievements
└── conquistas_usuarios          ← User achievements

SISTEMA:
├── usuarios                     ← User accounts
├── noticias                     ← News
├── notificacoes                 ← Notifications
├── sequencias_aprendizagem      ← Learning sequences
├── certificados                 ← Certificates (PT)
├── certificates                 ← Certificates (EN - DUPLICATE)
└── (outras tabelas de sistema)
```

---

# 🔄 PARTE 4: FLUXOS INTEGRAÇÃO

## 1️⃣ CRIAR QUESTÃO - Fluxo Completo

```
FRONTEND:
  CreateQuestaoForm.jsx
    ↓
  handleSave() - Converte dados
    ↓
  axios.post(/api/questoes)
    ↓
BACKEND:
  Middleware canManageQuestoes
    ↓
  QuestoesController.criar()
    ├─ Valida dados
    ├─ Normaliza opções
    ├─ Verifica duplicado
    └─ Questao.create()
    ↓
  DATABASE:
  INSERT INTO questoes (...) VALUES (...)
    ↓
RESPONSE:
  { sucesso: true, dados: { id: 42, ... } }
    ↓
FRONTEND:
  Modal fecha
  Lista recarrega
  Sucesso mostra mensagem
```

---

## 2️⃣ CRIAR BLOCO - Fluxo Completo

```
FRONTEND:
  CreateBlocoForm.jsx
    ↓
  handleSave()
    ↓
  axios.post(/api/blocos)
    ↓
BACKEND:
  Middleware canManageQuestoes
    ↓
  BlocosController.criar()
    ├─ Valida dados
    ├─ Cria BlocoQuestoes
    └─ Relaciona questões (via BlocoQuestaoItem)
    ↓
  DATABASE:
  INSERT INTO blocos_questoes
  INSERT INTO bloco_questao_items (N:M)
    ↓
RESPONSE:
  { sucesso: true, dados: { id: 5, ... } }
```

---

## 3️⃣ QUIZ/TESTE - Fluxo Completo

```
FRONTEND:
  Teste.jsx
    ↓
  useQuiz.js
    ↓
  GET /api/questoes/quiz/:area
    ↓
BACKEND:
  BlocosController.carregarQuizComBlocos()
    ├─ Se torneio_id:
    │   ├─ Busca TorneioBloco
    │   ├─ Busca BlocoQuestaoItem
    │   └─ Busca QuestaoTesteConhecimento
    │
    └─ Sem torneio (retrocompat):
        └─ Busca QuestaoTesteConhecimento
    ↓
  DATABASE:
  SELECT * FROM questoes_teste_conhecimento
  JOIN bloco_questao_items ON ...
  JOIN blocos_questoes ON ...
    ↓
RESPONSE:
  [ { id, enunciado, opcoes[], resposta_correta, ... } ]
    ↓
FRONTEND:
  Teste.jsx renderiza questões
    ↓
  User responde
    ↓
  POST /api/tentativas
    ↓
BACKEND:
  TentativasController.criar()
    ├─ Salva TentativaResposta
    ├─ Avalia resposta
    ├─ Atualiza score/ranking
    └─ Emite eventos gamificação
```

---

## 4️⃣ APROVAÇÃO QUESTÃO COLABORADOR - Fluxo

```
FRONTEND:
  AdminQuestionsColaboradorPendentesTab.jsx
    ↓
  GET /api/colaborador/questoes-colaborador-pendentes
    ↓
BACKEND:
  ColaboradorBlocosQuestoesController.listarPendentes()
    ├─ Filtra status='pendente'
    ├─ Filtra autor_id=colaborador
    └─ Retorna lista com botões APROVAR/REJEITAR
    ↓
RESPONSE:
  [ { id, titulo, descricao, status, ... } ]
    ↓
FRONTEND:
  Lista renderiza com botões
    ↓
ADMIN:
  Clica APROVAR
    ↓
  POST /api/admin/questoes/:id/aprovacao
    ↓
BACKEND:
  QuestoesController.revisar()
    ├─ Atualiza status_aprovacao = 'aprovada'
    ├─ Seta revisado_por = admin_id
    └─ Questao.save()
    ↓
RESPONSE:
  { sucesso: true }
    ↓
FRONTEND:
  Questão sai da lista de pendentes
  Vai para "Questões dos Colaboradores"
```

---

## 5️⃣ ASSOCIAR BLOCO A TORNEIO - Fluxo

```
FRONTEND:
  TorneiosTab.jsx / AdminDashboard.jsx
    ↓
  POST /api/torneios/:torneioId/blocos
    └─ { bloco_id: 5 }
    ↓
BACKEND:
  BlocosController OU TorneoController
    ├─ Valida torneio existe
    ├─ Valida bloco existe
    ├─ Valida status bloco = 'publicado'
    └─ TorneioBloco.create()
    ↓
  DATABASE:
  INSERT INTO torneio_blocos (torneio_id, bloco_id)
    ↓
RESPONSE:
  { sucesso: true }
    ↓
RESULT:
  Quando usuario faz quiz do torneio,
  questões do bloco aparecem no carregamento
```

---

## 6️⃣ RANKING UPDATE - Fluxo

```
TRIGGER: TentativasController.criar()
    ↓
rankingService.updateRanking()
    ├─ Calcula pontos
    ├─ Atualiza score total
    ├─ Computa posição
    └─ Ranking.create() ou update()
    ↓
DATABASE:
INSERT INTO rankings (usuario_id, torneio_id, posicao, score, ...)
    ↓
EMITE:
WebSocket event → Frontend
rankingController atualiza real-time
    ↓
FRONTEND:
useRankingPolling.js recebe update
Pagina Ranking.jsx refaz render
```

---

## 7️⃣ CERTIFICADO GERADO - Fluxo

```
TRIGGER: Torneio finaliza OU Pontos atingem meta
    ↓
BackEnd/services/TournamentFinalizerService.js
    ├─ Calcula vencedores
    ├─ Gera certificados
    ├─ useCertificado.js (frontend) É chamado
    └─ Certificado.create() no banco
    ↓
DATABASE:
INSERT INTO certificados (usuario_id, torneio_id, ...)
    ↓
RESPONSE:
Notificação → Usuario
    ↓
FRONTEND:
MeusCertificados.jsx
    ↓
  GET /api/certificados/:usuarioId
    ↓
BACKEND:
CertificadoController.getMeusCertificados()
    ↓
FRONTEND:
CertificatePreview.jsx renderiza
```

---

# 🔴 PARTE 5: DUPLICAÇÕES & CONFLITOS

## ⚠️ DUPLICAÇÕES CRÍTICAS ENCONTRADAS

### 1. Controllers de Torneio (DUPLICADO)
```
❌ PROBLEMA:
  TorneioController.js     ← V1 Active
  TorneoController.js      ← V2 Legacy (exact duplicate)

✅ SOLUÇÃO: Manter um, deletar outro
```

### 2. Controllers Colaborador-Blocos-Questões (DUPLICADO)
```
❌ PROBLEMA:
  ColaboradorBlocosQuestoesController.js     ← V1 Original
  ColaboradorBlocosQuestoesControllerV2.js   ← V2 Refactored (diferente!)

✅ SOLUÇÃO: Usar V2 (melhor validação), deletar V1
```

### 3. Modelos de Questão (MÚLTIPLOS)
```
❌ PROBLEMA:
  Questao.js                 ← NEW unified model
  QuestaoTesteConhecimento.js ← Test knowledge specific
  QuestaoMatematica.js       ← Legacy disabled
  QuestaoIngles.js           ← Legacy disabled
  QuestaoProgramacao.js      ← Legacy disabled
  Pergunta.js                ← Unknown purpose

✅ SOLUÇÃO: Usar Questao.js como canonical, migrar dados, deletar legados
```

### 4. Certificados (DUPLICADO)
```
❌ PROBLEMA:
  Certificado.js             ← Portuguese version
  Certificate.js             ← English version (identical)
  certificadosRoutes.js      ← PT endpoints
  certificatesRoutes.js      ← EN endpoints (duplicate)

✅ SOLUÇÃO: Mesclar em tabela única com campo idioma
```

### 5. Dashboards Colaborador (TRIPLICADO)
```
❌ PROBLEMA:
  ColaboradorDashboard.jsx       ← V1
  ColaboradorDashboardV2.jsx     ← V2
  ColaboradorDashboardV2_NEW.jsx ← V3

✅ SOLUÇÃO: Consolidar em versão única
```

---

# 📊 PARTE 6: MATRIZ DE REFERÊNCIA RÁPIDA

## Por Funcionalidade

| Funcionalidade | Frontend | Backend | Model | Route |
|---|---|---|---|---|
| Criar Questão | CreateQuestaoForm.jsx | QuestoesController.criar() | Questao.js | questoesRoutes.js |
| Editar Questão | EditQuestaoForm.jsx | QuestoesController.atualizar() | Questao.js | questoesRoutes.js |
| Criar Bloco | CreateBlocoForm.jsx | BlocosController.criar() | BlocoQuestoes.js | blocosRoutes.js |
| Editar Bloco | BlocoQuestoesManager.jsx | BlocosController.atualizar() | BlocoQuestoes.js | blocosRoutes.js |
| Quiz | Teste.jsx | BlocosController.carregarQuiz() | QuestaoTesteConhecimento | testeConhecimentoRoutes |
| Tentativa | Teste.jsx | TentativasController.criar() | TentativaResposta | tentativasRoutes |
| Ranking | Ranking.jsx | rankingController | Ranking.js | rankingRoutes.js |
| Torneio | Torneios.jsx | TorneioController | Torneio.js | tournamentsRoutes |
| Certificado | MeusCertificados | CertificadoController | Certificado.js | certificadosRoutes |
| Colaborador | ColaboradorDashboard | ColaboradorController | User.js | colaboradorRoutes |

---

# ✅ CONCLUSÃO

**Total de Ficheiros Mapeados**: 150+

Todos os ficheiros estão organizados por:
- Funcionalidade (questões, blocos, torneios, etc)
- Localização (frontend/backend)
- Tipo (componentes, controllers, models, routes, etc)

Use este documento para:
- Entender fluxo completo
- Localizar ficheiros rapidamente
- Identificar duplicações
- Planejar refatorações
- Debugar problemas

---

**Status**: ✅ MAPEAMENTO COMPLETO  
**Data**: 7 de Junho de 2026  
**Versão**: COMAES 3.2

