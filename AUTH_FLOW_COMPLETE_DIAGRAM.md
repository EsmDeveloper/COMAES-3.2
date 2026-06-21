# 🔐 COMAES Authentication & Authorization Flow - Complete Diagram

## High-Level Flow

```
USER SUBMITS CREDENTIALS
        │
        ▼
┌─────────────────────────────────────┐
│ POST /auth/login                    │ ← FrontEnd/pages/Login.jsx
│ {usuario, senha}                    │
└────────────┬────────────────────────┘
             │
             ▼ (BACKEND VALIDATION)
┌─────────────────────────────────────┐
│ BackEnd/index.js:371-481            │
│ 1. Query SQL: SELECT * FROM usuarios│
│ 2. bcrypt.compare(senha)            │
│ 3. Check status_colaborador         │
│ 4. JWT.sign({id, role, isAdmin})    │
│ 5. Return {user, token}             │
└────────────┬────────────────────────┘
             │
             ▼ (FRONTEND STORAGE)
┌─────────────────────────────────────┐
│ FrontEnd/src/context/AuthContext.jsx│
│ 1. localStorage.setItem('comaes_token') ❌ XSS RISK!
│ 2. localStorage.setItem('comaes_user')  ❌ XSS RISK!
│ 3. setUser(normalized)              │
│ 4. setToken(jwtToken)               │
└────────────┬────────────────────────┘
             │
             ▼ (FRONTEND REQUEST)
┌─────────────────────────────────────┐
│ GET /api/admin/users                │
│ Header: Authorization: Bearer {token}
└────────────┬────────────────────────┘
             │
             ▼ (BACKEND VALIDATION)
┌─────────────────────────────────────┐
│ BackEnd/middlewares/isAdmin.js      │
│ FAST PATH: check JWT decoded        │
│  ├─ if decoded.isAdmin → ALLOW      │
│  └─ else → SLOW PATH                │
│                                      │
│ SLOW PATH: DB lookup                │
│  ├─ SELECT * FROM usuarios id       │
│  ├─ if user.isAdmin || role='admin' │
│  │   → ALLOW                        │
│  └─ else → 403 DENIED               │
│                                      │
│ ❌ Missing: status_colaborador check│
│ ❌ Missing: clear error handling     │
└────────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
 SUCCESS           FAILURE
 (200)             (403)
  │                 │
  ▼                 ▼
Controller      Blank Page
Process         (No Feedback)
Data
  │
  ▼
Frontend
Renders
Data
```

---

## Detailed JWT Generation Flow

```
┌──────────────────────────────────────────────────────────┐
│ Login Endpoint: POST /auth/login                         │
│ File: BackEnd/index.js (lines 371-481)                  │
└──────────────────────────────────────────────────────────┘

Step 1: Query Database (SQL Direct)
────────────────────────────────────
  SELECT id, nome, email, role, isAdmin, 
         status_colaborador, disciplina_colaborador, password
  FROM usuarios
  WHERE email = ? OR telefone = ?

  Result: usuario = {
    id: 1,
    email: 'admin@comaes.com',
    role: 'admin' OR 'estudante' OR 'colaborador',
    isAdmin: true OR false,  ← ⚠️ DUAL FIELD!
    status_colaborador: 'aprovado'
  }

Step 2: Validate Password
────────────────────────
  bcrypt.compare(senha, usuario.password)
  
  ✅ If MATCH → continue
  ❌ If MISMATCH → return 401

Step 3: Validate Colaborador Status
─────────────────────────────────────
  if usuario.role === 'colaborador' {
    if usuario.status_colaborador !== 'aprovado' {
      return 403 { error: 'Aguardando aprovação' }
    }
  }
  
  ✅ Only colaboradores validated here
  ⚠️ NOT validated in subsequent middleware!

Step 4: Generate JWT
────────────────────
  token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role || 'estudante',
      isAdmin: usuario.isAdmin,  ← ⚠️ DUAL FIELD!
      disciplina_colaborador: usuario.disciplina_colaborador,
      status_colaborador: usuario.status_colaborador
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }  ← ⚠️ 24 HOURS = LONG!
  )

Step 5: Return Response
────────────────
  response = {
    success: true,
    data: { user object without password },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }

Step 6: Frontend Stores Token
──────────────────────
  ❌ localStorage.setItem('comaes_token', token)  ← XSS VULNERABLE!
  ❌ localStorage.setItem('comaes_user', JSON.stringify(user))

════════════════════════════════════════════════════════════════

RESULT: Token is valid for 24h and can be stolen by XSS
```

---

## Middleware Authorization Flow

```
Request arrives with header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

┌─ Which middleware processes this? ─┐
│                                    │
├─ isAdmin.js (most admin endpoints) │
├─ roleMiddleware.js (some routes)   │ ← INCONSISTENCY!
└─ No middleware (public endpoints)  │

═══════════════════════════════════════════════════════════════

CASE 1: Using isAdmin.js
────────────────────────

entry.use(isAdmin) ← checks isAdmin.js
  │
  ├─ Extract token from header
  │
  ├─ jwt.verify(token, JWT_SECRET)
  │  └─ Result: decoded = { id, email, role, isAdmin, ... }
  │
  ├─ FAST PATH: if decoded.isAdmin === true
  │   │
  │   └─→ req.user = decoded; next()  ✅ ALLOW
  │
  └─ SLOW PATH: if decoded.isAdmin !== true
      │
      ├─ SELECT * FROM usuarios WHERE id = decoded.id
      │
      ├─ Check: user.isAdmin || user.role === 'admin'
      │
      ├─ if YES:
      │   │
      │   └─→ req.user = {...decoded, isAdmin:true}; next()  ✅ ALLOW
      │
      └─ if NO:
          │
          ├─ ❌ Missing: status_colaborador validation
          ├─ ❌ Missing: clear error logging
          │
          └─→ return 403 { message: 'Acesso negado' }  ❌ DENY

═══════════════════════════════════════════════════════════════

CASE 2: Using roleMiddleware.js (DIFFERENT LOGIC!)
──────────────────────────────

entry.use(createRoleMiddleware(['admin']))
  │
  ├─ Extract token, jwt.verify
  │
  ├─ FAST PATH: if decoded.role === 'admin'
  │   │
  │   └─→ next()  ✅ ALLOW
  │
  └─ SLOW PATH: if decoded.role !== 'admin'
      │
      ├─ SELECT * FROM usuarios WHERE id = decoded.id
      │
      ├─ Check: user.role === 'admin'  ← ⚠️ DIFFERENT LOGIC!
      │         (Note: doesn't check isAdmin!)
      │
      ├─ if YES:
      │   │
      │   └─→ next()  ✅ ALLOW
      │
      └─ if NO:
          │
          └─→ return 403  ❌ DENY

════════════════════════════════════════════════════════════════

⚠️ CONFLICT SCENARIO:
  User has: role='estudante' BUT isAdmin=true
  
  Using isAdmin.js:
    Fast Path: decoded.isAdmin=true → ✅ ALLOW
  
  Using roleMiddleware.js:
    Fast Path: decoded.role='estudante' → SLOW PATH
    Slow Path: user.role='estudante' → ❌ DENY
  
  SAME USER GETS DIFFERENT RESULTS!
```

---

## Permission Validation After Authorization

```
After middleware passes, controller executes:

┌─ GET /api/admin/users ─┐
│ (Protected by isAdmin) │
└───────────┬─────────────┘
            │
            ▼
    ┌──────────────────┐
    │ UserController   │
    │ .getAllUsers()   │
    └────────┬─────────┘
             │
             ├─ SELECT * FROM usuarios
             │
             ├─ Format response
             │
             └─→ res.json(users)  ✅ 200 OK

NO ADDITIONAL PERMISSION CHECKS!
Just because isAdmin middleware passed = you can do anything

⚠️ What if user should only see their own data?
   → No granular permission checking
   → All admins see all data
   → All collaborators see all their own data (hopefully)
   → No way to have "view-only admin"
```

---

## Complete Request Lifecycle (Happy Path)

```
TIME    ACTION                                  FILE/LOCATION
────    ──────────────────────────────────────  ─────────────────
T=0     User types email + password             Browser
        
T=0.1   Click "Sign In"                        FrontEnd/pages/Login.jsx
        
T=0.2   POST /auth/login                       Network
        Body: {usuario, senha}
        
T=0.5   Backend receives request               BackEnd/index.js:371
        
T=0.6   Query database                         BackEnd/index.js:380-398
        SELECT * FROM usuarios WHERE email=?
        Result: User record with password
        
T=0.7   Compare password hash                  BackEnd/index.js:443
        bcrypt.compare(senha, user.password)
        Result: ✅ Match
        
T=0.8   Check status if colaborador            BackEnd/index.js:450-465
        if role='colaborador' && status != 'aprovado' → DENY
        Result: ✅ Pass (or N/A if not colaborador)
        
T=0.9   Generate JWT                           BackEnd/index.js:469-479
        jwt.sign({id, email, role, isAdmin, ...}, SECRET)
        Result: Token string
        
T=1.0   Return response                        BackEnd/index.js:510-517
        Response: {success: true, data: user, token: "..."}
        
T=1.1   Frontend receives response             FrontEnd/pages/Login.jsx
        Status: 200 OK
        
T=1.2   Store user in AuthContext.login()      FrontEnd/src/context/AuthContext.jsx
        setUser(normalized)
        setToken(jwtToken)
        
T=1.3   Store in localStorage                  FrontEnd/src/context/AuthContext.jsx:70-71
        ❌ localStorage.setItem('comaes_token', token)  ← XSS RISK!
        
T=1.4   Redirect to admin dashboard            FrontEnd/pages/Login.jsx
        navigate('/administrador')
        
T=1.5   Load AdminDashboard                    FrontEnd/Administrador/AdminDashboard.jsx
        Get user from AuthContext
        Render menu sections
        
T=1.6   User clicks "Gerenciar Usuários"      AdminDashboard.jsx:275-280
        setActiveTab('user')
        
T=1.7   Render TableManager                    AdminDashboard.jsx:397
        <TableManager table={'user'} />
        
T=1.8   TableManager fetches data              TableManager.jsx:260-276
        GET /api/admin/users
        Header: Authorization: Bearer {token}
        
T=1.9   Backend receives request               BackEnd/middlewares/isAdmin.js
        Extract token from header
        jwt.verify(token)
        Result: decoded = {...}
        
T=2.0   FAST PATH: check decoded.isAdmin       isAdmin.js:26-28
        if (decoded.isAdmin) { next(); }
        Result: ✅ ALLOW (because isAdmin=true in JWT)
        
T=2.1   UserController.getAllUsers()           BackEnd/controllers/UserController.js:122
        SELECT * FROM usuarios
        
T=2.2   Format and return users                UserController.js:130
        res.json(users)
        
T=2.3   Frontend receives users                FrontEnd/Administrador/TableManager.jsx
        Status: 200 OK
        data: [{id, email, role, ...}, ...]
        
T=2.4   TableManager builds table              TableManager.jsx:290-340
        Display users in table format
        
T=2.5   Admin sees user list                   Browser
        User table displayed with edit/delete buttons
        
SUCCESS! ✅
```

---

## Complete Request Lifecycle (Error Path)

```
TIME    ACTION                                  FILE/LOCATION
────    ──────────────────────────────────────  ─────────────────
T=0     Attacker has token but user revoked    (Background)
        
T=0.1   GET /api/admin/users                   Network
        Header: Authorization: Bearer {old_token}
        
T=0.5   Backend receives request               BackEnd/middlewares/isAdmin.js
        
T=0.6   Extract and jwt.verify                 isAdmin.js:16-22
        Result: decoded.isAdmin = false (old token)
        
T=0.7   FAST PATH FAILED                       isAdmin.js:26-28
        if (decoded.isAdmin) → FALSE → goto SLOW PATH
        
T=0.8   SLOW PATH: Database lookup             isAdmin.js:32-41
        SELECT * FROM usuarios WHERE id = decoded.id
        
T=0.9   Query succeeds                         DB
        Result: user = {isAdmin: false, role: 'estudante', ...}
        
T=1.0   Check authorization condition          isAdmin.js:38
        if (user.isAdmin || user.role === 'admin') → FALSE
        
T=1.1   Deny access                            isAdmin.js:42-44
        return res.status(403).json({message: 'Acesso negado'})
        ❌ NO LOGGING of IP, attemp time, etc
        ❌ NO AUDIT ENTRY created
        
T=1.2   Frontend receives error                FrontEnd
        Status: 403 Forbidden
        
T=1.3   Component cannot render                TableManager.jsx or AdminStats.jsx
        Error message shown (if implemented)
        
T=1.4   User sees blank page or error          Browser
        "Erro ao carregar dados (403)"
        
USER CONFUSED: "Why is the page blank?"
(In reality: Authorization failed, but no clear feedback)

ERROR LOGGED: ❌ NO - nothing in backend logs
AUDIT TRAIL: ❌ NO - no audit entry
IP TRACKED: ❌ NO - attacker's IP not recorded
```

---

## Vulnerability Injection Points

```
┌─────────────────────────────────────────────────────────────┐
│ WHERE EACH VULNERABILITY CAN BE EXPLOITED                   │
└─────────────────────────────────────────────────────────────┘

VULN #1: Desync (isAdmin vs role precedence)
   Location: Backend middleware comparison logic
   Attack: Craft request where JWT says isAdmin=false but DB says role=admin
   
VULN #2: Dual fields (role='estudante' + isAdmin=true)
   Location: User table schema or JWT generation
   Attack: SQL injection to set isAdmin=true without changing role
   
VULN #3: Token expiration (24h valid)
   Location: Token generation in login
   Attack: Capture token, use for 24h before expiration
   
VULN #4: localStorage JWT (XSS)
   Location: Frontend storage mechanism
   Attack: Inject <img onerror="steal_token()">
   
VULN #5: Status not validated (middleware)
   Location: isAdmin.js middleware
   Attack: Generate token when approved, change status, token still valid
   
VULN #6: Brute force (no rate limit)
   Location: /auth/login endpoint
   Attack: Send 1M password attempts/second
   
VULN #7: TableManager whitelist
   Location: adminService.getService(table)
   Attack: Modify URL ?table=redefinicaosenha
   
VULN #8: Permission matrix incomplete
   Location: roleMiddleware.js permissionMap
   Attack: Colaborador deletes other colaborador's questions
   
VULN #9: No audit logging
   Location: Controllers and middleware
   Attack: Delete user, no audit trail of who did it
   
VULN #10: Admin master not protected
   Location: UserController.toggleAdmin
   Attack: Secondary admin removes admin master (id=1)
   
VULN #11: Error handling vague
   Location: isAdmin.js catch block
   Attack: DB error becomes 403, hard to troubleshoot
   
VULN #12: CORS open + no CSRF
   Location: app.use(cors) and endpoints
   Attack: CSRF form from evil.com makes admin delete users
```

