/**
 * Script de Verificação: Coluna contexto e integridade dos dados
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'comaes',
  port: process.env.DB_PORT || 3306
};

async function verify() {
  let connection;
  
  try {
    console.log('🔍 VERIFICAÇÃO DE CORREÇÕES - Blocos e Contexto\n');
    console.log('='.repeat(60));
    
    connection = await mysql.createConnection(dbConfig);

    // 1. Verificar coluna contexto em questoes
    console.log('\n1️⃣ Verificando coluna "contexto" na tabela questoes...');
    const [contextoCols] = await connection.query(`
      SHOW COLUMNS FROM questoes LIKE 'contexto'
    `);
    
    if (contextoCols.length > 0) {
      console.log('   ✅ Coluna "contexto" existe');
      console.log('   📋 Tipo:', contextoCols[0].Type);
      console.log('   📋 Default:', contextoCols[0].Default || 'NULL');
    } else {
      console.log('   ❌ Coluna "contexto" NÃO existe');
    }

    // 2. Verificar índice
    console.log('\n2️⃣ Verificando índice na coluna "contexto"...');
    const [indexes] = await connection.query(`
      SHOW INDEX FROM questoes WHERE Column_name = 'contexto'
    `);
    
    if (indexes.length > 0) {
      console.log('   ✅ Índice existe:', indexes[0].Key_name);
    } else {
      console.log('   ⚠️  Nenhum índice encontrado');
    }

    // 3. Estatísticas de questões por contexto
    console.log('\n3️⃣ Distribuição de questões por contexto:');
    const [questoesStats] = await connection.query(`
      SELECT 
        contexto,
        COUNT(*) as total,
        SUM(CASE WHEN status_aprovacao = 'aprovada' THEN 1 ELSE 0 END) as aprovadas,
        SUM(CASE WHEN status_aprovacao = 'pendente' THEN 1 ELSE 0 END) as pendentes,
        SUM(CASE WHEN status_aprovacao = 'rejeitada' THEN 1 ELSE 0 END) as rejeitadas
      FROM questoes
      GROUP BY contexto
    `);
    
    questoesStats.forEach(row => {
      console.log(`\n   📊 Contexto: ${row.contexto || 'NULL'}`);
      console.log(`      • Total: ${row.total} questões`);
      console.log(`      • Aprovadas: ${row.aprovadas}`);
      console.log(`      • Pendentes: ${row.pendentes}`);
      console.log(`      • Rejeitadas: ${row.rejeitadas}`);
    });

    // 4. Verificar blocos com status
    console.log('\n4️⃣ Distribuição de blocos por status:');
    const [blocosStats] = await connection.query(`
      SELECT 
        status,
        COUNT(*) as total,
        SUM(CASE WHEN contexto = 'torneio' THEN 1 ELSE 0 END) as torneios,
        SUM(CASE WHEN contexto = 'teste' THEN 1 ELSE 0 END) as testes
      FROM blocos_questoes
      GROUP BY status
    `);
    
    blocosStats.forEach(row => {
      console.log(`\n   📦 Status: ${row.status}`);
      console.log(`      • Total: ${row.total} blocos`);
      console.log(`      • Torneios: ${row.torneios}`);
      console.log(`      • Testes: ${row.testes}`);
    });

    // 5. Verificar blocos aprovados de colaboradores
    console.log('\n5️⃣ Blocos aprovados criados por colaboradores:');
    const [blocosColab] = await connection.query(`
      SELECT 
        b.id,
        b.titulo,
        b.disciplina,
        b.status,
        b.contexto,
        u.nome as autor
      FROM blocos_questoes b
      INNER JOIN usuarios u ON b.criado_por = u.id
      WHERE u.role = 'colaborador' AND b.status = 'aprovado'
      LIMIT 5
    `);
    
    if (blocosColab.length > 0) {
      console.log(`   ✅ ${blocosColab.length} blocos aprovados encontrados:`);
      blocosColab.forEach((bloco, idx) => {
        console.log(`\n   ${idx + 1}. ${bloco.titulo}`);
        console.log(`      • ID: ${bloco.id}`);
        console.log(`      • Disciplina: ${bloco.disciplina}`);
        console.log(`      • Contexto: ${bloco.contexto}`);
        console.log(`      • Autor: ${bloco.autor}`);
      });
    } else {
      console.log('   ℹ️  Nenhum bloco aprovado de colaboradores encontrado');
    }

    // 6. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ VERIFICAÇÃO CONCLUÍDA\n');
    
    const [totalQuestoes] = await connection.query(`SELECT COUNT(*) as total FROM questoes`);
    const [totalBlocos] = await connection.query(`SELECT COUNT(*) as total FROM blocos_questoes`);
    
    console.log('📈 Resumo Geral:');
    console.log(`   • ${totalQuestoes[0].total} questões no sistema`);
    console.log(`   • ${totalBlocos[0].total} blocos no sistema`);
    console.log('\n✅ Sistema pronto para uso!');

  } catch (error) {
    console.error('\n❌ Erro durante verificação:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
