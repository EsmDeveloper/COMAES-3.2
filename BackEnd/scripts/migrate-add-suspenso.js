/**
 * migrate-add-suspenso.js
 * Script para adicionar 'suspenso' ao ENUM de status_colaborador
 */

import sequelize from '../config/db.js';

async function migrate() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    console.log('\n📝 Alterando ENUM de status_colaborador...');
    
    // Executar SQL diretamente para alterar o ENUM
    await sequelize.query(
      `ALTER TABLE usuarios MODIFY status_colaborador ENUM('pendente', 'aprovado', 'rejeitado', 'suspenso') NOT NULL DEFAULT 'pendente'`
    );
    
    console.log('✅ ENUM alterado com sucesso!');
    console.log('✅ Agora status_colaborador pode ser: pendente, aprovado, rejeitado, suspenso');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

migrate();
