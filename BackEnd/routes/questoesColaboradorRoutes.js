/**
 * questoesColaboradorRoutes.js
 * Rotas para operações de questões de colaboradores (Task 8.1)
 * 
 * Rotas protegidas por middleware de autenticação e verificação de role colaborador
 * 
 * Endpoints:
 * POST   /api/questoes                - Criar nova questão
 * GET    /api/questoes/minhas         - Listar minhas questões
 * GET    /api/questoes/colaborador/stats - Obter estatísticas (Task 11.1)
 * PUT    /api/questoes/:id            - Atualizar minha questão
 * DELETE /api/questoes/:id            - Deletar minha questão
 */

import express from 'express';
import { QuestoesController } from '../controllers/QuestoesController.js';
import canManageQuestoes from '../middlewares/canManageQuestoes.js';

const router = express.Router();

// Aplicar middleware de autenticação e verificação de role colaborador a todas as rotas
router.use(canManageQuestoes);

/**
 * GET /api/questoes/colaborador/stats
 * Obter estatísticas de questões do colaborador (Task 11.1)
 * 
 * Response: 200 OK
 * {
 *   success: true,
 *   data: {
 *     questoes_totais: number,
 *     pendentes: number,
 *     aprovadas: number,
 *     rejeitadas: number,
 *     disciplina: string
 *   }
 * }
 */
router.get('/colaborador/stats', QuestoesController.getColaboradorStats);

/**
 * POST /api/questoes
 * Criar nova questão como colaborador (Task 4.1)
 * 
 * Requisitos:
 * - Validar dados da questão (titulo, descricao, disciplina, tipo, etc.)
 * - Verificar se disciplina corresponde à disciplina_colaborador
 * - Definir status_aprovacao como 'pendente'
 * - Definir autor_id como id do colaborador
 * 
 * Body:
 * {
 *   titulo: string (obrigatório)
 *   descricao: string (obrigatório)
 *   disciplina: string (obrigatório - deve corresponder à disciplina_colaborador)
 *   tipo: string (obrigatório - 'multipla_escolha', 'texto', 'codigo')
 *   dificuldade: string (obrigatório - 'facil', 'medio', 'dificil')
 *   resposta_correta: string (obrigatório)
 *   opcoes: array (obrigatório para multipla_escolha)
 *   explicacao: string (opcional)
 *   pontos: number (opcional, padrão 10)
 *   linguagem: string (opcional)
 *   torneio_id: number (opcional)
 *   bloco_id: number (opcional)
 * }
 * 
 * Response: 201 Created
 */
router.post('/', QuestoesController.createQuestao);

/**
 * GET /api/questoes/minhas
 * Listar todas as questões do colaborador autenticado (Task 4.2)
 * 
 * Requisitos:
 * - Filtrar por autor_id (id do colaborador)
 * - Filtrar por disciplina_colaborador
 * - Suportar filtros opcionais (dificuldade, status_aprovacao)
 * - Retornar array vazio se nenhuma questão
 * - Incluir paginação
 * 
 * Query Parameters:
 * - dificuldade: string (opcional - filtrar por dificuldade)
 * - status_aprovacao: string (opcional - filtrar por status)
 * - pagina: number (opcional, padrão 1)
 * - limite: number (opcional, padrão 20)
 * 
 * Response: 200 OK
 */
router.get('/minhas', QuestoesController.getMinhasQuestoes);

/**
 * PUT /api/questoes/:id
 * Atualizar questão do colaborador (Task 4.3)
 * 
 * Requisitos:
 * - Verificar se questão pertence ao colaborador (autor_id)
 * - Evitar edição de questões aprovadas (reverter para 'pendente')
 * - Validar disciplina se alterada (deve corresponder à disciplina_colaborador)
 * - Atualizar apenas campos fornecidos
 * 
 * URL Parameters:
 * - id: number (ID da questão)
 * 
 * Body: Campos a atualizar
 * 
 * Response: 200 OK
 */
router.put('/:id', QuestoesController.updateQuestao);

/**
 * DELETE /api/questoes/:id
 * Deletar questão do colaborador (Task 4.4)
 * 
 * Requisitos:
 * - Verificar se questão pertence ao colaborador (autor_id)
 * - Remover questão permanentemente
 * - Cascata delete de respostas associadas
 * - Apenas permite deletar questões próprias
 * 
 * URL Parameters:
 * - id: number (ID da questão)
 * 
 * Response: 200 OK
 */
router.delete('/:id', QuestoesController.deleteQuestao);

export default router;
