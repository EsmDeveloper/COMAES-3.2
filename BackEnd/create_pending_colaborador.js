import sequelize from './config/db.js';
import Usuario from './models/User.js';
import bcrypt from 'bcryptjs';

const createPendingColaborador = async () => {
  try {
    console.log('👥 Criando colaborador PENDENTE com senha: 928837792Esm.\n');

    // Validar senha antes de fazer hash
    const senha = '928837792Esm.';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(senha)) {
      console.error('❌ Erro: Senha deve ter 8+ caracteres com maiúscula, minúscula, número e caractere especial');
      process.exit(1);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar colaborador PENDENTE
    const colaborador = {
      nome: 'Rafael Tavares',
      email: 'rafael.tavares@example.com',
      telefone: '912345007',
      nascimento: '2003-05-18',
      sexo: 'Masculino',
      role: 'colaborador',
      status_colaborador: 'pendente', // 🔴 PENDENTE
      disciplina_colaborador: 'programacao',
      nivel_academico: 'licenciado',
      password: senhaHash,
      imagem: null,
      biografia: 'Colaborador aguardando aprovação',
      documentos_colaborador: JSON.stringify({
        cv: 'rafael_cv.pdf',
        certificado: 'certificado_programacao.pdf'
      }),
      xp_total: 0,
      nivel_atual: 1
    };

    const user = await Usuario.create(colaborador, { validate: false });
    
    console.log('✅ Colaborador PENDENTE criado com sucesso!\n');
    console.log('📋 DETALHES:');
    console.log('───────────────────────────────────────────────');
    console.log(`Nome: ${user.nome}`);
    console.log(`Email: ${user.email}`);
    console.log(`Telefone: ${user.telefone}`);
    console.log(`Disciplina: ${user.disciplina_colaborador}`);
    console.log(`Nível Acadêmico: ${user.nivel_academico}`);
    console.log(`Status: 🔴 PENDENTE DE APROVAÇÃO`);
    console.log('───────────────────────────────────────────────\n');

    console.log('🔑 CREDENCIAIS DE LOGIN:');
    console.log('───────────────────────────────────────────────');
    console.log(`Email: ${user.email}`);
    console.log(`Senha: ${senha}`);
    console.log('───────────────────────────────────────────────\n');

    console.log('📋 O que acontece agora:');
    console.log('───────────────────────────────────────────────');
    console.log('1. Colaborador faz login com as credenciais acima');
    console.log('2. Sistema detecta status = "pendente"');
    console.log('3. Mostra tela de espera (WaitingScreen)');
    console.log('4. Admin aprova no painel administrativo');
    console.log('5. Colaborador é redirecionado automaticamente');
    console.log('6. Acessa ColaboradorDashboard');
    console.log('───────────────────────────────────────────────\n');

    console.log('🎯 TESTE SUGERIDO:');
    console.log('───────────────────────────────────────────────');
    console.log(`1. Ir para: http://localhost:5177`);
    console.log(`2. Login com: ${user.email}`);
    console.log(`3. Senha: ${senha}`);
    console.log(`4. Deverá ver: Tela de Espera ⏳`);
    console.log(`5. Admin aprova em: Menu → Usuários & Comunidade → Pedidos`);
    console.log(`6. Redirecionamento automático para painel`);
    console.log('───────────────────────────────────────────────\n');

    process.exit(0);
  } catch (e) {
    console.error('❌ Erro ao criar colaborador:', e.message);
    if (e.errors) {
      e.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

createPendingColaborador();
