'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tables = await queryInterface.showAllTables();
      if (tables.includes('resultados_teste')) {
        console.log('ℹ️  Tabela resultados_teste já existe');
        return;
      }

      await queryInterface.createTable('resultados_teste', {
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
          onUpdate: 'CASCADE',
        },
        area: {
          type: Sequelize.ENUM('matematica', 'programacao', 'ingles'),
          allowNull: false,
        },
        percentual_acertos: {
          type: Sequelize.TINYINT.UNSIGNED,
          allowNull: false,
        },
        pontos: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        total_questoes: {
          type: Sequelize.TINYINT.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        acertos: {
          type: Sequelize.TINYINT.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Add indexes for performance
      try {
        await queryInterface.addIndex('resultados_teste', ['usuario_id', 'area'], {
          name: 'idx_res_usuario_area',
        });
      } catch (e) {
        console.log('ℹ️  Índice usuario_area já existe');
      }

      try {
        await queryInterface.addIndex('resultados_teste', ['usuario_id'], {
          name: 'idx_res_usuario',
        });
      } catch (e) {
        console.log('ℹ️  Índice usuario já existe');
      }

      console.log('✅ Tabela resultados_teste criada');
    } catch (error) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tables = await queryInterface.showAllTables();
      if (tables.includes('resultados_teste')) {
        await queryInterface.dropTable('resultados_teste');
      }
    } catch (error) {
      console.error('❌ Erro ao reverter:', error.message);
    }
  }
};
