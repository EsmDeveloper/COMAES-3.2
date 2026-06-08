import sequelize from '../config/db.js';
const { QueryTypes } = await import('sequelize');

const tables = await sequelize.query('SHOW TABLES', { type: QueryTypes.SELECT });
const names = tables.map(t => Object.values(t)[0]).sort();
console.log('Todas as tabelas:');
names.forEach(n => console.log(' ', n));

// Encontrar torneio ativo
const torneos = await sequelize.query(
  "SELECT id,titulo,status FROM torneios WHERE status='ativo' LIMIT 1",
  { type: QueryTypes.SELECT }
);
console.log('\nTorneio ativo:', JSON.stringify(torneos[0]));

process.exit(0);
