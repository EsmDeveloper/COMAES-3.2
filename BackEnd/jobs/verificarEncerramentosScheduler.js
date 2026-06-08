/**
 * 🎯 Scheduler Job: Verificar Encerramentos de Torneios
 * 
 * Executa a cada 1 minuto verificando se torneios atingiram sua data/hora de término
 * Marca participantes como encerrados operacionalmente (para estudantes)
 * Mantém torneio como 'ativo' (admin finaliza depois)
 * 
 * Uso:
 * - Importar e chamar setupEncerramentoScheduler() no servidor principal
 * - Node.js 16+
 */

import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import sequelize from '../config/db.js';

let schedulerRunning = false;
let schedulerInterval = null;

const SCHEDULER_INTERVAL_MS = 60 * 1000; // 1 minuto

/**
 * Verificar torneios que terminaram e marcar participantes como encerrados
 */
const processarEncerramentos = async () => {
  if (schedulerRunning) {
    console.log('⏳ Scheduler já está em execução, pulando esta iteração');
    return;
  }

  schedulerRunning = true;

  try {
    const agora = new Date();
    console.log(`\n⏱️  [${agora.toISOString()}] Verificando encerramentos de torneios...`);

    // Buscar torneios que atingiram a data de término
    const torneiosEncerrados = await Torneio.findAll({
      where: {
        status: 'ativo',
        termina_em: {
          [sequelize.Sequelize.Op.lte]: agora
        }
      }
    });

    if (torneiosEncerrados.length === 0) {
      console.log('✅ Nenhum torneio para encerrar');
      return;
    }

    console.log(`🔍 Encontrados ${torneiosEncerrados.length} torneio(s) com data de término passada`);

    // Processar cada torneio
    for (const torneio of torneiosEncerrados) {
      const transaction = await sequelize.transaction();

      try {
        // Buscar participantes ainda ativos neste torneio
        const participantesAtivos = await ParticipanteTorneio.findAll({
          where: {
            torneio_id: torneio.id,
            status: 'confirmado',
            encerrado_operacionalmente: false,
            posicao_congelada: false
          },
          transaction
        });

        if (participantesAtivos.length === 0) {
          console.log(`ℹ️  Torneio "${torneio.titulo}" já teve todos os participantes encerrados`);
          await transaction.rollback();
          continue;
        }

        // Marcar como encerrado operacionalmente
        const [atualizado] = await ParticipanteTorneio.update(
          {
            encerrado_operacionalmente: true,
            data_encerramento_operacional: agora
          },
          {
            where: {
              torneio_id: torneio.id,
              status: 'confirmado',
              encerrado_operacionalmente: false,
              posicao_congelada: false
            },
            transaction
          }
        );

        await transaction.commit();

        console.log(`✅ Torneio "${torneio.titulo}" encerrado para ${atualizado} participante(s)`);
        console.log(`   - Data de término: ${torneio.termina_em}`);
        console.log(`   - Participants marcados como encerrados: ${atualizado}`);
        console.log(`   - Status do torneio mantido como: ativo (aguardando finalização por admin)`);
      } catch (error) {
        await transaction.rollback();
        console.error(`❌ Erro ao processar torneio ${torneio.id}:`, error.message);
      }
    }

    console.log(`✅ Ciclo de verificação de encerramentos concluído`);
  } catch (error) {
    console.error('❌ Erro no scheduler de encerramentos:', error);
  } finally {
    schedulerRunning = false;
  }
};

/**
 * Setup do scheduler
 * Chamado uma única vez no servidor principal
 */
export const setupEncerramentoScheduler = () => {
  if (schedulerInterval) {
    console.log('⚠️  Scheduler de encerramentos já está em execução');
    return;
  }

  console.log('🚀 Iniciando scheduler de encerramentos de torneios');
  console.log(`⏱️  Intervalo: ${SCHEDULER_INTERVAL_MS / 1000} segundo(s)`);

  // Executar uma vez imediatamente
  processarEncerramentos().catch(console.error);

  // Configurar execução periódica
  schedulerInterval = setInterval(() => {
    processarEncerramentos().catch(console.error);
  }, SCHEDULER_INTERVAL_MS);

  // Permitir que Node.js saia mesmo com o scheduler rodando
  if (schedulerInterval.unref) {
    schedulerInterval.unref();
  }
};

/**
 * Parar o scheduler (para testes ou shutdown)
 */
export const stopEncerramentoScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⛔ Scheduler de encerramentos parado');
  }
};

/**
 * Executar verificação manual (útil para testes)
 */
export const verificarManualmente = async () => {
  console.log('🔄 Executando verificação manual de encerramentos...');
  await processarEncerramentos();
};

export default {
  setupEncerramentoScheduler,
  stopEncerramentoScheduler,
  verificarManualmente,
  processarEncerramentos
};
