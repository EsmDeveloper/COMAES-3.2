/**
 * migrate-fix-torneio-nullable.js
 * Script para permitir torneio_id NULL na tabela questoes
 * Necessário para questões criadas por colaboradores que não pertencem a um torneio específico
 */

import sequelize from '../config/db.js';

async function migrate() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    console.log('📝 Alterando constraint de torneio_id...');
    
    // Executar SQL para alterar a coluna torneio_id
    // Primeiro, dropa a constraint existente se houver
    try {
      await sequelize.query(
        `ALTER TABLE questoes DROP FOREIGN KEY questoes_ibfk_1`
      );
      console.log('   ✅ Constraint anterior removido');
    } catch (e) {
      console.log('   ℹ️  Nenhum constraint anterior encontrado');
    }

    // Agora alterar a coluna para permitir NULL
    await sequelize.query(
      `ALTER TABLE questoes MODIFY torneio_id INT NULL`
    );
    console.log('   ✅ Coluna torneio_id agora permite NULL');

    // Recriar a constraint com a opção de ON DELETE SET NULL
    await sequelize.query(
      `ALTER TABLE questoes 
       ADD CONSTRAINT questoes_ibfk_1 
       FOREIGN KEY (torneio_id) 
       REFERENCES torneios(id) 
       ON DELETE SET NULL 
       ON UPDATE CASCADE`
    );
    console.log('   ✅ Nova constraint criado com ON DELETE SET NULL');

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('✅ Agora colaboradores podem criar questões sem torneio_id\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao executar migração:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

migrate();
