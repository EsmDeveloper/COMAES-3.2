import bcrypt from 'bcryptjs';
import Usuario from '../models/User.js';
import sequelize from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createProfessor() {
  try {
    // Testar conexão com o banco
    console.log('🔗 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida');

    // Verificar se já existe um professor com este email
    const existingProfessor = await Usuario.findOne({ 
      where: { email: 'professor.teste@comaes.ao' } 
    });

    if (existingProfessor) {
      console.log('⚠️  Professor já existe:', {
        id: existingProfessor.id,
        nome: existingProfessor.nome,
        email: existingProfessor.email,
        role: existingProfessor.role
      });
      
      // Atualizar para garantir que seja colaborador
      await existingProfessor.update({
        role: 'colaborador',
        disciplina_colaborador: 'matematica',
        isAdmin: false
      });
      
      console.log('✅ Professor atualizado como colaborador');
      console.log('📋 Dados do professor:');
      console.log('   Email: professor.teste@comaes.ao');
      console.log('   Senha: Professor123! (use esta senha para login)');
      console.log('   Role: colaborador');
      console.log('   Disciplina: matematica');
      
      process.exit(0);
    }

    // Criar senha hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Professor123!', salt);

    // Criar usuário professor
    const professor = await Usuario.create({
      nome: 'Professor Teste',
      telefone: '+244923456789',
      email: 'professor.teste@comaes.ao',
      nascimento: '1985-05-15',
      sexo: 'Masculino',
      password: hashedPassword,
      escola: 'Escola Secundária de Teste',
      biografia: 'Professor de matemática com 10 anos de experiência',
      role: 'colaborador',
      disciplina_colaborador: 'matematica',
      isAdmin: false
    });

    console.log('✅ Professor criado com sucesso!');
    console.log('📋 Dados do professor:');
    console.log('   ID:', professor.id);
    console.log('   Nome:', professor.nome);
    console.log('   Email:', professor.email);
    console.log('   Senha: Professor123! (use esta senha para login)');
    console.log('   Role:', professor.role);
    console.log('   Disciplina:', professor.disciplina_colaborador);
    console.log('   Telefone:', professor.telefone);
    console.log('\n🔑 Credenciais de login:');
    console.log('   Email: professor.teste@comaes.ao');
    console.log('   Senha: Professor123!');
    console.log('\n⚠️  IMPORTANTE: Este usuário precisa ser aprovado pelo admin para acessar o painel!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar professor:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

// Executar
createProfessor();