-- Script: Inserir 45 questões para o Torneio Ativo
-- Descrição: 15 questões para cada disciplina (5 fácil, 5 médio, 5 difícil)
-- Disciplinas: Matemática, Inglês, Programação
-- Data: 2026-06-04

SET NAMES utf8mb4;
USE comaes_db;

-- Encontrar o torneio ativo
SET @torneio_id = (SELECT id FROM torneios WHERE status = 'ativo' ORDER BY id DESC LIMIT 1);

-- Se não houver torneio ativo, usar o mais recente
IF @torneio_id IS NULL THEN
  SET @torneio_id = (SELECT id FROM torneios ORDER BY id DESC LIMIT 1);
END IF;

-- Verificar se encontrou torneio
SELECT CONCAT('Torneio selecionado: ID = ', @torneio_id) as info;

-- ============================================================
-- MATEMÁTICA - FÁCIL (5 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao) VALUES
(@torneio_id, 'Adição simples', 'Quanto é 15 + 23?', 'matematica', 'multipla_escolha', 'facil', '["35","36","37","38"]', '38', '15 + 23 = 38', 10, 'aprovada'),
(@torneio_id, 'Multiplicação por 10', 'Quanto é 12 × 10?', 'matematica', 'multipla_escolha', 'facil', '["100","110","120","130"]', '120', '12 × 10 = 120', 10, 'aprovada'),
(@torneio_id, 'Divisão exata', 'Quanto é 72 ÷ 8?', 'matematica', 'multipla_escolha', 'facil', '["8","9","10","11"]', '9', '72 ÷ 8 = 9', 10, 'aprovada'),
(@torneio_id, 'Número primo', 'Qual destes números é primo?', 'matematica', 'multipla_escolha', 'facil', '["4","7","9","15"]', '7', '7 é divisível apenas por 1 e 7', 10, 'aprovada'),
(@torneio_id, 'Perímetro do quadrado', 'Qual é o perímetro de um quadrado com lado 5?', 'matematica', 'multipla_escolha', 'facil', '["15","20","25","30"]', '20', 'Perímetro = 4 × lado = 4 × 5 = 20', 10, 'aprovada'),

-- ============================================================
-- MATEMÁTICA - MÉDIO (5 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao) VALUES
(@torneio_id, 'Fração equivalente', 'Qual fração é equivalente a 2/5?', 'matematica', 'multipla_escolha', 'medio', '["3/7","4/10","3/8","5/12"]', '4/10', 'Multiplicando numerador e denominador por 2: (2×2)/(5×2) = 4/10', 15, 'aprovada'),
(@torneio_id, 'Regra de três simples', 'Se 3 kg de arroz custam 75 Kz, quanto custam 5 kg?', 'matematica', 'multipla_escolha', 'medio', '["100 Kz","125 Kz","150 Kz","175 Kz"]', '125 Kz', '75/3 = 25 Kz por kg, 25 × 5 = 125 Kz', 15, 'aprovada'),
(@torneio_id, 'Potência com expoente negativo', 'Qual é o valor de 2⁻³?', 'matematica', 'multipla_escolha', 'medio', '["1/8","1/6","1/4","1/2"]', '1/8', '2⁻³ = 1/2³ = 1/8', 15, 'aprovada'),
(@torneio_id, 'Ângulos em triângulo', 'Se dois ângulos de um triângulo medem 45° e 65°, qual é o terceiro?', 'matematica', 'multipla_escolha', 'medio', '["60°","65°","70°","75°"]', '70°', 'Soma dos ângulos = 180°, terceiro = 180° - 45° - 65° = 70°', 15, 'aprovada'),
(@torneio_id, 'Percentagem de aumento', 'Uma blusa custava 100 Kz e teve aumento de 20%. Qual é o novo preço?', 'matematica', 'multipla_escolha', 'medio', '["110 Kz","115 Kz","120 Kz","125 Kz"]', '120 Kz', '100 + (100 × 0,20) = 100 + 20 = 120 Kz', 15, 'aprovada'),

-- ============================================================
-- MATEMÁTICA - DIFÍCIL (5 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao) VALUES
(@torneio_id, 'Função quadrática', 'Qual é o vértice de f(x) = x² - 4x + 3?', 'matematica', 'multipla_escolha', 'dificil', '["(1, 0)","(2, -1)","(3, 0)","(4, 3)"]', '(2, -1)', 'Vértice x = -b/2a = 4/2 = 2, f(2) = 4 - 8 + 3 = -1', 20, 'aprovada'),
(@torneio_id, 'Trigonometria avançada', 'Se sen(θ) = 0,6 e θ está no primeiro quadrante, qual é cos(θ)?', 'matematica', 'multipla_escolha', 'dificil', '["0,6","0,8","0,9","0,95"]', '0,8', 'sen²(θ) + cos²(θ) = 1, 0,36 + cos²(θ) = 1, cos(θ) = 0,8', 20, 'aprovada'),
(@torneio_id, 'Matriz inversa', 'Qual é o determinante de uma matriz 2×2: [[2, 1], [1, 3]]?', 'matematica', 'multipla_escolha', 'dificil', '["4","5","6","7"]', '5', 'det = 2×3 - 1×1 = 6 - 1 = 5', 20, 'aprovada'),
(@torneio_id, 'Série aritmética', 'Qual é a soma dos 10 primeiros números naturais?', 'matematica', 'multipla_escolha', 'dificil', '["45","50","55","60"]', '55', 'S = n(n+1)/2 = 10×11/2 = 55', 20, 'aprovada'),
(@torneio_id, 'Desigualdade logarítmica', 'Para quais valores de x temos log₂(x) > 3?', 'matematica', 'multipla_escolha', 'dificil', '["x > 6","x > 8","x > 16","x > 32"]', 'x > 8', 'log₂(x) > 3 ⟹ x > 2³ ⟹ x > 8', 20, 'aprovada'),

-- ============================================================
-- INGLÊS - FÁCIL (5 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao) VALUES
(@torneio_id, 'Vocabulário básico - Profissões', 'What is "professor" in English?', 'ingles', 'multipla_escolha', 'facil', '["Student","Teacher","Doctor","Engineer"]', 'Teacher', '"Professor" translates to "Teacher" in English', 10, 'aprovada'),
(@torneio_id, 'Verb to have', 'Complete: I ___ two brothers.', 'ingles', 'multipla_escolha', 'facil', '["has","have","am","do"]', 'have', 'With "I" we use "have"', 10, 'aprovada'),
(@torneio_id, 'Plural nouns', 'What is the plural of "child"?', 'ingles', 'multipla_escolha', 'facil', '["childs","childes","children","childre"]', 'children', '"Child" is an irregular noun, plural is "children"', 10, 'aprovada'),
(@torneio_id, 'Possessive adjectives', 'Complete: This is ___ book. (pertence a ele)', 'ingles', 'multipla_escolha', 'facil', '["his","her","their","mine"]', 'his', 'With masculine third person singular we use "his"', 10, 'aprovada'),
(@torneio_id, 'Question formation', 'Choose the correct question:', 'ingles', 'multipla_escolha', 'facil', '["What you do?","What do you do?","You do what?","Do you what?"]', 'What do you do?', 'Correct question word order in English', 10, 'aprovada'),

-- ============================================================
-- INGLÊS - MÉDIO (5 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao) VALUES
(@torneio_id, 'Phrasal verbs', 'Complete: I need to ___ this document before submitting.', 'ingles', 'multipla_escolha', 'medio', '["look at","look for","look up","look after"]', 'look up', '"Look up" means search or verify information', 15, 'aprovada'),
(@torneio_id, 'Second conditional', 'Complete: If I ___ more money, I would travel.', 'ingles', 'multipla_escolha', 'medio', '["have","had","would have","had have"]', 'had', 'Second conditional: If + past simple + would + infinitive', 15, 'aprovada'),
(@torneio_id, 'Relative clauses', 'Choose the correct sentence:', 'ingles', 'multipla_escolha', 'medio', '["The man which I met yesterday","The man that I met yesterday","The man what I met yesterday","The man whom I met to yesterday"]', 'The man that I met yesterday', 'For people, we can use "that" or "who" in relative clauses', 15, 'aprovada'),
(@torneio_id, 'Superlatives', 'Complete: She is the ___ student in the class.', 'ingles', 'multipla_escolha', 'medio', '["more intelligent","most intelligent","intelligenter","intelligentest"]', 'most intelligent', 'Superlatives with multi-syllable adjectives use "most"', 15, 'aprovada'),
(@torneio_id, 'Reported speech', 'Complete: She said that she ___ not come to the party.', 'ingles', 'multipla_escolha', 'medio', '["would","will","could","can"]', 'would', 'In reported speech, future becomes "would"', 15, 'aprovada'),

-- ============================================================
-- INGLÊS - DIFÍCIL (5 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao) VALUES
(@torneio_id, 'Advanced vocabulary - Synonyms', 'Which word means "to postpone"?', 'ingles', 'multipla_escolha', 'dificil', '["Precipitate","Ameliorate","Defer","Curtail"]', 'Defer', '"Defer" means to postpone or delay', 20, 'aprovada'),
(@torneio_id, 'Inversion for emphasis', 'Choose the correct inversion:', 'ingles', 'multipla_escolha', 'dificil', '["Never I have seen such beauty","Never have I seen such beauty","Never I have seen beauty such","Have never I seen such beauty"]', 'Never have I seen such beauty', 'Negative adverbs at the beginning cause subject-verb inversion', 20, 'aprovada'),
(@torneio_id, 'Modal verbs - deduction', 'She isn''t answering her phone. She ___ be in a meeting.', 'ingles', 'multipla_escolha', 'dificil', '["can","might","must","could"]', 'must', '"Must" expresses strong probability or certainty', 20, 'aprovada'),
(@torneio_id, 'Collocations', 'Complete: I want to ___ a career in engineering.', 'ingles', 'multipla_escolha', 'dificil', '["build","create","make","establish"]', 'build', '"Build a career" is the correct collocation', 20, 'aprovada'),
(@torneio_id, 'Passive voice - complex', 'Complete: The project ___ by the team when the manager arrived.', 'ingles', 'multipla_escolha', 'dificil', '["was being completed","is being completed","had been completed","would be completed"]', 'was being completed', 'Past continuous passive: was + being + past participle', 20, 'aprovada'),

-- ============================================================
-- PROGRAMAÇÃO - FÁCIL (5 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao) VALUES
(@torneio_id, 'Conceito básico', 'O que é uma variável em programação?', 'programacao', 'multipla_escolha', 'facil', '["Um comando","Um local na memória para armazenar dados","Uma função","Um tipo de erro"]', 'Um local na memória para armazenar dados', 'Variáveis são espaços na memória onde armazenamos dados', 10, 'aprovada'),
(@torneio_id, 'Tipo de dado - Number', 'Qual tipo de dado representa números inteiros?', 'programacao', 'multipla_escolha', 'facil', '["String","Integer","Boolean","Array"]', 'Integer', 'Integer é o tipo de dado para números inteiros', 10, 'aprovada'),
(@torneio_id, 'Operador lógico', 'Qual é o resultado de true AND false?', 'programacao', 'multipla_escolha', 'facil', '["true","false","null","undefined"]', 'false', 'AND retorna false se qualquer operando for false', 10, 'aprovada'),
(@torneio_id, 'Loop básico', 'Qual loop executa enquanto a condição for verdadeira?', 'programacao', 'multipla_escolha', 'facil', '["for","while","do-while","foreach"]', 'while', 'While executa enquanto a condição for true', 10, 'aprovada'),
(@torneio_id, 'Array - índice', 'Se array = [10, 20, 30], qual é o valor de array[1]?', 'programacao', 'multipla_escolha', 'facil', '["10","20","30","undefined"]', '20', 'Arrays começam no índice 0, array[1] = 20', 10, 'aprovada'),

-- ============================================================
-- PROGRAMAÇÃO - MÉDIO (5 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao) VALUES
(@torneio_id, 'Função com parâmetros', 'O que a função retorna: function sum(a, b) { return a + b; } com sum(3, 5)?', 'programacao', 'multipla_escolha', 'medio', '["3","5","8","error"]', '8', 'A função retorna a + b = 3 + 5 = 8', 15, 'aprovada'),
(@torneio_id, 'Orientação a Objetos - Classe', 'O que é uma classe em programação?', 'programacao', 'multipla_escolha', 'medio', '["Uma variável","Um template para criar objetos","Uma função especial","Um tipo de array"]', 'Um template para criar objetos', 'Classes são templates que definem a estrutura dos objetos', 15, 'aprovada'),
(@torneio_id, 'Recursão', 'Qual é o resultado de factorial(3)? (3! = 3×2×1)', 'programacao', 'multipla_escolha', 'medio', '["3","6","9","12"]', '6', 'factorial(3) = 3 × 2 × 1 = 6', 15, 'aprovada'),
(@torneio_id, 'Estrutura de dados', 'Qual estrutura de dados funciona como FIFO (First In, First Out)?', 'programacao', 'multipla_escolha', 'medio', '["Stack","Queue","Tree","Graph"]', 'Queue', 'Queue é FIFO: primeiro a entrar é primeiro a sair', 15, 'aprovada'),
(@torneio_id, 'Algoritmo de busca', 'Qual é a complexidade de tempo da busca binária?', 'programacao', 'multipla_escolha', 'medio', '["O(n)","O(n²)","O(log n)","O(n log n)"]', 'O(log n)', 'Busca binária tem complexidade O(log n)', 15, 'aprovada'),

-- ============================================================
-- PROGRAMAÇÃO - DIFÍCIL (5 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao) VALUES
(@torneio_id, 'Design Pattern - Observer', 'O que caracteriza o padrão Observer?', 'programacao', 'multipla_escolha', 'dificil', '["Criação de objetos sem especificar classes","Objetos subscrevem para receber notificações","Divisão de responsabilidades","Adaptação de interfaces"]', 'Objetos subscrevem para receber notificações', 'Observer permite que objetos se inscrevam para receber notificações de mudanças', 20, 'aprovada'),
(@torneio_id, 'Complexidade - Merge Sort', 'Qual é a complexidade de tempo do Merge Sort no melhor caso?', 'programacao', 'multipla_escolha', 'dificil', '["O(n)","O(n²)","O(n log n)","O(log n)"]', 'O(n log n)', 'Merge Sort tem complexidade O(n log n) em todos os casos', 20, 'aprovada'),
(@torneio_id, 'Programação Funcional', 'O que é uma função pura?', 'programacao', 'multipla_escolha', 'dificil', '["Uma função que modifica variáveis globais","Uma função que sempre retorna o mesmo resultado para os mesmos inputs","Uma função que faz side effects","Uma função sem parâmetros"]', 'Uma função que sempre retorna o mesmo resultado para os mesmos inputs', 'Função pura: determinística e sem side effects', 20, 'aprovada'),
(@torneio_id, 'Git e Controle de Versão', 'O que significa fazer rebase em Git?', 'programacao', 'multipla_escolha', 'dificil', '["Deletar um branch","Unir mudanças aplicando commits de um branch sobre outro","Reverter o último commit","Criar um novo repositório"]', 'Unir mudanças aplicando commits de um branch sobre outro', 'Rebase reaplica commits de um branch em outro', 20, 'aprovada'),
(@torneio_id, 'SQL - Query complexa', 'Qual query retorna produtos de cada categoria com o maior preço?', 'programacao', 'multipla_escolha', 'dificil', '["SELECT * FROM products GROUP BY categoria","SELECT * FROM products WHERE price = MAX(price)","SELECT * FROM products WHERE (categoria, price) IN (SELECT categoria, MAX(price) FROM products GROUP BY categoria)","SELECT DISTINCT categoria FROM products"]', 'SELECT * FROM products WHERE (categoria, price) IN (SELECT categoria, MAX(price) FROM products GROUP BY categoria)', 'Subquery para encontrar o produto mais caro de cada categoria', 20, 'aprovada');

-- ============================================================
-- Verificação Final
-- ============================================================
SELECT 
  disciplina,
  dificuldade,
  COUNT(*) as total
FROM questoes
WHERE torneio_id = @torneio_id
GROUP BY disciplina, dificuldade
ORDER BY disciplina, FIELD(dificuldade, 'facil', 'medio', 'dificil');

SELECT 
  disciplina,
  COUNT(*) as total
FROM questoes
WHERE torneio_id = @torneio_id
GROUP BY disciplina
ORDER BY disciplina;

SELECT CONCAT('Total de questões inseridas: ', COUNT(*)) as resultado
FROM questoes
WHERE torneio_id = @torneio_id;
