/**
 * migrate-fix-bloco-questao-fk.js
 * Script para corrigir a foreign key em bloco_questoes_items
 * Deve apontar para 'questoes' em vez de 'questoes_teste_conhecimento'
 */

import sequelize from '../config/db.js';

async function migrate() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    console.log('📝 Corrigindo foreign key em bloco_questoes_items...');
    
    // Remover a constraint antiga
    try {
      await sequelize.query(
        `ALTER TABLE bloco_questoes_items DROP FOREIGN KEY bloco_questoes_items_ibfk_4`
      );
      console.log('   ✅ Constraint anterior removido');
    } catch (e) {
      console.log('   ℹ️  Nenhum constraint anterior encontrado');
    }

    // Adicionar nova constraint apontando para 'questoes'
    await sequelize.query(
      `ALTER TABLE bloco_questoes_items 
       ADD CONSTRAINT bloco_questoes_items_ibfk_4 
       FOREIGN KEY (questao_id) 
       REFERENCES questoes(id) 
       ON DELETE CASCADE 
       ON UPDATE CASCADE`
    );
    console.log('   ✅ Novo constraint criado apontando para questoes');

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('✅ bloco_questoes_items agora referencia a tabela questoes\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao executar migração:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

migrate();
