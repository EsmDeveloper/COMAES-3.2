import sequelize from './config/db.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('[SUCCESS] Conectado\n');

    // Tentar diferentes formas de query
    console.log('[1] Teste com QueryTypes.SELECT:');
    const [result1] = await sequelize.query(
      "SELECT id, nome, email, password FROM usuarios WHERE role = 'admin' LIMIT 1",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('   Resultado:', result1);

    console.log('\n[2] Teste sem type:');
    const result2 = await sequelize.query(
      "SELECT id, nome, email, password FROM usuarios WHERE role = 'admin' LIMIT 1"
    );
    console.log('   Resultado:', result2);

    console.log('\n[3] Teste findOne do model:');
    const Usuario = (await import('./models/User.js')).default;
    const result3 = await Usuario.findOne({ where: { role: 'admin' } });
    console.log('   Resultado:', result3 ? result3.toJSON() : 'NULL');

    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Erro:', err.message);
    process.exit(1);
  }
})();
