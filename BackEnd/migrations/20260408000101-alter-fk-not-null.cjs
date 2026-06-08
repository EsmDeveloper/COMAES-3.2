module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      try {
        await queryInterface.changeColumn('tentativas_teste', 'usuario_id', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'usuarios', key: 'id' },
          onDelete: 'CASCADE',
        }, { transaction: t });
      } catch (err) {
        console.log('⚠️ tentativas_teste already migrated');
      }

      try {
        // Check if 'certificates' table exists with 'user_id' column
        const hasColumn = await queryInterface.describeTable('certificates', { transaction: t });
        if (hasColumn && hasColumn.user_id) {
          await queryInterface.changeColumn('certificates', 'user_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'usuarios', key: 'id' },
            onDelete: 'CASCADE',
          }, { transaction: t });
        }
      } catch (err) {
        console.log('⚠️ certificates table or user_id column not found, skipping');
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('tentativas_teste', 'usuario_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    } catch (err) {
      console.log('⚠️ Cannot rollback tentativas_teste');
    }

    try {
      const hasColumn = await queryInterface.describeTable('certificates');
      if (hasColumn && hasColumn.user_id) {
        await queryInterface.changeColumn('certificates', 'user_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }
    } catch (err) {
      console.log('⚠️ Cannot rollback certificates');
    }
  }
};
