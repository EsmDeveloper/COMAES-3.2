# 🚀 SOLUÇÃO POTENCIAL - Ver Documentos

**Status**: Investigação Avançada  
**Data**: 12 de Junho de 2026

---

## 🔍 DESCOBERTA IMPORTANTE

Analisando o código do backend em `colaboradorRegistroController.js`:

```javascript
// Linha 180
const user = await Usuario.unscoped().findByPk(id, {
  attributes: ['id', 'nome', 'email', 'documentos_colaborador'],
});
```

**Problema potencial**: `documentos_colaborador` é um campo **JSON** no BD:

```javascript
// User.js - Definição do campo
documentos_colaborador: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: null,
},
```

### Como o Sequelize retorna JSON

Dependendo da versão do Sequelize:

**Opção 1 (Sequelize 6+)**:
```javascript
// Retorna como array/object parseado
user.documentos_colaborador = [
  { nome_original: "...", ... },
  { nome_original: "...", ... }
]
```

**Opção 2 (Versões antigas)**:
```javascript
// Retorna como string JSON
user.documentos_colaborador = '[{"nome_original":"...", ...}]'
// ❌ Problema: Quando faz res.json({...data: '[...]'})
// ✅ Mas axios.json() vai stringificar de novo!
// Resultado: String dentro de Array dentro de Object
```

---

## ✅ SOLUÇÃO PROPOSTA

Modificar o backend para garantir que documentos é sempre um array:

### Opção A: Backend - Garantir parsing

```javascript
// BackEnd/controllers/colaboradorRegistroController.js - linha 176
export const getDocumentosColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Usuario.unscoped().findByPk(id, {
      attributes: ['id', 'nome', 'email', 'documentos_colaborador'],
    });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Colaborador não encontrado.' 
      });
    }
    
    // ✅ Garantir que documentos é sempre um array
    let documentos = user.documentos_colaborador || [];
    
    // Se for string (JSON stringificado), fazer parse
    if (typeof documentos === 'string') {
      try {
        documentos = JSON.parse(documentos);
      } catch {
        documentos = [];
      }
    }
    
    // Se não for array, retornar vazio
    if (!Array.isArray(documentos)) {
      documentos = [];
    }
    
    res.json({ 
      success: true, 
      data: documentos 
    });
    
  } catch (e) {
    console.error('Erro ao obter documentos:', e);
    res.status(500).json({ 
      message: 'Erro ao obter documentos.' 
    });
  }
};
```

---

### Opção B: Frontend - Tratamento robusto

```javascript
// FrontEnd/src/Administrador/ColaboradoresTab.jsx - linha 87
const carregarDocs = async () => {
  if (showDocs) { setShowDocs(false); return; }
  setLoadingDocs(true);
  try {
    const res = await svc.colaboradores.getDocumentos(colaborador.id);
    console.log('📄 [ModalDetalhes] Resposta bruta:', res);
    
    // Garantir que res.data é um array
    let docs = res.data || [];
    
    // Se for string, fazer parse
    if (typeof docs === 'string') {
      console.warn('⚠️ Documentos vêm como string, fazendo parse...');
      try {
        docs = JSON.parse(docs);
      } catch {
        docs = [];
      }
    }
    
    // Se não for array, retornar vazio
    if (!Array.isArray(docs)) {
      console.warn('⚠️ Documentos não é array:', typeof docs);
      docs = [];
    }
    
    console.log('✅ Documentos após tratamento:', docs);
    setDocs(docs);
    
  } catch (err) { 
    console.error('❌ Erro ao carregar documentos:', err);
    console.error('Status:', err.response?.status);
    console.error('Dados:', err.response?.data);
    setDocs([]); 
  }
  finally { setLoadingDocs(false); setShowDocs(true); }
};
```

---

## 🎯 QUAL USAR?

### Use Opção A (Backend) Se:
- Quer solução definitiva
- Prefere validar no servidor
- Todos os clientes são beneficiados

**Quando implementar**: Se logs do frontend mostram que docs é string

---

### Use Opção B (Frontend) Se:
- Quer solução rápida
- Backend não consegue mudar
- Quer ser defensivo no cliente

**Quando implementar**: Se logs mostram JSON stringificado

---

## 🧪 TESTE PARA CONFIRMAR

### Test 1: DevTools Network
```
GET /api/admin/colaboradores/123/documentos

Response:
{
  "success": true,
  "data": "[{...}]"  ← SE AQUI FOR STRING COM "[ ← PROBLEMA!
}

OU

{
  "success": true,
  "data": [{...}]    ← SE AQUI FOR ARRAY ← OK!
}
```

### Test 2: DevTools Console
```
// Com a alteração do frontend (Opção B):
Se vir:
⚠️ Documentos vêm como string, fazendo parse...

← Significa que é a causa! (usar Opção A no backend)

Se não vir warning:
✅ Documentos após tratamento: [...]

← Significa que está OK (não é esse o problema)
```

---

## 📝 IMPLEMENTAÇÃO RÁPIDA

Se quiser que implemente agora, avise qual:

1. **Opção A (Backend)**
   - Ficheiro: `BackEnd/controllers/colaboradorRegistroController.js`
   - Linhas: 176-189
   - Tempo: ~2 min
   - Risco: Nenhum (apenas parse seguro)

2. **Opção B (Frontend)**
   - Ficheiro: `FrontEnd/src/Administrador/ColaboradoresTab.jsx`
   - Linhas: 87-107
   - Tempo: ~1 min
   - Risco: Nenhum (tratamento defensivo)

3. **Ambas**
   - Tempo: ~3 min
   - Risco: Nenhum (cobertura completa)

---

## 🔄 PLANO DE AÇÃO

### Fase 1: Diagnóstico (Agora)
✅ Aplicar logs de debug (já feito)
⏳ Aguardar feedback do utilizador com mensagens do console

### Fase 2: Identificação
```
Se console mostrar:
- docs é string → implementar Opção A (backend) ou B (frontend)
- docs é array mas vazio [] → documentos não foram salvos
- 404 ou 401 → problema de autenticação
- Outro erro → ajustar conforme mensagem
```

### Fase 3: Correção
- Implementar Opção A, B, ou ambas conforme diagnóstico
- Build
- Testar

### Fase 4: Validação
- Confirmar que "Ver documentos" funciona
- Verificar renderização da lista
- Testar links de abrir/download

---

## 📊 RESUMO

| Fase | Status | Ação |
|------|--------|------|
| Logs | ✅ Feito | Espera feedback |
| Diagnóstico | ⏳ Pendente | Utilizador roda teste |
| Análise | ⏳ Pendente | Baseado em mensagens |
| Correção | ⏳ Pendente | Implementar Opção A/B |
| Validação | ⏳ Pendente | Testar funcionalidade |

---

## 📞 PRÓXIMOS PASSOS

1. **Você**:
   - Abra DevTools (F12)
   - Clique "Ver documentos"
   - Partilhe a mensagem do Console (com 📄 ou ❌)

2. **Eu**:
   - Analiso a mensagem
   - Identifica se é string/array/erro
   - Implemento Opção A ou B
   - Novo build
   - Você testa novamente

---

**Status**: Aguardando logs do console para determinar causa exata 🔍
