# SUMÁRIO VISUAL - DEPENDÊNCIAS DO MODELO PERGUNTA

**Data:** 22 de Maio de 2026  
**Formato:** Diagramas e Visualizações

---

## 1. ÁRVORE DE DEPENDÊNCIAS

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODELO PERGUNTA                              │
│                  (BackEnd/models/Pergunta.js)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐    ┌──────────────┐  ┌──────────────┐
   │index.js │    │modelMapper.js│  │seedPergunta  │
   │(Backend)│    │(Backend)     │  │Quiz.js       │
   └────┬────┘    └──────────────┘  └──────────────┘
        │
        ├─────────────────────────────────────────┐
        │                                         │
        ▼                                         ▼
   ┌──────────────────┐              ┌──────────────────┐
   │GET /perguntas    │              │GET /api/quiz     │
   │    :area         │              │    :area         │
   └────────┬─────────┘              └────────┬─────────┘
            │                                 │
            ▼                                 ▼
   ┌──────────────────┐              ┌──────────────────┐
   │Teste.jsx         │              │useQuiz Hook      │
   │(Frontend)        │              │(Frontend)        │
   └────────┬─────────┘              └────────┬─────────┘
            │                                 │
            ▼                                 ▼
   ┌──────────────────┐              ┌──────────────────┐
   │Rota:             │              │Qualquer          │
   │/teste-seu-       │              │componente que    │
   │conhecimento      │              │use o hook        │
   └──────────────────┘              └──────────────────┘
```

---

## 2. MAPA DE COMPONENTES

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENTS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Teste.jsx                                                │  │
│  │ └─ GET /perguntas/:area                                  │  │
│  │    └─ Rota: /teste-seu-conhecimento                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ useQuiz Hook                                             │  │
│  │ └─ GET /api/quiz/:area                                   │  │
│  │    └─ Usado por: Qualquer componente                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ MatematicaOriginal.jsx                                   │  │
│  │ └─ GET /torneios/:id/questoes/matematica                 │  │
│  │    └─ Rota: /matematica-original/:username               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ProgramacaoOriginal.jsx                                  │  │
│  │ └─ GET /torneios/:id/questoes/programacao                │  │
│  │    └─ Rota: /programacao-original/:username              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ InglesOriginal.jsx                                       │  │
│  │ └─ GET /torneios/:id/questoes/ingles                     │  │
│  │    └─ Rota: /ingles-original/:username                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. FLUXO DE DADOS

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE DADOS                               │
└─────────────────────────────────────────────────────────────────┘

TESTE BÁSICO:
─────────────
Usuário
  │
  ├─ Acessa /teste-seu-conhecimento
  │
  ├─ Teste.jsx carrega
  │
  ├─ Faz GET /perguntas/:area
  │
  ├─ Backend retorna questões de Pergunta
  │
  ├─ Teste.jsx exibe questões
  │
  └─ Usuário responde

TORNEIO:
────────
Usuário
  │
  ├─ Acessa /matematica-original/:username
  │
  ├─ MatematicaOriginal.jsx carrega
  │
  ├─ Faz GET /torneios/:id/questoes/matematica
  │
  ├─ Backend retorna questões de QuestaoMatematica
  │
  ├─ MatematicaOriginal.jsx exibe questões
  │
  └─ Usuário responde
```

---

## 4. MATRIZ DE IMPACTO

```
┌─────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE IMPACTO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  REMOVER PERGUNTA MODEL                                         │
│  ├─ Endpoints quebram: 2 (CRÍTICO)                              │
│  ├─ Componentes quebram: 2 (CRÍTICO)                            │
│  ├─ Hooks quebram: 1 (CRÍTICO)                                  │
│  ├─ Rotas quebram: 1 (CRÍTICO)                                  │
│  ├─ Dados perdidos: Todos em perguntas (CRÍTICO)                │
│  └─ Impacto Total: CRÍTICO ❌                                   │
│                                                                 │
│  REMOVER /perguntas/:area                                       │
│  ├─ Teste.jsx quebra (CRÍTICO)                                  │
│  ├─ Rota /teste-seu-conhecimento quebra (CRÍTICO)               │
│  └─ Impacto Total: CRÍTICO ❌                                   │
│                                                                 │
│  REMOVER /api/quiz/:area                                        │
│  ├─ useQuiz Hook quebra (CRÍTICO)                               │
│  └─ Impacto Total: CRÍTICO ❌                                   │
│                                                                 │
│  REMOVER /torneios/:id/questoes/:disciplina                     │
│  ├─ 3 componentes quebram (CRÍTICO)                             │
│  ├─ 3 rotas quebram (CRÍTICO)                                   │
│  └─ Impacto Total: CRÍTICO ❌                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. DOIS SISTEMAS PARALELOS

```
┌─────────────────────────────────────────────────────────────────┐
│                  DOIS SISTEMAS DE QUESTÕES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SISTEMA 1: GENÉRICO (Pergunta)                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Modelo: Pergunta                                         │  │
│  │ Tabela: perguntas                                        │  │
│  │ Torneio_ID: ❌ NÃO TEM                                   │  │
│  │ Opções: Colunas (opcao_a, opcao_b, opcao_c, opcao_d)    │  │
│  │ Resposta: ENUM ('a', 'b', 'c', 'd')                      │  │
│  │ Endpoints: /perguntas/:area, /api/quiz/:area             │  │
│  │ Componentes: Teste.jsx, useQuiz Hook                     │  │
│  │ Uso: Testes básicos                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  SISTEMA 2: ESPECÍFICO (Questao*)                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Modelos: QuestaoMatematica, QuestaoProgramacao, etc.     │  │
│  │ Tabelas: questoes_matematica, questoes_programacao, etc. │  │
│  │ Torneio_ID: ✅ TEM                                       │  │
│  │ Opções: JSON array                                       │  │
│  │ Resposta: TEXT                                           │  │
│  │ Endpoints: /torneios/:id/questoes/:disciplina            │  │
│  │ Componentes: MatematicaOriginal, etc.                    │  │
│  │ Uso: Torneios                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  PROBLEMA: Dois sistemas paralelos causam confusão             │
│  SOLUÇÃO: Unificar em um único sistema (futuro)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. FICHEIROS AFETADOS

```
┌─────────────────────────────────────────────────────────────────┐
│                    FICHEIROS AFETADOS (15)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BACKEND (5)                                                    │
│  ├─ BackEnd/models/Pergunta.js                                  │
│  ├─ BackEnd/index.js                                            │
│  ├─ BackEnd/utils/modelMapper.js                                │
│  ├─ BackEnd/scripts/seedPerguntasQuiz.js                         │
│  └─ BackEnd/controllers/GenericController.js                    │
│                                                                 │
│  FRONTEND (10)                                                  │
│  ├─ FrontEnd/src/Paginas/Secundarias/Teste.jsx                  │
│  ├─ FrontEnd/src/hooks/useQuiz.js                               │
│  ├─ FrontEnd/src/Paginas/Tercearios.jsx/ModeloOriginal/         │
│  │  ├─ MatematicaOriginal.jsx                                   │
│  │  ├─ ProgramacaoOriginal.jsx                                  │
│  │  └─ InglesOriginal.jsx                                       │
│  ├─ FrontEnd/src/App.jsx                                        │
│  ├─ FrontEnd/src/Paginas/Secundarias/Home.jsx                   │
│  ├─ FrontEnd/src/Paginas/Secundarias/Layout.jsx                 │
│  ├─ FrontEnd/src/Paginas/Secundarias/NotFoundPage.jsx           │
│  └─ FrontEnd/src/Paginas/Secundarias/Torneios.jsx               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. CRONOGRAMA DE MIGRAÇÃO (Se Necessário)

```
┌─────────────────────────────────────────────────────────────────┐
│                  CRONOGRAMA DE MIGRAÇÃO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FASE 1: PREPARAÇÃO (2h)                                        │
│  ├─ Backup de dados                                             │
│  ├─ Criar script de migração                                    │
│  └─ Testar em staging                                           │
│                                                                 │
│  FASE 2: MIGRAÇÃO (2h)                                          │
│  ├─ Executar migração                                           │
│  ├─ Validar dados                                               │
│  └─ Sincronizar                                                 │
│                                                                 │
│  FASE 3: ATUALIZAÇÃO (4h)                                       │
│  ├─ Atualizar BackEnd/index.js                                  │
│  ├─ Atualizar Teste.jsx                                         │
│  ├─ Atualizar useQuiz.js                                        │
│  └─ Atualizar outros componentes                                │
│                                                                 │
│  FASE 4: LIMPEZA (2h)                                           │
│  ├─ Remover Pergunta.js                                         │
│  ├─ Remover endpoints antigos                                   │
│  └─ Atualizar modelMapper.js                                    │
│                                                                 │
│  FASE 5: TESTES (4h)                                            │
│  ├─ Testes unitários                                            │
│  ├─ Testes de integração                                        │
│  ├─ Testes de regressão                                         │
│  └─ Testes de performance                                       │
│                                                                 │
│  TOTAL: 14-16 horas                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. RECOMENDAÇÃO VISUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECOMENDAÇÃO FINAL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ MANTER PERGUNTA (Sem Alterações)                            │
│                                                                 │
│  Razões:                                                        │
│  ├─ Pergunta está em uso em endpoints públicos                  │
│  ├─ Remover causaria quebra crítica                             │
│  ├─ Dois sistemas paralelos já existem                          │
│  ├─ Migração é complexa e arriscada                             │
│  └─ Benefício não justifica o risco                             │
│                                                                 │
│  Próximos Passos:                                               │
│  ├─ Documentar ambos os sistemas                                │
│  ├─ Criar guia de qual usar em cada caso                        │
│  ├─ Considerar unificação em futuro                             │
│  └─ Implementar sincronização se necessário                     │
│                                                                 │
│  Risco de Não Fazer Nada: NENHUM ✅                             │
│  Risco de Remover: CRÍTICO ❌                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. CHECKLIST DE SEGURANÇA

```
┌─────────────────────────────────────────────────────────────────┐
│                  CHECKLIST DE SEGURANÇA                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ANTES DE QUALQUER ALTERAÇÃO:                                   │
│  ☐ Backup completo de dados                                     │
│  ☐ Teste em staging                                             │
│  ☐ Validação de todos os endpoints                              │
│  ☐ Teste de todos os componentes                                │
│  ☐ Plano de rollback                                            │
│  ☐ Comunicação com stakeholders                                 │
│                                                                 │
│  SE REMOVER PERGUNTA (NÃO RECOMENDADO):                         │
│  ☐ Migração de dados testada                                    │
│  ☐ Todos os endpoints atualizados                               │
│  ☐ Todos os componentes atualizados                             │
│  ☐ Testes completos em staging                                  │
│  ☐ Deploy gradual (canary)                                      │
│  ☐ Monitoramento ativo                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. LEGENDA

```
✅ = Funcionando / Recomendado / Seguro
❌ = Quebrado / Não Recomendado / Risco
⚠️  = Aviso / Médio Risco
🔴 = Crítico
🟠 = Alto
🟡 = Médio
🟢 = Baixo
```

---

**FIM DO SUMÁRIO VISUAL**

Nenhuma alteração foi feita. Apenas análise e visualização de dependências.

