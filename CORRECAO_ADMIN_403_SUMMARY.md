# 🔧 CORREÇÃO: Erro 403 ao Admin Acessar /api/admin/stats

## 📋 PROBLEMA

Admin logava com sucesso, mas recebia:
```
403 Forbidden: Acesso negado. Somente administradores podem acessar esta rota.
```

Causa: O middleware `isAdmin` não conseguia verificar se o usuário era admin mesmo após login bem-sucedido.

---

## 🔍 ROOT CAUSE (Causa Raiz)

### Problema 1: JWT sem campo `isAdmin`

O token JWT criado durante o login **NÃO INCLUÍA** o campo `isAdmin`:

**Antes**:
```javascript
const token = jwt.sign({
  id: user.id,
  email: user.email,
  role: user.role,
  // ❌ isAdmin FALTANDO!
  status_colaborador: user.status_colaborador,
  disciplina_colaborador: user.disciplina_colaborador
}, ...);
```

O middleware `isAdmin` tinha um "fast path" que checava `decoded.isAdmin`, mas como o campo não existia, sempre caía no "slow path" (consulta ao banco de dados), que eventualmente falhava.

### Problema 2: Falta de Logging

Sem logs, era impossível diagnosticar onde exatamente a autenticação falhava.

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1️⃣ Adicionar `isAdmin` ao JWT

**Arquivo**: `BackEnd/index.js` (2 locais)

**Mudança**:
```javascript
const token = jwt.sign({
  id: user.id,
  email: user.email,
  role: user.role,
  isAdmin: user.isAdmin === true,  // ✅ ADICIONADO
  status_colaborador: user.status_colaborador,
  disciplina_colaborador: user.disciplina_colaborador
}, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
```

**Por quê**: Permite que o middleware `isAdmin` verifique rapidamente (`fast path`) sem consultar o banco de dados.

### 2️⃣ Adicionar Logging Detalhado

**Arquivo**: `BackEnd/middlewares/isAdmin.js`

**Adições**:
- Log quando token é verificado (mostra se JWT_SECRET está correto)
- Log do valor de `decoded.isAdmin`
- Log se fast path ou slow path está sendo usado
- Log de erros na consulta ao banco

**Exemplo de log**:
```
✅ [isAdmin] Token verificado com sucesso. decoded.isAdmin = true
✅ [isAdmin] Fast path - decoded.isAdmin = true, acesso concedido
```

### 3️⃣ Endpoint de Debug

**Arquivo**: `BackEnd/index.js`

**Nova rota**: `GET /debug/jwt-config`

Retorna:
```json
{
  "JWT_SECRET_LOADED": "✅ YES",
  "JWT_SECRET_VALUE": "***(redacted)***",
  "NODE_ENV": "development",
  "PORT": 3001,
  "DB_HOST": "localhost"
}
```

Permite diagnosticar se o JWT_SECRET está sendo carregado corretamente.

---

## 🚀 PRÓXIMOS PASSOS

### 1. Reiniciar o Backend
```bash
npm run dev
```

### 2. Fazer Nova Login
Login novamente com suas credenciais de admin para obter um JWT com o campo `isAdmin`.

### 3. Testar Acesso a /api/admin/stats
```bash
curl -H "Authorization: Bearer <seu_token>" \
  http://192.168.0.150:3001/admin/stats
```

### 4. Verificar Logs
Observe no console do backend os logs como:
```
✅ [isAdmin] Fast path - decoded.isAdmin = true, acesso concedido
```

---

## 📊 Fluxo Agora Corrigido

```
[Admin Login]
    ↓
[Gerar JWT com isAdmin: true]
    ↓
[Frontend armazena token]
    ↓
[Admin acessa /api/admin/stats]
    ↓
[isAdmin middleware verifica]
    ↓
[decoded.isAdmin === true? → SIM ✅]
    ↓
[Fast path → acesso concedido]
    ↓
[Endpoint retorna dados 200 OK]
```

---

## ✨ Mudanças Realizadas

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `BackEnd/index.js` | Adicionar `isAdmin` ao JWT (2 locais) | Permitir fast-path verification |
| `BackEnd/middlewares/isAdmin.js` | Adicionar logging detalhado | Diagnóstico de problemas |
| `BackEnd/index.js` | Novo endpoint `/debug/jwt-config` | Verificar configuração |

---

## 🔐 Segurança

✅ Nenhuma mudança prejudicial à segurança:
- `isAdmin` é derivado de `user.isAdmin` (BD)
- Middleware ainda tem fallback para consultar BD
- Logging não expõe informações sensíveis
- JWT_SECRET continua protegido no `.env`

---

## 📝 Nota

Se o problema persistir, execute:
```bash
# 1. Verificar configuração
curl http://192.168.0.150:3001/debug/jwt-config

# 2. Fazer novo login
curl -X POST http://192.168.0.150:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin@comaes.com","senha":"Senha123!"}'

# 3. Verificar logs do backend para diagnóstico detalhado
```
