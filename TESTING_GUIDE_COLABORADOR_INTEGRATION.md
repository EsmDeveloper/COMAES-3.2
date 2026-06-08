# 🧪 Testing Guide - Colaborador Integration

**Last Updated**: June 5, 2026  
**Version**: 1.0  
**Status**: Ready for Testing

---

## 📋 Pre-Testing Checklist

### Environment Setup
- [ ] Backend API running on port 3000
- [ ] FrontEnd running on port 5173 (or configured port)
- [ ] Database accessible and populated
- [ ] Test usuarios created:
  - [ ] Colaborador account (role: 'colaborador', status: 'aprovado')
  - [ ] Admin account (role: 'admin')

### Required Data
- [ ] Collaborator has `disciplina_colaborador` set
- [ ] At least 2 available blocos in database

---

## 🧪 Manual Testing Scenarios

### SCENARIO 1: Colaborador Dashboard Access

**Test**: Can colaborador access the new dashboard?

**Steps**:
1. Login as colaborador user
2. Navigate to /colaborador dashboard
3. Verify sidebar displays all 4 tabs

**Expected Results**:
- ✅ Dashboard loads without errors
- ✅ Sidebar visible with navigation
- ✅ All tabs are clickable
- ✅ Profile data displays

**Pass/Fail**: ___________

---

### SCENARIO 2: Create Bloco

**Test**: Colaborador can create a new bloco

**Steps**:
1. Go to "Meus Blocos" tab
2. Click "Criar Bloco" button
3. Fill form:
   - Título: "Test Bloco"
   - Descrição: "Test description"
   - Ordem: 1
   - Ativo: ✓
4. Click "Criar Bloco"

**Expected Results**:
- ✅ Form validates input
- ✅ Success message appears (or toast)
- ✅ New bloco appears in list
- ✅ Status shows "📝 Rascunho"
- ✅ Backend receives: `POST /api/colaborador/blocos`
- ✅ Database: bloco created with `criado_por = user_id`

**Test Data to Capture**:
- Bloco ID: ________________
- Response time: ________________

**Pass/Fail**: ___________

---

### SCENARIO 3: Edit Bloco

**Test**: Colaborador can edit a rascunho bloco

**Steps**:
1. Go to "Meus Blocos" tab
2. Find created bloco from SCENARIO 2
3. Click "Editar" button
4. Change título to "Updated Bloco"
5. Click "Atualizar"

**Expected Results**:
- ✅ Edit form opens with pre-filled data
- ✅ Can modify fields
- ✅ Success message appears
- ✅ List updates with new title
- ✅ Backend receives: `PUT /api/colaborador/blocos/:id`

**Pass/Fail**: ___________

---

### SCENARIO 4: Cannot Edit Publicado Bloco

**Test**: Cannot edit a publicado (published) bloco

**Setup**: Have an admin approve the bloco from SCENARIO 3 first

**Steps**:
1. Go to "Meus Blocos" tab
2. Find approved bloco (status: "✅ Publicado")
3. Try to click "Editar" button

**Expected Results**:
- ✅ "Editar" button is disabled
- ✅ Hover tooltip explains why
- ✅ Delete button also disabled

**Pass/Fail**: ___________

---

### SCENARIO 5: Create Questão

**Test**: Colaborador can create a new question

**Steps**:
1. Go to "Minhas Questões" tab
2. Click "Criar Questão" button
3. Fill form:
   - Título: "Test Question"
   - Descrição: "What is a matrix?"
   - Tipo: "Múltipla Escolha"
   - Dificuldade: "Médio"
   - Pontos: 15
   - Bloco: (select from dropdown or leave empty)
   - Options:
     - Opção A: "A square array of numbers" (mark as ✓)
     - Opção B: "An equation"
     - Opção C: "A function"
4. Click "Criar Questão"

**Expected Results**:
- ✅ Form validates:
  - [ ] Título required
  - [ ] Descrição required
  - [ ] At least 2 options
  - [ ] 1 option marked as correct
  - [ ] Pontos 1-100
- ✅ Success message appears
- ✅ New questão in list with status "⏳ Pendente"
- ✅ Backend receives: `POST /api/colaborador/questoes`
- ✅ Database: questão created with `autor_id = user_id`, `status_aprovacao = 'pendente'`

**Test Data to Capture**:
- Questão ID: ________________
- Options saved correctly: _____ (Y/N)

**Pass/Fail**: ___________

---

### SCENARIO 6: Create Texto Questão

**Test**: Colaborador can create open-ended question

**Steps**:
1. Go to "Minhas Questões" tab
2. Click "Criar Questão"
3. Fill form:
   - Título: "Essay Question"
   - Descrição: "Explain what a matrix is"
   - Tipo: "Texto/Aberta"
   - Dificuldade: "Médio"
   - Pontos: 20
   - Resposta Esperada: "A matrix is a rectangular array..."
   - Explicação: "Sample explanation"
4. Click "Criar Questão"

**Expected Results**:
- ✅ Different form fields for texto type
- ✅ Options section hidden
- ✅ Resposta Esperada and Explicação visible
- ✅ Success creates questão
- ✅ Type stored as 'texto'

**Pass/Fail**: ___________

---

### SCENARIO 7: Delete Questão

**Test**: Colaborador can delete pending question

**Steps**:
1. Go to "Minhas Questões" tab
2. Find a "⏳ Pendente" questão
3. Click trash icon
4. Confirm deletion

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Backend receives: `DELETE /api/colaborador/questoes/:id`
- ✅ Questão removed from list
- ✅ Success message

**Test Case**:
- Delete questão from SCENARIO 5: Y/N
- Confirmation dialog shown: Y/N
- Questão removed: Y/N

**Pass/Fail**: ___________

---

### SCENARIO 8: Cannot Delete Approved Questão

**Test**: Cannot delete approved question

**Setup**: Have admin approve a questão first

**Steps**:
1. Go to "Minhas Questões" tab
2. Find questão with "✅ Aprovada" status
3. Try to click trash icon

**Expected Results**:
- ✅ Trash button is disabled
- ✅ Hover shows reason

**Pass/Fail**: ___________

---

### SCENARIO 9: Permissions - Other User's Data

**Test**: Colaborador cannot access other's data

**Setup**: Have 2 colaborador accounts

**Steps**:
1. Create bloco as User A
2. Login as User B
3. Go to "Meus Blocos"

**Expected Results**:
- ✅ User B cannot see User A's bloco
- ✅ Only User A's own blocos show
- ✅ Backend returns 404 if User B tries to edit User A's bloco

**Pass/Fail**: ___________

---

### SCENARIO 10: Admin Can See Pending Blocos

**Test**: Admin can see pending blocks in review dashboard

**Setup**: Colaborador created blocos

**Steps**:
1. Login as Admin
2. Go to Admin Dashboard
3. Navigate to "Blocos Colaboradores" (or pending review tab)

**Expected Results**:
- [ ] ⏳ **NOTE**: Admin UI not yet created - Skip for now
- Will test after admin components are built

**Pass/Fail**: ___________

---

## 📊 API Endpoint Testing

### Test Bloco Endpoints

#### POST /api/colaborador/blocos

**Request**:
```bash
curl -X POST http://localhost:3000/api/colaborador/blocos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Test Block",
    "descricao": "Description",
    "ordem": 0,
    "ativo": true
  }'
```

**Expected Response**:
```json
{
  "sucesso": true,
  "mensagem": "Bloco criado com sucesso",
  "dados": {
    "id": 123,
    "titulo": "Test Block",
    "criado_por": 456,
    "status": "rascunho",
    "created_at": "2026-06-05T..."
  }
}
```

**Status Code**: ✅ 201  
**Response Time**: __________ ms  
**Pass/Fail**: ___________

---

#### GET /api/colaborador/blocos

**Request**:
```bash
curl -X GET "http://localhost:3000/api/colaborador/blocos?limite=20&pagina=1" \
  -H "Authorization: Bearer TOKEN"
```

**Expected Response**:
```json
{
  "sucesso": true,
  "mensagem": "Blocos listados com sucesso",
  "dados": {
    "blocos": [...],
    "paginacao": {
      "pagina": 1,
      "limite": 20,
      "total": 5,
      "totalPaginas": 1
    }
  }
}
```

**Status Code**: ✅ 200  
**Number of Blocos Returned**: __________  
**Pass/Fail**: ___________

---

#### PUT /api/colaborador/blocos/:id

**Request**:
```bash
curl -X PUT http://localhost:3000/api/colaborador/blocos/123 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Updated Title"}'
```

**Expected Response**:
```json
{
  "sucesso": true,
  "mensagem": "Bloco atualizado com sucesso",
  "dados": { "id": 123, "titulo": "Updated Title", ... }
}
```

**Status Code**: ✅ 200  
**Pass/Fail**: ___________

---

#### DELETE /api/colaborador/blocos/:id

**Request**:
```bash
curl -X DELETE http://localhost:3000/api/colaborador/blocos/123 \
  -H "Authorization: Bearer TOKEN"
```

**Expected Response**:
```json
{
  "sucesso": true,
  "mensagem": "Bloco deletado com sucesso",
  "dados": null
}
```

**Status Code**: ✅ 200  
**Pass/Fail**: ___________

---

### Test Questão Endpoints

#### POST /api/colaborador/questoes (Múltipla Escolha)

**Request**:
```bash
curl -X POST http://localhost:3000/api/colaborador/questoes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "What is X?",
    "descricao": "Pick the right answer",
    "tipo": "multipla_escolha",
    "dificuldade": "medio",
    "pontos": 10,
    "opcoes": [
      {"texto": "Option A", "correta": true},
      {"texto": "Option B", "correta": false}
    ]
  }'
```

**Expected**: ✅ 201 with question ID  
**Pass/Fail**: ___________

---

#### GET /api/colaborador/questoes

**Request**:
```bash
curl "http://localhost:3000/api/colaborador/questoes?limite=20&status=pendente" \
  -H "Authorization: Bearer TOKEN"
```

**Expected**: ✅ 200 with list filtered by status  
**Pending Count**: __________  
**Pass/Fail**: ___________

---

#### DELETE /api/colaborador/questoes/:id

**Request**:
```bash
curl -X DELETE http://localhost:3000/api/colaborador/questoes/789 \
  -H "Authorization: Bearer TOKEN"
```

**Expected**: ✅ 200 with success message  
**Pass/Fail**: ___________

---

## 🔐 Security Testing

### Test Authorization

#### Test 1: Missing Token
```bash
curl -X GET http://localhost:3000/api/colaborador/blocos
```

**Expected**:
- Status: 401 Unauthorized
- Message: "Token not provided" or similar

**Pass/Fail**: ___________

---

#### Test 2: Invalid Token
```bash
curl -X GET http://localhost:3000/api/colaborador/blocos \
  -H "Authorization: Bearer INVALID_TOKEN"
```

**Expected**:
- Status: 401 Unauthorized
- Message: "Invalid token"

**Pass/Fail**: ___________

---

#### Test 3: Admin Accessing Colaborador Endpoint
```bash
curl -X GET http://localhost:3000/api/colaborador/blocos \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected**:
- Status: 403 Forbidden
- Message: "Must have role 'colaborador'"

**Pass/Fail**: ___________

---

#### Test 4: Accessing Other User's Block
```bash
curl -X GET http://localhost:3000/api/colaborador/blocos/OTHER_USER_ID \
  -H "Authorization: Bearer TOKEN"
```

**Expected**:
- Status: 404 Not Found
- Message: "Block not found"

**Pass/Fail**: ___________

---

## 📱 UI/UX Testing

### Form Validation

#### Bloco Form
- [ ] Título required: Try submit with empty título
- [ ] Título max 255 chars: Test with 300 chars
- [ ] All fields have proper labels
- [ ] Character counter visible for título
- [ ] Loading indicator shows while saving

**Pass/Fail**: ___________

---

#### Questão Form
- [ ] Título required: Try submit empty
- [ ] Type selector changes fields
- [ ] Multiple choice needs 2+ options
- [ ] Multiple choice needs 1 correct
- [ ] Pontos validated 1-100
- [ ] Add/Remove option buttons work
- [ ] Bloco dropdown populated

**Pass/Fail**: ___________

---

### List Display

#### Blocos List
- [ ] Cards display properly
- [ ] Status badges show correct color
- [ ] Buttons are properly enabled/disabled
- [ ] Empty state shows when no blocos
- [ ] Loading spinner appears while fetching
- [ ] Error message displays on failure

**Pass/Fail**: ___________

---

#### Questões List
- [ ] Table layout responsive
- [ ] Status badges correct
- [ ] Type displayed correctly
- [ ] Delete confirms with dialog
- [ ] Edit opens form with data
- [ ] Empty state shows

**Pass/Fail**: ___________

---

## 📈 Performance Testing

### Load Time
- Dashboard loads: __________ ms (target: < 1000ms)
- Blocos list fetches: __________ ms (target: < 500ms)
- Questões list fetches: __________ ms (target: < 500ms)
- Form submits: __________ ms (target: < 500ms)

**Pass/Fail**: ___________

---

### Large Dataset
- Load with 100+ blocos: ✓ / ✗
- Load with 500+ questões: ✓ / ✗
- Pagination works: ✓ / ✗
- Search/Filter works: ✓ / ✗

**Pass/Fail**: ___________

---

## 📝 Test Summary

### Total Tests: _____ / _____

**Scenarios Passed**: __________  
**Scenarios Failed**: __________  
**APIs Tested**: __________  
**Security Tests Passed**: __________  
**Performance Acceptable**: Y / N  

### Overall Status

- [ ] ✅ Ready for Next Phase
- [ ] ⏳ Minor Issues to Fix
- [ ] ❌ Major Issues Found

### Issues Found

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| 1  |       | High / Medium / Low | Open / Fixed |
| 2  |       | High / Medium / Low | Open / Fixed |
| 3  |       | High / Medium / Low | Open / Fixed |

---

## 📞 Sign-Off

**Tester Name**: ________________  
**Date**: ________________  
**Signature**: ________________  

**Reviewed By**: ________________  
**Date**: ________________  

---

## ✅ Deployment Ready

- [ ] All critical tests passed
- [ ] No security issues found
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Rollback plan documented
- [ ] Team trained and ready

**Sign-Off**: ________________

---

**Testing Complete**: _____ (Date)  
**Ready for Production**: Y / N

---
