# 🎓 SISTEMA DE ESPERA PARA COLABORADORES PENDENTES

**Data:** 6 de Junho de 2026  
**Status:** ✅ Implementado  
**Versão:** 1.0

---

## 📋 O QUE FOI CRIADO

Sistema completo que:
1. ✅ **Exibe tela de espera** quando colaborador está pendente
2. ✅ **Monitora status em tempo real** (verifica a cada 5 segundos)
3. ✅ **Redireciona automaticamente** quando admin aprova
4. ✅ **Mostra painel do colaborador** após aprovação
5. ✅ **Trata rejeição** com mensagem apropriada

---

## 🗂️ ARQUIVOS CRIADOS

### Frontend Components

```
src/components/
├── WaitingScreen.jsx              ✅ Tela de espera
├── WaitingScreen.css              ✅ Estilos da tela de espera
├── ProtectedColaboradorRoute.jsx  ✅ Rota protegida
│
src/Colaborador/
├── ColaboradorDashboard.jsx       ✅ Painel do colaborador
└── ColaboradorDashboard.css       ✅ Estilos do painel
│
src/hooks/
└── useColaboradorStatus.js        ✅ Hook para gerenciar status
```

---

## 🎨 TELA DE ESPERA (WaitingScreen)

### Visual

```
┌─────────────────────────────────────┐
│                                     │
│   ⏳ Seu pedido está em análise     │
│                                     │
│   Status: PENDENTE DE APROVAÇÃO     │
│   Email: joao@example.com           │
│                                     │
│   O que acontece agora?             │
│   1. Um admin revisará seus dados   │
│   2. Você será notificado           │
│   3. Terá acesso completo           │
│                                     │
│   Verificando status... (12)        │
│                                     │
│   💡 Mantenha esta página aberta... │
│                                     │
└─────────────────────────────────────┘
```

### Funcionalidades

✅ **Spinner animado** - Indica carregamento
✅ **Box de status** - Mostra status atual
✅ **Info box** - Explica o que acontece
✅ **Timer** - Mostra verificações realizadas
✅ **Background animado** - Elementos flutuantes
✅ **Verificação automática** - A cada 5 segundos

### Estados

#### 1. Esperando Aprovação
```
Status: ⏳ PENDENTE
Mostra spinner animado
Verifica status continuamente
```

#### 2. Aprovado
```
Status: ✅ APROVADO
Mostra CheckCircle animado
Redireciona em 2 segundos
```

#### 3. Rejeitado
```
Status: ❌ REJEITADO
Mostra AlertCircle
Mensagem de erro
Botão para voltar
```

---

## 🎓 PAINEL DO COLABORADOR (ColaboradorDashboard)

### Estrutura

```
HEADER
├─ Título + Bem-vindo
├─ Botão de Logout
│
PROFILE CARD
├─ Avatar com inicial
├─ Nome, Email, Disciplina
└─ Status: ✅ Aprovado

STATISTICS
├─ Card: Questões Aprovadas
├─ Card: Questões em Revisão
└─ Card: Total de Questões

TABS
├─ 📋 Minhas Questões
│  ├─ Questões Aprovadas
│  └─ Questões em Revisão
├─ ➕ Submeter Questão
│  └─ Formulário
└─ ⚙️ Meus Dados
   └─ Informações do usuário
```

### Funcionalidades

✅ **Visualizar questões** - Aprovadas e pendentes
✅ **Submeter questão** - Novo formulário
✅ **Editar questão** - Botão em cada card
✅ **Ver detalhes** - Expandir informações
✅ **Estatísticas** - Total de questões
✅ **Dados pessoais** - Informações do colaborador

### Tabs

#### 1. Minhas Questões
- Lista todas as questões do colaborador
- Separadas por status (Aprovado/Pendente)
- Cards com ações (visualizar, editar)
- Mostra disciplina e dificuldade

#### 2. Submeter Questão
- Formulário para nova questão
- Campos: Enunciado, Disciplina, Dificuldade
- Opções de resposta separadas por |
- Resposta correta

#### 3. Meus Dados
- Informações imutáveis do perfil
- Nome, Email, Disciplina
- Nível Acadêmico
- Status (Aprovado)

---

## 🔄 FLUXO DE FUNCIONAMENTO

### 1. Colaborador se registra
```
Colaborador preenche formulário
→ Clica "Registrar como Colaborador"
→ Dados salvos no banco
→ Status: PENDENTE
```

### 2. Colaborador faz login
```
Colaborador entra com email/senha
→ Sistema verifica role = 'colaborador'
→ Sistema verifica status_colaborador
→ Se PENDENTE → WaitingScreen
→ Se APROVADO → ColaboradorDashboard
```

### 3. Tela de Espera
```
WaitingScreen aparece
→ Exibe spinner animado
→ Mostra email registrado
→ Verifica status a cada 5s
→ Conta verificações

Aguardando aprovação do admin...
```

### 4. Admin aprova
```
Admin vai para painel
→ Menu: Usuários & Comunidade
→ Pedidos de Colaboradores
→ Encontra colaborador pendente
→ Clica "Aprovar"
→ Status muda para APROVADO
```

### 5. Redirecionamento automático
```
WaitingScreen detecta mudança
→ Status === 'aprovado'
→ Mostra mensagem de sucesso
→ Aguarda 2 segundos
→ Redireciona para /colaborador/dashboard
```

### 6. Painel do Colaborador
```
ColaboradorDashboard carrega
→ Exibe profile card
→ Mostra estatísticas
→ Permite submeter questões
→ Lista questões existentes
```

---

## 📊 VERIFICAÇÃO DE STATUS

### Como funciona

```javascript
// A cada 5 segundos:
→ Busca GET /api/usuarios/me
→ Retorna userData.status_colaborador
→ Compara com status anterior
→ Se mudou: atualiza estado
→ Se aprovado: redireciona
```

### Endpoint necessário

**GET** `/api/usuarios/me`

Retorna:
```json
{
  "id": 1,
  "nome": "João Pendente",
  "email": "joao@example.com",
  "role": "colaborador",
  "status_colaborador": "aprovado",  // MUDOU AQUI!
  "disciplina_colaborador": "matematica"
}
```

---

## 🎨 COMPONENTES REUTILIZÁVEIS

### WaitingScreen

```jsx
import WaitingScreen from '@/components/WaitingScreen';

<WaitingScreen
  userEmail={user.email}
  onApproved={() => {
    window.location.href = '/colaborador/dashboard';
  }}
  onRejected={() => {
    window.location.href = '/login';
  }}
/>
```

### ProtectedColaboradorRoute

```jsx
import ProtectedColaboradorRoute from '@/components/ProtectedColaboradorRoute';

// Na rota:
<Route
  path="/colaborador/dashboard"
  element={
    <ProtectedColaboradorRoute>
      <ColaboradorDashboard />
    </ProtectedColaboradorRoute>
  }
/>
```

### useColaboradorStatus

```jsx
import { useColaboradorStatus } from '@/hooks/useColaboradorStatus';

const { status, isPending, isApproved, isRejected, checkStatus } = useColaboradorStatus();

if (isPending) {
  return <WaitingScreen />;
}

if (isApproved) {
  return <ColaboradorDashboard />;
}
```

---

## 🚀 COMO INTEGRAR

### 1. Adicionar rotas no App.jsx

```jsx
import ProtectedColaboradorRoute from '@/components/ProtectedColaboradorRoute';
import ColaboradorDashboard from '@/Colaborador/ColaboradorDashboard';

// Dentro do Routes:
<Route
  path="/colaborador/dashboard"
  element={
    <ProtectedColaboradorRoute>
      <ColaboradorDashboard />
    </ProtectedColaboradorRoute>
  }
/>

<Route
  path="/colaborador/esperando"
  element={<ProtectedColaboradorRoute />}
/>
```

### 2. Configurar redirecionamento após login

No `LoginPage.jsx` ou `AuthContext.jsx`:

```jsx
// Após login bem-sucedido:
const userData = await loginAPI(email, password);

// Se é colaborador:
if (userData.role === 'colaborador') {
  if (userData.status_colaborador === 'pendente') {
    navigate('/colaborador/esperando');
  } else if (userData.status_colaborador === 'aprovado') {
    navigate('/colaborador/dashboard');
  }
} else {
  navigate('/dashboard');
}
```

### 3. Garantir endpoint /api/usuarios/me

Verificar se Backend tem esta rota:

```javascript
// BackEnd/routes
router.get('/me', isAuthenticated, (req, res) => {
  const user = req.user;
  res.json(user);
});
```

---

## 🧪 TESTANDO

### Test Case 1: Colaborador Pendente
```
1. Login com: joao.prof.mat@example.com / Senha123!
2. Deverá ver: WaitingScreen
3. Status: ⏳ Pendente de Aprovação
4. Comportamento: Verifica a cada 5s
```

### Test Case 2: Admin Aprova
```
1. Login como admin: admin@comaes.com
2. Menu: Usuários & Comunidade → Pedidos de Colaboradores
3. Encontrar João
4. Clique: "Aprovar"
5. Volta: Colaborador vê painel automaticamente
```

### Test Case 3: Colaborador Aprovado Login
```
1. Login com: maria.prof.ing@example.com / Senha123!
2. Deverá ver: ColaboradorDashboard
3. Pode submeter questões
4. Pode ver histórico de questões
```

---

## 💾 DADOS ARMAZENADOS

### No Banco de Dados

```sql
usuarios.status_colaborador
├─ 'pendente'   → Aguardando aprovação
├─ 'aprovado'   → Acesso completo
└─ 'rejeitado'  → Acesso negado
```

### Estados no Frontend

```javascript
{
  status: 'pendente' | 'aprovado' | 'rejeitado',
  isPending: boolean,
  isApproved: boolean,
  isRejected: boolean,
  isLoadingStatus: boolean,
  error: string | null
}
```

---

## 🔒 SEGURANÇA

✅ **Verificação de role** - Só colaboradores entram
✅ **Verificação de status** - Protege rotas baseado em status
✅ **Token requerido** - Todas as requisições autenticadas
✅ **Redirecionamento seguro** - Não expõe dados sensíveis
✅ **Logout limpo** - Remove token ao sair

---

## 📱 RESPONSIVIDADE

✅ Desktop (1024px+) - Layout completo
✅ Tablet (768px-1024px) - Menu adaptado
✅ Mobile (<768px) - One column layout

---

## 🎯 FLUXO VISUAL COMPLETO

```
┌─────────────────┐
│    LOGIN PAGE   │
└────────┬────────┘
         │
         ├─ Role ≠ colaborador?
         │  └─ Dashboard Admin
         │
         ├─ Role = colaborador?
         │  ├─ Status = pendente?
         │  │  └─ WAITING SCREEN ⏳
         │  │     (verifica a cada 5s)
         │  │     └─ Status mudou?
         │  │        └─ COLABORADOR DASHBOARD ✅
         │  │
         │  └─ Status = aprovado?
         │     └─ COLABORADOR DASHBOARD ✅
         │
         └─ Status = rejeitado?
            └─ ERROR SCREEN ❌
```

---

## 📞 SUPORTE

### Se a tela de espera não redireciona
1. Verificar se backend retorna novo status
2. Verificar console para erros
3. Testar GET /api/usuarios/me manualmente

### Se o painel não carrega
1. Verificar role = 'colaborador'
2. Verificar status = 'aprovado'
3. Testar token autenticação

### Se as questões não aparecem
1. Verificar se /api/questoes retorna dados
2. Adicionar filtro por colaborador_id
3. Testar permissões de acesso

---

**Status:** ✅ Completo e Pronto para Integração

Data: 6 de Junho de 2026
