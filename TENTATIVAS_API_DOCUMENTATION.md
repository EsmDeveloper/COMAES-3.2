# Documentação da API de Tentativas - COMAES

**Data:** 22 de Maio de 2026  
**Status:** Implementação Completa - Camada de Persistência  
**Objetivo:** Armazenar respostas dos participantes em torneios

---

## 📋 Visão Geral

A camada de persistência de tentativas permite que o sistema COMAES armazene todas as respostas dos participantes em torneios, criando uma fonte de verdade no backend para análise e ranking futuro.

### Características:
- ✅ Armazenamento de respostas individuais
- ✅ Cálculo automático de acertos/erros
- ✅ Cálculo automático de pontos
- ✅ Validação de inscrição no torneio
- ✅ Histórico completo de tentativas
- ✅ Estatísticas por disciplina

---

## 🗄️ Modelo de Dados

### Tabela: `tentativas_respostas`

```sql
CREATE TABLE tentativas_respostas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  torneio_id INT NOT NULL REFERENCES torneios(id) ON DELETE CASCADE,
  disciplina_competida ENUM('Matemática', 'Inglês', 'Programação') NOT NULL,
  questao_id INT NOT NULL REFERENCES perguntas(id) ON DELETE CASCADE,
  resposta_selecionada TEXT NOT NULL,
  resposta_correta TEXT NOT NULL,
  correta BOOLEAN DEFAULT FALSE,
  pontos_obtidos INT DEFAULT 0,
  tempo_gasto INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_torneio_id (torneio_id),
  INDEX idx_questao_id (questao_id),
  INDEX idx_usuario_torneio (usuario_id, torneio_id),
  INDEX idx_usuario_torneio_disciplina (usuario_id, torneio_id, disciplina_competida)
);
```

### Campos:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Identificador único |
| `usuario_id` | INTEGER | FK para usuário que respondeu |
| `torneio_id` | INTEGER | FK para torneio |
| `disciplina_competida` | ENUM | Matemática, Inglês ou Programação |
| `questao_id` | INTEGER | FK para questão respondida |
| `resposta_selecionada` | TEXT | Resposta que o usuário selecionou |
| `resposta_correta` | TEXT | Resposta correta da questão |
| `correta` | BOOLEAN | Se a resposta está correta |
| `pontos_obtidos` | INTEGER | Pontos ganhos (0 se errado) |
| `tempo_gasto` | INTEGER | Tempo em segundos (opcional) |
| `criado_em` | TIMESTAMP | Data/hora da tentativa |

---

## 🔌 Endpoints

### 1. Salvar Tentativa

**POST** `/api/tentativas`

Salva uma tentativa de resposta de um participante.

#### Autenticação:
- ✅ Requerida (Bearer Token)

#### Body:
```json
{
  "torneio_id": 1,
  "disciplina_competida": "Matemática",
  "questao_id": 5,
  "resposta_selecionada": "b",
  "tempo_gasto": 45
}
```

#### Validações:
1. ✅ Usuário autenticado
2. ✅ Usuário existe
3. ✅ Torneio existe
4. ✅ Usuário inscrito no torneio para a disciplina
5. ✅ Participante confirmado
6. ✅ Questão existe
7. ✅ Disciplina válida
8. ✅ Resposta não vazia

#### Resposta (201 Created):
```json
{
  "sucesso": true,
  "tentativa": {
    "id": 42,
    "questao_id": 5,
    "correta": true,
    "pontos_obtidos": 1,
    "resposta_correta": "b",
    "resposta_selecionada": "b"
  },
  "resumo": {
    "total_acertos": 8,
    "total_pontos": 12,
    "total_questoes": 15
  }
}
```

#### Erros Possíveis:

| Status | Erro | Descrição |
|--------|------|-----------|
| 401 | Usuário não autenticado | Token não fornecido ou inválido |
| 404 | Usuário não encontrado | Usuário não existe |
| 404 | Torneio não encontrado | Torneio não existe |
| 403 | Usuário não está inscrito | Não inscrito neste torneio/disciplina |
| 403 | Participante não confirmado | Status não é 'confirmado' |
| 404 | Questão não encontrada | Questão não existe |
| 400 | Disciplina inválida | Disciplina fora do ENUM |
| 400 | Resposta não pode estar vazia | Resposta vazia |
| 500 | Erro ao salvar tentativa | Erro interno do servidor |

---

### 2. Obter Histórico

**GET** `/api/tentativas/:torneio_id/:disciplina`

Obtém todas as tentativas de um usuário em um torneio e disciplina.

#### Autenticação:
- ✅ Requerida (Bearer Token)

#### Parâmetros:
- `torneio_id` (path): ID do torneio
- `disciplina` (path): Nome da disciplina (Matemática, Inglês, Programação)

#### Resposta (200 OK):
```json
{
  "sucesso": true,
  "tentativas": [
    {
      "id": 42,
      "questao_id": 5,
      "resposta_selecionada": "b",
      "resposta_correta": "b",
      "correta": true,
      "pontos_obtidos": 1,
      "tempo_gasto": 45,
      "criado_em": "2026-05-22T14:30:00.000Z"
    },
    {
      "id": 41,
      "questao_id": 4,
      "resposta_selecionada": "a",
      "resposta_correta": "c",
      "correta": false,
      "pontos_obtidos": 0,
      "tempo_gasto": 60,
      "criado_em": "2026-05-22T14:25:00.000Z"
    }
  ],
  "resumo": {
    "total_acertos": 8,
    "total_pontos": 12,
    "total_questoes": 15
  }
}
```

---

### 3. Obter Estatísticas

**GET** `/api/tentativas/stats/:torneio_id`

Obtém estatísticas agregadas de um usuário em um torneio.

#### Autenticação:
- ✅ Requerida (Bearer Token)

#### Parâmetros:
- `torneio_id` (path): ID do torneio

#### Resposta (200 OK):
```json
{
  "sucesso": true,
  "torneio_id": 1,
  "usuario_id": 5,
  "estatisticas": {
    "Matemática": {
      "total_questoes": 10,
      "total_acertos": 8,
      "taxa_acerto": "80.00%",
      "total_pontos": 8,
      "tempo_total_segundos": 450
    },
    "Inglês": {
      "total_questoes": 5,
      "total_acertos": 3,
      "taxa_acerto": "60.00%",
      "total_pontos": 3,
      "tempo_total_segundos": 200
    },
    "Programação": {
      "total_questoes": 0,
      "total_acertos": 0,
      "taxa_acerto": "0.00%",
      "total_pontos": 0,
      "tempo_total_segundos": 0
    }
  }
}
```

---

## 🔄 Fluxo de Funcionamento

### Sequência de Salvar Tentativa:

```
1. Frontend envia resposta
   ↓
2. Backend recebe POST /api/tentativas
   ↓
3. Validar autenticação (middleware auth)
   ↓
4. Validar usuário existe
   ↓
5. Validar torneio existe
   ↓
6. Validar inscrição no torneio
   ↓
7. Validar participante confirmado
   ↓
8. Validar questão existe
   ↓
9. Buscar resposta correta
   ↓
10. Comparar respostas (case-insensitive)
    ↓
11. Calcular pontos (questao.pontos se correta, 0 se errada)
    ↓
12. Salvar TentativaResposta no banco
    ↓
13. Calcular resumo (total acertos, total pontos)
    ↓
14. Retornar resposta com sucesso
```

---

## 📊 Exemplos de Uso

### Exemplo 1: Salvar Resposta Correta

```bash
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "torneio_id": 1,
    "disciplina_competida": "Matemática",
    "questao_id": 5,
    "resposta_selecionada": "b",
    "tempo_gasto": 45
  }'
```

**Resposta:**
```json
{
  "sucesso": true,
  "tentativa": {
    "id": 42,
    "questao_id": 5,
    "correta": true,
    "pontos_obtidos": 1,
    "resposta_correta": "b",
    "resposta_selecionada": "b"
  },
  "resumo": {
    "total_acertos": 8,
    "total_pontos": 12,
    "total_questoes": 15
  }
}
```

### Exemplo 2: Salvar Resposta Errada

```bash
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "torneio_id": 1,
    "disciplina_competida": "Matemática",
    "questao_id": 6,
    "resposta_selecionada": "a",
    "tempo_gasto": 60
  }'
```

**Resposta:**
```json
{
  "sucesso": true,
  "tentativa": {
    "id": 43,
    "questao_id": 6,
    "correta": false,
    "pontos_obtidos": 0,
    "resposta_correta": "c",
    "resposta_selecionada": "a"
  },
  "resumo": {
    "total_acertos": 8,
    "total_pontos": 12,
    "total_questoes": 16
  }
}
```

### Exemplo 3: Obter Histórico

```bash
curl -X GET http://localhost:3000/api/tentativas/1/Matemática \
  -H "Authorization: Bearer eyJhbGc..."
```

### Exemplo 4: Obter Estatísticas

```bash
curl -X GET http://localhost:3000/api/tentativas/stats/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🔐 Segurança

### Validações Implementadas:

1. ✅ **Autenticação:** Todos os endpoints requerem token JWT válido
2. ✅ **Autorização:** Usuário só pode ver suas próprias tentativas
3. ✅ **Validação de Inscrição:** Verifica se usuário está inscrito no torneio
4. ✅ **Validação de Status:** Verifica se participante está confirmado
5. ✅ **Validação de Dados:** Valida todos os campos de entrada
6. ✅ **Proteção contra Injeção:** Usa Sequelize ORM (prepared statements)

### Restrições:

- ❌ Usuário não autenticado não pode salvar tentativas
- ❌ Usuário não inscrito não pode responder
- ❌ Participante não confirmado não pode responder
- ❌ Usuário só vê suas próprias tentativas

---

## 📈 Impacto no Sistema

### O que NÃO foi alterado:

- ❌ Modelo Pergunta (sem mudanças)
- ❌ Endpoints `/perguntas/:area` (sem mudanças)
- ❌ Endpoints `/api/quiz/:area` (sem mudanças)
- ❌ Frontend (sem mudanças)
- ❌ Lógica de ranking (sem mudanças)
- ❌ Estrutura de questões (sem mudanças)

### O que foi adicionado:

- ✅ Modelo TentativaResposta
- ✅ Controller TentativasController
- ✅ Rotas de tentativas
- ✅ Tabela tentativas_respostas
- ✅ Migration para criar tabela
- ✅ 3 novos endpoints

### Próximos Passos:

1. Integrar ranking automático (chamar `calcularRanking` após salvar tentativa)
2. Integrar frontend para enviar respostas
3. Adicionar validação de tempo de torneio
4. Adicionar limite de tentativas por questão

---

## 🧪 Testes Recomendados

### Teste 1: Salvar Resposta Correta
```
POST /api/tentativas
- Verificar que correta = true
- Verificar que pontos_obtidos = questao.pontos
- Verificar que tentativa foi salva no banco
```

### Teste 2: Salvar Resposta Errada
```
POST /api/tentativas
- Verificar que correta = false
- Verificar que pontos_obtidos = 0
- Verificar que tentativa foi salva no banco
```

### Teste 3: Validação de Inscrição
```
POST /api/tentativas (usuário não inscrito)
- Verificar que retorna 403
- Verificar que tentativa NÃO foi salva
```

### Teste 4: Validação de Autenticação
```
POST /api/tentativas (sem token)
- Verificar que retorna 401
- Verificar que tentativa NÃO foi salva
```

### Teste 5: Obter Histórico
```
GET /api/tentativas/:torneio_id/:disciplina
- Verificar que retorna todas as tentativas do usuário
- Verificar que resumo está correto
```

### Teste 6: Obter Estatísticas
```
GET /api/tentativas/stats/:torneio_id
- Verificar que retorna estatísticas por disciplina
- Verificar que taxa_acerto está correta
```

---

## 📝 Notas Importantes

1. **Sem Alterações no Frontend:** O frontend continua funcionando normalmente. Este é apenas o backend de persistência.

2. **Sem Alterações no Ranking:** O ranking ainda não é atualizado automaticamente. Isso será feito no próximo passo.

3. **Comparação Case-Insensitive:** Respostas são comparadas sem considerar maiúsculas/minúsculas.

4. **Pontos Automáticos:** Pontos são calculados automaticamente baseado no campo `pontos` da questão.

5. **Histórico Completo:** Todas as tentativas são armazenadas, permitindo análise posterior.

---

**FIM DA DOCUMENTAÇÃO**

Implementação concluída em 22 de Maio de 2026.
