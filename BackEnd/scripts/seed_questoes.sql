-- ============================================================
-- SEED: 60 questões para o torneio ativo ID=32
-- 20 Matemática | 20 Inglês | 20 Programação
-- 6-7 por nível de dificuldade (facil/medio/dificil) por disciplina
-- ============================================================

SET @tid = 32;

-- ============================================================
-- MATEMÁTICA (20 questões)
-- ============================================================

-- ─── FÁCIL (7 questões) ───────────────────────────────────

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Adição básica', 'Quanto é 15 + 27?', 'matematica', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"40"},{"id":"b","texto":"42"},{"id":"c","texto":"41"},{"id":"d","texto":"43"}]',
  'b', '15 + 27 = 42.', 10, 'aprovada', NOW(), NOW());
SET @q1 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q1, 'facil', @tid, 'b', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Subtração simples', 'Quanto é 100 - 37?', 'matematica', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"63"},{"id":"b","texto":"73"},{"id":"c","texto":"53"},{"id":"d","texto":"67"}]',
  'a', '100 - 37 = 63.', 10, 'aprovada', NOW(), NOW());
SET @q2 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q2, 'facil', @tid, 'a', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Multiplicação', 'Quanto é 6 × 8?', 'matematica', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"42"},{"id":"b","texto":"48"},{"id":"c","texto":"54"},{"id":"d","texto":"46"}]',
  'b', '6 × 8 = 48.', 10, 'aprovada', NOW(), NOW());
SET @q3 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q3, 'facil', @tid, 'b', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Divisão básica', 'Quanto é 72 ÷ 9?', 'matematica', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"7"},{"id":"b","texto":"9"},{"id":"c","texto":"8"},{"id":"d","texto":"6"}]',
  'c', '72 ÷ 9 = 8.', 10, 'aprovada', NOW(), NOW());
SET @q4 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q4, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Números pares', 'Qual destes números é par?', 'matematica', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"17"},{"id":"b","texto":"23"},{"id":"c","texto":"34"},{"id":"d","texto":"51"}]',
  'c', '34 é divisível por 2, logo é par.', 10, 'aprovada', NOW(), NOW());
SET @q5 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q5, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Ordem crescente', 'Qual sequência está em ordem crescente?', 'matematica', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"9, 5, 3, 1"},{"id":"b","texto":"2, 4, 7, 11"},{"id":"c","texto":"10, 8, 6, 4"},{"id":"d","texto":"15, 12, 9, 3"}]',
  'b', 'A sequência 2, 4, 7, 11 está em ordem crescente.', 10, 'aprovada', NOW(), NOW());
SET @q6 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q6, 'facil', @tid, 'b', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Fração simples', 'Qual é metade de 50?', 'matematica', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"20"},{"id":"b","texto":"30"},{"id":"c","texto":"25"},{"id":"d","texto":"10"}]',
  'c', 'Metade de 50 é 50/2 = 25.', 10, 'aprovada', NOW(), NOW());
SET @q7 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q7, 'facil', @tid, 'c', 10);

-- ─── MÉDIO (7 questões) ───────────────────────────────────

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Potência', 'Quanto é 2⁵?', 'matematica', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"16"},{"id":"b","texto":"10"},{"id":"c","texto":"32"},{"id":"d","texto":"64"}]',
  'c', '2⁵ = 2×2×2×2×2 = 32.', 15, 'aprovada', NOW(), NOW());
SET @q8 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q8, 'medio', @tid, 'c', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Percentagem', 'Quanto é 20% de 150?', 'matematica', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"25"},{"id":"b","texto":"30"},{"id":"c","texto":"20"},{"id":"d","texto":"35"}]',
  'b', '20% de 150 = 150 × 0.2 = 30.', 15, 'aprovada', NOW(), NOW());
SET @q9 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q9, 'medio', @tid, 'b', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Equação linear', 'Se 3x = 21, quanto é x?', 'matematica', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"6"},{"id":"b","texto":"8"},{"id":"c","texto":"7"},{"id":"d","texto":"9"}]',
  'c', '3x = 21 → x = 21/3 = 7.', 15, 'aprovada', NOW(), NOW());
SET @q10 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q10, 'medio', @tid, 'c', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Área do retângulo', 'Um retângulo tem 8 cm de comprimento e 5 cm de largura. Qual é a sua área?', 'matematica', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"26 cm²"},{"id":"b","texto":"40 cm²"},{"id":"c","texto":"13 cm²"},{"id":"d","texto":"45 cm²"}]',
  'b', 'Área = comprimento × largura = 8 × 5 = 40 cm².', 15, 'aprovada', NOW(), NOW());
SET @q11 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q11, 'medio', @tid, 'b', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'MMC', 'Qual é o MMC de 4 e 6?', 'matematica', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"8"},{"id":"b","texto":"24"},{"id":"c","texto":"12"},{"id":"d","texto":"6"}]',
  'c', 'Múltiplos de 4: 4,8,12... Múltiplos de 6: 6,12... MMC = 12.', 15, 'aprovada', NOW(), NOW());
SET @q12 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q12, 'medio', @tid, 'c', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Proporção', 'Se 4 maçãs custam 200 Kz, quanto custam 10 maçãs?', 'matematica', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"400 Kz"},{"id":"b","texto":"600 Kz"},{"id":"c","texto":"500 Kz"},{"id":"d","texto":"450 Kz"}]',
  'c', '4 → 200; 10 → 10×200/4 = 500 Kz.', 15, 'aprovada', NOW(), NOW());
SET @q13 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q13, 'medio', @tid, 'c', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Média aritmética', 'Qual é a média de 10, 20 e 30?', 'matematica', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"15"},{"id":"b","texto":"25"},{"id":"c","texto":"20"},{"id":"d","texto":"30"}]',
  'c', 'Média = (10+20+30)/3 = 60/3 = 20.', 15, 'aprovada', NOW(), NOW());
SET @q14 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q14, 'medio', @tid, 'c', 15);

-- ─── DIFÍCIL (6 questões) ─────────────────────────────────

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Equação quadrática', 'Quais são as raízes de x² - 5x + 6 = 0?', 'matematica', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"x=1 e x=6"},{"id":"b","texto":"x=2 e x=3"},{"id":"c","texto":"x=-2 e x=-3"},{"id":"d","texto":"x=0 e x=5"}]',
  'b', 'Fatorando: (x-2)(x-3)=0 → x=2 ou x=3.', 20, 'aprovada', NOW(), NOW());
SET @q15 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q15, 'dificil', @tid, 'b', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Progressão aritmética', 'Na PA (3, 7, 11, ...) qual é o 10º termo?', 'matematica', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"39"},{"id":"b","texto":"43"},{"id":"c","texto":"35"},{"id":"d","texto":"47"}]',
  'a', 'aₙ = a₁ + (n-1)×r = 3 + 9×4 = 3+36 = 39.', 20, 'aprovada', NOW(), NOW());
SET @q16 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q16, 'dificil', @tid, 'a', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Logaritmo', 'Quanto é log₂(32)?', 'matematica', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"4"},{"id":"b","texto":"6"},{"id":"c","texto":"5"},{"id":"d","texto":"3"}]',
  'c', '2⁵ = 32, logo log₂(32) = 5.', 20, 'aprovada', NOW(), NOW());
SET @q17 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q17, 'dificil', @tid, 'c', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Combinação', 'De quantas formas podemos escolher 2 elementos de um conjunto de 5?', 'matematica', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"20"},{"id":"b","texto":"10"},{"id":"c","texto":"15"},{"id":"d","texto":"25"}]',
  'b', 'C(5,2) = 5!/(2!×3!) = 10.', 20, 'aprovada', NOW(), NOW());
SET @q18 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q18, 'dificil', @tid, 'b', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Derivada', 'Qual é a derivada de f(x) = 3x² + 2x?', 'matematica', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"6x + 2"},{"id":"b","texto":"3x + 2"},{"id":"c","texto":"6x"},{"id":"d","texto":"3x² + 2"}]',
  'a', 'f\'(x) = 6x + 2 (regra da potência).', 20, 'aprovada', NOW(), NOW());
SET @q19 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q19, 'dificil', @tid, 'a', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Trigonometria', 'Quanto é sen(30°)?', 'matematica', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"√3/2"},{"id":"b","texto":"1"},{"id":"c","texto":"1/2"},{"id":"d","texto":"√2/2"}]',
  'c', 'sen(30°) = 1/2, valor tabelado.', 20, 'aprovada', NOW(), NOW());
SET @q20 = LAST_INSERT_ID();
INSERT INTO questoes_matematica (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@q20, 'dificil', @tid, 'c', 20);


-- ============================================================
-- INGLÊS (20 questões)
-- ============================================================

-- ─── FÁCIL (7 questões) ───────────────────────────────────

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Basic greeting', 'How do you say "Bom dia" in English?', 'ingles', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"Good night"},{"id":"b","texto":"Good afternoon"},{"id":"c","texto":"Good morning"},{"id":"d","texto":"Good evening"}]',
  'c', '"Bom dia" translates to "Good morning".', 10, 'aprovada', NOW(), NOW());
SET @qi1 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi1, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Colors', 'What color is the sky on a clear day?', 'ingles', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"Green"},{"id":"b","texto":"Yellow"},{"id":"c","texto":"Blue"},{"id":"d","texto":"Red"}]',
  'c', 'The sky is blue on a clear day.', 10, 'aprovada', NOW(), NOW());
SET @qi2 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi2, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Numbers', 'How do you write "5" in English words?', 'ingles', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"Four"},{"id":"b","texto":"Six"},{"id":"c","texto":"Five"},{"id":"d","texto":"Seven"}]',
  'c', '"5" is written as "Five" in English.', 10, 'aprovada', NOW(), NOW());
SET @qi3 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi3, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Animals', 'What is the English word for "cão"?', 'ingles', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"Cat"},{"id":"b","texto":"Dog"},{"id":"c","texto":"Bird"},{"id":"d","texto":"Fish"}]',
  'b', '"Cão" in English is "Dog".', 10, 'aprovada', NOW(), NOW());
SET @qi4 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi4, 'facil', @tid, 'b', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Days of the week', 'Which day comes after Monday?', 'ingles', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"Sunday"},{"id":"b","texto":"Wednesday"},{"id":"c","texto":"Tuesday"},{"id":"d","texto":"Thursday"}]',
  'c', 'After Monday comes Tuesday.', 10, 'aprovada', NOW(), NOW());
SET @qi5 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi5, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Verb to be', 'Choose the correct sentence: "She ___ a student."', 'ingles', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"are"},{"id":"b","texto":"am"},{"id":"c","texto":"is"},{"id":"d","texto":"be"}]',
  'c', 'For third person singular (she/he/it) we use "is".', 10, 'aprovada', NOW(), NOW());
SET @qi6 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi6, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Opposites', 'What is the opposite of "big"?', 'ingles', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"Large"},{"id":"b","texto":"Tall"},{"id":"c","texto":"Small"},{"id":"d","texto":"Wide"}]',
  'c', 'The opposite of "big" is "small".', 10, 'aprovada', NOW(), NOW());
SET @qi7 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi7, 'facil', @tid, 'c', 10);

-- ─── MÉDIO (7 questões) ───────────────────────────────────

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Present Perfect', 'Choose the correct sentence using Present Perfect:', 'ingles', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"I did finish my homework."},{"id":"b","texto":"I have finished my homework."},{"id":"c","texto":"I finishing my homework."},{"id":"d","texto":"I finish my homework yesterday."}]',
  'b', 'Present Perfect uses "have/has + past participle": have finished.', 15, 'aprovada', NOW(), NOW());
SET @qi8 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi8, 'medio', @tid, 'b', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Conditional', 'Complete: "If it rains, I ___ stay home."', 'ingles', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"would"},{"id":"b","texto":"will"},{"id":"c","texto":"should"},{"id":"d","texto":"might"}]',
  'b', 'First conditional: If + present simple, will + infinitive.', 15, 'aprovada', NOW(), NOW());
SET @qi9 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi9, 'medio', @tid, 'b', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Vocabulary', 'What does "perseverance" mean?', 'ingles', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"Giving up easily"},{"id":"b","texto":"Continued effort despite difficulties"},{"id":"c","texto":"Acting quickly"},{"id":"d","texto":"Being lazy"}]',
  'b', 'Perseverance = continued steady effort to achieve something despite difficulties.', 15, 'aprovada', NOW(), NOW());
SET @qi10 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi10, 'medio', @tid, 'b', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Passive Voice', 'Convert to passive: "The teacher explains the lesson."', 'ingles', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"The lesson is explained by the teacher."},{"id":"b","texto":"The lesson explained the teacher."},{"id":"c","texto":"The teacher is explaining the lesson."},{"id":"d","texto":"The lesson was explaining."}]',
  'a', 'Passive: Subject + to be + past participle + by + agent.', 15, 'aprovada', NOW(), NOW());
SET @qi11 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi11, 'medio', @tid, 'a', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Prepositions', 'The meeting is ___ Monday ___ 9 AM.', 'ingles', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"in / at"},{"id":"b","texto":"on / at"},{"id":"c","texto":"at / in"},{"id":"d","texto":"on / in"}]',
  'b', 'Days of the week use "on"; specific times use "at": on Monday at 9 AM.', 15, 'aprovada', NOW(), NOW());
SET @qi12 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi12, 'medio', @tid, 'b', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Phrasal Verb', 'What does "give up" mean?', 'ingles', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"To donate something"},{"id":"b","texto":"To stop trying"},{"id":"c","texto":"To increase effort"},{"id":"d","texto":"To start something"}]',
  'b', '"Give up" is a phrasal verb meaning to stop trying or quit.', 15, 'aprovada', NOW(), NOW());
SET @qi13 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi13, 'medio', @tid, 'b', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Reported Speech', 'Direct: "I love football", he said. Reported: He said that he ___ football.', 'ingles', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"loves"},{"id":"b","texto":"loved"},{"id":"c","texto":"love"},{"id":"d","texto":"had loved"}]',
  'b', 'In reported speech, present simple becomes past simple: loves → loved.', 15, 'aprovada', NOW(), NOW());
SET @qi14 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi14, 'medio', @tid, 'b', 15);

-- ─── DIFÍCIL (6 questões) ─────────────────────────────────

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Advanced Grammar', 'Choose the grammatically correct sentence:', 'ingles', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"Despite of the rain, we went out."},{"id":"b","texto":"Despite the rain, we went out."},{"id":"c","texto":"In spite the rain, we went out."},{"id":"d","texto":"Although the rain, we went out."}]',
  'b', '"Despite" is never followed by "of". Correct: "Despite the rain".', 20, 'aprovada', NOW(), NOW());
SET @qi15 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi15, 'dificil', @tid, 'b', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Idioms', 'What does "bite the bullet" mean?', 'ingles', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"To eat something hard"},{"id":"b","texto":"To avoid a problem"},{"id":"c","texto":"To endure a painful situation"},{"id":"d","texto":"To be very angry"}]',
  'c', '"Bite the bullet" means to endure a painful or difficult situation stoically.', 20, 'aprovada', NOW(), NOW());
SET @qi16 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi16, 'dificil', @tid, 'c', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Complex tenses', '"By the time she arrives, we ___ waiting for two hours."', 'ingles', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"will have been"},{"id":"b","texto":"have been"},{"id":"c","texto":"will be"},{"id":"d","texto":"had been"}]',
  'a', 'Future Perfect Continuous: will have been + verb-ing. Describes an action ongoing until a future point.', 20, 'aprovada', NOW(), NOW());
SET @qi17 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi17, 'dificil', @tid, 'a', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Subjunctive', '"The doctor recommended that he ___ more water."', 'ingles', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"drank"},{"id":"b","texto":"drink"},{"id":"c","texto":"drinks"},{"id":"d","texto":"would drink"}]',
  'b', 'Subjunctive mood after "recommend that": base form of verb regardless of subject.', 20, 'aprovada', NOW(), NOW());
SET @qi18 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi18, 'dificil', @tid, 'b', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Inversion', 'Which sentence uses correct inversion?', 'ingles', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"Never I have seen such beauty."},{"id":"b","texto":"Never have I seen such beauty."},{"id":"c","texto":"Never I seen have such beauty."},{"id":"d","texto":"Never seen have I such beauty."}]',
  'b', 'Negative inversion: Never + auxiliary + subject + verb. "Never have I seen..."', 20, 'aprovada', NOW(), NOW());
SET @qi19 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi19, 'dificil', @tid, 'b', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Word formation', 'What is the noun form of "achieve"?', 'ingles', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"Achieval"},{"id":"b","texto":"Achievance"},{"id":"c","texto":"Achievement"},{"id":"d","texto":"Achieving"}]',
  'c', 'The noun form of "achieve" is "achievement" (suffix -ment).', 20, 'aprovada', NOW(), NOW());
SET @qi20 = LAST_INSERT_ID();
INSERT INTO questoes_ingles (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qi20, 'dificil', @tid, 'c', 20);


-- ============================================================
-- PROGRAMAÇÃO (20 questões)
-- ============================================================

-- ─── FÁCIL (7 questões) ───────────────────────────────────

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Tipo de dado', 'Em linguagens de programação, o que armazena uma variável do tipo "inteiro"?', 'programacao', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"Texto"},{"id":"b","texto":"Números decimais"},{"id":"c","texto":"Números inteiros"},{"id":"d","texto":"Valores booleanos"}]',
  'c', 'Variáveis do tipo inteiro armazenam números sem casas decimais.', 10, 'aprovada', NOW(), NOW());
SET @qp1 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp1, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Operador lógico', 'O que retorna a expressão: TRUE AND FALSE?', 'programacao', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"TRUE"},{"id":"b","texto":"FALSE"},{"id":"c","texto":"NULL"},{"id":"d","texto":"ERROR"}]',
  'b', 'AND só retorna TRUE se ambos os operandos forem TRUE. TRUE AND FALSE = FALSE.', 10, 'aprovada', NOW(), NOW());
SET @qp2 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp2, 'facil', @tid, 'b', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Estrutura de seleção', 'Qual estrutura é usada para tomar decisões em programação?', 'programacao', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"for"},{"id":"b","texto":"while"},{"id":"c","texto":"if-else"},{"id":"d","texto":"print"}]',
  'c', 'A estrutura if-else é usada para executar código condicionalmente.', 10, 'aprovada', NOW(), NOW());
SET @qp3 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp3, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'HTML básico', 'Qual tag HTML define um parágrafo?', 'programacao', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"<div>"},{"id":"b","texto":"<span>"},{"id":"c","texto":"<p>"},{"id":"d","texto":"<h1>"}]',
  'c', 'A tag <p> é usada para definir parágrafos em HTML.', 10, 'aprovada', NOW(), NOW());
SET @qp4 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp4, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Array/Vetor', 'Em programação, o que é um array?', 'programacao', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"Uma função que repete código"},{"id":"b","texto":"Uma coleção de valores do mesmo tipo"},{"id":"c","texto":"Um tipo de loop"},{"id":"d","texto":"Uma instrução condicional"}]',
  'b', 'Um array (ou vetor) é uma estrutura que armazena múltiplos valores do mesmo tipo.', 10, 'aprovada', NOW(), NOW());
SET @qp5 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp5, 'facil', @tid, 'b', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Loop básico', 'Qual estrutura repete um bloco de código enquanto uma condição for verdadeira?', 'programacao', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"if"},{"id":"b","texto":"switch"},{"id":"c","texto":"while"},{"id":"d","texto":"return"}]',
  'c', 'O while executa o bloco repetidamente enquanto a condição for verdadeira.', 10, 'aprovada', NOW(), NOW());
SET @qp6 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp6, 'facil', @tid, 'c', 10);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Comentário em código', 'Como se escreve um comentário de linha única em JavaScript?', 'programacao', 'multipla_escolha', 'facil',
  '[{"id":"a","texto":"/* comentário */"},{"id":"b","texto":"# comentário"},{"id":"c","texto":"// comentário"},{"id":"d","texto":"<!-- comentário -->"}]',
  'c', 'Em JavaScript, comentários de linha única usam //.', 10, 'aprovada', NOW(), NOW());
SET @qp7 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp7, 'facil', @tid, 'c', 10);

-- ─── MÉDIO (7 questões) ───────────────────────────────────

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Complexidade Big O', 'Qual é a complexidade de tempo de uma busca linear em um array de n elementos?', 'programacao', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"O(1)"},{"id":"b","texto":"O(log n)"},{"id":"c","texto":"O(n)"},{"id":"d","texto":"O(n²)"}]',
  'c', 'Busca linear verifica cada elemento → O(n) no pior caso.', 15, 'aprovada', NOW(), NOW());
SET @qp8 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp8, 'medio', @tid, 'c', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Recursão', 'O que é uma função recursiva?', 'programacao', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"Uma função que nunca termina"},{"id":"b","texto":"Uma função que chama a si mesma"},{"id":"c","texto":"Uma função sem parâmetros"},{"id":"d","texto":"Uma função que retorna sempre zero"}]',
  'b', 'Uma função recursiva é aquela que chama a si mesma durante a sua execução.', 15, 'aprovada', NOW(), NOW());
SET @qp9 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp9, 'medio', @tid, 'b', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'OOP - Herança', 'Em OOP, o que é herança?', 'programacao', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"Quando uma classe copia exatamente outra"},{"id":"b","texto":"Quando uma classe adquire propriedades e métodos de outra"},{"id":"c","texto":"Quando duas classes são idênticas"},{"id":"d","texto":"Quando uma função chama outra"}]',
  'b', 'Herança permite que uma classe (filha) adquira propriedades e métodos de outra (pai).', 15, 'aprovada', NOW(), NOW());
SET @qp10 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp10, 'medio', @tid, 'b', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'SQL básico', 'Qual comando SQL seleciona todos os registros de uma tabela "usuarios"?', 'programacao', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"GET * FROM usuarios"},{"id":"b","texto":"FETCH ALL usuarios"},{"id":"c","texto":"SELECT * FROM usuarios"},{"id":"d","texto":"SHOW usuarios"}]',
  'c', 'SELECT * FROM tabela é a sintaxe correta para selecionar todos os registros.', 15, 'aprovada', NOW(), NOW());
SET @qp11 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp11, 'medio', @tid, 'c', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Git básico', 'Qual comando Git envia as alterações locais para o repositório remoto?', 'programacao', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"git pull"},{"id":"b","texto":"git commit"},{"id":"c","texto":"git push"},{"id":"d","texto":"git add"}]',
  'c', '"git push" envia os commits locais para o repositório remoto.', 15, 'aprovada', NOW(), NOW());
SET @qp12 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp12, 'medio', @tid, 'c', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'API REST', 'Qual método HTTP é usado para criar um novo recurso numa API REST?', 'programacao', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"GET"},{"id":"b","texto":"DELETE"},{"id":"c","texto":"POST"},{"id":"d","texto":"PATCH"}]',
  'c', 'O método POST é convencionalmente usado para criar novos recursos.', 15, 'aprovada', NOW(), NOW());
SET @qp13 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp13, 'medio', @tid, 'c', 15);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Estrutura de dados', 'Numa pilha (Stack), qual é o princípio de operação?', 'programacao', 'multipla_escolha', 'medio',
  '[{"id":"a","texto":"FIFO - primeiro a entrar, primeiro a sair"},{"id":"b","texto":"LIFO - último a entrar, primeiro a sair"},{"id":"c","texto":"Aleatório"},{"id":"d","texto":"Ordenado por valor"}]',
  'b', 'Stack usa LIFO: Last In, First Out — o último elemento inserido é o primeiro a sair.', 15, 'aprovada', NOW(), NOW());
SET @qp14 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp14, 'medio', @tid, 'b', 15);

-- ─── DIFÍCIL (6 questões) ─────────────────────────────────

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Algoritmo de ordenação', 'Qual é a complexidade média do QuickSort?', 'programacao', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"O(n)"},{"id":"b","texto":"O(n log n)"},{"id":"c","texto":"O(n²)"},{"id":"d","texto":"O(log n)"}]',
  'b', 'QuickSort tem complexidade média O(n log n) e pior caso O(n²).', 20, 'aprovada', NOW(), NOW());
SET @qp15 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp15, 'dificil', @tid, 'b', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Design Pattern', 'O padrão Singleton garante que:', 'programacao', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"Uma classe pode ser herdada apenas uma vez"},{"id":"b","texto":"Uma classe tenha apenas uma instância em toda a aplicação"},{"id":"c","texto":"Métodos sejam chamados em ordem específica"},{"id":"d","texto":"Objetos sejam criados em grupos"}]',
  'b', 'Singleton restringe a instanciação de uma classe a um único objeto.', 20, 'aprovada', NOW(), NOW());
SET @qp16 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp16, 'dificil', @tid, 'b', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Ponteiros', 'Em C, o que o operador * faz quando aplicado a um ponteiro?', 'programacao', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"Retorna o endereço da variável"},{"id":"b","texto":"Multiplica o valor do ponteiro"},{"id":"c","texto":"Acessa o valor armazenado no endereço apontado"},{"id":"d","texto":"Cria um novo ponteiro"}]',
  'c', 'O operador * (dereference) acessa o valor armazenado no endereço de memória apontado.', 20, 'aprovada', NOW(), NOW());
SET @qp17 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp17, 'dificil', @tid, 'c', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Transações SQL', 'Qual comando SQL desfaz todas as operações de uma transação não confirmada?', 'programacao', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"UNDO"},{"id":"b","texto":"REVERT"},{"id":"c","texto":"ROLLBACK"},{"id":"d","texto":"CANCEL"}]',
  'c', 'ROLLBACK desfaz todas as operações da transação atual não confirmada (COMMIT).', 20, 'aprovada', NOW(), NOW());
SET @qp18 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp18, 'dificil', @tid, 'c', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Programação funcional', 'O que é uma função pura em programação funcional?', 'programacao', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"Uma função sem parâmetros"},{"id":"b","texto":"Uma função que modifica variáveis globais"},{"id":"c","texto":"Uma função que sempre retorna o mesmo resultado para os mesmos inputs sem efeitos colaterais"},{"id":"d","texto":"Uma função que só executa uma vez"}]',
  'c', 'Função pura: mesmo input → mesmo output, sem side effects (sem modificar estado externo).', 20, 'aprovada', NOW(), NOW());
SET @qp19 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp19, 'dificil', @tid, 'c', 20);

INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos, status_aprovacao, created_at, updated_at) VALUES
(@tid, 'Concorrência', 'O que é um deadlock em sistemas concorrentes?', 'programacao', 'multipla_escolha', 'dificil',
  '[{"id":"a","texto":"Quando um processo termina inesperadamente"},{"id":"b","texto":"Quando dois ou mais processos ficam bloqueados esperando por recursos detidos um pelo outro"},{"id":"c","texto":"Quando a memória RAM está cheia"},{"id":"d","texto":"Quando um loop executa infinitamente"}]',
  'b', 'Deadlock ocorre quando dois processos esperam indefinidamente por recursos detidos mutuamente.', 20, 'aprovada', NOW(), NOW());
SET @qp20 = LAST_INSERT_ID();
INSERT INTO questoes_programacao (id, dificuldade, torneio_id, resposta_correta, pontos) VALUES (@qp20, 'dificil', @tid, 'c', 20);

SELECT 'Questões inseridas com sucesso!' AS resultado;
SELECT 
  disciplina,
  dificuldade,
  COUNT(*) AS total
FROM questoes
WHERE torneio_id = 32
GROUP BY disciplina, dificuldade
ORDER BY disciplina, dificuldade;
