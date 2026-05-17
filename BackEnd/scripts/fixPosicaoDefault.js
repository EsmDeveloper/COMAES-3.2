/**
 * fixPosicaoDefault.js
 * 
 * Script para corrigir registros existentes com posicao = 9999
 * e atualizar o schema da tabela para DEFAULT NULL
 * 
 * Uso: node scripts/fixPosicaoDefault.js
 */

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'comaes_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: console.log
});

async function fixPosicaoDefault() {
  try {
    console.log('\n🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado!\n');

    // 1. Atualizar registros existentes com posicao = 9999 para NULL
    console.log('📝 Atualizando registros com posicao = 9999 para NULL...');
    const [results] = await sequelize.query(`
      UPDATE participantes_torneios 
      SET posicao = NULL 
      WHERE posicao = 9999
    `);
    console.log(`✅ ${results.affectedRows || 0} registros atualizados.\n`);

    // 2. Alterar o schema da coluna para DEFAULT NULL
    console.log('🔧 Alterando schema da coluna posicao para DEFAULT NULL...');
    await sequelize.query(`
      ALTER TABLE participantes_torneios 
      MODIFY COLUMN posicao int(11) DEFAULT NULL
    `);
    console.log('✅ Schema atualizado com sucesso!\n');

    // 3. Verificar a mudança
    console.log('🔍 Verificando a estrutura da coluna...');
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM participantes_torneios LIKE 'posicao'
    `);
    console.log('Estrutura atual da coluna posicao:');
    console.table(columns);

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('ℹ️  Agora as novas posições serão calculadas dinamicamente.\n');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixPosicaoDefault();
