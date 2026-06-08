# 🔗 Fluxo Completo: Blocos com Contexto

## 📌 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Vite)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  BlocoQuestoesManager.jsx                                            │
│  ├─ contexto: "torneio" | "teste"                                   │
│  ├─ BlocoFormModal (form para criar bloco)                         │
│  │  └─ onSave() → payload com { ..., contexto: "teste" }          │
│  └─ handleCriarBloco()                                             │
│     └─ BlocosService.criar(token, dados)                          │
│        └─ POST /api/blocos ← { title, discipline, ..., contexto } │
│                                                                       │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ HTTP POST
                  │
┌─────────────────▼───────────────────────────────────────────────────┐
│                         BACKEND (Node.js/Express)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  routes/blocosRoutes.js                                             │
│  └─ POST /api/blocos → isAdmin middleware → criarBloco()          │
│     │                                                                │
│     ▼                                                                │
│  controllers/BlocosController.js                                    │
│  └─ criarBloco(req, res)                                           │
│     ├─ const { contexto = 'torneio' } = req.body                 │
│     ├─ Valida dados                                                │
│     └─ BlocoQuestoes.create({                                      │
│        ├─ titulo, disciplina, dificuldade, status                 │
│        ├─ contexto: "teste" ← ✅ NOVO                             │
│        └─ criado_por: req.user.id                                 │
│        })                                                            │
│                                                                       │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ Sequelize ORM
                  │
┌─────────────────▼───────────────────────────────────────────────────┐
│              SEQUELIZE MODEL (JavaScript Layer)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  models/BlocoQuestoes.js                                            │
│  ├─ id: INTEGER PRIMARY KEY                                        │
│  ├─ titulo: STRING                                                 │
│  ├─ disciplina: ENUM(...)                                          │
│  ├─ dificuldade: ENUM(...)                                         │
│  ├─ status: ENUM(...)                                              │
│  ├─ contexto: ENUM('torneio', 'teste') ← ✅ NOVO                  │
│  └─ criado_por: INTEGER FK                                        │
│                                                                       │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ SQL Query
                  │ INSERT INTO blocos_questoes (titulo, discipline, contexto, ...)
                  │
┌─────────────────▼───────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  blocos_questoes TABLE                                              │
│  ┌────┬───────┬───────────┬─────────────┬──────────┐               │
│  │ id │ titulo│ discipline│ contexto    │   ...    │               │
│  ├────┼───────┼───────────┼─────────────┼──────────┤               │
│  │  1 │ Math  │ matematica│ torneio     │   ...    │               │
│  │  2 │ Test  │ ingles    │ teste       │   ...    │ ← ✅ NOVO    │
│  │  3 │ Prog  │ prog      │ torneio     │   ...    │               │
│  └────┴───────┴───────────┴─────────────┴──────────┘               │
│                                                                       │
│  ✅ COLUNA AGORA EXISTE (Migração executada com sucesso)           │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Fluxo de Criação de Bloco (Passo a Passo)

### 1️⃣ Usuário Abre Tela de Criação

```
Admin Panel
  └─ Questões Testes Tab
    └─ Clica "Criar Bloco"
      └─ BlocoQuestoesManager recebe contexto="teste" via props
```

### 2️⃣ Modal se Abre com Contexto

```
BlocoFormModal
├─ Props recebidas:
│  ├─ contexto: "teste"
│  ├─ onClose: function
│  └─ onSave: handleCriarBloco
└─ Renderiza formulário com campos:
   ├─ Título (input text)
   ├─ Disciplina (select)
   ├─ Dificuldade (select)
   └─ Descrição (textarea)
```

### 3️⃣ Usuário Preenche Dados e Salva

```
handleSave() no BlocoFormModal
  └─ Cria payload:
     {
       titulo: "Teste Bloco",
       disciplina: "ingles",
       dificuldade: "medio",
       descricao: "Descrição do teste",
       contexto: "teste"  ← ✅ Incluído aqui!
     }
  └─ Chama onSave(payload)
     └─ handleCriarBloco(payload)
```

### 4️⃣ Frontend Envia Para Backend

```
BlocosService.criar(token, dados)
  └─ fetch POST /api/blocos
     ├─ Method: POST
     ├─ Headers: 
     │  ├─ Authorization: Bearer {token}
     │  └─ Content-Type: application/json
     └─ Body: JSON.stringify({
        titulo: "Teste Bloco",
        disciplina: "ingles",
        dificuldade: "medio",
        contexto: "teste"
     })
     
Console Log:
📋 Carregando blocos com filtros: { contexto: 'teste', limit: 100 }
```

### 5️⃣ Backend Recebe e Processa

```
POST /api/blocos
  │
  └─ criarBloco(req, res)
     ├─ Extrai: { titulo, disciplina, dificuldade, contexto = 'torneio' } = req.body
     ├─ Valida dados (titulo não vazio, disciplina válida, etc)
     └─ BlocoQuestoes.create({
        titulo: "Teste Bloco",
        disciplina: "ingles",
        dificuldade: "medio",
        contexto: "teste",  ← ✅ Salva contexto
        criado_por: req.user.id,
        status: "rascunho"
     })
```

### 6️⃣ Sequelize Gera SQL

```
Sequelize converte para SQL:

INSERT INTO blocos_questoes 
  (titulo, disciplina, dificuldade, contexto, criado_por, status, created_at, updated_at)
VALUES
  ('Teste Bloco', 'ingles', 'medio', 'teste', 1, 'rascunho', NOW(), NOW())
```

### 7️⃣ MySQL Executa Query

```
✅ Banco recebe INSERT
   │
   └─ Procura coluna 'contexto' na tabela
      ├─ ✅ ANTES DA MIGRAÇÃO: Coluna não existia → Erro 500
      └─ ✅ APÓS MIGRAÇÃO: Coluna existe com tipo ENUM → Sucesso!
      
Resultado:
INSERT OK
novo_id: 42
```

### 8️⃣ Backend Retorna Sucesso

```
criarBloco() retorna:
{
  success: true,
  message: "Bloco criado com sucesso",
  data: {
    id: 42,
    titulo: "Teste Bloco",
    disciplina: "ingles",
    dificuldade: "medio",
    contexto: "teste",
    criado_por: 1,
    status: "rascunho",
    total_questoes: 0,
    ...
  }
}

HTTP 201 Created
```

### 9️⃣ Frontend Processa Sucesso

```
handleCriarBloco()
  ├─ showMsg('Bloco criado com sucesso!')
  ├─ setShowBlocoForm(false)  ← Fecha modal
  └─ carregarBlocos()  ← Recarrega lista
     │
     └─ BlocosService.listar(token, { contexto: 'teste', limit: 100 })
        │
        └─ GET /api/blocos?contexto=teste&limit=100
           │
           └─ Backend filtra:
              WHERE contexto = 'teste'
              │
              └─ Retorna apenas blocos de teste
                 │
                 └─ Frontend renderiza nova lista
```

### 🔟 Tela Atualiza

```
BlocoQuestoesManager
  └─ dispatch({ type: 'SET_BLOCOS', payload: [blocosDoTeste] })
     │
     └─ Re-renderiza tabela
        └─ Novo bloco aparece na lista! ✅
```

---

## 📊 Dados Fluindo pelo Sistema

### Cliente → Servidor

```
POST /api/blocos
Content-Type: application/json

{
  "titulo": "Teste de Inglês",
  "disciplina": "ingles",
  "dificuldade": "medio",
  "status": "rascunho",
  "descricao": "Teste completo sobre phrasal verbs",
  "contexto": "teste"  ← ✅ NOVO - Separador de contexto
}
```

### Sequelize Model → Database

```
BlocoQuestoes.create({
  titulo: "Teste de Inglês",
  disciplina: "ingles",
  dificuldade: "medio",
  status: "rascunho",
  descricao: "Teste completo sobre phrasal verbs",
  contexto: "teste",  ← ✅ Mapeado para coluna
  criado_por: 1
})

Resultado no banco:
INSERT INTO blocos_questoes 
VALUES (NULL, 'Teste...', 'descr...', 'ingles', 'medio', 'rascunho', 
        NULL, NULL, NULL, NULL, 'teste', 1, NOW(), NOW())
                                    ↑
                                Coluna contexto
```

### Database → Frontend

```
GET /api/blocos?contexto=teste

SELECT * FROM blocos_questoes WHERE contexto = 'teste'

Retorna:
{
  success: true,
  data: {
    blocos: [
      {
        id: 42,
        titulo: "Teste de Inglês",
        disciplina: "ingles",
        contexto: "teste",  ← ✅ Frontend recebe de volta
        ...
      },
      {
        id: 43,
        titulo: "Outro Teste",
        contexto: "teste",
        ...
      }
    ],
    total: 2,
    page: 1
  }
}
```

---

## 🎭 Comparação: Antes vs. Depois da Migração

### ❌ ANTES (Erro 500)

```
Frontend: POST /api/blocos com contexto: "teste"
  │
Backend: BlocoQuestoes.create({ ..., contexto: "teste" })
  │
Sequelize: Tenta mapear contexto para coluna
  │
MySQL: Procura coluna 'contexto'
  │
Erro: Unknown column 'contexto' in field list
  │
HTTP 500: Internal Server Error
  │
Frontend: ❌ Erro ao carregar blocos. Usando dados locais.
```

### ✅ DEPOIS (Sucesso)

```
Frontend: POST /api/blocos com contexto: "teste"
  │
Backend: BlocoQuestoes.create({ ..., contexto: "teste" })
  │
Sequelize: Tenta mapear contexto para coluna
  │
MySQL: ✅ Coluna 'contexto' EXISTE (migração executada)
  │
SQL: INSERT ... VALUES (..., 'teste', ...)
  │
HTTP 201: Created
  │
Frontend: ✅ Bloco criado com sucesso!
         ✅ Bloco aparece na lista
```

---

## 🔄 Filtragem de Contexto

### Criar Bloco na Aba Torneio
```
contexto = "torneio"
POST /api/blocos → { contexto: "torneio" }
Bloco salvo com contexto="torneio"
```

### Criar Bloco na Aba Testes
```
contexto = "teste"
POST /api/blocos → { contexto: "teste" }
Bloco salvo com contexto="teste"
```

### Listar Blocos de Torneio
```
GET /api/blocos?contexto=torneio
WHERE contexto = 'torneio'
Retorna apenas blocos de torneio
```

### Listar Blocos de Teste
```
GET /api/blocos?contexto=teste
WHERE contexto = 'teste'
Retorna apenas blocos de teste
```

---

## 🛠️ O Que Foi Consertado

| Item | Problema | Solução | Status |
|------|----------|--------|--------|
| Database | Coluna não existia | Migração SQL + Sequelize migration | ✅ FIXADO |
| Model | Campo definido mas sem coluna BD | Coluna criada no banco | ✅ FIXADO |
| Controller | Salvando contexto em coluna inexistente | Coluna agora existe | ✅ FIXADO |
| Frontend | Enviando contexto que backend não salvava | Agora backend salva corretamente | ✅ FIXADO |
| API | Retornando 500 em qualquer acesso | Sem mais erro 500 | ✅ FIXADO |

---

## ✨ Resultado Final

Sistema agora permite:
- ✅ Criar blocos na aba Torneio (contexto="torneio")
- ✅ Criar blocos na aba Testes (contexto="teste")
- ✅ Listar blocos filtrados por contexto
- ✅ Sem erro 500
- ✅ Sem perda de dados
- ✅ Compatibilidade total com código existente

