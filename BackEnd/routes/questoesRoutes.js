/**
 * questoesRoutes.js
 * Rotas para gerenciar questões usando modelo único Questao.js
 * 
 * Endpoints:
 * POST   /api/questoes                          - Criar questão
 * GET    /api/questoes                          - Listar todas as questões
 * GET    /api/questoes/:id                      - Obter questão
 * PUT    /api/questoes/:id                      - Atualizar questão
 * DELETE /api/questoes/:id                      - Deletar questão
 * GET    /api/questoes/torneio/:torneioId       - Listar questões do torneio
 * GET    /api/questoes/quiz/:area               - Carregar questões para quiz
 * PATCH  /api/questoes/:id/aprovacao            - Revisar/aprovar questão (admin)
 * GET    /api/questoes/estatisticas             - Obter estatísticas das questões
 */

import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import canManageQuestoes from '../middlewares/canManageQuestoes.js';
import { QuestoesController } from '../controllers/QuestoesController.js';

const router = express.Router();

// ─── ROTAS PÚBLICAS ──────────────────────────────────────────────

// Carregar questões para quiz (PÚBLICA) — suporta torneio_id opcional
import { carregarQuizComBlocos } from '../controllers/BlocosController.js';
router.get('/quiz/:area', carregarQuizComBlocos);

// ─── ROTAS PROTEGIDAS (ADMIN OU COLABORADOR) ─────────────────────

// Listar todas as questões
router.get('/', canManageQuestoes, QuestoesController.listarTodas);

// Criar questão
router.post('/', canManageQuestoes, QuestoesController.criar);

// Listar questões de um torneio
// GET /api/questoes/torneio/:torneioId?disciplina=matematica&tipo=multipla_escolha&dificuldade=facil&pagina=1&limite=20&busca=
router.get('/torneio/:torneioId', canManageQuestoes, QuestoesController.listarPorTorneio);

// Aprovar/rejeitar questoes enviadas por colaboradores (admin only)
router.patch('/:id/aprovacao', isAdmin, QuestoesController.revisar);

// Obter estatísticas das questões
router.get('/estatisticas', canManageQuestoes, QuestoesController.estatisticas);

// Obter questão por ID
router.get('/:id', canManageQuestoes, QuestoesController.obter);

// Atualizar questão
router.put('/:id', canManageQuestoes, QuestoesController.atualizar);

// Deletar questão
router.delete('/:id', canManageQuestoes, QuestoesController.deletar);

export default router;
