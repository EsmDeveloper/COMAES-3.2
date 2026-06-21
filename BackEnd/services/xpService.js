/**
 * xpService.js — Serviço centralizado de XP e Níveis COMAES
 *
 * Regras de negócio:
 * - XP apenas por desempenho académico real (sem recompensas por tempo de sessão ou login).
 * - Fontes de XP:
 *     1. Resposta correta em torneio            → base = pontos_obtidos da questão
 *        + bónus de acerto consecutivo          → +2 XP por streak (max streak = 10 = +20 XP)
 *     2. Conclusão de teste de conhecimento     → base = pontos * percentual_acertos / 100
 *        + bónus por desempenho ≥ 80%           → +15 XP extra
 *     3. Participação finalizada em torneio     → com base na posição final
 *        1º lugar → +100 XP | 2º → +60 XP | 3º → +30 XP | top 10 → +10 XP | participação → +5 XP
 *
 * Escala progressiva de XP por nível:
 *   1 = 0 | 2 = 200 | 3 = 500 | 4 = 1000 | 5 = 2000
 *   6 = 3500 | 7 = 5500 | 8 = 8000 | 9 = 12000 | 10 = 18000
 */

import Usuario from '../models/User.js';

// ── Tabela de limiares de XP (sincronizada com a tabela niveis no BD) 
export const NIVEIS = [
  { numero: 1, xp_minimo: 0     },
  { numero: 2, xp_minimo: 200   },
  { numero: 3, xp_minimo: 500   },
  { numero: 4, xp_minimo: 1000  },
  { numero: 5, xp_minimo: 2000  },
  { numero: 6, xp_minimo: 3500  },
  { numero: 7, xp_minimo: 5500  },
  { numero: 8, xp_minimo: 8000  },
  { numero: 9, xp_minimo: 12000 },
  { numero: 10, xp_minimo: 18000 },
];

// ── Calcular nível a partir do XP total 
export function calcularNivel(xpTotal) {
  let nivel = 1;
  for (const n of NIVEIS) {
    if (xpTotal >= n.xp_minimo) nivel = n.numero;
    else break;
  }
  return nivel;
}

// ── Calcular XP para próximo nível 
export function calcularProgressoParaProximoNivel(xpTotal) {
  const nivelAtual = calcularNivel(xpTotal);
  const nivelInfo = NIVEIS.find(n => n.numero === nivelAtual);
  const proximoNivel = NIVEIS.find(n => n.numero === nivelAtual + 1);

  if (!proximoNivel) {
    // Nível máximo atingido
    return { xpAtual: xpTotal, xpMinNivel: nivelInfo.xp_minimo, xpProximo: null, percentual: 100 };
  }

  const xpNoNivel = xpTotal - nivelInfo.xp_minimo;
  const xpParaProximo = proximoNivel.xp_minimo - nivelInfo.xp_minimo;
  const percentual = Math.min(100, Math.round((xpNoNivel / xpParaProximo) * 100));

  return {
    xpAtual: xpTotal,
    xpMinNivel: nivelInfo.xp_minimo,
    xpProximo: proximoNivel.xp_minimo,
    xpNoNivel,
    xpParaProximo,
    percentual,
    nivelAtual,
    proximoNumero: proximoNivel.numero,
  };
}

// ── Incrementar XP de um utilizador e promover nível se necessário 
/**
 * @param {number} usuarioId — ID do utilizador
 * @param {number} xpGanho   — Quantidade de XP a adicionar (inteiro positivo)
 * @param {string} motivo    — Descrição (para logs)
 * @returns {{ xpAnterior, xpNovo, nivelAnterior, nivelNovo, subiu }}
 */
export async function incrementarXP(usuarioId, xpGanho, motivo = '') {
  if (!usuarioId || xpGanho <= 0) return null;

  try {
    // Usar escopo sem exclusão de password para aceder a xp_total e nivel_atual
    const usuario = await Usuario.unscoped().findByPk(usuarioId, {
      attributes: ['id', 'xp_total', 'nivel_atual'],
    });

    if (!usuario) {
      console.warn(`[XP] Utilizador ${usuarioId} não encontrado`);
      return null;
    }

    const xpAnterior = usuario.xp_total || 0;
    const nivelAnterior = usuario.nivel_atual || 1;
    const xpNovo = xpAnterior + Math.round(xpGanho);
    const nivelNovo = calcularNivel(xpNovo);

    await usuario.update({ xp_total: xpNovo, nivel_atual: nivelNovo });

    const subiu = nivelNovo > nivelAnterior;

    console.log(
      `[XP] +${Math.round(xpGanho)} XP → utilizador #${usuarioId}` +
      ` (${xpAnterior} → ${xpNovo}) | nível ${nivelAnterior}→${nivelNovo}` +
      (motivo ? ` | ${motivo}` : '') +
      (subiu ? ' 🎉 SUBIU DE NÍVEL!' : '')
    );

    return { xpAnterior, xpNovo, nivelAnterior, nivelNovo, subiu };
  } catch (error) {
    // XP é não-crítico — nunca deve bloquear a resposta principal
    console.error(`[XP] Erro ao incrementar XP do utilizador ${usuarioId}:`, error.message);
    return null;
  }
}

// ── XP por resposta correta em torneio 
/**
 * @param {number}  pontosQuestao  — Pontos da questão (5, 10 ou 20 conforme dificuldade)
 * @param {boolean} correta        — Se a resposta foi correta
 * @param {number}  streak         — Número de acertos consecutivos (0 = sem streak)
 * @returns {number} XP a atribuir
 */
export function calcularXPResposta(pontosQuestao, correta, streak = 0) {
  if (!correta) return 0;
  // XP base = pontos da questão (proporcional à dificuldade)
  const xpBase = pontosQuestao;
  // Bónus de streak: +2 XP por cada acerto consecutivo (máx. 10 acertos = +20 XP)
  const xpStreak = Math.min(streak, 10) * 2;
  return xpBase + xpStreak;
}

// ── XP por conclusão de teste de conhecimento 
/**
 * @param {number} pontos              — Pontos obtidos no teste
 * @param {number} percentualAcertos   — % de acertos (0–100)
 * @returns {number} XP a atribuir
 */
export function calcularXPTeste(pontos, percentualAcertos) {
  if (pontos <= 0) return 0;
  const xpBase = Math.round(pontos * (percentualAcertos / 100));
  const bonusExcelencia = percentualAcertos >= 80 ? 15 : 0;
  return xpBase + bonusExcelencia;
}

// ── XP por posição final em torneio 
/**
 * @param {number|null} posicao — Posição final (1 = melhor; null = não calculada)
 * @returns {number} XP a atribuir
 */
export function calcularXPTorneioFinalizado(posicao) {
  if (!posicao || posicao <= 0) return 5; // Apenas participação
  if (posicao === 1) return 100;
  if (posicao === 2) return 60;
  if (posicao === 3) return 30;
  if (posicao <= 10) return 10;
  return 5; // Participação normal
}

export default {
  calcularNivel,
  calcularProgressoParaProximoNivel,
  incrementarXP,
  calcularXPResposta,
  calcularXPTeste,
  calcularXPTorneioFinalizado,
  NIVEIS,
};
