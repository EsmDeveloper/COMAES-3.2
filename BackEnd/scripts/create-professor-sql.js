import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createProfessor() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida');

    // Criar senha hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Professor123!', salt);

    // Verificar se o professor já existe
    const [existing] = await sequelize.query(
      "SELECT id, nome, email, isAdmin FROM usuarios WHERE email = 'professor.teste@comaes.ao'",
      { type: sequelize.QueryTypes.SELECT }
    );

    if (existing) {
      console.log('⚠️  Professor já existe:', {
        id: existing.id,
        nome: existing.nome,
        email: existing.email,
        isAdmin: existing.isAdmin
      });
      
      // Atualizar para garantir que não seja admin
      await sequelize.query(
        "UPDATE usuarios SET isAdmin = 0 WHERE email = 'professor.teste@comaes.ao'"
      );
      
      console.log('✅ Professor atualizado (isAdmin = false)');
      console.log('📋 Dados do professor:');
      console.log('   Email: professor.teste@comaes.ao');
      console.log('   Senha: Professor123! (use esta senha para login)');
      console.log('   isAdmin: false');
      
      process.exit(0);
    }

    // Criar usuário professor
    const result = await sequelize.query(
      `INSERT INTO usuarios (
        nome, telefone, email, nascimento, sexo, password, 
        escola, biografia, isAdmin, createdAt, updatedAt
      ) VALUES (
        'Professor Teste', 
        '+244923456789', 
        'professor.teste@comaes.ao', 
        '1985-05-15', 
        'Masculino', 
        :password, 
        'Escola Secundária de Teste', 
        'Professor de matemática com 10 anos de experiência', 
        0, 
        NOW(), 
        NOW()
      )`,
      {
        replacements: { password: hashedPassword },
        type: sequelize.QueryTypes.INSERT
      }
    );

    console.log('✅ Professor criado com sucesso!');
    console.log('📋 Dados do professor:');
    console.log('   ID:', result[0]);
    console.log('   Nome: Professor Teste');
    console.log('   Email: professor.teste@comaes.ao');
    console.log('   Senha: Professor123! (use esta senha para login)');
    console.log('   isAdmin: false (não é administrador)');
    console.log('   Telefone: +244923456789');
    console.log('\n🔑 Credenciais de login:');
    console.log('   Email: professor.teste@comaes.ao');
    console.log('   Senha: Professor123!');
    console.log('\n⚠️  IMPORTANTE: Este usuário não tem role "colaborador" porque a tabela não tem essa coluna.');
    console.log('   Ele terá acesso limitado como usuário normal (estudante).');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar professor:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

// Executar
createProfessor();