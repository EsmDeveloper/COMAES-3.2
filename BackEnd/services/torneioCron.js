/**
 * torneioCron.js
 * Alteração 4: cron que move torneios para 'encerrando' quando termina_em passa,
 * e para 'finalizado' após 24h no estado 'encerrando'.
 *
 * Uso: import { startTorneioCron } from './services/torneioCron.js';
 *      startTorneioCron(io);   // chamar após o servidor iniciar
 */

import { Op } from 'sequelize';
import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import { incrementarXP, calcularXPTorneioFinalizado } from '../services/xpService.js';

const FINALIZATION_DELAY_MS = 24 * 60 * 60 * 1000; // 24 horas
const INTERVAL_MS           = 5 * 60 * 1000;        // verificar a cada 5 min (reduzido de 15)

export function startTorneioCron(io = null) {
  const run = async () => {
    try {
      const now    = new Date();
      const cutoff = new Date(now.getTime() - FINALIZATION_DELAY_MS);

      // 1. Torneios 'ativo' cujo termina_em já passou → 'encerrando'
      const toClose = await Torneio.findAll({
        where: { status: 'ativo', termina_em: { [Op.lt]: now } }
      });
      for (const t of toClose) {
        await t.update({ status: 'encerrando' });
        console.log(`[cron] Torneio ${t.id} "${t.titulo}" → encerrando (processando resultados)`);
        if (io) io.emit('tournament_finished', { id: t.id, status: 'encerrando' });
      }

      // 2. Torneios 'encerrando' há mais de 24h → 'finalizado'
      const toFinalize = await Torneio.findAll({
        where: { status: 'encerrando', termina_em: { [Op.lt]: cutoff } }
      });
      for (const t of toFinalize) {
        await t.update({ status: 'finalizado' });
        console.log(`[cron] Torneio ${t.id} "${t.titulo}" → finalizado (24h concluídas)`);
        if (io) io.emit('tournament_finished', { id: t.id, status: 'finalizado' });

        // Atribuir XP a todos os participantes confirmados (não-crítico)
        try {
          const participantes = await ParticipanteTorneio.findAll({
            where: { torneio_id: t.id, status: 'confirmado' },
            attributes: ['usuario_id', 'posicao', 'disciplina_competida'],
          });
          await Promise.all(participantes.map(p => {
            const xp = calcularXPTorneioFinalizado(p.posicao);
            return incrementarXP(
              p.usuario_id, xp,
              `cron-torneio-finalizado|torneio#${t.id}|${p.disciplina_competida}|pos=${p.posicao || '?'}`
            );
          }));
          console.log(`[cron] XP atribuído a ${participantes.length} participantes do torneio ${t.id}`);
        } catch (xpErr) {
          console.warn(`[cron] Erro ao atribuir XP do torneio ${t.id}:`, xpErr?.message);
        }
      }
    } catch (err) {
      console.warn('[cron] Erro ao processar status de torneios:', err?.message || err);
    }
  };

  // Executar imediatamente ao iniciar e depois a cada INTERVAL_MS
  run();
  return setInterval(run, INTERVAL_MS);
}
