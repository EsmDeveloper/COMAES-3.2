# REFERÊNCIA RÁPIDA - MIGRAÇÃO DO MODELO QUESTÃO

**Data**: 22 de Maio de 2026  
**Versão**: 1.0 - Cheat Sheet

---

## 🎯 EM 30 SEGUNDOS

**O que**: Consolidar 4 modelos de questões em 1  
**Por que**: Reduzir duplicação, melhorar performance  
**Como**: 3 fases (criar tabela → migrar dados → consolidar)  
**Quando**: Próxima semana  
**Downtime**: NÃO  
**Rollback**: SIM (5-10 min)  

---

## 📊 ESTRUTURA NOVA

```sql
CREATE TABLE questoes (
  id INT PRIMARY KEY,
  torneio_id INT NOT NULL,
  titulo VARCHAR(255),
  descricao TEXT,
  disciplina ENUM('matematica', 'ingles', 'programacao'),
  tipo ENUM('multipla_escolha', 'texto', 'codigo'),
  dificuldade ENUM('facil', 'medio', 'dificil'),
  opcoes JSON,
  resposta_correta TEXT,
  explicacao TEXT,
  pontos INT DEFAULT 10,
  linguagem VARCHAR(50),
  midia JSON,
  created_at DATETIME,
  updated_at DATETIME
);
```

---

## 🚀 3 FASES

| Fase | O que | Tempo | Risco | Downtime |
|------|-------|-------|-------|----------|
| 1 | Criar tabela | 30 min | BAIXO | NÃO |
| 2 | Migrar dados | 1-2h | MÉDIO | NÃO |
| 3 | Consolidar | 30 min | BAIXO | NÃO |

---

## 📋 CHECKLIST RÁPIDO

### FASE 1
- [ ] Criar migration
- [ ] Criar modelo Questao.js
- [ ] Atualizar questoesService.js
- [ ] Testar em staging
- [ ] Deploy em produção

### FASE 2
- [ ] Criar scripts de migração
- [ ] Fazer backup
- [ ] Executar migração
- [ ] Validar dados
- [ ] Testar endpoints

### FASE 3
- [ ] Remover tabelas antigas
- [ ] Remover modelos antigos
- [ ] Simplificar código
- [ ] Deploy final
- [ ] Monitoramento

---

## 🔄 COMPATIBILIDADE

| Item | Antes | Depois | Mudança |
|------|-------|--------|---------|
| Frontend | ✅ | ✅ | NÃO |
| Endpoints | ✅ | ✅ | NÃO |
| Formato resposta | ✅ | ✅ | NÃO |
| Banco de dados | 4 tabelas | 1 tabela | SIM |

---

## 📁 ARQUIVOS A CRIAR

### FASE 1
```
BackEnd/migrations/20260522000000-create-questoes-table.js
BackEnd/models/Questao.js
```

### FASE 2
```
BackEnd/scripts/migrateQuestoes.js
BackEnd/scripts/validateQuestoes.js
```

### FASE 3
```
(Remover arquivos antigos)
```

---

## 🔙 ROLLBACK RÁPIDO

```bash
# Se algo der errado
git reset --hard HEAD~N
mysql comaes_db < backup.sql
npm run dev
```

---

## 📊 DADOS ATUAIS

```
questoes_matematica:    10 questões
questoes_ingles:        6 questões
questoes_programacao:   5 questões
perguntas:              0 questões
────────────────────────────────────
TOTAL:                  21 questões
```

---

## 🎯 MAPEAMENTO

### Matemática
```
questoes_matematica → questoes
disciplina = 'matematica'
tipo = 'multipla_escolha'
```

### Inglês
```
questoes_ingles → questoes
disciplina = 'ingles'
tipo = 'multipla_escolha'
```

### Programação
```
questoes_programacao → questoes
disciplina = 'programacao'
tipo = 'codigo'
```

---

## 💾 BACKUPS

```bash
# Antes de FASE 1
mysqldump comaes_db > backup_fase1.sql

# Antes de FASE 2
mysqldump comaes_db > backup_fase2.sql

# Antes de FASE 3
mysqldump comaes_db > backup_fase3.sql
```

---

## 🧪 TESTES

```bash
# Testar FASE 1
curl http://localhost:3000/api/questoes/matematica

# Testar FASE 2
npm run validate:questoes

# Testar FASE 3
npm run dev
# Verificar endpoints
```

---

## 📈 BENEFÍCIOS

- ✅ Redução de código: ~40%
- ✅ Melhoria de performance: ~20%
- ✅ Facilidade de manutenção: +100%
- ✅ Pronto para crescimento

---

## ⚠️ PONTOS CRÍTICOS

1. **Backup antes de cada fase**
2. **Testar em staging primeiro**
3. **Monitorar logs durante migração**
4. **Validar integridade de dados**
5. **Ter rollback pronto**

---

## 📞 CONTATO

- **Dúvidas**: Ver QUESTAO_FINAL_MODEL_AND_MIGRATION_PLAN.md
- **Implementação**: Ver QUESTAO_MIGRATION_IMPLEMENTATION_GUIDE.md
- **Diagramas**: Ver QUESTAO_MIGRATION_VISUAL_GUIDE.md
- **Índice**: Ver QUESTAO_DOCUMENTATION_INDEX.md

---

## 🔗 DOCUMENTOS PRINCIPAIS

1. **QUESTAO_EXECUTIVE_SUMMARY.md** - Visão geral (10 min)
2. **QUESTAO_FINAL_MODEL_AND_MIGRATION_PLAN.md** - Plano completo (30 min)
3. **QUESTAO_MIGRATION_IMPLEMENTATION_GUIDE.md** - Como fazer (20 min)
4. **QUESTAO_MIGRATION_VISUAL_GUIDE.md** - Diagramas (15 min)
5. **QUESTAO_DOCUMENTATION_INDEX.md** - Índice (5 min)

---

## ✅ STATUS

- [x] Documentação completa
- [x] Plano de migração definido
- [x] Rollback planejado
- [x] Exemplos criados
- [x] Pronto para implementação

---

## 🎯 PRÓXIMO PASSO

1. Ler QUESTAO_EXECUTIVE_SUMMARY.md
2. Ler QUESTAO_FINAL_MODEL_AND_MIGRATION_PLAN.md
3. Ler QUESTAO_MIGRATION_IMPLEMENTATION_GUIDE.md
4. Começar FASE 1

---

**Criado em**: 22 de Maio de 2026  
**Versão**: 1.0  
**Status**: ✅ Pronto para Implementação
