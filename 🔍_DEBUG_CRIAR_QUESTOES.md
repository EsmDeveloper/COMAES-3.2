# 🔍 DEBUG: Colaborador não consegue criar questões

## ✅ O que foi verificado e está funcionando

1. **Backend API**: ✅ Status 201, criando questões com sucesso
2. **Banco de dados**: ✅ Questões sendo inseridas (ID: 714, 715, 716)
3. **Campos esperados**: ✅ `titulo`, `enunciado`, `disciplina`, etc.
4. **Formulário Frontend**: ✅ Corrigido para enviar `enunciado` em vez de `descricao`

## 🚨 Possíveis Problemas do Lado do Usuário

### 1️⃣ **Verificar Console do Navegador** (CRÍTICO)
```
Passos:
1. Abra http://localhost:5176 no navegador
2. Pressione F12 (DevTools)
3. Vá para aba "Console"
4. Tente criar uma questão
5. Procure por mensagens de erro em vermelho
```

**O que procurar:**
- ❌ "Network Error" → Backend não está respondendo
- ❌ "401 Unauthorized" → Token inválido ou expirado
- ❌ "400 Bad Request" → Dados faltando
- ❌ "500 Internal Server Error" → Erro no backend

### 2️⃣ **Verificar Network Tab**
```
Passos:
1. DevTools aberto (F12)
2. Aba "Network"
3. Tente criar questão
4. Procure pela requisição POST para /api/colaborador/questoes
5. Clique nela e verifique:
   - Status (deve ser 201)
   - Request Headers (Authorization token presente?)
   - Request Body (está enviando enunciado?)
   - Response (sucesso ou erro?)
```

### 3️⃣ **Verificar Auth Token**
```javascript
// No console do navegador, execute:
localStorage.getItem('token')
// Se retornar null ou vazio = problema de autenticação
```

### 4️⃣ **Verificar API Base URL**
```javascript
// No console, execute:
import.meta.env.VITE_API_BASE_URL
// Deve retornar: http://localhost:3001
```

## 🔧 Correções Aplicadas (Frontend)

### MinhasQuestoes.jsx
```javascript
// ANTES (❌ ERRADO):
formData = {
  titulo: '',
  descricao: '',  // ❌ ERRADO - backend espera 'enunciado'
  ...
}

// DEPOIS (✅ CORRETO):
formData = {
  titulo: '',
  enunciado: '',  // ✅ CORRETO - backend recebe 'enunciado'
  ...
}
```

### handleSubmit()
```javascript
// ANTES (❌ ERRADO):
const dadosParaSalvar = {
  ...formData,
  opcoes: formData.opcoes.filter(o => o.trim()),
  disciplina: disciplina.toLowerCase()
};

// DEPOIS (✅ CORRETO):
const dadosParaSalvar = {
  titulo: formData.titulo,
  enunciado: formData.enunciado,  // ✅ Mapeia corretamente
  disciplina: disciplina.toLowerCase(),
  dificuldade: formData.dificuldade,
  tipo: 'multipla_escolha',
  opcoes: formData.opcoes.filter(o => o.trim()),
  resposta_correta: formData.resposta_correta,
  pontos: formData.pontos
};
```

## 📊 Checklist de Teste

- [ ] Frontend rebuild (Ctrl+Shift+R no navegador para limpar cache)
- [ ] Login com conta de colaborador
- [ ] Navegar para "Minhas Questões"
- [ ] Clicar em "Nova Questão"
- [ ] Preencher formulário:
  - Título: "Teste"
  - Enunciado: "Qual é...?"
  - Dificuldade: "Fácil"
  - Alternativas: 4 opções
  - Selecionar resposta correta
  - Pontos: 10
- [ ] Clicar "Salvar"
- [ ] Verificar se aparece mensagem de sucesso
- [ ] Verificar se questão aparece na tabela

## 🐛 Se o erro persistir

1. **Verifique o console do backend**:
   ```
   npm start  # no terminal do BackEnd
   # Procure por erro ao criar questão
   ```

2. **Teste direto com API**:
   ```bash
   node test_frontend_payload.js  # no BackEnd
   # Deve retornar: ✅ SUCESSO! Questão criada com ID: XXX
   ```

3. **Limpe completamente o cache**:
   ```
   Ctrl+Shift+Delete → Limpar Cache → Recarregar página
   ```

4. **Reinicie tudo**:
   ```
   Frontend: Ctrl+C + npm run dev
   Backend: Ctrl+C + npm start
   ```

## 📝 Logs para Verificar

### Backend Log Esperado
```
✅ Banco conectado!
Executing (default): SELECT ... (criando questão)
Questão criada com ID: 716
Status: 201
```

### Frontend Log Esperado
```
✅ Questão salva
Status: 201
✅ Questão criada com sucesso!
```

## 🔗 URLs para Testar

- ✅ Frontend: `http://localhost:5176`
- ✅ Backend Health: `http://localhost:3001/health`
- ✅ API: `http://localhost:3001/api/colaborador/questoes`

---

**Quando conseguir criar questão:**
1. Marque todos os ✅ acima
2. Teste listar questões (GET /api/colaborador/questoes)
3. Teste editar questão existente
4. Teste deletar questão
