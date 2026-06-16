# Task 16.4: Admin Rejection Flow - Manual Testing Guide

## Overview
This document provides a comprehensive manual testing guide for the admin question rejection flow in the COMAES system. The tests verify that admins can reject pending questions with proper validation, error handling, and feedback.

---

## Pre-Test Setup

### Prerequisites
- ✅ Both frontend and backend servers are running
- ✅ Database is initialized with test data
- ✅ At least one admin user exists (admin@comaes.com / admin123)
- ✅ At least one collaborator user exists (colaborador@comaes.com / senha123)
- ✅ Pending questions are available for testing

### Starting the Application
```bash
# Terminal 1 - Backend
cd BackEnd
npm run dev

# Terminal 2 - Frontend
cd FrontEnd
npm run dev

# Application should be available at http://localhost:5173
```

---

## Test Scenario: Step-by-Step

### ✅ Step 1: Ensure Pending Questions Available

**Action:**
1. Open the application in your browser
2. Login with admin credentials (admin@comaes.com / admin123)
3. Navigate to Admin Dashboard

**Expected Result:**
- Admin is logged in successfully
- Admin has access to the admin panel
- At least one pending question is available for testing

**Verification:**
```
✓ Admin logged in
✓ Admin dashboard visible
✓ Can navigate to question approval section
```

---

### ✅ Step 2-3: Login and Navigation

**Action:**
1. Go to `/admin/questoes/pendentes` (or similar pending questions page)
2. Verify you can see a list of pending questions

**Expected Result:**
- Page loads successfully
- Shows a list of questions with "Rejeitar" button on each
- Questions display: title, description, discipline, difficulty, points
- Two action buttons visible: "Rejeitar" (red) and "Aprovar" (green)

**Example UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ Questões Pendentes                              [Count: 5]  │
├─────────────────────────────────────────────────────────────┤
│ 📚 Matemática | 🎯 Médio | 10 pts | Created: 2 hours ago   │
│ "What is the derivative of x²?"                            │
│ Lorem ipsum dolor sit amet...                              │
│                                              │ Rejeitar│ Aprovar│
└─────────────────────────────────────────────────────────────┘
```

**Verification:**
```
✓ Pending questions list loads
✓ Questions display all required information
✓ "Rejeitar" button visible on each question
✓ List is not empty (at least 1 question available)
```

---

### ✅ Step 4: Click "Rejeitar" Button

**Action:**
1. Click the red "Rejeitar" button on any pending question
2. Observe the modal opening

**Expected Result:**
- A modal dialog opens with:
  - Title: "Rejeitar Questão" (or similar in Portuguese)
  - Red header with icon
  - Question preview showing:
    - Question title
    - Question description (truncated if long)
  - Large textarea for rejection reason
  - Character counter (0/500)
  - Info message about notifying collaborator
  - "Cancelar" and "Rejeitar" buttons at bottom

**Example Modal UI:**
```
┌─ Rejeitar Questão ─────────────────────────────────────────┐
│ Forneça um motivo para a rejeição                      [✕] │
├─────────────────────────────────────────────────────────────┤
│ 📋 QUESTÃO                                                  │
│ "What is the derivative of x²?"                            │
│ This is a calculus problem testing knowledge of ...        │
│                                                             │
│ Motivo da Rejeição *                                       │
│ ┌─────────────────────────────────────────────────────────┐│
│ │                                                         ││
│ │ [Placeholder: Explique o motivo...]                   ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│ 0/500 caracteres                                            │
│                                                             │
│ ℹ️ O colaborador receberá notificação sobre a rejeição    │
│                                                             │
│                                    [Cancelar] [Rejeitar]   │
└─────────────────────────────────────────────────────────────┘
```

**Verification:**
```
✓ Modal opens
✓ Modal shows question preview
✓ Textarea is visible and focused
✓ Character counter shows 0/500
✓ "Rejeitar" button is disabled (grayed out)
✓ Buttons are properly positioned
```

---

### ✅ Step 5-6: Try Submitting Without Motivo

**Action:**
1. Leave the textarea empty
2. Click the "Rejeitar" button
3. Observe what happens

**Expected Result:**
- The button remains disabled (cannot click)
- OR an error message appears saying: "O motivo da rejeição é obrigatório" (The rejection reason is required)
- The form does NOT submit

**Verification:**
```
✓ Empty submission is prevented
✓ Button is disabled or error message shown
✓ Form does not submit with empty motivo
```

**Action (Alternative Test):**
1. Type very short text: "No" (2 characters)
2. Try to click "Rejeitar"

**Expected Result:**
- Button remains disabled
- Error: "O motivo deve ter no mínimo 5 caracteres" (Reason must have at least 5 characters)

**Verification:**
```
✓ Minimum character validation works (5 characters minimum)
```

---

### ✅ Step 7: Fill in Valid Motivo

**Action:**
1. Click in the textarea
2. Type the following reason:
   ```
   Question content is not clear
   ```

**Expected Result:**
- Text appears in textarea
- Error message (if any) disappears
- Character counter updates to: "29/500 caracteres"
- "Rejeitar" button becomes enabled (changes color to bright red, cursor changes to pointer)

**Verification:**
```
✓ Text input works
✓ Character counter updates in real-time
✓ Counter shows "29/500"
✓ "Rejeitar" button is now enabled
✓ Button is clickable
```

---

### ✅ Step 8: Verify Character Counter Works

**Action 1 - Test Normal Text:**
1. Clear the textarea
2. Type: "This is a test message about question clarity"
3. Observe character counter

**Expected Result:**
```
Character count: "43/500"
```

**Verification:**
```
✓ Counter updates in real-time
✓ Counter shows correct count
```

**Action 2 - Test Approaching Limit:**
1. Clear textarea
2. Paste this text (450 characters):
   ```
   Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
   ```
3. Observe character counter

**Expected Result:**
```
Character count: "450/500"
Counter should be orange/yellow warning color (approaching limit)
```

**Verification:**
```
✓ Counter shows 450/500
✓ Warning color appears when approaching limit
```

**Action 3 - Test Maximum Limit:**
1. Try to paste or type more text to exceed 500 characters
2. Observe behavior

**Expected Result:**
- Input is prevented from exceeding 500 characters
- Character counter shows: "500/500"
- No more characters can be added

**Verification:**
```
✓ Cannot exceed 500 character limit
✓ Counter shows maximum 500/500
```

---

### ✅ Step 9: Click Confirm/Submit

**Action:**
1. Ensure motivo is filled: "Question content is not clear"
2. Click the red "Rejeitar" button

**Expected Result:**
- Button shows loading state (spinner animation or "Rejeitando..." text)
- Modal remains open briefly
- API request is sent to backend

**Verification:**
```
✓ Button shows loading state
✓ Modal stays open during processing
✓ No errors appear
```

---

### ✅ Step 10: Verify API Call

**Action:**
1. Open browser Developer Tools (F12 or Right-click > Inspect)
2. Go to Network tab
3. Repeat rejection process
4. Look for the API call

**Expected Result:**
- Network tab shows a request to: `PUT /api/questoes/:id/rejeitar`
- Request headers include: `Authorization: Bearer [token]`
- Request body includes:
  ```json
  {
    "motivo_rejeicao": "Question content is not clear"
  }
  ```
- Response status: 200 OK
- Response body includes updated question data

**Example Network Request:**
```
Method: PUT
URL: http://localhost:3001/api/questoes/42/rejeitar
Status: 200 OK

Request Body:
{
  "motivo_rejeicao": "Question content is not clear"
}

Response Body:
{
  "sucesso": true,
  "mensagem": "Questão rejeitada com sucesso",
  "dados": {
    "id": 42,
    "titulo": "What is the derivative of x²?",
    "status_aprovacao": "rejeitada",
    "motivo_rejeicao": "Question content is not clear",
    "revisado_por": 1,
    "revisado_em": "2025-06-15T10:30:45.123Z",
    ...
  }
}
```

**Verification:**
```
✓ API endpoint is correct: PUT /api/questoes/:id/rejeitar
✓ Request includes motivo_rejeicao
✓ Response status is 200 OK
✓ Response is successful (sucesso: true)
```

---

### ✅ Step 11: Verify Response Updates

**Action:**
1. Observe the API response in the Network tab
2. Check each field in the response

**Expected Results:**

**11a - Status Changed to 'rejeitada':**
```json
"status_aprovacao": "rejeitada"
```

**11b - Motivo Stored:**
```json
"motivo_rejeicao": "Question content is not clear"
```

**11c - Reviewed By Admin:**
```json
"revisado_por": 1  // Admin's ID
```

**11d - Timestamp Set:**
```json
"revisado_em": "2025-06-15T10:30:45.123Z"  // Current timestamp
```

**Verification:**
```
✓ status_aprovacao = 'rejeitada'
✓ motivo_rejeicao = "Question content is not clear"
✓ revisado_por = [admin's user ID]
✓ revisado_em = [current timestamp in ISO format]
✓ All fields present in response
```

---

### ✅ Step 12: Verify Question Disappears from Pending List

**Action:**
1. After rejection is complete, modal closes
2. Return to the pending questions list
3. Look for the rejected question

**Expected Result:**
- Modal closes automatically
- Toast notification appears: "Questão rejeitada." (success message)
- The rejected question no longer appears in the pending list
- The question count decreases by 1
- If this was the last pending question, an empty state message appears

**Example Result:**
```
BEFORE:
┌─────────────────────────────────────────────┐
│ Questões Pendentes         [5 pending]     │
├─────────────────────────────────────────────┤
│ ✓ Question 1
│ ✓ Question 2
│ ✓ Question 3 (just rejected - GONE)
│ ✓ Question 4
│ ✓ Question 5
└─────────────────────────────────────────────┘

AFTER:
┌─────────────────────────────────────────────┐
│ Questões Pendentes         [4 pending]     │
├─────────────────────────────────────────────┤
│ ✓ Question 1
│ ✓ Question 2
│ ✓ Question 4
│ ✓ Question 5
└─────────────────────────────────────────────┘
```

**Verification:**
```
✓ Question removed from list immediately
✓ Count decreases (5 → 4)
✓ List refreshes automatically
✓ Toast notification confirms rejection
```

---

### ✅ Step 13: Verify Collaborator Sees Rejection

**Action:**
1. Logout from admin account
2. Login as collaborator (colaborador@comaes.com / senha123)
3. Navigate to "Minhas Questões" (My Questions)
4. Find the rejected question

**Expected Result:**
- Collaborator can see the rejected question
- Status badge shows: "Rejeitada" (Rejected) in RED
- When clicking on the question or viewing details, the rejection reason is visible:
  ```
  "Motivo da Rejeição: Question content is not clear"
  ```
- All rejection metadata is displayed:
  - Status: Rejeitada
  - Reviewed by: [Admin name or ID]
  - Reviewed at: [Timestamp]
  - Reason: [Motivo text]

**Example UI in MinhasQuestões:**
```
┌─────────────────────────────────────────────────────────────┐
│ Minhas Questões                                             │
├─────────────────────────────────────────────────────────────┤
│ "What is the derivative of x²?"                            │
│ [REJEITADA] (red badge)                                    │
│ Created: 2 hours ago                                        │
│                              [View] [Edit] [Delete]         │
│                                                             │
│ 📋 Detalhes:                                               │
│ Motivo: Question content is not clear                      │
│ Revisado por: Admin (2025-06-15 10:30 AM)                 │
└─────────────────────────────────────────────────────────────┘
```

**Verification:**
```
✓ Question visible in Minhas Questões
✓ Status shows "Rejeitada"
✓ Red badge/indicator present
✓ Rejection reason visible: "Question content is not clear"
✓ Timestamp of review visible
✓ Admin name/ID visible
```

---

## Success Criteria Summary

| Criterion | Status | Notes |
|-----------|--------|-------|
| Rejection requires motivo_rejeicao | ✅ | Cannot submit without valid reason |
| Validation prevents empty submission | ✅ | Button disabled until valid text |
| Status changes to 'rejeitada' | ✅ | API response shows correct status |
| Motivo is stored correctly | ✅ | Exact text preserved in database |
| Question no longer in pending list | ✅ | Immediately removed after rejection |
| Character limit enforced (max 500) | ✅ | Input capped at 500 characters |
| Collaborator sees rejection | ✅ | Visible in MinhasQuestões page |

---

## Common Issues & Troubleshooting

### Issue: Modal doesn't open when clicking "Rejeitar"
**Solution:**
- Check browser console for JavaScript errors
- Verify RejectModal component is properly imported
- Check that question ID is correctly passed to modal

### Issue: Character counter not updating
**Solution:**
- Verify the Counter component is rendering
- Check that handleTextareaChange is properly bound
- Look for React re-render issues

### Issue: Button never becomes enabled
**Solution:**
- Check minimum character validation (should be 5+)
- Verify motivo state is updating correctly
- Check button disabled condition logic

### Issue: API request fails with 401
**Solution:**
- Verify admin token is valid
- Check Authorization header in request
- May need to re-login

### Issue: API request fails with 422
**Solution:**
- Check API validation on backend
- Verify motivo_rejeicao is being sent in request body
- Check for validation rules in questoesService.rejeitar()

### Issue: Question still appears in pending list after rejection
**Solution:**
- Verify API response was successful (200 OK)
- Check if list is automatically refreshing
- Try manual page refresh (F5)
- Check Redux/Context state management

### Issue: Collaborator can't see rejection reason
**Solution:**
- Verify motivo_rejeicao was saved in database
- Check that collaborator's query includes status_aprovacao filter
- Verify MinhasQuestoes component displays rejection info

---

## Test Data

### Test Question Template
```javascript
{
  titulo: "What is the derivative of x²?",
  descricao: "A calculus problem testing knowledge of derivatives",
  disciplina: "matematica",
  tipo: "multipla_escolha",
  dificuldade: "medio",
  opcoes: ["2x", "x", "2", "x²"],
  resposta_correta: "2x",
  explicacao: "Using power rule: d/dx(x²) = 2x",
  pontos: 10,
  status_aprovacao: "pendente"
}
```

### Test Rejection Reasons
- "Question content is not clear"
- "Please add more context to the problem"
- "Typo found in the question statement"
- "The correct answer is ambiguous"
- "Image/formula quality is poor"

---

## Performance Notes

- Rejection should complete within 1-2 seconds
- List should update immediately after rejection
- Character counter should update without lag
- Modal should be responsive to user input

---

## Sign-Off

**Tested By:** [Your Name]  
**Date:** [Date]  
**Duration:** [Time spent]  
**Status:** [Pass/Fail]  
**Notes:** [Any additional observations]

---

## Appendix: API Reference

### Endpoint: PUT /api/questoes/:id/rejeitar

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "motivo_rejeicao": "String (required, min 5 chars, max 500 chars)"
}
```

**Success Response (200 OK):**
```json
{
  "sucesso": true,
  "mensagem": "Questão rejeitada com sucesso",
  "dados": {
    "id": 42,
    "titulo": "Question title",
    "descricao": "Question description",
    "status_aprovacao": "rejeitada",
    "motivo_rejeicao": "Provided reason",
    "revisado_por": 1,
    "revisado_em": "2025-06-15T10:30:45.123Z",
    "status_aprovacao_anterior": "pendente"
  }
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "sucesso": false,
  "mensagem": "O motivo da rejeição é obrigatório"
}
```

**Error Response (404 Not Found):**
```json
{
  "sucesso": false,
  "mensagem": "Questão com ID 42 não encontrada"
}
```

**Error Response (403 Forbidden):**
```json
{
  "sucesso": false,
  "mensagem": "Você não tem permissão para rejeitar esta questão"
}
```

---

END OF TEST GUIDE
