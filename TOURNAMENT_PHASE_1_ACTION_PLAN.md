# 🎯 PLANO DE AÇÃO - FASE 1 SISTEMA DE TORNEIOS

**Status**: Pronto para próxima sessão  
**Prioridade**: ALTA  
**Tempo Estimado**: 1 hora

---

## 📋 Tarefa Imediata

### ⏱️ Sprint: "Aplicar Migrações de Torneio"

**Objetivo**: Aplicar com sucesso todas as migrações do banco de dados, incluindo as 3 migrações específicas do sistema de torneios.

---

## 🎯 Sequência de Ações

### AÇÃO 1: Converter Migrações ES6 → CommonJS
**Tempo**: ~30 minutos

Converter 7 migrações restantes de ES6 para CommonJS:

```
1. 20260526000000-create-resultados-teste-table.cjs
2. 20260528000000-add-visualizacoes-to-noticias.cjs
3. 20260601100000-create-blocos-questoes.cjs
4. 20260603000000-create-niveis-and-xp-columns.cjs
5. 20260603000000-create-rankings-table.cjs (duplicate - renomear?)
6. 20260603100000-create-sequencias-aprendizagem.cjs
7. 20260603200000-create-missoes-tables.cjs
8. 20260605000000-create-rankings-table.cjs (duplicate)
9. 20260605000000-update-bloco-questoes-status.cjs (duplicate)
10. 20260605100000-fix-bloco-status-to-publish.cjs
11. 20260606000000-add-colaborador-extended-fields.cjs
12. 20260608000000-add-contexto-to-blocos-questoes.cjs
```

**Padrão a Usar** (do arquivo 20260524000000):
```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tables = await queryInterface.showAllTables();
      if (tables.includes('table_name')) {
        console.log('ℹ️  Tabela já existe');
        return;
      }
      
      // ... resto do código
      
      console.log('✅ Tabela criada');
    } catch (error) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tables = await queryInterface.showAllTables();
      if (tables.includes('table_name')) {
        await queryInterface.dropTable('table_name');
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  }
};
```

**Checklist**:
- [ ] Renomear `export const` para `module.exports {`
- [ ] Adicionar try/catch em up() e down()
- [ ] Adicionar check de tabela já existe
- [ ] Adicionar nomes explícitos para índices (máx 64 chars)
- [ ] Testar sintaxe (sem erros de parsing)

---

### AÇÃO 2: Aplicar Migrações ao Banco
**Tempo**: ~15 minutos

```bash
cd BackEnd

# 1. Verificar status
npx sequelize-cli db:migrate:status --env development

# 2. Aplicar migrações
npx sequelize-cli db:migrate --env development

# 3. Verificar status novamente
npx sequelize-cli db:migrate:status --env development

# 4. Se houver erro, ver qual é
npx sequelize-cli db:migrate:status --env development | grep "down"
```

**Resultado Esperado**:
```
✅ Todas as migrações com status "up"
❌ Nenhuma migração com status "down"
```

---

### AÇÃO 3: Validar Estrutura do Banco
**Tempo**: ~10 minutos

Executar queries para confirmar colunas foram adicionadas:

```sql
-- 1. Verificar colun as em torneios
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='torneios' 
AND COLUMN_NAME IN ('tipo_torneio', 'disciplina_especifica')
ORDER BY COLUMN_NAME;

-- Resultado esperado:
-- disciplina_especifica
-- tipo_torneio

-- 2. Verificar participantes_torneios
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='participantes_torneios' 
AND COLUMN_NAME IN ('encerrado_operacionalmente', 'data_encerramento_operacional', 'elegivel_certificado')
ORDER BY COLUMN_NAME;

-- Resultado esperado:
-- data_encerramento_operacional
-- elegivel_certificado
-- encerrado_operacionalmente

-- 3. Verificar certificados
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='certificados' 
AND COLUMN_NAME IN ('torneio_id', 'auto_gerado')
ORDER BY COLUMN_NAME;

-- Resultado esperado:
-- auto_gerado
-- torneio_id

-- 4. Verificar índices em participantes_torneios
SHOW INDEX FROM participantes_torneios 
WHERE Key_name IN ('idx_participacao_ativa', 'idx_cert_usuario', 'idx_cert_torneio');
```

**Resultado Esperado**: ✅ Todas as colunas e índices presentes

---

### AÇÃO 4: Commit de Migrações Aplicadas
**Tempo**: ~5 minutos

```bash
git add BackEnd/migrations/*.cjs

git commit -m "fix(migrations): convert ES6 exports to CommonJS for sequelize compatibility

- Convert 12 migration files from ES6 to CommonJS syntax
- Add table existence checks to prevent duplicate creation errors
- Add explicit index names to prevent MySQL truncation
- Add proper error handling in up/down functions
- All migrations now idempotent and safe to re-run

Migrations applied:
- 20260526000000-create-resultados-teste-table
- 20260528000000-add-visualizacoes-to-noticias
- 20260601100000-create-blocos-questoes
- 20260603000000-create-niveis-and-xp-columns
- 20260603000000-create-rankings-table
- 20260603100000-create-sequencias-aprendizagem
- 20260603200000-create-missoes-tables
- 20260605000000-create-rankings-table
- 20260605000000-update-bloco-questoes-status
- 20260605100000-fix-bloco-status-to-publish
- 20260606000000-add-colaborador-extended-fields
- 20260608000000-add-contexto-to-blocos-questoes"
```

---

## 📊 Verificação de Sucesso

### ✅ Critérios de Conclusão

- [ ] Todas as 26 migrações com status "up"
- [ ] Nenhuma migração com status "down"
- [ ] Colunas de torneio presentes em `torneios`
- [ ] Colunas de participante presentes em `participantes_torneios`
- [ ] Colunas de certificado presentes em `certificados`
- [ ] Índices criados e visíveis no banco
- [ ] Sem erros em logs de migração
- [ ] Commit realizado com sucesso

### 🔍 Verificação Rápida (2 minutos)

```bash
# 1. Check migration status - should show all "up"
npx sequelize-cli db:migrate:status --env development | grep "down" | wc -l
# Esperado: 0

# 2. Check if our tournament columns exist
mysql comaes_db -e "SELECT COUNT(*) as found FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='torneios' AND COLUMN_NAME='tipo_torneio';"
# Esperado: 1

mysql comaes_db -e "SELECT COUNT(*) as found FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='participantes_torneios' AND COLUMN_NAME='elegivel_certificado';"
# Esperado: 1

mysql comaes_db -e "SELECT COUNT(*) as found FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='certificados' AND COLUMN_NAME='auto_gerado';"
# Esperado: 1
```

---

## 🚀 Próxima Fase (Após sucesso)

### FASE 2: Atualizar Modelos
**Quando**: Imediatamente após migrações bem-sucedidas

Arquivos a modificar:
- `BackEnd/models/Torneio.js` - Validações de tipo
- `BackEnd/models/ParticipanteTorneio.js` - Novos campos
- `BackEnd/models/Certificate.js` - Validações

---

## 🔧 Troubleshooting Rápido

### Se algo der errado

```bash
# 1. Ver qual migração falhou
npx sequelize-cli db:migrate:status --env development

# 2. Ver erro completo
npx sequelize-cli db:migrate --env development 2>&1

# 3. Desfazer última migração se necessário
npx sequelize-cli db:migrate:undo --env development

# 4. Verificar conteúdo da migração problemática
cat BackEnd/migrations/20260XXX000000-*.cjs
```

---

## 📁 Arquivos Importantes

### Referência
- `TOURNAMENT_MIGRATION_PROGRESS.md` - Guia detalhado
- `TOURNAMENT_SYSTEM_MIGRATION_STATUS.md` - Status técnico
- `SESSION_SUMMARY_TOURNAMENT_PHASE_1.md` - O que foi feito

### Migrações do Torneio
```
BackEnd/migrations/20260608000001-add-tournament-types.cjs
BackEnd/migrations/20260608000002-enhance-participant-controls.cjs
BackEnd/migrations/20260608000003-enhance-certificates.cjs
```

---

## ⏱️ Cronograma

| Tempo | Ação | Responsável |
|-------|------|-------------|
| 00:00-00:30 | Converter migrações ES6 | Kiro Agent |
| 00:30-00:45 | Aplicar migrações | Kiro Agent |
| 00:45-00:55 | Validar banco | Kiro Agent |
| 00:55-01:00 | Fazer commit | Kiro Agent |
| **Total** | **~1 hora** | |

---

## 📞 Próximo Passo

**Quando terminar esta ação**:
1. Executar as 4 ações acima em sequência
2. Validar sucesso com checklist
3. Fazer commit
4. Sinalizar pronto para Fase 2

**Fase 2 inclui**:
- Atualizar modelos do Sequelize
- Adicionar validações
- Testes iniciais

---

## ✨ Notas

- ✅ Todas as correções já foram testadas na sessão anterior
- ✅ Padrão de conversão está validado
- ✅ Sem riscos - mudanças são aditivas e reversíveis
- ✅ Banco atual tem 10 migrações aplicadas - adicionar 16 mais

**Status**: 🟢 Pronto para começar  
**Data**: 08 de Junho de 2026  
**Responsável**: Kiro Agent
