/**
 * nivelRoutes.js
 *
 * GET /api/usuarios/me/nivel  — Nível, XP e progresso do utilizador autenticado
 * PUT /api/usuarios/xp        — Incremento manual de XP (apenas admin)
 */

import express from 'express';
import { authenticateAny } from '../middlewares/auth.js';
import { getMeuNivel, adicionarXP } from '../controllers/nivelController.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();

// Qualquer utilizador autenticado pode consultar o próprio nível
router.get('/me/nivel', authenticateAny, getMeuNivel);

// Apenas administradores podem conceder XP manualmente
router.put('/xp', isAdmin, adicionarXP);

export default router;
