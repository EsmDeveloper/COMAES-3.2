'use strict';

/**
 * Migration: Tabela de Sequências de Aprendizagem (Streak)
 *
 * Armazena o estado de streak de cada utilizador: último dia de atividade
 * e contagem de dias consecutivos com atividade educacional válida.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sequencias_aprendizagem', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Um registo por utilizador (upsert)',
      },
      streak_atual: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Dias consecutivos com pelo menos uma atividade educativa',
      },
      streak_maximo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Melhor streak histórica do utilizador',
      },
      ultima_data_atividade: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Data (YYYY-MM-DD) da última atividade registada',
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Índice para lookup rápido por utilizador
    await queryInterface.addIndex('sequencias_aprendizagem', ['usuario_id'], {
      name: 'idx_sequencias_usuario_id',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sequencias_aprendizagem');
  },
};
