# 📝 PHASE 2: FRONTEND TESTING GUIDE
## Sistema de Torneios COMAES 3.2 - User Interface Verification

**Date**: June 10, 2026  
**Status**: 🟢 **READY FOR TESTING**  
**Test Tournament ID**: 61

---

## Quick Start

### 1. Start the Development Servers

**Terminal 1 - Backend**:
```bash
cd BackEnd
npm start
# Expected: Server listening on port 3000
```

**Terminal 2 - Frontend**:
```bash
npm run dev
# Expected: Vite dev server on http://localhost:5173
```

### 2. Access the Application

Open browser: `http://localhost:5173`

Navigate to: **"Entrar no Torneio"** page

---

## Test Case 1: Tournament Display (Specific Type)

### Test Name
`UI_DISPLAY_SPECIFIC_TOURNAMENT_DISCIPLINES`

### Setup
- Test Tournament ID: **61**
- Tournament Title: "Torneio Teste - Matemática Específica - 1781099336170"
- Tournament Type: **ESPECÍFICO**
- Associated Discipline: **MATEMÁTICA**

### Steps
1. Go to "Entrar no Torneio"
2. Search for "Torneio Teste - Matemática"
3. Look for test tournament in results

### Expected Result

```
┌────────────────────────────────────────────────────────────────┐
│  DISCIPLINE CARD DISPLAY FOR SPECIFIC TOURNAMENT               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✅ ACTIVE DISCIPLINE (Matemática):                           │
│  ├─ Opacity: 100% (fully visible)                            │
│  ├─ Badge: "✓ Ativa" (green color: #10B981)                 │
│  ├─ Button: "Ver Torneio" (enabled, clickable)              │
│  ├─ Class: No overlay, no cursor-not-allowed                │
│  └─ Button Style: Blue gradient, hover shadow               │
│                                                                │
│  ❌ INACTIVE DISCIPLINES (Inglês, Programação):              │
│  ├─ Opacity: 70% (partially transparent)                     │
│  ├─ Overlay: "Disciplina Indisponível" message (black/50)   │
│  ├─ Button: "Indisponível" (disabled)                        │
│  ├─ Class: cursor-not-allowed                                │
│  └─ Button Style: Gray, no hover effect                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Visual Verification Checklist
- [ ] Matemática card is 100% opaque
- [ ] Inglês card is 70% opaque
- [ ] Programação card is 70% opaque
- [ ] Matemática has green "✓ Ativa" badge
- [ ] Inglês/Programação have "Disciplina Indisponível" overlay
- [ ] Matemática button says "Ver Torneio"
- [ ] Inglês/Programação buttons say "Indisponível"
- [ ] Clicking inactive button does nothing (disabled)
- [ ] Clicking active button shows confirmation modal

### Code Reference
**File**: `FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx`
**Lines**: 120-180 (discipline filtering logic)
**Key Variables**:
- `disciplinaEspecificaTorneio` - tracks selected discipline ("matematica")
- `isDisciplinaAtiva` - boolean determining if discipline is active

---

## Test Case 2: Admin Panel Badge Display

### Test Name
`ADMIN_TOURNAMENT_TYPE_BADGE`

### Setup
- Tournament ID: 61
- Location: Admin Panel → Torneios Tab
- Look for tournament in list

### Steps
1. Go to Admin Panel
2. Click on "Torneios" tab
3. Scroll through tournament list
4. Find "Torneio Teste - Matemática Específica - 1781099336170"

### Expected Result

```
┌──────────────────────────────────────────────────────────────┐
│  TOURNAMENT ROW IN ADMIN TABLE                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Column 1 - Torneio:                                         │
│ ├─ Title: "Torneio Teste - Matemática Específica - ..."    │
│ └─ Date: "Criado em [date]"                                │
│                                                              │
│ Column 2 - Tipo (TYPE BADGE):                              │
│ ├─ Icon: 📚 (BookOpen icon)                                │
│ ├─ Text: "Específico (matematica)"                         │
│ ├─ Background: Blue (#3B82F6)                              │
│ ├─ Text Color: Blue darker (#1E40AF)                       │
│ └─ Styling: px-2 py-1 rounded-lg text-xs font-semibold    │
│                                                              │
│ Column 3 - Período:                                        │
│ ├─ Início: [date/time]                                    │
│ └─ Fim: [date/time]                                       │
│                                                              │
│ Column 4 - Status:                                         │
│ ├─ Text: "RASCUNHO" (or status)                           │
│ ├─ Badge Color: Amber/Orange (for rascunho)              │
│ └─ Font: Bold, uppercase                                  │
│                                                              │
│ Column 5 - Ações:                                          │
│ ├─ Edit button                                            │
│ ├─ View button                                            │
│ └─ Delete button                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Verification Checklist
- [ ] Badge shows "Específico"
- [ ] Badge shows "(matematica)" in parentheses
- [ ] Badge background is blue
- [ ] BookOpen icon displays
- [ ] Badge styling is consistent with other elements
- [ ] NOT showing "Genérico" (wrong)
- [ ] All action buttons present and functional

### Code Reference
**File**: `FrontEnd/src/Administrador/TorneiosTab.jsx`
**Lines**: 195-210 (type badge display)
**Key Logic**:
```javascript
t.tipo_torneio === 'especifico'
  ? '📚 Específico (${t.disciplina_especifica})'
  : '🌍 Genérico'
```

---

## Test Case 3: User Enrollment Flow

### Test Name
`USER_ENROLLMENT_SPECIFIC_TOURNAMENT`

### Setup
- User must be logged in
- Tournament must be ativo or rascunho (can be activated)
- Navigate to "Entrar no Torneio"

### Steps
1. Find tournament "Torneio Teste - Matemática Específica"
2. Click "Ver Torneio" button on Matemática card
3. Confirm enrollment in modal
4. User redirected to tournament quiz

### Expected Result

#### Step 1 - Modal Appears
```
┌────────────────────────────────────┐
│  TOURNAMENT ENTRY CONFIRMATION     │
├────────────────────────────────────┤
│                                    │
│  Tournament Image Header           │
│  "Matemática" title overlay        │
│                                    │
│  Description:                      │
│  "Clique no botão abaixo para      │
│   entrar no torneio ativo de       │
│   Matemática."                     │
│                                    │
│  Tournament Info Box:              │
│  ├─ Trophy icon                   │
│  ├─ "Torneio Ativo"              │
│  ├─ Title: "Torneio Teste - ..."  │
│  └─ Dates shown                   │
│                                    │
│  [Entrar no Torneio] Button        │
│  [Login Redirect if not authed]    │
│                                    │
└────────────────────────────────────┘
```

#### Step 2 - Upon Clicking Button
- [ ] Loading spinner appears
- [ ] Button becomes disabled
- [ ] "Entrando no torneio..." message
- [ ] Backend validates enrollment
- [ ] Participant record created
- [ ] User redirected to tournament quiz page

### Error Scenarios

**User Already in Tournament**:
```
Error: "❌ Você já está participando de outro torneio: 
'[Nome do Torneio]'. Termine esse primeiro para 
participar deste."
```
- [ ] Error message displays
- [ ] User remains on current page
- [ ] Can dismiss and try another tournament

**Not Logged In**:
```
Modal appears with:
- Login button (redirects to /login)
- Cadastro button (redirects to /cadastro)
- Cancelar button (closes modal)
```

### Code Reference
**File**: `FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx`
**Functions**:
- `entrarNoTorneio()` - handles enrollment (line 280)
- `verificarParticipacaoAtiva()` - checks for existing participation (line 290)

---

## Test Case 4: Generic Tournament Display (Fallback)

### Test Name
`UI_DISPLAY_GENERIC_TOURNAMENT_DISCIPLINES`

### Prerequisite
- Create or find a GENERIC tournament (tipo_torneio = 'generico')
- With blocks in multiple disciplines

### Steps
1. Go to "Entrar no Torneio"
2. Search for generic tournament
3. Observe discipline cards

### Expected Result

```
For GENERIC tournaments:
├─ Show ALL disciplines with published blocks
├─ All shown disciplines are ACTIVE (100% opacity)
├─ No "Indisponível" overlays
└─ All buttons are enabled
```

---

## Test Case 5: API Integration

### Test Name
`API_TOURNAMENT_TYPE_RESPONSES`

### Tools Needed
- Browser Developer Tools → Network tab
- Or use curl/Postman

### API Endpoints to Verify

#### Endpoint 1: Get Active Tournament
```
GET /api/torneios/ativo
```

**Expected Response**:
```json
{
  "ativo": true,
  "torneio": {
    "id": 61,
    "titulo": "Torneio Teste - Matemática Específica - 1781099336170",
    "tipo_torneio": "especifico",
    "disciplina_especifica": "matematica",
    "inicia_em": "2026-06-10T13:58:01.000Z",
    "termina_em": "2026-06-10T14:48:01.000Z",
    "status": "rascunho",
    "blocos": 2,
    "questoes": 8
  }
}
```

**Check Points**:
- [ ] `tipo_torneio` field present
- [ ] `disciplina_especifica` field present
- [ ] Value is "especifico"
- [ ] disciplina_especifica is "matematica"
- [ ] No null/undefined values

#### Endpoint 2: Get Tournament Disciplines
```
GET /api/torneios/ativo/disciplinas
```

**Expected Response (Generic)**:
```json
{
  "disciplinas": ["Matemática", "Programação"]
  // (only disciplines with published blocks)
}
```

**Expected Response (Specific)**:
```json
{
  "disciplinas": ["Matemática"]
  // (only the specific discipline)
}
```

#### Endpoint 3: Get Tournament Blocks with Questions
```
GET /api/torneios/61/blocos
```

**Expected Response**:
```json
{
  "torneio_id": 61,
  "blocos": [
    {
      "id": 1,
      "titulo": "Tudo em Mathq",
      "disciplina": "matematica",
      "total_questoes": 4,
      "questoes": [
        {
          "id": 448,
          "enunciado": "Se x + 5 = 12...",
          "opcoes": ["7", "10", "17", "22"],
          "resposta_correta": "7",
          "pontos": 10
        },
        // ... 3 more questions
      ]
    },
    // ... 1 more block
  ],
  "total": 2
}
```

**Check Points**:
- [ ] 2 blocks returned
- [ ] Each block has "questoes" array
- [ ] questoes array has 4 items per block
- [ ] total_questoes field correct
- [ ] Questions have all required fields

#### Endpoint 4: Quiz Questions
```
GET /api/questoes/quiz/matematica?torneio_id=61
```

**Expected Response**:
```json
{
  "success": true,
  "area": "matematica",
  "total": 8,
  "data": [
    {
      "id": 448,
      "enunciado": "Se x + 5 = 12, qual é o valor de x?",
      "opcoes": ["7", "10", "17", "22"],
      "resposta_correta": "7",
      "dificuldade": "facil",
      "categoria": "matematica",
      "pontos": 10
    },
    // ... 7 more questions (max 8)
  ]
}
```

**Check Points**:
- [ ] Returns 8 questions from tournament blocks
- [ ] All from "matematica" category
- [ ] Questions are randomized (different order each call)
- [ ] No duplicate questions in same call
- [ ] resposta_correta is hidden (check with developer)

---

## Test Case 6: Browser Console Logs

### Test Name
`FRONTEND_DEBUG_LOGS`

### Steps
1. Open Developer Tools (F12)
2. Go to Console tab
3. Navigate to "Entrar no Torneio"
4. Look for relevant logs

### Expected Console Output
```javascript
// When loading tournament data:
🎯 Torneio específico para: matematica
// OR (for generic):
🌐 Disciplinas genéricas disponíveis: ["Matemática", "Programação"]

// When opening modal:
Modal opened for: Matemática
// or
Modal closed: null

// On enrollment:
Enrolling user: [user_id]
Tournament ID: 61
Discipline: Matemática
```

### Verification Checklist
- [ ] No errors in console
- [ ] No warnings about missing props
- [ ] No network errors (404, 500, etc.)
- [ ] State updates logged correctly
- [ ] Modal states change as expected

---

## Troubleshooting Guide

### Issue 1: Disciplines all show as "Indisponível"

**Possible Causes**:
1. Tournament not returning tipo_torneio
2. Backend not setting tipo_torneio in response
3. Frontend not reading the field correctly

**Debug Steps**:
1. Check API response: `GET /api/torneios/ativo`
2. Verify `tipo_torneio` field exists in response
3. Check browser console for errors
4. Verify database has tipo_torneio set

**Fix**:
```javascript
// In TorneoController.js - ensure field is returned
attributes: ['id', 'titulo', ..., 'tipo_torneio', 'disciplina_especifica']
```

### Issue 2: Badge shows "Genérico" instead of "Específico"

**Possible Causes**:
1. tipo_torneio not saved to database
2. API returning wrong value
3. Admin panel not reading field

**Debug Steps**:
1. Check database: `SELECT tipo_torneio FROM torneios WHERE id = 61;`
2. Check API response from TornamentService
3. Verify TorneiosTab.jsx badge logic (line 195)

**Fix**:
```sql
UPDATE torneios SET tipo_torneio = 'especifico' WHERE id = 61;
```

### Issue 3: User can click "Indisponível" button

**Possible Causes**:
1. onClick handler not properly disabled
2. CSS not applied
3. Event handler not checking isDisciplinaAtiva

**Debug Steps**:
1. Inspect element: check for `disabled` attribute
2. Check CSS classes applied
3. Add console log to onClick handler

**Fix**:
```javascript
<button
  disabled={!torneioAtivo || !isDisciplinaAtiva}
  onClick={() => torneioAtivo && isDisciplinaAtiva && abrirModal(disc)}
>
```

### Issue 4: Modal doesn't appear when clicking "Ver Torneio"

**Possible Causes**:
1. disciplinaSelecionada state not updating
2. AnimatePresence not rendering
3. CSS z-index issue

**Debug Steps**:
1. Check browser console for JS errors
2. Verify disciplinaSelecionada state changes
3. Inspect DOM for modal element
4. Check z-index values (should be 9999+)

**Fix**:
- Check state update: `setDisciplinaSelecionada(disc)`
- Verify AnimatePresence wraps modal
- Set z-index explicitly: `z-[9999]`

---

## Performance Metrics

### Expected Metrics
- Page load: < 2 seconds
- Discipline card hover: Instant (< 16ms)
- Modal open: < 300ms (animation duration)
- API response time: < 500ms

### How to Measure
1. Open DevTools Network tab
2. Disable cache (check "Disable cache")
3. Throttle to 3G (if testing on poor connection)
4. Reload page and observe timings

---

## Acceptance Criteria

### ✅ For Frontend to be Complete

- [ ] Specific tournament shows 3 discipline cards
- [ ] Only selected discipline is active (green, 100% opacity)
- [ ] Other disciplines show "Indisponível" overlay
- [ ] Admin badge shows "Específico (Matemática)" not "Genérico"
- [ ] Clicking active button opens modal
- [ ] Clicking inactive button does nothing
- [ ] User can enroll in specific tournament
- [ ] Quiz loads with correct questions
- [ ] No console errors
- [ ] No XHR failures
- [ ] Responsive design works (mobile/tablet/desktop)

### ✅ For API to be Complete

- [ ] GET /api/torneios/ativo returns tipo_torneio
- [ ] GET /api/torneios/ativo/disciplinas filters correctly
- [ ] GET /api/torneios/:id/blocos includes questions
- [ ] GET /api/questoes/quiz/:area?torneio_id returns tournament questions
- [ ] POST /api/participantes/registrar validates discipline
- [ ] All endpoints return proper status codes
- [ ] Error messages are helpful

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document passing test results
2. Take screenshots for proof
3. Proceed to Phase 3: End-to-End Testing
4. Deploy to production (optional)

### If Tests Fail ❌
1. Document which test failed
2. Check troubleshooting guide
3. Review relevant code section
4. Run Phase 1 setup script again if needed
5. Contact development team with logs

---

## Resources

### Files to Reference
- Frontend: `/FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx`
- Admin: `/FrontEnd/src/Administrador/TorneiosTab.jsx`
- Backend: `/BackEnd/controllers/TorneoController.js`
- Database: Check Tables: `torneios`, `torneio_blocos`, `bloco_questoes_items`

### Useful Curl Commands

**Check Active Tournament**:
```bash
curl http://localhost:3000/api/torneios/ativo
```

**Check Tournament Blocks**:
```bash
curl http://localhost:3000/api/torneios/61/blocos
```

**Load Quiz**:
```bash
curl http://localhost:3000/api/questoes/quiz/matematica?torneio_id=61
```

---

**Testing Status**: 🟢 READY  
**Last Updated**: 2026-06-10  
**Tested By**: [Your Name]  
**Result**: ✅ PASS / ❌ FAIL
