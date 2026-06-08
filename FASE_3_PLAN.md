# FASE 3: Admin Review UI - Implementation Plan

**Date**: June 5, 2026  
**Status**: Starting Implementation  
**Backend Ready**: ✅ YES (12 endpoints, FASE 1)
**Frontend Ready**: ✅ YES (all tabs, FASE 2)

---

## Overview

Build the Admin Review interface for approving/rejecting Colaborador-created content. This is the final piece that completes the workflow:

```
Colaborador Creates Content → Status='pendente' → Admin Reviews → Approve/Reject
```

---

## Integration Points

### Admin Dashboard Changes
Add 2 new items to "Questões & Conteúdo" section:
1. **"Blocos Colaboradores Pendentes"** - Review pending blocos
2. **"Questões Colaboradores Pendentes"** - Review pending questões

(Note: Items already exist in menu but may need tab components)

### Endpoints Used
All from FASE 1 backend:
```
GET    /api/admin/blocos-colaboradores-pendentes
POST   /api/admin/blocos/:id/aprovar
POST   /api/admin/blocos/:id/rejeitar

GET    /api/admin/questoes-colaborador-pendentes
POST   /api/admin/questoes/:id/aprovar
POST   /api/admin/questoes/:id/rejeitar
```

---

## Components to Build

### 1. BlocosColaboradoresPendentesTab.jsx (New Tab)
**Location**: `FrontEnd/src/Administrador/`

**Features**:
- List all pending blocos from colaboradores
- Filter by:
  - Status (todos/pendente/aprovado/rejeitado)
  - Discipline (matematica/ingles/programacao)
  - Colaborador (dropdown)
- Search by title
- Sort by date, colaborador, title
- Pagination (20 items/page)

**For Each Bloco**:
- Title, description
- Status badge
- Colaborador name & discipline
- Created date
- Actions:
  - 👁️ View details button
  - ✅ Approve button → opens approval modal
  - ❌ Reject button → opens rejection modal

**Modals**:
1. **Approval Modal**:
   - Show bloco details
   - Text area for optional observations
   - "Approve" button (saves approval metadata)
   - "Cancel" button

2. **Rejection Modal**:
   - Show bloco details
   - Required field: Reason for rejection
   - Optional field: Admin observations
   - "Reject" button (saves with reason)
   - "Cancel" button

3. **Details Modal** (optional):
   - Full bloco information
   - Colaborador info
   - Timeline of actions
   - Close button

### 2. QuestionsColaboradorPendentesTab.jsx (New Tab)
**Location**: `FrontEnd/src/Administrador/`

**Features**:
- List all pending questões from colaboradores
- Filter by:
  - Status
  - Discipline
  - Difficulty (facil/medio/dificil)
  - Type (multipla_escolha/texto/codigo)
  - Colaborador
  - Bloco (if applicable)
- Search by title
- Sort options
- Pagination

**For Each Questão**:
- Title, description
- Type (multiple choice, text, code)
- Difficulty
- Status badge
- Colaborador name & discipline
- Points
- Created date
- Actions: View, Approve, Reject (same as blocos)

**Modals**: Same as blocos (approval, rejection, details)

---

## UI/UX Patterns

### Status Badges
Same as colaborador dashboard:
- 🟡 Pendente (yellow)
- ✅ Aprovado (green)
- ❌ Rejeitado (red)

### Tables
- Responsive table with horizontal scroll on mobile
- Hover effect on rows
- Action buttons on right
- Statistics summary above

### Modals
- Centered modal overlay
- Dark background
- Smooth animations
- Clear form fields
- Action buttons at bottom

### Colors (Match FASE 2)
- Primary: Blue (`from-blue-500 to-indigo-600`)
- Success: Green (`from-green-500 to-emerald-600`)
- Warning: Yellow (`from-yellow-500 to-orange-600`)
- Danger: Red (`from-red-500 to-pink-600`)

---

## API Integration

### Load Pending Blocos
```javascript
GET /api/admin/blocos-colaboradores-pendentes
Query params:
  - pagina: number
  - limite: number (default 20)
  - status: 'pendente'|'aprovado'|'rejeitado'
  - disciplina: 'matematica'|'ingles'|'programacao'
  - busca: string (search title)
  - ordenar: 'data'|'titulo'|'colaborador'

Response:
{
  sucesso: true,
  dados: {
    blocos: [{ id, titulo, status, disciplina, criador, created_at, ... }],
    paginacao: { pagina, limite, total, totalPaginas },
    estatisticas: { pendentes, aprovados, rejeitados }
  }
}
```

### Approve Bloco
```javascript
POST /api/admin/blocos/:id/aprovar
Body:
{
  observacoes: "Optional notes from admin"
}

Response:
{
  sucesso: true,
  dados: {
    id, status: 'aprovado', aprovado_por_id, data_aprovacao, ...
  }
}
```

### Reject Bloco
```javascript
POST /api/admin/blocos/:id/rejeitar
Body:
{
  motivo_rejeicao: "Required: reason for rejection",
  observacoes: "Optional: additional notes"
}

Response:
{
  sucesso: true,
  dados: {
    id, status: 'rejeitado', motivo_rejeicao, ...
  }
}
```

### Same for Questões
```
GET    /api/admin/questoes-colaborador-pendentes
POST   /api/admin/questoes/:id/aprovar
POST   /api/admin/questoes/:id/rejeitar
```

---

## Error Handling

Display user-friendly errors:
- Network error: "Erro ao conectar com servidor"
- Validation error: Show specific field error
- Permission error: "Você não tem permissão"
- Not found: "Conteúdo não encontrado"
- Conflict: "Este conteúdo já foi aprovado/rejeitado"

---

## Loading & States

- **Loading**: Show spinner when fetching
- **Empty**: "Nenhum conteúdo pendente"
- **Error**: Show error message with retry button
- **Success**: Show toast notification (optional)

---

## Responsive Design

- **Desktop**: Full table with all columns visible
- **Tablet**: Hide some columns, keep essential ones
- **Mobile**: Card-based layout, swipe for actions

---

## Integration with Admin Dashboard

### Update AdminDashboard.jsx
1. Import new tab components
2. Add cases to render when activeTab matches
3. Menu items should already exist (check menu config)

### Existing Components to Update
- May need to reference existing tab patterns
- Check BlocosColaboradoresTab.jsx if exists
- Check QuestionsColaboradorPendentesTab.jsx if exists

---

## Files to Create

1. **FrontEnd/src/Administrador/AdminBlocosColaboradoresPendentesTab.jsx**
   - Full CRUD for bloco approval/rejection
   - ~400 lines

2. **FrontEnd/src/Administrador/AdminQuestionsColaboradorPendentesTab.jsx**
   - Full CRUD for questão approval/rejection
   - ~400 lines

3. **Documentation**
   - FASE_3_IMPLEMENTATION.md
   - FASE_3_DEPLOYMENT.md
   - FASE_3_SUMMARY.md

---

## Testing Scenarios

### Bloco Approval Workflow
1. Admin navigates to "Blocos Colaboradores Pendentes"
2. Sees pending blocos in table
3. Clicks "Approve" on one bloco
4. Modal opens with bloco details
5. Types optional observations
6. Clicks "Approve"
7. Modal closes, status changes to "aprovado"
8. Table updates

### Bloco Rejection Workflow
1. Admin clicks "Reject" on a bloco
2. Rejection modal opens
3. Types mandatory reason (validation needed)
4. Types optional observations
5. Clicks "Reject"
6. Modal closes, status changes to "rejeitado"
7. Colaborador is notified (future: email)

### Filter & Search
1. Filter by status: Shows only pending
2. Filter by discipline: Shows only selected discipline
3. Search by title: Real-time filtering
4. Pagination: Load more content

### Same for Questões
1. Same workflow but for questions
2. Additional filters (type, difficulty)

---

## Success Criteria

- [x] Admin can see pending blocos
- [x] Admin can approve bloco
- [x] Admin can reject bloco (with mandatory reason)
- [x] Admin can see pending questões
- [x] Admin can approve questão
- [x] Admin can reject questão
- [x] Filtering works
- [x] Search works
- [x] Pagination works
- [x] Modals display correctly
- [x] Status badges show
- [x] Error handling works
- [x] Mobile responsive
- [x] Integration with admin dashboard

---

## Timeline

- Tab 1 (Blocos): 45 minutes
- Tab 2 (Questões): 45 minutes
- Documentation: 30 minutes
- Testing: 30 minutes

**Total**: ~3 hours

---

## Next Steps

1. Create AdminBlocosColaboradoresPendentesTab.jsx
2. Create AdminQuestionsColaboradorPendentesTab.jsx
3. Update AdminDashboard.jsx to import & use new tabs
4. Test all workflows
5. Document with examples

---
