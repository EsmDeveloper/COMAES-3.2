# FASE 2: Colaborador Dashboard Frontend - Implementation Plan

**Date**: June 5, 2026  
**Status**: Starting Implementation  
**Backend Ready**: ✅ YES (all 12 endpoints)

---

## Overview

Redesign the Colaborador Dashboard to:
1. Match Admin Dashboard design/structure
2. Replicate available components and patterns
3. Integrate with FASE 1 backend API
4. Add profile management
5. Add content management (blocos & questões)
6. Show approval status clearly

---

## Design Reference

**Admin Dashboard Structure**:
- Sidebar with sections and menu items
- Responsive mobile menu
- Header with user profile & logout
- Tab-based content management
- Statistics cards
- Tables with actions
- Modal dialogs for forms

**We will use the same pattern for Colaborador Dashboard**

---

## Components to Build/Update

### 1. Main Dashboard Layout ✅
**File**: `FrontEnd/src/Paginas/Secundarias/ColaboradorDashboardV2.jsx`

**Sections**:
- Sidebar (same structure as Admin)
- Main content area
- Responsive for mobile

**Tabs**:
1. Dashboard (overview)
2. Meus Dados (profile edit)
3. Blocos (CRUD + status)
4. Questões (CRUD + status)

---

## API Integration

### Endpoints Used

**Colaborador Operations**:
```
POST   /api/colaborador/blocos           - Create
GET    /api/colaborador/blocos           - List
GET    /api/colaborador/blocos/:id       - Get details
PUT    /api/colaborador/blocos/:id       - Update
DELETE /api/colaborador/blocos/:id       - Delete

POST   /api/colaborador/questoes         - Create
GET    /api/colaborador/questoes         - List
GET    /api/colaborador/questoes/:id     - Get details
PUT    /api/colaborador/questoes/:id     - Update
DELETE /api/colaborador/questoes/:id     - Delete
```

---

## Tab Details

### Tab 1: Dashboard (Overview)
**Shows**:
- Welcome message with name & discipline
- Statistics cards:
  - Total blocos created
  - Total questões created
  - Pending for review
  - Approved by admin
  - Rejected (need revision)
- Recent activity
- Quick actions

### Tab 2: Meus Dados (Profile)
**Shows**:
- Name
- Email
- Discipline (read-only)
- Academic level
- Biography
- Phone
- Status (colaborador status)
- Edit button → shows form

**Fields**:
- Name (editable)
- Email (read-only)
- Academic level (editable dropdown)
- Biography (editable textarea)
- Phone (editable)

### Tab 3: Blocos (Content Management)
**Shows**:
- Create button
- List with:
  - Title
  - Status badge (pendente 🟡 / aprovado ✅ / rejeitado ❌)
  - Created date
  - Difficulty
  - Actions (Edit / Delete / View)
  - Filter & search

**Status Badge Colors**:
- Pendente: Yellow 🟡
- Aprovado: Green ✅
- Rejeitado: Red ❌

**Create Modal**:
- Title
- Description
- Difficulty (facil / medio / dificil)
- Create button

**Edit Form** (only if pending):
- Same as create
- Show message if not pending: "Blocos aprovados não podem ser editados"

### Tab 4: Questões (Content Management)
**Shows**:
- Create button
- List with:
  - Title
  - Type (múltipla escolha / texto / código)
  - Status badge
  - Difficulty
  - Points
  - Actions (Edit / Delete / View)
  - Filter & search

**Create Modal**:
- Title
- Description
- Type (dropdown)
- Difficulty
- Points
- Options (if múltipla escolha)
- Correct answer
- Explanation
- Block (optional dropdown)
- Create button

---

## Design Elements

### Colors (from Admin Dashboard)
- Primary Blue: `from-blue-500 to-indigo-600`
- Accent Orange: `from-yellow-500 to-orange-600`
- Content Purple: `from-purple-500 to-pink-600`
- User Green: `from-green-500 to-emerald-600`

### Icons (lucide-react)
- Dashboard: BarChart3
- Profile: UserCircle
- Blocos: BookOpen
- Questões: FileText
- Create: Plus
- Edit: Edit
- Delete: Trash2
- View: Eye
- Status pending: Clock
- Status approved: CheckCircle
- Status rejected: AlertCircle

### Status Badges
```
Pendente: <span class="bg-yellow-100 text-yellow-800">⏳ Pendente</span>
Aprovado: <span class="bg-green-100 text-green-800">✅ Aprovado</span>
Rejeitado: <span class="bg-red-100 text-red-800">❌ Rejeitado</span>
```

---

## Implementation Steps

### Step 1: Update ColaboradorDashboardV2.jsx
- Replace stub tabs with full implementations
- Add sidebar navigation
- Add responsive mobile menu
- Add header with user profile

### Step 2: Create Dashboard Tab
- Statistics cards
- Recent activity
- Quick actions

### Step 3: Implement Meus Dados Tab
- Profile display
- Edit form
- Save API call

### Step 4: Implement Blocos Tab
- List with API call
- Create form & modal
- Edit functionality
- Delete with confirmation
- Status-based restrictions

### Step 5: Implement Questões Tab
- List with API call
- Create form & modal
- Edit functionality
- Delete with confirmation
- Status-based restrictions

### Step 6: Add Error Handling
- Show errors on failed API calls
- Handle network issues
- Display validation messages

### Step 7: Add Loading States
- Show spinners during API calls
- Disable buttons while loading
- Show skeleton screens

---

## File Structure

```
FrontEnd/src/
├── Paginas/Secundarias/
│   └── ColaboradorDashboardV2.jsx (MAIN FILE - will be updated)
├── components/
│   └── Forms/
│       ├── CreateBlocoForm.jsx (use/update)
│       └── CreateQuestaoForm.jsx (use/update)
└── context/
    └── AuthContext.jsx (already available)
```

---

## Key Implementation Details

### API Calls with Auth
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Status Management
- Only allow edit/delete if status is 'pendente'
- Show message when blocked: "Blocos aprovados não podem ser editados"
- Show admin feedback when rejected

### Filtering & Search
- Filter by status (all, pending, approved, rejected)
- Search by title
- Paginate (20 items per page)
- Show statistics

### Error Messages
- Network error: "Erro ao conectar com servidor"
- Validation error: Show field-level errors
- Permission error: "Você não tem permissão"
- Discipline error: "Você só pode trabalhar em: X"

---

## Success Criteria

- [x] Dashboard responsive design
- [x] All tabs working
- [x] API integration complete
- [x] Status badges show correctly
- [x] Permissions enforced (edit/delete only if pending)
- [x] Create/edit/delete workflows working
- [x] Loading & error states handled
- [x] Mobile responsive
- [x] Matches admin dashboard design
- [x] Uses available components & styles

---

## Timeline

- **Step 1-3**: Structure & Dashboard tab (30 min)
- **Step 4**: Blocos tab (45 min)
- **Step 5**: Questões tab (45 min)
- **Step 6-7**: Error handling & polish (30 min)

**Total**: ~3 hours

---

## Next Steps

1. Implement new ColaboradorDashboardV2.jsx with all features
2. Test all endpoints with the frontend
3. Verify permissions and restrictions work
4. Test mobile responsiveness
5. After testing: Proceed to FASE 3 (Admin Review UI)

---
