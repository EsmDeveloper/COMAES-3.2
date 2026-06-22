// Script para mostrar todas as tabelas
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '../.env' });

async function showAllTables() {
  console.log('🔍 Listando TODAS as tabelas do banco...\n');

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
      ORDER BY TABLE_NAME
    `);

    console.log(`📋 Total de tabelas: ${tables.length}\n`);
    
    tables.forEach((row, index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. ${row.TABLE_NAME}`);
    });

    // Verificar tabelas relacionadas a questões
    console.log('\n\n🔍 Tabelas relacionadas a questões:');
    const questaoTables = tables.filter(t => 
      t.TABLE_NAME.toLowerCase().includes('quest') || 
      t.TABLE_NAME.toLowerCase().includes('bloco')
    );
    
    if (questaoTables.length > 0) {
      questaoTables.forEach(row => {
        console.log(`  ✅ ${row.TABLE_NAME}`);
      });
    } else {
      console.log('  ❌ Nenhuma tabela de questões encontrada');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

showAllTables();
