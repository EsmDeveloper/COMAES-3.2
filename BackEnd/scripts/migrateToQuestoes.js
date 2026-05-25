import sequelize from '../config/db.js';
import Questao from '../models/Questao.js';

/**
 * SCRIPT DE MIGRAÇÃO FINAL - CONSOLIDAÇÃO DE DADOS
 * Migra todos os dados das tabelas legadas para a tabela 'questoes'
 * 
 * Tabelas legadas:
 * - perguntas (15 registros)
 * - questoes_matematica (5 registros)
 * - questoes_programacao (5 registros)
 * - questoes_ingles (5 registros)
 */

async function migrateData() {
  try {
    console.log('🔄 INICIANDO MIGRAÇÃO DE DADOS...\n');

    // 1. Migrar de questoes_matematica
    console.log('📊 Migrando questoes_matematica...');
    const qMatematica = await sequelize.query(
      'SELECT * FROM questoes_matematica',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    for (const q of qMatematica) {
      await Questao.create({
        torneio_id: q.torneio_id,
        titulo: q.titulo,
        descricao: q.descricao,
        disciplina: 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: q.dificuldade,
        opcoes: q.opcoes,
        resposta_correta: q.resposta_correta,
        pontos: q.pontos || 10,
        midia: q.midia,
      });
    }
    console.log(`✅ ${qMatematica.length} questões de Matemática migradas\n`);

    // 2. Migrar de questoes_programacao
    console.log('📊 Migrando questoes_programacao...');
    const qProgramacao = await sequelize.query(
      'SELECT * FROM questoes_programacao',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    for (const q of qProgramacao) {
      await Questao.create({
        torneio_id: q.torneio_id,
        titulo: q.titulo,
        descricao: q.descricao,
        disciplina: 'programacao',
        tipo: 'codigo',
        dificuldade: q.dificuldade,
        opcoes: q.opcoes,
        resposta_correta: q.resposta_correta,
        pontos: q.pontos || 15,
        linguagem: q.linguagem,
        midia: q.midia,
      });
    }
    console.log(`✅ ${qProgramacao.length} questões de Programação migradas\n`);

    // 3. Migrar de questoes_ingles
    console.log('📊 Migrando questoes_ingles...');
    const qIngles = await sequelize.query(
      'SELECT * FROM questoes_ingles',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    for (const q of qIngles) {
      await Questao.create({
        torneio_id: q.torneio_id,
        titulo: q.titulo,
        descricao: q.descricao,
        disciplina: 'ingles',
        tipo: 'multipla_escolha',
        dificuldade: q.dificuldade,
        opcoes: q.opcoes,
        resposta_correta: q.resposta_correta,
        pontos: q.pontos || 10,
        midia: q.midia,
      });
    }
    console.log(`✅ ${qIngles.length} questões de Inglês migradas\n`);

    // 4. Migrar de perguntas (tabela mais antiga)
    console.log('📊 Migrando perguntas (tabela legada)...');
    const perguntas = await sequelize.query(
      'SELECT * FROM perguntas',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Obter primeiro torneio válido
    const torneios = await sequelize.query(
      'SELECT id FROM torneios LIMIT 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    const torneioId = torneios[0]?.id || 5;
    
    for (const p of perguntas) {
      // Mapear tipo antigo para novo
      let disciplina = 'matematica';
      let tipo = 'multipla_escolha';
      
      if (p.tipo === 'programacao') {
        disciplina = 'programacao';
        tipo = 'codigo';
      } else if (p.tipo === 'ingles') {
        disciplina = 'ingles';
        tipo = 'multipla_escolha';
      }
      
      // Converter opcoes a/b/c/d para array
      const opcoes = [
        { label: 'A', valor: p.opcao_a },
        { label: 'B', valor: p.opcao_b },
        { label: 'C', valor: p.opcao_c },
        { label: 'D', valor: p.opcao_d },
      ].filter(o => o.valor);
      
      await Questao.create({
        torneio_id: torneioId,
        titulo: `Pergunta ${p.ordem_indice}`,
        descricao: p.texto_pergunta,
        disciplina: disciplina,
        tipo: tipo,
        dificuldade: p.dificuldade || 'facil',
        opcoes: opcoes.length > 0 ? opcoes : null,
        resposta_correta: p.resposta_correta,
        pontos: p.pontos || 1,
        midia: p.midia,
      });
    }
    console.log(`✅ ${perguntas.length} perguntas legadas migradas\n`);

    // 5. Verificar resultado
    console.log('📊 Verificando resultado da migração...');
    const totalMigrado = await Questao.count();
    console.log(`✅ Total de questões na tabela 'questoes': ${totalMigrado}\n`);

    // 6. Resumo
    const totalEsperado = qMatematica.length + qProgramacao.length + qIngles.length + perguntas.length;
    console.log('=== RESUMO DA MIGRAÇÃO ===');
    console.log(`Total esperado: ${totalEsperado}`);
    console.log(`Total migrado: ${totalMigrado}`);
    
    if (totalMigrado === totalEsperado) {
      console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
    } else {
      console.log('⚠️ AVISO: Quantidade de registros não corresponde!\n');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro durante migração:', err.message);
    console.error(err);
    process.exit(1);
  }
}

migrateData();
