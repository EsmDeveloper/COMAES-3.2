import sequelize from './config/db.js';
import Usuario from './models/User.js';

async function getUsers() {
  try {
    const users = await Usuario.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'disciplina_colaborador'],
      raw: true,
      limit: 10
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
      process.exit(0);
    }

    console.log('\n📋 USUÁRIOS CADASTRADOS:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 ID: ${user.id}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   📚 Disciplina: ${user.disciplina_colaborador || 'N/A'}`);
      console.log(`   ✅ Status: ${user.status || 'N/A'}`);
      console.log('');
    });

    console.log(`\n✅ Total de usuários encontrados: ${users.length}\n`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Erro ao buscar usuários:', e.message);
    process.exit(1);
  }
}

getUsers();
