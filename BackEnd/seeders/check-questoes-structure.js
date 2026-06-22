// Script para verificar estrutura da tabela questoes
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '../.env' });

async function checkStructure() {
  console.log('🔍 Verificando estrutura da tabela questoes...\n');

  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'comaes_db'
    });

    console.log('✅ Conectado ao banco de dados\n');

    console.log('📋 Estrutura da tabela questoes:\n');

    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'comaes_db' 
      AND TABLE_NAME = 'questoes'
      ORDER BY ORDINAL_POSITION
    `);

    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME.padEnd(30)} | ${col.COLUMN_TYPE.padEnd(30)} | ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkStructure();
