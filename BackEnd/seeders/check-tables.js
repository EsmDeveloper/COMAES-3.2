// Script para verificar se as tabelas existem
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '../.env' });

async function checkTables() {
  console.log('🔍 Verificando tabelas do banco...\n');

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

    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'comaes_db' 
      AND TABLE_NAME IN ('questao', 'bloco_questoes', 'bloco_questao_item', 'usuario')
      ORDER BY TABLE_NAME
    `);

    console.log('📋 Tabelas encontradas:');
    if (tables.length === 0) {
      console.log('  ❌ Nenhuma tabela necessária encontrada!');
      console.log('\n⚠️  Você precisa executar as migrations primeiro!');
      console.log('    Execute: cd BackEnd && npx sequelize-cli db:migrate');
    } else {
      tables.forEach(row => {
        console.log(`  ✅ ${row.TABLE_NAME}`);
      });

      // Verificar se há dados
      console.log('\n📊 Registros existentes:');
      
      for (const table of tables) {
        const [count] = await connection.query(`SELECT COUNT(*) as total FROM ${table.TABLE_NAME}`);
        console.log(`  ${table.TABLE_NAME}: ${count[0].total} registros`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTables();
