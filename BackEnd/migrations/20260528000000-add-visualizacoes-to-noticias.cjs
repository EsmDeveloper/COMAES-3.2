'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  const tableDescription = await queryInterface.describeTable('noticias');
  if (!tableDescription.visualizacoes) {
    await queryInterface.addColumn('noticias', 'visualizacoes', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  }
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('noticias', 'visualizacoes');
}
