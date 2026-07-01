import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // Ler e executar o SQL
    const sqlFile = path.join(__dirname, 'populate-questoes-colaboradores-v2.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    const results = await connection.query(sql);
    
    console.log('✅ Questões de colaboradores inseridas com sucesso!\n');
    console.log('📊 Resultados da população:\n');
    
    // Mostrar estatísticas
    const [blocos] = await connection.query(`
      SELECT COUNT(*) as total FROM blocos_questoes WHERE titulo IN ('Fundamentos de Matemática', 'Estruturas de Dados e Programação', 'English Essentials')
    `);
    
    const [questoes] = await connection.query(`
      SELECT categoria, COUNT(*) as total 
      FROM questoes_teste_conhecimento 
      WHERE enunciado LIKE '%Adição de Frações%' 
         OR enunciado LIKE '%Teorema de Pitágoras%'
         OR enunciado LIKE '%Progressão Aritmética%'
         OR enunciado LIKE '%O que é Variável%'
         OR enunciado LIKE '%Loops em Python%'
         OR enunciado LIKE '%Funções em JavaScript%'
         OR enunciado LIKE '%Banco de Dados%'
         OR enunciado LIKE '%Verbo To Be%'
         OR enunciado LIKE '%Vocabulário Básico%'
         OR enunciado LIKE '%Singular e Plural%'
      GROUP BY categoria
    `);
    
    console.log(`✅ Blocos criados: ${blocos[0].total}`);
    console.log(`✅ Questões criadas:\n`);
    
    let totalQuestoes = 0;
    for (const q of questoes) {
      console.log(`   - ${q.categoria.toUpperCase()}: ${q.total} questões`);
      totalQuestoes += q.total;
    }
    
    console.log(`\n🎉 Total de ${totalQuestoes} questões distribuídas em 3 disciplinas!`);
    
    // Listar blocos criados
    const [blocosList] = await connection.query(`
      SELECT id, titulo, disciplina, dificuldade FROM blocos_questoes WHERE titulo IN ('Fundamentos de Matemática', 'Estruturas de Dados e Programação', 'English Essentials')
    `);
    
    console.log('\n📚 Blocos criados:');
    for (const bloco of blocosList) {
      console.log(`   - ${bloco.titulo}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error.message);
  } finally {
    await connection.end();
  }
}

executarSQL();
