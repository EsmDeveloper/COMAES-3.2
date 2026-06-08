# 🔗 Guia de Integração - Teste Seu Conhecimento Melhorado

## 📋 Resumo

Este guia fornece as informações necessárias para integrar o novo sistema de teste melhorado com o backend.

---

## 🔄 Fluxo de Dados

```
Frontend (React)          Backend (Node/Express)       Database (MySQL)
─────────────────         ──────────────────────       ────────────────

[Teste.jsx]
    │
    ├─→ GET /api/questoes/quiz/{area}  ────→  [QuestoesController]  ────→ [questoes table]
    │                                                      │
    │   ← JSON questões                         Filtro por dificuldade
    │
    ├─→ POST /api/resultados            ────→  [ResultadosController] ────→ [resultados table]
    │   { area, percentual, pontos, ... }
    │
    └─→ GET /api/usuarios/me/melhores-desempenhos
                                          ────→  [UsuariosController]  ────→ [resultados table]
                                                   (agregação e histórico)
```

---

## 📡 Endpoints Esperados

### 1. Carregar Questões
**GET** `/api/questoes/quiz/{area}?limit=10&dificuldade=facil`

#### Request Parameters:
```javascript
{
  area: 'matematica' | 'programacao' | 'ingles',    // required
  limit: 10,                                         // default: 10
  dificuldade: 'facil' | 'medio' | 'dificil'       // optional
}
```

#### Expected Response:
```javascript
{
  success: true,
  data: [
    {
      id: 1,
      texto_pergunta: "Qual é 2 + 2?",              // mapeado para 'enunciado'
      enunciado: "Qual é 2 + 2?",
      questao: "Qual é 2 + 2?",
      contexto: "Operações básicas",                // optional
      tipo: "multiple",
      opcao_a: "3",
      opcao_b: "4",
      opcao_c: "5",
      opcao_d: "6",
      resposta_correta: "4",                        // deve ser o texto exato
      dificuldade: "facil",
      explicacao: "2 + 2 = 4 porque...",            // optional
      dica: "Conte nos dedos",                      // optional
      pontos: 10,
      categoria: "matematica",
      area: "matematica"
    }
    // ... mais questões
  ]
}
```

#### Mapeamento de Campos (Importante):
```
API Backend         →  Frontend (Teste.jsx)
─────────────────────────────────────────
texto_pergunta      →  enunciado
opcao_a/b/c/d      →  opcoes (array)
resposta_correta    →  resposta_correta (deve ser exato, case-insensitive)
dificuldade         →  dificuldade
pontos              →  pontos
```

---

### 2. Salvar Resultado
**POST** `/api/resultados`

#### Headers:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

#### Request Body:
```javascript
{
  area: 'matematica' | 'programacao' | 'ingles',
  percentual: 80,                // 0-100
  pontos: 150,                   // pontos totais ganhos
  total_questoes: 10,
  acertos: 8,
  xp: 120,                       // XP ganho (opcional)
  tempo_gasto: 240,              // segundos (opcional)
  melhor_sequencia: 5            // streak (opcional)
}
```

#### Expected Response:
```javascript
{
  success: true,
  message: "Resultado salvo com sucesso",
  melhores_desempenhos: {
    matematica: 85,
    programacao: 70,
    ingles: 60
  },
  xp_total: 2450                 // XP total do usuário
}
```

---

### 3. Carregar Melhores Desempenhos
**GET** `/api/usuarios/me/melhores-desempenhos`

#### Headers:
```javascript
{
  'Authorization': `Bearer ${token}`
}
```

#### Expected Response:
```javascript
{
  success: true,
  data: {
    matematica: 85,              // percentual
    programacao: null,           // null se nunca tentou
    ingles: 70
  }
}
```

---

## 🗄️ Estrutura de Banco de Dados

### Tabela: questoes
```sql
CREATE TABLE questoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  texto_pergunta VARCHAR(500) NOT NULL,
  enunciado VARCHAR(500),
  contexto TEXT,
  tipo VARCHAR(20) DEFAULT 'multiple',
  opcao_a VARCHAR(200),
  opcao_b VARCHAR(200),
  opcao_c VARCHAR(200),
  opcao_d VARCHAR(200),
  resposta_correta VARCHAR(200),
  dificuldade VARCHAR(20) DEFAULT 'medio',
  explicacao TEXT,
  dica TEXT,
  pontos INT DEFAULT 10,
  categoria VARCHAR(50),
  area VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_area (area),
  INDEX idx_dificuldade (dificuldade),
  INDEX idx_categoria (categoria)
);
```

### Tabela: resultados
```sql
CREATE TABLE resultados (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  area VARCHAR(50) NOT NULL,
  percentual INT,
  pontos INT,
  total_questoes INT,
  acertos INT,
  xp_ganho INT,
  tempo_gasto INT,
  melhor_sequencia INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_area (area),
  INDEX idx_data (created_at)
);
```

### View: melhores_desempenhos
```sql
CREATE VIEW melhores_desempenhos AS
SELECT 
  usuario_id,
  area,
  MAX(percentual) as melhor_percentual,
  COUNT(*) as tentativas,
  MAX(created_at) as ultima_tentativa
FROM resultados
GROUP BY usuario_id, area;
```

---

## 🔐 Validações Requeridas

### No Backend:

1. **Questão deve ter resposta_correta exata**
   ```javascript
   // ❌ Errado
   resposta_correta: " Paris " // espaços extras
   
   // ✅ Correto
   resposta_correta: "Paris"
   ```

2. **Opções devem existir**
   ```javascript
   // Verificar que opcoes [A,B,C,D] estão preenchidas
   if (!opcao_a || !opcao_b || !opcao_c || !opcao_d) {
     throw new Error('Todas as opções devem ser preenchidas');
   }
   ```

3. **Limite de questões**
   ```javascript
   // Máximo 20 questões por request
   const limit = Math.min(queryLimit, 20);
   ```

4. **Validação de área**
   ```javascript
   const validAreas = ['matematica', 'programacao', 'ingles'];
   if (!validAreas.includes(area)) {
     return res.status(400).json({ error: 'Área inválida' });
   }
   ```

---

## 🎮 Estados do Quiz

```
[select] → Usuário escolhe área + dificuldade
   ↓
[quiz] → Carrega questões
   ↓
   Usuário responde (handleAnswer)
   ├─ Correto → +pontos +xp +streak
   ├─ Errado → -streak
   └─ Timeout → -streak
   ↓
[result] → POST /api/resultados
   ↓
   Exibe resultado + sugestões
```

---

## 🧪 Teste de Integração (cURL)

### 1. Carregar Questões
```bash
curl -X GET "http://localhost:3000/api/questoes/quiz/matematica?limit=10&dificuldade=facil" \
  -H "Content-Type: application/json"
```

### 2. Salvar Resultado
```bash
curl -X POST "http://localhost:3000/api/resultados" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "area": "matematica",
    "percentual": 80,
    "pontos": 150,
    "total_questoes": 10,
    "acertos": 8,
    "xp": 120,
    "tempo_gasto": 240,
    "melhor_sequencia": 5
  }'
```

### 3. Carregar Melhores Desempenhos
```bash
curl -X GET "http://localhost:3000/api/usuarios/me/melhores-desempenhos" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Possíveis Problemas e Soluções

### Problema 1: Questões não carregam
**Causa:** API retorna 404 ou erro no mapeamento de dados
**Solução:** Verificar se:
- O endpoint existe e retorna dados
- Os campos `opcao_a/b/c/d` existem
- O campo `resposta_correta` tem o valor exato

### Problema 2: Feedback mostra "indefinido"
**Causa:** Campo `explicacao` não existe na questão
**Solução:** 
- Adicionar `explicacao` ao banco de dados
- Ou deixar como campo optional no schema

### Problema 3: Resultado não salva
**Causa:** Token expirado ou usuário não autenticado
**Solução:**
- Verificar token na requisição
- Confirmar que `Authorization` header está correto

### Problema 4: Performance lenta
**Causa:** Query sem índices
**Solução:**
- Adicionar índices em `area`, `dificuldade`
- Limitar queries com paginação

---

## 📊 Exemplo de Query Backend (Node/Sequelize)

```javascript
// controllers/QuestoesController.js

async getQuizQuestoes(req, res) {
  try {
    const { area } = req.params;
    const { limit = 10, dificuldade } = req.query;

    // Validação
    if (!['matematica', 'programacao', 'ingles'].includes(area)) {
      return res.status(400).json({ error: 'Área inválida' });
    }

    // Build query
    const where = { area };
    if (dificuldade) where.dificuldade = dificuldade;

    // Fetch
    const questoes = await Questao.findAll({
      where,
      limit: Math.min(parseInt(limit), 20),
      order: [Sequelize.fn('RAND')],  // Random order
      raw: true
    });

    // Mapear resposta
    const mapped = questoes.map(q => ({
      id: q.id,
      texto_pergunta: q.texto_pergunta,
      enunciado: q.enunciado,
      contexto: q.contexto,
      tipo: q.tipo,
      opcao_a: q.opcao_a,
      opcao_b: q.opcao_b,
      opcao_c: q.opcao_c,
      opcao_d: q.opcao_d,
      resposta_correta: q.resposta_correta,
      dificuldade: q.dificuldade,
      explicacao: q.explicacao,
      dica: q.dica,
      pontos: q.pontos
    }));

    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar questões' });
  }
}
```

---

## 🚀 Checklist de Implementação

- [ ] Endpoint GET `/api/questoes/quiz/{area}` implementado
- [ ] Endpoint POST `/api/resultados` implementado
- [ ] Endpoint GET `/api/usuarios/me/melhores-desempenhos` implementado
- [ ] Tabela `questoes` criada e populada
- [ ] Tabela `resultados` criada
- [ ] Campos `explicacao` e `dica` adicionados (opcional)
- [ ] Índices no banco de dados criados
- [ ] Testes de integração passando
- [ ] CORS configurado corretamente
- [ ] Autenticação funcionando

---

**Versão:** 1.0.0  
**Status:** 📝 Documentação Completa  
**Data:** Junho 2026  
**Autor:** Kiro
