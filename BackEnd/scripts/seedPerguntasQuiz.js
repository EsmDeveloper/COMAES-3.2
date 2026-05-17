import sequelize from '../config/db.js';
import Pergunta from '../models/Pergunta.js';

const perguntas = [
  // === MATEMÁTICA - 20 Questões (7 fácil, 7 médio, 6 difícil) ===
  // Fácil (7)
  {
    ordem_indice: 1, tipo: 'matematica',
    texto_pergunta: 'Quanto é 15 + 27?',
    opcao_a: '40', opcao_b: '42', opcao_c: '44', opcao_d: '46',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 2, tipo: 'matematica',
    texto_pergunta: 'Quanto é 85 - 38?',
    opcao_a: '45', opcao_b: '47', opcao_c: '43', opcao_d: '49',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 3, tipo: 'matematica',
    texto_pergunta: 'Quanto é 12 × 8?',
    opcao_a: '96', opcao_b: '86', opcao_c: '98', opcao_d: '88',
    resposta_correta: 'a', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 4, tipo: 'matematica',
    texto_pergunta: 'Quanto é 144 ÷ 12?',
    opcao_a: '10', opcao_b: '11', opcao_c: '12', opcao_d: '14',
    resposta_correta: 'c', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 5, tipo: 'matematica',
    texto_pergunta: 'Qual é o resultado de 3²?',
    opcao_a: '6', opcao_b: '9', opcao_c: '12', opcao_d: '5',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 6, tipo: 'matematica',
    texto_pergunta: 'Quanto é 100 - 67?',
    opcao_a: '33', opcao_b: '32', opcao_c: '31', opcao_d: '34',
    resposta_correta: 'a', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 7, tipo: 'matematica',
    texto_pergunta: 'Qual é a raiz quadrada de 81?',
    opcao_a: '7', opcao_b: '8', opcao_c: '9', opcao_d: '10',
    resposta_correta: 'c', dificuldade: 'facil', pontos: 1
  },
  // Médio (7)
  {
    ordem_indice: 8, tipo: 'matematica',
    texto_pergunta: 'Resolva: 3x + 7 = 22',
    opcao_a: 'x = 3', opcao_b: 'x = 5', opcao_c: 'x = 7', opcao_d: 'x = 4',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 9, tipo: 'matematica',
    texto_pergunta: 'Quanto é 15% de 200?',
    opcao_a: '25', opcao_b: '30', opcao_c: '35', opcao_d: '40',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 10, tipo: 'matematica',
    texto_pergunta: 'Quanto é 2⁴?',
    opcao_a: '8', opcao_b: '16', opcao_c: '32', opcao_d: '64',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 11, tipo: 'matematica',
    texto_pergunta: 'Se um triângulo tem base 10cm e altura 8cm, qual é sua área?',
    opcao_a: '40 cm²', opcao_b: '80 cm²', opcao_c: '18 cm²', opcao_d: '36 cm²',
    resposta_correta: 'a', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 12, tipo: 'matematica',
    texto_pergunta: 'Qual é o valor de x na proporção x/5 = 20/25?',
    opcao_a: '2', opcao_b: '3', opcao_c: '4', opcao_d: '5',
    resposta_correta: 'c', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 13, tipo: 'matematica',
    texto_pergunta: 'Quanto é 45 minutos em horas?',
    opcao_a: '0,75 h', opcao_b: '0,5 h', opcao_c: '0,45 h', opcao_d: '1,25 h',
    resposta_correta: 'a', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 14, tipo: 'matematica',
    texto_pergunta: 'Qual é o próximo número: 2, 6, 12, 20, ?',
    opcao_a: '28', opcao_b: '30', opcao_c: '32', opcao_d: '26',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  // Difícil (6)
  {
    ordem_indice: 15, tipo: 'matematica',
    texto_pergunta: 'Resolva: x² - 9 = 0',
    opcao_a: 'x = ±3', opcao_b: 'x = ±9', opcao_c: 'x = ±1', opcao_d: 'x = ±6',
    resposta_correta: 'a', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 16, tipo: 'matematica',
    texto_pergunta: 'Calcule log₃(27)',
    opcao_a: '1', opcao_b: '2', opcao_c: '3', opcao_d: '4',
    resposta_correta: 'c', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 17, tipo: 'matematica',
    texto_pergunta: 'Qual é a derivada de f(x) = 5x³?',
    opcao_a: '15x²', opcao_b: '5x³', opcao_c: '15x³', opcao_d: '5x²',
    resposta_correta: 'a', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 18, tipo: 'matematica',
    texto_pergunta: 'Em um círculo com raio 7cm, qual é a área? (use π = 3,14)',
    opcao_a: '153,86 cm²', opcao_b: '43,96 cm²', opcao_c: '21,98 cm²', opcao_d: '307,72 cm²',
    resposta_correta: 'a', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 19, tipo: 'matematica',
    texto_pergunta: 'Simplifique: (x² - 4)/(x - 2)',
    opcao_a: 'x - 2', opcao_b: 'x + 2', opcao_c: 'x²', opcao_d: 'x',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 20, tipo: 'matematica',
    texto_pergunta: 'Qual é o valor de sen(90°)?',
    opcao_a: '0', opcao_b: '1', opcao_c: '-1', opcao_d: '0,5',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },

  // === INGLÊS - 20 Questões (7 fácil, 7 médio, 6 difícil) ===
  // Fácil (7)
  {
    ordem_indice: 21, tipo: 'ingles',
    texto_pergunta: 'Which word means "casa" in English?',
    opcao_a: 'House', opcao_b: 'Mouse', opcao_c: 'Car', opcao_d: 'Tree',
    resposta_correta: 'a', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 22, tipo: 'ingles',
    texto_pergunta: 'Complete: "She ___ a teacher."',
    opcao_a: 'is', opcao_b: 'are', opcao_c: 'am', opcao_d: 'be',
    resposta_correta: 'a', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 23, tipo: 'ingles',
    texto_pergunta: 'What is the plural of "child"?',
    opcao_a: 'Childs', opcao_b: 'Children', opcao_c: 'Childrens', opcao_d: 'Childern',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 24, tipo: 'ingles',
    texto_pergunta: 'Which is a fruit?',
    opcao_a: 'Apple', opcao_b: 'Table', opcao_c: 'Chair', opcao_d: 'Door',
    resposta_correta: 'a', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 25, tipo: 'ingles',
    texto_pergunta: 'How do you spell "gato" in English?',
    opcao_a: 'Dog', opcao_b: 'Cat', opcao_c: 'Bird', opcao_d: 'Fish',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 26, tipo: 'ingles',
    texto_pergunta: 'Complete: "I ___ happy."',
    opcao_a: 'am', opcao_b: 'is', opcao_c: 'are', opcao_d: 'be',
    resposta_correta: 'a', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 27, tipo: 'ingles',
    texto_pergunta: 'What color is the sun?',
    opcao_a: 'Blue', opcao_b: 'Green', opcao_c: 'Yellow', opcao_d: 'Red',
    resposta_correta: 'c', dificuldade: 'facil', pontos: 1
  },
  // Médio (7)
  {
    ordem_indice: 28, tipo: 'ingles',
    texto_pergunta: 'Choose the correct form: "If I ___ rich, I would travel."',
    opcao_a: 'am', opcao_b: 'was', opcao_c: 'were', opcao_d: 'be',
    resposta_correta: 'c', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 29, tipo: 'ingles',
    texto_pergunta: 'What does "put off" mean?',
    opcao_a: 'To wear', opcao_b: 'To postpone', opcao_c: 'To put on', opcao_d: 'To give up',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 30, tipo: 'ingles',
    texto_pergunta: 'Complete: "She ___ to the store yesterday."',
    opcao_a: 'go', opcao_b: 'goes', opcao_c: 'went', opcao_d: 'going',
    resposta_correta: 'c', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 31, tipo: 'ingles',
    texto_pergunta: 'Which sentence is correct?',
    opcao_a: 'He dont like coffee', opcao_b: 'He doesnt like coffee', opcao_c: 'He not like coffee', opcao_d: 'He no like coffee',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 32, tipo: 'ingles',
    texto_pergunta: 'What is the opposite of "ancient"?',
    opcao_a: 'Old', opcao_b: 'New', opcao_c: 'Young', opcao_d: 'Modern',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 33, tipo: 'ingles',
    texto_pergunta: 'Choose the correct passive: "They build a house."',
    opcao_a: 'A house is built', opcao_b: 'A house are built', opcao_c: 'A house was building', opcao_d: 'A house build',
    resposta_correta: 'a', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 34, tipo: 'ingles',
    texto_pergunta: 'What time is "2:30 PM"?',
    opcao_a: 'Half past two', opcao_b: 'Two thirty', opcao_c: 'Both A and B', opcao_d: 'Two oclock',
    resposta_correta: 'c', dificuldade: 'medio', pontos: 1
  },
  // Difícil (6)
  {
    ordem_indice: 35, tipo: 'ingles',
    texto_pergunta: 'Choose: "It is essential that he ___ on time."',
    opcao_a: 'is', opcao_b: 'be', opcao_c: 'was', opcao_d: 'are',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 36, tipo: 'ingles',
    texto_pergunta: 'What does "break the ice" mean?',
    opcao_a: 'Break something', opcao_b: 'Start a conversation', opcao_c: 'Make peace', opcao_d: 'Stop talking',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 37, tipo: 'ingles',
    texto_pergunta: 'Complete: "By the time I ___ arrived, the movie ___ started."',
    opcao_a: 'have / had', opcao_b: 'had / had', opcao_c: 'had / has', opcao_d: 'was / had',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 38, tipo: 'ingles',
    texto_pergunta: 'Which word means "to make something less severe"?',
    opcao_a: 'Aggravate', opcao_b: 'Mitigate', opcao_c: 'Escalate', opcao_d: 'Intensify',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 39, tipo: 'ingles',
    texto_pergunta: 'Choose the correct modal: "You ___ be at least 18 to vote."',
    opcao_a: 'can', opcao_b: 'may', opcao_c: 'must', opcao_d: 'would',
    resposta_correta: 'c', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 40, tipo: 'ingles',
    texto_pergunta: 'What is the meaning of "once in a blue moon"?',
    opcao_a: 'Every day', opcao_b: 'Very rarely', opcao_c: 'Always', opcao_d: 'Never',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },

  // === PROGRAMAÇÃO - 20 Questões (7 fácil, 7 médio, 6 difícil) ===
  // Fácil (7)
  {
    ordem_indice: 41, tipo: 'programacao',
    texto_pergunta: 'Qual é a saída: console.log(2 + "2")?',
    opcao_a: '4', opcao_b: '22', opcao_c: 'NaN', opcao_d: 'Erro',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 42, tipo: 'programacao',
    texto_pergunta: 'Qual palavra-chave define uma variável constante em JavaScript?',
    opcao_a: 'var', opcao_b: 'let', opcao_c: 'const', opcao_d: 'static',
    resposta_correta: 'c', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 43, tipo: 'programacao',
    texto_pergunta: 'Qual tag HTML é usada para criar um link?',
    opcao_a: '<link>', opcao_b: '<a>', opcao_c: '<href>', opcao_d: '<url>',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 44, tipo: 'programacao',
    texto_pergunta: 'O que faz o comando "console.log()"?',
    opcao_a: 'Imprime na tela', opcao_b: 'Mostra no console', opcao_c: 'Salva em arquivo', opcao_d: 'Envia email',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 45, tipo: 'programacao',
    texto_pergunta: 'Quantas vezes o loop for(i=0; i<3; i++) executa?',
    opcao_a: '2', opcao_b: '3', opcao_c: '4', opcao_d: 'Infinito',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 46, tipo: 'programacao',
    texto_pergunta: 'Qual é o tipo de dado de "Hello World"?',
    opcao_a: 'number', opcao_b: 'boolean', opcao_c: 'string', opcao_d: 'undefined',
    resposta_correta: 'c', dificuldade: 'facil', pontos: 1
  },
  {
    ordem_indice: 47, tipo: 'programacao',
    texto_pergunta: 'Como se escreve comentário de uma linha em JavaScript?',
    opcao_a: '<!-- -->', opcao_b: '//', opcao_c: '#', opcao_d: '/* */',
    resposta_correta: 'b', dificuldade: 'facil', pontos: 1
  },
  // Médio (7)
  {
    ordem_indice: 48, tipo: 'programacao',
    texto_pergunta: 'Qual método remove o último elemento de um array em JavaScript?',
    opcao_a: 'shift()', opcao_b: 'pop()', opcao_c: 'push()', opcao_d: 'splice()',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 49, tipo: 'programacao',
    texto_pergunta: 'O que é uma Promise em JavaScript?',
    opcao_a: 'Uma função', opcao_b: 'Um objeto que representa valor futuro', opcao_c: 'Um erro', opcao_d: 'Um loop',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 50, tipo: 'programacao',
    texto_pergunta: 'Qual é o resultado de typeof null?',
    opcao_a: 'null', opcao_b: 'undefined', opcao_c: 'object', opcao_d: 'boolean',
    resposta_correta: 'c', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 51, tipo: 'programacao',
    texto_pergunta: 'O que o método map() faz?',
    opcao_a: 'Filtrar elementos', opcao_b: 'Transformar elementos', opcao_c: 'Ordenar elementos', opcao_d: 'Remover elementos',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 52, tipo: 'programacao',
    texto_pergunta: 'Qual tag HTML5 é usada para semantics header?',
    opcao_a: '<div>', opcao_b: '<header>', opcao_c: '<head>', opcao_d: '<section>',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 53, tipo: 'programacao',
    texto_pergunta: 'O que significa CSS?',
    opcao_a: 'Creative Style Sheets', opcao_b: 'Cascading Style Sheets', opcao_c: 'Computer Style Sheets', opcao_d: 'Colorful Style Sheets',
    resposta_correta: 'b', dificuldade: 'medio', pontos: 1
  },
  {
    ordem_indice: 54, tipo: 'programacao',
    texto_pergunta: 'Como se declara uma função em JavaScript?',
    opcao_a: 'function myFunc()', opcao_b: 'def myFunc()', opcao_c: 'func myFunc()', opcao_d: 'void myFunc()',
    resposta_correta: 'a', dificuldade: 'medio', pontos: 1
  },
  // Difícil (6)
  {
    ordem_indice: 55, tipo: 'programacao',
    texto_pergunta: 'O que é closure em JavaScript?',
    opcao_a: 'Um tipo de loop', opcao_b: 'Uma função com acesso ao escopo externo', opcao_c: 'Um erro', opcao_d: 'Um objeto',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 56, tipo: 'programacao',
    texto_pergunta: 'Qual a diferença entre == e ===?',
    opcao_a: 'Não há diferença', opcao_b: '== compara valor, === compara valor e tipo', opcao_c: '=== compara valor, == compara tipo', opcao_d: 'São equivalentes',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 57, tipo: 'programacao',
    texto_pergunta: 'O que é hoisting em JavaScript?',
    opcao_a: 'Um erro de syntax', opcao_b: 'Declarações são movidas ao topo', opcao_c: 'Um tipo de loop', opcao_d: 'Uma função',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 58, tipo: 'programacao',
    texto_pergunta: 'O que o método reduce() faz?',
    opcao_a: 'Reduz o array a um valor único', opcao_b: 'Remove elementos', opcao_c: 'Ordena o array', opcao_d: 'Inverte o array',
    resposta_correta: 'a', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 59, tipo: 'programacao',
    texto_pergunta: 'O que é uma API REST?',
    opcao_a: 'Uma linguagem de programação', opcao_b: 'Um estilo de arquitetura para APIs', opcao_c: 'Um banco de dados', opcao_d: 'Um servidor',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  },
  {
    ordem_indice: 60, tipo: 'programacao',
    texto_pergunta: 'O que significa "this" em JavaScript dentro de um objeto?',
    opcao_a: 'O objeto global', opcao_b: 'O objeto atual', opcao_c: 'Null', opcao_d: 'Undefined',
    resposta_correta: 'b', dificuldade: 'dificil', pontos: 1
  }
];

async function seedPerguntasQuiz() {
  try {
    console.log('🔄 Iniciando seed de 60 questões para o quiz...');
    
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');
    
    // Adicionar coluna dificuldade se não existir
    try {
      await sequelize.query('ALTER TABLE perguntas ADD COLUMN dificuldade ENUM("facil", "medio", "dificil") DEFAULT "facil"');
      console.log('✅ Coluna "dificuldade" adicionada');
    } catch (e) {
      console.log('ℹ️ Coluna "dificuldade" já existe ou erro:', e.message);
    }
    
    // Limpar perguntas existentes
    await Pergunta.destroy({ where: { tipo: ['matematica', 'ingles', 'programacao'] } });
    console.log('🗑️ Perguntas anteriores removidas');
    
    // Inserir novas perguntas
    await Pergunta.bulkCreate(perguntas);
    console.log(`✅ ${perguntas.length} questões inseridas com sucesso!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedPerguntasQuiz();