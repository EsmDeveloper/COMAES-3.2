#!/usr/bin/env node

/**
 * Script para inserir 45 questões no banco de dados
 * Executa: 15 questões por disciplina (5 fácil, 5 médio, 5 difícil)
 */

import sequelize from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function insertQuestoes() {
  try {
    console.log('🚀 Iniciando inserção de questões...\n');

    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados com sucesso!\n');

    // Ler arquivo SQL
    const sqlFile = path.join(__dirname, 'seeds', 'insert_45_questoes_torneio_ativo.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Executando script SQL...\n');

    // Executar queries
    const queries = sql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));

    let queryIndex = 0;
    for (const query of queries) {
      queryIndex++;
      try {
        const result = await sequelize.query(query);
        
        // Log de queries importantes
        if (query.includes('SELECT') && query.includes('COUNT')) {
          console.log(`✓ Query ${queryIndex}: ${query.substring(0, 60)}...`);
          if (result && result[0]) {
            console.log(`  Resultado:`, result[0]);
          }
        } else if (query.includes('INSERT')) {
          if (!query.includes('INSERT INTO questoes (torneio_id')) {
            console.log(`✓ Query ${queryIndex}: Inserção executada`);
          }
        } else if (query.includes('SET @torneio_id')) {
          console.log(`✓ Query ${queryIndex}: Variável torneio_id definida`);
        }
      } catch (err) {
        // Ignorar erros de queries SET (variáveis)
        if (!query.includes('SET @') && !query.includes('IF @')) {
          console.error(`✗ Erro na query ${queryIndex}:`, err.message);
          console.error(`Query: ${query.substring(0, 100)}...`);
        }
      }
    }

    console.log('\n📊 Verificação final...\n');

    // Verificar resultados
    const verificacao = await sequelize.query(`
      SELECT 
        disciplina,
        dificuldade,
        COUNT(*) as total
      FROM questoes
      WHERE torneio_id = (SELECT id FROM torneios WHERE status = 'ativo' ORDER BY id DESC LIMIT 1)
      GROUP BY disciplina, dificuldade
      ORDER BY disciplina, FIELD(dificuldade, 'facil', 'medio', 'dificil')
    `);

    if (verificacao && verificacao[0]) {
      console.table(verificacao[0]);
    }

    const totalPorDisciplina = await sequelize.query(`
      SELECT 
        disciplina,
        COUNT(*) as total
      FROM questoes
      WHERE torneio_id = (SELECT id FROM torneios WHERE status = 'ativo' ORDER BY id DESC LIMIT 1)
      GROUP BY disciplina
      ORDER BY disciplina
    `);

    if (totalPorDisciplina && totalPorDisciplina[0]) {
      console.log('\n📚 Total por disciplina:');
      console.table(totalPorDisciplina[0]);
    }

    const totalGeral = await sequelize.query(`
      SELECT COUNT(*) as total_questoes
      FROM questoes
      WHERE torneio_id = (SELECT id FROM torneios WHERE status = 'ativo' ORDER BY id DESC LIMIT 1)
    `);

    if (totalGeral && totalGeral[0] && totalGeral[0][0]) {
      const total = totalGeral[0][0].total_questoes;
      console.log(`\n✅ Total de questões inseridas: ${total}`);
      
      if (total === 45) {
        console.log('\n🎉 SUCESSO! Todas as 45 questões foram inseridas com sucesso!');
      } else {
        console.log(`\n⚠️  Esperado 45 questões, mas foram encontradas ${total}`);
      }
    }

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
    console.error(error.stack);
    await sequelize.close();
    process.exit(1);
  }
}

// Executar
insertQuestoes();
