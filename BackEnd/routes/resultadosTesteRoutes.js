/**
 * resultadosTesteRoutes.js
 *
 * POST /api/resultados          — Salvar resultado de um teste concluído
 * GET  /api/usuarios/me/melhores-desempenhos — Melhor % por área do utilizador logado
 */

import express from 'express';
import { Op } from 'sequelize';
import ResultadoTeste from '../models/ResultadoTeste.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// ── POST /api/resultados ──────────────────────────────────────────
// Salva o resultado de um teste concluído e devolve o melhor desempenho atualizado
router.post('/', auth, async (req, res) => {
  try {
    const usuario_id = req.user?.id;
    if (!usuario_id) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const { area, percentual, pontos = 0, total_questoes = 0, acertos = 0 } = req.body;

    const areasValidas = ['matematica', 'programacao', 'ingles'];
    if (!areasValidas.includes(area)) {
      return res.status(400).json({ success: false, error: 'Área inválida' });
    }

    const pct = Math.max(0, Math.min(100, parseInt(percentual) || 0));

    // Salvar o resultado
    const resultado = await ResultadoTeste.create({
      usuario_id,
      area,
      percentual_acertos: pct,
      pontos: parseInt(pontos) || 0,
      total_questoes: parseInt(total_questoes) || 0,
      acertos: parseInt(acertos) || 0,
    });

    // Calcular melhor desempenho por área para devolver ao frontend
    const melhores = await getMelhoresDesempenhos(usuario_id);

    res.status(201).json({
      success: true,
      data: resultado,
      melhores_desempenhos: melhores,
    });
  } catch (error) {
    console.error('Erro ao salvar resultado:', error);
    res.status(500).json({ success: false, error: 'Erro ao salvar resultado' });
  }
});

// ── GET /api/usuarios/me/melhores-desempenhos ─────────────────────
// Devolve o melhor percentual de acertos por área do utilizador logado
router.get('/me/melhores-desempenhos', auth, async (req, res) => {
  try {
    const usuario_id = req.user?.id;
    if (!usuario_id) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const melhores = await getMelhoresDesempenhos(usuario_id);

    res.json({ success: true, data: melhores });
  } catch (error) {
    console.error('Erro ao buscar melhores desempenhos:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar desempenhos' });
  }
});

// ── Helper ────────────────────────────────────────────────────────
async function getMelhoresDesempenhos(usuario_id) {
  const areas = ['matematica', 'programacao', 'ingles'];
  const result = { matematica: null, programacao: null, ingles: null };

  const rows = await ResultadoTeste.findAll({
    where: { usuario_id },
    attributes: [
      'area',
      [ResultadoTeste.sequelize.fn('MAX', ResultadoTeste.sequelize.col('percentual_acertos')), 'melhor'],
    ],
    group: ['area'],
    raw: true,
  });

  rows.forEach(row => {
    if (areas.includes(row.area)) {
      result[row.area] = parseInt(row.melhor);
    }
  });

  return result;
}

export default router;
