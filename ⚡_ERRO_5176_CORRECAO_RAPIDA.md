# ⚡ Erro: ERR_CONNECTION_REFUSED na Porta 5176

**Problema**: `GET http://localhost:5176/ net::ERR_CONNECTION_REFUSED`

**Causa**: Vite (frontend) não está rodando

**Solução**: Iniciar Vite manualmente

---

## 🚀 Solução Rápida (1 minuto)

### Passo 1: Abra um Terminal NOVO
```
# NÃO use o terminal do Kiro/Node!
# Abra um novo terminal (cmd, PowerShell, etc)
```

### Passo 2: Navigate para a pasta
```powershell
cd "c:\Users\HP PROBOOK 440 G5\Desktop\COMAES-3.2"
```

### Passo 3: Inicie o Vite
```powershell
npm run dev
```

### Passo 4: Aguarde mensagem de sucesso
```
  VITE v5.4.21  ready in 234 ms

  ➜  Local:   http://localhost:5176/
  ➜  press h + enter to show help
```

### Passo 5: Refresque o navegador
- Press: `F5` ou `Ctrl + R`

---

## ✅ Se Funcionar

Você verá:
- ✅ Página carrega sem erro
- ✅ Console sem erros 500
- ✅ Sistema funciona normalmente

---

## ❌ Se Ainda Não Funcionar

### Erro: "command not found: npm"
```bash
# Node.js não está instalado
# Reinstale Node.js de https://nodejs.org/
```

### Erro: "vite: command not found"
```bash
# Dependencies não instaladas
npm install
npm run dev
```

### Erro: Porta 5176 já em uso
```bash
# Outra aplicação usa a porta
# Solução: Mude o Vite para porta diferente em vite.config.js

# Ou cancele a aplicação usando porta 5176:
netstat -ano | findstr :5176
taskkill /PID <PID> /F
npm run dev
```

---

## 🔄 Arquitetura

```
Frontend (Vite)
   porta 5176
   ↓
Backend (Express/Node.js)
   porta 3000
   ↓
Database (MySQL)
   porta 3306
```

**Você precisa de AMBOS rodando:**
- ✅ Backend em 3000 (provavelmente já está)
- ✅ Frontend em 5176 (PRECISA INICIAR)

---

## 📋 Quick Reference

| O quê | Comando | Porta |
|------|---------|-------|
| Frontend (Vite) | `npm run dev` | 5176 |
| Backend (Node) | Já deve estar rodando | 3000 |
| Database | Já deve estar rodando | 3306 |

---

## 💡 Dica: Deixar Rodando

Para não ter que fazer isso sempre, deixe um terminal aberto com:
```powershell
npm run dev
```

Este terminal fica monitorando mudanças no código e atualiza o navegador automaticamente!

---

**Status**: Pronto!  
**Tempo**: 1 minuto  
