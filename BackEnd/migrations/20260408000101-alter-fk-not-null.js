module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.changeColumn('tentativas_teste', 'usuario_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
      }, { transaction: t });

      await queryInterface.changeColumn('certificates', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
      }, { transaction: t });
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('tentativas_teste', 'usuario_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('certificates', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
