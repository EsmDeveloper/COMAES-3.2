# 🔧 ESTRATÉGIA DE CORREÇÃO DE SEGURANÇA - COMAES 3.2

**Prioridade**: CRÍTICA  
**Tempo Estimado**: 6-8 horas  
**Risco de Regressão**: MÉDIO (requer testes)

---

## ⚡ IMPLEMENTAÇÃO IMEDIATA (1-2 horas)

### FIX #1: TableManager Whitelist Validation
**Arquivo**: `FrontEnd/src/Administrador/adminService.js`  
**Risco Atual**: Accesso a qualquer modelo  
**Código**:

```javascript
// ADICIONAR NO TOPO do arquivo:
const ALLOWED_ADMIN_TABLES = new Set([
  'user',
  'users',
  'noticia',
  'notificacao',
  'torneio',
  'certificado',
  'certificados'
]);

const getService = (modelName) => {
  if (!modelName) return null;
  
  // ✅ NOVO: Validar contra whitelist
  const normalized = modelName.toLowerCase().trim();
  if (!ALLOWED_ADMIN_TABLES.has(normalized)) {
    console.error(`[SECURITY] Tentativa de acesso não autorizado: ${modelName}`);
    throw new Error(`Tabela não permitida: ${modelName}`);
  }
  
  const key = normalized;
  if (!serviceCache[key]) {
    serviceCache[key] = createCrudClient(key, token);
  }
  return serviceCache[key];
};
```

**Teste**:
```javascript
// Deve funcionar
getService('user')           // ✅
getService('USER')           // ✅
getService('noticia')        // ✅

// Deve lançar erro
getService('../../etc/passwd')  // ❌ Error
getService('configuracaousuario') // ❌ Error
getService('redefinicaosenha')    // ❌ Error
```

---

### FIX #2: Proteger Admin Master (ID=1)
**Arquivo**: `BackEnd/controllers/UserController.js`  
**Função**: `toggleAdmin`  
**Risco Atual**: Admin secundário pode remover admin master

```javascript
export const toggleAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ NOVO: Proteger admin master
    if (String(id) === '1') {
      return res.status(403).json({
        success: false,
        message: 'Não é permitido alterar privilégios do administrador principal do sistema.',
        code: 'ADMIN_MASTER_PROTECTED'
      });
    }
    
    // Resto do código...
    const user = await Usuario.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    user.isAdmin = !user.isAdmin;
    user.role = user.isAdmin ? 'admin' : 'estudante';
    await user.save();

    res.json({
      success: true,
      message: `Privilégios atualizados. Novo estado: isAdmin=${user.isAdmin}`,
      data: user.get({ plain: true })
    });
  } catch (error) {
    console.error('Erro ao alterar privilégios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.'
    });
  }
};
```

---

### FIX #3: Validar Status_Colaborador em Middleware
**Arquivo**: `BackEnd/middlewares/isAdmin.js`  
**Risco Atual**: Colaborador rejeitado ainda pode acessar por 24h  
**Código**:

```javascript
export const isAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' });
  }

  // Fast path
  if (decoded.isAdmin) {
    // ✅ NOVO: Validar status_colaborador se aplicável
    if (decoded.role === 'colaborador') {
      const status = decoded.status_colaborador || 'pendente';
      if (status !== 'aprovado') {
        return res.status(403).json({
          message: 'Colaborador não está aprovado para acessar este recurso.',
          status_colaborador: status
        });
      }
    }
    
    req.user = decoded;
    return next();
  }

  // Slow path with improved error handling
  try {
    const user = await Usuario.unscoped().findByPk(decoded.id).catch(() => null);

    if (!user) {
      console.warn(`[AUTH] Usuário não encontrado no DB: ${decoded.id}`);
      return res.status(401).json({
        message: 'Usuário não encontrado.',
        success: false
      });
    }

    // ✅ NOVO: Validar status_colaborador
    if (user.role === 'colaborador' && user.status_colaborador !== 'aprovado') {
      console.warn(`[AUTH] Acesso negado - Colaborador não aprovado: ${decoded.id}, status=${user.status_colaborador}`);
      return res.status(403).json({
        message: 'Colaborador não está aprovado para acessar este recurso.',
        status_colaborador: user.status_colaborador,
        success: false
      });
    }

    if (user.isAdmin || user.role === 'admin') {
      req.user = { ...decoded, isAdmin: true, role: user.role, status_colaborador: user.status_colaborador };
      return next();
    }
  } catch (dbErr) {
    // ✅ NOVO: Logging mais específico
    console.error('[AUTH] Erro crítico na validação de admin:', {
      userId: decoded.id,
      error: dbErr.message,
      timestamp: new Date().toISOString()
    });
    
    // Falha segura: NEGAR acesso em caso de erro
    return res.status(500).json({
      message: 'Erro ao validar credenciais. Tente novamente.',
      success: false,
      code: 'AUTH_DB_ERROR'
    });
  }

  return res.status(403).json({
    message: 'Acesso negado. Você não tem permissão para acessar este recurso.',
    success: false
  });
};

export default isAdmin;
```

---

## 🔒 IMPLEMENTAÇÃO CURTO PRAZO (2-3 horas)

### FIX #4: Centralizar Permission Validation (Escolher Role OR isAdmin)

**Decisão**: Usar `role` como source-of-truth, `isAdmin` apenas para compatibilidade

**Arquivo**: `BackEnd/middlewares/roleMiddleware.js`

```javascript
import jwt from 'jsonwebtoken';
import Usuario from '../models/User.js';

/**
 * DECISÃO ARQUITETURAL:
 * - `role` é a source of truth (estudante, colaborador, admin)
 * - `isAdmin` é descontinuado (manter apenas para compatibilidade)
 * - Todos os novos usuários devem ter role, isAdmin será deprecated
 */

const permissionMap = {
  'estudante': [
    'ver_torneios',
    'participar_torneios',
    'ver_ranking',
    'criar_questao',      // ✅ NOVO: colaborador pode ser estudante
    'editar_questao_propria',
    'deletar_questao_propria'
  ],
  'colaborador': [
    'criar_questao',
    'editar_questao_propria',
    'deletar_questao_propria',
    'ver_minhas_questoes',
    'ver_torneios',
    'participar_torneios',
    'ver_ranking'
  ],
  'admin': ['*']
};

/**
 * Normaliza role: converte isAdmin=true para role='admin'
 * DEPRECATED: isAdmin será removido em v4.0
 */
const getNormalizedRole = (user) => {
  // Se isAdmin=true mas role != 'admin', normalizar
  if (user.isAdmin && user.role !== 'admin') {
    console.warn(`[COMPAT] Usuário ${user.id} tem isAdmin=true mas role='${user.role}'. Normalizando para 'admin'.`);
    return 'admin';
  }
  
  return user.role || 'estudante';
};

/**
 * Verifica se um usuário tem permissão para uma ação
 */
const checkRolePermission = (user, requiredPermissions) => {
  if (!user) return false;

  const userRole = getNormalizedRole(user);
  const userPermissions = permissionMap[userRole] || [];

  // Admin tem todas as permissões
  if (userPermissions.includes('*')) {
    return true;
  }

  // Normalizar requiredPermissions
  const required = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  // Verificar todas as permissões
  return required.every(perm => userPermissions.includes(perm));
};

/**
 * Middleware para validar role
 */
export const createRoleMiddleware = (requiredRoles) => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({
        message: 'Token não fornecido.',
        success: false
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(401).json({
        message: 'Token inválido.',
        success: false
      });
    }

    const rolesArray = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];

    // Fast path: verificar JWT
    let userRole = getNormalizedRole(decoded);
    if (rolesArray.includes(userRole)) {
      req.user = decoded;
      return next();
    }

    // Slow path: verificar database
    try {
      const user = await Usuario.unscoped()
        .findByPk(decoded.id)
        .catch(() => null);

      if (!user) {
        console.warn(`[AUTH] Usuário não encontrado: ${decoded.id}`);
        return res.status(401).json({
          message: 'Usuário não encontrado.',
          success: false
        });
      }

      // ✅ Normalizar role do DB
      userRole = getNormalizedRole(user);

      if (rolesArray.includes(userRole)) {
        req.user = {
          ...decoded,
          role: userRole,
          isAdmin: userRole === 'admin',  // Compatibilidade
          disciplina_colaborador: user.disciplina_colaborador,
          status_colaborador: user.status_colaborador
        };
        return next();
      }
    } catch (dbErr) {
      console.error('[AUTH] Erro ao validar role:', {
        userId: decoded.id,
        error: dbErr.message
      });
      
      // Falha segura
      return res.status(500).json({
        message: 'Erro ao validar acesso. Tente novamente.',
        success: false
      });
    }

    return res.status(403).json({
      message: 'Acesso negado. Seu role não tem permissão para este recurso.',
      required_roles: rolesArray,
      user_role: userRole,
      success: false
    });
  };
};

export const isAdminRole = createRoleMiddleware(['admin']);
export const isColaboradorRole = createRoleMiddleware(['colaborador']);
export const isColaboradorOrAdmin = createRoleMiddleware(['colaborador', 'admin']);

export { checkRolePermission, getNormalizedRole };
export default createRoleMiddleware;
```

---

### FIX #5: Rate Limiting no Login
**Arquivo**: `BackEnd/index.js`  
**Antes de**: `app.post('/auth/login', ...)`

```javascript
import rateLimit from 'express-rate-limit';

// ✅ NOVO: Rate limiter para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,                     // máximo 5 tentativas
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,      // Retorna info no header `RateLimit-*`
  legacyHeaders: false,
  skip: (req) => {
    // Não limitar se for requisição interna/teste
    return req.ip === '127.0.0.1' && process.env.NODE_ENV === 'test';
  }
});

// Aplicar limiter
app.post('/auth/login', loginLimiter, validate(rules.login), async (req, res) => {
  // ... resto do código
});
```

**Instalação**:
```bash
npm install express-rate-limit
```

---

### FIX #6: Audit Logging
**Arquivo Novo**: `BackEnd/models/AuditLog.js`

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  actor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do usuário que realizou a ação'
  },
  action: {
    type: DataTypes.ENUM(
      'CREATE',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'PERMISSION_CHANGE',
      'ADMIN_ACCESS'
    ),
    allowNull: false
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tipo de entidade afetada (User, Questao, etc)'
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID da entidade afetada'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Detalhes da ação (antes/depois, parâmetros, etc)'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('success', 'failure', 'unauthorized'),
    allowNull: false,
    defaultValue: 'success'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  indexes: [
    { fields: ['actor_id', 'createdAt'] },
    { fields: ['action', 'createdAt'] },
    { fields: ['entity_type', 'entity_id'] }
  ]
});

export default AuditLog;
```

**Função Helper**: `BackEnd/utils/auditLog.js`

```javascript
import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async (options) => {
  const {
    actor_id,
    action,
    entity_type,
    entity_id,
    details,
    ip_address,
    user_agent,
    status = 'success'
  } = options;

  try {
    await AuditLog.create({
      actor_id,
      action,
      entity_type,
      entity_id,
      details: details || {},
      ip_address,
      user_agent,
      status
    });
  } catch (error) {
    console.error('[AUDIT] Erro ao registrar evento:', error);
    // Não falha a requisição se audit log falhar
  }
};

export const getAuditLog = (options = {}) => {
  const { actor_id, action, start_date, end_date, limit = 100, offset = 0 } = options;

  const where = {};
  if (actor_id) where.actor_id = actor_id;
  if (action) where.action = action;
  if (start_date || end_date) {
    where.createdAt = {};
    if (start_date) where.createdAt[Op.gte] = new Date(start_date);
    if (end_date) where.createdAt[Op.lte] = new Date(end_date);
  }

  return AuditLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};
```

**Uso**:
```javascript
// Em UserController.js
import { logAuditEvent } from '../utils/auditLog.js';

export const deleteUser = async (req, res) => {
  // ...
  const { id } = req.params;
  const actor_id = req.user.id;
  
  const user = await Usuario.findByPk(id);
  
  await user.destroy();
  
  // ✅ Registrar no audit log
  await logAuditEvent({
    actor_id,
    action: 'DELETE',
    entity_type: 'Usuario',
    entity_id: id,
    details: {
      deleted_user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    },
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
    status: 'success'
  });
  
  res.json({ success: true });
};
```

---

## 🔐 IMPLEMENTAÇÃO MÉDIO PRAZO (3-4 horas)

### FIX #7: Migrar JWT para httpOnly Cookies

**Arquivo**: `BackEnd/index.js` (função login)

```javascript
// APÓS gerar token JWT:

res.cookie('comaes_token', token, {
  httpOnly: true,           // ✅ Não acessível via JavaScript
  secure: process.env.NODE_ENV === 'production',  // HTTPS only em prod
  sameSite: 'strict',       // ✅ Previne CSRF
  maxAge: 24 * 60 * 60 * 1000,  // 24 horas
  path: '/'
});

res.json({
  success: true,
  data: userSafe,
  // token é agora httpOnly cookie (não enviar no JSON!)
});
```

**Frontend**: Remover localStorage JWT

```javascript
// FrontEnd/src/context/AuthContext.jsx
const login = (userObj, jwtToken = null) => {
  const normalized = normalize(userObj || {});
  setUser(normalized);
  // ❌ REMOVER: localStorage.setItem('comaes_token', jwtToken);
  localStorage.setItem('comaes_user', JSON.stringify(normalized));
};
```

**Configurar CORS para Cookies**:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,  // ✅ Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### FIX #8: Token Refresh Flow

**Novo Endpoint**: `BackEnd/index.js`

```javascript
app.post('/auth/refresh', async (req, res) => {
  try {
    // Token vem do httpOnly cookie (automaticamente)
    const token = req.cookies.comaes_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido.'
      });
    }

    // Verificar token (pode estar expirado)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      // Verificar com ignoreExpiration para refresh
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'secret',
          { ignoreExpiration: true }
        );
      } catch (e) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido.'
        });
      }
    }

    // Buscar usuário atualizado
    const user = await Usuario.unscoped().findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    // Gerar novo token
    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        disciplina_colaborador: user.disciplina_colaborador,
        status_colaborador: user.status_colaborador
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Enviar novo token em cookie
    res.cookie('comaes_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Token renovado com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao renovar token.'
    });
  }
});
```

**Frontend**: Chamar refresh periodicamente

```javascript
// FrontEnd/src/context/AuthContext.jsx
useEffect(() => {
  if (!token) return;

  // Renovar token a cada 22 horas
  const refreshInterval = setInterval(async () => {
    try {
      await axios.post('/auth/refresh');
      console.log('[AUTH] Token renovado com sucesso');
    } catch (err) {
      console.error('[AUTH] Erro ao renovar token:', err);
      logout();  // Forçar novo login
    }
  }, 22 * 60 * 60 * 1000);

  return () => clearInterval(refreshInterval);
}, [token, logout]);
```

---

## 📊 RESUMO DAS CORREÇÕES

| FIX | Arquivo | Prioridade | Tempo | Risco |
|-----|---------|-----------|-------|-------|
| 1. TableManager Whitelist | FrontEnd/adminService.js | CRÍTICA | 15min | Baixo |
| 2. Admin Master Protection | BackEnd/UserController.js | CRÍTICA | 10min | Médio |
| 3. Status Validação | BackEnd/isAdmin.js | CRÍTICA | 15min | Médio |
| 4. Centralizar Permission | BackEnd/roleMiddleware.js | CRÍTICA | 30min | Alto |
| 5. Rate Limiting | BackEnd/index.js | ALTA | 10min | Baixo |
| 6. Audit Logging | BackEnd/models + utils | ALTA | 45min | Baixo |
| 7. httpOnly Cookies | BackEnd + FrontEnd | MÉDIA | 30min | Médio |
| 8. Token Refresh | BackEnd/index.js | MÉDIA | 30min | Médio |

**Total**: ~3 horas para CRÍTICA, ~6 horas para tudo

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Imediato:
- [ ] FIX #1: TableManager whitelist
- [ ] FIX #2: Admin master protection
- [ ] FIX #3: Status colaborador validation
- [ ] Testar login e admin panel
- [ ] Verficar build `npm run build`

### Curto Prazo:
- [ ] FIX #4: Centralizar permission logic
- [ ] FIX #5: Rate limiting
- [ ] FIX #6: Audit logging
- [ ] Criar migration para tabela audit_logs
- [ ] Seed com primeiro admin

### Médio Prazo:
- [ ] FIX #7: httpOnly cookies
- [ ] FIX #8: Token refresh
- [ ] Testar logout/refresh flow
- [ ] Documentar mudanças de API

---

## 🚀 COMO APLICAR (Ordem Recomendada)

1. **Clonar branch feature**:
   ```bash
   git checkout -b security/fix-auth-vulnerabilities
   ```

2. **Implementar FIX #1-3** (imediato):
   ```bash
   # Editar arquivos
   npm run lint
   npm run build
   # Testar frontend
   ```

3. **Implementar FIX #4-6** (curto prazo):
   ```bash
   npm install express-rate-limit
   # Editar arquivos
   npm run build
   # Testar admin panel
   ```

4. **Implementar FIX #7-8** (médio prazo):
   ```bash
   # Editar arquivos
   npm run build
   # Testar completo: login → admin → logout → refresh
   ```

5. **Commit e Push**:
   ```bash
   git add .
   git commit -m "Security: Fix 12 critical vulnerabilities in auth/authorization"
   git push origin security/fix-auth-vulnerabilities
   ```

6. **Create PR com descrição completa** (incluir este documento)

---

## ⚠️ RISCOS E MITIGAÇÕES

| Risco | Mitigação |
|-------|-----------|
| Break existing auth | Implementar em branches separados, testar cada fix |
| DB connection during slow path | Adicionar timeout, fallback seguro |
| Rate limiting legítimo | Whitelist para admin, maior janela para prod |
| Cookie domain issues | Testar em localhost, staging, prod |
| Audit log table não existe | Criar migration antes de usar |

