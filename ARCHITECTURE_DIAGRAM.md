# Arquitetura do Sistema de Tentativas

## 🏗️ Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Teste.jsx (Componente Principal)            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  State:                                                  │  │
│  │  ├─ selectedArea (disciplina)                            │  │
│  │  ├─ currentQuestion (índice)                             │  │
│  │  ├─ score (pontos)                                       │  │
│  │  ├─ correctAnswers (acertos)                             │  │
│  │  ├─ wrongAnswers (erros)                                 │  │
│  │  ├─ timeLeft (tempo restante)                            │  │
│  │  ├─ userAnswers (histórico local)                        │  │
│  │  └─ quizzes (questões carregadas)                        │  │
│  │                                                          │  │
│  │  Funções:                                                │  │
│  │  ├─ handleAreaSelect()                                   │  │
│  │  ├─ handleAnswerSelect() ← INTEGRADO COM BACKEND        │  │
│  │  ├─ handleNextQuestion()                                 │  │
│  │  └─ handleRestartQuiz()                                  │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         tentativasService.js (Serviço)                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  enviarTentativa(tentativa)                              │  │
│  │  ├─ Valida token                                         │  │
│  │  ├─ POST /api/tentativas                                 │  │
│  │  ├─ Retorna resultado do backend                         │  │
│  │  └─ Trata erros                                          │  │
│  │                                                          │  │
│  │  obterHistorico(torneio_id, disciplina)                  │  │
│  │  ├─ GET /api/tentativas/:torneio_id/:disciplina          │  │
│  │  └─ Retorna histórico                                    │  │
│  │                                                          │  │
│  │  obterEstatisticas(torneio_id)                           │  │
│  │  ├─ GET /api/tentativas/stats/:torneio_id               │  │
│  │  └─ Retorna estatísticas                                 │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP (REST API)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         tentativasRoutes.js (Rotas)                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  POST /api/tentativas                                    │  │
│  │  ├─ auth (middleware)                                    │  │
│  │  └─ salvarTentativa()                                    │  │
│  │                                                          │  │
│  │  GET /api/tentativas/:torneio_id/:disciplina             │  │
│  │  ├─ auth (middleware)                                    │  │
│  │  └─ obterHistorico()                                     │  │
│  │                                                          │  │
│  │  GET /api/tentativas/stats/:torneio_id                   │  │
│  │  ├─ auth (middleware)                                    │  │
│  │  └─ obterEstatisticas()                                  │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    TentativasController.js (Lógica de Negócio)           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  salvarTentativa(req, res)                               │  │
│  │  ├─ Validações:                                          │  │
│  │  │  ├─ Usuário autenticado?                              │  │
│  │  │  ├─ Usuário existe?                                   │  │
│  │  │  ├─ Torneio existe?                                   │  │
│  │  │  ├─ Usuário inscrito?                                 │  │
│  │  │  ├─ Participante confirmado?                          │  │
│  │  │  ├─ Questão existe?                                   │  │
│  │  │  ├─ Disciplina válida?                                │  │
│  │  │  └─ Resposta não vazia?                               │  │
│  │  │                                                       │  │
│  │  ├─ Processamento:                                       │  │
│  │  │  ├─ Busca resposta_correta do banco                   │  │
│  │  │  ├─ Compara respostas (case-insensitive)              │  │
│  │  │  ├─ Calcula pontos                                    │  │
│  │  │  ├─ Salva TentativaResposta                           │  │
│  │  │  └─ Calcula resumo                                    │  │
│  │  │                                                       │  │
│  │  └─ Retorna resultado                                    │  │
│  │                                                          │  │
│  │  obterHistorico(req, res)                                │  │
│  │  ├─ Busca todas as tentativas                            │  │
│  │  ├─ Calcula resumo                                       │  │
│  │  └─ Retorna histórico                                    │  │
│  │                                                          │  │
│  │  obterEstatisticas(req, res)                             │  │
│  │  ├─ Agrupa por disciplina                                │  │
│  │  ├─ Calcula taxa de acerto                               │  │
│  │  └─ Retorna estatísticas                                 │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Modelos (Sequelize)                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  TentativaResposta                                       │  │
│  │  ├─ id (PK)                                              │  │
│  │  ├─ usuario_id (FK)                                      │  │
│  │  ├─ torneio_id (FK)                                      │  │
│  │  ├─ questao_id (FK)                                      │  │
│  │  ├─ resposta_selecionada                                 │  │
│  │  ├─ resposta_correta                                     │  │
│  │  ├─ correta (boolean)                                    │  │
│  │  ├─ pontos_obtidos                                       │  │
│  │  ├─ tempo_gasto                                          │  │
│  │  └─ criado_em (timestamp)                                │  │
│  │                                                          │  │
│  │  Pergunta                                                │  │
│  │  ├─ id (PK)                                              │  │
│  │  ├─ texto_pergunta                                       │  │
│  │  ├─ opcao_a, opcao_b, opcao_c, opcao_d                  │  │
│  │  ├─ resposta_correta                                     │  │
│  │  ├─ pontos                                               │  │
│  │  └─ disciplina                                           │  │
│  │                                                          │  │
│  │  User                                                    │  │
│  │  ├─ id (PK)                                              │  │
│  │  ├─ username                                             │  │
│  │  ├─ email                                                │  │
│  │  └─ ...                                                  │  │
│  │                                                          │  │
│  │  ParticipanteTorneio                                     │  │
│  │  ├─ usuario_id (FK)                                      │  │
│  │  ├─ torneio_id (FK)                                      │  │
│  │  ├─ disciplina_competida                                 │  │
│  │  └─ status                                               │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS (MySQL)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  tentativas_respostas (Tabela Principal)                        │
│  ├─ id (PK)                                                     │
│  ├─ usuario_id (FK → users)                                     │
│  ├─ torneio_id (FK → torneios)                                  │
│  ├─ questao_id (FK → perguntas)                                 │
│  ├─ resposta_selecionada (VARCHAR)                              │
│  ├─ resposta_correta (VARCHAR)                                  │
│  ├─ correta (BOOLEAN)                                           │
│  ├─ pontos_obtidos (INT)                                        │
│  ├─ tempo_gasto (INT)                                           │
│  └─ criado_em (TIMESTAMP)                                       │
│                                                                 │
│  perguntas (Tabela de Questões)                                 │
│  ├─ id (PK)                                                     │
│  ├─ texto_pergunta (TEXT)                                       │
│  ├─ opcao_a, opcao_b, opcao_c, opcao_d (VARCHAR)               │
│  ├─ resposta_correta (VARCHAR) ← AUTORIDADE                    │
│  ├─ pontos (INT)                                                │
│  └─ disciplina (VARCHAR)                                        │
│                                                                 │
│  users (Tabela de Usuários)                                     │
│  ├─ id (PK)                                                     │
│  ├─ username (VARCHAR)                                          │
│  ├─ email (VARCHAR)                                             │
│  └─ ...                                                         │
│                                                                 │
│  participantes_torneios (Tabela de Inscrições)                  │
│  ├─ usuario_id (FK)                                             │
│  ├─ torneio_id (FK)                                             │
│  ├─ disciplina_competida (VARCHAR)                              │
│  └─ status (VARCHAR)                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Requisição

```
1. FRONTEND
   ┌─────────────────────────────────────┐
   │ Usuário clica em resposta            │
   │ handleAnswerSelect(optionIndex)      │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ Prepara dados:                       │
   │ - torneio_id                         │
   │ - disciplina_competida               │
   │ - questao_id                         │
   │ - resposta_selecionada               │
   │ - tempo_gasto                        │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ Chama enviarTentativa()              │
   │ (tentativasService.js)               │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ POST /api/tentativas                 │
   │ Headers:                             │
   │ - Content-Type: application/json     │
   │ - Authorization: Bearer {token}      │
   │                                      │
   │ Body: {...dados...}                  │
   └─────────────────────────────────────┘

2. BACKEND
                    ↓
   ┌─────────────────────────────────────┐
   │ Recebe requisição                    │
   │ tentativasRoutes.js                  │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ Middleware: auth                     │
   │ Valida token JWT                     │
   │ Extrai usuario_id                    │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ TentativasController.salvarTentativa │
   │                                      │
   │ VALIDAÇÕES:                          │
   │ ✓ usuario_id existe?                 │
   │ ✓ torneio existe?                    │
   │ ✓ usuário inscrito?                  │
   │ ✓ participante confirmado?           │
   │ ✓ questão existe?                    │
   │ ✓ disciplina válida?                 │
   │ ✓ resposta não vazia?                │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ PROCESSAMENTO:                       │
   │                                      │
   │ 1. Busca questão no banco            │
   │    SELECT * FROM perguntas           │
   │    WHERE id = questao_id             │
   │                                      │
   │ 2. Extrai resposta_correta           │
   │    resposta_correta = "A"            │
   │                                      │
   │ 3. Normaliza respostas               │
   │    resposta_selecionada.trim()       │
   │    .toLowerCase()                    │
   │                                      │
   │ 4. Compara                           │
   │    correta = ("a" === "a") → true    │
   │                                      │
   │ 5. Calcula pontos                    │
   │    pontos = correta ? 10 : 0         │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ ARMAZENAMENTO:                       │
   │                                      │
   │ INSERT INTO tentativas_respostas     │
   │ (usuario_id, torneio_id, ...)        │
   │ VALUES (5, 1, ...)                   │
   │                                      │
   │ Salva:                               │
   │ - resposta_selecionada: "A"          │
   │ - resposta_correta: "A"              │
   │ - correta: true                      │
   │ - pontos_obtidos: 10                 │
   │ - tempo_gasto: 15                    │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ CÁLCULO DE RESUMO:                   │
   │                                      │
   │ SELECT COUNT(*) FROM tentativas      │
   │ WHERE correta = true                 │
   │ → total_acertos = 3                  │
   │                                      │
   │ SELECT SUM(pontos_obtidos)           │
   │ → total_pontos = 30                  │
   │                                      │
   │ SELECT COUNT(*) FROM tentativas      │
   │ → total_questoes = 5                 │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ RESPOSTA:                            │
   │ {                                    │
   │   "sucesso": true,                   │
   │   "tentativa": {                     │
   │     "id": 123,                       │
   │     "correta": true,                 │
   │     "pontos_obtidos": 10,            │
   │     "resposta_correta": "A"          │
   │   },                                 │
   │   "resumo": {                        │
   │     "total_acertos": 3,              │
   │     "total_pontos": 30,              │
   │     "total_questoes": 5              │
   │   }                                  │
   │ }                                    │
   └─────────────────────────────────────┘

3. FRONTEND
                    ↓
   ┌─────────────────────────────────────┐
   │ Recebe resposta                      │
   │ enviarTentativa() retorna resultado  │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ ATUALIZA ESTADO:                     │
   │                                      │
   │ setScore(30)                         │
   │ setCorrectAnswers(3)                 │
   │ setWrongAnswers(2)                   │
   │ setUserAnswers([...])                │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ EXIBE FEEDBACK:                      │
   │                                      │
   │ ✓ Botão fica verde                   │
   │ ✓ Ícone ✓ aparece                    │
   │ ✓ Pontos aumentam                    │
   │ ✓ Acertos aumentam                   │
   │ ✓ Sidebar atualiza                   │
   └─────────────────────────────────────┘
                    ↓
   ┌─────────────────────────────────────┐
   │ PRÓXIMA QUESTÃO:                     │
   │                                      │
   │ handleNextQuestion()                 │
   │ setCurrentQuestion(+1)               │
   │ setTimeLeft(30)                      │
   └─────────────────────────────────────┘
```

---

## 🔐 Fluxo de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│ REQUISIÇÃO CHEGA                                            │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ MIDDLEWARE: auth                                            │
│ ├─ Extrai token do header                                  │
│ ├─ Valida JWT                                              │
│ ├─ Extrai usuario_id                                       │
│ └─ Se falhar → 401 Unauthorized                            │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ VALIDAÇÃO 1: Usuário Existe                                │
│ ├─ SELECT * FROM users WHERE id = usuario_id               │
│ └─ Se não existe → 404 Not Found                           │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ VALIDAÇÃO 2: Torneio Existe                                │
│ ├─ SELECT * FROM torneios WHERE id = torneio_id            │
│ └─ Se não existe → 404 Not Found                           │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ VALIDAÇÃO 3: Usuário Inscrito                              │
│ ├─ SELECT * FROM participantes_torneios                    │
│ │  WHERE usuario_id = ? AND torneio_id = ?                 │
│ │  AND disciplina_competida = ?                            │
│ └─ Se não existe → 403 Forbidden                           │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ VALIDAÇÃO 4: Participante Confirmado                       │
│ ├─ Verifica status = 'confirmado'                          │
│ └─ Se não → 403 Forbidden                                  │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ VALIDAÇÃO 5: Questão Existe                                │
│ ├─ SELECT * FROM perguntas WHERE id = questao_id           │
│ └─ Se não existe → 404 Not Found                           │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ VALIDAÇÃO 6: Disciplina Válida                             │
│ ├─ Verifica se está em ['Matemática', 'Inglês', ...]       │
│ └─ Se não → 400 Bad Request                                │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ VALIDAÇÃO 7: Resposta Não Vazia                            │
│ ├─ Verifica se resposta_selecionada.trim() !== ''          │
│ └─ Se vazia → 400 Bad Request                              │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ TODAS AS VALIDAÇÕES PASSARAM                            │
│ Processa requisição com segurança                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparação: Antes vs Depois

```
ANTES (Inseguro):
┌──────────────────────────────────────┐
│ Frontend                             │
│ ├─ Carrega questão                   │
│ ├─ Recebe resposta_correta ❌        │
│ ├─ Usuário seleciona resposta        │
│ ├─ Frontend compara ❌               │
│ ├─ Frontend calcula pontos ❌        │
│ └─ Frontend exibe resultado ❌       │
└──────────────────────────────────────┘

Problemas:
❌ Resposta correta visível no código
❌ Usuário pode modificar pontos
❌ Sem auditoria
❌ Impossível confiar nos dados


DEPOIS (Seguro):
┌──────────────────────────────────────┐
│ Frontend                             │
│ ├─ Carrega questão (sem resposta)    │
│ ├─ Usuário seleciona resposta        │
│ ├─ Envia para backend                │
│ └─ Exibe resultado do backend        │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Backend (Autoridade)                 │
│ ├─ Valida autenticação               │
│ ├─ Valida inscrição                  │
│ ├─ Busca resposta_correta do banco   │
│ ├─ Compara respostas                 │
│ ├─ Calcula pontos                    │
│ ├─ Salva tentativa                   │
│ └─ Retorna resultado                 │
└──────────────────────────────────────┘

Benefícios:
✅ Resposta correta segura no banco
✅ Usuário não pode modificar pontos
✅ Auditoria completa
✅ Dados confiáveis
```

---

## 🎯 Responsabilidades

```
FRONTEND (Interface)
├─ Exibir questões
├─ Capturar resposta do usuário
├─ Enviar para backend
├─ Exibir feedback visual
├─ Mostrar pontos/acertos
└─ Gerenciar navegação

BACKEND (Lógica)
├─ Validar autenticação
├─ Validar autorização
├─ Validar resposta
├─ Calcular pontos
├─ Armazenar tentativa
└─ Retornar resultado

BANCO DE DADOS (Verdade)
├─ Armazenar questões
├─ Armazenar respostas corretas
├─ Armazenar tentativas
├─ Armazenar usuários
└─ Armazenar inscrições
```

---

**Arquitetura Segura e Escalável! ✅**
