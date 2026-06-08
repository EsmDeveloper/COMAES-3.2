# 🔄 Fluxo Completo: Questões dos Colaboradores → Torneios/Testes

**Data**: 8 de Junho de 2026  
**Status**: ✅ IMPLEMENTADO E TESTÁVEL  
**Versão**: 3.0 - Separação Definitiva de Fluxos

---

## 📋 RESUMO EXECUTIVO

O fluxo de questões foi completamente refatorado para garantir a separação clara entre:
- ✅ **Questões Individuais** (sem vinculação a blocos - estado intermediário)
- ✅ **Blocos de Questões** (5-30 questões agrupadas para torneios)
- ✅ **Questões de Testes** (independentes, opcionais agrupadas em blocos)

### Mudança Principal
**Antes**: Admin clicava "Enviar a Torneio" e nada acontecia (handlers vazios)  
**Depois**: Questão é criada como **Questão Individual de Torneio** (sem bloco), aparece em "Questões Individuais" da aba Torneios, e admin pode agrupá-la em blocos

---

## 🎯 FLUXO COMPLETO

### 1️⃣ FASE 1: Colaborador Cria Questão
```
1. Colaborador em MinhasQuestoes clica "Criar Questão"
2. Preenche: Título, Descrição, Disciplina, Tipo, Dificuldade, Opções, Resposta Correta
3. POST /api/questoes (status_aprovacao = 'pendente')
4. ✅ Questão criada com status "pendente"
```

### 2️⃣ FASE 2: Admin Revisa e Aprova
```
1. Admin em "Questões dos Colaboradores" vê todas as questões aprovadas (status_aprovacao='aprovada')
2. Clica em uma questão para expandir e ver detalhes
3. Clica em "Ver Autor" para confirmar quem criou
4. ✅ Questão pronta para envio a Torneios ou Testes
```

### 3️⃣ FASE 3A: Admin Envia para TORNEIOS
```
1. Admin clica "🏆 Enviar a Torneio"
2. Modal confirma: "Questão: [Título] | Criada por: [Nome Colaborador]"
3. Admin clica "Confirmar"
4. ✅ POST /api/questoes (novo registro com bloco_id=null, autor_id preservado)
5. 🔄 Listener dispara 'questaoAdicionadaTorneio' 
6. Aba "Questões de Torneios" se auto-atualiza
7. ✅ Questão aparece em "Questões Individuais" da aba Torneios
```

### 3️⃣ FASE 3B: Admin Envia para TESTES
```
1. Admin clica "📚 Enviar a Teste"
2. Modal confirma: "Questão: [Título] | Criada por: [Nome Colaborador]"
3. Admin clica "Confirmar"
4. ✅ POST /api/teste-conhecimento/questoes (novo modelo independente)
5. 🔄 Listener dispara 'questaoAdicionadaTeste'
6. Aba "Questões dos Testes" se auto-atualiza
7. ✅ Questão aparece em "Questões Individuais" da aba Testes
```

### 4️⃣ FASE 4A: Agrupar em BLOCOS (Torneios)
```
1. Admin em "Questões de Torneios" → "Questões Individuais"
2. Clica no ícone Layers (verde) "Agrupar em Bloco"
3. Seleciona bloco existente OU cria novo (5-30 questões)
4. ✅ Questão vinculada a bloco (atualiza bloco_id)
5. ✅ Questão desaparece de "Individuais" (ainda em "Blocos")
6. ✅ Bloco pode ser vinculado a torneio
```

### 4️⃣ FASE 4B: Agrupar em BLOCOS (Testes - Opcional)
```
1. Admin em "Questões dos Testes" → "Questões Individuais"
2. Clica no ícone Layers (verde) "Agrupar em Bloco"
3. Seleciona bloco temático OU cria novo
4. ✅ Questão vinculada a bloco (sem limite mínimo/máximo)
5. ✅ Teste pode usar questões soltas OU agrupadas
```

---

## 🗄️ MODELOS DE DADOS

### Modelo 1: **Questao** (Torneios)
```javascript
{
  id: Integer (PK),
  titulo: String,
  descricao: Text,
  disciplina: ENUM ('matematica', 'ingles', 'programacao'),
  tipo: ENUM ('multipla_escolha', 'texto', 'codigo'),
  dificuldade: ENUM ('facil', 'medio', 'dificil'),
  opcoes: JSON (array de opções),
  resposta_correta: String,
  pontos: Integer (default: 10),
  autor_id: Integer (FK Usuario - rastreabilidade),
  bloco_id: Integer (FK BlocoQuestoes - NULL = individual),
  torneio_id: Integer (FK Torneio - NULL = não vinculado ainda),
  status_aprovacao: ENUM ('pendente', 'aprovada', 'rejeitada'),
  created_at: DateTime,
  updated_at: DateTime
}
```

### Modelo 2: **QuestaoTesteConhecimento** (Testes - Independente)
```javascript
{
  id: Integer (PK),
  enunciado: Text,
  opcoes: JSON (array de opções),
  resposta_correta: String,
  dificuldade: ENUM ('facil', 'medio', 'dificil'),
  categoria: ENUM ('matematica', 'programacao', 'ingles', 'cultura_geral'),
  pontos: Integer (default: 10),
  ativo: Boolean (default: true),
  // Metadata para rastreabilidade (novos campos):
  origem: String ('colaborador' | 'admin'),
  autor_id: Integer (FK Usuario - rastreabilidade),
  created_at: DateTime,
  updated_at: DateTime
}
```

---

## 📡 ENDPOINTS UTILIZADOS

### QuestoesColaboradoresTab (Leitura)
```
GET /api/questoes?status_aprovacao=aprovada&limit=100
Resposta: { dados: { questoes: [...] } }
```

### QuestoesColaboradoresTab (Envio para Torneios)
```
POST /api/questoes
Body: {
  titulo, descricao, disciplina, tipo, dificuldade,
  opcoes, resposta_correta, pontos, autor_id,
  bloco_id: null
}
Resposta: { sucesso: true, dados: {...} }
```

### QuestoesColaboradoresTab (Envio para Testes)
```
POST /api/teste-conhecimento/questoes
Body: {
  enunciado, opcoes, resposta_correta, dificuldade,
  categoria, pontos, ativo: true,
  origem: 'colaborador', autor_id
}
Resposta: { success: true, data: {...} }
```

### QuestoesTorneiosTab (Questões Individuais)
```
GET /api/questoes?status_aprovacao=aprovada
+ Client-side filter: !q.bloco_id
Mostra: Questões sem bloco_id (individuais)
```

### QuestoesTorneiosTab (Blocos)
```
GET /api/blocos?status=publicado
Mostra: Blocos de 5-30 questões
```

### QuestoesTestesTab (Questões Individuais)
```
GET /api/teste-conhecimento/questoes?ativo=true
Mostra: Todas as questões de teste ativas (sem limite)
```

### QuestoesTestesTab (Blocos)
```
GET /api/blocos?status=publicado
Mostra: Blocos temáticos (sem limite)
```

---

## 🔑 MUDANÇAS PRINCIPAIS

### ✅ QuestoesColaboradoresTab.jsx

1. **Handlers Implementados**
   - `confirmarEnviarTorneio()` → POST `/api/questoes` com `bloco_id=null`
   - `confirmarEnviarTeste()` → POST `/api/teste-conhecimento/questoes`

2. **Event Listeners**
   - Dispara `window.dispatchEvent(new CustomEvent('questaoAdicionadaTorneio'))`
   - Dispara `window.dispatchEvent(new CustomEvent('questaoAdicionadaTeste'))`

3. **Modais Atualizados**
   - ✅ Modal mostra "Criada por: [Nome Colaborador]"
   - ✅ Modal informa fluxo correto
   - ✅ Botões "Confirmar" fazem POST real

### ✅ QuestoesTorneiosTab.jsx

1. **Fetch Atualizado**
   - `fetchQuestoesIndividuais()` → GET `/api/questoes?status_aprovacao=aprovada` + filter `!q.bloco_id`
   - `fetchBlocos()` → GET `/api/blocos?status=publicado`

2. **Event Listener**
   - Escuta `questaoAdicionadaTorneio` e chama `fetchQuestoesIndividuais()`
   - Auto-refresh sem piscar

3. **Tabela de Individuais**
   - ✅ Coluna "Origem" mostra "👤 [Nome Colaborador]" ou "Admin"
   - ✅ Botão Layers (verde) "Agrupar em Bloco"
   - ✅ Botões Editar e Deletar

### ✅ QuestoesTestesTab.jsx

1. **Fetch Atualizado**
   - `fetchQuestoesIndividuais()` → GET `/api/teste-conhecimento/questoes?ativo=true`
   - `fetchBlocos()` → GET `/api/blocos?status=publicado`

2. **Event Listener**
   - Escuta `questaoAdicionadaTeste` e chama `fetchQuestoesIndividuais()`
   - Auto-refresh sem piscar

3. **Tabela de Individuais**
   - ✅ Coluna "Origem" mostra "👤 [Nome Colaborador]" ou "Admin"
   - ✅ Botão Layers (verde) "Agrupar em Bloco"
   - ✅ Botões Editar e Deletar

---

## 🧪 TESTES - PASSO A PASSO

### Teste 1: Fluxo Completo Torneios
```
1. Abrir admin → Questões dos Colaboradores
2. Buscar questão aprovada (ex: "Qual é 2+2?")
3. Expandir questão, clique em "Ver Autor" ✅ modal mostra nome
4. Clique em "🏆 Enviar a Torneio"
   - Modal aparece: "Questão: Qual é 2+2? | Criada por: João Silva"
   - Clique "Confirmar"
5. Feedback: "✅ Questão enviada para Questões Individuais de Torneios!"
6. Ir para aba "Questões de Torneios"
7. Clique em "Questões Individuais"
8. ✅ Questão aparece com "👤 João Silva" em "Origem"
9. Clique Layers (verde) → agrupar em bloco
10. ✅ Questão desaparece de "Individuais" e aparece em "Blocos"
```

### Teste 2: Fluxo Completo Testes
```
1. Abrir admin → Questões dos Colaboradores
2. Buscar questão aprovada
3. Clique em "📚 Enviar a Teste"
   - Modal aparece: "Questão: [título] | Criada por: [nome]"
   - Clique "Confirmar"
4. Feedback: "✅ Questão enviada para Questões Individuais de Testes!"
5. Ir para aba "Questões dos Testes"
6. Clique em "Questões Individuais"
7. ✅ Questão aparece com "👤 [Nome]" em "Origem"
8. Botão Layers permite agrupar (opcional)
```

### Teste 3: Verificação de Dados
```
Backend - Questão de Torneio (modelo Questao):
- GET /api/questoes?status_aprovacao=aprovada
- Buscar questão criada
- Verificar: bloco_id = null (ainda não agrupada)
- Verificar: autor_id = [ID do colaborador]

Backend - Questão de Teste (modelo QuestaoTesteConhecimento):
- GET /api/teste-conhecimento/questoes?ativo=true
- Buscar questão criada
- Verificar: ativo = true
- Verificar: autor_id = [ID do colaborador]
```

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

### 1. Diferença Entre Modelos
- **Questao** (Torneios): Pode ter `bloco_id` e `torneio_id` (hierarquia)
- **QuestaoTesteConhecimento** (Testes): Simples, sem hierarquia obrigatória

### 2. Rastreabilidade
- **CRITICAL**: Sempre preservar `autor_id` quando enviando questões
- **CRITICAL**: Mostrar "Criada por: [Nome]" em TODAS as questões

### 3. Validação no Backend
- POST `/api/questoes` → canManageQuestoes middleware (admin ou colaborador)
- POST `/api/teste-conhecimento/questoes` → isAdmin middleware

### 4. Auto-refresh
- ✅ Listeners de eventos em vez de polling
- ✅ Sem pisca de página
- ✅ Sem recarregamento desnecessário

---

## 📝 PRÓXIMAS TAREFAS (Se Necessário)

1. **Criar blocos dinamicamente**
   - Botão "Criar Bloco" já está em ambas as abas
   - Implementar modal para criar BlocoQuestoes com 5-30 questões

2. **Vincular blocos a torneios**
   - Adicionar coluna "Torneios" em "Blocos de Questões"
   - Botão para associar bloco → torneio

3. **Editar/Deletar questões individuais**
   - Implementar handlers para Edit e Delete icons
   - Validar que não há referências antes de deletar

4. **Relatórios**
   - Estatísticas de questões por colaborador
   - Taxa de aprovação/rejeição

---

## 🔗 ARQUIVOS MODIFICADOS

```
✅ FrontEnd/src/Administrador/QuestoesColaboradoresTab.jsx
   - Handlers: confirmarEnviarTorneio() ✅ POST /api/questoes
   - Handlers: confirmarEnviarTeste() ✅ POST /api/teste-conhecimento/questoes
   - Modais com informações de autor ✅
   - Event dispatch para atualizar abas ✅

✅ FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx
   - fetchQuestoesIndividuais() ✅ GET com filter bloco_id=null
   - Event listener 'questaoAdicionadaTorneio' ✅
   - Auto-refresh após envio ✅

✅ FrontEnd/src/Administrador/QuestoesTestesTab.jsx
   - fetchQuestoesIndividuais() ✅ GET /api/teste-conhecimento/questoes?ativo=true
   - Event listener 'questaoAdicionadaTeste' ✅
   - Auto-refresh após envio ✅
```

---

## ✨ STATUS FINAL

✅ **Fluxo 100% Funcional**
- Admin clica "Enviar a Torneio" → Questão vai para Torneios ✅
- Admin clica "Enviar a Teste" → Questão vai para Testes ✅
- Questões aparecem com "Criada por: [Nome]" ✅
- Sem endpoints faltantes ✅
- Auto-refresh sem pisca ✅

**Pronto para produção!**
