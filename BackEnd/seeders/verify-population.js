// Script para verificar a população do banco
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '../.env' });

async function verifyPopulation() {
  console.log('🔍 VERIFICAÇÃO DA POPULAÇÃO DO BANCO\n');
  console.log('='.repeat(70) + '\n');

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

    // 1. Total geral
    const [total] = await connection.query('SELECT COUNT(*) as total FROM questoes');
    console.log(`📊 TOTAL DE QUESTÕES: ${total[0].total}\n`);

    // 2. Por status e disciplina
    const [byStatus] = await connection.query(`
      SELECT 
        status_aprovacao,
        disciplina,
        COUNT(*) as total,
        GROUP_CONCAT(DISTINCT tipo) as tipos
      FROM questoes
      GROUP BY status_aprovacao, disciplina
      ORDER BY status_aprovacao, disciplina
    `);

    console.log('📋 QUESTÕES POR STATUS E DISCIPLINA:\n');
    byStatus.forEach(row => {
      console.log(`  ${row.status_aprovacao.toUpperCase().padEnd(12)} | ${row.disciplina.padEnd(15)} | ${row.total.toString().padStart(2)} questões | Tipos: ${row.tipos}`);
    });

    // 3. Detalhes das questões aprovadas
    console.log('\n' + '='.repeat(70) + '\n');
    console.log('✅ QUESTÕES APROVADAS (Torneios + Testes):\n');
    
    const [aprovadas] = await connection.query(`
      SELECT titulo, disciplina, dificuldade, tipo, pontos
      FROM questoes
      WHERE status_aprovacao = 'aprovada'
      ORDER BY disciplina, dificuldade, titulo
      LIMIT 10
    `);

    aprovadas.forEach((q, index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. [${q.disciplina.toUpperCase().padEnd(12)}] [${q.dificuldade.padEnd(7)}] ${q.titulo.substring(0, 40).padEnd(42)} (${q.tipo}, ${q.pontos}pts)`);
    });

    if (aprovadas.length > 10) {
      console.log(`  ... e mais ${aprovadas.length - 10} questões`);
    }

    // 4. Detalhes das questões pendentes
    console.log('\n' + '='.repeat(70) + '\n');
    console.log('⏳ QUESTÕES PENDENTES (Criadas por Rufus):\n');
    
    const [pendentes] = await connection.query(`
      SELECT titulo, disciplina, dificuldade, tipo, pontos
      FROM questoes
      WHERE status_aprovacao = 'pendente'
      ORDER BY disciplina, dificuldade, titulo
    `);

    if (pendentes.length === 0) {
      console.log('  ⚠️  Nenhuma questão pendente encontrada!');
    } else {
      pendentes.forEach((q, index) => {
        console.log(`  ${(index + 1).toString().padStart(2)}. [${q.disciplina.toUpperCase().padEnd(12)}] [${q.dificuldade.padEnd(7)}] ${q.titulo.substring(0, 40).padEnd(42)} (${q.tipo}, ${q.pontos}pts)`);
      });
    }

    // 5. Verificar distribuição por dificuldade
    console.log('\n' + '='.repeat(70) + '\n');
    console.log('📊 DISTRIBUIÇÃO POR DIFICULDADE:\n');
    
    const [byDiff] = await connection.query(`
      SELECT 
        dificuldade,
        status_aprovacao,
        COUNT(*) as total
      FROM questoes
      GROUP BY dificuldade, status_aprovacao
      ORDER BY 
        CASE dificuldade 
          WHEN 'facil' THEN 1 
          WHEN 'medio' THEN 2 
          WHEN 'dificil' THEN 3 
        END,
        status_aprovacao
    `);

    byDiff.forEach(row => {
      console.log(`  ${row.dificuldade.toUpperCase().padEnd(8)} | ${row.status_aprovacao.padEnd(12)} | ${row.total} questões`);
    });

    // 6. Verificar questões por tipo
    console.log('\n' + '='.repeat(70) + '\n');
    console.log('🔧 DISTRIBUIÇÃO POR TIPO:\n');
    
    const [byType] = await connection.query(`
      SELECT 
        tipo,
        COUNT(*) as total
      FROM questoes
      GROUP BY tipo
      ORDER BY total DESC
    `);

    byType.forEach(row => {
      console.log(`  ${row.tipo.padEnd(20)} | ${row.total} questões`);
    });

    console.log('\n' + '='.repeat(70) + '\n');
    console.log('✅ VERIFICAÇÃO CONCLUÍDA!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyPopulation();
