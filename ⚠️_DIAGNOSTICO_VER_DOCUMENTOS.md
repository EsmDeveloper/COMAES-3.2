# ⚠️ DIAGNÓSTICO - Ver Documentos Não Funciona

**Status**: 🔴 Em Investigação  
**Build**: ✅ Compilado com Logs de Debug  
**Data**: 12 de Junho de 2026

---

## 🚨 PROBLEMA RELATADO

Quando clica em "Ver documentos enviados" para um colaborador que ENVIOU documentos:
- ❌ A página fica em branco / mostra lista vazia
- ❌ Nenhum documento aparece
- ❌ Possível erro silencioso

---

## 🔧 MUDANÇAS APLICADAS

Adicionei **console.log detalhado** para identificar onde o problema está:

### Frontend (ColaboradoresTab.jsx)

Agora quando clica "Ver documentos", verá no **Console do Browser**:

```javascript
// Se sucesso:
📄 [ModalDetalhes] carregarDocs - Resposta API: { success: true, data: [...] }
📄 [ModalDetalhes] Documentos carregados: [...]

// Se erro:
❌ [ModalDetalhes] Erro ao carregar documentos: [erro]
❌ [ModalDetalhes] Status: 404 (ou outro)
❌ [ModalDetalhes] Mensagem: "Colaborador não encontrado"
❌ [ModalDetalhes] Detalhes completos: {...}
```

---

## 🧪 COMO DIAGNOSTICAR

### Passo 1: Abrir DevTools
```
1. Ir ao painel admin
2. Clicar num colaborador (que enviou documentos)
3. Modal abre
4. Pressionar F12 para abrir DevTools
5. Ir à aba "Console"
```

### Passo 2: Clicar "Ver documentos enviados"
```
1. No modal, clicar botão "Ver documentos enviados"
2. DevTools → Console automaticamente mostrará mensagens
3. Procurar por:
   - "📄 [ModalDetalhes]" (sucesso)
   - "❌ [ModalDetalhes]" (erro)
```

### Passo 3: Copiar a Mensagem de Erro
Se vir mensagem com ❌, copie tudo e partilhe:
- Status HTTP
- Mensagem de erro
- Detalhes completos

---

## 📝 POSSÍVEIS RESULTADOS

### Cenário 1: Sucesso ✅
```
📄 [ModalDetalhes] carregarDocs - Resposta API: {
  success: true,
  data: [
    {
      nome_original: "CV.pdf",
      nome_ficheiro: "docs_12345_cv.pdf",
      caminho: "/uploads/colaborador-docs/docs_12345_cv.pdf",
      tipo: "application/pdf",
      tamanho: 123456,
      data_upload: "2024-06-12T10:30:00.000Z"
    }
  ]
}

📄 [ModalDetalhes] Documentos carregados: [...]
```

**Esperado**: Lista de documentos aparece com:
- Nome do ficheiro
- Tamanho
- Data
- Ícone "Abrir" (👁)
- Ícone "Download" (⬇)

---

### Cenário 2: Erro 404 (Colaborador não encontrado)
```
❌ [ModalDetalhes] Erro ao carregar documentos: Error: Request failed with status code 404
❌ [ModalDetalhes] Status: 404
❌ [ModalDetalhes] Mensagem: "Colaborador não encontrado."
❌ [ModalDetalhes] Detalhes completos: { message: "Colaborador não encontrado." }
```

**Causa**: ID do colaborador está incorreto  
**Solução**: Verificar se o ID é válido

---

### Cenário 3: Erro 401 (Não autenticado)
```
❌ [ModalDetalhes] Erro ao carregar documentos: Error: Request failed with status code 401
❌ [ModalDetalhes] Status: 401
❌ [ModalDetalhes] Mensagem: "Unauthorized"
```

**Causa**: Token expirou ou não é válido  
**Solução**: Fazer logout e login novamente

---

### Cenário 4: Erro 403 (Sem permissão)
```
❌ [ModalDetalhes] Erro ao carregar documentos: Error: Request failed with status code 403
❌ [ModalDetalhes] Status: 403
❌ [ModalDetalhes] Mensagem: "Forbidden"
```

**Causa**: Utilizador não é admin  
**Solução**: Verifique se está logado como admin

---

### Cenário 5: Dados vazios (sem documentos)
```
📄 [ModalDetalhes] carregarDocs - Resposta API: {
  success: true,
  data: []
}

📄 [ModalDetalhes] Documentos carregados: []
```

**Resultado Visual**: "📄 Nenhum documento foi enviado por este colaborador."  
**Motivo**: Colaborador não enviou documentos no registro

---

## 🔍 VERIFICAÇÕES ADICIONAIS

### Network Tab (DevTools)
```
1. Pressionar F12
2. Ir a "Network"
3. Filter: "documentos"
4. Clicar "Ver documentos"
5. Deve aparecer:
   
   GET /api/admin/colaboradores/[ID]/documentos
   Status: 200 OK
   
   Response:
   {
     "success": true,
     "data": [...]
   }
```

---

### Verificar ID do Colaborador
```javascript
// DevTools → Console
// Cole isto:

// Quando a aba de colaboradores está aberta:
// Clique num colaborador para abrir modal
// Depois faça (no console):
document.body.innerText  // Procure pelo ID nas informações

// OU procure no Network tab
// GET /api/admin/colaboradores/:id/documentos
// Veja o ID na URL
```

---

## 📋 CHECKLIST PARA RELATAR BUG

Se o problema persistir, envie:

- [ ] Screenshot do DevTools Console com mensagem ❌
- [ ] Status HTTP do erro
- [ ] Mensagem de erro completa
- [ ] ID do colaborador (encontra em Network → GET .../documentos)
- [ ] Nome do colaborador
- [ ] Ele ENVIOU documentos no registro? (Sim/Não)

---

## 🛠️ BUILDS REALIZADOS

### Build 1 (Correção Inicial)
- **Motivo**: Adicionar console.error ao carregarDocs
- **Mudanças**: Tratamento de erro melhorado
- **Status**: ✅ Compilado
- **Time**: 43.19s

---

## 📞 PRÓXIMOS PASSOS

1. **Você (User)**
   - [ ] Atualize o build
   - [ ] Abra DevTools (F12)
   - [ ] Clique "Ver documentos"
   - [ ] Copie a mensagem do Console

2. **Eu (Kiro)**
   - [ ] Aguardo mensagem de erro / sucesso
   - [ ] Se erro: Identifico causa
   - [ ] Se sucesso: Confirmo que funcionou
   - [ ] Se dados vazios: Verifico se documentos foram salvos

---

## 🧩 POSSÍVEL CAUSA RAIZ

Baseado na análise do código:

1. **API está correta** ✅
   - Endpoint registrado: GET /api/admin/colaboradores/:id/documentos
   - Middleware de autenticação presente
   - Resposta formatada corretamente

2. **Frontend está correto** ✅
   - adminService.getDocumentos() chama URL certa
   - Acesso a res.data está correto
   - Renderização tem fallbacks para vazio

3. **Possível problema**:
   - ❓ Documentos não foram salvos no registro (BD vazio)
   - ❓ Token expirou (401)
   - ❓ Colaborador não tem permissão (403)
   - ❓ ID é inválido (404)
   - ❓ Erro silencioso no try-catch anterior

**Com os logs adicionados, vamos saber exatamente qual é!**

---

**Status**: Aguardando seu feedback com mensagens do Console 🔍
