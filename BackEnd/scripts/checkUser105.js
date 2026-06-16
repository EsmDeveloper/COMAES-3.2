import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/db.js';

async function check() {
  try {
    const [users] = await sequelize.query('SELECT id, nome, role, is_colaborador FROM usuarios WHERE id = 105 LIMIT 1');
    console.log('User 105:', users[0]);
    
    const [admins] = await sequelize.query('SELECT id, nome, role FROM usuarios WHERE role = "admin" OR is_colaborador = 0 LIMIT 5');
    console.log('\nAdmins:', admins);
    
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit(0);
  }
}

check();
