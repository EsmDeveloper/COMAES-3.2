import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import * as GenericController from '../controllers/GenericController.js';
import { getModelNames, getModel } from '../utils/modelMapper.js';
import UserController from '../controllers/UserController.js';
import TorneoController from '../controllers/TorneoController.js';

const router = express.Router();

// Rota para obter a lista de todos os modelos disponíveis
router.get('/models', isAdmin, (req, res) => {
    try {
        const modelNames = getModelNames();
        res.status(200).json(modelNames);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter a lista de modelos', error: error.message });
    }
});

// ===== ROTAS ESPECÍFICAS (modelos com controladores dedicados) =====
router.get('/users', isAdmin, UserController.getAllUsers);
router.post('/users', isAdmin, UserController.createUser);
router.put('/users/:id', isAdmin, UserController.updateUser);
router.delete('/users/:id', isAdmin, UserController.deleteUser);

router.get('/torneos', isAdmin, TorneoController.getAllTorneos);
router.post('/torneos', isAdmin, TorneoController.createTorneo);
router.put('/torneos/:id', isAdmin, TorneoController.updateTorneo);
router.delete('/torneos/:id', isAdmin, TorneoController.deleteTorneo);
router.get('/torneos/:id/participantes', isAdmin, TorneoController.getParticipantes);
router.post('/torneos/inscrever', isAdmin, TorneoController.inscreverParticipante);
router.patch('/participantes/:id/pontos', isAdmin, TorneoController.atualizarPontos);

// ===== ROTAS GENÉRICAS (modelos definidos em modelMapper.js) =====
const resolveModel = (req, res, next) => {
    try {
        req.Model = getModel(req.params.model);
        next();
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

router.get('/:model', isAdmin, resolveModel, GenericController.getAll);
router.get('/:model/:id', isAdmin, resolveModel, GenericController.getById);
router.post('/:model', isAdmin, resolveModel, GenericController.create);
router.put('/:model/:id', isAdmin, resolveModel, GenericController.update);
router.delete('/:model/:id', isAdmin, resolveModel, GenericController.remove);

export default router;
