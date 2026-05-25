import sequelize from '../config/db.js';

/**
 * SCRIPT: Preparar DROP de tabelas legadas
 * 
 * Este script:
 * 1. Verifica se todos os dados foram migrados
 * 2. Gera SQL seguro para DROP das tabelas
 * 3. NÃO executa o DROP automaticamente
 * 
 * Tabelas a serem removidas:
 * - perguntas
 * - questoes_matematica
 * - questoes_programacao
 * - questoes_ingles
 */

async function prepareDropLegacyTables() {
  try {
    console.log('🔍 VERIFICANDO ESTADO DO BANCO DE DADOS...\n');

    // 1. Contar dados em tabelas legadas
    const perguntas = await sequelize.query('SELECT COUNT(*) as count FROM perguntas', { type: sequelize.QueryTypes.SELECT });
    const qMatematica = await sequelize.query('SELECT COUNT(*) as count FROM questoes_matematica', { type: sequelize.QueryTypes.SELECT });
    const qProgramacao = await sequelize.query('SELECT COUNT(*) as count FROM questoes_programacao', { type: sequelize.QueryTypes.SELECT });
    const qIngles = await sequelize.query('SELECT COUNT(*) as count FROM questoes_ingles', { type: sequelize.QueryTypes.SELECT });
    const questoes = await sequelize.query('SELECT COUNT(*) as count FROM questoes', { type: sequelize.QueryTypes.SELECT });

    console.log('📊 ESTADO ATUAL DO BANCO:');
    console.log(`   perguntas: ${perguntas[0]?.count || perguntas[0]?.[0]?.count || 0} registros`);
    console.log(`   questoes_matematica: ${qMatematica[0]?.count || qMatematica[0]?.[0]?.count || 0} registros`);
    console.log(`   questoes_programacao: ${qProgramacao[0]?.count || qProgramacao[0]?.[0]?.count || 0} registros`);
    console.log(`   questoes_ingles: ${qIngles[0]?.count || qIngles[0]?.[0]?.count || 0} registros`);
    console.log(`   questoes (NOVA): ${questoes[0]?.count || questoes[0]?.[0]?.count || 0} registros\n`);

    // 2. Verificar se há referências ativas
    console.log('🔗 VERIFICANDO REFERÊNCIAS...');
    
    try {
      const tentativasRespostas = await sequelize.query(
        'SELECT COUNT(*) as count FROM tentativas_respostas WHERE pergunta_id IS NOT NULL',
        { type: sequelize.QueryTypes.SELECT }
      );
      const count = tentativasRespostas[0]?.count || tentativasRespostas[0]?.[0]?.count || 0;
      console.log(`   tentativas_respostas com pergunta_id: ${count}`);
    } catch (e) {
      console.log('   ℹ️ Tabela tentativas_respostas não encontrada ou sem coluna pergunta_id');
    }

    console.log();

    // 3. Gerar SQL de DROP
    console.log('📝 SQL PARA DROP DAS TABELAS LEGADAS:\n');
    
    const dropStatements = [
      '-- Remover constraints de foreign key primeiro',
      'ALTER TABLE tentativas_respostas DROP FOREIGN KEY IF EXISTS tentativas_respostas_ibfk_2;',
      '',
      '-- Drop das tabelas legadas',
      'DROP TABLE IF EXISTS perguntas;',
      'DROP TABLE IF EXISTS questoes_matematica;',
      'DROP TABLE IF EXISTS questoes_programacao;',
      'DROP TABLE IF EXISTS questoes_ingles;',
      '',
      '-- Verificação final',
      'SELECT COUNT(*) as total_questoes FROM questoes;',
    ];

    dropStatements.forEach(stmt => console.log(stmt));

    console.log('\n⚠️  INSTRUÇÕES PARA EXECUTAR O DROP:\n');
    console.log('1. Fazer backup do banco de dados');
    console.log('2. Executar as queries acima em um cliente MySQL');
    console.log('3. Verificar que a tabela "questoes" contém todos os dados');
    console.log('4. Confirmar que o sistema funciona normalmente\n');

    // 4. Gerar arquivo SQL
    const sqlContent = dropStatements.join('\n');
    console.log('💾 Arquivo SQL gerado: drop-legacy-tables.sql\n');

    // Salvar em arquivo
    const fs = await import('fs').then(m => m.promises);
    await fs.writeFile(
      './scripts/drop-legacy-tables.sql',
      sqlContent,
      'utf-8'
    );

    console.log('✅ PREPARAÇÃO CONCLUÍDA!\n');
    console.log('Próximos passos:');
    console.log('1. Revisar o arquivo drop-legacy-tables.sql');
    console.log('2. Fazer backup do banco de dados');
    console.log('3. Executar o SQL quando estiver pronto');
    console.log('4. Testar o sistema completamente\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

prepareDropLegacyTables();
