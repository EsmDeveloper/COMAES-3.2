/**
 * blocosRoutes.js
 * Rotas para gestão de Blocos de Questões e suas associações a Torneios.
 *
 * Blocos:
 *   GET    /api/blocos                    — listar (admin + colaborador)
 *   POST   /api/blocos                    — criar (admin only)
 *   GET    /api/blocos/:id                — detalhe (admin + colaborador)
 *   PUT    /api/blocos/:id                — editar (admin only)
 *   DELETE /api/blocos/:id                — deletar (admin only)
 *   POST   /api/blocos/:id/questoes       — adicionar questão (admin only)
 *   DELETE /api/blocos/:id/questoes/:qid  — remover questão (admin only)
 *
 * Torneio ↔ Bloco:
 *   GET    /api/torneios/:id/blocos       — listar blocos do torneio (admin + colaborador)
 *   POST   /api/torneios/:id/blocos       — associar bloco (admin only)
 *   DELETE /api/torneios/:id/blocos/:bid  — desassociar bloco (admin only)
 */

import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import canManageQuestoes from '../middlewares/canManageQuestoes.js';
import {
  listarBlocos,
  criarBloco,
  obterBloco,
  editarBloco,
  deletarBloco,
  adicionarQuestao,
  removerQuestao,
  listarBlocosDoTorneio,
  associarBlocoAoTorneio,
  desassociarBlocoDoTorneio,
} from '../controllers/BlocosController.js';

const router = express.Router();

// ── Blocos 
router.get('/',              canManageQuestoes, listarBlocos);
router.post('/',             isAdmin,           criarBloco);
router.get('/:id',           canManageQuestoes, obterBloco);
router.put('/:id',           isAdmin,           editarBloco);
router.delete('/:id',        isAdmin,           deletarBloco);
router.post('/:id/questoes', isAdmin,           adicionarQuestao);
router.delete('/:id/questoes/:qid', isAdmin,    removerQuestao);

export default router;

// ── Router separado para rotas de torneios (montado em /api/torneios) 
export const torneiBlocosRouter = express.Router({ mergeParams: true });
torneiBlocosRouter.get('/',       canManageQuestoes, listarBlocosDoTorneio);
torneiBlocosRouter.post('/',      isAdmin,           associarBlocoAoTorneio);
torneiBlocosRouter.delete('/:bid', isAdmin,          desassociarBlocoDoTorneio);
