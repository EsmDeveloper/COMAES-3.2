# Task 16.3: Admin Approval Flow - Complete Test Guide

**Objective:** Test the complete admin question approval workflow

**Test Date:** [Record date of execution]  
**Tester:** [Record tester name]

---

## Pre-Test Checklist

- [ ] Backend server is running (`npm run dev` or `npm start`)
- [ ] Frontend application is accessible
- [ ] Database contains test data
- [ ] Admin user account exists
- [ ] Collaborator user account exists
- [ ] At least 2-3 pending questions exist in the database

### Quick Setup (if needed)

If you don't have test data, run:
```bash
cd BackEnd
node seed_dados_teste.js  # Or appropriate seed script
```

---

## Test Scenario 1: Login as Admin

### Steps:
1. Navigate to application login page
2. Enter admin credentials:
   - **Email:** admin@test.com (or your admin account)
   - **Password:** [admin password]
3. Click "Login"

### Expected Results:
- ✅ Login successful
- ✅ Redirected to admin dashboard
- ✅ Navigation menu shows "Aprovar Questões" option
- ✅ No error messages displayed

### Test Result: **[ ] PASS [ ] FAIL**

**Notes:** _______________________________________________________________

---

## Test Scenario 2: Navigate to Pending Questions Page

### Steps:
1. From admin dashboard, locate the navigation menu
2. Click on "Aprovar Questões" or navigate to `/admin/questoes/pendentes`

### Expected Results:
- ✅ Page loads successfully
- ✅ Page title shows "Aprovar Questões" or similar
- ✅ Pending questions list is displayed
- ✅ Loading indicators disappear

### Test Result: **[ ] PASS [ ] FAIL**

**Notes:** _______________________________________________________________

---

## Test Scenario 3: Verify Pending Questions Display

### Steps:
1. On the Pending Questions page, observe the displayed questions
2. For each question card, verify the following information is present:

### Expected Display Fields:

**For each question card:**
- [ ] Question Title (clear and visible)
- [ ] Author Name (collaborator name)
- [ ] Author Email (collaborator email)
- [ ] Question Description/Preview
- [ ] Discipline Badge (e.g., "Matemática")
- [ ] Difficulty Badge (e.g., "Fácil")
- [ ] Preview Button
- [ ] Approve Button (green, with checkmark icon)
- [ ] Reject Button (red, with X icon)
- [ ] Created Date

### Detailed Verification:

**Click "Preview" or "Visualizar" button** for at least one question:
- [ ] Modal/Dialog opens
- [ ] Full question details are displayed:
  - [ ] Question title
  - [ ] Full description
  - [ ] All answer options (for multiple choice)
  - [ ] Correct answer marked/highlighted
  - [ ] Points value
  - [ ] Explanation (if available)
  - [ ] Discipline and difficulty
  - [ ] Question type (Multiple Choice, Text, Code)

**Close the preview modal** and return to the list

### Test Result: **[ ] PASS [ ] FAIL**

**Count of pending questions:** ___________

**Notes:** _______________________________________________________________

---

## Test Scenario 4: Approve a Question

### Steps:
1. Select one pending question from the list
2. **BEFORE clicking Approve:** Note the following:
   - Question ID: ________________________
   - Question Title: ________________________
   - Question Author: ________________________
3. Click the **"Aprovar" (Approve)** button
4. Wait for the response

### Expected Results - Immediate:
- ✅ Button shows loading state (spinner)
- ✅ Success toast/notification appears
- ✅ Notification message contains "aprovada com sucesso" or similar
- ✅ Question card disappears from the pending list
- ✅ Total pending count decreases by 1

### API Verification:
**Check browser Network tab (F12 > Network):**
- [ ] Request: `PUT /api/questoes/{id}/aprovar`
- [ ] Response Status: **200 OK**
- [ ] Response includes:
  ```json
  {
    "sucesso": true,
    "mensagem": "Questão aprovada com sucesso",
    "dados": {
      "id": "{question_id}",
      "status_aprovacao": "aprovada",
      "revisado_por": "{admin_user_id}",
      "revisado_em": "{timestamp}"
    }
  }
  ```

### Verify Response Details:
- [ ] `status_aprovacao` = **"aprovada"**
- [ ] `revisado_por` = Your admin user ID (not empty, not null)
- [ ] `revisado_em` = Current timestamp in valid ISO format

**Timestamp Format:** 2024-01-15T10:30:45.123Z  
**Your Admin ID:** ________________________

### Test Result: **[ ] PASS [ ] FAIL**

**Question ID Approved:** ________________________  
**Approval Time:** ________________________

**Notes:** _______________________________________________________________

---

## Test Scenario 5: Verify Question Removed from Pending List

### Steps:
1. Refresh the page (F5 or Cmd+R)
2. Or wait a few seconds and check if the page auto-updates
3. Verify that the approved question is **no longer** in the pending list

### Expected Results:
- ✅ Previously approved question is not displayed
- ✅ List only shows remaining pending questions
- ✅ Total count reflects the removal (was N, now N-1)
- ✅ No errors on page refresh

### Test Result: **[ ] PASS [ ] FAIL**

**Remaining pending count:** ___________

**Notes:** _______________________________________________________________

---

## Test Scenario 6: Search for Approved Question in Collaborator View

### Steps:
1. **Logout** from admin account (click profile menu > Logout)
2. **Login as the collaborator** whose question was just approved:
   - **Email:** colab@test.com (or the collaborator account)
   - **Password:** [collaborator password]
3. Navigate to **"Minhas Questões"** page
4. **Search/Find** the question that was just approved

### Expected Results on Collaborator View:
- ✅ Page loads successfully
- ✅ Approved question appears in the list
- ✅ Status shows **"Aprovada"** (in a green badge)
- ✅ Question can be viewed but may have limited edit options
- ✅ Author name matches collaborator name

### Verify Approved Status Display:
- [ ] Status badge color: **Green** or **Blue**
- [ ] Status text: **"Aprovada"** or **"Approved"**
- [ ] Status is clearly visible and not confused with other statuses
- [ ] Previously pending questions show correct status

### Test Result: **[ ] PASS [ ] FAIL**

**Notes:** _______________________________________________________________

---

## Test Scenario 7: Test Rejection Flow

### Steps:
1. **Login back as admin** (if logged out)
2. Navigate back to "Aprovar Questões"
3. Select another **pending** question (different from the approved one)
4. Click the **"Rejeitar" (Reject)** button

### Expected Results - Modal Appears:
- ✅ Rejection modal/dialog appears
- ✅ Modal shows the question title
- ✅ Modal has a text input field for rejection reason
- ✅ Modal shows placeholder or label: "Reason for rejection" or "Motivo da rejeição"
- ✅ There are two buttons: "Reject"/"Rejeitar" and "Cancel"/"Cancelar"

### Steps (Continued):
5. **Try rejecting WITHOUT reason** (leave field empty):
   - Click "Rejeitar" button
   - Expected: Error message appears saying reason is required

6. **Close the modal** (click X or Cancel)
7. **Click Reject again** for the same question
8. **Enter a rejection reason**, e.g.:
   - "Conteúdo incompleto, faltam opções"
   - "Resposta correta não está clara"
   - "Questão com erros gramaticais"
9. Click "Rejeitar" to confirm

### Expected Results - After Rejection:
- ✅ Success notification appears
- ✅ Message contains "rejeitada com sucesso"
- ✅ Question disappears from pending list
- ✅ Modal closes

### API Verification:
**Check browser Network tab (F12 > Network):**
- [ ] Request: `PUT /api/questoes/{id}/rejeitar`
- [ ] Request body includes:
  ```json
  {
    "motivo_rejeicao": "{your_reason}"
  }
  ```
- [ ] Response Status: **200 OK**
- [ ] Response includes:
  ```json
  {
    "sucesso": true,
    "mensagem": "Questão rejeitada com sucesso",
    "dados": {
      "id": "{question_id}",
      "status_aprovacao": "rejeitada",
      "motivo_rejeicao": "{your_reason}",
      "revisado_por": "{admin_user_id}",
      "revisado_em": "{timestamp}"
    }
  }
  ```

### Verify Rejection Response:
- [ ] `status_aprovacao` = **"rejeitada"**
- [ ] `motivo_rejeicao` = Your entered reason (not empty)
- [ ] `revisado_por` = Your admin user ID
- [ ] `revisado_em` = Valid timestamp

### Test Result: **[ ] PASS [ ] FAIL**

**Rejection Reason:** _______________________________________________________________

**Notes:** _______________________________________________________________

---

## Test Scenario 8: Verify Rejected Status in Collaborator View

### Steps:
1. **Logout** from admin account
2. **Login as the collaborator** (same account as in Scenario 6)
3. Navigate to **"Minhas Questões"**
4. Find the question that was just **rejected**

### Expected Results:
- ✅ Rejected question appears in the list
- ✅ Status shows **"Rejeitada"** or **"Rejected"** (likely in red badge)
- ✅ There's a way to view the rejection reason
  - [ ] Icon to click for details
  - [ ] Tooltip showing reason
  - [ ] Modal showing rejection details
- [ ] Rejection reason is clearly visible:
  - [ ] Displays: "Motivo: [reason]" or similar
  - [ ] Shows admin's reason message

### View Rejection Details:
- [ ] Click icon/button to view reason
- [ ] Reason matches what admin entered
- [ ] Message is clear and helpful to collaborator

### Test Result: **[ ] PASS [ ] FAIL**

**Notes:** _______________________________________________________________

---

## Test Scenario 9: Security & Access Control Tests

### Test 9A: Non-Admin Cannot Approve Questions

### Steps:
1. Create a second collaborator account (if available)
2. Login as this second collaborator
3. Try to access `/admin/questoes/pendentes` directly via URL
4. Or try to access `/api/questoes/pendentes` via API

### Expected Results:
- ✅ Redirected away from admin page
- ✅ Access denied message shown
- ✅ Not able to see pending questions list
- ✅ Not able to call approve/reject APIs

### Test Result: **[ ] PASS [ ] FAIL**

**Notes:** _______________________________________________________________

---

### Test 9B: Non-Logged-In User Cannot Access

### Steps:
1. Logout completely
2. Try to access `/admin/questoes/pendentes`

### Expected Results:
- ✅ Redirected to login page
- ✅ After login with non-admin account, still denied

### Test Result: **[ ] PASS [ ] FAIL**

**Notes:** _______________________________________________________________

---

## Test Scenario 10: Edge Cases

### Test 10A: Try to Approve Same Question Twice

### Steps:
1. Login as admin
2. Go to pending questions
3. Approve a question
4. Immediately refresh page
5. Try to find and approve the same question again

### Expected Results:
- ✅ Question doesn't appear in pending list
- ✅ If somehow attempted via API, returns error: "already approved"

### Test Result: **[ ] PASS [ ] FAIL**

**Notes:** _______________________________________________________________

---

### Test 10B: Try to Approve Non-Existent Question

### Steps:
1. Via browser console or API tool, try to call:
   ```
   PUT /api/questoes/99999/aprovar
   ```
2. Use an ID that doesn't exist

### Expected Results:
- ✅ Response Status: **404 Not Found**
- ✅ Error message: "Questão não encontrada" or similar

### Test Result: **[ ] PASS [ ] FAIL**

**Notes:** _______________________________________________________________

---

## Test Scenario 11: Performance & UX

### Steps:
1. Go to pending questions page with multiple pending questions
2. Test the following:

### Checks:
- [ ] Page loads in < 2 seconds
- [ ] Search/filter works smoothly
- [ ] Pagination works (if applicable)
- [ ] Approve/Reject buttons respond quickly
- [ ] No console errors (F12 > Console)
- [ ] Toast notifications are visible
- [ ] Modal dialogs work properly

### Test Result: **[ ] PASS [ ] FAIL**

**Load Time:** _____________ seconds

**Notes:** _______________________________________________________________

---

## Summary & Results

### Overall Test Result

| Scenario | Result | Notes |
|----------|--------|-------|
| 1. Admin Login | [ ] PASS [ ] FAIL | |
| 2. Navigate to Pending Page | [ ] PASS [ ] FAIL | |
| 3. Verify Display | [ ] PASS [ ] FAIL | |
| 4. Approve Question | [ ] PASS [ ] FAIL | |
| 5. Verify Removal from List | [ ] PASS [ ] FAIL | |
| 6. Check Collaborator View | [ ] PASS [ ] FAIL | |
| 7. Test Rejection | [ ] PASS [ ] FAIL | |
| 8. Verify Rejected Status | [ ] PASS [ ] FAIL | |
| 9A. Security - Non-Admin | [ ] PASS [ ] FAIL | |
| 9B. Security - Not Logged In | [ ] PASS [ ] FAIL | |
| 10A. Double Approval | [ ] PASS [ ] FAIL | |
| 10B. Non-Existent Question | [ ] PASS [ ] FAIL | |
| 11. Performance & UX | [ ] PASS [ ] FAIL | |

---

### Success Criteria Met?

- [ ] **YES** - All tests passed, admin approval flow works correctly
- [ ] **PARTIAL** - Most tests passed, with minor issues
- [ ] **NO** - Multiple failures, approval flow needs fixes

---

### Issues Found

```
Issue #1:
Description: ________________________________________________________________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Steps to Reproduce: ________________________________________________________

Issue #2:
Description: ________________________________________________________________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Steps to Reproduce: ________________________________________________________
```

---

### Tester Information

**Tester Name:** _______________________  
**Date Tested:** _______________________  
**Environment:** 
- [ ] Local Development
- [ ] Staging
- [ ] Production

**Browser:** _______________________  
**OS:** _______________________  

---

### Sign-Off

- [ ] All tests completed
- [ ] Results documented
- [ ] Issues reported

**Tester Signature:** _______________________ **Date:** _______________________

