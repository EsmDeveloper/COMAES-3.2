'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if table already exists
      const tables = await queryInterface.showAllTables();
      if (tables.includes('tentativas_respostas')) {
        console.log('ℹ️  Tabela tentativas_respostas já existe, pulando criação');
        return;
      }

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

      // Criar índices com tratamento de erro
      try {
        await queryInterface.addIndex('tentativas_respostas', ['usuario_id'], {
          name: 'idx_tentativas_usuario'
        });
      } catch (e) {
        console.log('ℹ️  Índice usuario_id já existe');
      }

      try {
        await queryInterface.addIndex('tentativas_respostas', ['torneio_id'], {
          name: 'idx_tentativas_torneio'
        });
      } catch (e) {
        console.log('ℹ️  Índice torneio_id já existe');
      }

      try {
        await queryInterface.addIndex('tentativas_respostas', ['questao_id'], {
          name: 'idx_tentativas_questao'
        });
      } catch (e) {
        console.log('ℹ️  Índice questao_id já existe');
      }

      try {
        await queryInterface.addIndex('tentativas_respostas', ['usuario_id', 'torneio_id'], {
          name: 'idx_tentativas_usuario_torneio'
        });
      } catch (e) {
        console.log('ℹ️  Índice usuario_id_torneio já existe');
      }

      try {
        await queryInterface.addIndex('tentativas_respostas', ['usuario_id', 'torneio_id', 'disciplina_competida'], {
          name: 'idx_tentativas_full'
        });
      } catch (e) {
        console.log('ℹ️  Índice full já existe');
      }
    } catch (error) {
      console.error('❌ Erro na migração:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tables = await queryInterface.showAllTables();
      if (tables.includes('tentativas_respostas')) {
        await queryInterface.dropTable('tentativas_respostas');
      }
    } catch (error) {
      console.error('❌ Erro ao reverter:', error.message);
      throw error;
    }
  }
};
