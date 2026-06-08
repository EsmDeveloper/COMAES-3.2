# 🚀 FASE 4: FRONTEND INTEGRATION GUIDE
**Tournament System Implementation - Phase 4 (Frontend)**

**Date**: June 8, 2026  
**Status**: READY FOR IMPLEMENTATION  
**Backend Status**: ✅ 100% COMPLETE

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Backend Integration Points](#backend-integration-points)
3. [Frontend Components to Build](#frontend-components-to-build)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Implementation Checklist](#implementation-checklist)
6. [Testing Checklist](#testing-checklist)

---

## OVERVIEW

Phase 4 involves integrating the backend tournament system with the frontend. All backend endpoints are ready, all models are synchronized, and the scheduler is active. The frontend needs:

1. **Tournament Dashboard** - Display active tournaments
2. **Tournament Registration UI** - Allow users to join tournaments
3. **Tournament Leaderboard** - Real-time ranking display
4. **Certificate Display** - Show earned certificates
5. **Admin Panel Updates** - Tournament management interface

---

## BACKEND INTEGRATION POINTS

### ✅ Scheduler Status
- **File**: `BackEnd/jobs/verificarEncerramentosScheduler.js`
- **Integration**: ✅ Integrated into `BackEnd/index.js` startup sequence
- **Frequency**: Every 1 minute
- **Function**: Marks participants as operationally ended when tournament `termina_em` is reached
- **State**: Running on server startup

### ✅ Database Schema
- **Migration**: Manual SQL script ready at `BackEnd/apply_tournament_columns.sql`
- **Alternative**: Use individual 3 new migrations:
  - `20260608000001-add-tournament-types.cjs`
  - `20260608000002-enhance-participant-controls.cjs`
  - `20260608000003-enhance-certificates.cjs`
- **Columns Added**: 7 new columns across 3 tables
- **Indices Added**: 5 new performance indices

### ✅ API Routes Status
- **Base URL**: `/api/tournaments`
- **Total Endpoints**: 14 (6 tournament + 7 certificate + existing endpoints)
- **Auth**: Some endpoints require admin role (marked below)
- **Format**: All responses use JSON

---

## FRONTEND COMPONENTS TO BUILD

### 1. Tournament Discovery Page
**File**: `FrontEnd/src/Paginas/Secundarias/TorneioDashboard.jsx` (NEW)

**Functionality**:
- Display active tournaments
- Show tournament metadata (start/end dates, type, participant count)
- Button to join tournament
- Filter by discipline (Matemática, Inglês, Programação)

**API Calls**:
```javascript
// Get active tournaments
GET /api/tournaments?status=ativo

// Get participant count
GET /api/tournaments/:id/participant-counts

// Get current user's active participation
GET /api/tournaments/usuario/:usuario_id/participacao-ativa?query
```

---

### 2. Tournament Registration Modal
**File**: `FrontEnd/src/components/TournamentRegistrationModal.jsx` (NEW)

**Functionality**:
- Modal form to join tournament
- Select discipline (Matemática, Inglês, Programação)
- Verify user doesn't already have active participation
- Submit registration

**API Calls**:
```javascript
// Check active participation
GET /api/tournaments/usuario/:usuario_id/participacao-ativa

// Register user
POST /api/tournaments/:id/inscrever
Body: {
  torneio_id: number,
  usuario_id: number,
  disciplina_competida: string
}
```

---

### 3. Leaderboard Component
**File**: `FrontEnd/src/Paginas/Secundarias/TorneioBoardBoard.jsx` (NEW)

**Functionality**:
- Display real-time ranking for a tournament
- Show participant positions (top 3 highlighted with medals)
- Filter by discipline
- Show participant XP/Level
- Auto-refresh every 10 seconds

**API Calls**:
```javascript
// Get ranking by discipline
GET /api/tournaments/:id/ranking/:disciplina

// Get all rankings
GET /api/tournaments/:id/ranking?includeInactive=false

// Get persistent ranking (frozen)
GET /api/tournaments/:id/ranking-persistido?disciplina=Matemática
```

---

### 4. Certificates Display Component
**File**: `FrontEnd/src/Paginas/Secundarias/MinhasCertificacoes.jsx` (MODIFY)

**Modifications**:
- Add tournament certificates section
- Display medal icons (🥇🥈🥉)
- Show certificate validation status
- Add certificate verification code
- Add download certificate button

**API Calls**:
```javascript
// Get user's certificates
GET /api/tournaments/certificados/usuario/:usuario_id

// Verify certificate code
GET /api/tournaments/certificados/validar/:codigo
```

---

### 5. Admin Tournament Management
**File**: `FrontEnd/src/Administrador/TorneioPanelAdmin.jsx` (NEW or MODIFY)

**Functionality**:
- Create/Edit/Delete tournaments
- Activate tournament (with validation: max 1 active)
- View active tournaments count
- Finalize tournament (generates certificates)
- View tournament statistics

**API Calls**:
```javascript
// Check how many tournaments are active
GET /api/tournaments/admin/torneios-ativos

// Activate tournament
POST /api/tournaments/:id/ativar

// Finalize tournament (generates certs for top 3)
POST /api/tournaments/:id/finalizar

// List all certificates from tournament
GET /api/tournaments/certificados/torneio/:torneio_id

// Validate certificate (admin)
PUT /api/tournaments/certificados/:id/validar

// Cancel certificate
PUT /api/tournaments/certificados/:id/cancelar
```

---

## API ENDPOINTS REFERENCE

### TOURNAMENT ENDPOINTS

#### 1. Get All Tournaments
```
GET /api/tournaments
Response:
{
  success: true,
  tournaments: [
    { id, titulo, descricao, inicia_em, termina_em, status, criado_em }
  ]
}
```

#### 2. Get Participant Counts by Discipline
```
GET /api/tournaments/:tournamentId/participant-counts
Response:
{
  success: true,
  counts: {
    "Matemática": 15,
    "Inglês": 12,
    "Programação": 8,
    total: 35
  }
}
```

#### 3. Get Ranking (All Disciplines)
```
GET /api/tournaments/:tournamentId/ranking?includeInactive=false
Response:
{
  success: true,
  tournament: { ... },
  totalParticipants: 35,
  ranking: [
    { id, usuario: {...}, posicao, pontuacao, disciplina_competida, ... }
  ]
}
```

#### 4. Get Ranking by Discipline
```
GET /api/tournaments/:tournamentId/ranking/:disciplina
Response:
{
  success: true,
  tournament: { ... },
  disciplina: "Matemática",
  totalParticipants: 15,
  ranking: [
    { id, usuario: {...}, posicao, pontuacao, ... }
  ]
}
```

#### 5. Check User Active Participation
```
GET /api/tournaments/usuario/:usuario_id/participacao-ativa
Response:
{
  ativo: true,
  torneio: { id, titulo, status, termina_em, tipo_torneio },
  disciplina: "Matemática",
  mensagem: "Usuário já está participando..."
}
```

#### 6. Check Active Tournaments (Admin)
```
GET /api/tournaments/admin/torneios-ativos
Response:
{
  quantidade: 1,
  podeAtivarNovo: false,
  torneiosAtivos: [
    { id, titulo, tipo_torneio, inicia_em, termina_em }
  ],
  mensagem: "Já existe 1 torneio(s) ativo(s). Máximo permitido: 1"
}
```

#### 7. Activate Tournament
```
POST /api/tournaments/:id/ativar
Response:
{
  message: "Torneio ativado com sucesso!",
  torneio: { ... },
  status: "ativo"
}
```

#### 8. Finalize Tournament (Generate Certificates)
```
POST /api/tournaments/:id/finalizar
Response:
{
  message: "Torneio finalizado com sucesso!",
  torneio_id: 1,
  torneio_titulo: "Tournament Name",
  status: "finalizado",
  resultados: [
    {
      disciplina: "Matemática",
      participantes_congelados: 15,
      certificados_gerados: 3,
      certificados: [
        { usuario_id, posicao, medalha }
      ]
    }
  ]
}
```

#### 9. Get Persistent Ranking
```
GET /api/tournaments/:id/ranking-persistido?disciplina=Matemática
Response:
{
  torneio: { id, titulo, tipo, disciplina },
  total_participantes: 15,
  ranking: [
    {
      posicao: 1,
      usuario: { id, nome, imagem, email },
      pontuacao: 9500,
      casos_resolvidos: 45,
      tempo_total: 1200,
      precision: 0.95,
      encerrado: true,
      elegivel_certificado: true
    }
  ]
}
```

### CERTIFICATE ENDPOINTS

#### 1. Generate Automatic Certificates
```
POST /api/tournaments/certificados/gerar-automaticos
Body: { torneio_id: number }
Response:
{
  message: "Certificados automáticos gerados com sucesso!",
  torneio_id: 1,
  total_certificados: 9,
  resultados: [
    {
      disciplina: "Matemática",
      certificados_gerados: 3,
      certificados: [
        { usuario_id, posicao, certificado_id, medalha, codigo }
      ]
    }
  ]
}
```

#### 2. List Certificates by Tournament
```
GET /api/tournaments/certificados/torneio/:torneio_id?apenasAutomaticos=true
Response:
{
  torneio: { id, titulo },
  total: 9,
  certificados: [
    {
      id,
      usuario: { id, nome, email, imagem },
      posicao,
      medalha,
      status,
      auto_gerado,
      data_geracao,
      codigo_verificacao
    }
  ]
}
```

#### 3. Validate Certificate by Code
```
GET /api/tournaments/certificados/validar/:codigo
Response:
{
  valido: true,
  certificado: {
    id,
    codigo,
    posicao,
    medalha,
    status,
    data_geracao,
    auto_gerado,
    usuario: { ... },
    torneio: { ... },
    url_certificado: "https://..."
  }
}
```

#### 4. Count Automatic Certificates
```
GET /api/tournaments/certificados/contar-automaticos/:torneio_id
Response:
{
  torneio_id: 1,
  total_automaticos: 9,
  por_status: [
    { status: "pendente", quantidade: 6 },
    { status: "validado", quantidade: 3 }
  ]
}
```

#### 5. Get User Certificates
```
GET /api/tournaments/certificados/usuario/:usuario_id?apenasValidos=false
Response:
{
  usuario: { id, nome, email },
  total: 3,
  certificados: [
    {
      id,
      torneio: { id, titulo, tipo_torneio, termina_em },
      disciplina,
      posicao,
      medalha,
      status,
      auto_gerado,
      data_geracao
    }
  ]
}
```

#### 6. Validate Certificate (Admin)
```
PUT /api/tournaments/certificados/:id/validar
Response:
{
  message: "Certificado validado com sucesso!",
  certificado: {
    id,
    status: "validado",
    data_validacao: "2026-06-08T12:34:56Z"
  }
}
```

#### 7. Cancel Certificate
```
PUT /api/tournaments/certificados/:id/cancelar
Response:
{
  message: "Certificado cancelado com sucesso!",
  certificado: {
    id,
    status: "cancelado"
  }
}
```

---

## IMPLEMENTATION CHECKLIST

### Phase 4a: Tournament Discovery (Days 1-2)
- [ ] Create `TorneioDashboard.jsx` component
- [ ] Implement API call to fetch active tournaments
- [ ] Display tournament list with metadata
- [ ] Add filter by discipline
- [ ] Add "Join Tournament" button with modal
- [ ] Test with real backend data

### Phase 4b: Registration & Participation (Days 3-4)
- [ ] Create `TournamentRegistrationModal.jsx` component
- [ ] Check active participation before allowing join
- [ ] Handle race conditions (user joins 2x)
- [ ] Show success/error messages
- [ ] Update user state after registration
- [ ] Test error scenarios

### Phase 4c: Leaderboard Display (Days 5-6)
- [ ] Create `TorneioBoardBoard.jsx` (or modify Ranking.jsx)
- [ ] Fetch ranking data by discipline
- [ ] Display medals for top 3 (🥇🥈🥉)
- [ ] Show user XP/Level
- [ ] Implement auto-refresh every 10 seconds
- [ ] Handle empty leaderboards
- [ ] Test with multiple participants

### Phase 4d: Certificate Display (Days 7-8)
- [ ] Modify `MinhasCertificacoes.jsx`
- [ ] Add tournament certificates section
- [ ] Display certificate details (position, medal, code)
- [ ] Add certificate verification code display
- [ ] Implement download/print functionality
- [ ] Test certificate display

### Phase 4e: Admin Interface (Days 9-10)
- [ ] Create/Modify `TorneioPanelAdmin.jsx`
- [ ] Add tournament CRUD operations
- [ ] Add "Activate Tournament" button with validation
- [ ] Add "Finalize Tournament" button (generates certs)
- [ ] Show active tournament count
- [ ] Display certificates from tournament
- [ ] Test admin operations

### Phase 4f: Integration & Testing (Days 11-14)
- [ ] Connect all components
- [ ] End-to-end user flow testing
- [ ] Admin workflow testing
- [ ] Certificate generation verification
- [ ] Performance testing (with many participants)
- [ ] Mobile responsiveness check
- [ ] Deploy to staging

---

## TESTING CHECKLIST

### Unit Tests
- [ ] Tournament creation validation
- [ ] Participation check logic
- [ ] Certificate generation logic
- [ ] Ranking calculation
- [ ] Date validation (past/future dates)

### Integration Tests
- [ ] User joins tournament
- [ ] Ranking updates after new participant
- [ ] Tournament auto-ends after `termina_em`
- [ ] Certificates generated for top 3 only
- [ ] Certificate validation works
- [ ] Admin can finalize tournament

### E2E Tests
- [ ] New user discovers tournament
- [ ] User joins tournament
- [ ] Leaderboard updates live
- [ ] User views their rank
- [ ] Admin finalizes tournament
- [ ] User receives certificate
- [ ] Certificate can be verified

### Edge Cases
- [ ] User tries to join twice (race condition)
- [ ] Join tournament after it ends
- [ ] Tournament ends while user is in leaderboard
- [ ] Verify certificate code that doesn't exist
- [ ] Admin tries to activate 2 tournaments simultaneously
- [ ] Mobile: Leaderboard on small screens

### Performance Tests
- [ ] Leaderboard with 1000+ participants
- [ ] Auto-refresh doesn't cause memory leaks
- [ ] Certificate generation completes within 5s
- [ ] Scheduler doesn't block other operations

---

## NEXT STEPS

1. **Immediate**: Verify backend is running and accessible
2. **Day 1-2**: Build Tournament Discovery UI
3. **Day 3-4**: Implement Registration Flow
4. **Day 5-6**: Build Leaderboard Display
5. **Day 7-8**: Integrate Certificate Display
6. **Day 9-10**: Build Admin Interface
7. **Day 11-14**: Full integration testing and deployment

---

## BACKEND COMMANDS FOR TESTING

### Test Active Tournaments
```bash
curl http://localhost:3000/api/tournaments/admin/torneios-ativos
```

### Get Ranking by Discipline
```bash
curl http://localhost:3000/api/tournaments/1/ranking/matematica
```

### Check User Participation
```bash
curl http://localhost:3000/api/tournaments/usuario/123/participacao-ativa
```

### Verify Certificate
```bash
curl http://localhost:3000/api/tournaments/certificados/validar/ABC123DEF456
```

---

## DOCUMENTATION REFERENCES

- **Models**: `BackEnd/models/Torneio.js`, `ParticipanteTorneio.js`, `Certificate.js`
- **Controllers**: `BackEnd/controllers/TorneioController.js`, `CertificateController.js`
- **Routes**: `BackEnd/routes/tournamentsRoutes.js`
- **Scheduler**: `BackEnd/jobs/verificarEncerramentosScheduler.js`
- **Migrations**: `BackEnd/apply_tournament_columns.sql`

---

**Status**: ✅ PHASE 4 IS READY TO BEGIN

All backend components are complete, tested, and integrated. Frontend development can proceed with confidence knowing all endpoints are stable and production-ready.
