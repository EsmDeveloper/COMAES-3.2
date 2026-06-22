-- ============================================================================
-- SCRIPT DE POPULAÇÃO DO BANCO - QUESTÕES COMAES
-- ============================================================================
-- Data: 2026-06-22
-- Descrição: Popula questões de torneios, testes e pendentes
-- ============================================================================

USE comaes_db;

-- Limpar dados existentes (CUIDADO: Remove tudo!)
-- DELETE FROM bloco_questoes_items;
-- DELETE FROM blocos_questoes;
-- DELETE FROM torneio_blocos;
-- DELETE FROM questoes;

-- ============================================================================
-- 1. QUESTÕES DE TORNEIOS (Aprovadas e prontas)
-- ============================================================================

-- 1.1 MATEMÁTICA - Questões de Torneio
INSERT INTO questoes (titulo, descricao, tipo, opcoes, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('Calcule o valor de x na equação: 2x + 5 = 15', 'aberta', NULL, '5', 'facil', 'matematica', 5, 1, 'aprovada', 1),
('Qual é a derivada de f(x) = 3x² + 2x - 1?', 'aberta', NULL, '6x + 2', 'medio', 'matematica', 10, 1, 'aprovada', 1),
('Resolva a integral: ∫(2x + 3)dx', 'aberta', NULL, 'x² + 3x + C', 'dificil', 'matematica', 20, 1, 'aprovada', 1),
('Se um triângulo tem lados de 3cm, 4cm e 5cm, qual é sua área?', 'aberta', NULL, '6', 'medio', 'matematica', 10, 1, 'aprovada', 1),
('Calcule a soma dos 10 primeiros números naturais', 'aberta', NULL, '55', 'facil', 'matematica', 5, 1, 'aprovada', 1),
('Quantos vértices tem um dodecaedro?', 'multipla_escolha', '["12", "20", "30", "40"]', '20', 'medio', 'matematica', 10, 1, 'aprovada', 1),
('Qual é o valor de π (pi) com 2 casas decimais?', 'multipla_escolha', '["3.12", "3.14", "3.16", "3.18"]', '3.14', 'facil', 'matematica', 5, 1, 'aprovada', 1),
('Resolva: log₂(64) = ?', 'aberta', NULL, '6', 'medio', 'matematica', 10, 1, 'aprovada', 1);

-- 1.2 PROGRAMAÇÃO - Questões de Torneio
INSERT INTO questoes (texto, tipo, opcoes, resposta_correta, dificuldade, disciplina, pontos, criado_por, status, is_public) VALUES
('Escreva uma função em Python que retorna o fatorial de um número n', 'aberta', NULL, 'def fatorial(n):\n    if n <= 1:\n        return 1\n    return n * fatorial(n-1)', 'medio', 'programacao', 10, 1, 'aprovada', 1),
('Qual é a saída de: print(type([]))?', 'multipla_escolha', '["<class ''list''>", "<class ''tuple''>", "<class ''dict''>", "<class ''set''>"]', '<class ''list''>', 'facil', 'programacao', 5, 1, 'aprovada', 1),
('Implemente uma função que verifica se uma string é palíndromo', 'aberta', NULL, 'def eh_palindromo(s):\n    return s == s[::-1]', 'medio', 'programacao', 10, 1, 'aprovada', 1),
('Escreva um algoritmo de busca binária', 'aberta', NULL, 'def busca_binaria(arr, x):\n    l, r = 0, len(arr)-1\n    while l <= r:\n        mid = (l+r)//2\n        if arr[mid] == x: return mid\n        elif arr[mid] < x: l = mid+1\n        else: r = mid-1\n    return -1', 'dificil', 'programacao', 20, 1, 'aprovada', 1),
('Qual é a complexidade de tempo de um algoritmo O(n²)?', 'multipla_escolha', '["Linear", "Logarítmica", "Quadrática", "Exponencial"]', 'Quadrática', 'medio', 'programacao', 10, 1, 'aprovada', 1),
('Em Python, o que faz a função len()?', 'multipla_escolha', '["Retorna o tamanho", "Ordena uma lista", "Remove um elemento", "Adiciona um elemento"]', 'Retorna o tamanho', 'facil', 'programacao', 5, 1, 'aprovada', 1),
('Escreva uma função que inverte uma lista', 'aberta', NULL, 'def inverter(lista):\n    return lista[::-1]', 'facil', 'programacao', 5, 1, 'aprovada', 1);

-- 1.3 INGLÊS - Questões de Torneio  
INSERT INTO questoes (texto, tipo, opcoes, resposta_correta, dificuldade, disciplina, pontos, criado_por, status, is_public) VALUES
('Complete: "She ___ to school every day."', 'multipla_escolha', '["go", "goes", "going", "gone"]', 'goes', 'facil', 'ingles', 5, 1, 'aprovada', 1),
('Translate to English: "Eu estou aprendendo inglês."', 'aberta', NULL, 'I am learning English', 'facil', 'ingles', 5, 1, 'aprovada', 1),
('What is the past tense of "buy"?', 'multipla_escolha', '["buyed", "bought", "buied", "buying"]', 'bought', 'medio', 'ingles', 10, 1, 'aprovada', 1),
('Write a short paragraph (50 words) about your daily routine', 'aberta', NULL, 'My daily routine starts at 6 AM. I wake up, have breakfast, and go to school. After classes, I study and do homework. In the evening, I spend time with family and relax before sleeping at 10 PM.', 'medio', 'ingles', 10, 1, 'aprovada', 1),
('Which sentence is grammatically correct?', 'multipla_escolha', '["He don''t like pizza", "He doesn''t like pizza", "He not like pizza", "He no likes pizza"]', 'He doesn''t like pizza', 'medio', 'ingles', 10, 1, 'aprovada', 1),
('What does "break the ice" mean?', 'multipla_escolha', '["Quebrar gelo", "Iniciar conversa", "Estar com frio", "Fazer exercício"]', 'Iniciar conversa', 'dificil', 'ingles', 20, 1, 'aprovada', 1);

-- ============================================================================
-- 2. BLOCOS DE QUESTÕES PARA TORNEIOS
-- ============================================================================

-- 2.1 Bloco Matemática - Torneio
INSERT INTO bloco_questoes (titulo, disciplina, dificuldade, tipo, criado_por, status) VALUES
('Matemática Básica - Torneio', 'matematica', 'medio', 'torneio', 1, 'aprovado');
SET @bloco_mat_torneio = LAST_INSERT_ID();

-- Associar questões ao bloco de matemática
INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem) 
SELECT @bloco_mat_torneio, id, 
  (SELECT COUNT(*) FROM bloco_questoes_items WHERE bloco_id = @bloco_mat_torneio) + 1
FROM questoes 
WHERE disciplina = 'matematica' AND status = 'aprovada' AND tipo IN ('aberta', 'multipla_escolha')
LIMIT 5;

-- 2.2 Bloco Programação - Torneio
INSERT INTO bloco_questoes (titulo, disciplina, dificuldade, tipo, criado_por, status) VALUES
('Algoritmos Python - Torneio', 'programacao', 'medio', 'torneio', 1, 'aprovado');
SET @bloco_prog_torneio = LAST_INSERT_ID();

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem)
SELECT @bloco_prog_torneio, id,
  (SELECT COUNT(*) FROM bloco_questoes_items WHERE bloco_id = @bloco_prog_torneio) + 1
FROM questoes
WHERE disciplina = 'programacao' AND status = 'aprovada'
LIMIT 5;

-- 2.3 Bloco Inglês - Torneio
INSERT INTO bloco_questoes (titulo, disciplina, dificuldade, tipo, criado_por, status) VALUES
('English Grammar - Torneio', 'ingles', 'medio', 'torneio', 1, 'aprovado');
SET @bloco_ing_torneio = LAST_INSERT_ID();

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem)
SELECT @bloco_ing_torneio, id,
  (SELECT COUNT(*) FROM bloco_questoes_items WHERE bloco_id = @bloco_ing_torneio) + 1
FROM questoes
WHERE disciplina = 'ingles' AND status = 'aprovada'
LIMIT 5;

-- ============================================================================
-- 3. QUESTÕES PARA TESTES/QUIZZES (is_public = 1, tipo genérico)
-- ============================================================================

-- 3.1 MATEMÁTICA - Testes
INSERT INTO questoes (texto, tipo, opcoes, resposta_correta, dificuldade, disciplina, pontos, criado_por, status, is_public) VALUES
('Quanto é 7 × 8?', 'multipla_escolha', '["54", "56", "58", "60"]', '56', 'facil', 'matematica', 5, 1, 'aprovada', 1),
('Qual é a raiz quadrada de 144?', 'multipla_escolha', '["10", "11", "12", "13"]', '12', 'facil', 'matematica', 5, 1, 'aprovada', 1),
('Quantos graus tem um ângulo reto?', 'multipla_escolha', '["45°", "60°", "90°", "180°"]', '90°', 'facil', 'matematica', 5, 1, 'aprovada', 1),
('Qual é o resultado de 15% de 200?', 'multipla_escolha', '["25", "30", "35", "40"]', '30', 'medio', 'matematica', 10, 1, 'aprovada', 1),
('Qual é o perímetro de um quadrado de lado 5cm?', 'aberta', NULL, '20', 'facil', 'matematica', 5, 1, 'aprovada', 1);

-- 3.2 PROGRAMAÇÃO - Testes
INSERT INTO questoes (texto, tipo, opcoes, resposta_correta, dificuldade, disciplina, pontos, criado_por, status, is_public) VALUES
('O que significa HTML?', 'multipla_escolha', '["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks Text Making Language"]', 'HyperText Markup Language', 'facil', 'programacao', 5, 1, 'aprovada', 1),
('Qual linguagem é usada para estilizar páginas web?', 'multipla_escolha', '["HTML", "CSS", "Python", "Java"]', 'CSS', 'facil', 'programacao', 5, 1, 'aprovada', 1),
('Em Python, como se comenta uma linha?', 'multipla_escolha', '["// comentário", "/* comentário */", "# comentário", "-- comentário"]', '# comentário', 'facil', 'programacao', 5, 1, 'aprovada', 1),
('O que é um loop?', 'multipla_escolha', '["Uma estrutura de repetição", "Uma variável", "Uma função", "Um erro"]', 'Uma estrutura de repetição', 'facil', 'programacao', 5, 1, 'aprovada', 1);

-- 3.3 INGLÊS - Testes
INSERT INTO questoes (texto, tipo, opcoes, resposta_correta, dificuldade, disciplina, pontos, criado_por, status, is_public) VALUES
('How do you say "Bom dia" in English?', 'multipla_escolha', '["Good morning", "Good night", "Good afternoon", "Good evening"]', 'Good morning', 'facil', 'ingles', 5, 1, 'aprovada', 1),
('What is the plural of "child"?', 'multipla_escolha', '["childs", "children", "childes", "child"]', 'children', 'facil', 'ingles', 5, 1, 'aprovada', 1),
('Complete: "I ___ a student."', 'multipla_escolha', '["am", "is", "are", "be"]', 'am', 'facil', 'ingles', 5, 1, 'aprovada', 1),
('What color is the sky?', 'multipla_escolha', '["Red", "Blue", "Green", "Yellow"]', 'Blue', 'facil', 'ingles', 5, 1, 'aprovada', 1);

-- ============================================================================
-- 4. BLOCOS PARA TESTES/QUIZZES
-- ============================================================================

-- 4.1 Bloco Matemática - Quiz
INSERT INTO bloco_questoes (titulo, disciplina, dificuldade, tipo, criado_por, status) VALUES
('Quiz Matemática Rápido', 'matematica', 'facil', 'quiz', 1, 'aprovado');
SET @bloco_mat_quiz = LAST_INSERT_ID();

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem)
SELECT @bloco_mat_quiz, id,
  (SELECT COUNT(*) FROM bloco_questoes_items WHERE bloco_id = @bloco_mat_quiz) + 1
FROM questoes
WHERE disciplina = 'matematica' AND is_public = 1 AND texto LIKE '%7 × 8%' OR texto LIKE '%raiz quadrada%' OR texto LIKE '%ângulo reto%';

-- 4.2 Bloco Programação - Quiz
INSERT INTO bloco_questoes (titulo, disciplina, dificuldade, tipo, criado_por, status) VALUES
('Quiz Programação Iniciante', 'programacao', 'facil', 'quiz', 1, 'aprovado');
SET @bloco_prog_quiz = LAST_INSERT_ID();

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem)
SELECT @bloco_prog_quiz, id,
  (SELECT COUNT(*) FROM bloco_questoes_items WHERE bloco_id = @bloco_prog_quiz) + 1
FROM questoes
WHERE disciplina = 'programacao' AND is_public = 1 AND texto LIKE '%HTML%' OR texto LIKE '%CSS%';

-- 4.3 Bloco Inglês - Quiz
INSERT INTO bloco_questoes (titulo, disciplina, dificuldade, tipo, criado_por, status) VALUES
('Quiz Inglês Básico', 'ingles', 'facil', 'quiz', 1, 'aprovado');
SET @bloco_ing_quiz = LAST_INSERT_ID();

INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem)
SELECT @bloco_ing_quiz, id,
  (SELECT COUNT(*) FROM bloco_questoes_items WHERE bloco_id = @bloco_ing_quiz) + 1
FROM questoes
WHERE disciplina = 'ingles' AND is_public = 1 AND texto LIKE '%Bom dia%' OR texto LIKE '%plural%';

-- ============================================================================
-- 5. QUESTÕES PENDENTES (Criadas por Rufus - colaborador_id = 2)
-- ============================================================================

-- Primeiro, garantir que o usuário Rufus existe como colaborador
-- INSERT INTO usuario (nome, email, senha, role, disciplina_colaborador, status_colaborador) 
-- VALUES ('Rufus Colaborador', 'rufus@comaes.com', '$2b$10$hashedpassword', 'colaborador', 'matematica', 'aprovado');
-- SET @rufus_id = LAST_INSERT_ID();

-- Assumindo que Rufus tem ID = 2 (ajuste conforme necessário)
SET @rufus_id = 2;

-- 5.1 MATEMÁTICA - Questões Pendentes do Rufus
INSERT INTO questoes (texto, tipo, opcoes, resposta_correta, dificuldade, disciplina, pontos, criado_por, status, is_public) VALUES
('Calcule o determinante da matriz 2x2: [[2,3],[1,4]]', 'aberta', NULL, '5', 'medio', 'matematica', 10, @rufus_id, 'pendente', 0),
('Qual é o valor de sen(30°)?', 'multipla_escolha', '["0.5", "0.707", "0.866", "1"]', '0.5', 'medio', 'matematica', 10, @rufus_id, 'pendente', 0),
('Resolva a equação do 2º grau: x² - 5x + 6 = 0', 'aberta', NULL, 'x = 2 ou x = 3', 'medio', 'matematica', 10, @rufus_id, 'pendente', 0),
('Quantas diagonais tem um pentágono?', 'multipla_escolha', '["3", "4", "5", "6"]', '5', 'facil', 'matematica', 5, @rufus_id, 'pendente', 0),
('Calcule a média aritmética de: 5, 8, 10, 12, 15', 'aberta', NULL, '10', 'facil', 'matematica', 5, @rufus_id, 'pendente', 0);

-- 5.2 PROGRAMAÇÃO - Questões Pendentes do Rufus
INSERT INTO questoes (texto, tipo, opcoes, resposta_correta, dificuldade, disciplina, pontos, criado_por, status, is_public) VALUES
('Implemente uma função que conta vogais em uma string', 'aberta', NULL, 'def contar_vogais(s):\n    return sum(1 for c in s.lower() if c in "aeiou")', 'medio', 'programacao', 10, @rufus_id, 'pendente', 0),
('O que é recursão em programação?', 'multipla_escolha', '["Uma função que chama a si mesma", "Um loop infinito", "Uma variável global", "Um erro de sintaxe"]', 'Uma função que chama a si mesma', 'medio', 'programacao', 10, @rufus_id, 'pendente', 0),
('Escreva um código que verifica se um número é par', 'aberta', NULL, 'def eh_par(n):\n    return n % 2 == 0', 'facil', 'programacao', 5, @rufus_id, 'pendente', 0),
('Qual é a diferença entre lista e tupla em Python?', 'aberta', NULL, 'Lista é mutável (pode ser alterada) e tupla é imutável (não pode ser alterada após criação)', 'medio', 'programacao', 10, @rufus_id, 'pendente', 0);

-- 5.3 INGLÊS - Questões Pendentes do Rufus
INSERT INTO questoes (texto, tipo, opcoes, resposta_correta, dificuldade, disciplina, pontos, criado_por, status, is_public) VALUES
('Write the comparative form of "good"', 'aberta', NULL, 'better', 'medio', 'ingles', 10, @rufus_id, 'pendente', 0),
('What is a synonym for "happy"?', 'multipla_escolha', '["Sad", "Joyful", "Angry", "Tired"]', 'Joyful', 'medio', 'ingles', 10, @rufus_id, 'pendente', 0),
('Complete: "If I ___ rich, I would travel the world."', 'multipla_escolha', '["am", "was", "were", "be"]', 'were', 'medio', 'ingles', 10, @rufus_id, 'pendente', 0);

-- 5.4 BLOCOS PENDENTES do Rufus
INSERT INTO bloco_questoes (titulo, disciplina, dificuldade, tipo, criado_por, status) VALUES
('Matemática Avançada - Pendente', 'matematica', 'medio', 'torneio', @rufus_id, 'pendente'),
('Python Intermediário - Pendente', 'programacao', 'medio', 'torneio', @rufus_id, 'pendente'),
('English Advanced - Pendente', 'ingles', 'dificil', 'torneio', @rufus_id, 'pendente');

-- Associar questões pendentes aos blocos pendentes
SET @bloco_mat_pendente = (SELECT id FROM bloco_questoes WHERE titulo = 'Matemática Avançada - Pendente');
SET @bloco_prog_pendente = (SELECT id FROM bloco_questoes WHERE titulo = 'Python Intermediário - Pendente');
SET @bloco_ing_pendente = (SELECT id FROM bloco_questoes WHERE titulo = 'English Advanced - Pendente');

-- Matemática Pendente
INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem)
SELECT @bloco_mat_pendente, id,
  (SELECT COUNT(*) FROM bloco_questoes_items WHERE bloco_id = @bloco_mat_pendente) + 1
FROM questoes
WHERE disciplina = 'matematica' AND status = 'pendente' AND criado_por = @rufus_id
LIMIT 5;

-- Programação Pendente
INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem)
SELECT @bloco_prog_pendente, id,
  (SELECT COUNT(*) FROM bloco_questoes_items WHERE bloco_id = @bloco_prog_pendente) + 1
FROM questoes
WHERE disciplina = 'programacao' AND status = 'pendente' AND criado_por = @rufus_id
LIMIT 4;

-- Inglês Pendente
INSERT INTO bloco_questoes_items (bloco_id, questao_id, ordem)
SELECT @bloco_ing_pendente, id,
  (SELECT COUNT(*) FROM bloco_questoes_items WHERE bloco_id = @bloco_ing_pendente) + 1
FROM questoes
WHERE disciplina = 'ingles' AND status = 'pendente' AND criado_por = @rufus_id
LIMIT 3;

-- ============================================================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================================================

-- Contagem de questões por status
SELECT 
    status,
    disciplina,
    COUNT(*) as total
FROM questoes
GROUP BY status, disciplina
ORDER BY status, disciplina;

-- Contagem de blocos por status
SELECT 
    status,
    disciplina,
    tipo,
    COUNT(*) as total
FROM bloco_questoes
GROUP BY status, disciplina, tipo
ORDER BY status, disciplina;

-- Total de questões em blocos
SELECT 
    bq.titulo,
    bq.disciplina,
    bq.status,
    COUNT(bqi.id) as total_questoes
FROM bloco_questoes bq
LEFT JOIN bloco_questao_item bqi ON bq.id = bqi.bloco_id
GROUP BY bq.id, bq.titulo, bq.disciplina, bq.status
ORDER BY bq.status, bq.disciplina;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
