# 🔧 FIX: Erro ao Carregar Questões em MinhasQuestoes.jsx

**Data:** 7 de Junho de 2026  
**Status:** ✅ Corrigido

---

## 🐛 Problema

O componente `MinhasQuestoes.jsx` exibia erro:
```
❌ Erro ao carregar questões
❌ Erro ao obter questões
```

### Stack Trace do Navegador
```
questoesService.js:56:24 - throw new Error("Erro ao obter questões")
MinhasQuestoes.jsx:368 - await questoesService.listar(params)
MinhasQuestoes.jsx:372 - catch block captured error
```

---

## 🔍 Causa Raiz

O método `questoesService.listar()` estava:

1. **Tentando determinar a rota dinamicamente** com `getApiRoute()`
2. **`getApiRoute()`** decodifica o JWT para verificar o role do usuário
3. **Se isso falhar**, retorna fallback `/api/questoes`
4. **/api/questoes** para um colaborador retorna erro 403 ou 404
5. **O serviço lança erro genérico** "Erro ao obter questões"

### Fluxo Problemático
```
MinhasQuestoes.listar()
  ↓
getApiRoute() 
  ├─ Decodifica JWT
  ├─ Verifica role = 'colaborador'?
  ├─ Se sim: retorna '/api/colaborador/questoes'
  ├─ Se não/erro: retorna '/api/questoes' (FALLBACK)
  ↓
fetch('/api/questoes') para colaborador
  ↓
❌ 403/404 (Acesso negado para colaborador)
  ↓
Lança "Erro ao obter questões"
```

---

## ✅ Solução Implementada

### 1. Novo Método Específico: `listarColaborador()`

**arquivo:** `FrontEnd/src/services/questoesService.js`

```javascript
/**
 * Listar questões do colaborador - endpoint específico para colaboradores
 */
async listarColaborador(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const res = await fetch(`${apiBaseUrl}/api/colaborador/questoes?${queryParams}`, {
    headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Erro ao listar questões:', data);
    throw new Error(data.mensagem || data.message || 'Erro ao obter questões');
  }
  return data;
}
```

**Benefícios:**
- ✅ Usa endpoint correto `/api/colaborador/questoes` diretamente
- ✅ Sem tentativa de detecção dinâmica
- ✅ Melhor logging de erros
- ✅ Mais confiável

### 2. Atualização de MinhasQuestoes.jsx

**Antes:**
```javascript
const response = await questoesService.listar(params);
```

**Depois:**
```javascript
// Usar endpoint específico para colaborador
const response = await questoesService.listarColaborador(params);
```

### 3. Melhor Logging no Serviço

Adicionado `console.error()` em:
- ✅ `listarColaborador()` - novo método
- ✅ `listar()` - melhor debug
- ✅ `criar()` - log de erros
- ✅ `atualizar()` - log de erros

**Exemplo:**
```javascript
if (!res.ok) {
  console.error('Erro ao listar questões:', data);
  throw new Error(data.mensagem || data.message || 'Erro ao obter questões');
}
```

### 4. Melhor Mensagem de Erro na UI

**Antes:**
```
Erro ao carregar questões
[Tentar novamente]
```

**Depois:**
```
Erro ao carregar questões
Erro ao obter questões

💡 Verifique se você está logado como colaborador aprovado 
   e se o servidor está respondendo.

[Tentar novamente]
```

---

## 🧪 Como Testar a Correção

### Teste 1: Verificar Console
1. Abra DevTools (F12)
2. Vá para aba "Console"
3. Acesse `/minhas-questoes` como colaborador
4. ✅ Deve ver logs: `Usando rota: /api/colaborador/questoes`

### Teste 2: Verificar Network
1. Abra DevTools (F12)
2. Vá para aba "Network"
3. Recarregue a página
4. ✅ Deve haver requisição com sucesso:
   ```
   GET /api/colaborador/questoes
   Status: 200
   ```

### Teste 3: Funcionamento Completo
1. Login como **colaborador aprovado**
2. Clique em **"Minhas Questões"**
3. ✅ Deve carregar sem erro
4. Questões devem aparecer em lista

### Teste 4: Criar Questão
1. Na página de "Minhas Questões"
2. Clique **"Nova Questão"**
3. Preencha e clique **"Criar Questão"**
4. ✅ Questão deve ser criada sem erro

---

## 📊 Comparação Antes e Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Método usado** | `listar()` com detecção dinâmica | `listarColaborador()` direto |
| **Endpoint** | Fallback para `/api/questoes` | Sempre `/api/colaborador/questoes` |
| **Logging** | Genérico | Detalhado com console.error |
| **Erro visível** | Vago | Com dica de solução |
| **Confiabilidade** | Baixa (fallback) | Alta (endpoint direto) |

---

## 🔍 Debug: Como Verificar Qual Problema Você Tinha

Se ainda estiver com erro, abra DevTools → Console e procure por:

### Erro 1: JWT Decodificação Falhou
```
❌ Erro ao listar questões: {
  "sucesso": false,
  "mensagem": "Acesso negado"
}
```
**Causa:** Token expirado ou inválido  
**Solução:** Faça login novamente

### Erro 2: Endpoint Não Existe
```
❌ Erro ao listar questões: {
  "sucesso": false,
  "mensagem": "Not Found"
}
```
**Causa:** Backend não tem endpoint `/api/colaborador/questoes`  
**Solução:** Verifique se rota foi adicionada em `BackEnd/routes/colaboradorRoutes.js`

### Erro 3: Colaborador Não Aprovado
```
❌ Erro ao listar questões: {
  "sucesso": false,
  "mensagem": "Colaborador não aprovado"
}
```
**Causa:** `status_colaborador` não é 'aprovado'  
**Solução:** Admin deve aprovar o colaborador

### Erro 4: Servidor Offline
```
❌ Erro ao listar questões: {
  "message": "Failed to fetch"
}
```
**Causa:** Backend não está rodando  
**Solução:** Inicie o servidor backend

---

## 📁 Arquivos Modificados

**Frontend:**
- ✅ `FrontEnd/src/services/questoesService.js`
  - Adicionado método `listarColaborador()`
  - Melhorado logging em `listar()`, `criar()`, `atualizar()`

- ✅ `FrontEnd/src/Paginas/Secundarias/MinhasQuestoes.jsx`
  - Alterado `questoesService.listar()` → `questoesService.listarColaborador()`
  - Melhorada mensagem de erro com dica

---

## 🚀 Próximas Recomendações

1. **Monitorar console** durante testes para capturar logs
2. **Adicionar retry automático** com backoff exponencial
3. **Implementar timeout** em requisições
4. **Adicionar analytics** para rastrear erros em produção
5. **Cache local** de questões para modo offline

---

## ✅ Checklist Pós-Correção

- ✅ Método `listarColaborador()` implementado
- ✅ `MinhasQuestoes.jsx` usando novo método
- ✅ Logging melhorado em questoesService
- ✅ Mensagem de erro mais útil na UI
- ✅ Sem erros de compilação
- ✅ Sem warnings não tratados

---

**Implementado por:** Kiro Assistant  
**Data de Conclusão:** 7 de Junho de 2026
