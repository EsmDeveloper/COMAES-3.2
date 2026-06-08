'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add contexto column to blocos_questoes table
     * Allows separating blocks by context: torneio (competitions) or teste (knowledge tests)
     */
    await queryInterface.addColumn('blocos_questoes', 'contexto', {
      type: Sequelize.ENUM('torneio', 'teste'),
      allowNull: true,
      defaultValue: 'torneio',
      comment: 'Contexto do bloco: torneio (para competições) ou teste (para testes de conhecimento)',
      after: 'observacoes_admin',
    });

    console.log('✅ Coluna contexto adicionada à tabela blocos_questoes');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Remove contexto column if rolling back
     */
    await queryInterface.removeColumn('blocos_questoes', 'contexto');
    console.log('✅ Coluna contexto removida da tabela blocos_questoes');
  }
};
