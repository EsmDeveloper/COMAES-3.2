import express from 'express';
import auth from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import {
  getRankingPublicoCtrl,
  getRankingGeralCtrl,
  getRankingMatematicaCtrl,
  getRankingProgramacaoCtrl,
  getRankingInglesCtrl,
  getMinhaPosicaoCtrl,
  getEstatisticasCtrl,
  postAtualizarCtrl,
} from '../controllers/rankingController.js';

const router = express.Router();

// Documentação
router.get('/', (req, res) => {
  res.json({
    message: 'API de Rankings Educacionais — COMAES',
    version: '2.0.0',
    endpoints: {
      'GET /api/rankings/public':        'Top 10 público (sem autenticação)',
      'GET /api/rankings/geral':         'Top 100 geral (autenticado)',
      'GET /api/rankings/matematica':    'Top 100 Matemática (autenticado)',
      'GET /api/rankings/programacao':   'Top 100 Programação (autenticado)',
      'GET /api/rankings/ingles':        'Top 100 Inglês (autenticado)',
      'GET /api/rankings/minha-posicao': 'Posição do usuário logado (autenticado)',
      'GET /api/rankings/estatisticas':  'Estatísticas (admin)',
      'POST /api/rankings/atualizar':    'Forçar refresh de cache (admin)',
    },
    fonte: 'Dados reais de participantes_torneios (torneios finalizados, estudantes confirmados)',
    cache: '5 minutos em memória',
  });
});

// Públicos
router.get('/public', getRankingPublicoCtrl);

// Autenticados
router.get('/minha-posicao', auth, getMinhaPosicaoCtrl);
router.get('/geral', auth, getRankingGeralCtrl);
router.get('/matematica', auth, getRankingMatematicaCtrl);
router.get('/programacao', auth, getRankingProgramacaoCtrl);
router.get('/ingles', auth, getRankingInglesCtrl);

// Admin
router.get('/estatisticas', auth, isAdmin, getEstatisticasCtrl);
router.post('/atualizar', auth, isAdmin, postAtualizarCtrl);

export default router;
