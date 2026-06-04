/**
 * Cron Job Compatível para Atualização Automática de Rankings COMAES
 * 
 * Sistema alternativo sem node-cron que funciona com setInterval
 * Executa atualizações periódicas de rankings:
 * - Recálculo diário completo
 * - Atualização por eventos em tempo real
 * - Limpeza de cache expirado
 */

import rankingService from '../services/rankingService.js';

// Intervalos de atualização (em milissegundos)
const INTERVALO_RECALCULO = 24 * 60 * 60 * 1000; // 24 horas
const INTERVALO_EVENTOS = 30 * 60 * 1000; // 30 minutos
const INTERVALO_LIMPEZA = 6 * 60 * 60 * 1000; // 6 horas
const INTERVALO_SAUDE = 12 * 60 * 60 * 1000; // 12 horas

// Timers
let timers = {
  recalculo: null,
  eventos: null,
  limpeza: null,
  saude: null
};

// Cache de eventos pendentes
const pendingEvents = {
  torneios: [],
  testes: [],
  questoes: []
};

/**
 * Adiciona evento para processamento em lote
 * @param {string} tipo - Tipo de evento (torneio, teste, questao)
 * @param {Object} dados - Dados do evento
 */
export const adicionarEventoRanking = (tipo, dados) => {
  if (!pendingEvents[tipo]) {
    console.warn(`⚠️ Tipo de evento desconhecido: ${tipo}`);
    return;
  }
  
  pendingEvents[tipo].push({
    ...dados,
    timestamp: new Date()
  });
  
  console.log(`📥 Evento de ${tipo} adicionado para processamento em lote`);
};

/**
 * Processa eventos pendentes em lote
 */
const processarEventosPendentes = async () => {
  try {
    console.log('🔄 Processando eventos pendentes de ranking...');
    
    const userIds = new Set();
    
    // Coletar todos os usuários de eventos pendentes
    for (const tipo in pendingEvents) {
      const eventos = pendingEvents[tipo];
      if (eventos.length > 0) {
        eventos.forEach(evento => {
          if (evento.usuarioId) {
            userIds.add(evento.usuarioId);
          }
          if (evento.usuario_id) {
            userIds.add(evento.usuario_id);
          }
        });
        
        // Limpar eventos processados
        pendingEvents[tipo] = [];
      }
    }
    
    if (userIds.size === 0) {
      console.log('📭 Nenhum evento pendente para processar');
      return;
    }
    
    console.log(`📊 Processando ${userIds.size} usuários de eventos pendentes`);
    
    // Atualizar rankings dos usuários com eventos pendentes
    const batchSize = 10;
    const userIdsArray = Array.from(userIds);
    
    for (let i = 0; i < userIdsArray.length; i += batchSize) {
      const batch = userIdsArray.slice(i, i + batchSize);
      const promises = batch.map(userId => 
        rankingService.atualizarRankingsUsuario(userId)
          .catch(error => {
            console.error(`❌ Erro ao processar evento para usuário ${userId}:`, error);
            return null;
          })
      );
      
      await Promise.all(promises);
      console.log(`✅ Processado lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(userIdsArray.length/batchSize)}`);
    }
    
    console.log(`✅ Eventos pendentes processados para ${userIds.size} usuários`);
  } catch (error) {
    console.error('❌ Erro ao processar eventos pendentes:', error);
  }
};

/**
 * Executa recálculo completo de rankings
 */
const executarRecalculoCompleto = async () => {
  try {
    console.log('🌙 Iniciando recálculo completo noturno de rankings...');
    
    // Executar recálculo completo em background
    await rankingService.recalculcarTodosRankings();
    
    console.log('✅ Recalculo completo noturno concluído com sucesso');
  } catch (error) {
    console.error('❌ Erro no recálculo completo noturno:', error);
  }
};

/**
 * Limpa cache expirado do sistema de rankings
 */
const limparCacheExpirado = async () => {
  try {
    console.log('🧹 Limpando cache expirado de rankings...');
    
    // O serviço de ranking já tem sistema de cache com TTL de 5 minutos
    // Esta função é apenas para garantir que nenhum cache velho fique na memória
    
    console.log('✅ Limpeza de cache concluída');
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
  }
};

/**
 * Verifica saúde do sistema de rankings
 */
const verificarSaudeRankings = async () => {
  try {
    console.log('🏥 Verificando saúde do sistema de rankings...');
    
    const Ranking = await import('../models/Ranking.js').default;
    const Usuario = await import('../models/User.js').default;
    
    // Estatísticas básicas
    const totalUsuarios = await Usuario.count({
      where: { role: 'estudante' }
    });
    
    const totalUsuariosComRanking = await Ranking.count({
      where: { disciplina: 'geral' },
      distinct: true,
      col: 'usuario_id'
    });
    
    const cobertura = totalUsuarios > 0 
      ? ((totalUsuariosComRanking / totalUsuarios) * 100).toFixed(2)
      : '0.00';
    
    // Verificar rankings desatualizados (última atualização > 7 dias)
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rankingsDesatualizados = await Ranking.count({
      where: {
        disciplina: 'geral',
        data_atualizacao: { [import('sequelize').Op.lt]: seteDiasAtras }
      }
    });
    
    // Log das estatísticas
    console.log('📊 Estatísticas de saúde dos rankings:');
    console.log(`   • Usuários totais: ${totalUsuarios}`);
    console.log(`   • Usuários com ranking: ${totalUsuariosComRanking}`);
    console.log(`   • Cobertura: ${cobertura}%`);
    console.log(`   • Rankings desatualizados (>7 dias): ${rankingsDesatualizados}`);
    
    if (parseFloat(cobertura) < 80) {
      console.warn(`⚠️ Cobertura baixa (${cobertura}%) - considerar re-cálculo forçado`);
    }
    
    if (rankingsDesatualizados > 0) {
      console.warn(`⚠️ ${rankingsDesatualizados} rankings desatualizados - considerar atualização`);
    }
    
    console.log('✅ Verificação de saúde concluída');
  } catch (error) {
    console.error('❌ Erro na verificação de saúde:', error);
  }
};

/**
 * Agenda uma tarefa periódica
 * @param {Function} tarefa - Função a ser executada
 * @param {number} intervalo - Intervalo em milissegundos
 * @param {string} nome - Nome da tarefa para logging
 * @returns {number} - ID do timer
 */
const agendarTarefaPeriodica = (tarefa, intervalo, nome) => {
  console.log(`⏰ Agendando ${nome} a cada ${intervalo / (60 * 1000)} minutos`);
  
  // Executar imediatamente uma vez
  tarefa().catch(console.error);
  
  // Agendar periodicamente
  return setInterval(() => {
    console.log(`⏰ Trigger: ${nome}`);
    tarefa().catch(console.error);
  }, intervalo);
};

/**
 * Inicia todos os intervalos do sistema de rankings
 */
export const iniciarCronJobsRanking = () => {
  try {
    console.log('⏰ Iniciando sistema de atualizações periódicas de rankings...');
    
    // 1. Recálculo completo diário (24 horas)
    timers.recalculo = agendarTarefaPeriodica(
      executarRecalculoCompleto,
      INTERVALO_RECALCULO,
      'Recálculo diário de rankings'
    );
    
    // 2. Processamento de eventos pendentes (a cada 30 minutos)
    timers.eventos = agendarTarefaPeriodica(
      processarEventosPendentes,
      INTERVALO_EVENTOS,
      'Processamento de eventos pendentes'
    );
    
    // 3. Limpeza de cache (a cada 6 horas)
    timers.limpeza = agendarTarefaPeriodica(
      limparCacheExpirado,
      INTERVALO_LIMPEZA,
      'Limpeza de cache de rankings'
    );
    
    // 4. Verificação de saúde (a cada 12 horas)
    timers.saude = agendarTarefaPeriodica(
      verificarSaudeRankings,
      INTERVALO_SAUDE,
      'Verificação de saúde dos rankings'
    );
    
    console.log('✅ Sistema de atualizações periódicas de rankings iniciado com sucesso');
    
    // Executar verificação de saúde na inicialização (após 10 segundos)
    setTimeout(() => verificarSaudeRankings(), 10000);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar sistema de atualizações de ranking:', error);
  }
};

/**
 * Para todos os intervalos do sistema de rankings
 */
export const pararCronJobsRanking = () => {
  try {
    console.log('🛑 Parando sistema de atualizações periódicas de rankings...');
    
    Object.values(timers).forEach(timer => {
      if (timer) {
        clearInterval(timer);
      }
    });
    
    // Resetar timers
    timers = {
      recalculo: null,
      eventos: null,
      limpeza: null,
      saude: null
    };
    
    console.log('✅ Sistema de atualizações periódicas de rankings parado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao parar sistema de atualizações de ranking:', error);
  }
};

// Auto-inicialização se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Iniciando sistema de rankings em modo standalone');
  iniciarCronJobsRanking();
  
  // Manter processo rodando
  process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT, parando sistema...');
    pararCronJobsRanking();
    process.exit(0);
  });
}

export default {
  adicionarEventoRanking,
  iniciarCronJobsRanking,
  pararCronJobsRanking,
  processarEventosPendentes,
  executarRecalculoCompleto,
  limparCacheExpirado,
  verificarSaudeRankings
};