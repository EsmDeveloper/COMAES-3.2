-- ============================================================================
-- POPULAÇÃO DE QUESTÕES COLABORADORES - 3 BLOCOS E 10 QUESTÕES
-- ============================================================================
USE comaes_db;

SET @admin_id = 1;
SET @now = NOW();

-- ============================================================================
-- 1. CRIAR 3 BLOCOS DE QUESTÕES PARA COLABORADORES
-- ============================================================================

-- Bloco 1: Fundamentos de Matemática
INSERT INTO blocos_questoes (titulo, descricao, disciplina, dificuldade, status, aprovado_por_id, criado_por, created_at, updated_at) 
VALUES (
  'Fundamentos de Matemática',
  'Bloco com questões básicas de matemática para colaboradores',
  'matematica',
  'facil',
  'aprovado',
  @admin_id,
  @admin_id,
  @now,
  @now
);
SET @bloco_matematica_id = LAST_INSERT_ID();

-- Bloco 2: Estruturas de Dados e Programação
INSERT INTO blocos_questoes (titulo, descricao, disciplina, dificuldade, status, aprovado_por_id, criado_por, created_at, updated_at) 
VALUES (
  'Estruturas de Dados e Programação',
  'Bloco com questões sobre estruturas de dados e conceitos de programação',
  'programacao',
  'medio',
  'aprovado',
  @admin_id,
  @admin_id,
  @now,
  @now
);
SET @bloco_programacao_id = LAST_INSERT_ID();

-- Bloco 3: English Essentials
INSERT INTO blocos_questoes (titulo, descricao, disciplina, dificuldade, status, aprovado_por_id, criado_por, created_at, updated_at) 
VALUES (
  'English Essentials',
  'Bloco com conceitos essenciais de língua inglesa',
  'ingles',
  'facil',
  'aprovado',
  @admin_id,
  @admin_id,
  @now,
  @now
);
SET @bloco_ingles_id = LAST_INSERT_ID();

-- ============================================================================
-- 2. CRIAR 10 QUESTÕES INDEPENDENTES
-- ============================================================================

-- QUESTÃO 1: Adição de Frações (Matemática)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'Adição de Frações',
  'Calcule: 1/2 + 1/3 = ?',
  'multipla_escolha',
  '5/6',
  'facil',
  'matematica',
  5,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q1 = LAST_INSERT_ID();
UPDATE questoes SET opcoes = JSON_ARRAY('1/5', '2/5', '5/6', '3/4') WHERE id = @q1;

-- QUESTÃO 2: Teorema de Pitágoras (Matemática)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'Teorema de Pitágoras',
  'Um triângulo retângulo tem catetos de 3cm e 4cm. Qual é a hipotenusa?',
  'multipla_escolha',
  '5 cm',
  'facil',
  'matematica',
  5,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q2 = LAST_INSERT_ID();
UPDATE questoes SET opcoes = JSON_ARRAY('5 cm', '6 cm', '7 cm', '8 cm') WHERE id = @q2;

-- QUESTÃO 3: Progressão Aritmética (Matemática)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'Progressão Aritmética',
  'Qual é o 5º termo da sequência: 2, 5, 8, 11, ...?',
  'multipla_escolha',
  '14',
  'facil',
  'matematica',
  5,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q3 = LAST_INSERT_ID();
UPDATE questoes SET opcoes = JSON_ARRAY('12', '13', '14', '15') WHERE id = @q3;

-- QUESTÃO 4: O que é Variável (Programação)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'O que é Variável em Programação',
  'Uma variável em programação é:',
  'multipla_escolha',
  'Um espaço na memória que armazena um valor',
  'facil',
  'programacao',
  5,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q4 = LAST_INSERT_ID();
UPDATE questoes SET opcoes = JSON_ARRAY(
  'Um espaço na memória que armazena um valor',
  'Uma função que executa operações',
  'Um tipo de dado primitivo',
  'Uma estrutura de controle de fluxo'
) WHERE id = @q4;

-- QUESTÃO 5: Loops em Python (Programação)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'Loops em Python',
  'Qual é a saída do código: for i in range(3): print(i)?',
  'multipla_escolha',
  '0, 1, 2',
  'facil',
  'programacao',
  5,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q5 = LAST_INSERT_ID();
UPDATE questoes SET opcoes = JSON_ARRAY('0, 1, 2', '1, 2, 3', '0, 1, 2, 3', '1, 2') WHERE id = @q5;

-- QUESTÃO 6: Funções em JavaScript (Programação)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'Funções em JavaScript',
  'Escreva uma função que retorna o dobro de um número',
  'codigo',
  'function dobro(n) { return n * 2; }',
  'facil',
  'programacao',
  5,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q6 = LAST_INSERT_ID();

-- QUESTÃO 7: Banco de Dados (Programação)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'Conceito de Banco de Dados',
  'Um banco de dados é principalmente utilizado para:',
  'multipla_escolha',
  'Armazenar e organizar dados de forma estruturada',
  'medio',
  'programacao',
  10,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q7 = LAST_INSERT_ID();
UPDATE questoes SET opcoes = JSON_ARRAY(
  'Armazenar e organizar dados de forma estruturada',
  'Compilar código',
  'Desenhar gráficos',
  'Gerenciar interfaces visuais'
) WHERE id = @q7;

-- QUESTÃO 8: Verbo "To Be" (Inglês)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'Verbo To Be - Presente',
  'Complete: "They ___ students."',
  'multipla_escolha',
  'are',
  'facil',
  'ingles',
  5,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q8 = LAST_INSERT_ID();
UPDATE questoes SET opcoes = JSON_ARRAY('am', 'is', 'are', 'be') WHERE id = @q8;

-- QUESTÃO 9: Vocabulário Básico (Inglês)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'Vocabulário Básico - Cores',
  'Qual é a cor do céu? (The color of the sky is...)',
  'multipla_escolha',
  'blue',
  'facil',
  'ingles',
  5,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q9 = LAST_INSERT_ID();
UPDATE questoes SET opcoes = JSON_ARRAY('red', 'green', 'blue', 'yellow') WHERE id = @q9;

-- QUESTÃO 10: Singular e Plural (Inglês)
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) 
VALUES (
  'Singular e Plural em Inglês',
  'Qual é o plural de "child"?',
  'multipla_escolha',
  'children',
  'facil',
  'ingles',
  5,
  @admin_id,
  'aprovada',
  @now,
  @now
);
SET @q10 = LAST_INSERT_ID();
UPDATE questoes SET opcoes = JSON_ARRAY('childs', 'childes', 'children', 'children\'s') WHERE id = @q10;

-- ============================================================================
-- 3. ASSOCIAR QUESTÕES AOS BLOCOS
-- ============================================================================

-- Bloco de Matemática - Questões 1, 2, 3
INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_matematica_id, @q1, 1, @now);

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_matematica_id, @q2, 2, @now);

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_matematica_id, @q3, 3, @now);

-- Bloco de Programação - Questões 4, 5, 6, 7
INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_programacao_id, @q4, 1, @now);

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_programacao_id, @q5, 2, @now);

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_programacao_id, @q6, 3, @now);

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_programacao_id, @q7, 4, @now);

-- Bloco de Inglês - Questões 8, 9, 10
INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_ingles_id, @q8, 1, @now);

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_ingles_id, @q9, 2, @now);

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem, created_at) 
VALUES (@bloco_ingles_id, @q10, 3, @now);

-- ============================================================================
-- 4. VERIFICAÇÃO - LISTAR BLOCOS E QUESTÕES INSERIDAS
-- ============================================================================

SELECT '=== BLOCOS CRIADOS ===' AS info;
SELECT id, titulo, disciplina, dificuldade, status FROM blocos_questoes WHERE id >= @bloco_matematica_id;

SELECT '\n=== QUESTÕES INSERIDAS ===' AS info;
SELECT id, titulo, disciplina, dificuldade FROM questoes WHERE autor_id = @admin_id AND status_aprovacao = 'aprovada' AND id >= @q1 ORDER BY disciplina, id;

SELECT '\n=== ASSOCIAÇÕES BLOCO-QUESTÃO ===' AS info;
SELECT bq.id as bloco_id, bq.titulo as bloco_titulo, q.id as questao_id, q.titulo as questao_titulo, bqi.ordem 
FROM bloco_questoes_items bqi
JOIN blocos_questoes bq ON bq.id = bqi.bloco_id
JOIN questoes q ON q.id = bqi.questao_id
WHERE bq.id >= @bloco_matematica_id
ORDER BY bq.id, bqi.ordem;

SELECT '\n✅ População de Questões de Colaboradores Concluída!' AS resultado;
SELECT CONCAT('Total: 3 blocos e 10 questões criadas') AS resumo;
