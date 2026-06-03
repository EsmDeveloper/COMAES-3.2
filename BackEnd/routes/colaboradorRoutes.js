/**
 * colaboradorRoutes.js
 * Rotas específicas para funcionalidades de colaboradores
 */

import express from 'express';
import canManageQuestoes from '../middlewares/canManageQuestoes.js';
import ColaboradorController from '../controllers/ColaboradorController.js';

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

// Endpoints do colaborador
router.get('/estatisticas', ColaboradorController.estatisticas);
router.get('/questoes', ColaboradorController.minhasQuestoes);
router.get('/perfil', ColaboradorController.perfil);

export default router;