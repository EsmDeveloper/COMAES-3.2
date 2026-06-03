/**
 * Serviço de Finalização Automática de Torneios
 * 
 * Verifica periodicamente os torneios que atingiram 24h após o término
 * e os marca automaticamente como finalizados, congelando os rankings.
 */

import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import { incrementarXP, calcularXPTorneioFinalizado } from '../services/xpService.js';
import cron from 'node-cron';

const FINALIZATION_DELAY_MS = 24 * 60 * 60 * 1000; // 24 horas
const CHECK_INTERVAL = '*/5 * * * *'; // A cada 5 minutos

class TournamentFinalizerService {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
  }

  /**
   * Inicia o serviço de finalização automática
   */
  start() {
    if (this.isRunning) {
      console.warn('⚠️ TournamentFinalizerService já está em execução');
      return;
    }

    console.log('🚀 Iniciando TournamentFinalizerService...');
    
    // Executar verificação imediatamente ao iniciar
    this.checkAndFinalizeTournaments();
    
    // Agendar verificações periódicas
    this.cronJob = cron.schedule(CHECK_INTERVAL, () => {
      this.checkAndFinalizeTournaments();
    });

    this.isRunning = true;
    console.log(`✅ TournamentFinalizerService iniciado (verifica a cada 5 minutos)`);
  }

  /**
   * Para o serviço
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('⛔ TournamentFinalizerService parado');
    }
  }

  /**
   * Verifica e finaliza torneios que ultrapassaram 24h
   */
  async checkAndFinalizeTournaments() {
    try {
      const agora = new Date();
      
      // Buscar torneios em estado "encerrando" que já ultrapassaram 24h
      const torneos = await Torneio.findAll({
        where: { status: 'encerrando' },
        attributes: ['id', 'titulo', 'termina_em', 'status']
      });

      if (torneos.length === 0) {
        // Silencioso - sem logs quando não há nada a fazer
        return;
      }

      console.log(`🔍 Verificando ${torneos.length} torneios para possível finalização...`);

      for (const torneio of torneos) {
        const tempoTermino = new Date(torneio.termina_em);
        const tempoDecorrido = agora - tempoTermino;

        // Se passou 24h, finalizar
        if (tempoDecorrido >= FINALIZATION_DELAY_MS) {
          await this.finalizeTournament(torneio.id, torneio.titulo);
        }
      }
    } catch (erro) {
      console.error('❌ Erro ao verificar torneios:', erro);
    }
  }

  /**
   * Finaliza um torneio específico
   */
  async finalizeTournament(torneoId, titulo) {
    const transaction = await sequelize.transaction();
    
    try {
      console.log(`📋 Finalizando torneio: ${titulo} (ID: ${torneoId})`);

      // 1. Atualizar status do torneio para "finalizado"
      await Torneio.update(
        { status: 'finalizado' },
        { where: { id: torneoId }, transaction }
      );
      console.log(`✅ Status do torneio atualizado para: finalizado`);

      // 2. Congelar rankings de todas as disciplinas
      const disciplinas = ['Matemática', 'Inglês', 'Programação'];
      
      for (const disciplina of disciplinas) {
        const resultado = await ParticipanteTorneio.congelarRanking(
          torneoId,
          disciplina
        );
        
        if (resultado.sucesso) {
          console.log(`❄️ ${disciplina}: ${resultado.totalCongelados} posições congeladas`);
        }
      }

      // 3. Atribuir XP a todos os participantes confirmados com base na posição final
      try {
        const participantes = await ParticipanteTorneio.findAll({
          where: { torneio_id: torneoId, status: 'confirmado' },
          attributes: ['usuario_id', 'posicao', 'disciplina_competida'],
        });

        await Promise.all(participantes.map(p => {
          const xp = calcularXPTorneioFinalizado(p.posicao);
          return incrementarXP(
            p.usuario_id,
            xp,
            `torneio-finalizado|torneio#${torneoId}|${p.disciplina_competida}|pos=${p.posicao || '?'}`
          );
        }));

        console.log(`✅ XP atribuído a ${participantes.length} participantes do torneio ${torneoId}`);
      } catch (xpErr) {
        // XP é não-crítico — nunca deve reverter a transação principal
        console.warn(`⚠️ Erro ao atribuir XP de finalização do torneio ${torneoId}:`, xpErr.message);
      }

      // 4. Confirmar transação
      await transaction.commit();
      console.log(`🏁 Torneio ${titulo} finalizado com sucesso!`);

    } catch (erro) {
      await transaction.rollback();
      console.error(`❌ Erro ao finalizar torneio ${torneoId}:`, erro);
    }
  }

  /**
   * Retorna status do serviço
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: CHECK_INTERVAL,
      finalizationDelay: `${FINALIZATION_DELAY_MS / 1000 / 60 / 60} horas`
    };
  }
}

// Criar instância singleton
const touramentFinalizerService = new TournamentFinalizerService();

export default touramentFinalizerService;
