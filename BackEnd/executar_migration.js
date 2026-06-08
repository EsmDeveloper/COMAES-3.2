#!/usr/bin/env node

/**
 * Script para executar migration - Adicionar bloco_id a tabela questoes
 * Uso: node executar_migration.js
 */

import sequelize from './config/db.js';

async function executarMigration() {
  try {
    console.log('🔄 Iniciando migration...\n');

    // 1. Adicionar coluna bloco_id
    console.log('1️⃣  Adicionando coluna bloco_id...');
    try {
      await sequelize.query(`
        ALTER TABLE questoes 
        ADD COLUMN bloco_id INTEGER
      `);
      console.log('   ✅ Coluna bloco_id adicionada com sucesso!\n');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('   ⚠️  Coluna bloco_id já existe\n');
      } else {
        throw err;
      }
    }

    // 2. Adicionar constraint de chave estrangeira
    console.log('2️⃣  Adicionando constraint de chave estrangeira...');
    try {
      await sequelize.query(`
        ALTER TABLE questoes 
        ADD CONSTRAINT fk_questoes_bloco_id 
        FOREIGN KEY (bloco_id) 
        REFERENCES blocos_questoes(id) 
        ON DELETE CASCADE
      `);
      console.log('   ✅ Constraint adicionada com sucesso!\n');
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('   ⚠️  Constraint já existe\n');
      } else {
        throw err;
      }
    }

    // 3. Criar índice
    console.log('3️⃣  Criando índice para melhor performance...');
    try {
      await sequelize.query(`
        CREATE INDEX idx_questoes_bloco_id ON questoes(bloco_id)
      `);
      console.log('   ✅ Índice criado com sucesso!\n');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('   ⚠️  Índice já existe\n');
      } else {
        throw err;
      }
    }

    console.log('✅ Migration completada com sucesso!');
    console.log('📊 Resumo:');
    console.log('   • Coluna bloco_id adicionada a tabela questoes');
    console.log('   • Constraint de chave estrangeira configurado');
    console.log('   • Índice criado para melhor performance');
    console.log('\n🚀 Sistema de blocos de questões agora funciona corretamente!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    console.error('\nDetalhes:', error);
    process.exit(1);
  }
}

executarMigration();
