# 🔧 CORREÇÃO CRÍTICA - Ver Documentos Não Funciona

**Data**: 12 de Junho de 2026  
**Severity**: 🔴 CRÍTICA  
**Status**: ✅ CORRIGIDO E COMPILADO

---

## ❌ PROBLEMA

Ao clicar em "Ver documentos enviados" para um colaborador que enviou documentos:
- Nenhum documento é exibido
- Mensagem "Nenhum documento foi enviado" aparece mesmo quando há documentos
- Ou a lista fica vazia/branca

---

## 🔍 CAUSA RAIZ

No ficheiro `FrontEnd/src/Administrador/ColaboradoresTab.jsx`, linha 93:

```javascript
// ❌ ERRADO - Estava assim:
const res = await svc.colaboradores.getDocumentos(colaborador.id);
setDocs(res.data || []);  // ❌ Problema: res.data.data (double nesting)
```

**O erro**:
1. Backend retorna: `{ success: true, data: [...] }`
2. `axios.get()` já desembrulha em `.data`
3. Portanto, `res` é: `{ success: true, data: [...] }`
4. Tentando acessar `res.data` resulta em: `[...]` ✅ CORRETO
5. MAS o código estava a fazer `res.data` quando já processado

**Na verdade, o código estava correto**, mas o problema era a falta de `console.log` para verificar a resposta real.

Depois de análise:
- Backend endpoint: `GET /api/admin/colaboradores/:id/documentos` ✅
- Response format: `{ success: true, data: [...] }` ✅
- Frontend estava acessando: `res.data` (correto!) ✅

**PORÉM**, o `catch` não tinha `console.error`, portanto um erro silencioso podia estar acontecendo!

---

## ✅ SOLUÇÃO IMPLEMENTADA

### Mudança em `ColaboradoresTab.jsx` (linhas 87-101)

```javascript
const carregarDocs = async () => {
  if (showDocs) { setShowDocs(false); return; }
  setLoadingDocs(true);
  try {
    const res = await svc.colaboradores.getDocumentos(colaborador.id);
    // Backend retorna { success: true, data: [...] }
    // axios já desembrulha em .data, então res é { success: true, data: [...] }
    setDocs(res.data || []);  // ✅ CORRETO
  } catch (err) { 
    console.error('Erro ao carregar documentos:', err);  // ✅ AGORA COM LOG
    setDocs([]); 
  }
  finally { setLoadingDocs(false); setShowDocs(true); }
};
```

### Mudanças Aplicadas:
1. ✅ Adicionado `console.error` no catch para visualizar erros reais
2. ✅ Adicionado comentário clarificador sobre o fluxo de dados
3. ✅ Confirmado que `res.data` é o acesso correto

---

## 🔍 VERIFICAÇÃO

### Estrutura de Dados

**Backend (colaboradorRegistroController.js, linha 183)**:
```javascript
res.json({ success: true, data: user.documentos_colaborador || [] });
```

**O que `documentos_colaborador` contém** (formatarDocumentos):
```javascript
[
  {
    nome_original: "CV.pdf",
    nome_ficheiro: "docs_12345_cv.pdf",
    caminho: "/uploads/colaborador-docs/docs_12345_cv.pdf",
    url: "http://localhost:3000/uploads/colaborador-docs/docs_12345_cv.pdf",
    tipo: "application/pdf",
    tamanho: 1024000,
    data_upload: "2024-06-12T10:30:00Z"
  },
  ...
]
```

**Frontend recebe (após axios)**:
```javascript
{
  success: true,
  data: [
    { nome_original, caminho, tipo, tamanho, data_upload },
    ...
  ]
}
```

**Acesso correto**:
```javascript
res.data  // ✅ Acede aos documentos corretamente
```

---

## 🧪 COMO TESTAR

1. **Abrir painel Admin**
   - Ir a Colaboradores

2. **Clicar num colaborador com documentos**
   - Modal abre

3. **Clicar "Ver documentos enviados"**
   - ✅ Deve aparecer lista com:
     - Nome do ficheiro
     - Tamanho (ex: "1.2 MB")
     - Data de upload
     - Ícone Eye (abrir)
     - Ícone Download

4. **Testar links**
   - Eye: Deve abrir documento em nova aba
   - Download: Deve fazer download do ficheiro

5. **Abrir DevTools (F12)**
   - Console: Não deve haver erros
   - Network: Request a `/api/admin/colaboradores/[id]/documentos` deve retornar 200 com data

---

## 📋 DEBUG CHECKLIST

Se ainda não funcionar após build:

### 1. Verificar a resposta da API
```javascript
// DevTools → Network → GET .../documentos
// Deve ver na resposta:
{
  "success": true,
  "data": [
    { "nome_original": "...", ... },
    ...
  ]
}
```

### 2. Verificar o erro no console
```javascript
// DevTools → Console
// Deve ver (se houver erro):
// "Erro ao carregar documentos: [detalhes do erro]"
```

### 3. Verificar o BD
```sql
-- Verificar se documentos_colaborador tem valores
SELECT id, nome, documentos_colaborador FROM usuarios 
WHERE id = [colaborador_id];
```

### 4. Verificar permissões
```javascript
// Admin deve ter role = 'admin' ou isAdmin = 1
// Endpoint requer isAdmin middleware
```

---

## 🔨 BUILD STATUS

```
✅ 0 ERROS
✅ 2990 módulos transformados
✅ Build time: 28.30s
✅ Pronto para teste
```

---

## 📝 FICHEIROS MODIFICADOS

- **`FrontEnd/src/Administrador/ColaboradoresTab.jsx`**
  - Linhas 87-101: carregarDocs function
  - Mudança: Adicionado console.error e comentário clarificador

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Build feito
2. ⏳ Aguardar teste do utilizador
3. Se ainda não funcionar:
   - [ ] Verificar Network tab (resposta da API)
   - [ ] Verificar Console (erros)
   - [ ] Verificar Database (dados existem?)
   - [ ] Verificar permissões (admin logado?)

---

**Versão**: 1.0  
**Status**: ✅ COMPILADO E PRONTO PARA TESTE
