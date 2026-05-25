# ÍNDICE - AUDITORIA DE DEPENDÊNCIAS DO MODELO PERGUNTA

**Data da Auditoria:** 22 de Maio de 2026  
**Status:** Análise Completa - Sem Alterações  
**Objetivo:** Mapear todas as dependências do modelo Pergunta e endpoints relacionados

---

## 📋 DOCUMENTOS GERADOS

### 1. **PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md** ⭐ COMECE AQUI
**Tipo:** Resumo Executivo  
**Tamanho:** ~8 páginas  
**Público:** Stakeholders, Gerentes, Tomadores de Decisão

**Conteúdo:**
- Situação atual (dois sistemas paralelos)
- Dependências encontradas (resumo quantitativo)
- Endpoints críticos
- Componentes frontend críticos
- Riscos identificados
- Estratégias de migração (3 opções)
- Recomendação final
- Checklist de segurança
- Conclusão

**Quando ler:** Primeiro, para entender o panorama geral

---

### 2. **PERGUNTA_MODEL_DEPENDENCY_AUDIT.md** 📊 ANÁLISE DETALHADA
**Tipo:** Relatório Técnico Completo  
**Tamanho:** ~25 páginas  
**Público:** Desenvolvedores, Arquitetos, QA

**Conteúdo:**
- Modelo Pergunta - localização e estrutura
- Imports do modelo (3 ficheiros)
- Endpoints relacionados (5 endpoints)
- Frontend - componentes que consomem (5 componentes)
- Rotas frontend (4 rotas)
- Sistema de torneios - dependências
- Mapa de dependências (tabela completa)
- Riscos identificados (funcionalidades, dados, inconsistências, duplicações)
- Estratégias de migração (3 opções detalhadas)
- Recomendação
- Ficheiros afetados (lista completa)

**Quando ler:** Para entender os detalhes técnicos de cada dependência

---

### 3. **PERGUNTA_DEPENDENCY_DETAILED_TABLES.md** 📈 TABELAS DE REFERÊNCIA
**Tipo:** Tabelas e Matrizes  
**Tamanho:** ~15 páginas  
**Público:** Arquitetos, Desenvolvedores, Analistas

**Conteúdo:**
- Tabela 1: Endpoints e seus consumidores
- Tabela 2: Componentes frontend e dependências
- Tabela 3: Modelos e suas dependências
- Tabela 4: Ficheiros backend e dependências
- Tabela 5: Ficheiros frontend e dependências
- Tabela 6: Rotas frontend
- Tabela 7: Estrutura de dados - Pergunta
- Tabela 8: Estrutura de dados - Questao*
- Tabela 9: Comparação - Pergunta vs Questao*
- Tabela 10: Riscos por ação
- Tabela 11: Impacto de remover cada componente
- Tabela 12: Checklist de migração
- Tabela 13: Dependências por nível
- Tabela 14: Matriz de impacto
- Tabela 15: Recomendações por cenário

**Quando ler:** Para referência rápida e consulta de dados específicos

---

### 4. **PERGUNTA_DEPENDENCY_AUDIT_INDEX.md** 📑 ESTE DOCUMENTO
**Tipo:** Índice e Guia de Navegação  
**Tamanho:** ~10 páginas  
**Público:** Todos

**Conteúdo:**
- Índice de documentos
- Como usar os documentos
- Resumo dos achados
- Ficheiros afetados
- Próximos passos

---

## 🎯 COMO USAR ESTES DOCUMENTOS

### Para Gerentes/Stakeholders
1. Leia **PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md**
2. Foque em: Situação Atual, Riscos, Recomendação Final
3. Tempo: ~20 minutos

**Perguntas Respondidas:**
- O que é o modelo Pergunta?
- Qual é o impacto de remover?
- O que é recomendado?
- Qual é o risco?

---

### Para Arquitetos/Tech Leads
1. Leia **PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md** (visão geral)
2. Leia **PERGUNTA_MODEL_DEPENDENCY_AUDIT.md** (detalhes)
3. Consulte **PERGUNTA_DEPENDENCY_DETAILED_TABLES.md** (referência)
4. Tempo: ~1.5 horas

**Perguntas Respondidas:**
- Quais são todas as dependências?
- Qual é o impacto de cada ação?
- Como migrar se necessário?
- Qual é a estratégia recomendada?

---

### Para Desenvolvedores
1. Leia **PERGUNTA_MODEL_DEPENDENCY_AUDIT.md** (problemas)
2. Consulte **PERGUNTA_DEPENDENCY_DETAILED_TABLES.md** (estruturas)
3. Use como referência durante implementação
4. Tempo: ~2 horas

**Perguntas Respondidas:**
- Quais ficheiros preciso alterar?
- Qual é a estrutura de dados?
- Quais são os endpoints?
- Como testar as mudanças?

---

### Para QA/Testers
1. Leia **PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md** (riscos)
2. Consulte **PERGUNTA_DEPENDENCY_DETAILED_TABLES.md** (checklist)
3. Use para criar casos de teste
4. Tempo: ~1 hora

**Perguntas Respondidas:**
- O que pode quebrar?
- Quais são os cenários críticos?
- Como testar a migração?
- Qual é o plano de rollback?

---

## 📊 RESUMO DOS ACHADOS

### Dependências Encontradas

| Tipo | Quantidade | Crítico |
|------|-----------|---------|
| Imports | 3 | ✅ Sim |
| Endpoints | 2 | ✅ Sim |
| Componentes Frontend | 2 | ✅ Sim |
| Hooks | 1 | ✅ Sim |
| Rotas | 1 | ✅ Sim |
| Scripts | 1 | ⚠️ Médio |
| **Ficheiros Afetados** | **15** | **✅ Sim** |

---

### Riscos Identificados

| Risco | Severidade | Impacto |
|-------|-----------|---------|
| Remover Pergunta Model | CRÍTICO | 2 endpoints quebram, 2 componentes quebram |
| Remover `/perguntas/:area` | CRÍTICO | Teste.jsx quebra |
| Remover `/api/quiz/:area` | CRÍTICO | useQuiz quebra |
| Dois sistemas paralelos | ALTO | Confusão no desenvolvimento |
| Estrutura diferente | ALTO | Lógica duplicada |
| Dados em risco | ALTO | Perda de dados possível |

---

### Recomendação

**✅ MANTER PERGUNTA** (Sem Alterações)

**Justificativa:**
- Pergunta está em uso em endpoints públicos
- Remover causaria quebra crítica
- Dois sistemas paralelos já existem
- Migração é complexa e arriscada

---

## 📁 FICHEIROS AFETADOS

### Backend (5 ficheiros)
1. `BackEnd/models/Pergunta.js` - Modelo
2. `BackEnd/index.js` - Endpoints
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

---

## 🔍 ENDPOINTS CRÍTICOS

### GET /perguntas/:area
- **Consumidor:** Teste.jsx
- **Impacto:** CRÍTICO
- **Status:** ✅ Funcionando

### GET /api/quiz/:area
- **Consumidor:** useQuiz Hook
- **Impacto:** CRÍTICO
- **Status:** ✅ Funcionando

### GET /torneios/:id/questoes/:disciplina
- **Consumidores:** MatematicaOriginal, ProgramacaoOriginal, InglesOriginal
- **Impacto:** CRÍTICO
- **Status:** ✅ Funcionando

---

## 🚀 PRÓXIMOS PASSOS

### Imediato (Hoje)
1. ✅ Revisar este relatório
2. ✅ Compartilhar com stakeholders
3. ✅ Discutir recomendações

### Curto Prazo (Esta Semana)
1. ✅ Documentar ambos os sistemas
2. ✅ Criar guia de qual usar em cada caso
3. ✅ Comunicar decisão ao time

### Médio Prazo (Este Mês)
1. ✅ Considerar unificação em futuro
2. ✅ Planejar migração (se necessário)
3. ✅ Implementar sincronização (se necessário)

### Longo Prazo (Próximos Meses)
1. ✅ Executar migração (se aprovado)
2. ✅ Remover sistema antigo (se aprovado)
3. ✅ Otimizar código

---

## 📋 CHECKLIST DE LEITURA

### Gerentes/Stakeholders
- [ ] Ler PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md
- [ ] Revisar Situação Atual
- [ ] Revisar Riscos
- [ ] Revisar Recomendação
- [ ] Tomar decisão

### Arquitetos
- [ ] Ler PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md
- [ ] Ler PERGUNTA_MODEL_DEPENDENCY_AUDIT.md
- [ ] Consultar PERGUNTA_DEPENDENCY_DETAILED_TABLES.md
- [ ] Revisar Estratégias de Migração
- [ ] Planejar implementação

### Desenvolvedores
- [ ] Ler PERGUNTA_MODEL_DEPENDENCY_AUDIT.md
- [ ] Consultar PERGUNTA_DEPENDENCY_DETAILED_TABLES.md
- [ ] Revisar Ficheiros Afetados
- [ ] Revisar Endpoints
- [ ] Preparar plano de implementação

### QA/Testers
- [ ] Ler PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md
- [ ] Consultar PERGUNTA_DEPENDENCY_DETAILED_TABLES.md
- [ ] Revisar Riscos
- [ ] Revisar Checklist de Migração
- [ ] Preparar plano de testes

---

## 🎓 GLOSSÁRIO

### Pergunta
Modelo genérico de questões sem associação a torneios. Usado em testes básicos.

### Questao*
Modelos específicos (QuestaoMatematica, QuestaoProgramacao, QuestaoIngles) com associação a torneios.

### Endpoint
URL de API que retorna dados (ex: `/perguntas/:area`)

### Componente
Elemento React que renderiza UI (ex: Teste.jsx)

### Hook
Função React que encapsula lógica (ex: useQuiz)

### Rota
Caminho URL que mapeia para um componente (ex: `/teste-seu-conhecimento`)

### Torneio_ID
Chave estrangeira que associa questões a torneios

### Migração
Processo de mover dados de um modelo para outro

---

## 📞 INFORMAÇÕES IMPORTANTES

### Status da Auditoria
- ✅ Análise Completa
- ✅ Documentação Detalhada
- ❌ Nenhuma Implementação Realizada
- ❌ Nenhuma Alteração no Código

### Escopo da Auditoria
- ✅ Modelo Pergunta
- ✅ Endpoints relacionados
- ✅ Componentes frontend
- ✅ Rotas
- ✅ Dependências
- ✅ Riscos
- ✅ Estratégias de migração

### Não Incluído
- ❌ Testes de performance
- ❌ Testes de segurança
- ❌ Análise de código estático
- ❌ Testes de carga

---

## 📝 NOTAS IMPORTANTES

1. **Nenhuma alteração foi feita** - Apenas análise e diagnóstico
2. **Documentos são complementares** - Ler todos para compreensão completa
3. **Recomendações são baseadas em análise técnica** - Podem ser ajustadas conforme necessário
4. **Implementação deve ser cuidadosa** - Risco de quebra crítica

---

## 🔗 REFERÊNCIAS CRUZADAS

### Se Você Quer Saber...

**"Qual é o impacto de remover Pergunta?"**
→ Leia: PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md (Seção 5)

**"Quais ficheiros preciso alterar?"**
→ Leia: PERGUNTA_MODEL_DEPENDENCY_AUDIT.md (Seção 11)

**"Qual é a estrutura de dados?"**
→ Consulte: PERGUNTA_DEPENDENCY_DETAILED_TABLES.md (Tabelas 7-8)

**"Como migrar?"**
→ Leia: PERGUNTA_MODEL_DEPENDENCY_AUDIT.md (Seção 8)

**"Qual é o risco?"**
→ Leia: PERGUNTA_MODEL_DEPENDENCY_AUDIT.md (Seção 7)

**"O que é recomendado?"**
→ Leia: PERGUNTA_DEPENDENCY_EXECUTIVE_SUMMARY.md (Seção 9)

---

## 📊 ESTATÍSTICAS

- **Tempo de Auditoria:** Completo
- **Ficheiros Analisados:** 15
- **Endpoints Mapeados:** 5
- **Componentes Identificados:** 5
- **Riscos Identificados:** 6
- **Estratégias Propostas:** 3
- **Páginas de Documentação:** ~50

---

**FIM DO ÍNDICE**

Nenhuma alteração foi feita. Apenas análise e mapeamento de dependências.

Aguardando feedback e instruções para próximas ações.

