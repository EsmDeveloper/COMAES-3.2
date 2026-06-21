# 🔥 RECONSTRUÇÃO ARQUITETURAL COMPLETA - EXECUTAR AGORA

## STATUS: ✅ NOVA ARQUITETURA CRIADA

**Arquivos novos já criados**:
- ✅ `BackEnd/middlewares/auth.js` (autenticação pura)
- ✅ `BackEnd/middlewares/authorize.js` (autorização por role)
- ✅ `BackEnd/utils/modelMapperSecure.js` (whitelist estrita)
- ✅ `FrontEnd/src/Administrador/adminService.js` (reescrito com whitelist)

**Arquivos modificados**:
- ✅ `BackEnd/models/User.js` (isAdmin removido)
- ✅ `BackEnd/middlewares/isAdmin.js` (redirecionado)
- ✅ `BackEnd/middlewares/roleMiddleware.js` (redirecionado)
- ✅ `BackEnd/controllers/GenericController.js` (usa modelMapperSecure)

---

## ⚡ APLICAR MUDANÇAS RESTANTES AGORA

### BackEnd/index.js - REMOVER ISADMIN COMPLETAMENTE

**Linhas a modificar**:

1. **Linha 72**: Remover import isAdmin
```javascript
// ❌ REMOVER
import isAdmin from './middlewares/isAdmin.js';

// ✅ ADICIONAR
import { authenticate } from './middlewares/auth.js';
import { requireAdmin } from './middlewares/authorize.js';
```

2. **Linhas 235-236**: Atualizar rotas admin
```javascript
// ❌ REMOVER
app.get('/api/admin/colaboradores/:id/documentos', isAdmin, getDocumentosColaborador);
app.patch('/api/admin/colaboradores/:id/suspender', isAdmin, suspenderColaborador);

// ✅ USAR
app.get('/api/admin/colaboradores/:id/documentos', authenticate, requireAdmin, getDocumentosColaborador);
app.patch('/api/admin/colaboradores/:id/suspender', authenticate, requireAdmin, suspenderColaborador);
```

3. **Linha 389**: SELECT SQL no login - remover isAdmin
```javascript
// ❌ REMOVER
`SELECT id, nome, telefone, email, nascimento, sexo, password, escola, imagem, biografia, isAdmin, role, disciplina_colaborador, status_colaborador, createdAt, updatedAt
 FROM usuarios 
 WHERE email = :email OR telefone = :telefone 
 LIMIT 1`,

// ✅ USAR
`SELECT id, nome, telefone, email, nascimento, sexo, password, escola, imagem, biografia, role, disciplina_colaborador, status_colaborador, createdAt, updatedAt
 FROM usuarios 
 WHERE email = :email OR telefone = :telefone 
 LIMIT 1`,
```

4. **Linhas 413-432**: Remover isAdmin do objeto user
```javascript
// ❌ REMOVER todas referências a isAdmin
user = results ? { 
  id: results.id,
  nome: results.nome,
  // ...
  isAdmin: results.isAdmin,  // ❌ REMOVER
  role: results.role || (results.isAdmin ? 'admin' : 'estudante'),  // ❌ REMOVER

// ✅ USAR
user = results ? { 
  id: results.id,
  nome: results.nome,
  // ...
  role: results.role || 'estudante',  // ✅ SIMPLES
```

5. **Linhas 489-494**: JWT payload - APENAS id e role
```javascript
// ❌ REMOVER
const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin || false,
    role: user.role || (user.isAdmin ? 'admin' : 'estudante'),
    disciplina_colaborador: user.disciplina_colaborador || null,
    status_colaborador: user.status_colaborador || 'aprovado'
  },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '24h' }
);

// ✅ USAR (APENAS id e role)
const token = jwt.sign(
  {
    id: user.id,
    role: user.role || 'estudante'
  },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '24h' }
);
```

6. **Linha 572**: Refresh token - mesmo SELECT sem isAdmin
```javascript
// ❌ REMOVER isAdmin do SELECT
`SELECT id, nome, telefone, email, nascimento, sexo, password, escola, imagem, biografia, isAdmin, role, disciplina_colaborador, status_colaborador, createdAt, updatedAt

// ✅ USAR
`SELECT id, nome, telefone, email, nascimento, sexo, password, escola, imagem, biografia, role, disciplina_colaborador, status_colaborador, createdAt, updatedAt
```

7. **Linhas 600-621**: Refresh token - remover isAdmin
```javascript
// ❌ REMOVER todas refs a isAdmin
isAdmin: results.isAdmin,
role: results.role || (results.isAdmin ? 'admin' : 'estudante'),

// ✅ USAR
role: results.role || 'estudante',
```

8. **Linha 737**: Registro - remover isAdmin
```javascript
// ❌ REMOVER
isAdmin: false,

// ✅ Linha já não existe (foi removida)
```

9. **Linhas 2379, 2433**: Rotas notícias/notificações
```javascript
// ❌ REMOVER
app.post('/noticias', auth, isAdmin, async (req, res) => {
app.post('/notificacoes', auth, isAdmin, async (req, res) => {

// ✅ USAR
app.post('/noticias', authenticate, requireAdmin, async (req, res) => {
app.post('/notificacoes', authenticate, requireAdmin, async (req, res) => {
```

---

### BackEnd/controllers/UserController.js - ELIMINAR ISADMIN

Execute find & replace global no arquivo:

```javascript
// FIND: req\.user\?\.isAdmin
// REPLACE: req.user?.role === 'admin'

// FIND: requestingUser\?\.isAdmin
// REPLACE: requestingUser?.role === 'admin'

// FIND: body\.isAdmin
// REPLACE: body.role === 'admin'

// FIND: data\.isAdmin
// REPLACE: data.role === 'admin'

// FIND: isAdmin:\s*true
// REPLACE: role: 'admin'

// FIND: isAdmin:\s*false
// REPLACE: (REMOVER LINHA COMPLETAMENTE)
```

**Específico**:
- Linha 108: `role = data.role || (data.isAdmin ? 'admin' : 'estudante')` → `role = data.role || 'estudante'`
- Linha 148: Remover toda verificação de `body.isAdmin`
- Linha 179: Remover `isAdmin: ...`
- Linha 261: `isAdmin: true` → remover, usar `role: 'admin'`

---

### BackEnd/controllers/adminStatsController.js

```javascript
// Linha 17
// ❌ REMOVER
const totalAdmins = await Usuario.count({ where: { isAdmin: true } });

// ✅ USAR
const totalAdmins = await Usuario.count({ where: { role: 'admin' } });
```

---

### BackEnd/controllers/QuestoesController.js

**Find & Replace global**:
```javascript
// FIND: const isAdmin = req\.user\?\.isAdmin \|\| req\.user\?\.role === 'admin';
// REPLACE: const isAdmin = req.user?.role === 'admin';

// FIND: req\.user\.isAdmin \|\| req\.user\.role === 'admin'
// REPLACE: req.user.role === 'admin'

// FIND: req\.user\.isAdmin
// REPLACE: req.user.role === 'admin'
```

---

### BackEnd/controllers/rankingController.js

```javascript
// Linhas 103, 114
// FIND: req\.user\?\.isAdmin
// REPLACE: req.user?.role === 'admin'
```

---

### BackEnd/controllers/colaboradorRegistroController.js

```javascript
// Linha 142
// ❌ REMOVER
isAdmin: false,

// ✅ (linha já não existe)
```

---

### TODAS as rotas (BackEnd/routes/*.js)

Para CADA arquivo em `BackEnd/routes/`:

```javascript
// ❌ REMOVER
import isAdmin from '../middlewares/isAdmin.js';

// ✅ ADICIONAR
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/authorize.js';

// EM TODAS AS ROTAS ADMIN:
// ❌ REMOVER
router.get('/...', isAdmin, controller);

// ✅ USAR
router.get('/...', authenticate, requireAdmin, controller);
```

**Arquivos específicos**:
- `adminPanelRoutes.js`
- `usuariosAdminRoutes.js`
- `disciplinasAdminRoutes.js`
- `questoesAdminRoutes.js`
- Todos outros que usam `isAdmin`

---

### FrontEnd/src/context/AuthContext.jsx

```javascript
// FIND: user\.isAdmin
// REPLACE: user.role === 'admin'

// FIND: isAdmin === true
// REPLACE: role === 'admin'

// FIND: \(user\.isAdmin \? 'admin' : 'estudante'\)
// REPLACE: (user.role || 'estudante')
```

---

### FrontEnd/src/Administrador/TableManager.jsx

**REMOVER buildTableInfoFromData completamente**:

```javascript
// ❌ REMOVER FUNÇÃO (linhas ~250-268)
const buildTableInfoFromData = (rows) => {
  // ... toda a função
};

// ❌ REMOVER USO (linha ~290)
} else {
  const built = buildTableInfoFromData(rows);
  setTableInfo(built);
}

// ✅ SUBSTITUIR POR
} else {
  setError('Definição de tabela ausente. Configure STATIC_TABLE_DEFS ou schema backend.');
  setTableInfo(null);
  setLoading(false);
  return;
}
```

---

### FrontEnd - TODOS os componentes admin

Executar find & replace em `FrontEnd/src/Administrador/*.jsx`:

```javascript
// FIND: user\.isAdmin
// REPLACE: user.role === 'admin'

// FIND: isAdmin === true
// REPLACE: role === 'admin'
```

---

## 🗄️ DATABASE MIGRATION

Execute o arquivo já criado:

```bash
mysql -u root -p comaes_db < MIGRATION_DATABASE.sql
```

Ou manualmente:

```sql
-- Backup primeiro!
mysqldump -u root -p comaes_db > backup_final.sql

-- Sincronizar dados
UPDATE usuarios SET role = 'admin' WHERE isAdmin = true AND role != 'admin';
UPDATE usuarios SET role = 'admin' WHERE id = 1;

-- Remover coluna
ALTER TABLE usuarios DROP COLUMN isAdmin;
```

---

## ✅ VERIFICAÇÃO FINAL

```bash
# 1. Nenhuma referência a isAdmin no código
grep -r "isAdmin" BackEnd/ --exclude-dir=node_modules | grep -v "// ❌" | wc -l
# Deve retornar 0

# 2. Build passa
cd FrontEnd && npm run build

# 3. Lint passa
cd BackEnd && npm run lint

# 4. Database sem isAdmin
mysql -e "DESCRIBE comaes_db.usuarios" | grep isAdmin
# Deve retornar vazio
```

---

## 🎯 RESULTADO FINAL

Após executar TODAS as mudanças acima:

✅ **ZERO sistemas de autorização conflitantes**  
✅ **role é a ÚNICA fonte de verdade**  
✅ **JWT contém APENAS {id, role}**  
✅ **Database é authoritative SEMPRE**  
✅ **Whitelist estrita de modelos**  
✅ **Zero fallbacks dinâmicos**  
✅ **Zero proxies mágicos**  
✅ **Comportamento determinístico 100%**  

**SISTEMA COMPLETAMENTE RECONSTRUÍDO** ✅

