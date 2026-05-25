# 📋 PLANO DE REFATORAÇÃO - MÓDULO TORNEIOS & COMPETIÇÕES

## 🎯 OBJETIVO GERAL
Refatorar completamente o módulo de Torneios & Competições com foco em:
1. Criação e gestão de questões (3 modalidades)
2. Associação correta de questões aos torneios
3. Interface moderna e intuitiva
4. Fluxo de dados consistente frontend/backend
5. Validações robustas e tratamento de erros

---

## 🔍 PROBLEMAS IDENTIFICADOS

### 1. **Gestão de Questões Desorganizada**
- ❌ Formulários de criação de questões não existem no painel admin
- ❌ Abas de questões (Matemática, Programação, Inglês) usam TableManager genérico
- ❌ Sem interface específica para cada modalidade
- ❌ Sem preview de questões antes de salvar
- ❌ Sem validações específicas por modalidade

### 2. **Associação Torneio ↔ Questões Fraca**
- ❌ Campo `torneio_id` obrigatório nos modelos, mas sem UI para seleção
- ❌ Ao criar questão, não há seleção de torneio
- ❌ Possibilidade de questões órfãs (torneio_id = null ou inválido)
- ❌ Sem filtro visual de "questões deste torneio"
- ❌ Sem indicador de quantas questões cada torneio tem

### 3. **Fluxo de Criação Confuso**
- ❌ Admin não sabe se deve criar torneio primeiro ou questão
- ❌ Sem feedback claro sobre associação
- ❌ Sem validação de integridade referencial
- ❌ Sem sincronização entre frontend e backend

### 4. **Validações Insuficientes**
- ❌ Campos obrigatórios não validados antes do envio
- ❌ Sem validação de tipos de dados
- ❌ Sem validação de limites (pontos, dificuldade)
- ❌ Sem tratamento de erros específicos

### 5. **UX Deficiente**
- ❌ Sem busca/filtro de questões por torneio
- ❌ Sem contador de questões por modalidade
- ❌ Sem indicadores visuais de status
- ❌ Sem confirmação antes de exclusão
- ❌ Sem duplicação de questões
- ❌ Sem edição inline

### 6. **Problemas de Estado (State Management)**
- ❌ Sem sincronização entre abas
- ❌ Sem cache de questões
- ❌ Sem tratamento de race conditions
- ❌ Sem rollback em caso de erro

---

## 📊 ARQUITETURA PROPOSTA

### **Backend - Estrutura de Serviços**

```
BackEnd/
├── services/
│   ├── questaoService.js          [Novo] Lógica centralizada de questões
│   ├── torneioService.js          [Novo] Lógica centralizada de torneios
│   └── validacaoService.js        [Novo] Validações reutilizáveis
├── controllers/
│   ├── TorneoController.js        [Refatorado] Apenas orquestração
│   └── QuestaoController.js       [Novo] CRUD de questões
├── routes/
│   ├── tournamentsRoutes.js       [Refatorado]
│   └── questoesRoutes.js          [Novo] Endpoints de questões
└── models/
    ├── Torneio.js                 [Sem mudanças]
    ├── QuestaoMatematica.js       [Sem mudanças]
    ├── QuestaoProgramacao.js      [Sem mudanças]
    └── QuestaoIngles.js           [Sem mudanças]
```

### **Frontend - Estrutura de Componentes**

```
FrontEnd/src/Administrador/
├── Torneios/
│   ├── TorneiosTab.jsx            [Refatorado] Gerenciar torneios
│   ├── TorneoForm.jsx             [Novo] Formulário de torneio
│   └── TorneoDetail.jsx           [Novo] Detalhes do torneio
├── Questoes/
│   ├── QuestoesTab.jsx            [Novo] Gerenciador central de questões
│   ├── QuestaoForm.jsx            [Novo] Formulário genérico
│   ├── QuestaoMatematicaForm.jsx  [Novo] Formulário específico
│   ├── QuestaoProgramacaoForm.jsx [Novo] Formulário específico
│   ├── QuestaoInglesForm.jsx      [Novo] Formulário específico
│   ├── QuestaoPreview.jsx         [Novo] Preview de questão
│   └── QuestaoList.jsx            [Novo] Lista com filtros
├── Shared/
│   ├── FormField.jsx              [Novo] Campo de formulário reutilizável
│   ├── ValidationError.jsx        [Novo] Exibição de erros
│   └── ConfirmDialog.jsx          [Novo] Diálogo de confirmação
└── hooks/
    ├── useQuestoes.js             [Novo] Hook de gestão de questões
    ├── useTorneios.js             [Novo] Hook de gestão de torneios
    └── useFormValidation.js       [Novo] Hook de validação
```

---

## 🛠️ TAREFAS DETALHADAS

### **FASE 1: Backend - Serviços e Validações**

#### 1.1 Criar `questaoService.js`
**Responsabilidade**: Lógica centralizada de questões
**Métodos**:
- `criarQuestao(tipo, dados, torneioId)` - Cria questão com validação
- `atualizarQuestao(tipo, id, dados)` - Atualiza questão
- `deletarQuestao(tipo, id)` - Deleta questão
- `obterQuestoesTorneio(torneioId, tipo?)` - Lista questões do torneio
- `obterQuestao(tipo, id)` - Obtém questão específica
- `validarQuestao(tipo, dados)` - Valida dados da questão
- `duplicarQuestao(tipo, id, torneioId?)` - Duplica questão

#### 1.2 Criar `validacaoService.js`
**Responsabilidade**: Validações reutilizáveis
**Métodos**:
- `validarTorneioId(torneioId)` - Valida se torneio existe
- `validarDificuldade(dificuldade)` - Valida enum
- `validarPontos(pontos)` - Valida pontos (1-100)
- `validarTitulo(titulo)` - Valida título (3-255 chars)
- `validarDescricao(descricao)` - Valida descrição
- `validarOpcoes(opcoes)` - Valida array de opções
- `validarRespostaCorreta(resposta, opcoes)` - Valida resposta
- `validarLinguagem(linguagem)` - Valida linguagem de programação

#### 1.3 Criar `QuestaoController.js`
**Responsabilidade**: Orquestração de CRUD de questões
**Endpoints**:
- `POST /api/admin/questoes` - Criar questão
- `GET /api/admin/questoes/:tipo` - Listar questões por tipo
- `GET /api/admin/questoes/:tipo/:id` - Obter questão
- `PUT /api/admin/questoes/:tipo/:id` - Atualizar questão
- `DELETE /api/admin/questoes/:tipo/:id` - Deletar questão
- `GET /api/admin/torneios/:torneioId/questoes` - Questões do torneio
- `POST /api/admin/questoes/:tipo/:id/duplicar` - Duplicar questão

#### 1.4 Criar `questoesRoutes.js`
**Responsabilidade**: Rotas de questões
**Estrutura**:
```javascript
router.post('/', auth, isAdmin, createQuestao);
router.get('/:tipo', auth, isAdmin, listQuestoes);
router.get('/:tipo/:id', auth, isAdmin, getQuestao);
router.put('/:tipo/:id', auth, isAdmin, updateQuestao);
router.delete('/:tipo/:id', auth, isAdmin, deleteQuestao);
router.get('/torneio/:torneioId', auth, isAdmin, getQuestoesTorneio);
router.post('/:tipo/:id/duplicar', auth, isAdmin, duplicarQuestao);
```

---

### **FASE 2: Frontend - Hooks e Serviços**

#### 2.1 Criar `useQuestoes.js`
**Responsabilidade**: Gerenciar estado de questões
**Estados**:
- `questoes` - Array de questões
- `loading` - Estado de carregamento
- `error` - Mensagem de erro
- `filtros` - Filtros aplicados (tipo, torneio, dificuldade)
- `paginacao` - Página atual e total

**Métodos**:
- `carregarQuestoes(tipo, torneioId)` - Carrega questões
- `criarQuestao(tipo, dados)` - Cria questão
- `atualizarQuestao(tipo, id, dados)` - Atualiza questão
- `deletarQuestao(tipo, id)` - Deleta questão
- `duplicarQuestao(tipo, id)` - Duplica questão
- `filtrar(filtros)` - Aplica filtros
- `limparFiltros()` - Limpa filtros

#### 2.2 Criar `useTorneios.js`
**Responsabilidade**: Gerenciar estado de torneios
**Estados**:
- `torneios` - Array de torneios
- `torneioSelecionado` - Torneio ativo
- `loading` - Estado de carregamento
- `error` - Mensagem de erro

**Métodos**:
- `carregarTorneios()` - Carrega torneios
- `selecionarTorneio(id)` - Seleciona torneio
- `criarTorneio(dados)` - Cria torneio
- `atualizarTorneio(id, dados)` - Atualiza torneio
- `deletarTorneio(id)` - Deleta torneio

#### 2.3 Criar `useFormValidation.js`
**Responsabilidade**: Validação de formulários
**Métodos**:
- `validar(dados, schema)` - Valida dados contra schema
- `validarCampo(nome, valor, regra)` - Valida campo individual
- `obterErros()` - Retorna erros
- `limparErros()` - Limpa erros
- `temErros()` - Verifica se há erros

---

### **FASE 3: Frontend - Componentes de Questões**

#### 3.1 Criar `QuestaoForm.jsx`
**Responsabilidade**: Formulário genérico de questão
**Props**:
- `tipo` - Tipo de questão (matematica, programacao, ingles)
- `torneioId` - ID do torneio
- `questao` - Questão para edição (opcional)
- `onSubmit` - Callback ao salvar
- `onCancel` - Callback ao cancelar

**Funcionalidades**:
- Renderização condicional de campos por tipo
- Validação em tempo real
- Preview de questão
- Salvamento com feedback
- Tratamento de erros

#### 3.2 Criar `QuestaoMatematicaForm.jsx`
**Responsabilidade**: Formulário específico de Matemática
**Campos**:
- Título (obrigatório)
- Descrição (obrigatório)
- Dificuldade (select: fácil, médio, difícil)
- Pontos (number: 1-100)
- Opções (A, B, C, D)
- Resposta Correta (select: A, B, C, D)
- Mídia (upload de imagem)

#### 3.3 Criar `QuestaoProgramacaoForm.jsx`
**Responsabilidade**: Formulário específico de Programação
**Campos**:
- Título (obrigatório)
- Descrição (obrigatório)
- Dificuldade (select)
- Pontos (number: 1-100)
- Linguagem (select: JavaScript, Python, Java, C++)
- Resposta Correta (textarea com syntax highlighting)
- Casos de Teste (JSON)
- Mídia (upload)

#### 3.4 Criar `QuestaoInglesForm.jsx`
**Responsabilidade**: Formulário específico de Inglês
**Campos**:
- Título (obrigatório)
- Descrição (obrigatório)
- Dificuldade (select)
- Pontos (number: 1-100)
- Opções (A, B, C, D)
- Resposta Correta (select)
- Áudio (upload de arquivo de áudio)
- Mídia (upload)

#### 3.5 Criar `QuestaoPreview.jsx`
**Responsabilidade**: Preview de questão
**Funcionalidades**:
- Exibição formatada da questão
- Renderização de mídia
- Exibição de opções
- Indicador de dificuldade e pontos
- Botão de editar/salvar

#### 3.6 Criar `QuestaoList.jsx`
**Responsabilidade**: Lista de questões com filtros
**Funcionalidades**:
- Busca por título
- Filtro por dificuldade
- Filtro por modalidade
- Ordenação (data, pontos, dificuldade)
- Paginação
- Ações (editar, deletar, duplicar)
- Contador de questões

#### 3.7 Criar `QuestoesTab.jsx`
**Responsabilidade**: Gerenciador central de questões
**Funcionalidades**:
- Seleção de tipo de questão
- Seleção de torneio
- Exibição de lista de questões
- Botão de criar nova questão
- Modal de criação/edição
- Sincronização com backend

---

### **FASE 4: Frontend - Componentes Compartilhados**

#### 4.1 Criar `FormField.jsx`
**Responsabilidade**: Campo de formulário reutilizável
**Props**:
- `name` - Nome do campo
- `label` - Rótulo
- `type` - Tipo (text, textarea, select, number, etc)
- `value` - Valor
- `onChange` - Callback de mudança
- `error` - Mensagem de erro
- `required` - Campo obrigatório
- `options` - Opções para select
- `placeholder` - Placeholder

#### 4.2 Criar `ValidationError.jsx`
**Responsabilidade**: Exibição de erros de validação
**Props**:
- `errors` - Array de erros
- `field` - Campo específico (opcional)

#### 4.3 Criar `ConfirmDialog.jsx`
**Responsabilidade**: Diálogo de confirmação
**Props**:
- `title` - Título
- `message` - Mensagem
- `onConfirm` - Callback de confirmação
- `onCancel` - Callback de cancelamento
- `confirmText` - Texto do botão confirmar
- `cancelText` - Texto do botão cancelar
- `isDangerous` - Indica ação perigosa (vermelho)

---

### **FASE 5: Refatoração de Componentes Existentes**

#### 5.1 Refatorar `TorneiosTab.jsx`
**Mudanças**:
- Integrar com `useTorneios` hook
- Adicionar botão "Gerenciar Questões"
- Exibir contador de questões por torneio
- Melhorar layout e UX
- Adicionar filtros

#### 5.2 Refatorar `TableManager.jsx`
**Mudanças**:
- Remover suporte a questões (usar QuestoesTab)
- Manter apenas para outras tabelas
- Melhorar validações genéricas

#### 5.3 Refatorar `AdminDashboard.jsx`
**Mudanças**:
- Adicionar nova aba "Questões & Conteúdo"
- Reorganizar menu
- Integrar QuestoesTab

---

### **FASE 6: Testes e Validação**

#### 6.1 Testes de Integração Backend
- [ ] Criar questão com torneio_id válido
- [ ] Criar questão com torneio_id inválido (deve falhar)
- [ ] Listar questões de um torneio específico
- [ ] Editar questão preserva torneio_id
- [ ] Deletar questão remove do banco
- [ ] Duplicar questão cria cópia com novo ID

#### 6.2 Testes de Integração Frontend
- [ ] Selecionar torneio carrega questões
- [ ] Criar questão associa ao torneio
- [ ] Editar questão mantém associação
- [ ] Deletar questão remove da lista
- [ ] Filtros funcionam corretamente
- [ ] Validações impedem envio inválido

#### 6.3 Testes de Fluxo Completo
- [ ] Admin cria torneio
- [ ] Admin cria questão para torneio
- [ ] Questão aparece na lista do torneio
- [ ] Usuário participa do torneio
- [ ] Usuário vê questões corretas
- [ ] Ranking atualiza corretamente

---

## 📈 CRONOGRAMA

| Fase | Tarefas | Tempo Estimado |
|------|---------|-----------------|
| 1 | Backend - Serviços | 4-6 horas |
| 2 | Frontend - Hooks | 3-4 horas |
| 3 | Frontend - Componentes | 8-10 horas |
| 4 | Componentes Compartilhados | 2-3 horas |
| 5 | Refatoração Existente | 2-3 horas |
| 6 | Testes e Validação | 4-6 horas |
| **TOTAL** | | **23-32 horas** |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend
- [ ] `questaoService.js` criado e testado
- [ ] `validacaoService.js` criado e testado
- [ ] `QuestaoController.js` criado e testado
- [ ] `questoesRoutes.js` criado e integrado
- [ ] Endpoints testados com Postman/Insomnia
- [ ] Validações funcionando
- [ ] Erros tratados corretamente

### Frontend - Hooks
- [ ] `useQuestoes.js` criado e testado
- [ ] `useTorneios.js` criado e testado
- [ ] `useFormValidation.js` criado e testado
- [ ] Hooks integrados com API

### Frontend - Componentes
- [ ] `QuestaoForm.jsx` criado
- [ ] `QuestaoMatematicaForm.jsx` criado
- [ ] `QuestaoProgramacaoForm.jsx` criado
- [ ] `QuestaoInglesForm.jsx` criado
- [ ] `QuestaoPreview.jsx` criado
- [ ] `QuestaoList.jsx` criado
- [ ] `QuestoesTab.jsx` criado
- [ ] Componentes compartilhados criados

### Refatoração
- [ ] `TorneiosTab.jsx` refatorado
- [ ] `TableManager.jsx` refatorado
- [ ] `AdminDashboard.jsx` atualizado

### Testes
- [ ] Testes backend executados
- [ ] Testes frontend executados
- [ ] Fluxo completo validado
- [ ] Sem erros de console
- [ ] Sem race conditions
- [ ] Dados persistem corretamente

---

## 🎯 RESULTADO ESPERADO

Ao final da implementação:

✅ **Módulo Gerenciar Torneios**
- Interface moderna e intuitiva
- Criação, edição e exclusão de torneios
- Visualização de questões associadas
- Contador de questões por modalidade

✅ **Módulo Gerenciar Questões**
- Formulários específicos para cada modalidade
- Validações robustas
- Preview antes de salvar
- Busca e filtros
- Duplicação de questões
- Confirmação antes de exclusão

✅ **Associação Torneio ↔ Questões**
- Toda questão vinculada ao torneio correto
- Sem questões órfãs
- Integridade referencial garantida
- Sincronização frontend/backend

✅ **Experiência do Administrador**
- Fluxo claro e intuitivo
- Feedback visual de ações
- Mensagens de erro claras
- Sem confusão sobre associações

---

## 🚀 PRÓXIMOS PASSOS

1. Revisar este plano com o time
2. Iniciar Fase 1 (Backend)
3. Testes contínuos durante desenvolvimento
4. Deploy em staging antes de produção
5. Documentação de uso para admins

