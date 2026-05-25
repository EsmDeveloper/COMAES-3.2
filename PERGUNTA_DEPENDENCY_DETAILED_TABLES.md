# TABELAS DETALHADAS - DEPENDÊNCIAS DO MODELO PERGUNTA

**Data:** 22 de Maio de 2026  
**Objetivo:** Fornecer tabelas de referência rápida para todas as dependências

---

## 1. TABELA 1: ENDPOINTS E SEUS CONSUMIDORES

| Endpoint | Método | Modelo | Autenticação | Consumidores | Impacto |
|----------|--------|--------|--------------|--------------|---------|
| `/perguntas/:area` | GET | Pergunta | Nenhuma | Teste.jsx | CRÍTICO |
| `/api/quiz/:area` | GET | Pergunta | Nenhuma | useQuiz Hook | CRÍTICO |
| `/torneios/:id/questoes/matematica` | GET | QuestaoMatematica | Nenhuma | MatematicaOriginal.jsx | CRÍTICO |
| `/torneios/:id/questoes/programacao` | GET | QuestaoProgramacao | Nenhuma | ProgramacaoOriginal.jsx | CRÍTICO |
| `/torneios/:id/questoes/ingles` | GET | QuestaoIngles | Nenhuma | InglesOriginal.jsx | CRÍTICO |

---

## 2. TABELA 2: COMPONENTES FRONTEND E SUAS DEPENDÊNCIAS

| Componente | Ficheiro | Endpoints Consumidos | Rota | Impacto |
|-----------|----------|---------------------|------|---------|
| Teste | `FrontEnd/src/Paginas/Secundarias/Teste.jsx` | `/perguntas/:area` | `/teste-seu-conhecimento` | CRÍTICO |
| useQuiz Hook | `FrontEnd/src/hooks/useQuiz.js` | `/api/quiz/:area` | N/A | CRÍTICO |
| MatematicaOriginal | `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/MatematicaOriginal.jsx` | `/torneios/:id/questoes/matematica` | `/matematica-original/:username` | CRÍTICO |
| ProgramacaoOriginal | `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/ProgramacaoOriginal.jsx` | `/torneios/:id/questoes/programacao` | `/programacao-original/:username` | CRÍTICO |
| InglesOriginal | `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/InglesOriginal.jsx` | `/torneios/:id/questoes/ingles` | `/ingles-original/:username` | CRÍTICO |

---

## 3. TABELA 3: MODELOS E SUAS DEPENDÊNCIAS

| Modelo | Tabela | Torneio_ID | Imports | Endpoints | Impacto |
|--------|--------|-----------|---------|-----------|---------|
| Pergunta | perguntas | ❌ Não | 3 | 2 | CRÍTICO |
| QuestaoMatematica | questoes_matematica | ✅ Sim | 5 | 1 | CRÍTICO |
| QuestaoProgramacao | questoes_programacao | ✅ Sim | 5 | 1 | CRÍTICO |
| QuestaoIngles | questoes_ingles | ✅ Sim | 5 | 1 | CRÍTICO |

---

## 4. TABELA 4: FICHEIROS BACKEND E SUAS DEPENDÊNCIAS

| Ficheiro | Tipo | Pergunta | Questao* | Endpoints | Impacto |
|----------|------|---------|----------|-----------|---------|
| `BackEnd/index.js` | Principal | ✅ Importa | ✅ Importa | Define 5 | CRÍTICO |
| `BackEnd/models/Pergunta.js` | Modelo | ✅ Define | ❌ Não | N/A | CRÍTICO |
| `BackEnd/utils/modelMapper.js` | Utilitário | ✅ Mapeia | ✅ Mapeia | N/A | MÉDIO |
| `BackEnd/scripts/seedPerguntasQuiz.js` | Script | ✅ Usa | ❌ Não | N/A | BAIXO |
| `BackEnd/controllers/GenericController.js` | Controller | ✅ Usa | ✅ Usa | N/A | MÉDIO |

---

## 5. TABELA 5: FICHEIROS FRONTEND E SUAS DEPENDÊNCIAS

| Ficheiro | Tipo | Endpoints Consumidos | Impacto |
|----------|------|---------------------|---------|
| `FrontEnd/src/Paginas/Secundarias/Teste.jsx` | Componente | `/perguntas/:area` | CRÍTICO |
| `FrontEnd/src/hooks/useQuiz.js` | Hook | `/api/quiz/:area` | CRÍTICO |
| `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/MatematicaOriginal.jsx` | Componente | `/torneios/:id/questoes/matematica` | CRÍTICO |
| `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/ProgramacaoOriginal.jsx` | Componente | `/torneios/:id/questoes/programacao` | CRÍTICO |
| `FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/InglesOriginal.jsx` | Componente | `/torneios/:id/questoes/ingles` | CRÍTICO |
| `FrontEnd/src/App.jsx` | Rotas | N/A | ALTO |
| `FrontEnd/src/Paginas/Secundarias/Home.jsx` | Navegação | N/A | MÉDIO |
| `FrontEnd/src/Paginas/Secundarias/Layout.jsx` | Navegação | N/A | MÉDIO |
| `FrontEnd/src/Paginas/Secundarias/NotFoundPage.jsx` | Navegação | N/A | MÉDIO |
| `FrontEnd/src/Paginas/Secundarias/Torneios.jsx` | Navegação | N/A | MÉDIO |
| `FrontEnd/src/Administrador/AdminDashboard.jsx` | Admin | N/A | MÉDIO |

---

## 6. TABELA 6: ROTAS FRONTEND

| Rota | Componente | Ficheiro | Referências | Impacto |
|------|-----------|----------|-------------|---------|
| `/teste-seu-conhecimento` | Teste | `Teste.jsx` | Home, Layout, NotFoundPage | ALTO |
| `/matematica-original/:username` | MatematicaOriginal | `MatematicaOriginal.jsx` | Torneios | ALTO |
| `/programacao-original/:username` | ProgramacaoOriginal | `ProgramacaoOriginal.jsx` | Torneios | ALTO |
| `/ingles-original/:username` | InglesOriginal | `InglesOriginal.jsx` | Torneios | ALTO |

---

## 7. TABELA 7: ESTRUTURA DE DADOS - PERGUNTA

| Campo | Tipo | Obrigatório | Padrão | Notas |
|-------|------|------------|--------|-------|
| id | INTEGER | ✅ | Auto | PK |
| ordem_indice | INTEGER | ✅ | - | Ordem de apresentação |
| tipo | ENUM | ✅ | - | matematica, ingles, programacao, multipla_escolha, texto |
| texto_pergunta | TEXT | ✅ | - | Enunciado da questão |
| opcao_a | STRING | ❌ | NULL | Opção A |
| opcao_b | STRING | ❌ | NULL | Opção B |
| opcao_c | STRING | ❌ | NULL | Opção C |
| opcao_d | STRING | ❌ | NULL | Opção D |
| resposta_correta | ENUM | ✅ | - | a, b, c, d |
| dificuldade | ENUM | ❌ | facil | facil, medio, dificil |
| pontos | INTEGER | ❌ | 1 | Pontos por acerto |
| midia | JSON | ❌ | NULL | Imagens/vídeos |
| criado_em | DATE | ❌ | NOW | Data de criação |

---

## 8. TABELA 8: ESTRUTURA DE DADOS - QUESTAO*

| Campo | Tipo | Obrigatório | Padrão | Notas |
|-------|------|------------|--------|-------|
| id | INTEGER | ✅ | Auto | PK |
| titulo | STRING | ✅ | - | Título da questão |
| descricao | TEXT | ✅ | - | Descrição/enunciado |
| dificuldade | ENUM | ✅ | - | facil, medio, dificil |
| torneio_id | INTEGER | ✅ | - | FK para torneios |
| resposta_correta | TEXT | ✅ | - | Resposta correta |
| opcoes | JSON | ❌ | NULL | Array de opções |
| pontos | INTEGER | ❌ | 10/15 | Pontos por acerto |
| midia | JSON | ❌ | NULL | Imagens/vídeos |
| linguagem | STRING | ❌ | NULL | (Apenas QuestaoProgramacao) |
| criado_em | DATE | ❌ | NOW | Data de criação |

---

## 9. TABELA 9: COMPARAÇÃO - PERGUNTA vs QUESTAO*

| Aspecto | Pergunta | Questao* |
|--------|----------|----------|
| Torneio_ID | ❌ Não tem | ✅ Tem |
| Estrutura de Opções | Colunas (opcao_a/b/c/d) | JSON array |
| Resposta Correta | ENUM ('a','b','c','d') | TEXT |
| Pontos Padrão | 1 | 10/15 |
| Associação a Torneio | ❌ Nenhuma | ✅ FK |
| Uso em Endpoints | `/perguntas/:area`, `/api/quiz/:area` | `/torneios/:id/questoes/:disciplina` |
| Componentes que Usam | Teste.jsx, useQuiz | MatematicaOriginal, ProgramacaoOriginal, InglesOriginal |

---

## 10. TABELA 10: RISCOS POR AÇÃO

| Ação | Risco | Impacto | Reversibilidade |
|------|-------|--------|-----------------|
| Remover Pergunta Model | CRÍTICO | 2 endpoints quebram, 2 componentes quebram | ❌ Difícil |
| Remover `/perguntas/:area` | CRÍTICO | Teste.jsx quebra | ❌ Difícil |
| Remover `/api/quiz/:area` | CRÍTICO | useQuiz quebra | ❌ Difícil |
| Remover `/torneios/:id/questoes/:disciplina` | CRÍTICO | 3 componentes quebram | ❌ Difícil |
| Alterar Estrutura de Pergunta | ALTO | Endpoints podem quebrar | ⚠️ Médio |
| Alterar Estrutura de Questao* | ALTO | Endpoints podem quebrar | ⚠️ Médio |
| Migrar Dados Pergunta → Questao* | ALTO | Perda de dados possível | ⚠️ Médio |

---

## 11. TABELA 11: IMPACTO DE REMOVER CADA COMPONENTE

| Componente | Remover | Impacto | Ficheiros Afetados |
|-----------|---------|--------|-------------------|
| Pergunta Model | ❌ Não | CRÍTICO | 3 imports, 2 endpoints |
| `/perguntas/:area` | ❌ Não | CRÍTICO | Teste.jsx |
| `/api/quiz/:area` | ❌ Não | CRÍTICO | useQuiz Hook |
| Teste.jsx | ❌ Não | CRÍTICO | Rota `/teste-seu-conhecimento` |
| useQuiz Hook | ❌ Não | CRÍTICO | Qualquer componente que o use |
| MatematicaOriginal.jsx | ❌ Não | CRÍTICO | Rota `/matematica-original/:username` |
| ProgramacaoOriginal.jsx | ❌ Não | CRÍTICO | Rota `/programacao-original/:username` |
| InglesOriginal.jsx | ❌ Não | CRÍTICO | Rota `/ingles-original/:username` |

---

## 12. TABELA 12: CHECKLIST DE MIGRAÇÃO (Se Necessário)

| Passo | Descrição | Ficheiros | Risco | Tempo |
|-------|-----------|-----------|-------|-------|
| 1 | Backup de dados em `perguntas` | BD | CRÍTICO | 30min |
| 2 | Criar script de migração | `BackEnd/scripts/` | ALTO | 2h |
| 3 | Testar migração em staging | BD | ALTO | 1h |
| 4 | Executar migração em produção | BD | CRÍTICO | 1h |
| 5 | Atualizar `BackEnd/index.js` | `BackEnd/index.js` | ALTO | 1h |
| 6 | Atualizar `Teste.jsx` | `FrontEnd/src/Paginas/Secundarias/Teste.jsx` | ALTO | 1h |
| 7 | Atualizar `useQuiz.js` | `FrontEnd/src/hooks/useQuiz.js` | ALTO | 1h |
| 8 | Remover `Pergunta.js` | `BackEnd/models/Pergunta.js` | MÉDIO | 30min |
| 9 | Atualizar `modelMapper.js` | `BackEnd/utils/modelMapper.js` | MÉDIO | 30min |
| 10 | Remover `seedPerguntasQuiz.js` | `BackEnd/scripts/seedPerguntasQuiz.js` | BAIXO | 30min |
| 11 | Testes completos | Todos | CRÍTICO | 4h |
| 12 | Deploy em produção | Todos | CRÍTICO | 1h |

**Tempo Total Estimado:** 14-16 horas

---

## 13. TABELA 13: DEPENDÊNCIAS POR NÍVEL

### Nível 1 - Direto (Pergunta)
- `BackEnd/index.js` - Define endpoints
- `Teste.jsx` - Consome `/perguntas/:area`
- `useQuiz.js` - Consome `/api/quiz/:area`

### Nível 2 - Indireto (Rotas)
- `App.jsx` - Define rota `/teste-seu-conhecimento`
- `Home.jsx` - Navega para `/teste-seu-conhecimento`
- `Layout.jsx` - Navega para `/teste-seu-conhecimento`

### Nível 3 - Indireto (Modelos)
- `modelMapper.js` - Mapeia Pergunta
- `GenericController.js` - CRUD genérico

### Nível 4 - Indireto (Scripts)
- `seedPerguntasQuiz.js` - Popula Pergunta

---

## 14. TABELA 14: MATRIZ DE IMPACTO

```
                    REMOVER    ALTERAR    MIGRAR
Pergunta Model      CRÍTICO    ALTO       ALTO
/perguntas/:area    CRÍTICO    ALTO       N/A
/api/quiz/:area     CRÍTICO    ALTO       N/A
Teste.jsx           CRÍTICO    MÉDIO      N/A
useQuiz Hook        CRÍTICO    MÉDIO      N/A
Questao* Models     CRÍTICO    ALTO       ALTO
Endpoints Torneios  CRÍTICO    ALTO       N/A
```

---

## 15. TABELA 15: RECOMENDAÇÕES POR CENÁRIO

| Cenário | Ação | Risco | Tempo |
|---------|------|-------|-------|
| Manter Tudo | Nenhuma | NENHUM | 0h |
| Unificar em Questao* | Migrar + Remover | CRÍTICO | 14-16h |
| Manter Ambos | Sincronizar | ALTO | 8-10h |
| Remover Pergunta | Migrar + Remover | CRÍTICO | 14-16h |

---

**FIM DAS TABELAS**

Nenhuma alteração foi feita. Apenas análise e tabulação de dependências.

