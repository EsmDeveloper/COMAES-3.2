// scripts/checkOrphanCertificates.js
const { sequelize, models } = require('../models');
const fs = require('fs');
(async () => {
  try {
    const orphan = await models.Certificate.findAll({
      where: {
        user_id: {
          [sequelize.Op.notIn]: sequelize.literal('(SELECT id FROM usuarios)')
        }
      }
    });
    if (orphan.length) {
      const log = `Orphan certificates found: ${orphan.map(o => o.id).join(', ')}`;
      fs.appendFileSync('logs/migration.log', `${new Date().toISOString()} ${log}\n`);
      throw new Error('Orphan certificates exist – aborting migration');
    }
    console.log('No orphan certificates detected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
