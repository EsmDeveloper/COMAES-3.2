import sequelize from '../config/db.js';
import Questao from '../models/Questao.js';

const TORNEIO_ID = 15;

// Dados para Questões de Inglês
const questoesIngles = [
  // Fácil
  {
    titulo: 'Simple Present - Basic',
    descricao: 'What does "I play" mean in Portuguese?',
    dificuldade: 'facil',
    resposta_correta: 'Eu jogo',
    opcoes: JSON.stringify(['Eu jogo', 'Eu joguei', 'Eu vou jogar', 'Eu estou jogando']),
    pontos: 10,
  },
  {
    titulo: 'Vocabulary - Colors',
    descricao: 'What is the color of the sky?',
    dificuldade: 'facil',
    resposta_correta: 'Blue',
    opcoes: JSON.stringify(['Red', 'Blue', 'Green', 'Yellow']),
    pontos: 10,
  },
  {
    titulo: 'Article - The',
    descricao: 'Complete: "I have ___ cat."',
    dificuldade: 'facil',
    resposta_correta: 'a',
    opcoes: JSON.stringify(['a', 'an', 'the', 'none']),
    pontos: 10,
  },
  {
    titulo: 'Question Formation',
    descricao: 'How do you ask "What is your name?"',
    dificuldade: 'facil',
    resposta_correta: 'What is your name?',
    opcoes: JSON.stringify(['What is your name?', 'What your name is?', 'Your name what is?', 'What you name are?']),
    pontos: 10,
  },
  {
    titulo: 'Numbers',
    descricao: 'How do you write "21" in English?',
    dificuldade: 'facil',
    resposta_correta: 'Twenty-one',
    opcoes: JSON.stringify(['Twine-one', 'Twenty-one', 'Twin-one', 'Two-one']),
    pontos: 10,
  },
  // Médio
  {
    titulo: 'Present Perfect',
    descricao: 'Complete: "I ___ lived here for 5 years."',
    dificuldade: 'medio',
    resposta_correta: 'have',
    opcoes: JSON.stringify(['have', 'has', 'had', 'am']),
    pontos: 10,
  },
  {
    titulo: 'Conditionals',
    descricao: 'If I study hard, I ___ pass the exam.',
    dificuldade: 'medio',
    resposta_correta: 'will',
    opcoes: JSON.stringify(['would', 'will', 'shall', 'might']),
    pontos: 10,
  },
  {
    titulo: 'Phrasal Verbs',
    descricao: 'Which means to "postpone"?',
    dificuldade: 'medio',
    resposta_correta: 'put off',
    opcoes: JSON.stringify(['put on', 'put off', 'put up', 'put down']),
    pontos: 10,
  },
  {
    titulo: 'Passive Voice',
    descricao: 'Rewrite: "They build houses." (Passive)',
    dificuldade: 'medio',
    resposta_correta: 'Houses are built by them',
    opcoes: JSON.stringify(['Houses are built by them', 'Houses are built them', 'Buildings are built by they', 'House is built by them']),
    pontos: 10,
  },
  {
    titulo: 'Word Order',
    descricao: 'Arrange: "never / I / eat / meat"',
    dificuldade: 'medio',
    resposta_correta: 'I never eat meat',
    opcoes: JSON.stringify(['I never eat meat', 'Never I eat meat', 'I eat never meat', 'Never eat I meat']),
    pontos: 10,
  },
  // Difícil
  {
    titulo: 'Subjunctive Mood',
    descricao: 'It is essential that he ___ on time.',
    dificuldade: 'dificil',
    resposta_correta: 'be',
    opcoes: JSON.stringify(['is', 'be', 'will be', 'was']),
    pontos: 10,
  },
  {
    titulo: 'Complex Sentences',
    descricao: 'What is the main clause in: "Although it was raining, we went out"?',
    dificuldade: 'dificil',
    resposta_correta: 'we went out',
    opcoes: JSON.stringify(['Although it was raining', 'we went out', 'it was raining', 'Although']),
    pontos: 10,
  },
  {
    titulo: 'Idioms',
    descricao: 'What does "break the ice" mean?',
    dificuldade: 'dificil',
    resposta_correta: 'Start a conversation',
    opcoes: JSON.stringify(['Break something', 'Start a conversation', 'Cold temperature', 'Stop talking']),
    pontos: 10,
  },
  {
    titulo: 'Advanced Grammar',
    descricao: 'The proposal, which ___ accepted yesterday, will be implemented next month.',
    dificuldade: 'dificil',
    resposta_correta: 'was',
    opcoes: JSON.stringify(['is', 'was', 'were', 'been']),
    pontos: 10,
  },
  {
    titulo: 'Vocabulary - Academic',
    descricao: 'Which word means "to make something less severe"?',
    dificuldade: 'dificil',
    resposta_correta: 'mitigate',
    opcoes: JSON.stringify(['aggravate', 'mitigate', 'precipitate', 'fabricate']),
    pontos: 10,
  },
];

// Dados para Questões de Matemática
const questoesMatematica = [
  // Fácil
  {
    titulo: 'Adição Básica',
    descricao: 'Quanto é 5 + 3?',
    dificuldade: 'facil',
    resposta_correta: '8',
    opcoes: JSON.stringify(['6', '7', '8', '9']),
    pontos: 10,
  },
  {
    titulo: 'Subtração',
    descricao: 'Quanto é 10 - 4?',
    dificuldade: 'facil',
    resposta_correta: '6',
    opcoes: JSON.stringify(['5', '6', '7', '8']),
    pontos: 10,
  },
  {
    titulo: 'Multiplicação',
    descricao: 'Quanto é 3 × 4?',
    dificuldade: 'facil',
    resposta_correta: '12',
    opcoes: JSON.stringify(['10', '11', '12', '13']),
    pontos: 10,
  },
  {
    titulo: 'Divisão',
    descricao: 'Quanto é 20 ÷ 5?',
    dificuldade: 'facil',
    resposta_correta: '4',
    opcoes: JSON.stringify(['3', '4', '5', '6']),
    pontos: 10,
  },
  {
    titulo: 'Frações Básicas',
    descricao: 'Quanto é 1/2 + 1/4?',
    dificuldade: 'facil',
    resposta_correta: '3/4',
    opcoes: JSON.stringify(['1/4', '1/2', '3/4', '1']),
    pontos: 10,
  },
  // Médio
  {
    titulo: 'Equações Lineares',
    descricao: 'Resolva: 2x + 5 = 13',
    dificuldade: 'medio',
    resposta_correta: '4',
    opcoes: JSON.stringify(['2', '3', '4', '5']),
    pontos: 10,
  },
  {
    titulo: 'Porcentagem',
    descricao: 'Quanto é 25% de 80?',
    dificuldade: 'medio',
    resposta_correta: '20',
    opcoes: JSON.stringify(['16', '18', '20', '24']),
    pontos: 10,
  },
  {
    titulo: 'Potência',
    descricao: 'Quanto é 2^5?',
    dificuldade: 'medio',
    resposta_correta: '32',
    opcoes: JSON.stringify(['16', '24', '32', '64']),
    pontos: 10,
  },
  {
    titulo: 'Raiz Quadrada',
    descricao: 'Qual é a raiz quadrada de 64?',
    dificuldade: 'medio',
    resposta_correta: '8',
    opcoes: JSON.stringify(['6', '7', '8', '9']),
    pontos: 10,
  },
  {
    titulo: 'Trigonometria Básica',
    descricao: 'Em um triângulo retângulo, se sen(θ) = 0.5, qual é θ?',
    dificuldade: 'medio',
    resposta_correta: '30°',
    opcoes: JSON.stringify(['15°', '30°', '45°', '60°']),
    pontos: 10,
  },
  // Difícil
  {
    titulo: 'Equações Quadráticas',
    descricao: 'Resolva: x² - 5x + 6 = 0',
    dificuldade: 'dificil',
    resposta_correta: 'x = 2 ou x = 3',
    opcoes: JSON.stringify(['x = 1 ou x = 6', 'x = 2 ou x = 3', 'x = 2 ou x = 4', 'x = 1 ou x = 5']),
    pontos: 10,
  },
  {
    titulo: 'Logaritmos',
    descricao: 'Calcule log₂(8)',
    dificuldade: 'dificil',
    resposta_correta: '3',
    opcoes: JSON.stringify(['2', '3', '4', '8']),
    pontos: 10,
  },
  {
    titulo: 'Derivadas',
    descricao: 'Qual é a derivada de f(x) = 3x²?',
    dificuldade: 'dificil',
    resposta_correta: '6x',
    opcoes: JSON.stringify(['3x', '6x', '9x', 'x²']),
    pontos: 10,
  },
  {
    titulo: 'Limites',
    descricao: 'Calcule lim(x→2) (x² + 1)',
    dificuldade: 'dificil',
    resposta_correta: '5',
    opcoes: JSON.stringify(['3', '4', '5', '6']),
    pontos: 10,
  },
  {
    titulo: 'Integrais',
    descricao: 'Qual é ∫(2x)dx?',
    dificuldade: 'dificil',
    resposta_correta: 'x² + C',
    opcoes: JSON.stringify(['2x + C', 'x² + C', 'x + C', '2x² + C']),
    pontos: 10,
  },
];

// Dados para Questões de Programação
const questoesProgramacao = [
  // Fácil
  {
    titulo: 'Variáveis',
    descricao: 'O que é uma variável em programação?',
    dificuldade: 'facil',
    resposta_correta: 'Um espaço na memória que armazena um valor',
    opcoes: JSON.stringify(['Um tipo de dado', 'Um espaço na memória que armazena um valor', 'Uma função', 'Uma classe']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Tipos de Dados',
    descricao: 'Console.log(typeof 5) retorna?',
    dificuldade: 'facil',
    resposta_correta: 'number',
    opcoes: JSON.stringify(['int', 'number', 'integer', 'Number']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Condicionais',
    descricao: 'O que faz a estrutura if-else?',
    dificuldade: 'facil',
    resposta_correta: 'Executa código diferente baseado em condições',
    opcoes: JSON.stringify(['Repete código', 'Executa código diferente baseado em condições', 'Define uma função', 'Cria um array']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Loops',
    descricao: 'Quantas vezes o loop for executa? for(let i=0; i<3; i++)',
    dificuldade: 'facil',
    resposta_correta: '3 vezes',
    opcoes: JSON.stringify(['2 vezes', '3 vezes', '4 vezes', 'Infinitamente']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Funções',
    descricao: 'Como se chama um bloco de código reutilizável?',
    dificuldade: 'facil',
    resposta_correta: 'Função',
    opcoes: JSON.stringify(['Classe', 'Função', 'Método', 'Procedimento']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  // Médio
  {
    titulo: 'Arrays',
    descricao: 'Qual é o resultado de [1,2,3].map(x => x*2)?',
    dificuldade: 'medio',
    resposta_correta: '[2, 4, 6]',
    opcoes: JSON.stringify(['[1, 2, 3]', '[2, 4, 6]', '[2, 4, 6, 2]', 'undefined']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Objetos',
    descricao: 'Como acessar a propriedade "nome" de um objeto?',
    dificuldade: 'medio',
    resposta_correta: 'objeto.nome ou objeto["nome"]',
    opcoes: JSON.stringify(['objeto.nome ou objeto["nome"]', 'objeto->nome', 'objeto:nome', 'objeto&nome']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Closures',
    descricao: 'O que é uma closure em JavaScript?',
    dificuldade: 'medio',
    resposta_correta: 'Uma função que tem acesso a variáveis de seu escopo externo',
    opcoes: JSON.stringify(['Uma função que não tem parâmetros', 'Uma função que tem acesso a variáveis de seu escopo externo', 'Uma função anônima', 'Um tipo de loop']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Promises',
    descricao: 'Qual é o estado de uma Promise resolvida com sucesso?',
    dificuldade: 'medio',
    resposta_correta: 'fulfilled',
    opcoes: JSON.stringify(['pending', 'fulfilled', 'rejected', 'resolved']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Recursão',
    descricao: 'Qual é o resultado de factorial(4)?',
    dificuldade: 'medio',
    resposta_correta: '24',
    opcoes: JSON.stringify(['20', '24', '26', '30']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  // Difícil
  {
    titulo: 'Async/Await',
    descricao: 'Qual é a vantagem de usar async/await?',
    dificuldade: 'dificil',
    resposta_correta: 'Torna o código assíncrono mais legível e fácil de gerenciar',
    opcoes: JSON.stringify(['Acelera o código', 'Torna o código assíncrono mais legível e fácil de gerenciar', 'Reduz o uso de memória', 'Aumenta a segurança']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Design Patterns',
    descricao: 'O que é o padrão Singleton?',
    dificuldade: 'dificil',
    resposta_correta: 'Uma classe que pode ter apenas uma instância',
    opcoes: JSON.stringify(['Uma classe com muitos métodos', 'Uma classe que pode ter apenas uma instância', 'Um tipo de array', 'Um tipo de função']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Event Loop',
    descricao: 'O que é o event loop em JavaScript?',
    dificuldade: 'dificil',
    resposta_correta: 'O mecanismo que executa callbacks quando a call stack está vazia',
    opcoes: JSON.stringify(['Um tipo de loop infinito', 'O mecanismo que executa callbacks quando a call stack está vazia', 'Uma estrutura de dados', 'Um tipo de Promise']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Prototypes',
    descricao: 'Como funciona herança por prototypes em JavaScript?',
    dificuldade: 'dificil',
    resposta_correta: 'Objetos herdam de outros objetos através da cadeia de prototypes',
    opcoes: JSON.stringify(['Através de classes apenas', 'Objetos herdam de outros objetos através da cadeia de prototypes', 'Através de interfases', 'Através de módulos']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
  {
    titulo: 'Otimização',
    descricao: 'Qual técnica reduz o tempo de execução em loops?',
    dificuldade: 'dificil',
    resposta_correta: 'Memoização',
    opcoes: JSON.stringify(['Recursão', 'Memoização', 'Callbacks', 'API REST']),
    pontos: 15,
    linguagem: 'JavaScript',
  },
];

async function seedQuestions() {
  try {
    console.log('🌱 Iniciando seed de questões para torneio ID 15...');

    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // Inserir Questões de Inglês
    console.log('\n📚 Inserindo questões de Inglês...');
    for (const q of questoesIngles) {
      await Questao.create({
        ...q,
        torneio_id: TORNEIO_ID,
        disciplina: 'ingles',
        tipo: 'multipla_escolha',
      });
    }
    console.log(`✅ ${questoesIngles.length} questões de Inglês inseridas`);

    // Inserir Questões de Matemática
    console.log('\n📐 Inserindo questões de Matemática...');
    for (const q of questoesMatematica) {
      await Questao.create({
        ...q,
        torneio_id: TORNEIO_ID,
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
      });
    }
    console.log(`✅ ${questoesMatematica.length} questões de Matemática inseridas`);

    // Inserir Questões de Programação
    console.log('\n💻 Inserindo questões de Programação...');
    for (const q of questoesProgramacao) {
      await Questao.create({
        ...q,
        torneio_id: TORNEIO_ID,
        disciplina: 'programacao',
        tipo: 'codigo',
      });
    }
    console.log(`✅ ${questoesProgramacao.length} questões de Programação inseridas`);

    console.log('\n✨ Seed concluído com sucesso!');
    console.log(`Total: ${questoesIngles.length + questoesMatematica.length + questoesProgramacao.length} questões inseridas`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedQuestions();
