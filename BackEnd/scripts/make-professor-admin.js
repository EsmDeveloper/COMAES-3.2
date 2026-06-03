import sequelize from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function makeProfessorAdmin() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida');

    // Tornar o professor admin
    const result = await sequelize.query(
      "UPDATE usuarios SET isAdmin = 1 WHERE email = 'professor.teste@comaes.ao'",
      { type: sequelize.QueryTypes.UPDATE }
    );

    // Verificar resultado
    const [professor] = await sequelize.query(
      "SELECT id, nome, email, isAdmin FROM usuarios WHERE email = 'professor.teste@comaes.ao'",
      { type: sequelize.QueryTypes.SELECT }
    );

    if (professor && professor.isAdmin === 1) {
      console.log('✅ Professor agora é administrador!');
      console.log('📋 Dados atualizados:');
      console.log('   ID:', professor.id);
      console.log('   Nome:', professor.nome);
      console.log('   Email:', professor.email);
      console.log('   isAdmin:', professor.isAdmin === 1 ? 'Sim' : 'Não');
      console.log('\n🔑 Credenciais:');
      console.log('   Email: professor.teste@comaes.ao');
      console.log('   Senha: Professor123!');
      console.log('\n⚠️  ATENÇÃO: Agora este usuário tem acesso total ao painel administrativo!');
    } else {
      console.log('❌ Não foi possível tornar o professor admin');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar
makeProfessorAdmin();