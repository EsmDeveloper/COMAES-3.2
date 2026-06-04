/**
 * rankingEvents.js — Hooks de integração de eventos com rankings COMAES
 *
 * Quando eventos relevantes ocorrem (torneio finalizado, etc.), invalida o cache
 * para que o próximo request recalcule os rankings diretamente da base de dados.
 */

import { invalidarCacheRankings } from '../services/rankingService.js';

const invalidarAsync = () => {
  setImmediate(async () => {
    try {
      await invalidarCacheRankings();
      console.log('✅ Cache de rankings invalidado após evento');
    } catch (e) {
      console.error('❌ Erro ao invalidar cache de rankings:', e);
    }
  });
};

export const torneioFinalizadoHook = async (req, res, next) => {
  invalidarAsync();
  next();
};

export const testeSubmetidoHook = async (req, res, next) => {
  invalidarAsync();
  next();
};

export const questaoRespondidaHook = async (req, res, next) => {
  next(); // Questões individuais não impactam ranking global imediatamente
};

export const atualizarRankingsBatch = async (userIds) => {
  // Apenas invalida o cache; o recálculo é feito na próxima consulta
  await invalidarCacheRankings();
  return { total: userIds?.length || 0, success: userIds?.length || 0 };
};

export const setupRankingHooks = (app) => {
  console.log('🔧 Configurando hooks automáticos de ranking');

  app.use('/api/tournaments/finalizar', torneioFinalizadoHook);
  app.use('/api/torneios/:id/finalizar', torneioFinalizadoHook);
  app.use('/api/teste-conhecimento/submit', testeSubmetidoHook);
  app.use('/api/resultados', testeSubmetidoHook);

  console.log('✅ Hooks de ranking configurados com sucesso');
};

export default { torneioFinalizadoHook, testeSubmetidoHook, questaoRespondidaHook, atualizarRankingsBatch, setupRankingHooks };
