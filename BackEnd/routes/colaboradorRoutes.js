/**
 * colaboradorRoutes.js
 * Rotas específicas para funcionalidades de colaboradores
 */

import express from 'express';
import canManageQuestoes from '../middlewares/canManageQuestoes.js';
import ColaboradorController from '../controllers/ColaboradorController.js';
import ColaboradorBlocosController from '../controllers/ColaboradorBlocosController.js';

const router = express.Router();

// Middleware para verificar se é colaborador aprovado
const verificarColaboradorAprovado = (req, res, next) => {
  if (!req.user || req.user.role !== 'colaborador') {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Acesso negado. Apenas colaboradores podem acessar este endpoint.'
    });
  }

  if (req.user.status_colaborador !== 'aprovado') {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Colaborador não aprovado. Aguarde aprovação do administrador.'
    });
  }

  next();
};

// Aplicar middleware de autenticação e verificação
router.use(canManageQuestoes);
router.use(verificarColaboradorAprovado);

// ── Endpoints de Questões ────────────────────────────────────────────────
// O CRUD de /questoes fica em colaboradorBlocosQuestoesRoutes, que tem o fluxo
// completo de aprovacao, edicao, exclusao e submissao.
router.get('/estatisticas', ColaboradorController.estatisticas);
router.get('/questoes', ColaboradorController.minhasQuestoes);
router.post('/questoes', ColaboradorController.criarQuestao);
router.get('/perfil', ColaboradorController.perfil);

// ── Endpoints de Blocos (NOVO) ───────────────────────────────────────────
router.post('/blocos', ColaboradorBlocosController.criarBloco);
router.get('/blocos', ColaboradorBlocosController.listarBlocos);
router.get('/blocos/:id', ColaboradorBlocosController.obterBloco);
router.put('/blocos/:id', ColaboradorBlocosController.editarBloco);
router.delete('/blocos/:id', ColaboradorBlocosController.deletarBloco);

// Adicionar/remover questões de blocos
router.post('/blocos/:id/questoes', ColaboradorBlocosController.adicionarQuestao);
router.delete('/blocos/:id/questoes/:qid', ColaboradorBlocosController.removerQuestao);

export default router;
