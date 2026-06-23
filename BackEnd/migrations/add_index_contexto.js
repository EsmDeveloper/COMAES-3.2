/**
 * Migration: Adicionar índice à coluna 'contexto' na tabela questoes
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'comaes',
  port: process.env.DB_PORT || 3306
};

async function addIndex() {
  let connection;
  
  try {
    console.log('🔗 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado com sucesso!\n');

    // Verificar se o índice já existe
    console.log('🔍 Verificando se o índice já existe...');
    const [indexes] = await connection.query(`
      SHOW INDEX FROM questoes WHERE Key_name = 'idx_contexto'
    `);

    if (indexes.length > 0) {
      console.log('⚠️  O índice "idx_contexto" já existe.');
      return;
    }

    console.log('➕ Adicionando índice à coluna "contexto"...');
    await connection.query(`
      ALTER TABLE questoes ADD INDEX idx_contexto (contexto)
    `);

    console.log('✅ Índice adicionado com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão encerrada.');
    }
  }
}

addIndex()
  .then(() => {
    console.log('\n✅ Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
