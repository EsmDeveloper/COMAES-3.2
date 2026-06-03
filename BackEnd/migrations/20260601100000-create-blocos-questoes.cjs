/**
 * Migração: Sistema de Blocos de Questões
 *
 * Cria 3 tabelas:
 *   blocos_questoes        — repositório de blocos (independente de torneios)
 *   bloco_questoes_items   — questões dentro de um bloco (N:M)
 *   torneio_blocos         — associação torneio ↔ bloco (N:M)
 *
 * Decisão arquitetural:
 *   - Blocos referenciam questoes_teste_conhecimento (fonte do quiz)
 *   - Não altera tabelas existentes (não-destrutivo)
 *   - ON DELETE RESTRICT em torneio_blocos.bloco_id impede deleção de blocos em uso
 */

export const up = async (queryInterface, Sequelize) => {
  // ── 1. blocos_questoes ────────────────────────────────────────────
  await queryInterface.createTable('blocos_questoes', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    titulo: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    descricao: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    disciplina: {
      type: Sequelize.ENUM('matematica', 'ingles', 'programacao'),
      allowNull: false,
    },
    dificuldade: {
      type: Sequelize.ENUM('facil', 'medio', 'dificil'),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('rascunho', 'publicado'),
      allowNull: false,
      defaultValue: 'rascunho',
    },
    criado_por: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
      onDelete: 'RESTRICT',
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  });

  await queryInterface.addIndex('blocos_questoes', ['disciplina']);
  await queryInterface.addIndex('blocos_questoes', ['dificuldade']);
  await queryInterface.addIndex('blocos_questoes', ['status']);
  await queryInterface.addIndex('blocos_questoes', ['criado_por']);

  // ── 2. bloco_questoes_items ───────────────────────────────────────
  await queryInterface.createTable('bloco_questoes_items', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    bloco_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'blocos_questoes', key: 'id' },
      onDelete: 'CASCADE',
    },
    questao_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'questoes_teste_conhecimento', key: 'id' },
      onDelete: 'CASCADE',
    },
    ordem: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  });

  await queryInterface.addIndex('bloco_questoes_items', ['bloco_id']);
  await queryInterface.addIndex('bloco_questoes_items', ['questao_id']);
  await queryInterface.addConstraint('bloco_questoes_items', {
    fields: ['bloco_id', 'questao_id'],
    type: 'unique',
    name: 'uk_bloco_questao',
  });

  // ── 3. torneio_blocos ─────────────────────────────────────────────
  await queryInterface.createTable('torneio_blocos', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    torneio_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'torneios', key: 'id' },
      onDelete: 'CASCADE',
    },
    bloco_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'blocos_questoes', key: 'id' },
      onDelete: 'RESTRICT', // Impede deleção de bloco em uso por torneio
    },
    ordem: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  });

  await queryInterface.addIndex('torneio_blocos', ['torneio_id']);
  await queryInterface.addIndex('torneio_blocos', ['bloco_id']);
  await queryInterface.addConstraint('torneio_blocos', {
    fields: ['torneio_id', 'bloco_id'],
    type: 'unique',
    name: 'uk_torneio_bloco',
  });
};

export const down = async (queryInterface) => {
  // Ordem inversa para respeitar FKs
  await queryInterface.dropTable('torneio_blocos');
  await queryInterface.dropTable('bloco_questoes_items');
  await queryInterface.dropTable('blocos_questoes');
};
