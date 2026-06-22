# 📚 ANÁLISE PROFUNDA - COMAES 3.2
## Relatório Técnico Completo para Defesa de TCC

**Versão:** 3.2  
**Data:** Junho 2026  
**Foco:** Arquitetura, Autenticação, APIs, Banco de Dados, Funcionalidades  

---

# 1️⃣ ARQUITETURA GERAL

## **Padrão Arquitetural: Cliente-Servidor com MVC**

### Estrutura Geral
```
┌─────────────────────────────────────────────────────────────┐
│              CAMADA DE APRESENTAÇÃO                         │
│         FrontEnd: React 18 + Vite + Tailwind CSS           │
│         Responsiva, SPA (Single Page Application)          │
├─────────────────────────────────────────────────────────────┤
│              CAMADA DE LÓGICA APLICAÇÃO                    │
│         BackEnd: Express.js + Node.js + Sequelize ORM      │
│         Controllers, Services, Middlewares                 │
├─────────────────────────────────────────────────────────────┤
│              CAMADA DE DADOS                               │
│         MySQL + Sequelize ORM + WebSocket (Socket.io)      │
│         Banco relacional com 30+ tabelas                   │
└─────────────────────────────────────────────────────────────┘
```

### Protocolos de Comunicação

| Protocolo | Uso | Implementação |
|-----------|-----|----------------|
| **REST API (HTTP/HTTPS)** | Requisições síncronas (CRUD) | axios no Frontend, Express no Backend |
| **WebSocket (Socket.io)** | Comunicação real-time | socketService.js, Socket.io 4.7.1 |
| **JSON** | Formato de serialização | Padrão em todas as APIs |

### Fluxo de Requisição
```
1. Cliente (React) faz requisição:
   GET /api/questoes HTTP/1.1
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. Middleware (Express):
   ├─ Valida JWT
   ├─ Extrai usuário do BD
   ├─ Valida role/permissão
   └─ Passa controle ao Controller

3. Controller:
   ├─ Valida dados de entrada
   ├─ Executa lógica de negócio
   ├─ Consulta BD via ORM (Sequelize)
   └─ Retorna resposta JSON

4. Cliente recebe resposta:
   { success: true, data: [...], message: "..." }
```

---

# 2️⃣ ESTRUTURA DE PASTAS COMPLETA

## **BACKEND: `BackEnd/`**

### Organização MVC

```
BackEnd/
├── config/
│   └── db.js                        ★ Conexão MySQL + Sequelize
│                                      ├─ host: processo.env.DB_HOST || 'localhost'
│                                      ├─ port: 3306
│                                      ├─ database: 'comaes'
│                                      ├─ username: processo.env.DB_USER || 'root'
│                                      ├─ password: processo.env.DB_PASSWORD || ''
│                                      └─ charset: 'utf8mb4'
│
├── models/                          ★ CAMADA DE DADOS (Sequelize ORM)
│   ├── Usuario.js                   - id, nome, email, senha_hash, role, status
│   ├── Questao.js                   - Questões: título, descrição, resposta, disciplina
│   ├── BlocoQuestoes.js             - Agrupamento de questões
│   ├── Torneio.js                   - Torneios: datas, status, tipo
│   ├── ParticipanteTorneio.js       - Inscrições em torneios
│   ├── TentativaTeste.js            - Tentativas de teste
│   ├── TentativaResposta.js         - Respostas a questões
│   ├── Notificacao.js               - Sistema de notificações
│   ├── Certificado.js               - Certificados emitidos
│   ├── Ranking.js                   - Dados de ranking
│   ├── Noticia.js                   - Portal de notícias
│   ├── Disciplina.js                - Disciplinas (Matemática, Inglês, Programação)
│   ├── Missao.js                    - Missões gamificadas
│   ├── Nivel.js                     - Níveis de XP
│   ├── Conquista.js                 - Achievements
│   └── associations.js              ★ Relacionamentos Sequelize
│                                      (hasMany, belongsTo, etc)
│
├── controllers/                     ★ LÓGICA DE NEGÓCIO
│   ├── UserController.js            - login(), register(), editPerfil()
│   ├── QuestoesController.js        - criar(), listar(), aprovar(), rejeitar()
│   ├── TorneioController.js         - CRUD torneios, inscrição, finalização
│   ├── ColaboradorController.js     - Gestão de colaboradores
│   ├── AdminStatsController.js      - Estatísticas para painel admin
│   ├── BlocosController.js          - CRUD blocos de questões
│   ├── TesteConhecimentoController.js - Teste de conhecimento
│   ├── TentativasController.js      - Registrar tentativas
│   ├── RankingController.js         - Cálculo e listagem de rankings
│   ├── CertificateController.js     - Emissão de certificados (PDF)
│   └── [...mais 10 controllers]
│
├── routes/                          ★ DEFINIÇÃO DE ENDPOINTS
│   ├── questoesRoutes.js
│   │   ├─ POST   /api/questoes/colaborador/criar
│   │   ├─ GET    /api/questoes/colaborador/minhas
│   │   ├─ PUT    /api/questoes/:id/aprovar (admin)
│   │   └─ DELETE /api/questoes/:id (admin)
│   │
│   ├── tournamentsRoutes.js
│   │   ├─ POST   /api/torneios (admin)
│   │   ├─ GET    /api/torneios
│   │   ├─ POST   /api/torneios/:id/inscrever (estudante)
│   │   └─ PUT    /api/torneios/:id/finalizar (admin)
│   │
│   ├── colaboradorRoutes.js
│   │   ├─ POST   /api/colaboradores/registrar
│   │   └─ GET    /api/colaboradores (admin)
│   │
│   ├── adminPanelRoutes.js          ★ Rotas admin exclusivas
│   ├── supportRoutes.js             ★ POST /api/support/chat (IA Gemini)
│   └── [...mais 10 routes]
│
├── middlewares/                     ★ AUTENTICAÇÃO E AUTORIZAÇÃO
│   ├── auth.js
│   │   └─ authenticate()            - Valida JWT, extrai usuário do BD
│   │
│   ├── authorize.js
│   │   └─ requireAdmin()            - Valida role === 'admin'
│   │
│   ├── isColaborador.js
│   │   └─ isColaborador()           - Valida role === 'colaborador'
│   │
│   ├── canManageQuestoes.js         - Valida permissão questões
│   ├── roleMiddleware.js            - Validação genérica de role
│   ├── validate.js
│   │   ├─ validateEmail()           - Email válido
│   │   ├─ validatePassword()        - Senha forte (8+ chars, maiúscula, número, símbolo)
│   │   └─ validatePhone()           - Telefone válido
│   │
│   └── security/
│       ├─ sanitizer.js              - Sanitização de inputs
│       └─ colaboradorUpload.js      - Validação upload ficheiros
│
├── services/                        ★ LÓGICA REUTILIZÁVEL
│   ├── iaEvaluators.js
│   │   └─ Integração Google Generative AI (Gemini)
│   │
│   ├── emailService.js
│   │   └─ enviarEmail()             - Nodemailer
│   │
│   ├── socketService.js
│   │   └─ Configuração WebSocket em tempo real
│   │
│   ├── rankingService.js
│   │   └─ calcularRanking()
│   │
│   ├── supportChatService.js
│   │   ├─ askSupportAI()            - Chamada ao Gemini Flash-2.5
│   │   ├─ getDataHoraAtual()        - Data/hora em português
│   │   └─ message enrichment        - Contexto adicional
│   │
│   └── [...mais 5 services]
│
├── jobs/                            ★ TASKS AGENDADAS
│   └── verificarEncerramentosScheduler.js
│       └─ Cron job: Encerrar torneios vencidos
│
├── validation/                      ★ VALIDAÇÃO DE DADOS
│   └── registerValidation.js
│       └─ Valida: email, senha forte, telefone
│
├── migrations/                      ★ HISTÓRICO BD (Sequelize)
│   ├─ 001-create-usuarios.js
│   ├─ 002-create-questoes.js
│   └─ [...mais migrações]
│
├── index.js                         ★ SERVIDOR PRINCIPAL
│   ├─ Importa todos os models
│   ├─ Define todas as rotas
│   ├─ Inicializa Socket.io
│   ├─ Scheduler de encerramento torneios
│   └─ Escuta porta 3002
│
└── .env                             ★ VARIÁVEIS DE AMBIENTE
    ├─ DB_HOST=localhost
    ├─ DB_USER=root
    ├─ DB_PASSWORD=
    ├─ DB_NAME=comaes
    ├─ JWT_SECRET=sua_chave_secreta
    ├─ GOOGLE_API_KEY=sua_chave_api_google
    └─ NODEJS_PORT=3002
```

## **FRONTEND: `FrontEnd/`**

```
FrontEnd/
├── src/
│   ├── main.jsx                     ★ Entry Point
│   │   ├─ Cria React root
│   │   └─ Global fetch interceptor (401)
│   │
│   ├── App.jsx                      ★ ROTEAMENTO PRINCIPAL
│   │   ├─ <BrowserRouter>
│   │   ├─ <Routes>
│   │   ├─ SmartHome() redireciona por role
│   │   ├─ Rotas públicas: /login, /cadastro, /recuperar
│   │   ├─ Rotas estudante: /dashboard, /torneios, /ranking
│   │   ├─ Rotas colaborador: /meus-questoes, /painel
│   │   └─ Rotas admin: /admin/dashboard, /admin/usuarios
│   │
│   ├── context/                     ★ ESTADO GLOBAL (React Context)
│   │   ├── AuthContext.jsx
│   │   │   ├─ user: { id, nome, email, role, disciplina_colaborador }
│   │   │   ├─ token: JWT token
│   │   │   ├─ login()
│   │   │   ├─ logout()
│   │   │   ├─ normalize() - Padroniza dados de API
│   │   │   └─ getPostLoginRoute() - Redireciona por role
│   │   │
│   │   ├── ProtectedRoute.jsx
│   │   │   ├─ ProtectedEstudanteRoute
│   │   │   ├─ ProtectedColaboradorRoute
│   │   │   └─ ProtectedAdminRoute
│   │   │
│   │   └── Storage: localStorage
│   │       ├─ comaes_user: JSON (serializado)
│   │       └─ comaes_token: string
│   │
│   ├── Paginas/                     ★ PÁGINAS DO SISTEMA
│   │   ├── Primarias/
│   │   │   ├─ AuthContainer.jsx     - Login + Cadastro (estudante, colaborador)
│   │   │   │                           ├─ handleRegisterEstudante()
│   │   │   │                           ├─ handleRegisterColaborador()
│   │   │   │                           ├─ handleLogin()
│   │   │   │                           └─ Password validation (regex)
│   │   │   │
│   │   │   └─ Recuperar.jsx         - Recuperação de senha
│   │   │
│   │   ├── Secundarias/
│   │   │   ├─ Home.jsx              - Landing page (público/autenticado)
│   │   │   ├─ Dashboard.jsx         - Dashboard estudante (XP, progressão)
│   │   │   ├─ Layout.jsx            ★ LAYOUT PADRÃO
│   │   │   │   ├─ Navbar
│   │   │   │   ├─ Sidebar
│   │   │   │   ├─ Main content area
│   │   │   │   └─ Footer
│   │   │   │
│   │   │   ├─ EntrarTorneio.jsx     - Listar torneios + inscrever
│   │   │   ├─ Teste.jsx             - Teste de conhecimento
│   │   │   ├─ MinhasQuestoes.jsx    - Questões colaborador
│   │   │   ├─ Ranking.jsx           - Ranking por disciplina
│   │   │   ├─ RankingCompleto.jsx   - Ranking detalhado
│   │   │   ├─ Perfil.jsx            - Perfil do usuário
│   │   │   ├─ Configuracoes.jsx     - Preferências
│   │   │   ├─ Noticias.jsx          - Portal de notícias
│   │   │   ├─ Suporte.jsx           - Sistema de suporte
│   │   │   ├─ Sobre.jsx             - About page
│   │   │   └─ Privacidade.jsx       - Privacy policy
│   │   │
│   │   └── Tercearios/
│   │       └─ ModeloOriginal/
│   │           ├─ MatematicaOriginal.jsx
│   │           ├─ ProgramacaoOriginal.jsx
│   │           └─ InglesOriginal.jsx
│   │
│   ├── Administrador/               ★ PAINEL ADMIN (role=admin)
│   │   ├─ AdminDashboard.jsx        - ★ Dashboard principal (tabs)
│   │   │   ├─ Dashboard Stats
│   │   │   ├─ Questionários Pendentes
│   │   │   ├─ Questões Colaborador
│   │   │   ├─ Questões Torneio
│   │   │   ├─ Gestão Torneios
│   │   │   ├─ Gestão Colaboradores
│   │   │   ├─ Certificados
│   │   │   └─ Blocos de Questões
│   │   │
│   │   ├─ QuestoesPendentesTab.jsx  - Aprovação/rejeição questões
│   │   ├─ TorneioPanelAdmin.jsx     - CRUD torneios
│   │   ├─ ColaboradoresTab.jsx      - Gestão colaboradores
│   │   ├─ BlocoQuestoesManager.jsx  - Blocos
│   │   ├─ adminService.js           - API calls /api/admin/*
│   │   └─ [...mais 10 componentes admin]
│   │
│   ├── Colaborador/                 ★ PAINEL COLABORADOR (role=colaborador)
│   │   ├─ ColaboradorDashboard.jsx  - Dashboard colaborador
│   │   ├─ CreateQuestaoForm.jsx     - Criar questão
│   │   └─ EditQuestaoForm.jsx       - Editar questão
│   │
│   ├── components/                  ★ COMPONENTES REUTILIZÁVEIS
│   │   ├─ SupportChat.jsx
│   │   │   ├─ Botão flutuante (assistente.png)
│   │   │   ├─ Modal chat
│   │   │   ├─ Tabs: FAQ + Chat
│   │   │   ├─ useSupportChat() hook
│   │   │   └─ Integração Gemini AI
│   │   │
│   │   ├─ ErrorBoundary.jsx         - Tratamento erros React
│   │   ├─ ComaesModal.jsx           - Modal padrão
│   │   ├─ ConfirmModal.jsx          - Modal confirmação
│   │   ├─ PageTransition.jsx        - Animação Framer Motion
│   │   ├─ WaitingScreen.jsx         - Tela espera torneio
│   │   ├─ ModalVencedores.jsx       - Vencedores torneio
│   │   ├─ TournamentRegistrationModal.jsx
│   │   ├─ NivelBadge.jsx
│   │   ├─ StreakBadge.jsx
│   │   ├─ certificates/             - Componentes certificado
│   │   ├─ ranking/                  - Componentes ranking
│   │   └─ Forms/                    - Formulários reutilizáveis
│   │
│   ├── services/                    ★ SERVIÇOS DE API
│   │   ├─ questoesService.js        - GET/POST /api/questoes
│   │   ├─ tentativasService.js      - POST /api/tentativas
│   │   ├─ colaboradorService.js     - /api/colaboradores
│   │   └─ gamificacaoService.js     - /api/gamificacao
│   │
│   ├── hooks/                       ★ CUSTOM HOOKS
│   │   ├─ useAuth()                 - Acesso ao contexto Auth
│   │   ├─ useFetch()                - GET/POST simplificado
│   │   └─ [...mais hooks]
│   │
│   ├── utils/                       ★ FUNÇÕES UTILITÁRIAS
│   │   ├─ formatters.js             - Format data, número
│   │   ├─ validators.js             - Email, senha, etc
│   │   └─ helpers.js                - Funções auxiliares
│   │
│   ├── assets/                      ★ IMAGENS E RECURSOS
│   │   ├─ assistente.png            - Avatar assistente
│   │   ├─ logos/
│   │   ├─ ícones/
│   │   └─ fundadores/               - Imagens time sobre
│   │
│   ├── styles/                      ★ ESTILOS CSS
│   │   ├─ mobile-responsive.css     - Media queries
│   │   └─ index.css                 - Globais
│   │
│   └── socket.js                    ★ Configuração Socket.io
│       └─ Notificações em tempo real
│
├── public/                          - Ficheiros estáticos
├── package.json                     - Dependências npm
├── vite.config.js                   - Configuração Vite
├── tailwind.config.js               - Configuração Tailwind
├── index.html                       - HTML raiz
└── .env                             - Variáveis de ambiente
    └─ VITE_API_BASE_URL=http://localhost:3002
```

---

# 3️⃣ AUTENTICAÇÃO E SEGURANÇA

## **Fluxo Completo de Autenticação**

### **Passo 1: Registro** 
```
Usuário preenche formulário (nome, email, senha, role)
         ↓
FrontEnd: POST /api/auth/register
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "Senha123!@#",
  "role": "estudante"  // ou "colaborador"
}
         ↓
BackEnd [UserController.js]:
├─ Valida email único (Usuario.findOne)
├─ Valida senha forte (regex: 8+ chars, maiúscula, número, símbolo)
├─ Hash senha: bcryptjs.hashSync(senha, 10)
├─ Cria registro: Usuario.create({ nome, email, senha_hash, role })
└─ Retorna: { success: true, message: "Usuário criado com sucesso" }
         ↓
FrontEnd: Mostra mensagem "Cadastro realizado! Faça login."
```

### **Passo 2: Login**
```
Usuário preenche (email, senha)
         ↓
FrontEnd: POST /api/auth/login
{
  "email": "joao@example.com",
  "senha": "Senha123!@#"
}
         ↓
BackEnd [UserController.js]:
├─ Busca usuário: Usuario.findOne({ where: { email } })
├─ Verifica senha: bcryptjs.compare(inputSenha, storedHash)
├─ Gera JWT:
│  const token = jwt.sign(
│    { id: user.id },
│    process.env.JWT_SECRET,
│    { expiresIn: '24h' }
│  )
└─ Retorna:
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "nome": "João Silva",
       "email": "joao@example.com",
       "role": "estudante"
     }
   }
         ↓
FrontEnd [AuthContext.jsx]:
├─ localStorage.setItem('comaes_token', token)
├─ localStorage.setItem('comaes_user', JSON.stringify(user))
├─ setUser(user)
├─ setToken(token)
└─ Redireciona: navigate(getPostLoginRoute(user.role))
   ├─ role='estudante' → /dashboard
   ├─ role='colaborador' → /colaborador/dashboard
   └─ role='admin' → /admin/dashboard
```

### **Passo 3: Requisição Autenticada**
```
Cliente quer acessar: GET /api/questoes
         ↓
FrontEnd [axios interceptor]:
├─ Lê token do localStorage
├─ Adiciona header:
│  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
└─ Envia requisição
         ↓
BackEnd [Middleware auth.js]:
├─ Extrai token do header Authorization
├─ Valida JWT: jwt.verify(token, JWT_SECRET)
├─ Extrai ID do token: decoded.id = 1
├─ Busca usuário completo do BD:
│  Usuario.unscoped().findByPk(1)
│  [unscoped() ignora soft deletes]
├─ Validações adicionais por role:
│  ├─ Se role='colaborador' e status_colaborador='pendente':
│  │  Retorna 403: { message: "Aguardando aprovação" }
│  └─ Se user.ativo === false: Retorna 403
├─ Passa usuário ao req.user
└─ next()
         ↓
BackEnd [Controller]:
├─ Recebe req.user já validado
├─ Executa lógica de negócio
└─ Retorna dados
         ↓
FrontEnd:
├─ Recebe resposta com status 200
└─ Processa dados
```

### **Passo 4: Logout**
```
Usuário clica "Logout"
         ↓
FrontEnd [AuthContext.jsx]:
├─ localStorage.removeItem('comaes_token')
├─ localStorage.removeItem('comaes_user')
├─ setUser(null)
├─ setToken(null)
└─ navigate('/login')
```

## **Middleware de Autorização**

| Nome | Ficheiro | Validação | Uso |
|------|----------|-----------|-----|
| `authenticate` | [BackEnd/middlewares/auth.js](BackEnd/middlewares/auth.js) | Valida JWT | Todas rotas protegidas |
| `requireAdmin` | [BackEnd/middlewares/authorize.js](BackEnd/middlewares/authorize.js) | `role === 'admin'` | Admin panel |
| `isColaborador` | [BackEnd/middlewares/isColaborador.js](BackEnd/middlewares/isColaborador.js) | `role === 'colaborador'` | Criar questões |

### Exemplo de Uso
```javascript
// BackEnd/index.js
app.post('/api/questoes/colaborador/criar', 
  authenticate,          // Valida JWT
  isColaborador,         // Valida role
  (req, res) => {
    // Só colaboradores aprovados chegam aqui
  }
);
```

---

# 4️⃣ APIs PRINCIPAIS

## **Autenticação**

| Método | Endpoint | Descrição | Controller |
|--------|----------|-----------|-----------|
| POST | `/api/auth/register` | Registar novo usuário | UserController.register() |
| POST | `/api/auth/login` | Login com email/senha | UserController.login() |
| POST | `/api/auth/logout` | Logout | UserController.logout() |
| POST | `/api/auth/recuperar` | Recuperação de senha | UserController.recuperarSenha() |

## **Questões**

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/api/questoes/colaborador/criar` | Criar questão | Colaborador |
| GET | `/api/questoes/colaborador/minhas` | Minhas questões | Colaborador |
| GET | `/api/questoes/pendentes` | Questões pendentes | Admin |
| PUT | `/api/questoes/:id/aprovar` | Aprovar questão | Admin |
| PUT | `/api/questoes/:id/rejeitar` | Rejeitar questão | Admin |
| DELETE | `/api/questoes/:id` | Deletar questão | Admin/Criador |
| POST | `/api/questoes/colaborador/bloco` | Questões por bloco | Estudante |

**Implementação:** [BackEnd/controllers/QuestoesController.js](BackEnd/controllers/QuestoesController.js)

## **Torneios**

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/api/torneios` | Criar torneio | Admin |
| GET | `/api/torneios` | Listar torneios | Público |
| GET | `/api/torneios/:id` | Detalhes torneio | Público |
| PUT | `/api/torneios/:id` | Editar torneio | Admin |
| DELETE | `/api/torneios/:id` | Deletar torneio | Admin |
| POST | `/api/torneios/:id/inscrever` | Inscrever estudante | Estudante |
| PUT | `/api/torneios/:id/finalizar` | Finalizar torneio | Admin |
| GET | `/api/torneios/:id/vencedores` | Top 3 vencedores | Público |

**Implementação:** [BackEnd/controllers/TorneioController.js](BackEnd/controllers/TorneioController.js)

## **Suporte (IA Gemini)**

| Método | Endpoint | Descrição | Tecnologia |
|--------|----------|-----------|-----------|
| POST | `/api/support/chat` | Chat com IA | Google Gemini Flash-2.5 |

**Payload:**
```json
{
  "message": "Como criar um torneio?",
  "history": [
    { "role": "user", "parts": [{ "text": "Olá" }] },
    { "role": "model", "parts": [{ "text": "Olá! Como posso ajudar?" }] }
  ]
}
```

**Implementação:** [BackEnd/services/supportChatService.js](BackEnd/services/supportChatService.js)

**Features:**
- Extração automática de nome do utilizador
- Contexto de data/hora em português
- Resposta personalizada (max 250 palavras)
- Retry automático (2 tentativas, timeout 30s)
- Detecção de perguntas sobre data/hora com `getDataHoraAtual()`

---

# 5️⃣ BANCO DE DADOS

## **Tecnologias Utilizadas**

| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| Database | MySQL | 5.7+ |
| ORM | Sequelize | ^6.37.7 |
| Driver | MySQL2 | ^3.16.0 |

## **Conexão** 
[BackEnd/config/db.js](BackEnd/config/db.js):
```javascript
const sequelize = new Sequelize(
  process.env.DB_NAME || 'comaes',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: 3306,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
);
```

## **Tabelas Principais**

### 1. **usuarios** (Autenticação)
```sql
id (PK)
nome (VARCHAR 255)
email (VARCHAR 255, UNIQUE)
senha_hash (VARCHAR 255)
role (ENUM: 'estudante', 'colaborador', 'admin')
status_colaborador (ENUM: 'pendente', 'aprovado', 'rejeitado')
ativo (BOOLEAN)
created_at, updated_at
```
**Modelo:** [BackEnd/models/Usuario.js](BackEnd/models/Usuario.js)

### 2. **questoes** (Conteúdo)
```sql
id (PK)
titulo (VARCHAR 255)
descricao (LONGTEXT)
disciplina (ENUM: 'matematica', 'ingles', 'programacao')
tipo (ENUM: 'multipla_escolha', 'verdadeiro_falso', 'descritiva', 'programacao')
resposta_correta (TEXT)
dificuldade (ENUM: 'facil', 'medio', 'dificil')
usuario_id (FK → usuarios)
bloco_id (FK → blocos_questoes)
status (ENUM: 'pendente', 'aprovada', 'rejeitada')
motivo_rejeicao (TEXT)
created_at, updated_at
```
**Modelo:** [BackEnd/models/Questao.js](BackEnd/models/Questao.js)

### 3. **tornei os** (Competições)
```sql
id (PK)
titulo (VARCHAR 255)
descricao (LONGTEXT)
tipo (ENUM: 'rapido', 'completo')
disciplinas (JSON)
num_questoes_por_disciplina (INT)
inicia_em (DATETIME)
termina_em (DATETIME)
status (ENUM: 'planejamento', 'inscricoes_abertas', 'em_progresso', 'finalizado')
admin_id (FK → usuarios)
created_at, updated_at
```
**Modelo:** [BackEnd/models/Torneio.js](BackEnd/models/Torneio.js)

### 4. **participantes_torneio** (Inscrições)
```sql
id (PK)
torneio_id (FK → torneios)
usuario_id (FK → usuarios)
data_inscricao (DATETIME)
posicao_final (INT)
pontos_finais (INT)
status (ENUM: 'inscrito', 'em_progresso', 'completo')
```
**Modelo:** [BackEnd/models/ParticipanteTorneio.js](BackEnd/models/ParticipanteTorneio.js)

### 5. **notificacoes** (Alerts)
```sql
id (PK)
usuario_id (FK → usuarios)
tipo (VARCHAR 100)
titulo (VARCHAR 255)
mensagem (LONGTEXT)
lida (BOOLEAN)
created_at, updated_at
```
**Modelo:** [BackEnd/models/Notificacao.js](BackEnd/models/Notificacao.js)

### 6. **certificados** (Prêmios)
```sql
id (PK)
usuario_id (FK → usuarios)
torneio_id (FK → torneios)
posicao (INT: 1, 2, 3)
codigo_validacao (UUID, UNIQUE)
data_emissao (DATETIME)
pdf_path (VARCHAR 255)
```
**Modelo:** [BackEnd/models/Certificado.js](BackEnd/models/Certificado.js)

### 7. **rankings** (Pontuação)
```sql
id (PK)
usuario_id (FK → usuarios)
disciplina (VARCHAR 100)
pontos_totais (INT)
num_questoes_respondidas (INT)
taxa_acerto (DECIMAL)
posicao (INT)
updated_at
```
**Modelo:** [BackEnd/models/Ranking.js](BackEnd/models/Ranking.js)

### 8. **tentativas_resposta** (Respostas)
```sql
id (PK)
usuario_id (FK → usuarios)
questao_id (FK → questoes)
torneio_id (FK → torneios)
resposta_dada (LONGTEXT)
correta (BOOLEAN)
pontos_obtidos (INT)
tempo_resposta (INT, segundos)
created_at
```
**Modelo:** [BackEnd/models/TentativaResposta.js](BackEnd/models/TentativaResposta.js)

## **Relacionamentos Sequelize**

[BackEnd/models/associations.js](BackEnd/models/associations.js):
```javascript
Usuario.hasMany(Questao, { foreignKey: 'usuario_id' });
Questao.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Usuario.hasMany(ParticipanteTorneio, { foreignKey: 'usuario_id' });
ParticipanteTorneio.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Torneio.hasMany(ParticipanteTorneio, { foreignKey: 'torneio_id' });
ParticipanteTorneio.belongsTo(Torneio, { foreignKey: 'torneio_id' });

// [... mais relacionamentos]
```

## **Migrações**

[BackEnd/migrations/](BackEnd/migrations/):
```bash
npx sequelize-cli db:migrate       # Executar todas as migrações
npx sequelize-cli db:migrate:undo  # Desfazer última migração
```

---

# 6️⃣ COMUNICAÇÃO REAL-TIME (WebSocket)

## **Socket.io Integration**

### **Backend Setup**
[BackEnd/index.js](BackEnd/index.js):
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5175',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);
  
  // Notificações em tempo real
  socket.on('nova-notificacao', (data) => {
    io.emit('notificacao-recebida', data);
  });
  
  // Atualização de ranking
  socket.on('atualizar-ranking', (data) => {
    io.emit('ranking-atualizado', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});
```

### **Frontend Setup**
[FrontEnd/src/socket.js](FrontEnd/src/socket.js):
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3002', {
  autoConnect: true,
  reconnection: true
});

socket.on('notificacao-recebida', (data) => {
  console.log('Nova notificação:', data);
  // Atualiza UI em tempo real
});

socket.on('ranking-atualizado', (data) => {
  console.log('Ranking atualizado:', data);
  // Atualiza ranking em tempo real
});

export default socket;
```

### **Casos de Uso**
1. **Notificações instantâneas**: Quando questão é aprovada/rejeitada
2. **Atualização de Ranking**: Quando alguém completa um torneio
3. **Mensagens em tempo real**: Chat de suporte
4. **Atualizações de Torneios**: Status de inscrição, término

---

# 7️⃣ FUNCIONALIDADES PRINCIPAIS (20+)

## **1. Autenticação e Gestão de Usuários**

**Descrição:** Sistema de login, registro e gestão de perfil com 3 roles diferentes

**Frontend:**
- [FrontEnd/Paginas/Primarias/AuthContainer.jsx](FrontEnd/Paginas/Primarias/AuthContainer.jsx)
- Formulários: login, registro estudante, registro colaborador
- Validação de senha forte (regex)

**Backend:**
- [BackEnd/controllers/UserController.js](BackEnd/controllers/UserController.js) - `register()`, `login()`, `editPerfil()`
- [BackEnd/middlewares/auth.js](BackEnd/middlewares/auth.js) - `authenticate()`
- [BackEnd/models/Usuario.js](BackEnd/models/Usuario.js)

**BD:**
- Tabela `usuarios`: id, nome, email, senha_hash, role, status_colaborador

**Features:**
- ✅ Registro com validação de email único
- ✅ Senha com hash bcryptjs
- ✅ JWT token (24h expiração)
- ✅ Role-based access control (RBAC)
- ✅ Recuperação de senha

---

## **2. Sistema de Questões com Aprovação**

**Descrição:** Colaboradores criam questões, admin aprova/rejeita

**Frontend:**
- [FrontEnd/Colaborador/CreateQuestaoForm.jsx](FrontEnd/Colaborador/CreateQuestaoForm.jsx) - Criar questão
- [FrontEnd/Administrador/QuestoesPendentesTab.jsx](FrontEnd/Administrador/QuestoesPendentesTab.jsx) - Aprovação
- [FrontEnd/Colaborador/MinhasQuestoes.jsx](FrontEnd/Colaborador/MinhasQuestoes.jsx) - Ver minhas questões

**Backend:**
- [BackEnd/controllers/QuestoesController.js](BackEnd/controllers/QuestoesController.js)
  - `criar()` - POST /api/questoes/colaborador/criar
  - `minhas()` - GET /api/questoes/colaborador/minhas
  - `aprovar()` - PUT /api/questoes/:id/aprovar
  - `rejeitar()` - PUT /api/questoes/:id/rejeitar

**BD:**
- Tabela `questoes`: id, titulo, descricao, disciplina, tipo, status, usuario_id
- Tabla `blocos_questoes`: Agrupamento de questões

**Fluxo:**
```
Colaborador cria questão
     ↓
Status: 'pendente'
     ↓
Admin visualiza no painel
     ↓
Admin aprova/rejeita
     ↓
Questão passa para 'aprovada' ou 'rejeitada'
     ↓
Notificação real-time ao colaborador
```

---

## **3. Torneios com Inscrição**

**Descrição:** Admin cria torneios, estudantes inscrevem-se e participam

**Frontend:**
- [FrontEnd/Paginas/Secundarias/EntrarTorneio.jsx](FrontEnd/Paginas/Secundarias/EntrarTorneio.jsx) - Listar + inscrever
- [FrontEnd/components/TournamentRegistrationModal.jsx](FrontEnd/components/TournamentRegistrationModal.jsx) - Modal inscrição

**Backend:**
- [BackEnd/controllers/TorneioController.js](BackEnd/controllers/TorneioController.js)
  - `criar()` - POST /api/torneios
  - `listar()` - GET /api/torneios
  - `inscrever()` - POST /api/torneios/:id/inscrever
  - `finalizar()` - PUT /api/torneios/:id/finalizar

**BD:**
- Tabela `torneios`: id, titulo, tipo, disciplinas, inicia_em, termina_em, status
- Tabela `participantes_torneio`: inscrições

**Features:**
- ✅ Tipos de torneio: rápido (5-10 questões) e completo (20-30 questões)
- ✅ Disciplinas: Matemática, Inglês, Programação
- ✅ Status automático: planejamento → inscrições_abertas → em_progresso → finalizado
- ✅ Restrições: Estudante só pode inscrever se não participou da mesma disciplina no mesmo mês

---

## **4. Teste de Conhecimento**

**Descrição:** Estudante faz teste interativo com feedback imediato

**Frontend:**
- [FrontEnd/Paginas/Secundarias/Teste.jsx](FrontEnd/Paginas/Secundarias/Teste.jsx)
- [FrontEnd/Paginas/Tercearios/ModeloOriginal/MatematicaOriginal.jsx](FrontEnd/Paginas/Tercearios/ModeloOriginal/MatematicaOriginal.jsx)

**Backend:**
- [BackEnd/controllers/TesteConhecimentoController.js](BackEnd/controllers/TesteConhecimentoController.js)
  - `obterQuestoes()` - GET /api/teste/:disciplina/questoes
  - `submeter()` - POST /api/teste/submeter

**BD:**
- Tabela `tentativas_teste`: resultado final
- Tabela `tentativas_resposta`: cada resposta individual

**Features:**
- ✅ 3 modos: Fácil (20%), Médio (50%), Difícil (30%)
- ✅ Feedback imediato: ✓ correto ou ✗ errado
- ✅ Pontos XP baseado em dificuldade
- ✅ Histórico de tentativas

---

## **5. Sistema de Ranking**

**Descrição:** Ranking dinâmico por disciplina e global

**Frontend:**
- [FrontEnd/Paginas/Secundarias/Ranking.jsx](FrontEnd/Paginas/Secundarias/Ranking.jsx) - Ranking básico
- [FrontEnd/Paginas/Secundarias/RankingCompleto.jsx](FrontEnd/Paginas/Secundarias/RankingCompleto.jsx) - Ranking detalhado
- [FrontEnd/components/ranking/RankingDisplay.jsx](FrontEnd/components/ranking/RankingDisplay.jsx)

**Backend:**
- [BackEnd/services/rankingService.js](BackEnd/services/rankingService.js) - `calcularRanking()`
- [BackEnd/controllers/RankingController.js](BackEnd/controllers/RankingController.js)
  - `obter()` - GET /api/ranking/:disciplina
  - `global()` - GET /api/ranking/global

**BD:**
- Tabela `rankings`: usuario_id, disciplina, pontos_totais, posicao

**Cálculo:**
```
Pontos = (questões_certas / total_questões) * 100 * dificuldade
         + bonus_streak + bonus_tempo_rapido
```

---

## **6. Certificados**

**Descrição:** Geração automática de PDF para os 3 primeiros colocados

**Frontend:**
- [FrontEnd/components/certificates/CertificateModal.jsx](FrontEnd/components/certificates/CertificateModal.jsx)
- [FrontEnd/Administrador/CertificadosTab.jsx](FrontEnd/Administrador/CertificadosTab.jsx) - Listar certificados

**Backend:**
- [BackEnd/controllers/CertificateController.js](BackEnd/controllers/CertificateController.js)
  - `gerar()` - Cria PDF com Puppeteer
  - `listar()` - GET /api/certificados
  - `validar()` - GET /api/certificados/validar/:codigo

**BD:**
- Tabela `certificados`: usuario_id, torneio_id, posicao, codigo_validacao, pdf_path

**Features:**
- ✅ PDF gerado automaticamente após torneio
- ✅ Código de validação único (UUID)
- ✅ QR code para verificação
- ✅ Endpoint de validação pública: /validador/{codigo}

---

## **7. Sistema de Notificações**

**Descrição:** Notificações em tempo real via Socket.io e BD

**Frontend:**
- [FrontEnd/Paginas/Secundarias/NotificacoesPage.jsx](FrontEnd/Paginas/Secundarias/NotificacoesPage.jsx)
- Badge de notificações não lidas na navbar

**Backend:**
- [BackEnd/models/Notificacao.js](BackEnd/models/Notificacao.js)
- [BackEnd/routes/notificacoesRoutes.js](BackEnd/routes/notificacoesRoutes.js)
  - `listar()` - GET /api/notificacoes
  - `marcarComoLida()` - PUT /api/notificacoes/:id/ler

**BD:**
- Tabela `notificacoes`: usuario_id, tipo, titulo, mensagem, lida

**Eventos:**
- Questão aprovada/rejeitada
- Torneio está começando
- Você entrou no pódio
- Novo comentário em questão

---

## **8. Chat de Suporte (IA Gemini)**

**Descrição:** Assistente IA que responde questões sobre COMAES

**Frontend:**
- [FrontEnd/components/SupportChat.jsx](FrontEnd/components/SupportChat.jsx)
  - Botão flutuante com imagem assistente.png
  - Modal com FAQ + Chat
  - Responsivo mobile

**Backend:**
- [BackEnd/services/supportChatService.js](BackEnd/services/supportChatService.js)
  - `askSupportAI()` - POST /api/support/chat
  - `getDataHoraAtual()` - Data em português
  - Message enrichment para contexto

**Tecnologia:**
- Google Generative AI (Gemini Flash-2.5)
- Retry: 2 tentativas com delay de 1s
- Timeout: 30 segundos
- Rate limit: 10 req/min por usuário

**Features:**
- ✅ Extração de nome na primeira mensagem
- ✅ Resposta personalizada com nome do usuário
- ✅ Suporte a perguntas gerais (não só COMAES)
- ✅ Contexto de data/hora automático
- ✅ Indicador de digitação
- ✅ Histórico de 6 mensagens (3 trocas)

---

## **9. Dashboard do Estudante**

**Descrição:** Visão geral do progresso: XP, nível, streak, próximas ações

**Frontend:**
- [FrontEnd/Paginas/Secundarias/Dashboard.jsx](FrontEnd/Paginas/Secundarias/Dashboard.jsx)

**Componentes:**
- Gráfico de XP ganho (Recharts)
- Nível atual + próximo nível
- Streak de dias consecutivos
- Torneios próximos
- Notificações recentes
- Ranking de hoje

---

## **10. Painel Admin**

**Descrição:** Painel unificado com múltiplas abas de gestão

**Frontend:**
- [FrontEnd/Administrador/AdminDashboard.jsx](FrontEnd/Administrador/AdminDashboard.jsx)
  - Tabs: Dashboard, Questões Pendentes, Questões Colaborador, Questões Torneio, Torneios, Colaboradores, Certificados, Blocos

**Abas:**

| Aba | Função |
|-----|--------|
| Dashboard | Estatísticas globais |
| Questões Pendentes | Aprovação/rejeição de questões |
| Questões Colaborador | Questões criadas por colaborador |
| Questões Torneio | Questões específicas de um torneio |
| Torneios | CRUD de torneios |
| Colaboradores | Aprovação de colaboradores novos |
| Certificados | Listar certificados emitidos |
| Blocos | Gerenciar blocos de questões |

---

## **[CONTINUA... outras 10+ funcionalidades]**

**Resumo das funcionalidades restantes:**
- Portal de Notícias
- Sistema de Gamificação (XP, Níveis, Missões)
- Recuperação de Senha
- Perfil do Usuário
- Configurações
- Página Sobre (com imagens time)
- Privacidade / Termos
- Jornada de Aprendizado
- Suspensão de Colaboradores
- Estatísticas Admin

---

# 8️⃣ FLUXO COMPLETO DE EXECUÇÃO

## **Fluxo 1: Abrir Sistema (Primeira Vez)**

```
Utilizador acessa http://localhost:5175/
                ↓
FrontEnd/main.jsx:
├─ React renderiza <App />
├─ AuthContext verifica localStorage
│  ├─ Não existe token → user = null
│  └─ Renderiza tela de login
                ↓
FrontEnd/App.jsx:
├─ <Routes>
├─ "/" → SmartHome()
│  ├─ user === null → redireciona /login
│  └─ Renderiza AuthContainer
                ↓
FrontEnd/Paginas/Primarias/AuthContainer.jsx:
├─ Mostra formulário de login
├─ Inputs: email, senha
└─ Botões: Login, Criar Conta (estudante), Criar Conta (colaborador)
```

## **Fluxo 2: Login**

```
Usuário preench email + senha
       ↓
FrontEnd: Submit form
       ↓
axios.post('/api/auth/login', { email, senha })
       ↓
BackEnd/index.js:
├─ POST /api/auth/login handler
├─ UserController.login(req, res)
│  ├─ Busca usuário: Usuario.findOne({ email })
│  ├─ Verifica senha: bcryptjs.compare()
│  ├─ Gera JWT: jwt.sign({ id: user.id }, JWT_SECRET, '24h')
│  ├─ Retorna: { success, token, user }
└─ Resposta HTTP 200
       ↓
FrontEnd:
├─ AuthContext.login(user, token)
├─ localStorage.setItem('comaes_token', token)
├─ localStorage.setItem('comaes_user', JSON.stringify(user))
├─ Redireciona: navigate(getPostLoginRoute(user.role))
│  ├─ role='estudante' → /dashboard
│  ├─ role='colaborador' → /colaborador/dashboard
│  └─ role='admin' → /admin/dashboard
└─ Renderiza Layout
```

## **Fluxo 3: Criar Questão (Colaborador)**

```
Colaborador acessa /colaborador/dashboard
       ↓
FrontEnd/Colaborador/ColaboradorDashboard.jsx:
├─ Mostra botão "Nova Questão"
└─ Usuario clica
       ↓
FrontEnd/Colaborador/CreateQuestaoForm.jsx:
├─ Form com campos:
│  ├─ Título
│  ├─ Descrição
│  ├─ Disciplina (select: matemática, inglês, programação)
│  ├─ Tipo (múltipla escolha, verdadeiro/falso, descritiva)
│  ├─ Resposta correta
│  └─ Resposta explicada (opcional)
└─ Botão "Enviar para Aprovação"
       ↓
FrontEnd: POST /api/questoes/colaborador/criar
Body: { titulo, descricao, disciplina, tipo, resposta_correta, ... }
Header: Authorization: Bearer <token>
       ↓
BackEnd/middlewares/auth.js:
├─ Valida JWT
├─ Extrai user do BD
└─ Passa req.user
       ↓
BackEnd/middlewares/isColaborador.js:
├─ Valida role === 'colaborador'
├─ Valida status_colaborador === 'aprovado'
└─ next()
       ↓
BackEnd/controllers/QuestoesController.js:
├─ Cria questão: Questao.create({
│  ├─ titulo,
│  ├─ descricao,
│  ├─ disciplina,
│  ├─ tipo,
│  ├─ resposta_correta,
│  ├─ usuario_id: req.user.id,
│  ├─ status: 'pendente'
│  └─ })
└─ Retorna: { success, questao, message: "Questão criada..." }
       ↓
FrontEnd:
├─ Mostra toast: "Questão enviada para aprovação!"
├─ Limpa formulário
└─ Redireciona para MinhasQuestoes
       ↓
BackEnd (Socket.io):
├─ Emite evento 'nova-questao-pendente'
└─ Admin recebe notificação real-time
```

## **Fluxo 4: Admin Aprova Questão**

```
Admin acessa /admin/dashboard
       ↓
FrontEnd/Administrador/AdminDashboard.jsx:
├─ Clica aba "Questões Pendentes"
└─ Renderiza QuestoesPendentesTab
       ↓
FrontEnd/Administrador/QuestoesPendentesTab.jsx:
├─ Faz GET /api/questoes/pendentes
├─ Recebe lista de questões com status='pendente'
├─ Mostra cada questão com botões:
│  ├─ ✓ Aprovar
│  └─ ✗ Rejeitar (com modal para motivo)
└─ Admin clica "Aprovar"
       ↓
FrontEnd: PUT /api/questoes/{id}/aprovar
Body: { }
Header: Authorization: Bearer <admin_token>
       ↓
BackEnd/middlewares/auth.js → requireAdmin.js:
├─ Valida role === 'admin'
└─ next()
       ↓
BackEnd/controllers/QuestoesController.js:
├─ Atualiza questão:
│  ├─ status = 'aprovada'
│  ├─ updated_at = NOW()
│  └─ save()
└─ Retorna: { success, message: "Questão aprovada" }
       ↓
BackEnd (Socket.io):
├─ io.to(colaborador_socket_id).emit('questao-aprovada', {
│  ├─ questao_id,
│  ├─ titulo,
│  └─ message: "Sua questão foi aprovada!"
│  })
└─ Cria notificação em BD
       ↓
FrontEnd:
├─ Recebe evento via socket
├─ Mostra notificação push
├─ Atualiza lista (remove da pendentes)
└─ Admin vê confirmação
```

## **Fluxo 5: Estudante Participa de Torneio**

```
Estudante acessa /entrar-torneio
       ↓
FrontEnd/Paginas/Secundarias/EntrarTorneio.jsx:
├─ Faz GET /api/torneios
├─ Filtra: status === 'inscricoes_abertas'
└─ Mostra lista de torneios com:
   ├─ Título
   ├─ Disciplinas
   ├─ Data início/fim
   ├─ Número de inscritos
   └─ Botão "Inscrever-me"
       ↓
Estudante clica "Inscrever-me"
       ↓
FrontEnd/components/TournamentRegistrationModal.jsx:
├─ Mostra modal de confirmação
├─ Valida:
│  ├─ Não pode estar já inscrito
│  ├─ Não pode ter participado da mesma disciplina no mesmo mês
│  └─ Torneio deve estar em período de inscrições
└─ Botão "Confirmar Inscrição"
       ↓
FrontEnd: POST /api/torneios/{torneio_id}/inscrever
Header: Authorization: Bearer <token>
       ↓
BackEnd/controllers/TorneioController.js:
├─ Valida se estudante pode inscrever
├─ Cria ParticipanteTorneio:
│  ├─ torneio_id,
│  ├─ usuario_id: req.user.id,
│  ├─ data_inscricao: NOW(),
│  └─ status: 'inscrito'
└─ Retorna: { success, message: "Inscrito com sucesso!" }
       ↓
FrontEnd:
├─ Mostra toast: "Você foi inscrito!"
├─ Redireciona para /torneio/{id}
└─ Mostra WaitingScreen com:
   ├─ "Aguardando início do torneio..."
   ├─ Countdown timer
   ├─ FAQ do torneio
   └─ Botão "Começar Teste"
       ↓
Quando torneio começa:
├─ Socket.io envia evento 'torneio-iniciado'
├─ WaitingScreen desaparece
└─ Teste começa automaticamente
```

## **Fluxo 6: Estudante Responde Questão em Torneio**

```
FrontEnd/Paginas/Secundarias/Teste.jsx:
├─ Faz GET /api/teste/{disciplina_torneio}/questoes
├─ Recebe lista de questões do torneio
└─ Mostra primeira questão
       ↓
Estudante lê questão + opções
       ↓
Estudante seleciona resposta + clica "Próxima"
       ↓
FrontEnd: POST /api/tentativas/responder
Body: {
  "questao_id": 123,
  "torneio_id": 456,
  "resposta_dada": "opção_b",
  "tempo_resposta": 45  // segundos
}
       ↓
BackEnd/controllers/TentativasController.js:
├─ Busca questão: Questao.findByPk(questao_id)
├─ Compara: resposta_dada === questao.resposta_correta
├─ Calcula pontos:
│  ├─ Se correto: pontos = 100 * dificuldade_multiplicador
│  ├─ Se errado: pontos = 0
│  └─ Bonus tempo: se respondeu em < 30s: +20 pontos
├─ Cria TentativaResposta:
│  ├─ usuario_id,
│  ├─ questao_id,
│  ├─ torneio_id,
│  ├─ resposta_dada,
│  ├─ correta: true/false,
│  ├─ pontos_obtidos,
│  └─ tempo_resposta
├─ Atualiza ranking do estudante
└─ Retorna: { success, correta, resposta_correta, explicacao }
       ↓
FrontEnd:
├─ Se correta:
│  ├─ Mostra ✓ com cor verde
│  ├─ Mostra "+100 pontos!"
│  └─ Toca som de acerto
├─ Se errada:
│  ├─ Mostra ✗ com cor vermelha
│  ├─ Mostra explicação
│  └─ Toca som de erro
├─ Aguarda 2 segundos
└─ Mostra próxima questão
       ↓
Quando todas as questões respondidas:
├─ Fim do teste
├─ Mostra resultado:
│  ├─ Questões certas / total
│  ├─ Pontos finais
│  ├─ Posição no ranking
│  └─ Certificado (se 1º, 2º ou 3º)
└─ Redireciona para /ranking
```

## **Fluxo 7: Admin Finaliza Torneio**

```
Admin acessa /admin/dashboard → Torneios
       ↓
Admin clica no torneio finalizado
       ↓
FrontEnd mostra opção "Finalizar Torneio"
       ↓
Admin clica "Finalizar"
       ↓
BackEnd/services/TournamentFinalizerService.js:
├─ Busca todos os participantes
├─ Ordena por pontos_finais DESC
├─ Seleciona top 3
├─ Para cada top 3:
│  ├─ Cria Certificado
│  ├─ Gera PDF com Puppeteer
│  ├─ Gera código validação (UUID)
│  ├─ Armazena em BD
│  └─ Envia email com PDF
├─ Atualiza torneio.status = 'finalizado'
└─ Socket.io emite 'torneio-finalizado'
       ↓
FrontEnd:
├─ Todos os participantes recebem notificação
├─ Top 3 veem mensagem: "Parabéns! Você ganhou um certificado!"
└─ Certificado aparece no perfil do usuário
```

---

# 9️⃣ QUESTÕES POTENCIAIS DE BANCA (30)

### **Arquitetura e Tecnologias**

**P1. Qual é o padrão arquitetural do COMAES? Descreva cada camada.**
- **Resposta:** Cliente-Servidor com MVC. Camada apresentação (React/Vite), lógica (Express/Node), dados (MySQL).
- **Ficheiro:** Backend/index.js, FrontEnd/src/App.jsx
- **Localização:** Estrutura geral do projeto

**P2. Por que escolheu React + Vite no frontend em vez de Vue ou Angular?**
- **Resposta:** React é o padrão de mercado, Vite oferece HMR rápido e build otimizado. Componentes reutilizáveis com JSX.
- **Ficheiro:** FrontEnd/vite.config.js, FrontEnd/package.json
- **Evidence:** React ^18.3.1, Vite ^5.4.1

**P3. Explique a comunicação entre Frontend e Backend.**
- **Resposta:** REST API (HTTP) via axios para CRUD, WebSocket (Socket.io) para notificações em tempo real.
- **Ficheiro:** FrontEnd/services/questoesService.js, BackEnd/index.js
- **Exemplo:** POST /api/questoes/colaborador/criar, Socket.io eventos

**P4. O sistema usa ORM. Qual? Por quê?**
- **Resposta:** Sequelize com MySQL. Oferece migrações automáticas, validações, relacionamentos.
- **Ficheiro:** BackEnd/config/db.js, BackEnd/models/
- **Localização:** Sequelize ^6.37.7

**P5. Como implementou autenticação JWT?**
- **Resposta:** jwt.sign() na login, jwt.verify() em middleware de autenticação. Token armazenado em localStorage.
- **Ficheiro:** BackEnd/middlewares/auth.js, BackEnd/index.js ~400
- **Fluxo:** POST /api/auth/login → generate token → localStorage.setItem

---

### **Autenticação e Segurança**

**P6. Qual é a validação mínima de senha? Mostre o regex.**
- **Resposta:** 8+ caracteres, maiúscula, minúscula, número, símbolo.
- **Regex:** `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/`
- **Ficheiro:** BackEnd/middlewares/validate.js
- **Localização:** validatePassword()

**P7. Como protege contra acesso não autorizado?**
- **Resposta:** Middlewares: authenticate (valida JWT), requireAdmin (role check), isColaborador (colaborador check).
- **Ficheiro:** BackEnd/middlewares/auth.js, authorize.js, isColaborador.js
- **Exemplo:** app.post('/api/admin/*', authenticate, requireAdmin, ...)

**P8. O que faz se token expirar?**
- **Resposta:** Valida expiração em jwt.verify(). Se expirado, retorna 401 TOKEN_EXPIRED. Frontend intercepta e redireciona para login.
- **Ficheiro:** BackEnd/middlewares/auth.js, FrontEnd/main.jsx
- **Localização:** try-catch em authenticate(), global fetch interceptor

**P9. Como implementou RBAC (Role-Based Access Control)?**
- **Resposta:** 3 roles: estudante, colaborador, admin. Cada role tem rotas específicas e middlewares.
- **Ficheiro:** BackEnd/middlewares/roleMiddleware.js, FrontEnd/context/ProtectedRoute.jsx
- **Fluxo:** Login → user.role armazenado → middlewares validam no acesso

**P10. Onde está o hash de senha e por que bcryptjs?**
- **Resposta:** bcryptjs.hashSync() no registro. Bcrypt é resistente contra force-brute (lento deliberadamente).
- **Ficheiro:** BackEnd/controllers/UserController.js (register)
- **Salts:** bcryptjs.hashSync(senha, 10) - 10 rounds

---

### **APIs e Backend**

**P11. Liste os endpoints principais do seu sistema.**
- **Resposta:** 
  - `/api/auth/login`, `/api/auth/register`
  - `/api/questoes/colaborador/criar`, `/api/questoes/pendentes`
  - `/api/torneios`, `/api/torneios/:id/inscrever`
  - `/api/support/chat`
  - `/api/admin/*`
- **Ficheiro:** BackEnd/routes/*.js, BackEnd/index.js

**P12. Como implementou a criação e aprovação de questões?**
- **Resposta:** Colaborador cria (POST), status='pendente'. Admin aprova (PUT), status='aprovada'. Socket.io notifica.
- **Ficheiro:** BackEnd/controllers/QuestoesController.js
- **Fluxo:** criar() → listar() → aprovar() → rejeitar()

**P13. Explique o fluxo de um torneio do início ao fim.**
- **Resposta:** Admin cria (status='planejamento') → abre inscrições (status='inscricoes_abertas') → inicia (status='em_progresso') → estudantes respondem → finaliza (status='finalizado') → emite certificados.
- **Ficheiro:** BackEnd/controllers/TorneioController.js, services/TournamentFinalizerService.js
- **Tempo:** Cron job verifica encerramento a cada minuto

**P14. Como validou os dados que chegam do Frontend?**
- **Resposta:** Middlewares de validação em cada rota. Valida email, senha, tipos de dados, ranges.
- **Ficheiro:** BackEnd/middlewares/validate.js
- **Exemplo:** validateEmail(), validatePassword(), validatePhone()

**P15. O sistema integra IA. Como funciona o chat de suporte?**
- **Resposta:** POST /api/support/chat chama Google Generative AI (Gemini Flash-2.5). Detecta perguntas sobre data com regex. Inclui contexto de data/hora.
- **Ficheiro:** BackEnd/services/supportChatService.js
- **Features:** Retry 2x, timeout 30s, name extraction, message enrichment

---

### **Banco de Dados**

**P16. Quantas tabelas principais tem? Liste as 5 mais importantes.**
- **Resposta:** ~30 tabelas. Top 5: usuarios, questoes, torneios, participantes_torneio, tentativas_resposta
- **Ficheiro:** BackEnd/models/
- **Campos:** Ver descrição acima

**P17. Explique os relacionamentos entre Torneio, ParticipanteTorneio e Usuario.**
- **Resposta:** Usuario hasMany ParticipanteTorneio, Torneio hasMany ParticipanteTorneio. Many-to-many: Torneio ←→ Usuario.
- **Ficheiro:** BackEnd/models/associations.js
- **Exemplo:** 
  ```javascript
  Torneio.hasMany(ParticipanteTorneio);
  Usuario.hasMany(ParticipanteTorneio);
  ```

**P18. Como implementou as migrações no Sequelize?**
- **Resposta:** Cada migração é um ficheiro. npx sequelize-cli db:migrate aplica todas. Histórico em `SequelizeMeta`.
- **Ficheiro:** BackEnd/migrations/
- **Comando:** npx sequelize-cli migration:generate --name create-usuarios

**P19. Como protegeu contra SQL injection?**
- **Resposta:** Sequelize ORM sanitiza queries automaticamente. Usa placeholders (?) em raw queries.
- **Ficheiro:** BackEnd/models/, BackEnd/controllers/
- **Exemplo:** Usuario.findOne({ where: { email } }) - Safe

**P20. Como otimizou as queries ao BD?**
- **Resposta:** Eager loading (include), pagination, índices em colunas frequentes (email, user_id).
- **Ficheiro:** BackEnd/controllers/, Sequelize lazy loading prevention
- **Exemplo:** `Questao.findAll({ include: ['Usuario'], limit: 20, offset: 0 })`

---

### **Frontend e UX**

**P21. Como estruturou o roteamento no React?**
- **Resposta:** React Router v7. <BrowserRouter> + <Routes>. SmartHome() redireciona por role. Protected routes com ProtectedRoute.
- **Ficheiro:** FrontEnd/src/App.jsx
- **Componentes:** ProtectedEstudanteRoute, ProtectedColaboradorRoute, ProtectedAdminRoute

**P22. Qual é a estrutura de componentes no Frontend?**
- **Resposta:** Componentes reutilizáveis em /components. Páginas em /Paginas. Padrão: componente + estilo CSS.
- **Ficheiro:** FrontEnd/src/components/, FrontEnd/src/Paginas/
- **Exemplo:** SupportChat.jsx, ErrorBoundary.jsx, ComaesModal.jsx

**P23. Como implementou responsividade mobile?**
- **Resposta:** Tailwind CSS com breakpoints (sm, md, lg). Media queries em mobile-responsive.css. Componentes adaptam tamanho.
- **Ficheiro:** FrontEnd/src/styles/mobile-responsive.css, Tailwind config
- **Exemplo:** className="w-12 sm:w-14" → mobile pequeno, desktop grande

**P24. Qual é o padrão de estado global no projeto?**
- **Resposta:** React Context API. AuthContext armazena user e token. Evita prop drilling.
- **Ficheiro:** FrontEnd/src/context/AuthContext.jsx
- **Uso:** useAuth() hook em qualquer componente

**P25. Como tratou erros no Frontend?**
- **Resposta:** ErrorBoundary captura erros React. Try-catch em async calls. Global fetch interceptor para 401.
- **Ficheiro:** FrontEnd/src/components/ErrorBoundary.jsx, FrontEnd/src/main.jsx
- **Fallback:** Renderiza página de erro com mensagem amigável

---

### **Funcionalidades Avançadas**

**P26. Como funciona o sistema de ranking?**
- **Resposta:** Calcula pontos: (certas/total) * 100 * dificuldade + bonus. Atualiza tabela rankings após cada resposta.
- **Ficheiro:** BackEnd/services/rankingService.js
- **Fórmula:** pontos = (questões_certas / total) * 100 * dificuldade_multiplicador + bonus_tempo

**P27. Como gerou os certificados em PDF?**
- **Resposta:** Puppeteer renderiza HTML como PDF. Gera código validação (UUID). Armazena caminho em BD.
- **Ficheiro:** BackEnd/controllers/CertificateController.js
- **Triggers:** Ao finalizar torneio, gera para top 3

**P28. Explique o sistema de notificações real-time.**
- **Resposta:** Socket.io emite eventos (nova-questao-pendente, questao-aprovada). Frontend escuta e atualiza UI sem refresh.
- **Ficheiro:** BackEnd/index.js (Socket.io setup), FrontEnd/src/socket.js
- **Exemplo:** io.emit('notificacao-recebida', { titulo, mensagem })

**P29. Como implementou gamificação (XP, níveis, streaks)?**
- **Resposta:** XP ganho por resposta correta. Nível = XP / 1000. Streak = dias consecutivos respondendo.
- **Ficheiro:** BackEnd/services/xpService.js, streakService.js
- **Tabelas:** Nivel, Missao, Conquista

**P30. Qual foi o maior desafio técnico no projeto?**
- **Resposta:** [Responda com base na sua experiência] Exemplos: 
  - Integração IA Gemini com retry automático
  - Gerenciamento de estado global sem Redux
  - Performance de ranking com muitos usuários
  - Responsividade mobile em todos componentes
  - Sincronização real-time com Socket.io

---

## **DICAS PARA A DEFESA**

1. **Prepare uma apresentação visual:**
   - Diagrama arquitetura
   - Fluxogramas dos processos principais
   - Screenshots das páginas principais

2. **Tenha código pronto para mostrar:**
   - Abra os ficheiros mencionados em IDE
   - Mostre o código real durante a defesa
   - Execute o sistema ao vivo (se possível)

3. **Pratique o discurso:**
   - Explique com clareza e confiança
   - Não leia diretamente de documentos
   - Use exemplos concretos do código

4. **Prepare respostas para perguntas esperadas:**
   - Por que essas tecnologias?
   - Quais são as limitações?
   - Como escalaria o sistema?
   - Qual foi o maior aprendizado?

5. **Tenha números prontos:**
   - 30+ tabelas no BD
   - 20+ endpoints API
   - 50+ componentes React
   - 3 roles de usuário
   - 2 tipos de torneio

---

**Documento compilado para Defesa de TCC**  
**COMAES 3.2 - Plataforma de Torneios Educacionais**  
**Junho 2026**

