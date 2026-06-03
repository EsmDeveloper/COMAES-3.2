# TASK 7 COMPLETO: Isolamento de Permissões (RBAC) para Colaborador

## STATUS: ✅ COMPLETO

## Análise do Estado Antes das Correções

### Já estava correto ✅
- `ProtectedAdminRoute.jsx` — bloqueia não-admins em `/administrador`
- `ProtectedColaboradorRoute.jsx` — exige `role=colaborador` + `status_colaborador=aprovado`
- `ProtectedEstudanteRoute.jsx` — redireciona colaboradores para `/colaborador/questoes`
- Rotas `/entrar-no-torneio`, `/painel`, `/teste-seu-conhecimento`, `/ranking`, `/ranking/:id` já usavam `ProtectedEstudanteRoute`
- Menu do Layout já tinha versão restrita para colaboradores (`collaboratorMenuItems` / `collaboratorDesktopNav`)
- Endpoints admin (`/api/admin/*`) já protegidos com `isAdmin` middleware
- Endpoint `PATCH /api/questoes/:id/aprovacao` já protegido com `isAdmin` (colaborador não aprova as próprias questões)

### Problemas identificados e corrigidos ❌→✅

---

## Correções Implementadas

### 1. Novo Middleware `isNotColaborador` ✅
**Ficheiro criado**: `BackEnd/middlewares/isNotColaborador.js`

```javascript
// Bloqueia colaboradores aprovados de participar em competições
const isNotColaborador = async (req, res, next) => {
  // Sem token → passa (rotas públicas tratam separadamente)
  if (!token) return next();
  
  if (user.role === 'colaborador' && user.status_colaborador === 'aprovado') {
    return res.status(403).json({
      success: false,
      error: 'Colaboradores não podem participar de competições (torneios, quizzes, ranking).',
      code: 'COLABORADOR_NOT_ALLOWED'
    });
  }
  next();
};
```

---

### 2. Backend — Rotas protegidas com `isNotColaborador` ✅

| Rota | Antes | Depois |
|------|-------|--------|
| `POST /torneios/:id/join` | Sem proteção | `isNotColaborador` adicionado |
| `POST /api/tentativas` | Só `auth` | `auth + isNotColaborador` |
| `POST /api/resultados` | Só `auth` | `auth + isNotColaborador` |
| `POST /api/teste-conhecimento/questoes/:id/validar` | Só `auth` | `auth + isNotColaborador` |

**Ficheiros modificados**:
- `BackEnd/index.js` — import + `POST /torneios/:id/join`
- `BackEnd/routes/tentativasRoutes.js`
- `BackEnd/routes/resultadosTesteRoutes.js`
- `BackEnd/routes/testeConhecimentoRoutes.js`

---

### 3. Frontend — Rotas `/matematica-original`, `/programacao-original`, `/ingles-original` ✅
**Ficheiro**: `FrontEnd/src/App.jsx`

**Antes** (rotas abertas):
```jsx
<Route path="/matematica-original/:username" element={<PageTransition><MatematicaOriginal /></PageTransition>} />
```

**Depois** (protegidas):
```jsx
<Route path="/matematica-original/:username" element={<ProtectedEstudanteRoute><PageTransition><MatematicaOriginal /></PageTransition></ProtectedEstudanteRoute>} />
```

Igual para `/programacao-original` e `/ingles-original`.

---

### 4. Frontend — Home.jsx — CTAs diferenciados por role ✅
**Ficheiro**: `FrontEnd/src/Paginas/Secundarias/Home.jsx`

**Antes**: Botões "Entrar no Torneio" e "Teste Básico" visíveis para todos.

**Depois**: Condicional baseada em `user?.role`:
```jsx
{user?.role === 'colaborador' ? (
  // Botões: "Minhas Questões" → /colaborador/questoes
  //         "Meu Painel"      → /colaborador/dashboard
) : (
  // Botões originais: "Entrar no Torneio" + "Teste Básico"
)}
```

---

## Resumo de Permissões por Role

| Funcionalidade | Estudante | Colaborador | Admin |
|---|---|---|---|
| Acesso a `/administrador` | ❌ 403 | ❌ 403 | ✅ |
| Criar/editar torneios | ❌ | ❌ | ✅ |
| Gerir utilizadores | ❌ | ❌ | ✅ |
| Participar em torneio (join) | ✅ | ❌ 403 | ✅ |
| Submeter tentativas | ✅ | ❌ 403 | ✅ |
| Fazer quiz (validar resposta) | ✅ | ❌ 403 | ✅ |
| Salvar resultado de teste | ✅ | ❌ 403 | ✅ |
| Ver ranking | ✅ | ❌ (rota) | ✅ |
| Criar questões | ❌ | ✅ (pendente) | ✅ |
| Aprovar questões | ❌ | ❌ | ✅ |
| Gerir próprias questões | ❌ | ✅ | ✅ |
| Acesso a `/colaborador/*` | ❌ | ✅ | ✅ |
| Menu de navegação | Padrão | Restrito | Padrão |
| CTAs na Home | Torneio/Quiz | Questões/Painel | Torneio/Quiz |

---

## Testes de Validação

### Via URL direta (frontend)
| URL | Colaborador | Resultado |
|-----|-------------|-----------|
| `/administrador` | Acesso | Redireciona → `/404` |
| `/entrar-no-torneio` | Acesso | Redireciona → `/colaborador/questoes` |
| `/painel` | Acesso | Redireciona → `/colaborador/questoes` |
| `/ranking` | Acesso | Redireciona → `/colaborador/questoes` |
| `/teste-seu-conhecimento` | Acesso | Redireciona → `/colaborador/questoes` |
| `/matematica-original/...` | Acesso | Redireciona → `/colaborador/questoes` |
| `/colaborador/questoes` | Acesso | ✅ Permitido |
| `/colaborador/dashboard` | Acesso | ✅ Permitido |

### Via API (token de colaborador)
| Endpoint | Método | Resultado |
|----------|--------|-----------|
| `POST /torneios/:id/join` | colaborador token | 403 |
| `POST /api/tentativas` | colaborador token | 403 |
| `POST /api/resultados` | colaborador token | 403 |
| `POST /api/teste-conhecimento/questoes/:id/validar` | colaborador token | 403 |
| `PATCH /api/questoes/:id/aprovacao` | colaborador token | 403 (isAdmin) |
| `GET /api/admin/users` | colaborador token | 403 (isAdmin) |
| `POST /api/questoes` | colaborador token | ✅ 201 (cria pendente) |
| `GET /api/questoes` | colaborador token | ✅ 200 (só as suas) |

## Conclusão

**TODOS OS REQUISITOS DA TASK 7 FORAM ATENDIDOS:**

✅ Colaborador não consegue aprovar as próprias questões (isAdmin exigido)  
✅ Colaborador não consegue gerir utilizadores (isAdmin exigido)  
✅ Colaborador não consegue criar torneios (isAdmin em `/api/admin/torneos`)  
✅ Colaborador não pode participar de torneios (isNotColaborador em join/tentativas)  
✅ Colaborador não pode fazer quiz (isNotColaborador em validar resposta/resultados)  
✅ Rotas frontend bloqueadas via ProtectedEstudanteRoute  
✅ Rotas de jogo originais (matematica/programacao/ingles) agora protegidas  
✅ Menu de navegação mostra apenas opções relevantes para colaborador  
✅ CTAs da Home adaptados por role  
✅ Mensagens de erro 403 claras com código `COLABORADOR_NOT_ALLOWED`