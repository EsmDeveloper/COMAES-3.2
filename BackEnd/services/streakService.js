/**
 * streakService.js — Serviço de Sequências de Aprendizagem (Streak) COMAES
 *
 * Regras de negócio:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Uma atividade válida num dia incrementa o streak em 1.
 * 2. Múltiplas atividades no mesmo dia NÃO incrementam mais de uma vez (idempotente).
 * 3. Se a última atividade foi ONTEM → continua a sequência (+1).
 * 4. Se a última atividade foi HOJE → já contado, não faz nada.
 * 5. Se a última atividade foi há 2+ dias (lacuna) → reset para 1.
 *    A reinicialização é amigável: a nova sequência começa hoje.
 * 6. streak_maximo é atualizado sempre que streak_atual supera o histórico.
 * 7. Nunca há penalização de XP ou pontos no reset.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import SequenciaAprendizagem from '../models/SequenciaAprendizagem.js';

/**
 * Retorna a data de hoje no formato YYYY-MM-DD (timezone do servidor).
 * Para consistência, usa UTC.
 */
function hojeISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Diferença em dias entre duas strings YYYY-MM-DD.
 * Resultado positivo = data2 é mais recente.
 */
function difDias(data1, data2) {
  const d1 = new Date(data1 + 'T00:00:00Z');
  const d2 = new Date(data2 + 'T00:00:00Z');
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Regista uma atividade educativa para o utilizador e atualiza o streak.
 *
 * @param {number} usuarioId
 * @returns {{ streak_atual, streak_maximo, ultima_data_atividade, reiniciou, jaContado }}
 */
export async function registarAtividade(usuarioId) {
  if (!usuarioId) return null;

  const hoje = hojeISO();

  try {
    // Buscar ou criar registo para o utilizador
    let [seq, criado] = await SequenciaAprendizagem.findOrCreate({
      where: { usuario_id: usuarioId },
      defaults: {
        streak_atual: 1,
        streak_maximo: 1,
        ultima_data_atividade: hoje,
      },
    });

    // Acabou de ser criado — primeiro registo do utilizador
    if (criado) {
      console.log(`[Streak] Utilizador #${usuarioId} — 🔥 Streak iniciada: 1 dia`);
      return {
        streak_atual: seq.streak_atual,
        streak_maximo: seq.streak_maximo,
        ultima_data_atividade: seq.ultima_data_atividade,
        reiniciou: false,
        jaContado: false,
        primeiro: true,
      };
    }

    const ultimaData = seq.ultima_data_atividade;

    // ── Caso 1: já houve atividade hoje — idempotente ──────────────────
    if (ultimaData === hoje) {
      return {
        streak_atual: seq.streak_atual,
        streak_maximo: seq.streak_maximo,
        ultima_data_atividade: seq.ultima_data_atividade,
        reiniciou: false,
        jaContado: true,
      };
    }

    const diff = ultimaData ? difDias(ultimaData, hoje) : 999;
    let novoStreak;
    let reiniciou = false;

    if (diff === 1) {
      // ── Caso 2: atividade ontem → continua a sequência ──────────────
      novoStreak = seq.streak_atual + 1;
    } else {
      // ── Caso 3: lacuna de 2+ dias → reset amigável para 1 ───────────
      novoStreak = 1;
      reiniciou = seq.streak_atual > 1; // só "reiniciou" se havia sequência real
    }

    const novoMaximo = Math.max(seq.streak_maximo, novoStreak);

    await seq.update({
      streak_atual: novoStreak,
      streak_maximo: novoMaximo,
      ultima_data_atividade: hoje,
    });

    if (reiniciou) {
      console.log(
        `[Streak] Utilizador #${usuarioId} — 😕 Sequência quebrada após ${seq.streak_atual} dias. ` +
        `Nova sequência: 1 dia`
      );
    } else {
      console.log(
        `[Streak] Utilizador #${usuarioId} — 🔥 Sequência: ${novoStreak} dias` +
        (novoStreak === novoMaximo && novoStreak > 1 ? ' (novo máximo!)' : '')
      );
    }

    return {
      streak_atual: novoStreak,
      streak_maximo: novoMaximo,
      ultima_data_atividade: hoje,
      reiniciou,
      jaContado: false,
    };
  } catch (error) {
    // Streak é não-crítico — nunca bloqueia a resposta principal
    console.error(`[Streak] Erro ao registar atividade para utilizador #${usuarioId}:`, error.message);
    return null;
  }
}

/**
 * Obtém o streak actual de um utilizador.
 * Verifica automaticamente se a sequência foi quebrada (sem atividade ontem ou hoje).
 *
 * @param {number} usuarioId
 * @returns {{ streak_atual, streak_maximo, ultima_data_atividade, ativa }}
 */
export async function obterStreak(usuarioId) {
  if (!usuarioId) return null;

  try {
    const seq = await SequenciaAprendizagem.findOne({
      where: { usuario_id: usuarioId },
    });

    if (!seq) {
      return { streak_atual: 0, streak_maximo: 0, ultima_data_atividade: null, ativa: false };
    }

    const hoje = hojeISO();
    const ultimaData = seq.ultima_data_atividade;

    // Streak "ativa" = houve atividade hoje OU ontem (utilizador ainda pode agir hoje)
    const diff = ultimaData ? difDias(ultimaData, hoje) : 999;
    const ativa = diff <= 1;

    return {
      streak_atual: seq.streak_atual,
      streak_maximo: seq.streak_maximo,
      ultima_data_atividade: seq.ultima_data_atividade,
      ativa,
      // Mensagem amigável para o frontend
      mensagem: ativa
        ? seq.streak_atual === 1
          ? 'Sequência iniciada! Continue amanhã para aumentar.'
          : `${seq.streak_atual} dias seguidos! Mantém o ritmo!`
        : seq.streak_atual > 0
          ? 'Que pena! Vamos recomeçar? A tua nova sequência começa hoje.'
          : 'Realiza uma atividade hoje para iniciar a tua sequência!',
    };
  } catch (error) {
    console.error(`[Streak] Erro ao obter streak do utilizador #${usuarioId}:`, error.message);
    return null;
  }
}

export default { registarAtividade, obterStreak };
