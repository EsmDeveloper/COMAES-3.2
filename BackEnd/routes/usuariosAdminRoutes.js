/**
 * usuariosAdminRoutes.js
 * Rotas para gerenciamento de usuários por administrador (Task 8.2 - Admin operations)
 * 
 * Rotas protegidas apenas para administradores
 * 
 * Endpoints:
 * PUT    /api/usuarios/:id/atribuir   - Atribuir colaborador a disciplina
 */

import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/authorize.js';
import Usuario from '../models/User.js';
import Disciplina from '../models/Disciplina.js';

const router = express.Router();

/**
 * PUT /api/usuarios/:id/atribuir
 * Atribuir usuário como colaborador de uma disciplina (Task 7.1)
 * 
 * Requisitos:
 * - Atualizar role do usuário para 'colaborador'
 * - Definir disciplina_colaborador para disciplina especificada
 * - Validar se disciplina é válida
 * - Impedir atribuição de usuários admin
 * - Atualizar status_colaborador para 'pendente' ou 'aprovado'
 * 
 * URL Parameters:
 * - id: number (ID do usuário a atribuir como colaborador)
 * 
 * Body:
 * {
 *   disciplina_id: number OR disciplina_nome: string (pelo menos um obrigatório)
 * }
 * 
 * Response: 200 OK
 * {
 *   id: number
 *   nome: string
 *   email: string
 *   role: 'colaborador'
 *   disciplina_colaborador: string
 *   status_colaborador: string
 * }
 * 
 * Errors:
 * - 400: Usuário ou disciplina não encontrado
 * - 403: Não é possível atribuir usuário admin como colaborador
 * - 422: Nenhuma disciplina válida fornecida
 */
router.put('/:id/atribuir', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { disciplina_id, disciplina_nome } = req.body;

    if (!disciplina_id && !disciplina_nome) {
      return res.status(422).json({
        sucesso: false,
        mensagem: 'Disciplina é obrigatória (disciplina_id ou disciplina_nome)',
        erros: { disciplina: 'Campo obrigatório' },
        timestamp: new Date().toISOString()
      });
    }

    console.log(`👥 Admin atribuindo colaborador:`, { usuarioId: id, disciplina_id, disciplina_nome });

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: `Usuário com ID ${id} não encontrado`,
        timestamp: new Date().toISOString()
      });
    }

    // Validar: não é possível atribuir usuário admin como colaborador
    if (usuario.role === 'admin') {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Não é possível atribuir um administrador como colaborador',
        timestamp: new Date().toISOString()
      });
    }

    // Buscar disciplina por ID ou nome
    let disciplina = null;
    if (disciplina_id) {
      disciplina = await Disciplina.findByPk(disciplina_id);
    } else if (disciplina_nome) {
      disciplina = await Disciplina.findOne({ where: { nome: disciplina_nome } });
    }

    if (!disciplina) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Disciplina não encontrada',
        erros: { disciplina: 'Disciplina inválida ou inexistente' },
        timestamp: new Date().toISOString()
      });
    }

    // Atualizar role e atribuir disciplina
    await usuario.update({
      role: 'colaborador',
      disciplina_colaborador: disciplina.nome,
      status_colaborador: 'pendente'
    });

    console.log(`✅ Usuário ${id} atribuído como colaborador da disciplina ${disciplina.nome}`);

    res.status(200).json({
      sucesso: true,
      dados: usuario.toJSON(),
      mensagem: 'Usuário atribuído como colaborador com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao atribuir colaborador:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atribuir colaborador',
      erros: { detalhes: error.message },
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
