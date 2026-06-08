'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tables = await queryInterface.showAllTables();
      if (tables.includes('questoes_teste_conhecimento')) {
        console.log('ℹ️  Tabela questoes_teste_conhecimento já existe');
        return;
      }

      await queryInterface.createTable('questoes_teste_conhecimento', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        enunciado: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        opcoes: {
          type: Sequelize.JSON,
          allowNull: false
        },
        resposta_correta: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        dificuldade: {
          type: Sequelize.ENUM('facil', 'medio', 'dificil'),
          allowNull: false,
          defaultValue: 'medio'
        },
        categoria: {
          type: Sequelize.ENUM('matematica', 'programacao', 'ingles', 'cultura_geral'),
          allowNull: false
        },
        pontos: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 10
        },
        ativo: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      });

      // Adicionar índices
      try {
        await queryInterface.addIndex('questoes_teste_conhecimento', ['categoria'], {
          name: 'idx_qtc_categoria'
        });
      } catch (e) {
        console.log('ℹ️  Índice categoria já existe');
      }

      try {
        await queryInterface.addIndex('questoes_teste_conhecimento', ['dificuldade'], {
          name: 'idx_qtc_dificuldade'
        });
      } catch (e) {
        console.log('ℹ️  Índice dificuldade já existe');
      }

      try {
        await queryInterface.addIndex('questoes_teste_conhecimento', ['ativo'], {
          name: 'idx_qtc_ativo'
        });
      } catch (e) {
        console.log('ℹ️  Índice ativo já existe');
      }

      console.log('✅ Tabela questoes_teste_conhecimento criada');
    } catch (error) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tables = await queryInterface.showAllTables();
      if (tables.includes('questoes_teste_conhecimento')) {
        await queryInterface.dropTable('questoes_teste_conhecimento');
      }
    } catch (error) {
      console.error('❌ Erro ao reverter:', error.message);
    }
  }
};
