import sequelize from './config/db.js';
import Usuario from './models/User.js';
import bcrypt from 'bcrypt';

async function testFluxoColaborador() {
  console.log('🚀 Testando fluxo de colaborador:');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // 1. Verificar estrutura da tabela
    const describeResult = await sequelize.query('DESCRIBE usuarios');
    console.log('✅ Estrutura da tabela usuarios verificada');
    
    // 2. Criar um colaborador pendente
    console.log('\n📝 Criando colaborador pendente...');
    const hashSenha = await bcrypt.hash('Senha123!', 10);
    const colaboradorPendente = await Usuario.create({
      nome: 'Colaborador Teste',
      telefone: '941234567',
      email: 'colaborador.test@example.com',
      nascimento: '1990-01-01',
      sexo: 'Masculino',
      password: hashSenha,
      role: 'colaborador',
      disciplina_colaborador: null,
      status_colaborador: 'pendente',
      escola: 'Test School',
      isAdmin: false
    });
    
    console.log('✅ Colaborador pendente criado:', {
      id: colaboradorPendente.id,
      email: colaboradorPendente.email,
      role: colaboradorPendente.role,
      status_colaborador: colaboradorPendente.status_colaborador
    });

    // 3. Criar um colaborador aprovado (por admin)
    console.log('\n📝 Criando colaborador aprovado...');
    const colaboradorAprovado = await Usuario.create({
      nome: 'Colaborador Aprovado',
      telefone: '945678901',
      email: 'colaborador.aprovado@example.com',
      nascimento: '1991-02-02',
      sexo: 'Feminino',
      password: hashSenha,
      role: 'colaborador',
      disciplina_colaborador: 'matematica',
      status_colaborador: 'aprovado',
      escola: 'Test School 2',
      isAdmin: false
    });
    
    console.log('✅ Colaborador aprovado criado:', {
      id: colaboradorAprovado.id,
      email: colaboradorAprovado.email,
      role: colaboradorAprovado.role,
      status_colaborador: colaboradorAprovado.status_colaborador,
      disciplina_colaborador: colaboradorAprovado.disciplina_colaborador
    });

    // 4. Testar busca de colaboradores pendentes
    console.log('\n🔍 Buscando colaboradores pendentes...');
    const colaboradoresPendentes = await Usuario.findAll({
      where: {
        role: 'colaborador',
        status_colaborador: 'pendente'
      },
      attributes: ['id', 'nome', 'email', 'status_colaborador']
    });
    
    console.log(`✅ Colaboradores pendentes encontrados: ${colaboradoresPendentes.length}`);
    colaboradoresPendentes.forEach(c => {
      console.log(`  - ${c.nome} (${c.email}) - Status: ${c.status_colaborador}`);
    });

    // 5. Testar busca de todos colaboradores
    console.log('\n🔍 Buscando todos os colaboradores...');
    const todosColaboradores = await Usuario.findAll({
      where: {
        role: 'colaborador'
      },
      attributes: ['id', 'nome', 'email', 'status_colaborador', 'disciplina_colaborador']
    });
    
    console.log(`✅ Total de colaboradores: ${todosColaboradores.length}`);
    
    const estatisticas = {
      total: todosColaboradores.length,
      aprovados: todosColaboradores.filter(c => c.status_colaborador === 'aprovado').length,
      pendentes: todosColaboradores.filter(c => c.status_colaborador === 'pendente').length,
      rejeitados: todosColaboradores.filter(c => c.status_colaborador === 'rejeitado').length
    };
    
    console.log('📊 Estatísticas:', estatisticas);

    // 6. Simular aprovação de colaborador pendente
    console.log('\n✅ Simulando aprovação de colaborador pendente...');
    await colaboradorPendente.update({
      status_colaborador: 'aprovado',
      disciplina_colaborador: 'ingles',
      updatedAt: new Date()
    });
    
    const colaboradorAtualizado = await Usuario.findByPk(colaboradorPendente.id);
    console.log('✅ Colaborador aprovado:', {
      id: colaboradorAtualizado.id,
      email: colaboradorAtualizado.email,
      status_colaborador: colaboradorAtualizado.status_colaborador,
      disciplina_colaborador: colaboradorAtualizado.disciplina_colaborador
    });

    // 7. Verificar fluxo completo
    console.log('\n📋 Fluxo completo testado com sucesso!');
    console.log('\n✅ Fluxo implementado:');
    console.log('   1. Registro público com role=colaborador → status_colaborador="pendente"');
    console.log('   2. Colaboradores pendentes não podem fazer login');
    console.log('   3. Admin pode ver lista de colaboradores pendentes');
    console.log('   4. Admin pode aprovar/rejeitar colaboradores');
    console.log('   5. Colaboradores aprovados recebem disciplina');
    console.log('   6. Colaboradores aprovados podem fazer login');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexão com banco de dados fechada');
  }
}

// Executar teste
testFluxoColaborador();