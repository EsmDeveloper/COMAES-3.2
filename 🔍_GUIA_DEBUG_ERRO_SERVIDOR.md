# 🔍 Guia de Debug: Erro do Servidor

**Objetivo:** Identificar a causa raiz do erro 500 no backend

---

## 📋 Passo 1: Verificar Console do Backend

### Abra Terminal/CMD onde o backend está rodando

Procure por mensagens como:

```
❌ Erro ao obter questões do colaborador: {
  userId: 1,
  erro: "...",
  stack: "...",
  sql: "..."
}
```

### Copie a mensagem de erro EXATA

Exemplo:
```
Unknown column 'Questao.createdAt' in 'order clause'
Cannot read property 'id' of undefined
Colaborador não aprovado
```

---

## 🌐 Passo 2: Verificar DevTools - Network Tab

### 1. Abra DevTools (F12)
### 2. Vá para aba "Network"
### 3. Recarregue a página (F5)
### 4. Procure requisição vermelha:

```
GET /api/colaborador/questoes?
Status: ❌ 500 (ou 403, 404)
```

### 5. Clique na requisição
### 6. Vá para aba "Response"
### 7. Copie a resposta JSON completa

**Exemplo de resposta:**
```json
{
  "sucesso": false,
  "mensagem": "Erro ao obter questões",
  "erros": {
    "detalhes": "Unknown column 'Questao.createdAt' in 'order clause'"
  },
  "timestamp": "2026-06-07T17:56:26.974Z"
}
```

---

## 📝 Passo 3: Verificar Console do Frontend

### 1. DevTools → Console
### 2. Procure por logs com 📡 ou ❌
### 3. Copie as mensagens

**Exemplo:**
```javascript
📡 Resposta do servidor: {
  status: 500,
  ok: false,
  body: {
    sucesso: false,
    mensagem: "Erro ao obter questões",
    erros: { detalhes: "..." }
  }
}
```

---

## 🧪 Passo 4: Testes Rápidos

### Teste 1: Verificar Conexão
```bash
# No terminal, teste se backend está respondendo
curl http://localhost:3000/

# Esperado: HTML ou JSON, não erro
```

### Teste 2: Testar Endpoint Diretamente
```bash
# Copie o Authorization header do DevTools
# Abra DevTools → Network → Selecione requisição GET /api/colaborador/questoes

# Copie o valor do header Authorization

# Então execute:
curl -H "Authorization: Bearer TOKEN_AQUI" \
  http://localhost:3000/api/colaborador/questoes

# Esperado: JSON com questões ou erro específico
```

### Teste 3: Verificar Database
```bash
# Verifique se o banco está rodando
# MySQL deve estar ativo na porta 3306

# Teste de conexão:
mysql -u root -p -h localhost

# Esperado: Acesso ao MySQL (digite 'exit' para sair)
```

---

## 🐛 Erros Comuns e Soluções

### Erro 1: `Unknown column 'Questao.createdAt'`
```
❌ Mensagem: Unknown column 'Questao.createdAt' in 'order clause'
✅ Solução: Verifique se ColaboradorController usa 'created_at' não 'createdAt'
✅ Arquivo: BackEnd/controllers/ColaboradorController.js linha 262
```

### Erro 2: `Colaborador não aprovado`
```
❌ Mensagem: Colaborador não aprovado. Aguarde aprovação do administrador.
✅ Solução: Admin deve aprovar o colaborador
✅ Verificar: status_colaborador = 'aprovado' na tabela usuarios
```

### Erro 3: `Acesso negado`
```
❌ Mensagem: Acesso negado. Apenas colaboradores podem acessar...
✅ Solução: Token expirado ou inválido
✅ Ação: Faça login novamente
```

### Erro 4: `Cannot read property`
```
❌ Mensagem: Cannot read property 'id' of undefined
✅ Solução: Middleware não está passando req.user corretamente
✅ Verificar: canManageQuestoes middleware
```

### Erro 5: `ECONNREFUSED`
```
❌ Mensagem: connect ECONNREFUSED 127.0.0.1:3306
✅ Solução: MySQL não está rodando
✅ Ação: Inicie MySQL
```

---

## 📊 Checklist de Investigação

- [ ] Backend está rodando? (teste `curl http://localhost:3000/`)
- [ ] MySQL está rodando? (teste conexão)
- [ ] Token é válido? (verifique em DevTools → Application → Cookies)
- [ ] Colaborador é aprovado? (check database ou admin panel)
- [ ] Rotas estão registradas? (verifique `colaboradorRoutes.js`)
- [ ] Controllers existem? (verifique `ColaboradorController.js`)
- [ ] Métodos existem? (procure `minhasQuestoes` e `criarQuestao`)
- [ ] SQL está correto? (procure `created_at` não `createdAt`)
- [ ] Logging está mostrando erro? (verifique console do backend)

---

## 💡 Dicas de Debug

### 1. Adicionar Logs Temporários
```javascript
// No backend, adicione no início do método:
console.log('🔍 DEBUG:', {
  userId: req.user?.id,
  role: req.user?.role,
  status: req.user?.status_colaborador,
  disciplina: req.user?.disciplina_colaborador
});
```

### 2. Testar Query Direto
```javascript
// Node REPL
const Questao = require('./models/Questao');
Questao.findAll({ where: { autor_id: 1 } })
  .then(q => console.log(q))
  .catch(e => console.error(e));
```

### 3. Usar Postman/Insomnia
- Crie requisição GET para `http://localhost:3000/api/colaborador/questoes`
- Adicione header: `Authorization: Bearer TOKEN`
- Veja resposta completa

---

## 📞 Quando Reportar

Se após seguir estes passos o erro persistir, reporte com:

1. **Mensagem de erro exata** (do console ou Network tab)
2. **Stack trace** (do backend console)
3. **Resposta JSON** (do Network tab Response)
4. **Seu arquivo**: `BackEnd/controllers/ColaboradorController.js` linhas 260-265
5. **Seu arquivo**: `BackEnd/routes/colaboradorRoutes.js` últimas 10 linhas

---

## ✅ Quando Funcionar

Você saberá que está funcionando quando:

```javascript
// Console Frontend mostra:
📡 Resposta do servidor: {
  status: 200,
  ok: true,
  body: {
    sucesso: true,
    dados: {
      questoes: [...]  // Array com questões ou vazio
    }
  }
}

// E NO CONSOLE DO BACKEND:
✅ Questões carregadas com sucesso: 0  // ou N questões
```

---

**Boa sorte com o debug!** 🎯
