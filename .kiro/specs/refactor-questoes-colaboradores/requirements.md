# Refatoração: Questões dos Colaboradores e Questões Pendentes

## 📋 Visão Geral

Refatorar e reorganizar os módulos **"Questões Pendentes"** e **"Questões dos Colaboradores"** seguindo a arquitetura, componentes e padrões já existentes nas abas **"Questões dos Testes"** e **"Questões dos Torneios"**.

**Objetivo:** Reutilizar 100% da estrutura existente, não recriar do zero.

---

## 🔄 Fluxo Correto do Sistema

```
Painel do Colaborador
    ↓
    Colaborador cria questões/blocos
    ↓
Aba "Questões Pendentes"
    ├─ Admin revisa
    ├─ Aprova ou Rejeita
    ↓
Aba "Questões dos Colaboradores"
    ├─ Questões aprovadas aparecem aqui
    ├─ Organizadas por colaborador/bloco
    ↓
Testes & Torneios
    └─ Blocos podem ser associados
```

### Estados das Questões

1. **Pendente** → Aguardando revisão na aba "Questões Pendentes"
2. **Aprovada** → Aparece em "Questões dos Colaboradores"
3. **Rejeitada** → Não aparece (status final)

### Estados dos Blocos

1. **Rascunho** → Não pode ser associado
2. **Publicado** → Pode ser associado a testes/torneios

---

## 🎯 Requisitos Funcionais

### 1. Aba "Questões Pendentes"

**Funcionalidades:**
- ✅ Exibir questões pendentes de aprovação
- ✅ Busca por título/descrição
- ✅ Filtro por disciplina
- ✅ Paginação (se necessário)
- ✅ Visualizar detalhes completos da questão
- ✅ Aprovar questão (move para "Questões dos Colaboradores")
- ✅ Rejeitar questão (com motivo obrigatório)
- ✅ Editar questão (se permitido)
- ✅ Loading states e feedback visual
- ✅ Estados vazios com mensagens úteis

**Componentes Visuais Reutilizáveis:**
- Cards de questão (similar aos de testes/torneios)
- Badges de status, dificuldade, disciplina
- Modais de detalhes, rejeição
- Toast/feedback de ações

### 2. Aba "Questões dos Colaboradores"

**Estrutura Baseada em Blocos:**
- Cada bloco representa um conjunto de questões de um colaborador
- Cada bloco contém:
  - Título do bloco
  - Identificador do colaborador (ID + nome)
  - Informações do colaborador (avatar, email, disciplina)
  - Quantidade de questões (X/30)
  - Status (Publicado/Rascunho)
  - Data de criação
  - Ações: expandir, editar, deletar, associar

**Funcionalidades:**
- ✅ Exibir blocos de questões dos colaboradores
- ✅ Busca por nome do colaborador/título do bloco
- ✅ Filtro por disciplina
- ✅ Filtro por status (Publicado/Rascunho)
- ✅ Paginação (se necessário)
- ✅ Expandir bloco para ver questões
- ✅ Visualizar detalhes de cada questão
- ✅ Adicionar questão ao bloco (se espaço disponível)
- ✅ Editar questão
- ✅ Remover questão do bloco
- ✅ Editar bloco (título, descrição, status)
- ✅ Deletar bloco (se não estiver associado)
- ✅ Associar blocos a testes/torneios
- ✅ Loading states e feedback visual

**Componentes Visuais Reutilizáveis:**
- Cards de bloco (similar aos de testes/torneios)
- Barra de progresso (questões/limite)
- Modais de detalhes, edição, deleção
- Painel de associação a testes/torneios
- Informações do colaborador (avatar, nome, disciplina)

### 3. Integração com Testes e Torneios

**Compatibilidade Total:**
- ✅ Blocos dos colaboradores podem ser adicionados em torneios
- ✅ Blocos dos colaboradores podem ser adicionados em testes
- ✅ Mesma lógica de associação dos outros módulos
- ✅ Mesma interface de seleção

---

## 📐 Estrutura Técnica

### Componentes a Reutilizar

**De "Questões dos Testes" e "Questões dos Torneios":**
1. Layout geral (header, filtros, lista)
2. Cards de bloco/questão
3. Modais (detalhes, edição, confirmação)
4. Badges (status, dificuldade, disciplina)
5. Sistema de busca/filtro
6. Barra de progresso
7. Painel de associação
8. Toast/feedback
9. Loading states
10. Estados vazios

**Hooks a Reutilizar:**
- Estado de loading
- Estado de erro
- Estado de sucesso
- Carregamento de dados
- Filtros e busca
- Paginação (se aplicável)

### APIs Esperadas

**Backend deve fornecer:**

**GET /api/questoes-pendentes**
- Listar questões com status "pendente"
- Filtros: disciplina, status_aprovacao, page, limit
- Response: `{ dados: { questoes: [...], total, page, limit } }`

**PATCH /api/questoes/:id/aprovar**
- Aprovar questão (mover para aprovada)
- Response: `{ sucesso: true, mensagem: "..." }`

**PATCH /api/questoes/:id/rejeitar**
- Rejeitar questão (com motivo)
- Body: `{ motivo: "..." }`
- Response: `{ sucesso: true, mensagem: "..." }`

**GET /api/blocos-colaboradores**
- Listar blocos de colaboradores
- Filtros: disciplina, status, colaborador_id, page, limit
- Response: `{ dados: { blocos: [...], total, page, limit } }`
- Cada bloco deve incluir:
  - `id`, `titulo`, `descricao`, `disciplina`, `dificuldade`, `status`
  - `colaborador_id`, `colaborador` (object com nome, email, avatar, disciplina)
  - `questoes` (array de questões ou IDs)
  - `total_questoes` (count)
  - `created_at`, `updated_at`

**GET /api/blocos-colaboradores/:id**
- Detalhes do bloco com todas as questões

**POST /api/blocos-colaboradores**
- Criar novo bloco

**PATCH /api/blocos-colaboradores/:id**
- Editar bloco (título, descrição, status)

**DELETE /api/blocos-colaboradores/:id**
- Deletar bloco

**POST /api/blocos-colaboradores/:id/questoes**
- Adicionar questão ao bloco

**DELETE /api/blocos-colaboradores/:id/questoes/:questaoId**
- Remover questão do bloco

---

## 🎨 Design & UX

### Padrão Visual

- **Cores:** Seguir paleta azul do projeto
- **Badges:** Status (pendente/aprovado/rejeitado), Dificuldade, Disciplina
- **Cards:** Sombra suave, borda 1px, espaçamento consistente
- **Modais:** Fundo escuro (50%), conteúdo centrado, X para fechar
- **Feedback:** Toast no canto inferior direito, desaparece após 3-5s

### Responsividade

- Mobile: Stack vertical, cards full-width, menus dropdown
- Tablet: 2 colunas para blocos
- Desktop: 3+ colunas conforme espaço

---

## ✅ Critérios de Sucesso

1. ✅ **Fluxo funciona de ponta a ponta:**
   - Questões criadas → Pendentes → Aprovadas → Colaboradores → Testes/Torneios

2. ✅ **Reutilização máxima:**
   - 0% código duplicado
   - 100% padrões do projeto
   - Componentes compartilhados

3. ✅ **Qualidade técnica:**
   - Sem erros no console
   - Loading states corretos
   - Tratamento de erros
   - Estados vazios claros

4. ✅ **Interface consistente:**
   - Mesmo design das outras abas
   - Mesmas cores, fonts, espaçamento
   - Responsiva em todos os tamanhos

5. ✅ **Performance:**
   - Sem re-renders desnecessários
   - Paginação se necessário
   - Carregamento lazy das questões

6. ✅ **Funcionalidades completas:**
   - Todas as ações funcionam
   - Todas as associações funcionam
   - Todos os filtros funcionam

---

## 📝 Notas Importantes

- **Não quebrar funcionalidades existentes**
- **Usar exactamente os mesmos padrões do projeto**
- **Se algo não existir, criar seguindo o padrão**
- **Testar fluxo completo antes de entregar**
- **Manter console limpo (sem warnings)**
