# 🎯 Sistema de Torneios - Status de Migrações

**Data**: 08 de Junho de 2026  
**Fase**: 1 - Migrações do Banco de Dados  
**Status**: ⚠️ BLOQUEADO POR MIGRAÇÕES ANTERIORES

## Resumo do Problema

O processo de aplicação de migrações está travado por inconsistências em migrações anteriores que não foram completamente aplicadas. Isso impede a aplicação das novas migrações de torneios.

### Migrações Aplicadas com Sucesso
- ✅ 20260408000101-alter-fk-not-null.cjs
- ✅ 20260416000000-create-certificados-table.cjs
- ✅ 20260422000000-add-slug-to-torneios.cjs
- ✅ 20260515000000-fix-position-defaults.cjs
- ✅ 20260601000000-add-colaborador-role-and-question-review.cjs
- ✅ 20260515000001-add-ranking-persistence.cjs **(Corrigida e aplicada)**

### Migrações Pendentes (Bloqueadas)
- ⏳ 20260522000000-create-tentativas-respostas-table.cjs ❌ Erro: Duplicate key name
- ⏳ Todas as subsequentes...

### Nossas Novas Migrações de Torneios (Pendentes)
- ⏳ 20260608000000-add-contexto-to-blocos-questoes.cjs
- ⏳ 20260608000001-add-tournament-types.cjs 🎲 **[TIPO DE TORNEIO]**
- ⏳ 20260608000002-enhance-participant-controls.cjs 👥 **[CONTROLE DE PARTICIPAÇÃO]**
- ⏳ 20260608000003-enhance-certificates.cjs 🏆 **[CERTIFICAÇÃO AUTOMÁTICA]**

## Alterações Realizadas

### Correção #1: Migração 20260515000001
- **Arquivo**: `BackEnd/migrations/20260515000001-add-ranking-persistence.cjs`
- **Problema**: Sintaxe ES6 `export` em arquivo `.cjs`
- **Solução**: Convertido para sintaxe CommonJS `module.exports`
- **Status**: ✅ Corrigido e Aplicado

### Correção #2: Índice muito longo
- **Problema**: Nome do índice excedia limite MySQL (64 caracteres)
- **Solução**: Renomeado para `idx_part_ranking` (curto)
- **Status**: ✅ Resolvido

## Próximos Passos

### Opção A: Fix Rápido (Recomendado para Production)
1. **Identificar e corrigir** migração problemática: `20260522000000`
2. **Aplicar** as demais migrações em sequência
3. **Validar** novo esquema com nossas queries de torneio

### Opção B: Fresh Start (Mais seguro, requer downtime)
1. **Backup** banco atual
2. **Dropar** database: `DROP DATABASE comaes_db;`
3. **Criar nova** sem histórico de migrações
4. **Aplicar** todas migrações from scratch
5. **Restaurar** dados

### Opção C: Skip Problematic Migrations (Rápido, não ideal)
1. **Marcar como applied**: `20260522000000` até `20260605100000`
2. **Aplicar** nossas migrações de torneio
3**Risco**: Deixa banco em estado potencialmente inconsistente

## Recomendação

**Opção A** é a mais segura. Vamos:
1. Analisar e corrigir `20260522000000-create-tentativas-respostas-table.cjs`
2. Aplicar todas migra ções
3. Testar conexão com modelos
4. Validar dados

## Estrutura de Dados Esperada (Após Migrações)

### Tabela: torneios
```
+ tipo_torneio (ENUM: 'generico', 'especifico')
+ disciplina_especifica (VARCHAR, nullable para genéricos)
```

### Tabela: participantes_torneios
```
+ encerrado_operacionalmente (BOOLEAN)
+ data_encerramento_operacional (DATE)
+ elegivel_certificado (BOOLEAN)
+ Índice: idx_participacao_ativa (usuario_id, status, posicao_congelada)
```

### Tabela: certificados
```
+ torneio_id (INT, FK) - vinculado a torneio
+ auto_gerado (BOOLEAN) - indica se foi automático
+ posicao (INT) - 1, 2 ou 3
+ Índices: idx_cert_usuario, idx_cert_torneio, idx_cert_auto_torneio
```

## Comandos Úteis

```bash
# Verificar status
npx sequelize-cli db:migrate:status --env development

# Aplicar próxima migração
npx sequelize-cli db:migrate --env development

# Ver migrações pendentes
npx sequelize-cli db:migrate:status --env development | grep "down"

# Desfazer uma migração
npx sequelize-cli db:migrate:undo --env development
```

---

**Nota**: Assim que as migrações forem aplicadas com sucesso, passaremos para Fase 2: Atualização dos Modelos (Torneio.js, ParticipanteTorneio.js, Certificate.js).
