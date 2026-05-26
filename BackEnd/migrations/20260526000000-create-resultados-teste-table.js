/**
 * Migration: Create resultados_teste table
 * Stores test results for Teste de Conhecimento feature
 */

export async function up(queryInterface, Sequelize) {
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
  await queryInterface.addIndex('resultados_teste', ['usuario_id', 'area'], {
    name: 'idx_usuario_area',
  });

  await queryInterface.addIndex('resultados_teste', ['usuario_id'], {
    name: 'idx_usuario',
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('resultados_teste');
}
