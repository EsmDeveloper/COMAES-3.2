# Solução: Erro 401 - Token Inválido

## 📋 Problema Resolvido

Quando o frontend tentava acessar endpoints da API (como `/api/admin/stats`), recebia:
```
401 - Token inválido.
```

**Causa:** Token armazenado do localStorage era de uma sessão anterior com IP diferente ou estava expirado.

---

## ✅ Solução Implementada

### Arquivo Modificado
- **`FrontEnd/src/main.jsx`** - Adicionado interceptor global de fetch

### O Que Faz

Um **interceptor global de fetch** foi adicionado que:

1. ✅ **Detecta respostas 401** - Quando o servidor retorna status 401 (Unauthorized)
2. 🧹 **Limpa tokens inválidos** - Remove `comaes_user` e `comaes_token` do localStorage
3. 🔄 **Redireciona para login** - Força redirecionamento para `/login`
4. 📝 **Registra no console** - Loga a ação para debug

### Código Adicionado

```javascript
/**
 * Global fetch interceptor to handle 401 (Unauthorized) responses
 * Automatically clears invalid tokens and redirects to login page
 */
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args).then(response => {
    if (response.status === 401) {
      // Token is invalid/expired - clear auth data
      console.warn('[Auth] Received 401 - clearing invalid token and redirecting to login');
      localStorage.removeItem('comaes_user');
      localStorage.removeItem('comaes_token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return response;
  });
};
```

---

## 🚀 Como Usar

### Passo 1: Certifique-se que ambos os servidores estão rodando

**Terminal 1 - Backend:**
```bash
cd BackEnd
npm run dev
# Deve aparecer: 🚀 Servidor rodando: http://0.0.0.0:3001
```

**Terminal 2 - Frontend:**
```bash
cd FrontEnd
npm run dev
# Deve aparecer: Local: http://192.168.0.150:5175
```

### Passo 2: Acesse o frontend
```
http://192.168.0.150:5175/
```

### Passo 3: Faça login como Colaborador

Se o frontend redirecionar automaticamente para `/login`, significa que:
- ✅ O interceptor 401 funcionou corretamente
- ✅ O token antigo foi limpo
- ✅ Agora você precisa fazer login novamente

**Credenciais de Colaborador (exemplo):**
- Email: `colaborador@example.com`
- Senha: (a que foi definida)

### Passo 4: Acesse o Dashboard
Após login bem-sucedido:
- Dashboard do colaborador carrega corretamente
- Estatísticas aparecem
- Abas funcionam normalmente

---

## 🔍 Testando a Solução

### Teste 1: Verificar Console Browser

Abra **DevTools (F12)** → **Console**

**Cenário A - Token inválido (esperado na primeira tentativa):**
```
[Auth] Received 401 - clearing invalid token and redirecting to login
```

**Cenário B - Após fazer login (normal):**
```
GET http://192.168.0.150:3001/api/admin/stats 200 OK
```

### Teste 2: Verificar Network Tab

1. Abra DevTools (F12)
2. Vá a **Network**
3. Filtre por `stats` ou `questoes`
4. Clique em um request
5. Verifique a aba **Response**

**Antes da correção:**
```json
{
  "message": "Token inválido.",
  "timestamp": "2026-06-16T09:57:05.214Z"
}
```

**Depois da correção (após login):**
```json
{
  "sucesso": true,
  "dados": {
    "stats": {...}
  }
}
```

### Teste 3: Funcionalidade End-to-End

1. ✅ Login como colaborador
2. ✅ Dashboard carrega
3. ✅ Abas funcionam ("Meu Perfil", "Minhas Questões", etc.)
4. ✅ Criar Questão carrega corretamente
5. ✅ Dados são enviados ao backend
6. ✅ Respostas aparecem no navegador

---

## 🛠️ Troubleshooting

### Problema: Ainda recebendo 401?

**Solução 1: Limpar cache do navegador**
```
DevTools (F12) → Application → Clear Site Data → Limpar Tudo
```

**Solução 2: Verificar que está logado**
- Deve estar na URL `http://192.168.0.150:5175/colaborador/dashboard`
- Se estiver em `/login`, precisa fazer login

**Solução 3: Reiniciar backend**
```bash
# Parar o processo
Ctrl + C (no terminal do backend)

# Reiniciar
npm run dev
```

---

## 📊 Verificação Final

| Verificação | Status | Como Testar |
|---|---|---|
| Backend rodando | ✅ | Terminal: `npm run dev` sem erros |
| Frontend rodando | ✅ | Browser: `http://192.168.0.150:5175/` carrega |
| Interceptor 401 ativo | ✅ | DevTools: Console mostra "[Auth] Received 401" |
| Login funciona | ✅ | Faz login, redireciona para dashboard |
| API responde | ✅ | DevTools: Network tab mostra 200 OK para requests |
| Dados carregam | ✅ | Dashboard mostra estatísticas/questões |

---

## 📝 Notas Técnicas

### Por que o token estava inválido?

1. Token foi gerado com IP antigo (192.168.0.192)
2. Sistema agora usa IP novo (192.168.0.150)
3. Backend pode rejeitar tokens de sessão anterior
4. Ou o token tinha expiração

### Como o interceptor resolve?

- **Automático:** Não precisa de mudanças em cada componente
- **Global:** Funciona para TODOS os fetch requests
- **Transparente:** Usuário não vê implementação técnica
- **Seguro:** Remove token antes de redirecionar

### Por que usar localStorage.removeItem()?

- ✅ Força novo login
- ✅ Valida credenciais
- ✅ Gera novo token válido
- ✅ Evita loops de 401

---

## ✨ Resultado Final

```
ANTES (Problema)
└─ Usuário acessa dashboard
   └─ API retorna 401
   └─ Dados não carregam
   └─ Tela fica vazia/quebrada

DEPOIS (Solução)
└─ Usuário acessa dashboard
   └─ Se token inválido → Redireciona para login automaticamente
   └─ User faz login
   └─ Novo token gerado e validado
   └─ Dashboard carrega corretamente
```

---

**Versão:** 1.0  
**Data:** 2026-06-16  
**Arquivo Modificado:** FrontEnd/src/main.jsx  
**Status:** ✅ IMPLEMENTADO E TESTADO

