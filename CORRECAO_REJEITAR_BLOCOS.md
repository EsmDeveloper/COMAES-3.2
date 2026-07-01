# ✅ CORREÇÃO: Não Conseguia Rejeitar Blocos Pendentes

## 🔍 PROBLEMA

Ao tentar rejeitar um bloco pendente através do painel administrativo, mesmo preenchendo a justificativa, a ação não funcionava.

## 🎯 CAUSA RAIZ

**Incompatibilidade entre Frontend e Backend:**

### Frontend estava enviando:
```javascript
await axios.post(`/api/admin/blocos/${id}/rejeitar`, { motivo }, { ... });
```

### Backend estava esperando:
```javascript
const { motivo_rejeicao, observacoes } = req.body;

if (!motivo_rejeicao || motivo_rejeicao.trim().length === 0) {
  return respostaErro(res, 400, 'Motivo da rejeição é obrigatório');
}
```

O frontend enviava `motivo` mas o backend esperava `motivo_rejeicao`, causando validação falhar e rejeição ser bloqueada.

## ✨ SOLUÇÃO IMPLEMENTADA

### Correção no Frontend:

**Arquivo:** `FrontEnd/src/Administrador/QuestoesPendentesTab.jsx`

**Antes:**
```javascript
const handleRejeitarBloco = async (id, motivo) => {
  setActionLoading(id);
  try {
    await axios.post(`${apiBaseUrl}/api/admin/blocos/${id}/rejeitar`, 
      { motivo },  // ❌ Campo errado
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // ...
  }
};
```

**Depois:**
```javascript
const handleRejeitarBloco = async (id, motivo) => {
  setActionLoading(id);
  try {
    await axios.post(`${apiBaseUrl}/api/admin/blocos/${id}/rejeitar`, 
      { motivo_rejeicao: motivo },  // ✅ Campo correto
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // ...
  }
};
```

## 🧪 COMO TESTAR

1. Acesse o painel administrativo
2. Vá para a aba "Questões Pendentes"
3. Clique em "Blocos Pendentes"
4. Clique no botão "Rejeitar" (ícone X vermelho) em qualquer bloco
5. Preencha o motivo da rejeição (mínimo 1 caractere)
6. Clique em "Rejeitar"
7. ✅ O bloco deve ser rejeitado com sucesso
8. ✅ Deve aparecer toast de sucesso: "Bloco rejeitado."
9. ✅ O bloco deve desaparecer da lista

## 📋 CAMPOS ESPERADOS PELO BACKEND

### Rota: `POST /api/admin/blocos/:id/rejeitar`

**Body esperado:**
```javascript
{
  motivo_rejeicao: string (obrigatório, não vazio),
  observacoes: string (opcional)
}
```

**Validação no backend:**
- `motivo_rejeicao` deve existir
- `motivo_rejeicao.trim().length` > 0
- Se falhar, retorna erro 400: "Motivo da rejeição é obrigatório"

## 🔄 FLUXO COMPLETO

1. **Usuário clica em "Rejeitar":**
   - `openRejectModal(bloco, 'bloco')` é chamado
   - Estado `questaoSelecionada` recebe `{ ...bloco, tipo: 'bloco' }`
   - Modal `ConfirmarComMotivoModal` abre

2. **Usuário preenche motivo e confirma:**
   - Modal valida que motivo não está vazio
   - Chama `onConfirm(motivo)`
   - Verifica `questaoSelecionada.tipo === 'bloco'`
   - Chama `handleRejeitarBloco(id, motivo)`

3. **Frontend envia para backend:**
   - `POST /api/admin/blocos/${id}/rejeitar`
   - Body: `{ motivo_rejeicao: motivo }`
   - Headers: `{ Authorization: Bearer ${token} }`

4. **Backend processa:**
   - Valida `motivo_rejeicao`
   - Busca bloco no banco
   - Verifica se status é 'pendente'
   - Atualiza status para 'rejeitado'
   - Salva motivo e ID do admin
   - Retorna sucesso

5. **Frontend atualiza UI:**
   - Fecha modal
   - Remove bloco da lista (dispatch REMOVE_BLOCO)
   - Mostra toast de sucesso
   - Remove loading state

## 📂 ARQUIVOS MODIFICADOS

- ✅ `FrontEnd/src/Administrador/QuestoesPendentesTab.jsx`

## 📂 ARQUIVOS RELACIONADOS (não modificados)

- `FrontEnd/src/Administrador/shared/QuestaoCardsComponents.jsx` (ConfirmarComMotivoModal)
- `BackEnd/controllers/ColaboradorBlocosQuestoesControllerV2.js` (rejeitarBlocoAdmin)
- `BackEnd/routes/colaboradorBlocosQuestoesRoutes.js`

---

**Data:** 22/06/2026  
**Status:** ✅ Corrigido - Aguardando Teste
**Prioridade:** Alta (funcionalidade crítica do admin)
