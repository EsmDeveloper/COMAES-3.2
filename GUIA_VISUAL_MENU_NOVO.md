# 🎨 GUIA VISUAL - NOVO MENU ADMINISTRATIVO

## 📍 Estrutura de Navegação

```
┌─────────────────────────────────────────────────────────────┐
│                   PAINEL ADMINISTRATIVO                     │
│                                                             │
│  ┌─────────────────────┬───────────────────────────────┐   │
│  │     SIDEBAR MENU    │        CONTEÚDO PRINCIPAL     │   │
│  │ (esquerda)          │        (direita/centro)       │   │
│  │                     │                               │   │
│  │ 📊 Dashboard        │                               │   │
│  │                     │                               │   │
│  │ 🏆 Torneios         │                               │   │
│  │  ├─ Gerenciar       │  ┌─────────────────────────┐  │   │
│  │  └─ Certificados    │  │ Questões & Conteúdo     │  │   │
│  │                     │  │ ┌─────────────────────┐ │  │   │
│  │ 📚 Questões &       │  │ │ 🏆 Questões de      │ │  │   │
│  │    Conteúdo ◄───────┼─→│    Torneios ◀─────┐  │ │  │   │
│  │  ├─ Questões de     │  │ │ (14 blocos)      │  │ │  │   │
│  │  │  Torneios ──┐    │  │ └─────────────────┘ │ │  │   │
│  │  ├─ Questões de    │  │                       │ │  │   │
│  │  │  Testes ────┼───→│  │ ┌─────────────────┐ │ │  │   │
│  │  ├─ Questões      │  │ │ 📚 Questões dos  │ │ │  │   │
│  │  │  Pendentes ─┤    │  │ │    Testes ◀────┐│ │  │   │
│  │  └─ Questões de   │  │ │ (273 questões)  ││ │  │   │
│  │     Colaboradores │  │ └─────────────────┘│ │  │   │
│  │     ────┬─────────│  │                  ┌──┘ │  │   │
│  │         │         │  │ ┌─────────────┐  │    │  │   │
│  │ 👥 Usuários &      │  │ │ ⏳ Questões │  │    │  │   │
│  │    Comunidade      │  │ │    Pendentes│  │    │  │   │
│  │                     │  │ └─────────────┘  │    │  │   │
│  │ 🔔 Comunicação      │  │                  │    │  │   │
│  │                     │  │ ┌──────────────────┐  │  │   │
│  │ ⚙️  Sistema         │  │ │ 👥 Questões dos  │  │  │   │
│  │                     │  │ │    Colaboradores │  │  │   │
│  │                     │  │ └──────────────────┘  │  │   │
│  │                     │  └──────────────────────┘  │  │   │
│  └─────────────────────┴───────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Componentes e Funcionalidades

### 1️⃣ **Questões de Torneios** 🏆

**Ícone:** Trophy (Troféu Amarelo)  
**URL Tab:** `questoes-torneios`  
**Componente:** `QuestoesTorneiosTab.jsx`

```
┌──────────────────────────────────────────┐
│ 🏆 Questões de Torneios                 │
│                                          │
│ "Blocos de questões vinculados a        │
│  torneios"                              │
│                                          │
│ 🔍 [Pesquisar blocos...]                │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 🏆 Bloco 1: Matemática Básica    ▼│  │
│ │ "10 questões - Fácil - Publicado" │  │
│ │                                   │  │
│ │ [Editamar] [Ver Questões]        │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 🏆 Bloco 2: Inglês Avançado      ▼│  │
│ │ "8 questões - Difícil - Publicado"│  │
│ │                                   │  │
│ │ [Editar] [Ver Questões]          │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ... (mais blocos)                       │
│                                          │
│ 📊 Estatísticas:                        │
│ ├─ Total de Blocos: 14                  │
│ ├─ Publicados: 14                       │
│ └─ Disciplinas: 3 (Mat, Ing, Prog)     │
└──────────────────────────────────────────┘
```

**Dados Exibidos:**
- Título do bloco
- Descrição
- Disciplina (badge azul)
- Dificuldade (badge roxa)
- Status (badge verde: publicado)
- Botões de ação

**Funcionalidades:**
- Busca por título/descrição
- Expandable details cards
- Visualizar questões do bloco
- Editar bloco (se interface existir)
- Estatísticas em tempo real

---

### 2️⃣ **Questões dos Testes** 📚

**Ícone:** BookOpen (Livro Roxo)  
**URL Tab:** `questoes-testes`  
**Componente:** `QuestoesTestesTab.jsx`

```
┌──────────────────────────────────────────┐
│ 📚 Questões dos Testes                  │
│                                          │
│ "Banco de questões para testes de       │
│  conhecimento"                          │
│                                          │
│ 🔍 [Pesquisar questões...]              │
│                                          │
│ Categoria: [Matemática ▼] Dif: [Fácil▼]│
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Q1 | "Qual é 2+3?" | Matemática   │  │
│ │    | Fácil | 10 pts | Ativo ✓      │  │
│ │    [Editar] [Deletar]              │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Q2 | "Define programming..." │      │  │
│ │    | Inglês | Médio | 20 pts │      │  │
│ │    [Editar] [Deletar]        │      │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Q3 | "What's the loop syntax..." │   │
│ │    | Programação | Difícil | 30 pts  │
│ │    [Editar] [Deletar]               │
│ └────────────────────────────────────┘  │
│                                          │
│ 📊 Estatísticas:                        │
│ ├─ Total: 273 questões                 │
│ ├─ Matemática: 95                       │
│ ├─ Inglês: 89                          │
│ └─ Programação: 89                      │
└──────────────────────────────────────────┘
```

**Dados Exibidos:**
- Enunciado da questão (truncado)
- Categoria
- Dificuldade
- Pontos
- Status (Ativo/Inativo)

**Funcionalidades:**
- Busca por enunciado/categoria
- Filtros por dificuldade
- Criar nova questão (+ botão)
- Editar questão
- Deletar questão
- Paginação

---

### 3️⃣ **Questões Pendentes** ⏳

**Ícone:** Clock (Relógio)  
**URL Tab:** `questoes-pendentes`  
**Componente:** `QuestoesPendentesTab.jsx`

```
┌──────────────────────────────────────────┐
│ ⏳ Questões Pendentes                   │
│                                          │
│ "Questões submetidas por colaboradores  │
│  aguardando revisão"                    │
│                                          │
│ 📋 Filtro: [Status▼] [Disciplina▼]     │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ ⏳ Questão de Maria (Inglês)       │  │
│ │                                    │  │
│ │ "What is the capital of...?"       │  │
│ │                                    │  │
│ │ Enviada: 2026-06-05 14:32         │  │
│ │ Status: PENDENTE 🔴                │  │
│ │ Disciplina: Inglês                 │  │
│ │ Dificuldade: Médio                │  │
│ │                                    │  │
│ │ [Detalhes] [Aprovar] [Rejeitar]   │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ ⏳ Questão de João (Matemática)    │  │
│ │                                    │  │
│ │ "Calcular a derivada de x² + 3x..."│  │
│ │                                    │  │
│ │ Enviada: 2026-06-04 10:15         │  │
│ │ Status: PENDENTE 🔴                │  │
│ │ Disciplina: Matemática            │  │
│ │ Dificuldade: Difícil              │  │
│ │                                    │  │
│ │ [Detalhes] [Aprovar] [Rejeitar]   │  │
│ └────────────────────────────────────┘  │
│                                          │
│ 📊 Estatísticas:                        │
│ ├─ Total Pendente: 5                    │
│ ├─ Matemática: 2                        │
│ └─ Inglês: 3                           │
└──────────────────────────────────────────┘
```

**Dados Exibidos:**
- Nome do colaborador
- Enunciado da questão
- Data de envio
- Status: PENDENTE
- Disciplina
- Dificuldade

**Funcionalidades:**
- Visualizar detalhes completos (modal)
- Aprovar questão (aprova para banco)
- Rejeitar questão (com motivo opcional)
- Filtrar por status/disciplina
- Busca por autor

---

### 4️⃣ **Questões dos Colaboradores** 👥

**Ícone:** GraduationCap (Chapéu de Formatura)  
**URL Tab:** `questoes-colaboradores`  
**Componente:** `QuestoesColaboradoresTab.jsx`

```
┌──────────────────────────────────────────┐
│ 👥 Questões dos Colaboradores           │
│                                          │
│ "Banco validado de questões pedagógicas │
│  dos colaboradores aprovados"           │
│                                          │
│ 🔍 [Pesquisar...]  [Disciplina▼]        │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 👤 Maria (Inglês) - Aprovado ✅    │  │
│ │                                    │  │
│ │ "What is the capital of France?"   │  │
│ │                                    │  │
│ │ Disciplina: Inglês                │  │
│ │ Dificuldade: Fácil                │  │
│ │ Aprovado em: 2026-06-03           │  │
│ │                                    │  │
│ │ [Detalhes] [Usar em Torneio]      │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 👤 Carlos (Programação) - Aprovado ✅│
│ │                                    │  │
│ │ "Qual o resultado de [código]?"    │  │
│ │                                    │  │
│ │ Disciplina: Programação           │  │
│ │ Dificuldade: Difícil              │  │
│ │ Aprovado em: 2026-06-02           │  │
│ │                                    │  │
│ │ [Detalhes] [Usar em Torneio]      │  │
│ └────────────────────────────────────┘  │
│                                          │
│ 📊 Estatísticas:                        │
│ ├─ Total Aprovado: 12+                  │
│ ├─ Colaboradores: 6                    │
│ ├─ Disciplinas: 3                      │
│ └─ Utilizadas em: 8 blocos             │
└──────────────────────────────────────────┘
```

**Dados Exibidos:**
- Nome do colaborador
- Disciplina
- Enunciado da questão
- Dificuldade
- Data de aprovação
- Status: APROVADO ✅

**Funcionalidades:**
- Expandable details com bio do colaborador
- Busca por enunciado/autor
- Filtrar por disciplina
- Filtrar por dificuldade
- Usar questão em bloco/torneio
- Ver histórico de uso

---

## 🎨 PALETA DE CORES

```
Questões de Torneios:    🟡 Amarelo/Ouro    (Trophy)
Questões dos Testes:     🟣 Roxo/Púrpura    (BookOpen)
Questões Pendentes:      🟡 Laranja/Âmbar   (Clock)
Questões Colaboradores:  🟦 Azul Céu        (GraduationCap)
```

---

## 📊 Fluxo de Dados

```
                    ┌─────────────────┐
                    │ Banco de Dados  │
                    │ (MySQL)         │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐         ┌────▼────┐        ┌───▼───┐
    │Blocos   │         │Questões │        │Usuários
    │Torneios │         │Teste    │        │
    └────┬────┘         └────┬────┘        └───┬───┘
         │                   │                   │
         │            ┌──────▼──────┐          │
         │            │ Colaborador │          │
         │            │ Submete ?   │          │
         │            └──────┬──────┘          │
         │                   │                 │
         │            ┌──────▼────────┐        │
         │            │ Questões      │        │
         │            │ Pendentes ⏳   │        │
         │            │ (em revisão)  │        │
         │            └──────┬────────┘        │
         │                   │                 │
         │        ┌──────────┴──────────┐     │
         │        │ Admin Revisa       │     │
         │        └──────────┬─────────┘     │
         │                   │               │
         │   ┌───────────────┼──────────┐   │
         │   ▼               ▼          ▼   │
         │ REJEITA      APROVA    IGNORA    │
         │   │            │        │        │
         │   │      ┌─────▼────┐   └────────┼─┐
         │   └─────►│Notifica  │            │ │
         │ Colabor│           │            │ │
         │         └─────┬────┘            │ │
         │               │                │ │
         └───────────────┼────────────────┼─┼─┐
                         │                │ │ │
                    ┌────▼──────┐        │ │ │
                    │Questões   │        │ │ │
                    │Colaborado-│        │ │ │
                    │res👥       │        │ │ │
                    │(Banco)    │        │ │ │
                    └────┬──────┘        │ │ │
                         │              │ │ │
                    ┌────▼──────┐        │ │ │
                    │Usa em:    │        │ │ │
                    │- Torneios │        │ │ │
                    │- Testes   │        │ │ │
                    └───────────┘        │ │ │
                                        └─┴─┘
                                    (Banco Completo)
```

---

## 🔄 Fluxo de Usuário - Admin

```
Login
  │
  ▼
Dashboard Inicial
  │
  ├─► Menu Lateral Aberto
  │   └─► "Questões & Conteúdo" clicado
  │       │
  │       ├─► Questões de Torneios (Vê 14 blocos)
  │       │   └─► Clica em bloco → Vê questões
  │       │
  │       ├─► Questões dos Testes (Vê 273 questões)
  │       │   └─► Busca/Filtra questões
  │       │
  │       ├─► Questões Pendentes (Vê 5 em revisão)
  │       │   └─► Clica Aprovar/Rejeitar
  │       │       └─► Questão vai para Banco
  │       │
  │       └─► Questões dos Colaboradores (Vê 12+)
  │           └─► Clica em questão → Vê autor
  │               └─► Opção de usar em torneio
  │
  └─► Outras Funcionalidades
      ├─► Gerenciar Torneios
      ├─► Gerenciar Usuários
      ├─► Revisar Colaboradores
      └─► Ver Certificados
```

---

## 📱 Responsividade

### Desktop (>1024px)
- Sidebar fixo à esquerda (280px)
- Conteúdo em grid responsivo
- Múltiplas colunas para tabelas

### Tablet (768px - 1024px)
- Sidebar colapsável
- Conteúdo adapta para 1-2 colunas

### Mobile (<768px)
- Sidebar como overlay/drawer
- Conteúdo em 1 coluna
- Botões/cards verticais
- Menu hamburger no topo

---

## ✨ Melhorias Futuras

1. **Drag & Drop** - Arrastar questões para blocos
2. **Duplicar Questão** - Clonar para reutilizar template
3. **Exportar** - CSV/PDF de questões
4. **Importar** - Upload de questões em lote
5. **Versionamento** - Histórico de revisões
6. **Discussão** - Comentários entre admin e colaborador

---

*Guia Visual - COMAES 3.2 - Última atualização: 2026-06-06*
