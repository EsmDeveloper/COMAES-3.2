import sequelize from '../config/db.js';
const { QueryTypes } = await import('sequelize');

const [m] = await sequelize.query('DESCRIBE matematica_original');
console.log('=== MATEMATICA_ORIGINAL ===');
m.forEach(f => console.log(f.Field, '|', f.Type, '| null:', f.Null, '| default:', f.Default));

const [i] = await sequelize.query('DESCRIBE ingles_original');
console.log('\n=== INGLES_ORIGINAL ===');
i.forEach(f => console.log(f.Field, '|', f.Type, '| null:', f.Null, '| default:', f.Default));

const [p] = await sequelize.query('DESCRIBE programacao_original');
console.log('\n=== PROGRAMACAO_ORIGINAL ===');
p.forEach(f => console.log(f.Field, '|', f.Type, '| null:', f.Null, '| default:', f.Default));

const torneos = await sequelize.query(
  "SELECT id,titulo,status FROM torneios WHERE status='ativo' LIMIT 1",
  { type: QueryTypes.SELECT }
);
console.log('\n=== TORNEIO ATIVO ===', JSON.stringify(torneos[0]));

// Contar existentes
const counts = await sequelize.query(
  'SELECT (SELECT COUNT(*) FROM matematica_original) m, (SELECT COUNT(*) FROM ingles_original) i, (SELECT COUNT(*) FROM programacao_original) p',
  { type: QueryTypes.SELECT }
);
console.log('Existentes:', counts[0]);

process.exit(0);
