import sequelize from '../config/db.js';
const { QueryTypes } = (await import('sequelize'));
const tid = 32;
const now = new Date();

const ins = async (titulo, descricao, disciplina, dificuldade, opcoes, resp, expl, pontos) => {
  const result = await sequelize.query(
    'INSERT INTO questoes (torneio_id,titulo,descricao,disciplina,tipo,dificuldade,opcoes,resposta_correta,explicacao,pontos,status_aprovacao,created_at,updated_at) VALUES (:tid,:titulo,:descricao,:disciplina,"multipla_escolha",:dificuldade,:opcoes,:resp,:expl,:pontos,"aprovada",:now,:now)',
    { replacements: { tid, titulo, descricao, disciplina, dificuldade, opcoes: JSON.stringify(opcoes), resp, expl, pontos, now }, type: QueryTypes.INSERT }
  );
  return result[0]; // insertId
};

// 1. Proporção - matemática - médio
const id1 = await ins(
  'Proporcao direta',
  'Se 4 macas custam 200 Kz, quanto custam 10 macas?',
  'matematica', 'medio',
  [{id:'a',texto:'400 Kz'},{id:'b',texto:'600 Kz'},{id:'c',texto:'500 Kz'},{id:'d',texto:'450 Kz'}],
  'c', 'Regra de tres: 4->200 Kz; 10->500 Kz.', 15
);
await sequelize.query(
  'INSERT INTO questoes_matematica (id,dificuldade,torneio_id,resposta_correta,pontos) VALUES (:id,"medio",:tid,"c",15)',
  { replacements: { id: id1, tid }, type: QueryTypes.INSERT }
);
console.log('Matematica proporcao OK, id:', id1);

// 2. Prepositions of time - inglês - médio
const id2 = await ins(
  'Prepositions of Time',
  'The meeting is ___ Monday ___ 9 AM.',
  'ingles', 'medio',
  [{id:'a',texto:'in / at'},{id:'b',texto:'on / at'},{id:'c',texto:'at / in'},{id:'d',texto:'on / in'}],
  'b', 'Days of the week use "on"; specific times use "at".', 15
);
await sequelize.query(
  'INSERT INTO questoes_ingles (id,dificuldade,torneio_id,resposta_correta,pontos) VALUES (:id,"medio",:tid,"b",15)',
  { replacements: { id: id2, tid }, type: QueryTypes.INSERT }
);
console.log('Ingles prepositions OK, id:', id2);

// 3. Deadlock - programação - difícil
const id3 = await ins(
  'Concorrencia e Deadlock',
  'O que e um deadlock em sistemas concorrentes?',
  'programacao', 'dificil',
  [
    {id:'a',texto:'Quando um processo termina inesperadamente'},
    {id:'b',texto:'Quando dois processos ficam bloqueados esperando por recursos um do outro'},
    {id:'c',texto:'Quando a memoria RAM esta cheia'},
    {id:'d',texto:'Quando um loop executa infinitamente'}
  ],
  'b', 'Deadlock: dois processos esperam mutuamente por recursos detidos entre si.', 20
);
await sequelize.query(
  'INSERT INTO questoes_programacao (id,dificuldade,torneio_id,resposta_correta,pontos) VALUES (:id,"dificil",:tid,"b",20)',
  { replacements: { id: id3, tid }, type: QueryTypes.INSERT }
);
console.log('Programacao deadlock OK, id:', id3);

// Contagem final
const rows = await sequelize.query(
  'SELECT disciplina, dificuldade, COUNT(*) as total FROM questoes WHERE torneio_id=32 GROUP BY disciplina,dificuldade ORDER BY disciplina,dificuldade',
  { type: QueryTypes.SELECT }
);
let grand = 0;
console.log('\n=== RESULTADO FINAL ===');
rows.forEach(r => { console.log(r.disciplina.padEnd(14), r.dificuldade.padEnd(10), r.total); grand += parseInt(r.total); });
console.log('TOTAL GERAL:', grand);
process.exit(0);
