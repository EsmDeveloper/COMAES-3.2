/**
 * questoesRoutesRefactored.js
 * Rotas refatoradas para gerenciar questões usando modelo único Questao.js
 * 
 * Endpoints:
 * POST   /api/questoes                          - Criar questão
 * GET    /api/questoes                          - Listar todas as questões
 * GET    /api/questoes/:id                      - Obter questão
 * PUT    /api/questoes/:id                      - Atualizar questão
 * DELETE /api/questoes/:id                      - Deletar questão
 * GET    /api/questoes/torneio/:torneioId       - Listar questões do torneio
 * GET    /api/questoes/quiz/:area               - Carregar questões para quiz
 */

import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import { QuestoesControllerRefactored } from '../controllers/QuestoesControllerRefactored.js';

const router = express.Router();

// ─── ROTAS PÚBLICAS ──────────────────────────────────────────────

// Carregar questões para quiz (PÚBLICA)
router.get('/quiz/:area', QuestoesControllerRefactored.carregarQuiz);

// ─── ROTAS PROTEGIDAS (ADMIN ONLY) ───────────────────────────────

// Listar todas as questões
router.get('/', isAdmin, QuestoesControllerRefactored.listarTodas);

// Criar questão
router.post('/', isAdmin, QuestoesControllerRefactored.criar);

// Listar questões de um torneio
// GET /api/questoes/torneio/:torneioId?disciplina=matematica&tipo=multipla_escolha&dificuldade=facil&pagina=1&limite=20&busca=
router.get('/torneio/:torneioId', isAdmin, QuestoesControllerRefactored.listarPorTorneio);

// Obter questão por ID
router.get('/:id', isAdmin, QuestoesControllerRefactored.obter);

// Atualizar questão
router.put('/:id', isAdmin, QuestoesControllerRefactored.atualizar);

// Deletar questão
router.delete('/:id', isAdmin, QuestoesControllerRefactored.deletar);

export default router;
