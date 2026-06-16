# 🚀 Como Iniciar o COMAES

## ⚠️ IMPORTANTE - Ordem de Inicialização

**Você PRECISA iniciar o Backend PRIMEIRO, depois o Frontend!**

---

## 1️⃣ Iniciar o Backend (Terminal 1)

```bash
cd BackEnd
npm install  # (só na primeira vez)
npm run dev
```

**Esperado:**
- Servidor rodando em `http://localhost:3001`
- Mensagem: `✓ Servidor rodando na porta 3001`
- Socket.IO conectado

---

## 2️⃣ Iniciar o Frontend (Terminal 2)

```bash
cd FrontEnd
npm install  # (só na primeira vez)
npm run dev
```

**Esperado:**
- Acesse em `http://localhost:5175`
- Ou `http://192.168.0.192:5175` (se acessar de outro device)

---

## 🔧 Se der erro de conexão (ERR_CONNECTION_TIMED_OUT)

### Verifique:
1. ✅ Backend está rodando? (veja Terminal 1)
2. ✅ Porta 3001 está aberta?
3. ✅ Está na mesma rede (192.168.0.192)?

### Tente:
```bash
# Terminal 1 (Backend)
cd BackEnd
npm run dev

# Aguarde mensagem de sucesso antes de abrir o Frontend
```

---

## 📱 Acessar de outro dispositivo

**No computador (onde roda backend):**
- Backend: `http://192.168.0.192:3001`
- Frontend: `http://192.168.0.192:5175`

**De outro device (celular, tablet, outro PC):**
- Acesse: `http://192.168.0.192:5175`

---

## ✅ Checklist

- [ ] Terminal 1: `npm run dev` no BackEnd
- [ ] Aguarde mensagem de sucesso
- [ ] Terminal 2: `npm run dev` no FrontEnd
- [ ] Abra `http://192.168.0.192:5175`
- [ ] Faça login como colaborador
- [ ] Dashboard carrega sem erro de conexão

---

## 🐛 Debug

Ver erros no console:
1. Abra DevTools (F12)
2. Aba "Console"
3. Procure por `ERR_CONNECTION_TIMED_OUT`
4. Se ver, backend não está rodando!

