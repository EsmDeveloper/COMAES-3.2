/**
 * streakController.js
 *
 * POST /api/usuarios/atividade  — Registar atividade e atualizar streak
 * GET  /api/usuarios/me/streak  — Obter streak atual do utilizador autenticado
 */

import { registarAtividade, obterStreak } from '../services/streakService.js';

// ── POST /api/usuarios/atividade ─────────────────────────────────
export const registarAtividadeHandler = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Não autenticado.' });
    }

    const resultado = await registarAtividade(usuarioId);

    if (!resultado) {
      return res.status(500).json({ success: false, error: 'Não foi possível registar a atividade.' });
    }

    return res.json({
      success: true,
      data: resultado,
      message: resultado.jaContado
        ? 'Atividade já registada hoje.'
        : resultado.reiniciou
          ? 'Que pena! Vamos recomeçar? A tua nova sequência começa hoje. 🔥'
          : resultado.primeiro
            ? 'Sequência iniciada! 🎉 Volta amanhã para continuar!'
            : `${resultado.streak_atual} dias seguidos! Continua assim! 🔥`,
    });
  } catch (error) {
    console.error('[streakController] registarAtividade:', error);
    return res.status(500).json({ success: false, error: 'Erro ao registar atividade.' });
  }
};

// ── GET /api/usuarios/me/streak ──────────────────────────────────
export const getMeuStreak = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Não autenticado.' });
    }

    const streak = await obterStreak(usuarioId);

    if (!streak) {
      return res.json({
        success: true,
        data: { streak_atual: 0, streak_maximo: 0, ultima_data_atividade: null, ativa: false },
      });
    }

    return res.json({ success: true, data: streak });
  } catch (error) {
    console.error('[streakController] getMeuStreak:', error);
    return res.status(500).json({ success: false, error: 'Erro ao obter streak.' });
  }
};
