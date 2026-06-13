/**
 * debug_jojo.js
 * 
 * Debug específico para ver exatamente o que está salvo para Jojo
 */

import sequelize from './config/db.js';

async function debug() {
  try {
    console.log('🔍 Procurando dados de Jojo...\n');

    const result = await sequelize.query(
      `SELECT * FROM usuarios WHERE nome LIKE '%Jojo%' OR username = 'jojo' OR email LIKE '%jojo%'`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (result.length === 0) {
      console.log('❌ Nenhum Jojo encontrado.');
    } else {
      result.forEach(user => {
        console.log('📋 Usuário encontrado:');
        console.log(JSON.stringify(user, null, 2));
        console.log('\n');
      });
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

debug();
