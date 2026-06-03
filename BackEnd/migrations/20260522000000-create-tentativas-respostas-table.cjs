'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tentativas_respostas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      torneio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'torneios',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      disciplina_competida: {
        type: Sequelize.ENUM('Matemática', 'Inglês', 'Programação'),
        allowNull: false,
      },
      questao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'perguntas',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      resposta_selecionada: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      resposta_correta: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      correta: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      pontos_obtidos: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      tempo_gasto: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar índices
    await queryInterface.addIndex('tentativas_respostas', ['usuario_id']);
    await queryInterface.addIndex('tentativas_respostas', ['torneio_id']);
    await queryInterface.addIndex('tentativas_respostas', ['questao_id']);
    await queryInterface.addIndex('tentativas_respostas', ['usuario_id', 'torneio_id']);
    await queryInterface.addIndex('tentativas_respostas', ['usuario_id', 'torneio_id', 'disciplina_competida']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tentativas_respostas');
  }
};
