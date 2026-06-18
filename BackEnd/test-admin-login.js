import sequelize from './config/db.js';
import bcryptjs from 'bcryptjs';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Encontrar admin
    const [admins] = await sequelize.query(
      "SELECT id, nome, email, telefone, role, isAdmin FROM usuarios WHERE role = 'admin' OR isAdmin = true LIMIT 5"
    );

    console.log('👑 Contas de Admin encontradas:\n');
    
    if (admins.length === 0) {
      console.log('❌ Nenhuma conta admin encontrada!');
    } else {
      admins.forEach((admin, idx) => {
        console.log(`${idx + 1}. ${admin.nome}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Telefone: ${admin.telefone}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   isAdmin: ${admin.isAdmin}\n`);
      });

      // Testar login do primeiro admin
      const adminEmail = admins[0].email;
      console.log(`\n🔐 Testando login com: ${adminEmail}`);
      console.log('Password necessária para testar...\n');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    console.error(err);
    process.exit(1);
  }
})();
