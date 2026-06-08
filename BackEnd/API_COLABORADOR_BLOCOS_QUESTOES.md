# API Colaborador - Blocos e Questões

Documentação completa da API para o workflow de criação de blocos e questões por colaboradores com aprovação administrada.

## Índice
- [Autenticação](#autenticação)
- [Blocos - Endpoints do Colaborador](#blocos---endpoints-do-colaborador)
- [Questões - Endpoints do Colaborador](#questões---endpoints-do-colaborador)
- [Admin - Endpoints de Aprovação](#admin---endpoints-de-aprovação)
- [Códigos de Status HTTP](#códigos-de-status-http)
- [Estrutura de Resposta](#estrutura-de-resposta)
- [Exemplos de Uso](#exemplos-de-uso)

---

## Autenticação

Todos os endpoints requerem autenticação via token JWT no header:

```
Authorization: Bearer <seu_token_jwt>
```

### Verificação de Permissões

- **Colaborador**: Deve ter `role: 'colaborador'` e `status_colaborador: 'aprovado'`
- **Admin**: Deve ter `role: 'admin'`

---

## Blocos - Endpoints do Colaborador

### 1. Criar Bloco
**Endpoint**: `POST /api/colaborador/blocos`

Criar um novo bloco de questões.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "titulo": "Conceitos de Álgebra Linear",
  "descricao": "Bloco introdutório sobre álgebra linear",
  "categoria": "Matemática Avançada",
  "ordem": 1,
  "ativo": true
}
```

**Parâmetros**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| titulo | string | Sim | Máximo 255 caracteres |
| descricao | string | Não | Descrição do bloco |
| categoria | string | Não | Categoria de classificação |
| ordem | number | Não | Ordem de apresentação (padrão: 0) |
| ativo | boolean | Não | Se o bloco está ativo (padrão: true) |

**Response (201 Created)**:
```json
{
  "sucesso": true,
  "mensagem": "Bloco criado com sucesso e aguardando aprovação",
  "dados": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "titulo": "Conceitos de Álgebra Linear",
    "descricao": "Bloco introdutório sobre álgebra linear",
    "categoria": "Matemática Avançada",
    "ordem": 1,
    "ativo": true,
    "autor_id": "user-123",
    "status_aprovacao": "pendente",
    "disciplina": "matematica",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Possíveis Erros**:
- `400 Bad Request`: Dados inválidos
- `403 Forbidden`: Colaborador não aprovado
- `500 Internal Server Error`: Erro no servidor

---

### 2. Listar Blocos
**Endpoint**: `GET /api/colaborador/blocos`

Listar todos os blocos criados pelo colaborador com filtros e paginação.

**Query Parameters**:
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| pagina | number | 1 | Número da página |
| limite | number | 20 | Itens por página (máx: 100) |
| status | string | - | 'pendente' \| 'aprovado' \| 'rejeitado' |
| busca | string | "" | Busca em título e descrição |
| ordenar | string | "data" | 'data' \| 'titulo' |

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Blocos listados com sucesso",
  "dados": {
    "blocos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "titulo": "Conceitos de Álgebra Linear",
        "descricao": "Bloco introdutório sobre álgebra linear",
        "categoria": "Matemática Avançada",
        "ordem": 1,
        "ativo": true,
        "status_aprovacao": "pendente",
        "questoes": [
          {
            "id": "q-123",
            "titulo": "O que é uma matriz?",
            "status_aprovacao": "pendente"
          }
        ],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "paginacao": {
      "pagina": 1,
      "limite": 20,
      "total": 5,
      "totalPaginas": 1
    },
    "estatisticas": {
      "total": 5,
      "pendentes": 3,
      "aprovados": 2,
      "rejeitados": 0
    }
  },
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

### 3. Obter Detalhes do Bloco
**Endpoint**: `GET /api/colaborador/blocos/:id`

Obter informações completas de um bloco específico.

**Path Parameters**:
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | UUID | ID do bloco |

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Bloco obtido com sucesso",
  "dados": {
    "bloco": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "titulo": "Conceitos de Álgebra Linear",
      "descricao": "Bloco introdutório sobre álgebra linear",
      "categoria": "Matemática Avançada",
      "ordem": 1,
      "ativo": true,
      "status_aprovacao": "pendente",
      "autor_id": "user-123",
      "disciplina": "matematica",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "questoes": [
      {
        "id": "q-123",
        "titulo": "O que é uma matriz?",
        "tipo": "multipla_escolha",
        "dificuldade": "facil",
        "pontos": 10,
        "status_aprovacao": "pendente"
      }
    ]
  },
  "timestamp": "2024-01-15T10:40:00Z"
}
```

**Possíveis Erros**:
- `404 Not Found`: Bloco não encontrado ou não pertence ao colaborador

---

### 4. Atualizar Bloco
**Endpoint**: `PUT /api/colaborador/blocos/:id`

Atualizar um bloco (apenas se estiver pendente).

**Request Body** (todos os campos opcionais):
```json
{
  "titulo": "Novo Título",
  "descricao": "Nova descrição",
  "categoria": "Nova Categoria",
  "ordem": 2,
  "ativo": false
}
```

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Bloco atualizado com sucesso",
  "dados": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "titulo": "Novo Título",
    "descricao": "Nova descrição",
    "categoria": "Nova Categoria",
    "ordem": 2,
    "ativo": false,
    "status_aprovacao": "pendente",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "timestamp": "2024-01-15T11:00:00Z"
}
```

**Possíveis Erros**:
- `403 Forbidden`: Bloco já foi aprovado ou rejeitado
- `404 Not Found`: Bloco não encontrado

---

### 5. Deletar Bloco
**Endpoint**: `DELETE /api/colaborador/blocos/:id`

Deletar um bloco (apenas se estiver pendente ou rejeitado).

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Bloco deletado com sucesso",
  "dados": null,
  "timestamp": "2024-01-15T11:05:00Z"
}
```

**Possíveis Erros**:
- `403 Forbidden`: Bloco já foi aprovado
- `404 Not Found`: Bloco não encontrado

---

## Questões - Endpoints do Colaborador

### 1. Criar Questão
**Endpoint**: `POST /api/colaborador/questoes`

Criar uma nova questão.

**Request Body** (para múltipla escolha):
```json
{
  "titulo": "O que é uma matriz?",
  "descricao": "Conceitos fundamentais sobre matrizes em álgebra linear",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "pontos": 10,
  "bloco_id": "550e8400-e29b-41d4-a716-446655440000",
  "opcoes": [
    {
      "texto": "Uma tabela de números organizada em linhas e colunas",
      "correta": true,
      "explicacao": "Correto! Uma matriz é justamente uma tabela de números."
    },
    {
      "texto": "Um tipo de equação matemática",
      "correta": false,
      "explicacao": "Incorreto. Uma equação é diferente de uma matriz."
    },
    {
      "texto": "Uma ferramenta para resolver sistemas lineares",
      "correta": false,
      "explicacao": "Embora matrizes sejam usadas para resolver sistemas, essa não é sua definição."
    }
  ]
}
```

**Request Body** (para texto/código):
```json
{
  "titulo": "Explique o conceito de determinante",
  "descricao": "Questão aberta sobre determinantes de matrizes",
  "tipo": "texto",
  "dificuldade": "medio",
  "pontos": 20,
  "bloco_id": "550e8400-e29b-41d4-a716-446655440000",
  "resposta_esperada": "O determinante é um número associado a uma matriz quadrada...",
  "explicacao": "Resposta modelo com pontos-chave..."
}
```

**Parâmetros**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| titulo | string | Sim | Máximo 255 caracteres |
| descricao | string | Sim | Descrição da questão |
| tipo | string | Sim | 'multipla_escolha' \| 'texto' \| 'codigo' |
| dificuldade | string | Sim | 'facil' \| 'medio' \| 'dificil' |
| pontos | number | Não | 1-100 (padrão: 10) |
| bloco_id | UUID | Não | ID do bloco (deve ser do colaborador) |
| opcoes | array | Não* | *Obrigatório para multipla_escolha |
| resposta_esperada | string | Não | Para texto/código |
| explicacao | string | Não | Explicação da resposta |

**Response (201 Created)**:
```json
{
  "sucesso": true,
  "mensagem": "Questão criada com sucesso e aguardando aprovação",
  "dados": {
    "id": "q-550e8400-e29b-41d4",
    "titulo": "O que é uma matriz?",
    "descricao": "Conceitos fundamentais sobre matrizes",
    "tipo": "multipla_escolha",
    "dificuldade": "facil",
    "pontos": 10,
    "status_aprovacao": "pendente",
    "autor_id": "user-123",
    "bloco_id": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T11:30:00Z"
  },
  "timestamp": "2024-01-15T11:30:00Z"
}
```

---

### 2. Listar Questões
**Endpoint**: `GET /api/colaborador/questoes`

Listar questões criadas pelo colaborador com filtros e paginação.

**Query Parameters**:
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| pagina | number | 1 | Número da página |
| limite | number | 20 | Itens por página |
| status | string | - | 'pendente' \| 'aprovada' \| 'rejeitada' |
| dificuldade | string | - | 'facil' \| 'medio' \| 'dificil' |
| tipo | string | - | 'multipla_escolha' \| 'texto' \| 'codigo' |
| bloco_id | UUID | - | Filtrar por bloco específico |
| busca | string | "" | Busca em título |
| ordenar | string | "data" | 'data' \| 'titulo' \| 'pontos' \| 'dificuldade' |

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Questões listadas com sucesso",
  "dados": {
    "questoes": [
      {
        "id": "q-123",
        "titulo": "O que é uma matriz?",
        "descricao": "Conceitos fundamentais",
        "tipo": "multipla_escolha",
        "dificuldade": "facil",
        "pontos": 10,
        "status_aprovacao": "pendente",
        "bloco": {
          "id": "b-123",
          "titulo": "Conceitos de Álgebra Linear",
          "status_aprovacao": "pendente"
        },
        "createdAt": "2024-01-15T11:30:00Z"
      }
    ],
    "paginacao": {
      "pagina": 1,
      "limite": 20,
      "total": 15,
      "totalPaginas": 1
    },
    "estatisticas": {
      "total": 15,
      "pendentes": 10,
      "aprovadas": 5,
      "rejeitadas": 0,
      "por_dificuldade": {
        "facil": 5,
        "medio": 7,
        "dificil": 3
      },
      "por_tipo": {
        "multipla_escolha": 10,
        "texto": 4,
        "codigo": 1
      }
    }
  },
  "timestamp": "2024-01-15T11:35:00Z"
}
```

---

### 3. Obter Detalhes da Questão
**Endpoint**: `GET /api/colaborador/questoes/:id`

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Questão obtida com sucesso",
  "dados": {
    "questao": {
      "id": "q-123",
      "titulo": "O que é uma matriz?",
      "descricao": "Conceitos fundamentais",
      "tipo": "multipla_escolha",
      "dificuldade": "facil",
      "pontos": 10,
      "status_aprovacao": "pendente",
      "opcoes": [
        {
          "texto": "Uma tabela de números",
          "correta": true,
          "explicacao": "Correto!"
        }
      ],
      "bloco": {
        "id": "b-123",
        "titulo": "Conceitos de Álgebra Linear"
      }
    }
  },
  "timestamp": "2024-01-15T11:40:00Z"
}
```

---

### 4. Atualizar Questão
**Endpoint**: `PUT /api/colaborador/questoes/:id`

Atualizar uma questão (apenas se estiver pendente).

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Questão atualizada com sucesso",
  "dados": {
    "id": "q-123",
    "titulo": "O que é uma matriz? (Versão Atualizada)",
    "dificuldade": "medio",
    "pontos": 15,
    "updatedAt": "2024-01-15T12:00:00Z"
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

### 5. Deletar Questão
**Endpoint**: `DELETE /api/colaborador/questoes/:id`

Deletar uma questão (apenas se estiver pendente ou rejeitada).

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Questão deletada com sucesso",
  "dados": null,
  "timestamp": "2024-01-15T12:05:00Z"
}
```

---

## Admin - Endpoints de Aprovação

### 1. Listar Blocos Pendentes
**Endpoint**: `GET /api/admin/blocos-pendentes`

Listar todos os blocos criados por colaboradores aguardando aprovação.

**Query Parameters**:
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| pagina | number | 1 | Número da página |
| limite | number | 20 | Itens por página |
| disciplina | string | - | Filtrar por disciplina |
| colaborador_id | UUID | - | Filtrar por colaborador |
| busca | string | "" | Busca em título |
| ordenar | string | "data" | 'data' \| 'titulo' \| 'colaborador' |

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Blocos pendentes listados com sucesso",
  "dados": {
    "blocos": [
      {
        "id": "b-123",
        "titulo": "Conceitos de Álgebra Linear",
        "descricao": "Introdução a álgebra linear",
        "status_aprovacao": "pendente",
        "autor": {
          "id": "user-123",
          "nome": "João Silva",
          "email": "joao@example.com",
          "disciplina_colaborador": "matematica"
        },
        "questoes": [
          {
            "id": "q-1",
            "titulo": "O que é uma matriz?",
            "status_aprovacao": "pendente"
          }
        ],
        "createdAt": "2024-01-15T11:30:00Z"
      }
    ],
    "paginacao": {
      "pagina": 1,
      "limite": 20,
      "total": 5,
      "totalPaginas": 1
    },
    "estatisticas": {
      "total_pendentes": 5,
      "total_aprovados": 12,
      "total_rejeitados": 2
    }
  },
  "timestamp": "2024-01-15T12:10:00Z"
}
```

---

### 2. Aprovar Bloco
**Endpoint**: `POST /api/admin/blocos/:id/aprovar`

Aprovar um bloco de colaborador.

**Request Body** (opcional):
```json
{
  "observacoes": "Excelente trabalho! Muito bem estruturado."
}
```

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Bloco aprovado com sucesso",
  "dados": {
    "id": "b-123",
    "titulo": "Conceitos de Álgebra Linear",
    "status_aprovacao": "aprovado",
    "aprovado_por_id": "admin-456",
    "data_aprovacao": "2024-01-15T12:15:00Z",
    "observacoes_admin": "Excelente trabalho!"
  },
  "timestamp": "2024-01-15T12:15:00Z"
}
```

---

### 3. Rejeitar Bloco
**Endpoint**: `POST /api/admin/blocos/:id/rejeitar`

Rejeitar um bloco de colaborador.

**Request Body** (obrigatório):
```json
{
  "motivo": "Título não é claro o suficiente",
  "observacoes": "Sugestão: Use um título mais descritivo"
}
```

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Bloco rejeitado",
  "dados": {
    "id": "b-123",
    "titulo": "Conceitos de Álgebra Linear",
    "status_aprovacao": "rejeitado",
    "rejeitado_por_id": "admin-456",
    "data_rejeicao": "2024-01-15T12:20:00Z",
    "motivo_rejeicao": "Título não é claro o suficiente",
    "observacoes_admin": "Sugestão: Use um título mais descritivo"
  },
  "timestamp": "2024-01-15T12:20:00Z"
}
```

---

### 4. Listar Questões de Colaborador Pendentes
**Endpoint**: `GET /api/admin/questoes-colaborador`

Listar todas as questões criadas por colaboradores aguardando aprovação.

**Query Parameters**:
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| pagina | number | 1 | Número da página |
| limite | number | 20 | Itens por página |
| status | string | 'pendente' | 'pendente' \| 'aprovada' \| 'rejeitada' |
| dificuldade | string | - | 'facil' \| 'medio' \| 'dificil' |
| tipo | string | - | 'multipla_escolha' \| 'texto' \| 'codigo' |
| disciplina | string | - | Filtrar por disciplina |
| colaborador_id | UUID | - | Filtrar por colaborador |
| bloco_id | UUID | - | Filtrar por bloco |
| busca | string | "" | Busca em título |
| ordenar | string | "data" | 'data' \| 'titulo' \| 'dificuldade' \| 'colaborador' |

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Questões de colaborador listadas com sucesso",
  "dados": {
    "questoes": [
      {
        "id": "q-123",
        "titulo": "O que é uma matriz?",
        "descricao": "Conceitos fundamentais",
        "tipo": "multipla_escolha",
        "dificuldade": "facil",
        "pontos": 10,
        "status_aprovacao": "pendente",
        "colaborador": {
          "id": "user-123",
          "nome": "João Silva",
          "email": "joao@example.com",
          "disciplina_colaborador": "matematica"
        },
        "bloco": {
          "id": "b-123",
          "titulo": "Conceitos de Álgebra Linear",
          "status_aprovacao": "pendente"
        },
        "createdAt": "2024-01-15T11:30:00Z"
      }
    ],
    "paginacao": {
      "pagina": 1,
      "limite": 20,
      "total": 25,
      "totalPaginas": 2
    },
    "estatisticas": {
      "total_pendentes": 25,
      "total_aprovadas": 45,
      "total_rejeitadas": 5,
      "por_dificuldade": {
        "facil": 10,
        "medio": 12,
        "dificil": 3
      },
      "por_tipo": {
        "multipla_escolha": 18,
        "texto": 6,
        "codigo": 1
      }
    }
  },
  "timestamp": "2024-01-15T12:25:00Z"
}
```

---

### 5. Aprovar Questão
**Endpoint**: `POST /api/admin/questoes/:id/aprovar`

Aprovar uma questão de colaborador.

**Request Body** (opcional):
```json
{
  "observacoes": "Questão bem estruturada com boas opções."
}
```

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Questão aprovada com sucesso",
  "dados": {
    "id": "q-123",
    "titulo": "O que é uma matriz?",
    "status_aprovacao": "aprovada",
    "aprovado_por_id": "admin-456",
    "data_aprovacao": "2024-01-15T12:30:00Z"
  },
  "timestamp": "2024-01-15T12:30:00Z"
}
```

---

### 6. Rejeitar Questão
**Endpoint**: `POST /api/admin/questoes/:id/rejeitar`

Rejeitar uma questão de colaborador.

**Request Body** (obrigatório):
```json
{
  "motivo": "Uma das respostas corretas está ambígua",
  "observacoes": "Recomendo revisar a segunda opção para torná-la mais clara"
}
```

**Response (200 OK)**:
```json
{
  "sucesso": true,
  "mensagem": "Questão rejeitada",
  "dados": {
    "id": "q-123",
    "titulo": "O que é uma matriz?",
    "status_aprovacao": "rejeitada",
    "rejeitado_por_id": "admin-456",
    "data_rejeicao": "2024-01-15T12:35:00Z",
    "motivo_rejeicao": "Uma das respostas corretas está ambígua"
  },
  "timestamp": "2024-01-15T12:35:00Z"
}
```

---

## Códigos de Status HTTP

| Código | Significado | Casos de Uso |
|--------|-------------|-------------|
| 200 | OK | Requisição bem-sucedida (GET, PUT, DELETE) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 400 | Bad Request | Dados inválidos ou incompletos |
| 403 | Forbidden | Sem permissão ou recurso não pertence ao usuário |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro no servidor |

---

## Estrutura de Resposta

### Sucesso
```json
{
  "sucesso": true,
  "mensagem": "Descrição da ação realizada",
  "dados": {},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Erro
```json
{
  "sucesso": false,
  "mensagem": "Descrição do erro",
  "erros": ["Erro específico 1", "Erro específico 2"],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Exemplos de Uso

### Exemplo 1: Criar um Bloco Completo com Questões

```bash
# 1. Autenticar e obter token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "colaborador@example.com", "password": "senha123"}'

# 2. Criar um bloco
curl -X POST http://localhost:3000/api/colaborador/blocos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Conceitos de Álgebra Linear",
    "descricao": "Introdução a álgebra linear",
    "categoria": "Matemática"
  }'

# 3. Criar questões no bloco
curl -X POST http://localhost:3000/api/colaborador/questoes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "O que é uma matriz?",
    "descricao": "Conceitos fundamentais",
    "tipo": "multipla_escolha",
    "dificuldade": "facil",
    "pontos": 10,
    "bloco_id": "<bloco_id>",
    "opcoes": [
      {"texto": "Uma tabela de números", "correta": true, "explicacao": "Correto!"},
      {"texto": "Um tipo de equação", "correta": false, "explicacao": "Não"}
    ]
  }'
```

### Exemplo 2: Admin Aprovando Questões

```bash
# 1. Listar questões pendentes
curl -X GET 'http://localhost:3000/api/admin/questoes-colaborador?status=pendente&limite=10' \
  -H "Authorization: Bearer <admin_token>"

# 2. Aprovar uma questão
curl -X POST http://localhost:3000/api/admin/questoes/<questao_id>/aprovar \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"observacoes": "Excelente questão!"}'
```

---

## Validações Importantes

### Blocos
- Título é obrigatório e máximo 255 caracteres
- Apenas blocos pendentes podem ser editados
- Apenas blocos pendentes ou rejeitados podem ser deletados

### Questões
- Múltipla Escolha: Deve ter 2-10 opções com pelo menos uma correta
- Texto/Código: Pode ter resposta esperada e explicação
- Pontos: Entre 1 e 100
- Apenas questões pendentes podem ser editadas
- Apenas questões pendentes ou rejeitadas podem ser deletadas

### Aprovação
- Motivo da rejeição é obrigatório
- Um bloco/questão só pode ser aprovado uma vez
- Um bloco/questão rejeitado pode ser recriado pelo colaborador

---

## Fluxo de Aprovação

```
Colaborador cria    →  Status: pendente
        ↓
    Admin revisa
        ↓
   ┌────┴────┐
   ↓         ↓
Aprovar   Rejeitar
   ↓         ↓
aprovado  rejeitado
        ↓
    Colaborador pode
    recriá-lo/editá-lo
```

---

## Segurança

- Todos os endpoints requerem autenticação via JWT
- Colaboradores só podem gerenciar seus próprios recursos
- Admins podem gerenciar todos os recursos
- Dados sensíveis são validados e sanitizados
- Histórico de aprovações/rejeições é mantido

---

## Rate Limiting (Futuro)

Recomendações:
- 100 requisições/minuto por colaborador
- 500 requisições/minuto por admin
- Limit headers na resposta: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Webhooks (Futuro)

Eventos possíveis:
- `bloco.criado`
- `bloco.aprovado`
- `bloco.rejeitado`
- `questao.criada`
- `questao.aprovada`
- `questao.rejeitada`
