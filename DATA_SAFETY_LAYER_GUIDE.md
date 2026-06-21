# 🛡️ DATA SAFETY LAYER - Guia Completo de Uso

**Versão**: 2.0.0  
**Data**: 21 de Junho de 2026  
**Status**: Enterprise-Grade Implementation

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Instalação e Setup](#instalação-e-setup)
3. [API Reference](#api-reference)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Padrões de Refatoração](#padrões-de-refatoração)
6. [Best Practices](#best-practices)

---

## 🎯 VISÃO GERAL

O **Data Safety Layer** é uma camada de segurança de nível enterprise que previne crashes por:

- ✅ **Validação automática** de dados da API
- ✅ **Normalização consistente** de respostas
- ✅ **Proteção contra null/undefined**
- ✅ **Conversão segura** de objetos para JSX
- ✅ **Garantia de arrays válidos**
- ✅ **Retry automático** em falhas de rede
- ✅ **Timeout** em requisições lentas

### Componentes da Arquitetura

```
┌─────────────────────────────────────┐
│   REACT COMPONENTS                  │
│   ↓ usa                             │
├─────────────────────────────────────┤
│   SAFE HOOKS (useSafeFetch, etc)   │
│   ↓ usa                             │
├─────────────────────────────────────┤
│   SAFE API CLIENT (fetch wrapper)  │
│   ↓ usa                             │
├─────────────────────────────────────┤
│   DATA SAFETY UTILS (validação)    │
│   ↓ valida                          │
├─────────────────────────────────────┤
│   RAW API RESPONSE                  │
└─────────────────────────────────────┘
```

---

## 🚀 INSTALAÇÃO E SETUP

### 1. Arquivos Criados

```
FrontEnd/src/
  ├── utils/
  │   ├── dataSafety.js     # Funções core de segurança
  │   └── safeApi.js        # Cliente API seguro
  └── hooks/
      └── useSafeData.js    # React Hooks seguros
```

### 2. Import nos Componentes

```jsx
// Funções utilitárias
import { 
  safeGet, 
  safeArray, 
  safeString,
  safeMap 
} from '@/utils/dataSafety';

// Cliente API
import { api, useSafeApi } from '@/utils/safeApi';

// Hooks React
import { 
  useSafeFetch, 
  useSafeArray 
} from '@/hooks/useSafeData';
```

---

## 📚 API REFERENCE

### 🔹 Core Utilities (dataSafety.js)

#### `safeGet(obj, path, defaultValue)`
Acessa propriedades aninhadas com segurança.

```jsx
// ❌ ANTES - PERIGOSO
const name = user.profile.name; // CRASH se user ou profile for null

// ✅ DEPOIS - SEGURO
const name = safeGet(user, 'profile.name', 'Anonymous');
const email = safeGet(user, ['profile', 'email'], 'no-email@example.com');
```

#### `safeArray(value, defaultValue)`
Garante array válido.

```jsx
// ❌ ANTES - PERIGOSO  
{items.map(item => <div>{item.name}</div>)} // CRASH se items = null

// ✅ DEPOIS - SEGURO
{safeArray(items).map(item => <div>{item.name}</div>)}
```


#### `safeString(value, defaultValue)`
Converte para string segura.

```jsx
// ❌ ANTES - PERIGOSO
<p>{user.bio}</p> // CRASH se bio for objeto

// ✅ DEPOIS - SEGURO
<p>{safeString(user.bio, 'Sem biografia')}</p>
```

#### `safeMap(array, renderFn, keyExtractor)`
Map seguro com keys automáticas.

```jsx
// ❌ ANTES - PERIGOSO
{users.map((user, i) => (
  <div key={i}>{user.name}</div>
))}

// ✅ DEPOIS - SEGURO
{safeMap(users, (user, i, key) => (
  <div key={key}>{safeString(user.name)}</div>
))}
```

#### `normalizeApiResponse(response)`
Normaliza qualquer resposta da API para formato consistente.

```jsx
// Entrada variada:
// { success: true, data: [...] }
// { dados: [...] }
// [...]
// { users: [...], meta: {} }

// Saída padronizada:
// { success: true, data: [...], error: null, meta: {} }

const normalized = normalizeApiResponse(apiResponse);
if (normalized.success) {
  setData(normalized.data);
}
```

---

### 🔹 Safe API Client (safeApi.js)

#### Cliente Singleton

```jsx
import { api } from '@/utils/safeApi';

// GET request
const response = await api.get('/api/users', { token });

// POST request
const response = await api.post('/api/users', { name: 'John' }, { token });

// GET com extração automática de array
const users = await api.getArray('/api/users', 'users', { token });
```

#### Hook useSafeApi

```jsx
import { useSafeApi } from '@/utils/safeApi';
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { token } = useAuth();
  const api = useSafeApi(token);

  const loadData = async () => {
    const response = await api.get('/api/users');
    if (response.success) {
      setUsers(response.data);
    }
  };
}
```


---

### 🔹 Safe React Hooks (useSafeData.js)

#### `useSafeFetch(endpoint, options)`
Fetch automático com validação.

```jsx
import { useSafeFetch } from '@/hooks/useSafeData';

function UserProfile({ userId }) {
  const { data: user, loading, error, refetch } = useSafeFetch(
    `/api/users/${userId}`,
    {
      token,
      dataPath: 'user', // Extrai user de response.data.user
      initialData: null,
    }
  );

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return <div>{safeString(user?.name)}</div>;
}
```

#### `useSafeArray(endpoint, options)`
Array garantido em todos os estados.

```jsx
import { useSafeArray } from '@/hooks/useSafeData';

function UserList() {
  const { items, loading, error, isEmpty } = useSafeArray(
    '/api/users',
    {
      token,
      preferredKey: 'users',
      initialItems: [],
    }
  );

  // items é SEMPRE array válido, nunca null/undefined
  return (
    <div>
      {items.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

#### `useSafePagination(endpoint, options)`
Paginação automática com validação.

```jsx
import { useSafePagination } from '@/hooks/useSafeData';

function PaginatedList() {
  const {
    items,
    page,
    totalPages,
    loading,
    nextPage,
    prevPage,
    hasNextPage,
  } = useSafePagination('/api/users', {
    token,
    pageSize: 20,
  });

  return (
    <div>
      {items.map(user => <UserCard key={user.id} user={user} />)}
      <button onClick={prevPage} disabled={!hasPrevPage}>
        Anterior
      </button>
      <span>{page} / {totalPages}</span>
      <button onClick={nextPage} disabled={!hasNextPage}>
        Próxima
      </button>
    </div>
  );
}
```



#### `useSafeForm(options)`
Gerenciamento de formulários com validação.

```jsx
import { useSafeForm } from '@/hooks/useSafeData';

function UserForm() {
  const { values, errors, handleChange, handleSubmit, isSubmitting } = useSafeForm({
    initialValues: { name: '', email: '' },
    validate: (values) => {
      const errors = {};
      if (!values.name) errors.name = 'Nome obrigatório';
      if (!values.email) errors.email = 'Email obrigatório';
      return errors;
    },
    onSubmit: async (values) => {
      await api.post('/api/users', values, { token });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
      />
      {errors.name && <span className="error">{errors.name}</span>}
      
      <input
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

---

## 🎯 EXEMPLOS PRÁTICOS

### Exemplo 1: Dashboard com Estatísticas

```jsx
import { useSafeFetch } from '@/hooks/useSafeData';
import { safeGet, safeFormatNumber } from '@/utils/dataSafety';

function DashboardStats() {
  const { token } = useAuth();
  const { data: stats, loading, error } = useSafeFetch('/api/admin/stats', {
    token,
    dataPath: 'data',
    initialData: {}
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay message={error} />;

  // ✅ Extração segura com fallbacks
  const totalUsers = safeGet(stats, 'usuarios.total', 0);
  const activeUsers = safeGet(stats, 'usuarios.ativos', 0);
  const totalTournaments = safeGet(stats, 'torneios.total', 0);

  return (
    <div className="stats-grid">
      <StatCard
        title="Total de Usuários"
        value={safeFormatNumber(totalUsers)}
        subtitle={`${safeFormatNumber(activeUsers)} ativos`}
      />
      <StatCard
        title="Torneios"
        value={safeFormatNumber(totalTournaments)}
      />
    </div>
  );
}
```

### Exemplo 2: Lista com Busca e Filtros

```jsx
import { useSafeArray } from '@/hooks/useSafeData';
import { safeMap, safeString } from '@/utils/dataSafety';

function UserList() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { items: users, loading, error, refetch } = useSafeArray(
    '/api/users',
    {
      token,
      preferredKey: 'users',
      initialItems: []
    }
  );

  // ✅ Filtragem segura
  const filteredUsers = users.filter(user =>
    safeString(user.name, '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />;

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar usuário..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {filteredUsers.length === 0 ? (
        <EmptyState message="Nenhum usuário encontrado" />
      ) : (
        <div className="user-grid">
          {safeMap(filteredUsers, (user, i, key) => (
            <UserCard
              key={key}
              name={safeString(user.name, 'Usuário')}
              email={safeString(user.email, 'Sem email')}
              avatar={safeString(user.avatar, '/default-avatar.png')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Exemplo 3: Formulário Complexo com Validação

```jsx
import { useSafeForm } from '@/hooks/useSafeData';
import { api } from '@/utils/safeApi';
import { safeString } from '@/utils/dataSafety';

function CreateQuestionForm({ onSuccess }) {
  const { token } = useAuth();
  
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useSafeForm({
    initialValues: {
      texto: '',
      disciplinaId: '',
      dificuldade: 'medio',
      opcoes: ['', '', '', ''],
      respostaCorreta: 0
    },
    validate: (vals) => {
      const errs = {};
      
      if (!safeString(vals.texto).trim()) {
        errs.texto = 'Texto da questão obrigatório';
      }
      
      if (!vals.disciplinaId) {
        errs.disciplinaId = 'Selecione uma disciplina';
      }
      
      const opcoesValidas = vals.opcoes.filter(o => safeString(o).trim());
      if (opcoesValidas.length < 2) {
        errs.opcoes = 'Mínimo 2 opções obrigatórias';
      }
      
      return errs;
    },
    onSubmit: async (vals) => {
      const response = await api.post('/api/questoes', vals, { token });
      
      if (response.success) {
        onSuccess(response.data);
      }
    }
  });

  return (
    <form onSubmit={handleSubmit} className="question-form">
      <div className="form-group">
        <label>Texto da Questão *</label>
        <textarea
          value={values.texto}
          onChange={(e) => handleChange('texto', e.target.value)}
          onBlur={() => handleBlur('texto')}
          className={errors.texto && touched.texto ? 'error' : ''}
        />
        {errors.texto && touched.texto && (
          <span className="error-message">{errors.texto}</span>
        )}
      </div>

      <div className="form-group">
        <label>Disciplina *</label>
        <select
          value={values.disciplinaId}
          onChange={(e) => handleChange('disciplinaId', e.target.value)}
          onBlur={() => handleBlur('disciplinaId')}
        >
          <option value="">Selecione...</option>
          {/* Options aqui */}
        </select>
        {errors.disciplinaId && touched.disciplinaId && (
          <span className="error-message">{errors.disciplinaId}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Criar Questão'}
      </button>
    </form>
  );
}
```

### Exemplo 4: Tabela com Ordenação e Paginação

```jsx
import { useSafePagination } from '@/hooks/useSafeData';
import { safeMap, safeString, safeFormatDate } from '@/utils/dataSafety';

function UsersTable() {
  const { token } = useAuth();
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    items,
    page,
    totalPages,
    loading,
    setPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  } = useSafePagination('/api/users', {
    token,
    pageSize: 20,
    dataPath: 'users'
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // ✅ Ordenação segura
  const sortedItems = [...items].sort((a, b) => {
    const aVal = safeString(a[sortBy], '');
    const bVal = safeString(b[sortBy], '');
    
    if (sortOrder === 'asc') {
      return aVal.localeCompare(bVal);
    } else {
      return bVal.localeCompare(aVal);
    }
  });

  if (loading) return <TableSkeleton />;

  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              Nome {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('email')}>
              Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th>Criado em</th>
          </tr>
        </thead>
        <tbody>
          {safeMap(sortedItems, (user, i, key) => (
            <tr key={key}>
              <td>{safeString(user.name, 'Sem nome')}</td>
              <td>{safeString(user.email, 'Sem email')}</td>
              <td>{safeFormatDate(user.createdAt, 'pt-BR', 'Data inválida')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={prevPage} disabled={!hasPrevPage}>
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button onClick={nextPage} disabled={!hasNextPage}>
          Próxima
        </button>
      </div>
    </div>
  );
}
```

---

## 🎨 PADRÕES DE REFATORAÇÃO

### Antes → Depois: Perfil do Usuário

#### ❌ ANTES (PERIGOSO)
```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  // 🚨 CRASH se user.profile for undefined
  return (
    <div>
      <h1>{user.profile.name}</h1>
      <p>{user.bio}</p>
      <img src={user.avatar} />
      
      {/* 🚨 CRASH se activities não for array */}
      {user.activities.map(activity => (
        <div key={activity.id}>
          {/* 🚨 CRASH se activity for objeto */}
          <p>{activity}</p>
        </div>
      ))}
    </div>
  );
}
```

#### ✅ DEPOIS (SEGURO)
```jsx
import { useSafeFetch } from '@/hooks/useSafeData';
import { safeGet, safeString, safeMap, safeImageProps } from '@/utils/dataSafety';

function UserProfile({ userId }) {
  const { token } = useAuth();
  const { data: user, loading, error } = useSafeFetch(
    `/api/users/${userId}`,
    {
      token,
      initialData: {}
    }
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay message={error} />;

  // ✅ Extração segura com fallbacks
  const name = safeGet(user, 'profile.name', 'Usuário Anônimo');
  const bio = safeString(user.bio, 'Sem biografia');
  const avatar = safeGet(user, 'avatar', '/default-avatar.png');
  const activities = safeGet(user, 'activities', []);

  return (
    <div>
      <h1>{name}</h1>
      <p>{bio}</p>
      <img {...safeImageProps(avatar, name)} />
      
      {/* ✅ Map seguro com conversão de strings */}
      {safeMap(activities, (activity, i, key) => (
        <div key={key}>
          <p>{safeString(activity.description, `Atividade ${i + 1}`)}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 💡 BEST PRACTICES

### 1. ✅ SEMPRE use hooks seguros para fetch

```jsx
// ❌ EVITE fetch manual
useEffect(() => {
  fetch('/api/data').then(...)
}, []);

// ✅ USE hook seguro
const { data, loading, error } = useSafeFetch('/api/data', { token });
```

### 2. ✅ SEMPRE valide arrays antes de .map()

```jsx
// ❌ NUNCA
{items.map(...)}

// ✅ SEMPRE
{safeMap(items, (item, i, key) => (...))}
// OU
{Array.isArray(items) && items.map(...)}
```

### 3. ✅ SEMPRE use safeGet para acessos aninhados

```jsx
// ❌ NUNCA
const name = user.profile.name;

// ✅ SEMPRE
const name = safeGet(user, 'profile.name', 'Default');
```

### 4. ✅ SEMPRE converta para string antes de renderizar

```jsx
// ❌ NUNCA
<p>{someValue}</p>  // Pode ser objeto!

// ✅ SEMPRE
<p>{safeString(someValue, 'N/A')}</p>
```

### 5. ✅ SEMPRE normalize respostas da API

```jsx
// ❌ EVITE assumir estrutura
const data = response.data;

// ✅ USE normalização
const normalized = normalizeApiResponse(response);
if (normalized.success) {
  setData(normalized.data);
}
```

### 6. ✅ SEMPRE use keys únicas em listas

```jsx
// ❌ EVITE index como key
{items.map((item, i) => <div key={i}>...</div>)}

// ✅ USE id ou chave única
{safeMap(items, (item, i, key) => <div key={key}>...</div>)}
```

### 7. ✅ SEMPRE proteja imagens com fallback

```jsx
// ❌ NUNCA
<img src={user.avatar} alt="Avatar" />

// ✅ SEMPRE
<img {...safeImageProps(user.avatar, 'Avatar')} />
```

### 8. ✅ SEMPRE valide datas antes de formatar

```jsx
// ❌ NUNCA
<p>{new Date(date).toLocaleDateString()}</p>

// ✅ SEMPRE
<p>{safeFormatDate(date, 'pt-BR', 'Data inválida')}</p>
```

---

## 🚨 ERROS COMUNS E SOLUÇÕES

### Erro 1: "Objects are not valid as a React child"

**Causa**: Renderizando objeto diretamente
```jsx
❌ <p>{user}</p>  // user é objeto
```

**Solução**:
```jsx
✅ <p>{safeString(user.name, 'Usuário')}</p>
✅ <p>{safeRender(user, 'Dados inválidos')}</p>
```

### Erro 2: "Cannot read property 'X' of undefined"

**Causa**: Acesso a propriedade de objeto undefined/null
```jsx
❌ const name = user.profile.name;
```

**Solução**:
```jsx
✅ const name = safeGet(user, 'profile.name', 'Default');
✅ const name = user?.profile?.name ?? 'Default';
```

### Erro 3: ".map is not a function"

**Causa**: Tentando mapear valor que não é array
```jsx
❌ {items.map(item => ...)}
```

**Solução**:
```jsx
✅ {safeMap(items, (item, i, key) => ...)}
✅ {Array.isArray(items) && items.map(...)}
```

### Erro 4: "Cannot convert undefined to object"

**Causa**: Desestruturação de undefined
```jsx
❌ const { name, email } = user;
```

**Solução**:
```jsx
✅ const { name, email } = user ?? {};
✅ const name = safeGet(user, 'name', '');
```

---

## 📊 CHECKLIST DE REFATORAÇÃO

Para cada componente:

- [ ] **Imports adicionados**
  ```jsx
  import { safeGet, safeArray, safeString, safeMap } from '@/utils/dataSafety';
  import { useSafeFetch, useSafeArray } from '@/hooks/useSafeData';
  ```

- [ ] **Fetch substituído**
  - [ ] `useEffect + fetch` → `useSafeFetch`
  - [ ] Arrays → `useSafeArray`
  - [ ] Paginação → `useSafePagination`

- [ ] **Acessos protegidos**
  - [ ] `obj.prop` → `safeGet(obj, 'prop', default)`
  - [ ] `arr.length` → `safeArray(arr).length`

- [ ] **Renderização segura**
  - [ ] `{value}` → `{safeString(value, fallback)}`
  - [ ] `{obj}` → `{safeRender(obj, fallback)}`

- [ ] **Maps validados**
  - [ ] `arr.map()` → `safeMap(arr, fn)`

- [ ] **Imagens com fallback**
  - [ ] `<img src />` → `<img {...safeImageProps()} />`

- [ ] **Datas formatadas**
  - [ ] `Date` → `safeFormatDate()`

---

## 🎯 RESULTADO ESPERADO

Após aplicação completa do Data Safety Layer:

✅ **Zero crashes** por dados inválidos  
✅ **Comportamento determinístico**  
✅ **Fallbacks consistentes**  
✅ **Retry automático**  
✅ **Código limpo**  
✅ **Manutenção facilitada**  

---

**Versão**: 2.0.0 COMPLETO  
**Última Atualização**: 21 de Junho de 2026  
**Status**: ✅ DOCUMENTAÇÃO COMPLETA
