# ⚡ Quick Reference: listarColaborador Error Fix

## The Problem
```
❌ Erro ao carregar questões
resposta_servidor: undefined
```

## The Solution (3 Steps)

### 1️⃣ Start Backend
```bash
cd BackEnd
npm start
```
✓ Wait for "Servidor rodando na porta 3000"

### 2️⃣ Start Frontend  
```bash
cd FrontEnd
npm run dev
```
✓ Access http://localhost:5173

### 3️⃣ Login & Test
- Login as colaborador
- Go to "Minhas Questões"
- If error: Read the tips shown on screen
- If success: Done! ✅

---

## If Still Getting Error

### Step A: Check Browser Console (F12)
You'll see one of these messages:

| Message | Fix |
|---------|-----|
| "Servidor não está respondendo" | Restart backend: `npm start` in BackEnd/ |
| "Sessão expirada" | Logout and login again |
| "Não é colaborador" | Ask admin to approve your account |
| "Endpoint não encontrado" | Restart backend, check routes registered |

### Step B: Check Backend Logs
In the terminal where you ran `npm start`, look for:
```
❌ Erro ao obter questões do colaborador: ...
```

### Step C: Verify Your Token
Open browser console (F12):
```javascript
console.log(localStorage.getItem('comaes_token'))
```

Should show a long string like: `eyJhbGc...` (300+ chars)

---

## Full Guides

| Document | Purpose |
|----------|---------|
| [GUIA_DEBUG_LISTARCOLARBORADOR.md](GUIA_DEBUG_LISTARCOLARBORADOR.md) | Complete 6-step debugging guide |
| [RESUMO_CORRECOES_LISTARCOLARBORADOR.md](RESUMO_CORRECOES_LISTARCOLARBORADOR.md) | What was fixed (technical) |
| [test_listarColaborador_complete.cjs](test_listarColaborador_complete.cjs) | Test script with colored output |

---

## Improvements Made

### Frontend Service (`questoesService.js`)
✅ Better error messages  
✅ Network vs HTTP error detection  
✅ Structured error object with helpful properties  
✅ Specific messages for 401, 403, 404, 500 errors  

### Frontend Component (`MinhasQuestoes.jsx`)
✅ Error display with contextual tips  
✅ Shows HTTP status code  
✅ Shows network connection status  
✅ Console logging includes token + user info  

### Testing
✅ New test script: `test_listarColaborador_complete.cjs`  
✅ Colorized output with progress indicators  
✅ Tests both connection and authentication  

---

## Common Errors & Fixes

### ❌ "Servidor não está respondendo"
```bash
# Terminal 1
cd BackEnd && npm start

# Wait for: "Servidor rodando na porta 3000"
```

### ❌ "Acesso negado"
Either:
1. You're not a colaborador → Contact admin
2. Colaborador account not approved → Wait for admin approval
3. Token expired → Logout and login again

### ❌ "Endpoint não encontrado"
```bash
# Kill existing backend process
# Then restart:
cd BackEnd && npm start
```

### ❌ Shows empty list
✓ This is normal! You just haven't created questões yet.  
Create one with the "+ Nova Questão" button.

---

## Test Everything Works

### In Browser Console (F12):
```javascript
// Copy & paste this:
fetch('http://localhost:3000/api/colaborador/questoes', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`,
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('SUCCESS:', data))
.catch(err => console.log('ERROR:', err.message))
```

Expected output:
```javascript
SUCCESS: {
  sucesso: true,
  dados: {
    questoes: [ ... ],
    paginacao: { ... },
    estatisticas: { ... }
  }
}
```

---

## Checklist ✔️

- [ ] Backend running (`npm start` in BackEnd/)
- [ ] Frontend running (`npm run dev` in FrontEnd/)
- [ ] Logged in as colaborador
- [ ] Token exists in localStorage
- [ ] No red errors in DevTools console
- [ ] Can see "Minhas Questões" page
- [ ] Either sees questions or "Nenhuma questão encontrada"

---

**Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Ready to use ✅
