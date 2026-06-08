# 🔍 Guia Completo de Debug: Erro "listarColaborador"

## 📋 Resumo do Problema

O erro `resposta_servidor: undefined` ocorre quando o frontend tenta chamar o endpoint `/api/colaborador/questoes` mas recebe uma resposta inesperada. As causas possíveis são:

1. **Servidor backend não está rodando** ❌
2. **Problema de autenticação (token inválido ou expirado)** 🔐
3. **Usuário não é um colaborador aprovado** 👤
4. **Erro no endpoint do servidor** 💥
5. **Problema de CORS ou rede** 🌐

---

## 🔧 Passo 1: Verificar se o Servidor Backend está Rodando

### Teste direto no navegador:
1. Abra o navegador
2. Acesse: `http://localhost:3000/api/questoes`
3. Se receber uma resposta (JSON), o servidor está rodando ✓
4. Se receber "Não é possível acessar" ou erro de conexão, o servidor NÃO está rodando ❌

### Se o servidor NÃO está rodando:

**No BackEnd:**
```bash
cd BackEnd
npm install
npm start
```

Se isso não funcionar, tente com yarn:
```bash
npm install -g yarn
yarn install
yarn start
```

**Verificar se ficou rodando:**
```bash
# No PowerShell, você deve ver algo como:
# Servidor rodando na porta 3000
# Conexão com banco de dados: OK
```

---

## 🔐 Passo 2: Verificar Autenticação

### Abrir DevTools (F12 no navegador):

1. **Ir à aba "Application"** 
2. **Local Storage**
3. **Procurar por `comaes_token`**

Se a chave existir:
- ✓ Você está logado
- Copie o valor do token (será um longo texto)

Se a chave NÃO existir:
- ❌ Você não está logado
- **Solução:** Faça login novamente

### Verificar se o token é válido:

1. Copie o token do localStorage
2. Acesse: https://jwt.io
3. Cole o token na seção esquerda ("Encoded")
4. Veja o payload (seção do meio) - deve conter:
   - `id`: seu ID de usuário
   - `role`: deve ser `"colaborador"`
   - `status_colaborador`: deve ser `"aprovado"`

Se algum desses valores está errado:
- ❌ Faça logout e login novamente
- ❌ Verifique com administrador se sua conta foi aprovada

---

## 👤 Passo 3: Verificar Status do Colaborador

### No Console do Navegador (F12):

Digite:
```javascript
// Ver dados do usuário armazenados
localStorage.getItem('comaes_token')

// Ver se há informação de usuário
localStorage.getItem('user') || 'Não encontrado'
```

### Verificar via requisição manual:

No Console do Navegador:
```javascript
// Copiar e colar no console
fetch('http://localhost:3000/api/colaborador/questoes', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`,
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error('ERRO:', err.message))
```

**Possíveis Respostas:**

| Resposta | Significado | Solução |
|----------|-------------|---------|
| `{"sucesso": false, "mensagem": "Acesso negado"}` | Não é colaborador | Verificar permissões |
| `{"sucesso": false, "mensagem": "não aprovado"}` | Colaborador pendente | Aguardar aprovação do admin |
| `{"sucesso": true, "dados": {...}}` | ✓ Funcionando! | Nenhuma ação necessária |
| `Failed to fetch` | Servidor não respondeu | Verifique se está rodando |

---

## 🌐 Passo 4: Verificar Aba Network do DevTools

### Abrir Network Tab (F12):

1. **Abra DevTools (F12)**
2. **Vá à aba "Network"**
3. **Recarregue a página (F5)**
4. **Procure por uma requisição para `/api/colaborador/questoes`**

### Analisar a requisição:

**Status:**
- 🟢 200, 201: Sucesso ✓
- 🔴 401: Não autenticado (token inválido)
- 🔴 403: Acesso negado (não é colaborador ou não aprovado)
- 🔴 404: Endpoint não encontrado
- 🔴 500: Erro no servidor

**Response (Resposta):**

Clique na requisição → "Response" → Veja o JSON retornado

Se disser `"sucesso": false`, a mensagem pode ser útil para debug.

---

## 🐛 Passo 5: Verificar Logs do Backend

### Nos logs do Backend (onde você rodou `npm start`):

Procure por linhas como:
```
❌ Erro ao obter questões do colaborador
🔍 userId: 123
❌ erro: mensagem do erro
```

### Se houver erro SQL:

Exemplo:
```
sql: SELECT ... FROM questoes WHERE ...
```

Significa que há problema na query do banco de dados.

---

## 🔄 Passo 6: Teste de Conectividade Completo

### Copie e cole no Console do Navegador (F12):

```javascript
async function testarConexao() {
  console.log('🔍 Iniciando teste de conexão...\n');
  
  const token = localStorage.getItem('comaes_token');
  
  console.log('1. Token presente:', token ? '✓ SIM' : '✗ NÃO');
  
  try {
    console.log('2. Testando conexão com servidor...');
    const resp = await fetch('http://localhost:3000/api/colaborador/questoes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('   Status HTTP:', resp.status);
    const data = await resp.json();
    
    if (resp.ok) {
      console.log('✓ SUCESSO! Questões carregadas:');
      console.log('   Total:', data?.dados?.questoes?.length || 0);
    } else {
      console.log('✗ ERRO:', data?.mensagem || data?.message);
    }
    
    console.log('\n📋 Resposta completa:');
    console.log(data);
    
  } catch (err) {
    console.log('✗ ERRO DE CONEXÃO:', err.message);
    console.log('   Possível causa: Servidor não está rodando');
  }
}

testarConexao();
```

---

## 🚀 Solução Rápida (Se Tudo Falhar)

### 1. Limpar Cache:
```javascript
localStorage.clear();
sessionStorage.clear();
```
Recarregue a página e faça login novamente.

### 2. Reiniciar tudo:

**Terminal 1 - Backend:**
```bash
cd BackEnd
npm start
```

**Terminal 2 - Frontend:**
```bash
cd FrontEnd
npm run dev
```

### 3. Se ainda não funcionar:

**Verificar se a porta 3000 está em uso:**

No PowerShell:
```powershell
netstat -ano | findstr :3000
```

Se retornar um PID, mate o processo:
```powershell
taskkill /PID <PID_AQUI> /F
```

Depois relance o backend.

---

## 📝 Checklist de Resolução

- [ ] Servidor backend está rodando em `http://localhost:3000`
- [ ] Token `comaes_token` existe no localStorage
- [ ] Token contém `"role": "colaborador"`
- [ ] Token contém `"status_colaborador": "aprovado"`
- [ ] Network Tab mostra requisição com status 200 ou 201
- [ ] Console do navegador não mostra erros vermelhos
- [ ] Página exibe mensagem "Nenhuma questão encontrada" (se não há questões)

---

## 🆘 Se Nada Funcionar

1. **Abra o DevTools (F12)**
2. **Vá ao Console**
3. **Cole o código de teste do Passo 6**
4. **Copie toda a saída do console**
5. **Verifique os logs do backend** (terminal onde rodou `npm start`)
6. **Compartilhe essas informações com seu administrador**

---

## 📞 Informações para Suporte

Quando relatar o erro, inclua:

1. **Output do teste (Passo 6):**
   ```
   [cole aqui]
   ```

2. **Logs do backend:**
   ```
   [cole aqui os erros do terminal]
   ```

3. **Status da sua conta:**
   - Email:
   - Role: ☐ estudante ☐ colaborador ☐ admin
   - Status colaborador: ☐ pendente ☐ aprovado ☐ suspenso

4. **Ambiente:**
   - SO: Windows
   - Node.js: (rode `node --version`)
   - NPM: (rode `npm --version`)

---

**Última atualização:** Junho 2026
**Versão do Código:** Com melhorias de erro handling
