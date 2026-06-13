# ⚡ Quick Reference - Suspensão de Colaboradores

## ✅ Status: 100% Implementado

---

## 🎯 3 Mudanças Simples

### #1 - Frontend (ColaboradoresTab.jsx)
```javascript
// Adicione antes do </div> final:
{modalSuspender && (
  <ModalSuspender
    colaborador={modalSuspender}
    onConfirm={handleSuspender}
    onCancel={() => setModalSuspender(null)}
    loading={loadingId === modalSuspender.id}
  />
)}
```
✅ **Feito!**

---

### #2 - Backend (colaboradorRegistroController.js)
```javascript
// Dentro de suspenderColaborador():
if (req.io) {
  req.io.emit('colaborador_suspenso', {
    id: user.id,
    nome: user.nome,
    email: user.email,
    data_suspensao: new Date()
  });
  req.io.emit(`colaborador_status_${user.id}`, {
    status: 'suspenso',
    id: user.id,
    nome: user.nome
  });
}
```
✅ **Feito!**

---

### #3 - Hook (useSocketColaboradores.js)
```javascript
// Adicione parâmetro:
onSuspenso = null,

// Adicione listener:
socket.on('colaborador_suspenso', (data) => {
  if (onSuspenso) onSuspenso(data);
});

// Atualize dependency:
[enabled, ..., onSuspenso, ...]
```
✅ **Feito!**

---

## 🚀 Para Ativar

```bash
# 1. Backend
Ctrl+C
npm start

# 2. Testar
# Admin → Colaboradores → Ban (🚫) → Confirmar
```

---

## 🔄 Fluxo

```
Admin clica Ban → Modal → Confirma → API → Backend emite Socket.IO 
→ Frontend recebe → Toast + Refresh → Status muda ✅
```

---

## 📱 O Que User Vê

```
ANTES:
┌──────────────────┐
│ Colaborador      │
│ Status: Aprovado │
│ [👁️] [🚫]      │
└──────────────────┘

CLICA BAN ↓

MODAL APARECE:
╔════════════════════════╗
║ Suspender Colaborador? ║
║ [Cancelar] [Suspender] ║
╚════════════════════════╝

CONFIRMA ↓

TOAST:
┌──────────────────────────┐
│ ✅ João foi suspenso     │
└──────────────────────────┘

DEPOIS:
┌──────────────────┐
│ Colaborador      │
│ Status: Suspenso │
│ [👁️]            │
└──────────────────┘
```

---

## 🔍 Verificar

```javascript
// Console (F12):
// Deve aparecer: "🚫 Colaborador suspenso via Socket: {...}"

// Backend logs:
// Deve aparecer: "🚫 Colaborador ... suspenso por admin ..."

// Database:
// SELECT status_colaborador FROM usuarios WHERE id = 50
// Resultado: 'suspenso' ✅
```

---

## ⚠️ Importante

- ✅ Backend **RESTART** obrigatório
- ✅ Socket.IO deve estar em porta 3000
- ✅ Colaborador deve ter status 'aprovado'
- ✅ Admin deve estar logado

---

## 📝 Ficheiros

| Ficheiro | Local | Mudança |
|----------|-------|---------|
| 1 | FrontEnd/.../ColaboradoresTab.jsx | Render |
| 2 | BackEnd/.../colaboradorRegistroController.js | Socket.IO |
| 3 | FrontEnd/.../useSocketColaboradores.js | Listener |

---

## 🎬 Teste (2 min)

1. Backend: `npm start` ⏱️ 5s
2. Admin panel ⏱️ 10s
3. Encontrar colaborador aprovado ⏱️ 20s
4. Clicar Ban ⏱️ 1s
5. Confirmar ⏱️ 1s
6. Verificar toast + status ⏱️ 5s

---

## ✨ Output Esperado

| Componente | Output |
|-----------|--------|
| Toast | "🚫 {nome} foi suspenso" |
| Status Badge | "Suspenso" |
| Ban Button | Desaparece |
| Backend Log | "🚫 Colaborador ... suspenso..." |
| Frontend Log | "🚫 Colaborador suspenso via Socket" |
| Database | status_colaborador = 'suspenso' |

---

## 🐛 Debug

```
Modal não aparece?
  → Verificar status do colaborador
  → F12 → console → procurar erros

Status não muda?
  → Verificar se backend foi restarted
  → Verificar backend logs

Toast não aparece?
  → Verificar Socket.IO conectado
  → F12 → console → "Socket.IO conectado"
```

---

**Tudo pronto! 🎉 Reinicia backend e testa!**
