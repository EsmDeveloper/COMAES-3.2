/**
 * Cleanup: garantir exactamente 60 questões para o torneio 32
 * 20 por disciplina: 7 facil + 7 medio + 6 dificil
 */
import sequelize from '../config/db.js';
const { QueryTypes } = await import('sequelize');
const tid = 32;

// Para cada disciplina+dificuldade manter apenas os primeiros N
async function manter(disciplina, dificuldade, limite) {
  const rows = await sequelize.query(
    'SELECT id FROM questoes WHERE torneio_id=:tid AND disciplina=:d AND dificuldade=:dif ORDER BY id ASC',
    { replacements: { tid, d: disciplina, dif: dificuldade }, type: QueryTypes.SELECT }
  );
  const excesso = rows.slice(limite); // manter só os primeiros `limite`
  for (const r of excesso) {
    // Remover das tabelas filho primeiro
    await sequelize.query(`DELETE FROM questoes_${disciplina} WHERE id=:id`, { replacements: { id: r.id }, type: QueryTypes.DELETE });
    await sequelize.query('DELETE FROM questoes WHERE id=:id', { replacements: { id: r.id }, type: QueryTypes.DELETE });
    console.log(`Removido ${disciplina}/${dificuldade} id=${r.id}`);
  }
}

// Target: 7 facil + 7 medio + 6 dificil = 20 por disciplina
for (const disc of ['matematica', 'ingles', 'programacao']) {
  await manter(disc, 'facil', 7);
  await manter(disc, 'medio', 7);
  await manter(disc, 'dificil', 6);
}

// Verificação final
const rows = await sequelize.query(
  'SELECT disciplina, dificuldade, COUNT(*) as total FROM questoes WHERE torneio_id=32 GROUP BY disciplina,dificuldade ORDER BY disciplina,dificuldade',
  { type: QueryTypes.SELECT }
);
let grand = 0;
console.log('\n=== RESULTADO FINAL ===');
rows.forEach(r => {
  console.log(r.disciplina.padEnd(14), r.dificuldade.padEnd(10), r.total);
  grand += parseInt(r.total);
});
console.log('TOTAL GERAL:', grand, grand === 60 ? '✅' : '❌ (esperado 60)');
process.exit(0);
