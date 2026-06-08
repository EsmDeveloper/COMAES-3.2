# Script de Inserção de 45 Questões para Torneio Ativo

## Descrição
Este script insere automaticamente 45 questões na tabela `questoes` do banco de dados COMAES, distribuídas da seguinte forma:

- **Matemática**: 15 questões (5 fáceis, 5 médias, 5 difíceis)
- **Inglês**: 15 questões (5 fáceis, 5 médias, 5 difíceis)
- **Programação**: 15 questões (5 fáceis, 5 médias, 5 difíceis)

**Total: 45 questões**

## Informações Importantes

### ✓ Tabela de Questões
O script usa a tabela unificada `questoes` (não confundir com tabelas separadas de quizz).

### ✓ Torneio Ativo
O script identifica automaticamente:
1. O torneio com `status = 'ativo'` mais recente
2. Se não existir, usa o torneio mais recente do sistema

### ✓ Níveis de Dificuldade
- **facil**: 10 pontos
- **medio**: 15 pontos
- **dificil**: 20 pontos

### ✓ Status de Aprovação
Todas as questões são inseridas como `aprovada`.

## Como Executar

### Opção 1: MySQL CLI
```bash
cd BackEnd
mysql -h localhost -u root -p comaes_db < seeds/insert_45_questoes_torneio_ativo.sql
```

### Opção 2: Via Node.js/Sequelize
```bash
cd BackEnd
node -e "
const sequelize = require('./config/db.js');
const fs = require('fs');
const sql = fs.readFileSync('seeds/insert_45_questoes_torneio_ativo.sql', 'utf8');
sequelize.query(sql).then(() => {
  console.log('Questões inseridas com sucesso!');
  process.exit(0);
}).catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
"
```

### Opção 3: Via phpMyAdmin ou outro cliente MySQL
1. Abra o arquivo `seeds/insert_45_questoes_torneio_ativo.sql`
2. Copie todo o conteúdo
3. Cole na janela de SQL do cliente MySQL
4. Execute

## Verificação após Inserção

Para verificar se as questões foram inseridas corretamente:

```sql
-- Ver total por disciplina e dificuldade
SELECT 
  disciplina,
  dificuldade,
  COUNT(*) as total
FROM questoes
WHERE torneio_id IN (SELECT id FROM torneios WHERE status = 'ativo')
GROUP BY disciplina, dificuldade
ORDER BY disciplina, FIELD(dificuldade, 'facil', 'medio', 'dificil');

-- Ver total por disciplina
SELECT 
  disciplina,
  COUNT(*) as total
FROM questoes
WHERE torneio_id IN (SELECT id FROM torneios WHERE status = 'ativo')
GROUP BY disciplina;

-- Ver total geral
SELECT COUNT(*) as total_questoes
FROM questoes
WHERE torneio_id IN (SELECT id FROM torneios WHERE status = 'ativo');
```

## Estrutura das Questões Inseridas

### Campos utilizados:
- `torneio_id`: ID do torneio ativo
- `titulo`: Título/resumo da questão
- `descricao`: Enunciado da questão
- `disciplina`: matematica, ingles, programacao
- `tipo`: multipla_escolha
- `dificuldade`: facil, medio, dificil
- `opcoes`: Array JSON com opções
- `resposta_correta`: Resposta correta
- `explicacao`: Explicação da resposta
- `pontos`: Pontos atribuídos
- `status_aprovacao`: aprovada

## Conteúdo das Questões

### MATEMÁTICA
**Fácil**: Operações básicas, geometria elementar
- Adição, multiplicação, divisão
- Perímetro de quadrado
- Números primos

**Médio**: Frações, regra de três, potências
- Frações equivalentes
- Regra de três simples
- Ângulos em triângulos
- Percentagens de aumento

**Difícil**: Cálculo, trigonometria, matrizes
- Funções quadráticas
- Trigonometria avançada
- Determinantes
- Séries aritméticas
- Desigualdades logarítmicas

### INGLÊS
**Fácil**: Vocabulário básico, gramática elementar
- Profissões, verbos to have/be
- Plurais irregulares
- Adjetivos possessivos
- Formação de perguntas

**Médio**: Phrasal verbs, condicionais, relative clauses
- Phrasal verbs (look up, etc)
- Second conditional
- Relative clauses
- Superlativos
- Reported speech

**Difícil**: Vocabulário avançado, inversão, modais
- Sinônimos avançados
- Inversion for emphasis
- Modal verbs (deduction)
- Collocations
- Passive voice complexa

### PROGRAMAÇÃO
**Fácil**: Conceitos básicos
- Variáveis e tipos de dados
- Tipos inteiros (Integer)
- Operadores lógicos
- Loops básicos (while)
- Índices de arrays

**Médio**: Funções, OOP, estruturas de dados
- Funções com parâmetros
- Classes e OOP
- Recursão
- Estruturas FIFO/LIFO
- Complexidade de algoritmos

**Difícil**: Design Patterns, algoritmos, Git
- Design Pattern Observer
- Merge Sort e complexidade
- Programação funcional
- Git rebase
- SQL avançado (subqueries)

## Notas Importantes

⚠️ **Backup**: Faça backup do banco de dados antes de executar o script em produção.

✓ **Idempotência**: O script não verifica duplicatas, então executar múltiplas vezes adicionará questões duplicadas.

✓ **Encoding**: O script usa UTF-8 para suportar caracteres especiais (ç, ã, é, etc).

✓ **Torneio Ativo**: O script funciona para qualquer torneio que tenha status = 'ativo'.

## Suporte
Se encontrar erros, verifique:
1. Banco de dados está rodando
2. Credenciais MySQL estão corretas (.env)
3. Tabela `questoes` existe
4. Tabela `torneios` tem pelo menos um torneio ativo

---
**Data de criação**: 2026-06-04
**Versão**: 1.0
