# 📂 ESTRUTURA DAS SUB-ABAS - QUESTÕES DOS TESTES

## 🎯 LOCALIZAÇÃO ÚNICA

**Ambas as sub-abas estão NO MESMO FICHEIRO:**

📄 **`FrontEnd/src/Administrador/QuestoesTestesTab.jsx`**

---

## 🏗️ ESTRUTURA DO COMPONENTE

```
QuestoesTestesTab.jsx
│
├─ Header (linha ~310-330)
│  └─ Título: "Questões dos Testes"
│
├─ Search Bar + Filtros (linha ~330-360)
│  ├─ Input de busca
│  └─ Select de categoria (matematica, programacao, ingles, cultura_geral)
│
├─ SUB-ABAS (linha ~360-385)
│  ├─ Botão 1: "Gerenciar Blocos" (Package icon)
│  └─ Botão 2: "Visualizar Todas" (BookOpen icon)
│
└─ Conteúdo Condicional (linha ~385+)
   │
   ├─ SE abaAtiva === 'blocos' (linha ~388-392)
   │  └─ <BlocoQuestoesManager contexto="teste" />
   │     📄 Componente separado em: BlocoQuestoesManager.jsx
   │
   └─ SE abaAtiva === 'individuais' (linha ~394-500)
      └─ Conteúdo inline da aba
         ├─ Header + Botão "Nova Questão"
         ├─ Tabela de questões
         │  ├─ Coluna: Enunciado
         │  ├─ Coluna: Categoria
         │  ├─ Coluna: Dificuldade
         │  ├─ Coluna: Origem (autor)
         │  └─ Coluna: Ações (Agrupar, Editar, Deletar)
         └─ Estatísticas (Total, Do Banco, Criadas)
```

---

## 📊 DETALHAMENTO DAS SUB-ABAS

### 🔵 SUB-ABA 1: "GERENCIAR BLOCOS"

**Estado:** `abaAtiva === 'blocos'` (ativa por padrão)

**Localização no código:** 
- **Linhas 388-392** em `QuestoesTestesTab.jsx`

**Conteúdo:**
```jsx
{abaAtiva === 'blocos' && (
  <div>
    <BlocoQuestoesManager contexto="teste" />
  </div>
)}
```

**Componente usado:**
- 📄 `FrontEnd/src/Administrador/BlocoQuestoesManager.jsx`
- Props: `contexto="teste"`
- ✅ **Já está aberto no seu editor**

**Funcionalidades:**
- ✅ Criar novo bloco
- ✅ Editar bloco existente
- ✅ Visualizar questões do bloco
- ✅ Adicionar questões ao bloco
- ✅ Remover questões do bloco
- ✅ Reordenar questões
- ✅ Publicar/despublicar bloco
- ✅ Deletar bloco

**API usada:**
- `GET /api/blocos?contexto=teste`
- `POST /api/blocos`
- `PUT /api/blocos/:id`
- `DELETE /api/blocos/:id`
- `POST /api/blocos/:id/questoes`

---

### 🟢 SUB-ABA 2: "VISUALIZAR TODAS"

**Estado:** `abaAtiva === 'individuais'`

**Localização no código:**
- **Linhas 394-500+** em `QuestoesTestesTab.jsx`

**Conteúdo:** Inline (não é componente separado)

**Estrutura detalhada:**

#### 1. Header (linhas ~397-409)
```jsx
<div className="flex items-center justify-between mb-6">
  <h2>Visualizar Todas as Questões</h2>
  <button onClick={() => setShowCreateForm(true)}>
    Nova Questão
  </button>
</div>
```

#### 2. Descrição (linha ~411-413)
```jsx
<p>
  Questões individuais criadas localmente + questões dos 
  colaboradores direcionadas para esta aba...
</p>
```

#### 3. Tabela de Questões (linhas ~416-490)
```jsx
<table>
  <thead>
    <tr>
      <th>Enunciado</th>
      <th>Categoria</th>
      <th>Dificuldade</th>
      <th>Origem</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    {filteredQuestoes.map(questao => (
      <tr key={questao.id}>
        <td>{questao.enunciado}</td>
        <td>
          <span className="badge">
            {questao.categoria}
          </span>
        </td>
        <td>
          <span className={`badge ${dificuldadeColor}`}>
            {questao.dificuldade}
          </span>
        </td>
        <td>
          <span className="badge">
            {questao.autor_nome || 'Admin'}
          </span>
        </td>
        <td>
          <button onClick={handleAgrupar}>
            <Layers /> {/* Agrupar */}
          </button>
          <button onClick={handleEditar}>
            <Edit2 /> {/* Editar */}
          </button>
          <button onClick={handleDeletar}>
            <Trash2 /> {/* Deletar */}
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

#### 4. Estatísticas (linhas ~493-500)
```jsx
<div className="grid grid-cols-3 gap-3">
  <div className="stat-card">
    Total Individuais: {questoesIndividuais.length}
  </div>
  <div className="stat-card">
    Do Banco de Colaboradores: 
    {questoesIndividuais.filter(q => q.autor_nome).length}
  </div>
  <div className="stat-card">
    Criadas Localmente: 
    {questoesIndividuais.filter(q => !q.autor_nome).length}
  </div>
</div>
```

**Funcionalidades:**
- ✅ Listar todas as questões individuais
- ✅ Criar nova questão (abre modal)
- ✅ Editar questão (abre modal)
- ✅ Deletar questão (abre modal de confirmação)
- ✅ Agrupar questão em bloco (abre modal de seleção)
- ✅ Filtrar por categoria
- ✅ Buscar por texto
- ✅ Mostrar estatísticas

**API usada:**
- `GET /api/teste-conhecimento/questoes?ativo=true`
- `POST /api/teste-conhecimento/questoes`
- `PUT /api/teste-conhecimento/questoes/:id`
- `DELETE /api/teste-conhecimento/questoes/:id`
- `POST /api/blocos/:id/questoes` (para agrupar)

---

## 🔄 LÓGICA DE ALTERNÂNCIA

**State que controla:**
```jsx
const [abaAtiva, setAbaAtiva] = useState('blocos'); // Default: 'blocos'
```

**Botões de alternância (linhas ~362-383):**
```jsx
<button onClick={() => setAbaAtiva('blocos')}>
  <Package /> Gerenciar Blocos
</button>

<button onClick={() => setAbaAtiva('individuais')}>
  <BookOpen /> Visualizar Todas
</button>
```

**Renderização condicional:**
```jsx
{abaAtiva === 'blocos' && (
  <BlocoQuestoesManager contexto="teste" />
)}

{abaAtiva === 'individuais' && (
  <div>
    {/* Conteúdo da aba inline */}
  </div>
)}
```

---

## 📦 COMPONENTES AUXILIARES USADOS

### 1. **BlocoQuestoesManager.jsx**
- 📍 Usado na sub-aba "Gerenciar Blocos"
- 📄 `FrontEnd/src/Administrador/BlocoQuestoesManager.jsx`
- ✅ Já aberto no seu editor

### 2. **CreateQuestaoTesteForm.jsx**
- 📍 Modal aberto ao clicar "Nova Questão"
- 📄 `FrontEnd/src/Administrador/CreateQuestaoTesteForm.jsx`
- ✅ Já aberto no seu editor

### 3. **Modais Inline (no mesmo ficheiro)**
- Modal: Agrupar em Bloco (linhas ~580-650)
- Modal: Editar Questão (linhas ~653-730)
- Modal: Deletar Questão (linhas ~733-760)

---

## 🎨 CLASSES CSS IMPORTANTES

### Botões das Sub-abas:
```css
/* Aba ativa */
.border-b-2 border-blue-600 text-blue-600

/* Aba inativa */
.border-transparent text-gray-600 hover:text-gray-900
```

### Badges:
```css
/* Categoria */
.bg-blue-100 .text-blue-700

/* Dificuldade Fácil */
.bg-green-100 .text-green-700

/* Dificuldade Médio */
.bg-yellow-100 .text-yellow-700

/* Dificuldade Difícil */
.bg-red-100 .text-red-700
```

---

## 🔍 COMO ENCONTRAR NO CÓDIGO

### Para ir direto às sub-abas:

**Abrir ficheiro:**
```
FrontEnd/src/Administrador/QuestoesTestesTab.jsx
```

**Ir para linhas:**
- **Linha 360-385**: Botões das sub-abas
- **Linha 388-392**: Sub-aba "Gerenciar Blocos"
- **Linha 394-500**: Sub-aba "Visualizar Todas"

**Buscar por:**
- `SUB-ABAS UNIFICADAS` (linha ~362)
- `ABA 1: GERENCIAR BLOCOS` (linha ~388)
- `ABA 2: VISUALIZAR TODAS` (linha ~394)

---

## 📊 DIAGRAMA VISUAL

```
┌─────────────────────────────────────────────────────────┐
│  QuestoesTestesTab.jsx                                  │
│  ────────────────────────────────────────────────────   │
│                                                          │
│  [🔍 Search Bar] [📋 Filtro: Todas as categorias]      │
│                                                          │
│  ┌──────────────────────┬──────────────────────┐       │
│  │ 📦 Gerenciar Blocos  │ 📖 Visualizar Todas  │       │
│  │   (ativo por padrão) │                       │       │
│  └──────────────────────┴──────────────────────┘       │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ SE abaAtiva === 'blocos'                       │    │
│  │                                                 │    │
│  │  <BlocoQuestoesManager contexto="teste" />    │    │
│  │  ─────────────────────────────────────────     │    │
│  │  📄 Componente separado (já aberto no editor) │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ SE abaAtiva === 'individuais'                  │    │
│  │                                                 │    │
│  │  [+ Nova Questão]                              │    │
│  │                                                 │    │
│  │  ┌─────────────────────────────────────────┐  │    │
│  │  │ Enunciado | Categoria | Dif | Ações    │  │    │
│  │  ├─────────────────────────────────────────┤  │    │
│  │  │ Questão 1 | Math      | 🟢  | 🔧 ✏️ 🗑️  │  │    │
│  │  │ Questão 2 | Prog      | 🟡  | 🔧 ✏️ 🗑️  │  │    │
│  │  │ Questão 3 | Ing       | 🔴  | 🔧 ✏️ 🗑️  │  │    │
│  │  └─────────────────────────────────────────┘  │    │
│  │                                                 │    │
│  │  Stats: [📊 Total] [📥 Banco] [➕ Criadas]    │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ RESUMO EXECUTIVO

| Elemento | Ficheiro | Linhas | Status |
|----------|----------|--------|--------|
| **Sub-aba 1: "Gerenciar Blocos"** | `QuestoesTestesTab.jsx` | 388-392 | ✅ Usa componente separado |
| **Sub-aba 2: "Visualizar Todas"** | `QuestoesTestesTab.jsx` | 394-500+ | ✅ Código inline no mesmo ficheiro |
| **BlocoQuestoesManager** | `BlocoQuestoesManager.jsx` | Todo | ✅ Já aberto no editor |
| **CreateQuestaoTesteForm** | `CreateQuestaoTesteForm.jsx` | Todo | ✅ Já aberto no editor |

**Conclusão:** As **duas sub-abas estão no mesmo ficheiro**, mas a primeira usa um **componente externo** (`BlocoQuestoesManager`) enquanto a segunda tem **código inline**.

---

**Data:** 22 de Junho de 2026  
**Ficheiro Principal:** `FrontEnd/src/Administrador/QuestoesTestesTab.jsx`
