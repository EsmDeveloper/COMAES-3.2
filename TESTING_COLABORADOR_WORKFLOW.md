# Testing Colaborador Workflow - FASE 1

**Quick Reference for Testing All 12 Endpoints**

---

## Prerequisites

1. Backend running: `npm start` or `npm run dev`
2. Ensure database is synced: `node setup-colaborador-workflow.js`
3. Have test credentials for:
   - Colaborador user (role='colaborador', disciplina_colaborador='matematica')
   - Admin user (role='admin')

---

## Test Scenarios

### 1. Colaborador Creates a Block (Blocos)

**Endpoint**: `POST /api/colaborador/blocos`

**Headers**:
```
Authorization: Bearer [COLABORADOR_TOKEN]
Content-Type: application/json
```

**Request Body**:
```json
{
  "titulo": "Equações de Primeiro Grau",
  "descricao": "Um bloco abrangente sobre resolução de equações simples",
  "dificuldade": "facil"
}
```

**Expected Response** (201):
```json
{
  "sucesso": true,
  "mensagem": "Bloco criado com sucesso e aguardando aprovação do administrador",
  "dados": {
    "id": 1,
    "titulo": "Equações de Primeiro Grau",
    "disciplina": "matematica",
    "status": "pendente",
    "criado_por": 123,
    "created_at": "2026-06-05T10:30:00Z"
  }
}
```

**Key Check**: `status` must be `'pendente'` ⏳

---

### 2. Colaborador Lists Their Blocks

**Endpoint**: `GET /api/colaborador/blocos`

**Headers**:
```
Authorization: Bearer [COLABORADOR_TOKEN]
```

**Query Params** (optional):
```
?pagina=1&limite=20&status=pendente&ordenar=data&busca=Equações
```

**Expected Response** (200):
```json
{
  "sucesso": true,
  "mensagem": "Blocos listados com sucesso",
  "dados": {
    "blocos": [
      {
        "id": 1,
        "titulo": "Equações de Primeiro Grau",
        "status": "pendente",
        "disciplina": "matematica",
        "criado_por": 123,
        "criador": {
          "id": 123,
          "name": "João Silva",
          "email": "joao@example.com"
        }
      }
    ],
    "paginacao": {
      "pagina": 1,
      "limite": 20,
      "total": 1,
      "totalPaginas": 1
    },
    "estatisticas": {
      "total": 1,
      "pendentes": 1,
      "aprovados": 0,
      "rejeitados": 0
    }
  }
}
```

**Key Check**: Statistics show correct counts ✅

---

### 3. Colaborador Updates a Pending Block

**Endpoint**: `PUT /api/colaborador/blocos/1`

**Headers**:
```
Authorization: Bearer [COLABORADOR_TOKEN]
Content-Type: application/json
```

**Request Body**:
```json
{
  "titulo": "Equações Lineares - Nível Básico",
  "descricao": "Bloco completo para iniciantes"
}
```

**Expected Response** (200):
```json
{
  "sucesso": true,
  "mensagem": "Bloco atualizado com sucesso",
  "dados": {
    "id": 1,
    "titulo": "Equações Lineares - Nível Básico",
    "status": "pendente"
  }
}
```

**Key Check**: Can only update if status is `'pendente'` ✅

---

### 4. Colaborador Tries to Update an Approved Block (Should Fail)

**Setup**: Assume block ID 1 is now 'aprovado' (admin approved it)

**Endpoint**: `PUT /api/colaborador/blocos/1`

**Expected Response** (403):
```json
{
  "sucesso": false,
  "mensagem": "Bloco com status 'aprovado' não pode ser editado. Apenas blocos pendentes podem ser editados."
}
```

**Key Check**: Permission denied correctly ✅

---

### 5. Colaborador Creates a Question (Questões)

**Endpoint**: `POST /api/colaborador/questoes`

**Headers**:
```
Authorization: Bearer [COLABORADOR_TOKEN]
Content-Type: application/json
```

**Request Body** (Múltipla Escolha):
```json
{
  "titulo": "Qual é a solução de 2x + 3 = 7?",
  "descricao": "Uma simples equação linear",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "pontos": 10,
  "opcoes": [
    { "texto": "x = 2", "correta": true },
    { "texto": "x = 3", "correta": false },
    { "texto": "x = 1", "correta": false },
    { "texto": "x = 5", "correta": false }
  ],
  "bloco_id": 1
}
```

**Expected Response** (201):
```json
{
  "sucesso": true,
  "mensagem": "Questão criada com sucesso e aguardando aprovação do administrador",
  "dados": {
    "id": 1,
    "titulo": "Qual é a solução de 2x + 3 = 7?",
    "tipo": "multipla_escolha",
    "status_aprovacao": "pendente",
    "autor_id": 123,
    "disciplina": "matematica"
  }
}
```

**Key Check**: `status_aprovacao` is `'pendente'` ⏳

---

### 6. Colaborador Lists Their Questions

**Endpoint**: `GET /api/colaborador/questoes`

**Query Params**:
```
?pagina=1&limite=20&status=pendente&dificuldade=facil&tipo=multipla_escolha
```

**Expected Response** (200):
```json
{
  "sucesso": true,
  "mensagem": "Questões listadas com sucesso",
  "dados": {
    "questoes": [ /* array of questions */ ],
    "paginacao": { /* pagination info */ },
    "estatisticas": {
      "total": 1,
      "pendentes": 1,
      "aprovadas": 0,
      "rejeitadas": 0
    }
  }
}
```

---

### 7. Admin Lists All Pending Blocks

**Endpoint**: `GET /api/admin/blocos-colaboradores-pendentes`

**Headers**:
```
Authorization: Bearer [ADMIN_TOKEN]
```

**Query Params**:
```
?pagina=1&limite=20&status=pendente&disciplina=matematica
```

**Expected Response** (200):
```json
{
  "sucesso": true,
  "mensagem": "Blocos pendentes listados com sucesso",
  "dados": {
    "blocos": [
      {
        "id": 1,
        "titulo": "Equações Lineares - Nível Básico",
        "status": "pendente",
        "disciplina": "matematica",
        "criador": {
          "id": 123,
          "name": "João Silva",
          "email": "joao@example.com",
          "disciplina_colaborador": "matematica"
        }
      }
    ],
    "estatisticas": {
      "pendentes": 1,
      "aprovados": 0,
      "rejeitados": 0
    }
  }
}
```

**Key Check**: Admin sees all pending blocks from any colaborador ✅

---

### 8. Admin Approves a Block

**Endpoint**: `POST /api/admin/blocos/1/aprovar`

**Headers**:
```
Authorization: Bearer [ADMIN_TOKEN]
Content-Type: application/json
```

**Request Body**:
```json
{
  "observacoes": "Conteúdo bem estruturado e bem escrito. Pronto para uso!"
}
```

**Expected Response** (200):
```json
{
  "sucesso": true,
  "mensagem": "Bloco aprovado com sucesso!",
  "dados": {
    "id": 1,
    "status": "aprovado",
    "aprovado_por_id": 456,
    "data_aprovacao": "2026-06-05T10:35:00Z",
    "observacoes_admin": "Conteúdo bem estruturado e bem escrito. Pronto para uso!"
  }
}
```

**Key Check**: 
- Status changed to `'aprovado'` ✅
- Admin ID recorded ✅
- Approval timestamp recorded ✅

---

### 9. Admin Rejects a Block with Reason

**Setup**: Create a new block to reject (so we can test rejection)

**Endpoint**: `POST /api/admin/blocos/2/rejeitar`

**Headers**:
```
Authorization: Bearer [ADMIN_TOKEN]
Content-Type: application/json
```

**Request Body**:
```json
{
  "motivo_rejeicao": "Alguns conceitos não estão suficientemente explicados. Por favor, adicione mais detalhes na seção de aplicações práticas.",
  "observacoes": "Veja o feedback do revisor na plataforma"
}
```

**Expected Response** (200):
```json
{
  "sucesso": true,
  "mensagem": "Bloco rejeitado. Colaborador foi notificado.",
  "dados": {
    "id": 2,
    "status": "rejeitado",
    "motivo_rejeicao": "Alguns conceitos não estão suficientemente explicados...",
    "observacoes_admin": "Veja o feedback do revisor na plataforma"
  }
}
```

**Key Check**:
- Status changed to `'rejeitado'` ✅
- Reason mandatory (tested below) ✅
- Notes optional ✅

---

### 10. Admin Tries to Reject Without Reason (Should Fail)

**Endpoint**: `POST /api/admin/blocos/3/rejeitar`

**Request Body** (MISSING motivo_rejeicao):
```json
{
  "observacoes": "Some notes"
}
```

**Expected Response** (400):
```json
{
  "sucesso": false,
  "mensagem": "Motivo da rejeição é obrigatório"
}
```

**Key Check**: Validation works correctly ✅

---

### 11. Admin Lists Pending Questions

**Endpoint**: `GET /api/admin/questoes-colaborador-pendentes`

**Query Params**:
```
?pagina=1&status=pendente&disciplina=matematica&dificuldade=facil
```

**Expected Response** (200):
```json
{
  "sucesso": true,
  "mensagem": "Questões pendentes listadas com sucesso",
  "dados": {
    "questoes": [
      {
        "id": 1,
        "titulo": "Qual é a solução de 2x + 3 = 7?",
        "tipo": "multipla_escolha",
        "status_aprovacao": "pendente",
        "dificuldade": "facil",
        "autor": {
          "id": 123,
          "name": "João Silva",
          "disciplina_colaborador": "matematica"
        }
      }
    ],
    "estatisticas": {
      "pendentes": 1,
      "aprovadas": 0,
      "rejeitadas": 0,
      "por_disciplina": {
        "matematica": 1,
        "ingles": 0,
        "programacao": 0
      }
    }
  }
}
```

---

### 12. Admin Approves a Question

**Endpoint**: `POST /api/admin/questoes/1/aprovar`

**Request Body**:
```json
{
  "observacoes": "Questão bem formulada"
}
```

**Expected Response** (200):
```json
{
  "sucesso": true,
  "mensagem": "Questão aprovada com sucesso!",
  "dados": {
    "id": 1,
    "status_aprovacao": "aprovada",
    "revisado_por": 456
  }
}
```

---

## Critical Test: Discipline Validation 🔴

### Scenario: Colaborador from "inglês" tries to create matemática content

**Colaborador User**: 
- id: 200
- disciplina_colaborador: "ingles"

**Endpoint**: `POST /api/colaborador/blocos`

**Request Body**:
```json
{
  "titulo": "Teorema de Pitágoras",
  "descricao": "Matemática",
  "dificuldade": "medio"
}
```

**Expected Response** (403):
```json
{
  "sucesso": false,
  "mensagem": "Você só pode criar conteúdo para a disciplina: ingles"
}
```

**Key Check**: Discipline enforcement works! 🔴 ✅

---

## Test Data Setup (SQL)

If you want to create test users:

```sql
-- Test Colaborador (Matemática)
INSERT INTO usuarios (nome, email, password, role, status_colaborador, disciplina_colaborador, funcao_id, isAdmin)
VALUES ('João Silva', 'joao@example.com', '[HASHED_PASSWORD]', 'colaborador', 'aprovado', 'matematica', 1, 0);

-- Test Colaborador (Inglês)
INSERT INTO usuarios (nome, email, password, role, status_colaborador, disciplina_colaborador, funcao_id, isAdmin)
VALUES ('Maria Santos', 'maria@example.com', '[HASHED_PASSWORD]', 'colaborador', 'aprovado', 'ingles', 1, 0);

-- Test Admin
INSERT INTO usuarios (nome, email, password, role, status_colaborador, funcao_id, isAdmin)
VALUES ('Admin User', 'admin@example.com', '[HASHED_PASSWORD]', 'admin', NULL, 1, 1);
```

---

## Expected Behavior Summary

| Action | Status Before | Status After | Allowed? |
|--------|---|---|---|
| Create block | - | **pendente** | ✅ |
| Edit pending block | pendente | pendente | ✅ |
| Edit approved block | aprovado | - | ❌ |
| Edit rejected block | rejeitado | - | ❌ |
| Delete pending block | pendente | (deleted) | ✅ |
| Delete approved block | aprovado | - | ❌ |
| Delete rejected block | rejeitado | (deleted) | ✅ |
| Approve block | pendente | **aprovado** | ✅ (admin) |
| Reject block | pendente | **rejeitado** | ✅ (admin) |
| Re-approve block | aprovado | - | ❌ |
| Re-reject block | rejeitado | - | ❌ |

---

## Debugging Tips

### Issue: "Unauthorized" on every request
- Check token in Authorization header
- Verify token is valid and not expired
- Check `req.user` is being set by auth middleware

### Issue: "Você só pode criar conteúdo para a disciplina: X"
- User's `disciplina_colaborador` doesn't match request
- Check User.disciplina_colaborador field
- Verify user has a discipline assigned

### Issue: "Bloco com status 'pendente' não pode ser encontrado"
- Block not found for that user
- Check criado_por matches req.user.id
- Verify discipline matches req.user.disciplina_colaborador

### Issue: Database schema errors
- Run setup: `node setup-colaborador-workflow.js`
- Check status enum in blocos_questoes table
- Verify associations are loaded

---

## Load Testing (After Basic Tests Pass)

Once basic tests pass, test performance with:

```bash
# Test list with pagination
GET /api/admin/blocos-colaboradores-pendentes?pagina=1&limite=1000

# Test search performance
GET /api/colaborador/blocos?busca=equacao&pagina=1

# Test filtering combinations
GET /api/admin/questoes-colaborador-pendentes?disciplina=matematica&dificuldade=dificil&status=pendente
```

Monitor:
- Response time (should be < 500ms)
- Database query efficiency
- Memory usage with large result sets

---

**Last Updated**: June 5, 2026  
**Test Suite**: Complete ✅
