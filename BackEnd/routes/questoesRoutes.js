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
 * 
 * Endpoints Colaborador (Wave 3):
 * POST   /api/questoes/colaborador/criar        - Criar questão como colaborador
 * GET    /api/questoes/colaborador/minhas       - Listar minhas questões
 * PUT    /api/questoes/colaborador/:id          - Atualizar minha questão
 * DELETE /api/questoes/colaborador/:id          - Deletar minha questão
 */

import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import canManageQuestoes from '../middlewares/canManageQuestoes.js';
import { QuestoesController } from '../controllers/QuestoesController.js';

const router = express.Router();

//  ROTAS PÚBLICAS 

// Carregar questões para quiz (PÚBLICA) — suporta torneio_id opcional
import { carregarQuizComBlocos } from '../controllers/BlocosController.js';
router.get('/quiz/:area', carregarQuizComBlocos);

//  ROTAS COLABORADOR (Wave 3) 

// Task 4.1: Criar questão como colaborador
router.post('/colaborador/criar', canManageQuestoes, QuestoesController.createQuestao);

// Task 4.2: Listar minhas questões
router.get('/colaborador/minhas', canManageQuestoes, QuestoesController.getMinhasQuestoes);

// Task 4.3: Atualizar minha questão
router.put('/colaborador/:id', canManageQuestoes, QuestoesController.updateQuestao);

// Task 4.4: Deletar minha questão
router.delete('/colaborador/:id', canManageQuestoes, QuestoesController.deleteQuestao);

//  ROTAS ADMIN (Wave 4) 

// Task 5.1: Listar questões pendentes de aprovação
router.get('/admin/pendentes', isAdmin, QuestoesController.getPendingQuestoes);

// Task 5.2: Aprovar questão
router.put('/:id/aprovar', isAdmin, QuestoesController.approveQuestao);

// Task 5.3: Rejeitar questão
router.put('/:id/rejeitar', isAdmin, QuestoesController.rejectQuestao);

//  ROTAS PROTEGIDAS (ADMIN OU COLABORADOR) 

// Listar todas as questões
router.get('/', canManageQuestoes, QuestoesController.listarTodas);

// Criar questão
router.post('/', canManageQuestoes, QuestoesController.criar);

// IMPORTANTE: Rotas mais específicas DEVEM vir ANTES das rotas genéricas com :id
// Caso contrário Express tenta fazer match de /:id antes de verificar /torneio/:torneioId etc.

// Listar questões de um torneio (específico)
// GET /api/questoes/torneio/:torneioId?disciplina=matematica&tipo=multipla_escolha&dificuldade=facil&pagina=1&limite=20&busca=
router.get('/torneio/:torneioId', canManageQuestoes, QuestoesController.listarPorTorneio);

// Obter estatísticas das questões (específico)
router.get('/estatisticas', canManageQuestoes, QuestoesController.estatisticas);

// Aprovar/rejeitar questoes enviadas por colaboradores (específico - PATCH /:id/aprovacao)
// CRÍTICO: Deve vir ANTES de GET /:id para evitar conflito de rotas
router.patch('/:id/aprovacao', isAdmin, QuestoesController.revisar);

// Listar questões de um bloco (específico)
router.get('/bloco/:blocoId', canManageQuestoes, QuestoesController.listarPorBloco);

// Rotas genéricas com :id (estas vêm por último)
// Obter questão por ID
router.get('/:id', canManageQuestoes, QuestoesController.obter);

// Atualizar questão
router.put('/:id', canManageQuestoes, QuestoesController.atualizar);

// Deletar questão
router.delete('/:id', canManageQuestoes, QuestoesController.deletar);

export default router;
