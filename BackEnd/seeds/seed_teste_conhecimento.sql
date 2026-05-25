-- Seed: Questões do Teste de Conhecimento
-- Tabela: questoes_teste_conhecimento
-- 30 questões por área: matematica, programacao, ingles

SET NAMES utf8mb4;
USE comaes_db;

-- Limpar questões existentes do teste de conhecimento
DELETE FROM questoes_teste_conhecimento;

-- ============================================================
-- MATEMÁTICA (30 questões)
-- ============================================================
INSERT INTO questoes_teste_conhecimento (enunciado, opcoes, resposta_correta, dificuldade, categoria, pontos, ativo) VALUES
('Quanto é 2 + 2?', '["3","4","5","6"]', '4', 'facil', 'matematica', 10, 1),
('Qual é o resultado de 9 × 3?', '["18","21","27","36"]', '27', 'facil', 'matematica', 10, 1),
('Quanto é 15 - 7?', '["6","7","8","9"]', '8', 'facil', 'matematica', 10, 1),
('Qual é a metade de 20?', '["8","10","12","14"]', '10', 'facil', 'matematica', 10, 1),
('Quanto é 6 + 5?', '["10","11","12","13"]', '11', 'facil', 'matematica', 10, 1),
('Qual é o dobro de 14?', '["24","26","28","30"]', '28', 'facil', 'matematica', 10, 1),
('Quanto é 100 ÷ 4?', '["20","25","30","40"]', '25', 'facil', 'matematica', 10, 1),
('Qual é o quadrado de 5?', '["10","20","25","30"]', '25', 'facil', 'matematica', 10, 1),
('Quanto é 3³?', '["9","18","27","81"]', '27', 'facil', 'matematica', 10, 1),
('Qual é o valor de π (pi) aproximado?', '["2,71","3,14","3,41","4,13"]', '3,14', 'facil', 'matematica', 10, 1),
('Qual é a raiz quadrada de 144?', '["10","11","12","13"]', '12', 'medio', 'matematica', 15, 1),
('Quanto é 15% de 200?', '["20","25","30","35"]', '30', 'medio', 'matematica', 15, 1),
('Se x + 5 = 12, qual é o valor de x?', '["5","6","7","8"]', '7', 'medio', 'matematica', 15, 1),
('Qual é a área de um quadrado com lado 6?', '["24","30","36","42"]', '36', 'medio', 'matematica', 15, 1),
('Quanto é 2⁸?', '["128","256","512","1024"]', '256', 'medio', 'matematica', 15, 1),
('Qual é o MMC de 4 e 6?', '["8","10","12","24"]', '12', 'medio', 'matematica', 15, 1),
('Numa progressão aritmética 2, 5, 8, 11... qual é o 6º termo?', '["14","17","20","23"]', '17', 'medio', 'matematica', 15, 1),
('Qual é o perímetro de um retângulo 8×5?', '["26","28","30","40"]', '26', 'medio', 'matematica', 15, 1),
('Quanto é log₁₀(1000)?', '["2","3","4","5"]', '3', 'medio', 'matematica', 15, 1),
('Se 3x - 4 = 11, qual é x?', '["4","5","6","7"]', '5', 'medio', 'matematica', 15, 1),
('Qual é a derivada de f(x) = x³?', '["x²","2x²","3x²","3x³"]', '3x²', 'dificil', 'matematica', 20, 1),
('Qual é a integral de f(x) = 2x?', '["x","x²","2x²","x² + C"]', 'x² + C', 'dificil', 'matematica', 20, 1),
('Quantos zeros tem o número 10!?', '["1","2","3","4"]', '2', 'dificil', 'matematica', 20, 1),
('Qual é o determinante da matriz [[2,1],[3,4]]?', '["3","5","7","11"]', '5', 'dificil', 'matematica', 20, 1),
('Numa PG com razão 2 e primeiro termo 3, qual é o 5º termo?', '["24","36","48","96"]', '48', 'dificil', 'matematica', 20, 1),
('Qual é o valor de sen(90°)?', '["0","0,5","1","√2/2"]', '1', 'dificil', 'matematica', 20, 1),
('Quantas diagonais tem um hexágono?', '["6","8","9","12"]', '9', 'dificil', 'matematica', 20, 1),
('Qual é a soma dos ângulos internos de um pentágono?', '["360°","450°","540°","720°"]', '540°', 'dificil', 'matematica', 20, 1),
('Se f(x) = x² - 4x + 4, qual é a raiz de f(x)?', '["0","1","2","4"]', '2', 'dificil', 'matematica', 20, 1),
('Qual é o limite de (sen x)/x quando x→0?', '["0","0,5","1","∞"]', '1', 'dificil', 'matematica', 20, 1);

-- ============================================================
-- PROGRAMAÇÃO (30 questões)
-- ============================================================
INSERT INTO questoes_teste_conhecimento (enunciado, opcoes, resposta_correta, dificuldade, categoria, pontos, ativo) VALUES
('Qual linguagem é mais usada para páginas web no navegador?', '["JavaScript","C","Rust","SQL"]', 'JavaScript', 'facil', 'programacao', 10, 1),
('Qual símbolo inicia um comentário de uma linha em JavaScript?', '["/*","#","//","<!--"]', '//', 'facil', 'programacao', 10, 1),
('HTML é usado para:', '["Estilizar páginas","Estruturar conteúdo","Gerir banco de dados","Compilar código"]', 'Estruturar conteúdo', 'facil', 'programacao', 10, 1),
('CSS serve principalmente para:', '["Criar tabelas no banco","Estilizar interfaces","Autenticar usuários","Enviar emails"]', 'Estilizar interfaces', 'facil', 'programacao', 10, 1),
('Qual destas é uma variável válida em JavaScript?', '["2nome","meuNome","var-1","nome completo"]', 'meuNome', 'facil', 'programacao', 10, 1),
('O que significa HTTP?', '["HyperText Transfer Protocol","High Tech Transfer Process","HyperText Transmission Program","High Transfer Text Protocol"]', 'HyperText Transfer Protocol', 'facil', 'programacao', 10, 1),
('Qual estrutura armazena pares chave-valor em Python?', '["Lista","Tupla","Dicionário","Conjunto"]', 'Dicionário', 'facil', 'programacao', 10, 1),
('O que é um loop "for"?', '["Uma função recursiva","Uma estrutura de repetição","Um tipo de variável","Um operador lógico"]', 'Uma estrutura de repetição', 'facil', 'programacao', 10, 1),
('Qual operador verifica igualdade estrita em JavaScript?', '["==","=","===","!="]', '===', 'facil', 'programacao', 10, 1),
('O que é um array?', '["Uma função","Uma coleção ordenada de elementos","Um tipo de loop","Um operador"]', 'Uma coleção ordenada de elementos', 'facil', 'programacao', 10, 1),
('O que é uma função recursiva?', '["Uma função que chama a si mesma","Uma função sem retorno","Uma função com muitos parâmetros","Uma função assíncrona"]', 'Uma função que chama a si mesma', 'medio', 'programacao', 15, 1),
('Qual é a complexidade do algoritmo de busca binária?', '["O(n)","O(n²)","O(log n)","O(1)"]', 'O(log n)', 'medio', 'programacao', 15, 1),
('O que significa SQL?', '["Structured Query Language","Simple Query Logic","System Query Language","Structured Quick Language"]', 'Structured Query Language', 'medio', 'programacao', 15, 1),
('O que é uma API REST?', '["Um banco de dados","Uma interface de comunicação entre sistemas","Um framework CSS","Um sistema operacional"]', 'Uma interface de comunicação entre sistemas', 'medio', 'programacao', 15, 1),
('Qual método JavaScript remove o último elemento de um array?', '["shift()","pop()","splice()","delete()"]', 'pop()', 'medio', 'programacao', 15, 1),
('O que é herança em POO?', '["Copiar código","Uma classe receber atributos de outra","Criar variáveis globais","Destruir objetos"]', 'Uma classe receber atributos de outra', 'medio', 'programacao', 15, 1),
('O que é o Git?', '["Um editor de código","Um sistema de controlo de versões","Um servidor web","Uma linguagem de programação"]', 'Um sistema de controlo de versões', 'medio', 'programacao', 15, 1),
('O que é JSON?', '["JavaScript Object Notation","Java Syntax Object Notation","JavaScript Online Notation","Java Standard Object Notation"]', 'JavaScript Object Notation', 'medio', 'programacao', 15, 1),
('Qual é a saída de: console.log(typeof null)?', '["null","undefined","object","string"]', 'object', 'medio', 'programacao', 15, 1),
('O que faz o método map() em JavaScript?', '["Filtra elementos","Transforma cada elemento e retorna novo array","Ordena o array","Remove duplicados"]', 'Transforma cada elemento e retorna novo array', 'medio', 'programacao', 15, 1),
('O que é uma Promise em JavaScript?', '["Um tipo de variável","Um objeto que representa operação assíncrona","Uma função síncrona","Um método de array"]', 'Um objeto que representa operação assíncrona', 'dificil', 'programacao', 20, 1),
('O que é o padrão de design Singleton?', '["Garante apenas uma instância de uma classe","Cria múltiplas instâncias","Herda de várias classes","Destrói objetos automaticamente"]', 'Garante apenas uma instância de uma classe', 'dificil', 'programacao', 20, 1),
('O que é memoização?', '["Técnica de cache de resultados de funções","Tipo de loop","Método de ordenação","Padrão de herança"]', 'Técnica de cache de resultados de funções', 'dificil', 'programacao', 20, 1),
('Qual é a diferença entre == e === em JavaScript?', '["Nenhuma","=== verifica tipo e valor, == só valor","== verifica tipo e valor, === só valor","=== é mais lento"]', '=== verifica tipo e valor, == só valor', 'dificil', 'programacao', 20, 1),
('O que é Big O notation?', '["Uma linguagem de programação","Medida de complexidade de algoritmos","Um framework","Um tipo de banco de dados"]', 'Medida de complexidade de algoritmos', 'dificil', 'programacao', 20, 1),
('O que é injeção de dependência?', '["Um ataque de segurança","Padrão onde dependências são fornecidas externamente","Um tipo de loop","Um método de array"]', 'Padrão onde dependências são fornecidas externamente', 'dificil', 'programacao', 20, 1),
('O que é o event loop em JavaScript?', '["Um tipo de for loop","Mecanismo que gere execução assíncrona","Uma estrutura de dados","Um método de array"]', 'Mecanismo que gere execução assíncrona', 'dificil', 'programacao', 20, 1),
('O que é um closure em JavaScript?', '["Uma função que acede a variáveis do seu escopo externo","Um tipo de classe","Um método de array","Uma Promise"]', 'Uma função que acede a variáveis do seu escopo externo', 'dificil', 'programacao', 20, 1),
('O que é SOLID em programação?', '["Uma linguagem","Conjunto de 5 princípios de design orientado a objetos","Um framework","Um banco de dados"]', 'Conjunto de 5 princípios de design orientado a objetos', 'dificil', 'programacao', 20, 1),
('O que é um deadlock?', '["Um erro de sintaxe","Situação onde dois processos esperam um pelo outro indefinidamente","Um tipo de loop infinito","Um método de ordenação"]', 'Situação onde dois processos esperam um pelo outro indefinidamente', 'dificil', 'programacao', 20, 1);

-- ============================================================
-- INGLÊS (30 questões)
-- ============================================================
INSERT INTO questoes_teste_conhecimento (enunciado, opcoes, resposta_correta, dificuldade, categoria, pontos, ativo) VALUES
('What is the translation of "book"?', '["Mesa","Livro","Caneta","Caderno"]', 'Livro', 'facil', 'ingles', 10, 1),
('Complete: She ___ my friend.', '["are","is","am","be"]', 'is', 'facil', 'ingles', 10, 1),
('What does "water" mean in Portuguese?', '["Fogo","Terra","Água","Vento"]', 'Água', 'facil', 'ingles', 10, 1),
('Choose the correct word: I ___ to school every day.', '["go","goes","going","gone"]', 'go', 'facil', 'ingles', 10, 1),
('What is the plural of "child"?', '["childs","childes","children","childrens"]', 'children', 'facil', 'ingles', 10, 1),
('What does "happy" mean?', '["Triste","Zangado","Feliz","Cansado"]', 'Feliz', 'facil', 'ingles', 10, 1),
('Which is the correct greeting in the morning?', '["Good night","Good afternoon","Good morning","Good evening"]', 'Good morning', 'facil', 'ingles', 10, 1),
('What is the opposite of "big"?', '["Tall","Small","Fast","Heavy"]', 'Small', 'facil', 'ingles', 10, 1),
('How do you say "obrigado" in English?', '["Sorry","Please","Thank you","Excuse me"]', 'Thank you', 'facil', 'ingles', 10, 1),
('What does "run" mean?', '["Andar","Correr","Saltar","Nadar"]', 'Correr', 'facil', 'ingles', 10, 1),
('Choose the correct sentence:', '["She don''t like coffee","She doesn''t like coffee","She not like coffee","She no like coffee"]', 'She doesn''t like coffee', 'medio', 'ingles', 15, 1),
('What is the past tense of "go"?', '["Goed","Went","Gone","Going"]', 'Went', 'medio', 'ingles', 15, 1),
('Which sentence is in the Present Perfect?', '["I eat lunch","I ate lunch","I have eaten lunch","I will eat lunch"]', 'I have eaten lunch', 'medio', 'ingles', 15, 1),
('What does "although" mean?', '["Portanto","Embora","Porque","Então"]', 'Embora', 'medio', 'ingles', 15, 1),
('Choose the correct comparative: This book is ___ than that one.', '["more interesting","most interesting","interestinger","interestingest"]', 'more interesting', 'medio', 'ingles', 15, 1),
('What is the passive voice of "They built the house"?', '["The house was built by them","The house built by them","The house is build","They were built the house"]', 'The house was built by them', 'medio', 'ingles', 15, 1),
('What does "nevertheless" mean?', '["Além disso","No entanto","Portanto","Enquanto"]', 'No entanto', 'medio', 'ingles', 15, 1),
('Which word is a conjunction?', '["Quickly","Beautiful","Although","Running"]', 'Although', 'medio', 'ingles', 15, 1),
('What is the correct question tag: "You are coming, ___?"', '["are you","aren''t you","isn''t you","don''t you"]', 'aren''t you', 'medio', 'ingles', 15, 1),
('What does "procrastinate" mean?', '["Trabalhar muito","Adiar tarefas","Estudar bastante","Organizar bem"]', 'Adiar tarefas', 'medio', 'ingles', 15, 1),
('Identify the subjunctive mood: "I suggest that he ___ on time."', '["is","be","was","were"]', 'be', 'dificil', 'ingles', 20, 1),
('What is the correct form: "If I ___ you, I would apologize."', '["am","was","were","be"]', 'were', 'dificil', 'ingles', 20, 1),
('What does "ubiquitous" mean?', '["Raro","Presente em todo lugar","Antigo","Moderno"]', 'Presente em todo lugar', 'dificil', 'ingles', 20, 1),
('Which sentence uses the gerund correctly?', '["I enjoy to swim","I enjoy swimming","I enjoy swim","I enjoy swam"]', 'I enjoy swimming', 'dificil', 'ingles', 20, 1),
('What is the difference between "affect" and "effect"?', '["São sinónimos","Affect é verbo, effect é substantivo","Effect é verbo, affect é substantivo","Não há diferença"]', 'Affect é verbo, effect é substantivo', 'dificil', 'ingles', 20, 1),
('What does "ephemeral" mean?', '["Permanente","Duradouro","Passageiro","Eterno"]', 'Passageiro', 'dificil', 'ingles', 20, 1),
('Choose the correct reported speech: He said "I am tired."', '["He said he is tired","He said he was tired","He said he were tired","He said he be tired"]', 'He said he was tired', 'dificil', 'ingles', 20, 1),
('What is an "oxymoron"?', '["Figura de linguagem com contradição","Um tipo de metáfora","Uma rima","Um sinónimo"]', 'Figura de linguagem com contradição', 'dificil', 'ingles', 20, 1),
('What does "ambiguous" mean?', '["Claro","Com duplo sentido","Simples","Direto"]', 'Com duplo sentido', 'dificil', 'ingles', 20, 1),
('Which is correct: "Neither of them ___ ready."', '["are","were","is","be"]', 'is', 'dificil', 'ingles', 20, 1);
