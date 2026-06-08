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

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tables = await queryInterface.showAllTables();

      // ── 1. blocos_questoes ────────────────────────────────────────────
      if (!tables.includes('blocos_questoes')) {
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

        try {
          await queryInterface.addIndex('blocos_questoes', ['disciplina'], { name: 'idx_blocos_disciplina' });
        } catch (e) { console.log('ℹ️  Índice já existe'); }

        try {
          await queryInterface.addIndex('blocos_questoes', ['dificuldade'], { name: 'idx_blocos_dificuldade' });
        } catch (e) { console.log('ℹ️  Índice já existe'); }

        try {
          await queryInterface.addIndex('blocos_questoes', ['status'], { name: 'idx_blocos_status' });
        } catch (e) { console.log('ℹ️  Índice já existe'); }

        try {
          await queryInterface.addIndex('blocos_questoes', ['criado_por'], { name: 'idx_blocos_criador' });
        } catch (e) { console.log('ℹ️  Índice já existe'); }

        console.log('✅ Tabela blocos_questoes criada');
      } else {
        console.log('ℹ️  Tabela blocos_questoes já existe');
      }

      // ── 2. bloco_questoes_items ───────────────────────────────────────
      if (!tables.includes('bloco_questoes_items')) {
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

        try {
          await queryInterface.addIndex('bloco_questoes_items', ['bloco_id'], { name: 'idx_bqi_bloco' });
        } catch (e) { console.log('ℹ️  Índice já existe'); }

        try {
          await queryInterface.addIndex('bloco_questoes_items', ['questao_id'], { name: 'idx_bqi_questao' });
        } catch (e) { console.log('ℹ️  Índice já existe'); }

        try {
          await queryInterface.addConstraint('bloco_questoes_items', {
            fields: ['bloco_id', 'questao_id'],
            type: 'unique',
            name: 'uk_bloco_questao',
          });
        } catch (e) { console.log('ℹ️  Constraint já existe'); }

        console.log('✅ Tabela bloco_questoes_items criada');
      } else {
        console.log('ℹ️  Tabela bloco_questoes_items já existe');
      }

      // ── 3. torneio_blocos ─────────────────────────────────────────────
      if (!tables.includes('torneio_blocos')) {
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
            onDelete: 'RESTRICT',
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

        try {
          await queryInterface.addIndex('torneio_blocos', ['torneio_id'], { name: 'idx_tb_torneio' });
        } catch (e) { console.log('ℹ️  Índice já existe'); }

        try {
          await queryInterface.addIndex('torneio_blocos', ['bloco_id'], { name: 'idx_tb_bloco' });
        } catch (e) { console.log('ℹ️  Índice já existe'); }

        try {
          await queryInterface.addConstraint('torneio_blocos', {
            fields: ['torneio_id', 'bloco_id'],
            type: 'unique',
            name: 'uk_torneio_bloco',
          });
        } catch (e) { console.log('ℹ️  Constraint já existe'); }

        console.log('✅ Tabela torneio_blocos criada');
      } else {
        console.log('ℹ️  Tabela torneio_blocos já existe');
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    try {
      const tables = await queryInterface.showAllTables();
      
      if (tables.includes('torneio_blocos')) {
        await queryInterface.dropTable('torneio_blocos');
      }
      if (tables.includes('bloco_questoes_items')) {
        await queryInterface.dropTable('bloco_questoes_items');
      }
      if (tables.includes('blocos_questoes')) {
        await queryInterface.dropTable('blocos_questoes');
      }
    } catch (error) {
      console.error('❌ Erro ao reverter:', error.message);
    }
  }
};
