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
import sequelize from '../config/db.js';
import BlocoQuestoes from '../models/BlocoQuestoes.js';
import TorneioBloco from '../models/TorneioBloco.js';
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

const deletarBlocoComDesassociacao = async (req, res, next) => {
  if (String(req.query.desassociar).toLowerCase() !== 'true') {
    return next();
  }

  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const bloco = await BlocoQuestoes.findByPk(id, { transaction });

    if (!bloco) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: 'Bloco não encontrado' });
    }

    const associacoes = await TorneioBloco.count({ where: { bloco_id: id }, transaction });

    if (associacoes > 0) {
      await TorneioBloco.destroy({ where: { bloco_id: id }, transaction });
    }

    await bloco.destroy({ transaction });
    await transaction.commit();

    return res.json({
      success: true,
      message: associacoes > 0
        ? `Bloco deletado com sucesso. ${associacoes} associação(ões) removida(s).`
        : 'Bloco deletado com sucesso',
      data: { associacoes_removidas: associacoes },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('[ERROR] Erro ao deletar bloco com desassociação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao deletar bloco',
      details: error.message,
    });
  }
};

// ── Blocos 
router.get('/',              canManageQuestoes, listarBlocos);
router.post('/',             isAdmin,           criarBloco);
router.get('/:id',           canManageQuestoes, obterBloco);
router.put('/:id',           isAdmin,           editarBloco);
router.delete('/:id',        isAdmin,           deletarBlocoComDesassociacao, deletarBloco);
router.post('/:id/questoes', isAdmin,           adicionarQuestao);
router.delete('/:id/questoes/:qid', isAdmin,    removerQuestao);

export default router;

// ── Router separado para rotas de torneios (montado em /api/torneios) 
export const torneiBlocosRouter = express.Router({ mergeParams: true });
torneiBlocosRouter.get('/',       canManageQuestoes, listarBlocosDoTorneio);
torneiBlocosRouter.post('/',      isAdmin,           associarBlocoAoTorneio);
torneiBlocosRouter.delete('/:bid', isAdmin,          desassociarBlocoDoTorneio);
