/**
 * missoesRoutes.js
 *
 * GET  /api/missoes/ativas          — Lista missões activas do ciclo actual
 * POST /api/missoes/:id/progresso   — Incrementa progresso de uma missão
 * GET  /api/usuarios/me/dashboard-gamificacao — Endpoint agregado de gamificação
 */

import express from 'express';
import auth from '../middlewares/auth.js';
import isNotColaborador from '../middlewares/isNotColaborador.js';
import {
  getMissoesAtivasHandler,
  incrementarProgressoHandler,
  getDashboardGamificacao,
} from '../controllers/missoesController.js';

// ── Rotas de missões (/api/missoes) ───────────────────────────────
export const missoesRouter = express.Router();

missoesRouter.get('/ativas', auth, isNotColaborador, getMissoesAtivasHandler);
missoesRouter.post('/:id/progresso', auth, isNotColaborador, incrementarProgressoHandler);

// ── Rota do dashboard agregado (/api/usuarios) ────────────────────
export const dashboardGamificacaoRouter = express.Router();

dashboardGamificacaoRouter.get('/me/dashboard-gamificacao', auth, isNotColaborador, getDashboardGamificacao);
