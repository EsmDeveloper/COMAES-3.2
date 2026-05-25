# AUDITORIA DE DEPENDÊNCIAS - MODELO PERGUNTA E ENDPOINTS RELACIONADOS

**Data:** 22 de Maio de 2026  
**Objetivo:** Mapear todas as dependências diretas e indiretas do modelo Pergunta e endpoints relacionados  
**Status:** Análise Completa - Sem Alterações

---

## 1. MODELO PERGUNTA - LOCALIZAÇÃO E ESTRUTURA

### 1.1 Ficheiro do Modelo
- **Localização:** `BackEnd/models/Pergunta.js`
- **Tipo:** Modelo Sequelize
- **Tabela:** `perguntas`
- **Campos Principais:**
  - `id` (PK, INTEGER)
  - `ordem_indice` (INTEGER)
  - `tipo` (ENUM: 'matematica', 'ingles', 'programacao', 'multipla_escolha', 'texto')
  - `texto_pergunta` (TEXT)
  - `opcao_a`, `opcao_b`, `opcao_c`, `opcao_d` (STRING)
  - `resposta_correta` (ENUM: 'a', 'b', 'c', 'd')
  - `dificuldade` (ENUM: 'facil', 'medio', 'dificil')
  - `pontos` (INTEGER, default: 1)
  - `midia` (JSON)
  - `criado_em` (DATE)

**Características Importantes:**
- ❌ **SEM torneio_id** - Questões não estão associadas a torneios
- ❌ **SEM relacionamentos** - Não tem FK para nenhuma tabela
- ✅ **Modelo Genérico** - Suporta múltiplos tipos de questões

---

### 1.2 Imports do Modelo Pergunta

#### Ficheiros que Importam Pergunta:

| Ficheiro | Tipo | Propósito |
|----------|------|----------|
| `BackEnd/index.js` | Backend | Importação principal para uso em endpoints |
| `BackEnd/utils/modelMapper.js` | Backend | Mapeamento genérico de modelos |
| `BackEnd/scripts/seedPerguntasQuiz.js` | Script | Seed de dados para testes |

**Total de Imports:** 3 ficheiros

---

## 2. ENDPOINTS RELACIONADOS COM PERGUNTA

### 2.1 Endpoint: GET /perguntas/:area

**Localização:** `BackEnd/index.js` (linha 1958)

**Método:** GET  
**Modelo Utilizado:** `Pergunta`  
**Autenticação:** Nenhuma (Público)  
**Middleware:** Nenhum

**Parâmetros:**
- `area` (path): matematica, programacao, ingles, cultura_geral

**Lógica:**
```javascript
const tipo = normalizedArea === 'cultura_geral' ? 'multipla_escolha' : normalizedArea;
const perguntas = await Pergunta.findAll({
  where: { tipo },
  order: [['ordem_indice', 'ASC']],
  limit: 20
});
```

**Estrutura da Resposta:**
```javascript
{
  success: true,
  area: "matematica",
  total: 4,
  data: [
    {
      id: 1,
      ordem_indice: 1,
      tipo: "matematica",
      texto_pergunta: "...",
      opcao_a: "...",
      opcao_b: "...",
      opcao_c: "...",
      opcao_d: "...",
      resposta_correta: "b",
      dificuldade: "facil",
      pontos: 1,
      criado_em: "..."
    }
  ]
}
```

**Impacto:** CRÍTICO - Endpoint público que retorna questões genéricas

---

### 2.2 Endpoint: GET /api/quiz/:area

**Localização:** `BackEnd/index.js` (linha 1982)

**Método:** GET  
**Modelo Utilizado:** `Pergunta`  
**Autenticação:** Nenhuma (Público)  
**Middleware:** Nenhum

**Parâmetros:**
- `area` (path): matematica, programacao, ingles
- `limit` (query): máximo 20

**Lógica:**
```javascript
const questoes = await Pergunta.findAll({
  where: { tipo },
  order: [
    [sequelize.literal("CASE WHEN dificuldade = 'facil' THEN 1..."), 'ASC'],
    [sequelize.fn('RAND')]
  ],
  limit: Math.min(parseInt(limit), 20),
  attributes: ['id', 'texto_pergunta', 'opcao_a', 'opcao_b', 'opcao_c', 'opcao_d', 'resposta_correta', 'dificuldade']
});
```

**Estrutura da Resposta:**
```javascript
{
  success: true,
  area: "matematica",
  total: 4,
  data: [
    {
      id: 1,
      questao: "...",
      opcoes: ["3", "4", "5", "6"],
      respostaCorreta: 1,
      dificuldade: "facil"
    }
  ]
}
```

**Impacto:** CRÍTICO - Endpoint público que retorna questões com embaralhamento

---

### 2.3 Endpoints: GET /torneios/:id/questoes/:disciplina

**Localização:** `BackEnd/index.js` (linhas 1855-1895)

**Métodos:**
- `GET /torneios/:id/questoes/matematica`
- `GET /torneios/:id/questoes/programacao`
- `GET /torneios/:id/questoes/ingles`

**Modelos Utilizados:** `QuestaoMatematica`, `QuestaoProgramacao`, `QuestaoIngles`  
**Autenticação:** Nenhuma (Público)  
**Middleware:** Nenhum

**Lógica:**
```javascript
const questoes = await QuestaoMatematica.findAll({
  where: { torneio_id: torneioId },
  attributes: ['id', 'titulo', 'descricao', 'dificuldade', 'pontos', 'opcoes', 'midia']
});
```

**Impacto:** ALTO - Endpoints que retornam questões específicas de torneios (NÃO usam Pergunta)

---

## 3. FRONTEND - COMPONENTES QUE CONSOMEM ENDPOINTS

### 3.1 Componente: Teste.jsx

**Localização:** `FrontEnd/src/Paginas/Secundarias/Teste.jsx`

**Endpoints Consumidos:**
- `GET /perguntas/:area`

**Função Responsável:**
```javascript
const fetchQuestions = async (area) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/perguntas/${area}`
  );
  const result = await response.json();
  // Mapeia questões para formato interno
}
```

**Finalidade:** Carregar questões genéricas para teste básico

**Impacto se Endpoint Removido:** ❌ CRÍTICO - Componente não funcionaria

**Dados Utilizados:**
- `id`, `texto_pergunta`, `opcao_a/b/c/d`, `resposta_correta`, `dificuldade`, `pontos`

---

### 3.2 Hook: useQuiz

**Localização:** `FrontEnd/src/hooks/useQuiz.js`

**Endpoints Consumidos:**
- `GET /api/quiz/:area?limit=10`

**Função Responsável:**
```javascript
const load = useCallback(async (area) => {
  const resp = await fetch(
    `${apiBase}/api/quiz/${area}?limit=${questionLimit}`
  );
  const json = await resp.json();
  // Processa questões
}, [questionLimit, cancelFetch, clearAllTimers, defaultTimePerQuestion]);
```

**Finalidade:** Carregar questões para quiz com embaralhamento

**Impacto se Endpoint Removido:** ❌ CRÍTICO - Hook não funcionaria

**Dados Utilizados:**
- `id`, `questao`, `opcoes`, `respostaCorreta`, `dificuldade`

---

### 3.3 Componente: MatematicaOriginal.jsx

**Localização:** `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/MatematicaOriginal.jsx`

**Endpoints Consumidos:**
- `GET /torneios/:torneioId/questoes/matematica`

**Função Responsável:**
```javascript
const buscarQuestoes = async (torneioId) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || ...}/torneios/${torneioId}/questoes/matematica`
  );
  const data = await response.json();
  // Processa questões
}
```

**Finalidade:** Carregar questões de matemática de um torneio específico

**Impacto se Endpoint Removido:** ❌ CRÍTICO - Componente não funcionaria

**Dados Utilizados:** Questões de QuestaoMatematica (NÃO Pergunta)

---

### 3.4 Componente: ProgramacaoOriginal.jsx

**Localização:** `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/ProgramacaoOriginal.jsx`

**Endpoints Consumidos:**
- `GET /torneios/:torneioId/questoes/programacao`

**Função Responsável:**
```javascript
const buscarQuestoes = async (torneioId) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || ...}/torneios/${torneioId}/questoes/programacao`
  );
  const data = await response.json();
  // Processa questões
}
```

**Finalidade:** Carregar questões de programação de um torneio específico

**Impacto se Endpoint Removido:** ❌ CRÍTICO - Componente não funcionaria

**Dados Utilizados:** Questões de QuestaoProgramacao (NÃO Pergunta)

---

### 3.5 Componente: InglesOriginal.jsx

**Localização:** `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/InglesOriginal.jsx`

**Endpoints Consumidos:**
- `GET /torneios/:torneioId/questoes/ingles`

**Função Responsável:**
```javascript
const buscarQuestoes = async (torneioId) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || ...}/torneios/${torneioId}/questoes/ingles`
  );
  const data = await response.json();
  // Processa questões
}
```

**Finalidade:** Carregar questões de inglês de um torneio específico

**Impacto se Endpoint Removido:** ❌ CRÍTICO - Componente não funcionaria

**Dados Utilizados:** Questões de QuestaoIngles (NÃO Pergunta)

---

## 4. ROTAS FRONTEND

### 4.1 Rota: /teste-seu-conhecimento

**Ficheiro:** `FrontEnd/src/App.jsx` (linha 60)

**Componente:** `Teste`

**Definição:**
```javascript
<Route path="/teste-seu-conhecimento" element={<PageTransition><Teste /></PageTransition>} />
```

**Referências em Navegação:**
- `FrontEnd/src/Paginas/Secundarias/Home.jsx` - Botão "Teste Básico"
- `FrontEnd/src/Paginas/Secundarias/Layout.jsx` - Menu "Teste seu Conhecimento"
- `FrontEnd/src/Paginas/Secundarias/NotFoundPage.jsx` - Link de fallback

**Impacto:** ALTO - Rota pública que acessa Teste.jsx

---

### 4.2 Rotas: /matematica-original/:username, /programacao-original/:username, /ingles-original/:username

**Ficheiro:** `FrontEnd/src/App.jsx` (linhas 62-64)

**Componentes:** `MatematicaOriginal`, `ProgramacaoOriginal`, `InglesOriginal`

**Definição:**
```javascript
<Route path="/matematica-original/:username" element={<PageTransition><MatematicaOriginal /></PageTransition>} />
<Route path="/programacao-original/:username" element={<PageTransition><ProgramacaoOriginal /></PageTransition>} />
<Route path="/ingles-original/:username" element={<PageTransition><InglesOriginal /></PageTransition>} />
```

**Referências em Navegação:**
- `FrontEnd/src/Paginas/Secundarias/Torneios.jsx` - Botão "Participar"

**Impacto:** ALTO - Rotas que acessam componentes de torneios

---

## 5. SISTEMA DE TORNEIOS - DEPENDÊNCIAS

### 5.1 Modelos Questao* Utilizados

| Modelo | Tabela | Torneio_ID | Endpoints |
|--------|--------|-----------|-----------|
| QuestaoMatematica | questoes_matematica | ✅ Sim | `/torneios/:id/questoes/matematica` |
| QuestaoProgramacao | questoes_programacao | ✅ Sim | `/torneios/:id/questoes/programacao` |
| QuestaoIngles | questoes_ingles | ✅ Sim | `/torneios/:id/questoes/ingles` |

**Relacionamentos em index.js:**
```javascript
Torneio.hasMany(QuestaoMatematica, { foreignKey: 'torneio_id', as: 'questoesMat' });
Torneio.hasMany(QuestaoProgramacao, { foreignKey: 'torneio_id', as: 'questoesProg' });
Torneio.hasMany(QuestaoIngles, { foreignKey: 'torneio_id', as: 'questoesEng' });
```

---

### 5.2 Telas Administrativas

**Ficheiro:** `FrontEnd/src/Administrador/AdminDashboard.jsx`

**Modelos Gerenciados:**
- `torneio` - Gerenciar Torneios
- `participante_torneio` - Participantes
- `tentativateste` - Tentativas de Teste

**Impacto:** MÉDIO - Admin pode gerenciar torneios e participantes

---

## 6. MAPA DE DEPENDÊNCIAS

### 6.1 Tabela Completa de Dependências

| COMPONENTE | TIPO | DEPENDÊNCIA | NÍVEL | ESTRATÉGIA |
|-----------|------|-------------|-------|-----------|
| Teste.jsx | Frontend | GET /perguntas/:area | CRÍTICO | Manter ou Migrar |
| useQuiz Hook | Frontend | GET /api/quiz/:area | CRÍTICO | Manter ou Migrar |
| MatematicaOriginal.jsx | Frontend | GET /torneios/:id/questoes/matematica | CRÍTICO | Manter |
| ProgramacaoOriginal.jsx | Frontend | GET /torneios/:id/questoes/programacao | CRÍTICO | Manter |
| InglesOriginal.jsx | Frontend | GET /torneios/:id/questoes/ingles | CRÍTICO | Manter |
| /teste-seu-conhecimento | Rota | Teste.jsx | ALTO | Manter |
| /matematica-original/:username | Rota | MatematicaOriginal.jsx | ALTO | Manter |
| /programacao-original/:username | Rota | ProgramacaoOriginal.jsx | ALTO | Manter |
| /ingles-original/:username | Rota | InglesOriginal.jsx | ALTO | Manter |
| AdminDashboard.jsx | Frontend | Gerenciamento de Torneios | MÉDIO | Manter |
| modelMapper.js | Backend | Pergunta Model | MÉDIO | Manter |
| seedPerguntasQuiz.js | Script | Pergunta Model | BAIXO | Manter |

---

## 7. RISCOS IDENTIFICADOS

### 7.1 Funcionalidades que Podem Quebrar

#### CRÍTICO - Se Remover Pergunta Model:
1. ❌ Endpoint `/perguntas/:area` deixaria de funcionar
2. ❌ Endpoint `/api/quiz/:area` deixaria de funcionar
3. ❌ Componente Teste.jsx não carregaria questões
4. ❌ Hook useQuiz não funcionaria
5. ❌ Rota `/teste-seu-conhecimento` ficaria quebrada

#### ALTO - Se Remover Endpoints de Pergunta:
1. ❌ Teste.jsx não conseguiria carregar questões
2. ❌ useQuiz não conseguiria carregar questões
3. ❌ Qualquer componente que use esses endpoints ficaria quebrado

#### MÉDIO - Se Remover Endpoints de Torneios:
1. ❌ MatematicaOriginal.jsx não carregaria questões
2. ❌ ProgramacaoOriginal.jsx não carregaria questões
3. ❌ InglesOriginal.jsx não carregaria questões
4. ❌ Rotas `/matematica-original/:username` ficariam quebradas

---

### 7.2 Dados que Podem Ser Perdidos

**Se Remover Pergunta Model:**
- ❌ Todas as questões genéricas armazenadas em `perguntas` seriam perdidas
- ❌ Histórico de questões usadas em testes seria perdido
- ❌ Dados de seed (seedPerguntasQuiz.js) não poderiam ser restaurados

**Estimativa de Dados:**
- Número de registros em `perguntas`: Desconhecido (depende de seeds executadas)
- Impacto: CRÍTICO se houver dados em produção

---

### 7.3 Inconsistências Existentes

#### Inconsistência 1: Dois Sistemas de Questões Paralelos
- **Problema:** Pergunta (genérico) vs Questao* (específico)
- **Impacto:** Confusão sobre qual usar
- **Risco:** Dados duplicados ou perdidos

#### Inconsistência 2: Estrutura de Opções Diferente
- **Pergunta:** `opcao_a`, `opcao_b`, `opcao_c`, `opcao_d` (colunas)
- **Questao*:** `opcoes` (JSON array)
- **Impacto:** Lógica diferente para cada modelo

#### Inconsistência 3: Resposta Correta em Formatos Diferentes
- **Pergunta:** ENUM ('a', 'b', 'c', 'd')
- **Questao*:** TEXT (qualquer valor)
- **Impacto:** Validação inconsistente

#### Inconsistência 4: Pergunta Sem Torneio_ID
- **Problema:** Pergunta não está associada a torneios
- **Impacto:** Impossível rastrear qual torneio usa qual questão
- **Risco:** Questões órfãs

---

### 7.4 Duplicações de Lógica

#### Duplicação 1: Dois Endpoints de Quiz
- **GET /perguntas/:area** - Retorna até 20 questões ordenadas por ordem_indice
- **GET /api/quiz/:area** - Retorna até 20 questões ordenadas por dificuldade + embaralhadas
- **Impacto:** Confusão sobre qual usar

#### Duplicação 2: Três Componentes Similares
- **MatematicaOriginal.jsx** - Carrega questões de matemática
- **ProgramacaoOriginal.jsx** - Carrega questões de programação
- **InglesOriginal.jsx** - Carrega questões de inglês
- **Impacto:** Código duplicado, difícil de manter

#### Duplicação 3: Dois Sistemas de Carregamento
- **Teste.jsx** - Usa `/perguntas/:area`
- **MatematicaOriginal.jsx** - Usa `/torneios/:id/questoes/matematica`
- **Impacto:** Lógica duplicada

---

## 8. ESTRATÉGIAS DE MIGRAÇÃO

### 8.1 Opção 1: Manter Pergunta (Sem Mudanças)

**Vantagens:**
- ✅ Sem risco de quebra
- ✅ Sem migração de dados
- ✅ Compatibilidade total

**Desvantagens:**
- ❌ Inconsistência continua
- ❌ Dois sistemas paralelos
- ❌ Confusão no desenvolvimento

**Impacto:** NENHUM

---

### 8.2 Opção 2: Unificar em Questao* (Remover Pergunta)

**Passos:**
1. Migrar dados de `perguntas` para `questoes_*`
2. Atualizar endpoints para usar `questoes_*`
3. Atualizar componentes frontend
4. Remover modelo Pergunta
5. Remover endpoints `/perguntas/:area` e `/api/quiz/:area`

**Vantagens:**
- ✅ Sistema único e consistente
- ✅ Todas as questões associadas a torneios
- ✅ Menos confusão

**Desvantagens:**
- ❌ Migração de dados complexa
- ❌ Risco de perda de dados
- ❌ Quebra de compatibilidade

**Impacto:** CRÍTICO - Requer mudanças em múltiplos ficheiros

**Ficheiros Afetados:**
- `BackEnd/models/Pergunta.js` - Remover
- `BackEnd/index.js` - Remover endpoints, atualizar relacionamentos
- `BackEnd/utils/modelMapper.js` - Remover Pergunta
- `BackEnd/scripts/seedPerguntasQuiz.js` - Remover ou atualizar
- `FrontEnd/src/Paginas/Secundarias/Teste.jsx` - Atualizar endpoints
- `FrontEnd/src/hooks/useQuiz.js` - Atualizar endpoints

---

### 8.3 Opção 3: Manter Ambos (Com Sincronização)

**Passos:**
1. Adicionar `torneio_id` a Pergunta
2. Criar sincronização entre Pergunta e Questao*
3. Atualizar endpoints para usar ambos
4. Documentar qual usar em cada caso

**Vantagens:**
- ✅ Compatibilidade total
- ✅ Sem perda de dados
- ✅ Transição gradual

**Desvantagens:**
- ❌ Complexidade aumenta
- ❌ Sincronização difícil
- ❌ Confusão continua

**Impacto:** MÉDIO - Requer mudanças, mas menos risco

---

## 9. RECOMENDAÇÃO

### Recomendação Prioritária: Opção 2 (Unificar em Questao*)

**Justificativa:**
1. Pergunta é um modelo genérico sem torneio_id
2. Questao* é o modelo correto com torneio_id
3. Dois sistemas paralelos causam confusão
4. Unificação resolve inconsistências

**Cronograma Sugerido:**
1. **Fase 1:** Migrar dados de Pergunta para Questao*
2. **Fase 2:** Atualizar endpoints
3. **Fase 3:** Atualizar componentes frontend
4. **Fase 4:** Remover Pergunta e endpoints antigos
5. **Fase 5:** Testes e validação

**Risco:** ALTO - Requer cuidado na migração de dados

---

## 10. RESUMO EXECUTIVO

### Dependências Diretas de Pergunta:

| Tipo | Quantidade | Crítico |
|------|-----------|---------|
| Imports | 3 | ✅ Sim |
| Endpoints | 2 | ✅ Sim |
| Componentes Frontend | 2 | ✅ Sim |
| Hooks | 1 | ✅ Sim |
| Scripts | 1 | ⚠️ Médio |

### Impacto de Remover Pergunta:

- ❌ **2 endpoints públicos** deixariam de funcionar
- ❌ **2 componentes frontend** quebrariam
- ❌ **1 hook** deixaria de funcionar
- ❌ **1 rota** ficaria quebrada
- ❌ **Dados em produção** seriam perdidos

### Recomendação Final:

**NÃO REMOVER** Pergunta sem antes:
1. Migrar dados para Questao*
2. Atualizar todos os endpoints
3. Atualizar todos os componentes
4. Testar completamente
5. Validar em staging

**Alternativa:** Manter ambos os sistemas com sincronização (menos risco)

---

## 11. FICHEIROS AFETADOS - LISTA COMPLETA

### Backend:
- `BackEnd/models/Pergunta.js` - Modelo
- `BackEnd/index.js` - Endpoints e relacionamentos
- `BackEnd/utils/modelMapper.js` - Mapeamento de modelos
- `BackEnd/scripts/seedPerguntasQuiz.js` - Script de seed
- `BackEnd/controllers/GenericController.js` - CRUD genérico

### Frontend:
- `FrontEnd/src/Paginas/Secundarias/Teste.jsx` - Componente
- `FrontEnd/src/hooks/useQuiz.js` - Hook
- `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/MatematicaOriginal.jsx` - Componente
- `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/ProgramacaoOriginal.jsx` - Componente
- `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/InglesOriginal.jsx` - Componente
- `FrontEnd/src/App.jsx` - Rotas
- `FrontEnd/src/Paginas/Secundarias/Home.jsx` - Navegação
- `FrontEnd/src/Paginas/Secundarias/Layout.jsx` - Navegação
- `FrontEnd/src/Paginas/Secundarias/NotFoundPage.jsx` - Navegação
- `FrontEnd/src/Paginas/Secundarias/Torneios.jsx` - Navegação
- `FrontEnd/src/Administrador/AdminDashboard.jsx` - Admin

**Total de Ficheiros Afetados:** 15

---

**FIM DO RELATÓRIO**

Nenhuma alteração foi feita. Apenas análise e mapeamento de dependências.

