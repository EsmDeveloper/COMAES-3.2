-- ============================================================================
-- SCRIPT DE POPULAÇÃO DO BANCO - QUESTÕES COMAES (SIMPLIFICADO)
-- ============================================================================
USE comaes_db;

SET @admin_id = 1;
SET @rufus_id = 2;
SET @now = NOW();

-- ============================================================================
-- 1. QUESTÕES DE TORNEIOS - MATEMÁTICA (Aprovadas)
-- ============================================================================
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('Equação Linear', 'Calcule o valor de x na equação: 2x + 5 = 15', 'texto', '5', 'facil', 'matematica', 5, @admin_id, 'aprovada', @now, @now),
('Derivada', 'Qual é a derivada de f(x) = 3x² + 2x - 1?', 'texto', '6x + 2', 'medio', 'matematica', 10, @admin_id, 'aprovada', @now, @now),
('Integral', 'Resolva a integral: ∫(2x + 3)dx', 'texto', 'x² + 3x + C', 'dificil', 'matematica', 20, @admin_id, 'aprovada', @now, @now),
('Área do Triângulo', 'Se um triângulo tem lados de 3cm, 4cm e 5cm, qual é sua área?', 'texto', '6', 'medio', 'matematica', 10, @admin_id, 'aprovada', @now, @now),
('Soma dos Naturais', 'Calcule a soma dos 10 primeiros números naturais', 'texto', '55', 'facil', 'matematica', 5, @admin_id, 'aprovada', @now, @now),
('Vértices do Dodecaedro', 'Quantos vértices tem um dodecaedro?', 'multipla_escolha', '20', 'medio', 'matematica', 10, @admin_id, 'aprovada', @now, @now),
('Valor de Pi', 'Qual é o valor de π (pi) com 2 casas decimais?', 'multipla_escolha', '3.14', 'facil', 'matematica', 5, @admin_id, 'aprovada', @now, @now),
('Logaritmo', 'Resolva: log₂(64) = ?', 'texto', '6', 'medio', 'matematica', 10, @admin_id, 'aprovada', @now, @now);

-- Adicionar opcoes para múltipla escolha
UPDATE questoes SET opcoes = JSON_ARRAY('12', '20', '30', '40') WHERE titulo = 'Vértices do Dodecaedro';
UPDATE questoes SET opcoes = JSON_ARRAY('3.12', '3.14', '3.16', '3.18') WHERE titulo = 'Valor de Pi';

-- ============================================================================
-- 2. QUESTÕES DE TORNEIOS - PROGRAMAÇÃO (Aprovadas)
-- ============================================================================
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('Função Fatorial', 'Escreva uma função em Python que retorna o fatorial de um número n', 'codigo', 'def fatorial(n):\n    if n <= 1:\n        return 1\n    return n * fatorial(n-1)', 'medio', 'programacao', 10, @admin_id, 'aprovada', @now, @now),
('Tipo de Lista', 'Qual é a saída de: print(type([]))?', 'multipla_escolha', '<class ''list''>', 'facil', 'programacao', 5, @admin_id, 'aprovada', @now, @now),
('Função Palíndromo', 'Implemente uma função que verifica se uma string é palíndromo', 'codigo', 'def eh_palindromo(s):\n    return s == s[::-1]', 'medio', 'programacao', 10, @admin_id, 'aprovada', @now, @now),
('Busca Binária', 'Escreva um algoritmo de busca binária', 'codigo', 'def busca_binaria(arr, x):\n    l, r = 0, len(arr)-1\n    while l <= r:\n        mid = (l+r)//2\n        if arr[mid] == x: return mid\n        elif arr[mid] < x: l = mid+1\n        else: r = mid-1\n    return -1', 'dificil', 'programacao', 20, @admin_id, 'aprovada', @now, @now),
('Complexidade O(n²)', 'Qual é a complexidade de tempo de um algoritmo O(n²)?', 'multipla_escolha', 'Quadrática', 'medio', 'programacao', 10, @admin_id, 'aprovada', @now, @now),
('Função len()', 'Em Python, o que faz a função len()?', 'multipla_escolha', 'Retorna o tamanho', 'facil', 'programacao', 5, @admin_id, 'aprovada', @now, @now),
('Inverter Lista', 'Escreva uma função que inverte uma lista', 'codigo', 'def inverter(lista):\n    return lista[::-1]', 'facil', 'programacao', 5, @admin_id, 'aprovada', @now, @now);

-- Adicionar opcoes para múltipla escolha
UPDATE questoes SET opcoes = JSON_ARRAY('<class ''list''>', '<class ''tuple''>', '<class ''dict''>', '<class ''set''>') WHERE titulo = 'Tipo de Lista';
UPDATE questoes SET opcoes = JSON_ARRAY('Linear', 'Logarítmica', 'Quadrática', 'Exponencial') WHERE titulo = 'Complexidade O(n²)';
UPDATE questoes SET opcoes = JSON_ARRAY('Retorna o tamanho', 'Ordena uma lista', 'Remove um elemento', 'Adiciona um elemento') WHERE titulo = 'Função len()';

-- ============================================================================
-- 3. QUESTÕES DE TORNEIOS - INGLÊS (Aprovadas)
-- ============================================================================
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('Present Simple', 'Complete: "She ___ to school every day."', 'multipla_escolha', 'goes', 'facil', 'ingles', 5, @admin_id, 'aprovada', @now, @now),
('Tradução', 'Translate to English: "Eu estou aprendendo inglês."', 'texto', 'I am learning English', 'facil', 'ingles', 5, @admin_id, 'aprovada', @now, @now),
('Past Tense', 'What is the past tense of "buy"?', 'multipla_escolha', 'bought', 'medio', 'ingles', 10, @admin_id, 'aprovada', @now, @now),
('Daily Routine', 'Write a short paragraph (50 words) about your daily routine', 'texto', 'My daily routine starts at 6 AM. I wake up, have breakfast, and go to school. After classes, I study and do homework. In the evening, I spend time with family and relax before sleeping at 10 PM.', 'medio', 'ingles', 10, @admin_id, 'aprovada', @now, @now),
('Grammar Check', 'Which sentence is grammatically correct?', 'multipla_escolha', 'He doesn''t like pizza', 'medio', 'ingles', 10, @admin_id, 'aprovada', @now, @now),
('Idiom', 'What does "break the ice" mean?', 'multipla_escolha', 'Iniciar conversa', 'dificil', 'ingles', 20, @admin_id, 'aprovada', @now, @now);

-- Adicionar opcoes para múltipla escolha
UPDATE questoes SET opcoes = JSON_ARRAY('go', 'goes', 'going', 'gone') WHERE titulo = 'Present Simple';
UPDATE questoes SET opcoes = JSON_ARRAY('buyed', 'bought', 'buied', 'buying') WHERE titulo = 'Past Tense';
UPDATE questoes SET opcoes = JSON_ARRAY('He don''t like pizza', 'He doesn''t like pizza', 'He not like pizza', 'He no likes pizza') WHERE titulo = 'Grammar Check';
UPDATE questoes SET opcoes = JSON_ARRAY('Quebrar gelo', 'Iniciar conversa', 'Estar com frio', 'Fazer exercício') WHERE titulo = 'Idiom';

-- ============================================================================
-- 4. QUESTÕES DE TESTES - MATEMÁTICA (Aprovadas, Públicas)
-- ============================================================================
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('Multiplicação', 'Quanto é 7 × 8?', 'multipla_escolha', '56', 'facil', 'matematica', 5, @admin_id, 'aprovada', @now, @now),
('Raiz Quadrada', 'Qual é a raiz quadrada de 144?', 'multipla_escolha', '12', 'facil', 'matematica', 5, @admin_id, 'aprovada', @now, @now),
('Ângulo Reto', 'Quantos graus tem um ângulo reto?', 'multipla_escolha', '90°', 'facil', 'matematica', 5, @admin_id, 'aprovada', @now, @now),
('Porcentagem', 'Qual é o resultado de 15% de 200?', 'multipla_escolha', '30', 'medio', 'matematica', 10, @admin_id, 'aprovada', @now, @now),
('Perímetro', 'Qual é o perímetro de um quadrado de lado 5cm?', 'texto', '20', 'facil', 'matematica', 5, @admin_id, 'aprovada', @now, @now);

UPDATE questoes SET opcoes = JSON_ARRAY('54', '56', '58', '60') WHERE titulo = 'Multiplicação';
UPDATE questoes SET opcoes = JSON_ARRAY('10', '11', '12', '13') WHERE titulo = 'Raiz Quadrada';
UPDATE questoes SET opcoes = JSON_ARRAY('45°', '60°', '90°', '180°') WHERE titulo = 'Ângulo Reto';
UPDATE questoes SET opcoes = JSON_ARRAY('25', '30', '35', '40') WHERE titulo = 'Porcentagem';

-- ============================================================================
-- 5. QUESTÕES DE TESTES - PROGRAMAÇÃO (Aprovadas)
-- ============================================================================
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('O que é HTML', 'O que significa HTML?', 'multipla_escolha', 'HyperText Markup Language', 'facil', 'programacao', 5, @admin_id, 'aprovada', @now, @now),
('Estilo Web', 'Qual linguagem é usada para estilizar páginas web?', 'multipla_escolha', 'CSS', 'facil', 'programacao', 5, @admin_id, 'aprovada', @now, @now),
('Comentário Python', 'Em Python, como se comenta uma linha?', 'multipla_escolha', '# comentário', 'facil', 'programacao', 5, @admin_id, 'aprovada', @now, @now),
('O que é Loop', 'O que é um loop?', 'multipla_escolha', 'Uma estrutura de repetição', 'facil', 'programacao', 5, @admin_id, 'aprovada', @now, @now);

UPDATE questoes SET opcoes = JSON_ARRAY('HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks Text Making Language') WHERE titulo = 'O que é HTML';
UPDATE questoes SET opcoes = JSON_ARRAY('HTML', 'CSS', 'Python', 'Java') WHERE titulo = 'Estilo Web';
UPDATE questoes SET opcoes = JSON_ARRAY('// comentário', '/* comentário */', '# comentário', '-- comentário') WHERE titulo = 'Comentário Python';
UPDATE questoes SET opcoes = JSON_ARRAY('Uma estrutura de repetição', 'Uma variável', 'Uma função', 'Um erro') WHERE titulo = 'O que é Loop';

-- ============================================================================
-- 6. QUESTÕES DE TESTES - INGLÊS (Aprovadas)
-- ============================================================================
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('Bom Dia', 'How do you say "Bom dia" in English?', 'multipla_escolha', 'Good morning', 'facil', 'ingles', 5, @admin_id, 'aprovada', @now, @now),
('Plural Child', 'What is the plural of "child"?', 'multipla_escolha', 'children', 'facil', 'ingles', 5, @admin_id, 'aprovada', @now, @now),
('Verb To Be', 'Complete: "I ___ a student."', 'multipla_escolha', 'am', 'facil', 'ingles', 5, @admin_id, 'aprovada', @now, @now),
('Cor do Céu', 'What color is the sky?', 'multipla_escolha', 'Blue', 'facil', 'ingles', 5, @admin_id, 'aprovada', @now, @now);

UPDATE questoes SET opcoes = JSON_ARRAY('Good morning', 'Good night', 'Good afternoon', 'Good evening') WHERE titulo = 'Bom Dia';
UPDATE questoes SET opcoes = JSON_ARRAY('childs', 'children', 'childes', 'child') WHERE titulo = 'Plural Child';
UPDATE questoes SET opcoes = JSON_ARRAY('am', 'is', 'are', 'be') WHERE titulo = 'Verb To Be';
UPDATE questoes SET opcoes = JSON_ARRAY('Red', 'Blue', 'Green', 'Yellow') WHERE titulo = 'Cor do Céu';

-- ============================================================================
-- 7. QUESTÕES PENDENTES - RUFUS (Matemática)
-- ============================================================================
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('Determinante', 'Calcule o determinante da matriz 2x2: [[2,3],[1,4]]', 'texto', '5', 'medio', 'matematica', 10, @rufus_id, 'pendente', @now, @now),
('Seno 30', 'Qual é o valor de sen(30°)?', 'multipla_escolha', '0.5', 'medio', 'matematica', 10, @rufus_id, 'pendente', @now, @now),
('Equação 2º Grau', 'Resolva a equação do 2º grau: x² - 5x + 6 = 0', 'texto', 'x = 2 ou x = 3', 'medio', 'matematica', 10, @rufus_id, 'pendente', @now, @now),
('Diagonais Pentágono', 'Quantas diagonais tem um pentágono?', 'multipla_escolha', '5', 'facil', 'matematica', 5, @rufus_id, 'pendente', @now, @now),
('Média Aritmética', 'Calcule a média aritmética de: 5, 8, 10, 12, 15', 'texto', '10', 'facil', 'matematica', 5, @rufus_id, 'pendente', @now, @now);

UPDATE questoes SET opcoes = JSON_ARRAY('0.5', '0.707', '0.866', '1') WHERE titulo = 'Seno 30';
UPDATE questoes SET opcoes = JSON_ARRAY('3', '4', '5', '6') WHERE titulo = 'Diagonais Pentágono';

-- ============================================================================
-- 8. QUESTÕES PENDENTES - RUFUS (Programação)
-- ============================================================================
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('Contar Vogais', 'Implemente uma função que conta vogais em uma string', 'codigo', 'def contar_vogais(s):\n    return sum(1 for c in s.lower() if c in "aeiou")', 'medio', 'programacao', 10, @rufus_id, 'pendente', @now, @now),
('O que é Recursão', 'O que é recursão em programação?', 'multipla_escolha', 'Uma função que chama a si mesma', 'medio', 'programacao', 10, @rufus_id, 'pendente', @now, @now),
('Número Par', 'Escreva um código que verifica se um número é par', 'codigo', 'def eh_par(n):\n    return n % 2 == 0', 'facil', 'programacao', 5, @rufus_id, 'pendente', @now, @now),
('Lista vs Tupla', 'Qual é a diferença entre lista e tupla em Python?', 'texto', 'Lista é mutável (pode ser alterada) e tupla é imutável (não pode ser alterada após criação)', 'medio', 'programacao', 10, @rufus_id, 'pendente', @now, @now);

UPDATE questoes SET opcoes = JSON_ARRAY('Uma função que chama a si mesma', 'Um loop infinito', 'Uma variável global', 'Um erro de sintaxe') WHERE titulo = 'O que é Recursão';

-- ============================================================================
-- 9. QUESTÕES PENDENTES - RUFUS (Inglês)
-- ============================================================================
INSERT INTO questoes (titulo, descricao, tipo, resposta_correta, dificuldade, disciplina, pontos, autor_id, status_aprovacao, created_at, updated_at) VALUES
('Comparative Good', 'Write the comparative form of "good"', 'texto', 'better', 'medio', 'ingles', 10, @rufus_id, 'pendente', @now, @now),
('Synonym Happy', 'What is a synonym for "happy"?', 'multipla_escolha', 'Joyful', 'medio', 'ingles', 10, @rufus_id, 'pendente', @now, @now),
('Conditional', 'Complete: "If I ___ rich, I would travel the world."', 'multipla_escolha', 'were', 'medio', 'ingles', 10, @rufus_id, 'pendente', @now, @now);

UPDATE questoes SET opcoes = JSON_ARRAY('Sad', 'Joyful', 'Angry', 'Tired') WHERE titulo = 'Synonym Happy';
UPDATE questoes SET opcoes = JSON_ARRAY('am', 'was', 'were', 'be') WHERE titulo = 'Conditional';

-- ============================================================================
-- 10. ESTATÍSTICAS
-- ============================================================================
SELECT 
    status_aprovacao,
    disciplina,
    COUNT(*) as total
FROM questoes
GROUP BY status_aprovacao, disciplina
ORDER BY status_aprovacao, disciplina;

SELECT CONCAT('Total de questões inseridas: ', COUNT(*)) as resumo FROM questoes;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
