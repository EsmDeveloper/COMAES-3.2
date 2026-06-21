# 🎯 REESTRUTURAÇÃO COMPLETA DO SISTEMA - COMAES 3.2

**Data**: 21 de Junho de 2026  
**Status**: ✅ Arquitetura nova criada - PRONTO PARA IMPLEMENTAÇÃO FINAL

---

## 📋 O QUE FOI FEITO

### 1. ✅ NOVO SISTEMA DE AUTENTICAÇÃO/AUTORIZAÇÃO

**Arquivos NOVOS criados**:
- `BackEnd/middlewares/auth.js` - Autenticação JWT pura (SEM permissões)
- `BackEnd/middlewares/authorize.js` - Autorização baseada APENAS em role
- `BackEnd/utils/modelMapperSecure.js` - Whitelist estrita de modelos

**Arquivos MODIFICADOS**:
- `BackEnd/models/User.js` - **REMOVIDO campo isAdmin completamente**
- `BackEnd/middlewares/isAdmin.js` - Redirecionado para novo sistema
- `BackEnd/middlewares/roleMiddleware.js` - Redirecionado para novo sistema
- `BackEnd/controllers/GenericController.js` - Usa modelMapperSecure
- `FrontEnd/src/Administrador/adminService.js` - Whitelist estrita

---

## 🔥 MUDANÇAS CRÍTICAS

### isAdmin FOI ELIMINADO

```javascript
// ❌ ANTES (PROIBIDO):
user.isAdmin = true
if (decoded.isAdmin) { ... }
WHERE isAdmin = true

// ✅ AGORA (OBRIGATÓRIO):
user.role = 'admin'
if (req.user.role === 'admin') { ... }
WHERE role = 'admin'
```

### UMA Fonte de Verdade

```javascript
// ❌ ANTES: Múltiplos sistemas
- isAdmin.js (verifica decoded.isAdmin)
- roleMiddleware.js (verifica role)
- permissionMap (RBAC não usado)
- Funcao model (não usado)

// ✅ AGORA: Sistema único
- authenticate (auth.js) → Valida JWT, carrega user do DB
- requireRole (authorize.js) → Verifica role do DB
```

### Whitelist Estrita

```javascript
// ❌ ANTES: Qualquer modelo dinâmico
getModel(req.params.model) // Aceita QUALQUER string!

// ✅ AGORA: Whitelist absoluta
const ALLOWED_ADMIN_MODELS = {
  'usuario': Usuario,
  'torneio': Torneio,
  'noticia': Noticia,
  'notificacao': Notificacao,
  'questao': Questao,
  'certificado': Certificado
};

// Rejeita qualquer outro modelo
```

---

## 📁 ARQUIVOS QUE PRECISAM SER ATUALIZADOS

### Backend - CRÍTICO

1. **`BackEnd/index.js`** (login endpoint)
   - ❌ Remover todas referências a `isAdmin`
   - ✅ JWT deve conter APENAS `{id, role}`
   - ✅ Importar `authenticate` e `requireAdmin` dos novos middlewares

2. **`BackEnd/controllers/UserController.js`**
   - ❌ Remover todas referências a `isAdmin`
   - ❌ Remover `body.isAdmin`, `requestingUser.isAdmin`
   - ✅ Usar apenas `role` para verificações

3. **`BackEnd/controllers/adminStatsController.js`**
   - ❌ Linha 17: `WHERE isAdmin = true`
   - ✅ Mudar para: `WHERE role = 'admin'`

4. **`BackEnd/controllers/QuestoesController.js`**
   - ❌ Linhas 113, 750, 773, 1139, 1241, 1323: `req.user.isAdmin`
   - ✅ Mudar para: `req.user.role === 'admin'`

5. **`BackEnd/controllers/rankingController.js`**
   - ❌ Linhas 103, 114: `req.user?.isAdmin`
   - ✅ Mudar para: `req.user?.role === 'admin'`

6. **`BackEnd/controllers/colaboradorRegistroController.js`**
   - ❌ Linha 142: `isAdmin: false`
   - ✅ Remover linha completamente

7. **Todos os arquivos de rotas** (`BackEnd/routes/*.js`)
   - ❌ Remover `import isAdmin from '../middlewares/isAdmin.js'`
   - ✅ Usar:
     ```javascript
     import { authenticate } from '../middlewares/auth.js';
     import { requireAdmin } from '../middlewares/authorize.js';
     
     // Rotas admin:
     router.get('/admin/users', authenticate, requireAdmin, controller);
     ```

### Frontend - IMPORTANTE

1. **`FrontEnd/src/context/AuthContext.jsx`**
   - ❌ Remover qualquer referência a `isAdmin`
   - ✅ Usar apenas `user.role`

2. **`FrontEnd/src/Administrador/TableManager.jsx`**
   - ❌ REMOVER completamente `buildTableInfoFromData()`
   - ✅ Exigir STATIC_TABLE_DEFS ou schema do backend
   - ✅ Mostrar erro claro quando tabela não tem definição

3. **Todos os componentes admin** (`FrontEnd/src/Administrador/*.jsx`)
   - ❌ Remover `user.isAdmin`
   - ✅ Usar `user.role === 'admin'`

---

## 🔧 PRÓXIMOS PASSOS (ORDEM OBRIGATÓRIA)

### FASE 1: Backend Core (1-2 horas)

```bash
# 1. Atualizar index.js (login endpoint)
# 2. Atualizar UserController.js
# 3. Atualizar todos controllers que usam isAdmin
# 4. Atualizar todas as rotas para usar novos middlewares
# 5. Testar: npm run lint
```

### FASE 2: Database Migration (30 min)

```sql
-- 1. Backup da database
mysqldump -u root -p comaes_db > backup_before_migration.sql

-- 2. Remover coluna isAdmin (IRREVERSÍVEL!)
ALTER TABLE usuarios DROP COLUMN isAdmin;

-- 3. Garantir que todos admins têm role correto
UPDATE usuarios SET role = 'admin' WHERE role = 'admin' OR id = 1;

-- 4. Verificar
SELECT id, nome, email, role FROM usuarios WHERE role = 'admin';
```

### FASE 3: Frontend Update (1 hora)

```bash
# 1. Atualizar AuthContext
# 2. Atualizar TableManager (remover fallback)
# 3. Atualizar todos componentes admin
# 4. Testar: npm run build
```

### FASE 4: Testing (1 hora)

```bash
# 1. Login como admin
# 2. Acessar painel admin
# 3. Tentar cada aba do admin
# 4. Verificar que não há erros 403 inconsistentes
# 5. Verificar que "Usuários" não vira "Tabelas"
# 6. Tentar acessar modelo não autorizado (deve rejeitar)
```

---

## ✅ CRITÉRIOS DE SUCESSO

A reestruturação estará completa quando:

- [ ] ❌ Zero referências a `isAdmin` em todo o código
- [ ] ✅ JWT contém APENAS `{id, role}`
- [ ] ✅ Database não tem coluna `isAdmin`
- [ ] ✅ Todos middlewares usam `authenticate` + `requireRole`
- [ ] ✅ Frontend usa apenas `user.role`
- [ ] ✅ TableManager rejeita modelos não na whitelist
- [ ] ✅ Admin panel funciona sem erros 403
- [ ] ✅ Nenhuma mudança inesperada de UI
- [ ] ✅ `npm run build` bem-sucedido
- [ ] ✅ `npm run lint` sem erros

---

## 🚨 AVISOS CRÍTICOS

### ⚠️ MIGRATION DATABASE É IRREVERSÍVEL

Fazer BACKUP antes de dropar coluna `isAdmin`:

```bash
# OBRIGATÓRIO antes de alterar DB
mysqldump -u root -p comaes_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### ⚠️ TODOS TOKENS JWT ANTIGOS SERÃO INVÁLIDOS

Após mudança no payload do JWT, todos usuários precisarão fazer login novamente.

### ⚠️ TESTAR EM LOCALHOST PRIMEIRO

NÃO aplicar em produção sem testar completamente em ambiente de desenvolvimento.

---

## 📊 IMPACTO ESTIMADO

| Categoria | Antes | Depois | Mudança |
|-----------|-------|--------|---------|
| Middlewares de auth | 3 (conflitantes) | 2 (unificados) | -33% |
| Campos de permissão no User | 2 (isAdmin + role) | 1 (role apenas) | -50% |
| Modelos admin acessíveis | ∞ (dinâmico) | 6 (whitelist) | Finito |
| Sistemas de autorização | 4+ (conflitantes) | 1 (único) | -75% |
| Fallbacks dinâmicos | Sim (perigoso) | Não (seguro) | Eliminado |

---

## 🎓 ARQUITETURA FINAL

```
┌─────────────────────────────────────────────────────────────┐
│ REQUEST → authenticate → requireRole → Controller → Response │
└─────────────────────────────────────────────────────────────┘

authenticate (auth.js):
  1. Valida JWT (apenas id)
  2. Busca user completo do DB
  3. Anexa req.user = { id, nome, role, ... }
  4. Valida status_colaborador

requireRole (authorize.js):
  1. Verifica req.user.role
  2. Compara com roles permitidos
  3. Permite ou nega (403)

Controller:
  1. Usa req.user.role para lógica de negócio
  2. Sem verificações de permissão (já passou middleware)
  3. Retorna resposta
```

---

## 📞 SUPORTE

**Documentos relacionados**:
- `BackEnd/middlewares/auth.js` - Ver comentários inline
- `BackEnd/middlewares/authorize.js` - Ver exemplos de uso
- `BackEnd/utils/modelMapperSecure.js` - Ver whitelist

**Problemas conhecidos** após implementação:
- Todos tokens antigos expirados → Users fazem login novamente
- Fallback dinâmico removido → Tabelas sem STATIC_TABLE_DEFS mostram erro
- isAdmin removido do DB → Queries antigas falham

**Soluções**:
- Token: Normal, redesign intencional
- Tabelas: Adicionar definição em STATIC_TABLE_DEFS ou schema backend
- Queries: Atualizar para usar `role = 'admin'`

---

**Status**: ✅ ARQUITETURA PRONTA  
**Próximo passo**: Implementar FASE 1 (Backend Core)  
**Tempo estimado total**: 4-5 horas

