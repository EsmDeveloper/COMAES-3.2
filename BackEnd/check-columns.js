import sequelize from './config/db.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Obter informações sobre a tabela usuarios
    const [columns] = await sequelize.query(
      "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuarios' AND TABLE_SCHEMA = DATABASE() ORDER BY ORDINAL_POSITION"
    );

    console.log('📋 Colunas da tabela "usuarios":\n');
    columns.forEach((col, idx) => {
      const nullable = col.IS_NULLABLE === 'YES' ? '(nullable)' : '(obrigatório)';
      console.log(`${idx + 1}. ${col.COLUMN_NAME.padEnd(30)} ${col.COLUMN_TYPE.padEnd(20)} ${nullable}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();
