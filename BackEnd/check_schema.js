/**
 * Check Database Schema
 * Verifica se as colunas tipo_torneio e disciplina_especifica existem
 */
import sequelize from './config/db.js';
import { DataTypes } from 'sequelize';

async function checkSchema() {
  try {
    console.log('🔍 Verificando schema do banco de dados...\n');

    const tableInfo = await sequelize.queryInterface.describeTable('torneios');
    
    console.log('[LIST] Colunas na tabela torneios:');
    Object.keys(tableInfo).forEach(column => {
      console.log(`   - ${column}: ${tableInfo[column].type}`);
    });

    console.log('\n\n');

    if (tableInfo.tipo_torneio) {
      console.log('[SUCCESS] Coluna tipo_torneio EXISTE');
    } else {
      console.log('[ERROR] Coluna tipo_torneio NÃO EXISTE!');
    }

    if (tableInfo.disciplina_especifica) {
      console.log('[SUCCESS] Coluna disciplina_especifica EXISTE');
    } else {
      console.log('[ERROR] Coluna disciplina_especifica NÃO EXISTE!');
    }

    console.log('\n\n');

    // Executar query raw para ver estrutura
    const result = await sequelize.query(`DESCRIBE torneios`, { raw: true });
    console.log('[CHART] Estrutura completa:');
    console.log(result[0]);

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] ERRO:', error.message);
    process.exit(1);
  }
}

checkSchema();
