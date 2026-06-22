# 🌱 Scripts de População do Banco - COMAES

## 📋 Conteúdo Populado

### 1. **Questões de Torneios** (Aprovadas)
- ✅ 8 questões de Matemática (fácil, médio, difícil)
- ✅ 7 questões de Programação (fácil, médio, difícil)
- ✅ 6 questões de Inglês (fácil, médio, difícil)
- ✅ 3 blocos completos (1 por disciplina, 5 questões cada)

### 2. **Questões dos Testes/Quizzes** (Aprovadas, Públicas)
- ✅ 5 questões de Matemática (fácil/médio)
- ✅ 4 questões de Programação (fácil)
- ✅ 4 questões de Inglês (fácil)
- ✅ 3 blocos de quiz (1 por disciplina)

### 3. **Questões Pendentes** (Aguardando aprovação)
- ✅ 5 questões de Matemática (criadas por Rufus)
- ✅ 4 questões de Programação (criadas por Rufus)
- ✅ 3 questões de Inglês (criadas por Rufus)
- ✅ 3 blocos pendentes completos

### 4. **Questões dos Colaboradores**
- ❌ Vazio (para você testar o fluxo de aprovação manualmente)

## 🚀 Como Executar

### Opção 1: Script Node.js (Recomendado)

```bash
cd BackEnd/seeders
node run-populate.js
```

### Opção 2: Diretamente no MySQL

```bash
mysql -u root -p comaes_db < populate-questoes.sql
```

### Opção 3: MySQL Workbench / phpMyAdmin

1. Abra o arquivo `populate-questoes.sql`
2. Copie todo o conteúdo
3. Execute no Query Editor

## ⚠️ IMPORTANTE

### Antes de Executar:

1. **Backup do banco** (se tiver dados importantes):
```bash
mysqldump -u root -p comaes_db > backup.sql
```

2. **Verificar usuário Rufus existe**:
   - O script assume que existe um colaborador com ID = 2 (Rufus)
   - Se não existir, crie manualmente ou ajuste o script

3. **Limpar dados existentes** (opcional):
   - O script NÃO apaga dados automaticamente
   - Se quiser limpar, descomente as linhas DELETE no início do SQL

## 📊 Estrutura dos Dados

### Questões de Torneio:
- **Status**: `aprovada`
- **is_public**: `1`
- **tipo**: `aberta` ou `multipla_escolha`
- **Pontos**: 5 (fácil), 10 (médio), 20 (difícil)

### Questões de Teste/Quiz:
- **Status**: `aprovada`
- **is_public**: `1`
- **Tipo**: Maioria `multipla_escolha`
- **Dificuldade**: Principalmente `facil`

### Questões Pendentes:
- **Status**: `pendente`
- **is_public**: `0`
- **criado_por**: ID do Rufus (colaborador)
- **Aguardando aprovação do admin**

## 🧪 Verificar População

Após executar, verifique no banco:

```sql
-- Total de questões
SELECT status, COUNT(*) FROM questao GROUP BY status;

-- Total de blocos
SELECT status, COUNT(*) FROM bloco_questoes GROUP BY status;

-- Questões por disciplina
SELECT disciplina, status, COUNT(*) 
FROM questao 
GROUP BY disciplina, status 
ORDER BY disciplina, status;
```

## 🔄 Fluxo de Aprovação

### Para Testar o Fluxo:

1. **Login como Admin** na aplicação
2. Acesse "Questões Pendentes"
3. Veja as questões criadas por Rufus
4. Aprove ou rejeite conforme necessário
5. Questões aprovadas vão para "Questões dos Colaboradores"

## 📝 Personalização

### Adicionar Mais Questões:

Edite o arquivo `populate-questoes.sql` e adicione:

```sql
INSERT INTO questao (texto, tipo, resposta_correta, dificuldade, disciplina, pontos, criado_por, status, is_public) 
VALUES 
('Sua pergunta aqui', 'aberta', 'resposta correta', 'facil', 'matematica', 5, 1, 'aprovada', 1);
```

### Ajustar ID do Rufus:

Se o Rufus tiver ID diferente de 2, altere a linha:

```sql
SET @rufus_id = 2;  -- Altere para o ID correto
```

## 🐛 Troubleshooting

### Erro: "Table doesn't exist"
- Certifique-se que as migrations foram executadas
- Execute: `npm run migrate` no BackEnd

### Erro: "Duplicate entry"
- O banco já tem dados
- Opção 1: Limpe o banco (uncommit linhas DELETE)
- Opção 2: Altere os dados no script

### Erro: "Foreign key constraint"
- Verifique se o usuário admin (ID=1) existe
- Verifique se o colaborador Rufus (ID=2) existe

## 📞 Suporte

Se tiver problemas, verifique:
1. ✅ MySQL está rodando
2. ✅ Credenciais corretas no `.env`
3. ✅ Banco `comaes_db` existe
4. ✅ Tabelas foram criadas (migrations)

## Data de Criação
22 de Junho de 2026
