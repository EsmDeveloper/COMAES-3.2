import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import * as GenericController from '../controllers/GenericController.js';
import { getStats } from '../controllers/adminStatsController.js';

const router = express.Router();

// Endpoint agregado da Visao Geral. Deve vir antes do loader generico
// para evitar que "stats" seja interpretado como nome de modelo.
router.get('/stats', isAdmin, getStats);

// Generic model loader
router.use('/:model', GenericController.getModelByName);

// Schema endpoint for dynamic forms (protected)
router.get('/:model/schema', isAdmin, GenericController.getSchema);

// CRUD routes for models (protected)
router.get('/:model', isAdmin, GenericController.getAll);
router.get('/:model/:id', isAdmin, GenericController.getById);
router.post('/:model', isAdmin, GenericController.create);
router.put('/:model/:id', isAdmin, GenericController.update);
router.delete('/:model/:id', isAdmin, GenericController.remove);

export default router;
