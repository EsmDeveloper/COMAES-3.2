# RESUMO EXECUTIVO - AUDITORIA DE DEPENDÊNCIAS DO MODELO PERGUNTA

**Data:** 22 de Maio de 2026  
**Duração da Auditoria:** Completa  
**Status:** Análise Finalizada - Sem Alterações

---

## 1. SITUAÇÃO ATUAL

### O Modelo Pergunta

O modelo `Pergunta` é um modelo genérico de questões que:
- ✅ Armazena questões em formato simples (opções em colunas)
- ✅ Suporta múltiplos tipos (matemática, inglês, programação, etc.)
- ❌ **NÃO está associado a torneios** (sem torneio_id)
- ❌ **NÃO tem relacionamentos** com outras tabelas

### Dois Sistemas Paralelos

Existem **dois sistemas de questões** no COMAES:

| Sistema | Modelo | Torneio_ID | Uso |
|---------|--------|-----------|-----|
| Genérico | Pergunta | ❌ Não | Testes básicos (`/perguntas/:area`, `/api/quiz/:area`) |
| Específico | Questao* | ✅ Sim | Torneios (`/torneios/:id/questoes/:disciplina`) |

---

## 2. DEPENDÊNCIAS ENCONTRADAS

### Resumo Quantitativo

| Tipo | Quantidade | Crítico |
|------|-----------|---------|
| **Imports do Modelo** | 3 | ✅ Sim |
| **Endpoints Públicos** | 2 | ✅ Sim |
| **Componentes Frontend** | 2 | ✅ Sim |
| **Hooks** | 1 | ✅ Sim |
| **Rotas** | 1 | ✅ Sim |
| **Scripts** | 1 | ⚠️ Médio |
| **Ficheiros Afetados** | 15 | ✅ Sim |

### Dependências Críticas

```
Pergunta Model
    ├── BackEnd/index.js (importa e define endpoints)
    │   ├── GET /perguntas/:area
    │   │   └── Teste.jsx (consome)
    │   │       └── Rota /teste-seu-conhecimento
    │   │
    │   └── GET /api/quiz/:area
    │       └── useQuiz Hook (consome)
    │
    ├── BackEnd/utils/modelMapper.js (mapeia)
    │
    └── BackEnd/scripts/seedPerguntasQuiz.js (popula)
```

---

## 3. ENDPOINTS CRÍTICOS

### Endpoint 1: GET /perguntas/:area

**Status:** 🔴 CRÍTICO

- **Consumidor:** `Teste.jsx`
- **Rota:** `/teste-seu-conhecimento`
- **Impacto se Removido:** ❌ Componente não funcionaria
- **Dados Retornados:** Questões genéricas (até 20)

### Endpoint 2: GET /api/quiz/:area

**Status:** 🔴 CRÍTICO

- **Consumidor:** `useQuiz Hook`
- **Rota:** Qualquer componente que use o hook
- **Impacto se Removido:** ❌ Hook não funcionaria
- **Dados Retornados:** Questões embaralhadas (até 20)

### Endpoints 3-5: GET /torneios/:id/questoes/:disciplina

**Status:** 🔴 CRÍTICO

- **Consumidores:** MatematicaOriginal, ProgramacaoOriginal, InglesOriginal
- **Rotas:** `/matematica-original/:username`, `/programacao-original/:username`, `/ingles-original/:username`
- **Impacto se Removidos:** ❌ Componentes não funcionariam
- **Dados Retornados:** Questões específicas de torneios (NÃO usam Pergunta)

---

## 4. COMPONENTES FRONTEND CRÍTICOS

### Teste.jsx
- **Localização:** `FrontEnd/src/Paginas/Secundarias/Teste.jsx`
- **Endpoint:** `/perguntas/:area`
- **Rota:** `/teste-seu-conhecimento`
- **Impacto:** CRÍTICO - Teste básico não funcionaria

### useQuiz Hook
- **Localização:** `FrontEnd/src/hooks/useQuiz.js`
- **Endpoint:** `/api/quiz/:area`
- **Rota:** Qualquer componente que o use
- **Impacto:** CRÍTICO - Quiz não funcionaria

### MatematicaOriginal.jsx
- **Localização:** `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/MatematicaOriginal.jsx`
- **Endpoint:** `/torneios/:id/questoes/matematica`
- **Rota:** `/matematica-original/:username`
- **Impacto:** CRÍTICO - Torneio de matemática não funcionaria

### ProgramacaoOriginal.jsx
- **Localização:** `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/ProgramacaoOriginal.jsx`
- **Endpoint:** `/torneios/:id/questoes/programacao`
- **Rota:** `/programacao-original/:username`
- **Impacto:** CRÍTICO - Torneio de programação não funcionaria

### InglesOriginal.jsx
- **Localização:** `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/InglesOriginal.jsx`
- **Endpoint:** `/torneios/:id/questoes/ingles`
- **Rota:** `/ingles-original/:username`
- **Impacto:** CRÍTICO - Torneio de inglês não funcionaria

---

## 5. RISCOS IDENTIFICADOS

### 🔴 CRÍTICO - Se Remover Pergunta Model

1. ❌ Endpoint `/perguntas/:area` deixaria de funcionar
2. ❌ Endpoint `/api/quiz/:area` deixaria de funcionar
3. ❌ Componente Teste.jsx não carregaria questões
4. ❌ Hook useQuiz não funcionaria
5. ❌ Rota `/teste-seu-conhecimento` ficaria quebrada
6. ❌ Todos os dados em `perguntas` seriam perdidos

**Impacto:** Funcionalidade de testes básicos completamente quebrada

---

### 🔴 CRÍTICO - Se Remover Endpoints de Pergunta

1. ❌ Teste.jsx não conseguiria carregar questões
2. ❌ useQuiz não conseguiria carregar questões
3. ❌ Qualquer componente que use esses endpoints ficaria quebrado

**Impacto:** Testes básicos não funcionariam

---

### 🟠 ALTO - Se Remover Endpoints de Torneios

1. ❌ MatematicaOriginal.jsx não carregaria questões
2. ❌ ProgramacaoOriginal.jsx não carregaria questões
3. ❌ InglesOriginal.jsx não carregaria questões
4. ❌ Rotas de torneios ficariam quebradas

**Impacto:** Torneios não funcionariam

---

### 🟠 ALTO - Inconsistências Existentes

1. **Dois Sistemas Paralelos:** Pergunta (genérico) vs Questao* (específico)
2. **Estrutura Diferente:** Opções em colunas vs JSON array
3. **Resposta Correta Diferente:** ENUM vs TEXT
4. **Pergunta Sem Torneio:** Impossível rastrear qual torneio usa qual questão

**Impacto:** Confusão no desenvolvimento, possível perda de dados

---

### 🟡 MÉDIO - Duplicação de Lógica

1. **Dois Endpoints de Quiz:** `/perguntas/:area` vs `/api/quiz/:area`
2. **Três Componentes Similares:** MatematicaOriginal, ProgramacaoOriginal, InglesOriginal
3. **Dois Sistemas de Carregamento:** Teste.jsx vs MatematicaOriginal.jsx

**Impacto:** Código duplicado, difícil de manter

---

## 6. DADOS EM RISCO

### Se Remover Pergunta Model

- ❌ Todas as questões em `perguntas` seriam perdidas
- ❌ Histórico de questões usadas em testes seria perdido
- ❌ Dados de seed não poderiam ser restaurados

**Estimativa:** Desconhecida (depende de seeds executadas)

---

## 7. FICHEIROS AFETADOS

### Backend (5 ficheiros)
1. `BackEnd/models/Pergunta.js` - Modelo
2. `BackEnd/index.js` - Endpoints e relacionamentos
3. `BackEnd/utils/modelMapper.js` - Mapeamento
4. `BackEnd/scripts/seedPerguntasQuiz.js` - Script
5. `BackEnd/controllers/GenericController.js` - CRUD

### Frontend (10 ficheiros)
1. `FrontEnd/src/Paginas/Secundarias/Teste.jsx` - Componente
2. `FrontEnd/src/hooks/useQuiz.js` - Hook
3. `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/MatematicaOriginal.jsx` - Componente
4. `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/ProgramacaoOriginal.jsx` - Componente
5. `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/InglesOriginal.jsx` - Componente
6. `FrontEnd/src/App.jsx` - Rotas
7. `FrontEnd/src/Paginas/Secundarias/Home.jsx` - Navegação
8. `FrontEnd/src/Paginas/Secundarias/Layout.jsx` - Navegação
9. `FrontEnd/src/Paginas/Secundarias/NotFoundPage.jsx` - Navegação
10. `FrontEnd/src/Paginas/Secundarias/Torneios.jsx` - Navegação

**Total:** 15 ficheiros

---

## 8. ESTRATÉGIAS DE MIGRAÇÃO

### Opção 1: Manter Pergunta (Recomendado - Sem Risco)

**Ação:** Não fazer nada

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

### Opção 2: Unificar em Questao* (Recomendado - Com Risco)

**Ação:** Migrar dados de Pergunta para Questao*, remover Pergunta

**Passos:**
1. Backup de dados
2. Criar script de migração
3. Testar em staging
4. Executar migração
5. Atualizar endpoints
6. Atualizar componentes
7. Remover Pergunta
8. Testes completos

**Vantagens:**
- ✅ Sistema único e consistente
- ✅ Todas as questões associadas a torneios
- ✅ Menos confusão

**Desvantagens:**
- ❌ Migração complexa
- ❌ Risco de perda de dados
- ❌ Quebra de compatibilidade

**Impacto:** CRÍTICO - Requer mudanças em 15 ficheiros

**Tempo Estimado:** 14-16 horas

---

### Opção 3: Manter Ambos com Sincronização

**Ação:** Adicionar torneio_id a Pergunta, sincronizar com Questao*

**Vantagens:**
- ✅ Compatibilidade total
- ✅ Sem perda de dados
- ✅ Transição gradual

**Desvantagens:**
- ❌ Complexidade aumenta
- ❌ Sincronização difícil
- ❌ Confusão continua

**Impacto:** MÉDIO - Requer mudanças, mas menos risco

**Tempo Estimado:** 8-10 horas

---

## 9. RECOMENDAÇÃO FINAL

### ✅ Recomendação: MANTER PERGUNTA (Opção 1)

**Justificativa:**
1. Pergunta está em uso em endpoints públicos
2. Remover causaria quebra crítica
3. Dois sistemas paralelos já existem
4. Migração é complexa e arriscada

**Ação Imediata:**
- ✅ NÃO remover Pergunta
- ✅ NÃO remover endpoints `/perguntas/:area` e `/api/quiz/:area`
- ✅ Documentar que existem dois sistemas
- ✅ Considerar unificação em futuro (Fase 2)

**Próximos Passos:**
1. Documentar ambos os sistemas
2. Criar guia de qual usar em cada caso
3. Planejar unificação para futuro
4. Implementar sincronização se necessário

---

## 10. CHECKLIST DE SEGURANÇA

### ✅ Antes de Qualquer Alteração

- [ ] Backup completo de dados
- [ ] Teste em staging
- [ ] Validação de todos os endpoints
- [ ] Teste de todos os componentes
- [ ] Plano de rollback
- [ ] Comunicação com stakeholders

### ✅ Se Remover Pergunta (NÃO RECOMENDADO)

- [ ] Migração de dados testada
- [ ] Todos os endpoints atualizados
- [ ] Todos os componentes atualizados
- [ ] Testes completos em staging
- [ ] Deploy gradual (canary)
- [ ] Monitoramento ativo

---

## 11. CONCLUSÃO

### Situação Atual

O modelo `Pergunta` é **CRÍTICO** para o funcionamento de:
- ✅ Testes básicos (`/teste-seu-conhecimento`)
- ✅ Quiz com embaralhamento (`useQuiz Hook`)
- ✅ Endpoints públicos (`/perguntas/:area`, `/api/quiz/:area`)

### Impacto de Remover

**CRÍTICO** - Funcionalidade de testes básicos completamente quebrada

### Recomendação

**MANTER PERGUNTA** sem alterações

### Próximos Passos

1. Documentar ambos os sistemas
2. Considerar unificação em futuro
3. Implementar sincronização se necessário
4. Monitorar uso de ambos os sistemas

---

## 12. DOCUMENTOS GERADOS

1. **PERGUNTA_MODEL_DEPENDENCY_AUDIT.md** - Análise completa
2. **PERGUNTA_DEPENDENCY_DETAILED_TABLES.md** - Tabelas de referência
3. **PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md** - Este documento

---

**FIM DO RESUMO EXECUTIVO**

Nenhuma alteração foi feita. Apenas análise e diagnóstico.

Aguardando feedback e instruções para próximas ações.

