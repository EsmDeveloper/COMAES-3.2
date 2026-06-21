#!/usr/bin/env node
/**
 * apply_migrations.js
 * Executa migrations SQL para o sistema de torneios
 */

import fs from 'fs';
import path from 'path';
import sequelize from './config/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log('[ROCKET] Iniciando migrations...\n');

    // Conectar ao banco
    await sequelize.authenticate();
    console.log('[SUCCESS] Conectado ao banco de dados\n');

    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, 'apply_tournament_columns.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Dividir em statements (simples split por ;)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`[CHART] Encontrados ${statements.length} statements SQL\n`);

    // Executar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Pular SELECTs de verificação (apenas para output)
      if (statement.toUpperCase().startsWith('SELECT')) {
        console.log(`\n[LIST] Verificando...\n`);
        try {
          const result = await sequelize.query(statement);
          if (result && result[0]) {
            console.table(result[0]);
          }
        } catch (err) {
          console.warn(`[WARNING]  SELECT falhou (pode ser esperado): ${err.message}`);
        }
        continue;
      }

      // Executar ALTER/CREATE statements
      try {
        await sequelize.query(statement);
        const action = statement.substring(0, 30);
        console.log(`[SUCCESS] [${i + 1}/${statements.length}] ${action}...`);
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('Duplicate')) {
          console.log(`[INFO]  [${i + 1}/${statements.length}] Campo/índice já existe (esperado)`);
        } else {
          console.error(`[ERROR] [${i + 1}/${statements.length}] Erro: ${err.message}`);
          throw err;
        }
      }
    }

    console.log('\n[CELEBRATE] Migrations completadas com sucesso!\n');

    // Desconectar
    await sequelize.close();
    process.exit(0);

  } catch (err) {
    console.error('\n[ERROR] Erro ao executar migrations:', err);
    process.exit(1);
  }
}

runMigrations();
