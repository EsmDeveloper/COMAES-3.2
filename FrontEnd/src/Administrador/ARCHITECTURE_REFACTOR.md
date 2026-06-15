# Arquitetura de Refatoração: Questões Pendentes & Colaboradores

## 📋 Análise da Arquitetura Existente

### Componentes Principais

1. **QuestoesPendentesTab.jsx** (ATUAL - PROBLEMA)
   - ✗ Implementação customizada e isolada
   - ✗ Não segue padrão de BlocoQuestoesManager
   - ✗ Código duplicado em badges, modais, filtros
   - ✗ Estrutura simples de lista de questões
   - Precisa refatorar para reutilizar padrão de blocos

2. **BlocosColaboradoresTab.jsx** (ATUAL - BLOCOS COM REJEIÇÃO)
   - ✓ Implementa padrão de blocos
   - ✓ Usa modais de rejeição
   - ✓ Tabela de revisão
   - ✗ Mantém estado local (sem reducer)
   - ✗ Acoplado ao fluxo de blocos pendentes
   - Precisa abstrair para reutilização

3. **BlocoQuestoesManager.jsx** (PADRÃO - REFERÊNCIA)
   - ✓ Reducer para estado complexo
   - ✓ Genérico (contexto: 'torneio' ou 'teste')
   - ✓ Componentes reutilizáveis (BlocoCard, BlocoFormModal)
   - ✓ Integração com backend via BlocosService
   - ✓ Suporta múltiplos formatos de resposta API
   - ESTE é o PADRÃO A SEGUIR

## 🔄 Fluxo de Questões no Sistema

```
COLABORADOR
   ↓
Cria Questões
   ↓
Cria Blocos de Questões
   ↓
status = 'rascunho' | 'publicado'
   ↓
ADMIN - Aba "Questões Pendentes"
   ├─ Ver questões pendentes (status_aprovacao = 'pendente')
   ├─ Aprovar → questão move para 'aprovada'
   └─ Rejeitar → questão vai para 'rejeitada'
   ↓
ADMIN - Aba "Questões dos Colaboradores"
   ├─ Ver blocos de colaboradores (approved)
   ├─ Organizado por blocos
   ├─ Expandir para ver questões
   ├─ Adicionar/Remover questões
   ├─ Editar bloco
   ├─ Deletar bloco
   └─ Associar a testes/torneios
   ↓
TESTES & TORNEIOS
   └─ Usar blocos aprovados em atividades
```

## 🏗️ Padrão de Refatoração

### Padrão de Componentes Reutilizáveis

```jsx
// Estrutura seguida por BlocoQuestoesManager:

1. BADGES (componentes simples)
   - StatusBadge({ status })
   - DificuldadeBadge({ dificuldade })

2. MODAIS (componentes complexos)
   - [Nome]FormModal({ dados, onClose, onSave, loading })
   - [Nome]DetailModal({ item, isOpen, onClose })
   - [Nome]ConfirmModal({ isOpen, onClose, onConfirm })

3. CARDS (exibição de item)
   - [Nome]Card({ item, ... })

4. COMPONENTE PRINCIPAL
   - Estado com useReducer ou useState
   - useEffect para carregamento
   - useCallback para handlers
   - Filtros/busca
   - Renderização da lista
```

### Padrão de Estado (Reducer)

```jsx
const initialState = {
  items: [],
  loading: false,
  error: '',
  success: '',
  // contexto específico
};

function reducer(state, action) {
  switch(action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, success: '' };
    case 'SET_SUCCESS': return { ...state, success: action.payload, error: '' };
    case 'SET_ITEMS': return { ...state, items: action.payload };
    case 'UPDATE_ITEM': return { ...state, items: state.items.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_ITEM': return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'ADD_ITEM': return { ...state, items: [...state.items, action.payload] };
    default: return state;
  }
}
```

### Padrão de API

```jsx
// Sempre retornar da mesma forma:

fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` },
  method: 'GET|POST|PATCH|DELETE',
  body: JSON.stringify(data)
})
.then(res => res.json())
// Sempre deve ter: sucesso, dados/data, mensagem
// Exemplo: { sucesso: true, dados: [...], mensagem: "..." }
```

## 🎯 Plano de Refatoração

### Fase 1: Criar Utilitários Compartilhados
- `shared/QuestaoCardsComponents.jsx` (Badges, Modals)
- `shared/useQuestaoFilters.js` (Hook para filtros)

### Fase 2: Refatorar QuestoesPendentesTab
- Mover para usar padrão de BlocoQuestoesManager
- Simplificar com componentes compartilhados
- Integrar com Backend API corretamente

### Fase 3: Criar Aba "Questões dos Colaboradores"
- Nova aba para blocos aprovados
- Seguir exatamente padrão de BlocoQuestoesManager
- Reutilizar 100% dos componentes

### Fase 4: Testar Fluxo Completo
- Questão pendente → Aprovada → Em colaborador → Em torneio

## 📦 Estrutura de Arquivos Novo

```
FrontEnd/src/Administrador/
├── QuestoesPendentesTab.jsx (REFATORADO)
├── QuestoesColaboradoresTab.jsx (NOVO)
├── BlocoQuestoesManager.jsx (PADRÃO)
├── BlocosColaboradoresTab.jsx (MANTÉM)
├── TableManager.jsx
├── shared/
│   ├── QuestaoCardsComponents.jsx (Badges, Modals)
│   └── useQuestaoFilters.js (Filtros)
└── services/
    ├── BlocosService.js
    ├── questoesService.js
    └── ...
```

## 🔑 Princípios de Reutilização

1. **NÃO duplicar código** → Extrair em componentes/hooks
2. **Mesmo padrão visual** → Cores azuis, badges, modais
3. **Mesma API structure** → Padrão de resposta: { sucesso, dados, mensagem }
4. **Mesmo estado** → Usar reducer ou useState consistente
5. **Mesmo tratamento de erro** → Toast/alert de sucesso/erro
6. **Mesmas ações** → Aprovar, Rejeitar, Editar, Deletar

## ✅ Checklist de Sucesso

- [ ] QuestoesPendentesTab refatorado
- [ ] QuestoesColaboradoresTab criado
- [ ] 0% código duplicado
- [ ] Console sem erros
- [ ] Fluxo completo testado
- [ ] Padrão visual consistente
- [ ] Todas as ações funcionam
- [ ] Filtros funcionam
- [ ] Paginação (se necessário)
- [ ] Loading states corretos
- [ ] Estados vazios com mensagens úteis
