import express from 'express';
import auth from '../middlewares/auth.js';
import isNotColaborador from '../middlewares/isNotColaborador.js';
import {
  salvarTentativa,
  obterHistorico,
  obterEstatisticas
} from '../controllers/TentativasController.js';

const router = express.Router();

/**
 * POST /api/tentativas
 * Salvar uma tentativa de resposta
 * Requer autenticação e não pode ser colaborador
 */
router.post('/', auth, isNotColaborador, salvarTentativa);

/**
 * GET /api/tentativas/:torneio_id/:disciplina
 * Obter histórico de tentativas do usuário
 * Requer autenticação
 */
router.get('/:torneio_id/:disciplina', auth, obterHistorico);

/**
 * GET /api/tentativas/stats/:torneio_id
 * Obter estatísticas de tentativas
 * Requer autenticação
 */
router.get('/stats/:torneio_id', auth, obterEstatisticas);

export default router;
