/**
 * clean-all-questions.js
 * Limpa TODAS as questões, blocos e dados relacionados
 * ⚠️ CUIDADO: Esta é uma operação DESTRUTIVA e não pode ser desfeita!
 */

import sequelize from '../config/db.js';

async function cleanAll() {
  try {
    console.log('\n🔴 ⚠️  LIMPEZA COMPLETA DE QUESTÕES E BLOCOS ⚠️  🔴\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Desabilitar verificação de foreign keys temporariamente
    await sequelize.query('SET FOREIGN_KEY_CHECKS=0');
    console.log('🔓 Foreign key checks desativadas\n');

    // ========================================
    // LIMPAR TUDO NA ORDEM CORRETA
    // ========================================

    // 1. Limpar tentativas de resposta (depende de questões)
    console.log('📝 Limpando tentativas de resposta...');
    try {
      await sequelize.query('DELETE FROM tentativa_respostas');
      console.log('   ✅ Tentativas de resposta deletadas');
    } catch (e) {
      console.log('   ℹ️  Tabela não existe ou está vazia');
    }
    console.log('');

    // 2. Limpar itens de blocos (depende de questões e blocos)
    console.log('📝 Limpando itens de blocos...');
    await sequelize.query('DELETE FROM bloco_questoes_items');
    console.log('   ✅ Itens de blocos deletados\n');

    // 3. Limpar questões da tabela nova (questoes)
    console.log('📝 Limpando questões (tabela nova)...');
    const qResult = await sequelize.query('DELETE FROM questoes');
    console.log(`   ✅ ${qResult[0].affectedRows} questões deletadas\n`);

    // 4. Limpar questões da tabela antiga (questoes_teste_conhecimento)
    console.log('📝 Limpando questões teste (tabela antiga)...');
    const qtkResult = await sequelize.query('DELETE FROM questoes_teste_conhecimento');
    console.log(`   ✅ ${qtkResult[0].affectedRows} questões teste deletadas\n`);

    // 5. Limpar blocos de questões
    console.log('📝 Limpando blocos de questões...');
    const bResult = await sequelize.query('DELETE FROM blocos_questoes');
    console.log(`   ✅ ${bResult[0].affectedRows} blocos deletados\n`);

    // 6. Limpar torneios (se necessário - opcional)
    console.log('📝 Limpando associações torneio-bloco...');
    await sequelize.query('DELETE FROM torneio_blocos');
    console.log('   ✅ Associações torneio-bloco deletadas\n');

    // Reabilitar verificação de foreign keys
    await sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    console.log('🔒 Foreign key checks reativadas\n');

    // ========================================
    // VERIFICAR RESULTADO FINAL
    // ========================================

    console.log('📊 Verificando dados restantes...\n');

    const countQuestoes = await sequelize.query(
      'SELECT COUNT(*) as count FROM questoes'
    );
    console.log(`   📋 Questões (tabela nova): ${countQuestoes[0][0].count}`);

    const countQuestoesTK = await sequelize.query(
      'SELECT COUNT(*) as count FROM questoes_teste_conhecimento'
    );
    console.log(`   📋 Questões Teste (tabela antiga): ${countQuestoesTK[0][0].count}`);

    const countBlocos = await sequelize.query(
      'SELECT COUNT(*) as count FROM blocos_questoes'
    );
    console.log(`   📋 Blocos de Questões: ${countBlocos[0][0].count}`);

    const countItens = await sequelize.query(
      'SELECT COUNT(*) as count FROM bloco_questoes_items'
    );
    console.log(`   📋 Itens de Blocos: ${countItens[0][0].count}`);

    const countRespostas = await sequelize.query(
      'SELECT COUNT(*) as count FROM tentativa_respostas'
    ).catch(() => [[{ count: 0 }]]);
    console.log(`   📋 Tentativas de Resposta: ${countRespostas[0][0].count}`);

    const countTorneioBlocos = await sequelize.query(
      'SELECT COUNT(*) as count FROM torneio_blocos'
    );
    console.log(`   📋 Torneio-Blocos: ${countTorneioBlocos[0][0].count}\n`);

    console.log('✅ ========================================');
    console.log('✅ LIMPEZA COMPLETA CONCLUÍDA COM SUCESSO!');
    console.log('✅ ========================================\n');
    console.log('🎯 Banco limpo! Pronto para implementar manualmente.\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO DURANTE LIMPEZA:', error.message);
    console.error('Stack:', error.stack);
    
    // Tentar reabilitar foreign keys mesmo em caso de erro
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    } catch (e) {
      console.error('Não foi possível reabilitar foreign keys');
    }
    
    process.exit(1);
  }
}

cleanAll();
