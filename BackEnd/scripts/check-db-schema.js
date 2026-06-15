/**
 * check-db-schema.js
 * Verifica a estrutura do banco de dados
 */

import sequelize from '../config/db.js';

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    console.log('📊 Tabelas relacionadas a questões:');
    const tables = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'comaes_db' 
      AND TABLE_NAME LIKE '%questao%'
      ORDER BY TABLE_NAME
    `);

    tables[0].forEach(row => {
      console.log(`   - ${row.TABLE_NAME}`);
    });

    console.log('\n📊 Estrutura de bloco_questoes_items:');
    const constraints = await sequelize.query(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'bloco_questoes_items'
      AND TABLE_SCHEMA = 'comaes_db'
    `);

    console.log('\nForeignKeys:');
    constraints[0].forEach(row => {
      console.log(`   - ${row.CONSTRAINT_NAME}: ${row.COLUMN_NAME} → ${row.REFERENCED_TABLE_NAME}.${row.REFERENCED_COLUMN_NAME}`);
    });

    console.log('\n📊 Estrutura de questoes_teste_conhecimento:');
    const qtkStructure = await sequelize.query(`
      DESC questoes_teste_conhecimento
    `);
    console.log(`   Colunas: ${qtkStructure[0].length}`);
    qtkStructure[0].slice(0, 5).forEach(row => {
      console.log(`   - ${row.Field}: ${row.Type}`);
    });
    console.log('   ...');

    console.log('\n📊 Estrutura de questoes:');
    const qStructure = await sequelize.query(`
      DESC questoes
    `);
    console.log(`   Colunas: ${qStructure[0].length}`);
    qStructure[0].slice(0, 5).forEach(row => {
      console.log(`   - ${row.Field}: ${row.Type}`);
    });
    console.log('   ...');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkSchema();
