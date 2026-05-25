# INSTRUÇÕES PARA DROP DAS TABELAS LEGADAS

**Data:** 2026-05-22  
**Status:** Pronto para execução

---

## ⚠️ AVISO IMPORTANTE

Este documento contém instruções para remover as tabelas legadas do banco de dados. Esta operação é **IRREVERSÍVEL** sem backup.

**Faça backup do banco de dados ANTES de executar qualquer comando.**

---

## PASSO 1: FAZER BACKUP DO BANCO DE DADOS

### Opção A: Usando MySQL Workbench
1. Abrir MySQL Workbench
2. Conectar ao servidor
3. Clicar em "Server" → "Data Export"
4. Selecionar banco "comaes_db"
5. Clicar em "Export to Self-Contained File"
6. Salvar em local seguro

### Opção B: Usando linha de comando
```bash
mysqldump -u root -p comaes_db > backup_comaes_db_2026-05-22.sql
```

### Opção C: Usando phpMyAdmin
1. Acessar phpMyAdmin
2. Selecionar banco "comaes_db"
3. Clicar em "Export"
4. Selecionar formato SQL
5. Clicar em "Go"

---

## PASSO 2: VERIFICAR ESTADO ATUAL

Antes de executar o DROP, verificar que os dados foram migrados:

```sql
-- Verificar dados em tabelas legadas
SELECT 'perguntas' as tabela, COUNT(*) as registros FROM perguntas
UNION ALL
SELECT 'questoes_matematica', COUNT(*) FROM questoes_matematica
UNION ALL
SELECT 'questoes_programacao', COUNT(*) FROM questoes_programacao
UNION ALL
SELECT 'questoes_ingles', COUNT(*) FROM questoes_ingles
UNION ALL
SELECT 'questoes (NOVA)', COUNT(*) FROM questoes;
```

**Resultado esperado:**
```
perguntas              | 15
questoes_matematica    | 5
questoes_programacao   | 5
questoes_ingles        | 5
questoes (NOVA)        | 45
```

---

## PASSO 3: EXECUTAR DROP DAS TABELAS LEGADAS

### Opção A: Executar arquivo SQL completo

Arquivo: `scripts/drop-legacy-tables.sql`

```sql
-- Remover constraints de foreign key primeiro
ALTER TABLE tentativas_respostas DROP FOREIGN KEY IF EXISTS tentativas_respostas_ibfk_2;

-- Drop das tabelas legadas
DROP TABLE IF EXISTS perguntas;
DROP TABLE IF EXISTS questoes_matematica;
DROP TABLE IF EXISTS questoes_programacao;
DROP TABLE IF EXISTS questoes_ingles;

-- Verificação final
SELECT COUNT(*) as total_questoes FROM questoes;
```

### Opção B: Executar comando por comando

```sql
-- 1. Remover constraint
ALTER TABLE tentativas_respostas DROP FOREIGN KEY IF EXISTS tentativas_respostas_ibfk_2;
```

Aguardar confirmação: `Query OK, 0 rows affected`

```sql
-- 2. Drop tabela perguntas
DROP TABLE IF EXISTS perguntas;
```

Aguardar confirmação: `Query OK, 0 rows affected`

```sql
-- 3. Drop tabela questoes_matematica
DROP TABLE IF EXISTS questoes_matematica;
```

Aguardar confirmação: `Query OK, 0 rows affected`

```sql
-- 4. Drop tabela questoes_programacao
DROP TABLE IF EXISTS questoes_programacao;
```

Aguardar confirmação: `Query OK, 0 rows affected`

```sql
-- 5. Drop tabela questoes_ingles
DROP TABLE IF EXISTS questoes_ingles;
```

Aguardar confirmação: `Query OK, 0 rows affected`

---

## PASSO 4: VERIFICAR RESULTADO

Após executar o DROP, verificar que as tabelas foram removidas:

```sql
-- Verificar que tabelas legadas foram removidas
SHOW TABLES LIKE 'pergunta%';
SHOW TABLES LIKE 'questoes_%';

-- Verificar que tabela questoes ainda existe
SHOW TABLES LIKE 'questoes';

-- Verificar dados em questoes
SELECT COUNT(*) as total_questoes FROM questoes;
```

**Resultado esperado:**
- Nenhuma tabela legada listada
- Tabela "questoes" existe
- Total de questões: 45

---

## PASSO 5: TESTAR SISTEMA

Após o DROP, testar que o sistema funciona normalmente:

### Teste 1: Carregar questões por disciplina
```bash
curl http://localhost:3000/api/questoes/quiz/matematica
```

### Teste 2: Carregar questões por torneio
```bash
curl http://localhost:3000/api/questoes/torneio/3
```

### Teste 3: Executar script de validação
```bash
node scripts/validateMigration.js
```

### Teste 4: Executar testes funcionais
```bash
node scripts/testSystemWithNewQuestoes.js
```

---

## PASSO 6: REMOVER MODELOS LEGADOS (OPCIONAL)

Após confirmar que o sistema funciona, remover os modelos legados:

```bash
# Remover modelos legados
rm BackEnd/models/Pergunta.js
rm BackEnd/models/QuestaoMatematica.js
rm BackEnd/models/QuestaoProgramacao.js
rm BackEnd/models/QuestaoIngles.js
```

---

## ROLLBACK (Se necessário)

Se algo der errado, restaurar do backup:

### Usando MySQL Workbench
1. Abrir MySQL Workbench
2. Conectar ao servidor
3. Clicar em "Server" → "Data Import"
4. Selecionar arquivo de backup
5. Clicar em "Start Import"

### Usando linha de comando
```bash
mysql -u root -p comaes_db < backup_comaes_db_2026-05-22.sql
```

---

## CHECKLIST DE EXECUÇÃO

- [ ] Backup do banco de dados realizado
- [ ] Verificação de estado atual concluída
- [ ] Constraint removida com sucesso
- [ ] Tabela perguntas removida
- [ ] Tabela questoes_matematica removida
- [ ] Tabela questoes_programacao removida
- [ ] Tabela questoes_ingles removida
- [ ] Verificação de resultado concluída
- [ ] Teste 1 (disciplina) passou
- [ ] Teste 2 (torneio) passou
- [ ] Teste 3 (validação) passou
- [ ] Teste 4 (funcionais) passou
- [ ] Modelos legados removidos (opcional)
- [ ] Documentação atualizada

---

## TROUBLESHOOTING

### Erro: "Cannot drop table, referenced by a foreign key constraint"

**Solução:** Remover a constraint primeiro:
```sql
ALTER TABLE tentativas_respostas DROP FOREIGN KEY tentativas_respostas_ibfk_2;
```

### Erro: "Table doesn't exist"

**Solução:** Usar `DROP TABLE IF EXISTS` para evitar erro se tabela não existir.

### Erro: "Access denied for user"

**Solução:** Verificar permissões do usuário MySQL. Usuário deve ter permissão DROP.

### Sistema não funciona após DROP

**Solução:** 
1. Verificar que tabela "questoes" existe
2. Verificar que tabela "questoes" tem dados
3. Restaurar do backup
4. Executar scripts de validação

---

## SUPORTE

Para dúvidas ou problemas:

1. Revisar documentação em `CONSOLIDACAO_BANCO_DADOS_FINAL.md`
2. Executar scripts de validação
3. Verificar logs do sistema
4. Restaurar do backup se necessário

---

## CONCLUSÃO

Após completar todos os passos:

✅ Tabelas legadas removidas  
✅ Sistema funciona com tabela "questoes"  
✅ Banco de dados consolidado  
✅ Pronto para produção  

**Migração concluída com sucesso!**
