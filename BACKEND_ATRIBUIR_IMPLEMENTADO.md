# ✅ BACKEND IMPLEMENTADO: Atribuir Blocos/Questões

## 📋 RESUMO

Backend completo implementado para permitir que administradores atribuam blocos e questões aprovados para **Torneios** ou **Testes de Conhecimento**.

## ✨ O QUE FOI IMPLEMENTADO

### 1. **Modelo de Dados**

#### Campo `contexto` adicionado:

**BlocoQuestoes.js:**
```javascript
contexto: {
  type: DataTypes.ENUM('torneio', 'teste'),
  allowNull: true,
  defaultValue: 'torneio',
  comment: 'Contexto do bloco: torneio ou teste'
}
```

**Questao.js:**
```javascript
contexto: {
  type: DataTypes.ENUM('torneio', 'teste', 'colaborador'),
  allowNull: true,
  defaultValue: 'colaborador',
  comment: 'Contexto: torneio, teste, ou colaborador (não atribuída)'
}
```

### 2. **Migration Criada**

**Arquivo:** `BackEnd/migrations/20260622000000-add-contexto-to-questoes.cjs`

Adiciona campo `contexto` na tabela `questoes`.

### 3. **Controller - Novas Funções**

**Arquivo:** `BackEnd/controllers/ColaboradorBlocosQuestoesControllerV2.js`

#### `atribuirBlocoAdmin(req, res)`
- **Rota:** `PATCH /api/admin/blocos/:id/atribuir`
- **Body:** `{ destino: 'torneio' | 'teste' }`
- **Validações:**
  - Destino válido ('torneio' ou 'teste')
  - Bloco existe
  - Bloco está aprovado
- **Ação:**
  - Atualiza `contexto` do bloco
  - Atualiza `contexto` de TODAS as questões do bloco
- **Response:** `200 OK` com bloco atualizado

#### `atribuirQuestaoAdmin(req, res)`
- **Rota:** `PATCH /api/admin/questoes/:id/atribuir`
- **Body:** `{ destino: 'torneio' | 'teste' }`
- **Validações:**
  - Destino válido ('torneio' ou 'teste')
  - Questão existe
  - Questão está aprovada
- **Ação:**
  - Atualiza `contexto` da questão
- **Response:** `200 OK` com questão atualizada

### 4. **Rotas Adicionadas**

**Arquivo:** `BackEnd/routes/colaboradorBlocosQuestoesRoutes.js`

```javascript
// Atribuir bloco
router.patch(
  '/blocos/:id/atribuir',
  auth,
  isAdmin,
  atribuirBlocoAdmin
);

// Atribuir questão
router.patch(
  '/questoes/:id/atribuir',
  auth,
  isAdmin,
  atribuirQuestaoAdmin
);
```

### 5. **Imports Atualizados**

```javascript
import {
  // ...
  atribuirBlocoAdmin,
  atribuirQuestaoAdmin,
  // ...
} from '../controllers/ColaboradorBlocosQuestoesControllerV2.js';
```

## 🔧 COMO USAR

### 1. **Executar Migration**

```bash
cd BackEnd
npx sequelize-cli db:migrate
```

Isso adiciona o campo `contexto` na tabela `questoes`.

### 2. **Reiniciar Servidor Backend**

```bash
cd BackEnd
npm run dev
```

ou

```bash
node server.js
```

### 3. **Testar API**

#### Atribuir Bloco para Torneios:
```bash
PATCH http://localhost:3002/api/admin/blocos/1/atribuir
Headers: Authorization: Bearer <token>
Body: { "destino": "torneio" }
```

#### Atribuir Bloco para Testes:
```bash
PATCH http://localhost:3002/api/admin/blocos/1/atribuir
Headers: Authorization: Bearer <token>
Body: { "destino": "teste" }
```

#### Atribuir Questão para Torneios:
```bash
PATCH http://localhost:3002/api/admin/questoes/5/atribuir
Headers: Authorization: Bearer <token>
Body: { "destino": "torneio" }
```

## 📊 FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────────┐
│ 1. Colaborador cria bloco/questão                       │
│    ↓ status: 'pendente', contexto: 'colaborador'        │
├─────────────────────────────────────────────────────────┤
│ 2. Admin aprova                                          │
│    ↓ status: 'aprovado', contexto: 'colaborador'        │
├─────────────────────────────────────────────────────────┤
│ 3. Admin atribui (frontend clica "Atribuir")            │
│    ↓ Modal pergunta: Torneios ou Testes?                │
├─────────────────────────────────────────────────────────┤
│ 4. Frontend chama API:                                   │
│    PATCH /api/admin/blocos/:id/atribuir                 │
│    Body: { destino: "torneio" }                          │
├─────────────────────────────────────────────────────────┤
│ 5. Backend valida e atualiza:                            │
│    - bloco.contexto = 'torneio'                          │
│    - todas questoes.contexto = 'torneio'                 │
├─────────────────────────────────────────────────────────┤
│ 6. Frontend remove item da aba Colaboradores             │
│    ↓ Item agora aparece na aba Torneios                 │
└─────────────────────────────────────────────────────────┘
```

## 🎯 PRÓXIMO PASSO: Filtrar por Contexto

As abas **"Questões dos Torneios"** e **"Questões dos Testes"** precisam ser atualizadas para **filtrar por contexto**:

### QuestoesTorneiosTab.jsx:
```javascript
// Ao carregar blocos/questões:
const response = await api.get('/api/blocos', {
  params: { contexto: 'torneio', status: 'aprovado' }
});
```

### QuestoesTestesTab.jsx:
```javascript
// Ao carregar blocos/questões:
const response = await api.get('/api/blocos', {
  params: { contexto: 'teste', status: 'aprovado' }
});
```

### QuestoesColaboradoresTab.jsx:
```javascript
// Ao carregar blocos/questões APROVADOS:
const response = await api.get('/api/blocos', {
  params: { 
    contexto: 'colaborador', // ou NULL
    status: 'aprovado' 
  }
});
```

## ✅ CHECKLIST

- ✅ Modelo BlocoQuestoes atualizado com campo `contexto`
- ✅ Modelo Questao atualizado com campo `contexto`
- ✅ Migration criada (`20260622000000-add-contexto-to-questoes.cjs`)
- ✅ Função `atribuirBlocoAdmin` implementada
- ✅ Função `atribuirQuestaoAdmin` implementada
- ✅ Rota `PATCH /api/admin/blocos/:id/atribuir` adicionada
- ✅ Rota `PATCH /api/admin/questoes/:id/atribuir` adicionada
- ✅ Imports atualizados no arquivo de rotas
- 🔲 Migration executada (`npx sequelize-cli db:migrate`)
- 🔲 Servidor backend reiniciado
- 🔲 Testar atribuição de bloco
- 🔲 Testar atribuição de questão
- 🔲 Atualizar abas de Torneios/Testes para filtrar por contexto

## 📂 ARQUIVOS MODIFICADOS

### Backend:
1. ✅ `BackEnd/models/BlocoQuestoes.js` (campo já existia)
2. ✅ `BackEnd/models/Questao.js` (campo adicionado)
3. ✅ `BackEnd/migrations/20260622000000-add-contexto-to-questoes.cjs` (criado)
4. ✅ `BackEnd/controllers/ColaboradorBlocosQuestoesControllerV2.js` (2 funções adicionadas)
5. ✅ `BackEnd/routes/colaboradorBlocosQuestoesRoutes.js` (2 rotas + imports)

### Frontend:
- ✅ `FrontEnd/src/Administrador/QuestoesColaboradoresTab.jsx` (modal e botões)

---

**Data:** 22/06/2026  
**Status:** ✅ Backend Completo | 🔲 Migration Pendente | 🔲 Testes Pendentes  
**Prioridade:** Alta (funcionalidade crítica)
