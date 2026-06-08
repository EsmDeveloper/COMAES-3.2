# 🔍 Debug: "Erro ao carregar blocos. Usando dados locais."

**Problema**: Mensagem de erro ao tentar carregar blocos do backend

**Cause**: Backend retornando erro ou dados em formato inesperado

---

## 🧪 Como Debugar

### Passo 1: Abrir DevTools
- Pressione: `F12`
- Vá a: **Console**

### Passo 2: Procurar pelos Logs
No console, procure por mensagens começando com:
- `📋` (informação)
- `❌` (erro)
- `✅` (sucesso)

**Exemplos:**
```
📋 Carregando blocos com filtros: {limit: 100}
❌ Erro ao chamar backend: 404 Not Found
```

### Passo 3: Identificar o Erro

Procure por `❌ Erro ao chamar backend:` seguido da mensagem de erro.

---

## 🔧 Possíveis Causas e Soluções

### Causa 1: Backend não está rodando

**Erro no console:**
```
❌ Erro ao chamar backend: fetch failed
```

**Solução**:
1. Abra terminal
2. Execute: `npm run dev` (no diretório do BackEnd)
3. Aguarde: `✅ Servidor rodando: http://0.0.0.0:3000`

### Causa 2: Endpoint não existe (404)

**Erro no console:**
```
❌ Erro ao chamar backend: 404 Not Found
```

**Solução**:
1. Verificar se endpoint `/api/blocos` está registrado
2. Backend → index.js → procure: `app.use('/api/blocos', blocosRoutes)`
3. Se não estiver, adicione

### Causa 3: Token inválido (401)

**Erro no console:**
```
❌ Erro ao chamar backend: 401 Unauthorized
```

**Solução**:
1. Fazer logout
2. Fazer login novamente
3. Token será renovado

### Causa 4: Permissão negada (403)

**Erro no console:**
```
❌ Erro ao chamar backend: 403 Forbidden
```

**Solução**:
- Usuário não tem permissão
- Precisa ser admin ou ter role correto
- Verifique middleware `isAdmin` ou `canManageQuestoes`

### Causa 5: Erro no servidor (500)

**Erro no console:**
```
❌ Erro ao chamar backend: 500 Internal Server Error
```

**Solução**:
1. Ver logs do backend no terminal
2. Procurar por erros em vermelho
3. Correção baseado no erro específico

---

## 🔎 Ver Resposta Exata do Backend

### DevTools → Network Tab

1. Abra DevTools (F12)
2. Vá a: **Network**
3. Faça uma ação que carregue blocos
4. Procure por: `GET /api/blocos`
5. Clique no request
6. Vá a: **Response**

**Você verá a resposta JSON:**
```json
{
  "success": true,
  "message": "...",
  "data": {
    "blocos": [...],
    "total": 50,
    "page": 1,
    "limit": 100,
    "totalPages": 1
  }
}
```

**Ou erro:**
```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

---

## ✅ Teste Rápido

### Terminal do Backend

Abra um terminal no diretório do backend e execute:

```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/blocos
```

**Esperado**: JSON com blocos

**Se erro**: Mostra mensagem de erro

---

## 📋 Checklist de Debug

- [ ] Backend está rodando em 3000?
- [ ] Frontend está rodando em 5176?
- [ ] Usuário está autenticado (tem token)?
- [ ] Token é válido?
- [ ] Endpoint `/api/blocos` está registrado?
- [ ] Middleware está permitindo acesso?
- [ ] Banco de dados tem dados?

---

## 🚀 Se Tudo Mais Falhar

1. **Reinicie backend**
   ```bash
   taskkill /F /IM node.exe
   npm run dev  # No diretório backend
   ```

2. **Reinicie frontend**
   ```bash
   # Terminal novo
   npm run dev  # No diretório do projeto
   ```

3. **Limpe cache do navegador**
   - Ctrl + Shift + Del
   - Limpe cache
   - Refresque: F5

4. **Relogin**
   - Faça logout
   - Faça login novamente

---

**Status**: 🔍 Debugar usando console logs!
