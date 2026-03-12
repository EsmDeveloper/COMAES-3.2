import sequelize from './config/db.js';
import Usuario from './models/User.js';

async function check() {
  try {
    const count = await Usuario.count();
    console.log('TOTAL_USERS:' + count);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
