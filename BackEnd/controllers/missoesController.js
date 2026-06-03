/**
 * missoesController.js
 *
 * GET  /api/missoes/ativas              — Missões do ciclo activo para o utilizador
 * POST /api/missoes/:id/progresso       — Incrementar progresso manualmente
 * GET  /api/usuarios/me/dashboard-gamificacao — Endpoint agregado (nível + streak + missões + ranking)
 */

import { getMissoesAtivas, incrementarProgresso } from '../services/missoesService.js';
import { obterStreak } from '../services/streakService.js';
import { calcularProgressoParaProximoNivel, NIVEIS } from '../services/xpService.js';
import Nivel from '../models/Nivel.js';
import Usuario from '../models/User.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import ResultadoTeste from '../models/ResultadoTeste.js';
import ConquistaUsuario from '../models/ConquistaUsuario.js';
import Conquista from '../models/Conquista.js';
import sequelize from '../config/db.js';

// ── GET /api/missoes/ativas ───────────────────────────────────────
export const getMissoesAtivasHandler = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ success: false, error: 'Não autenticado.' });

    const missoes = await getMissoesAtivas(usuarioId);

    return res.json({ success: true, data: missoes });
  } catch (error) {
    console.error('[missoesController] getMissoesAtivas:', error);
    return res.status(500).json({ success: false, error: 'Erro ao obter missões.' });
  }
};

// ── POST /api/missoes/:id/progresso ───────────────────────────────
export const incrementarProgressoHandler = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    const { id } = req.params;
    const incremento = parseInt(req.body?.incremento || 1);

    if (!usuarioId) return res.status(401).json({ success: false, error: 'Não autenticado.' });
    if (!id || isNaN(parseInt(id))) return res.status(400).json({ success: false, error: 'ID inválido.' });

    const resultado = await incrementarProgresso(usuarioId, parseInt(id), incremento);
    if (!resultado) return res.status(404).json({ success: false, error: 'Missão não encontrada.' });

    return res.json({
      success: true,
      data: resultado,
      message: resultado.concluida ? `Missão "${resultado.missao?.nome}" concluída! 🎉` : 'Progresso atualizado.',
    });
  } catch (error) {
    console.error('[missoesController] incrementarProgresso:', error);
    return res.status(500).json({ success: false, error: 'Erro ao atualizar progresso.' });
  }
};

// ── GET /api/usuarios/me/dashboard-gamificacao ────────────────────
// Endpoint agregado — retorna todos os dados em UMA chamada
export const getDashboardGamificacao = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ success: false, error: 'Não autenticado.' });

    // Buscar dados em paralelo
    const [usuario, streak, missoes, conquistas, rankingGlobal, xpHistory] = await Promise.allSettled([

      // 1. Dados do utilizador com XP e nível
      Usuario.unscoped().findByPk(usuarioId, {
        attributes: ['id', 'nome', 'xp_total', 'nivel_atual'],
      }),

      // 2. Streak
      obterStreak(usuarioId),

      // 3. Missões activas
      getMissoesAtivas(usuarioId),

      // 4. Últimas 5 conquistas desbloqueadas
      ConquistaUsuario.findAll({
        where: { usuario_id: usuarioId },
        include: [{ model: Conquista, as: 'conquista', attributes: ['id', 'nome', 'descricao', 'url_icone'] }],
        order: [['concedido_em', 'DESC']],
        limit: 5,
      }).catch(() => []),

      // 5. Posição no ranking global (via participantes_torneios)
      ParticipanteTorneio.findAll({
        where: { usuario_id: usuarioId, status: 'confirmado' },
        attributes: ['pontuacao', 'posicao', 'disciplina_competida'],
        order: [['pontuacao', 'DESC']],
        limit: 3,
      }).catch(() => []),

      // 6. Histórico de XP simplificado (últimas 8 semanas via resultados_teste)
      ResultadoTeste.findAll({
        where: { usuario_id: usuarioId },
        attributes: ['pontos', 'area', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 30,
      }).catch(() => []),
    ]);

    // ── Processar nível ──────────────────────────────────────────
    const u = usuario.status === 'fulfilled' ? usuario.value : null;
    const xpTotal = u?.xp_total || 0;
    const nivelNum = u?.nivel_atual || 1;
    const nivelInfo = await Nivel.findOne({ where: { numero: nivelNum } }).catch(() => null);
    const proximoNivel = await Nivel.findOne({ where: { numero: nivelNum + 1 } }).catch(() => null);
    const progressoXP = calcularProgressoParaProximoNivel(xpTotal);

    // ── Processar streak ─────────────────────────────────────────
    const streakData = streak.status === 'fulfilled' ? streak.value : null;

    // ── Processar missões ────────────────────────────────────────
    const missoesData = missoes.status === 'fulfilled' ? missoes.value : [];
    // Máximo 3 por widget: 2 diárias não concluídas + 1 semanal
    const missoesWidget = [
      ...missoesData.filter(m => m.ciclo === 'daily' && !m.concluida).slice(0, 2),
      ...missoesData.filter(m => m.ciclo === 'weekly' && !m.concluida).slice(0, 1),
    ];

    // ── Processar conquistas ─────────────────────────────────────
    const conquistasData = conquistas.status === 'fulfilled'
      ? conquistas.value.map(cu => ({
          id: cu.conquista?.id,
          nome: cu.conquista?.nome || 'Conquista',
          descricao: cu.conquista?.descricao || '',
          url_icone: cu.conquista?.url_icone || null,
          concedido_em: cu.concedido_em,
        }))
      : [];

    // ── Processar ranking ────────────────────────────────────────
    const participacoes = rankingGlobal.status === 'fulfilled' ? rankingGlobal.value : [];
    const melhorPosicao = participacoes.reduce((best, p) => {
      if (!p.posicao) return best;
      return !best || p.posicao < best ? p.posicao : best;
    }, null);
    const rankingPorDisciplina = participacoes.reduce((acc, p) => {
      if (p.disciplina_competida && p.posicao) {
        if (!acc[p.disciplina_competida] || p.posicao < acc[p.disciplina_competida]) {
          acc[p.disciplina_competida] = p.posicao;
        }
      }
      return acc;
    }, {});

    // ── Processar gráfico de XP (agrupa por semana) ──────────────
    const resultados = xpHistory.status === 'fulfilled' ? xpHistory.value : [];
    const xpPorSemana = {};
    resultados.forEach(r => {
      const d = new Date(r.created_at);
      // Semana como string (YYYY-Www)
      const semana = `${d.getFullYear()}-S${Math.ceil(d.getDate() / 7)}/${d.getMonth() + 1}`;
      xpPorSemana[semana] = (xpPorSemana[semana] || 0) + (r.pontos || 0);
    });
    const xpGrafico = Object.entries(xpPorSemana)
      .slice(-8)
      .map(([semana, xp]) => ({ semana, xp }));

    return res.json({
      success: true,
      data: {
        nivel: {
          numero: nivelNum,
          info: nivelInfo,
          proximo: proximoNivel,
          xp_total: xpTotal,
          progresso: progressoXP,
        },
        streak: streakData || { streak_atual: 0, streak_maximo: 0, ativa: false },
        missoes: missoesWidget,
        missoes_todas: missoesData,
        conquistas: conquistasData,
        ranking: {
          melhor_posicao: melhorPosicao,
          por_disciplina: rankingPorDisciplina,
        },
        xp_grafico: xpGrafico,
      },
    });
  } catch (error) {
    console.error('[missoesController] getDashboardGamificacao:', error);
    return res.status(500).json({ success: false, error: 'Erro ao carregar dashboard.' });
  }
};
