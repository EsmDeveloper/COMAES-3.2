/**
 * Script para aplicar colunas em falta na tabela participantes_torneios
 * Executa: posicao_congelada e tempo_congelamento
 */
import sequelize from '../config/db.js';

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // Verificar quais colunas já existem
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'comaes_db' 
        AND TABLE_NAME = 'participantes_torneios'
        AND COLUMN_NAME IN ('posicao_congelada', 'tempo_congelamento')
    `);

    const existingCols = columns.map(c => c.COLUMN_NAME);
    console.log('Colunas já existentes:', existingCols);

    if (!existingCols.includes('posicao_congelada')) {
      await sequelize.query(`
        ALTER TABLE participantes_torneios 
        ADD COLUMN posicao_congelada BOOLEAN NOT NULL DEFAULT FALSE
      `);
      console.log('✅ Coluna posicao_congelada adicionada');
    } else {
      console.log('ℹ️  posicao_congelada já existe, pulando');
    }

    if (!existingCols.includes('tempo_congelamento')) {
      await sequelize.query(`
        ALTER TABLE participantes_torneios 
        ADD COLUMN tempo_congelamento DATETIME NULL DEFAULT NULL
      `);
      console.log('✅ Coluna tempo_congelamento adicionada');
    } else {
      console.log('ℹ️  tempo_congelamento já existe, pulando');
    }

    console.log('\n🎉 Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  }
}

runMigration();
