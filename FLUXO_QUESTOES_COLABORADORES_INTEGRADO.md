# 🔄 FLUXO INTEGRADO: Colaboradores → Questões → Torneios & Testes

## Visão Geral do Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                     CICLO DE VIDA COMPLETO                       │
└─────────────────────────────────────────────────────────────────┘

1️⃣  COLABORADOR CRIA QUESTÃO
    ↓
    Colaborador acessa o formulário de criação
    → Preenche: Título, Descrição, Disciplina, Dificuldade, Opções
    → Questão criada com status: PENDENTE
    → Armazenada em: Banco de dados questões (status_aprovacao = 'pendente')

2️⃣  ADMIN REVISA (QuestoesPendentesTab)
    ↓
    Admin vê todas as questões com status PENDENTE
    → Pode: Aprovar, Rejeitar, Ver Detalhes
    → Se APROVA: status_aprovacao = 'aprovada'
    → ✅ Questão agora VISÍVEL em "Questões dos Colaboradores"

3️⃣  QUESTÃO DISPONÍVEL (QuestoesColaboradoresTab)
    ↓
    Questão apareça no banco de questões aprovadas
    → Admin/Colaborador vê: Título, Autor, Disciplina, Dificuldade, Pontos
    → Pode: Expandir para ver detalhes, Editar, Ver Autor

4️⃣  ADICIONAR A TORNEIO (via Blocos)
    ↓
    Admin clica "Adicionar a Torneio"
    → Sistema cria ou seleciona um BLOCO
    → Adiciona questão ao bloco
    → Associa bloco ao torneio
    → Questão agora disponível no quiz do torneio

5️⃣  ADICIONAR A TESTE (via Categorias)
    ↓
    Admin clica "Adicionar a Teste"
    → Seleciona categoria de teste (Matemática, Inglês, Programação)
    → Questão duplicada em tabela QuestaoTesteConhecimento
    → Questão agora disponível nos testes de conhecimento

6️⃣  USAR EM TORNEIOS/TESTES (Estudantes)
    ↓
    Estudante abre um Torneio
    → Sistema carrega blocos do torneio
    → Questão aparece no quiz
    → Estudante responde e recebe pontos

    OU

    Estudante faz Teste de Conhecimento
    → Sistema carrega questões da categoria
    → Questão aparece randomicamente
    → Estudante responde e recebe feedback
```

---

## 📊 Abas do Painel Administrativo

### 1. **Gestão de Colaboradores** (`ColaboradoresTab.jsx`)
**Objetivo**: Gerenciar usuários colaboradores/professores

**Ações**:
- ✅ Aprovar colaborador (definir disciplina)
- ❌ Rejeitar candidatura
- 🚫 Suspender conta
- 👁️ Ver perfil completo + documentos

**Fluxo**:
```
Candidato envia formulário de inscrição
    ↓
Admin vê em "Pedidos de Colaboradores"
    ↓
Admin aprova e define disciplina
    ↓
Colaborador pode criar questões
```

---

### 2. **Questões Pendentes** (`QuestoesPendentesTab.jsx`)
**Objetivo**: Revisar questões criadas por colaboradores

**Ações**:
- 👁️ Ver detalhes completos
- ✅ Aprovar questão
- ❌ Rejeitar com motivo
- 📋 Filtrar por disciplina

**Status da Questão**:
- 🟡 **PENDENTE**: Aguardando revisão do admin
- 🟢 **APROVADA**: Pronta para usar em torneios/testes
- 🔴 **REJEITADA**: Recusada com motivo

**Fluxo**:
```
Questão criada por colaborador → status = 'pendente'
    ↓
Admin abre "Questões Pendentes"
    ↓
Admin revisa qualidade pedagógica
    ↓
APROVA → Vai para "Questões dos Colaboradores" ✅
REJEITA → Armazenada com motivo, colaborador vê feedback ❌
```

**O que aparece em "Questões Pendentes"?**
- Apenas questões com `status_aprovacao = 'pendente'`
- Mostradas por disciplina (filtro)
- Preview de alternativas
- Data de criação

---

### 3. **Questões dos Colaboradores** (`QuestoesColaboradoresTab.jsx`)
**Objetivo**: Banco de questões aprovadas prontas para uso

**Ações**:
- 📖 Expandir para ver detalhes completos
- ✏️ Editar questão
- 🏆 **Adicionar a Torneio** (NOVO)
- 📚 **Adicionar a Teste** (NOVO)
- 👤 Ver perfil do autor

**Status das Questões**:
- Todas com `status_aprovacao = 'aprovada'`
- Podem ser adicionadas a qualquer torneio/teste
- Colaborador que criou pode editá-la (voltará para 'pendente')

**Fluxo**:
```
Admin aprova questão em "Questões Pendentes"
    ↓
Questão aparece automaticamente aqui
    ↓
Admin seleciona ações:
  • Adicionar a Torneio → cria bloco + associa ao torneio
  • Adicionar a Teste → copia para QuestaoTesteConhecimento
```

**Informações Mostradas**:
- Autor (colaborador)
- Disciplina e dificuldade
- Pontos
- Data de criação
- Preview de alternativas
- Resposta correta (destacada em verde)

---

## 🔗 Integração com Torneios e Testes

### **Fluxo para TORNEIOS**:

```
1. Admin em "Questões dos Colaboradores"
   ↓
2. Clica "Adicionar a Torneio"
   ↓
3. Sistema oferece opções:
   • Criar novo Bloco
   • Usar bloco existente
   ↓
4. Admin seleciona/cria bloco (agrupa questões por dificuldade)
   ↓
5. Admin escolhe qual torneio usar
   ↓
6. Sistema associa: BLOCO ← → TORNEIO
   ↓
7. Questão disponível no quiz do torneio
   ↓
8. Estudante participa do torneio
   ↓
9. Questão aparece no quiz do torneio
```

**Endpoints Utilizados**:
- `POST /api/blocos/:id/questoes` - Adicionar questão ao bloco
- `POST /api/torneios/:id/blocos` - Associar bloco ao torneio
- `GET /api/questoes/quiz/:area?torneio_id=X` - Carregar questões do torneio

---

### **Fluxo para TESTES**:

```
1. Admin em "Questões dos Colaboradores"
   ↓
2. Clica "Adicionar a Teste"
   ↓
3. Sistema oferece:
   • Selecionar categoria (Matemática, Inglês, Programação)
   • Definir dificuldade
   • Definir tempo de resposta
   ↓
4. Sistema cria/atualiza QuestaoTesteConhecimento
   ↓
5. Questão pronta para testes de conhecimento
   ↓
6. Estudante faz um teste
   ↓
7. Questão aparece randomicamente no teste
   ↓
8. Estudante responde + recebe feedback
```

**Endpoints Utilizados**:
- `POST /api/questoes-teste` - Criar questão para teste
- `GET /api/questoes/quiz/:area` - Carregar questões da categoria (sem torneio)

---

## 📝 Tabelas de Banco de Dados Envolvidas

### **Questão Principal** (`questoes`)
```javascript
{
  id: INTEGER PRIMARY KEY,
  titulo: STRING,
  descricao: TEXT,
  disciplina: ENUM('matematica', 'ingles', 'programacao'),
  dificuldade: ENUM('facil', 'medio', 'dificil'),
  tipo: ENUM('multipla_escolha', 'texto', 'codigo'),
  opcoes: JSON,
  resposta_correta: TEXT,
  autor_id: INTEGER (referência para usuário colaborador),
  status_aprovacao: ENUM('pendente', 'aprovada', 'rejeitada'),
  revisado_por: INTEGER (ID do admin que aprovou),
  revisado_em: DATE,
  motivo_rejeicao: TEXT (se rejeitada),
  torneio_id: INTEGER (opcional, associação direta),
  bloco_id: INTEGER (opcional, associação direta),
  pontos: INTEGER (default 10),
  created_at: DATE,
  updated_at: DATE
}
```

### **Blocos de Questões** (`blocos_questoes`)
```javascript
{
  id: INTEGER PRIMARY KEY,
  titulo: STRING,
  disciplina: ENUM('matematica', 'ingles', 'programacao'),
  dificuldade: ENUM('facil', 'medio', 'dificil'),
  status: ENUM('pendente', 'aprovado', 'rejeitado'),
  criado_por: INTEGER (admin que criou),
  created_at: DATE
}
```

### **Associação Questão ↔ Bloco** (`bloco_questao_items`)
```javascript
{
  id: INTEGER PRIMARY KEY,
  bloco_id: INTEGER,
  questao_id: INTEGER,
  ordem: INTEGER,
  created_at: DATE
}
```

### **Associação Torneio ↔ Bloco** (`torneio_blocos`)
```javascript
{
  id: INTEGER PRIMARY KEY,
  torneio_id: INTEGER,
  bloco_id: INTEGER,
  ordem: INTEGER,
  created_at: DATE
}
```

### **Questões para Testes** (`questoes_teste_conhecimento`)
```javascript
{
  id: INTEGER PRIMARY KEY,
  enunciado: TEXT,
  opcoes: JSON,
  resposta_correta: TEXT,
  dificuldade: ENUM('facil', 'medio', 'dificil'),
  categoria: STRING,
  pontos: INTEGER (default 10),
  ativo: BOOLEAN (default true),
  created_at: DATE
}
```

---

## 🎯 Checklist de Configuração

- [x] **ColaboradoresTab** - Aprova colaboradores
- [x] **QuestoesPendentesTab** - Revisa questões com feedback visual
- [x] **QuestoesColaboradoresTab** - Mostra questões aprovadas com ações
- [ ] **BlocoQuestoesManager** - Criar/editar blocos (já existe, precisa integrar)
- [ ] **TorneiosTab** - Associar blocos a torneios (já existe)
- [ ] **TesteConhecimentoManager** - Criar testes com questões (verific precisa)

---

## 🔧 Próximos Passos

1. **Implementar ações em QuestoesColaboradoresTab**:
   - Botão "Adicionar a Torneio" → Modal para selecionar/criar bloco
   - Botão "Adicionar a Teste" → Modal para selecionar categoria

2. **Criar Modais de Ação**:
   - `ModalAddToBloco` - Selecionar ou criar bloco
   - `ModalAddToTorneio` - Escolher torneio
   - `ModalAddToTeste` - Escolher categoria

3. **Integrar com Endpoints Backend**:
   - Verificar se POST `/api/blocos/:id/questoes` existe
   - Verificar se POST `/api/questoes-teste` existe
   - Testar fluxo completo

4. **Melhorar UX**:
   - Feedback visual ao adicionar a torneio/teste
   - Histórico de onde cada questão foi usada
   - Indicador de "Em uso" na aba "Questões dos Colaboradores"

---

## 📱 Fluxo da Interface Visual

```
PAINEL ADMINISTRATIVO
│
├─ SEÇÃO: Usuários & Comunidade
│  ├─ Gerenciar Usuários
│  ├─ Pedidos de Colaboradores ← Aprova colaboradores aqui
│  └─ Todos os Colaboradores
│
├─ SEÇÃO: Questões & Conteúdo
│  ├─ Questões de Torneios
│  ├─ Questões dos Testes
│  ├─ Questões Pendentes ← Revisa questões aqui
│  └─ Questões dos Colaboradores ← Adiciona a torneios/testes aqui
│
└─ SEÇÃO: Torneios & Competições
   ├─ Gerenciar Torneios
   └─ Gerenciar Certificados
```

---

## 🎓 Exemplo Prático Completo

### Cenário: Uma questão de Matemática

**Passo 1 - Colaborador cria questão**
```
- Nome: Prof. João
- Disciplina: Matemática
- Questão: "Qual é a raiz quadrada de 144?"
- Opções: [12, 11, 13, 10]
- Resposta: 12
- Status: PENDENTE
```

**Passo 2 - Admin revisa em "Questões Pendentes"**
```
Admin abre QuestoesPendentesTab
→ Vê questão de Prof. João
→ Clica "Ver detalhes"
→ Valida qualidade pedagógica
→ Clica "✅ Aprovar"
→ Questão: status = APROVADA
```

**Passo 3 - Admin vê em "Questões dos Colaboradores"**
```
Admin abre QuestoesColaboradoresTab
→ Questão aparece no banco
→ Mostra: Prof. João (autor), Matemática, Média, 10 pts
```

**Passo 4 - Admin adiciona a Torneio**
```
Admin clica "🏆 Adicionar a Torneio"
→ Modal: Criar novo bloco ou usar existente?
→ Admin cria "Bloco Matemática Média - Torneio Sprint"
→ Modal: Qual torneio?
→ Admin seleciona "Torneio 2024 - Etapa 1"
→ Sistema associa: Bloco ← → Torneio
```

**Passo 5 - Estudante participa do Torneio**
```
Estudante clica "Participar do Torneio 2024 - Etapa 1"
→ Sistema carrega blocos do torneio
→ Questão de Prof. João aparece no quiz
→ Estudante responde
→ Sistema valida resposta
→ Estudante ganha 10 pontos
```

---

## ✅ Validação Final

**Checklist**:
- [ ] Colaborador pode criar questões ✅
- [ ] Admin vê questões pendentes ✅
- [ ] Admin aprova/rejeita com feedback ✅
- [ ] Questão aprovada aparece no banco ✅
- [ ] Admin pode adicionar a torneios (NOVO)
- [ ] Admin pode adicionar a testes (NOVO)
- [ ] Questões aparecem nos quizzes ✅
- [ ] Estudantes ganham pontos ✅

---

**Última atualização**: 7 de Junho de 2026
**Versão**: 1.0 - Fluxo Integrado
