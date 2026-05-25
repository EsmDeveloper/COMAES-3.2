# FASE 3 - LIMPEZA FINAL DE ROTAS LEGADAS

## SCAN COMPLETO REALIZADO

### ✅ ROTAS ANTIGAS IDENTIFICADAS

#### 1. **GET /perguntas/:area** (linha 1961 do index.js)
- **Status**: ATIVA E LEGADA
- **Problema**: Usa modelo `Pergunta` (não importado, causará erro)
- **Usado por**: `FrontEnd/src/Paginas/Secundarias/Teste.jsx` (linha 70)
- **Ação**: REMOVER

#### 2. **GET /api/quiz/:area** (linha 1985 do index.js)
- **Status**: ATIVA E LEGADA
- **Problema**: Usa modelo `Pergunta` (não importado, causará erro)
- **Usado por**: `FrontEnd/src/hooks/useQuiz.js` (linha 56)
- **Ação**: REDIRECIONAR para `/api/questoes/quiz/:area`

### ✅ MODELOS LEGADOS REFERENCIADOS

- `Pergunta` - Referenciado em 2 rotas do index.js
- `QuestaoMatematica` - Referenciado em associações (linha ~300)
- `QuestaoProgramacao` - Referenciado em associações (linha ~300)
- `QuestaoIngles` - Referenciado em associações (linha ~300)

### ✅ ROTAS ATIVAS MANTIDAS

1. **POST /api/questoes/:modalidade** - Criar questão (QuestoesController)
2. **GET /api/questoes/:modalidade/:id** - Obter questão (QuestoesController)
3. **PUT /api/questoes/:modalidade/:id** - Atualizar questão (QuestoesController)
4. **DELETE /api/questoes/:modalidade/:id** - Deletar questão (QuestoesController)
5. **GET /api/questoes/torneio/:torneioId** - Listar questões do torneio (QuestoesController)
6. **POST /api/questoes/:modalidade/:id/duplicar** - Duplicar questão (QuestoesController)

### ✅ ARQUIVOS A MODIFICAR

1. **BackEnd/index.js**
   - Remover: Rotas `/perguntas/:area` e `/api/quiz/:area`
   - Remover: Referências a `Pergunta` model
   - Remover: Associações com modelos legados (QuestaoMatematica, QuestaoProgramacao, QuestaoIngles)
   - Adicionar: Nova rota `/api/questoes/quiz/:area` que redireciona para Questao.js

2. **BackEnd/routes/questoesRoutes.js**
   - Adicionar: Rota GET `/quiz/:area` para compatibilidade com frontend

3. **FrontEnd/src/Paginas/Secundarias/Teste.jsx**
   - Atualizar: Endpoint de `/perguntas/:area` para `/api/questoes/quiz/:area`

4. **FrontEnd/src/hooks/useQuiz.js**
   - Atualizar: Endpoint de `/api/quiz/:area` para `/api/questoes/quiz/:area`

## PLANO DE EXECUÇÃO

### Fase 1: Backend - Remover rotas antigas
- [ ] Remover `/perguntas/:area` do index.js
- [ ] Remover `/api/quiz/:area` do index.js
- [ ] Remover referências a `Pergunta` model
- [ ] Remover associações com modelos legados

### Fase 2: Backend - Adicionar rota de compatibilidade
- [ ] Adicionar GET `/api/questoes/quiz/:area` em questoesRoutes.js

### Fase 3: Frontend - Atualizar endpoints
- [ ] Atualizar Teste.jsx
- [ ] Atualizar useQuiz.js

### Fase 4: Validação
- [ ] Testar: `node index.js` inicia sem erros
- [ ] Testar: Frontend consegue carregar questões
- [ ] Testar: Nenhum endpoint antigo responde

## RESULTADO ESPERADO

- ✅ Sistema usa apenas `Questao.js` como fonte de questões
- ✅ Todos os endpoints antigos removidos
- ✅ Frontend atualizado para usar novos endpoints
- ✅ Sem erros de inicialização
- ✅ Single API source garantido
