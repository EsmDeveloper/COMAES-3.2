/**
 * seed_blocos_completos.js
 * 
 * Cria via DB directo (Sequelize):
 *  - 3 BlocoQuestoes contexto='torneio'  (matematica, ingles, programacao)
 *  - 3 BlocoQuestoes contexto='teste'    (matematica, ingles, programacao)
 * 
 * Cada bloco com 10 questões de múltipla escolha (QuestaoTesteConhecimento)
 * prontas para usar em torneios e testes.
 * 
 * Executar:  node scripts/seed_blocos_completos.js
 */

import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/db.js';
import BlocoQuestoes from '../models/BlocoQuestoes.js';
import BlocoQuestaoItem from '../models/BlocoQuestaoItem.js';
import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';
import Usuario from '../models/User.js';
import '../models/associations.js';

// ─── Questões por disciplina ───────────────────────────────────────────────

const QUESTOES = {

  matematica: [
    {
      enunciado: 'Quanto é 2 + 2?',
      opcoes: ['3', '4', '5', '6'],
      resposta_correta: '4',
      dificuldade: 'facil', pontos: 5,
    },
    {
      enunciado: 'Qual é a raiz quadrada de 144?',
      opcoes: ['10', '11', '12', '13'],
      resposta_correta: '12',
      dificuldade: 'facil', pontos: 5,
    },
    {
      enunciado: 'Quanto é 15 × 8?',
      opcoes: ['100', '110', '120', '130'],
      resposta_correta: '120',
      dificuldade: 'facil', pontos: 5,
    },
    {
      enunciado: 'Qual é o resultado de 3³ (3 ao cubo)?',
      opcoes: ['9', '18', '27', '36'],
      resposta_correta: '27',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'Se x + 5 = 12, quanto vale x?',
      opcoes: ['5', '6', '7', '8'],
      resposta_correta: '7',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'Qual o perímetro de um quadrado com lado 7 cm?',
      opcoes: ['21 cm', '28 cm', '35 cm', '49 cm'],
      resposta_correta: '28 cm',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'Quantos graus tem a soma dos ângulos internos de um triângulo?',
      opcoes: ['90°', '180°', '270°', '360°'],
      resposta_correta: '180°',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'Qual é a derivada de f(x) = x²?',
      opcoes: ['x', '2x', 'x²', '2x²'],
      resposta_correta: '2x',
      dificuldade: 'dificil', pontos: 15,
    },
    {
      enunciado: 'Num triângulo rectângulo com catetos 3 e 4, qual é a hipotenusa?',
      opcoes: ['4', '5', '6', '7'],
      resposta_correta: '5',
      dificuldade: 'dificil', pontos: 15,
    },
    {
      enunciado: 'Quanto é log₁₀(1000)?',
      opcoes: ['2', '3', '4', '10'],
      resposta_correta: '3',
      dificuldade: 'dificil', pontos: 15,
    },
  ],

  programacao: [
    {
      enunciado: 'Qual palavra-chave é usada para declarar uma variável em JavaScript (ES6+)?',
      opcoes: ['var', 'let', 'define', 'set'],
      resposta_correta: 'let',
      dificuldade: 'facil', pontos: 5,
    },
    {
      enunciado: 'O que significa HTML?',
      opcoes: [
        'HyperText Markup Language',
        'High Text Machine Learning',
        'HyperText Management Layer',
        'Hyper Transfer Markup Language',
      ],
      resposta_correta: 'HyperText Markup Language',
      dificuldade: 'facil', pontos: 5,
    },
    {
      enunciado: 'Qual símbolo é usado para comentários de linha em JavaScript?',
      opcoes: ['#', '//', '/**/', '--'],
      resposta_correta: '//',
      dificuldade: 'facil', pontos: 5,
    },
    {
      enunciado: 'O que é um array em programação?',
      opcoes: [
        'Uma variável que guarda apenas um valor',
        'Uma estrutura que guarda uma colecção de valores',
        'Uma função especial',
        'Um tipo de loop',
      ],
      resposta_correta: 'Uma estrutura que guarda uma colecção de valores',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'Qual método JavaScript remove o último elemento de um array?',
      opcoes: ['shift()', 'pop()', 'splice()', 'delete()'],
      resposta_correta: 'pop()',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'O que é o DOM?',
      opcoes: [
        'Document Object Model',
        'Data Object Manager',
        'Dynamic Output Module',
        'Document Oriented Method',
      ],
      resposta_correta: 'Document Object Model',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'Qual é o resultado de typeof null em JavaScript?',
      opcoes: ['null', 'undefined', 'object', 'string'],
      resposta_correta: 'object',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'O que significa REST em REST API?',
      opcoes: [
        'Remote Execution State Transfer',
        'Representational State Transfer',
        'Resource Encoding Standard Technology',
        'Remote Execution Standard Tool',
      ],
      resposta_correta: 'Representational State Transfer',
      dificuldade: 'dificil', pontos: 15,
    },
    {
      enunciado: 'O que faz o operador === em JavaScript?',
      opcoes: [
        'Compara apenas o valor',
        'Compara valor e tipo',
        'Atribui um valor',
        'Verifica se é nulo',
      ],
      resposta_correta: 'Compara valor e tipo',
      dificuldade: 'dificil', pontos: 15,
    },
    {
      enunciado: 'Em Big O Notation, qual é a complexidade de uma busca binária?',
      opcoes: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      resposta_correta: 'O(log n)',
      dificuldade: 'dificil', pontos: 15,
    },
  ],

  ingles: [
    {
      enunciado: 'What is the plural of "child"?',
      opcoes: ['childs', 'childes', 'children', 'childre'],
      resposta_correta: 'children',
      dificuldade: 'facil', pontos: 5,
    },
    {
      enunciado: 'Choose the correct sentence:',
      opcoes: [
        'She don\'t like coffee.',
        'She doesn\'t likes coffee.',
        'She doesn\'t like coffee.',
        'She not like coffee.',
      ],
      resposta_correta: 'She doesn\'t like coffee.',
      dificuldade: 'facil', pontos: 5,
    },
    {
      enunciado: 'What does "ubiquitous" mean?',
      opcoes: ['Rare', 'Present everywhere', 'Dangerous', 'Beautiful'],
      resposta_correta: 'Present everywhere',
      dificuldade: 'facil', pontos: 5,
    },
    {
      enunciado: 'Which is the correct Past Simple of "go"?',
      opcoes: ['goed', 'gone', 'went', 'goes'],
      resposta_correta: 'went',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'Complete: "If I ___ rich, I would travel the world."',
      opcoes: ['am', 'was', 'were', 'be'],
      resposta_correta: 'were',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'What is the synonym of "brave"?',
      opcoes: ['Cowardly', 'Courageous', 'Timid', 'Weak'],
      resposta_correta: 'Courageous',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'Which sentence is in the Present Perfect tense?',
      opcoes: [
        'I eat breakfast every day.',
        'I ate breakfast this morning.',
        'I have eaten breakfast.',
        'I will eat breakfast.',
      ],
      resposta_correta: 'I have eaten breakfast.',
      dificuldade: 'medio', pontos: 10,
    },
    {
      enunciado: 'What does the idiom "break a leg" mean?',
      opcoes: [
        'To get injured',
        'To good luck',
        'To fail',
        'To stop running',
      ],
      resposta_correta: 'To good luck',
      dificuldade: 'dificil', pontos: 15,
    },
    {
      enunciado: 'Which word correctly completes: "Neither John ___ Mary was at the party."?',
      opcoes: ['or', 'nor', 'and', 'but'],
      resposta_correta: 'nor',
      dificuldade: 'dificil', pontos: 15,
    },
    {
      enunciado: 'Identify the passive voice sentence:',
      opcoes: [
        'The teacher explained the lesson.',
        'The lesson was explained by the teacher.',
        'The teacher is explaining the lesson.',
        'The teacher had explained the lesson.',
      ],
      resposta_correta: 'The lesson was explained by the teacher.',
      dificuldade: 'dificil', pontos: 15,
    },
  ],
};

// ─── Labels para cada disciplina ──────────────────────────────────────────

const DISCIPLINA_LABELS = {
  matematica:   'Matemática',
  programacao:  'Programação',
  ingles:       'Inglês',
};

// ─── Função principal ─────────────────────────────────────────────────────

async function seed() {
  await sequelize.authenticate();
  console.log('✅ Ligação à base de dados estabelecida\n');

  // Obter o admin (ID 1)
  const admin = await Usuario.findByPk(1);
  if (!admin) {
    console.error('❌ Admin (ID=1) não encontrado. Cria o admin primeiro.');
    process.exit(1);
  }
  console.log(`👤 Admin: ${admin.nome} (ID ${admin.id})\n`);

  const CONTEXTOS = ['torneio', 'teste'];
  const DISCIPLINAS = ['matematica', 'programacao', 'ingles'];

  const DIFICULDADES = {
    matematica:  'facil',
    programacao: 'medio',
    ingles:      'dificil',
  };

  const resultados = [];

  for (const contexto of CONTEXTOS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Criando blocos para contexto: ${contexto.toUpperCase()}`);
    console.log('='.repeat(60));

    for (const disciplina of DISCIPLINAS) {
      const label = DISCIPLINA_LABELS[disciplina];
      const dificuldade = DIFICULDADES[disciplina];
      const titulo = `${label} — ${contexto === 'torneio' ? 'Torneio' : 'Teste'} — ${dificuldade.charAt(0).toUpperCase() + dificuldade.slice(1)}`;

      // 1. Criar o bloco
      const bloco = await BlocoQuestoes.create({
        titulo,
        descricao: `Bloco de ${label} para ${contexto === 'torneio' ? 'torneios competitivos' : 'testes de conhecimento'}. Dificuldade: ${dificuldade}.`,
        disciplina,
        dificuldade,
        status: 'aprovado',          // pronto para usar
        aprovado_por_id: admin.id,
        data_aprovacao: new Date(),
        contexto,
        criado_por: admin.id,
      });

      console.log(`\n  ✅ Bloco criado: ID ${bloco.id} — "${titulo}"`);

      // 2. Criar e associar as 10 questões
      const qs = QUESTOES[disciplina];
      let adicionadas = 0;

      for (let i = 0; i < qs.length; i++) {
        const qData = qs[i];

        // Criar a questão na tabela questoes_teste_conhecimento
        const questao = await QuestaoTesteConhecimento.create({
          enunciado: qData.enunciado,
          opcoes: qData.opcoes,
          resposta_correta: qData.resposta_correta,
          dificuldade: qData.dificuldade,
          categoria: disciplina,
          pontos: qData.pontos,
          ativo: true,
        });

        // Associar ao bloco via BlocoQuestaoItem
        await BlocoQuestaoItem.create({
          bloco_id: bloco.id,
          questao_id: questao.id,
          ordem: i,
        });

        adicionadas++;
      }

      console.log(`     📝 ${adicionadas} questões adicionadas ao bloco`);
      resultados.push({ contexto, disciplina: label, dificuldade, bloco_id: bloco.id, questoes: adicionadas });
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('🎉 RESUMO FINAL');
  console.log('='.repeat(60));
  console.log('\nBlocos criados:\n');

  resultados.forEach(r => {
    const emoji = r.contexto === 'torneio' ? '🏆' : '📝';
    console.log(`  ${emoji} [${r.contexto.toUpperCase()}] ${r.disciplina.padEnd(12)} | ${r.dificuldade.padEnd(8)} | ID bloco: ${r.bloco_id} | ${r.questoes} questões`);
  });

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n💡 Próximos passos:');
  console.log('   1. Vai ao painel Admin → Torneios');
  console.log('   2. Cria ou seleciona um torneio');
  console.log('   3. Associa os blocos de torneio (IDs acima) ao torneio');
  console.log('   4. Activa o torneio para testares o fluxo');

  await sequelize.close();
}

seed().catch(err => {
  console.error('❌ Erro no seed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
