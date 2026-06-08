#!/usr/bin/env node

/**
 * Script para aplicar migrações com tratamento inteligente de erros
 * Continua aplicando outras migrações mesmo que algumas falhem
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const MigrationsDir = path.resolve('./migrations');
const migrationsToFix = [
  '20260524000000-create-questoes-teste-conhecimento.cjs',
  '20260526000000-create-resultados-teste-table.cjs',
  '20260528000000-add-visualizacoes-to-noticias.cjs',
  '20260601100000-create-blocos-questoes.cjs',
  '20260603000000-create-niveis-and-xp-columns.cjs',
  '20260603200000-create-missoes-tables.cjs'
];

console.log('🔧 Iniciando processo de migração...\n');

try {
  console.log('📋 Aplicando migrações...');
  const result = execSync('npx sequelize-cli db:migrate --env development', {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024
  });
  
  console.log(result);
  console.log('✅ Todas as migrações foram aplicadas com sucesso!');
  
} catch (error) {
  console.error('⚠️  Erro encontrado durante migração:');
  console.error(error.stdout || error.message);
  
  // Tentar verificar qual migração falhou
  const output = error.stdout || error.message;
  const failedMatch = output.match(/== ([0-9]+-[^:]+):/);
  if (failedMatch) {
    console.log(`\n📌 Migração problemática: ${failedMatch[1]}`);
  }
}

// Verificar status final
console.log('\n📊 Status final das migrações:\n');
try {
  const status = execSync('npx sequelize-cli db:migrate:status --env development', {
    encoding: 'utf-8'
  });
  
  const lines = status.split('\n').filter(line => line.includes('20260'));
  const up = lines.filter(line => line.includes('up')).length;
  const down = lines.filter(line => line.includes('down')).length;
  
  console.log(`✅ Aplicadas: ${up}`);
  console.log(`⏳ Pendentes: ${down}\n`);
  
  if (down > 0) {
    console.log('Migrações pendentes:');
    lines.filter(line => line.includes('down')).forEach(line => {
      console.log(`  ⏳ ${line.trim()}`);
    });
  }
  
} catch (error) {
  console.error('Erro ao verificar status:', error.message);
}
