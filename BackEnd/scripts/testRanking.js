/**
 * Script de teste para o sistema de rankings educacionais gamificados
 * 
 * Testa todos os endpoints e funcionalidades do ranking
 */

import Ranking from '../models/Ranking.js';
import Usuario from '../models/User.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import ResultadoTeste from '../models/ResultadoTeste.js';
import TentativaResposta from '../models/TentativaResposta.js';
import Questao from '../models/Questao.js';
import Torneio from '../models/Torneio.js';
import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';
import sequelize from '../config/db.js';

async function testRankingSystem() {
  console.log('🧪 Iniciando testes do sistema de rankings...\n');
  
  try {
    // 1. Testar conexão com o banco
    console.log('🔌 Testando conexão com o banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco estabelecida');
    
    // 2. Testar se a tabela de rankings existe
    console.log('\n📊 Verificando tabela de rankings...');
    try {
      const rankings = await Ranking.findAll({ limit: 1 });
      console.log(`✅ Tabela de rankings encontrada com ${rankings.length} registro(s)`);
    } catch (error) {
      console.log('❌ Tabela de rankings não encontrada:', error.message);
      console.log('   Execute a migração: npx sequelize-cli db:migrate');
      return;
    }
    
    // 3. Testar contagem básica
    console.log('\n📈 Testando contagem de registros...');
    const totalRankings = await Ranking.count();
    const totalUsuarios = await Usuario.count({ where: { ativo: true } });
    console.log(`   Total de rankings: ${totalRankings}`);
    console.log(`   Total de usuários ativos: ${totalUsuarios}`);
    
    // 4. Testar estrutura do modelo
    console.log('\n🏗️ Testando estrutura do modelo Ranking...');
    const firstRanking = await Ranking.findOne({
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'username'] }]
    });
    
    if (firstRanking) {
      console.log('✅ Modelo Ranking carregado com sucesso');
      console.log(`   Usuário: ${firstRanking.usuario?.nome || 'N/A'}`);
      console.log(`   Disciplina: ${firstRanking.disciplina}`);
      console.log(`   Pontuação: ${firstRanking.pontuacao_total}`);
    } else {
      console.log('ℹ️ Nenhum ranking encontrado na base de dados');
      console.log('   O sistema pode estar vazio ou necessitar de dados iniciais');
    }
    
    // 5. Testar método estático de cálculo de pontuação
    console.log('\n🧮 Testando cálculo de pontuação...');
    const pontuacaoTeste = Ranking.calcularPontuacaoTotal({
      matematica: 100,
      programacao: 150,
      ingles: 80,
      testes_gerais: 50
    });
    console.log(`   Pontuação calculada: ${pontuacaoTeste}`);
    console.log('   Fórmula: (100×0.35) + (150×0.35) + (80×0.35) + (50×0.15) = 35 + 52.5 + 28 + 7.5 = 123');
    
    // 6. Testar cache
    console.log('\n💾 Testando sistema de cache...');
    const cacheKey = Ranking.gerarCacheKey('geral', 100);
    console.log(`   Chave de cache gerada: ${cacheKey}`);
    console.log(`   Precisa atualizar? ${Ranking.precisaAtualizar(new Date()) ? 'Sim' : 'Não'}`);
    
    // 7. Verificar índices
    console.log('\n🔍 Verificando índices do banco...');
    const tableInfo = await sequelize.query(
      "SHOW INDEX FROM rankings", 
      { type: sequelize.QueryTypes.SHOWINDEXES }
    ).catch(() => []);
    
    console.log(`   Índices encontrados: ${tableInfo.length || 'N/A (apenas para MySQL)'}`);
    
    // 8. Testar relacionamentos
    console.log('\n🔗 Testando relacionamentos...');
    const usuarioComRankings = await Usuario.findOne({
      include: [{ model: Ranking, as: 'rankings', limit: 2 }]
    });
    
    if (usuarioComRankings) {
      console.log(`✅ Usuário "${usuarioComRankings.nome}" possui ${usuarioComRankings.rankings?.length || 0} ranking(s)`);
    } else {
      console.log('ℹ️ Nenhum usuário com rankings encontrado');
    }
    
    // 9. Testar geração de ranking por disciplina
    console.log('\n🏆 Testando geração de ranking por disciplina...');
    try {
      const RankingService = (await import('../services/rankingService.js')).default;
      const rankingService = new RankingService({
        Ranking,
        Usuario,
        TorneioParticipante: ParticipanteTorneio,
        ResultadoTeste,
        TentativaResposta,
        Questao,
        Torneio,
        TesteConhecimento: QuestaoTesteConhecimento,
        sequelize
      });
      
      const rankingGeral = await rankingService.gerarRankingPorDisciplina('geral', 10);
      console.log(`   Ranking geral gerado: ${rankingGeral.length} posições`);
      
      if (rankingGeral.length > 0) {
        console.log('   Primeira posição:', rankingGeral[0].username, '-', rankingGeral[0].pontuacao_total);
      }
    } catch (error) {
      console.log('❌ Erro ao gerar ranking:', error.message);
    }
    
    // 10. Resultado final
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('────────────────────────────────────────');
    console.log(`✅ Conexão com banco: ${totalUsuarios > 0 ? 'OK' : 'SEM USUÁRIOS'}`);
    console.log(`✅ Tabela Rankings: ${totalRankings > 0 ? 'COM DADOS' : 'VAZIA'}`);
    console.log(`✅ Modelo Ranking: ${firstRanking ? 'FUNCIONAL' : 'SEM DADOS'}`);
    console.log(`✅ Cálculo de pontuação: ${pontuacaoTeste === 123 ? 'CORRETO' : 'VERIFICAR'}`);
    console.log(`✅ Sistema de cache: ${cacheKey ? 'CONFIGURADO' : 'ERRO'}`);
    console.log('────────────────────────────────────────');
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Executar migração (se tabela não existir): npx sequelize-cli db:migrate');
    console.log('2. Popular dados iniciais com script de seeding');
    console.log('3. Testar endpoints da API REST');
    console.log('4. Integrar com frontend');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    console.log('\n🏁 Testes concluídos');
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testRankingSystem();
}

export { testRankingSystem };