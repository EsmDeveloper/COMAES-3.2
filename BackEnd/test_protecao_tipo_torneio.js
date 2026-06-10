import Torneio from './models/Torneio.js';
import sequelize from './config/db.js';

async function testarProtecaoTipoTorneio() {
  try {
    console.log('📋 TESTE: Verificar se tipo_torneio é protegido após criação\n');

    // 1. Criar torneio específico
    const torneio = await Torneio.create({
      titulo: 'Teste Proteção - Matemática',
      slug: 'teste-protecao-' + Date.now(),
      descricao: 'Teste de proteção',
      inicia_em: new Date(),
      termina_em: new Date(Date.now() + 24 * 60 * 60 * 1000),
      criado_por: 1,
      status: 'ativo',
      tipo_torneio: 'especifico',
      disciplina_especifica: 'Matemática'
    });

    console.log('✅ Torneio criado:');
    console.log(`   ID: ${torneio.id}`);
    console.log(`   tipo_torneio: ${torneio.tipo_torneio}`);
    console.log(`   disciplina_especifica: ${torneio.disciplina_especifica}\n`);

    // 2. Tentar mudar tipo_torneio via update (deve FALHAR)
    console.log('🔄 Tentando alterar tipo_torneio para "generico"...\n');

    try {
      const [updated] = await Torneio.update(
        { tipo_torneio: 'generico' },
        { where: { id: torneio.id } }
      );

      if (updated) {
        const verificacao = await Torneio.findByPk(torneio.id);
        if (verificacao.tipo_torneio === 'generico') {
          console.log('❌ PROBLEMA: tipo_torneio foi alterado!');
          console.log(`   Novo valor: ${verificacao.tipo_torneio}`);
          console.log('\n❌ A proteção NÃO está funcionando!');
        } else {
          console.log('✅ tipo_torneio NÃO foi alterado (proteção ativa)');
          console.log(`   Valor mantido: ${verificacao.tipo_torneio}`);
        }
      }
    } catch (updateError) {
      console.log('⚠️ Update falhou (esperado se há validação de modelo):');
      console.log(`   Erro: ${updateError.message}\n`);
    }

    // 3. Verificar valor final no banco
    const torneioFinal = await Torneio.findByPk(torneio.id);
    console.log('\n🔍 Verificação final:');
    console.log(`   tipo_torneio: ${torneioFinal.tipo_torneio}`);
    console.log(`   disciplina_especifica: ${torneioFinal.disciplina_especifica}`);
    
    if (torneioFinal.tipo_torneio === 'especifico') {
      console.log('\n✅ SUCESSO: tipo_torneio está protegido!');
    } else {
      console.log('\n❌ FALHA: tipo_torneio foi alterado!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testarProtecaoTipoTorneio();
