# FASE 2: Frontend Deployment & Testing Guide

**Date**: June 5, 2026  
**Status**: Ready to Deploy

---

## ⚙️ Deployment Steps

### Step 1: Backup Current File (Safety)
```bash
cd "c:\Users\HP PROBOOK 440 G5\Desktop\COMAES-3.2\FrontEnd\src\Paginas\Secundarias"

# Backup current file
copy ColaboradorDashboardV2.jsx ColaboradorDashboardV2.jsx.backup.$(date /+%Y%m%d)

# Or just rename
ren ColaboradorDashboardV2.jsx ColaboradorDashboardV2.jsx.old
```

### Step 2: Deploy New File
```bash
# Copy new file to replace old one
copy ColaboradorDashboardV2_NEW.jsx ColaboradorDashboardV2.jsx
```

### Step 3: Start Development Servers

**Terminal 1 - Backend**:
```bash
cd BackEnd
npm start
# Should see: Server running on port 3001
```

**Terminal 2 - Frontend**:
```bash
cd FrontEnd
npm run dev
# Should see: ➜ Local: http://localhost:5173 (or 5177)
```

### Step 4: Verify Both Are Running
- Backend: `curl http://localhost:3001` (should respond)
- Frontend: Open `http://localhost:5177` in browser

---

## 🧪 Testing Scenarios

### Test 1: Login & Access Dashboard

**Steps**:
1. Open `http://localhost:5177/login`
2. Login with colaborador account:
   - Email: colaborador@test.com (or your test user)
   - Password: your_password
3. You should be redirected automatically OR
4. Navigate to `http://localhost:5177/colaborador/dashboard`

**Expected**:
- ✅ Dashboard tab shows with statistics
- ✅ Sidebar visible with 4 menu items
- ✅ User name shown in header
- ✅ No console errors

---

### Test 2: Dashboard Tab

**Steps**:
1. Click "Dashboard" in sidebar (or it should be default)
2. Observe the content

**Expected**:
- ✅ Welcome message shows your name
- ✅ 4 statistics cards visible:
  - Blocos Criados: some number
  - Questões Criadas: some number
  - Aguardando Revisão: shows count
  - Aprovados: shows count
- ✅ Status summary shows 3 boxes
- ✅ Info box explains the workflow

**Common Issues**:
- If stats show 0: You probably haven't created content yet (expected)
- If stats don't load: Check backend is running & API_BASE is correct

---

### Test 3: Meus Dados Tab

**Steps**:
1. Click "Meus Dados" in sidebar
2. Observe profile info

**Expected**:
- ✅ Shows your name, email, discipline, etc.
- ✅ "Editar Perfil" button visible
- ✅ Click it → form appears
- ✅ Fields are editable (except email & discipline)

**Testing Edit**:
1. Click "Editar Perfil"
2. Change your name to "Test Name"
3. Click "Salvar"
4. Wait for loading...
5. Should return to view mode with new name

**Expected**:
- ✅ Form closes
- ✅ Name updated
- ✅ No error message
- ✅ Success (backend accepts update)

**Common Issues**:
- If save fails: Backend user update endpoint may not exist (check error message)
- If fields are blank: Check user object from auth context

---

### Test 4: Blocos Tab - Create

**Steps**:
1. Click "Blocos de Questões" in sidebar
2. Click "+ Novo Bloco" button
3. Fill in:
   - Título: "Meu Primeiro Bloco"
   - Descrição: "Descrição de teste"
   - Dificuldade: "Fácil"
4. Click "Criar Bloco"

**Expected**:
- ✅ Form disappears
- ✅ New row added to table
- ✅ Title shows "Meu Primeiro Bloco"
- ✅ Status badge shows "⏳ Pendente" (yellow)
- ✅ Difficulty shows "facil"

**Common Issues**:
- Form doesn't close: Check for error message
- Blank error: "Título e descrição são obrigatórios"
- API error 403: Discipline mismatch (check backend validation)
- API error 401: Token invalid (re-login)

---

### Test 5: Blocos Tab - List & Filter

**Steps**:
1. On Blocos tab
2. Try search: Type "Primeiro" in search box
3. Should filter list
4. Try status filter: Click on status dropdown
5. Select "pendente"
6. List should show only pending

**Expected**:
- ✅ Search filters by title in real-time
- ✅ Status filter updates list
- ✅ Statistics show counts
- ✅ Table shows matching items

---

### Test 6: Blocos Tab - Edit

**Steps**:
1. In Blocos tab, find a pending bloco
2. Click the Edit icon (✏️) in Actions column
3. Modal appears
4. Change title to "Edited Title"
5. Click "Salvar"

**Expected**:
- ✅ Edit button only shows if status='pendente'
- ✅ Modal appears with current data
- ✅ Title field is editable
- ✅ Modal closes after save
- ✅ Table updates with new title

**Common Issues**:
- No Edit button: Block is not in 'pendente' status (expected)
- Error on save: Check description is not empty (required)

---

### Test 7: Blocos Tab - Delete

**Steps**:
1. Find a pending bloco
2. Click Delete icon (🗑️) in Actions column
3. Confirmation dialog appears
4. Click "Sim" (OK)

**Expected**:
- ✅ Delete button visible only if status='pendente' or 'rejeitado'
- ✅ Confirmation dialog appears
- ✅ Row disappears from table
- ✅ Statistics update (pendentes count decreases)

**Common Issues**:
- No Delete button: Block status is 'aprovado' (expected)
- Nothing happens: Check browser console for errors

---

### Test 8: Status & Permissions

**Create a test scenario**:
1. Create a bloco (should be 'pendente')
2. Try to edit → Should work (button visible)
3. Try to delete → Should work (button visible)

**Then**:
4. Have admin approve it (via admin panel or direct DB update)
5. Refresh page
6. Try to edit same bloco → Should NOT work (no Edit button)
7. Try to delete same bloco → Should NOT work (no Delete button)

**Expected**:
- ✅ Permissions enforced correctly
- ✅ Can only edit/delete pending content
- ✅ Approved content is read-only

---

### Test 9: Mobile Responsiveness

**Steps**:
1. Open DevTools (F12)
2. Click device toolbar icon (toggle device mode)
3. Select "iPhone 12" or similar
4. Test navigation

**Expected**:
- ✅ Sidebar hidden on mobile
- ✅ Hamburger menu visible (☰)
- ✅ Click hamburger → sidebar slides in
- ✅ Click menu item → sidebar hides
- ✅ All content readable on mobile
- ✅ Tables don't overflow
- ✅ Buttons are tap-friendly

---

### Test 10: Error Handling

**Test validation errors**:
1. Click "+ Novo Bloco"
2. Leave title empty
3. Click "Criar Bloco"

**Expected**:
- ✅ Error message: "Título e descrição são obrigatórios"
- ✅ Form stays open
- ✅ No request sent to API

**Test network error** (simulate):
1. Stop backend server
2. Try to create a bloco
3. Wait...

**Expected**:
- ✅ Error message appears (network error or timeout)
- ✅ Form stays open
- ✅ User can retry

---

### Test 11: Logout

**Steps**:
1. Click user avatar or logout button in sidebar
2. Logout modal appears
3. Click "Sim, sair"

**Expected**:
- ✅ Modal disappears
- ✅ Redirected to login page
- ✅ Token cleared
- ✅ Cannot access dashboard without re-login

---

## 🔍 Verification Checklist

### Page Load
- [ ] Page loads without errors
- [ ] Console has no red errors
- [ ] All 4 tabs visible in sidebar
- [ ] Stats cards display numbers

### UI/UX
- [ ] Layout looks like admin dashboard
- [ ] Sidebar responsive
- [ ] Colors match design
- [ ] Icons display correctly
- [ ] Mobile layout works

### Functionality
- [ ] Can create bloco
- [ ] Can list blocos
- [ ] Can edit pending bloco
- [ ] Can delete pending bloco
- [ ] Cannot edit approved bloco
- [ ] Status badges show correct colors
- [ ] Filters work

### API Integration
- [ ] Requests send auth token
- [ ] Responses handled correctly
- [ ] Errors display to user
- [ ] Loading states show
- [ ] No CORS errors

### Data Display
- [ ] User name shown
- [ ] Discipline shown
- [ ] Statistics accurate
- [ ] Status badges correct
- [ ] Timestamps (if shown) correct

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /colaborador/dashboard"

**Cause**: Route not configured  
**Fix**: Check if route exists in router config

```javascript
// Should have something like:
<Route path="/colaborador/dashboard" element={<ColaboradorDashboardV2 />} />
```

### Issue: "Not logged in" or redirected to login

**Cause**: Token expired or auth context not working  
**Fix**:
1. Re-login
2. Check AuthContext is providing token
3. Check local storage has auth token

### Issue: "Você não tem permissão"

**Cause**: User role is not 'colaborador'  
**Fix**:
1. Check user.role in auth context
2. Verify user is actually colaborador in database
3. Check login returns correct role

### Issue: "Você só pode criar conteúdo para..."

**Cause**: Discipline mismatch  
**Fix**:
1. Check user.disciplina_colaborador is set
2. Backend enforces discipline (this is correct behavior)
3. Create content only in assigned discipline

### Issue: API returns 500 error

**Cause**: Backend error  
**Fix**:
1. Check backend logs
2. Run setup: `node setup-colaborador-workflow.js`
3. Ensure database is synced
4. Check all required fields sent in request

### Issue: Can't edit after creating

**Cause**: Status changed to 'aprovado'  
**Fix**: This is expected! Only 'pendente' can be edited

---

## 📊 Success Metrics

You'll know FASE 2 is successful when:

1. ✅ Can access dashboard without errors
2. ✅ All tabs load and display content
3. ✅ Can create blocos
4. ✅ Can edit pending blocos
5. ✅ Cannot edit approved blocos
6. ✅ Can delete pending blocos
7. ✅ Status badges show correct colors
8. ✅ Mobile layout works
9. ✅ All API calls include auth token
10. ✅ Error messages display properly

---

## 📝 Notes

- **Questões Tab**: Currently shows placeholder. Will be implemented same way as Blocos
- **Admin Approval**: Not visible in colaborador dashboard (that's FASE 3)
- **Notifications**: Not implemented yet (future feature)
- **Profile Update**: May need backend endpoint (check if exists)

---

## Next Steps After Deployment

### If All Tests Pass ✅
→ Proceed to FASE 3 (Admin Review UI)

### If Some Tests Fail ❌
→ Debug using checklist above  
→ Check console errors  
→ Check backend logs  
→ Verify API endpoints

### Recommended Next
1. Implement Questões tab (same pattern as Blocos)
2. Test end-to-end workflow (create → admin approves → verify)
3. Get user feedback on design

---

**Ready to deploy?** Follow the steps at the top! 🚀
