# ✅ CHECKLIST DE VERIFICAÇÃO - Real-Time Colaborador

## 🎯 FLUXO 1: Admin Aprova → Colaborador Recebe Instantâneo

### Setup Inicial
- [ ] Admin faz login
- [ ] Admin acessa Admin Panel → Colaboradores
- [ ] Colaborador faz login (outro browser/incógnito)
- [ ] Colaborador acessa `/painel` → Vê WaitingScreen (status pendente)

### Verificar Integração Socket.IO
- [ ] Browser console do Colaborador mostra: `✅ Socket.IO conectado (status colaborador)`
- [ ] Listener ativo: `colaborador_status_${userId}`
- [ ] Painel do Admin mostra usuário na lista "Pendentes"

### Testar Aprovação Instantânea
- [ ] Admin clica "Visualizar" → Modal abre
- [ ] Admin clica "Aprovar" → Seleciona disciplina → Confirma
- [ ] **[INSTANTÂNEO]** Tela do Colaborador MUDA para "🎉 Parabéns!"
- [ ] Console do Colaborador: `✅ Aprovação recebida via Socket.IO`
- [ ] Após 2s: Redireciona para `/painel/colaborador` (Dashboard)
- [ ] Admin Panel: Lista atualiza, usuário sai da "Pendentes"
- [ ] Admin vê toast notification confirmando

---

## 🎯 FLUXO 2: Admin Rejeita → Colaborador Recebe Instantâneo

### Setup
- [ ] Novo colaborador no WaitingScreen
- [ ] Está esperando aprovação
- [ ] Admin vê na lista de pendentes

### Testar Rejeição Instantânea
- [ ] Admin clica "Visualizar"
- [ ] Admin clica "Rejeitar" → Insere motivo → Confirma
- [ ] **[INSTANTÂNEO]** Tela do Colaborador MUDA para "❌ Solicitação Rejeitada"
- [ ] Console do Colaborador: `❌ Rejeição recebida via Socket.IO`
- [ ] Colaborador vê mensagem clara com motivo (se disponível)
- [ ] Admin Panel: Atualiza instantâneamente
- [ ] Admin vê toast notification

---

## 🎯 FLUXO 3: Fallback Polling (Socket.IO Falha)

### Simular Socket.IO desconectado
- [ ] Abrir DevTools → Network → Desabilitar WebSocket
- [ ] Colaborador no WaitingScreen
- [ ] Console mostra: `❌ Socket.IO desconectado`

### Testar Fallback
- [ ] Admin aprova colaborador
- [ ] Colaborador não vê mudança instantânea
- [ ] Após ~5s: WaitingScreen atualiza via polling
- [ ] Dados carregam de `/api/usuarios/me`
- [ ] Status muda para "aprovado" (com delay de até 5s)

---

## 🔍 VERIFICAÇÕES TÉCNICAS

### Backend
- [ ] `UserController.js` - `aprovarColaborador()`:
  ```javascript
  // Emite 2 eventos:
  req.io.emit('colaborador_aprovado', {...})  // admin
  req.io.emit(`colaborador_status_${user.id}`, {...})  // específico
  ```

- [ ] `UserController.js` - `rejeitarColaborador()`:
  ```javascript
  // Emite 2 eventos:
  req.io.emit('colaborador_rejeitado', {...})  // admin
  req.io.emit(`colaborador_status_${user.id}`, {...})  // específico
  ```

### Frontend
- [ ] Hook `useSocketColaboradorStatus.js` EXISTS
  ```
  ✅ /FrontEnd/src/hooks/useSocketColaboradorStatus.js
  ```

- [ ] Hook tem todos os listeners:
  - [ ] `connect` event
  - [ ] `disconnect` event
  - [ ] `colaborador_status_${userId}` event
  - [ ] error handler

- [ ] WaitingScreen.jsx imports hook:
  ```javascript
  import useSocketColaboradorStatus from '../hooks/useSocketColaboradorStatus';
  ```

- [ ] WaitingScreen integra hook com callbacks
- [ ] Polling ainda está ativo (fallback)

### Build
- [ ] Compilação bem-sucedida: ✅ 0 erros
- [ ] Tempo: ~40s
- [ ] Sem warnings de import/export

---

## 📊 DADOS ESTRUTURAIS

### Estrutura de Evento (Socket.IO)
```json
{
  "status": "aprovado|rejeitado",
  "id": 123,
  "email": "colab@example.com",
  "nome": "João Silva",
  "disciplina_colaborador": "matematica",
  "data_aprovacao": "2026-06-12T15:30:00Z"
}
```

### Estado da WaitingScreen
```
ANTES: status = 'waiting'
  ↓
Admin aprova
  ↓
DEPOIS: status = 'approved'
  ↓
2s depois: Redireciona
```

---

## 🎬 TESTE RÁPIDO (5 MINUTOS)

1. Terminal 1: Backend rodando (`npm start`)
2. Terminal 2: Frontend rodando (`npm run dev`)
3. Browser 1: Admin logado
4. Browser 2: Colaborador logado (em WaitingScreen)
5. **Action**: Admin clica Aprovar
6. **Expected**: Colaborador vê "Parabéns!" em <1s

---

## 📝 NOTAS IMPORTANTES

### Socket.IO Behavior
- URL detectada automaticamente: `VITE_API_URL` ou `http://hostname:3000`
- Reconnect automático se conexão cair
- Max 5 tentativas de reconexão
- Delay: 1s → 5s (exponential backoff)

### Polling Fallback
- Ainda ativo a cada 5s
- Garante que colaborador é notificado mesmo sem Socket.IO
- **NÃO remove**; co-existe com Socket.IO

### Performance
- Socket.IO event latency: <100ms
- Polling latency: ~5s
- Redireção após aprovação: 2s

---

## ⚠️ POSSÍVEIS PROBLEMAS

| Problema | Solução |
|----------|---------|
| Socket.IO não conecta | Verificar se backend está rodando; Socket.IO no port 3000 |
| Evento não chega | Verificar console do browser; URL está correta? |
| WaitingScreen não atualiza | Verificar se polling está ativo (fallback) |
| Redirect não funciona | Verificar `onApproved()` callback |
| Build falha | Verificar se `useSocketColaboradorStatus` foi importado |

---

## ✅ CONCLUSÃO

Quando todos os checks estiverem marcados, a implementação está **100% funcional** e pronta para produção!
