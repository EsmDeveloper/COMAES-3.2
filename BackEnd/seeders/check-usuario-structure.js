// Script para verificar estrutura da tabela usuarios
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '../.env' });

async function checkStructure() {
  console.log('🔍 Verificando estrutura da tabela usuarios...\n');

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

    // Verificar se a tabela existe
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'comaes_db' 
      AND TABLE_NAME = 'usuarios'
    `);

    if (tables.length === 0) {
      console.log('❌ Tabela usuarios não existe!\n');
      return;
    }

    console.log('📋 Estrutura da tabela usuarios:\n');

    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'comaes_db' 
      AND TABLE_NAME = 'usuarios'
      ORDER BY ORDINAL_POSITION
    `);

    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME.padEnd(30)} | ${col.COLUMN_TYPE.padEnd(25)} | ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Verificar se 'role' existe
    const hasRole = columns.some(col => col.COLUMN_NAME === 'role');
    console.log(`\n${hasRole ? '✅' : '❌'} Coluna 'role' ${hasRole ? 'EXISTE' : 'NÃO EXISTE'}`);

    // Verificar se 'disciplina_colaborador' existe
    const hasDisciplina = columns.some(col => col.COLUMN_NAME === 'disciplina_colaborador');
    console.log(`${hasDisciplina ? '✅' : '❌'} Coluna 'disciplina_colaborador' ${hasDisciplina ? 'EXISTE' : 'NÃO EXISTE'}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkStructure();
