# AUDITORIA COMPLETA DO SISTEMA DE QUESTÕES - COMAES 3.2

**Data da Auditoria:** 22 de Maio de 2026  
**Status:** Análise Completa - Sem Implementações  
**Objetivo:** Mapear fluxo completo de questões desde criação até avaliação

---

## 1. VISÃO GERAL DO SISTEMA

O sistema de questões da COMAES é composto por **3 modalidades principais**:
- **Matemática** (QuestaoMatematica)
- **Inglês** (QuestaoIngles)
- **Programação** (QuestaoProgramacao)

Além de um modelo genérico **Pergunta** (usado para quizzes simples).

### Fluxo Geral:
```
Admin cria questão → Associa a torneio → Participante acessa teste → 
Responde questões → Sistema avalia → Pontuação atualizada → Ranking recalculado
```

---

## 2. ARQUITETURA ATUAL

### 2.1 Modelos de Dados (Backend)

#### **Pergunta.js** (Modelo Genérico)
- **Tabela:** `perguntas`
- **Campos principais:**
  - `id` (PK)
  - `ordem_indice` (INTEGER) - Ordem de apresentação
  - `tipo` (ENUM: 'matematica', 'ingles', 'programacao', 'multipla_escolha', 'texto')
  - `texto_pergunta` (TEXT)
  - `opcao_a`, `opcao_b`, `opcao_c`, `opcao_d` (STRING)
  - `resposta_correta` (ENUM: 'a', 'b', 'c', 'd')
  - `dificuldade` (ENUM: 'facil', 'medio', 'dificil')
  - `pontos` (INTEGER, default: 1)
  - `midia` (JSON) - Para imagens/vídeos
  - `criado_em` (DATE)

**Problema Identificado:** Este modelo é genérico mas **não tem referência a torneio_id**. Questões criadas aqui são órfãs.

---

#### **QuestaoMatematica.js**
- **Tabela:** `questoes_matematica`
- **Campos principais:**
  - `id` (PK)
  - `titulo` (STRING 255)
  - `descricao` (TEXT)
  - `dificuldade` (ENUM)
  - `torneio_id` (FK → torneios.id) ✅
  - `resposta_correta` (TEXT)
  - `opcoes` (JSON) - Array de opções
  - `pontos` (INTEGER, default: 10)
  - `midia` (JSON)
  - `criado_em` (DATE)

**Índices:** `torneio_id`

---

#### **QuestaoProgramacao.js**
- **Tabela:** `questoes_programacao`
- **Campos principais:** (Idênticos a Matemática, mais:)
  - `linguagem` (STRING 50) - javascript, python, java, cpp, c, csharp, php, ruby, go, rust

**Índices:** `torneio_id`

---

#### **QuestaoIngles.js**
- **Tabela:** `questoes_ingles`
- **Campos principais:** (Idênticos a Matemática)

**Índices:** `torneio_id`

---

#### **TentativaTeste.js**
- **Tabela:** `tentativas_teste`
- **Campos principais:**
  - `id` (PK)
  - `usuario_id` (FK → usuarios.id)
  - `iniciado_em` (DATE)
  - `concluido_em` (DATE, nullable)
  - `respostas` (JSON) - Array de respostas do usuário
  - `pontuacao` (DECIMAL 10,2)
  - `status` (ENUM: 'em_progresso', 'concluida', 'cancelada')
  - `duracao_segundos` (INTEGER)
  - `deletedAt` (DATE) - Soft delete

**Problema:** Não tem referência a `torneio_id` ou `disciplina_competida`. Não está claro qual torneio/disciplina a tentativa pertence.

---

#### **ParticipanteTorneio.js**
- **Tabela:** `participantes_torneios`
- **Campos principais:**
  - `id` (PK)
  - `torneio_id` (FK)
  - `usuario_id` (FK)
  - `disciplina_competida` (ENUM: 'Matemática', 'Inglês', 'Programação')
  - `pontuacao` (DECIMAL 10,2, default: 0)
  - `posicao` (INTEGER, nullable)
  - `casos_resolvidos` (INTEGER)
  - `precisao` (DECIMAL 5,2) - Porcentagem
  - `nivel_atual` (ENUM: 'iniciante', 'intermediário', 'avançado', 'expert')
  - `historico_pontuacao` (JSON)
  - `posicao_congelada` (BOOLEAN)
  - `tempo_congelamento` (DATE)

**Métodos importantes:**
- `adicionarPontuacao(pontos, descricao)` - Adiciona pontos e registra no histórico
- `incrementarCasosResolvidos(quantidade)` - Incrementa casos resolvidos
- `adicionarConquista(id, nome, descricao)` - Adiciona conquista
- `calcularRanking(torneioId, disciplina)` - Calcula ranking com empates
- `congelarRanking(torneioId, disciplina)` - Congela posições quando torneio finaliza
- `obterRankingPersistido(torneioId, disciplina)` - Retorna ranking persistido

---

### 2.2 Relacionamentos (Backend - index.js)

```javascript
// Torneio <-> QuestãoMatematica
Torneio.hasMany(QuestaoMatematica, { foreignKey: 'torneio_id', as: 'questoesMat' });
QuestaoMatematica.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });

// Torneio <-> QuestaoProgramacao
Torneio.hasMany(QuestaoProgramacao, { foreignKey: 'torneio_id', as: 'questoesProg' });
QuestaoProgramacao.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });

// Torneio <-> QuestaoIngles
Torneio.hasMany(QuestaoIngles, { foreignKey: 'torneio_id', as: 'questoesEng' });
QuestaoIngles.belongsTo(Torneio, { foreignKey: 'torneio_id', as: 'torneio' });
```

**Problema:** Não há relacionamento entre `TentativaTeste` e as questões específicas. Não há rastreamento de qual questão foi respondida em qual tentativa.

---

### 2.3 Controladores (Backend)

#### **QuestoesController.js**
Métodos disponíveis:
- `criar(modalidade, dados)` - POST /api/questoes/:modalidade
- `obter(modalidade, id)` - GET /api/questoes/:modalidade/:id
- `atualizar(modalidade, id, dados)` - PUT /api/questoes/:modalidade/:id
- `deletar(modalidade, id)` - DELETE /api/questoes/:modalidade/:id
- `listarPorTorneio(torneioId, modalidade, opcoes)` - GET /api/questoes/torneio/:torneioId
- `contarPorTorneio(torneioId)` - GET /api/questoes/torneio/:torneioId/contar
- `duplicar(modalidade, id)` - POST /api/questoes/:modalidade/:id/duplicar
- `buscarOrfas()` - GET /api/questoes/auditoria/orfas
- `deletarOrfas()` - DELETE /api/questoes/auditoria/orfas
- `validarIntegridade()` - GET /api/questoes/auditoria/integridade

**Proteção:** Todos os endpoints requerem `isAdmin` middleware.

---

### 2.4 Serviço de Questões (Backend)

#### **questoesService.js**
Centraliza lógica de negócio:
- Validação de campos comuns (título, descrição, dificuldade, resposta_correta, pontos, torneio_id)
- Validação específica por modalidade
- CRUD para cada modalidade
- Busca com filtros (modalidade, dificuldade, busca por texto)
- Paginação (padrão: 20 por página)
- Duplicação de questões
- Auditoria (questões órfãs, integridade)

**Validações implementadas:**
- Título: 5-255 caracteres
- Descrição: 10-5000 caracteres
- Dificuldade: facil, medio, dificil
- Pontos: 1-1000
- Torneio: deve existir
- Programação: linguagem deve ser suportada

---

### 2.5 Rotas (Backend)

#### **questoesRoutes.js**
```
POST   /api/questoes/:modalidade              - Criar
GET    /api/questoes/:modalidade/:id          - Obter
PUT    /api/questoes/:modalidade/:id          - Atualizar
DELETE /api/questoes/:modalidade/:id          - Deletar
POST   /api/questoes/:modalidade/:id/duplicar - Duplicar
GET    /api/questoes/torneio/:torneioId       - Listar por torneio
GET    /api/questoes/torneio/:torneioId/contar - Contar
GET    /api/questoes/auditoria/orfas          - Buscar órfãs
DELETE /api/questoes/auditoria/orfas          - Deletar órfãs
GET    /api/questoes/auditoria/integridade    - Validar integridade
```

---

### 2.6 Endpoints Públicos (Backend - index.js)

#### **GET /perguntas/:area**
- Retorna questões do modelo genérico `Pergunta`
- Parâmetros: area (matematica, programacao, ingles, cultura_geral)
- Retorna até 20 questões ordenadas por `ordem_indice`
- **Problema:** Usa modelo genérico, não as questões específicas do torneio

#### **GET /api/quiz/:area**
- Retorna questões ordenadas por dificuldade (fácil → médio → difícil)
- Embaralha opções de cada questão
- Parâmetros: area, limit (máx 20)
- Retorna: id, questao, opcoes, respostaCorreta, dificuldade
- **Problema:** Também usa modelo genérico `Pergunta`

---

### 2.7 Frontend - Componente Teste.jsx

#### **Fluxo:**
1. Usuário não autenticado → Tela de login
2. Usuário autenticado → Seleção de área (Matemática, Programação, Inglês)
3. Ao selecionar área → Fetch `GET /perguntas/:area`
4. Exibe questões com:
   - Temporizador de 30s por questão
   - 4 opções (A, B, C, D)
   - Feedback imediato (correto/incorreto)
   - Pontuação baseada em tempo restante (máx 10 + tempo)
5. Ao finalizar → Exibe resultados (pontos, acertos, erros)

#### **Problemas Identificados:**
- Usa endpoint `/perguntas/:area` (modelo genérico)
- Não associa respostas a nenhum torneio
- Não persiste dados de tentativas
- Não atualiza ranking do participante
- Não valida se usuário está inscrito no torneio
- Não há limite de tentativas
- Não há histórico de tentativas

---

### 2.8 Frontend - Admin Service

#### **adminService.js**
- Proxy genérico para CRUD de modelos
- Acesso via `adminService(token).questoes` (se existisse)
- Atualmente não há integração específica para questões no painel admin

---

## 3. FLUXO COMPLETO MAPEADO

### 3.1 Criação de Questão (Admin)

```
1. Admin acessa painel administrativo
2. Seleciona "Questões" → Escolhe modalidade
3. Preenche formulário:
   - Título
   - Descrição
   - Dificuldade
   - Opções (A, B, C, D)
   - Resposta correta
   - Pontos
   - Torneio (obrigatório)
4. Submete POST /api/questoes/:modalidade
5. Backend valida dados
6. Cria registro em questoes_[modalidade]
7. Retorna questão criada
```

**Problema:** Não há interface visual no painel admin para gerenciar questões. Apenas API.

---

### 3.2 Recuperação de Questões (Participante)

```
1. Participante acessa /teste
2. Seleciona área (Matemática, Programação, Inglês)
3. Frontend faz GET /perguntas/:area
4. Backend retorna questões do modelo genérico Pergunta
5. Frontend exibe questões com temporizador
```

**Problema:** 
- Não recupera questões do torneio específico
- Usa modelo genérico, não as questões criadas pelo admin
- Não valida se participante está inscrito no torneio

---

### 3.3 Processamento de Respostas (Participante)

```
1. Participante responde questão
2. Frontend calcula pontuação localmente
3. Exibe feedback imediato
4. Passa para próxima questão
5. Ao finalizar, exibe resumo
```

**Problema:**
- Respostas não são persistidas no backend
- Não há atualização de ranking
- Não há histórico de tentativas
- Não há validação de respostas no backend

---

## 4. PROBLEMAS IDENTIFICADOS

### 4.1 CRÍTICOS (Bloqueadores)

#### **P1.1 - Desconexão entre Modelos de Questões**
- **Severidade:** CRÍTICA
- **Descrição:** Existem 2 sistemas paralelos de questões:
  1. Modelo genérico `Pergunta` (sem torneio_id)
  2. Modelos específicos `QuestaoMatematica`, `QuestaoProgramacao`, `QuestaoIngles` (com torneio_id)
- **Impacto:** 
  - Admin cria questões em um sistema
  - Participante acessa questões de outro sistema
  - Questões criadas pelo admin nunca são usadas
- **Causa Provável:** Desenvolvimento paralelo sem sincronização
- **Recomendação:** Unificar em um único modelo com `torneio_id`

---

#### **P1.2 - Falta de Persistência de Respostas**
- **Severidade:** CRÍTICA
- **Descrição:** Respostas dos participantes não são salvas no backend
- **Impacto:**
  - Sem histórico de tentativas
  - Sem auditoria de respostas
  - Sem possibilidade de revisão
  - Ranking não é atualizado
- **Causa Provável:** Teste.jsx implementa apenas lógica frontend
- **Recomendação:** Implementar endpoint POST para salvar tentativas

---

#### **P1.3 - Falta de Associação Tentativa ↔ Questões**
- **Severidade:** CRÍTICA
- **Descrição:** Modelo `TentativaTeste` não tem referência a `torneio_id` ou `disciplina_competida`
- **Impacto:**
  - Impossível rastrear qual torneio/disciplina a tentativa pertence
  - Impossível validar se questões pertencem à tentativa
  - Impossível calcular ranking por disciplina
- **Causa Provável:** Modelo incompleto
- **Recomendação:** Adicionar `torneio_id` e `disciplina_competida` a `TentativaTeste`

---

#### **P1.4 - Falta de Validação de Inscrição**
- **Severidade:** CRÍTICA
- **Descrição:** Não há validação se participante está inscrito no torneio
- **Impacto:**
  - Qualquer usuário pode responder questões de qualquer torneio
  - Sem controle de acesso
  - Sem validação de disciplina
- **Causa Provável:** Endpoint `/perguntas/:area` é público
- **Recomendação:** Proteger com autenticação e validar inscrição

---

### 4.2 ALTOS (Funcionalidades Quebradas)

#### **P2.1 - Endpoint `/perguntas/:area` Usa Modelo Errado**
- **Severidade:** ALTA
- **Descrição:** Endpoint retorna questões do modelo genérico `Pergunta`, não das questões específicas do torneio
- **Impacto:** Questões criadas pelo admin nunca são usadas
- **Causa Provável:** Desenvolvimento paralelo
- **Recomendação:** Modificar para retornar questões do torneio específico

---

#### **P2.2 - Sem Atualização de Ranking**
- **Severidade:** ALTA
- **Descrição:** Após responder questões, ranking do participante não é atualizado
- **Impacto:**
  - Pontuação não reflete desempenho real
  - Posição no ranking incorreta
  - Histórico de pontuação não é mantido
- **Causa Provável:** Falta de endpoint para salvar respostas
- **Recomendação:** Implementar lógica de atualização de ranking

---

#### **P2.3 - Sem Validação de Respostas no Backend**
- **Severidade:** ALTA
- **Descrição:** Validação de respostas é feita apenas no frontend
- **Impacto:**
  - Usuário pode manipular respostas via DevTools
  - Sem auditoria de respostas corretas
  - Sem segurança
- **Causa Provável:** Implementação incompleta
- **Recomendação:** Validar respostas no backend

---

#### **P2.4 - Sem Limite de Tentativas**
- **Severidade:** ALTA
- **Descrição:** Participante pode fazer quantas tentativas quiser
- **Impacto:**
  - Sem controle de acesso
  - Possível abuso
  - Sem regras de competição
- **Causa Provável:** Falta de lógica de controle
- **Recomendação:** Implementar limite de tentativas por torneio/disciplina

---

### 4.3 MÉDIOS (Inconsistências)

#### **P3.1 - Nomenclatura Inconsistente**
- **Severidade:** MÉDIA
- **Descrição:** Nomes de campos e modelos inconsistentes:
  - `Pergunta` vs `Questao*`
  - `texto_pergunta` vs `titulo` + `descricao`
  - `opcao_a/b/c/d` vs `opcoes` (JSON)
  - `resposta_correta` (ENUM 'a','b','c','d') vs `resposta_correta` (TEXT)
- **Impacto:** Confusão no desenvolvimento, erros de mapeamento
- **Causa Provável:** Desenvolvimento paralelo sem padrão
- **Recomendação:** Padronizar nomenclatura

---

#### **P3.2 - Estrutura de Opções Inconsistente**
- **Severidade:** MÉDIA
- **Descrição:**
  - Modelo `Pergunta`: opcoes em colunas separadas (opcao_a, opcao_b, opcao_c, opcao_d)
  - Modelos `Questao*`: opcoes em JSON array
- **Impacto:** Lógica diferente para cada modelo
- **Causa Provável:** Evolução do sistema
- **Recomendação:** Padronizar em JSON array

---

#### **P3.3 - Resposta Correta em Formatos Diferentes**
- **Severidade:** MÉDIA
- **Descrição:**
  - Modelo `Pergunta`: ENUM ('a', 'b', 'c', 'd')
  - Modelos `Questao*`: TEXT (pode ser qualquer coisa)
- **Impacto:** Validação inconsistente
- **Causa Provável:** Falta de padrão
- **Recomendação:** Padronizar em ENUM

---

#### **P3.4 - Pontos Padrão Diferentes**
- **Severidade:** MÉDIA
- **Descrição:**
  - `Pergunta`: 1 ponto
  - `QuestaoMatematica`: 10 pontos
  - `QuestaoProgramacao`: 15 pontos
  - `QuestaoIngles`: 10 pontos
- **Impacto:** Inconsistência na pontuação
- **Causa Provável:** Sem padrão definido
- **Recomendação:** Definir padrão claro

---

### 4.4 BAIXOS (Melhorias)

#### **P4.1 - Sem Interface Admin para Questões**
- **Severidade:** BAIXA
- **Descrição:** Não há interface visual no painel admin para gerenciar questões
- **Impacto:** Admin precisa usar API diretamente
- **Causa Provável:** Desenvolvimento incompleto
- **Recomendação:** Criar interface CRUD no painel admin

---

#### **P4.2 - Sem Busca/Filtro de Questões**
- **Severidade:** BAIXA
- **Descrição:** Serviço tem busca/filtro, mas não há interface
- **Impacto:** Difícil encontrar questões específicas
- **Causa Provável:** Interface não implementada
- **Recomendação:** Adicionar busca/filtro no painel admin

---

#### **P4.3 - Sem Pré-visualização de Questões**
- **Severidade:** BAIXA
- **Descrição:** Admin não pode visualizar como questão aparecerá para participante
- **Impacto:** Difícil validar qualidade
- **Causa Provável:** Interface não implementada
- **Recomendação:** Adicionar pré-visualização

---

#### **P4.4 - Sem Importação em Lote**
- **Severidade:** BAIXA
- **Descrição:** Não há forma de importar múltiplas questões (CSV, JSON)
- **Impacto:** Criação manual é lenta
- **Causa Provável:** Funcionalidade não implementada
- **Recomendação:** Implementar importação em lote

---

#### **P4.5 - Sem Análise de Dificuldade**
- **Severidade:** BAIXA
- **Descrição:** Não há análise de como questões se comportam (taxa de acerto, tempo médio)
- **Impacto:** Difícil calibrar dificuldade
- **Causa Provável:** Funcionalidade não implementada
- **Recomendação:** Adicionar análise de questões

---

## 5. CÓDIGO MORTO E DUPLICAÇÃO

### 5.1 Código Morto

#### **Teste.jsx - Variáveis Não Usadas**
```javascript
const [dynamicQuestions, setDynamicQuestions] = useState({});
// Nunca é usada
```

**Recomendação:** Remover

---

#### **Teste.jsx - Import Não Usado**
```javascript
import React from 'react';
// React não é usado (JSX é transpilado)
```

**Recomendação:** Remover

---

### 5.2 Duplicação

#### **Dois Sistemas de Questões**
- Modelo `Pergunta` (genérico, sem torneio)
- Modelos `Questao*` (específicos, com torneio)

**Recomendação:** Unificar em um único modelo

---

#### **Dois Endpoints de Quiz**
- `GET /perguntas/:area` (retorna até 20)
- `GET /api/quiz/:area` (retorna até 20, embaralha opções)

**Recomendação:** Unificar em um único endpoint

---

## 6. FUNCIONALIDADES INCOMPLETAS

### 6.1 Gerenciamento de Questões no Admin

**Status:** Não implementado

**O que falta:**
- Interface CRUD para questões
- Busca/filtro de questões
- Pré-visualização
- Importação em lote
- Análise de questões

---

### 6.2 Processamento de Respostas

**Status:** Parcialmente implementado (apenas frontend)

**O que falta:**
- Endpoint para salvar respostas
- Validação de respostas no backend
- Cálculo de pontuação no backend
- Atualização de ranking
- Histórico de tentativas

---

### 6.3 Controle de Acesso

**Status:** Não implementado

**O que falta:**
- Validação de inscrição no torneio
- Limite de tentativas
- Validação de disciplina
- Proteção de endpoints

---

## 7. RECOMENDAÇÕES PRIORITÁRIAS

### Fase 1 - CRÍTICA (Bloqueadores)

1. **Unificar modelos de questões**
   - Manter apenas `Questao*` com `torneio_id`
   - Remover modelo genérico `Pergunta`
   - Migrar dados existentes

2. **Implementar persistência de respostas**
   - Criar endpoint POST `/api/tentativas`
   - Salvar respostas em `TentativaTeste`
   - Validar respostas no backend

3. **Adicionar referências em TentativaTeste**
   - Adicionar `torneio_id`
   - Adicionar `disciplina_competida`
   - Adicionar relacionamento com questões

4. **Implementar validação de inscrição**
   - Proteger endpoints com autenticação
   - Validar se participante está inscrito
   - Validar disciplina

---

### Fase 2 - ALTA (Funcionalidades Quebradas)

1. **Corrigir endpoint `/perguntas/:area`**
   - Retornar questões do torneio específico
   - Validar inscrição do participante
   - Proteger com autenticação

2. **Implementar atualização de ranking**
   - Chamar `ParticipanteTorneio.adicionarPontuacao()`
   - Recalcular ranking
   - Persistir posição

3. **Implementar limite de tentativas**
   - Definir limite por torneio
   - Validar antes de permitir nova tentativa
   - Retornar erro se limite atingido

---

### Fase 3 - MÉDIA (Inconsistências)

1. **Padronizar nomenclatura**
   - Usar `Questao*` em vez de `Pergunta`
   - Usar `titulo` + `descricao` em vez de `texto_pergunta`
   - Usar `opcoes` (JSON) em vez de `opcao_a/b/c/d`

2. **Padronizar estrutura de opções**
   - Usar JSON array para todas as questões
   - Padronizar formato de resposta correta

3. **Padronizar pontos**
   - Definir padrão claro (ex: 10 pontos por padrão)
   - Permitir customização por questão

---

### Fase 4 - BAIXA (Melhorias)

1. **Criar interface admin para questões**
   - CRUD visual
   - Busca/filtro
   - Pré-visualização
   - Importação em lote

2. **Adicionar análise de questões**
   - Taxa de acerto
   - Tempo médio
   - Dificuldade calibrada

---

## 8. RESUMO EXECUTIVO

### Funcionando Corretamente ✅
- Modelos de dados bem estruturados (Questao*, ParticipanteTorneio)
- Serviço de questões com validação robusta
- Relacionamentos de banco de dados corretos
- Componente frontend com boa UX

### Problemas Críticos ❌
- Dois sistemas de questões paralelos (Pergunta vs Questao*)
- Respostas não são persistidas
- Sem validação de inscrição
- Sem atualização de ranking

### Impacto Geral
**O sistema de questões está 40% funcional.** Questões podem ser criadas e exibidas, mas respostas não são processadas, ranking não é atualizado, e há desconexão entre admin e participante.

---

## 9. PRÓXIMOS PASSOS

Aguardando feedback e instruções do usuário para:
1. Priorizar qual fase implementar primeiro
2. Definir cronograma de implementação
3. Iniciar desenvolvimento das correções

**Nenhuma alteração foi feita nesta etapa. Apenas análise e diagnóstico.**

