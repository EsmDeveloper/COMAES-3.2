# QUICK START - FASE 1 Testing

**Time to Test**: ~5 minutes

---

## 1️⃣ Ensure Database is Synced

```bash
cd BackEnd
node setup-colaborador-workflow.js
```

**Expected Output**:
```
✅ BlocoQuestoes model synced
✅ Questao model synced
✅ Colaborador Workflow setup complete!
```

---

## 2️⃣ Start Backend Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

**Expected Output**:
```
Server running on port 3001
```

---

## 3️⃣ Test One Endpoint

### Create a Block (Bloco)

Using curl or Postman:

```bash
curl -X POST http://localhost:3001/api/colaborador/blocos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_COLABORADOR_TOKEN" \
  -d '{
    "titulo": "Test Block",
    "descricao": "Testing status pendente",
    "dificuldade": "facil"
  }'
```

**Look For**:
- ✅ Status code: 201
- ✅ Response has `"status": "pendente"`
- ✅ Response has `"disciplina": "matematica"` (if user's discipline is math)

---

## 4️⃣ Quick Test Sequence

### Test 1: Create (201)
```
POST /api/colaborador/blocos
Expected: 201, status='pendente'
```

### Test 2: List (200)
```
GET /api/colaborador/blocos
Expected: 200, shows stats (pendentes: 1, aprovados: 0)
```

### Test 3: Update Pending (200)
```
PUT /api/colaborador/blocos/1
Expected: 200, updates successfully
```

### Test 4: Admin Approves (200)
```
POST /api/admin/blocos/1/aprovar
Expected: 200, status='aprovado', aprovado_por_id set
```

### Test 5: Try to Edit Approved (403)
```
PUT /api/colaborador/blocos/1
Expected: 403, "não pode ser editado"
```

✅ **If all 5 pass: FASE 1 is working!**

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| 401 Unauthorized | Check Authorization header and token validity |
| 403 Você só pode... | User's discipline doesn't match content discipline |
| 404 Bloco não encontrado | Bloco doesn't exist or belongs to different user |
| 500 Server error | Run setup: `node setup-colaborador-workflow.js` |
| Database errors | Verify MySQL is running on localhost:3306 |

---

## Where to Find Things

| Item | Location |
|------|----------|
| API Endpoints | `BackEnd/controllers/ColaboradorBlocosQuestoesControllerV2.js` |
| Routes | `BackEnd/routes/colaboradorBlocosQuestoesRoutes.js` |
| Database Model | `BackEnd/models/BlocoQuestoes.js` |
| Full Testing Guide | `TESTING_COLABORADOR_WORKFLOW.md` |
| Implementation Details | `FASE_1_IMPLEMENTATION_COMPLETE.md` |

---

## Key Things to Verify

- [ ] Database synced successfully
- [ ] Backend starts without errors
- [ ] Can create block with status='pendente'
- [ ] Can list with statistics
- [ ] Can update pending block
- [ ] Cannot update approved block
- [ ] Admin can approve
- [ ] Admin can reject (with reason mandatory)

---

## Success Criteria ✅

If you can do these without errors, FASE 1 is complete:

1. ✅ Create bloco (GET 201, status='pendente')
2. ✅ List blocos (GET 200, shows stats)
3. ✅ Update pending bloco (PUT 200)
4. ✅ Cannot update approved bloco (PUT 403)
5. ✅ Admin approves (POST 200, status='aprovado')
6. ✅ Admin rejects with reason (POST 200, status='rejeitado')
7. ✅ Same for questões endpoints

---

## Ready to Test?

→ Follow `TESTING_COLABORADOR_WORKFLOW.md` for detailed test cases

→ Check `FASE_1_STATUS_REPORT.md` for implementation summary

→ Review `FASE_1_IMPLEMENTATION_COMPLETE.md` for full details

---

**Last Updated**: June 5, 2026  
**Status**: ✅ Ready for Testing
