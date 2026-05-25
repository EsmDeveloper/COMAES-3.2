'use strict';

/**
 * MIGRATION: Desabilitar escrita em tabelas legadas
 * Data: 2026-05-22
 * 
 * Esta migration remove as constraints de foreign key das tabelas legadas
 * para preparar para o DROP futuro. Nenhuma nova escrita deve ocorrer
 * nessas tabelas após esta migration.
 * 
 * Tabelas legadas:
 * - perguntas
 * - questoes_matematica
 * - questoes_programacao
 * - questoes_ingles
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remover constraints de foreign key das tabelas legadas
    // para evitar conflitos ao deletar dados
    
    try {
      // Remover constraint de tentativas_respostas -> perguntas
      await queryInterface.removeConstraint('tentativas_respostas', 'tentativas_respostas_ibfk_2');
      console.log('✅ Constraint tentativas_respostas_ibfk_2 removida');
    } catch (e) {
      console.log('ℹ️ Constraint tentativas_respostas_ibfk_2 não encontrada:', e.message);
    }

    // Adicionar comentário nas tabelas legadas indicando que estão descontinuadas
    try {
      await queryInterface.sequelize.query(
        "ALTER TABLE perguntas COMMENT='[LEGADO - DESCONTINUADO] Migrado para tabela questoes em 2026-05-22'"
      );
    } catch (e) {
      console.log('ℹ️ Erro ao adicionar comentário em perguntas:', e.message);
    }

    try {
      await queryInterface.sequelize.query(
        "ALTER TABLE questoes_matematica COMMENT='[LEGADO - DESCONTINUADO] Migrado para tabela questoes em 2026-05-22'"
      );
    } catch (e) {
      console.log('ℹ️ Erro ao adicionar comentário em questoes_matematica:', e.message);
    }

    try {
      await queryInterface.sequelize.query(
        "ALTER TABLE questoes_programacao COMMENT='[LEGADO - DESCONTINUADO] Migrado para tabela questoes em 2026-05-22'"
      );
    } catch (e) {
      console.log('ℹ️ Erro ao adicionar comentário em questoes_programacao:', e.message);
    }

    try {
      await queryInterface.sequelize.query(
        "ALTER TABLE questoes_ingles COMMENT='[LEGADO - DESCONTINUADO] Migrado para tabela questoes em 2026-05-22'"
      );
    } catch (e) {
      console.log('ℹ️ Erro ao adicionar comentário em questoes_ingles:', e.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: restaurar constraints (se necessário)
    try {
      await queryInterface.addConstraint('tentativas_respostas', {
        fields: ['pergunta_id'],
        type: 'foreign key',
        name: 'tentativas_respostas_ibfk_2',
        references: {
          table: 'perguntas',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    } catch (e) {
      console.log('ℹ️ Erro ao restaurar constraint:', e.message);
    }
  },
};
