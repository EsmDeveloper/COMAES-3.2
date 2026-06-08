import sequelize from './config/db.js';

(async () => {
  try {
    // Get all tables
    const tables = await sequelize.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'comaes_db'
      ORDER BY TABLE_NAME
    `);
    
    console.log('\n📋 Tabelas no banco de dados:');
    tables[0].forEach(t => console.log('  -', t.TABLE_NAME));

    // Count test questions
    const testQs = await sequelize.query('SELECT COUNT(*) as total FROM questoes_teste_conhecimento');
    console.log('\n📚 Questões de Teste de Conhecimento:', testQs[0][0]?.total || 0);

    // Count blocks
    const blocks = await sequelize.query('SELECT COUNT(*) as total FROM blocos_questoes');
    console.log('📦 Blocos de Questões:', blocks[0][0]?.total || 0);

    // Count regular questions
    const questions = await sequelize.query('SELECT COUNT(*) as total FROM questoes');
    console.log('❓ Total de Questões:', questions[0][0]?.total || 0);

    // Count by collaborator status
    const colabs = await sequelize.query(`
      SELECT status_colaborador, COUNT(*) as total 
      FROM usuarios 
      WHERE role = 'colaborador'
      GROUP BY status_colaborador
    `);
    console.log('\n👥 Colaboradores:');
    colabs[0].forEach(c => console.log(`  - ${c.status_colaborador}: ${c.total}`));

    process.exit(0);
  } catch (e) {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  }
})();
