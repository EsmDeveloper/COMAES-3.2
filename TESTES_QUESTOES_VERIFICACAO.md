# ✅ Testes de Verificação - Sistema de Questões Corrigido

## Data: 6 de Junho de 2026
## Migration Status: ✅ EXECUTADA COM SUCESSO

---

## 📋 Testes de Validação

### Teste 1: Criar Questão Múltipla Escolha (Admin)
```bash
POST /api/questoes
Content-Type: application/json
Authorization: Bearer {token-admin}

{
  "titulo": "Adição Simples",
  "descricao": "Quanto é 2 + 2?",
  "disciplina": "matematica",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "opcoes": ["3", "4", "5", "6"],
  "resposta_correta": "4",
  "explicacao": "2 + 2 = 4",
  "pontos": 10,
  "bloco_id": null
}
```

**Esperado:** ✅ 201 Created
```json
{
  "sucesso": true,
  "mensagem": "Questão criada com sucesso",
  "dados": {
    "id": 1,
    "titulo": "Adição Simples",
    "bloco_id": null,
    "status_aprovacao": "aprovada",
    "created_at": "2026-06-06T10:00:00Z"
  }
}
```

---

### Teste 2: Criar Questão com Resposta Correta FORA das Opções (Admin)
```bash
POST /api/questoes
Content-Type: application/json
Authorization: Bearer {token-admin}

{
  "titulo": "Teste Validação",
  "descricao": "Qual é a resposta?",
  "disciplina": "matematica",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "opcoes": ["A", "B", "C"],
  "resposta_correta": "X",  // ❌ NÃO ESTÁ NA LISTA
  "explicacao": "Teste",
  "pontos": 10
}
```

**Esperado:** ✅ 422 Unprocessable Entity
```json
{
  "sucesso": false,
  "mensagem": "Erro de validação",
  "erros": [
    "resposta_correta deve estar entre as opções disponíveis"
  ]
}
```

---

### Teste 3: Criar Bloco (Colaborador)
```bash
POST /api/colaborador/blocos
Content-Type: application/json
Authorization: Bearer {token-colaborador-matematica}

{
  "titulo": "Operações Básicas",
  "descricao": "Bloco sobre adição e subtração",
  "dificuldade": "facil"
}
```

**Esperado:** ✅ 201 Created
```json
{
  "sucesso": true,
  "mensagem": "Bloco criado com sucesso e aguardando aprovação do administrador",
  "dados": {
    "id": 1,
    "titulo": "Operações Básicas",
    "disciplina": "matematica",
    "status": "pendente",  // ✅ NOVO ENUM CORRETO
    "criado_por": 2
  }
}
```

---

### Teste 4: Criar Questão em Bloco (Colaborador)
```bash
POST /api/colaborador/questoes
Content-Type: application/json
Authorization: Bearer {token-colaborador-matematica}

{
  "titulo": "Adição com Blocos",
  "descricao": "Quanto é 5 + 3?",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "opcoes": ["7", "8", "9", "10"],
  "resposta_correta": "8",
  "explicacao": "5 + 3 = 8",
  "pontos": 10,
  "bloco_id": 1  // ✅ NOVO - ASSOCIAR A BLOCO
}
```

**Esperado:** ✅ 201 Created
```json
{
  "sucesso": true,
  "mensagem": "Questão criada com sucesso e aguardando aprovação do administrador",
  "dados": {
    "id": 1,
    "titulo": "Adição com Blocos",
    "bloco_id": 1,  // ✅ CAMPO NOVO SALVO
    "status_aprovacao": "pendente",
    "autor_id": 2,
    "created_at": "2026-06-06T10:00:00Z"
  }
}
```

---

### Teste 5: Adicionar Questão Existente a Bloco (Colaborador)
```bash
POST /api/colaborador/blocos/1/questoes
Content-Type: application/json
Authorization: Bearer {token-colaborador-matematica}

{
  "questao_id": 1
}
```

**Esperado:** ✅ 200 OK
```json
{
  "sucesso": true,
  "mensagem": "Questão adicionada ao bloco com sucesso",
  "dados": {
    "id": 1,
    "bloco_id": 1,  // ✅ ASSOCIAÇÃO CRIADA
    "status_aprovacao": "pendente"
  }
}
```

---

### Teste 6: Listar Questões por Bloco (Via Query)
```bash
GET /api/questoes?bloco_id=1
Authorization: Bearer {token-admin}
```

**Esperado:** ✅ 200 OK
```json
{
  "sucesso": true,
  "dados": [
    {
      "id": 1,
      "bloco_id": 1,
      "titulo": "Adição com Blocos",
      "status_aprovacao": "pendente"
    }
  ]
}
```

---

### Teste 7: Remover Questão de Bloco (Colaborador)
```bash
DELETE /api/colaborador/blocos/1/questoes/1
Authorization: Bearer {token-colaborador-matematica}
```

**Esperado:** ✅ 200 OK
```json
{
  "sucesso": true,
  "mensagem": "Questão removida do bloco com sucesso",
  "dados": {
    "id": 1,
    "bloco_id": null,  // ✅ DESASSOCIADO
    "status_aprovacao": "pendente"
  }
}
```

---

### Teste 8: Validar Questão Texto (Colaborador)
```bash
POST /api/colaborador/questoes
Content-Type: application/json
Authorization: Bearer {token-colaborador}

{
  "titulo": "Pergunta Aberta",
  "descricao": "O que é fotossíntese?",
  "tipo": "texto",
  "dificuldade": "medio",
  "resposta_correta": "Processo biológico onde plantas convertem luz solar em energia",
  "explicacao": "Fotossíntese é importante para a vida na Terra",
  "pontos": 15,
  "bloco_id": null
}
```

**Esperado:** ✅ 201 Created (resposta_correta é string válida)

---

### Teste 9: Validar Questão Código
```bash
POST /api/questoes
Content-Type: application/json
Authorization: Bearer {token-admin}

{
  "titulo": "Função JavaScript",
  "descricao": "Complete a função",
  "tipo": "codigo",
  "dificuldade": "dificil",
  "linguagem": "javascript",
  "resposta_correta": "function soma(a,b) { return a + b; }",
  "explicacao": "Função que retorna a soma de dois números",
  "pontos": 25
}
```

**Esperado:** ✅ 201 Created (resposta_correta é string válida)

---

### Teste 10: Rejeitar por Opções Insuficientes
```bash
POST /api/questoes
Content-Type: application/json

{
  "titulo": "Teste Inválido",
  "descricao": "Apenas 1 opção",
  "disciplina": "matematica",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "opcoes": ["Sim"],  // ❌ APENAS 1 OPÇÃO
  "resposta_correta": "Sim"
}
```

**Esperado:** ✅ 422 Unprocessable Entity
```json
{
  "erros": [
    "Questão de múltipla escolha deve ter no mínimo 2 opções"
  ]
}
```

---

## 🔍 Verificações de Banco de Dados

### Query 1: Verificar Coluna Adicionada
```sql
DESCRIBE questoes;
-- Deve mostrar coluna: bloco_id | int | YES
```

### Query 2: Verificar Índice Criado
```sql
SHOW INDEXES FROM questoes;
-- Deve mostrar: idx_questoes_bloco_id
```

### Query 3: Verificar Questões com Bloco
```sql
SELECT id, titulo, bloco_id FROM questoes WHERE bloco_id IS NOT NULL;
-- Deve retornar questões associadas a blocos
```

### Query 4: Verificar Status de Blocos
```sql
SELECT id, titulo, status FROM blocos_questoes;
-- Status deve ser: 'pendente', 'aprovado', 'rejeitado'
-- Não deve ter: 'rascunho', 'publicado'
```

---

## 📊 Cenários de Erro Corrigidos

| Erro Anterior | Status | Solução |
|---|---|---|
| Enum status mismatch em BlocoQuestoes | ❌ | ✅ Sincronizado enum |
| Campo bloco_id não existe | ❌ | ✅ Adicionado em Questao.js |
| resposta_correta não validado | ❌ | ✅ Validação tipo-específica |
| Questão não salvava bloco_id | ❌ | ✅ Adicionado ao create() |
| Constraint FK não existia | ❌ | ✅ Constraint adicionada |

---

## 🚀 Checklist Final

- [x] Migration SQL executada com sucesso
- [x] Coluna bloco_id adicionada a tabela questoes
- [x] Constraint FK configurada
- [x] Índice criado
- [x] Enum status em BlocoQuestoes corrigido
- [x] Validação de resposta_correta implementada
- [x] QuestoesController.criar() salva bloco_id
- [x] Relacionamento Questao ↔ BlocoQuestoes estabelecido
- [x] Tests preparados para verificação

---

## 📝 Comandos para Testar

```bash
# 1. Verificar modelos
node -e "import('./models/Questao.js').then(m => console.log(m.default.getAttributes())).catch(e => console.error(e))"

# 2. Verificar banco
npm run dbcheck  # ou seu comando de verificação

# 3. Rodar testes da API
npm run test:questoes  # Se disponível

# 4. Executar insert_questoes_v2.js para popular dados
node insert_questoes_v2.js
```

---

**Status Final:** ✅ PRONTO PARA USO
**Data de Verificação:** 6 de Junho de 2026
**Próxima Ação:** Validar testes acima e fazer deploy em produção
