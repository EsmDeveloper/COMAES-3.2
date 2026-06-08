# 🔄 REESTRUTURAÇÃO: Abas Torneios e Testes

**Data**: 8 de Junho de 2026  
**Status**: ✅ IMPLEMENTADO  
**Impacto**: Melhoria significativa na UX - BlocoQuestoesManager agora é a aba principal

---

## 📊 MUDANÇA ESTRUTURAL

### ANTES ❌
```
Aba "Questões de Torneios"
├── Sub-aba "Questões Individuais" (Principal - azul)
├── Sub-aba "Blocos de Questões" (Secundária)
└── Botão "Criar Bloco" → Abria BlocoQuestoesManager (via state showBlocoManager)
```

### DEPOIS ✅
```
Aba "Questões de Torneios"
├── Sub-aba "Gerenciar Blocos" (Principal - BLOCOQUESTÕESMANAGER)
│   └── BlocoQuestoesManager renderizado inline
└── Sub-aba "Visualizar Todas" (Secundária)
    └── Tabela com todas as questões individuais (criadas + colaboradores)
```

---

## 🎯 POR QUÊ?

1. **Hierarquia Correta**: Blocos são mais importantes que questões individuais
2. **Workflow Lógico**: Admin PRIMEIRO cria/gerencia blocos, DEPOIS vê questões
3. **Consistência**: Mesmo padrão nas abas de Torneios e Testes
4. **Acesso Direto**: Sem "voltar" - BlocoQuestoesManager agora sempre visível
5. **Clareza**: Fica óbvio que "Visualizar Todas" é apenas para referência

---

## 📝 DETALHES DA IMPLEMENTAÇÃO

### ✅ QuestoesTorneiosTab.jsx (Refatorado)

**Estrutura de Estado**:
```javascript
const [abaAtiva, setAbaAtiva] = useState('blocos'); // ✅ MUDA: 'blocos' por padrão
const [questoesIndividuais, setQuestoesIndividuais] = useState([]);
const [showCreateForm, setShowCreateForm] = useState(false);
```

**Abas Disponíveis**:
1. **abaAtiva === 'blocos'** → Renderiza `<BlocoQuestoesManager contexto="torneio" />`
2. **abaAtiva === 'individuais'** → Renderiza tabela de questões individuais

**Questões Individuais**:
- Fetch: `GET /api/questoes?status_aprovacao=aprovada` + filter `!q.bloco_id`
- Mostra: Criadas localmente + Do banco de colaboradores
- Colunas: Título | Disciplina | Dificuldade | Origem (👤 Colaborador ou ✍️ Admin) | Ações
- Ações: Agrupar em Bloco | Editar | Deletar

---

### ✅ QuestoesTestesTab.jsx (Mesmo Padrão)

**Estrutura de Estado**:
```javascript
const [abaAtiva, setAbaAtiva] = useState('blocos'); // ✅ MUDA: 'blocos' por padrão
```

**Abas Disponíveis**:
1. **abaAtiva === 'blocos'** → Renderiza `<BlocoQuestoesManager contexto="teste" />`
2. **abaAtiva === 'individuais'** → Renderiza tabela de questões individuais

**Questões Individuais**:
- Fetch: `GET /api/teste-conhecimento/questoes?ativo=true`
- Mostra: Todas as questões de teste ativas
- Colunas: Enunciado | Categoria | Dificuldade | Origem | Ações
- Ações: Agrupar em Bloco | Editar | Deletar

---

## 🔗 INTEGRAÇÃO COM BLOCOQUESTÕESMANAGER

### Import
```javascript
import BlocoQuestoesManager from './BlocoQuestoesManager';
```

### Uso
```jsx
{abaAtiva === 'blocos' && (
  <div>
    <BlocoQuestoesManager contexto="torneio" />
  </div>
)}

// Ou para testes:
{abaAtiva === 'blocos' && (
  <div>
    <BlocoQuestoesManager contexto="teste" />
  </div>
)}
```

### Contexto
- **contexto="torneio"**: Gerencia blocos para torneios (5-30 questões, vinculação obrigatória)
- **contexto="teste"**: Gerencia blocos para testes (sem limite, opcional)

---

## 📊 LAYOUT VISUAL

```
┌─────────────────────────────────────────────────────┐
│ "Questões de Torneios"                              │
│ "Gerencie blocos (5-30) e questões individuais..."  │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ [🔍 Pesquisar questões ou blocos...]                     │
└──────────────────────────────────────────────────────────┘

┌─────────────────┬──────────────────────────────────────┐
│  NAVEGAÇÃO      │  CONTEÚDO PRINCIPAL                  │
├─────────────────┼──────────────────────────────────────┤
│ 📦 Gerenciar    │  [BlocoQuestoesManager]              │
│    Blocos ✅    │  - Criar bloco                       │
│                 │  - Editar bloco                      │
│ 👁️  Visualizar  │  - Deletar bloco                     │
│    Todas        │  - Adicionar questões               │
│                 │  - Associar a torneios              │
│                 │  - Expansível para ver questões     │
│                 │                                      │
│                 │ Stats:                               │
│                 │ - Total de blocos                   │
│                 │ - Blocos publicados                 │
│                 │ - Disciplinas                        │
└─────────────────┴──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ABA "VISUALIZAR TODAS"                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ "Visualizar Todas as Questões"      [+ Criar Questão] │
│                                                         │
│ "Questões individuais criadas +..."                    │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Título | Disc | Dific | Origem | Ações          │  │
│ ├───────────────────────────────────────────────────┤  │
│ │ Q1     │ Mat  │ Fácil │ 👤 João│ 🔗 ✏️ 🗑️       │  │
│ │ Q2     │ Prog │ Médio │ ✍️ Admin│ 🔗 ✏️ 🗑️       │  │
│ │ Q3     │ Ing  │ Dif   │ 👤 Maria│ 🔗 ✏️ 🗑️       │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Stats:                                                  │
│ [Total: 42] [Do Banco: 28] [Criadas: 14]              │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ BENEFÍCIOS

1. **✅ UX Melhorada**: Admin vê blocos IMEDIATAMENTE
2. **✅ Menos Cliques**: Sem necessidade de "voltar"
3. **✅ Hierarquia Clara**: Blocos → Questões (não invertido)
4. **✅ Consistência**: Mesmo padrão em Torneios e Testes
5. **✅ Escalável**: BlocoQuestoesManager já trata ambos contextos
6. **✅ Flexível**: Aba secundária para referência/análise

---

## 🔄 FLUXO AGORA

### Para Torneios
```
1. Admin clica "Questões de Torneios"
2. ✅ Vê PRIMEIRO: BlocoQuestoesManager (gerenciar blocos)
3. Clica "Gerenciar Blocos" (ou já está lá por padrão)
4. Cria/edita/deleta blocos (5-30 questões)
5. Se quiser ver questões individuais, clica "Visualizar Todas"
6. Vê tabela com todos individuais (para referência/edição)
```

### Para Testes
```
1. Admin clica "Questões dos Testes"
2. ✅ Vê PRIMEIRO: BlocoQuestoesManager (gerenciar blocos)
3. Clica "Gerenciar Blocos" (ou já está lá por padrão)
4. Cria/edita/deleta blocos (sem limite)
5. Se quiser ver questões individuais, clica "Visualizar Todas"
6. Vê tabela com todos individuais (para referência/edição)
```

---

## 📋 TABELA COMPARATIVA

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Aba Padrão | Questões Individuais | Gerenciar Blocos ✅ |
| Acesso a BlocoQuestoesManager | Botão → Modal | Inline na aba ✅ |
| Visualizar Blocos | Via "Blocos de Questões" | Via "Gerenciar Blocos" ✅ |
| Questões Individuais | Aba Principal | Aba Secundária ✅ |
| UX | 3 cliques para criar bloco | 1 clique ✅ |

---

## 🎯 PRÓXIMAS OTIMIZAÇÕES (Futuro)

1. Adicionar abas horizontais em vez de verticais (se muitos componentes)
2. Implementar busca cruzada (blocos + questões no mesmo search)
3. Drag-and-drop para adicionar questões a blocos
4. Preview de blocos na tabela de questões
5. Bulk actions (adicionar múltiplas questões a bloco)

---

## ✅ STATUS FINAL

✅ **Reestruturação Completa**
- QuestoesTorneiosTab refatorado
- QuestoesTestesTab refatorado
- BlocoQuestoesManager agora é a aba principal
- Questões individuais em aba secundária
- Listeners de eventos mantidos
- Sem perda de funcionalidade
- UX significativamente melhorada

**Pronto para produção!** 🚀
