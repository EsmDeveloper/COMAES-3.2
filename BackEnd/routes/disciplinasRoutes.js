import express from 'express';
import auth from '../middlewares/auth.js';
import isAdmin from '../middlewares/isAdmin.js';
import { DisciplinaController } from '../controllers/DisciplinaController.js';

const router = express.Router();

/**
 * Task 6.1: Create a new Disciplina (admin only)
 * Requirements: 9.1-9.6
 * POST /api/disciplinas
 */
router.post('/', auth, isAdmin, DisciplinaController.createDisciplina);

/**
 * Task 6.2: Get all Disciplinas (admin only)
 * Requirements: 10.1-10.3
 * GET /api/disciplinas
 * Query parameter: includeCount=true (optional)
 */
router.get('/', auth, isAdmin, DisciplinaController.getAllDisciplinas);

/**
 * Task 6.3: Get collaborators by Disciplina (admin only)
 * Requirements: 12.1-12.2
 * GET /api/disciplinas/:disciplina/colaboradores
 */
router.get('/:disciplina/colaboradores', auth, isAdmin, DisciplinaController.getColaboradoresByDisciplina);

export default router;
