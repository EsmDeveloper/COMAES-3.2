/**
 * missoesService.js — Lógica centralizada do Sistema de Missões COMAES
 *
 * Ciclos:
 *   daily  → ciclo_inicio = data UTC de hoje (YYYY-MM-DD)
 *   weekly → ciclo_inicio = segunda-feira UTC da semana corrente
 *
 * Anti-farm: cada acção contribui no máximo CONTRIBUICAO_MAX_DIA vezes por dia.
 * Tipos suportados:
 *   questoes_corretas   — X respostas corretas no Teste de Conhecimento
 *   acerto_percentual   — atingir X% num teste completo
 *   questoes_dificeis   — X respostas corretas em questões de dificuldade "dificil"
 *   testes_completos    — X testes finalizados
 *   streak_dias         — streak_atual >= X
 *   acertos_seguidos    — X acertos consecutivos numa sessão
 */

import { Op } from 'sequelize';
import Missao from '../models/Missao.js';
import MissaoUsuario from '../models/MissaoUsuario.js';
import { incrementarXP } from './xpService.js';

// ── Constantes de controlo de farm 
// Máximo de contribuições por tipo de evento por dia (por utilizador)
const LIMITE_DIARIO = {
  questoes_corretas:  20,  // máx. 20 questões certas contam por dia
  questoes_dificeis:  10,  // máx. 10 difíceis por dia
  testes_completos:   5,   // máx. 5 testes por dia
  acertos_seguidos:   1,   // sequência registada 1× por sessão
  acerto_percentual:  3,   // max 3 testes com bom % por dia
};

// ── Utilitários de datas UTC 
export function hojeUTC() {
  return new Date().toISOString().split('T')[0];
}

export function segundaFeirasUTC() {
  const hoje = new Date();
  const dow = hoje.getUTCDay(); // 0=Dom, 1=Seg...
  const diff = dow === 0 ? -6 : 1 - dow;
  const seg = new Date(hoje);
  seg.setUTCDate(hoje.getUTCDate() + diff);
  return seg.toISOString().split('T')[0];
}

function cicloInicio(ciclo) {
  return ciclo === 'weekly' ? segundaFeirasUTC() : hojeUTC();
}

// ── Garantir que o progresso do ciclo existe (upsert) 
async function garantirProgresso(usuarioId, missao) {
  const inicio = cicloInicio(missao.ciclo);
  const [mu] = await MissaoUsuario.findOrCreate({
    where: { usuario_id: usuarioId, missao_id: missao.id, ciclo_inicio: inicio },
    defaults: { progresso_atual: 0, concluida: false },
  });
  return mu;
}

// ── Verificar limite anti-farm num dia 
async function contribuicoesHoje(usuarioId, tipoObjetivo) {
  const limite = LIMITE_DIARIO[tipoObjetivo];
  if (!limite) return 0;

  const hoje = hojeUTC();
  // Conta o progresso total acumulado nas missões deste tipo hoje
  const rows = await MissaoUsuario.findAll({
    where: {
      usuario_id: usuarioId,
      ciclo_inicio: { [Op.lte]: hoje },
      updatedAt: { [Op.gte]: hoje + 'T00:00:00.000Z' },
    },
    include: [{ model: Missao, as: 'missao', where: { tipo_objetivo: tipoObjetivo }, attributes: [] }],
    attributes: [[MissaoUsuario.sequelize.fn('SUM', MissaoUsuario.sequelize.col('progresso_atual')), 'total']],
    raw: true,
  });

  return parseInt(rows[0]?.total || 0);
}

// ── Obter missões ativas do ciclo para um utilizador 
export async function getMissoesAtivas(usuarioId) {
  const hoje = hojeUTC();
  const semana = segundaFeirasUTC();

  const missoes = await Missao.findAll({ where: { ativo: true }, order: [['ciclo', 'ASC'], ['recompensa_xp', 'ASC']] });

  const resultado = await Promise.all(missoes.map(async (m) => {
    const inicio = cicloInicio(m.ciclo);
    const mu = await MissaoUsuario.findOne({
      where: { usuario_id: usuarioId, missao_id: m.id, ciclo_inicio: inicio },
    });

    return {
      id: m.id,
      nome: m.nome,
      descricao: m.descricao,
      ciclo: m.ciclo,
      tipo_objetivo: m.tipo_objetivo,
      objetivo_valor: m.objetivo_valor,
      disciplina: m.disciplina,
      dificuldade: m.dificuldade,
      recompensa_xp: m.recompensa_xp,
      icone: m.icone,
      progresso_atual: mu?.progresso_atual ?? 0,
      concluida: mu?.concluida ?? false,
      concluida_em: mu?.concluida_em ?? null,
      ciclo_inicio: inicio,
      percentual: Math.min(100, Math.round(((mu?.progresso_atual ?? 0) / m.objetivo_valor) * 100)),
    };
  }));

  return resultado;
}

// ── Incrementar progresso de missões por evento 
/**
 * @param {number} usuarioId
 * @param {object} evento
 *   tipo: 'questao_correta' | 'teste_completo' | 'acerto_percentual' | 'acerto_seguido'
 *   disciplina?: string
 *   dificuldade?: string
 *   percentual?: number     (para acerto_percentual)
 *   acertos_seguidos?: number (para acerto_seguido)
 *   streak_atual?: number   (para streak_dias)
 */
export async function processarEvento(usuarioId, evento) {
  if (!usuarioId || !evento?.tipo) return [];

  const hoje = hojeUTC();
  const missoes = await Missao.findAll({ where: { ativo: true } });
  const concluidas = [];

  for (const m of missoes) {
    // Verificar se a missão é relevante para este evento
    if (!eventoAfetaMissao(evento, m)) continue;

    // Verificar filtro de disciplina
    if (m.disciplina && evento.disciplina !== m.disciplina) continue;

    // Verificar filtro de dificuldade
    if (m.dificuldade && evento.dificuldade !== m.dificuldade) continue;

    const mu = await garantirProgresso(usuarioId, m);

    // Já concluída neste ciclo — não incrementar mais
    if (mu.concluida) continue;

    // Calcular incremento com limite anti-farm
    let incremento = calcularIncremento(evento, m);
    if (incremento <= 0) continue;

    // Aplicar limite diário anti-farm
    const limite = LIMITE_DIARIO[m.tipo_objetivo];
    if (limite) {
      const contagem = mu.progresso_atual; // proxy: já acumulado neste ciclo
      const restante = Math.max(0, limite - (mu.progresso_atual - (m.ciclo === 'daily' ? 0 : 0)));
      incremento = Math.min(incremento, limite - mu.progresso_atual % limite);
      if (incremento <= 0) continue;
    }

    const novoProgresso = Math.min(mu.progresso_atual + incremento, m.objetivo_valor);
    const concluiu = novoProgresso >= m.objetivo_valor;

    await mu.update({
      progresso_atual: novoProgresso,
      concluida: concluiu,
      concluida_em: concluiu && !mu.concluida ? new Date() : mu.concluida_em,
    });

    // Conceder XP uma única vez ao concluir
    if (concluiu && !mu.xp_concedido) {
      await mu.update({ xp_concedido: true });
      setImmediate(() =>
        incrementarXP(usuarioId, m.recompensa_xp, `missao-concluida|id=${m.id}|${m.nome}`)
      );
      concluidas.push({ missao: m, progressoAnterior: mu.progresso_atual });
      console.log(`[Missões] ✅ Utilizador #${usuarioId} concluiu: "${m.nome}" (+${m.recompensa_xp} XP)`);
    }
  }

  return concluidas;
}

// ── Verificar se o evento afeta a missão 
function eventoAfetaMissao(evento, missao) {
  switch (missao.tipo_objetivo) {
    case 'questoes_corretas':
      return evento.tipo === 'questao_correta';
    case 'questoes_dificeis':
      return evento.tipo === 'questao_correta' && evento.dificuldade === 'dificil';
    case 'testes_completos':
      // Filtra por disciplina se a missão tiver uma
      return evento.tipo === 'teste_completo' &&
        (!missao.disciplina || evento.disciplina === missao.disciplina);
    case 'acerto_percentual':
      return evento.tipo === 'teste_completo' &&
        typeof evento.percentual === 'number' &&
        evento.percentual >= missao.objetivo_valor;
    case 'acertos_seguidos':
      return evento.tipo === 'acerto_seguido' &&
        typeof evento.acertos_seguidos === 'number' &&
        evento.acertos_seguidos >= missao.objetivo_valor;
    case 'streak_dias':
      return evento.tipo === 'streak_update' &&
        typeof evento.streak_atual === 'number' &&
        evento.streak_atual >= missao.objetivo_valor;
    default:
      return false;
  }
}

// ── Calcular incremento para um evento 
function calcularIncremento(evento, missao) {
  switch (missao.tipo_objetivo) {
    case 'questoes_corretas':
    case 'questoes_dificeis':
      return 1; // 1 questão por vez
    case 'testes_completos':
      return 1; // 1 teste por vez
    case 'acerto_percentual':
      // O progresso vai de 0 até objetivo_valor (que é o % mínimo)
      // Só conta se atingiu o %: incrementar para o valor máximo direto
      return missao.objetivo_valor;
    case 'acertos_seguidos':
      // Incrementar apenas se atingiu a sequência necessária
      return missao.objetivo_valor;
    case 'streak_dias':
      // O progresso é o streak_atual — actualizar para o valor corrente
      return evento.streak_atual;
    default:
      return 0;
  }
}

// ── Incrementar progresso manualmente via endpoint 
export async function incrementarProgresso(usuarioId, missaoId, incremento = 1) {
  const missao = await Missao.findByPk(missaoId);
  if (!missao || !missao.ativo) return null;

  const mu = await garantirProgresso(usuarioId, missao);
  if (mu.concluida) return mu;

  const novoProgresso = Math.min(mu.progresso_atual + incremento, missao.objetivo_valor);
  const concluiu = novoProgresso >= missao.objetivo_valor;

  await mu.update({
    progresso_atual: novoProgresso,
    concluida: concluiu,
    concluida_em: concluiu && !mu.concluida ? new Date() : mu.concluida_em,
  });

  if (concluiu && !mu.xp_concedido) {
    await mu.update({ xp_concedido: true });
    setImmediate(() =>
      incrementarXP(usuarioId, missao.recompensa_xp, `missao-manual|id=${missao.id}`)
    );
  }

  return { ...mu.toJSON(), missao };
}

export default { getMissoesAtivas, processarEvento, incrementarProgresso, hojeUTC, segundaFeirasUTC };
