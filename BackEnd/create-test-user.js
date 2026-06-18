import sequelize from './config/db.js';
import Usuario from './models/User.js';
import bcrypt from 'bcryptjs';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Dados do novo usuário
    const newUser = {
      nome: 'Teste Usuário',
      telefone: '+351912345999',
      email: 'noname@gmail.com',
      nascimento: '2000-01-15',
      sexo: 'Masculino',
      password: '928837792Esm',
      escola: 'Escola Teste',
      role: 'estudante',
      status_colaborador: 'aprovado'
    };

    // Verificar se usuário já existe
    const existing = await Usuario.findOne({ where: { email: newUser.email } });
    if (existing) {
      console.log('⚠️  Usuário com email já existe:');
      console.log(`   Email: ${existing.email}`);
      console.log(`   ID: ${existing.id}\n`);
      process.exit(0);
    }

    // Hash da password usando bcryptjs
    console.log('🔐 Criptografando password...');
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    console.log('✅ Password criptografada\n');

    // Criar usuário
    console.log('📝 Criando usuário...');
    const user = await Usuario.create({
      nome: newUser.nome,
      telefone: newUser.telefone,
      email: newUser.email,
      nascimento: newUser.nascimento,
      sexo: newUser.sexo,
      password: hashedPassword,
      escola: newUser.escola,
      role: newUser.role,
      status_colaborador: newUser.status_colaborador
    });

    console.log('✅ Usuário criado com sucesso!\n');
    console.log('📋 Detalhes do novo usuário:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Telefone: ${user.telefone}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status_colaborador}`);
    console.log(`   Criado em: ${user.createdAt}\n`);

    console.log('🔑 Credenciais de Login:');
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Password: ${newUser.password}\n`);

    console.log('✅ Pronto para fazer login!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();
