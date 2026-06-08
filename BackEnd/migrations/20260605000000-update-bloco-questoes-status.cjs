'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration para atualizar BlocoQuestoes:
     * - Mudar status de ENUM('rascunho', 'publicado') para ENUM('pendente', 'aprovado', 'rejeitado')
     * - Adicionar campos de rastreamento de aprovação
     */

    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Adicionar novas colunas antes de alterar o status
      await queryInterface.addColumn('blocos_questoes', 'status_aprovacao', {
        type: Sequelize.ENUM('pendente', 'aprovado', 'rejeitado'),
        allowNull: true,
        defaultValue: 'pendente',
        comment: 'Status de aprovação do bloco'
      }, { transaction });

      await queryInterface.addColumn('blocos_questoes', 'aprovado_por_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'SET NULL',
        comment: 'ID do admin que aprovou o bloco'
      }, { transaction });

      await queryInterface.addColumn('blocos_questoes', 'data_aprovacao', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data em que o bloco foi aprovado'
      }, { transaction });

      await queryInterface.addColumn('blocos_questoes', 'motivo_rejeicao', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Motivo da rejeição do bloco (se aplicável)'
      }, { transaction });

      await queryInterface.addColumn('blocos_questoes', 'observacoes_admin', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações do admin sobre o bloco'
      }, { transaction });

      // 2. Migrar dados do status antigo para o novo
      // rascunho -> pendente
      // publicado -> aprovado
      await queryInterface.sequelize.query(
        `UPDATE blocos_questoes SET status_aprovacao = 'pendente' WHERE status = 'rascunho'`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `UPDATE blocos_questoes SET status_aprovacao = 'aprovado' WHERE status = 'publicado'`,
        { transaction }
      );

      // 3. Remover coluna status antiga
      await queryInterface.removeColumn('blocos_questoes', 'status', { transaction });

      // 4. Renomear status_aprovacao para status
      await queryInterface.renameColumn('blocos_questoes', 'status_aprovacao', 'status', { transaction });

      // 5. Adicionar índices para melhor performance
      await queryInterface.addIndex('blocos_questoes', ['status'], { transaction });
      await queryInterface.addIndex('blocos_questoes', ['aprovado_por_id'], { transaction });

      await transaction.commit();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Reverter a migração

      // 1. Renomear status para status_aprovacao
      await queryInterface.renameColumn('blocos_questoes', 'status', 'status_aprovacao', { transaction });

      // 2. Adicionar coluna status antiga com ENUM antigo
      await queryInterface.addColumn('blocos_questoes', 'status', {
        type: Sequelize.ENUM('rascunho', 'publicado'),
        allowNull: false,
        defaultValue: 'rascunho'
      }, { transaction });

      // 3. Migrar dados de volta
      await queryInterface.sequelize.query(
        `UPDATE blocos_questoes SET status = 'rascunho' WHERE status_aprovacao = 'pendente'`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `UPDATE blocos_questoes SET status = 'publicado' WHERE status_aprovacao = 'aprovado'`,
        { transaction }
      );

      // 4. Remover colunas novas
      await queryInterface.removeColumn('blocos_questoes', 'status_aprovacao', { transaction });
      await queryInterface.removeColumn('blocos_questoes', 'aprovado_por_id', { transaction });
      await queryInterface.removeColumn('blocos_questoes', 'data_aprovacao', { transaction });
      await queryInterface.removeColumn('blocos_questoes', 'motivo_rejeicao', { transaction });
      await queryInterface.removeColumn('blocos_questoes', 'observacoes_admin', { transaction });

      // 5. Remover índices
      await queryInterface.removeIndex('blocos_questoes', 'blocos_questoes_status', { transaction });
      await queryInterface.removeIndex('blocos_questoes', 'blocos_questoes_aprovado_por_id', { transaction });

      await transaction.commit();
      console.log('✅ Migration rolled back successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
