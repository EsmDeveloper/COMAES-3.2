/**
 * questoesRoutes.js
 * Rotas especializadas para gerenciar questões
 * 
 * Endpoints:
 * POST   /api/questoes/:modalidade              - Criar questão
 * GET    /api/questoes/:modalidade/:id          - Obter questão
 * PUT    /api/questoes/:modalidade/:id          - Atualizar questão
 * DELETE /api/questoes/:modalidade/:id          - Deletar questão
 * GET    /api/questoes/torneio/:torneioId       - Listar questões do torneio
 * GET    /api/questoes/torneio/:torneioId/contar - Contar questões
 * POST   /api/questoes/:modalidade/:id/duplicar - Duplicar questão
 * GET    /api/questoes/auditoria/orfas          - Buscar questões órfãs
 * DELETE /api/questoes/auditoria/orfas          - Deletar questões órfãs
 * GET    /api/questoes/auditoria/integridade    - Validar integridade
 * GET    /api/questoes/quiz/:area               - Carregar questões para quiz (NOVO - Fase 3)
 */

import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import { QuestoesController } from '../controllers/QuestoesController.js';

const router = express.Router();

// ─── ROTAS PROTEGIDAS (ADMIN ONLY) ────────────────────────────────

// Criar questão
router.post('/:modalidade', isAdmin, QuestoesController.criar);

// Obter questão
router.get('/:modalidade/:id', isAdmin, QuestoesController.obter);

// Atualizar questão
router.put('/:modalidade/:id', isAdmin, QuestoesController.atualizar);

// Deletar questão
router.delete('/:modalidade/:id', isAdmin, QuestoesController.deletar);

// Duplicar questão
router.post('/:modalidade/:id/duplicar', isAdmin, QuestoesController.duplicar);

// ─── ROTAS DE LISTAGEM ────────────────────────────────────────────

// Listar questões de um torneio
// GET /api/questoes/torneio/:torneioId?modalidade=matematica&pagina=1&limite=20&busca=&dificuldade=facil
router.get('/torneio/:torneioId', isAdmin, QuestoesController.listarPorTorneio);

// Contar questões de um torneio
router.get('/torneio/:torneioId/contar', isAdmin, QuestoesController.contarPorTorneio);

// ─── ROTAS DE AUDITORIA (ADMIN ONLY) ──────────────────────────────

// Buscar questões órfãs
router.get('/auditoria/orfas', isAdmin, QuestoesController.buscarOrfas);

// Deletar questões órfãs
router.delete('/auditoria/orfas', isAdmin, QuestoesController.deletarOrfas);

// Validar integridade
router.get('/auditoria/integridade', isAdmin, QuestoesController.validarIntegridade);

// ─── ROTA DE QUIZ (PÚBLICA - Fase 3) ──────────────────────────────
// GET /api/questoes/quiz/:area?limit=10
// Carrega questões para quiz ordenadas por dificuldade
router.get('/quiz/:area', QuestoesController.carregarQuiz);

export default router;
