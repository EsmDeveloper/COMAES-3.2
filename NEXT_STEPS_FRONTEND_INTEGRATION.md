# 🚀 Frontend Integration - Next Steps

**Current Status**: Backend API endpoints are integrated and ready. Frontend dashboard skeleton exists. Need to add forms and API integration.

---

## 📋 Immediate Tasks (Priority Order)

### TASK 1: Create Bloco Form Component (1-1.5 hours)

**File to Create**: `FrontEnd/src/components/Forms/CreateBlocoForm.jsx`

**Functionality**:
```javascript
// Key Features
- Title input (required, max 255 chars)
- Description textarea (optional)
- Discipline dropdown (auto-filled from user profile or manual selection)
- Difficulty select (facil, medio, dificil)
- Ordem/Order number input (optional)
- Ativo/Active toggle (optional)
- Cancel & Save buttons
- Form validation with error messages
- Loading state during submission

// Props
{
  onSave: (formData) => Promise,
  onCancel: () => void,
  initialData?: { titulo, descricao, ... },  // For edit mode
  isLoading?: boolean
}

// Return Value on Save
{
  titulo: "string",
  descricao: "string",
  categoria: "string", // NOT USED - remove
  ordem: 0,
  ativo: true
}
```

**Example Code Structure**:
```javascript
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function CreateBlocoForm({ onSave, onCancel, initialData, isLoading }) {
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    ordem: initialData?.ordem || 0,
    ativo: initialData?.ativo !== false
  });

  const [errors, setErrors] = useState([]);

  const handleSave = async () => {
    // Validate
    // Call onSave(formData)
    // Handle response
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Form fields here */}
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="...">Cancelar</button>
        <button onClick={handleSave} disabled={isLoading} className="...">
          {isLoading ? 'Salvando...' : 'Salvar Bloco'}
        </button>
      </div>
    </div>
  );
}
```

---

### TASK 2: Create Questão Form Component (1.5-2 hours)

**File to Create**: `FrontEnd/src/components/Forms/CreateQuestaoForm.jsx`

**Functionality**:
```javascript
// Key Features
- Title input (required, max 255 chars)
- Description textarea (required)
- Type select (multipla_escolha | texto | codigo)
  → Conditionally show different fields based on type
- Difficulty select (facil, medio, dificil)
- Points input (1-100)
- Bloco selector dropdown (optional - get from API /api/colaborador/blocos)

// IF Type = multipla_escolha
- Dynamic options list
  - Add/Remove option buttons
  - Text field for each option
  - Radio button to mark as "correct"
  - Optional explanation per option
  - At least 2 options required, max 10
  - Must have 1 correct option

// IF Type = texto or codigo
- Resposta Esperada textarea (expected answer)
- Explicação textarea (explanation)

// Cancel & Save buttons with validation
```

**Example Structure**:
```javascript
const [formData, setFormData] = useState({
  titulo: '',
  descricao: '',
  tipo: 'multipla_escolha',
  dificuldade: 'medio',
  pontos: 10,
  bloco_id: null,
  opcoes: [],
  resposta_esperada: '',
  explicacao: ''
});

const handleAddOption = () => {
  setFormData({
    ...formData,
    opcoes: [...formData.opcoes, { texto: '', correta: false, explicacao: '' }]
  });
};

const handleRemoveOption = (index) => {
  setFormData({
    ...formData,
    opcoes: formData.opcoes.filter((_, i) => i !== index)
  });
};
```

---

### TASK 3: Integrate Forms into Dashboard (1-1.5 hours)

**File to Modify**: `FrontEnd/src/Paginas/Secundarias/ColaboradorDashboardV2.jsx`

**Changes Needed**:

#### MeusBlocosTab Function:
```javascript
// Replace mock data with:
const [blocos, setBlocos] = useState([]);
const [loadingBlocos, setLoadingBlocos] = useState(true);
const [showCreateBlocoForm, setShowCreateBlocoForm] = useState(false);

// Add useEffect to fetch
useEffect(() => {
  fetchBlocos();
}, []);

const fetchBlocos = async () => {
  try {
    const token = localStorage.getItem('comaes_token');
    const res = await fetch(
      `${API_BASE}/api/colaborador/blocos?limite=20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const json = await res.json();
    if (json.sucesso) setBlocos(json.dados.blocos);
  } catch (error) {
    console.error('Error loading blocos:', error);
  } finally {
    setLoadingBlocos(false);
  }
};

const handleCreateBloco = async (formData) => {
  try {
    const token = localStorage.getItem('comaes_token');
    const res = await fetch(`${API_BASE}/api/colaborador/blocos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    const json = await res.json();
    if (json.sucesso) {
      setBlocos([json.dados, ...blocos]);
      setShowCreateBlocoForm(false);
      // Toast notification: "Bloco criado com sucesso!"
    }
  } catch (error) {
    // Toast notification: "Erro ao criar bloco"
    console.error(error);
  }
};

// In render, conditionally show form or list
if (showCreateBlocoForm) {
  return <CreateBlocoForm 
    onSave={handleCreateBloco} 
    onCancel={() => setShowCreateBlocoForm(false)}
  />;
}

// Show list with loading state
if (loadingBlocos) return <div>Carregando...</div>;

// Show blocos cards...
```

#### MinhasQuestoesTab Function:
```javascript
// Similar pattern to MeusBlocosTab
// Fetch from /api/colaborador/questoes
// Handle create/edit/delete
// Show form when needed
```

---

### TASK 4: Replace Mock Data in Tabs (1 hour)

**Replace In**:
- `MeusBlocosTab()` - Remove static mock array
- `MinhasQuestoesTab()` - Remove static mock array
- `EstatisticasTab()` - Fetch real stats from data

**API Endpoints to Use**:
```
GET /api/colaborador/blocos?limite=20&pagina=1
GET /api/colaborador/questoes?limite=20&pagina=1
GET /api/colaborador/blocos/:id
GET /api/colaborador/questoes/:id
PUT /api/colaborador/blocos/:id
PUT /api/colaborador/questoes/:id
DELETE /api/colaborador/blocos/:id
DELETE /api/colaborador/questoes/:id
```

---

### TASK 5: Add Toast Notifications (30 mins)

**Implement Feedback Messages**:
```javascript
// For successful operations
- "Bloco criado com sucesso!"
- "Questão atualizada com sucesso!"
- "Bloco deletado com sucesso!"

// For errors
- "Erro ao criar bloco. Tente novamente."
- "Permissão negada."

// Use a toast library or create simple toast component
// Or just show alert() for MVP
```

---

## 🔗 API Integration Template

### Pattern for API Calls

```javascript
import { useAuth } from '../../context/AuthContext';

export default function MyComponent() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(`${API_BASE}/api/colaborador/blocos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const json = await res.json();
      if (json.sucesso) {
        setData(json.dados.blocos);
      } else {
        setError(json.mensagem);
      }
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <div>
      {data.map(item => <div key={item.id}>{item.titulo}</div>)}
    </div>
  );
}
```

---

## ✅ Testing Checklist

### Before Submitting Code:

**Bloco Form**:
- [ ] Title validation (required, max 255 chars)
- [ ] Discipline auto-fills from user profile
- [ ] Save button submits to API
- [ ] Error messages display on validation fail
- [ ] Loading state shows while saving
- [ ] Success redirects/closes form
- [ ] Cancel button closes form without saving

**Questão Form**:
- [ ] Type selector changes form fields
- [ ] Multiple choice shows options list
- [ ] At least 1 option must be marked "correct"
- [ ] Bloco dropdown loads from API
- [ ] Save button validates all required fields
- [ ] Points field only accepts 1-100
- [ ] Dificuldade selector works

**Dashboard Integration**:
- [ ] Blocos tab loads and displays list
- [ ] "Criar Bloco" button opens form
- [ ] Create form works end-to-end
- [ ] New bloco appears in list immediately
- [ ] Edit/Delete buttons on cards work
- [ ] Questões tab works similarly
- [ ] Stats tab shows real numbers
- [ ] Mobile responsive on all screens

**Permissions**:
- [ ] Colaborador can only see own data
- [ ] Admin cannot access these endpoints (gets 403)
- [ ] Unauthenticated user cannot access (gets 401)

---

## 🎨 UI Components Needed

### Toast/Notification System
```javascript
// Simple approach - use native alert or implement toast
const showSuccess = (message) => {
  // Could use react-toastify or custom implementation
  alert(message);
};

const showError = (message) => {
  alert(`Erro: ${message}`);
};
```

### Modal/Dialog for Confirmation
```javascript
// For delete operations
const confirmDelete = () => {
  if (window.confirm('Tem certeza que deseja deletar?')) {
    // Proceed with delete
  }
};
```

### Loading Spinner
```javascript
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
  </div>
);
```

---

## 📚 Component Structure Summary

```
FrontEnd/src/
├── components/
│   ├── Forms/ (NEW FOLDER)
│   │   ├── CreateBlocoForm.jsx (NEW)
│   │   └── CreateQuestaoForm.jsx (NEW)
│   └── components_teste/
│       ├── QuestionCardEnhanced.jsx (ALREADY DONE)
│       └── ResultScreenEnhanced.jsx (ALREADY DONE)
│
└── Paginas/Secundarias/
    └── ColaboradorDashboardV2.jsx (MODIFY - add API integration)
```

---

## 🔍 Common Pitfalls to Avoid

1. **Token Management**
   - Always use `localStorage.getItem('comaes_token')`
   - Include in Authorization header: `Bearer ${token}`
   - Don't hardcode tokens

2. **Error Handling**
   - Check `response.ok` before parsing JSON
   - Handle network errors with try/catch
   - Show user-friendly error messages

3. **Loading States**
   - Show loading indicator while fetching
   - Disable buttons during submission
   - Handle race conditions with cleanup

4. **Data Validation**
   - Validate on client before sending to server
   - Show specific error messages for each field
   - Don't submit invalid data

5. **Performance**
   - Use pagination (API supports limit/page params)
   - Don't fetch all data at once
   - Implement search/filtering on front-end if <100 items

---

## 🚀 Deployment After Tasks Complete

Once all forms and API integration are done:

1. [ ] Test all CRUD operations
2. [ ] Test permissions/auth
3. [ ] Test on mobile devices
4. [ ] Check browser console for errors
5. [ ] Verify all API endpoints working
6. [ ] Test with real colaborador accounts
7. [ ] Ready to deploy

---

## 📞 Quick Reference

### API Endpoint Base
```
GET  /api/colaborador/blocos              → List user's blocos
POST /api/colaborador/blocos              → Create new bloco
GET  /api/colaborador/blocos/:id          → Get bloco detail
PUT  /api/colaborador/blocos/:id          → Update bloco
DELETE /api/colaborador/blocos/:id        → Delete bloco

GET  /api/colaborador/questoes            → List user's questões
POST /api/colaborador/questoes            → Create new questão
GET  /api/colaborador/questoes/:id        → Get questão detail
PUT  /api/colaborador/questoes/:id        → Update questão
DELETE /api/colaborador/questoes/:id      → Delete questão
```

### Response Format
```javascript
{
  sucesso: true,
  mensagem: "Bloco criado com sucesso",
  dados: {
    blocos: [...],      // or single object
    paginacao: {
      pagina: 1,
      limite: 20,
      total: 5,
      totalPaginas: 1
    },
    estatisticas: {...}
  },
  timestamp: "2026-06-05T..."
}
```

### Error Response
```javascript
{
  sucesso: false,
  mensagem: "Dados inválidos",
  erros: ["Título é obrigatório", "..."],
  timestamp: "2026-06-05T..."
}
```

---

## 🎓 Learning Resources

- React Hooks: useState, useEffect, useContext
- Fetch API: GET, POST, PUT, DELETE
- Form handling in React
- Error handling and loading states
- API integration patterns

---

**Estimated Time to Complete**: 5-6 hours  
**Difficulty**: Medium (API integration + React forms)  
**Priority**: HIGH - Core functionality

Good luck! 🚀
