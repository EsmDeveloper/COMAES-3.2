/**
 * colaboradorBlocosQuestoesRoutes.js
 * 
 * Rotas para o workflow de questões e blocos para Colaboradores
 * 
 * BLOCOS ENDPOINTS (Colaborador):
 *   POST   /api/colaborador/blocos           - Criar bloco
 *   GET    /api/colaborador/blocos           - Listar blocos próprios
 *   GET    /api/colaborador/blocos/:id       - Obter detalhes do bloco
 *   PUT    /api/colaborador/blocos/:id       - Atualizar bloco próprio
 *   DELETE /api/colaborador/blocos/:id       - Deletar bloco próprio
 *
 * QUESTÕES ENDPOINTS (Colaborador):
 *   POST   /api/colaborador/questoes         - Criar questão
 *   GET    /api/colaborador/questoes         - Listar questões próprias
 *   GET    /api/colaborador/questoes/:id     - Obter detalhes da questão
 *   PUT    /api/colaborador/questoes/:id     - Atualizar questão própria
 *   DELETE /api/colaborador/questoes/:id     - Deletar questão própria
 *
 * ADMIN ENDPOINTS (Aprovação):
 *   GET    /api/admin/blocos-pendentes       - Listar blocos pendentes de aprovação
 *   POST   /api/admin/blocos/:id/aprovar     - Aprovar bloco
 *   POST   /api/admin/blocos/:id/rejeitar    - Rejeitar bloco
 *   GET    /api/admin/questoes-colaborador   - Listar questões de colaborador pendentes
 *   POST   /api/admin/questoes/:id/aprovar   - Aprovar questão
 *   POST   /api/admin/questoes/:id/rejeitar  - Rejeitar questão
 */

import express from 'express';
import auth from '../middlewares/auth.js';
import isAdmin from '../middlewares/isAdmin.js';
import canManageQuestoes from '../middlewares/canManageQuestoes.js';
import {
  // Blocos Colaborador
  criarBlocoColaborador,
  listarBlocosColaborador,
  obterBlocoColaborador,
  atualizarBlocoColaborador,
  deletarBlocoColaborador,
  submeterBlocoColaborador,
  adicionarQuestaoAoBlocoColaborador,
  removerQuestaoDoBlocoColaborador,
  // Questões Colaborador
  criarQuestaoColaborador,
  listarQuestoesColaborador,
  obterQuestaoColaborador,
  atualizarQuestaoColaborador,
  deletarQuestaoColaborador,
  submeterQuestaoColaborador,
  // Admin - Aprovação Blocos
  listarBlocosPendentesAdmin,
  aprovarBlocoAdmin,
  rejeitarBlocoAdmin,
  // Admin - Aprovação Questões
  listarQuestoesPendentesAdmin,
  aprovarQuestaoAdmin,
  rejeitarQuestaoAdmin,
  // Admin - Listar questões de um colaborador específico
  listarQuestoesColaboradorAdmin
} from '../controllers/ColaboradorBlocosQuestoesControllerV2.js';

const router = express.Router();

// ────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE PARA VALIDAR COLABORADOR APROVADO
// ────────────────────────────────────────────────────────────────────────────

/**
 * Middleware para verificar se é um colaborador aprovado
 * Aplica-se aos endpoints de colaborador
 */
const validarColaboradorAprovado = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'colaborador') {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Apenas colaboradores podem acessar este recurso.',
        timestamp: new Date().toISOString()
      });
    }

    if (req.user.status_colaborador !== 'aprovado') {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Seu status de colaborador não está aprovado.',
        timestamp: new Date().toISOString()
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao validar permissões',
      detalhes: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// BLOCOS - ENDPOINTS DO COLABORADOR
// ────────────────────────────────────────────────────────────────────────────

router.post(
  '/blocos',
  auth,
  validarColaboradorAprovado,
  criarBlocoColaborador
);

router.get(
  '/blocos',
  auth,
  validarColaboradorAprovado,
  listarBlocosColaborador
);

router.get(
  '/blocos/:id',
  auth,
  validarColaboradorAprovado,
  obterBlocoColaborador
);

router.put(
  '/blocos/:id',
  auth,
  validarColaboradorAprovado,
  atualizarBlocoColaborador
);

router.delete(
  '/blocos/:id',
  auth,
  validarColaboradorAprovado,
  deletarBlocoColaborador
);

router.post(
  '/blocos/:id/submeter',
  auth,
  validarColaboradorAprovado,
  submeterBlocoColaborador
);

router.post(
  '/blocos/:id/questoes',
  auth,
  validarColaboradorAprovado,
  adicionarQuestaoAoBlocoColaborador
);

router.delete(
  '/blocos/:id/questoes/:questaoId',
  auth,
  validarColaboradorAprovado,
  removerQuestaoDoBlocoColaborador
);

// ────────────────────────────────────────────────────────────────────────────
// QUESTÕES - ENDPOINTS DO COLABORADOR
// ────────────────────────────────────────────────────────────────────────────

router.post(
  '/questoes',
  auth,
  validarColaboradorAprovado,
  criarQuestaoColaborador
);

router.get(
  '/questoes',
  auth,
  validarColaboradorAprovado,
  listarQuestoesColaborador
);

router.get(
  '/questoes/:id',
  auth,
  validarColaboradorAprovado,
  obterQuestaoColaborador
);

router.put(
  '/questoes/:id',
  auth,
  validarColaboradorAprovado,
  atualizarQuestaoColaborador
);

router.delete(
  '/questoes/:id',
  auth,
  validarColaboradorAprovado,
  deletarQuestaoColaborador
);

router.post(
  '/questoes/:id/submeter',
  auth,
  validarColaboradorAprovado,
  submeterQuestaoColaborador
);

// ────────────────────────────────────────────────────────────────────────────
// ADMIN - ENDPOINTS DE APROVAÇÃO
// ────────────────────────────────────────────────────────────────────────────

router.get(
  '/blocos-pendentes',
  auth,
  isAdmin,
  listarBlocosPendentesAdmin
);

// ✅ ALIAS para compatibilidade com frontend
router.get(
  '/blocos-colaboradores-pendentes',
  auth,
  isAdmin,
  listarBlocosPendentesAdmin
);

router.post(
  '/blocos/:id/aprovar',
  auth,
  isAdmin,
  aprovarBlocoAdmin
);

router.post(
  '/blocos/:id/rejeitar',
  auth,
  isAdmin,
  rejeitarBlocoAdmin
);

router.get(
  '/questoes-colaborador-pendentes',
  auth,
  isAdmin,
  listarQuestoesPendentesAdmin
);

router.post(
  '/questoes/:id/aprovar',
  auth,
  isAdmin,
  aprovarQuestaoAdmin
);

router.post(
  '/questoes/:id/rejeitar',
  auth,
  isAdmin,
  rejeitarQuestaoAdmin
);

// ────────────────────────────────────────────────────────────────────────────
// ADMIN - LISTAR QUESTÕES DE COLABORADOR ESPECÍFICO
// ────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/colaboradores/:colaboradorId/questoes
 * Listar todas as questões de um colaborador (com filtros opcionais)
 */
router.get(
  '/colaboradores/:colaboradorId/questoes',
  auth,
  isAdmin,
  listarQuestoesColaboradorAdmin
);

export default router;
