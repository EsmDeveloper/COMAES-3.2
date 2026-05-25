# ESTRUTURAS DE DADOS - SISTEMA DE QUESTÕES COMAES

## 1. MODELOS DE BANCO DE DADOS

### 1.1 Pergunta (Genérico - PROBLEMA)

```javascript
// BackEnd/models/Pergunta.js
{
  id: INTEGER (PK),
  ordem_indice: INTEGER,
  tipo: ENUM('matematica', 'ingles', 'programacao', 'multipla_escolha', 'texto'),
  texto_pergunta: TEXT,
  opcao_a: STRING(255),
  opcao_b: STRING(255),
  opcao_c: STRING(255),
  opcao_d: STRING(255),
  resposta_correta: ENUM('a', 'b', 'c', 'd'),
  dificuldade: ENUM('facil', 'medio', 'dificil'),
  pontos: INTEGER (default: 1),
  midia: JSON,
  criado_em: DATE
}

// ❌ PROBLEMA: Sem torneio_id
// ❌ PROBLEMA: Opções em colunas separadas
// ❌ PROBLEMA: Resposta correta em ENUM
```

---

### 1.2 QuestaoMatematica

```javascript
// BackEnd/models/QuestaoMatematica.js
{
  id: INTEGER (PK),
  titulo: STRING(255),
  descricao: TEXT,
  dificuldade: ENUM('facil', 'medio', 'dificil'),
  torneio_id: INTEGER (FK → torneios.id),
  resposta_correta: TEXT,
  opcoes: JSON,  // Array de opções
  pontos: INTEGER (default: 10),
  midia: JSON,
  criado_em: DATE
}

// ✅ Tem torneio_id
// ✅ Opções em JSON
// ✅ Resposta correta em TEXT
```

---

### 1.3 QuestaoProgramacao

```javascript
// BackEnd/models/QuestaoProgramacao.js
{
  id: INTEGER (PK),
  titulo: STRING(255),
  descricao: TEXT,
  dificuldade: ENUM('facil', 'medio', 'dificil'),
  torneio_id: INTEGER (FK → torneios.id),
  resposta_correta: TEXT,
  opcoes: JSON,
  pontos: INTEGER (default: 15),
  midia: JSON,
  linguagem: STRING(50),  // javascript, python, java, cpp, c, csharp, php, ruby, go, rust
  criado_em: DATE
}
```

---

### 1.4 QuestaoIngles

```javascript
// BackEnd/models/QuestaoIngles.js
{
  id: INTEGER (PK),
  titulo: STRING(255),
  descricao: TEXT,
  dificuldade: ENUM('facil', 'medio', 'dificil'),
  torneio_id: INTEGER (FK → torneios.id),
  resposta_correta: TEXT,
  opcoes: JSON,
  pontos: INTEGER (default: 10),
  midia: JSON,
  criado_em: DATE
}
```

---

### 1.5 TentativaTeste (INCOMPLETO)

```javascript
// BackEnd/models/TentativaTeste.js
{
  id: INTEGER (PK),
  usuario_id: INTEGER (FK → usuarios.id),
  iniciado_em: DATE,
  concluido_em: DATE (nullable),
  respostas: JSON,  // Array de respostas
  pontuacao: DECIMAL(10, 2),
  status: ENUM('em_progresso', 'concluida', 'cancelada'),
  duracao_segundos: INTEGER,
  deletedAt: DATE (soft delete)
}

// ❌ PROBLEMA: Sem torneio_id
// ❌ PROBLEMA: Sem disciplina_competida
// ❌ PROBLEMA: Sem referência a questões específicas
```

---

### 1.6 ParticipanteTorneio

```javascript
// BackEnd/models/ParticipanteTorneio.js
{
  id: INTEGER (PK),
  torneio_id: INTEGER (FK → torneios.id),
  usuario_id: INTEGER (FK → usuarios.id),
  entrou_em: DATE,
  status: ENUM('pendente', 'confirmado', 'removido', 'desclassificado'),
  pontuacao: DECIMAL(10, 2) (default: 0),
  posicao: INTEGER (nullable),
  casos_resolvidos: INTEGER (default: 0),
  disciplina_competida: ENUM('Matemática', 'Inglês', 'Programação'),
  ultima_atividade: DATE,
  tempo_total: INTEGER (em segundos),
  precisao: DECIMAL(5, 2) (porcentagem),
  nivel_atual: ENUM('iniciante', 'intermediário', 'avançado', 'expert'),
  conquistas: JSON,
  historico_pontuacao: JSON,
  metadados: JSON,
  posicao_congelada: BOOLEAN,
  tempo_congelamento: DATE
}

// ✅ Bem estruturado
// ✅ Tem todos os campos necessários
```

---

## 2. ESTRUTURAS DE REQUISIÇÃO/RESPOSTA

### 2.1 Criar Questão

#### Request
```javascript
POST /api/questoes/matematica
Content-Type: application/json
Authorization: Bearer <token_admin>

{
  "titulo": "Resolva a equação",
  "descricao": "Encontre o valor de x em: 2x + 5 = 13",
  "dificuldade": "facil",
  "torneio_id": 1,
  "resposta_correta": "4",
  "opcoes": ["3", "4", "5", "6"],
  "pontos": 10,
  "midia": {
    "tipo": "imagem",
    "url": "https://..."
  }
}
```

#### Response (Sucesso)
```javascript
{
  "sucesso": true,
  "mensagem": "Questão de Matemática criada com sucesso",
  "dados": {
    "id": 101,
    "titulo": "Resolva a equação",
    "descricao": "Encontre o valor de x em: 2x + 5 = 13",
    "dificuldade": "facil",
    "torneio_id": 1,
    "resposta_correta": "4",
    "opcoes": ["3", "4", "5", "6"],
    "pontos": 10,
    "midia": {...},
    "criado_em": "2026-05-22T10:30:00Z"
  },
  "timestamp": "2026-05-22T10:30:00Z"
}
```

#### Response (Erro)
```javascript
{
  "sucesso": false,
  "mensagem": "Erro de validação",
  "erros": {
    "titulo": "Título deve ter pelo menos 5 caracteres",
    "torneio_id": "Torneio não encontrado: 999"
  },
  "timestamp": "2026-05-22T10:30:00Z"
}
```

---

### 2.2 Listar Questões de Torneio

#### Request
```javascript
GET /api/questoes/torneio/1?modalidade=matematica&pagina=1&limite=20&busca=equacao&dificuldade=facil
Authorization: Bearer <token_admin>
```

#### Response
```javascript
{
  "sucesso": true,
  "mensagem": "Questões listadas com sucesso",
  "dados": {
    "matematica": {
      "total": 5,
      "pagina": 1,
      "limite": 20,
      "totalPaginas": 1,
      "questoes": [
        {
          "id": 101,
          "titulo": "Resolva a equação",
          "descricao": "Encontre o valor de x em: 2x + 5 = 13",
          "dificuldade": "facil",
          "torneio_id": 1,
          "resposta_correta": "4",
          "opcoes": ["3", "4", "5", "6"],
          "pontos": 10,
          "criado_em": "2026-05-22T10:30:00Z"
        },
        // ... mais questões
      ]
    }
  },
  "timestamp": "2026-05-22T10:30:00Z"
}
```

---

### 2.3 Recuperar Questões (Participante)

#### Request (ATUAL - PROBLEMA)
```javascript
GET /perguntas/matematica
```

#### Response (ATUAL - PROBLEMA)
```javascript
{
  "success": true,
  "area": "matematica",
  "total": 4,
  "data": [
    {
      "id": 1,
      "ordem_indice": 1,
      "tipo": "matematica",
      "texto_pergunta": "Quanto é 2 + 2?",
      "opcao_a": "3",
      "opcao_b": "4",
      "opcao_c": "5",
      "opcao_d": "6",
      "resposta_correta": "b",
      "dificuldade": "facil",
      "pontos": 1,
      "criado_em": "2026-05-22T10:30:00Z"
    },
    // ... mais questões
  ]
}

// ❌ PROBLEMA: Usa modelo genérico Pergunta
// ❌ PROBLEMA: Não valida inscrição
// ❌ PROBLEMA: Não associa a torneio
```

#### Response (DEVERIA SER)
```javascript
{
  "success": true,
  "torneio_id": 1,
  "disciplina": "Matemática",
  "total": 4,
  "data": [
    {
      "id": 101,
      "titulo": "Resolva a equação",
      "descricao": "Encontre o valor de x em: 2x + 5 = 13",
      "texto_pergunta": "Encontre o valor de x em: 2x + 5 = 13",  // Para compatibilidade
      "opcoes": ["3", "4", "5", "6"],
      "resposta_correta": "4",  // Não enviar para frontend!
      "dificuldade": "facil",
      "pontos": 10,
      "midia": null
    },
    // ... mais questões
  ]
}

// ✅ Associado a torneio
// ✅ Validado inscrição
// ✅ Usa modelo correto
```

---

### 2.4 Salvar Tentativa (NÃO IMPLEMENTADO)

#### Request (DEVERIA SER)
```javascript
POST /api/tentativas
Content-Type: application/json
Authorization: Bearer <token_usuario>

{
  "torneio_id": 1,
  "disciplina_competida": "Matemática",
  "respostas": [
    {
      "questao_id": 101,
      "resposta_selecionada": "4",
      "tempo_gasto": 15,
      "correta": true
    },
    {
      "questao_id": 102,
      "resposta_selecionada": "B",
      "tempo_gasto": 22,
      "correta": false
    },
    // ... mais respostas
  ],
  "tempo_total": 120,
  "pontuacao_total": 25
}
```

#### Response (DEVERIA SER)
```javascript
{
  "sucesso": true,
  "mensagem": "Tentativa salva com sucesso",
  "dados": {
    "tentativa_id": 501,
    "usuario_id": 10,
    "torneio_id": 1,
    "disciplina_competida": "Matemática",
    "pontuacao": 25,
    "status": "concluida",
    "tempo_total": 120,
    "respostas_corretas": 1,
    "respostas_totais": 2,
    "precisao": 50,
    "ranking": {
      "posicao": 5,
      "pontuacao_total": 85,
      "nivel": "intermediário"
    }
  },
  "timestamp": "2026-05-22T10:30:00Z"
}
```

---

## 3. ESTRUTURAS DE DADOS INTERNAS

### 3.1 Resposta do Participante (Frontend)

```javascript
// Teste.jsx - userAnswers
[
  {
    question: 0,           // Índice da questão
    selected: 1,           // Índice da opção selecionada (0-3)
    correct: true          // Se está correta
  },
  {
    question: 1,
    selected: 2,
    correct: false
  },
  // ... mais respostas
]
```

---

### 3.2 Resposta Persistida (Backend)

```javascript
// TentativaTeste.respostas (JSON)
[
  {
    questao_id: 101,
    resposta_selecionada: "4",
    tempo_gasto: 15,
    correta: true,
    pontos_obtidos: 10,
    timestamp: "2026-05-22T10:30:15Z"
  },
  {
    questao_id: 102,
    resposta_selecionada: "B",
    tempo_gasto: 22,
    correta: false,
    pontos_obtidos: 0,
    timestamp: "2026-05-22T10:30:37Z"
  },
  // ... mais respostas
]
```

---

### 3.3 Histórico de Pontuação (ParticipanteTorneio)

```javascript
// ParticipanteTorneio.historico_pontuacao (JSON)
[
  {
    pontos: 10,
    total: 10,
    descricao: "Questão 101 - Matemática",
    data: "2026-05-22T10:30:15Z"
  },
  {
    pontos: 0,
    total: 10,
    descricao: "Questão 102 - Matemática",
    data: "2026-05-22T10:30:37Z"
  },
  {
    pontos: 15,
    total: 25,
    descricao: "Questão 201 - Programação",
    data: "2026-05-22T10:45:00Z"
  },
  // ... mais histórico (máx 50 últimas)
]
```

---

### 3.4 Metadados do Participante (ParticipanteTorneio)

```javascript
// ParticipanteTorneio.metadados (JSON)
{
  dispositivo: "desktop",
  navegador: "Chrome 120",
  ip: "192.168.1.100",
  preferencias: {
    tema: "claro",
    notificacoes: true,
    som: false
  },
  total_tentativas: 3,
  ultima_tentativa: "2026-05-22T10:45:00Z",
  tempo_medio_questao: 18,
  taxa_acerto_media: 65
}
```

---

### 3.5 Conquistas (ParticipanteTorneio)

```javascript
// ParticipanteTorneio.conquistas (JSON)
[
  {
    id: "primeira_tentativa",
    nome: "Primeira Tentativa",
    descricao: "Completou a primeira tentativa",
    data: "2026-05-22T10:30:00Z"
  },
  {
    id: "100_pontos",
    nome: "Centésimo",
    descricao: "Atingiu 100 pontos",
    data: "2026-05-22T11:00:00Z"
  },
  {
    id: "perfeito",
    nome: "Perfeito",
    descricao: "Acertou todas as questões",
    data: "2026-05-22T11:30:00Z"
  },
  // ... mais conquistas
]
```

---

## 4. VALIDAÇÕES

### 4.1 Validação de Criação de Questão

```javascript
// questoesService.js - validarCamposComuns()

Validações Comuns:
├─ Título
│  ├─ Obrigatório
│  ├─ Mínimo 5 caracteres
│  └─ Máximo 255 caracteres
│
├─ Descrição
│  ├─ Obrigatório
│  ├─ Mínimo 10 caracteres
│  └─ Máximo 5000 caracteres
│
├─ Dificuldade
│  ├─ Obrigatório
│  └─ Valores: facil, medio, dificil
│
├─ Resposta Correta
│  ├─ Obrigatório
│  └─ Não pode estar vazia
│
├─ Pontos
│  ├─ Opcional
│  ├─ Mínimo 1
│  └─ Máximo 1000
│
└─ Torneio ID
   ├─ Obrigatório
   ├─ Deve ser número válido
   └─ Torneio deve existir

Validações Específicas (Matemática/Inglês):
├─ Opções
│  ├─ Mínimo 2 opções
│  ├─ Máximo 10 opções
│  └─ Nenhuma opção vazia

Validações Específicas (Programação):
├─ Linguagem
│  ├─ Obrigatório
│  └─ Valores: javascript, python, java, cpp, c, csharp, php, ruby, go, rust
│
└─ Opções
   └─ Deve ser objeto JSON válido
```

---

### 4.2 Validação de Resposta (DEVERIA SER)

```javascript
// Validações que DEVERIAM ser feitas no backend

1. Validar Inscrição
   ├─ Usuário está autenticado?
   ├─ Usuário está inscrito no torneio?
   └─ Usuário está inscrito na disciplina?

2. Validar Tentativa
   ├─ Tentativa existe?
   ├─ Tentativa está em progresso?
   └─ Limite de tentativas não foi atingido?

3. Validar Questão
   ├─ Questão existe?
   ├─ Questão pertence ao torneio?
   └─ Questão pertence à disciplina?

4. Validar Resposta
   ├─ Resposta não está vazia?
   ├─ Resposta é válida para o tipo de questão?
   └─ Resposta não foi respondida antes?

5. Calcular Pontuação
   ├─ Comparar com resposta_correta
   ├─ Aplicar multiplicador de tempo (se aplicável)
   └─ Aplicar multiplicador de dificuldade (se aplicável)
```

---

## 5. FLUXO DE DADOS - EXEMPLO COMPLETO

### 5.1 Criar Questão

```javascript
// 1. Admin submete formulário
POST /api/questoes/matematica
{
  "titulo": "Resolva: 2x + 5 = 13",
  "descricao": "Encontre o valor de x",
  "dificuldade": "facil",
  "torneio_id": 1,
  "resposta_correta": "4",
  "opcoes": ["3", "4", "5", "6"],
  "pontos": 10
}

// 2. Backend valida
✓ Título: "Resolva: 2x + 5 = 13" (13 caracteres, OK)
✓ Descrição: "Encontre o valor de x" (21 caracteres, OK)
✓ Dificuldade: "facil" (válido)
✓ Torneio: ID 1 existe (OK)
✓ Resposta: "4" (não vazia, OK)
✓ Opções: 4 opções (OK)
✓ Pontos: 10 (1-1000, OK)

// 3. Backend cria registro
INSERT INTO questoes_matematica (
  titulo, descricao, dificuldade, torneio_id,
  resposta_correta, opcoes, pontos, criado_em
) VALUES (
  'Resolva: 2x + 5 = 13',
  'Encontre o valor de x',
  'facil',
  1,
  '4',
  '["3", "4", "5", "6"]',
  10,
  NOW()
)

// 4. Backend retorna
{
  "sucesso": true,
  "questao": {
    "id": 101,
    "titulo": "Resolva: 2x + 5 = 13",
    "descricao": "Encontre o valor de x",
    "dificuldade": "facil",
    "torneio_id": 1,
    "resposta_correta": "4",
    "opcoes": ["3", "4", "5", "6"],
    "pontos": 10,
    "criado_em": "2026-05-22T10:30:00Z"
  }
}

// 5. Admin vê confirmação
"Questão de Matemática criada com sucesso"
```

---

### 5.2 Responder Questão (DEVERIA SER)

```javascript
// 1. Participante vê questão
GET /perguntas/matematica?torneio_id=1
{
  "id": 101,
  "titulo": "Resolva: 2x + 5 = 13",
  "descricao": "Encontre o valor de x",
  "opcoes": ["3", "4", "5", "6"],
  "dificuldade": "facil",
  "pontos": 10
  // ❌ resposta_correta NÃO é enviada!
}

// 2. Participante seleciona opção
Frontend: handleAnswerSelect(1)  // Índice 1 = "4"

// 3. Frontend envia resposta
POST /api/tentativas/101/responder
{
  "questao_id": 101,
  "resposta_selecionada": "4",
  "tempo_gasto": 15
}

// 4. Backend valida
✓ Usuário autenticado
✓ Usuário inscrito no torneio
✓ Usuário inscrito na disciplina
✓ Questão existe
✓ Questão pertence ao torneio
✓ Resposta não foi respondida antes

// 5. Backend compara
resposta_selecionada ("4") === resposta_correta ("4")
→ CORRETA!

// 6. Backend calcula pontos
pontos_base = 10
tempo_bonus = 15 segundos (máx 30)
pontos_totais = 10 + (15/30 * 10) = 15 pontos

// 7. Backend atualiza ParticipanteTorneio
UPDATE participantes_torneios SET
  pontuacao = 15,
  casos_resolvidos = 1,
  historico_pontuacao = [..., {pontos: 15, total: 15, ...}],
  ultima_atividade = NOW()
WHERE usuario_id = 10 AND torneio_id = 1 AND disciplina_competida = 'Matemática'

// 8. Backend recalcula ranking
SELECT * FROM participantes_torneios
WHERE torneio_id = 1 AND disciplina_competida = 'Matemática'
ORDER BY pontuacao DESC, entrou_em ASC

// Resultado:
// Posição 1: Usuário A - 50 pontos
// Posição 2: Usuário B - 25 pontos
// Posição 3: Usuário 10 - 15 pontos (NOVO)

// 9. Backend retorna
{
  "sucesso": true,
  "resposta_correta": true,
  "pontos_obtidos": 15,
  "pontuacao_total": 15,
  "posicao": 3,
  "ranking": [...]
}

// 10. Frontend exibe feedback
"✓ Correto! +15 pontos"
"Sua posição: 3º lugar"
```

---

## 6. COMPARAÇÃO: ATUAL vs DEVERIA SER

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPARAÇÃO DE ESTRUTURAS                     │
└─────────────────────────────────────────────────────────────────┘

ASPECTO                 │ ATUAL              │ DEVERIA SER
────────────────────────┼────────────────────┼──────────────────────
Modelo de Questão       │ Pergunta (genérico)│ Questao* (específico)
Torneio ID              │ ❌ Não tem         │ ✅ Tem
Opções                  │ opcao_a/b/c/d      │ opcoes (JSON array)
Resposta Correta        │ ENUM('a','b','c')  │ TEXT ou ENUM
Persistência Respostas  │ ❌ Não             │ ✅ Sim
Validação Inscrição     │ ❌ Não             │ ✅ Sim
Atualização Ranking     │ ❌ Não             │ ✅ Sim
Limite Tentativas       │ ❌ Não             │ ✅ Sim
Histórico Tentativas    │ ❌ Não             │ ✅ Sim
Interface Admin         │ ❌ Não             │ ✅ Sim
Busca/Filtro            │ ✅ Sim (API)       │ ✅ Sim (UI)
Importação em Lote      │ ❌ Não             │ ✅ Sim
Análise de Questões     │ ❌ Não             │ ✅ Sim
```

