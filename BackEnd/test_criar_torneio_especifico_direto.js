import Torneio from './models/Torneio.js';
import sequelize from './config/db.js';

async function testarCriacaoTorneioEspecifico() {
  try {
    console.log('📋 TESTE: Criando torneio específico diretamente via modelo...\n');

    // Criar torneio específico
    const novoTorneio = await Torneio.create({
      titulo: 'Torneio Específico - Teste Direto',
      slug: 'torneio-especifico-teste-direto-' + Date.now(),
      descricao: 'Teste direto de criação de torneio específico',
      inicia_em: new Date(),
      termina_em: new Date(Date.now() + 24 * 60 * 60 * 1000),
      criado_por: 1,
      status: 'ativo',
      tipo_torneio: 'especifico',
      disciplina_especifica: 'Matemática'
    });

    console.log('✅ Torneio criado com sucesso!');
    console.log('📊 Dados salvos no banco:\n');
    console.log(`   id: ${novoTorneio.id}`);
    console.log(`   titulo: ${novoTorneio.titulo}`);
    console.log(`   tipo_torneio: ${novoTorneio.tipo_torneio}`);
    console.log(`   disciplina_especifica: ${novoTorneio.disciplina_especifica}`);
    console.log(`   status: ${novoTorneio.status}\n`);

    // Buscar novamente do banco
    const torneioRecuperado = await Torneio.findByPk(novoTorneio.id);
    console.log('🔍 Verificando dados recuperados do banco:\n');
    console.log(`   id: ${torneioRecuperado.id}`);
    console.log(`   titulo: ${torneioRecuperado.titulo}`);
    console.log(`   tipo_torneio: ${torneioRecuperado.tipo_torneio}`);
    console.log(`   disciplina_especifica: ${torneioRecuperado.disciplina_especifica}`);
    console.log(`   status: ${torneioRecuperado.status}\n`);

    // Verificar se tipo_torneio é realmente 'especifico'
    if (torneioRecuperado.tipo_torneio === 'especifico') {
      console.log('✅ SUCESSO: tipo_torneio está correto no banco!');
    } else {
      console.log(`❌ ERRO: tipo_torneio mudou para "${torneioRecuperado.tipo_torneio}" no banco!`);
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('Torneio ID para teste no painel admin:', novoTorneio.id);
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testarCriacaoTorneioEspecifico();
