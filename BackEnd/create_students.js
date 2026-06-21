import sequelize from './config/db.js';
import Usuario from './models/User.js';
import bcrypt from 'bcryptjs';

const createStudents = async () => {
  try {
    console.log('🎓 Criando 3 estudantes com senha: 928837792Esm.\n');

    // Validar senha antes de fazer hash
    const senha = '928837792Esm.';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(senha)) {
      console.error('❌ Erro: Senha deve ter 8+ caracteres com maiúscula, minúscula, número e caractere especial');
      process.exit(1);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const estudantes = [
      {
        nome: 'Lucas Alves',
        email: 'lucas.alves@example.com',
        telefone: '912345004',
        nascimento: '2005-09-20',
        sexo: 'Masculino',
        role: 'estudante',
        status_colaborador: 'aprovado',
        password: senhaHash,
        imagem: null,
        biografia: 'Estudante de artes',
        xp_total: 0,
        nivel_atual: 1
      },
      {
        nome: 'Ana Oliveira',
        email: 'ana.oliveira@example.com',
        telefone: '912345005',
        nascimento: '2006-04-10',
        sexo: 'Feminino',
        role: 'estudante',
        status_colaborador: 'aprovado',
        password: senhaHash,
        imagem: null,
        biografia: 'Estudante de história',
        xp_total: 0,
        nivel_atual: 1
      },
      {
        nome: 'Tiago Ferreira',
        email: 'tiago.ferreira@example.com',
        telefone: '912345006',
        nascimento: '2004-12-05',
        sexo: 'Masculino',
        role: 'estudante',
        status_colaborador: 'aprovado',
        password: senhaHash,
        imagem: null,
        biografia: 'Estudante de física',
        xp_total: 0,
        nivel_atual: 1
      }
    ];

    for (const estudante of estudantes) {
      try {
        const user = await Usuario.create(estudante, { validate: false });
        console.log(`✅ Estudante criado: ${user.nome}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Telefone: ${user.telefone}`);
        console.log(`   Status: ${user.role} - ${user.status_colaborador}\n`);
      } catch (err) {
        console.error(`❌ Erro ao criar ${estudante.nome}:`, err.message);
        if (err.errors) {
          err.errors.forEach(e => console.error(`   - ${e.path}: ${e.message}`));
        }
      }
    }

    console.log('🎉 3 estudantes criados com sucesso!');
    console.log('\n📋 CREDENCIAIS:');
    console.log('');
    console.log('Estudante 1:');
    console.log('  Email: lucas.alves@example.com');
    console.log('  Senha: 928837792Esm.');
    console.log('\nEstudante 2:');
    console.log('  Email: ana.oliveira@example.com');
    console.log('  Senha: 928837792Esm.');
    console.log('\nEstudante 3:');
    console.log('  Email: tiago.ferreira@example.com');
    console.log('  Senha: 928837792Esm.');
    console.log('\n');

    process.exit(0);
  } catch (e) {
    console.error('❌ Erro ao criar estudantes:', e.message);
    if (e.errors) {
      e.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

createStudents();
