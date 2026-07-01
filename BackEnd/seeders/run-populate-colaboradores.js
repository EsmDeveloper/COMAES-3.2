import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function executarSQL() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'comaes_db',
    multipleStatements: true,
  });

  console.log('🌱 Iniciando população de Questões de Colaboradores...\n');

  try {
    const sql = fs.readFileSync('./seeders/populate-questoes-colaboradores.sql', 'utf8');
    
    const results = await connection.query(sql);
    
    console.log('✅ Questões de colaboradores inseridas com sucesso!\n');
    console.log('📊 Resultados da população:\n');
    
    // Mostrar estatísticas
    const [blocos] = await connection.query(`
      SELECT COUNT(*) as total FROM blocos_questoes WHERE titulo IN ('Fundamentos de Matemática', 'Estruturas de Dados e Programação', 'English Essentials')
    `);
    
    const [questoes] = await connection.query(`
      SELECT disciplina, COUNT(*) as total 
      FROM questoes 
      WHERE contexto = 'colaborador' 
      GROUP BY disciplina
    `);
    
    console.log(`✅ Blocos criados: ${blocos[0].total}`);
    console.log(`✅ Questões criadas:\n`);
    
    for (const q of questoes) {
      console.log(`   - ${q.disciplina.toUpperCase()}: ${q.total} questões`);
    }
    
    console.log(`\n🎉 Total de ${questoes.reduce((a, b) => a + b.total, 0)} questões distribuídas em 3 disciplinas!`);
    
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error.message);
  } finally {
    await connection.end();
  }
}

executarSQL();
