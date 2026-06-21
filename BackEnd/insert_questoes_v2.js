#!/usr/bin/env node

/**
 * Script v2 para inserir 45 questões no banco de dados
 * Versão otimizada que identifica o torneio ativo e insere as questões
 */

import sequelize from './config/db.js';
import Torneio from './models/Torneio.js';
import Questao from './models/Questao.js';

const questoesData = [
  // ============================================================
  // MATEMÁTICA - FÁCIL (5 questões)
  // ============================================================
  {
    titulo: 'Adição com nmeros maiores',
    descricao: 'Quanto é 45 + 37?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['80', '81', '82', '83'],
    resposta_correta: '82',
    explicacao: '45 + 37 = 82',
    pontos: 10,
  },
  {
    titulo: 'Multiplicação de 2 dígitos',
    descricao: 'Quanto é 15 × 8?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['100', '110', '120', '130'],
    resposta_correta: '120',
    explicacao: '15 × 8 = 120',
    pontos: 10,
  },
  {
    titulo: 'Divisão simples',
    descricao: 'Quanto é 96 ÷ 12?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['7', '8', '9', '10'],
    resposta_correta: '8',
    explicacao: '96 ÷ 12 = 8',
    pontos: 10,
  },
  {
    titulo: 'Potência de 10',
    descricao: 'Quanto é 10³?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['100', '1000', '10000', '100000'],
    resposta_correta: '1000',
    explicacao: '10³ = 10 × 10 × 10 = 1000',
    pontos: 10,
  },
  {
    titulo: 'Área do retângulo',
    descricao: 'Qual é a área de um retângulo com base 6 e altura 4?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['20', '24', '28', '32'],
    resposta_correta: '24',
    explicacao: 'Área = base × altura = 6 × 4 = 24',
    pontos: 10,
  },

  // ============================================================
  // MATEMÁTICA - MÉDIO (5 questões)
  // ============================================================
  {
    titulo: 'Equação simples',
    descricao: 'Se 3x + 2 = 11, qual é x?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['2', '3', '4', '5'],
    resposta_correta: '3',
    explicacao: '3x = 11 - 2 = 9, x = 3',
    pontos: 15,
  },
  {
    titulo: 'Percentagem simples',
    descricao: 'Quanto é 30% de 200?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['50', '60', '70', '80'],
    resposta_correta: '60',
    explicacao: '30% de 200 = 0,30 × 200 = 60',
    pontos: 15,
  },
  {
    titulo: 'Perímetro do círculo',
    descricao: 'Qual é a circunferência de um círculo com raio 7? (  3,14)',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['43,96', '44,96', '45,96', '46,96'],
    resposta_correta: '43,96',
    explicacao: 'C = 2r = 2 × 3,14 × 7 = 43,96',
    pontos: 15,
  },
  {
    titulo: 'MMC simples',
    descricao: 'Qual é o MMC de 4 e 6?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['8', '10', '12', '14'],
    resposta_correta: '12',
    explicacao: 'MMC(4,6) = 12',
    pontos: 15,
  },
  {
    titulo: 'ngulos complementares',
    descricao: 'Se um ângulo mede 35°, qual é seu complementar?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['45°', '55°', '65°', '75°'],
    resposta_correta: '55°',
    explicacao: 'ngulos complementares somam 90°. 90° - 35° = 55°',
    pontos: 15,
  },

  // ============================================================
  // MATEMÁTICA - DIFÍCIL (5 questões)
  // ============================================================
  {
    titulo: 'Polinômio',
    descricao: 'Qual é a raiz de f(x) = x² - 5x + 6?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['x=1 e x=2', 'x=2 e x=3', 'x=3 e x=4', 'x=1 e x=6'],
    resposta_correta: 'x=2 e x=3',
    explicacao: 'x² - 5x + 6 = (x-2)(x-3), raízes são 2 e 3',
    pontos: 20,
  },
  {
    titulo: 'Trigonometria - sen 45°',
    descricao: 'Qual é o valor de sen(45°)?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['1/2', '2/2', '3/2', '1'],
    resposta_correta: '2/2',
    explicacao: 'sen(45°) = 2/2  0,707',
    pontos: 20,
  },
  {
    titulo: 'Combinatória - Arranjos',
    descricao: 'De quantas formas podemos escolher 2 pessoas de 5 para uma fila?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['10', '15', '20', '25'],
    resposta_correta: '20',
    explicacao: 'A(5,2) = 5!/(5-2)! = 5×4 = 20',
    pontos: 20,
  },
  {
    titulo: 'Progressão geométrica',
    descricao: 'Na PG 1, 3, 9, 27... qual é o 5º termo?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['81', '100', '120', '150'],
    resposta_correta: '81',
    explicacao: 'a = 1 × 3 = 81',
    pontos: 20,
  },
  {
    titulo: 'Logaritmo complexo',
    descricao: 'Qual é o valor de log(125)?',
    disciplina: 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['2', '3', '4', '5'],
    resposta_correta: '3',
    explicacao: 'log(125) = 3 porque 5³ = 125',
    pontos: 20,
  },

  // ============================================================
  // INGLÊS - FÁCIL (5 questões)
  // ============================================================
  {
    titulo: 'Profissão - Engineer',
    descricao: 'What does "engenheiro" mean in English?',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['Programmer', 'Engineer', 'Manager', 'Designer'],
    resposta_correta: 'Engineer',
    explicacao: '"Engenheiro" translates to "Engineer"',
    pontos: 10,
  },
  {
    titulo: 'Verbo - trabalhar',
    descricao: 'Complete: I ___ every day.',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['works', 'work', 'working', 'worked'],
    resposta_correta: 'work',
    explicacao: 'With "I" we use base form without -s',
    pontos: 10,
  },
  {
    titulo: 'Adjetivo possessivo',
    descricao: 'Complete: ___ name is Maria. (dela)',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['Its', 'Her', 'His', 'Their'],
    resposta_correta: 'Her',
    explicacao: 'Possessive adjective for feminine third person is "her"',
    pontos: 10,
  },
  {
    titulo: 'Nmero em inglês',
    descricao: 'How do you say "vinte e cinco" in English?',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['Twenty-three', 'Twenty-four', 'Twenty-five', 'Twenty-six'],
    resposta_correta: 'Twenty-five',
    explicacao: '"Vinte e cinco" is "twenty-five"',
    pontos: 10,
  },
  {
    titulo: 'There is / There are',
    descricao: 'Complete: ___ two books on the table.',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['There is', 'There are', 'There be', 'There has'],
    resposta_correta: 'There are',
    explicacao: 'With plural we use "there are"',
    pontos: 10,
  },

  // ============================================================
  // INGLÊS - MÉDIO (5 questões)
  // ============================================================
  {
    titulo: 'Present Perfect',
    descricao: 'Complete: I ___ this movie three times.',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['see', 'have seen', 'saw', 'am seeing'],
    resposta_correta: 'have seen',
    explicacao: 'Present perfect: have/has + past participle',
    pontos: 15,
  },
  {
    titulo: 'Gerund vs Infinitive',
    descricao: 'Complete: I enjoy ___ books.',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['to read', 'reading', 'to reading', 'read'],
    resposta_correta: 'reading',
    explicacao: '"Enjoy" takes gerund (verb + ing)',
    pontos: 15,
  },
  {
    titulo: 'Comparativo',
    descricao: 'Complete: This city is ___ than that one.',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['more beautiful', 'beautifuler', 'most beautiful', 'beauty'],
    resposta_correta: 'more beautiful',
    explicacao: 'Multi-syllable adjectives: more + adjective',
    pontos: 15,
  },
  {
    titulo: 'Conditional',
    descricao: 'Complete: If I ___ more time, I would travel.',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['have', 'had', 'would have', 'have had'],
    resposta_correta: 'had',
    explicacao: 'Second conditional: If + past + would + base',
    pontos: 15,
  },
  {
    titulo: 'Preposição - in/on/at',
    descricao: 'Complete: I was born ___ 1990.',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['in', 'on', 'at', 'during'],
    resposta_correta: 'in',
    explicacao: '"In" is used with years',
    pontos: 15,
  },

  // ============================================================
  // INGLÊS - DIFÍCIL (5 questões)
  // ============================================================
  {
    titulo: 'Advanced vocabulary',
    descricao: 'What does "ephemeral" mean?',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['Permanent', 'Temporary', 'Eternal', 'Constant'],
    resposta_correta: 'Temporary',
    explicacao: '"Ephemeral" means lasting for a very short time',
    pontos: 20,
  },
  {
    titulo: 'Passive voice',
    descricao: 'Complete: The letter ___ by the manager yesterday.',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['was signed', 'were signed', 'is signed', 'has signed'],
    resposta_correta: 'was signed',
    explicacao: 'Past passive: was + past participle',
    pontos: 20,
  },
  {
    titulo: 'Modal deduction',
    descricao: 'She didn\'t answer. She ___ be busy.',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['might', 'could', 'must', 'may'],
    resposta_correta: 'must',
    explicacao: '"Must" expresses logical certainty',
    pontos: 20,
  },
  {
    titulo: 'Inversion',
    descricao: 'Choose the correct inversion: Never ___',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['I have seen', 'have I seen', 'I had seen', 'had I seen'],
    resposta_correta: 'have I seen',
    explicacao: 'Negative adverbs cause inversion: Never have I seen...',
    pontos: 20,
  },
  {
    titulo: 'Reported speech',
    descricao: 'She said: "I will come tomorrow." Change to reported speech:',
    disciplina: 'ingles',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['She said she will come', 'She said she would come', 'She said she would came', 'She says she will come'],
    resposta_correta: 'She said she would come',
    explicacao: 'In reported speech, future becomes "would"',
    pontos: 20,
  },

  // ============================================================
  // PROGRAMAÇÃO - FÁCIL (5 questões)
  // ============================================================
  {
    titulo: 'Tipo de dado - String',
    descricao: 'Qual tipo de dado representa texto?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['Text', 'String', 'Word', 'Letter'],
    resposta_correta: 'String',
    explicacao: 'String é o tipo de dado para texto/caracteres',
    pontos: 10,
  },
  {
    titulo: 'Operador - Adição',
    descricao: 'Qual é o operador para adição?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['+', '-', '*', '/'],
    resposta_correta: '+',
    explicacao: 'O operador + realiza adição',
    pontos: 10,
  },
  {
    titulo: 'Condicional - if',
    descricao: 'Complete: ___ (x > 5) { ... }',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['when', 'if', 'while', 'for'],
    resposta_correta: 'if',
    explicacao: '"if" é usado para condicionais',
    pontos: 10,
  },
  {
    titulo: 'Índice de array',
    descricao: 'Em qual índice está o primeiro elemento de um array?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['0', '1', '-1', 'first'],
    resposta_correta: '0',
    explicacao: 'Arrays começam no índice 0',
    pontos: 10,
  },
  {
    titulo: 'Função - return',
    descricao: 'Qual palavra-chave retorna um valor de uma função?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    opcoes: ['give', 'output', 'return', 'yield'],
    resposta_correta: 'return',
    explicacao: '"return" é usado para retornar valores',
    pontos: 10,
  },

  // ============================================================
  // PROGRAMAÇÃO - MÉDIO (5 questões)
  // ============================================================
  {
    titulo: 'Escopo de variável',
    descricao: 'Qual é o escopo de uma variável declarada com "let"?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['Global', 'Local do bloco', 'Local da função', 'Nenhum'],
    resposta_correta: 'Local do bloco',
    explicacao: '"let" tem escopo de bloco (block scope)',
    pontos: 15,
  },
  {
    titulo: 'Orientação a objetos - Herança',
    descricao: 'O que é herança em OOP?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['Cópia de objetos', 'Uma classe herda propriedades de outra', 'Clonagem de funções', 'Compartilhamento de memória'],
    resposta_correta: 'Uma classe herda propriedades de outra',
    explicacao: 'Herança permite que classes reutilizem código de outras',
    pontos: 15,
  },
  {
    titulo: 'Algoritmo - Busca linear',
    descricao: 'Qual é a complexidade de tempo da busca linear?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    resposta_correta: 'O(n)',
    explicacao: 'Busca linear pode precisar verificar cada elemento',
    pontos: 15,
  },
  {
    titulo: 'Estrutura de dados - Stack',
    descricao: 'Stack funciona como LIFO. O que significa?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['Last In First Out', 'List In First Out', 'Long Integer First Out', 'Load In Fill Out'],
    resposta_correta: 'Last In First Out',
    explicacao: 'LIFO: ltimo a entrar é primeiro a sair',
    pontos: 15,
  },
  {
    titulo: 'Tratamento de erro',
    descricao: 'Complete: try { ... } ___ (e) { ... }',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['catch', 'except', 'handle', 'error'],
    resposta_correta: 'catch',
    explicacao: '"catch" captura exceções em try-catch',
    pontos: 15,
  },

  // ============================================================
  // PROGRAMAÇÃO - DIFÍCIL (5 questões)
  // ============================================================
  {
    titulo: 'Design Pattern - Factory',
    descricao: 'O que é o padrão Factory?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['Padrão para criar objetos sem especificar suas classes', 'Padrão para armazenar dados', 'Padrão para herança', 'Padrão para criptografia'],
    resposta_correta: 'Padrão para criar objetos sem especificar suas classes',
    explicacao: 'Factory abstrai a criação de objetos',
    pontos: 20,
  },
  {
    titulo: 'Algoritmo - Quick Sort',
    descricao: 'Qual é a complexidade média do Quick Sort?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    resposta_correta: 'O(n log n)',
    explicacao: 'Quick Sort tem complexidade média O(n log n)',
    pontos: 20,
  },
  {
    titulo: 'Closure em JavaScript',
    descricao: 'O que é uma closure?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['Uma função que termina', 'Uma função que acessa variáveis externas', 'Um tipo de loop', 'Uma forma de criptografia'],
    resposta_correta: 'Uma função que acessa variáveis externas',
    explicacao: 'Closure é uma função que tem acesso ao escopo externo',
    pontos: 20,
  },
  {
    titulo: 'Controle de versão - Git Rebase',
    descricao: 'O que faz um git rebase?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['Cria uma cópia do repositório', 'Reaplica commits de um branch sobre outro', 'Deleta o histórico', 'Mescla sem criar commit'],
    resposta_correta: 'Reaplica commits de um branch sobre outro',
    explicacao: 'Rebase reorganiza o histórico de commits',
    pontos: 20,
  },
  {
    titulo: 'SQL - Índices',
    descricao: 'Qual é a principal vantagem de usar índices?',
    disciplina: 'programacao',
    tipo: 'multipla_escolha',
    dificuldade: 'dificil',
    opcoes: ['Melhorar segurança', 'Acelerar buscas', 'Aumentar capacidade', 'Reduzir custo'],
    resposta_correta: 'Acelerar buscas',
    explicacao: 'Índices melhoram performance de queries de busca',
    pontos: 20,
  },
];

async function insertQuestoes() {
  try {
    console.log(' Iniciando inserção de 45 questões\n');

    await sequelize.authenticate();
    console.log(' Conectado ao banco de dados\n');

    // Encontrar torneio ativo
    let torneio = await Torneio.findOne({
      where: { status: 'ativo' },
      order: [['id', 'DESC']],
    });

    if (!torneio) {
      console.log('  Nenhum torneio ativo encontrado, usando o mais recente...');
      torneio = await Torneio.findOne({
        order: [['id', 'DESC']],
      });
    }

    if (!torneio) {
      console.error(' Erro: Nenhum torneio encontrado no banco');
      process.exit(1);
    }

    console.log(` Torneio selecionado: "${torneio.titulo}" (ID: ${torneio.id})`);
    console.log(`   Status: ${torneio.status}\n`);

    // Inserir questões
    let inserted = 0;
    for (const questao of questoesData) {
      try {
        await Questao.create({
          ...questao,
          torneio_id: torneio.id,
          status_aprovacao: 'aprovada',
        });
        inserted++;
      } catch (err) {
        console.error(` Erro ao inserir: ${questao.titulo}`, err.message);
      }
    }

    console.log(`\n Total de questões inseridas: ${inserted}/${questoesData.length}\n`);

    // Verificação
    const grupos = await Questao.findAll({
      where: { torneio_id: torneio.id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        'disciplina',
        'dificuldade',
      ],
      group: ['disciplina', 'dificuldade'],
      raw: true,
    });

    console.log(' Verificação por disciplina e dificuldade:');
    console.table(grupos);

    const totaisPorDisciplina = await Questao.findAll({
      where: { torneio_id: torneio.id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        'disciplina',
      ],
      group: ['disciplina'],
      raw: true,
    });

    console.log('\n Total por disciplina:');
    console.table(totaisPorDisciplina);

    const totalGeral = await Questao.count({
      where: { torneio_id: torneio.id },
    });

    console.log(`\n Total de questões no torneio: ${totalGeral}`);

    if (inserted === 45) {
      console.log('\n SUCESSO! Todas as 45 questões foram inseridas!');
    }

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error(' Erro:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

insertQuestoes();
