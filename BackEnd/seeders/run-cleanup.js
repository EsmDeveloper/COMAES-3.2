import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executarLimpeza() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'comaes_db',
    multipleStatements: true,
  });

  console.log('🗑️  Iniciando limpeza de questões de torneios e testes...\n');

  try {
    // Contar questões antes da limpeza
    const [torneiosBefore] = await connection.query(`
      SELECT COUNT(*) as total FROM questoes WHERE torneio_id IS NOT NULL
    `);
    
    const [testesBefore] = await connection.query(`
      SELECT COUNT(*) as total FROM questoes_teste_conhecimento
    `);

    console.log('📊 STATUS ANTES DA LIMPEZA:');
    console.log(`   - Questões de Torneios: ${torneiosBefore[0].total}`);
    console.log(`   - Questões de Testes: ${testesBefore[0].total}\n`);

    // Ler e executar o SQL
    const sqlFile = path.join(__dirname, 'cleanup-questoes-torneio-teste.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Dividir em comandos individuais para melhor controle
    const commands = sql.split('-- ');
    
    // Executar a limpeza
    await connection.query(`
      DELETE FROM bloco_questoes_items 
      WHERE questao_id IN (SELECT id FROM questoes WHERE torneio_id IS NOT NULL)
        OR questao_id IN (SELECT id FROM questoes_teste_conhecimento)
    `);
    console.log('✅ Removidas associações nos blocos');

    await connection.query(`
      DELETE FROM tentativas_respostas 
      WHERE questao_id IN (SELECT id FROM questoes WHERE torneio_id IS NOT NULL)
        OR questao_id IN (SELECT id FROM questoes_teste_conhecimento)
    `);
    console.log('✅ Removidas tentativas de resposta');

    const [delTorneios] = await connection.query(`
      DELETE FROM questoes WHERE torneio_id IS NOT NULL
    `);
    console.log(`✅ Deletadas ${delTorneios.affectedRows} questões de torneios`);

    const [delTestes] = await connection.query(`
      DELETE FROM questoes_teste_conhecimento
    `);
    console.log(`✅ Deletadas ${delTestes.affectedRows} questões de testes\n`);

    // Contar questões após a limpeza
    const [torneiosAfter] = await connection.query(`
      SELECT COUNT(*) as total FROM questoes WHERE torneio_id IS NOT NULL
    `);
    
    const [testesAfter] = await connection.query(`
      SELECT COUNT(*) as total FROM questoes_teste_conhecimento
    `);

    console.log('📊 STATUS APÓS A LIMPEZA:');
    console.log(`   - Questões de Torneios: ${torneiosAfter[0].total}`);
    console.log(`   - Questões de Testes: ${testesAfter[0].total}\n`);

    console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log(`   ✅ Total deletado: ${delTorneios.affectedRows + delTestes.affectedRows} questões`);
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

executarLimpeza();
