'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('questoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      torneio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'torneios',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      disciplina: {
        type: Sequelize.ENUM('matematica', 'ingles', 'programacao'),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('multipla_escolha', 'texto', 'codigo'),
        allowNull: false,
      },
      dificuldade: {
        type: Sequelize.ENUM('facil', 'medio', 'dificil'),
        allowNull: false,
      },
      opcoes: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      resposta_correta: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      explicacao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      pontos: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      linguagem: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      midia: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('questoes', ['torneio_id']);
    await queryInterface.addIndex('questoes', ['disciplina']);
    await queryInterface.addIndex('questoes', ['tipo']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('questoes');
  },
};
