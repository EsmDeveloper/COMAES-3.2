# 📋 Plano de Integração Colaborador ↔ Admin

## 🎯 Objetivo Geral

Criar um sistema completo onde:
1. **Colaborador** cria blocos de questões na sua área de especialização
2. **Admin** revisa e aprova os blocos/questões
3. **Questões aprovadas** ficam disponíveis nos testes e torneios
4. **Perfil do Colaborador** pode ser visualizado e editado

---

## 📊 Arquitetura da Solução

```
COLABORADOR                        ADMIN
┌──────────────────┐              ┌────────────────────┐
│ Dashboard Novo   │              │ Admin Dashboard    │
├──────────────────┤              ├────────────────────┤
│ - Perfil (Ver)   │              │ - Dashboard        │
│ - Perfil (Editar)│◄────────────►│ - Meus Dados       │
│ - Meus Dados     │              │                    │
│ - Blocos de Q    │              │ Colaboradores      │
│ - Criar Bloco    │              │ - Pendentes ✅     │
│ - Questões (CRUD)│              │ - Todos            │
│ - Gerenciar      │              │ - Meus Dados       │
│   Questões       │              │                    │
│ - Estatísticas   │              │ Questões           │
└──────────────────┘              │ - Revisar ✅       │
                                   │ - Blocos (CRUD)    │
                                   │                    │
                                   │ Testes             │
                                   │ - Teste Conhec.    │
                                   │   (usa questões)   │
                                   └────────────────────┘
```

---

## 📁 Componentes a Criar/Modificar

### Frontend - Colaborador

#### Novos Arquivos:
1. **`ColaboradorDashboardV2.jsx`** (Novo Design)
   - Layout tipo Admin (Sidebar + conteúdo)
   - 4 abas:
     - Meus Dados (Perfil)
     - Meus Blocos de Questões
     - Minhas Questões
     - Estatísticas

2. **`ProfileColaboradorTab.jsx`** (Perfil Ver/Editar)
   - Dados pessoais
   - Disciplina de especialização
   - Nível acadêmico
   - Foto de perfil
   - Botão editar

3. **`MeusBlocosTab.jsx`** (Gerenciar Blocos)
   - Listar blocos do colaborador
   - Status: Rascunho/Publicado
   - Ações: Criar, Editar, Ver Questões, Deletar
   - Filtros: Por disciplina, status

4. **`MinhasQuestoesTab.jsx`** (Gerenciar Questões)
   - Listar questões do colaborador
   - Status: Pendente/Aprovada/Rejeitada
   - Ações: Criar, Editar, Ver, Deletar
   - Motivo rejeição (se rejeitada)

5. **`CreateBlocoForm.jsx`** (Criar/Editar Bloco)
   - Título, Descrição
   - Disciplina (select)
   - Dificuldade (select)
   - Status (Rascunho/Publicado)

6. **`CreateQuestaoForm.jsx`** (Criar/Editar Questão)
   - Bloco associado (select)
   - Título, Enunciado
   - Tipo: Múltipla Escolha / Aberta / Código
   - Opções (para múltipla escolha)
   - Resposta Correta
   - Explicação
   - Dificuldade
   - Pontos

### Frontend - Admin

#### Modificações:
1. **`AdminDashboard.jsx`** (Modificação)
   - Adicionar menu "Meus Dados" na seção Usuários
   - Permitir Admin editar seu próprio perfil

2. **`ColaboradoresPendentesTab.jsx`** (Modificação)
   - Adicionar botão "Ver Questões" para ver blocos/questões criados
   - Mostrar estatísticas do colaborador

3. **`QuestoesPendentesTab.jsx`** (Modificação)
   - Mostrar origem (qual colaborador criou)
   - Filtrar por colaborador
   - Motivo rejeição + campo para revisor

4. **`BlocoQuestoesManagerV2.jsx`** (Novo)
   - Incluir blocos criados por colaboradores
   - Status de aprovação: Rascunho/Publicado/Aguardando Revisão
   - Pré-filtrar blocos "Aguardando Revisão"
   - Aba nova: "Blocos Colaboradores"

---

## 🗄️ Schema de Banco de Dados

### Modificações Necessárias

#### 1. Tabela `usuarios` (já tem os campos)
```sql
-- Campos que já existem:
- disciplina_colaborador
- nivel_academico
- status_colaborador
- documentos_colaborador

-- Adicionar (se necessário):
- biografia (TEXT) - se não existir
```

#### 2. Tabela `blocos_questoes` (já existe)
```sql
-- Campos que já existem:
- id, titulo, descricao
- disciplina, dificuldade
- status (rascunho/publicado)
- criado_por (FK usuario)
- created_at, updated_at

-- Adicionar:
- status_aprovacao: ENUM('rascunho', 'aguardando_revisao', 'aprovado', 'rejeitado')
- revisado_por: INTEGER (FK usuario) [nullable]
- revisado_em: DATE [nullable]
- motivo_rejeicao: TEXT [nullable]
```

#### 3. Tabela `questoes` (já existe, melhorar)
```sql
-- Campos que já existem:
- autor_id, status_aprovacao, revisado_por

-- Verificar se tem:
- bloco_id: INTEGER (FK blocos_questoes) [nullable]
  (para associar questão ao bloco)
```

#### 4. Nova Tabela `bloco_questao_items` (se não existir)
```sql
CREATE TABLE bloco_questao_items (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  bloco_id INTEGER NOT NULL (FK blocos_questoes),
  questao_id INTEGER NOT NULL (FK questoes),
  ordem INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(bloco_id, questao_id)
);
```

---

## 🔄 Fluxo de Dados

### Colaborador Criando Questões

```
1. COLABORADOR - Login
   ↓
2. COLABORADOR - Dashboard Novo (com abas)
   ↓
3. COLABORADOR - Aba "Meus Blocos"
   ↓
4. COLABORADOR - Clica "Criar Bloco"
   ↓
5. COLABORADOR - Preenche:
   - Título: "Operações com Matrizes"
   - Descrição: "Bloco sobre álgebra linear"
   - Disciplina: Matemática ✅
   - Dificuldade: Médio
   - Status: Rascunho
   ↓
6. BACKEND - Cria bloco com:
   - status_aprovacao = 'rascunho'
   - criado_por = user_id (colaborador)
   ↓
7. COLABORADOR - Aba "Minhas Questões"
   ↓
8. COLABORADOR - Clica "Criar Questão"
   ↓
9. COLABORADOR - Preenche:
   - Bloco: "Operações com Matrizes" (select)
   - Título: "Soma de matrizes"
   - Tipo: Múltipla Escolha
   - Opções: A, B, C, D
   - Resposta Correta: B
   - Explicação: "A soma é elemento a elemento..."
   - Dificuldade: Médio
   - Pontos: 10
   ↓
10. BACKEND - Cria questão com:
    - status_aprovacao = 'pendente' ⚠️
    - autor_id = user_id (colaborador)
    - bloco_id = bloco.id
    ↓
11. COLABORADOR - Vê questão em "Aguardando Revisão"
```

### Admin Aprovando Questões

```
1. ADMIN - Login
   ↓
2. ADMIN - Dashboard
   ↓
3. ADMIN - Menu > "Revisar Questões"
   ↓
4. ADMIN - Vê abas:
   - ✅ Questões Pendentes (de colaboradores)
   - Blocos Colaboradores (aguardando revisão)
   ↓
5. ADMIN - Aba "Questões Pendentes"
   - Mostra: Origem (qual colaborador)
   - Filtra por colaborador
   - Vê: Título, Disciplina, Tipo, Status
   ↓
6. ADMIN - Clica em questão
   ↓
7. ADMIN - Modal com:
   - Dados completos
   - Botão "Aprovar"
   - Botão "Rejeitar" (com motivo)
   ↓
8. ADMIN - Clica "Aprovar"
   ↓
9. BACKEND - Atualiza:
   - status_aprovacao = 'aprovada'
   - revisado_por = admin_id
   - revisado_em = NOW()
   ↓
10. ADMIN - Notificação enviada ao colaborador
    ↓
11. QUESTÃO - Fica disponível para usar
    - Em testes
    - Em torneios
    - Em estatísticas
```

---

## 🛠️ Implementação por Fases

### Fase 1: Backend (1h)
- [ ] Modificar modelo `BlocoQuestoes` (status_aprovacao, revisado_por, etc)
- [ ] Modificar modelo `Questao` (bloco_id)
- [ ] Criar/migrar tabela `bloco_questao_items`
- [ ] Endpoints CRUD para blocos (create, read, update, delete)
- [ ] Endpoints CRUD para questões no bloco
- [ ] Endpoints de aprovação/rejeição

### Fase 2: Frontend Colaborador (2h)
- [ ] Criar `ColaboradorDashboardV2.jsx` (novo layout)
- [ ] Aba: Profile Ver/Editar
- [ ] Aba: Meus Blocos (CRUD)
- [ ] Aba: Minhas Questões (CRUD)
- [ ] Aba: Estatísticas
- [ ] Forms para criar/editar blocos e questões

### Fase 3: Frontend Admin (1.5h)
- [ ] Adicionar "Meus Dados" para admin editar perfil
- [ ] Modificar "Colaboradores Pendentes" (ver questões)
- [ ] Nova aba "Blocos Colaboradores" em Questões
- [ ] Filtros melhorados

### Fase 4: Integração (1h)
- [ ] Testar fluxo completo
- [ ] Notificações (opcional)
- [ ] Validações finais
- [ ] Deploy

---

## 📱 UI/Design

### Colaborador - Layout Novo

```
┌─────────────────────────────────────────────┐
│ LOGO      Bem-vindo, João Silva    [👤] [→] │
├────────────┬──────────────────────────────────┤
│ Dashboard  │ Meus Dados                       │
│ ✓ Meus     │                                  │
│   Dados    │ [Foto] Nome: João Silva          │
│            │ Email: joao@...                  │
│ Blocos     │ Disciplina: ✅ Matemática        │
│ ✓ Meus     │ Nível: Licenciado                │
│   Blocos   │                                  │
│ ✓ Criar    │ [Editar] [Salvar]                │
│   Bloco    │                                  │
│            │ ────────────────────────────     │
│ Questões   │ Meus Blocos (3)                  │
│ ✓ Minhas   │                                  │
│   Questões │ [+] Operações Matrizes (2 Q)    │
│            │     Rascunho - 2 questões       │
│ ✓ Criar    │     [Ver] [Editar] [Deletar]    │
│   Questão  │                                  │
│            │ [+] Geometria Básica (5 Q)      │
│ Estatísticas │   Publicado - 5 questões      │
│ ✓ Visão    │     [Ver] [Editar] [Deletar]    │
│   Geral    │                                  │
│            │ [Criar Novo Bloco +]             │
└────────────┴──────────────────────────────────┘
```

### Admin - Menu Modificado

```
Adicionar em "Usuários & Comunidade":
├─ Meus Dados (novo)
├─ Gerenciar Usuários
├─ Pedidos de Colaboradores (modificado)
└─ Todos os Colaboradores

Adicionar em "Questões & Conteúdo":
├─ Questões (Torneios) (existente)
├─ Revisar Questões (modificado)
├─ Blocos Colaboradores (novo)
└─ Teste de Conhecimento
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Models atualizados
- [ ] Migrations/Seeds
- [ ] Controllers (CRUD blocos, questões, aprovação)
- [ ] Routes configuradas
- [ ] Validações (autor_id, tipo, etc)
- [ ] Testes de API

### Frontend - Colaborador
- [ ] Layout novo (sidebar)
- [ ] Tabpanel navigation
- [ ] Aba Meus Dados (Ver/Editar)
- [ ] Aba Meus Blocos (CRUD)
- [ ] Aba Minhas Questões (CRUD)
- [ ] Aba Estatísticas
- [ ] Forms validados
- [ ] Feedback visual

### Frontend - Admin
- [ ] Meus Dados (editar perfil)
- [ ] Colaboradores Pendentes (melhorado)
- [ ] Revisar Questões (filtros)
- [ ] Blocos Colaboradores (novo)
- [ ] Modais de aprovação/rejeição
- [ ] Notificações (optional)

### Testes
- [ ] E2E: Colaborador cria bloco → Admin aprova → Disponível nos testes
- [ ] Validações de permissão (só colaborador pode ver seus dados)
- [ ] Fluxo de rejeição com motivo
- [ ] Limpar cache/estado após aprovação

---

## 📊 Estimativa de Tempo

| Fase | Tarefas | Tempo |
|------|---------|-------|
| Backend | Models + Endpoints + Validação | 2h |
| Frontend Colaborador | Dashboard + Forms + CRUD | 2.5h |
| Frontend Admin | Modificações + Filtros + Aprovação | 1.5h |
| Testes & Deploy | E2E + QA + Deploy | 1h |
| **Total** | | **7h** |

---

## 🎯 Próximas Ações

1. **Criar estrutura backend** (models, controllers, routes)
2. **Implementar dashboard colaborador** (com novo design)
3. **Integrar painéis** (aprovação de blocos/questões)
4. **Testar fluxo completo**
5. **Deploy em produção**

---

**Versão:** 1.0.0  
**Status:** 📋 Planejamento Completo  
**Data:** Junho 2026  
**Por:** Kiro
