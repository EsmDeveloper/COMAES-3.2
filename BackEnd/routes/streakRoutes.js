/**
 * streakRoutes.js
 *
 * POST /api/usuarios/atividade — Registar atividade e atualizar streak (qualquer utilizador auth.)
 * GET  /api/usuarios/me/streak — Consultar streak atual do utilizador autenticado
 */

import express from 'express';
import { authenticateAny } from '../middlewares/auth.js';
import { registarAtividadeHandler, getMeuStreak } from '../controllers/streakController.js';

const router = express.Router();

// Regista uma atividade e actualiza o streak — todos os utilizadores autenticados
router.post('/atividade', authenticateAny, registarAtividadeHandler);

// Consulta o streak actual
router.get('/me/streak', authenticateAny, getMeuStreak);

export default router;
