import sequelize from './config/db.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Deletar disciplinas com IDs 31-36 (as que foram criadas)
    console.log('  Removendo disciplinas criadas...');
    
    const [result] = await sequelize.query(
      "DELETE FROM disciplinas WHERE id IN (31, 32, 33, 34, 35, 36)"
    );

    console.log('✅ Disciplinas removidas\n');

    // Verificar quantas disciplinas restam
    const [count] = await sequelize.query('SELECT COUNT(*) as total FROM disciplinas');
    console.log(`📊 Total de disciplinas restantes: ${count[0].total}`);

    console.log('\n✅ Base de dados restaurada ao estado anterior!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();
