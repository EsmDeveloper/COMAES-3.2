'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add contexto column to questoes table
     * Allows separating questions by context: torneio, teste, or colaborador
     */
    await queryInterface.addColumn('questoes', 'contexto', {
      type: Sequelize.ENUM('torneio', 'teste', 'colaborador'),
      allowNull: true,
      defaultValue: 'colaborador',
      comment: 'Contexto da questão: torneio (para competições), teste (para testes de conhecimento), colaborador (ainda não atribuída)',
      after: 'motivo_rejeicao',
    });

    console.log('✅ Coluna contexto adicionada à tabela questoes');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Remove contexto column if rolling back
     */
    await queryInterface.removeColumn('questoes', 'contexto');
    console.log('✅ Coluna contexto removida da tabela questoes');
  }
};
