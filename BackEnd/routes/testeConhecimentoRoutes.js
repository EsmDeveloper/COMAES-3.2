import express from 'express';
import TesteConhecimentoController from '../controllers/TesteConhecimentoController.js';
import auth from '../middlewares/auth.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();

// Rotas públicas (para usuários fazerem o teste)
router.get('/questoes/teste', TesteConhecimentoController.buscarParaTeste);
router.post('/questoes/:id/validar', auth, TesteConhecimentoController.validarResposta);

// Rotas administrativas (CRUD completo)
router.post('/questoes', auth, isAdmin, TesteConhecimentoController.criar);
router.get('/questoes', auth, isAdmin, TesteConhecimentoController.listar);
router.get('/questoes/:id', auth, isAdmin, TesteConhecimentoController.buscarPorId);
router.put('/questoes/:id', auth, isAdmin, TesteConhecimentoController.atualizar);
router.delete('/questoes/:id', auth, isAdmin, TesteConhecimentoController.deletar);

export default router;
