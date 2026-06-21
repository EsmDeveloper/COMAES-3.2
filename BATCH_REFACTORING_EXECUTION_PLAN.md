# 🚀 PLANO DE EXECUÇÃO - REFATORAÇÃO EM LOTE

**Data**: 21 de Junho de 2026  
**Abordagem**: Refatoração manual sistemática por categoria com padrões consistentes  
**Status**: Pronto para execução

---

## 📊 PROGRESSO ATUAL

**Concluído**: 14/118 componentes (12%)  
- ✅ Tier 1: 13 componentes críticos
- ✅ Tier 2: 1 componente (CreateQuestaoForm.jsx)

**Pendente**: 104 componentes  
**Objetivo desta fase**: 70 componentes em 10-12 horas

---

## 🎯 ESTRATÉGIA PRAGMÁTICA

Em vez de criar scripts complexos de automação, vou:

1. **Agrupar componentes por padrão similar**
2. **Criar templates de refatoração para cada padrão**
3. **Aplicar template manualmente em batches de 5-10 componentes**
4. **Validar após cada batch**

Isso garante:
- ✅ Maior precisão (menos erros que script automatizado)
- ✅ Melhor adaptação ao código existente
- ✅ Validação contínua
- ✅ Rollback fácil se necessário

---

## 📋 TEMPLATES DE REFATORAÇÃO POR PADRÃO

### TEMPLATE 1: Tabs com Tabelas (useSafeArray + safeMap)

**Aplicável a**: 9 componentes do grupo Tabs

#### ANTES:
```jsx
import axios from 'axios';
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/endpoint', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchItems();
}, [token]);

// Render
{items.map(item => (
  <tr key={item.id}>
    <td>{item.name}</td>
  </tr>
))}
```

#### DEPOIS:
```jsx
import { useSafeArray } from '../hooks/useSafeData';
import { safeMap, safeGet, safeString } from '../utils/dataSafety';

const { items, loading, error } = useSafeArray('/api/endpoint', {
  token,
  preferredKey: null,
  initialItems: []
});

// Render
{safeMap(items, (item, i, key) => (
  <tr key={key}>
    <td>{safeString(safeGet(item, 'name'), 'Sem nome')}</td>
  </tr>
))}
```

**Passos**:
1. Adicionar imports
2. Remover useState/useEffect
3. Adicionar useSafeArray
4. Substituir .map() por safeMap()
5. Proteger todos os acessos com safeGet
6. Proteger renderizações com safeString

---

### TEMPLATE 2: Formulários (api.post + validação)

**Aplicável a**: 7 componentes do grupo Forms

#### ANTES:
```jsx
import axios from 'axios';

const handleSubmit = async () => {
  try {
    const apiBase = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3002`;
    const res = await axios.post(`${apiBase}/api/endpoint`, formData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (res.data.success) {
      onSuccess(res.data.data);
    }
  } catch (err) {
    setError(err.response?.data?.mensagem || 'Erro');
  }
};
```

#### DEPOIS:
```jsx
import { api } from '../utils/safeApi';
import { safeGet, safeString } from '../utils/dataSafety';

const handleSubmit = async () => {
  try {
    const response = await api.post('/api/endpoint', formData, { token });
    
    if (response.success) {
      const data = safeGet(response, 'data', {});
      onSuccess(data);
    } else {
      setError(safeString(response.error, 'Erro desconhecido'));
    }
  } catch (err) {
    setError(err.message || 'Erro ao salvar');
  }
};
```

**Passos**:
1. Substituir axios por api
2. Remover configuração manual de headers/timeout
3. Usar response normalizado (success, data, error)
4. Proteger extração de dados com safeGet
5. Usar safeString para mensagens de erro

---

### TEMPLATE 3: Modals (safeGet + safeString apenas)

**Aplicável a**: 13 componentes do grupo Modals

#### ANTES:
```jsx
<div className="modal">
  <h2>{data.title}</h2>
  <p>{data.user.name}</p>
  <img src={data.image} alt="Image" />
</div>
```

#### DEPOIS:
```jsx
import { safeGet, safeString, safeImageProps } from '../utils/dataSafety';

<div className="modal">
  <h2>{safeString(safeGet(data, 'title'), 'Título')}</h2>
  <p>{safeString(safeGet(data, 'user.name'), 'Usuário')}</p>
  <img {...safeImageProps(safeGet(data, 'image'), 'Image')} />
</div>
```

**Passos**:
1. Adicionar imports de dataSafety
2. Envolver todos os acessos com safeGet
3. Envolver todas as renderizações com safeString
4. Usar safeImageProps para imagens

---

### TEMPLATE 4: Managers com Drag & Drop (safeArray)

**Aplicável a**: 3 componentes do grupo Managers

#### ANTES:
```jsx
const handleDrop = (draggedItem, targetIndex) => {
  const newItems = [...items];
  const dragIndex = items.findIndex(i => i.id === draggedItem.id);
  newItems.splice(dragIndex, 1);
  newItems.splice(targetIndex, 0, draggedItem);
  setItems(newItems);
};
```

#### DEPOIS:
```jsx
import { safeArray } from '../utils/dataSafety';

const handleDrop = (draggedItem, targetIndex) => {
  const validItems = safeArray(items);
  const newItems = [...validItems];
  const dragIndex = validItems.findIndex(i => i?.id === draggedItem?.id);
  
  if (dragIndex === -1) return;
  
  newItems.splice(dragIndex, 1);
  newItems.splice(targetIndex, 0, draggedItem);
  setItems(newItems);
};
```

**Passos**:
1. Validar arrays com safeArray
2. Adicionar optional chaining (item?.id)
3. Adicionar verificações de índice inválido
4. Proteger findIndex com ?.

---

## 📅 EXECUÇÃO POR DIA

### DIA 1 (4 horas) - TABS & FORMS

#### Sessão 1: TABS (2h)
Aplicar TEMPLATE 1 em:
1. ⏳ `Administrador/ColaboradoresTab.jsx`
2. ⏳ `Administrador/QuestoesPendentesTab.jsx`
3. ⏳ `Administrador/QuestoesColaboradoresTab.jsx`
4. ⏳ `Administrador/BlocosColaboradoresTab.jsx`
5. ⏳ `Administrador/TorneiosTab.jsx`

**Validação após batch**:
```bash
npm run build
npm run lint
```

#### Sessão 2: FORMS (2h)
Aplicar TEMPLATE 2 em:
1. ⏳ `Administrador/EditQuestaoForm.jsx`
2. ⏳ `Administrador/CreateQuestaoTesteForm.jsx`
3. ⏳ `Administrador/EditQuestaoTesteForm.jsx`
4. ⏳ `components/Forms/CreateBlocoForm.jsx`

**Validação após batch**:
```bash
npm run build
npm run lint
```

---

### DIA 2 (4 horas) - MODALS & MANAGERS

#### Sessão 3: MODALS (2h)
Aplicar TEMPLATE 3 em:
1. ⏳ `Administrador/TableModal.jsx`
2. ⏳ `Administrador/RejectModal.jsx`
3. ⏳ `Administrador/components/TournamentModal.jsx`
4. ⏳ `components/ConfirmModal.jsx`
5. ⏳ `components/ComaesModal.jsx`
6. ⏳ `components/LogoutModal.jsx`
7. ⏳ `components/ModalVencedores.jsx`
8. ⏳ `components/TournamentFinishedModal.jsx`

**Validação após batch**:
```bash
npm run build
npm run lint
```

#### Sessão 4: MANAGERS (2h)
Aplicar TEMPLATE 4 em:
1. ⏳ `Administrador/BlocoQuestoesManager.jsx`
2. ⏳ `Administrador/QuestoesManager.jsx`
3. ⏳ `Administrador/TesteConhecimentoManager.jsx`

**Validação após batch**:
```bash
npm run build
npm run lint
```

---

### DIA 3 (4 horas) - RANKINGS & PÁGINAS

#### Sessão 5: RANKINGS (1h)
Aplicar TEMPLATE 1 (similar a tabs) em:
1. ⏳ `Paginas/Secundarias/RankingCompleto.jsx`
2. ⏳ `Paginas/Secundarias/RankingGlobal.jsx`
3. ⏳ `components/ranking/RankingTable.jsx`
4. ⏳ `components/ranking/RankingTab.jsx`

#### Sessão 6: CERTIFICADOS (1h)
Aplicar TEMPLATE 3 + safeImageProps em:
1. ⏳ `Paginas/Secundarias/Certificacoes.jsx`
2. ⏳ `certificates/pages/MeusCertificados.jsx`
3. ⏳ `components/certificates/CertificateDisplay.jsx`
4. ⏳ `components/certificates/CertificateActions.jsx`

#### Sessão 7: PÁGINAS SIMPLES (2h)
Aplicar proteção mínima (safeGet + safeString) em:
1-10. ⏳ Batch de 10 páginas simples

**Validação final do dia**:
```bash
npm run build
npm run lint
npm test
```

---

## ✅ VALIDAÇÃO CONTÍNUA

Após cada batch (5-10 componentes):

### 1. Build Check
```bash
npm run build
```
**Esperado**: Zero erros, warnings aceitáveis

### 2. Lint Check
```bash
npm run lint
```
**Esperado**: Zero erros relacionados a data access

### 3. Manual Test
- Abrir componentes refatorados no navegador
- Testar com dados vazios (logout/login)
- Testar com dados válidos
- Confirmar zero crashes

### 4. Git Commit
```bash
git add .
git commit -m "feat: apply Data Safety Layer to [GROUP_NAME] components (batch X)"
```

**Benefício**: Rollback fácil se necessário

---

## 📊 MÉTRICAS DE SUCESSO

Após completar os 3 dias:

- ✅ **70+ componentes refatorados** (59% do projeto)
- ✅ **Zero crashes** nos componentes refatorados
- ✅ **Build sem erros**
- ✅ **Lint limpo**
- ✅ **Padrões consistentes** em todo o código
- ✅ **Documentação completa** dos padrões aplicados

---

## 🚀 PRÓXIMA AÇÃO

**AGORA**: Começar Dia 1, Sessão 1 - Refatorar 5 componentes de Tabs com TEMPLATE 1

**Componente inicial**: `Administrador/ColaboradoresTab.jsx`

---

**Status**: ✅ Plano completo e pronto para execução  
**Estimativa**: 10-12 horas de trabalho focado  
**Resultado esperado**: 70% do frontend protegido com Data Safety Layer

