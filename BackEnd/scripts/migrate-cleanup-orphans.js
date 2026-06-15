/**
 * migrate-cleanup-orphans.js
 * Script para limpar registros órfãos em bloco_questoes_items
 */

import sequelize from '../config/db.js';

async function migrate() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    console.log('📝 Analisando registros órfãos...');
    
    // Encontrar registros que não existem na tabela questoes
    const orphans = await sequelize.query(`
      SELECT bqi.id, bqi.questao_id, bqi.bloco_id
      FROM bloco_questoes_items bqi
      LEFT JOIN questoes q ON bqi.questao_id = q.id
      WHERE q.id IS NULL
    `);

    console.log(`   ℹ️  Encontrados ${orphans[0].length} registros órfãos`);
    
    if (orphans[0].length > 0) {
      console.log('   Deletando registros órfãos...');
      
      const orphanIds = orphans[0].map(row => row.id);
      
      await sequelize.query(`
        DELETE FROM bloco_questoes_items
        WHERE id IN (${orphanIds.join(',')})
      `);
      
      console.log(`   ✅ ${orphans[0].length} registros órfãos deletados`);
    }

    console.log('\n✅ Limpeza concluída com sucesso!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

migrate();
