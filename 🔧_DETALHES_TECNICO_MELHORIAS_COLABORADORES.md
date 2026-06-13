# 🔧 DETALHES TÉCNICOS - MELHORIAS COLABORADORES

## MELHORIA 3: Integração WaitingScreen - Detalhes Técnicos

### Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────────────┐
│                   AuthContainer.jsx (Principal)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  useEffect: Redireciona se já logado                               │
│    └─→ user?.role → getPostLoginRoute(user)                        │
│                                                                     │
│  handleLoginSubmit():                                              │
│    1. POST /auth/login com credenciais                             │
│    2. Recebe: { success, data, token }                             │
│    3. LOGIN CHECK:                                                  │
│       ├─ Se role=colaborador AND status=pendente                   │
│       │  └─→ setShowWaitingScreen(true)                            │
│       │     └─→ Mostra WaitingScreen                               │
│       │         └─→ Verifica status a cada 5s                      │
│       │             ├─ status=aprovado → redireciona               │
│       │             └─ status=rejeitado → logout                   │
│       │                                                             │
│       └─ Senão → navigate(getPostLoginRoute(data))                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Mudanças em AuthContainer.jsx

#### 1. Import WaitingScreen
```javascript
// Linha 11
import WaitingScreen from "../../components/WaitingScreen";
```

#### 2. Destructuring logout
```javascript
// Linha 21
const { login, user, logout } = useAuth();
```

#### 3. Estados para WaitingScreen
```javascript
// Linhas 18-19
const [showWaitingScreen, setShowWaitingScreen] = useState(false);
const [waitingScreenEmail, setWaitingScreenEmail] = useState('');
```

#### 4. Lógica de Detecção no handleLoginSubmit
```javascript
// Linhas 165-174 (dentro do if !res.ok else)
if (body.data.role === 'colaborador' && body.data.status_colaborador === 'pendente') {
  // Colaborador pendente vê WaitingScreen
  setWaitingScreenEmail(body.data.email || '');
  setShowWaitingScreen(true);
} else {
  // Outros (estudante, admin, colaborador aprovado) vão direto
  navigate(getPostLoginRoute(body.data), { replace: true });
}
```

**Por que este check?**
- `role === 'colaborador'`: Apenas colaboradores (não estudantes)
- `status_colaborador === 'pendente'`: Apenas os que esperam aprovação
- Email armazenado para exibir no WaitingScreen (confirmação visual)

#### 5. Renderização Condicional
```javascript
// Linhas 403-422 (antes do return principal)
if (showWaitingScreen) {
  return (
    <WaitingScreen
      userEmail={waitingScreenEmail}
      onApproved={() => {
        // Quando aprovado
        setShowWaitingScreen(false);
        navigate(getPostLoginRoute(user), { replace: true });
      }}
      onRejected={() => {
        // Quando rejeitado
        setShowWaitingScreen(false);
        logout();  // Limpar session
        setMode('login');
        setIsLogin(true);
      }}
    />
  );
}
```

---

## WaitingScreen.jsx - Como Funciona

### Fluxo de Verificação

```javascript
// src/components/WaitingScreen.jsx

useEffect(() => {
  // Polled a cada 5 segundos
  const interval = setInterval(() => {
    checkCollaboratorStatus();
  }, 5000);
  return () => clearInterval(interval);
}, []);

const checkCollaboratorStatus = async () => {
  try {
    const token = localStorage.getItem('comaes_token');
    const response = await fetch('/api/usuarios/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const userData = await response.json();
      
      if (userData.status_colaborador === 'aprovado') {
        setStatus('approved');
        setTimeout(() => onApproved?.(), 2000);  // Mostrar 2s antes de redirecionar
      } else if (userData.status_colaborador === 'rejeitado') {
        setStatus('rejected');
        setMessage('Sua solicitação foi rejeitada...');
      }
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
  }
};
```

### Estados Visuais

1. **waiting** (inicial)
   - Spinner animado
   - Mensagem: "Seu pedido está em análise"
   - Conta regressiva de verificações
   - Dica: "Mantenha esta página aberta"

2. **approved** (quando status muda para 'aprovado')
   - CheckCircle icon
   - "🎉 Parabéns!"
   - Spinner pequeno: "Redirecionando para seu painel..."
   - Após 2s: executa `onApproved()` → redireciona

3. **rejected** (quando status muda para 'rejeitado')
   - AlertCircle icon
   - "Solicitação Rejeitada"
   - Botão: "Voltar para o início"

---

## COMPARAÇÃO: Antes vs Depois

### Fluxo ANTES (Sem WaitingScreen Integrado)

```
Colaborador registro
  ↓
Ver ApprovalPending (modal simples)
  ↓
Ir embora / Fechar abas
  ↓
Depois (horas/dias), volta e faz login
  ↓
❌ PROBLEMA: Sem feedback se ainda pendente
❌ Precisa conhecer WaitingScreen manualmente
❌ Experiência fragmentada
```

### Fluxo DEPOIS (Com WaitingScreen Integrado)

```
Colaborador faz login com status pendente
  ↓
AuthContainer detecta status_colaborador === 'pendente'
  ↓
Automático: Mostrar WaitingScreen
  ↓
WaitingScreen verifica status a cada 5s
  ├─ Status mudou para 'aprovado'?
  │  └─→ Mostrar sucesso + Redirecionar auto
  │
  └─ Status mudou para 'rejeitado'?
     └─→ Mostrar rejeição + Logout
```

**Benefícios:**
- ✅ Experiência unificada
- ✅ Sem necessidade de instruções especiais
- ✅ Auto-redirecionamento quando aprovado
- ✅ Feedback visual claro

---

## Considerações de Edge Cases

### 1. Colaborador Já Aprovado
```javascript
// No login, se status !== 'pendente'
if (body.data.role === 'colaborador' && body.data.status_colaborador === 'pendente') {
  // Mostrar WaitingScreen
} else {
  // ✓ Colaborador aprovado vai direto para /colaborador/dashboard
  navigate(getPostLoginRoute(body.data));
}
```

### 2. Colaborador Rejeitado
```javascript
// No WaitingScreen, quando status muda para 'rejeitado'
onRejected={() => {
  logout();  // Limpar session
  setMode('login');  // Voltar para login
}
```
**Resultado**: User volta para login, pode tentar se registrar de novo com outro email

### 3. Perda de Conexão
```javascript
// WaitingScreen.jsx
catch (error) {
  console.error('Erro ao verificar status:', error);
  // ✓ Continua a tentar a cada 5s (resiliente)
  // ✓ Não mostra erro alarmiante
}
```
**Resultado**: Mantém tentando; quando volta online, próxima verificação sucede

### 4. User Abre em 2 Abas
```javascript
// Aba 1: WaitingScreen verificando
// Aba 2: Login normal
// Admin aprova durante o polling

// ✓ WaitingScreen detecta e redireciona
// ✓ Aba 2 pode estar já no dashboard (sem conflito)
```

---

## Integração com AuthContext

### getPostLoginRoute() - Não precisa de mudanças

```javascript
export const getPostLoginRoute = (user) => {
  if (!user) return '/login';
  const role = user.role || (user.isAdmin ? 'admin' : 'estudante');
  if (role === 'admin' || user.isAdmin === true) return '/administrador';
  if (role === 'colaborador') return '/colaborador/dashboard';
  return '/';
};
```

**Por que continua assim?**
- WaitingScreen só mostra ENQUANTO status === 'pendente'
- Quando `onApproved()` é chamado, já há um user no context com status 'aprovado'
- `navigate(getPostLoginRoute(user))` com novo status já aponta ao dashboard correto

### Fluxo Completo com Context

```
1. handleLoginSubmit → login(userData, token)
   └─→ Guarda em context + localStorage

2. Se pendente → showWaitingScreen
   └─→ WaitingScreen verifica a cada 5s via /api/usuarios/me

3. Admin aprova → userData.status_colaborador = 'aprovado'
   └─→ API retorna novo status

4. WaitingScreen detecta 'aprovado' → onApproved()
   └─→ navigate(getPostLoginRoute(user))
   └─→ user.role === 'colaborador' && status === 'aprovado'
   └─→ Retorna '/colaborador/dashboard'
```

---

## Testes de Integração Sugeridos

### Cenário 1: Colaborador Pendente → Aprovado
```
1. Registar como colaborador → ApprovalPending
2. Não usar WaitingScreen interno; voltar mais tarde
3. Fazer login com mesma conta
4. ✓ Ver WaitingScreen
5. Admin aprova em outro browser
6. ✓ WaitingScreen detecta → redireciona
7. ✓ No /colaborador/dashboard
```

### Cenário 2: Colaborador Pendente → Rejeitado
```
1. Registar como colaborador
2. Fazer logout e login depois
3. ✓ Ver WaitingScreen
4. Admin rejeita
5. ✓ WaitingScreen mostra rejeição
6. ✓ Auto-logout; volta para login
```

### Cenário 3: Colaborador Aprovado (Direto)
```
1. Admin cria colaborador manualmente com status 'aprovado'
2. Esse user faz login
3. ✓ NÃO mostra WaitingScreen
4. ✓ Vai direto para /colaborador/dashboard
```

### Cenário 4: Estudante Login
```
1. Estudante normal faz login
2. ✓ NÃO mostra WaitingScreen (role !== 'colaborador')
3. ✓ Vai direto para '/' (home)
```

---

## Performance & Segurança

### Performance
- Polling a cada 5s: ✅ Razoável (16 requests/min por user)
- Pode ser ajustado em WaitingScreen.jsx se necessário
- Sem impacto significativo em backend/frontend

### Segurança
- Apenas verifica `/api/usuarios/me` com token autenticado
- Token guardado em localStorage (standard para SPA)
- Sem exposição de dados sensíveis
- Auto-logout após rejeição (limpa session)

---

## Código-Chave para Referência

### AuthContainer.jsx - Trecho Principal
```javascript
// No handleLoginSubmit, após receber resposta do backend:
if (body.data.role === 'colaborador' && body.data.status_colaborador === 'pendente') {
  setWaitingScreenEmail(body.data.email || '');
  setShowWaitingScreen(true);  // ← Mostrar WaitingScreen em vez de redirecionar
} else {
  navigate(getPostLoginRoute(body.data), { replace: true });
}
```

### Renderização Condicional - Trecho Principal
```javascript
// No render (antes do main layout):
if (showWaitingScreen) {
  return (
    <WaitingScreen
      userEmail={waitingScreenEmail}
      onApproved={() => {
        setShowWaitingScreen(false);
        navigate(getPostLoginRoute(user), { replace: true });
      }}
      onRejected={() => {
        setShowWaitingScreen(false);
        logout();
        setMode('login');
        setIsLogin(true);
      }}
    />
  );
}
```

---

## Rollback (Se Necessário)

Se precisar desativar temporariamente WaitingScreen:

```javascript
// Comentar a verificação:
/*
if (body.data.role === 'colaborador' && body.data.status_colaborador === 'pendente') {
  setWaitingScreenEmail(body.data.email || '');
  setShowWaitingScreen(true);
} else {
*/
  navigate(getPostLoginRoute(body.data), { replace: true });
/*
}
*/
```

Resultado: Colaboradores pendentes iriam direto para /colaborador/dashboard (erro 403 se sem permissão, mas sem WaitingScreen).

---

**Versão**: 1.0  
**Data**: 12 de Junho de 2026  
**Status**: ✅ Produção
