/**
 * Migration: Adicionar coluna 'contexto' à tabela questoes
 * Data: 2026-06-22
 * Objetivo: Permitir categorizar questões por contexto (torneio, teste, colaborador)
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'comaes',
  port: process.env.DB_PORT || 3306
};

async function addContextoColumn() {
  let connection;
  
  try {
    console.log('🔗 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado com sucesso!\n');

    // Verificar se a coluna já existe
    console.log('🔍 Verificando se a coluna "contexto" já existe...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM questoes LIKE 'contexto'
    `);

    if (columns.length > 0) {
      console.log('⚠️  A coluna "contexto" já existe na tabela questoes.');
      console.log('   Nada a fazer.\n');
      return;
    }

    console.log('➕ Adicionando coluna "contexto" à tabela questoes...');
    
    // Adicionar a coluna contexto
    await connection.query(`
      ALTER TABLE questoes 
      ADD COLUMN contexto ENUM('torneio', 'teste', 'colaborador') 
      DEFAULT 'colaborador' 
      AFTER motivo_rejeicao
    `);

    console.log('✅ Coluna "contexto" adicionada com sucesso!\n');

    // Atualizar questões existentes baseado em suas relações
    console.log('🔄 Atualizando contexto das questões existentes...');
    
    // Questões com bloco_id (geralmente de torneios ou testes)
    const [blocosResult] = await connection.query(`
      UPDATE questoes q
      INNER JOIN blocos_questoes b ON q.bloco_id = b.id
      SET q.contexto = b.contexto
      WHERE q.bloco_id IS NOT NULL AND b.contexto IS NOT NULL
    `);
    console.log(`   ✓ ${blocosResult.affectedRows} questões atualizadas com contexto do bloco`);

    // Questões com torneio_id mas sem bloco_id
    const [torneiosResult] = await connection.query(`
      UPDATE questoes 
      SET contexto = 'torneio'
      WHERE torneio_id IS NOT NULL AND bloco_id IS NULL
    `);
    console.log(`   ✓ ${torneiosResult.affectedRows} questões marcadas como 'torneio'`);

    // Questões criadas por colaboradores (autor_id não é admin)
    const [colaboradorResult] = await connection.query(`
      UPDATE questoes q
      INNER JOIN usuarios u ON q.autor_id = u.id
      SET q.contexto = 'colaborador'
      WHERE u.role = 'colaborador' 
        AND q.torneio_id IS NULL 
        AND q.bloco_id IS NULL
    `);
    console.log(`   ✓ ${colaboradorResult.affectedRows} questões marcadas como 'colaborador'`);

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('\n📊 Resumo:');
    const [stats] = await connection.query(`
      SELECT 
        contexto,
        COUNT(*) as total
      FROM questoes
      GROUP BY contexto
    `);
    
    console.log('\nDistribuição de questões por contexto:');
    stats.forEach(row => {
      console.log(`   - ${row.contexto || 'NULL'}: ${row.total} questões`);
    });

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão encerrada.');
    }
  }
}

// Executar migração
console.log('🚀 Iniciando migração: Adicionar coluna "contexto" à tabela questoes\n');
addContextoColumn()
  .then(() => {
    console.log('\n✅ Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
