/**
 * rankingCron.js — Cron jobs de ranking COMAES
 *
 * O novo sistema usa cache invalidation: não há necessidade de recalcular proativamente.
 * Apenas invalida o cache periodicamente para garantir dados frescos.
 */

import { invalidarCacheRankings } from '../services/rankingService.js';

export function iniciarCronJobsRanking() {
  console.log('⏰ Cron jobs de ranking iniciados (invalidação de cache a cada 10 min)');

  // Invalidar cache a cada 10 minutos
  setInterval(async () => {
    try {
      await invalidarCacheRankings();
      console.log('🔄 Cache de rankings invalidado pelo cron job');
    } catch (e) {
      console.error('❌ Erro no cron de ranking:', e);
    }
  }, 10 * 60 * 1000); // 10 minutos
}

export default { iniciarCronJobsRanking };
