'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionar campo status_colaborador
    await queryInterface.addColumn('usuarios', 'status_colaborador', {
      type: Sequelize.ENUM('pendente', 'aprovado', 'rejeitado'),
      allowNull: false,
      defaultValue: 'pendente',
    });

    // Atualizar colaboradores existentes para aprovado (já foram aprovados por admin)
    await queryInterface.sequelize.query(`
      UPDATE usuarios 
      SET status_colaborador = 'aprovado' 
      WHERE role = 'colaborador'
    `);

    // Atualizar estudantes e admins para aprovado (não precisam de aprovação)
    await queryInterface.sequelize.query(`
      UPDATE usuarios 
      SET status_colaborador = 'aprovado' 
      WHERE role IN ('estudante', 'admin')
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('usuarios', 'status_colaborador');
  },
};