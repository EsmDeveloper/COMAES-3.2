# 📂 LOCALIZAÇÃO DOS FICHEIROS - ABA "QUESTÕES DOS TESTES"

## 🎯 FRONTEND

### Componentes Principais:

#### 1. **Componente em Uso:**
📄 **`FrontEnd/src/Administrador/QuestoesTestesTab.jsx`**
- ✅ Usado atualmente no AdminDashboard
- Interface completa com 2 sub-abas:
  - **"Gerenciar Blocos"** - Gestão de blocos de questões
  - **"Visualizar Todas"** - Lista todas as questões individuais
- Funcionalidades:
  - ✅ Criar novas questões de teste
  - ✅ Agrupar questões em blocos
  - ✅ Editar questões individuais
  - ✅ Deletar questões
  - ✅ Busca por texto
  - ✅ Filtro por categoria (matemática, programação, inglês, cultura geral)
  - ✅ Compatibilidade disciplina/categoria
  - ✅ Estatísticas (total, do banco, criadas localmente)

#### 2. **Arquivo Alternativo:**
📄 **`FrontEnd/src/Administrador/QuestoesTestesTab_NOVO.jsx`**
- ❌ NÃO está sendo usado (backup/versão alternativa)
- Interface similar mas mais simplificada
- Mantido como backup

### Componentes Relacionados:

📄 **`FrontEnd/src/Administrador/BlocoQuestoesManager.jsx`**
- ✅ Usado dentro da aba "Gerenciar Blocos"
- Props: `contexto="teste"`
- Gerencia criação, edição, visualização de blocos
- ✅ Já aberto no seu editor

📄 **`FrontEnd/src/Administrador/CreateQuestaoTesteForm.jsx`**
- Formulário para criar novas questões de teste
- Modal que abre ao clicar "Nova Questão"
- ✅ Já aberto no seu editor

---

## ⚙️ BACKEND

### 1. Rotas Principais:

📄 **`BackEnd/routes/testeConhecimentoRoutes.js`**
- Rota base: `/api/teste-conhecimento`
- Endpoints:
  - `GET /api/teste-conhecimento/questoes` - Listar questões
  - `POST /api/teste-conhecimento/questoes` - Criar questão
  - `PUT /api/teste-conhecimento/questoes/:id` - Editar questão
  - `DELETE /api/teste-conhecimento/questoes/:id` - Deletar questão
  - `POST /api/teste-conhecimento/submit` - Submeter respostas

### 2. Registro das Rotas:

📄 **`BackEnd/index.js`** (linha 276)
```javascript
// Registrar rotas do Teste de Conhecimento (sistema independente)
app.use('/api/teste-conhecimento', testeConhecimentoRoutes);
```

### 3. Controller:

📄 **`BackEnd/controllers/TesteConhecimentoController.js`** (provável)
- Lógica de negócio para questões de teste
- CRUD de questões
- Validações

### 4. Integração com Blocos:

📄 **`BackEnd/controllers/BlocosController.js`** (linha 373-376)
```javascript
// ✅ PRIORIZAR: Tentar PRIMEIRO com QuestaoTesteConhecimento
// Porque o frontend chamou /api/teste-conhecimento/questoes
let questao = await QuestaoTesteConhecimento.findByPk(questao_id);
```
- ✅ Já aberto no seu editor
- Integração entre blocos e questões de teste

### 5. Rotas de Blocos:

📄 **`BackEnd/routes/blocosRoutes.js`**
- `POST /api/blocos/:id/questoes` - Adicionar questão ao bloco
- `GET /api/blocos` - Listar blocos
- `DELETE /api/blocos/:id` - Deletar bloco

---

## 🗄️ BANCO DE DADOS

### Tabelas Envolvidas:

#### 1. **`questoes_teste_conhecimento`**
Armazena as questões de teste

**Estrutura:**
```sql
id, enunciado, categoria, tipo, dificuldade, 
opcoes, resposta_correta, explicacao, pontos,
ativo, criado_por, autor_nome, 
created_at, updated_at
```

**Categorias suportadas:**
- `matematica`
- `programacao`
- `ingles`
- `cultura_geral`
- (outros conforme necessário)

**Tipos suportados:**
- `multipla_escolha`
- `verdadeiro_falso`
- `dissertativa`

**Dificuldades:**
- `facil`
- `medio`
- `dificil`

#### 2. **`blocos_questoes`**
Agrupa questões em blocos

**Estrutura:**
```sql
id, titulo, descricao, disciplina, dificuldade, 
tipo, criado_por, status, contexto,
created_at, updated_at
```

**Campo importante:**
- `contexto` = `'teste'` - Identifica blocos para testes (não torneios)
- `disciplina` = categoria do bloco (matemática, programação, inglês)

#### 3. **`bloco_questoes_items`**
Relação N:N entre blocos e questões

**Estrutura:**
```sql
id, bloco_id, questao_id, ordem, 
created_at, updated_at
```

**Importante:**
- `questao_id` pode referenciar `questoes_teste_conhecimento.id`
- Ordem define a sequência das questões no bloco

#### 4. **`resultados_teste`**
Armazena resultados dos testes

**Estrutura:**
```sql
id, usuario_id, categoria, pontuacao, 
total_questoes, tempo_gasto, 
created_at, updated_at
```

---

## 🔄 FLUXO DE DADOS

### 1. **Carregar Questões Individuais:**
```
QuestoesTestesTab.jsx
  ↓
api: GET /api/teste-conhecimento/questoes?ativo=true
  ↓
BackEnd/routes/testeConhecimentoRoutes.js
  ↓
TesteConhecimentoController.js
  ↓
SELECT * FROM questoes_teste_conhecimento WHERE ativo = true
```

### 2. **Carregar Blocos:**
```
QuestoesTestesTab.jsx
  ↓
api: GET /api/blocos?status=publicado
  ↓
BackEnd/routes/blocosRoutes.js
  ↓
BlocosController.js
  ↓
SELECT * FROM blocos_questoes WHERE status = 'publicado'
```

### 3. **Criar Questão:**
```
CreateQuestaoTesteForm.jsx
  ↓
api: POST /api/teste-conhecimento/questoes
  ↓
TesteConhecimentoController.js
  ↓
INSERT INTO questoes_teste_conhecimento (...)
```

### 4. **Agrupar Questão em Bloco:**
```
QuestoesTestesTab.jsx
  ↓
api: POST /api/blocos/:blocoId/questoes
  ↓
BlocosController.js
  ↓
1. Verifica compatibilidade disciplina/categoria
2. Busca questão: QuestaoTesteConhecimento.findByPk(questao_id)
3. INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem)
```

### 5. **Event Listener (Integração com outras abas):**
```javascript
window.addEventListener('questaoAdicionadaTeste', () => {
  fetchQuestoesIndividuais(); // Recarrega lista
});
```

**Usado quando:**
- Questão é transferida de "Questões dos Colaboradores" para "Questões dos Testes"
- Permite atualização automática sem reload da página

---

## 📊 ESTADO ATUAL DO BANCO (após população)

### Questões de Testes:
```
✅ 13 questões aprovadas no script de população
   - 5 Matemática (fácil/médio)
   - 4 Programação (fácil)
   - 4 Inglês (fácil)
```

**⚠️ IMPORTANTE:**
- As questões foram inseridas na tabela `questoes` (torneios)
- Mas a aba de testes busca em `questoes_teste_conhecimento`
- **RESULTADO:** A aba aparecerá vazia até popular a tabela correta!

### Blocos de Testes:
```
❌ Nenhum bloco de teste criado
   (não foram incluídos no script de população)
```

---

## 🔧 DIFERENÇAS ENTRE QUESTÕES DE TORNEIOS E TESTES

| Aspecto | Torneios | Testes |
|---------|----------|--------|
| **Tabela** | `questoes` | `questoes_teste_conhecimento` |
| **Campo disciplina** | `disciplina` (matematica, ingles, programacao) | `categoria` (matematica, programacao, ingles, cultura_geral) |
| **Campo status** | `status_aprovacao` (pendente, aprovada, rejeitada) | `ativo` (boolean true/false) |
| **Público-alvo** | Torneios competitivos | Testes de conhecimento/quizzes |
| **Pontuação** | Fixa por dificuldade | Customizável |
| **Aprovação** | Requer aprovação admin | Aprovação imediata |

---

## ⚠️ PROBLEMA IDENTIFICADO

### Script de População Inseriu na Tabela Errada!

O script `populate-simple.sql` inseriu questões de testes na tabela `questoes` (torneios), mas a aba busca em `questoes_teste_conhecimento`.

**Solução:**
1. Criar novo script para popular `questoes_teste_conhecimento`
2. Ou migrar as 13 questões de testes de `questoes` para `questoes_teste_conhecimento`

---

## 📝 ARQUIVOS AUXILIARES

### Utilitários:
- **`FrontEnd/src/utils/dataSafety.js`** - Funções safeGet, safeArray
- **`FrontEnd/src/utils/safeApi.js`** - Cliente HTTP seguro
- **`FrontEnd/src/Administrador/adminService.js`** - Serviço admin (✅ aberto)

### Models:
- **`BackEnd/models/QuestaoTesteConhecimento.js`** - Model Sequelize
- **`BackEnd/models/BlocoQuestoes.js`** - Model Sequelize
- **`BackEnd/models/ResultadoTeste.js`** - Model Sequelize

### Middlewares:
- **`BackEnd/middlewares/rankingEvents.js`** (linha 46)
  - Hook para evento de teste submetido
  - Atualiza rankings após completar teste

---

## 🎯 FUNCIONALIDADES DA ABA

### Sub-aba 1: "Gerenciar Blocos"
✅ Criar novos blocos de questões  
✅ Editar blocos existentes  
✅ Visualizar questões dentro dos blocos  
✅ Deletar blocos  
✅ Reordenar questões dentro do bloco  
✅ Publicar/despublicar blocos  

### Sub-aba 2: "Visualizar Todas"
✅ Listar todas as questões individuais  
✅ Criar nova questão de teste  
✅ Editar questão existente  
✅ Deletar questão  
✅ Agrupar questão em bloco existente  
✅ Busca por texto (enunciado, categoria)  
✅ Filtro por categoria  
✅ Estatísticas (total, do banco, criadas)  
✅ Indicador de origem (admin, colaborador, sistema)  
✅ Verificação de compatibilidade disciplina/categoria  

### Validações Implementadas:
- ✅ Não permite agrupar questão em bloco de disciplina diferente
- ✅ Feedback visual (success/error) para todas as ações
- ✅ Loading states durante operações assíncronas
- ✅ Confirmação antes de deletar

---

## 🐛 CHECKLIST DE VERIFICAÇÃO

- [x] Componente frontend existe e funciona ✅
- [x] Rotas backend configuradas ✅
- [x] Integration com BlocoQuestoesManager ✅
- [x] Formulário de criação implementado ✅
- [x] Busca e filtros funcionam ✅
- [x] Loading states implementados ✅
- [x] Error handling implementado ✅
- [x] Event listeners configurados ✅
- [ ] Tabela `questoes_teste_conhecimento` populada ⚠️ **PENDENTE**
- [ ] Blocos de teste criados ⚠️ **PENDENTE**

---

## 🎯 LOCALIZAÇÃO RESUMIDA

**FRONTEND:**
- 📄 `FrontEnd/src/Administrador/QuestoesTestesTab.jsx` ✅ (em uso)
- 📄 `FrontEnd/src/Administrador/QuestoesTestesTab_NOVO.jsx` (backup)
- 📄 `FrontEnd/src/Administrador/BlocoQuestoesManager.jsx`
- 📄 `FrontEnd/src/Administrador/CreateQuestaoTesteForm.jsx`

**BACKEND:**
- 📄 `BackEnd/routes/testeConhecimentoRoutes.js`
- 📄 `BackEnd/controllers/TesteConhecimentoController.js`
- 📄 `BackEnd/controllers/BlocosController.js` ✅ (já aberto)
- 📄 `BackEnd/routes/blocosRoutes.js`
- 📄 `BackEnd/index.js` (registro das rotas, linha 276)

**BANCO DE DADOS:**
- 🗄️ Tabela: `questoes_teste_conhecimento` ⚠️ **VAZIA**
- 🗄️ Tabela: `blocos_questoes` (com `contexto='teste'`)
- 🗄️ Tabela: `bloco_questoes_items`
- 🗄️ Tabela: `resultados_teste`

**MODELS:**
- 📄 `BackEnd/models/QuestaoTesteConhecimento.js`
- 📄 `BackEnd/models/BlocoQuestoes.js`
- 📄 `BackEnd/models/ResultadoTeste.js`

---

## 🚀 PRÓXIMOS PASSOS

### 1. Popular Tabela `questoes_teste_conhecimento`
Criar script SQL para inserir as 13 questões de teste na tabela correta.

### 2. Criar Blocos de Teste
Criar blocos com `contexto='teste'` e associar questões.

### 3. Testar Funcionalidades
- Criar questão via formulário
- Agrupar questão em bloco
- Editar questão
- Deletar questão
- Verificar event listener de integração

---

**Data:** 22 de Junho de 2026  
**Status:** ✅ Todos os ficheiros localizados e documentados  
**Ação Necessária:** ⚠️ Popular tabela `questoes_teste_conhecimento`
