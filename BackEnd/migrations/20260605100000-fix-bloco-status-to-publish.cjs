'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration para corrigir BlocoQuestoes status:
     * - Revert de ENUM('pendente', 'aprovado', 'rejeitado') 
     * - Para ENUM('rascunho', 'publicado') 
     * 
     * Razão: O status do bloco representa se está publicado e pronto para 
     * uso em torneios, não se foi aprovado por admin. Isso é um conceito
     * diferente e deve ser separado.
     */

    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Criar coluna temporária com o ENUM correto
      await queryInterface.addColumn('blocos_questoes', 'status_novo', {
        type: Sequelize.ENUM('rascunho', 'publicado'),
        allowNull: false,
        defaultValue: 'rascunho'
      }, { transaction });

      // 2. Migrar dados
      // pendente, rejeitado -> rascunho (unpublished)
      // aprovado -> publicado (published)
      await queryInterface.sequelize.query(
        `UPDATE blocos_questoes SET status_novo = 'rascunho' WHERE status IN ('pendente', 'rejeitado')`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `UPDATE blocos_questoes SET status_novo = 'publicado' WHERE status = 'aprovado'`,
        { transaction }
      );

      // 3. Remover índices na coluna status antiga (se existirem)
      try {
        await queryInterface.removeIndex('blocos_questoes', ['status'], { transaction });
      } catch (e) {
        // Index may not exist
      }

      // 4. Remover coluna status antiga
      await queryInterface.removeColumn('blocos_questoes', 'status', { transaction });

      // 5. Renomear coluna nova para status
      await queryInterface.renameColumn('blocos_questoes', 'status_novo', 'status', { transaction });

      // 6. Adicionar índice novo
      await queryInterface.addIndex('blocos_questoes', ['status'], { transaction });

      await transaction.commit();
      console.log('✅ Migration completed: BlocoQuestoes status fixed to rascunho/publicado');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Reverter back to pendente/aprovado/rejeitado
      await queryInterface.addColumn('blocos_questoes', 'status_old', {
        type: Sequelize.ENUM('pendente', 'aprovado', 'rejeitado'),
        allowNull: false,
        defaultValue: 'pendente'
      }, { transaction });

      // Revert migration
      await queryInterface.sequelize.query(
        `UPDATE blocos_questoes SET status_old = 'rascunho' WHERE status = 'rascunho'`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `UPDATE blocos_questoes SET status_old = 'aprovado' WHERE status = 'publicado'`,
        { transaction }
      );

      // Remove new status column
      try {
        await queryInterface.removeIndex('blocos_questoes', ['status'], { transaction });
      } catch (e) {
        // Index may not exist
      }

      await queryInterface.removeColumn('blocos_questoes', 'status', { transaction });
      await queryInterface.renameColumn('blocos_questoes', 'status_old', 'status', { transaction });

      await transaction.commit();
      console.log('✅ Migration rollback: BlocoQuestoes status reverted');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
