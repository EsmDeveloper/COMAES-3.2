// BackEnd/migrations/20260422000000-add-slug-to-torneios.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First add the column as nullable
    await queryInterface.addColumn('torneios', 'slug', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });

    // Generate slugs for existing records based on title
    const torneios = await queryInterface.sequelize.query(
      'SELECT id, titulo FROM torneios WHERE slug IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const torneio of torneios) {
      const slug = torneio.titulo
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 255);

      await queryInterface.sequelize.query(
        'UPDATE torneios SET slug = ? WHERE id = ?',
        { replacements: [slug, torneio.id] }
      );
    }

    // Now make it NOT NULL
    await queryInterface.changeColumn('torneios', 'slug', {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('torneios', 'slug');
  }
};