// Script para popular o banco com questões
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function populateDatabase() {
  console.log('🌱 Iniciando população do banco de dados...\n');

  let connection;

  try {
    // Conectar ao banco
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'comaes_db',
      multipleStatements: true
    });

    console.log('✅ Conectado ao banco de dados\n');

    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'populate-simple.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 Executando script SQL...\n');

    // Executar o SQL
    const [results] = await connection.query(sql);

    console.log('✅ Script executado com sucesso!\n');

    // Mostrar estatísticas
    console.log('📊 ESTATÍSTICAS:\n');
    
    const [questoes] = await connection.query(`
      SELECT status_aprovacao, disciplina, COUNT(*) as total
      FROM questoes
      GROUP BY status_aprovacao, disciplina
      ORDER BY status_aprovacao, disciplina
    `);

    console.log('Questões por Status e Disciplina:');
    questoes.forEach(row => {
      console.log(`  ${row.status_aprovacao.padEnd(15)} | ${row.disciplina.padEnd(15)} | ${row.total} questões`);
    });

    console.log('');

    const [blocos] = await connection.query(`
      SELECT status, disciplina, COUNT(*) as total
      FROM blocos_questoes
      GROUP BY status, disciplina
      ORDER BY status, disciplina
    `);

    console.log('Blocos por Status e Disciplina:');
    blocos.forEach(row => {
      console.log(`  ${row.status.padEnd(15)} | ${row.disciplina.padEnd(15)} | ${row.total} blocos`);
    });

    console.log('\n✅ População concluída com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error.message);
    if (error.sqlMessage) {
      console.error('   SQL Error:', error.sqlMessage);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

populateDatabase();
