/**
 * questoesAdminRoutes.js
 * Routes for admin question approval/rejection operations
 * 
 * Task 8.2: Create admin routes (questions part)
 * Requirements: 6.1, 7.1, 8.1
 * 
 * Endpoints:
 * GET    /api/questoes/pendentes (list pending for approval)
 * PUT    /api/questoes/:id/aprovar (approve)
 * PUT    /api/questoes/:id/rejeitar (reject)
 */

import express from 'express';
import auth from '../middlewares/auth.js';
import isAdmin from '../middlewares/isAdmin.js';
import { QuestoesController } from '../controllers/QuestoesController.js';

const router = express.Router();

/**
 * Task 5.1: Get all pending questions for approval
 * GET /api/questoes/pendentes
 * Requirements: 6.1, 6.2, 6.3, 6.4
 * 
 * Query parameters:
 * - disciplina?: string (optional filter by discipline)
 * - dificuldade?: 'facil' | 'medio' | 'dificil' (optional filter)
 * - pagina?: number (default: 1)
 * - limite?: number (default: 20)
 * 
 * Response: 200 OK
 * {
 *   sucesso: true,
 *   dados: [
 *     {
 *       id,
 *       titulo,
 *       descricao,
 *       status_aprovacao: 'pendente',
 *       disciplina,
 *       dificuldade,
 *       autor_id,
 *       autor: { nome, email },
 *       criado_em,
 *       ...
 *     }
 *   ]
 * }
 */
router.get('/pendentes', auth, isAdmin, QuestoesController.getPendingQuestoes);

/**
 * Task 5.2: Approve a pending question
 * PUT /api/questoes/:id/aprovar
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 * 
 * Request body: {} (no body required)
 * 
 * Rules:
 * - Only admin can approve
 * - Question must be in 'pendente' status
 * - Sets status_aprovacao to 'aprovada'
 * - Sets revisado_por to admin's id
 * - Sets revisado_em to current timestamp
 * - Returns error if already approved
 * 
 * Response: 200 OK
 * {
 *   sucesso: true,
 *   mensagem: 'Questão aprovada com sucesso',
 *   dados: {
 *     id,
 *     status_aprovacao: 'aprovada',
 *     revisado_por,
 *     revisado_em,
 *     ...
 *   }
 * }
 */
router.put('/:id/aprovar', auth, isAdmin, QuestoesController.approveQuestao);

/**
 * Task 5.3: Reject a pending question
 * PUT /api/questoes/:id/rejeitar
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 * 
 * Request body:
 * {
 *   motivo_rejeicao: string (required - reason for rejection)
 * }
 * 
 * Rules:
 * - Only admin can reject
 * - motivo_rejeicao is required
 * - Question must be in 'pendente' status
 * - Sets status_aprovacao to 'rejeitada'
 * - Sets revisado_por to admin's id
 * - Sets revisado_em to current timestamp
 * - Stores motivo_rejeicao
 * 
 * Response: 200 OK
 * {
 *   sucesso: true,
 *   mensagem: 'Questão rejeitada com sucesso',
 *   dados: {
 *     id,
 *     status_aprovacao: 'rejeitada',
 *     motivo_rejeicao,
 *     revisado_por,
 *     revisado_em,
 *     ...
 *   }
 * }
 */
router.put('/:id/rejeitar', auth, isAdmin, QuestoesController.rejectQuestao);

export default router;
