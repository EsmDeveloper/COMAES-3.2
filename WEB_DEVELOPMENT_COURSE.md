# 📚 CURSO COMPLETO: Desenvolvimento Web Moderno
## Baseado no Projeto COMAES 3.0

---

# MÓDULO 1 – Fundamentos da Web

## 1.1 Comunicação Cliente-Servidor

### Conceito
A web funciona através de um modelo de comunicação onde dois sistemas exchangex informações através de uma rede. O **cliente** (navegador/app) faz pedidos e o **servidor** (backend) responde.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODELO CLIENTE-SERVIDOR                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CLIENTE (Frontend)                    SERVIDOR (Backend)      │
│   ┌──────────────┐                      ┌──────────────┐      │
│   │  React App   │ ──── HTTP Request ──▶│  Express API  │      │
│   │  :5173       │                      │  :3000        │      │
│   └──────────────┘                      └──────────────┘      │
│        ▲                                        │               │
│        │         HTTP Response                 │               │
│        └────────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Como Funciona no COMAES

**Frontend (Cliente):**
```javascript
// FrontEnd/src/Administrador/adminService.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Faz pedido ao servidor
const response = await axios.get(`${API_BASE}/api/admin/users`);
```

**Backend (Servidor):**
```javascript
// BackEnd/index.js - Linha 164
app.get("/", async (req, res) => {
  res.json({
    message: "API Comaes funcionando!",
    status: "online",
    version: "2.0"
  });
});
```

### Ciclo de Requisição e Resposta HTTP

```
┌────────────────────────────────────────────────────────────────┐
│                    CICLO HTTP COMPLETO                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CLIENTE PREENCHE FORMULÁRIO                                │
│     └─▶ { "usuario": "joao@email.com", "senha": "123" }       │
│                                                                 │
│  2. FRONTEND CRIA HTTP REQUEST                                 │
│     POST /auth/login HTTP/1.1                                  │
│     Host: localhost:3000                                      │
│     Content-Type: application/json                             │
│     Body: {"usuario":"joao@email.com","senha":"123"}           │
│                                                                 │
│  3. SERVIDOR RECEBE REQUEST                                    │
│     └─▶ Express routing: app.post('/auth/login', ...)          │
│                                                                 │
│  4. SERVIDOR PROCESSA                                          │
│     └─▶ Busca no banco, valida senha, gera token               │
│                                                                 │
│  5. SERVIDOR RESPONDE                                          │
│     ◀── HTTP/1.1 200 OK                                        │
│     Content-Type: application/json                             │
│     Body: {"token":"eyJhbGci...", "user":{...}}                │
│                                                                 │
│  6. CLIENTE RECEBE E PROCESSA                                  │
│     └─▶ Guarda token, redireciona para dashboard               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Estrutura de uma API

Uma API REST segue uma estrutura padronizada:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRUTURA API REST                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RECURSO (substantivo)                                          │
│  ├── /usuarios          → Coleção de usuários                  │
│  ├── /usuarios/:id      → Usuário específico                    │
│  ├── /torneos           → Coleção de torneios                   │
│  └── /torneos/ativo    → Recurso específico (torneio ativo)    │
│                                                                 │
│  MÉTODOS HTTP                                                  │
│  ├── GET    → Ler/Buscar                                       │
│  ├── POST   → Criar                                            │
│  ├── PUT    → Atualizar (substituir)                           │
│  ├── PATCH  → Atualizar (parcial)                              │
│  └── DELETE → Remover                                           │
│                                                                 │
│  RESPOSTA JSON                                                 │
│  {                                                             │
│    "success": true,                                            │
│    "data": { ... },                                            │
│    "message": "Operação realizada com sucesso"                 │
│  }                                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# MÓDULO 2 – APIs na Prática

## 2.1 REST vs GraphQL

### Comparação

| Aspecto | REST | GraphQL |
|----------|------|---------|
| **Estrutura** | Múltiplos endpoints | Endpoint único |
| **Dados** | Resposta fixa | Dados sob demanda |
| **Over-fetching** | Sim (retorna tudo) | Não (pega só o needed) |
| **Under-fetching** | Não (múltiplas chamadas) | Não (uma chamada) |
| **Complexidade** | Simples | Maior |

### Decisão Técnica no COMAES

**Por que REST e não GraphQL?**

```javascript
// REST foi escolhido porque:
// 1. Simplicidade - endpoints claros e previsíveis
// 2. Cache HTTP nativo - browsers cacheiam automaticamente
// 3. Curva de aprendizado menor - equipe familiarizada
// 4. Documentação fácil - OpenAPI/Swagger
// 5.足够 para o escopo do projeto
```

**Exemplo REST no COMAES:**
```javascript
// BackEnd/index.js - Rotas de torneios
app.get('/api/torneios/ativo', async (req, res) => {
  // Retorna sempre o mesmo formato
  const torneo = await Torneio.findOne({ where: { status: 'ativo' } });
  res.json(torneio);
});

app.get('/api/torneios/estatisticas', async (req, res) => {
  // Endpoint específico para estatísticas
  const stats = await getEstatisticas();
  res.json(stats);
});
```

## 2.2 Endpoints, Rotas e Organização

### Estrutura de Rotas no COMAES

```
BackEnd/
├── index.js                    # Entry point + rotas principais
├── routes/
│   ├── adminPanelRoutes.js     # /api/admin/*
│   ├── certificatesRoutes.js  # /api/certificates/*
│   ├── adminRoutes.js          # Rotas admin legacy
│   └── certificadosRoutes.js  # Certificados legacy
├── controllers/
│   ├── UserController.js      # Lógica de usuários
│   ├── TorneioController.js   # Lógica de torneios
│   └── GenericController.js   # CRUD genérico
└── services/
    ├── emailService.js        # Envio de emails
    ├── iaEvaluators.js        # Integração com IA
    └── torneoService.js       # Lógica de torneios
```

### Padrão de Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| **Coleção** | `/recurso` | `/api/users` |
| **Item** | `/recurso/:id` | `/api/users/1` |
| **Ação** | `/recurso/acao` | `/api/torneios/ativo` |
| **Relação** | `/recurso/:id/subrecurso` | `/api/torneios/1/participantes` |

## 2.3 Status Codes e Boas Práticas

### Códigos HTTP Usados no COMAES

```javascript
// BackEnd/index.js

// 200 - OK (Sucesso)
res.status(200).json({ success: true, data: ... });

// 201 - Created (Criado com sucesso)
res.status(201).json({ success: true, message: "Usuário criado" });

// 400 - Bad Request (Erro do cliente)
res.status(400).json({ success: false, error: "Dados inválidos" });

// 401 - Unauthorized (Não autenticado)
res.status(401).json({ success: false, error: "Token inválido" });

// 403 - Forbidden (Acesso negado)
res.status(403).json({ success: false, error: "Acesso negado" });

// 404 - Not Found (Não encontrado)
res.status(404).json({ success: false, error: "Usuário não encontrado" });

// 500 - Internal Server Error (Erro do servidor)
res.status(500).json({ success: false, error: "Erro interno" });
```

### Boas Práticas de API

```javascript
// ✅ BOA PRÁTICA: Resposta consistente
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso",
  "timestamp": "2026-04-29T10:30:00Z"
}

// ✅ BOA PRÁTICA: Tratamento de erros
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email inválido",
    "field": "email"
  }
}

// ❌ MAU EXEMPLO: Resposta inconsistente
// Às vezes retorna array, às vezes objeto
res.json(users)  // Depende do contexto!
```

---

# MÓDULO 3 – Backend

## 3.1 Estrutura de um Projeto Node.js/Express

### Arquitetura do Backend COMAES

```
BackEnd/
├── index.js              # Servidor principal (entry point)
├── package.json          # Dependências e scripts
├── config/
│   └── db.js            # Configuração do banco
├── models/              # Modelos Sequelize (dados)
│   ├── User.js
│   ├── Torneio.js
│   └── ...
├── routes/              # Definição de rotas (HTTP)
│   ├── adminPanelRoutes.js
│   └── certificatesRoutes.js
├── controllers/         # Lógica de negócio (ação)
│   ├── UserController.js
│   └── TorneioController.js
├── services/           # Lógica especializada
│   ├── emailService.js
│   └── iaEvaluators.js
├── middlewares/        # Funções intermediárias
│   ├── auth.js
│   └── isAdmin.js
└── migrations/         # Alterações do banco
```

### Entry Point (index.js)

```javascript
// BackEnd/index.js - Trecho simplificado
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sequelize from "./config/db.js";

// Importar modelos
import Usuario from "./models/User.js";
import Torneio from "./models/Torneio.js";

// Configuração do Express
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Rotas
app.get('/', (req, res) => res.json({ message: 'API COMAES' }));
app.post('/auth/login', handleLogin);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
```

## 3.2 Controllers, Services e Middlewares

### Controllers – "O Que Fazer"

```javascript
// BackEnd/controllers/UserController.js
export const getAllUsers = async (req, res) => {
  try {
    const users = await Usuario.findAll({
      attributes: ['id', 'nome', 'email', 'papel', 'createdAt']
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { nome, email, senha, papel } = req.body;
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const user = await Usuario.create({
      nome, email, senha: senhaHash, papel
    });
    
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

### Services – "Como Fazer"

```javascript
// BackEnd/services/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

export const sendResetEmail = async (email, token) => {
  const mailOptions = {
    from: `"COMAES" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperação de Senha - COMAES',
    html: `<p>Clique <a href="${process.env.FRONTEND_URL}/redefinir-senha?token=${token}">aqui</a> para redefinir sua senha.</p>`
  };
  
  return transporter.sendMail(mailOptions);
};
```

### Middlewares – "Verificar Antes"

```javascript
// BackEnd/middlewares/auth.js
import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acesso negado' });
    }
    
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token inválido' });
  }
};

export default auth;
```

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO REQUEST → RESPONSE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CLIENTE                                                        │
│  axios.post('/api/admin/users', data, { headers })             │
│        │                                                        │
│        ▼                                                        │
│  ROUTE (routes/adminPanelRoutes.js)                             │
│  router.post('/users', isAdmin, UserController.createUser)      │
│        │                                                        │
│        ▼                                                        │
│  MIDDLEWARE (middlewares/isAdmin.js)                           │
│  Verifica se req.user.papel === 'admin'                         │
│        │                                                        │
│        ▼                                                        │
│  CONTROLLER (controllers/UserController.js)                    │
│  createUser = async (req, res) => { ... }                       │
│        │                                                        │
│        ▼                                                        │
│  SERVICE (opcional)                                            │
│  userService.criarUsuarioComValidacao(...)                      │
│        │                                                        │
│        ▼                                                        │
│  MODEL (models/User.js)                                         │
│  Usuario.create({ nome, email, ... })                           │
│        │                                                        │
│        ▼                                                        │
│  DATABASE (MySQL)                                               │
│  INSERT INTO usuarios (...) VALUES (...)                        │
│        │                                                        │
│        ▼                                                        │
│  RESPONSE: res.status(201).json({ success: true })             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# MÓDULO 4 – Banco de Dados

## 4.1 SQL vs NoSQL

### Comparação

| Aspecto | SQL (MySQL) | NoSQL (MongoDB) |
|----------|-------------|-----------------|
| **Schema** | Fixo (tabelas) | Flexível (documentos) |
| **Relações** | Foreign Keys | Embedding/Referencing |
| **Transações** | ACID | Eventually Consistent |
| **Complexidade** | Maior (joins) | Menor |
| **Escala** | Vertical | Horizontal |

### Decisão Técnica no COMAES

**Por que MySQL?**

```javascript
// BackEnd/config/db.js
const sequelize = new Sequelize(
  process.env.DB_NAME || "comaes_db",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',  // ← MySQL/MariaDB
    // ...
  }
);
```

**Justificativa:**
1. **Dados estruturados** – Usuários, torneios, perguntas têm schema fixo
2. **Relações complexas** – Participante → Torneio → Pergunta
3. **Transações** –确保 integridade em pagamentos/inscrições
4. **Maturidade** – MySQL é robusto e bem documentado
5. **Equipe** – Conhecimento prévio da tecnologia

## 4.2 Modelagem com Sequelize

### Model (Definição da Tabela)

```javascript
// BackEnd/models/User.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  papel: {
    type: DataTypes.ENUM('aluno', 'professor', 'admin'),
    defaultValue: 'aluno'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

export default Usuario;
```

### Relações (Associações)

```javascript
// BackEnd/models/index.js - Associações
Usuario.hasMany(Torneio, { foreignKey: 'criado_por', as: 'torneiosCriados' });
Torneio.belongsTo(Usuario, { foreignKey: 'criado_por', as: 'criador' });

Torneio.hasMany(ParticipanteTorneio, { foreignKey: 'torneio_id' });
ParticipanteTorneio.belongsTo(Torneio, { foreignKey: 'torneio_id' });

Usuario.hasMany(ParticipanteTorneio, { foreignKey: 'usuario_id' });
ParticipanteTorneio.belongsTo(Usuario, { foreignKey: 'usuario_id' });
```

### Schema do Banco

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESQUEMA DO BANCO COMAES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  usuarios                                                       │
│  ├── id (PK)                                                   │
│  ├── nome                                                      │
│  ├── email (unique)                                            │
│  ├── senha (hash)                                              │
│  ├── papel (enum: aluno/professor/admin)                      │
│  └── created_at                                                │
│                                                                 │
│  torneios                                                       │
│  ├── id (PK)                                                   │
│  ├── nome                                                      │
│  ├── disciplinas (JSON)                                        │
│  ├── status (enum: ativo/encerrado)                           │
│  └── created_at                                                │
│                                                                 │
│  participantes_torneios (tabela pivô)                          │
│  ├── id (PK)                                                   │
│  ├── usuario_id (FK → usuarios.id)                           │
│  ├── torneo_id (FK → torneios.id)                             │
│  ├── disciplina                                               │
│  ├── pontuacao                                                 │
│  └── posicao                                                   │
│                                                                 │
│  questoes_matematica / questoes_programacao / questoes_ingles  │
│  ├── id (PK)                                                   │
│  ├── pergunta                                                  │
│  ├── resposta_correta                                         │
│  ├── nivel (facil/medio/dificil)                              │
│  └── pontos                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# MÓDULO 5 – Integração

## 5.1 Como o Frontend Consome APIs

### Configuração do Cliente HTTP

```javascript
// FrontEnd/src/Administrador/adminService.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_URL = `${API_BASE}/api/admin/`;

// Criar cliente axios com configuração padrão
const createApiClient = (token) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Token JWT
    }
  });
};
```

### Chamadas API do Frontend

```javascript
// Buscar todos os usuários
export const getUsers = async (token) => {
  const client = createApiClient(token);
  const response = await client.get('users');
  return response.data;
};

// Criar usuário
export const createUser = async (token, userData) => {
  const client = createApiClient(token);
  const response = await client.post('users', userData);
  return response.data;
};

// Atualizar usuário
export const updateUser = async (token, userId, userData) => {
  const client = createApiClient(token);
  const response = await client.put(`users/${userId}`, userData);
  return response.data;
};
```

## 5.2 Tratamento de Erros

### Padrão de Erro no Backend

```javascript
// BackEnd/controllers/UserController.js
export const getAllUsers = async (req, res) => {
  try {
    const users = await Usuario.findAll();
    
    res.status(200).json({
      success: true,
      data: users,
      total: users.length
    });
    
  } catch (error) {
    // Erro de banco de dados
    console.error('Erro ao buscar usuários:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar usuários',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};
```

### Tratamento no Frontend

```javascript
// FrontEnd/src/hooks/useAuth.js
const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', {
      usuario: email,
      senha: password
    });
    
    // Sucesso
    setToken(response.data.token);
    setUser(response.data.user);
    return { success: true };
    
  } catch (error) {
    // Erro tratado
    if (error.response?.status === 401) {
      return { 
        success: false, 
        error: 'Email ou senha incorretos' 
      };
    }
    
    // Erro de rede
    if (error.code === 'NETWORK_ERROR') {
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
    
    // Erro genérico
    return { 
      success: false, 
      error: error.response?.data?.error || 'Erro inesperado' 
    };
  }
};
```

## 5.3 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│              FLUXO COMPLETO: LOGIN DO UTILIZADOR                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. FRONTEND: Usuário clica "Entrar"                           │
│     └─▶ Formulário com email + senha                           │
│                                                                 │
│  2. FRONTEND: Axios envia POST                                │
│     POST http://localhost:3000/auth/login                      │
│     Body: { "usuario": "joao@email.com", "senha": "123" }     │
│                                                                 │
│  3. BACKEND: Express recebe request                           │
│     app.post('/auth/login', handleLogin)                       │
│                                                                 │
│  4. BACKEND: Controller processa                               │
│     const usuario = await Usuario.findOne({ where: { email } })│
│     const valid = await bcrypt.compare(senha, usuario.senha)  │
│                                                                 │
│  5. BACKEND: Gera token JWT                                   │
│     const token = jwt.sign({ id: usuario.id }, JWT_SECRET,     │
│       { expiresIn: '24h' })                                    │
│                                                                 │
│  6. BACKEND: Responde                                         │
│     { "token": "eyJhbGci...", "user": { "id": 1, "nome": ... }}│
│                                                                 │
│  7. FRONTEND: Processa resposta                               │
│     localStorage.setItem('token', token)                       │
│     router.push('/dashboard')                                  │
│                                                                 │
│  8. REQUISIÇÕES FUTURAS incluem token                         │
│     Authorization: Bearer eyJhbGci...                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# MÓDULO 6 – Autenticação

## 6.1 Login e Controle de Acesso

### Sistema de Papéis

```javascript
// BackEnd/models/User.js - Definição de papéis
papel: {
  type: DataTypes.ENUM('aluno', 'professor', 'admin'),
  defaultValue: 'aluno'
}

// BackEnd/middlewares/isAdmin.js
import jwt from 'jsonwebtoken';

const isAdmin = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verifica se é admin
    if (decoded.papel !== 'admin') {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores.' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export default isAdmin;
```

### Controle de Rotas

```javascript
// BackEnd/routes/adminPanelRoutes.js
import isAdmin from '../middlewares/isAdmin.js';

// Todas as rotas admin requerem papel 'admin'
router.get('/users', isAdmin, UserController.getAllUsers);
router.post('/users', isAdmin, UserController.createUser);
router.put('/users/:id', isAdmin, UserController.updateUser);
router.delete('/users/:id', isAdmin, UserController.deleteUser);
```

## 6.2 JWT (JSON Web Token)

### Estrutura do Token

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRUTURA JWT                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HEADER (Cabeçalho)                                            │
│  {                                                              │
│    "alg": "HS256",  ← Algoritmo de assinatura                  │
│    "typ": "JWT"                                                 │
│  }                                                              │
│                                                                 │
│  PAYLOAD (Dados)                                               │
│  {                                                              │
│    "id": 1,                    ← ID do usuário                 │
│    "nome": "João Silva",       ← Nome                          │
│    "email": "joao@email.com",  ← Email                         │
│    "papel": "admin",           ← Papel                         │
│    "iat": 1714387200,          ← Issued At (criado)            │
│    "exp": 1714473600           ← Expiration (24h)              │
│  }                                                              │
│                                                                 │
│  SIGNATURE (Assinatura)                                         │
│  HMAC-SHA256(                                                  │
│    base64UrlEncode(header) + "." +                              │
│    base64UrlEncode(payload),                                    │
│    JWT_SECRET                                                  │
│  )                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Geração do Token

```javascript
// BackEnd/index.js - Login
app.post('/auth/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    
    // Buscar usuário
    const user = await Usuario.findOne({ 
      where: { email: usuario } 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar senha
    const validPassword = await bcrypt.compare(senha, user.senha);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        nome: user.nome,
        email: user.email,
        papel: user.papel
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        papel: user.papel
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Validação do Token

```javascript
// BackEnd/middlewares/auth.js
import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Acesso negado' });
    }
    
    // Remover "Bearer " do início
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar e decodificar
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adicionar usuário à requisição
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export default auth;
```

## 6.3 Armazenamento Seguro de Tokens

### Onde Armazenar

| Local | Prós | Contras | Recomendação |
|-------|------|----------|---------------|
| **localStorage** | Fácil acesso | Vulnerável a XSS | ❌ Não usar |
| **sessionStorage** | Mesmo que local | Mesmo problema | ❌ Não usar |
| **Cookie (httpOnly)** | Protegido contra XSS | Vulnerável a CSRF | ✅ Recomendado |
| **Memory (variável)** | Seguro | Perdido ao refresh | ⚠️ Complementar |

### Implementação Recomendada

```javascript
// FrontEnd/src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const login = (userData, authToken) => {
    // Guardar em memória (temporário)
    setUser(userData);
    setToken(authToken);
    
    // Guardar em cookie (persistente)
    document.cookie = `token=${authToken}; path=/; max-age=86400; SameSite=Strict`;
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    // Limpar cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

# MÓDULO 7 – Segurança

## 7.1 Vulnerabilidades Comuns

### XSS (Cross-Site Scripting)

**O que é:** Injeção de código JavaScript malicioso através de entradas do usuário.

```javascript
// ❌ VULNERÁVEL
app.post('/comentario', (req, res) => {
  const comentario = req.body.comentario;
  // Armazena sem sanitizar
  await Comentario.create({ texto: comentario });
});

// Renderiza sem escaping
res.send(`<div>${comentario.texto}</div>`);
```

**Proteção no COMAES:**

```javascript
// BackEnd/index.js - Validação de entrada
app.use(express.json());

// O Express não sanitiza automaticamente,
// mas usamos bibliotecas de validação
// e o React escapa automaticamente ao renderizar
```

### CSRF (Cross-Site Request Forgery)

**O que é:** Ataque que executa ações não autorizadas em nome do usuário autenticado.

```javascript
// ❌ VULNERÁVEL - Sem token CSRF
app.post('/transferir', auth, (req, res) => {
  // Qualquer site pode fazer POST para este endpoint
});

// ✅ PROTEGIDO - Com token
app.post('/transferir', auth, csrfProtection, (req, res) => {
  // Verifica token CSRF
});
```

**Proteção no COMAES (parcial):**

```javascript
// Usar SameSite cookie
document.cookie = 'token=xxx; SameSite=Strict; Secure';
```

### CORS (Cross-Origin Resource Sharing)

**O que é:** Controla quais domínios podem acessar a API.

```javascript
// BackEnd/index.js
app.use(cors({
  origin: true,  // Permite todos (desenvolvimento)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ⚠️ Em produção, especificar origem:
// origin: ['https://comaes.com']
```

## 7.2 Validação de Dados

### Biblioteca de Validação

```javascript
// BackEnd/controllers/UserController.js
export const createUser = async (req, res) => {
  try {
    const { nome, email, senha, papel } = req.body;
    
    // 1. Validar campos obrigatórios
    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome, email, senha'
      });
    }
    
    // 2. Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }
    
    // 3. Validar tamanho de senha
    if (senha.length < 6) {
      return res.status(400).json({
        error: 'Senha deve ter pelo menos 6 caracteres'
      });
    }
    
    // 4. Verificar se email já existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email já cadastrado'
      });
    }
    
    // 5. Criar usuário
    const senhaHash = await bcrypt.hash(senha, 10);
    const user = await Usuario.create({
      nome, email, senha: senhaHash, papel: papel || 'aluno'
    });
    
    res.status(201).json({ success: true, user });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## 7.3 Proteção de Rotas

```javascript
// BackEnd/middlewares/auth.js
import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de autenticação não fornecido' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar expiração
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ 
        success: false,
        error: 'Token expirado' 
      });
    }
    
    req.user = decoded;
    next();
    
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: 'Token inválido ou expirado' 
    });
  }
};

export default auth;
```

---

# MÓDULO 8 – Performance

## 8.1 Cache

### Níveis de Cache

```
┌─────────────────────────────────────────────────────────────────┐
│                    NÍVEIS DE CACHE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. BROWSER CACHE (Client-side)                                │
│     └─▶ Imagens, CSS, JS estáticos                             │
│     └─▶ Configurado via headers HTTP                           │
│                                                                 │
│  2. CDN (Content Delivery Network)                            │
│     └─▶ Arquivos estáticos próximos ao usuário                 │
│     └─▶ Não implementado ainda                                 │
│                                                                 │
│  3. APPLICATION CACHE (Server-side)                           │
│     └─▶ Resultados de queries frequentes                       │
│     └─▶ Redis (não implementado)                              │
│                                                                 │
│  4. DATABASE CACHE                                             │
│     └─▶ Query results                                          │
│     └─▶ Sequelize caching                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cache HTTP no Express

```javascript
// BackEnd/index.js
app.get('/api/torneios/estatisticas', async (req, res) => {
  // Cache-control header
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutos
  
  const stats = await getEstatisticas();
  res.json(stats);
});
```

## 8.2 Otimização de Requisições

### Problema: N+1 Queries

```javascript
// ❌ PROBLEMA: N+1 queries
const usuarios = await Usuario.findAll();
for (const usuario of usuarios) {
  const torneios = await Torneio.findAll({ 
    where: { criado_por: usuario.id } 
  });
  // Para 100 usuários = 101 queries!
}

// ✅ SOLUÇÃO: Eager loading
const usuarios = await Usuario.findAll({
  include: [{
    model: Torneio,
    as: 'torneiosCriados'
  }]
});
// Apenas 2 queries!
```

### Paginação

```javascript
// BackEnd/controllers/GenericController.js
export const getAll = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  const { count, rows } = await req.Model.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  });
  
  res.json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    }
  });
};
```

## 8.3 Boas Práticas

| Prática | Implementação |
|---------|---------------|
| **Conexões pooling** | Sequelize pool config |
| **Queries otimizadas** | Selecionar apenas campos necessários |
| **Índices no banco** | foreign keys, colunas usadas em filtros |
| **Compressão** | gzip no Express |
| **Lazy loading** | Carregar dados sob demanda |

```javascript
// BackEnd/config/db.js
const sequelize = new Sequelize(/* ... */, {
  pool: {
    max: 5,    // Máximo de conexões
    min: 0,    // Mínimo de conexões
    acquire: 30000,  // Timeout de aquisição
    idle: 10000      // Tempo antes de fechar conexão idle
  }
});
```

---

# MÓDULO 9 – Arquitetura

## 9.1 Separação de Responsabilidades

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                 ARQUITETURA EM CAMADAS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CAMADA DE APRESENTA                   │   │
│  │  (React Components, Pages)                              │   │
│  │  - Renderiza UI                                          │   │
│  │  - Captura interação do usuário                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CAMADA DE SERVIÇOS                    │   │
│  │  (API Clients, Context, Hooks)                          │   │
│  │  - Consome APIs                                         │   │
│  │  - Gerencia estado                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CAMADA DE API (Backend)               │   │
│  │  Routes → Controllers → Services → Models              │   │
│  │  - Valida dados                                         │   │
│  │  - Lógica de negócio                                    │   │
│  │  - Integrações externas                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CAMADA DE DADOS                       │   │
│  │  (Sequelize, MySQL)                                     │   │
│  │  - Persistência                                         │   │
│  │  - Queries                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 9.2 MVC e APIs Desacopladas

### Modelo MVC no Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                        MVC NO BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MODEL (Dados)                                                 │
│  models/User.js ──── models/Torneio.js ──── models/...         │
│  └─▶ Define estrutura, relações, validações                    │
│                                                                 │
│  VIEW (API Response)                                           │
│  res.json({ success: true, data: ... })                        │
│  └─▶ Formata resposta HTTP                                     │
│                                                                 │
│  CONTROLLER (Lógica)                                            │
│  controllers/UserController.js                                 │
│  └─▶ Processa requisição, coordena Model e View                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### API Desacoplada

```javascript
// O backend não sabe quem é o cliente!
// Pode ser web, mobile, ou outro serviço

// BackEnd: Apenas expõe API REST
app.post('/api/participantes/registrar', async (req, res) => {
  const { usuarioId, torneoId, disciplina } = req.body;
  // Processa e retorna JSON
  res.json({ success: true, participante });
});

// FrontEnd: Consome API
await axios.post('http://localhost:3000/api/participantes/registrar', {
  usuarioId: 1, torneoId: 2, disciplina: 'matematica'
});

// Mobile (futuro): Mesma API
// await api.post('/participantes/registrar', { ... })
```

## 9.3 Organização Escalável

### Estrutura Atual vs Escalável

**Estrutura Atual (COMAES):**
```
BackEnd/
├── index.js          # 900+ linhas (monolítico)
├── routes/
├── controllers/
├── models/
└── services/
```

**Estrutura Escalável:**
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   └── auth.validator.js
│   ├── users/
│   │   ├── users.routes.js
│   │   ├── users.controller.js
│   │   └── users.service.js
│   └── tournaments/
│       ├── tournaments.routes.js
│       ├── tournaments.controller.js
│       └── tournaments.service.js
├── shared/
│   ├── middlewares/
│   ├── utils/
│   └── constants/
└── config/
```

### Benefícios da Estrutura Escalável

| Benefício | Descrição |
|-----------|------------|
| **Modularidade** | Cada módulo é independente |
| **Testabilidade** | Easy de testar isoladamente |
| **Manutenibilidade** | Alterações localizadas |
| **Escalabilidade** | Novos módulos seguem padrão |
| **Colaboração** | Equipe pode trabalhar em paralelo |

---

# 📝 RESUMO EXECUTIVO

## Conceitos Fundamentais Aprendidos

| Módulo | Conceito Chave |
|--------|-----------------|
| 1 | Cliente-Servidor, HTTP, API |
| 2 | REST, Endpoints, Status Codes |
| 3 | Node.js, Express, Controllers, Services |
| 4 | MySQL, Sequelize, Modelagem |
| 5 | Axios, Tratamento de Erros, Fluxo |
| 6 | JWT, Papéis, Autenticação |
| 7 | XSS, CSRF, CORS, Validação |
| 8 | Cache, Otimização, Paginação |
| 9 | MVC, Camadas, Arquitetura |

## Decisões Técnicas Justificadas

| Decisão | Por quê? |
|---------|----------|
| **REST vs GraphQL** | Simplicidade, cache HTTP nativo, equipe familiarizada |
| **MySQL vs NoSQL** | Dados estruturados, relações complexas, transações ACID |
| **JWT vs Sessions** | Stateless, escalável, padrão mercado |
| **React + Vite** | Performance, hot reload, comunidade ativa |
| **Sequelize ORM** | Abstração de SQL, migrations, portabilidade |

---

*Documento gerado para fins educacionais baseados no projeto COMAES 3.0*