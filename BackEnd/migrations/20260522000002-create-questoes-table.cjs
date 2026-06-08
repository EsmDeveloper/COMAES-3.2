'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if table already exists
      const tables = await queryInterface.showAllTables();
      if (tables.includes('questoes')) {
        console.log('ℹ️  Tabela questoes já existe, pulando criação');
        return;
      }

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

      try {
        await queryInterface.addIndex('questoes', ['torneio_id'], {
          name: 'idx_questoes_torneio'
        });
      } catch (e) {
        console.log('ℹ️  Índice torneio_id já existe');
      }

      try {
        await queryInterface.addIndex('questoes', ['disciplina'], {
          name: 'idx_questoes_disciplina'
        });
      } catch (e) {
        console.log('ℹ️  Índice disciplina já existe');
      }

      try {
        await queryInterface.addIndex('questoes', ['tipo'], {
          name: 'idx_questoes_tipo'
        });
      } catch (e) {
        console.log('ℹ️  Índice tipo já existe');
      }
    } catch (error) {
      console.error('❌ Erro na migração:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tables = await queryInterface.showAllTables();
      if (tables.includes('questoes')) {
        await queryInterface.dropTable('questoes');
      }
    } catch (error) {
      console.error('❌ Erro ao reverter:', error.message);
      throw error;
    }
  },
};
