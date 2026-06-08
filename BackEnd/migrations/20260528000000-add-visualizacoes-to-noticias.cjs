'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableDescription = await queryInterface.describeTable('noticias');
      if (!tableDescription.visualizacoes) {
        await queryInterface.addColumn('noticias', 'visualizacoes', {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false,
        });
        console.log('✅ Coluna visualizacoes adicionada');
      } else {
        console.log('ℹ️  Coluna visualizacoes já existe');
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    try {
      const tableDescription = await queryInterface.describeTable('noticias');
      if (tableDescription.visualizacoes) {
        await queryInterface.removeColumn('noticias', 'visualizacoes');
        console.log('✅ Coluna visualizacoes removida');
      }
    } catch (error) {
      console.error('❌ Erro ao reverter:', error.message);
    }
  }
};
