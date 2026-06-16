/**
 * disciplinasAdminRoutes.js
 * Routes for admin disciplina management operations
 * 
 * Task 8.2: Create admin routes (disciplinas part)
 * Requirements: 9.1, 10.1, 12.1
 * 
 * Endpoints:
 * POST   /api/disciplinas (create)
 * GET    /api/disciplinas (list all)
 * GET    /api/disciplinas/:id/colaboradores (list collaborators by discipline)
 * DELETE /api/disciplinas/:id (delete)
 */

import express from 'express';
import auth from '../middlewares/auth.js';
import isAdmin from '../middlewares/isAdmin.js';
import { DisciplinaController } from '../controllers/DisciplinaController.js';

const router = express.Router();

/**
 * Task 6.1: Create a new disciplina
 * POST /api/disciplinas
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 * 
 * Request body:
 * {
 *   nome: string (required, unique)
 *   descricao?: string (optional)
 *   cor?: string (optional - hex color code)
 * }
 * 
 * Rules:
 * - Only admin can create
 * - nome must be unique
 * - slug is auto-generated from nome
 * - ativo is set to true by default
 * 
 * Response: 201 Created
 * {
 *   sucesso: true,
 *   dados: {
 *     id,
 *     nome,
 *     slug,
 *     descricao,
 *     cor,
 *     ativo: true,
 *     criado_em,
 *     ...
 *   }
 * }
 */
router.post('/', auth, isAdmin, DisciplinaController.createDisciplina);

/**
 * Task 6.2: Get all disciplinas
 * GET /api/disciplinas
 * Requirements: 10.1, 10.2, 10.3
 * 
 * Query parameters:
 * - includeCount?: boolean (optional - include collaborator count)
 * - ativo?: boolean (optional - filter by active status, default: all)
 * - pagina?: number (default: 1)
 * - limite?: number (default: 20)
 * 
 * Rules:
 * - Only admin can list
 * - Returns all disciplinas (both active and inactive)
 * - Order by nome ascending
 * - Can include collaborator count if requested
 * 
 * Response: 200 OK
 * {
 *   sucesso: true,
 *   dados: [
 *     {
 *       id,
 *       nome,
 *       slug,
 *       descricao,
 *       cor,
 *       ativo,
 *       colaboradorCount?: number,
 *       ...
 *     }
 *   ]
 * }
 */
router.get('/', auth, isAdmin, DisciplinaController.getAllDisciplinas);

/**
 * Task 6.3: Get collaborators by disciplina
 * GET /api/disciplinas/:id/colaboradores
 * Requirements: 12.1, 12.2
 * 
 * Path parameters:
 * - id: string (disciplina ID)
 * 
 * Query parameters:
 * - pagina?: number (default: 1)
 * - limite?: number (default: 20)
 * 
 * Rules:
 * - Only admin can access
 * - Returns all users assigned to the disciplina
 * - Include id, nome, email, disciplina_colaborador
 * 
 * Response: 200 OK
 * {
 *   sucesso: true,
 *   dados: [
 *     {
 *       id,
 *       nome,
 *       email,
 *       disciplina_colaborador,
 *       role,
 *       ...
 *     }
 *   ]
 * }
 */
router.get('/:id/colaboradores', auth, isAdmin, DisciplinaController.getColaboradoresByDisciplina);

/**
 * Task 13.1: Delete a disciplina
 * DELETE /api/disciplinas/:id
 * 
 * Path parameters:
 * - id: string (disciplina ID)
 * 
 * Rules:
 * - Only admin can delete
 * - Soft delete or check for related records
 * 
 * Response: 200 OK
 * {
 *   message: 'Disciplina deletada com sucesso'
 * }
 */
router.delete('/:id', auth, isAdmin, DisciplinaController.deleteDisciplina);

export default router;
