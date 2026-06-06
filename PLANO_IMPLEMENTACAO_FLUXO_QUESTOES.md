# PLANO ESTRATÉGICO: Estabilização do Fluxo de Questões da COMAES

**Versão**: 1.0  
**Data**: Junho 2026  
**Objetivo**: Corrigir, reorganizar e estabilizar completamente o fluxo de criação, validação, organização e distribuição de questões, mantendo compatibilidade total com o sistema atual.

---

## 📋 ESTRUTURA DO PLANO

```
FASE 1: Limpeza de Código (Code Consolidation)
├─ 1.1: Remover Controllers Duplicados
├─ 1.2: Remover Routes Duplicadas
├─ 1.3: Remover Modelos Legacy (Inheritance Pattern)
└─ 1.4: Validar Integridade após limpeza

FASE 2: Completar Fluxo do Colaborador (Workflow Completion)
├─ 2.1: Implementar ColaboradorBlocosTab.jsx
├─ 2.2: Implementar ColaboradorQuestoesTab.jsx
├─ 2.3: Implementar ColaboradorProfileTab.jsx
├─ 2.4: Adicionar Validações e RBAC no Frontend
└─ 2.5: Testar fluxo completo de colaborador

FASE 3: Sistema de Aprovação e Feedback (Approval System)
├─ 3.1: Adicionar status_aprovacao ao BlocoQuestoes
├─ 3.2: Implementar Sistema de Notificações
├─ 3.3: Criar UI para Feedback de Rejeição
├─ 3.4: Criar UI para Disciplina no Admin
└─ 3.5: Testar aprovação end-to-end

FASE 4: Reorganização Administrativa (Admin Restructuring)
├─ 4.1: Reestruturar Sidebar (Questões → Subsecções)
├─ 4.2: Consolidar Abas (Blocos + Questões)
├─ 4.3: Criar Filtros Administrativos
├─ 4.4: Implementar Views Separadas por Tipo
└─ 4.5: Testar navegação completa

FASE 5: Validações e Segurança (Validations & Security)
├─ 5.1: Implementar Validações de Blocos
├─ 5.2: Validar RBAC em Todas as Rotas
├─ 5.3: Adicionar Audit Trail
├─ 5.4: Testar Integridade de Dados
└─ 5.5: Revisão de Segurança

FASE 6: Testes e Estabilidade (Testing & Stability)
├─ 6.1: Testes de Regressão
├─ 6.2: Testes de Fluxo Completo
├─ 6.3: Testes de Permissões
├─ 6.4: Testes de Performance
└─ 6.5: Testes de Compatibilidade

FASE 7: Documentação e Deploy (Documentation & Deployment)
├─ 7.1: Documentar Fluxo Final
├─ 7.2: Atualizar README e Docs
├─ 7.3: Criar Guia de Uso para Admins
├─ 7.4: Criar Guia de Uso para Colaboradores
└─ 7.5: Deploy para Produção
```

---

## 🎯 METAS DE CADA FASE

### FASE 1: Limpeza de Código
**Duração**: ~2 horas  
**Objetivo**: Remover duplicação, deixar código limpo e manutenível  

**1.1: Controllers Duplicados**
```bash
REMOVER:
  - BackEnd/controllers/QuestoesControllerRefactored.js
  - BackEnd/controllers/ColaboradorBlocosQuestoesController.js (manter V2)
  
MANTER:
  - BackEnd/controllers/QuestoesController.js (ativo)
  - BackEnd/controllers/ColaboradorBlocosQuestoesControllerV2.js (renomear para padrão)
  - BackEnd/controllers/BlocosController.js (ativo)
```

**1.2: Routes Duplicadas**
```bash
REMOVER:
  - BackEnd/routes/questoesRoutesRefactored.js (não utilizada)
  - Qualquer arquivo .backup.js ou .old.js
  
MANTER:
  - BackEnd/routes/questoesRoutes.js (ativo)
  - BackEnd/routes/colaboradorBlocosQuestoesRoutes.js (ativo)
  - BackEnd/routes/blocosRoutes.js (ativo)
```

**1.3: Modelos Legacy**
```bash
AVALIAR MIGRAÇÃO:
  - QuestaoMatematica.js (verificar se tem dados)
  - QuestaoProgramacao.js (verificar se tem dados)
  - QuestaoIngles.js (verificar se tem dados)
  → Se não tem dados: REMOVER
  → Se tem dados: Criar migration para migrar para Questao

MANTER:
  - Questao.js (modelo principal)
  - BlocoQuestoes.js (blocos)
  - QuestaoTesteConhecimento.js (se ainda em uso, ou deprecar)
```

**1.4: Validação**
```sql
-- Verificar integridade após limpeza
SELECT COUNT(*) FROM questoes;
SELECT COUNT(*) FROM blocos_questoes;
SELECT COUNT(*) FROM bloco_questoes_items;
SELECT COUNT(*) FROM questoes_teste_conhecimento;
```

---

### FASE 2: Completar Fluxo do Colaborador
**Duração**: ~8 horas  
**Objetivo**: Colaboradores podem criar, gerenciar e submeter questões e blocos  

**2.1: ColaboradorBlocosTab.jsx**
```jsx
Funcionalidades:
  ✅ Listar blocos do colaborador (próprios)
  ✅ Criar novo bloco com validações
  ✅ Editar bloco (se status = rascunho)
  ✅ Deletar bloco (se status = rascunho e sem questões)
  ✅ Visualizar questões no bloco
  ✅ Adicionar questões ao bloco
  ✅ Remover questões do bloco
  ✅ Submeter bloco para aprovação (change status to pending_review)
  ✅ Visualizar status de aprovação
  ✅ Ver feedback de rejeição

Integração:
  - Endpoint: GET /api/colaborador/blocos
  - Endpoint: POST /api/colaborador/blocos
  - Endpoint: PUT /api/colaborador/blocos/:id
  - Endpoint: DELETE /api/colaborador/blocos/:id
  - Endpoint: POST /api/colaborador/blocos/:id/submeter
```

**2.2: ColaboradorQuestoesTab.jsx**
```jsx
Funcionalidades:
  ✅ Listar questões do colaborador (próprias)
  ✅ Criar nova questão com validações
  ✅ Editar questão (se status = pendente)
  ✅ Deletar questão (se status = pendente/rejeitada)
  ✅ Visualizar status de aprovação
  ✅ Ver feedback de rejeição
  ✅ Copiar questão (duplicar)
  ✅ Adicionar questão a bloco
  ✅ Remover questão de bloco

Integração:
  - Endpoint: GET /api/colaborador/questoes
  - Endpoint: POST /api/colaborador/questoes
  - Endpoint: PUT /api/colaborador/questoes/:id
  - Endpoint: DELETE /api/colaborador/questoes/:id
  - Endpoint: POST /api/colaborador/questoes/:id/duplicar
```

**2.3: ColaboradorProfileTab.jsx**
```jsx
Funcionalidades:
  ✅ Visualizar informações do perfil
  ✅ Visualizar disciplina atribuída
  ✅ Visualizar status de colaborador (aprovado/pendente)
  ✅ Editar dados básicos (nome, email)
  ✅ Visualizar histórico de submissões
  ✅ Visualizar estatísticas pessoais

Integração:
  - Endpoint: GET /api/usuarios/:id
  - Endpoint: PUT /api/usuarios/:id
  - Endpoint: GET /api/colaborador/estatisticas
```

**2.4: Validações e RBAC**
```javascript
// Middleware para validar:
  - User é colaborador aprovado
  - Collaboration pertence ao usuário
  - Questão pertence ao usuário
  - Validar disciplina match
  
// Frontend validações:
  - Desabilitar edição de questões aprovadas
  - Desabilitar deleção de questões no bloco
  - Mostrar status de aprovação em tempo real
```

**2.5: Testes**
```bash
# Fluxo colaborador completo:
1. Login como colaborador aprovado
2. Criar nova questão
3. Criar novo bloco
4. Adicionar questão ao bloco
5. Submeter bloco para aprovação
6. Verificar que fica em "pending_review"
7. Logout e login como admin
8. Revisar e aprovar bloco
9. Login como colaborador novamente
10. Verificar que bloco agora está "publicado"
```

---

### FASE 3: Sistema de Aprovação e Feedback
**Duração**: ~6 horas  
**Objetivo**: Admins podem revisar, aprovar/rejeitar com feedback  

**3.1: Adicionar `status_aprovacao` ao BlocoQuestoes**
```javascript
// Migration: add-status-aprovacao-to-blocos-questoes.cjs

ADICIONAR A BlocoQuestoes:
  - status_aprovacao: ENUM('pendente', 'aprovado', 'rejeitado') [default 'pendente']
  - observacoes_admin: TEXT (para feedback)
  - data_revisao: DATE (quando foi revisado)

Relação com status:
  - status_aprovacao='pendente' + status='rascunho' = Aguardando aprovação
  - status_aprovacao='aprovado' + status='rascunho' = Pronto para publicar
  - status_aprovacao='rejeitado' = Precisa de revisão
```

**3.2: Sistema de Notificações**
```javascript
// Implementar NotificacaoService.js

Enviar notificação quando:
  1. Bloco submetido para aprovação → Notificar admin
  2. Bloco aprovado → Notificar colaborador
  3. Bloco rejeitado → Notificar colaborador com motivo
  4. Questão aprovada → Notificar colaborador
  5. Questão rejeitada → Notificar colaborador com motivo

Estrutura:
  - Endpoint: GET /api/notificacoes
  - Endpoint: POST /api/notificacoes/:id/lida
  - Integrar com NotificationsTab existente
```

**3.3: UI para Feedback de Rejeição**
```jsx
// Componente: RejectionFeedbackModal.jsx

Mostrar quando admin rejeita:
  - Motivo da rejeição
  - Observações do admin
  - Data da revisão
  - Quem revisou
  - Botão "Corrigir e Resubmeter"

Mostrar quando colaborador vê:
  - Modal lendo feedback
  - Opção de editar e resubmeter
  - Histórico de rejeições anteriores
```

**3.4: UI para Disciplina no Admin**
```jsx
// Componente: DisciplinaAssignmentModal.jsx ou Tab

Adicionar no painel admin:
  - Listar colaboradores sem disciplina
  - Formulário para atribuir disciplina
  - Validação de disciplina
  - Notificação ao colaborador após atribuição
  - Histórico de mudanças de disciplina
```

**3.5: Testes de Aprovação**
```bash
# Fluxo de aprovação:
1. Colaborador submete bloco
2. Admin vê "pendente" em AdminQuestionsTab
3. Admin clica para revisar
4. Admin escreve feedback e aprova/rejeita
5. Colaborador recebe notificação
6. Colaborador vê bloco aprovado ou rejeição
7. Se rejeitado, colaborador edita e resubmete
8. Admin aprova na segunda tentativa
```

---

### FASE 4: Reorganização Administrativa
**Duração**: ~4 horas  
**Objetivo**: Admin painel bem organizado com abas claras  

**4.1: Reestruturar Sidebar**
```
Questões & Conteúdo
├─ Blocos de Questões (admin-created)
│  └─ Sub-abas: Rascunho | Publicados | Pendentes
│
├─ Questões de Torneios (vinculadas a torneios via blocos)
│  └─ Listar blocos em torneios
│
├─ Questões de Testes (vinculadas a testes de conhecimento)
│  └─ Listar blocos em testes
│
├─ Questões Pendentes (colaboradores aguardando aprovação)
│  └─ Botões: Aprovar | Rejeitar | Visualizar
│
└─ Questões dos Colaboradores (aprovadas)
   └─ Banco validado de questões de colaboradores
```

**4.2: Consolidar Abas**
```jsx
// Atualizar AdminDashboard.jsx

Estrutura:
{
  id: 'questoes-conteudo',
  title: 'Questões & Conteúdo',
  items: [
    { id: 'blocos-questoes', label: 'Blocos de Questões' },
    { id: 'questoes-torneios', label: 'Questões de Torneios' },
    { id: 'questoes-testes', label: 'Questões de Testes' },
    { id: 'questoes-pendentes', label: 'Questões Pendentes' },
    { id: 'questoes-colaboradores', label: 'Questões Colaboradores' }
  ]
}
```

**4.3: Criar Filtros**
```jsx
// Adicionar em cada tab:
- Filtro por disciplina
- Filtro por dificuldade
- Filtro por status
- Busca por título
- Ordenação (data, autor, título)
- Paginação
```

**4.4: Implementar Views Separadas**
```jsx
// QuestoesConteudoManager.jsx (novo componente unificado)

Abas:
1. BlocosQuestoesTab
   └─ BlocoQuestoesManager.jsx

2. QuestoesTorneiosTab
   └─ Listar blocos vinculados a torneios

3. QuestoesTesterTab
   └─ Listar blocos vinculados a testes

4. QuestoesPendentesTab
   └─ QuestionsColaboradorPendentesTab.jsx

5. QuestOesColaboradoresTab
   └─ Listar questões aprovadas de colaboradores
```

**4.5: Testes de Navegação**
```bash
# Admin workflow:
1. Login como admin
2. Navegar para cada aba
3. Verificar que filtros funcionam
4. Testar ordenação
5. Testar paginação
6. Verificar que só aparecem dados corretos em cada aba
```

---

### FASE 5: Validações e Segurança
**Duração**: ~4 horas  
**Objetivo**: Sistema seguro e íntegro  

**5.1: Validações de Blocos**
```javascript
// Em BlocosController.js

Validar ao criar bloco:
  ✅ Título: 3-255 caracteres
  ✅ Disciplina: válida e match com usuário (se colaborador)
  ✅ Dificuldade: uma das 3 opções
  ✅ Descrição: opcional

Validar ao adicionar questão ao bloco:
  ✅ Questão existe
  ✅ Questão já não está no bloco
  ✅ Questão tem status aprovado ou do mesmo autor
  ✅ Não exceder limite de questões (30?)
  ✅ Questão não foi rejeitada

Validar ao submeter bloco:
  ✅ Bloco tem pelo menos 1 questão
  ✅ Bloco tem status 'rascunho'
  ✅ Admin não submete (só aprova)
```

**5.2: Validar RBAC em Todas as Rotas**
```javascript
// Middleware para cada rota:

ADMIN-ONLY:
  - POST /api/blocos (criar direto)
  - PUT /api/blocos/:id (editar direto)
  - DELETE /api/blocos/:id (deletar direto)
  - POST /api/admin/* (todas approvals)

COLABORADOR-ONLY:
  - POST /api/colaborador/blocos (criar próprio)
  - PUT /api/colaborador/blocos/:id (editar próprio)
  - DELETE /api/colaborador/blocos/:id (deletar próprio)
  - POST /api/colaborador/questoes (criar próprio)
  - PUT /api/colaborador/questoes/:id (editar próprio)
  - DELETE /api/colaborador/questoes/:id (deletar próprio)

VALIDAR OWNERSHIP:
  - Colaborador só pode ver/editar/deletar seus próprios blocos
  - Colaborador só pode ver/editar/deletar suas próprias questões
  - Admin pode ver/editar/deletar qualquer coisa
```

**5.3: Adicionar Audit Trail**
```javascript
// Criar tabela: audit_log_questoes

Registrar:
  - Ação (create, update, delete, approve, reject)
  - Quem fez (user_id)
  - O quê (questao_id, bloco_id)
  - Quando (timestamp)
  - Dados antes/depois (JSON)

Endpoints:
  - GET /api/admin/audit/questoes
  - GET /api/admin/audit/blocos
  - GET /api/admin/audit/:id
```

**5.4: Testar Integridade**
```sql
-- Verificar integridade referencial
SELECT * FROM bloco_questoes_items bqi
WHERE NOT EXISTS (SELECT 1 FROM blocos_questoes bq WHERE bq.id = bqi.bloco_id)
   OR NOT EXISTS (SELECT 1 FROM questoes q WHERE q.id = bqi.questao_id);

-- Verificar questões órfãs
SELECT * FROM questoes q
WHERE q.torneio_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM torneios t WHERE t.id = q.torneio_id);

-- Verificar blocos sem questões mas marcados como publicados
SELECT * FROM blocos_questoes bq
WHERE bq.status = 'publicado'
  AND NOT EXISTS (SELECT 1 FROM bloco_questoes_items WHERE bloco_id = bq.id);
```

**5.5: Revisão de Segurança**
```
Checklist:
  ✅ Nenhuma consulta SQL raw (usar ORM)
  ✅ Inputs validados e sanitizados
  ✅ RBAC middleware em todas as rotas
  ✅ Rate limiting nas rotas sensíveis
  ✅ Logs de auditoria para ações críticas
  ✅ Senhas nunca expostas
  ✅ JWTs validados em cada request
  ✅ CORS configurado corretamente
```

---

### FASE 6: Testes e Estabilidade
**Duração**: ~6 horas  
**Objetivo**: Sistema robusto e confiável  

**6.1: Testes de Regressão**
```bash
# Garantir que funcionalidades existentes ainda funcionam

Torneios:
  ✅ Criar torneio com blocos
  ✅ Associar blocos a torneios
  ✅ Desassociar blocos
  ✅ Listar questões do torneio
  ✅ Torneios carregam questões corretamente

Testes:
  ✅ Criar teste com blocos
  ✅ Listar questões do teste
  ✅ Teste carrega questões corretamente

Estudantes:
  ✅ Participar de torneio
  ✅ Responder questões
  ✅ Calcular pontos
  ✅ Ranking atualiza
  ✅ Certificado gerado
```

**6.2: Testes de Fluxo Completo**
```bash
# Cenário 1: Admin cria tudo
1. Admin cria bloco
2. Admin adiciona questões ao bloco
3. Admin publica bloco
4. Admin associa bloco a torneio
5. Admin inicia torneio
6. Estudante participa
7. Estudante responde questões
8. Estudante vê resultado

# Cenário 2: Colaborador submete
1. Colaborador cria questão
2. Admin revisa e aprova
3. Colaborador cria bloco
4. Colaborador adiciona questão ao bloco
5. Colaborador submete bloco
6. Admin aprova bloco
7. Admin associa bloco a torneio
8. Mesmo fluxo do Cenário 1

# Cenário 3: Colaborador rejeição
1. Colaborador cria questão
2. Admin rejeita com feedback
3. Colaborador edita questão
4. Colaborador resubmete
5. Admin aprova
6. Continua fluxo normal
```

**6.3: Testes de Permissões**
```bash
# Verificar RBAC em cada ação

Estudante:
  ✅ Não pode criar questões
  ✅ Não pode criar blocos
  ✅ Não pode aprovar questões
  ✅ Não pode acessar /administrador
  ✅ Só pode responder questões em torneios/testes

Colaborador:
  ✅ Pode criar questões
  ✅ Pode criar blocos
  ✅ Não pode aprovar questões
  ✅ Não pode acessar /administrador
  ✅ Só vê suas próprias questões e blocos
  ✅ Não pode editar questões aprovadas

Admin:
  ✅ Pode fazer tudo
  ✅ Pode aprovar questões
  ✅ Pode rejeitar questões
  ✅ Pode criar blocos direto
  ✅ Pode ver todas questões/blocos
```

**6.4: Testes de Performance**
```bash
# Com 100+ questões e 10+ blocos

Query Performance:
  ✅ Listar blocos < 500ms
  ✅ Listar questões < 500ms
  ✅ Carregar bloco com questões < 200ms
  ✅ Busca < 300ms

Frontend Performance:
  ✅ Admin dashboard < 2s load
  ✅ Colaborador dashboard < 2s load
  ✅ Quiz < 1s load
  ✅ Ranking updates smooth

Memory:
  ✅ Sem memory leaks
  ✅ Sem N+1 queries
```

**6.5: Testes de Compatibilidade**
```bash
# Versões anteriores do navegador

Browsers:
  ✅ Chrome 90+
  ✅ Firefox 88+
  ✅ Safari 14+
  ✅ Edge 90+
  ✅ Mobile browsers

Devices:
  ✅ Desktop
  ✅ Tablet
  ✅ Mobile
```

---

### FASE 7: Documentação e Deploy
**Duração**: ~3 horas  
**Objetivo**: Sistema documentado e em produção  

**7.1: Documentar Fluxo Final**
```markdown
# Fluxo de Questões COMAES v3.0

## Visão Geral
[Diagramas do fluxo]

## Para Admins
[Como gerenciar questões e blocos]

## Para Colaboradores
[Como submeter questões]

## Para Estudantes
[Como responder questões em torneios]

## APIs
[Documentação completa de endpoints]
```

**7.2: Atualizar README e Docs**
```bash
- BackEnd/README.md
- FrontEnd/README.md
- ARQUITETURA.md
- API.md
- FLUXO_QUESTOES.md
```

**7.3: Guia de Uso para Admins**
```markdown
# Guia do Administrador

1. Dashboard
2. Blocos de Questões
3. Questões de Torneios
4. Questões de Testes
5. Questões Pendentes
6. Questões dos Colaboradores
7. Aprovar Questões
8. Gerenciar Colaboradores
9. Relatórios
```

**7.4: Guia de Uso para Colaboradores**
```markdown
# Guia do Colaborador

1. Dashboard
2. Criar Questões
3. Criar Blocos
4. Organizar Questões
5. Submeter para Aprovação
6. Acompanhar Feedback
7. Visualizar Histórico
```

**7.5: Deploy para Produção**
```bash
# Checklist antes de deploy
  ✅ Migrations testadas
  ✅ Testes passando
  ✅ Build sem warnings
  ✅ Performance ok
  ✅ Segurança revisada
  ✅ Documentação completa
  ✅ Rollback plan definido
  ✅ Notificação aos usuários

# Procedimento de deploy
  1. Backup do banco
  2. Merge para main
  3. Deploy do backend
  4. Executar migrations
  5. Deploy do frontend
  6. Smoke tests
  7. Notificar admins e colaboradores
```

---

## 📊 CRONOGRAMA ESTIMADO

| Fase | Atividade | Duração | Status |
|------|-----------|---------|--------|
| 1 | Limpeza de Código | 2h | ⏳ Próxima |
| 2 | Completar Fluxo Colaborador | 8h | ⏳ Próxima |
| 3 | Sistema de Aprovação | 6h | ⏳ Próxima |
| 4 | Reorganização Admin | 4h | ⏳ Próxima |
| 5 | Validações e Segurança | 4h | ⏳ Próxima |
| 6 | Testes e Estabilidade | 6h | ⏳ Próxima |
| 7 | Documentação e Deploy | 3h | ⏳ Próxima |
| | **TOTAL** | **~33 horas** | |

---

## ✅ CHECKLIST DE ENTREGA FINAL

```
Code Quality
  ☐ Sem código duplicado
  ☐ Sem console.log em produção
  ☐ Sem comentários confusos
  ☐ Sem TODOs não resolvidos
  ☐ Lint passando 100%

Funcionalidades
  ☐ Colaborador cria questão
  ☐ Colaborador cria bloco
  ☐ Colaborador submete para aprovação
  ☐ Admin revisa e aprova/rejeita
  ☐ Colaborador recebe feedback
  ☐ Questões aparecem em torneios
  ☐ Questões aparecem em testes
  ☐ Estudantes respondem questões
  ☐ Pontos calculados corretamente
  ☐ Ranking atualiza

Segurança
  ☐ RBAC validado em todas rotas
  ☐ Inputs sanitizados
  ☐ SQL injection impossível
  ☐ XSS impossível
  ☐ CORS configurado
  ☐ Rate limiting ativo

Testes
  ☐ Testes de regressão passando
  ☐ Testes de fluxo passando
  ☐ Testes de permissões passando
  ☐ Testes de performance ok
  ☐ Testes de compatibilidade ok

Documentação
  ☐ README atualizado
  ☐ API documentada
  ☐ Fluxo documentado
  ☐ Guias de usuário
  ☐ Troubleshooting guide

Deploy
  ☐ Migrations testadas
  ☐ Rollback plan definido
  ☐ Backup preparado
  ☐ Notificação aos usuários
  ☐ Monitoramento ativo
```

---

## 🚨 RISCOS E MITIGAÇÃO

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Dados duplicados na migração | Alto | Backup antes, validação após |
| Quebra de permissões | Alto | Testes de RBAC completos |
| Performance degrada | Médio | Testes de load, indexes |
| Regressões em torneios | Alto | Testes de regressão |
| Dados inconsistentes | Médio | Validações e audit trail |
| Deploy quebra produção | Alto | Rollback plan e smoke tests |

---

## 📞 SUPORTE E ESCALAÇÃO

**Problemas críticos**: Reverter para backup e investigar  
**Problemas médios**: Hotfix ou rollback conforme necessário  
**Problemas leves**: Corrigir em próxima release  

---

**FIM DO PLANO**

Próximo passo: Iniciar FASE 1 - Limpeza de Código
