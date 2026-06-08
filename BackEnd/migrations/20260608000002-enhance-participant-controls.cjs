'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration para melhorar controles de participação
     * - Adicionar status de encerramento operacional
     * - Permitir rastreamento de quando torneio foi encerrado para estudantes
     */
    
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('📋 [Migration] Iniciando: Melhorar controles de participação');
      
      // 1. Adicionar coluna de encerramento operacional
      await queryInterface.addColumn(
        'participantes_torneios',
        'encerrado_operacionalmente',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          comment: 'Indica se torneio foi encerrado operacionalmente para este participante (data passou)'
        },
        { transaction }
      );
      console.log('✅ Coluna encerrado_operacionalmente criada');
      
      // 2. Adicionar data de encerramento operacional
      await queryInterface.addColumn(
        'participantes_torneios',
        'data_encerramento_operacional',
        {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Timestamp de quando o torneio foi encerrado operacionalmente'
        },
        { transaction }
      );
      console.log('✅ Coluna data_encerramento_operacional criada');
      
      // 3. Adicionar status de elegibilidade para certificado
      await queryInterface.addColumn(
        'participantes_torneios',
        'elegivel_certificado',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          comment: 'Indica se participante é elegível para receber certificado (top 3)'
        },
        { transaction }
      );
      console.log('✅ Coluna elegivel_certificado criada');
      
      // 4. Criar índice para melhorar queries de participação ativa
      await queryInterface.addIndex(
        'participantes_torneios',
        ['usuario_id', 'status', 'posicao_congelada'],
        {
          name: 'idx_participacao_ativa',
          transaction
        }
      );
      console.log('✅ Índice idx_participacao_ativa criado');
      
      await transaction.commit();
      console.log('✅ Migration completada: Controles de participação');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔙 [Migration] Revertendo: Controles de participação');
      
      // Remover índice
      await queryInterface.removeIndex(
        'participantes_torneios',
        'idx_participacao_ativa',
        { transaction }
      );
      
      // Remover colunas em ordem reversa
      await queryInterface.removeColumn(
        'participantes_torneios',
        'elegivel_certificado',
        { transaction }
      );
      
      await queryInterface.removeColumn(
        'participantes_torneios',
        'data_encerramento_operacional',
        { transaction }
      );
      
      await queryInterface.removeColumn(
        'participantes_torneios',
        'encerrado_operacionalmente',
        { transaction }
      );
      
      await transaction.commit();
      console.log('✅ Revert completado');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao fazer revert:', error);
      throw error;
    }
  }
};
