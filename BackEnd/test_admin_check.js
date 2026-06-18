import 'dotenv/config';
import sequelize from './config/database.js';
import Usuario from './models/User.js';

async function checkAdmins() {
  try {
    const admins = await Usuario.findAll({
      where: {
        $or: [
          sequelize.where(sequelize.col('role'), 'admin'),
          sequelize.where(sequelize.col('isAdmin'), true)
        ]
      },
      attributes: ['id', 'nome', 'email', 'role', 'isAdmin'],
      raw: true,
      limit: 5
    });

    if (admins.length > 0) {
      console.log('✅ Admins encontrados:');
      admins.forEach(u => {
        console.log(`   - ${u.nome} (${u.email}): role=${u.role}, isAdmin=${u.isAdmin}`);
      });
    } else {
      console.log('❌ Nenhum admin encontrado no banco');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkAdmins();
