/**
 * Aplica a migração de colunas de colaborador que pode não ter sido executada
 * Adiciona: username, nivel_academico, documentos_colaborador à tabela usuarios
 */
import sequelize from '../config/db.js';
const { QueryTypes } = await import('sequelize');

console.log('Verificando colunas em falta na tabela usuarios...');

const cols = await sequelize.query('DESCRIBE usuarios', { type: QueryTypes.SELECT });
const existentes = cols.map(c => c.Field);
console.log('Colunas actuais:', existentes.join(', '));

const faltam = [];

if (!existentes.includes('username')) {
  faltam.push('username');
  await sequelize.query(
    "ALTER TABLE usuarios ADD COLUMN username VARCHAR(50) NULL UNIQUE AFTER nome"
  );
  console.log('✅ Coluna username adicionada');
}

if (!existentes.includes('nivel_academico')) {
  faltam.push('nivel_academico');
  await sequelize.query(
    `ALTER TABLE usuarios ADD COLUMN nivel_academico ENUM(
      'estudante_universitario','tecnico','licenciado','mestre',
      'doutor','professor','profissional','outro'
    ) NULL AFTER disciplina_colaborador`
  );
  console.log('✅ Coluna nivel_academico adicionada');
}

if (!existentes.includes('documentos_colaborador')) {
  faltam.push('documentos_colaborador');
  await sequelize.query(
    "ALTER TABLE usuarios ADD COLUMN documentos_colaborador JSON NULL AFTER nivel_academico"
  );
  console.log('✅ Coluna documentos_colaborador adicionada');
}

if (faltam.length === 0) {
  console.log('ℹ️  Todas as colunas já existem — nenhuma alteração necessária');
} else {
  console.log(`\n✅ Migração concluída: ${faltam.length} coluna(s) adicionada(s): ${faltam.join(', ')}`);
}

process.exit(0);
