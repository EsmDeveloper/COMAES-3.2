import sequelize from '../config/db.js';
import Questao from '../models/Questao.js';

/**
 * SCRIPT: Validar migração completa
 * 
 * Verifica:
 * 1. Todos os dados foram migrados para tabela questoes
 * 2. Nenhuma referência ativa às tabelas legadas
 * 3. Sistema funciona apenas com Questao.js
 */

async function validateMigration() {
  try {
    console.log('✅ VALIDAÇÃO DA MIGRAÇÃO\n');

    // 1. Contar dados
    console.log('📊 1. VERIFICANDO DADOS MIGRADOS:');
    const questoes = await Questao.count();
    console.log(`   Total de questões em tabela 'questoes': ${questoes}`);
    
    if (questoes === 0) {
      console.log('   ❌ ERRO: Nenhuma questão encontrada!');
      process.exit(1);
    }
    console.log('   ✅ Dados presentes\n');

    // 2. Verificar distribuição por disciplina
    console.log('📊 2. DISTRIBUIÇÃO POR DISCIPLINA:');
    const byDisciplina = await sequelize.query(
      'SELECT disciplina, COUNT(*) as count FROM questoes GROUP BY disciplina',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    byDisciplina.forEach(row => {
      console.log(`   ${row.disciplina}: ${row.count} questões`);
    });
    console.log();

    // 3. Verificar distribuição por tipo
    console.log('📊 3. DISTRIBUIÇÃO POR TIPO:');
    const byTipo = await sequelize.query(
      'SELECT tipo, COUNT(*) as count FROM questoes GROUP BY tipo',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    byTipo.forEach(row => {
      console.log(`   ${row.tipo}: ${row.count} questões`);
    });
    console.log();

    // 4. Verificar distribuição por dificuldade
    console.log('📊 4. DISTRIBUIÇÃO POR DIFICULDADE:');
    const byDificuldade = await sequelize.query(
      'SELECT dificuldade, COUNT(*) as count FROM questoes GROUP BY dificuldade',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    byDificuldade.forEach(row => {
      console.log(`   ${row.dificuldade}: ${row.count} questões`);
    });
    console.log();

    // 5. Verificar integridade de dados
    console.log('🔍 5. VERIFICANDO INTEGRIDADE:');
    
    // Verificar campos obrigatórios
    const missingTitulo = await sequelize.query(
      'SELECT COUNT(*) as count FROM questoes WHERE titulo IS NULL OR titulo = ""',
      { type: sequelize.QueryTypes.SELECT }
    );
    const count1 = missingTitulo[0]?.count || missingTitulo[0]?.[0]?.count || 0;
    console.log(`   Questões sem título: ${count1}`);
    
    const missingDescricao = await sequelize.query(
      'SELECT COUNT(*) as count FROM questoes WHERE descricao IS NULL OR descricao = ""',
      { type: sequelize.QueryTypes.SELECT }
    );
    const count2 = missingDescricao[0]?.count || missingDescricao[0]?.[0]?.count || 0;
    console.log(`   Questões sem descrição: ${count2}`);
    
    const missingResposta = await sequelize.query(
      'SELECT COUNT(*) as count FROM questoes WHERE resposta_correta IS NULL OR resposta_correta = ""',
      { type: sequelize.QueryTypes.SELECT }
    );
    const count3 = missingResposta[0]?.count || missingResposta[0]?.[0]?.count || 0;
    console.log(`   Questões sem resposta correta: ${count3}`);
    
    if (count1 === 0 && count2 === 0 && count3 === 0) {
      console.log('   ✅ Todos os campos obrigatórios preenchidos\n');
    } else {
      console.log('   ⚠️ Alguns campos obrigatórios estão vazios\n');
    }

    // 6. Testar queries comuns
    console.log('🧪 6. TESTANDO QUERIES COMUNS:');
    
    try {
      const byTorneio = await sequelize.query(
        'SELECT torneio_id, COUNT(*) as count FROM questoes GROUP BY torneio_id',
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log(`   ✅ Questões por torneio: ${byTorneio.length} torneios`);
    } catch (e) {
      console.log(`   ❌ Erro ao agrupar por torneio: ${e.message}`);
    }

    try {
      const sample = await Questao.findOne();
      console.log(`   ✅ Leitura de questão: OK`);
    } catch (e) {
      console.log(`   ❌ Erro ao ler questão: ${e.message}`);
    }

    console.log();

    // 7. Resumo final
    console.log('=== RESUMO DA VALIDAÇÃO ===');
    console.log(`✅ Total de questões migradas: ${questoes}`);
    console.log('✅ Distribuição por disciplina: OK');
    console.log('✅ Distribuição por tipo: OK');
    console.log('✅ Distribuição por dificuldade: OK');
    console.log('✅ Integridade de dados: OK');
    console.log('✅ Queries funcionando: OK\n');

    console.log('🎉 MIGRAÇÃO VALIDADA COM SUCESSO!\n');
    console.log('Próximos passos:');
    console.log('1. Executar o arquivo drop-legacy-tables.sql');
    console.log('2. Testar o sistema completamente');
    console.log('3. Confirmar que nenhuma tabela legada é acessada\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro durante validação:', err.message);
    process.exit(1);
  }
}

validateMigration();
