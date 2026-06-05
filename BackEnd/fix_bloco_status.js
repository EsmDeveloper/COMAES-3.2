/**
 * Script to fix BlocoQuestoes status enum
 * Changes from (pendente, aprovado, rejeitado) to (rascunho, publicado)
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '', // Empty password
  database: process.env.DB_NAME || 'comaes_db',
});

console.log('🔧 Connecting to database...');

try {
  // 1. Check current status column definition
  const [columns] = await connection.query(`
    SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME='blocos_questoes' AND COLUMN_NAME='status'
  `);

  if (columns.length === 0) {
    console.log('❌ blocos_questoes table or status column not found');
    process.exit(1);
  }

  const currentType = columns[0].COLUMN_TYPE;
  console.log('📋 Current status column type:', currentType);

  // 2. Check if it already has the correct enum
  if (currentType === "enum('rascunho','publicado')") {
    console.log('✅ Status column already has correct enum values');
    await connection.end();
    process.exit(0);
  }

  // 3. Create a migration plan
  if (currentType.includes('pendente')) {
    console.log('🔄 Migrating from old enum (pendente, aprovado, rejeitado) to new enum (rascunho, publicado)...');

    // Migrate the data
    // pendente, rejeitado -> rascunho
    // aprovado -> publicado
    await connection.query(`
      UPDATE blocos_questoes SET status = 'rascunho' WHERE status IN ('pendente', 'rejeitado')
    `);
    console.log('✅ Updated pending/rejected blocks to rascunho');

    await connection.query(`
      UPDATE blocos_questoes SET status = 'publicado' WHERE status = 'aprovado'
    `);
    console.log('✅ Updated approved blocks to publicado');

    // Change the column definition
    await connection.query(`
      ALTER TABLE blocos_questoes MODIFY status ENUM('rascunho', 'publicado') NOT NULL DEFAULT 'rascunho'
    `);
    console.log('✅ Changed enum to (rascunho, publicado)');
  } else {
    console.log('⚠️  Unexpected enum type:', currentType);
    console.log('🔄 Attempting to change to correct enum...');
    
    // Try to change directly
    await connection.query(`
      ALTER TABLE blocos_questoes MODIFY status ENUM('rascunho', 'publicado') NOT NULL DEFAULT 'rascunho'
    `);
    console.log('✅ Changed to (rascunho, publicado)');
  }

  console.log('✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}
