// Script to add slug column to torneios table
import sequelize from './config/db.js';
import { QueryTypes } from 'sequelize';

async function addSlugColumn() {
  try {
    // Check if slug column exists
    const columns = await sequelize.query(
      "SHOW COLUMNS FROM torneios LIKE 'slug'",
      { type: QueryTypes.SELECT }
    );

    if (columns.length === 0) {
      console.log('Adding slug column...');
      // Add column as nullable first
      await sequelize.query(
        'ALTER TABLE torneios ADD COLUMN slug VARCHAR(255) UNIQUE'
      );

      // Get all torneios
      const torneios = await sequelize.query(
        'SELECT id, titulo FROM torneios',
        { type: QueryTypes.SELECT }
      );

      // Generate and update slugs
      for (const torneio of torneios) {
        const slug = torneio.titulo
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 255);

        await sequelize.query(
          'UPDATE torneios SET slug = ? WHERE id = ?',
          { replacements: [slug, torneio.id] }
        );
      }

      // Make it NOT NULL
      await sequelize.query(
        'ALTER TABLE torneios MODIFY COLUMN slug VARCHAR(255) NOT NULL UNIQUE'
      );

      console.log('[SUCCESS] Slug column added successfully!');
    } else {
      console.log('Slug column already exists');
    }

  } catch (error) {
    console.error('Error adding slug column:', error);
  } finally {
    await sequelize.close();
  }
}

addSlugColumn();