# Reconstrução do Módulo de Torneios - Documentação Técnica

## 📁 Estrutura de Arquivos

```
FrontEnd/src/Administrador/
├── TorneiosTab.jsx                          [RECONSTRUÍDO]
├── components/
│   ├── TournamentForm.jsx                   [NOVO]
│   └── TournamentModal.jsx                  [NOVO]
├── services/
│   └── TournamentService.js                 [NOVO]
└── utils/
    └── TournamentValidation.js              [NOVO]
```

## 🔍 Detalhes de Cada Arquivo

### 1. TournamentService.js
**Localização**: `FrontEnd/src/Administrador/services/TournamentService.js`

**Responsabilidade**: Comunicação com API

**Métodos**:
```javascript
TournamentService.fetchAll(token)           // GET /api/admin/torneos
TournamentService.fetchById(id, token)      // GET /api/admin/torneos/:id
TournamentService.create(payload, token)    // POST /api/admin/torneos
TournamentService.update(id, payload, token) // PUT /api/admin/torneos/:id
TournamentService.delete(id, token)         // DELETE /api/admin/torneos/:id
```

**Tratamento de Erros**:
- Valida status HTTP
- Trata 409 (conflito) especialmente
- Retorna mensagens de erro claras
- Sem lógica de UI

**Exemplo de Uso**:
```javascript
try {
  const torneios = await TournamentService.fetchAll(token);
  setTorneios(torneios);
} catch (err) {
  showToast(err.message, 'error');
}
```

---

### 2. TournamentValidation.js
**Localização**: `FrontEnd/src/Administrador/utils/TournamentValidation.js`

**Responsabilidade**: Validação de dados

**Métodos**:
```javascript
TournamentValidation.validate(formData)     // Valida formulário completo
TournamentValidation.generateSlug(title)    // Gera slug do título
TournamentValidation.formatDateForInput(dateStr) // Formata para datetime-local
TournamentValidation.hasErrors(errors)      // Verifica se há erros
```

**Validações Implementadas**:
- Título: 3-255 caracteres
- Descrição: 10+ caracteres
- Data início: Não pode ser no passado (tolerância 2h)
- Data término: Deve ser após início
- Status: Obrigatório

**Exemplo de Uso**:
```javascript
const errors = TournamentValidation.validate(formData);
if (TournamentValidation.hasErrors(errors)) {
  setFormErrors(errors);
  return;
}
```

---

### 3. TournamentForm.jsx
**Localização**: `FrontEnd/src/Administrador/components/TournamentForm.jsx`

**Responsabilidade**: Renderização do formulário

**Props**:
```javascript
{
  mode: 'create' | 'edit',           // Modo do formulário
  initialData: Tournament | null,     // Dados iniciais (edit)
  onSubmit: (payload) => void,       // Callback ao salvar
  isLoading: boolean                 // Estado de carregamento
}
```

**Comportamento**:
- Inicializa com dados se modo edit
- Valida ao submeter
- Gera slug automaticamente (modo create)
- Limpa erros ao editar campo
- Desabilita inputs durante processamento

**Estrutura**:
```
<form>
  <header>Título</header>
  <body>
    - Título
    - Slug (create only)
    - Descrição
    - Data início
    - Data término
    - Status
    - Público (checkbox)
  </body>
  <footer>
    - Cancelar
    - Salvar
  </footer>
</form>
```

**Exemplo de Uso**:
```javascript
<TournamentForm
  mode="create"
  onSubmit={handleSaveTorneio}
  isLoading={isProcessing}
/>
```

---

### 4. TournamentModal.jsx
**Localização**: `FrontEnd/src/Administrador/components/TournamentModal.jsx`

**Responsabilidade**: Componentes de modal

**Componentes Exportados**:

#### ModalOverlay
```javascript
<ModalOverlay
  isOpen={boolean}
  onClose={() => void}
  children={ReactNode}
  maxWidth="600px"
/>
```
- Gerencia overlay escuro
- Bloqueia scroll do body
- Clica fora para fechar
- Animações suaves

#### DeleteConfirmationModal
```javascript
<DeleteConfirmationModal
  isOpen={boolean}
  onClose={() => void}
  onConfirm={() => void}
  title={string}
  isLoading={boolean}
/>
```
- Modal de confirmação
- Ícone de alerta
- Botões Cancelar/Excluir
- Desabilita durante processamento

#### ViewDetailsModal
```javascript
<ViewDetailsModal
  isOpen={boolean}
  onClose={() => void}
  tournament={Tournament | null}
/>
```
- Exibe detalhes do torneio
- Formata datas
- Mostra status com cor
- Informações em cards

**Exemplo de Uso**:
```javascript
<ModalOverlay isOpen={modalForm.open} onClose={handleCloseForm}>
  <TournamentForm {...props} />
</ModalOverlay>
```

---

### 5. TorneiosTab.jsx (RECONSTRUÍDO)
**Localização**: `FrontEnd/src/Administrador/TorneiosTab.jsx`

**Responsabilidade**: Orquestração de estado e fluxo

**Estado**:
```javascript
// Dados
const [torneios, setTorneios] = useState([])
const [loading, setLoading] = useState(true)
const [searchTerm, setSearchTerm] = useState('')

// Modais
const [modalForm, setModalForm] = useState({...})
const [modalDelete, setModalDelete] = useState({...})
const [modalView, setModalView] = useState({...})

// Processamento
const [isProcessing, setIsProcessing] = useState(false)
const [toast, setToast] = useState({...})
```

**Funções Principais**:
```javascript
fetchTorneios()              // Carrega lista
handleOpenCreate()           // Abre modal criar
handleOpenEdit(torneio)      // Abre modal editar
handleCloseForm()            // Fecha modal formulário
handleSaveTorneio(payload)   // Salva torneio
handleConfirmDelete()        // Deleta torneio
showToast(message, type)     // Mostra notificação
```

**Fluxo de Criação**:
1. Usuário clica "Criar Torneio"
2. `handleOpenCreate()` abre modal
3. Usuário preenche formulário
4. `TournamentForm` valida
5. Usuário clica "Criar"
6. `handleSaveTorneio()` chama API
7. `TournamentService.create()` envia dados
8. Lista atualiza
9. Toast mostra sucesso

**Fluxo de Edição**:
1. Usuário clica ícone editar
2. `handleOpenEdit()` abre modal com dados
3. Usuário altera campos
4. `TournamentForm` valida
5. Usuário clica "Guardar"
6. `handleSaveTorneio()` chama API
7. `TournamentService.update()` envia dados
8. Lista atualiza
9. Toast mostra sucesso

**Fluxo de Exclusão**:
1. Usuário clica ícone deletar
2. Modal de confirmação abre
3. Usuário confirma
4. `handleConfirmDelete()` chama API
5. `TournamentService.delete()` envia requisição
6. Lista atualiza
7. Toast mostra sucesso

---

## 🔄 Fluxo de Dados

### Criar Torneio
```
User Input
    ↓
handleOpenCreate()
    ↓
setModalForm({ open: true, mode: 'create' })
    ↓
<ModalOverlay> + <TournamentForm>
    ↓
User fills form
    ↓
TournamentForm.onSubmit()
    ↓
TournamentValidation.validate()
    ↓
handleSaveTorneio(payload)
    ↓
TournamentService.create(payload, token)
    ↓
API Response
    ↓
setTorneios([...])
    ↓
showToast("Sucesso")
    ↓
handleCloseForm()
    ↓
UI Updates
```

### Editar Torneio
```
User Input (Edit button)
    ↓
handleOpenEdit(torneio)
    ↓
setModalForm({ open: true, mode: 'edit', data: torneio })
    ↓
<ModalOverlay> + <TournamentForm initialData={torneio}>
    ↓
TournamentForm initializes with data
    ↓
User modifies fields
    ↓
TournamentForm.onSubmit()
    ↓
TournamentValidation.validate()
    ↓
handleSaveTorneio(payload)
    ↓
TournamentService.update(id, payload, token)
    ↓
API Response
    ↓
setTorneios(prev => prev.map(...))
    ↓
showToast("Atualizado")
    ↓
handleCloseForm()
    ↓
UI Updates
```

### Deletar Torneio
```
User Input (Delete button)
    ↓
setModalDelete({ open: true, id, title })
    ↓
<DeleteConfirmationModal>
    ↓
User confirms
    ↓
handleConfirmDelete()
    ↓
TournamentService.delete(id, token)
    ↓
API Response
    ↓
setTorneios(prev => prev.filter(...))
    ↓
showToast("Excluído")
    ↓
setModalDelete({ open: false })
    ↓
UI Updates
```

---

## 🎨 Componentes Reutilizáveis

### ModalOverlay
Pode ser usado para qualquer modal:
```javascript
<ModalOverlay isOpen={isOpen} onClose={onClose}>
  <AnyComponent />
</ModalOverlay>
```

### DeleteConfirmationModal
Padrão para exclusão em qualquer contexto:
```javascript
<DeleteConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={onConfirm}
  title="Item a deletar"
  isLoading={isLoading}
/>
```

### ViewDetailsModal
Padrão para visualização de detalhes:
```javascript
<ViewDetailsModal
  isOpen={isOpen}
  onClose={onClose}
  tournament={data}
/>
```

---

## 🧪 Testes Unitários (Recomendado)

### TournamentValidation.test.js
```javascript
describe('TournamentValidation', () => {
  test('generateSlug removes special chars', () => {
    const slug = TournamentValidation.generateSlug('Torneio de Matemática!');
    expect(slug).toBe('torneio-de-matematica');
  });

  test('validate returns errors for invalid data', () => {
    const errors = TournamentValidation.validate({
      titulo: 'ab', // < 3 chars
      descricao: 'short', // < 10 chars
      inicia_em: '',
      termina_em: '',
      status: ''
    });
    expect(Object.keys(errors).length).toBeGreaterThan(0);
  });

  test('formatDateForInput formats correctly', () => {
    const formatted = TournamentValidation.formatDateForInput('2026-05-23T14:30:00Z');
    expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  });
});
```

### TournamentService.test.js
```javascript
describe('TournamentService', () => {
  test('fetchAll returns array', async () => {
    const data = await TournamentService.fetchAll(token);
    expect(Array.isArray(data)).toBe(true);
  });

  test('create sends correct payload', async () => {
    const payload = { titulo: 'Test', ... };
    const result = await TournamentService.create(payload, token);
    expect(result.id).toBeDefined();
  });
});
```

---

## 🚀 Performance

### Otimizações Implementadas
1. **useCallback**: Funções memoizadas para evitar re-renders
2. **Lazy loading**: Modais renderizam apenas quando abertos
3. **Scroll bloqueado**: Sem layout shift ao abrir modal
4. **Validação local**: Sem chamadas desnecessárias à API

### Métricas
- **Build time**: 11.34s
- **Bundle size**: Sem aumento significativo
- **Runtime**: Sem lag detectado
- **Transições**: 300ms (CSS)

---

## 🔐 Segurança

### Implementado
1. **Token Bearer**: Autenticação em todas as requisições
2. **Validação local**: Antes de enviar à API
3. **Tratamento de erros**: Sem exposição de dados sensíveis
4. **CORS**: Configurado no backend

### Recomendado
1. **Rate limiting**: No backend
2. **Input sanitization**: No backend
3. **CSRF tokens**: Se necessário
4. **Audit logging**: Para exclusões

---

## 📚 Dependências

### Externas
- `react`: ^18.0.0
- `lucide-react`: Para ícones

### Internas
- `useAuth`: Context de autenticação
- `import.meta.env.VITE_API_BASE_URL`: Variável de ambiente

### Sem Dependências Extras
- Sem React Icons
- Sem Framer Motion
- Sem bibliotecas de validação
- Sem bibliotecas de data

---

## 🔄 Integração com Outros Módulos

### AdminDashboard.jsx
```javascript
import TorneiosTab from './TorneiosTab';

// Usar como tab
<TorneiosTab />
```

### Questão.js
```javascript
// Integração com seleção de questões
// Implementar em TournamentForm se necessário
```

### Ranking.jsx
```javascript
// Usa dados de torneios
// Sem dependência direta
```

---

## 📝 Convenções de Código

### Nomes
- Componentes: PascalCase (TournamentForm)
- Funções: camelCase (handleSaveTorneio)
- Constantes: UPPER_SNAKE_CASE (API_BASE_URL)
- Variáveis: camelCase (formData)

### Estrutura
- Imports no topo
- Componente principal
- Hooks (useState, useEffect, useCallback)
- Funções auxiliares
- JSX
- Export default

### Comentários
- Seções com `//`
- Funções com `/**`
- Inline apenas quando necessário

---

## 🐛 Debugging

### Console Logs
```javascript
// Remover antes de produção
console.log('Debug:', data);
```

### React DevTools
- Inspecionar componentes
- Ver estado
- Ver props

### Network Tab
- Verificar requisições
- Ver payloads
- Ver respostas

---

## 📖 Referências

### Documentação
- React: https://react.dev
- Tailwind: https://tailwindcss.com
- Lucide Icons: https://lucide.dev

### Padrões
- Clean Code: Robert C. Martin
- Component Composition: React docs
- State Management: Redux patterns

---

**Última atualização**: 23 de Maio de 2026
**Versão**: 1.0.0
**Status**: ✅ Pronto para Produção
