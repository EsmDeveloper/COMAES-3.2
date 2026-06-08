# Quick Testing Guide: "Criar Novo Usuário" Form

## Pre-Test Checklist
- [ ] You are logged in as a **Super Admin** (administrator with `isAdmin: true`)
- [ ] Navigate to: **Painel Administrativo** → **Criar Novo Usuário** tab
- [ ] Build has been updated: `npm run build` completed

## Test Case 1: Creating a Usuário (Student)

### Steps
1. Click **"+ Adicionar usuário"** button
2. Select **"👤 Usuário"** (blue option)
3. Click **"+ Criar Usuário"** button
4. Verify form appears with these fields:
   - ✅ Nome Completo
   - ✅ E-mail
   - ✅ Telefone
   - ✅ Data de Nascimento
   - ✅ Sexo (dropdown)
   - ✅ Escola (dropdown, optional)
   - ✅ Biografia (textarea, optional)
   - ✅ Senha de Acesso section with password fields

### Expected Result
✅ Form fully displays with green styling  
✅ "Criar Usuário" button visible at bottom

---

## Test Case 2: Creating a Colaborador (Teacher) - **MAIN FIX**

### Steps
1. Click **"+ Adicionar usuário"** button
2. Select **"🎓 Colaborador"** (teal option) ← **NEWLY FIXED**
3. Click **"+ Criar Colaborador"** button
4. Verify form appears with these fields:
   - ✅ Nome Completo
   - ✅ E-mail
   - ✅ Telefone
   - ✅ Data de Nascimento
   - ✅ Sexo (dropdown)
   - ✅ **Disciplina** (NEW FIELD - dropdown with Matemática, Inglês, Programação)
   - ✅ Biografia
   - ✅ Senha de Acesso section

### Expected Result
✅ **Form NOW APPEARS** (this was previously broken)  
✅ Form displays with **teal styling**  
✅ "🎓 Criar Colaborador" button visible  
✅ Disciplina field is required and shows dropdown

### Test Disciplina Field
1. Try to submit form without selecting disciplina
2. Verify error message: "A disciplina é obrigatória para colaborador."
3. Select "Matemática" and verify form can be submitted

---

## Test Case 3: Creating an Administrador (Admin)

### Steps
1. Click **"+ Adicionar usuário"** button
2. Select **"🛡️ Administrador"** (purple option)
3. Click **"+ Criar Administrador"** button
4. Verify form appears with these fields:
   - ✅ E-mail (required)
   - ✅ Senha de Acesso section
   - NOTE: Name is auto-generated from email, other fields are auto-filled

### Expected Result
✅ Simplified form displays with **purple styling**  
✅ "🛡️ Criar Administrador" button visible at bottom

---

## Validation Testing

### Test Field Validation

#### Nome Completo
- [ ] Empty → Shows error "O nome é inválido."
- [ ] Too long (>100 chars) → Truncated
- [ ] Valid name (e.g., "Maria Silva") → Accepted

#### Email
- [ ] Empty → Shows error "O email é inválido."
- [ ] Invalid format (e.g., "test@") → Shows error
- [ ] Valid email → Accepted
- [ ] Duplicate email → Backend error

#### Telefone
- [ ] Empty (required) → Shows error "O telefone é inválido."
- [ ] Valid format (e.g., "923456789") → Accepted

#### Data de Nascimento
- [ ] Empty → Shows error "Data de nascimento inválida."
- [ ] Future date → Shows error
- [ ] Valid past date → Accepted

#### Sexo
- [ ] Not selected → Shows error "O sexo é obrigatório."
- [ ] Select "Masculino" or "Feminino" → Accepted

#### Disciplina (Colaborador only)
- [ ] Not selected → Shows error "A disciplina é obrigatória para colaborador."
- [ ] Select any option → Accepted

#### Senha (Password)
- [ ] Empty → Shows error "A senha é obrigatória."
- [ ] Less than 8 chars → Shows error "Mín. 8 caracteres..."
- [ ] Without uppercase → Shows error
- [ ] Without lowercase → Shows error
- [ ] Without number → Shows error
- [ ] Without symbol → Shows error (but not required)
- [ ] Strong password → Accepted with "✓ Senhas coincidem" when confirmed

---

## Visual Verification Checklist

### Usuário Form (Blue)
- [ ] Modal icon: 👤 (Person icon)
- [ ] Icon background: Light blue (bg-green-100)
- [ ] Button color: Green
- [ ] Title: "Criar Novo Usuário"
- [ ] Includes "Escola" dropdown

### Colaborador Form (Teal) ← **NEW**
- [ ] Modal icon: 🎓 (Graduation cap icon)
- [ ] Icon background: Light teal (bg-teal-100)
- [ ] Button color: Teal
- [ ] Title: "Criar Professor/Colaborador"
- [ ] **Includes "Disciplina" dropdown**
- [ ] Does NOT include "Escola" field

### Administrador Form (Purple)
- [ ] Modal icon: 🛡️ (Shield icon)
- [ ] Icon background: Light purple (bg-purple-100)
- [ ] Button color: Purple
- [ ] Title: "Criar Administrador"
- [ ] Only shows: Email, Password, Confirm Password
- [ ] Note about auto-generated fields is visible

---

## State & Flow Testing

### Test Modal State Reset
1. Open modal and select "Usuário"
2. Click "Cancelar"
3. Open modal again and select "Colaborador"
4. Verify no form data from previous selection remains

### Test Switching Account Types
1. Open modal
2. Select "Usuário" → form appears
3. Click on "Colaborador" option (without closing modal)
4. Verify form switches to Colaborador form
5. Verify "Disciplina" field now appears
6. Verify "Escola" field is gone

### Test Error Persistence
1. Try to submit Colaborador form without disciplina
2. Verify error message stays visible
3. Verify form is NOT submitted
4. Select disciplina
5. Verify error clears
6. Form can be submitted

---

## Success Criteria

All of the following must be true for the fix to be verified as working:

✅ **Colaborador form appears** when clicking "Colaborador" option  
✅ **Disciplina field exists** in the Colaborador form  
✅ **Disciplina validation works** (required field)  
✅ **All three account types render correctly** with proper styling  
✅ **Modal title updates** based on account type  
✅ **Icon changes** based on account type  
✅ **Button color matches** the account type theme  
✅ **Form validation works** for all required fields  
✅ **No console errors** when switching account types  
✅ **Build completes** with `npm run build` (EXIT CODE 0)

---

## Troubleshooting

### Issue: Form still doesn't appear for Colaborador
- [ ] Check browser console for errors
- [ ] Verify build was updated: `npm run build`
- [ ] Clear browser cache and reload
- [ ] Check UserModal.jsx line 576: should have `{isCreate && accountType === 'colaborador' && (`

### Issue: Disciplina field not visible
- [ ] Verify you're in Colaborador mode (not admin or user)
- [ ] Check line 627-635 in UserModal.jsx for field rendering
- [ ] Verify form validation includes disciplina_colaborador

### Issue: Form shows but buttons don't work
- [ ] Verify backend endpoint accepts `role: 'colaborador'`
- [ ] Check browser network tab for API responses
- [ ] Verify payload includes `disciplina_colaborador`

---

## Database Verification

After successfully creating a Colaborador, verify in database:

```sql
SELECT id, nome, email, role, disciplina_colaborador 
FROM users 
WHERE role = 'colaborador' 
ORDER BY created_at DESC 
LIMIT 1;
```

Expected result:
```
id   | nome           | email              | role       | disciplina_colaborador
-----|----------------|-------------------|------------|---------------------
(id) | (name)         | (email@example)   | colaborador| Matemática (or Inglês/Programação)
```

---

## Final Confirmation

Once all tests pass:

1. Document test execution in a test log
2. Screenshot successful form creation for each account type
3. Verify database entry for new Colaborador
4. Mark task as complete

**Tested By**: _________________  
**Date**: _________________  
**Status**: ☐ PASS / ☐ FAIL
