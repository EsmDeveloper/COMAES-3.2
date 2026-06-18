import sequelize from './config/db.js';
import bcryptjs from 'bcryptjs';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Simular a query de login
    const usuario = 'admin@comaes.com';
    const senha = 'senha_teste'; // Apenas para verificar se a query funciona

    console.log(`🔐 Testando query de login para: ${usuario}\n`);

    try {
      const [results] = await sequelize.query(
        `SELECT id, nome, telefone, email, nascimento, sexo, password, escola, imagem, biografia, isAdmin, role, disciplina_colaborador, status_colaborador, createdAt, updatedAt 
         FROM usuarios 
         WHERE email = :email OR telefone = :telefone 
         LIMIT 1`,
        {
          replacements: {
            email: usuario.toLowerCase(),
            telefone: usuario
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (results) {
        console.log('✅ Query funcionou! Usuário encontrado:\n');
        console.log(`   ID: ${results.id}`);
        console.log(`   Nome: ${results.nome}`);
        console.log(`   Email: ${results.email}`);
        console.log(`   Role: ${results.role}`);
        console.log(`   isAdmin: ${results.isAdmin}`);
        console.log(`   Password hash: ${results.password ? results.password.substring(0, 30) + '...' : 'NULL'}\n`);

        // Testar bcrypt compare
        if (results.password) {
          console.log('🔐 Testando bcrypt...');
          try {
            const match = await bcryptjs.compare(senha, results.password);
            console.log(`   Resultado: ${match ? '✅ Match' : '❌ Não coincide'}\n`);
          } catch (bcErr) {
            console.log(`   ❌ Erro no bcrypt: ${bcErr.message}\n`);
          }
        }
      } else {
        console.log('❌ Usuário não encontrado');
      }
    } catch (queryErr) {
      console.error('❌ Erro na query:', queryErr.message);
      console.error('Stack:', queryErr.stack);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
    process.exit(1);
  }
})();
