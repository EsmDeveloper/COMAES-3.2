# 🧪 GUIA DE TESTES - Backend de Questões

**Objetivo**: Validar todos os endpoints do backend  
**Ferramentas**: Postman, Insomnia ou curl  
**Tempo Estimado**: 30-45 minutos

---

## 🔧 Preparação

### 1. Iniciar o Backend
```bash
cd BackEnd
npm start
```

### 2. Obter Token de Admin
```bash
# Login como admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "admin@example.com",
    "senha": "SenhaForte123!"
  }'

# Copiar o token da resposta
```

### 3. Criar Torneio de Teste
```bash
curl -X POST http://localhost:3000/api/admin/torneio \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Torneio Teste",
    "descricao": "Torneio para testes",
    "inicia_em": "2026-05-22T10:00:00",
    "termina_em": "2026-05-23T18:00:00",
    "status": "rascunho"
  }'

# Copiar o ID do torneio da resposta
```

---

## 📝 TESTES DE CRIAÇÃO

### Teste 1.1: Criar Questão de Matemática ✅

**Endpoint**: `POST /api/questoes/matematica`

**Request**:
```bash
curl -X POST http://localhost:3000/api/questoes/matematica \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Quanto é 2 + 2?",
    "descricao": "Questão básica de adição",
    "dificuldade": "facil",
    "torneio_id": 1,
    "resposta_correta": "4",
    "opcoes": ["3", "4", "5", "6"],
    "pontos": 10
  }'
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Questão de Matemática criada com sucesso",
  "dados": {
    "id": 1,
    "titulo": "Quanto é 2 + 2?",
    "descricao": "Questão básica de adição",
    "dificuldade": "facil",
    "torneio_id": 1,
    "resposta_correta": "4",
    "opcoes": ["3", "4", "5", "6"],
    "pontos": 10,
    "criado_em": "2026-05-21T10:00:00.000Z"
  },
  "timestamp": "2026-05-21T10:00:00.000Z"
}
```

**Validações**:
- ✅ Status 201 (Created)
- ✅ sucesso = true
- ✅ Questão tem ID
- ✅ Todos os campos retornados

---

### Teste 1.2: Criar Questão de Inglês ✅

**Endpoint**: `POST /api/questoes/ingles`

**Request**:
```bash
curl -X POST http://localhost:3000/api/questoes/ingles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "What is the capital of France?",
    "descricao": "Geography question about European capitals",
    "dificuldade": "facil",
    "torneio_id": 1,
    "resposta_correta": "Paris",
    "opcoes": ["London", "Paris", "Berlin", "Madrid"],
    "pontos": 10
  }'
```

**Validações**:
- ✅ Status 201
- ✅ sucesso = true
- ✅ Questão criada com sucesso

---

### Teste 1.3: Criar Questão de Programação ✅

**Endpoint**: `POST /api/questoes/programacao`

**Request**:
```bash
curl -X POST http://localhost:3000/api/questoes/programacao \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Escrever função que soma dois números",
    "descricao": "Implemente uma função que retorna a soma de dois números",
    "dificuldade": "facil",
    "torneio_id": 1,
    "resposta_correta": "function soma(a, b) { return a + b; }",
    "linguagem": "javascript",
    "pontos": 15,
    "opcoes": {
      "codigoInicial": "function soma(a, b) {\n  // Escreva seu código aqui\n}",
      "testes": [
        { "entrada": [2, 3], "saida": 5 },
        { "entrada": [10, 20], "saida": 30 }
      ]
    }
  }'
```

**Validações**:
- ✅ Status 201
- ✅ sucesso = true
- ✅ Linguagem = javascript

---

### Teste 1.4: Validação - Título Vazio ❌

**Request**:
```bash
curl -X POST http://localhost:3000/api/questoes/matematica \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "",
    "descricao": "Descrição válida",
    "dificuldade": "facil",
    "torneio_id": 1,
    "resposta_correta": "4"
  }'
```

**Resposta Esperada**:
```json
{
  "sucesso": false,
  "mensagem": "Erro de validação",
  "erros": {
    "titulo": "Título é obrigatório"
  }
}
```

**Validações**:
- ✅ Status 422 (Unprocessable Entity)
- ✅ sucesso = false
- ✅ Erro específico do campo

---

### Teste 1.5: Validação - Torneio Inválido ❌

**Request**:
```bash
curl -X POST http://localhost:3000/api/questoes/matematica \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Questão válida",
    "descricao": "Descrição válida",
    "dificuldade": "facil",
    "torneio_id": 99999,
    "resposta_correta": "4"
  }'
```

**Resposta Esperada**:
```json
{
  "sucesso": false,
  "mensagem": "Torneio não encontrado: 99999"
}
```

**Validações**:
- ✅ Status 404
- ✅ sucesso = false
- ✅ Mensagem clara

---

## 📖 TESTES DE LEITURA

### Teste 2.1: Obter Questão por ID ✅

**Endpoint**: `GET /api/questoes/matematica/1`

**Request**:
```bash
curl -X GET http://localhost:3000/api/questoes/matematica/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validações**:
- ✅ Status 200
- ✅ sucesso = true
- ✅ Retorna questão completa

---

### Teste 2.2: Listar Questões do Torneio ✅

**Endpoint**: `GET /api/questoes/torneio/1`

**Request**:
```bash
curl -X GET "http://localhost:3000/api/questoes/torneio/1?pagina=1&limite=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Questões listadas com sucesso",
  "dados": {
    "matematica": {
      "total": 1,
      "pagina": 1,
      "limite": 20,
      "totalPaginas": 1,
      "questoes": [...]
    },
    "ingles": {
      "total": 1,
      "pagina": 1,
      "limite": 20,
      "totalPaginas": 1,
      "questoes": [...]
    },
    "programacao": {
      "total": 1,
      "pagina": 1,
      "limite": 20,
      "totalPaginas": 1,
      "questoes": [...]
    }
  }
}
```

**Validações**:
- ✅ Status 200
- ✅ sucesso = true
- ✅ Retorna todas as modalidades
- ✅ Paginação funciona

---

### Teste 2.3: Listar com Busca ✅

**Endpoint**: `GET /api/questoes/torneio/1?busca=2+2`

**Request**:
```bash
curl -X GET "http://localhost:3000/api/questoes/torneio/1?busca=2+2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validações**:
- ✅ Status 200
- ✅ Retorna apenas questões com "2 + 2" no título/descrição

---

### Teste 2.4: Listar com Filtro de Dificuldade ✅

**Endpoint**: `GET /api/questoes/torneio/1?dificuldade=facil`

**Request**:
```bash
curl -X GET "http://localhost:3000/api/questoes/torneio/1?dificuldade=facil" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validações**:
- ✅ Status 200
- ✅ Retorna apenas questões com dificuldade "facil"

---

### Teste 2.5: Contar Questões ✅

**Endpoint**: `GET /api/questoes/torneio/1/contar`

**Request**:
```bash
curl -X GET http://localhost:3000/api/questoes/torneio/1/contar \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Questões contadas com sucesso",
  "dados": {
    "matematica": 1,
    "ingles": 1,
    "programacao": 1,
    "total": 3
  }
}
```

**Validações**:
- ✅ Status 200
- ✅ Contagem correta

---

## ✏️ TESTES DE ATUALIZAÇÃO

### Teste 3.1: Atualizar Questão ✅

**Endpoint**: `PUT /api/questoes/matematica/1`

**Request**:
```bash
curl -X PUT http://localhost:3000/api/questoes/matematica/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Quanto é 2 + 2? (Atualizado)",
    "descricao": "Questão básica de adição (Atualizada)",
    "dificuldade": "medio",
    "torneio_id": 1,
    "resposta_correta": "4",
    "opcoes": ["3", "4", "5", "6"],
    "pontos": 15
  }'
```

**Validações**:
- ✅ Status 200
- ✅ sucesso = true
- ✅ Campos atualizados

---

## 🗑️ TESTES DE EXCLUSÃO

### Teste 4.1: Deletar Questão ✅

**Endpoint**: `DELETE /api/questoes/matematica/1`

**Request**:
```bash
curl -X DELETE http://localhost:3000/api/questoes/matematica/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validações**:
- ✅ Status 200
- ✅ sucesso = true
- ✅ Questão deletada

---

### Teste 4.2: Verificar Exclusão ✅

**Endpoint**: `GET /api/questoes/matematica/1`

**Request**:
```bash
curl -X GET http://localhost:3000/api/questoes/matematica/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Esperada**:
```json
{
  "sucesso": false,
  "mensagem": "Questão não encontrada: 1"
}
```

**Validações**:
- ✅ Status 404
- ✅ Questão realmente deletada

---

## 📋 TESTES DE DUPLICAÇÃO

### Teste 5.1: Duplicar Questão ✅

**Endpoint**: `POST /api/questoes/matematica/1/duplicar`

**Request**:
```bash
curl -X POST http://localhost:3000/api/questoes/matematica/1/duplicar \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Questão de Matemática duplicada com sucesso",
  "dados": {
    "id": 2,
    "titulo": "Quanto é 2 + 2? (Cópia)",
    "descricao": "Questão básica de adição",
    "dificuldade": "facil",
    "torneio_id": 1,
    "resposta_correta": "4",
    "opcoes": ["3", "4", "5", "6"],
    "pontos": 10,
    "criado_em": "2026-05-21T10:05:00.000Z"
  }
}
```

**Validações**:
- ✅ Status 201
- ✅ sucesso = true
- ✅ Nova questão tem ID diferente
- ✅ Título tem "(Cópia)"
- ✅ Outros campos iguais

---

## 🔍 TESTES DE AUDITORIA

### Teste 6.1: Validar Integridade ✅

**Endpoint**: `GET /api/questoes/auditoria/integridade`

**Request**:
```bash
curl -X GET http://localhost:3000/api/questoes/auditoria/integridade \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Integridade validada",
  "dados": {
    "total": 3,
    "validas": 3,
    "invalidas": 0,
    "problemas": []
  }
}
```

**Validações**:
- ✅ Status 200
- ✅ Contagem correta
- ✅ Sem problemas

---

### Teste 6.2: Buscar Questões Órfãs ✅

**Endpoint**: `GET /api/questoes/auditoria/orfas`

**Request**:
```bash
curl -X GET http://localhost:3000/api/questoes/auditoria/orfas \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "0 questões órfãs encontradas",
  "dados": {}
}
```

**Validações**:
- ✅ Status 200
- ✅ Sem questões órfãs

---

## 🔐 TESTES DE SEGURANÇA

### Teste 7.1: Sem Token ❌

**Request**:
```bash
curl -X GET http://localhost:3000/api/questoes/matematica/1
```

**Resposta Esperada**:
```json
{
  "message": "Token não fornecido"
}
```

**Validações**:
- ✅ Status 401 (Unauthorized)
- ✅ Acesso negado

---

### Teste 7.2: Token Inválido ❌

**Request**:
```bash
curl -X GET http://localhost:3000/api/questoes/matematica/1 \
  -H "Authorization: Bearer INVALID_TOKEN"
```

**Resposta Esperada**:
```json
{
  "message": "Token inválido"
}
```

**Validações**:
- ✅ Status 401
- ✅ Acesso negado

---

### Teste 7.3: Usuário Não-Admin ❌

**Request** (com token de usuário comum):
```bash
curl -X POST http://localhost:3000/api/questoes/matematica \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Resposta Esperada**:
```json
{
  "message": "Acesso negado. Apenas administradores podem acessar."
}
```

**Validações**:
- ✅ Status 403 (Forbidden)
- ✅ Acesso negado

---

## 📊 Resumo de Testes

| Categoria | Testes | Status |
|-----------|--------|--------|
| Criação | 5 | ⏳ Testar |
| Leitura | 5 | ⏳ Testar |
| Atualização | 1 | ⏳ Testar |
| Exclusão | 2 | ⏳ Testar |
| Duplicação | 1 | ⏳ Testar |
| Auditoria | 2 | ⏳ Testar |
| Segurança | 3 | ⏳ Testar |
| **TOTAL** | **19** | **⏳ Testar** |

---

## ✅ Checklist de Testes

- [ ] Todos os testes de criação passam
- [ ] Todos os testes de leitura passam
- [ ] Todos os testes de atualização passam
- [ ] Todos os testes de exclusão passam
- [ ] Todos os testes de duplicação passam
- [ ] Todos os testes de auditoria passam
- [ ] Todos os testes de segurança passam
- [ ] Validação funciona corretamente
- [ ] Erros são tratados adequadamente
- [ ] Logging está funcionando

---

## 🎯 Próximos Passos

Após validar todos os testes:
1. ✅ Documentar resultados
2. ✅ Corrigir qualquer problema encontrado
3. ✅ Iniciar FASE 3 (Frontend)

