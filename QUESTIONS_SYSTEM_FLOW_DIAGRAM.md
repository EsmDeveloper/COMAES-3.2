# DIAGRAMA DE FLUXO - SISTEMA DE QUESTÕES COMAES

## 1. ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE QUESTÕES COMAES                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   ADMIN PANEL    │         │   PARTICIPANTE   │
│   (Frontend)     │         │   (Frontend)     │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │ POST /api/questoes/:mod    │ GET /perguntas/:area
         │                            │
         ▼                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           QuestoesController / questoesService           │  │
│  │  - Validação de dados                                    │  │
│  │  - CRUD para Questao*, Pergunta                          │  │
│  │  - Busca/filtro                                          │  │
│  │  - Auditoria (órfãs, integridade)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │                            │
         │                            │
         ▼                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS (PostgreSQL)                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │  questoes_matematica│  │  questoes_programacao               │
│  │  - id (PK)          │  │  - id (PK)          │               │
│  │  - titulo           │  │  - titulo           │               │
│  │  - descricao        │  │  - descricao        │               │
│  │  - torneio_id (FK)  │  │  - torneio_id (FK)  │               │
│  │  - resposta_correta │  │  - resposta_correta │               │
│  │  - opcoes (JSON)    │  │  - opcoes (JSON)    │               │
│  │  - pontos           │  │  - pontos           │               │
│  │  - dificuldade      │  │  - dificuldade      │               │
│  │  - linguagem        │  │  - linguagem        │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │  questoes_ingles    │  │  perguntas (GENÉRICO)               │
│  │  - id (PK)          │  │  - id (PK)          │               │
│  │  - titulo           │  │  - tipo             │               │
│  │  - descricao        │  │  - texto_pergunta   │               │
│  │  - torneio_id (FK)  │  │  - opcao_a/b/c/d    │               │
│  │  - resposta_correta │  │  - resposta_correta │               │
│  │  - opcoes (JSON)    │  │  - pontos           │               │
│  │  - pontos           │  │  ❌ SEM torneio_id  │               │
│  │  - dificuldade      │  │                     │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  tentativas_teste                                        │   │
│  │  - id (PK)                                               │   │
│  │  - usuario_id (FK)                                       │   │
│  │  - respostas (JSON)                                      │   │
│  │  - pontuacao                                             │   │
│  │  - status                                                │   │
│  │  ❌ SEM torneio_id                                        │   │
│  │  ❌ SEM disciplina_competida                              │   │
│  │  ❌ SEM referência a questões                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  participantes_torneios                                  │   │
│  │  - id (PK)                                               │   │
│  │  - torneio_id (FK)                                       │   │
│  │  - usuario_id (FK)                                       │   │
│  │  - disciplina_competida                                  │   │
│  │  - pontuacao                                             │   │
│  │  - posicao                                               │   │
│  │  - historico_pontuacao (JSON)                            │   │
│  │  - posicao_congelada                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. FLUXO DE CRIAÇÃO DE QUESTÃO (Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN CRIA QUESTÃO                           │
└─────────────────────────────────────────────────────────────────┘

1. Admin acessa painel administrativo
   └─> /administrador

2. Seleciona "Questões" (NÃO IMPLEMENTADO)
   └─> Deveria ir para interface de gerenciamento

3. Escolhe modalidade
   ├─> Matemática
   ├─> Programação
   └─> Inglês

4. Preenche formulário
   ├─> Título (5-255 caracteres)
   ├─> Descrição (10-5000 caracteres)
   ├─> Dificuldade (fácil, médio, difícil)
   ├─> Opções (A, B, C, D)
   ├─> Resposta correta
   ├─> Pontos (1-1000)
   ├─> Torneio (obrigatório)
   └─> Mídia (opcional)

5. Submete POST /api/questoes/:modalidade
   │
   ├─> QuestoesController.criar()
   │   ├─> Valida dados
   │   ├─> Verifica se torneio existe
   │   └─> Chama questoesService.criar()
   │
   └─> questoesService.criar()
       ├─> Valida campos comuns
       ├─> Valida campos específicos (por modalidade)
       ├─> Limpa dados (trim, etc)
       └─> Cria registro em questoes_[modalidade]

6. Backend retorna questão criada
   └─> { sucesso: true, questao: {...}, mensagem: "..." }

7. Admin vê confirmação
   └─> "Questão criada com sucesso"

PROBLEMA: Não há interface visual para isso!
```

---

## 3. FLUXO DE RESPOSTA DE QUESTÃO (Participante)

```
┌─────────────────────────────────────────────────────────────────┐
│              PARTICIPANTE RESPONDE QUESTÃO                      │
└─────────────────────────────────────────────────────────────────┘

1. Participante acessa /teste
   └─> Teste.jsx

2. Seleciona área (Matemática, Programação, Inglês)
   └─> handleAreaSelect(area)

3. Frontend faz GET /perguntas/:area
   │
   ├─> Backend retorna questões do modelo genérico Pergunta
   │   └─> ❌ PROBLEMA: Não são as questões do torneio!
   │
   └─> Frontend exibe questões

4. Participante vê questão com:
   ├─> Texto da pergunta
   ├─> 4 opções (A, B, C, D)
   ├─> Temporizador (30s)
   └─> Botões de resposta

5. Participante clica em opção
   └─> handleAnswerSelect(optionIndex)

6. Frontend valida resposta LOCALMENTE
   ├─> Compara com resposta correta
   ├─> Calcula pontos (10 + tempo restante)
   ├─> Atualiza estado local
   └─> Exibe feedback (correto/incorreto)

7. Frontend passa para próxima questão
   └─> setCurrentQuestion(currentQuestion + 1)

8. Ao finalizar todas as questões
   ├─> Exibe resumo (pontos, acertos, erros)
   └─> Oferece opções (refazer, nova área)

PROBLEMAS:
❌ Respostas não são salvas no backend
❌ Ranking não é atualizado
❌ Sem histórico de tentativas
❌ Sem validação de inscrição
❌ Sem limite de tentativas
❌ Sem auditoria de respostas
```

---

## 4. FLUXO DE ATUALIZAÇÃO DE RANKING (Deveria Ser)

```
┌─────────────────────────────────────────────────────────────────┐
│           ATUALIZAÇÃO DE RANKING (NÃO IMPLEMENTADO)             │
└─────────────────────────────────────────────────────────────────┘

1. Participante finaliza teste
   └─> Envia respostas para backend

2. Backend recebe POST /api/tentativas
   ├─> Valida inscrição do participante
   ├─> Valida disciplina
   └─> Salva tentativa em tentativas_teste

3. Backend valida cada resposta
   ├─> Compara com resposta_correta
   ├─> Calcula pontos
   └─> Registra em tentativas_teste.respostas (JSON)

4. Backend atualiza ParticipanteTorneio
   ├─> Chama adicionarPontuacao(pontos)
   │   ├─> Atualiza pontuacao
   │   └─> Registra em historico_pontuacao
   │
   ├─> Chama incrementarCasosResolvidos()
   │   ├─> Incrementa casos_resolvidos
   │   └─> Atualiza metadados.total_tentativas
   │
   └─> Atualiza nivel_atual baseado em pontuacao

5. Backend recalcula ranking
   ├─> Chama ParticipanteTorneio.calcularRanking()
   │   ├─> Busca todos os participantes confirmados
   │   ├─> Ordena por pontuacao DESC, entrou_em ASC
   │   ├─> Trata empates corretamente
   │   └─> Persiste posicao em cada participante
   │
   └─> Retorna ranking atualizado

6. Frontend recebe ranking atualizado
   ├─> Exibe nova posição
   ├─> Exibe nova pontuação
   └─> Exibe histórico de pontuação

ATUALMENTE: Nenhum desses passos 2-6 é implementado!
```

---

## 5. RELACIONAMENTOS DE BANCO DE DADOS

```
┌──────────────────────────────────────────────────────────────────┐
│                    RELACIONAMENTOS ATUAIS                        │
└──────────────────────────────────────────────────────────────────┘

torneios (1) ──────────────────────────────── (N) questoes_matematica
   │ id                                           │ torneio_id (FK)
   │                                              │
   │                                              └─ Relacionamento OK ✅
   │
   ├──────────────────────────────────────────── (N) questoes_programacao
   │                                              │ torneio_id (FK)
   │                                              │
   │                                              └─ Relacionamento OK ✅
   │
   ├──────────────────────────────────────────── (N) questoes_ingles
   │                                              │ torneio_id (FK)
   │                                              │
   │                                              └─ Relacionamento OK ✅
   │
   └──────────────────────────────────────────── (N) participantes_torneios
                                                  │ torneio_id (FK)
                                                  │
                                                  └─ Relacionamento OK ✅

usuarios (1) ──────────────────────────────── (N) participantes_torneios
   │ id                                           │ usuario_id (FK)
   │                                              │
   │                                              └─ Relacionamento OK ✅
   │
   └──────────────────────────────────────────── (N) tentativas_teste
                                                  │ usuario_id (FK)
                                                  │
                                                  └─ Relacionamento OK ✅

perguntas (GENÉRICO)
   │ id
   │ tipo (ENUM: matematica, ingles, programacao, multipla_escolha, texto)
   │ ❌ SEM torneio_id
   │
   └─ Relacionamento QUEBRADO ❌
      (Questões órfãs, não associadas a torneios)

tentativas_teste
   │ id
   │ usuario_id (FK) ✅
   │ respostas (JSON)
   │ ❌ SEM torneio_id
   │ ❌ SEM disciplina_competida
   │ ❌ SEM referência a questões específicas
   │
   └─ Relacionamentos INCOMPLETOS ❌
      (Impossível rastrear qual torneio/disciplina/questões)
```

---

## 6. ENDPOINTS ATUAIS

```
┌──────────────────────────────────────────────────────────────────┐
│                    ENDPOINTS DE QUESTÕES                         │
└──────────────────────────────────────────────────────────────────┘

ADMIN ENDPOINTS (Requerem isAdmin)
═══════════════════════════════════════════════════════════════════

POST   /api/questoes/:modalidade
       ├─> Criar questão
       ├─> Parâmetros: modalidade (matematica, ingles, programacao)
       ├─> Body: { titulo, descricao, dificuldade, torneio_id, ... }
       └─> Retorna: { sucesso, questao, mensagem }

GET    /api/questoes/:modalidade/:id
       ├─> Obter questão por ID
       ├─> Parâmetros: modalidade, id
       └─> Retorna: questão

PUT    /api/questoes/:modalidade/:id
       ├─> Atualizar questão
       ├─> Parâmetros: modalidade, id
       ├─> Body: { campos a atualizar }
       └─> Retorna: { sucesso, questao, mensagem }

DELETE /api/questoes/:modalidade/:id
       ├─> Deletar questão
       ├─> Parâmetros: modalidade, id
       └─> Retorna: { sucesso, mensagem }

POST   /api/questoes/:modalidade/:id/duplicar
       ├─> Duplicar questão
       ├─> Parâmetros: modalidade, id
       └─> Retorna: { sucesso, questaoNova, mensagem }

GET    /api/questoes/torneio/:torneioId
       ├─> Listar questões de um torneio
       ├─> Query: modalidade, pagina, limite, busca, dificuldade
       └─> Retorna: { sucesso, resultado: { modalidade: {...} } }

GET    /api/questoes/torneio/:torneioId/contar
       ├─> Contar questões de um torneio
       ├─> Parâmetros: torneioId
       └─> Retorna: { sucesso, contagem: { matematica, ingles, programacao, total } }

GET    /api/questoes/auditoria/orfas
       ├─> Buscar questões órfãs (sem torneio válido)
       └─> Retorna: { sucesso, orfas, totalOrfas }

DELETE /api/questoes/auditoria/orfas
       ├─> Deletar questões órfãs
       └─> Retorna: { sucesso, totalDeletadas, mensagem }

GET    /api/questoes/auditoria/integridade
       ├─> Validar integridade de questões
       └─> Retorna: { sucesso, relatorio: { total, validas, invalidas, problemas } }


PARTICIPANTE ENDPOINTS (Públicos)
═══════════════════════════════════════════════════════════════════

GET    /perguntas/:area
       ├─> Retorna questões do modelo genérico Pergunta
       ├─> Parâmetros: area (matematica, programacao, ingles, cultura_geral)
       ├─> Retorna: até 20 questões ordenadas por ordem_indice
       ├─> Resposta: { success, area, total, data: [...] }
       └─> ❌ PROBLEMA: Usa modelo genérico, não questões do torneio!

GET    /api/quiz/:area
       ├─> Retorna questões ordenadas por dificuldade
       ├─> Parâmetros: area, limit (máx 20)
       ├─> Embaralha opções de cada questão
       ├─> Resposta: { success, area, total, data: [...] }
       └─> ❌ PROBLEMA: Também usa modelo genérico!


ENDPOINTS FALTANDO
═══════════════════════════════════════════════════════════════════

POST   /api/tentativas
       ├─> Salvar tentativa de teste
       ├─> Body: { usuario_id, torneio_id, disciplina_competida, respostas: [...] }
       └─> ❌ NÃO IMPLEMENTADO

GET    /api/tentativas/:usuarioId
       ├─> Listar tentativas de um usuário
       └─> ❌ NÃO IMPLEMENTADO

GET    /api/tentativas/:usuarioId/:torneioId
       ├─> Listar tentativas de um usuário em um torneio específico
       └─> ❌ NÃO IMPLEMENTADO
```

---

## 7. FLUXO DE DADOS - VISÃO GERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE DADOS COMPLETO                      │
└─────────────────────────────────────────────────────────────────┘

CRIAÇÃO (Admin)
───────────────
Admin → AdminPanel → POST /api/questoes/:mod → QuestoesController
  ↓
questoesService.criar() → Valida → Cria em questoes_[mod]
  ↓
Retorna questão criada → AdminPanel exibe confirmação


RECUPERAÇÃO (Participante)
──────────────────────────
Participante → Teste.jsx → GET /perguntas/:area
  ↓
Backend retorna questões de Pergunta (genérico)
  ↓
❌ PROBLEMA: Não são as questões do torneio!
  ↓
Teste.jsx exibe questões


RESPOSTA (Participante)
───────────────────────
Participante clica opção → handleAnswerSelect()
  ↓
Frontend valida LOCALMENTE
  ↓
Calcula pontos (10 + tempo)
  ↓
Exibe feedback
  ↓
❌ PROBLEMA: Não envia para backend!
  ❌ PROBLEMA: Ranking não é atualizado!
  ❌ PROBLEMA: Sem histórico!


RANKING (Deveria Ser)
─────────────────────
Participante finaliza teste
  ↓
Envia respostas → POST /api/tentativas
  ↓
❌ ENDPOINT NÃO EXISTE!
  ↓
Backend valida respostas
  ↓
Atualiza ParticipanteTorneio
  ↓
Recalcula ranking
  ↓
Retorna ranking atualizado
```

---

## 8. MATRIZ DE PROBLEMAS

```
┌──────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE PROBLEMAS                           │
└──────────────────────────────────────────────────────────────────┘

PROBLEMA                          │ SEVERIDADE │ IMPACTO    │ STATUS
──────────────────────────────────┼────────────┼────────────┼─────────
Dois sistemas de questões         │ CRÍTICA    │ BLOQUEADOR │ ❌
Sem persistência de respostas      │ CRÍTICA    │ BLOQUEADOR │ ❌
Sem associação Tentativa↔Questões  │ CRÍTICA    │ BLOQUEADOR │ ❌
Sem validação de inscrição         │ CRÍTICA    │ BLOQUEADOR │ ❌
Endpoint /perguntas usa modelo errado │ ALTA   │ QUEBRADO   │ ❌
Sem atualização de ranking         │ ALTA      │ QUEBRADO   │ ❌
Sem validação de respostas backend │ ALTA      │ QUEBRADO   │ ❌
Sem limite de tentativas           │ ALTA      │ QUEBRADO   │ ❌
Nomenclatura inconsistente         │ MÉDIA     │ CONFUSÃO   │ ⚠️
Estrutura de opções inconsistente  │ MÉDIA     │ CONFUSÃO   │ ⚠️
Resposta correta em formatos diferentes │ MÉDIA │ CONFUSÃO   │ ⚠️
Pontos padrão diferentes           │ MÉDIA     │ CONFUSÃO   │ ⚠️
Sem interface admin para questões  │ BAIXA     │ USABILIDADE│ ⚠️
Sem busca/filtro de questões       │ BAIXA     │ USABILIDADE│ ⚠️
Sem pré-visualização               │ BAIXA     │ USABILIDADE│ ⚠️
Sem importação em lote             │ BAIXA     │ USABILIDADE│ ⚠️
Sem análise de dificuldade         │ BAIXA     │ USABILIDADE│ ⚠️
```

---

## 9. CHECKLIST DE IMPLEMENTAÇÃO

```
┌──────────────────────────────────────────────────────────────────┐
│                    CHECKLIST DE IMPLEMENTAÇÃO                    │
└──────────────────────────────────────────────────────────────────┘

FASE 1 - CRÍTICA
═══════════════════════════════════════════════════════════════════
☐ Unificar modelos de questões
  ☐ Manter Questao* com torneio_id
  ☐ Remover modelo genérico Pergunta
  ☐ Migrar dados existentes
  ☐ Atualizar relacionamentos

☐ Implementar persistência de respostas
  ☐ Criar endpoint POST /api/tentativas
  ☐ Salvar respostas em TentativaTeste
  ☐ Validar respostas no backend
  ☐ Calcular pontuação no backend

☐ Adicionar referências em TentativaTeste
  ☐ Adicionar torneio_id
  ☐ Adicionar disciplina_competida
  ☐ Adicionar relacionamento com questões
  ☐ Atualizar migrations

☐ Implementar validação de inscrição
  ☐ Proteger endpoints com autenticação
  ☐ Validar se participante está inscrito
  ☐ Validar disciplina
  ☐ Retornar erro se não inscrito


FASE 2 - ALTA
═══════════════════════════════════════════════════════════════════
☐ Corrigir endpoint /perguntas/:area
  ☐ Retornar questões do torneio específico
  ☐ Validar inscrição do participante
  ☐ Proteger com autenticação
  ☐ Atualizar Teste.jsx

☐ Implementar atualização de ranking
  ☐ Chamar ParticipanteTorneio.adicionarPontuacao()
  ☐ Recalcular ranking
  ☐ Persistir posição
  ☐ Retornar ranking atualizado

☐ Implementar limite de tentativas
  ☐ Definir limite por torneio
  ☐ Validar antes de permitir nova tentativa
  ☐ Retornar erro se limite atingido
  ☐ Adicionar campo em ParticipanteTorneio


FASE 3 - MÉDIA
═══════════════════════════════════════════════════════════════════
☐ Padronizar nomenclatura
  ☐ Usar Questao* em vez de Pergunta
  ☐ Usar titulo + descricao em vez de texto_pergunta
  ☐ Usar opcoes (JSON) em vez de opcao_a/b/c/d
  ☐ Atualizar migrations

☐ Padronizar estrutura de opções
  ☐ Usar JSON array para todas as questões
  ☐ Padronizar formato de resposta correta
  ☐ Atualizar migrations

☐ Padronizar pontos
  ☐ Definir padrão claro
  ☐ Permitir customização por questão
  ☐ Atualizar validações


FASE 4 - BAIXA
═══════════════════════════════════════════════════════════════════
☐ Criar interface admin para questões
  ☐ CRUD visual
  ☐ Busca/filtro
  ☐ Pré-visualização
  ☐ Importação em lote

☐ Adicionar análise de questões
  ☐ Taxa de acerto
  ☐ Tempo médio
  ☐ Dificuldade calibrada
```

