# Task 13: Root Cause Analysis - Question Grouping 422 Error

## Problem Summary
Users were experiencing a 422 Unprocessable Entity error when trying to group questions into blocks in the Admin panel. The error message indicated:
```
Questão de disciplina "programacao" não pode ser adicionada a bloco de disciplina "matematica"
```

However, the frontend validation showed the question and block **were compatible** (both matematica).

## Root Cause: ID Collision Between Two Database Tables

### The Discovery
Investigation revealed a critical ID collision between two question models:

#### QuestaoTesteConhecimento Table
- Contains: 2 questions (IDs 1-2)
- Both have `categoria='matematica'`

#### Questao Table (new unified model)
- Contains: 10 questions (IDs 1-10)
- Mix of categories: programacao, ingles, matematica, etc.

**ID Conflict**: Questions with IDs 1 and 2 exist in BOTH tables with DIFFERENT categories!
- ID=1: `categoria='matematica'` in QuestaoTesteConhecimento
- ID=1: `disciplina='programacao'` in Questao

### How the Bug Occurred
1. Frontend calls `/api/teste-conhecimento/questoes` → gets QuestaoTesteConhecimento records (ID=1, categoria='matematica')
2. User clicks "Group in Block" button → modal shows "teste0 questões · MATEMATICA" ✅ compatible
3. User clicks on a compatible block (matematica)
4. Frontend sends `POST /api/blocos/11/questoes` with `{ questao_id: 1 }`
5. Backend's `adicionarQuestao()` function looks up `questao_id=1`
6. **Bug**: Backend was checking Questao model FIRST (wrong priority)
7. Backend finds ID=1 in Questao table → `disciplina='programacao'`
8. Validation fails: "programacao" ≠ "matematica" → 422 error
9. Frontend remains stuck showing the "compatible" message

### Why This Happened
The backend controller had the lookup order reversed:
```javascript
// WRONG (previous code)
let questao = await Questao.findByPk(questao_id); // Checked this FIRST
if (!questao) {
  questao = await QuestaoTesteConhecimento.findByPk(questao_id); // Checked this SECOND
}
```

## Solution Implemented

### Backend Fix (BlocosController.js)
Reversed the lookup priority to check QuestaoTesteConhecimento first:

```javascript
// CORRECT (new code)
let questao = await QuestaoTesteConhecimento.findByPk(questao_id); // Check this FIRST
if (!questao) {
  questao = await Questao.findByPk(questao_id); // Check this SECOND if not found
}
```

**Rationale**: Since the frontend fetches from `/api/teste-conhecimento/questoes`, when it sends a `questao_id`, that ID is definitely from the QuestaoTesteConhecimento table. We should check that model first.

### Frontend Improvements
1. **Added useCallback wrapper** for question selection onClick handler
   - Prevents potential React closure issues
   - Ensures correct `questaoSelecionada` state is captured

2. **Enhanced logging** showing complete question object:
   ```javascript
   console.log(`Questão selecionada objeto completo:`, JSON.stringify(questaoSelecionada, null, 2));
   ```

3. **Added error diagnostics** to help identify future mismatches:
   ```javascript
   console.error(`⚠️ MISMATCH DETECTADO: Frontend enviou questao_id=${questaoSelecionada.id}, 
     categoria="${questaoSelecionada.categoria}"`)
   ```

## Long-term Recommendations

### 1. Fix ID Conflicts
To prevent this in the future, ensure unique ID ranges:
- QuestaoTesteConhecimento: IDs 1000-1999
- Questao: IDs 2000+ (or start from current max + buffer)
- Use auto_increment offset in database

### 2. Implement Model Discrimination
The frontend should include a model hint when sending requests:
```javascript
POST /api/blocos/11/questoes
{
  questao_id: 1,
  model: "test_knowledge"  // NEW: specify which model
}
```

### 3. Database Cleanup
Run a data migration to:
1. Clear duplicate/conflicting IDs from one table
2. Reassign IDs with proper ranges
3. Update all foreign keys accordingly

### 4. API Design Review
Consider separate endpoints for different question types:
- `POST /api/blocos/:id/questoes/teste-conhecimento` (for test questions)
- `POST /api/blocos/:id/questoes/unificadas` (for unified questions)

## Files Changed
- `BackEnd/controllers/BlocosController.js` - Fixed lookup priority in `adicionarQuestao()`
- `FrontEnd/src/Administrador/QuestoesTestesTab.jsx` - Added useCallback and enhanced logging
- `BackEnd/scripts/debugAllQuestoes.js` - NEW: Debug script to detect ID conflicts
- `BackEnd/scripts/debugQuestoes.js` - NEW: Debug script to list database questions

## Testing Steps
1. ✅ Build frontend successfully
2. Login as admin
3. Navigate to "Questões dos Testes" → "Gerenciar Blocos"
4. Create or select a block (e.g., matematica)
5. In "Visualizar Todas" tab, click green "Layers" button on a matematica question
6. Select the matematica block → should succeed
7. Check browser console for detailed logs showing correct model lookups

## Status
✅ **FIXED** - Ready for testing
