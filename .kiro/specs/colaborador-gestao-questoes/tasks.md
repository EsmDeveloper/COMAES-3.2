# Implementation Plan: Colaborador - Gestão de Questões

## Overview

This implementation plan details the tasks required to add the "Colaborador" (teacher/professor) role to the COMAES system. The collaborator will have exclusive access to manage questions for their assigned discipline, while admins will have approval/rejection capabilities.

The implementation follows a JavaScript (Node.js/Express) backend with React frontend architecture, maintaining consistency with the existing codebase.

## Tasks

- [x] 1. Set up project structure and core types
  - Review existing User model for role and disciplina_colaborador fields
  - Verify Questao model has status_aprovacao, revisado_por, revisado_em, motivo_rejeicao fields
  - Verify Disciplina model structure
  - _Requirements: 1.1, 1.2, 1.5, 1.6_

- [x] 2. Implement backend authentication enhancements
  - [x] 2.1 Update AuthController to include disciplina_colaborador in JWT payload
    - Modify jwt.sign() to include disciplina_colaborador field
    - Ensure role is included in token payload
    - _Requirements: 1.5, 16.1_
  
  - [x]* 2.2 Write unit tests for AuthController login
    - Test valid credentials return JWT with correct payload
    - Test invalid email returns "Email inválido"
    - Test invalid password returns "Senha incorreta"
    - Test non-existent user returns "Usuário não encontrado"
    - Test password is not included in response
    - _Requirements: 1.2, 1.3, 1.4, 1.6_

- [x] 3. Implement Role-Based Access Control middleware
  - [x] 3.1 Create RoleMiddleware for route protection
    - Create middleware to check user role
    - Implement permission mapping (estudante, colaborador, admin)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [x] 3.2 Create ColaboradorMiddleware for collaborator-specific routes
    - Verify user has role 'colaborador'
    - Verify disciplina_colaborador is defined
    - _Requirements: 14.2, 14.4_

  - [x]* 3.3 Write unit tests for RoleMiddleware
    - Test estudante cannot access collaborator routes (403)
    - Test estudante cannot access admin routes (403)
    - Test colaborador cannot access admin routes (403)
    - Test admin can access all routes
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 4. Implement QuestaoController - Colaborador operations
  - [x] 4.1 Implement createQuestao method
    - Validate question data (titulo, descricao, disciplina, tipo, etc.)
    - Check disciplina matches collaborator's disciplina_colaborador
    - Set status_aprovacao to 'pendente'
    - Set autor_id to collaborator's id
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 4.2 Implement getMinhasQuestoes method
    - Filter by autor_id (collaborator's id)
    - Filter by disciplina_colaborador
    - Apply optional filters (dificuldade, status_aprovacao)
    - Return empty array if no questions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.3 Implement updateQuestao method
    - Verify question's autor_id matches collaborator
    - Prevent editing approved questions (set back to 'pendente')
    - Validate disciplina if changed (must match disciplina_colaborador)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 4.4 Implement deleteQuestao method
    - Verify question's autor_id matches collaborator
    - Permanently remove question
    - Cascade delete associated responses
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x]* 4.5 Write unit tests for QuestaoController collaborator methods
    - Test createQuestao validates disciplina match
    - Test createQuestao sets status_aprovacao to 'pendente'
    - Test getMinhasQuestoes filters by autor_id and disciplina
    - Test updateQuestao prevents editing approved questions
    - Test deleteQuestao prevents deleting others' questions
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.3, 5.1, 5.2_

- [x] 5. Implement QuestaoController - Admin operations
  - [x] 5.1 Implement getPendingQuestoes method
    - Return all questions where status_aprovacao = 'pendente'
    - Include all disciplines and collaborators
    - Order by createdAt descending
    - Include autor information (nome, email)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 5.2 Implement approveQuestao method
    - Set status_aprovacao to 'aprovada'
    - Set revisado_por to admin's id
    - Set revisado_em to current timestamp
    - Return error if already approved
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x] 5.3 Implement rejectQuestao method
    - Require motivo_rejeicao
    - Set status_aprovacao to 'rejeitada'
    - Set revisado_por, revisado_em, motivo_rejeicao
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x]* 5.4 Write unit tests for admin operations
    - Test getPendingQuestoes returns correct questions
    - Test approveQuestao updates status correctly
    - Test rejectQuestao requires motivo_rejeicao
    - Test rejectQuestao validates already approved
    - _Requirements: 6.1, 7.1, 7.5, 8.1, 8.2_

- [x] 6. Implement DisciplinaController for admin
  - [x] 6.1 Implement createDisciplina method
    - Require nome (unique)
    - Auto-generate slug from nome
    - Validate unique constraint
    - Allow descricao and cor (optional)
    - Set ativo to true by default
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [x] 6.2 Implement getAllDisciplinas method
    - Return all disciplinas (regardless of ativo)
    - Order by nome ascending
    - Include collaborator count if requested
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [x] 6.3 Implement getColaboradoresByDisciplina method
    - Return users where disciplina_colaborador matches
    - Include id, nome, email, disciplina_colaborador
    - _Requirements: 12.1, 12.2_

  - [x]* 6.4 Write unit tests for DisciplinaController
    - Test createDisciplina generates slug
    - Test createDisciplina validates unique nome
    - Test getAllDisciplinas ordering
    - _Requirements: 9.2, 9.3, 10.2_

- [x] 7. Implement UserController - Assign collaborator to disciplina
  - [x] 7.1 Implement assignColaborador method
    - Update user role to 'colaborador'
    - Set disciplina_colaborador to specified disciplina
    - Validate disciplina is valid
    - Validate user is not admin
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [x]* 7.2 Write unit tests for assignColaborador
    - Test assigning disciplina to user sets role to colaborador
    - Test assigning to admin returns error
    - Test assigning invalid disciplina returns error
    - _Requirements: 11.3, 11.4, 11.5_

- [x] 8. Create API routes for all endpoints
  - [x] 8.1 Create collaborator routes
    - POST /api/questoes (create)
    - GET /api/questoes/minhas (list own)
    - PUT /api/questoes/:id (update own)
    - DELETE /api/questoes/:id (delete own)
    - _Requirements: 2.1, 3.1, 4.1, 5.1_
  
  - [x] 8.2 Create admin routes
    - GET /api/questoes/pendentes (pending)
    - PUT /api/questoes/:id/aprovar (approve)
    - PUT /api/questoes/:id/rejeitar (reject)
    - GET /api/disciplinas (list)
    - POST /api/disciplinas (create)
    - PUT /api/usuarios/:id/atribuir (assign)
    - GET /api/disciplinas/:id/colaboradores (list by disciplina)
    - _Requirements: 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1_

  - [x] 8.3 Register routes in Express app
    - Apply AuthMiddleware to protected routes
    - Apply RoleMiddleware for access control
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 14.1, 14.2_

- [x] 9. Checkpoint - Backend implementation complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Frontend - Authentication context
  - [x] 10.1 Update AuthContext to handle collaborator role
    - Store role in authentication state
    - Store disciplina_colaborador in auth state
    - Update user type definitions
    - _Requirements: 1.5, 1.6_

- [x] 11. Implement Frontend - Colaborador dashboard
  - [x] 11.1 Create ColaboradorDashboard page
    - Display welcome message with user name
    - Show discipline info
    - Navigation to question management
    - _Requirements: 2.1_

  - [x] 11.2 Create MinhasQuestoes page
    - List questions created by collaborator
    - Filter by status (pendente, aprovada, rejeitada)
    - Filter by difficulty
    - Show status badges
    - Edit/Delete action buttons
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 11.3 Create QuestaoForm component
    - Form for creating/editing questions
    - Fields: titulo, descricao, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, linguagem
    - Validate disciplina matches user's disciplina_colaborador
    - Show "Pendente de aprovação" status after creation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.4_

- [x] 12. Implement Frontend - Admin question approval
  - [x] 12.1 Create AprovarQuestões page (admin)
    - List all pending questions
    - Show author info with each question
    - Preview question details
    - Approve button with success feedback
    - Reject button with modal for motivo_rejeicao
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 12.2 Create RejectModal component
    - Textarea for motivo_rejeicao
    - Validation: motivo is required
    - Confirm/Cancel buttons

- [x] 13. Implement Frontend - Admin disciplina management
  - [x] 13.1 Create DisciplinasAdmin page
    - List all disciplines
    - Create new disciplina form (nome, descricao, cor)
    - Show collaborator count per discipline
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.1, 10.2, 10.3_

  - [x] 13.2 Create AtribuirColaborador form
    - Select user dropdown
    - Select disciplina dropdown
    - Assign button
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 14. Implement Frontend routing and navigation
  - [x] 14.1 Update App.jsx routing
    - Add /colaborador route (protected, colaborador role only)
    - Add /admin/disciplinas route (protected, admin only)
    - Add /admin/questoes/pendentes route (protected, admin only)
    - Add /admin/colaboradores route (protected, admin only)
  
  - [x] 14.2 Update navigation menu
    - Show "Minhas Questões" for colaborador role
    - Show "Aprovar Questões" for admin role
    - Show "Gerenciar Disciplinas" for admin role
    - Hide admin panels from non-admin users

- [ ] 15. Checkpoint - Frontend implementation complete
  - Ensure all components render correctly
  - Test navigation between pages
  - Verify role-based menu visibility

- [ ] 16. Integration testing
  - [ ] 16.1 Test collaborator login flow
    - Login with collaborator credentials
    - Verify token contains role and disciplina_colaborador
    - Verify redirected to collaborator dashboard
  
  - [ ] 16.2 Test create question flow
    - Create question with valid data
    - Verify question appears in "Minhas Questões"
    - Verify status is "pendente"
  
  - [ ] 16.3 Test admin approval flow
    - Login as admin
    - Navigate to pending questions
    - Approve a question
    - Verify status changes to "aprovada"
  
  - [ ] 16.4 Test admin rejection flow
    - Navigate to pending questions
    - Try to reject without motivo (should fail)
    - Reject with motivo
    - Verify status changes to "rejeitada"
    - Verify motivo_rejeicao is stored

- [ ] 17. Regression testing
  - [ ] 17.1 Verify existing student functionality
    - Student can still login
    - Student can still participate in tournaments
    - Student cannot access collaborator routes
    - _Requirements: 17.1, 17.4_
  
  - [ ] 17.2 Verify existing admin functionality
    - Admin can still create tournaments
    - Admin can still view statistics
    - Existing admin routes work
    - _Requirements: 18.1, 18.2, 18.3, 18.4_
  
  - [x] 17.3 Verify public routes
    - GET /api/torneios accessible without auth
    - _Requirements: 17.3_

- [ ] 18. Final checkpoint - Complete integration
  - Ensure all tests pass
  - Verify all requirements are covered
  - Ask the user if questions arise before proceeding to implementation

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows
- Property tests can be added later for additional robustness

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.2"] },
    { "id": 2, "tasks": ["2.2", "3.3"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["4.5", "5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["5.4", "6.1", "6.2", "6.3"] },
    { "id": 6, "tasks": ["6.4", "7.1"] },
    { "id": 7, "tasks": ["7.2", "8.1", "8.2", "8.3"] },
    { "id": 8, "tasks": ["10.1", "11.1", "11.2", "11.3"] },
    { "id": 9, "tasks": ["12.1", "12.2", "13.1", "13.2"] },
    { "id": 10, "tasks": ["14.1", "14.2"] },
    { "id": 11, "tasks": ["16.1", "16.2", "16.3", "16.4"] },
    { "id": 12, "tasks": ["17.1", "17.2", "17.3"] }
  ]
}
```