# 📋 Padronização de Criação de Questões e Blocos - Admin vs Colaborador

## 📊 Resumo das Mudanças

### ✅ O que foi feito:

1. **Novo Controller: `ColaboradorBlocosController.js`**
   - Endpoints para colaborador criar blocos (status: pendente)
   - Endpoints para gerenciar blocos (editar, deletar)
   - Endpoints para adicionar/remover questões de blocos
   - Workflow de aprovação similar ao admin

2. **Novas Rotas em `colaboradorRoutes.js`**
   - `POST /api/colaborador/blocos` - Criar bloco
   - `GET /api/colaborador/blocos` - Listar blocos
   - `GET /api/colaborador/blocos/:id` - Obter bloco
   - `PUT /api/colaborador/blocos/:id` - Editar bloco
   - `DELETE /api/colaborador/blocos/:id` - Deletar bloco
   - `POST /api/colaborador/blocos/:id/questoes` - Adicionar questão
   - `DELETE /api/colaborador/blocos/:id/questoes/:qid` - Remover questão

3. **Atualização no `index.js`**
   - Adicionada importação de `BlocoQuestaoItem`

---

## 🔄 Comparação: Fluxo Admin vs Colaborador

### ADMIN
```
┌─ CRIAR QUESTÃO ─────────────────────┐
│  POST /api/questoes                 │
│  Status: 'aprovada' (imediato)      │
│  Disciplina: pode escolher          │
│  Máx 10 opções                      │
└─────────────────────────────────────┘
           ↓
┌─ CRIAR BLOCO ──────────────────────┐
│  POST /api/blocos                  │
│  Status: 'rascunho'                │
│  Adicionar questões: manuais       │
│  Publicar → usar em torneios       │
└────────────────────────────────────┘
           ↓
┌─ ASSOCIAR A TORNEIO ───────────────┐
│  POST /api/torneios/{id}/blocos    │
│  Torneio ativado com questões      │
└────────────────────────────────────┘
```

### COLABORADOR (AGORA)
```
┌─ CRIAR QUESTÃO ────────────────────────────┐
│  POST /api/colaborador/questoes            │
│  Status: 'pendente'                        │
│  Disciplina: fixa (do perfil)              │
│  Máx 4 opções                             │
│  Admin aprova/rejeita                      │
└────────────────────────────────────────────┘
           ↓
┌─ CRIAR BLOCO (NOVO!) ──────────────────────┐
│  POST /api/colaborador/blocos              │
│  Status: 'pendente' (precisa aprovação)   │
│  Adicionar questões aprovadas do collab   │
│  Submeter para admin revisar              │
└────────────────────────────────────────────┘
           ↓
┌─ ADMIN REVISA BLOCO ───────────────────────┐
│  Aprova → Status 'publicado'               │
│  Pode usar em blocos públicos              │
│  Colaborador vê em "Meus Blocos"          │
└────────────────────────────────────────────┘
```

---

## 📋 Campos por Tipo de Questão

### Admin - Criar Questão
```javascript
{
  "titulo": "string (obrigatório)",
  "descricao": "string (obrigatório)",
  "disciplina": "enum: matematica, programacao, ingles",
  "dificuldade": "enum: facil, medio, dificil",
  "tipo": "enum: multipla_escolha, etc",
  "opcoes": [
    { "texto": "string", "correta": boolean, "explicacao": "string" },
    ...
  ],
  "resposta_correta": "string (deve estar em opcoes)",
  "pontos": "number (1-100)"
}
// Status: 'aprovada' (automático)
```

### Colaborador - Criar Questão
```javascript
{
  "titulo": "string (max 200 caracteres)",
  "enunciado": "string (max 1000 caracteres)",
  "disciplina": "string (vem do perfil - fixo)",
  "dificuldade": "enum: facil, medio, dificil",
  "tipo": "enum: multipla_escolha (fixo)",
  "opcoes": ["string", "string", "string", "string"], // 2-4
  "resposta_correta": "string (deve estar em opcoes)",
  "pontos": "number (1-100)"
}
// Status: 'pendente' (requer aprovação)
```

### Criar Bloco (Admin)
```javascript
{
  "titulo": "string (obrigatório)",
  "descricao": "string (opcional)",
  "disciplina": "enum: matematica, programacao, ingles",
  "dificuldade": "enum: facil, medio, dificil",
  "contexto": "enum: torneio, teste",
  "status": "enum: rascunho, publicado"
}
```

### Criar Bloco (Colaborador - NOVO!)
```javascript
{
  "titulo": "string (obrigatório)",
  "descricao": "string (opcional)",
  "dificuldade": "enum: facil, medio, dificil"
  // disciplina: vem do perfil (fixo)
  // contexto: sempre 'torneio' (fixo)
  // status: sempre 'pendente' (precisa aprovação)
}
```

---

## 🔐 Validações - Backend

### Colaborador CAN:
- ✅ Criar questões (entram em 'pendente')
- ✅ Criar blocos (entram em 'pendente')
- ✅ Adicionar apenas suas questões **aprovadas** aos blocos
- ✅ Editar bloco só se estiver 'rascunho' ou 'rejeitado'
- ✅ Deletar bloco só se estiver 'rascunho'

### Colaborador CANNOT:
- ❌ Editar questão depois de 'pendente' → aguarda aprovação
- ❌ Deletar questão depois de 'pendente' → aguarda aprovação
- ❌ Usar questões 'pendentes' em blocos
- ❌ Editar bloco se estiver 'pendente', 'publicado' ou 'rejeitado'
- ❌ Associar bloco a torneios (apenas admin)

---

## 🚀 Frontend - O que ainda precisa fazer

### Criar página/componente: `ColaboradorBlocos.jsx`
```
┌─────────────────────────────────────────────┐
│ Meus Blocos de Questões                    │
├─────────────────────────────────────────────┤
│                                             │
│ [+ Novo Bloco]  [Pesquisar...]            │
│                                             │
│ Abas: Todos | Rascunho | Pendente | OK    │
│                                             │
├─────────────────────────────────────────────┤
│ BLOCO 1: "Matemática Básica"              │
│ Status: 🟡 Pendente (aguardando admin)    │
│ Questões: 5/30                             │
│ [Editar] [Gerenciar Questões] [Deletar]  │
│                                             │
│ BLOCO 2: "Programação Avançada"           │
│ Status: 🟢 Publicado (aprovado!)          │
│ Questões: 12/30                            │
│ [Editar] [Gerenciar Questões] [Deletar]  │
└─────────────────────────────────────────────┘
```

### Modal: Adicionar Questões ao Bloco
```
┌─────────────────────────────────────────────┐
│ Adicionar Questões ao Bloco                │
├─────────────────────────────────────────────┤
│                                             │
│ [Pesquisar questões...]                    │
│                                             │
│ ☐ Questão 1: "Cálculo de Derivadas"      │
│   Dificuldade: Médio | 5/5 (aprovada)    │
│                                             │
│ ☐ Questão 2: "Integral Definida"         │
│   Dificuldade: Difícil | 10/10 (aprovada)│
│                                             │
│ ☐ Questão 3: "Limite de Função"          │
│   Dificuldade: Fácil | 8/10 (aprovada)   │
│                                             │
│ [Cancelar] [Adicionar Selecionadas]       │
└─────────────────────────────────────────────┘
```

---

## 📱 Fluxo Completo - Colaborador

1. **Login** → Status: Aprovado ✅
2. **Criar Questão** 
   - Form simples com 4 campos (título, enunciado, dificuldade, opções)
   - Disciplina fixa (vem do perfil)
   - Entra como 'pendente'
3. **Admin aprova** → Questão disponível ✅
4. **Criar Bloco**
   - Novo bloco (status: 'pendente')
   - Adicionar suas questões aprovadas
   - Editar se necessário
5. **Submeter para aprovação**
   - Admin revisa bloco
   - Se OK → Status 'publicado'
6. **Admin usa bloco** em torneios/testes

---

## 🔗 Endpoints Implementados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/colaborador/blocos` | Criar bloco |
| GET | `/api/colaborador/blocos` | Listar blocos (com filtros) |
| GET | `/api/colaborador/blocos/:id` | Obter bloco com questões |
| PUT | `/api/colaborador/blocos/:id` | Editar bloco |
| DELETE | `/api/colaborador/blocos/:id` | Deletar bloco |
| POST | `/api/colaborador/blocos/:id/questoes` | Adicionar questão ao bloco |
| DELETE | `/api/colaborador/blocos/:id/questoes/:qid` | Remover questão do bloco |

---

## 🧪 Testes Sugeridos

1. **Criar bloco como colaborador**
   ```bash
   POST /api/colaborador/blocos
   {
     "titulo": "Meu Bloco de Teste",
     "descricao": "Descrição do bloco",
     "dificuldade": "medio"
   }
   ```

2. **Adicionar questão aprovada ao bloco**
   ```bash
   POST /api/colaborador/blocos/1/questoes
   {
     "questao_id": 5,
     "ordem": 1
   }
   ```

3. **Listar blocos do colaborador**
   ```bash
   GET /api/colaborador/blocos?status=pendente
   ```

4. **Editar bloco (apenas se rascunho)**
   ```bash
   PUT /api/colaborador/blocos/1
   {
     "titulo": "Bloco Atualizado",
     "dificuldade": "dificil"
   }
   ```

---

## ✅ Status: Código Implementado

- ✅ Backend: `ColaboradorBlocosController.js` criado
- ✅ Rotas: `colaboradorRoutes.js` atualizado
- ✅ Imports: `index.js` atualizado
- ⏳ Frontend: Pendente criar UI
- ⏳ Admin Panel: Aprovar/rejeitar blocos do colaborador

---

## 📝 Próximos Passos

1. Criar painel de admin para **aprovar/rejeitar blocos** do colaborador
2. Criar UI frontend para **gerenciar blocos do colaborador**
3. Adicionar **notificações** quando bloco for aprovado/rejeitado
4. Testar fluxo completo de criação e aprovação

