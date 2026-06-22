# 📂 LOCALIZAÇÃO DOS FICHEIROS - ABA "QUESTÕES DOS COLABORADORES"

## 🎯 FRONTEND

### Componente Principal:
📄 **`FrontEnd/src/Administrador/QuestoesColaboradoresTab.jsx`**
- Componente React da aba
- Mostra questões e blocos aprovados dos colaboradores
- Usa DATA SAFETY LAYER (safeGet, safeArray, safeMap)
- Status: ✅ JÁ ESTÁ ABERTO NO SEU EDITOR

### Funcionalidades:
- ✅ Busca/filtro por disciplina
- ✅ Visualização de blocos aprovados
- ✅ Visualização de questões aprovadas
- ✅ Botões de Ver e Deletar (placeholder)
- ✅ Loading states
- ✅ Error handling

---

## ⚙️ BACKEND

### 1. Rotas API:
📄 **`BackEnd/routes/blocosRoutes.js`**
- Rota principal: `/api/blocos`
- Alias: `/api/blocos-colaboradores` (mapeado no index.js)
- Endpoints para listar, criar, editar, deletar blocos

### 2. Registro das Rotas:
📄 **`BackEnd/index.js`** (linhas 265-267)
```javascript
// ALIAS para blocos de colaboradores (compatibilidade com frontend)
// O frontend chama /api/blocos-colaboradores, mapear para /api/blocos
app.use('/api/blocos-colaboradores', blocosRoutes);
```

### 3. Controller:
📄 **`BackEnd/controllers/GenericController.js`** (provável)
- Controller genérico usado para blocos
- ✅ JÁ ESTÁ ABERTO NO SEU EDITOR

### 4. Rotas de Questões:
📄 **`BackEnd/routes/questoesRoutes.js`**
- Rota: `/api/questoes`
- Filtro por `status_aprovacao: 'aprovada'`

### 5. Fallback Routes:
📄 **`BackEnd/routes/colaboradorQuestoesRoutes.js`** (provável)
- Rota: `/api/questoes/colaborador/minhas`
- Usado como fallback no frontend

---

## 🗄️ BANCO DE DADOS

### Tabelas Envolvidas:

#### 1. **`blocos_questoes`**
Estrutura:
```sql
id, titulo, descricao, disciplina, dificuldade, tipo, 
criado_por, status, created_at, updated_at
```

**Filtro usado pela aba:**
```sql
WHERE status_aprovacao = 'aprovada'
```

#### 2. **`questoes`**
Estrutura:
```sql
id, torneio_id, bloco_id, titulo, descricao, disciplina, 
tipo, dificuldade, opcoes, resposta_correta, explicacao, 
pontos, linguagem, midia, autor_id, status_aprovacao, 
revisado_por, revisado_em, motivo_rejeicao, 
created_at, updated_at
```

**Filtro usado pela aba:**
```sql
WHERE status_aprovacao = 'aprovada' AND bloco_id IS NULL
```

#### 3. **`bloco_questoes_items`**
Estrutura:
```sql
id, bloco_id, questao_id, ordem, created_at, updated_at
```

Relação: Liga questões aos blocos

---

## 🔄 FLUXO DE DADOS

### 1. **Carregamento Inicial:**
```
QuestoesColaboradoresTab.jsx 
  ↓
api.get('/api/blocos-colaboradores', { status_aprovacao: 'aprovada' })
  ↓
BackEnd/routes/blocosRoutes.js
  ↓
GenericController.js (ou BlocosController)
  ↓
SELECT * FROM blocos_questoes WHERE status_aprovacao = 'aprovada'
```

### 2. **Carregamento de Questões:**
```
QuestoesColaboradoresTab.jsx
  ↓
api.get('/api/questoes', { status_aprovacao: 'aprovada' })
  ↓
BackEnd/routes/questoesRoutes.js
  ↓
QuestoesController.js
  ↓
SELECT * FROM questoes WHERE status_aprovacao = 'aprovada' AND bloco_id IS NULL
```

### 3. **Fallback (se rota principal falhar):**
```
api.get('/api/blocos') → Filtra status_aprovacao no frontend
api.get('/api/questoes/colaborador/minhas') → Filtra status_aprovacao no frontend
```

---

## 📊 ESTADO ATUAL DO BANCO (após população)

### Blocos Aprovados:
```
❌ Nenhum bloco aprovado ainda
   (os blocos não foram incluídos no script de população)
```

### Questões Aprovadas:
```
✅ 41 questões aprovadas
   - 15 Matemática
   - 12 Inglês
   - 14 Programação
```

### Questões Pendentes:
```
⏳ 15 questões pendentes (do Rufus)
   - 5 Matemática
   - 3 Inglês
   - 7 Programação
```

---

## 🚀 COMO ADICIONAR BLOCOS À ABA

### Opção 1: Popular blocos via SQL
Criar script SQL para inserir blocos aprovados na tabela `blocos_questoes` com `status = 'aprovado'`.

### Opção 2: Aprovar blocos pendentes
1. Login como Admin
2. Ir para aba "Questões Pendentes" ou similar
3. Aprovar blocos que estão com `status = 'pendente'`
4. Blocos aprovados aparecerão automaticamente na aba "Questões dos Colaboradores"

---

## 📝 ARQUIVOS AUXILIARES

### Utilitários Frontend:
- **`FrontEnd/src/utils/dataSafety.js`** - Funções safeGet, safeArray, safeMap
- **`FrontEnd/src/utils/safeApi.js`** - Cliente HTTP seguro
- **`FrontEnd/src/Administrador/adminService.js`** - Serviço de API admin (✅ aberto no editor)

### Componentes Relacionados:
- **`FrontEnd/src/Administrador/AdminDashboard.jsx`** - Dashboard principal (✅ aberto no editor)
- **`FrontEnd/src/Administrador/BlocoQuestoesManager.jsx`** - Gerenciador de blocos (✅ aberto no editor)

---

## 🐛 PROBLEMAS CONHECIDOS

### 1. Nenhum Bloco Aprovado
**Motivo:** O script de população (`populate-simple.sql`) não incluiu blocos.
**Solução:** Criar blocos manualmente ou via SQL.

### 2. Questões sem Blocos
**Filtro atual:** `bloco_id IS NULL`
**Motivo:** Mostra apenas questões "soltas", não as que estão em blocos.
**Comportamento:** Correto para mostrar questões individuais aprovadas.

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [x] Componente frontend existe e funciona
- [x] Rotas backend configuradas
- [x] Alias `/api/blocos-colaboradores` mapeado
- [x] DATA SAFETY implementado
- [x] Filtros por disciplina funcionam
- [x] Busca implementada
- [x] Loading states implementados
- [x] Error handling implementado
- [ ] Blocos aprovados populados no banco ⚠️
- [x] Questões aprovadas populadas no banco ✅

---

## 🎯 LOCALIZAÇÃO RESUMIDA

**FRONTEND:**
- 📄 `FrontEnd/src/Administrador/QuestoesColaboradoresTab.jsx`

**BACKEND:**
- 📄 `BackEnd/routes/blocosRoutes.js`
- 📄 `BackEnd/routes/questoesRoutes.js`
- 📄 `BackEnd/controllers/GenericController.js`
- 📄 `BackEnd/index.js` (registro das rotas)

**BANCO DE DADOS:**
- 🗄️ Tabela: `blocos_questoes`
- 🗄️ Tabela: `questoes`
- 🗄️ Tabela: `bloco_questoes_items`

---

**Data:** 22 de Junho de 2026  
**Status:** ✅ Todos os ficheiros localizados e documentados
