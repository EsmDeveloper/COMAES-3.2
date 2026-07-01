/**
 * seed_blocos_completo.js
 * Popula blocos de TORNEIO (questões abertas) e TESTE (múltipla escolha)
 * 3 disciplinas × 3 níveis × 2 contextos = 18 blocos
 * 15 questões por bloco = 270 questões no total
 *
 * Uso: node scripts/seed_blocos_completo.js
 */
import sequelize from '../config/db.js';
import BlocoQuestoes from '../models/BlocoQuestoes.js';
import Questao from '../models/Questao.js';
import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';
import BlocoQuestaoItem from '../models/BlocoQuestaoItem.js';

const ADMIN_ID = 1; // ID do admin que cria os blocos

// ─── Helpers ────────────────────────────────────────────────────────────────
const ok  = (msg) => console.log(`  ✅ ${msg}`);
const log = (msg) => console.log(`  ℹ  ${msg}`);

async function criarBlocoSeNaoExistir(dados) {
  const existe = await BlocoQuestoes.findOne({
    where: { titulo: dados.titulo, disciplina: dados.disciplina, dificuldade: dados.dificuldade, contexto: dados.contexto }
  });
  if (existe) { log(`Bloco já existe: "${dados.titulo}" — reutilizando`); return existe; }
  const bloco = await BlocoQuestoes.create({ ...dados, criado_por: ADMIN_ID, status: 'aprovado' });
  ok(`Bloco criado: "${bloco.titulo}" [ID ${bloco.id}]`);
  return bloco;
}

// ─── QUESTÕES DE TORNEIO — resposta aberta/código ───────────────────────────
const questoesTorneio = {
  matematica: {
    facil: [
      { titulo: 'Soma Simples', descricao: 'Calcule: 47 + 38 = ?', resposta_correta: '85', pontos: 10 },
      { titulo: 'Subtração', descricao: 'Calcule: 100 − 63 = ?', resposta_correta: '37', pontos: 10 },
      { titulo: 'Multiplicação', descricao: 'Calcule: 8 × 7 = ?', resposta_correta: '56', pontos: 10 },
      { titulo: 'Divisão Exacta', descricao: 'Calcule: 84 ÷ 4 = ?', resposta_correta: '21', pontos: 10 },
      { titulo: 'Dobro', descricao: 'Qual é o dobro de 34?', resposta_correta: '68', pontos: 10 },
      { titulo: 'Metade', descricao: 'Qual é a metade de 90?', resposta_correta: '45', pontos: 10 },
      { titulo: 'Percentagem Simples', descricao: '10% de 200 é igual a?', resposta_correta: '20', pontos: 10 },
      { titulo: 'Quadrado', descricao: 'Quanto é 9²?', resposta_correta: '81', pontos: 10 },
      { titulo: 'Raiz Quadrada', descricao: 'Qual é a raiz quadrada de 49?', resposta_correta: '7', pontos: 10 },
      { titulo: 'Sequência Numérica', descricao: 'Complete: 2, 4, 8, 16, ___', resposta_correta: '32', pontos: 10 },
      { titulo: 'Números Pares', descricao: 'Quantos números pares existem entre 1 e 20?', resposta_correta: '10', pontos: 10 },
      { titulo: 'Frações Simples', descricao: 'Quanto é 1/2 + 1/4? Escreva como fração.', resposta_correta: '3/4', pontos: 10 },
      { titulo: 'MDC', descricao: 'Qual é o MDC de 12 e 8?', resposta_correta: '4', pontos: 10 },
      { titulo: 'MMC', descricao: 'Qual é o MMC de 4 e 6?', resposta_correta: '12', pontos: 10 },
      { titulo: 'Regra de Três', descricao: 'Se 3 lápis custam 6 Kz, quanto custam 5 lápis?', resposta_correta: '10', pontos: 10 },
    ],
    medio: [
      { titulo: 'Equação do 1º Grau', descricao: 'Resolva: 2x + 5 = 15. Qual é o valor de x?', resposta_correta: '5', pontos: 15 },
      { titulo: 'Produto Notable', descricao: 'Expanda (x + 3)². Escreva o resultado.', resposta_correta: 'x² + 6x + 9', pontos: 15 },
      { titulo: 'Progressão Aritmética', descricao: 'Na PA (3, 7, 11, ...) qual é o 10º termo?', resposta_correta: '39', pontos: 15 },
      { titulo: 'Área do Triângulo', descricao: 'Um triângulo tem base 10 cm e altura 6 cm. Qual é a área?', resposta_correta: '30', pontos: 15 },
      { titulo: 'Média Aritmética', descricao: 'Calcule a média de: 8, 6, 10, 4, 7', resposta_correta: '7', pontos: 15 },
      { titulo: 'Porcentagem Aplicada', descricao: 'Um produto custa 200 Kz com 15% de desconto. Qual o preço final?', resposta_correta: '170', pontos: 15 },
      { titulo: 'Equação 2º Grau Simples', descricao: 'Resolva: x² = 25. Quais são os valores de x?', resposta_correta: '5 e -5', pontos: 15 },
      { titulo: 'Potência de 10', descricao: 'Quanto é 10³?', resposta_correta: '1000', pontos: 15 },
      { titulo: 'Logaritmo Simples', descricao: 'Quanto é log₁₀(1000)?', resposta_correta: '3', pontos: 15 },
      { titulo: 'Geometria — Perímetro', descricao: 'Um rectângulo tem lados 5 e 8. Qual é o perímetro?', resposta_correta: '26', pontos: 15 },
      { titulo: 'Monomios', descricao: 'Simplifique: 3x² × 2x', resposta_correta: '6x³', pontos: 15 },
      { titulo: 'Razão e Proporção', descricao: 'Se a razão entre A e B é 2:3 e B=15, qual é A?', resposta_correta: '10', pontos: 15 },
      { titulo: 'Ângulos', descricao: 'Qual é o suplemento de 70°?', resposta_correta: '110', pontos: 15 },
      { titulo: 'Volume do Cubo', descricao: 'Um cubo tem aresta 3 cm. Qual é o volume?', resposta_correta: '27', pontos: 15 },
      { titulo: 'Probabilidade Simples', descricao: 'Numa urna com 4 bolas vermelhas e 6 azuis, qual a probabilidade de tirar vermelha? Escreva como fração.', resposta_correta: '2/5', pontos: 15 },
    ],
    dificil: [
      { titulo: 'Bhaskara', descricao: 'Resolva: x² − 5x + 6 = 0. Quais são as raízes?', resposta_correta: '2 e 3', pontos: 20 },
      { titulo: 'Seno de 30°', descricao: 'Qual é o valor exacto de sen(30°)?', resposta_correta: '1/2', pontos: 20 },
      { titulo: 'Limite', descricao: 'Calcule: lim(x→2) (x² − 4)/(x − 2)', resposta_correta: '4', pontos: 20 },
      { titulo: 'Derivada', descricao: 'Calcule a derivada de f(x) = 3x³ − 2x', resposta_correta: '9x² − 2', pontos: 20 },
      { titulo: 'Integral Simples', descricao: 'Calcule ∫ 2x dx', resposta_correta: 'x² + C', pontos: 20 },
      { titulo: 'Números Complexos', descricao: 'Calcule (3 + 2i) + (1 − 4i)', resposta_correta: '4 − 2i', pontos: 20 },
      { titulo: 'Determinante 2×2', descricao: 'Calcule o determinante da matriz [[3,1],[2,4]]', resposta_correta: '10', pontos: 20 },
      { titulo: 'PA — Soma dos Termos', descricao: 'Calcule a soma dos 20 primeiros termos da PA (1, 3, 5, ...)', resposta_correta: '400', pontos: 20 },
      { titulo: 'PG — Termo Geral', descricao: 'Na PG (2, 6, 18, ...) qual é o 6º termo?', resposta_correta: '486', pontos: 20 },
      { titulo: 'Binómio de Newton', descricao: 'Qual é o coeficiente de x² em (x+1)⁴?', resposta_correta: '6', pontos: 20 },
      { titulo: 'Logaritmo Neperiano', descricao: 'Qual é o valor de ln(e²)?', resposta_correta: '2', pontos: 20 },
      { titulo: 'Matrizes — Produto', descricao: 'Se A=[[1,0],[0,1]] e B=[[2,3],[4,5]], calcule A×B. Escreva linha a linha.', resposta_correta: '[[2,3],[4,5]]', pontos: 20 },
      { titulo: 'Cosseno de 60°', descricao: 'Qual é o valor exacto de cos(60°)?', resposta_correta: '1/2', pontos: 20 },
      { titulo: 'Combinações', descricao: 'Calcule C(6,2)', resposta_correta: '15', pontos: 20 },
      { titulo: 'Equação Exponencial', descricao: 'Resolva: 2^x = 32. Qual é x?', resposta_correta: '5', pontos: 20 },
    ],
  },

  ingles: {
    facil: [
      { titulo: 'To Be — Present', descricao: 'Complete: "She ___ a student." (to be)', resposta_correta: 'is', pontos: 10 },
      { titulo: 'Articles', descricao: 'Use the correct article: "___ apple a day keeps the doctor away."', resposta_correta: 'An', pontos: 10 },
      { titulo: 'Numbers 1–20', descricao: 'How do you write 15 in English?', resposta_correta: 'fifteen', pontos: 10 },
      { titulo: 'Days of the Week', descricao: 'What day comes after Wednesday?', resposta_correta: 'Thursday', pontos: 10 },
      { titulo: 'Colors', descricao: 'What color is the sky on a clear day?', resposta_correta: 'blue', pontos: 10 },
      { titulo: 'Greetings', descricao: 'How do you say "Bom dia" in English?', resposta_correta: 'Good morning', pontos: 10 },
      { titulo: 'Plural Forms', descricao: 'What is the plural of "child"?', resposta_correta: 'children', pontos: 10 },
      { titulo: 'Simple Present', descricao: 'Write the correct form: "He ___ (to eat) breakfast every day."', resposta_correta: 'eats', pontos: 10 },
      { titulo: 'Vocabulary — Family', descricao: 'What do you call your father\'s mother?', resposta_correta: 'grandmother', pontos: 10 },
      { titulo: 'Prepositions', descricao: 'The book is ___ the table. (on/in/under)', resposta_correta: 'on', pontos: 10 },
      { titulo: 'Months', descricao: 'What is the 7th month of the year?', resposta_correta: 'July', pontos: 10 },
      { titulo: 'Adjectives', descricao: 'What is the opposite of "hot"?', resposta_correta: 'cold', pontos: 10 },
      { titulo: 'Verb — Have', descricao: 'Complete: "I ___ two brothers." (have/has)', resposta_correta: 'have', pontos: 10 },
      { titulo: 'Countries', descricao: 'What language do people speak in Brazil?', resposta_correta: 'Portuguese', pontos: 10 },
      { titulo: 'Simple Question', descricao: 'Translate to English: "Onde você mora?"', resposta_correta: 'Where do you live?', pontos: 10 },
    ],
    medio: [
      { titulo: 'Past Simple', descricao: 'Write the past form of "go".', resposta_correta: 'went', pontos: 15 },
      { titulo: 'Present Perfect', descricao: 'Complete: "I ___ never ___ sushi." (present perfect of "eat")', resposta_correta: 'have never eaten', pontos: 15 },
      { titulo: 'Conditional Type 1', descricao: 'Complete: "If it rains, we ___ stay home." (will/would)', resposta_correta: 'will', pontos: 15 },
      { titulo: 'Passive Voice', descricao: 'Rewrite in passive voice: "The teacher corrects the tests."', resposta_correta: 'The tests are corrected by the teacher.', pontos: 15 },
      { titulo: 'Comparative', descricao: 'Form the comparative of "good".', resposta_correta: 'better', pontos: 15 },
      { titulo: 'Superlative', descricao: 'Form the superlative of "bad".', resposta_correta: 'the worst', pontos: 15 },
      { titulo: 'Modal — Must', descricao: 'Translate: "Você deve estudar mais."', resposta_correta: 'You must study more.', pontos: 15 },
      { titulo: 'Reported Speech', descricao: 'Report: He said "I am tired." → He said that ___', resposta_correta: 'he was tired', pontos: 15 },
      { titulo: 'Phrasal Verb', descricao: 'What does "give up" mean?', resposta_correta: 'desistir', pontos: 15 },
      { titulo: 'Spelling', descricao: 'Correct the spelling: "accomodation"', resposta_correta: 'accommodation', pontos: 15 },
      { titulo: 'Relative Clauses', descricao: 'Complete: "The man ___ lives next door is a doctor." (who/which)', resposta_correta: 'who', pontos: 15 },
      { titulo: 'Vocabulary — Business', descricao: 'What is the English word for "reunião de negócios"?', resposta_correta: 'business meeting', pontos: 15 },
      { titulo: 'Tag Questions', descricao: 'Complete: "You are coming, ___?"', resposta_correta: 'aren\'t you', pontos: 15 },
      { titulo: 'Gerund vs Infinitive', descricao: 'Complete: "She enjoys ___ (swim)."', resposta_correta: 'swimming', pontos: 15 },
      { titulo: 'Prepositions of Time', descricao: 'Complete: "I was born ___ 1995." (in/on/at)', resposta_correta: 'in', pontos: 15 },
    ],
    dificil: [
      { titulo: 'Subjunctive', descricao: 'Complete: "I suggest that he ___ (to study) harder."', resposta_correta: 'study', pontos: 20 },
      { titulo: 'Inversion', descricao: 'Rewrite with inversion: "I have never seen such a beautiful city."', resposta_correta: 'Never have I seen such a beautiful city.', pontos: 20 },
      { titulo: 'Mixed Conditional', descricao: 'Complete: "If I had studied, I ___ pass the exam now." (would/could)', resposta_correta: 'would', pontos: 20 },
      { titulo: 'Cleft Sentences', descricao: 'Rewrite as a cleft sentence: "She broke the window." (It was...)', resposta_correta: 'It was she who broke the window.', pontos: 20 },
      { titulo: 'Idiom', descricao: 'What does the idiom "beat around the bush" mean?', resposta_correta: 'to avoid the main topic', pontos: 20 },
      { titulo: 'Formal Writing', descricao: 'Write a formal alternative to "I want to know..."', resposta_correta: 'I would like to inquire about...', pontos: 20 },
      { titulo: 'Discourse Marker', descricao: 'What discourse marker introduces a contrast? (However/Therefore/Furthermore)', resposta_correta: 'However', pontos: 20 },
      { titulo: 'Collocation', descricao: 'Which verb collocates with "decision"? (make/do/take)', resposta_correta: 'make', pontos: 20 },
      { titulo: 'Phrasal Verb Separable', descricao: 'Rewrite using the object pronoun: "Turn off the lights."', resposta_correta: 'Turn them off.', pontos: 20 },
      { titulo: 'Academic Vocabulary', descricao: 'What does "ubiquitous" mean?', resposta_correta: 'present everywhere', pontos: 20 },
      { titulo: 'Conditional Type 3', descricao: 'Complete: "If she had left earlier, she ___ the bus." (would have caught)', resposta_correta: 'would have caught', pontos: 20 },
      { titulo: 'Nominalisation', descricao: 'Convert to noun: "The company decided to expand."', resposta_correta: 'The company\'s decision to expand.', pontos: 20 },
      { titulo: 'Register', descricao: 'Rewrite formally: "We gotta finish this ASAP."', resposta_correta: 'We must complete this as soon as possible.', pontos: 20 },
      { titulo: 'Literary Device', descricao: 'What literary device is used in: "The wind whispered through the trees"?', resposta_correta: 'personification', pontos: 20 },
      { titulo: 'Synonym', descricao: 'Give a formal synonym for "important" in an academic context.', resposta_correta: 'significant', pontos: 20 },
    ],
  },

  programacao: {
    facil: [
      { titulo: 'Variáveis', descricao: 'Em Python, como declara uma variável chamada "nome" com valor "Ana"?', resposta_correta: 'nome = "Ana"', pontos: 10 },
      { titulo: 'Tipo de Dado', descricao: 'Qual é o tipo de dado de True em Python?', resposta_correta: 'bool', pontos: 10 },
      { titulo: 'Operador de Soma', descricao: 'Qual operador é usado para somar em Python?', resposta_correta: '+', pontos: 10 },
      { titulo: 'Print', descricao: 'Como imprimir "Olá" no ecrã em Python?', resposta_correta: 'print("Olá")', pontos: 10 },
      { titulo: 'Comentário', descricao: 'Como escrever um comentário de uma linha em Python?', resposta_correta: '# comentário', pontos: 10 },
      { titulo: 'Lista', descricao: 'Como criar uma lista vazia em Python?', resposta_correta: '[]', pontos: 10 },
      { titulo: 'Condicional If', descricao: 'Complete: ___ x > 0: print("positivo")', resposta_correta: 'if', pontos: 10 },
      { titulo: 'Loop For', descricao: 'Escreva um loop que imprime os números de 1 a 3 em Python.', resposta_correta: 'for i in range(1, 4): print(i)', pontos: 10 },
      { titulo: 'String Length', descricao: 'Como obter o comprimento da string "hello" em Python?', resposta_correta: 'len("hello")', pontos: 10 },
      { titulo: 'Índice de Lista', descricao: 'Em Python, qual é o índice do primeiro elemento de uma lista?', resposta_correta: '0', pontos: 10 },
      { titulo: 'Input', descricao: 'Como ler dados do utilizador em Python?', resposta_correta: 'input()', pontos: 10 },
      { titulo: 'Concatenação', descricao: 'Como juntar duas strings "ola" e "mundo" em Python?', resposta_correta: '"ola" + "mundo"', pontos: 10 },
      { titulo: 'Modulo', descricao: 'Qual operador dá o resto da divisão em Python?', resposta_correta: '%', pontos: 10 },
      { titulo: 'Booleano', descricao: 'Qual é o resultado de 5 > 3 em Python?', resposta_correta: 'True', pontos: 10 },
      { titulo: 'Função def', descricao: 'Escreva a assinatura de uma função chamada "saudar" em Python.', resposta_correta: 'def saudar():', pontos: 10 },
    ],
    medio: [
      { titulo: 'List Comprehension', descricao: 'Escreva uma list comprehension que retorna os quadrados de 1 a 5.', resposta_correta: '[x**2 for x in range(1, 6)]', pontos: 15 },
      { titulo: 'Dicionário', descricao: 'Como aceder ao valor da chave "nome" num dicionário chamado "pessoa"?', resposta_correta: 'pessoa["nome"]', pontos: 15 },
      { titulo: 'Funções Lambda', descricao: 'Crie uma função lambda que recebe x e retorna x * 2.', resposta_correta: 'lambda x: x * 2', pontos: 15 },
      { titulo: 'Try/Except', descricao: 'Complete o bloco para tratar a excepção ZeroDivisionError: try: x/0 ___ ZeroDivisionError: pass', resposta_correta: 'except', pontos: 15 },
      { titulo: 'Recursividade', descricao: 'Escreva em pseudocódigo a condição de paragem do factorial recursivo.', resposta_correta: 'if n == 0: return 1', pontos: 15 },
      { titulo: 'POO — Classe', descricao: 'Como criar uma classe chamada "Carro" em Python?', resposta_correta: 'class Carro:', pontos: 15 },
      { titulo: 'Herança', descricao: 'Como fazer a classe "Carro" herdar de "Veiculo" em Python?', resposta_correta: 'class Carro(Veiculo):', pontos: 15 },
      { titulo: 'Método __init__', descricao: 'Qual método é chamado ao criar uma instância em Python?', resposta_correta: '__init__', pontos: 15 },
      { titulo: 'Sort', descricao: 'Como ordenar a lista [3,1,2] em Python (sem criar nova lista)?', resposta_correta: '[3,1,2].sort()', pontos: 15 },
      { titulo: 'Map', descricao: 'Use map para dobrar cada elemento de [1,2,3] em Python.', resposta_correta: 'list(map(lambda x: x*2, [1,2,3]))', pontos: 15 },
      { titulo: 'Filter', descricao: 'Use filter para manter só os pares de [1,2,3,4].', resposta_correta: 'list(filter(lambda x: x%2==0, [1,2,3,4]))', pontos: 15 },
      { titulo: 'Complexidade', descricao: 'Qual é a complexidade temporal do algoritmo de busca linear?', resposta_correta: 'O(n)', pontos: 15 },
      { titulo: 'Binary Search', descricao: 'Qual é a complexidade do algoritmo de busca binária?', resposta_correta: 'O(log n)', pontos: 15 },
      { titulo: 'Stack', descricao: 'Qual estrutura de dados segue o princípio LIFO?', resposta_correta: 'pilha (stack)', pontos: 15 },
      { titulo: 'Queue', descricao: 'Qual estrutura de dados segue o princípio FIFO?', resposta_correta: 'fila (queue)', pontos: 15 },
    ],
    dificil: [
      { titulo: 'Algoritmo de Ordenação', descricao: 'Escreva o algoritmo Bubble Sort em Python para uma lista chamada arr.', resposta_correta: 'for i in range(len(arr)):\n  for j in range(0, len(arr)-i-1):\n    if arr[j] > arr[j+1]:\n      arr[j], arr[j+1] = arr[j+1], arr[j]', pontos: 20 },
      { titulo: 'Recursão — Fibonacci', descricao: 'Implemente a função fibonacci(n) recursivamente em Python.', resposta_correta: 'def fibonacci(n):\n  if n <= 1: return n\n  return fibonacci(n-1) + fibonacci(n-2)', pontos: 20 },
      { titulo: 'Decorator', descricao: 'O que é um decorator em Python? Dê um exemplo de uso.', resposta_correta: 'Uma função que modifica outra função. Ex: @staticmethod', pontos: 20 },
      { titulo: 'Generator', descricao: 'Qual palavra-chave é usada para criar um gerador em Python?', resposta_correta: 'yield', pontos: 20 },
      { titulo: 'Context Manager', descricao: 'Qual é a forma correcta de abrir um ficheiro com gestão de contexto?', resposta_correta: 'with open("ficheiro.txt") as f:', pontos: 20 },
      { titulo: 'Big O — Nested Loop', descricao: 'Qual é a complexidade de dois loops aninhados sobre n elementos?', resposta_correta: 'O(n²)', pontos: 20 },
      { titulo: 'SQL — SELECT', descricao: 'Escreva uma query SQL que selecciona todos os utilizadores com idade > 18.', resposta_correta: 'SELECT * FROM usuarios WHERE idade > 18;', pontos: 20 },
      { titulo: 'SQL — JOIN', descricao: 'Explique a diferença entre INNER JOIN e LEFT JOIN.', resposta_correta: 'INNER retorna apenas os registos correspondentes; LEFT retorna todos os da esquerda mesmo sem correspondência.', pontos: 20 },
      { titulo: 'REST API', descricao: 'Qual método HTTP é utilizado para criar um novo recurso numa API REST?', resposta_correta: 'POST', pontos: 20 },
      { titulo: 'Padrão MVC', descricao: 'O que significa MVC no desenvolvimento de software?', resposta_correta: 'Model-View-Controller', pontos: 20 },
      { titulo: 'Git — Commit', descricao: 'Qual comando Git guarda as alterações locais com uma mensagem?', resposta_correta: 'git commit -m "mensagem"', pontos: 20 },
      { titulo: 'Hash Table', descricao: 'Qual é a complexidade média de busca numa tabela hash?', resposta_correta: 'O(1)', pontos: 20 },
      { titulo: 'Design Pattern', descricao: 'O que é o padrão Singleton?', resposta_correta: 'Garante que uma classe tem apenas uma instância global', pontos: 20 },
      { titulo: 'Async/Await', descricao: 'Para que serve async/await em JavaScript?', resposta_correta: 'Para tratar código assíncrono de forma síncrona/legível', pontos: 20 },
      { titulo: 'Árvore Binária', descricao: 'Num percurso in-order de uma árvore binária de pesquisa, em que ordem os nós são visitados?', resposta_correta: 'esquerda, raiz, direita (ordem crescente)', pontos: 20 },
    ],
  },
};

// ─── QUESTÕES DE TESTE — múltipla escolha ───────────────────────────────────
const questoesTeste = {
  matematica: {
    facil: [
      { enunciado: 'Quanto é 25 + 37?', opcoes: ['52','62','72','82'], resposta_correta: '62' },
      { enunciado: 'Quanto é 80 − 45?', opcoes: ['25','35','45','55'], resposta_correta: '35' },
      { enunciado: 'Quanto é 6 × 9?', opcoes: ['48','54','56','63'], resposta_correta: '54' },
      { enunciado: 'Quanto é 72 ÷ 8?', opcoes: ['7','8','9','10'], resposta_correta: '9' },
      { enunciado: 'Qual é o dobro de 17?', opcoes: ['24','30','34','38'], resposta_correta: '34' },
      { enunciado: 'Qual é a metade de 56?', opcoes: ['24','28','32','36'], resposta_correta: '28' },
      { enunciado: '10% de 150 é igual a?', opcoes: ['10','12','15','20'], resposta_correta: '15' },
      { enunciado: 'Quanto é 4²?', opcoes: ['8','12','16','20'], resposta_correta: '16' },
      { enunciado: 'Qual é a raiz quadrada de 64?', opcoes: ['6','7','8','9'], resposta_correta: '8' },
      { enunciado: 'Na sequência 3, 6, 12, 24... qual é o próximo?', opcoes: ['36','42','48','36'], resposta_correta: '48' },
      { enunciado: 'Quantos pares existem entre 1 e 10?', opcoes: ['3','4','5','6'], resposta_correta: '5' },
      { enunciado: 'Qual é o valor de 1/2 + 1/2?', opcoes: ['1/4','1/2','1','2'], resposta_correta: '1' },
      { enunciado: 'Qual é o MDC de 8 e 12?', opcoes: ['2','4','6','8'], resposta_correta: '4' },
      { enunciado: 'Qual é o MMC de 3 e 4?', opcoes: ['6','8','12','24'], resposta_correta: '12' },
      { enunciado: 'Se 2 canetas custam 4 Kz, quanto custam 5?', opcoes: ['8','10','12','14'], resposta_correta: '10' },
    ],
    medio: [
      { enunciado: 'Resolva: 3x − 4 = 11. Qual é x?', opcoes: ['3','4','5','6'], resposta_correta: '5' },
      { enunciado: 'Qual é a área de um rectângulo 7×4?', opcoes: ['22','24','28','32'], resposta_correta: '28' },
      { enunciado: 'Qual é a média de 5, 8, 6, 9, 7?', opcoes: ['6','7','8','9'], resposta_correta: '7' },
      { enunciado: 'Na PA (2,5,8...) qual é o 8º termo?', opcoes: ['21','23','23','23'], resposta_correta: '23' },
      { enunciado: 'Um produto custa 100 Kz com 20% de desconto. Qual o preço final?', opcoes: ['70','75','80','85'], resposta_correta: '80' },
      { enunciado: 'Qual é 5²?', opcoes: ['15','20','25','30'], resposta_correta: '25' },
      { enunciado: 'log₁₀(100) = ?', opcoes: ['1','2','10','100'], resposta_correta: '2' },
      { enunciado: 'Qual é o suplemento de 45°?', opcoes: ['45°','90°','135°','180°'], resposta_correta: '135°' },
      { enunciado: 'Volume de um cubo de aresta 2 cm?', opcoes: ['4','6','8','12'], resposta_correta: '8' },
      { enunciado: 'Probabilidade de tirar cara numa moeda justa?', opcoes: ['1/4','1/3','1/2','2/3'], resposta_correta: '1/2' },
      { enunciado: 'Simplifica: 4x² ÷ 2x', opcoes: ['2x','2x²','4x','x'], resposta_correta: '2x' },
      { enunciado: 'Se A:B = 3:5 e B=20, qual é A?', opcoes: ['10','12','15','18'], resposta_correta: '12' },
      { enunciado: 'Qual é o perímetro de um quadrado de lado 6?', opcoes: ['18','24','30','36'], resposta_correta: '24' },
      { enunciado: 'Quanto é 2³ × 2²?', opcoes: ['16','32','64','128'], resposta_correta: '32' },
      { enunciado: 'Quantas combinações tem C(5,2)?', opcoes: ['5','8','10','15'], resposta_correta: '10' },
    ],
    dificil: [
      { enunciado: 'As raízes de x² − 5x + 6 = 0 são?', opcoes: ['1 e 6','2 e 3','−2 e −3','−1 e 6'], resposta_correta: '2 e 3' },
      { enunciado: 'Qual é o valor de sen(30°)?', opcoes: ['√2/2','√3/2','1/2','1'], resposta_correta: '1/2' },
      { enunciado: 'Lim(x→0) sen(x)/x = ?', opcoes: ['0','1/2','1','∞'], resposta_correta: '1' },
      { enunciado: 'A derivada de f(x) = x³ é?', opcoes: ['x²','2x²','3x²','3x'], resposta_correta: '3x²' },
      { enunciado: '∫ 3x² dx = ?', opcoes: ['x³','x³ + C','3x + C','6x'], resposta_correta: 'x³ + C' },
      { enunciado: '(2 + 3i) + (1 − i) = ?', opcoes: ['3 + 2i','3 + 4i','1 + 2i','2 + 2i'], resposta_correta: '3 + 2i' },
      { enunciado: 'Det[[2,1],[3,4]] = ?', opcoes: ['5','6','8','11'], resposta_correta: '5' },
      { enunciado: 'Soma dos 10 primeiros naturais pares?', opcoes: ['90','100','110','120'], resposta_correta: '110' },
      { enunciado: 'Na PG (1,3,9...) qual é o 5º termo?', opcoes: ['27','81','243','729'], resposta_correta: '81' },
      { enunciado: 'Coeficiente de x³ em (x+1)⁴?', opcoes: ['2','4','6','8'], resposta_correta: '4' },
      { enunciado: 'ln(e³) = ?', opcoes: ['1','2','3','e'], resposta_correta: '3' },
      { enunciado: '2^x = 64. Qual é x?', opcoes: ['4','5','6','7'], resposta_correta: '6' },
      { enunciado: 'C(7,3) = ?', opcoes: ['21','28','35','42'], resposta_correta: '35' },
      { enunciado: 'cos(0°) = ?', opcoes: ['0','1/2','√2/2','1'], resposta_correta: '1' },
      { enunciado: 'A soma de um PG infinita com a=1, r=1/2 é?', opcoes: ['1','1.5','2','∞'], resposta_correta: '2' },
    ],
  },

  ingles: {
    facil: [
      { enunciado: '"She ___ a doctor." — Which verb completes correctly?', opcoes: ['am','is','are','be'], resposta_correta: 'is' },
      { enunciado: 'What is the plural of "box"?', opcoes: ['boxs','boxes','boxies','boxen'], resposta_correta: 'boxes' },
      { enunciado: 'Which article goes before "university"?', opcoes: ['a','an','the','—'], resposta_correta: 'a' },
      { enunciado: 'How do you say "segunda-feira" in English?', opcoes: ['Sunday','Monday','Tuesday','Wednesday'], resposta_correta: 'Monday' },
      { enunciado: 'What color is grass?', opcoes: ['blue','red','green','yellow'], resposta_correta: 'green' },
      { enunciado: 'Which word means "feliz"?', opcoes: ['sad','angry','happy','tired'], resposta_correta: 'happy' },
      { enunciado: '"I ___ two sisters." (have/has)', opcoes: ['has','have','is','are'], resposta_correta: 'have' },
      { enunciado: 'What is the opposite of "big"?', opcoes: ['tall','small','long','wide'], resposta_correta: 'small' },
      { enunciado: 'The book is ___ the shelf. (preposition)', opcoes: ['in','on','at','of'], resposta_correta: 'on' },
      { enunciado: 'What month comes after April?', opcoes: ['March','June','May','July'], resposta_correta: 'May' },
      { enunciado: 'How do you say "obrigado" in English?', opcoes: ['Sorry','Please','Thank you','Excuse me'], resposta_correta: 'Thank you' },
      { enunciado: 'Past tense of "walk"?', opcoes: ['walked','walks','walking','will walk'], resposta_correta: 'walked' },
      { enunciado: 'Which is a number? Fifteen / Fifty / Fiveteen / Fiffteen', opcoes: ['Fiveteen','Fifteen','Fiffteen','Fiften'], resposta_correta: 'Fifteen' },
      { enunciado: '"Where ___ you from?" — Which verb?', opcoes: ['is','am','are','be'], resposta_correta: 'are' },
      { enunciado: 'What is the English word for "escola"?', opcoes: ['hospital','school','church','office'], resposta_correta: 'school' },
    ],
    medio: [
      { enunciado: 'Past tense of "go"?', opcoes: ['goed','gone','went','goes'], resposta_correta: 'went' },
      { enunciado: '"She has ___ to Paris before." (present perfect)', opcoes: ['go','went','gone','going'], resposta_correta: 'gone' },
      { enunciado: '"If it rains, we ___ stay home." (conditional 1)', opcoes: ['would','will','might have','had'], resposta_correta: 'will' },
      { enunciado: 'Passive: "They built the bridge." becomes?', opcoes: ['The bridge was built.','The bridge is built.','The bridge builds.','The bridge had built.'], resposta_correta: 'The bridge was built.' },
      { enunciado: 'Comparative of "good"?', opcoes: ['gooder','goodest','better','best'], resposta_correta: 'better' },
      { enunciado: 'What does "give up" mean?', opcoes: ['começar','desistir','crescer','partilhar'], resposta_correta: 'desistir' },
      { enunciado: '"You are coming, ___?" (tag question)', opcoes: ["aren't you","isn't it","don't you","are you"], resposta_correta: "aren't you" },
      { enunciado: '"She enjoys ___ (swim)."', opcoes: ['swim','to swim','swimming','swam'], resposta_correta: 'swimming' },
      { enunciado: 'Which is the correct spelling?', opcoes: ['accomodation','accommodation','acomodation','acommodation'], resposta_correta: 'accommodation' },
      { enunciado: '"The man ___ lives here is a doctor." (relative)', opcoes: ['which','who','whose','where'], resposta_correta: 'who' },
      { enunciado: 'Superlative of "bad"?', opcoes: ['baddest','worst','most bad','badder'], resposta_correta: 'worst' },
      { enunciado: 'Modal for obligation: "You ___ wear a seatbelt."', opcoes: ['might','could','must','should'], resposta_correta: 'must' },
      { enunciado: 'He said "I am tired." → He said that ___', opcoes: ['he is tired','he was tired','he were tired','he had tired'], resposta_correta: 'he was tired' },
      { enunciado: '"I was born ___ 1995." (preposition)', opcoes: ['on','at','in','by'], resposta_correta: 'in' },
      { enunciado: 'Formal synonym of "get"?', opcoes: ['grab','obtain','snatch','fetch'], resposta_correta: 'obtain' },
    ],
    dificil: [
      { enunciado: '"I suggest that he ___ harder." (subjunctive)', opcoes: ['studies','study','studied','has studied'], resposta_correta: 'study' },
      { enunciado: 'Which sentence uses inversion correctly?', opcoes: ['Never I have seen this.','Never have I seen this.','I have never seen this.','Have I never seen this.'], resposta_correta: 'Never have I seen this.' },
      { enunciado: '"If I had studied, I ___ pass now." (mixed cond.)', opcoes: ['would','would have','had','might have'], resposta_correta: 'would' },
      { enunciado: 'What does "ubiquitous" mean?', opcoes: ['rare','present everywhere','unique','old-fashioned'], resposta_correta: 'present everywhere' },
      { enunciado: '"Beat around the bush" means?', opcoes: ['to work hard','to avoid the main topic','to celebrate','to fight'], resposta_correta: 'to avoid the main topic' },
      { enunciado: 'Which verb collocates with "decision"?', opcoes: ['do','take','make','have'], resposta_correta: 'make' },
      { enunciado: 'What literary device is in "The wind whispered"?', opcoes: ['metaphor','simile','personification','alliteration'], resposta_correta: 'personification' },
      { enunciado: '"Turn off the lights." → with pronoun?', opcoes: ['Turn off them.','Turn them off.','Off turn them.','Them turn off.'], resposta_correta: 'Turn them off.' },
      { enunciado: 'Discourse marker for contrast?', opcoes: ['Furthermore','Therefore','However','Moreover'], resposta_correta: 'However' },
      { enunciado: 'Formal version of "I want to know"?', opcoes: ['I need to find out','I would like to inquire','I must ask','I gotta know'], resposta_correta: 'I would like to inquire' },
      { enunciado: 'Conditional type 3: "If she had left earlier, she ___ the bus."', opcoes: ['would catch','will catch','would have caught','had caught'], resposta_correta: 'would have caught' },
      { enunciado: 'Nominalisation of "decide"?', opcoes: ['decidation','decider','decision','deciding'], resposta_correta: 'decision' },
      { enunciado: 'Formal synonym for "important"?', opcoes: ['big','significant','nice','useful'], resposta_correta: 'significant' },
      { enunciado: 'Which word is an adverb?', opcoes: ['quick','quickly','quickness','quicken'], resposta_correta: 'quickly' },
      { enunciado: 'Cleft sentence: "She broke it." → "It was ___ who broke it."', opcoes: ['her','she','hers','herself'], resposta_correta: 'she' },
    ],
  },

  programacao: {
    facil: [
      { enunciado: 'Qual palavra-chave declara uma variável em Python?', opcoes: ['var','let','const','Nenhuma — sem keyword'], resposta_correta: 'Nenhuma — sem keyword' },
      { enunciado: 'Qual é o tipo de True em Python?', opcoes: ['int','str','bool','float'], resposta_correta: 'bool' },
      { enunciado: 'Como imprimir "Olá" em Python?', opcoes: ['echo("Olá")','console.log("Olá")','print("Olá")','write("Olá")'], resposta_correta: 'print("Olá")' },
      { enunciado: 'Qual operador retorna o resto da divisão?', opcoes: ['//','**','%','/'], resposta_correta: '%' },
      { enunciado: 'Índice do primeiro elemento numa lista Python?', opcoes: ['-1','0','1','2'], resposta_correta: '0' },
      { enunciado: 'Como criar uma lista vazia em Python?', opcoes: ['{}','()','[]','<>'], resposta_correta: '[]' },
      { enunciado: 'Palavra-chave para definir função em Python?', opcoes: ['function','func','def','fn'], resposta_correta: 'def' },
      { enunciado: 'Qual é o resultado de 5 > 3 em Python?', opcoes: ['5','3','True','False'], resposta_correta: 'True' },
      { enunciado: 'Como ler input do utilizador em Python?', opcoes: ['read()','input()','scan()','cin()'], resposta_correta: 'input()' },
      { enunciado: 'Comprimento da string "hello"?', opcoes: ['len("hello")','size("hello")','count("hello")','length("hello")'], resposta_correta: 'len("hello")' },
      { enunciado: 'Comentário de linha em Python começa com?', opcoes: ['//','/*','#','--'], resposta_correta: '#' },
      { enunciado: 'Resultado de 2 + "3" em Python?', opcoes: ['5','"23"','Erro','23'], resposta_correta: 'Erro' },
      { enunciado: 'Operador de potenciação em Python?', opcoes: ['^','**','pow','exp'], resposta_correta: '**' },
      { enunciado: 'Qual comando inicia uma condição em Python?', opcoes: ['if','when','case','check'], resposta_correta: 'if' },
      { enunciado: 'Qual é o valor de not True em Python?', opcoes: ['True','False','0','None'], resposta_correta: 'False' },
    ],
    medio: [
      { enunciado: '[x**2 for x in range(3)] retorna?', opcoes: ['[1,2,3]','[0,1,4]','[0,1,2]','[1,4,9]'], resposta_correta: '[0,1,4]' },
      { enunciado: 'Como aceder ao valor da chave "nome" em {"nome":"Ana"}?', opcoes: ['d.nome','d["nome"]','d->nome','d{nome}'], resposta_correta: 'd["nome"]' },
      { enunciado: 'Qual é a complexidade de busca linear?', opcoes: ['O(1)','O(log n)','O(n)','O(n²)'], resposta_correta: 'O(n)' },
      { enunciado: 'Qual estrutura de dados é LIFO?', opcoes: ['fila','pilha','lista','árvore'], resposta_correta: 'pilha' },
      { enunciado: 'Qual é a complexidade de busca binária?', opcoes: ['O(1)','O(log n)','O(n)','O(n²)'], resposta_correta: 'O(log n)' },
      { enunciado: 'lambda x: x*2 — o que retorna para x=5?', opcoes: ['2','5','10','25'], resposta_correta: '10' },
      { enunciado: 'Qual keyword cria um gerador em Python?', opcoes: ['return','yield','generate','async'], resposta_correta: 'yield' },
      { enunciado: 'filter(lambda x: x>2, [1,2,3,4]) retorna?', opcoes: ['[1,2]','[3,4]','[2,3,4]','[1,2,3]'], resposta_correta: '[3,4]' },
      { enunciado: 'Como herdar de "Animal" em Python?', opcoes: ['class Cão extends Animal','class Cão(Animal):','class Cão inherits Animal','class Animal.Cão:'], resposta_correta: 'class Cão(Animal):' },
      { enunciado: 'Método chamado ao instanciar uma classe Python?', opcoes: ['__create__','__new__','__init__','__start__'], resposta_correta: '__init__' },
      { enunciado: 'map(lambda x: x+1, [1,2,3]) retorna?', opcoes: ['[1,2,3]','[2,3,4]','[0,1,2]','[3,4,5]'], resposta_correta: '[2,3,4]' },
      { enunciado: 'Qual bloco trata excepções em Python?', opcoes: ['catch','except','handle','error'], resposta_correta: 'except' },
      { enunciado: 'Ordenar lista [3,1,2] in-place em Python?', opcoes: ['sort([3,1,2])','[3,1,2].sort()','sorted([3,1,2])','order([3,1,2])'], resposta_correta: '[3,1,2].sort()' },
      { enunciado: 'Qual é a estrutura FIFO?', opcoes: ['pilha','árvore','fila','grafo'], resposta_correta: 'fila' },
      { enunciado: 'Complexidade de dois loops aninhados em n?', opcoes: ['O(n)','O(n log n)','O(n²)','O(2n)'], resposta_correta: 'O(n²)' },
    ],
    dificil: [
      { enunciado: 'Qual é a complexidade média de busca numa hash table?', opcoes: ['O(n)','O(log n)','O(1)','O(n²)'], resposta_correta: 'O(1)' },
      { enunciado: 'Método HTTP para criar recurso numa API REST?', opcoes: ['GET','PUT','POST','PATCH'], resposta_correta: 'POST' },
      { enunciado: 'MVC significa?', opcoes: ['Model-View-Controller','Main-View-Component','Module-View-Class','Model-Visual-Code'], resposta_correta: 'Model-View-Controller' },
      { enunciado: 'Padrão que garante uma única instância global?', opcoes: ['Factory','Observer','Singleton','Strategy'], resposta_correta: 'Singleton' },
      { enunciado: 'Palavra-chave para abrir ficheiro com context manager?', opcoes: ['open','with','use','context'], resposta_correta: 'with' },
      { enunciado: 'Percurso in-order numa BST visita nós em que ordem?', opcoes: ['raiz, esq, dir','dir, raiz, esq','esq, raiz, dir','esq, dir, raiz'], resposta_correta: 'esq, raiz, dir' },
      { enunciado: 'SQL — qual comando selecciona registos únicos?', opcoes: ['SELECT ALL','SELECT UNIQUE','SELECT DISTINCT','SELECT ONLY'], resposta_correta: 'SELECT DISTINCT' },
      { enunciado: 'Diferença entre INNER JOIN e LEFT JOIN?', opcoes: ['Não há diferença','LEFT retorna todos da esq. mesmo sem match','INNER retorna mais registos','LEFT é mais rápido'], resposta_correta: 'LEFT retorna todos da esq. mesmo sem match' },
      { enunciado: 'O que é async/await em JavaScript?', opcoes: ['Um tipo de variável','Uma biblioteca','Sintaxe para tratar código assíncrono','Um framework'], resposta_correta: 'Sintaxe para tratar código assíncrono' },
      { enunciado: 'fibonacci(5) recursivo retorna?', opcoes: ['3','4','5','8'], resposta_correta: '5' },
      { enunciado: 'Git — como fazer commit com mensagem?', opcoes: ['git save -m','git commit -m','git push -m','git add -m'], resposta_correta: 'git commit -m' },
      { enunciado: 'Decorator em Python serve para?', opcoes: ['Declarar variáveis','Modificar comportamento de funções','Criar classes','Tratar erros'], resposta_correta: 'Modificar comportamento de funções' },
      { enunciado: 'Bubble Sort tem complexidade?', opcoes: ['O(n)','O(n log n)','O(n²)','O(log n)'], resposta_correta: 'O(n²)' },
      { enunciado: 'O que é normalização em BD?', opcoes: ['Aumentar dados duplicados','Eliminar redundâncias e anomalias','Encriptar dados','Criar índices'], resposta_correta: 'Eliminar redundâncias e anomalias' },
      { enunciado: 'Qual princípio SOLID diz que uma classe deve ter uma única responsabilidade?', opcoes: ['Open/Closed','Liskov','Single Responsibility','Dependency Inversion'], resposta_correta: 'Single Responsibility' },
    ],
  },
};

// ─── Função principal ────────────────────────────────────────────────────────
async function main() {
  await sequelize.authenticate();
  console.log('\n🚀 SEED DE BLOCOS E QUESTÕES — COMAES 3.2\n');

  const disciplinas = ['matematica', 'ingles', 'programacao'];
  const niveis     = ['facil', 'medio', 'dificil'];

  // ── 1. TORNEIO — questões abertas no modelo Questao ─────────────────────
  console.log('═══════════════════════════════════════');
  console.log('  FASE 1 — TORNEIO (respostas abertas)');
  console.log('═══════════════════════════════════════\n');

  for (const disc of disciplinas) {
    for (const nivel of niveis) {
      const tituloBloco = `[TORNEIO] ${disc.charAt(0).toUpperCase() + disc.slice(1)} — ${nivel.charAt(0).toUpperCase() + nivel.slice(1)}`;
      const bloco = await criarBlocoSeNaoExistir({
        titulo: tituloBloco,
        disciplina: disc,
        dificuldade: nivel,
        contexto: 'torneio',
        descricao: `Bloco de torneio — ${disc} — nível ${nivel}`,
      });

      const questoesDoBloco = questoesTorneio[disc][nivel];
      let adicionadas = 0;

      for (const [i, q] of questoesDoBloco.entries()) {
        // Verificar se já existe questão com esse título neste bloco
        const existente = await Questao.findOne({ where: { bloco_id: bloco.id, titulo: q.titulo } });
        if (existente) { log(`  Já existe: "${q.titulo}"`); continue; }

        await Questao.create({
          bloco_id: bloco.id,
          titulo: q.titulo,
          descricao: q.descricao,
          disciplina: disc,
          tipo: 'texto',
          dificuldade: nivel,
          opcoes: null,
          resposta_correta: q.resposta_correta,
          pontos: q.pontos,
          status_aprovacao: 'aprovada',
          contexto: 'torneio',
        });
        adicionadas++;
      }
      ok(`${tituloBloco} — ${adicionadas} questões adicionadas`);
    }
  }

  // ── 2. TESTE — múltipla escolha no QuestaoTesteConhecimento ─────────────
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  FASE 2 — TESTE (múltipla escolha)');
  console.log('═══════════════════════════════════════════════════\n');

  for (const disc of disciplinas) {
    for (const nivel of niveis) {
      const tituloBloco = `[TESTE] ${disc.charAt(0).toUpperCase() + disc.slice(1)} — ${nivel.charAt(0).toUpperCase() + nivel.slice(1)}`;
      const bloco = await criarBlocoSeNaoExistir({
        titulo: tituloBloco,
        disciplina: disc,
        dificuldade: nivel,
        contexto: 'teste',
        descricao: `Bloco de teste — ${disc} — nível ${nivel}`,
      });

      const questoesDoBloco = questoesTeste[disc][nivel];
      let adicionadas = 0;

      for (const [i, q] of questoesDoBloco.entries()) {
        // Verificar se já existe questão com esse enunciado
        const existente = await QuestaoTesteConhecimento.findOne({ where: { enunciado: q.enunciado } });
        if (existente) {
          // Garantir que está associada a este bloco
          const itemExiste = await BlocoQuestaoItem.findOne({ where: { bloco_id: bloco.id, questao_id: existente.id } });
          if (!itemExiste) await BlocoQuestaoItem.create({ bloco_id: bloco.id, questao_id: existente.id, ordem: i + 1 });
          log(`  Já existe: "${q.enunciado.substring(0, 40)}..."`);
          continue;
        }

        const pontos = nivel === 'facil' ? 10 : nivel === 'medio' ? 15 : 20;
        const criada = await QuestaoTesteConhecimento.create({
          enunciado: q.enunciado,
          opcoes: JSON.stringify(q.opcoes),
          resposta_correta: q.resposta_correta,
          dificuldade: nivel,
          categoria: disc,
          pontos,
          ativo: true,
        });
        await BlocoQuestaoItem.create({ bloco_id: bloco.id, questao_id: criada.id, ordem: i + 1 });
        adicionadas++;
      }
      ok(`${tituloBloco} — ${adicionadas} questões adicionadas`);
    }
  }

  // ── Sumário ──────────────────────────────────────────────────────────────
  const totalBlocos   = await BlocoQuestoes.count();
  const totalTorneio  = await Questao.count({ where: { contexto: 'torneio' } });
  const totalTeste    = await QuestaoTesteConhecimento.count();
  const totalItems    = await BlocoQuestaoItem.count();

  console.log('\n═══════════════════════════════════');
  console.log('  SUMÁRIO FINAL');
  console.log('═══════════════════════════════════');
  console.log(`  Blocos criados/existentes : ${totalBlocos}`);
  console.log(`  Questões de Torneio       : ${totalTorneio}`);
  console.log(`  Questões de Teste         : ${totalTeste}`);
  console.log(`  Associações (BlocoItems)  : ${totalItems}`);
  console.log('\n✅ Seed concluído com sucesso!\n');

  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Erro durante o seed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
