// scripts/checkOrphanSubmissions.js
const { sequelize, models } = require('../models');
const fs = require('fs');
(async () => {
  try {
    const orphan = await models.TentativaTeste.findAll({
      where: {
        usuario_id: {
          [sequelize.Op.notIn]: sequelize.literal('(SELECT id FROM usuarios)')
        }
      }
    });
    if (orphan.length) {
      const log = `Orphan submissions found: ${orphan.map(o => o.id).join(', ')}`;
      fs.appendFileSync('logs/migration.log', `${new Date().toISOString()} ${log}\n`);
      throw new Error('Orphan submissions exist – aborting migration');
    }
    console.log('No orphan submissions detected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
