# GUIA VISUAL - MIGRAÇÃO DO MODELO QUESTÃO

**Data**: 22 de Maio de 2026

---

## 📊 DIAGRAMA DE ARQUITETURA ATUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  AdminDashboard.jsx → POST /api/questoes/:modalidade            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - CONTROLLERS                         │
│  QuestoesController.criar(modalidade, dados)                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - SERVICES                            │
│  questoesService.criar(modalidade, dados)                       │
│  ├─ if modalidade === 'matematica'                              │
│  │  └─ QuestaoMatematica.create()                               │
│  ├─ if modalidade === 'ingles'                                  │
│  │  └─ QuestaoIngles.create()                                   │
│  └─ if modalidade === 'programacao'                             │
│     └─ QuestaoProgramacao.create()                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │questoes_         │  │questoes_         │  │questoes_         │
│  │matematica        │  │ingles            │  │programacao       │
│  │                  │  │                  │  │                  │
│  │ 10 questões      │  │ 6 questões       │  │ 5 questões       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘
│  ┌──────────────────┐
│  │perguntas         │
│  │                  │
│  │ 0 questões       │
│  └──────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 DIAGRAMA APÓS MIGRAÇÃO (FASE 1 + 2)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  AdminDashboard.jsx → POST /api/questoes/:modalidade            │
│  (SEM MUDANÇAS)                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - CONTROLLERS                         │
│  QuestoesController.criar(modalidade, dados)                    │
│  (SEM MUDANÇAS)                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - SERVICES                            │
│  questoesService.criar(modalidade, dados)                       │
│  ├─ Valida dados                                                │
│  ├─ Converte para novo formato                                  │
│  └─ Questao.create({                                            │
│       disciplina: modalidade,                                   │
│       tipo: 'multipla_escolha' ou 'codigo',                     │
│       ...                                                       │
│     })                                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                                │
│  ┌──────────────────────────────────────────────────────────────┐
│  │questoes (NOVA)                                               │
│  │                                                              │
│  │ id | disciplina    | tipo              | pontos | ...       │
│  │ 1  | matematica    | multipla_escolha  | 10     | ...       │
│  │ 2  | ingles        | multipla_escolha  | 10     | ...       │
│  │ 3  | programacao   | codigo            | 15     | ...       │
│  │ ...                                                          │
│  │ 21 | programacao   | codigo            | 20     | ...       │
│  │                                                              │
│  │ TOTAL: 21 questões                                           │
│  └──────────────────────────────────────────────────────────────┘
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │questoes_         │  │questoes_         │  │questoes_         │
│  │matematica        │  │ingles            │  │programacao       │
│  │(LEITURA APENAS)  │  │(LEITURA APENAS)  │  │(LEITURA APENAS)  │
│  │                  │  │                  │  │                  │
│  │ 10 questões      │  │ 6 questões       │  │ 5 questões       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘
│  ┌──────────────────┐
│  │perguntas         │
│  │(LEITURA APENAS)  │
│  │                  │
│  │ 0 questões       │
│  └──────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ DIAGRAMA FINAL (APÓS FASE 3)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  AdminDashboard.jsx → POST /api/questoes/:modalidade            │
│  (SEM MUDANÇAS)                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - CONTROLLERS                         │
│  QuestoesController.criar(modalidade, dados)                    │
│  (SEM MUDANÇAS)                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - SERVICES                            │
│  questoesService.criar(modalidade, dados)                       │
│  ├─ Valida dados                                                │
│  └─ Questao.create({                                            │
│       disciplina: modalidade,                                   │
│       tipo: 'multipla_escolha' ou 'codigo',                     │
│       ...                                                       │
│     })                                                          │
│  (SIMPLIFICADO - SEM COMPATIBILIDADE)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                                │
│  ┌──────────────────────────────────────────────────────────────┐
│  │questoes (ÚNICA)                                              │
│  │                                                              │
│  │ id | disciplina    | tipo              | pontos | ...       │
│  │ 1  | matematica    | multipla_escolha  | 10     | ...       │
│  │ 2  | ingles        | multipla_escolha  | 10     | ...       │
│  │ 3  | programacao   | codigo            | 15     | ...       │
│  │ ...                                                          │
│  │ 21 | programacao   | codigo            | 20     | ...       │
│  │                                                              │
│  │ TOTAL: 21 questões                                           │
│  └──────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO DE MIGRAÇÃO (TIMELINE)

```
ANTES (Atual)
═════════════════════════════════════════════════════════════════

  questoes_matematica (10)
  questoes_ingles (6)
  questoes_programacao (5)
  perguntas (0)
  ────────────────────────
  TOTAL: 21 questões em 4 tabelas


FASE 1: Criação da Tabela (30 min)
═════════════════════════════════════════════════════════════════

  ✅ Criar tabela questoes (vazia)
  ✅ Criar modelo Questao.js
  ✅ Atualizar questoesService.js (compatibilidade)
  
  questoes (0)  ← NOVA
  questoes_matematica (10)
  questoes_ingles (6)
  questoes_programacao (5)
  perguntas (0)
  ────────────────────────
  TOTAL: 21 questões em 5 tabelas


FASE 2: Migração de Dados (1-2 horas)
═════════════════════════════════════════════════════════════════

  ✅ Migrar questoes_matematica → questoes
  ✅ Migrar questoes_ingles → questoes
  ✅ Migrar questoes_programacao → questoes
  ✅ Validar integridade
  
  questoes (21)  ← NOVA COM DADOS
  questoes_matematica (10)  ← LEITURA APENAS
  questoes_ingles (6)       ← LEITURA APENAS
  questoes_programacao (5)  ← LEITURA APENAS
  perguntas (0)             ← LEITURA APENAS
  ────────────────────────
  TOTAL: 21 questões em 5 tabelas (1 escrita, 4 leitura)


FASE 3: Consolidação (30 min)
═════════════════════════════════════════════════════════════════

  ✅ Remover questoes_matematica
  ✅ Remover questoes_ingles
  ✅ Remover questoes_programacao
  ✅ Remover perguntas
  ✅ Simplificar questoesService.js
  
  questoes (21)  ← ÚNICA
  ────────────────────────
  TOTAL: 21 questões em 1 tabela


DEPOIS (Final)
═════════════════════════════════════════════════════════════════

  questoes (21)
  ────────────────────────
  TOTAL: 21 questões em 1 tabela
```

---

## 📈 COMPARAÇÃO DE ESTRUTURA

### ANTES (Múltiplas Tabelas)

```
questoes_matematica
├── id
├── titulo
├── descricao
├── dificuldade
├── torneio_id
├── resposta_correta
├── opcoes
├── pontos
├── midia
└── criado_em

questoes_ingles
├── id
├── titulo
├── descricao
├── dificuldade
├── torneio_id
├── resposta_correta
├── opcoes
├── pontos
├── midia
└── criado_em

questoes_programacao
├── id
├── titulo
├── descricao
├── dificuldade
├── torneio_id
├── resposta_correta
├── opcoes
├── pontos
├── midia
├── linguagem
└── criado_em

perguntas
├── id
├── ordem_indice
├── tipo
├── texto_pergunta
├── opcao_a
├── opcao_b
├── opcao_c
├── opcao_d
├── resposta_correta
├── dificuldade
├── pontos
├── midia
└── criado_em
```

### DEPOIS (Tabela Única)

```
questoes
├── id
├── torneio_id
├── titulo
├── descricao
├── disciplina ✨ NOVO
├── tipo ✨ NOVO
├── dificuldade
├── opcoes
├── resposta_correta
├── explicacao ✨ NOVO
├── pontos
├── linguagem
├── midia
├── created_at
└── updated_at
```

---

## 🔀 MAPEAMENTO DE DADOS

### Matemática

```
questoes_matematica
├── id → questoes.id
├── titulo → questoes.titulo
├── descricao → questoes.descricao
├── dificuldade → questoes.dificuldade
├── torneio_id → questoes.torneio_id
├── resposta_correta → questoes.resposta_correta
├── opcoes → questoes.opcoes
├── pontos → questoes.pontos
├── midia → questoes.midia
├── criado_em → questoes.created_at
└── (novo) → questoes.disciplina = 'matematica'
└── (novo) → questoes.tipo = 'multipla_escolha'
```

### Inglês

```
questoes_ingles
├── id → questoes.id
├── titulo → questoes.titulo
├── descricao → questoes.descricao
├── dificuldade → questoes.dificuldade
├── torneio_id → questoes.torneio_id
├── resposta_correta → questoes.resposta_correta
├── opcoes → questoes.opcoes
├── pontos → questoes.pontos
├── midia → questoes.midia
├── criado_em → questoes.created_at
└── (novo) → questoes.disciplina = 'ingles'
└── (novo) → questoes.tipo = 'multipla_escolha'
```

### Programação

```
questoes_programacao
├── id → questoes.id
├── titulo → questoes.titulo
├── descricao → questoes.descricao
├── dificuldade → questoes.dificuldade
├── torneio_id → questoes.torneio_id
├── resposta_correta → questoes.resposta_correta
├── opcoes → questoes.opcoes
├── pontos → questoes.pontos
├── midia → questoes.midia
├── linguagem → questoes.linguagem
├── criado_em → questoes.created_at
└── (novo) → questoes.disciplina = 'programacao'
└── (novo) → questoes.tipo = 'codigo'
```

---

## 🎯 FLUXO DE REQUISIÇÃO

### ANTES (Atual)

```
POST /api/questoes/matematica
│
├─ QuestoesController.criar()
│  ├─ Valida dados
│  └─ Chama questoesService.criar('matematica', dados)
│
├─ questoesService.criar()
│  ├─ Valida campos comuns
│  ├─ Valida campos específicos (matemática)
│  └─ QuestaoMatematica.create()
│
└─ questoes_matematica (INSERT)
   └─ Retorna questão criada
```

### DEPOIS (Novo)

```
POST /api/questoes/matematica
│
├─ QuestoesController.criar()
│  ├─ Valida dados
│  └─ Chama questoesService.criar('matematica', dados)
│
├─ questoesService.criar()
│  ├─ Valida campos comuns
│  ├─ Converte para novo formato
│  └─ Questao.create({
│       disciplina: 'matematica',
│       tipo: 'multipla_escolha',
│       ...
│     })
│
└─ questoes (INSERT)
   └─ Retorna questão criada
```

---

## 📊 ÍNDICES E PERFORMANCE

### Índices Criados

```
questoes
├── PRIMARY KEY (id)
├── INDEX idx_torneio_id (torneio_id)
├── INDEX idx_disciplina (disciplina)
├── INDEX idx_tipo (tipo)
├── INDEX idx_dificuldade (dificuldade)
└── INDEX idx_torneio_disciplina (torneio_id, disciplina)
```

### Queries Otimizadas

```sql
-- Buscar questões de um torneio
SELECT * FROM questoes WHERE torneio_id = 1;
-- Usa: idx_torneio_id

-- Buscar questões de matemática
SELECT * FROM questoes WHERE disciplina = 'matematica';
-- Usa: idx_disciplina

-- Buscar questões de programação de um torneio
SELECT * FROM questoes 
WHERE torneio_id = 1 AND disciplina = 'programacao';
-- Usa: idx_torneio_disciplina

-- Contar questões por dificuldade
SELECT dificuldade, COUNT(*) FROM questoes 
GROUP BY dificuldade;
-- Usa: idx_dificuldade
```

---

## 🔐 SEGURANÇA E VALIDAÇÃO

### Validações por Disciplina

```
MATEMÁTICA
├─ Tipo: multipla_escolha (padrão)
├─ Opcoes: Array com 2-10 itens
├─ Resposta: A, B, C, D, E, etc
└─ Pontos: 1-1000 (default 10)

INGLÊS
├─ Tipo: multipla_escolha (padrão)
├─ Opcoes: Array com 2-10 itens
├─ Resposta: A, B, C, D, E, etc
└─ Pontos: 1-1000 (default 10)

PROGRAMAÇÃO
├─ Tipo: codigo (padrão)
├─ Linguagem: javascript, python, java, etc
├─ Opcoes: JSON com codigo_inicial e testes
├─ Resposta: Código válido
└─ Pontos: 1-1000 (default 15)
```

---

## 📝 EXEMPLOS DE DADOS

### Questão de Matemática

```json
{
  "id": 1,
  "torneio_id": 1,
  "titulo": "Qual é 2 + 2?",
  "descricao": "Questão básica de aritmética",
  "disciplina": "matematica",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "opcoes": ["3", "4", "5", "6"],
  "resposta_correta": "B",
  "explicacao": "2 + 2 = 4",
  "pontos": 10,
  "linguagem": null,
  "midia": null,
  "created_at": "2026-05-22T10:00:00Z",
  "updated_at": "2026-05-22T10:00:00Z"
}
```

### Questão de Programação

```json
{
  "id": 3,
  "torneio_id": 1,
  "titulo": "Implemente uma função de soma",
  "descricao": "Escreva uma função que soma dois números",
  "disciplina": "programacao",
  "tipo": "codigo",
  "dificuldade": "facil",
  "opcoes": {
    "codigo_inicial": "function soma(a, b) { }",
    "testes": [
      {"entrada": [1, 2], "saida": 3},
      {"entrada": [5, 3], "saida": 8}
    ]
  },
  "resposta_correta": "function soma(a, b) { return a + b; }",
  "explicacao": "Retorna a soma dos dois parâmetros",
  "pontos": 15,
  "linguagem": "javascript",
  "midia": null,
  "created_at": "2026-05-22T10:10:00Z",
  "updated_at": "2026-05-22T10:10:00Z"
}
```

---

## ✅ CHECKLIST VISUAL

### FASE 1: Criação
```
┌─ Criar tabela questoes
│  ├─ ✅ Estrutura SQL
│  ├─ ✅ Índices
│  └─ ✅ Constraints
├─ Criar modelo Questao.js
│  ├─ ✅ Definição de campos
│  ├─ ✅ Validações
│  └─ ✅ Relacionamentos
├─ Atualizar questoesService.js
│  ├─ ✅ Suporte para nova tabela
│  ├─ ✅ Compatibilidade com antigas
│  └─ ✅ Conversão de dados
└─ Testar e Deploy
   ├─ ✅ Testes em staging
   ├─ ✅ Backup
   └─ ✅ Deploy em produção
```

### FASE 2: Migração
```
┌─ Criar scripts de migração
│  ├─ ✅ migrateQuestoes.js
│  └─ ✅ validateQuestoes.js
├─ Executar migração
│  ├─ ✅ Backup
│  ├─ ✅ Migrar dados
│  └─ ✅ Validar integridade
└─ Testar endpoints
   ├─ ✅ GET /api/questoes/torneio/1
   ├─ ✅ POST /api/questoes/matematica
   └─ ✅ PUT /api/questoes/matematica/1
```

### FASE 3: Consolidação
```
┌─ Remover tabelas antigas
│  ├─ ✅ DROP questoes_matematica
│  ├─ ✅ DROP questoes_ingles
│  ├─ ✅ DROP questoes_programacao
│  └─ ✅ DROP perguntas
├─ Remover modelos antigos
│  ├─ ✅ Remover QuestaoMatematica.js
│  ├─ ✅ Remover QuestaoIngles.js
│  ├─ ✅ Remover QuestaoProgramacao.js
│  └─ ✅ Remover Pergunta.js
├─ Simplificar código
│  └─ ✅ Atualizar questoesService.js
└─ Deploy final
   ├─ ✅ Backup
   ├─ ✅ Deploy
   └─ ✅ Monitoramento
```

---

## 🎯 CONCLUSÃO

Este guia visual mostra:
✅ Arquitetura atual vs futura  
✅ Fluxo de migração em 3 fases  
✅ Mapeamento de dados  
✅ Índices e performance  
✅ Exemplos de dados  
✅ Checklist de execução  

**Próximo Passo**: Ler QUESTAO_FINAL_MODEL_AND_MIGRATION_PLAN.md
