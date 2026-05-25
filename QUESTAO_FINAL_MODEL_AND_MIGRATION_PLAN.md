# MODELO FINAL QUESTÃO + PLANO DE MIGRAÇÃO SEGURO

**Data**: 22 de Maio de 2026  
**Status**: Definição Final + Estratégia de Migração  
**Objetivo**: Consolidar múltiplos modelos de questões em um único modelo `Questao`

---

## 📋 ÍNDICE

1. [Estrutura SQL Final](#estrutura-sql-final)
2. [Regras do Modelo](#regras-do-modelo)
3. [Exemplos de Registros](#exemplos-de-registros)
4. [Compatibilidade com Sistema Atual](#compatibilidade-com-sistema-atual)
5. [Plano de Migração (3 Fases)](#plano-de-migração-3-fases)
6. [Plano de Rollback](#plano-de-rollback)
7. [Impacto no Backend e Frontend](#impacto-no-backend-e-frontend)
8. [Checklist de Execução](#checklist-de-execução)

---

## 🗄️ ESTRUTURA SQL FINAL

### Tabela: `questoes` (NOVA - MODELO ÚNICO)

```sql
CREATE TABLE `questoes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  
  -- Relacionamento
  `torneio_id` INT(11) NOT NULL,
  
  -- Identificação
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` TEXT NOT NULL,
  
  -- Classificação
  `disciplina` ENUM('matematica', 'ingles', 'programacao') NOT NULL,
  `tipo` ENUM('multipla_escolha', 'texto', 'codigo') NOT NULL,
  `dificuldade` ENUM('facil', 'medio', 'dificil') NOT NULL,
  
  -- Conteúdo
  `opcoes` JSON DEFAULT NULL COMMENT 'Array de opções para múltipla escolha',
  `resposta_correta` TEXT NOT NULL COMMENT 'Resposta esperada (string comparável)',
  `explicacao` TEXT DEFAULT NULL COMMENT 'Explicação da resposta',
  
  -- Pontuação
  `pontos` INT(11) DEFAULT 10,
  
  -- Específico de Programação
  `linguagem` VARCHAR(50) DEFAULT NULL COMMENT 'Linguagem de programação (javascript, python, etc)',
  
  -- Mídia
  `midia` JSON DEFAULT NULL COMMENT 'URLs de imagens, vídeos, etc',
  
  -- Timestamps
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_torneio_id` (`torneio_id`),
  KEY `idx_disciplina` (`disciplina`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_dificuldade` (`dificuldade`),
  KEY `idx_torneio_disciplina` (`torneio_id`, `disciplina`),
  
  CONSTRAINT `fk_questoes_torneio` 
    FOREIGN KEY (`torneio_id`) 
    REFERENCES `torneios` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tabelas Antigas (MANTIDAS TEMPORARIAMENTE)

```
questoes_matematica    ← Leitura apenas (durante migração)
questoes_ingles        ← Leitura apenas (durante migração)
questoes_programacao   ← Leitura apenas (durante migração)
perguntas              ← Leitura apenas (durante migração)
```

---

## 📐 REGRAS DO MODELO

### 1. **Disciplina vs Tipo**

| Campo | Valores | Significado |
|-------|---------|-------------|
| `disciplina` | matematica, ingles, programacao | **Contexto**: qual matéria é |
| `tipo` | multipla_escolha, texto, codigo | **Formato**: como responder |

**Exemplos**:
- Questão de Matemática com múltipla escolha: `disciplina='matematica'`, `tipo='multipla_escolha'`
- Questão de Programação com código: `disciplina='programacao'`, `tipo='codigo'`
- Questão de Inglês com texto: `disciplina='ingles'`, `tipo='texto'`

### 2. **Campo `opcoes` (JSON Array)**

```javascript
// Múltipla Escolha
{
  "opcoes": [
    "Opção A",
    "Opção B",
    "Opção C",
    "Opção D"
  ]
}

// Programação (código inicial + testes)
{
  "opcoes": {
    "codigo_inicial": "function soma(a, b) {\n  // TODO\n}",
    "testes": [
      { "entrada": [1, 2], "saida": 3 },
      { "entrada": [5, 3], "saida": 8 }
    ]
  }
}

// Texto (sem opções)
{
  "opcoes": null
}
```

### 3. **Campo `resposta_correta` (STRING Comparável)**

```javascript
// Múltipla Escolha
"resposta_correta": "B"  // Índice da opção (A, B, C, D)

// Texto
"resposta_correta": "Paris"  // Resposta esperada

// Programação
"resposta_correta": "function soma(a, b) {\n  return a + b;\n}"
```

### 4. **Validações Obrigatórias**

| Campo | Regra |
|-------|-------|
| `torneio_id` | Obrigatório, FK válida |
| `titulo` | 5-255 caracteres |
| `descricao` | 10-5000 caracteres |
| `disciplina` | Deve ser um dos ENUMs |
| `tipo` | Deve ser um dos ENUMs |
| `dificuldade` | facil, medio, dificil |
| `resposta_correta` | Obrigatório, não vazio |
| `pontos` | 1-1000, default 10 |
| `linguagem` | Obrigatório se `tipo='codigo'` |

### 5. **Defaults por Disciplina**

| Disciplina | Tipo Padrão | Pontos Padrão | Linguagem |
|-----------|------------|---------------|-----------|
| matematica | multipla_escolha | 10 | - |
| ingles | multipla_escolha | 10 | - |
| programacao | codigo | 15 | javascript |

---

## 📝 EXEMPLOS DE REGISTROS

### Exemplo 1: Questão de Matemática (Múltipla Escolha)

```json
{
  "id": 1,
  "torneio_id": 1,
  "titulo": "Qual é o resultado de 2 + 2?",
  "descricao": "Questão básica de aritmética para testar conhecimento de adição",
  "disciplina": "matematica",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "opcoes": ["3", "4", "5", "6"],
  "resposta_correta": "B",
  "explicacao": "2 + 2 = 4, portanto a resposta correta é B",
  "pontos": 10,
  "linguagem": null,
  "midia": {
    "imagem": "https://cdn.example.com/math-q1.png"
  },
  "created_at": "2026-05-22T10:00:00Z",
  "updated_at": "2026-05-22T10:00:00Z"
}
```

### Exemplo 2: Questão de Inglês (Múltipla Escolha)

```json
{
  "id": 2,
  "torneio_id": 1,
  "titulo": "What is the capital of France?",
  "descricao": "Teste de conhecimento geográfico em inglês",
  "disciplina": "ingles",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "opcoes": ["London", "Paris", "Berlin", "Madrid"],
  "resposta_correta": "B",
  "explicacao": "Paris é a capital da França",
  "pontos": 10,
  "linguagem": null,
  "midia": null,
  "created_at": "2026-05-22T10:05:00Z",
  "updated_at": "2026-05-22T10:05:00Z"
}
```

### Exemplo 3: Questão de Programação (Código)

```json
{
  "id": 3,
  "torneio_id": 1,
  "titulo": "Implemente uma função de soma",
  "descricao": "Escreva uma função que soma dois números e retorna o resultado",
  "disciplina": "programacao",
  "tipo": "codigo",
  "dificuldade": "facil",
  "opcoes": {
    "codigo_inicial": "function soma(a, b) {\n  // TODO: implemente aqui\n}",
    "testes": [
      { "entrada": [1, 2], "saida": 3 },
      { "entrada": [5, 3], "saida": 8 },
      { "entrada": [-1, 1], "saida": 0 }
    ]
  },
  "resposta_correta": "function soma(a, b) {\n  return a + b;\n}",
  "explicacao": "A função deve retornar a soma dos dois parâmetros",
  "pontos": 15,
  "linguagem": "javascript",
  "midia": null,
  "created_at": "2026-05-22T10:10:00Z",
  "updated_at": "2026-05-22T10:10:00Z"
}
```

### Exemplo 4: Questão de Programação (Python)

```json
{
  "id": 4,
  "torneio_id": 1,
  "titulo": "Implemente uma função de fibonacci",
  "descricao": "Escreva uma função que retorna o n-ésimo número de fibonacci",
  "disciplina": "programacao",
  "tipo": "codigo",
  "dificuldade": "medio",
  "opcoes": {
    "codigo_inicial": "def fibonacci(n):\n    # TODO: implemente aqui\n    pass",
    "testes": [
      { "entrada": [0], "saida": 0 },
      { "entrada": [1], "saida": 1 },
      { "entrada": [5], "saida": 5 },
      { "entrada": [10], "saida": 55 }
    ]
  },
  "resposta_correta": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "explicacao": "Implementação recursiva da sequência de fibonacci",
  "pontos": 20,
  "linguagem": "python",
  "midia": null,
  "created_at": "2026-05-22T10:15:00Z",
  "updated_at": "2026-05-22T10:15:00Z"
}
```

---

## 🔄 COMPATIBILIDADE COM SISTEMA ATUAL

### Estratégia de Compatibilidade Temporária

Durante a migração, o sistema funcionará em **modo híbrido**:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (SEM MUDANÇAS)              │
│  AdminDashboard → POST /api/questoes/:modalidade        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND - CAMADA DE COMPATIBILIDADE        │
│                                                         │
│  QuestoesController (MANTÉM MESMOS ENDPOINTS)          │
│  ├─ POST /api/questoes/:modalidade                     │
│  ├─ GET /api/questoes/:modalidade/:id                  │
│  ├─ PUT /api/questoes/:modalidade/:id                  │
│  └─ DELETE /api/questoes/:modalidade/:id               │
│                                                         │
│  questoesService (ADAPTADO PARA NOVO MODELO)           │
│  ├─ Escreve em: questoes (NOVA)                        │
│  ├─ Lê de: questoes_* (ANTIGAS) + questoes (NOVA)      │
│  └─ Converte dados automaticamente                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                       │
│                                                         │
│  questoes (NOVA) ← Escrita                             │
│  questoes_matematica (ANTIGA) ← Leitura                │
│  questoes_ingles (ANTIGA) ← Leitura                    │
│  questoes_programacao (ANTIGA) ← Leitura               │
│  perguntas (ANTIGA) ← Leitura                          │
└─────────────────────────────────────────────────────────┘
```

### Mapeamento de Compatibilidade

```javascript
// Quando recebe POST /api/questoes/matematica
// O sistema:
// 1. Valida dados (mesmo que antes)
// 2. Cria em questoes (NOVA) com disciplina='matematica'
// 3. Retorna resposta no formato antigo (compatível)

// Quando recebe GET /api/questoes/torneio/1?modalidade=matematica
// O sistema:
// 1. Busca em questoes (NOVA) com disciplina='matematica'
// 2. Se não encontrar, busca em questoes_matematica (ANTIGA)
// 3. Retorna resultado unificado
```

---

## 🚀 PLANO DE MIGRAÇÃO (3 FASES)

### FASE 1: Preparação e Criação da Nova Tabela (SEM DOWNTIME)

**Duração**: ~30 minutos  
**Risco**: BAIXO  
**Downtime**: NÃO

#### Passos:

1. **Criar tabela `questoes` (NOVA)**
   ```bash
   # Executar migration
   npm run migrate:create-questoes
   ```

2. **Criar modelo Sequelize `Questao.js`**
   ```javascript
   // BackEnd/models/Questao.js
   // Define estrutura da nova tabela
   ```

3. **Atualizar `questoesService.js`**
   - Adicionar suporte para leitura/escrita em `questoes`
   - Manter compatibilidade com tabelas antigas
   - Implementar função de conversão de dados

4. **Testar em ambiente de staging**
   - Criar questões via API
   - Verificar se são gravadas em `questoes`
   - Verificar se endpoints antigos continuam funcionando

5. **Deploy em produção**
   - Fazer backup do banco
   - Executar migration
   - Monitorar logs

**Checklist FASE 1**:
- [ ] Tabela `questoes` criada
- [ ] Modelo `Questao.js` criado
- [ ] `questoesService.js` atualizado
- [ ] Testes em staging passando
- [ ] Backup realizado
- [ ] Deploy em produção
- [ ] Monitoramento ativo

---

### FASE 2: Migração de Dados (COM VALIDAÇÃO)

**Duração**: ~1-2 horas  
**Risco**: MÉDIO  
**Downtime**: NÃO (migração em background)

#### Passos:

1. **Criar script de migração**
   ```bash
   # BackEnd/scripts/migrateQuestoes.js
   # Migra dados de questoes_* para questoes
   ```

2. **Executar migração em background**
   ```bash
   npm run migrate:questoes
   ```

3. **Validar integridade dos dados**
   ```bash
   npm run validate:questoes
   ```

4. **Comparar dados antigos vs novos**
   - Contar registros em cada tabela
   - Verificar campos críticos
   - Validar relacionamentos

5. **Atualizar endpoints para priorizar nova tabela**
   - Ler de `questoes` primeiro
   - Fallback para tabelas antigas se não encontrar

**Checklist FASE 2**:
- [ ] Script de migração criado
- [ ] Dados migrados com sucesso
- [ ] Validação de integridade passou
- [ ] Contagem de registros bate
- [ ] Endpoints testados
- [ ] Monitoramento ativo

---

### FASE 3: Consolidação e Limpeza (APÓS VALIDAÇÃO)

**Duração**: ~30 minutos  
**Risco**: BAIXO  
**Downtime**: NÃO

#### Passos:

1. **Remover tabelas antigas**
   ```sql
   DROP TABLE questoes_matematica;
   DROP TABLE questoes_ingles;
   DROP TABLE questoes_programacao;
   DROP TABLE perguntas;
   ```

2. **Remover modelos antigos**
   ```bash
   rm BackEnd/models/QuestaoMatematica.js
   rm BackEnd/models/QuestaoIngles.js
   rm BackEnd/models/QuestaoProgramacao.js
   rm BackEnd/models/Pergunta.js
   ```

3. **Simplificar `questoesService.js`**
   - Remover lógica de compatibilidade
   - Remover fallback para tabelas antigas
   - Otimizar queries

4. **Atualizar documentação**
   - Remover referências a tabelas antigas
   - Documentar novo modelo
   - Atualizar guias de API

5. **Deploy final**
   - Fazer backup
   - Deploy de código
   - Monitoramento

**Checklist FASE 3**:
- [ ] Tabelas antigas removidas
- [ ] Modelos antigos removidos
- [ ] `questoesService.js` simplificado
- [ ] Documentação atualizada
- [ ] Testes finais passando
- [ ] Deploy realizado
- [ ] Monitoramento ativo

---

## 🔙 PLANO DE ROLLBACK

### Se algo der errado em qualquer fase:

#### Rollback FASE 1 (Criação da tabela)
```bash
# Reverter migration
npm run migrate:rollback

# Remover modelo
rm BackEnd/models/Questao.js

# Reverter código
git checkout BackEnd/services/questoesService.js

# Reiniciar servidor
npm run dev
```

#### Rollback FASE 2 (Migração de dados)
```bash
# Restaurar backup
mysql comaes_db < backup_pre_migracao.sql

# Reverter código
git checkout BackEnd/scripts/migrateQuestoes.js
git checkout BackEnd/services/questoesService.js

# Reiniciar servidor
npm run dev
```

#### Rollback FASE 3 (Consolidação)
```bash
# Restaurar tabelas antigas
mysql comaes_db < backup_pre_consolidacao.sql

# Restaurar modelos
git checkout BackEnd/models/QuestaoMatematica.js
git checkout BackEnd/models/QuestaoIngles.js
git checkout BackEnd/models/QuestaoProgramacao.js
git checkout BackEnd/models/Pergunta.js

# Reverter código
git checkout BackEnd/services/questoesService.js

# Reiniciar servidor
npm run dev
```

### Procedimento de Rollback Geral

1. **Parar o servidor**
   ```bash
   # Ctrl+C no terminal
   ```

2. **Restaurar backup**
   ```bash
   mysql comaes_db < backup_completo.sql
   ```

3. **Reverter código**
   ```bash
   git reset --hard HEAD~N  # N = número de commits
   ```

4. **Reiniciar servidor**
   ```bash
   npm run dev
   ```

5. **Verificar status**
   - Testar endpoints
   - Verificar logs
   - Confirmar que tudo está funcionando

---

## 📊 IMPACTO NO BACKEND E FRONTEND

### Backend

#### Mudanças Necessárias

| Arquivo | Mudança | Impacto |
|---------|---------|--------|
| `models/Questao.js` | NOVO | Novo modelo Sequelize |
| `services/questoesService.js` | ATUALIZADO | Suporta nova tabela + compatibilidade |
| `controllers/QuestoesController.js` | SEM MUDANÇA | Endpoints mantêm mesma interface |
| `routes/questoesRoutes.js` | SEM MUDANÇA | Rotas mantêm mesma interface |
| `models/QuestaoMatematica.js` | REMOVIDO (FASE 3) | Substituído por Questao |
| `models/QuestaoIngles.js` | REMOVIDO (FASE 3) | Substituído por Questao |
| `models/QuestaoProgramacao.js` | REMOVIDO (FASE 3) | Substituído por Questao |
| `models/Pergunta.js` | REMOVIDO (FASE 3) | Substituído por Questao |

#### Endpoints (SEM MUDANÇA)

```
POST   /api/questoes/:modalidade              ✅ Continua funcionando
GET    /api/questoes/:modalidade/:id          ✅ Continua funcionando
PUT    /api/questoes/:modalidade/:id          ✅ Continua funcionando
DELETE /api/questoes/:modalidade/:id          ✅ Continua funcionando
GET    /api/questoes/torneio/:torneioId       ✅ Continua funcionando
GET    /api/questoes/torneio/:torneioId/contar ✅ Continua funcionando
POST   /api/questoes/:modalidade/:id/duplicar ✅ Continua funcionando
```

#### Formato de Resposta (SEM MUDANÇA)

```javascript
// Antes (questoes_matematica)
{
  "id": 1,
  "titulo": "...",
  "descricao": "...",
  "dificuldade": "facil",
  "torneio_id": 1,
  "resposta_correta": "B",
  "opcoes": [...],
  "pontos": 10,
  "midia": {...},
  "criado_em": "2026-05-22T10:00:00Z"
}

// Depois (questoes)
{
  "id": 1,
  "titulo": "...",
  "descricao": "...",
  "disciplina": "matematica",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "torneio_id": 1,
  "resposta_correta": "B",
  "opcoes": [...],
  "pontos": 10,
  "midia": {...},
  "created_at": "2026-05-22T10:00:00Z",
  "updated_at": "2026-05-22T10:00:00Z"
}

// Compatibilidade: Controller converte para formato antigo se necessário
```

### Frontend

#### Mudanças Necessárias

**NENHUMA** - O frontend continua funcionando sem mudanças

- AdminDashboard continua enviando `POST /api/questoes/matematica`
- Endpoints continuam retornando dados no mesmo formato
- Componentes React não precisam ser alterados

#### Benefícios Futuros (Após Consolidação)

Após FASE 3, o frontend poderá:
- Usar novo campo `disciplina` para filtros mais eficientes
- Usar novo campo `tipo` para renderização condicional
- Simplificar lógica de validação
- Melhorar performance com queries unificadas

---

## ✅ CHECKLIST DE EXECUÇÃO

### PRÉ-MIGRAÇÃO

- [ ] Backup completo do banco de dados
- [ ] Backup do código (git commit)
- [ ] Documentação lida e entendida
- [ ] Ambiente de staging testado
- [ ] Equipe notificada
- [ ] Janela de manutenção agendada (se necessário)

### FASE 1: Criação da Tabela

- [ ] Migration criada: `20260522000000-create-questoes-table.js`
- [ ] Modelo criado: `BackEnd/models/Questao.js`
- [ ] `questoesService.js` atualizado
- [ ] Testes em staging passando
- [ ] Backup realizado
- [ ] Migration executada em produção
- [ ] Logs verificados
- [ ] Endpoints testados

### FASE 2: Migração de Dados

- [ ] Script de migração criado: `BackEnd/scripts/migrateQuestoes.js`
- [ ] Script testado em staging
- [ ] Backup realizado
- [ ] Script executado em produção
- [ ] Validação de integridade passou
- [ ] Contagem de registros verificada
- [ ] Dados comparados (antigos vs novos)
- [ ] Endpoints testados com dados migrados
- [ ] Monitoramento ativo

### FASE 3: Consolidação

- [ ] Tabelas antigas removidas
- [ ] Modelos antigos removidos
- [ ] `questoesService.js` simplificado
- [ ] Documentação atualizada
- [ ] Testes finais passando
- [ ] Backup realizado
- [ ] Deploy realizado
- [ ] Monitoramento ativo
- [ ] Documentação publicada

### PÓS-MIGRAÇÃO

- [ ] Todos os endpoints testados
- [ ] Performance verificada
- [ ] Logs analisados
- [ ] Equipe notificada
- [ ] Documentação atualizada
- [ ] Plano de manutenção futuro definido

---

## 📝 NOTAS IMPORTANTES

### 1. **Sem Downtime**
- Todas as fases podem ser executadas sem parar o servidor
- Sistema continua funcionando normalmente durante migração
- Endpoints mantêm mesma interface

### 2. **Compatibilidade Garantida**
- Frontend não precisa de mudanças
- Endpoints antigos continuam funcionando
- Dados antigos continuam acessíveis

### 3. **Segurança**
- Backups em cada fase
- Rollback disponível em qualquer momento
- Validação de integridade em cada etapa

### 4. **Performance**
- Nova tabela com índices otimizados
- Queries unificadas (mais rápidas)
- Sem duplicação de dados

### 5. **Próximos Passos (Após Consolidação)**
- Implementar ranking persistente
- Adicionar novos tipos de questões
- Otimizar sistema de tentativas
- Melhorar relatórios de desempenho

---

## 🎯 CONCLUSÃO

Este plano garante:
✅ Migração segura sem downtime  
✅ Compatibilidade com sistema atual  
✅ Rollback disponível em qualquer momento  
✅ Validação de integridade em cada fase  
✅ Documentação completa  
✅ Preparação para futuras melhorias  

**Status**: Pronto para implementação  
**Próximo Passo**: Executar FASE 1 (Criação da tabela)
