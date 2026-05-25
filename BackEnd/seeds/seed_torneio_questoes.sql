-- Seed: Questões dos Torneios (torneio_id = 16)
-- Tabela: questoes
-- 45 questões por disciplina (15 fácil + 15 médio + 15 difícil)
-- Disciplinas: matematica, ingles, programacao

SET NAMES utf8mb4;
USE comaes_db;

-- Limpar questões existentes do torneio 16
DELETE FROM questoes WHERE torneio_id = 16;

-- ============================================================
-- MATEMÁTICA - FÁCIL (15 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos) VALUES
(16, 'Adição simples', 'Quanto é 8 + 7?', 'matematica', 'multipla_escolha', 'facil', '["13","14","15","16"]', '15', '8 + 7 = 15', 10),
(16, 'Subtração', 'Quanto é 20 - 13?', 'matematica', 'multipla_escolha', 'facil', '["5","6","7","8"]', '7', '20 - 13 = 7', 10),
(16, 'Multiplicação', 'Quanto é 6 × 7?', 'matematica', 'multipla_escolha', 'facil', '["36","40","42","48"]', '42', '6 × 7 = 42', 10),
(16, 'Divisão', 'Quanto é 48 ÷ 6?', 'matematica', 'multipla_escolha', 'facil', '["6","7","8","9"]', '8', '48 ÷ 6 = 8', 10),
(16, 'Quadrado', 'Qual é o quadrado de 7?', 'matematica', 'multipla_escolha', 'facil', '["42","47","49","56"]', '49', '7² = 49', 10),
(16, 'Metade', 'Qual é a metade de 36?', 'matematica', 'multipla_escolha', 'facil', '["16","17","18","19"]', '18', '36 ÷ 2 = 18', 10),
(16, 'Dobro', 'Qual é o dobro de 23?', 'matematica', 'multipla_escolha', 'facil', '["44","46","48","50"]', '46', '23 × 2 = 46', 10),
(16, 'Número par', 'Qual destes números é par?', 'matematica', 'multipla_escolha', 'facil', '["13","17","22","31"]', '22', 'Números pares são divisíveis por 2', 10),
(16, 'Fração simples', 'Quanto é 1/2 + 1/2?', 'matematica', 'multipla_escolha', 'facil', '["1/4","1/2","1","2"]', '1', '1/2 + 1/2 = 2/2 = 1', 10),
(16, 'Percentagem básica', 'Quanto é 10% de 50?', 'matematica', 'multipla_escolha', 'facil', '["4","5","6","7"]', '5', '10% de 50 = 50 × 0,1 = 5', 10),
(16, 'Ordem de grandeza', 'Qual é o maior número?', 'matematica', 'multipla_escolha', 'facil', '["0,9","0,09","0,99","0,009"]', '0,99', '0,99 > 0,9 > 0,09 > 0,009', 10),
(16, 'Potência de 2', 'Quanto é 2⁵?', 'matematica', 'multipla_escolha', 'facil', '["10","16","32","64"]', '32', '2⁵ = 2×2×2×2×2 = 32', 10),
(16, 'Raiz quadrada', 'Qual é a raiz quadrada de 81?', 'matematica', 'multipla_escolha', 'facil', '["7","8","9","10"]', '9', '9² = 81', 10),
(16, 'Ângulo reto', 'Quantos graus tem um ângulo reto?', 'matematica', 'multipla_escolha', 'facil', '["45°","60°","90°","180°"]', '90°', 'Um ângulo reto mede 90°', 10),
(16, 'Triângulo', 'Qual é a soma dos ângulos internos de um triângulo?', 'matematica', 'multipla_escolha', 'facil', '["90°","180°","270°","360°"]', '180°', 'A soma dos ângulos internos de qualquer triângulo é 180°', 10);

-- ============================================================
-- MATEMÁTICA - MÉDIO (15 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos) VALUES
(16, 'Equação linear', 'Se 2x + 6 = 14, qual é x?', 'matematica', 'multipla_escolha', 'medio', '["3","4","5","6"]', '4', '2x = 14 - 6 = 8, x = 4', 15),
(16, 'Percentagem', 'Quanto é 25% de 160?', 'matematica', 'multipla_escolha', 'medio', '["30","35","40","45"]', '40', '25% = 1/4, 160 ÷ 4 = 40', 15),
(16, 'Área do círculo', 'Qual é a área de um círculo com raio 5? (π ≈ 3,14)', 'matematica', 'multipla_escolha', 'medio', '["31,4","62,8","78,5","157"]', '78,5', 'A = π × r² = 3,14 × 25 = 78,5', 15),
(16, 'MMC', 'Qual é o MMC de 6 e 9?', 'matematica', 'multipla_escolha', 'medio', '["3","12","18","54"]', '18', 'MMC(6,9) = 18', 15),
(16, 'MDC', 'Qual é o MDC de 24 e 36?', 'matematica', 'multipla_escolha', 'medio', '["4","6","8","12"]', '12', 'MDC(24,36) = 12', 15),
(16, 'Progressão aritmética', 'Na PA 3, 7, 11, 15... qual é o 8º termo?', 'matematica', 'multipla_escolha', 'medio', '["27","29","31","33"]', '31', 'a₈ = 3 + (8-1)×4 = 3 + 28 = 31', 15),
(16, 'Teorema de Pitágoras', 'Num triângulo retângulo com catetos 3 e 4, qual é a hipotenusa?', 'matematica', 'multipla_escolha', 'medio', '["4","5","6","7"]', '5', '√(3² + 4²) = √(9+16) = √25 = 5', 15),
(16, 'Logaritmo', 'Quanto é log₂(8)?', 'matematica', 'multipla_escolha', 'medio', '["2","3","4","8"]', '3', 'log₂(8) = 3 porque 2³ = 8', 15),
(16, 'Sistema de equações', 'Se x + y = 10 e x - y = 4, qual é x?', 'matematica', 'multipla_escolha', 'medio', '["5","6","7","8"]', '7', 'Somando: 2x = 14, x = 7', 15),
(16, 'Volume do cubo', 'Qual é o volume de um cubo com aresta 4?', 'matematica', 'multipla_escolha', 'medio', '["16","32","48","64"]', '64', 'V = a³ = 4³ = 64', 15),
(16, 'Fração irredutível', 'Qual é a forma irredutível de 12/18?', 'matematica', 'multipla_escolha', 'medio', '["1/2","2/3","3/4","4/6"]', '2/3', 'MDC(12,18) = 6, 12/6 = 2, 18/6 = 3', 15),
(16, 'Regra de três', 'Se 5 livros custam 75 Kz, quanto custam 8 livros?', 'matematica', 'multipla_escolha', 'medio', '["100","110","120","130"]', '120', '75/5 = 15 Kz por livro, 15 × 8 = 120', 15),
(16, 'Probabilidade', 'Ao lançar um dado, qual é a probabilidade de sair número par?', 'matematica', 'multipla_escolha', 'medio', '["1/6","1/3","1/2","2/3"]', '1/2', 'Pares: {2,4,6} = 3 casos, total = 6, P = 3/6 = 1/2', 15),
(16, 'Média aritmética', 'Qual é a média de 10, 15, 20, 25, 30?', 'matematica', 'multipla_escolha', 'medio', '["18","20","22","25"]', '20', '(10+15+20+25+30)/5 = 100/5 = 20', 15),
(16, 'Inequação', 'Qual é a solução de 3x - 5 > 7?', 'matematica', 'multipla_escolha', 'medio', '["x > 2","x > 3","x > 4","x > 5"]', 'x > 4', '3x > 12, x > 4', 15);

-- ============================================================
-- MATEMÁTICA - DIFÍCIL (15 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos) VALUES
(16, 'Derivada', 'Qual é a derivada de f(x) = 3x⁴ - 2x² + 5?', 'matematica', 'multipla_escolha', 'dificil', '["12x³ - 4x","12x³ - 2x","3x³ - 4x","12x⁴ - 4x"]', '12x³ - 4x', 'f''(x) = 12x³ - 4x', 20),
(16, 'Integral', 'Qual é a integral de f(x) = 6x²?', 'matematica', 'multipla_escolha', 'dificil', '["2x³","2x³ + C","6x³ + C","3x³ + C"]', '2x³ + C', '∫6x² dx = 6x³/3 + C = 2x³ + C', 20),
(16, 'Determinante 3x3', 'Qual é o determinante de [[1,0,0],[0,2,0],[0,0,3]]?', 'matematica', 'multipla_escolha', 'dificil', '["1","3","6","9"]', '6', 'Matriz diagonal: det = 1×2×3 = 6', 20),
(16, 'Limite', 'Qual é o limite de (x²-4)/(x-2) quando x→2?', 'matematica', 'multipla_escolha', 'dificil', '["0","2","4","∞"]', '4', 'Fatorando: (x+2)(x-2)/(x-2) = x+2, limite = 4', 20),
(16, 'Binômio de Newton', 'Qual é o coeficiente de x² em (x+1)⁴?', 'matematica', 'multipla_escolha', 'dificil', '["4","6","8","12"]', '6', 'C(4,2) = 6', 20),
(16, 'Trigonometria', 'Qual é o valor de cos(60°)?', 'matematica', 'multipla_escolha', 'dificil', '["0","1/2","√2/2","√3/2"]', '1/2', 'cos(60°) = 1/2', 20),
(16, 'Números complexos', 'Qual é o módulo de z = 3 + 4i?', 'matematica', 'multipla_escolha', 'dificil', '["3","4","5","7"]', '5', '|z| = √(3² + 4²) = √25 = 5', 20),
(16, 'Combinatória', 'De quantas formas podemos escolher 3 pessoas de um grupo de 7?', 'matematica', 'multipla_escolha', 'dificil', '["21","35","42","210"]', '35', 'C(7,3) = 7!/(3!×4!) = 35', 20),
(16, 'Progressão geométrica', 'Na PG 2, 6, 18, 54... qual é o 6º termo?', 'matematica', 'multipla_escolha', 'dificil', '["162","324","486","648"]', '486', 'a₆ = 2 × 3⁵ = 2 × 243 = 486', 20),
(16, 'Equação do 2º grau', 'Quais são as raízes de x² - 5x + 6 = 0?', 'matematica', 'multipla_escolha', 'dificil', '["x=1 e x=6","x=2 e x=3","x=-2 e x=-3","x=1 e x=5"]', 'x=2 e x=3', 'Δ = 25-24 = 1, x = (5±1)/2', 20),
(16, 'Logaritmo natural', 'Qual é o valor de ln(e²)?', 'matematica', 'multipla_escolha', 'dificil', '["1","2","e","e²"]', '2', 'ln(e²) = 2 × ln(e) = 2 × 1 = 2', 20),
(16, 'Geometria analítica', 'Qual é a distância entre os pontos A(1,2) e B(4,6)?', 'matematica', 'multipla_escolha', 'dificil', '["3","4","5","6"]', '5', 'd = √((4-1)² + (6-2)²) = √(9+16) = 5', 20),
(16, 'Série geométrica', 'Qual é a soma da PG infinita 1 + 1/2 + 1/4 + ...?', 'matematica', 'multipla_escolha', 'dificil', '["1","1,5","2","3"]', '2', 'S = a/(1-r) = 1/(1-0,5) = 2', 20),
(16, 'Função exponencial', 'Se f(x) = 2^x, qual é f(10)?', 'matematica', 'multipla_escolha', 'dificil', '["512","1024","2048","4096"]', '1024', '2^10 = 1024', 20),
(16, 'Permutação', 'De quantas formas podemos arranjar as letras de "AMOR"?', 'matematica', 'multipla_escolha', 'dificil', '["12","16","24","48"]', '24', 'P(4) = 4! = 24', 20);


-- ============================================================
-- INGLÊS - FÁCIL (15 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos) VALUES
(16, 'Basic vocabulary', 'What does "house" mean in Portuguese?', 'ingles', 'multipla_escolha', 'facil', '["Carro","Casa","Rua","Escola"]', 'Casa', '"House" means "Casa" in Portuguese', 10),
(16, 'Colors', 'What color is "blue"?', 'ingles', 'multipla_escolha', 'facil', '["Vermelho","Verde","Azul","Amarelo"]', 'Azul', '"Blue" is "Azul" in Portuguese', 10),
(16, 'Numbers', 'How do you say "quinze" in English?', 'ingles', 'multipla_escolha', 'facil', '["Twelve","Thirteen","Fourteen","Fifteen"]', 'Fifteen', '"Quinze" is "Fifteen" in English', 10),
(16, 'Greetings', 'How do you say "Boa tarde" in English?', 'ingles', 'multipla_escolha', 'facil', '["Good morning","Good afternoon","Good night","Good evening"]', 'Good afternoon', '"Boa tarde" is "Good afternoon"', 10),
(16, 'Animals', 'What is "cachorro" in English?', 'ingles', 'multipla_escolha', 'facil', '["Cat","Dog","Bird","Fish"]', 'Dog', '"Cachorro" is "Dog" in English', 10),
(16, 'Verb to be', 'Complete: They ___ students.', 'ingles', 'multipla_escolha', 'facil', '["is","am","are","be"]', 'are', 'With "they" we use "are"', 10),
(16, 'Days of the week', 'What day comes after Monday?', 'ingles', 'multipla_escolha', 'facil', '["Sunday","Tuesday","Wednesday","Thursday"]', 'Tuesday', 'Monday → Tuesday → Wednesday...', 10),
(16, 'Months', 'What is the third month of the year?', 'ingles', 'multipla_escolha', 'facil', '["January","February","March","April"]', 'March', 'January, February, March...', 10),
(16, 'Family', 'What does "mother" mean?', 'ingles', 'multipla_escolha', 'facil', '["Pai","Irmã","Mãe","Avó"]', 'Mãe', '"Mother" means "Mãe"', 10),
(16, 'Food', 'What is "pão" in English?', 'ingles', 'multipla_escolha', 'facil', '["Rice","Bread","Milk","Egg"]', 'Bread', '"Pão" is "Bread" in English', 10),
(16, 'Pronouns', 'What pronoun replaces "Maria"?', 'ingles', 'multipla_escolha', 'facil', '["He","She","It","They"]', 'She', 'Maria is female, so we use "She"', 10),
(16, 'Articles', 'Choose the correct article: ___ apple.', 'ingles', 'multipla_escolha', 'facil', '["A","An","The","No article"]', 'An', 'Before vowel sounds we use "An"', 10),
(16, 'Opposites', 'What is the opposite of "hot"?', 'ingles', 'multipla_escolha', 'facil', '["Warm","Cool","Cold","Freezing"]', 'Cold', 'The opposite of "hot" is "cold"', 10),
(16, 'Body parts', 'What is "nariz" in English?', 'ingles', 'multipla_escolha', 'facil', '["Ear","Eye","Nose","Mouth"]', 'Nose', '"Nariz" is "Nose" in English', 10),
(16, 'Simple present', 'She ___ English every day.', 'ingles', 'multipla_escolha', 'facil', '["study","studies","studying","studied"]', 'studies', 'Third person singular adds -s/-es', 10);

-- ============================================================
-- INGLÊS - MÉDIO (15 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos) VALUES
(16, 'Past simple', 'What is the past tense of "write"?', 'ingles', 'multipla_escolha', 'medio', '["Writed","Wrote","Written","Writ"]', 'Wrote', '"Write" is an irregular verb, past = "Wrote"', 15),
(16, 'Present perfect', 'Choose the correct sentence:', 'ingles', 'multipla_escolha', 'medio', '["I have saw the movie","I have seen the movie","I have see the movie","I seen the movie"]', 'I have seen the movie', 'Present perfect uses have/has + past participle', 15),
(16, 'Comparatives', 'Which is correct?', 'ingles', 'multipla_escolha', 'medio', '["She is more tall than him","She is taller than him","She is tallest than him","She is most tall than him"]', 'She is taller than him', 'One-syllable adjectives: add -er for comparative', 15),
(16, 'Conditionals', 'Complete: If it rains, I ___ stay home.', 'ingles', 'multipla_escolha', 'medio', '["will","would","should","shall"]', 'will', 'First conditional: If + present, will + infinitive', 15),
(16, 'Passive voice', 'Change to passive: "The chef cooked the meal."', 'ingles', 'multipla_escolha', 'medio', '["The meal cooked by the chef","The meal was cooked by the chef","The meal is cooked by the chef","The meal were cooked by the chef"]', 'The meal was cooked by the chef', 'Passive: subject + was/were + past participle + by + agent', 15),
(16, 'Modal verbs', 'Which sentence expresses obligation?', 'ingles', 'multipla_escolha', 'medio', '["You can leave","You must leave","You might leave","You could leave"]', 'You must leave', '"Must" expresses strong obligation', 15),
(16, 'Vocabulary - synonyms', 'What is a synonym for "happy"?', 'ingles', 'multipla_escolha', 'medio', '["Sad","Angry","Joyful","Tired"]', 'Joyful', '"Joyful" and "happy" are synonyms', 15),
(16, 'Prepositions', 'The book is ___ the table.', 'ingles', 'multipla_escolha', 'medio', '["in","on","at","by"]', 'on', '"On" is used for surfaces', 15),
(16, 'Question formation', 'What is the correct question for: "She lives in London."', 'ingles', 'multipla_escolha', 'medio', '["Where she lives?","Where does she live?","Where is she live?","Where she does live?"]', 'Where does she live?', 'Questions in simple present use do/does', 15),
(16, 'Reported speech', 'He said: "I am hungry." Report it:', 'ingles', 'multipla_escolha', 'medio', '["He said he is hungry","He said he was hungry","He said he were hungry","He said he be hungry"]', 'He said he was hungry', 'Reported speech shifts tense back', 15),
(16, 'Conjunctions', 'Choose the correct conjunction: I like tea ___ coffee.', 'ingles', 'multipla_escolha', 'medio', '["but","and","or","so"]', 'and', '"And" connects two things you like', 15),
(16, 'Adverbs', 'Which word is an adverb?', 'ingles', 'multipla_escolha', 'medio', '["Quick","Quickly","Quickness","Quicker"]', 'Quickly', 'Adverbs often end in -ly', 15),
(16, 'Future tense', 'Which sentence is in the future?', 'ingles', 'multipla_escolha', 'medio', '["I go to school","I went to school","I will go to school","I have gone to school"]', 'I will go to school', '"Will + infinitive" forms the future', 15),
(16, 'Countable nouns', 'Which noun is uncountable?', 'ingles', 'multipla_escolha', 'medio', '["Book","Chair","Water","Apple"]', 'Water', '"Water" is uncountable - no plural form', 15),
(16, 'Phrasal verbs', 'What does "give up" mean?', 'ingles', 'multipla_escolha', 'medio', '["Continuar","Desistir","Começar","Terminar"]', 'Desistir', '"Give up" means to stop trying / desistir', 15);

-- ============================================================
-- INGLÊS - DIFÍCIL (15 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos) VALUES
(16, 'Subjunctive mood', 'Choose the correct subjunctive form:', 'ingles', 'multipla_escolha', 'dificil', '["I suggest that he is on time","I suggest that he be on time","I suggest that he was on time","I suggest that he being on time"]', 'I suggest that he be on time', 'The subjunctive uses base form of verb after "suggest that"', 20),
(16, 'Second conditional', 'Complete: If I ___ a millionaire, I would travel the world.', 'ingles', 'multipla_escolha', 'dificil', '["am","was","were","be"]', 'were', 'Second conditional uses "were" for all persons', 20),
(16, 'Advanced vocabulary', 'What does "loquacious" mean?', 'ingles', 'multipla_escolha', 'dificil', '["Quiet","Talkative","Intelligent","Lazy"]', 'Talkative', '"Loquacious" means very talkative', 20),
(16, 'Inversion', 'Which sentence uses correct inversion?', 'ingles', 'multipla_escolha', 'dificil', '["Never I have seen this","Never have I seen this","I never have seen this","Have never I seen this"]', 'Never have I seen this', 'Negative adverbs at the start cause subject-auxiliary inversion', 20),
(16, 'Cleft sentences', 'Which is a correct cleft sentence?', 'ingles', 'multipla_escolha', 'dificil', '["It was John who broke the window","It was John that broke the window","Both A and B","Neither A nor B"]', 'Both A and B', 'Cleft sentences can use "who" or "that"', 20),
(16, 'Gerund vs infinitive', 'Which is correct?', 'ingles', 'multipla_escolha', 'dificil', '["I regret to tell you this","I regret telling you this","Both are correct with different meanings","Neither is correct"]', 'Both are correct with different meanings', '"Regret + gerund" = past action; "regret + infinitive" = present/future', 20),
(16, 'Discourse markers', 'What does "notwithstanding" mean?', 'ingles', 'multipla_escolha', 'dificil', '["Therefore","Nevertheless","Furthermore","Consequently"]', 'Nevertheless', '"Notwithstanding" means "nevertheless" or "in spite of"', 20),
(16, 'Mixed conditionals', 'Which is a mixed conditional?', 'ingles', 'multipla_escolha', 'dificil', '["If I study, I will pass","If I had studied, I would have passed","If I had studied, I would pass now","If I study, I would pass"]', 'If I had studied, I would pass now', 'Mixed conditional: past condition + present result', 20),
(16, 'Ellipsis', 'What is ellipsis in grammar?', 'ingles', 'multipla_escolha', 'dificil', '["Adding extra words","Omitting words to avoid repetition","Changing word order","Using passive voice"]', 'Omitting words to avoid repetition', 'Ellipsis omits words that are understood from context', 20),
(16, 'Nominalization', 'What is the nominalization of "decide"?', 'ingles', 'multipla_escolha', 'dificil', '["Decided","Deciding","Decision","Decisive"]', 'Decision', 'Nominalization converts verbs to nouns', 20),
(16, 'Hedging language', 'Which phrase is an example of hedging?', 'ingles', 'multipla_escolha', 'dificil', '["This is definitely true","It would appear that this is true","This is absolutely certain","This is completely wrong"]', 'It would appear that this is true', 'Hedging expresses uncertainty or caution', 20),
(16, 'Cohesion', 'What does "the former" refer to in: "I like cats and dogs. The former are independent."', 'ingles', 'multipla_escolha', 'dificil', '["Dogs","Cats","Both","Neither"]', 'Cats', '"The former" refers to the first item mentioned', 20),
(16, 'Pragmatics', 'What is an implicature?', 'ingles', 'multipla_escolha', 'dificil', '["A direct statement","A meaning implied but not stated","A grammatical rule","A type of verb"]', 'A meaning implied but not stated', 'Implicature is meaning conveyed beyond literal words', 20),
(16, 'Register', 'Which sentence uses formal register?', 'ingles', 'multipla_escolha', 'dificil', '["Gonna do it later","I will attend to it subsequently","I''ll do it later","Doing it soon"]', 'I will attend to it subsequently', 'Formal register uses complete forms and sophisticated vocabulary', 20),
(16, 'Anaphora', 'In "John arrived late. He apologized." what is "He"?', 'ingles', 'multipla_escolha', 'dificil', '["A cataphora","An anaphora","A deixis","An ellipsis"]', 'An anaphora', 'Anaphora refers back to a previously mentioned noun', 20);


-- ============================================================
-- PROGRAMAÇÃO - FÁCIL (15 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos) VALUES
(16, 'Linguagem web', 'Qual linguagem é executada no navegador?', 'programacao', 'multipla_escolha', 'facil', '["Python","JavaScript","Java","C++"]', 'JavaScript', 'JavaScript é a linguagem nativa dos navegadores web', 10),
(16, 'HTML básico', 'O que significa HTML?', 'programacao', 'multipla_escolha', 'facil', '["HyperText Markup Language","High Tech Modern Language","HyperText Modern Links","High Transfer Markup Language"]', 'HyperText Markup Language', 'HTML = HyperText Markup Language', 10),
(16, 'CSS básico', 'CSS é usado para:', 'programacao', 'multipla_escolha', 'facil', '["Estruturar conteúdo","Estilizar páginas","Gerir bases de dados","Criar servidores"]', 'Estilizar páginas', 'CSS (Cascading Style Sheets) define o estilo visual', 10),
(16, 'Variável', 'O que é uma variável?', 'programacao', 'multipla_escolha', 'facil', '["Um tipo de loop","Um espaço na memória para guardar dados","Uma função","Um operador"]', 'Um espaço na memória para guardar dados', 'Variáveis armazenam valores na memória', 10),
(16, 'Comentário JS', 'Como se escreve um comentário de uma linha em JavaScript?', 'programacao', 'multipla_escolha', 'facil', '["# comentário","/* comentário */","// comentário","<!-- comentário -->"]', '// comentário', 'Em JavaScript, // inicia um comentário de linha', 10),
(16, 'Tipo de dado', 'Qual é o tipo de dado de "Olá Mundo"?', 'programacao', 'multipla_escolha', 'facil', '["Number","Boolean","String","Array"]', 'String', 'Texto entre aspas é do tipo String', 10),
(16, 'Operador lógico', 'O que faz o operador && em JavaScript?', 'programacao', 'multipla_escolha', 'facil', '["OU lógico","E lógico","NÃO lógico","XOR lógico"]', 'E lógico', '&& é o operador AND (E lógico)', 10),
(16, 'Condicional', 'Qual estrutura é usada para tomar decisões?', 'programacao', 'multipla_escolha', 'facil', '["for","while","if/else","function"]', 'if/else', 'if/else é a estrutura condicional básica', 10),
(16, 'Loop', 'Qual loop é usado quando sabemos o número de iterações?', 'programacao', 'multipla_escolha', 'facil', '["while","do-while","for","foreach"]', 'for', 'O loop for é ideal quando o número de iterações é conhecido', 10),
(16, 'Função', 'O que é uma função?', 'programacao', 'multipla_escolha', 'facil', '["Um tipo de variável","Um bloco de código reutilizável","Um operador","Um tipo de dado"]', 'Um bloco de código reutilizável', 'Funções encapsulam código para reutilização', 10),
(16, 'Array', 'Como aceder ao primeiro elemento de um array em JavaScript?', 'programacao', 'multipla_escolha', 'facil', '["array[1]","array[0]","array.first()","array.get(1)"]', 'array[0]', 'Arrays em JavaScript são indexados a partir de 0', 10),
(16, 'Boolean', 'Quais são os valores possíveis de um Boolean?', 'programacao', 'multipla_escolha', 'facil', '["0 e 1","sim e não","true e false","on e off"]', 'true e false', 'Boolean só pode ser true ou false', 10),
(16, 'Console', 'Como imprimir algo no console em JavaScript?', 'programacao', 'multipla_escolha', 'facil', '["print()","echo()","console.log()","System.out.println()"]', 'console.log()', 'console.log() imprime no console do navegador', 10),
(16, 'Declaração de variável', 'Qual palavra-chave declara uma constante em JavaScript?', 'programacao', 'multipla_escolha', 'facil', '["var","let","const","def"]', 'const', 'const declara uma constante que não pode ser reatribuída', 10),
(16, 'Operador aritmético', 'O que faz o operador % em programação?', 'programacao', 'multipla_escolha', 'facil', '["Divisão","Multiplicação","Resto da divisão","Potência"]', 'Resto da divisão', '% é o operador módulo (resto da divisão)', 10);

-- ============================================================
-- PROGRAMAÇÃO - MÉDIO (15 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos) VALUES
(16, 'POO - Encapsulamento', 'O que é encapsulamento em POO?', 'programacao', 'multipla_escolha', 'medio', '["Herdar de outra classe","Esconder detalhes internos e expor interface pública","Criar múltiplos objetos","Destruir objetos"]', 'Esconder detalhes internos e expor interface pública', 'Encapsulamento protege dados internos de acesso direto', 15),
(16, 'Complexidade', 'Qual é a complexidade do Bubble Sort no pior caso?', 'programacao', 'multipla_escolha', 'medio', '["O(n)","O(n log n)","O(n²)","O(log n)"]', 'O(n²)', 'Bubble Sort tem complexidade O(n²) no pior caso', 15),
(16, 'SQL SELECT', 'Qual query seleciona todos os registos de uma tabela "users"?', 'programacao', 'multipla_escolha', 'medio', '["GET * FROM users","SELECT ALL users","SELECT * FROM users","FETCH * FROM users"]', 'SELECT * FROM users', 'SELECT * FROM tabela é a sintaxe básica do SQL', 15),
(16, 'Git', 'Qual comando Git envia alterações para o repositório remoto?', 'programacao', 'multipla_escolha', 'medio', '["git commit","git push","git pull","git merge"]', 'git push', 'git push envia commits locais para o repositório remoto', 15),
(16, 'HTTP Status', 'O que significa o código HTTP 404?', 'programacao', 'multipla_escolha', 'medio', '["Sucesso","Não autorizado","Não encontrado","Erro interno do servidor"]', 'Não encontrado', '404 = Not Found - recurso não encontrado', 15),
(16, 'Recursão', 'Qual é a condição essencial numa função recursiva?', 'programacao', 'multipla_escolha', 'medio', '["Ter muitos parâmetros","Ter um caso base","Ser assíncrona","Retornar void"]', 'Ter um caso base', 'O caso base evita recursão infinita', 15),
(16, 'Estrutura de dados', 'Qual estrutura segue o princípio LIFO?', 'programacao', 'multipla_escolha', 'medio', '["Fila (Queue)","Lista ligada","Pilha (Stack)","Árvore"]', 'Pilha (Stack)', 'LIFO = Last In, First Out = Pilha', 15),
(16, 'Async/Await', 'O que faz a palavra-chave await em JavaScript?', 'programacao', 'multipla_escolha', 'medio', '["Cria uma Promise","Pausa a execução até a Promise resolver","Cancela uma Promise","Cria um loop assíncrono"]', 'Pausa a execução até a Promise resolver', 'await espera que uma Promise seja resolvida', 15),
(16, 'REST API', 'Qual método HTTP é usado para criar um recurso?', 'programacao', 'multipla_escolha', 'medio', '["GET","PUT","POST","DELETE"]', 'POST', 'POST é usado para criar novos recursos', 15),
(16, 'Regex', 'O que faz a expressão regular /^[0-9]+$/?', 'programacao', 'multipla_escolha', 'medio', '["Verifica se contém letras","Verifica se é apenas dígitos","Verifica se começa com letra","Verifica se tem espaços"]', 'Verifica se é apenas dígitos', '^[0-9]+$ verifica string composta apenas por dígitos', 15),
(16, 'Closure', 'O que é um closure em JavaScript?', 'programacao', 'multipla_escolha', 'medio', '["Um tipo de loop","Função que acede a variáveis do escopo externo","Um método de array","Um tipo de Promise"]', 'Função que acede a variáveis do escopo externo', 'Closures capturam variáveis do escopo onde foram criadas', 15),
(16, 'Herança', 'Em JavaScript, qual palavra-chave implementa herança?', 'programacao', 'multipla_escolha', 'medio', '["implements","inherits","extends","super"]', 'extends', 'class Filho extends Pai implementa herança', 15),
(16, 'JSON', 'Qual método converte um objeto JavaScript para JSON?', 'programacao', 'multipla_escolha', 'medio', '["JSON.parse()","JSON.stringify()","JSON.convert()","JSON.encode()"]', 'JSON.stringify()', 'JSON.stringify() serializa objeto para string JSON', 15),
(16, 'Array methods', 'Qual método filtra elementos de um array?', 'programacao', 'multipla_escolha', 'medio', '["map()","reduce()","filter()","forEach()"]', 'filter()', 'filter() retorna novo array com elementos que passam no teste', 15),
(16, 'Prototype', 'O que é o prototype em JavaScript?', 'programacao', 'multipla_escolha', 'medio', '["Um tipo de variável","Mecanismo de herança baseado em objetos","Um método de array","Um tipo de loop"]', 'Mecanismo de herança baseado em objetos', 'Prototype permite herança entre objetos em JavaScript', 15);

-- ============================================================
-- PROGRAMAÇÃO - DIFÍCIL (15 questões)
-- ============================================================
INSERT INTO questoes (torneio_id, titulo, descricao, disciplina, tipo, dificuldade, opcoes, resposta_correta, explicacao, pontos) VALUES
(16, 'Design Pattern', 'O que é o padrão Observer?', 'programacao', 'multipla_escolha', 'dificil', '["Garante uma instância","Objetos subscrevem e são notificados de mudanças","Cria objetos complexos","Adapta interfaces incompatíveis"]', 'Objetos subscrevem e são notificados de mudanças', 'Observer define dependência um-para-muitos entre objetos', 20),
(16, 'Algoritmo', 'Qual algoritmo de ordenação tem melhor caso O(n log n) garantido?', 'programacao', 'multipla_escolha', 'dificil', '["Quick Sort","Bubble Sort","Merge Sort","Insertion Sort"]', 'Merge Sort', 'Merge Sort tem complexidade O(n log n) em todos os casos', 20),
(16, 'Concorrência', 'O que é uma race condition?', 'programacao', 'multipla_escolha', 'dificil', '["Um tipo de loop","Situação onde resultado depende da ordem de execução de threads","Um algoritmo de ordenação","Um padrão de design"]', 'Situação onde resultado depende da ordem de execução de threads', 'Race condition ocorre quando threads acedem a recursos partilhados sem sincronização', 20),
(16, 'Functional programming', 'O que é uma função pura?', 'programacao', 'multipla_escolha', 'dificil', '["Uma função sem parâmetros","Função que sempre retorna o mesmo resultado para os mesmos inputs sem efeitos colaterais","Uma função assíncrona","Uma função recursiva"]', 'Função que sempre retorna o mesmo resultado para os mesmos inputs sem efeitos colaterais', 'Funções puras são determinísticas e sem side effects', 20),
(16, 'Memory management', 'O que é um memory leak?', 'programacao', 'multipla_escolha', 'dificil', '["Um erro de sintaxe","Memória alocada que nunca é libertada","Um tipo de exceção","Um padrão de design"]', 'Memória alocada que nunca é libertada', 'Memory leaks causam consumo crescente de memória', 20),
(16, 'Microservices', 'Qual é a principal vantagem dos microserviços?', 'programacao', 'multipla_escolha', 'dificil', '["Código mais simples","Escalabilidade e deploy independente de serviços","Menos código","Mais rápido de desenvolver"]', 'Escalabilidade e deploy independente de serviços', 'Microserviços permitem escalar e deployar componentes independentemente', 20),
(16, 'CAP Theorem', 'O que afirma o Teorema CAP?', 'programacao', 'multipla_escolha', 'dificil', '["Todo sistema pode ter Consistência, Disponibilidade e Tolerância a partições","Um sistema distribuído só pode garantir 2 de 3: Consistência, Disponibilidade, Tolerância a partições","Sistemas distribuídos são sempre consistentes","Disponibilidade é sempre garantida"]', 'Um sistema distribuído só pode garantir 2 de 3: Consistência, Disponibilidade, Tolerância a partições', 'CAP Theorem é fundamental em sistemas distribuídos', 20),
(16, 'Dependency Injection', 'Qual é o benefício principal da injeção de dependência?', 'programacao', 'multipla_escolha', 'dificil', '["Código mais rápido","Desacoplamento e testabilidade","Menos linhas de código","Mais segurança"]', 'Desacoplamento e testabilidade', 'DI reduz acoplamento e facilita testes unitários', 20),
(16, 'Event sourcing', 'O que é Event Sourcing?', 'programacao', 'multipla_escolha', 'dificil', '["Um tipo de base de dados","Padrão onde estado é derivado de sequência de eventos","Um framework JavaScript","Um protocolo de rede"]', 'Padrão onde estado é derivado de sequência de eventos', 'Event Sourcing armazena eventos em vez do estado atual', 20),
(16, 'CQRS', 'O que significa CQRS?', 'programacao', 'multipla_escolha', 'dificil', '["Command Query Responsibility Segregation","Code Quality Review System","Concurrent Query Resolution Service","Command Queue Response System"]', 'Command Query Responsibility Segregation', 'CQRS separa operações de leitura e escrita', 20),
(16, 'WebSockets', 'Qual é a diferença entre HTTP e WebSockets?', 'programacao', 'multipla_escolha', 'dificil', '["Não há diferença","WebSockets permitem comunicação bidirecional em tempo real","HTTP é mais rápido","WebSockets são menos seguros"]', 'WebSockets permitem comunicação bidirecional em tempo real', 'WebSockets mantêm conexão persistente para comunicação em tempo real', 20),
(16, 'Garbage collection', 'O que é o algoritmo Mark and Sweep?', 'programacao', 'multipla_escolha', 'dificil', '["Algoritmo de ordenação","Técnica de garbage collection que marca objetos alcançáveis e remove os restantes","Um padrão de design","Um algoritmo de busca"]', 'Técnica de garbage collection que marca objetos alcançáveis e remove os restantes', 'Mark and Sweep é o algoritmo GC mais comum', 20),
(16, 'Monads', 'O que é uma Monad em programação funcional?', 'programacao', 'multipla_escolha', 'dificil', '["Um tipo de loop","Estrutura que encapsula computações e permite encadeamento","Um padrão de herança","Um tipo de array"]', 'Estrutura que encapsula computações e permite encadeamento', 'Monads são um padrão de design funcional para composição de operações', 20),
(16, 'Tail recursion', 'O que é tail call optimization?', 'programacao', 'multipla_escolha', 'dificil', '["Uma técnica de cache","Otimização onde chamada recursiva final não adiciona frame à call stack","Um tipo de loop","Um padrão de design"]', 'Otimização onde chamada recursiva final não adiciona frame à call stack', 'TCO evita stack overflow em recursão profunda', 20),
(16, 'Immutability', 'Por que imutabilidade é importante em programação funcional?', 'programacao', 'multipla_escolha', 'dificil', '["Torna o código mais lento","Evita efeitos colaterais e facilita raciocínio sobre o código","Usa mais memória","Torna o código mais complexo"]', 'Evita efeitos colaterais e facilita raciocínio sobre o código', 'Imutabilidade elimina bugs causados por mutação inesperada de estado', 20);
