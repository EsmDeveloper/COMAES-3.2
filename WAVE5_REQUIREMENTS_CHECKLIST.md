# Wave 5 Requirements Checklist

## Task 6.1: Implement createDisciplina method

### Requirement 9.1: Require nome to be provided and must be unique
- [x] Controller validates that nome is not null/empty/whitespace
- [x] Controller checks database for existing nome before creation
- [x] Returns appropriate error if nome is missing
- [x] Returns 409 Conflict if nome already exists
- [x] Error message: "Nome da disciplina é obrigatório" or "Disciplina já existe"

### Requirement 9.2: Automatically generate slug from nome
- [x] Created `generateSlug()` helper function
- [x] Slug is lowercase
- [x] Slug removes special characters
- [x] Slug replaces spaces with hyphens
- [x] Slug handles unicode/diacritics (normalizes NFD)
- [x] Slug is trimmed of leading/trailing hyphens
- [x] Examples:
  - "Programação" → "programacao"
  - "Língua Inglesa" → "lingua-inglesa"
  - "Matemática" → "matematica"

### Requirement 9.3: Validate unique constraint
- [x] Unique constraint on `nome` field in database
- [x] Unique constraint on `slug` field in database
- [x] Controller validates before insert
- [x] Returns 409 Conflict if duplicate found
- [x] Appropriate error message provided

### Requirement 9.4: Allow optional descricao and cor fields
- [x] `descricao` is optional (nullable in model)
- [x] `cor` is optional (nullable in model)
- [x] `descricao` is trimmed if provided
- [x] `cor` validates hex color format (#RRGGBB)
- [x] Both fields can be omitted from request body

### Requirement 9.5: Set ativo to true by default
- [x] Model defines default value: `defaultValue: true`
- [x] Controller explicitly sets ativo to true when creating
- [x] Disciplina with no ativo parameter starts as active

### Requirement 9.6: Return created disciplina with all fields
- [x] Returns HTTP 201 Created status
- [x] Response includes all fields:
  - [x] id
  - [x] nome
  - [x] slug
  - [x] descricao (can be null)
  - [x] cor (can be null)
  - [x] ativo
  - [x] createdAt
  - [x] updatedAt

### Access Control
- [x] Admin-only endpoint (requires isAdmin middleware)
- [x] Rejects non-admin users with 403 Forbidden
- [x] Requires valid JWT token

---

## Task 6.2: Implement getAllDisciplinas method

### Requirement 10.1: Return all disciplinas regardless of ativo status
- [x] Query does not filter on ativo status
- [x] Returns both active (ativo=true) and inactive (ativo=false) disciplinas
- [x] No WHERE clause limiting by ativo

### Requirement 10.2: Order by nome ascending
- [x] Results ordered by nome ascending (A → Z)
- [x] ORDER BY nome ASC applied to query
- [x] Alphabetical sorting is consistent

### Requirement 10.3: Include collaborator count if requested
- [x] Query parameter: `includeCount` (optional)
- [x] When includeCount=true, counts users where:
  - [x] disciplina_colaborador matches discipline name
  - [x] role = 'colaborador'
- [x] Adds `colaboradores_count` field to response
- [x] Uses Promise.all for efficient counting

### Response Format
- [x] HTTP 200 OK status
- [x] Response structure:
  ```json
  {
    "message": "Disciplinas listadas com sucesso",
    "data": [
      {
        "id": 1,
        "nome": "...",
        "slug": "...",
        "descricao": "...",
        "cor": "...",
        "ativo": true,
        "createdAt": "...",
        "updatedAt": "...",
        "colaboradores_count": 5  // Only if includeCount=true
      }
    ]
  }
  ```

### Access Control
- [x] Admin-only endpoint (requires isAdmin middleware)
- [x] Rejects non-admin users with 403 Forbidden
- [x] Requires valid JWT token

---

## Task 6.3: Implement getColaboradoresByDisciplina method

### Requirement 12.1: Return users where disciplina_colaborador matches disciplina_id
- [x] Endpoint parameter: `:disciplina` (discipline name)
- [x] Queries Usuario table with filters:
  - [x] WHERE disciplina_colaborador = :disciplina
  - [x] WHERE role = 'colaborador'
- [x] Verifies disciplina exists first
- [x] Returns empty array if no matches (not error)

### Requirement 12.2: Include id, nome, email, disciplina_colaborador fields
- [x] Response includes exactly these fields:
  - [x] id
  - [x] nome
  - [x] email
  - [x] disciplina_colaborador
- [x] Does NOT include:
  - [x] password
  - [x] other sensitive fields
- [x] Ordered by nome ascending

### Edge Cases
- [x] Returns empty array if no collaborators (not error)
- [x] Returns 400 if disciplina parameter is missing/empty
- [x] Returns 404 if disciplina doesn't exist

### Response Format
- [x] HTTP 200 OK status
- [x] Response structure:
  ```json
  {
    "message": "Colaboradores listados com sucesso",
    "data": [
      {
        "id": 2,
        "nome": "Professor Name",
        "email": "email@example.com",
        "disciplina_colaborador": "Matemática"
      }
    ],
    "total": 1
  }
  ```

### Access Control
- [x] Admin-only endpoint (requires isAdmin middleware)
- [x] Rejects non-admin users with 403 Forbidden
- [x] Requires valid JWT token

---

## General Requirements

### Admin-only Access (All Tasks)
- [x] All three methods check for `req.user.role === 'admin'`
- [x] Return 403 Forbidden for non-admin users
- [x] All endpoints use `isAdmin` middleware
- [x] All endpoints use `auth` middleware for JWT validation

### Error Handling
- [x] 400 Bad Request for validation errors
- [x] 403 Forbidden for insufficient permissions
- [x] 404 Not Found for missing resources
- [x] 409 Conflict for duplicate constraints
- [x] 500 Internal Server Error with descriptive message
- [x] All errors include meaningful error messages

### Database Schema
- [x] Created Disciplina model with:
  - [x] id (PK, autoIncrement)
  - [x] nome (STRING, NOT NULL, UNIQUE)
  - [x] slug (STRING, NOT NULL, UNIQUE)
  - [x] descricao (TEXT, nullable)
  - [x] cor (STRING(7), nullable, hex validation)
  - [x] ativo (BOOLEAN, NOT NULL, default true)
  - [x] createdAt (DATETIME)
  - [x] updatedAt (DATETIME)

### Files Created
- [x] BackEnd/models/Disciplina.js - Model definition
- [x] BackEnd/controllers/DisciplinaController.js - Controller methods
- [x] BackEnd/routes/disciplinasRoutes.js - Route definitions
- [x] BackEnd/migrations/20260608000004-create-disciplinas-table.cjs - Migration
- [x] BackEnd/tests/disciplina-wave5.test.js - Unit tests
- [x] BackEnd/test_disciplina_routes.js - Integration tests

### Integration
- [x] Added Disciplina import to index.js
- [x] Added disciplinasRoutes import to index.js
- [x] Registered routes: `app.use('/api/disciplinas', disciplinasRoutes)`
- [x] Routes registered after auth middleware setup

### Code Quality
- [x] No syntax errors
- [x] Follows existing project patterns
- [x] Consistent with other controllers
- [x] Proper error handling
- [x] Input validation
- [x] Clear, descriptive error messages
- [x] JSDoc comments on functions
- [x] Helper functions extracted (generateSlug)

### Validation Logic
- [x] Nome: Required, unique, trimmed
- [x] Slug: Auto-generated, unique, URL-safe
- [x] Cor: Optional, hex format validation (#RRGGBB)
- [x] Descricao: Optional, trimmed
- [x] Ativo: Defaults to true

---

## Testing Coverage

### Unit Tests
- [x] Admin role verification (all 3 methods)
- [x] Parameter validation
- [x] Slug generation
- [x] Default values
- [x] Unique constraint checking
- [x] Return values and status codes

### Integration Tests
- [x] Database persistence
- [x] Query ordering
- [x] Collaborator counting
- [x] Empty result handling
- [x] Edge cases

---

## API Endpoints

### POST /api/disciplinas (createDisciplina)
- [x] Endpoint registered
- [x] Requires admin role
- [x] Requires auth token
- [x] Accepts nome, descricao (opt), cor (opt)
- [x] Returns 201 Created
- [x] Returns created disciplina

### GET /api/disciplinas (getAllDisciplinas)
- [x] Endpoint registered
- [x] Requires admin role
- [x] Requires auth token
- [x] Optional query: includeCount
- [x] Returns 200 OK
- [x] Returns array of disciplinas

### GET /api/disciplinas/:disciplina/colaboradores (getColaboradoresByDisciplina)
- [x] Endpoint registered
- [x] Requires admin role
- [x] Requires auth token
- [x] Accepts disciplina parameter
- [x] Returns 200 OK
- [x] Returns array of collaborators

---

## Traceability to Requirements Document

### Requirement 9 (Task 6.1: createDisciplina)
- [x] 9.1 Implemented ✅
- [x] 9.2 Implemented ✅
- [x] 9.3 Implemented ✅
- [x] 9.4 Implemented ✅
- [x] 9.5 Implemented ✅
- [x] 9.6 Implemented ✅

### Requirement 10 (Task 6.2: getAllDisciplinas)
- [x] 10.1 Implemented ✅
- [x] 10.2 Implemented ✅
- [x] 10.3 Implemented ✅

### Requirement 12 (Task 6.3: getColaboradoresByDisciplina)
- [x] 12.1 Implemented ✅
- [x] 12.2 Implemented ✅

---

## Final Checklist

- [x] All three methods implemented (6.1, 6.2, 6.3)
- [x] All requirements covered (9.1-9.6, 10.1-10.3, 12.1-12.2)
- [x] Admin-only access enforced
- [x] Database model created
- [x] Routes registered
- [x] Migration created
- [x] Tests written
- [x] Error handling complete
- [x] Code follows project patterns
- [x] No syntax errors
- [x] Build passes without errors

---

## Status: ✅ ALL REQUIREMENTS MET

Wave 5 tasks 6.1, 6.2, and 6.3 have been successfully implemented with all requirements covered.
