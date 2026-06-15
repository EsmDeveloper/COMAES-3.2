# Guia de Integração - Questões Pendentes & Colaboradores

## 🔗 Como Integrar ao Painel Admin

### Passo 1: Importar os Componentes

No arquivo de painel admin (ex: `AdminPanel.jsx` ou `AdminDashboard.jsx`):

```jsx
import QuestoesPendentesTab from './QuestoesPendentesTab';
import QuestoesColaboradoresTab from './QuestoesColaboradoresTab';
```

### Passo 2: Adicionar as Abas

Dentro da estrutura de tabs/navegação do painel:

```jsx
import { BookOpen, Users } from 'lucide-react';

// Dentro do retorno JSX do componente:
<div className="admin-panel-tabs">
  {/* Abas existentes... */}
  
  <Tab 
    label="Questões Pendentes" 
    icon={<BookOpen className="w-5 h-5" />}
    id="questoes-pendentes"
  >
    <QuestoesPendentesTab token={token} />
  </Tab>

  <Tab 
    label="Questões dos Colaboradores" 
    icon={<Users className="w-5 h-5" />}
    id="questoes-colaboradores"
  >
    <QuestoesColaboradoresTab token={token} />
  </Tab>
  
  {/* Mais abas... */}
</div>
```

### Passo 3: Certificar-se que o Token está disponível

Ambos componentes esperam o token em `localStorage`:

```js
// Em QuestoesPendentesTab.jsx:
// Usa questoesService que pega token automaticamente

// Em QuestoesColaboradoresTab.jsx:
const token = localStorage.getItem('comaes_token');
```

Se estiver usando Context API:

```jsx
// Modificar em QuestoesColaboradoresTab.jsx:
import { useAuth } from '../context/AuthContext';

export default function QuestoesColaboradoresTab() {
  const { token } = useAuth(); // ao invés de localStorage
  // resto do código...
}
```

---

## 📍 Estrutura de Arquivo Esperada

```
FrontEnd/src/Administrador/
├── QuestoesPendentesTab.jsx (REFATORADO)
├── QuestoesColaboradoresTab.jsx (NOVO)
├── BlocoQuestoesManager.jsx
├── BlocosColaboradoresTab.jsx
├── AdminPanel.jsx (ou similar - onde integrar as abas)
├── shared/
│   └── QuestaoCardsComponents.jsx (NOVO - COMPARTILHADO)
├── services/
│   ├── questoesService.js
│   ├── BlocosService.js
│   └── ...
└── REFACTOR_SUMMARY.md
```

---

## 🔧 Dependências Requeridas

### Lucide React (ícones)
```json
"lucide-react": "^latest"
```

### Axios (requisições HTTP)
```json
"axios": "^latest"
```

### Tailwind CSS
- Já deve estar configurado no projeto

### React
```json
"react": "^18.0.0",
"react-dom": "^18.0.0"
```

---

## 🌐 APIs Esperadas do Backend

### GET /api/questoes-pendentes
Listar questões pendentes

**Query params:**
- `status_aprovacao`: 'pendente'
- `disciplina`: (opcional)
- `page`, `limit`: (opcional)

**Response:**
```json
{
  "sucesso": true,
  "dados": {
    "questoes": [
      {
        "id": 1,
        "titulo": "...",
        "descricao": "...",
        "disciplina": "matematica",
        "dificuldade": "facil",
        "opcoes": ["A", "B", "C", "D"],
        "resposta_correta": "A",
        "pontos": 10,
        "status_aprovacao": "pendente",
        "created_at": "2024-01-01T10:00:00Z",
        "autor_id": 123
      }
    ],
    "total": 50
  },
  "mensagem": "Sucesso"
}
```

### PATCH /api/questoes/:id/aprovar
Aprovar questão

**Response:**
```json
{
  "sucesso": true,
  "mensagem": "Questão aprovada com sucesso"
}
```

### PATCH /api/questoes/:id/rejeitar
Rejeitar questão

**Body:**
```json
{
  "motivo": "Enunciado mal formulado"
}
```

**Response:**
```json
{
  "sucesso": true,
  "mensagem": "Questão rejeitada com sucesso"
}
```

### GET /api/blocos-colaboradores
Listar blocos de colaboradores

**Query params:**
- `status`: 'aprovado' (para aba de colaboradores)
- `disciplina`: (opcional)
- `limit`: 100

**Response:**
```json
{
  "sucesso": true,
  "dados": {
    "blocos": [
      {
        "id": 1,
        "titulo": "Álgebra Avançada",
        "descricao": "...",
        "disciplina": "matematica",
        "dificuldade": "medio",
        "status": "publicado",
        "total_questoes": 15,
        "questoes": [
          {
            "id": 1,
            "titulo": "Questão 1",
            "pontos": 10,
            "dificuldade": "facil"
          }
        ],
        "colaborador": {
          "id": 1,
          "nome": "João Silva",
          "email": "joao@example.com",
          "avatar": "url"
        },
        "created_at": "2024-01-01T10:00:00Z"
      }
    ]
  }
}
```

### GET /api/blocos-colaboradores/:id
Detalhes do bloco

**Response:** Mesmo formato acima, com questões expandidas

### DELETE /api/blocos-colaboradores/:id
Deletar bloco

**Response:**
```json
{
  "sucesso": true,
  "mensagem": "Bloco deletado com sucesso"
}
```

---

## 🧪 Testes de Integração

### 1. Testar Conexão
```js
// Console do navegador
const token = localStorage.getItem('comaes_token');
fetch('http://localhost:3000/api/questoes?status_aprovacao=pendente', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

### 2. Testar Componente
```jsx
// Em teste.jsx
import QuestoesPendentesTab from './Administrador/QuestoesPendentesTab';

export default function TestPage() {
  return <QuestoesPendentesTab />;
}
```

---

## ⚡ Performance e Otimizações

### Lazy Loading
Questões são carregadas apenas ao expandir o bloco:

```jsx
// Em QuestoesColaboradoresTab.jsx
if (!expandido && questoesCarregadas.length === 0) {
  // Carregar questões
}
```

### Memoization
Se houver re-renders excessivos, adicionar useMemo:

```jsx
const blocosFiltrados = useMemo(() => 
  state.blocos.filter(/* ... */),
  [state.blocos, state.filtros]
);
```

---

## 🐛 Troubleshooting

### "questoesService is not defined"
- Verificar se o arquivo `services/questoesService.js` existe
- Verificar se está sendo importado corretamente
- Path relativo correto?

### "Token undefined"
- Verificar localStorage: `console.log(localStorage.getItem('comaes_token'))`
- Confirmar se usuário está autenticado
- Verificar se login foi bem-sucedido

### "CORS error"
- Verificar se backend permite acesso do frontend
- Verificar se URL da API está correta (VITE_API_BASE_URL)
- Headers Authorization foram adicionados?

### "Componente não renderiza"
- Verificar console para erros
- Verificar imports (caminho relativo correto?)
- Verificar se componente está sendo passado às props certas

---

## 📚 Documentação Adicional

- `REFACTOR_SUMMARY.md` - Resumo completo da refatoração
- `ARCHITECTURE_REFACTOR.md` - Arquitetura e padrões
- `TEST_FLUXO_COMPLETO.md` - Testes manuais

---

## ✅ Checklist de Integração

- [ ] Arquivos copiados para diretório correto
- [ ] Importações adicionadas no painel admin
- [ ] Tabs criadas no layout
- [ ] Token disponível em localStorage ou Context
- [ ] APIs backend respondendo
- [ ] Console sem erros
- [ ] Componentes renderizam
- [ ] Filtros funcionam
- [ ] Modais abrem/fecham
- [ ] Ações (aprovar, rejeitar, deletar) funcionam
- [ ] Fluxo completo testado

---

## 🚀 Próximos Passos

1. Integrar componentes ao painel
2. Testar com dados reais
3. Ajustar estilos se necessário
4. Treinamento de usuários
5. Deploy em produção

---

**Integração concluída com sucesso! ✅**
