# 🎯 FLUXO COMPLETO: Questões Colaboradores → Blocos → Torneios/Testes (v2)

**Data**: 8 de Junho de 2026  
**Versão**: 2.0 - Com Nova Estrutura de Abas  
**Status**: ✅ FINALIZADO E OTIMIZADO

---

## 📋 ÍNDICE

1. [Fluxo Completo em 4 Fases](#fluxo-completo-em-4-fases)
2. [Estrutura das Abas](#estrutura-das-abas)
3. [Endpoints Utilizados](#endpoints-utilizados)
4. [Testes Passo a Passo](#testes-passo-a-passo)
5. [Status Final](#status-final)

---

## 🔄 FLUXO COMPLETO EM 4 FASES

### FASE 1: COLABORADOR CRIA QUESTÃO ✍️
```
Colaborador → "Minhas Questões"
  ↓
Clica "Criar Questão"
  ↓
Preenche:
- Título
- Descrição
- Disciplina (Matemática/Inglês/Programação)
- Tipo (Múltipla Escolha/Texto/Código)
- Dificuldade (Fácil/Médio/Difícil)
- Opções e Resposta Correta
  ↓
POST /api/questoes (status_aprovacao='pendente')
  ↓
✅ Questão criada (status: PENDENTE)
```

---

### FASE 2: ADMIN REVISA E APROVA 👀
```
Admin → "Questões Pendentes" (ou "Revisão de Questões")
  ↓
Vê questão do colaborador (status: pendente)
  ↓
Revisa conteúdo pedagógico
  ↓
Aprova:
  PATCH /api/questoes/{id}/aprovacao (status_aprovacao='aprovada')
  ↓
❌ OU REJEITA:
  PATCH /api/questoes/{id}/aprovacao (status_aprovacao='rejeitada', motivo)
  ↓
✅ Questão aprovada (status: APROVADA)
```

---

### FASE 3: ADMIN ENVIA PARA TORNEIOS OU TESTES 📤
```
Admin → "Questões dos Colaboradores"
  ↓
Vê questão aprovada (status: aprovada)
  ↓
Expandir para ver detalhes
  ↓
Clica "Ver Autor" para confirmar "Criada por: [Nome Colaborador]"
  ↓

═══ OPÇÃO A: ENVIAR A TORNEIOS 🏆 ═══
  ↓
Clica "🏆 Enviar a Torneio"
  ↓
Modal: "Questão: [Título] | Criada por: [Nome]"
  ↓
Clica "Confirmar"
  ↓
POST /api/questoes (novo record)
{
  titulo, descricao, disciplina, tipo, dificuldade,
  opcoes, resposta_correta, pontos, autor_id,
  bloco_id: null  ← IMPORTANTE: Sem bloco inicialmente
}
  ↓
Event: 'questaoAdicionadaTorneio' dispara
  ↓
✅ Questão aparece em "Questões de Torneios" → "Visualizar Todas"

═══ OPÇÃO B: ENVIAR A TESTES 📚 ═══
  ↓
Clica "📚 Enviar a Teste"
  ↓
Modal: "Questão: [Título] | Criada por: [Nome]"
  ↓
Clica "Confirmar"
  ↓
POST /api/teste-conhecimento/questoes (novo model independente)
{
  enunciado, opcoes, resposta_correta, dificuldade,
  categoria, pontos, ativo: true,
  origem: 'colaborador', autor_id
}
  ↓
Event: 'questaoAdicionadaTeste' dispara
  ↓
✅ Questão aparece em "Questões dos Testes" → "Visualizar Todas"
```

---

### FASE 4: ADMIN GERENCIA BLOCOS E VINCULA 📦
```
═══ CENÁRIO TORNEIOS: 5-30 questões obrigatórias ═══

Admin → "Questões de Torneios" → "Gerenciar Blocos" (ABA PRINCIPAL)
  ↓
Vê BlocoQuestoesManager inline
  ↓
Clica "Criar Bloco"
  ↓
Preenche:
- Título (ex: "Álgebra Intermediária")
- Descrição (opcional)
- Disciplina
- Dificuldade
- Status (Rascunho/Publicado)
  ↓
Modal → Criar
  ↓
✅ Bloco criado (vazio)
  ↓
Expande bloco
  ↓
Clica "Adicionar Questão"
  ↓
Busca/seleciona questão individual (ex: "Q1 - Álgebra A")
  ↓
POST /api/blocos/{id}/questoes (adiciona questão ao bloco)
  ↓
✅ Questão adicionada ao bloco
  ↓
Repete até: 5-30 questões no bloco
  ↓
Publica bloco (Status: Publicado)
  ↓
Clica "Associar a Torneios"
  ↓
Checkbox: seleciona torneio(s) ativo(s)
  ↓
POST /api/blocos/{id}/torneios (vincula bloco a torneio)
  ↓
✅ Bloco vinculado a torneio
  ↓
Torneio inicia com questões APENAS deste bloco (5-30, não 1!)


═══ CENÁRIO TESTES: Sem limite, opcional ═══

Admin → "Questões dos Testes" → "Gerenciar Blocos" (ABA PRINCIPAL)
  ↓
Clica "Criar Bloco" (opcional)
  ↓
Preenche dados do bloco temático
  ↓
✅ Bloco criado
  ↓
Adiciona questões (SEM LIMITE MÍNIMO)
  ↓
✅ Questões podem ser usadas:
   - Diretamente em testes (sem bloco)
   - Agrupadas em blocos (opcional)
```

---

## 🎨 ESTRUTURA DAS ABAS

### ESTRUTURA VISUAL - TORNEIOS
```
┌─────────────────────────────────────────────────┐
│  PAINEL ADMINISTRATIVO                          │
│  ─────────────────────────────────────────────  │
│  📦 Questões de Torneios                        │
│     "Gerencie blocos (5-30) e questões..."      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  [🔍 Pesquisar questões ou blocos...]           │
└─────────────────────────────────────────────────┘

┌──────────────────┬────────────────────────────┐
│ NAVEGAÇÃO        │ CONTEÚDO PRINCIPAL         │
├──────────────────┼────────────────────────────┤
│                  │                            │
│ 📦 Gerenciar     │ ┌──────────────────────┐  │
│    Blocos ✅     │ │ BLOCOQUESTÕESMANAGER │  │
│ (DEFAULT)        │ ├──────────────────────┤  │
│                  │ │ Criar Bloco [+]      │  │
│                  │ │ Editar Bloco [✏️]    │  │
│ 👁️ Visualizar   │ │ Deletar Bloco [🗑️]   │  │
│    Todas         │ │                      │  │
│                  │ │ [Bloco 1]            │  │
│                  │ │ ├─ 7 questões        │  │
│                  │ │ ├─ Matemática        │  │
│                  │ │ ├─ Médio             │  │
│                  │ │ └─ [Adicionar Q...]  │  │
│                  │ │                      │  │
│                  │ │ [Bloco 2]            │  │
│                  │ │ ├─ 12 questões       │  │
│                  │ │ └─ [...]             │  │
│                  │ └──────────────────────┘  │
│                  │                            │
│                  │ Stats:                     │
│                  │ [Total: 2] [Pub: 2]       │
│                  │                            │
└──────────────────┴────────────────────────────┘

═════════════════════════════════════════════════

ABA "VISUALIZAR TODAS":
┌────────────────────────────────────────────────┐
│ 👁️ VISUALIZAR TODAS AS QUESTÕES                │
│    Questões individuais criadas + colaboradores │
│                        [+ Criar Questão]       │
│                                                 │
│ ┌──────────────────────────────────────────┐  │
│ │ Título │ Disc│ Dif│ Origem │ Ações       │  │
│ ├──────────────────────────────────────────┤  │
│ │ Q1     │ Mat │ Fá │👤 João │ 🔗 ✏️ 🗑️   │  │
│ │ Q2     │ Prog│ Mé │✍️ Admin│ 🔗 ✏️ 🗑️   │  │
│ │ Q3     │ Ing │ Dif│👤 Maria│ 🔗 ✏️ 🗑️   │  │
│ │ ...    │    │   │   │        │           │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ Stats:                                         │
│ [Total: 42] [Banco: 28] [Criadas: 14]         │
└────────────────────────────────────────────────┘
```

### ESTRUTURA VISUAL - TESTES
```
Mesma estrutura que TORNEIOS, mas:
- BlocoQuestoesManager com contexto="teste"
- Sem limite mínimo/máximo de questões
- Blocos são opcionais
```

---

## 📡 ENDPOINTS UTILIZADOS

### 1. COLABORADORES CRIAM
```
POST /api/questoes
Body: { titulo, descricao, disciplina, tipo, dificuldade, 
        opcoes, resposta_correta, pontos, autor_id: {id_colaborador} }
Response: { sucesso: true, dados: {...} }
```

### 2. ADMIN REVISA
```
PATCH /api/questoes/{id}/aprovacao
Body: { status_aprovacao: 'aprovada' | 'rejeitada', motivo }
Response: { sucesso: true, dados: {...} }
```

### 3. ADMIN VIRA QUESTÕES APROVADAS
```
GET /api/questoes?status_aprovacao=aprovada&limit=100
Response: { sucesso: true, dados: { questoes: [...] } }
```

### 4. ADMIN ENVIA A TORNEIOS
```
POST /api/questoes (novo record)
Body: { titulo, descricao, disciplina, tipo, dificuldade,
        opcoes, resposta_correta, pontos, autor_id, bloco_id: null }
Response: { sucesso: true, dados: {...} }
```

### 5. ADMIN ENVIA A TESTES
```
POST /api/teste-conhecimento/questoes
Body: { enunciado, opcoes, resposta_correta, dificuldade,
        categoria, pontos, ativo: true, origem, autor_id }
Response: { success: true, data: {...} }
```

### 6. LISTAR BLOCOS
```
GET /api/blocos?status=publicado
Response: { sucesso: true, dados: [...] }
```

### 7. ADICIONAR QUESTÃO A BLOCO
```
POST /api/blocos/{blocoId}/questoes
Body: { questao_id }
Response: { sucesso: true, dados: {...} }
```

### 8. ASSOCIAR BLOCO A TORNEIO
```
POST /api/blocos/{blocoId}/torneios
Body: { torneio_id }
Response: { sucesso: true, dados: {...} }
```

---

## 🧪 TESTES PASSO A PASSO

### TESTE 1: FLUXO COMPLETO TORNEIOS

```
1. ✅ Colaborador cria questão
   - Acessa: Minhas Questões
   - Clica: "Criar Questão"
   - Preenche: Título="Qual é 2+2?"
   - Salva: POST /api/questoes
   - Verifica: Status=pendente ✓

2. ✅ Admin aprova
   - Acessa: Questões Pendentes
   - Clica: Expandir questão
   - Clica: "Aprovar"
   - Verifica: Status=aprovada ✓

3. ✅ Admin envia a Torneio
   - Acessa: Questões dos Colaboradores
   - Clica: "🏆 Enviar a Torneio"
   - Modal confirma: "Criada por: João Silva"
   - Clica: "Confirmar"
   - Verifica: POST /api/questoes (novo record) ✓

4. ✅ Admin vê questão em Torneios
   - Acessa: Questões de Torneios
   - Clica: "Visualizar Todas" (aba secundária)
   - Verifica: Questão aparece na tabela ✓
   - Verifica: Origem="👤 João Silva" ✓

5. ✅ Admin agrupa em bloco
   - Clica: "Gerenciar Blocos" (aba principal)
   - Clica: "Criar Bloco"
   - Preenche: Título="Álgebra Intermediária"
   - Salva: POST /api/blocos
   - Verifica: Bloco criado vazio ✓

6. ✅ Admin adiciona questões ao bloco
   - Expande bloco criado
   - Clica: "Adicionar Questão"
   - Busca: "Qual é 2+2?"
   - Clica: Seleciona questão
   - Verifica: Questão adicionada ao bloco ✓
   - Repete até: 5 questões no bloco

7. ✅ Admin publica e vincula
   - Status: Publica bloco
   - Clica: "Associar a Torneios"
   - Checkbox: Seleciona "Torneio A" (ativo)
   - Salva: POST /api/blocos/{id}/torneios
   - Verifica: Bloco vinculado ✓

8. ✅ RESULTADO FINAL
   - Torneio A inicia
   - Questões vêm APENAS do bloco (5-30, não 1)
   - Rastreabilidade: "Criada por João Silva" ✓
```

### TESTE 2: FLUXO COMPLETO TESTES

```
Mesmas etapas 1-4, mas:

5. ✅ Admin agrupa em bloco OPCIONAL
   - Clica: "Gerenciar Blocos"
   - Pode criar bloco OU deixar solta
   - Sem limite mínimo

6. ✅ RESULTADO FINAL
   - Teste pode usar questão diretamente
   - OU agrupada em bloco temático
   - Sem obrigatoriedade
```

### TESTE 3: VERIFICAR DADOS

```
Backend - Questão de Torneio:
  GET /api/questoes?status_aprovacao=aprovada
  ├─ bloco_id = null (ainda não agrupada) ✓
  ├─ autor_id = {ID do colaborador} ✓
  └─ status_aprovacao = 'aprovada' ✓

Backend - Questão de Teste:
  GET /api/teste-conhecimento/questoes?ativo=true
  ├─ ativo = true ✓
  ├─ autor_id = {ID do colaborador} ✓
  └─ origem = 'colaborador' ✓

Frontend - Coluna "Origem":
  ├─ "👤 João Silva" (colaborador) ✓
  └─ "✍️ Admin" (criada admin) ✓
```

---

## ✨ STATUS FINAL

### ✅ IMPLEMENTADO E TESTÁVEL

#### Fase 1: Colaborador Cria
- ✅ Endpoint POST /api/questoes
- ✅ Status pendente/aprovada/rejeitada
- ✅ Rastreabilidade de autor

#### Fase 2: Admin Aprova
- ✅ Aba "Questões Pendentes"
- ✅ Endpoint PATCH /api/questoes/{id}/aprovacao
- ✅ Motivo de rejeição armazenado

#### Fase 3: Admin Envia
- ✅ Botões "🏆 Enviar a Torneio" e "📚 Enviar a Teste"
- ✅ Modais com confirmação + "Criada por"
- ✅ Handlers reais (POST para ambos endpoints)
- ✅ Events disparam auto-refresh
- ✅ Sem endpoints faltantes

#### Fase 4: Admin Gerencia Blocos
- ✅ BlocoQuestoesManager como aba principal
- ✅ Torneios: 5-30 questões obrigatórias
- ✅ Testes: Sem limite, opcional
- ✅ Visibilidade clara: Origem (Colaborador/Admin)
- ✅ Aba secundária "Visualizar Todas" para referência

### 🎯 WORKFLOW AGORA

```
Colaborador → Admin Aprova → Admin Envia → Admin Agrupa → Torneio/Teste
    ✍️          👀           📤              📦           🏆📚
  (Pendente) (Aprova)  (Cria novo)   (Bloco)        (Executa)
```

### 🚀 PRONTO PARA PRODUÇÃO

Todos os fluxos funcionam end-to-end com:
- ✅ Persistência real (backend)
- ✅ Rastreabilidade completa
- ✅ Auto-refresh sem pisca
- ✅ UX otimizada
- ✅ Sem sobreposição de funcionalidades

**Implementação finalizada com sucesso!** 🎉
