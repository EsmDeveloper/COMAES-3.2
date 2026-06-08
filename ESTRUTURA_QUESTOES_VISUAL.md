# 📊 ESTRUTURA VISUAL - QUESTÕES & CONTEÚDO

## 🏗️ ARQUITETURA DO SISTEMA DE QUESTÕES

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PAINEL ADMINISTRATIVO COMAES                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
                    ┌───────────────────────────────┐
                    │   Questões & Conteúdo         │
                    └───────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ↓                   ↓                   ↓                   ↓
    ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐
    │   Torneios      │  │      Testes      │  │    Pendentes     │  │  Colaboradores  │
    │   🏆            │  │      📚          │  │      ⏳          │  │      👥         │
    └─────────────────┘  └──────────────────┘  └──────────────────┘  └─────────────────┘
            │                     │                     │                     │
            ↓                     ↓                     ↓                     ↓
        Blocos de          Questões de          Questões          Questões
        Torneios           Teste                Pendentes          Aprovadas
        
        14 blocos          14 questões          3 questões         6+ questões
        70+ questões       (QTC)               (em revisão)       (validadas)
```

---

## 📊 FLUXO DE QUESTÕES POR TIPO

### 1️⃣ QUESTÕES DE TORNEIOS
```
Admin cria/aprova
        │
        ↓
    Bloco de Torneio (status: publicado)
        │
        ├─ Disciplina: Matemática
        ├─ Dificuldade: Fácil
        ├─ Questões: 17
        └─ Status: Publicado
        │
        ↓
    Vinculado a Torneio
        │
        ↓
    Estudantes resolvem questões no torneio
```

**Visualização no Admin**: QuestoesTorneiosTab
- 14 blocos listados
- Expansão para ver detalhes
- Filtros por disciplina/dificuldade

---

### 2️⃣ QUESTÕES DOS TESTES
```
Admin cria questões de teste
        │
        ↓
Questão (tabela: questoes_teste_conhecimento)
    │
    ├─ Categoria: Matemática
    ├─ Dificuldade: Fácil
    ├─ Pontos: 10
    ├─ Status: Ativo
    └─ Total: 14 questões
    │
    ↓
Disponível para Testes de Conhecimento
    │
    ↓
Estudantes resolvem em modo teste
```

**Visualização no Admin**: QuestoesTestesTab
- Tabela com 14 questões
- Ações: Criar, editar, deletar
- Filtros por categoria/dificuldade

---

### 3️⃣ QUESTÕES PENDENTES
```
Colaborador submete questão
        │
        ↓
    Questão (status: pendente)
        │
        ├─ Autor: Maria Santos
        ├─ Disciplina: Inglês
        ├─ Status: Pendente
        └─ Aguardando revisão
        │
        ↓
Admin revisa
        │
    ┌───┴───┐
    ↓       ↓
APROVADA  REJEITADA
    │
    ↓
Vai para "Questões dos Colaboradores"
    (banco validado)
```

**Visualização no Admin**: QuestoesPendentesTab
- Filtro por status: pendente
- 3 questões de Maria
- Ações: Aprovar/rejeitar

---

### 4️⃣ QUESTÕES DOS COLABORADORES
```
Questão aprovada pelo Admin
        │
        ↓
Questão (status: aprovada, na tabela: questoes)
        │
        ├─ Autor: Colaborador
        ├─ Status: Aprovada
        ├─ Data aprovação: data
        └─ Pronta para uso
        │
        ↓
Banco de Questões Validadas
        │
        ├─ Reutilizável em torneios
        ├─ Reutilizável em testes
        └─ Rastreável ao autor
        │
        ↓
Admin pode:
    - Ver todas as questões aprovadas
    - Filtrar por autor/disciplina
    - Ver informações do colaborador
    - Usar em novos blocos
```

**Visualização no Admin**: QuestoesColaboradoresTab
- 6+ questões aprovadas
- Informações do autor
- Detalhes expandíveis
- Filtros por autor/disciplina

---

## 🔄 CICLO COMPLETO DE QUESTÃO

```
┌────────────────────────────────────────────────────────────────┐
│                  CICLO DE VIDA DA QUESTÃO                      │
└────────────────────────────────────────────────────────────────┘

1️⃣ CRIAÇÃO
   ├─ Colaborador/Admin cria questão
   ├─ Tabela: questoes
   ├─ Campo: status_aprovacao = 'pendente'
   └─ Campo: autor_id = colaborador_id

2️⃣ REVISÃO (Admin)
   ├─ Va em Questões Pendentes
   ├─ Revisa enunciado/respostas
   ├─ Deixa comentário (motivo_rejeicao)
   └─ Aprova ✅ ou Rejeita ❌

3️⃣ APROVAÇÃO
   ├─ Status: aprovada
   ├─ Campo: revisado_por = admin_id
   ├─ Campo: revisado_em = data
   └─ Agora em "Questões dos Colaboradores"

4️⃣ UTILIZAÇÃO
   ├─ Admin adiciona a um bloco
   ├─ Bloco pode ser:
   │  ├─ Bloco de Torneio
   │  ├─ Bloco de Teste
   │  └─ Banco validado
   └─ Estudantes resolvem

5️⃣ RASTREAMENTO
   ├─ Admin vê:
   │  ├─ Quem criou (autor_id)
   │  ├─ Quando criou (created_at)
   │  ├─ Quem aprovou (revisado_por)
   │  ├─ Histórico de revisão
   │  └─ Onde está sendo usada
   └─ Colaborador vê:
      ├─ Suas questões (pendentes)
      ├─ Suas questões (aprovadas)
      ├─ Status de cada uma
      └─ Feedback do admin
```

---

## 💾 MAPEAMENTO DE TABELAS

```
TABELA: questoes_teste_conhecimento
├─ id
├─ enunciado
├─ opcoes (JSON)
├─ resposta_correta
├─ dificuldade (enum: facil, medio, dificil)
├─ categoria (enum: matematica, ingles, programacao)
├─ pontos
├─ ativo (boolean)
└─ created_at, updated_at

USO: Questões dos Testes (QuestoesTestesTab)

───────────────────────────────────────────────────────

TABELA: questoes
├─ id
├─ titulo
├─ descricao
├─ disciplina (enum: matematica, ingles, programacao)
├─ tipo (enum: multipla_escolha, texto, codigo)
├─ dificuldade (enum: facil, medio, dificil)
├─ opcoes (JSON)
├─ resposta_correta
├─ pontos
├─ autor_id (FK: usuarios.id)
├─ status_aprovacao (enum: pendente, aprovada, rejeitada)
├─ revisado_por (FK: usuarios.id)
├─ revisado_em (timestamp)
├─ motivo_rejeicao
├─ torneio_id (opcional)
└─ created_at, updated_at

USO: 
  • Questões Pendentes (QuestoesPendentesTab)
  • Questões dos Colaboradores (QuestoesColaboradoresTab)

───────────────────────────────────────────────────────

TABELA: blocos_questoes
├─ id
├─ titulo
├─ descricao
├─ disciplina (enum: matematica, ingles, programacao)
├─ dificuldade (enum: facil, medio, dificil)
├─ status (enum: rascunho, publicado)
├─ criado_por (FK: usuarios.id)
├─ aprovado_por_id (FK: usuarios.id)
├─ data_aprovacao
├─ observacoes_admin
└─ created_at, updated_at

USO: Questões de Torneios (QuestoesTorneiosTab)

───────────────────────────────────────────────────────

TABELA: torneios
├─ id
├─ titulo
├─ slug
├─ descricao
├─ inicia_em
├─ termina_em
├─ criado_por (FK: usuarios.id)
├─ status (enum: rascunho, agendado, ativo, finalizado, cancelado)
└─ created_at

USO: Referência para blocos de torneios
```

---

## 🎯 INTERFACES DO ADMIN

### QuestoesTorneiosTab
```
┌──────────────────────────────────────────────────────┐
│ 🏆 Questões de Torneios                          [+] │
│ Blocos de questões vinculados a torneios             │
├──────────────────────────────────────────────────────┤
│ 🔍 [Pesquisar blocos...]                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🏆 Bloco Matemática - Básico                   ▼ │
│ │    Questões básicas de matemática               │  │
│ │    [mat] [fácil] [publicado]                     │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🏆 Bloco Inglês - Intermediário                ▼ │
│ │    Questões de inglês intermediário              │  │
│ │    [ing] [médio] [publicado]                     │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🏆 Bloco Programação - Avançado                ▼ │
│ │    Questões desafiadoras de programação         │  │
│ │    [prog] [difícil] [publicado]                  │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
├──────────────────────────────────────────────────────┤
│ 📊 Total: 14 | Publicados: 14 | Disciplinas: 3     │
└──────────────────────────────────────────────────────┘
```

### QuestoesTestesTab
```
┌──────────────────────────────────────────────────────┐
│ 📚 Questões dos Testes                          [+]  │
│ Questões de teste de conhecimento                    │
├──────────────────────────────────────────────────────┤
│ 🔍 [Pesquisar questões...]                           │
├──────────────────────────────────────────────────────┤
│ Enunciado        │Categoria│Dif │Pontos│Status │Ações│
├──────────────────────────────────────────────────────┤
│ Qual é 2+3?      │Matemática│F  │10   │Ativo │✏️🗑️ │
│ Hello tradução?  │Inglês    │F  │10   │Ativo │✏️🗑️ │
│ Variável JS?     │Program   │F  │10   │Ativo │✏️🗑️ │
│ ... (11 mais)    │...       │... │...  │...   │... │
├──────────────────────────────────────────────────────┤
│📊 Total: 14 | Ativas: 14 | Categorias: 3 | Pts: 155│
└──────────────────────────────────────────────────────┘
```

### QuestoesPendentesTab (Existente)
```
┌──────────────────────────────────────────────────────┐
│ ⏳ Questões Pendentes                                │
│ Aguardando revisão do administrador                  │
├──────────────────────────────────────────────────────┤
│ 🔍 [Pesquisar questões...]                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ ⏳ Present Perfect - Exercício 1             ▼ │
│ │    Complete: "I ___ here for 5 years"        │  │
│ │    [Inglês] [Médio]                            │  │
│ │    Autor: Maria Santos                         │  │
│ │    [Aprovar] [Rejeitar] [Ver Detalhes]        │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ ⏳ Conditional - Exercício 2                  ▼ │
│ │    Se eu ganhasse na loteria, eu ___ uma casa  │  │
│ │    [Inglês] [Difícil]                          │  │
│ │    Autor: Maria Santos                         │  │
│ │    [Aprovar] [Rejeitar] [Ver Detalhes]        │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ... (1 mais)                                         │
│                                                      │
├──────────────────────────────────────────────────────┤
│ 📊 Total Pendentes: 3 | Disciplinas: 1 | Autor: 1   │
└──────────────────────────────────────────────────────┘
```

### QuestoesColaboradoresTab
```
┌──────────────────────────────────────────────────────┐
│ 👥 Questões dos Colaboradores                        │
│ Banco validado de questões pedagógicas               │
├──────────────────────────────────────────────────────┤
│ 🔍 [Pesquisar por título, descrição ou autor...]     │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ ✅ Vocabulary - Colors                       ▼ │
│ │    Qual é a cor oposta ao preto?              │  │
│ │    [Inglês] [Fácil]                            │  │
│ │    Autor: Maria Santos                         │  │
│ │    [Editar] [Ver Autor]                        │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ ✅ Listening Comprehension                    ▼ │
│ │    Que hora era quando o meeting começou?     │  │
│ │    [Inglês] [Médio]                            │  │
│ │    Autor: Maria Santos                         │  │
│ │    [Editar] [Ver Autor]                        │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ... (4+ mais)                                        │
│                                                      │
├──────────────────────────────────────────────────────┤
│ 📊 Total: 6+ | Disciplinas: 1 | Colaboradores: 1    │
└──────────────────────────────────────────────────────┘
```

---

## 🎛️ CONTROLES E AÇÕES

### Por Interface

| Interface | Ações Disponíveis |
|-----------|-------------------|
| **Torneios** | Ver detalhes, Editar, Ver questões, Estatísticas |
| **Testes** | Criar, Editar, Deletar, Filtrar, Estatísticas |
| **Pendentes** | Aprovar, Rejeitar, Ver detalhes, Comentar |
| **Colaboradores** | Editar, Ver autor, Filtrar, Estatísticas |

---

## ✅ CHECKLIST DE FUNCIONALIDADES

- [x] Menu reorganizado conforme especificação
- [x] 4 abas principais com interfaces distintas
- [x] Dados populados em cada seção
- [x] Filtros funcionais
- [x] Estatísticas em tempo real
- [x] Créditos de acesso testáveis
- [x] Fluxos documentados
- [x] Backend compatível
- [x] Frontend sem erros

---

**Status**: ✅ PRONTO PARA TESTAR  
**Data**: 2026-06-06  
**Componentes**: 3 novos + 1 existente
