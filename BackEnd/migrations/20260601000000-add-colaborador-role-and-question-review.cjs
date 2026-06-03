'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'role', {
      type: Sequelize.ENUM('estudante', 'colaborador', 'admin'),
      allowNull: false,
      defaultValue: 'estudante',
    });

    await queryInterface.addColumn('usuarios', 'disciplina_colaborador', {
      type: Sequelize.ENUM('matematica', 'ingles', 'programacao'),
      allowNull: true,
    });

    await queryInterface.changeColumn('questoes', 'torneio_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'torneios', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('questoes', 'autor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('questoes', 'status_aprovacao', {
      type: Sequelize.ENUM('pendente', 'aprovada', 'rejeitada'),
      allowNull: false,
      defaultValue: 'aprovada',
    });

    await queryInterface.addColumn('questoes', 'revisado_por', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('questoes', 'revisado_em', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('questoes', 'motivo_rejeicao', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addIndex('questoes', ['autor_id']);
    await queryInterface.addIndex('questoes', ['status_aprovacao']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('questoes', ['status_aprovacao']);
    await queryInterface.removeIndex('questoes', ['autor_id']);
    await queryInterface.removeColumn('questoes', 'motivo_rejeicao');
    await queryInterface.removeColumn('questoes', 'revisado_em');
    await queryInterface.removeColumn('questoes', 'revisado_por');
    await queryInterface.removeColumn('questoes', 'status_aprovacao');
    await queryInterface.removeColumn('questoes', 'autor_id');
    await queryInterface.changeColumn('questoes', 'torneio_id', {
      type: queryInterface.sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'torneios', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.removeColumn('usuarios', 'disciplina_colaborador');
    await queryInterface.removeColumn('usuarios', 'role');
  },
};
