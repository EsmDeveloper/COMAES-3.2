import sequelize from '../config/db.js';
import Questao from '../models/Questao.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import TentativaResposta from '../models/TentativaResposta.js';

/**
 * SCRIPT: Validação de Produção
 * 
 * Testa:
 * 1. Endpoints de questões
 * 2. Endpoints de tentativas
 * 3. Ranking (ParticipanteTorneio)
 * 4. Integridade de dados
 * 5. Dependências de modelos
 * 
 * NÃO modifica nada - apenas valida
 */

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  risks: [],
  summary: {}
};

async function test(name, fn) {
  try {
    console.log(`\n🧪 ${name}...`);
    await fn();
    results.tests.push({ name, status: 'OK', error: null });
    console.log(`   ✅ OK`);
    return true;
  } catch (err) {
    console.log(`   ❌ FALHA: ${err.message}`);
    results.tests.push({ name, status: 'FALHA', error: err.message });
    return false;
  }
}

async function runValidation() {
  try {
    console.log('\n');
    console.log('║           VALIDAÇÃO DE PRODUÇÃO - SISTEMA DE QUESTÕES          ║');
    console.log('\n');

    // ========== TESTE 1: MODELO QUESTAO.JS ==========
    console.log('\n📋 TESTE 1: MODELO QUESTAO.JS');
    console.log('');

    await test('Questao.js carregado corretamente', async () => {
      if (!Questao) throw new Error('Modelo Questao não carregado');
    });

    await test('Contar questões na tabela', async () => {
      const count = await Questao.count();
      if (count === 0) throw new Error('Nenhuma questão encontrada');
      console.log(`   Total: ${count} questões`);
    });

    await test('Buscar questão por ID', async () => {
      const q = await Questao.findOne();
      if (!q) throw new Error('Nenhuma questão encontrada');
      console.log(`   ID: ${q.id}, Disciplina: ${q.disciplina}`);
    });

    await test('Buscar questões por disciplina', async () => {
      const q = await Questao.findAll({ where: { disciplina: 'matematica' }, limit: 1 });
      if (q.length === 0) throw new Error('Nenhuma questão de matemática');
    });

    await test('Buscar questões por dificuldade', async () => {
      const q = await Questao.findAll({ where: { dificuldade: 'facil' }, limit: 1 });
      if (q.length === 0) throw new Error('Nenhuma questão fácil');
    });

    await test('Buscar questões por torneio', async () => {
      const q = await Questao.findAll({ where: { torneio_id: 3 }, limit: 1 });
      if (q.length === 0) throw new Error('Nenhuma questão no torneio 3');
    });

    // ========== TESTE 2: INTEGRIDADE DE DADOS ==========
    console.log('\n📋 TESTE 2: INTEGRIDADE DE DADOS');
    console.log('');

    await test('Verificar campos obrigatórios', async () => {
      const missing = await sequelize.query(
        'SELECT COUNT(*) as count FROM questoes WHERE titulo IS NULL OR descricao IS NULL OR resposta_correta IS NULL',
        { type: sequelize.QueryTypes.SELECT }
      );
      const count = missing[0]?.count || missing[0]?.[0]?.count || 0;
      if (count > 0) throw new Error(`${count} questões com campos vazios`);
    });

    await test('Verificar distribuição por disciplina', async () => {
      const dist = await sequelize.query(
        'SELECT disciplina, COUNT(*) as count FROM questoes GROUP BY disciplina',
        { type: sequelize.QueryTypes.SELECT }
      );
      if (dist.length === 0) throw new Error('Nenhuma disciplina encontrada');
      console.log(`   Disciplinas: ${dist.map(d => `${d.disciplina}(${d.count})`).join(', ')}`);
    });

    await test('Verificar distribuição por tipo', async () => {
      const dist = await sequelize.query(
        'SELECT tipo, COUNT(*) as count FROM questoes GROUP BY tipo',
        { type: sequelize.QueryTypes.SELECT }
      );
      if (dist.length === 0) throw new Error('Nenhum tipo encontrado');
      console.log(`   Tipos: ${dist.map(d => `${d.tipo}(${d.count})`).join(', ')}`);
    });

    await test('Verificar distribuição por dificuldade', async () => {
      const dist = await sequelize.query(
        'SELECT dificuldade, COUNT(*) as count FROM questoes GROUP BY dificuldade',
        { type: sequelize.QueryTypes.SELECT }
      );
      if (dist.length === 0) throw new Error('Nenhuma dificuldade encontrada');
      console.log(`   Dificuldades: ${dist.map(d => `${d.dificuldade}(${d.count})`).join(', ')}`);
    });

    // ========== TESTE 3: MODELO PARTICIPANTE TORNEIO ==========
    console.log('\n📋 TESTE 3: MODELO PARTICIPANTE TORNEIO');
    console.log('');

    await test('ParticipanteTorneio carregado corretamente', async () => {
      if (!ParticipanteTorneio) throw new Error('Modelo ParticipanteTorneio não carregado');
    });

    await test('Contar participantes', async () => {
      const count = await ParticipanteTorneio.count();
      console.log(`   Total: ${count} participantes`);
    });

    await test('Buscar participante por torneio', async () => {
      const p = await ParticipanteTorneio.findOne({ where: { torneio_id: 3 } });
      if (!p) throw new Error('Nenhum participante no torneio 3');
      console.log(`   Usuário: ${p.usuario_id}, Pontuação: ${p.pontuacao}`);
    });

    await test('Verificar ranking por torneio', async () => {
      const ranking = await sequelize.query(
        'SELECT usuario_id, pontuacao, posicao FROM participantes_torneios WHERE torneio_id = 3 ORDER BY pontuacao DESC LIMIT 3',
        { type: sequelize.QueryTypes.SELECT }
      );
      if (ranking.length === 0) throw new Error('Nenhum ranking encontrado');
      console.log(`   Top 3: ${ranking.map(r => `U${r.usuario_id}(${r.pontuacao}pts)`).join(', ')}`);
    });

    // ========== TESTE 4: MODELO TENTATIVA RESPOSTA ==========
    console.log('\n📋 TESTE 4: MODELO TENTATIVA RESPOSTA');
    console.log('');

    await test('TentativaResposta carregado corretamente', async () => {
      if (!TentativaResposta) throw new Error('Modelo TentativaResposta não carregado');
    });

    await test('Contar tentativas de resposta', async () => {
      const count = await TentativaResposta.count();
      console.log(`   Total: ${count} tentativas`);
    });

    // ========== TESTE 5: QUERIES CRÍTICAS ==========
    console.log('\n📋 TESTE 5: QUERIES CRÍTICAS');
    console.log('');

    await test('Query: Questões por torneio e disciplina', async () => {
      const q = await Questao.findAll({
        where: { torneio_id: 3, disciplina: 'matematica' },
        limit: 1
      });
      console.log(`   Encontradas: ${q.length} questões`);
    });

    await test('Query: Questões ordenadas por pontos', async () => {
      const q = await Questao.findAll({
        order: [['pontos', 'DESC']],
        limit: 3
      });
      console.log(`   Top 3: ${q.map(x => `${x.titulo}(${x.pontos}pts)`).join(', ')}`);
    });

    await test('Query: Paginação de questões', async () => {
      const page1 = await Questao.findAll({ limit: 10, offset: 0 });
      const page2 = await Questao.findAll({ limit: 10, offset: 10 });
      console.log(`   Página 1: ${page1.length}, Página 2: ${page2.length}`);
    });

    await test('Query: Questões com opções JSON', async () => {
      const q = await Questao.findOne({ where: { tipo: 'multipla_escolha' } });
      if (!q || !q.opcoes) throw new Error('Nenhuma questão com opções');
      console.log(`   Opções encontradas: ${Array.isArray(q.opcoes) ? q.opcoes.length : 'JSON válido'}`);
    });

    // ========== TESTE 6: DEPENDÊNCIAS DE MODELOS LEGADOS ==========
    console.log('\n📋 TESTE 6: VERIFICAR DEPENDÊNCIAS DE MODELOS LEGADOS');
    console.log('');

    await test('Verificar se Questao.js é usado em runtime', async () => {
      // Procurar por referências ativas a questao_id
      const refs = await sequelize.query(
        'SELECT COUNT(*) as count FROM tentativas_respostas WHERE questao_id IS NOT NULL',
        { type: sequelize.QueryTypes.SELECT }
      );
      const count = refs[0]?.count || refs[0]?.[0]?.count || 0;
      console.log(`   Referências ativas a questao_id: ${count}`);
    });

    await test('Verificar se tabelas legadas têm dados novos', async () => {
      // Verificar timestamps recentes
      const recent = await sequelize.query(
        'SELECT COUNT(*) as count FROM perguntas WHERE criado_em > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
        { type: sequelize.QueryTypes.SELECT }
      );
      const count = recent[0]?.count || recent[0]?.[0]?.count || 0;
      if (count > 0) {
        results.risks.push('Encontrados dados recentes em tabela legada perguntas');
        throw new Error(`${count} registros criados recentemente em perguntas`);
      }
    });

    // ========== TESTE 7: ENDPOINTS SIMULADOS ==========
    console.log('\n📋 TESTE 7: ENDPOINTS SIMULADOS');
    console.log('');

    await test('Simular: GET /api/questoes/quiz/matematica', async () => {
      const q = await Questao.findAll({
        where: { disciplina: 'matematica' },
        limit: 10
      });
      if (q.length === 0) throw new Error('Nenhuma questão de matemática');
      console.log(`   Retornaria: ${q.length} questões`);
    });

    await test('Simular: GET /api/questoes/torneio/3', async () => {
      const q = await Questao.findAll({
        where: { torneio_id: 3 },
        limit: 50
      });
      if (q.length === 0) throw new Error('Nenhuma questão no torneio 3');
      console.log(`   Retornaria: ${q.length} questões`);
    });

    await test('Simular: GET /api/ranking/torneio/3', async () => {
      const ranking = await ParticipanteTorneio.findAll({
        where: { torneio_id: 3 },
        order: [['pontuacao', 'DESC']],
        limit: 10
      });
      console.log(`   Retornaria: ${ranking.length} participantes`);
    });

    // ========== TESTE 8: INTEGRIDADE REFERENCIAL ==========
    console.log('\n📋 TESTE 8: INTEGRIDADE REFERENCIAL');
    console.log('');

    await test('Verificar foreign keys de questoes', async () => {
      const orphans = await sequelize.query(
        'SELECT COUNT(*) as count FROM questoes q LEFT JOIN torneios t ON q.torneio_id = t.id WHERE t.id IS NULL',
        { type: sequelize.QueryTypes.SELECT }
      );
      const count = orphans[0]?.count || orphans[0]?.[0]?.count || 0;
      if (count > 0) {
        results.risks.push(`${count} questões órfãs (torneio_id inválido)`);
        throw new Error(`${count} questões com torneio_id inválido`);
      }
    });

    await test('Verificar foreign keys de participantes', async () => {
      const orphans = await sequelize.query(
        'SELECT COUNT(*) as count FROM participantes_torneios pt LEFT JOIN torneios t ON pt.torneio_id = t.id LEFT JOIN usuarios u ON pt.usuario_id = u.id WHERE t.id IS NULL OR u.id IS NULL',
        { type: sequelize.QueryTypes.SELECT }
      );
      const count = orphans[0]?.count || orphans[0]?.[0]?.count || 0;
      if (count > 0) {
        results.risks.push(`${count} participantes órfãos`);
        throw new Error(`${count} participantes com referências inválidas`);
      }
    });

    // ========== RESUMO ==========
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('');

    const passed = results.tests.filter(t => t.status === 'OK').length;
    const failed = results.tests.filter(t => t.status === 'FALHA').length;
    const total = results.tests.length;

    console.log(`\n✅ Testes Passados: ${passed}/${total}`);
    console.log(`❌ Testes Falhados: ${failed}/${total}`);

    if (results.risks.length > 0) {
      console.log(`\n⚠️  RISCOS ENCONTRADOS: ${results.risks.length}`);
      results.risks.forEach((risk, i) => {
        console.log(`   ${i + 1}. ${risk}`);
      });
    } else {
      console.log(`\n✅ NENHUM RISCO ENCONTRADO`);
    }

    results.summary = {
      total_tests: total,
      passed: passed,
      failed: failed,
      risks_found: results.risks.length,
      status: failed === 0 && results.risks.length === 0 ? 'OK' : 'FALHA'
    };

    console.log('\n');
    if (results.summary.status === 'OK') {
      console.log('║                  ✅ SISTEMA VALIDADO COM SUCESSO              ║');
      console.log('║                   PRONTO PARA PRODUÇÃO                        ║');
    } else {
      console.log('║                  ❌ FALHAS DETECTADAS NO SISTEMA              ║');
      console.log('║                   REVISAR ANTES DE PRODUÇÃO                   ║');
    }
    console.log('\n');

    // Salvar resultados
    const fs = await import('fs').then(m => m.promises);
    await fs.writeFile(
      './scripts/production-validation-results.json',
      JSON.stringify(results, null, 2),
      'utf-8'
    );

    console.log('📁 Resultados salvos em: scripts/production-validation-results.json\n');

    process.exit(results.summary.status === 'OK' ? 0 : 1);
  } catch (err) {
    console.error('\n❌ Erro crítico:', err.message);
    process.exit(1);
  }
}

runValidation();
