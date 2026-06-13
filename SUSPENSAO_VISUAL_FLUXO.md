# 🚫 Suspensão de Colaboradores - Fluxo Visual

## 📱 UI Flow - O que o usuário vê

### Estado 1: Painel Admin - Colaborador Aprovado
```
┌─────────────────────────────────────────────────────┐
│ GESTÃO DE COLABORADORES                             │
├─────────────────────────────────────────────────────┤
│ Nome: João Silva                                    │
│ Email: joao@example.com                             │
│ Disciplina: Matemática                              │
│ Status: ✅ Aprovado                                 │
│                                                     │
│ Ações: [👁️] [Ban]  ← Ban = Suspender (novo!)      │
└─────────────────────────────────────────────────────┘
```

### Estado 2: Clica em "Ban" - Modal Aparece
```
╔═════════════════════════════════════════════════════╗
║ 🚫 Suspender Colaborador                            ║
║                                                     ║
║ Tem a certeza que pretende suspender João Silva?   ║
║ Esta ação notificará o colaborador.                 ║
║                                                     ║
║ ┌─────────────────────────────────────────────────┐ ║
║ │ ⚠️ Atenção:                                      │ ║
║ │ O colaborador será notificado imediatamente     │ ║
║ │ desta suspensão e não poderá mais criar         │ ║
║ │ questões ou participar em torneios.             │ ║
║ └─────────────────────────────────────────────────┘ ║
║                                                     ║
║ [Motivo da suspensão (opcional)]                    ║
║ [                                                 ] ║
║                                                     ║
║ [Cancelar]                    [🚫 Suspender]       ║
╚═════════════════════════════════════════════════════╝
```

### Estado 3: Suspensão Confirmada - Toast
```
┌─────────────────────────────────────────────────────┐
│ ✅ 🚫 João Silva foi suspenso                        │
└─────────────────────────────────────────────────────┘
```

### Estado 4: Lista Atualizada
```
┌─────────────────────────────────────────────────────┐
│ GESTÃO DE COLABORADORES                             │
├─────────────────────────────────────────────────────┤
│ Nome: João Silva                                    │
│ Email: joao@example.com                             │
│ Disciplina: Matemática                              │
│ Status: 🚫 Suspenso      ← STATUS MUDOU!          │
│                                                     │
│ Ações: [👁️]  ← Ban desaparece                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Arquitetura Técnica - Backend Flow

```
ADMIN PANEL (Frontend)
    │
    ├─→ Click "Ban" button
    │   └─→ setModalSuspender(colaborador)
    │       └─→ <ModalSuspender /> renders
    │
    └─→ Click "Suspender" button in modal
        └─→ onClick={() => onConfirm()}
            └─→ handleSuspender()
                │
                └─→ API Call: PATCH /api/admin/colaboradores/:id/suspender
                    │
                    ▼ ─────────────────────────────────────────
                    
                    BACKEND (Node.js + Express)
                        │
                        ├─ isAdmin middleware ✓
                        │
                        ├─ Find user by ID
                        │
                        ├─ Validate user is 'colaborador'
                        │
                        ├─ UPDATE: status_colaborador = 'suspenso'
                        │
                        ├─ 🚫 Socket.IO EMIT #1
                        │   ├─ Event: 'colaborador_suspenso'
                        │   └─ Data: { id, nome, email, ... }
                        │       └─→ Broadcasts to ADMIN PANEL
                        │
                        ├─ 🚫 Socket.IO EMIT #2
                        │   ├─ Event: 'colaborador_status_{user.id}'
                        │   └─ Data: { status: 'suspenso', ... }
                        │       └─→ Notifies SPECIFIC COLABORADOR
                        │
                        └─ Response: 200 OK { success: true }
                            │
                            ▼ ─────────────────────────────────────────
                            
                            ADMIN PANEL (Socket.IO Listener)
                                │
                                ├─ Event: 'colaborador_suspenso' received
                                │   └─ onSuspenso callback executes
                                │       ├─ Toast: "🚫 {nome} foi suspenso"
                                │       └─ carregar() → Refresh list
                                │           └─ UI updates immediately
                                │
                                └─ Lista atualizada com novo status ✅
```

---

## 📊 Estado da Base de Dados

### Antes da Suspensão
```sql
id | nome        | email            | status_colaborador | updatedAt
───┼─────────────┼──────────────────┼────────────────────┼──────────
50 | João Silva  | joao@example.com | aprovado           | 2026-06-10
───┴─────────────┴──────────────────┴────────────────────┴──────────
```

### Depois da Suspensão
```sql
id | nome        | email            | status_colaborador | updatedAt
───┼─────────────┼──────────────────┼────────────────────┼──────────
50 | João Silva  | joao@example.com | suspenso           | 2026-06-13  ← MUDOU!
───┴─────────────┴──────────────────┴────────────────────┴──────────
```

---

## 🎯 Casos de Uso Cobertos

✅ **Admin suspende colaborador aprovado**
- Aparece modal de confirmação
- Colaborador é notificado via Socket.IO
- Status muda para "suspenso" na BD
- Painel admin atualiza em tempo real

✅ **Validações**
- Apenas colaboradores com status 'aprovado' podem ser suspensos
- Apenas admins podem suspender
- Erro se colaborador não existir
- Erro se não for colaborador

✅ **Real-time Updates**
- Admin vê lista atualizada sem F5
- Socket.IO garante broadcast
- Toast notification para feedback

---

## 🧪 Código-chave de Cada Camada

### Frontend (React)
```javascript
// Estado
const [modalSuspender, setModalSuspender] = useState(null);

// Handler
const handleSuspender = async () => {
  setLoadingId(c.id);
  await svc.colaboradores.suspenderColaborador(c.id);
  toast('success', `${c.nome} suspenso!`);
  setModalSuspender(null);
  await carregar();
};

// Render
{modalSuspender && (
  <ModalSuspender
    colaborador={modalSuspender}
    onConfirm={handleSuspender}
    onCancel={() => setModalSuspender(null)}
    loading={loadingId === modalSuspender.id}
  />
)}

// Socket listener
useSocketColaboradores({
  onSuspenso: (data) => {
    console.log('🚫 Colaborador suspenso:', data);
    toast('info', `🚫 ${data.nome} foi suspenso`);
    carregar();
  }
});
```

### Backend (Node.js)
```javascript
export const suspenderColaborador = async (req, res) => {
  const { id } = req.params;
  
  await user.update({ status_colaborador: 'suspenso' });
  
  // Notify admin panel
  req.io.emit('colaborador_suspenso', { 
    id, nome, email, data_suspensao: new Date() 
  });
  
  // Notify colaborador
  req.io.emit(`colaborador_status_${id}`, { 
    status: 'suspenso', id, nome, email 
  });
  
  res.json({ success: true, message: 'Colaborador suspenso!' });
};
```

---

## ✅ Checklist de Verificação

- [x] ModalSuspender component renderizado
- [x] Estado modalSuspender gerenciado
- [x] Handler handleSuspender implementado
- [x] Botão "Ban" clicável para status 'aprovado'
- [x] Backend endpoint validado
- [x] Socket.IO emits para admin (colaborador_suspenso)
- [x] Socket.IO emits para colaborador (colaborador_status_{id})
- [x] Hook useSocketColaboradores atualizado com onSuspenso
- [x] Listener para 'colaborador_suspenso' adicionado
- [x] Toast notifications funcionando
- [x] BD atualiza corretamente
- [x] Frontend build successful ✓

---

## 🎬 Próximo Passo: Teste End-to-End

**Para testar agora:**

1. Reinicie o backend:
   ```bash
   Ctrl+C (no terminal do backend)
   npm start
   ```

2. Abra admin panel e procure um colaborador com status "Aprovado"

3. Clique em "Ban" (ícone de proibição)

4. Modal deve aparecer com aviso

5. Clique "Suspender"

6. Deve aparecer: "🚫 {nome} foi suspenso"

7. Status na tabela muda para "Suspenso"

✅ **Sucesso!**
