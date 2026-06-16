import Disciplina from '../models/Disciplina.js';
import Usuario from '../models/User.js';

/**
 * Helper function to generate slug from name
 * Converts to lowercase, removes special chars, replaces spaces with hyphens
 * @param {string} nome - The name to convert to slug
 * @returns {string} The generated slug
 */
const generateSlug = (nome) => {
  return nome
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const DisciplinaController = {
  /**
   * Task 6.1: Create a new Disciplina
   * Requirements: 9.1-9.6
   * Admin only
   */
  createDisciplina: async (req, res) => {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Acesso negado. Apenas administradores podem criar disciplinas.',
        });
      }

      const { nome, descricao, cor } = req.body;

      // Requirement 9.1: Require nome to be provided
      if (!nome || !nome.trim()) {
        return res.status(400).json({
          message: 'Nome da disciplina é obrigatório',
          field: 'nome',
        });
      }

      // Requirement 9.3: Validate unique constraint
      const nomeTrim = nome.trim();
      const disciplinaExistente = await Disciplina.findOne({
        where: {
          nome: nomeTrim,
        },
      });

      if (disciplinaExistente) {
        return res.status(409).json({
          message: 'Disciplina já existe',
          field: 'nome',
        });
      }

      // Requirement 9.2: Auto-generate slug from nome
      const slug = generateSlug(nomeTrim);

      // Validate slug is unique
      const slugExistente = await Disciplina.findOne({
        where: { slug },
      });

      if (slugExistente) {
        return res.status(409).json({
          message: 'Uma disciplina com este nome (slug) já existe',
          field: 'nome',
        });
      }

      // Requirement 9.4: Allow optional descricao and cor
      // Requirement 9.5: Set ativo to true by default
      const novaDiscplina = await Disciplina.create({
        nome: nomeTrim,
        slug,
        descricao: descricao?.trim() || null,
        cor: cor || null, // Validate hex color format
        ativo: true, // Default to true
      });

      // Requirement 9.6: Return created disciplina with all fields
      return res.status(201).json({
        message: 'Disciplina criada com sucesso',
        data: novaDiscplina,
      });
    } catch (error) {
      console.error('Erro ao criar disciplina:', error);

      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const errorMessages = error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        }));
        return res.status(400).json({
          message: 'Erro de validação',
          errors: errorMessages,
        });
      }

      return res.status(500).json({
        message: 'Erro ao criar disciplina',
        error: error.message,
      });
    }
  },

  /**
   * Task 6.2: Get all Disciplinas
   * Requirements: 10.1-10.3
   * Admin only
   */
  getAllDisciplinas: async (req, res) => {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Acesso negado. Apenas administradores podem listar disciplinas.',
        });
      }

      const { includeCount } = req.query;

      // Requirement 10.1: Return all disciplinas regardless of ativo status
      // Requirement 10.2: Order by nome ascending
      let disciplinas = await Disciplina.findAll({
        order: [['nome', 'ASC']],
      });

      // Requirement 10.3: Include collaborator count if requested
      if (includeCount === 'true') {
        disciplinas = await Promise.all(
          disciplinas.map(async (disciplina) => {
            const count = await Usuario.count({
              where: {
                disciplina_colaborador: disciplina.nome,
                role: 'colaborador',
              },
            });

            return {
              ...disciplina.toJSON(),
              colaboradores_count: count,
            };
          })
        );
      }

      return res.status(200).json({
        message: 'Disciplinas listadas com sucesso',
        data: disciplinas,
      });
    } catch (error) {
      console.error('Erro ao listar disciplinas:', error);
      return res.status(500).json({
        message: 'Erro ao listar disciplinas',
        error: error.message,
      });
    }
  },

  /**
   * Task 6.3: Get collaborators by Disciplina
   * Requirements: 12.1-12.2
   * Admin only
   */
  getColaboradoresByDisciplina: async (req, res) => {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Acesso negado. Apenas administradores podem listar colaboradores.',
        });
      }

      const { disciplina } = req.params;

      // Validate disciplina parameter
      if (!disciplina || !disciplina.trim()) {
        return res.status(400).json({
          message: 'Disciplina é obrigatória',
          field: 'disciplina',
        });
      }

      // Verify disciplina exists
      const disciplinaExistente = await Disciplina.findOne({
        where: { nome: disciplina.trim() },
      });

      if (!disciplinaExistente) {
        return res.status(404).json({
          message: 'Disciplina não encontrada',
        });
      }

      // Requirement 12.1: Return users where disciplina_colaborador matches disciplina_id
      // Requirement 12.2: Include id, nome, email, disciplina_colaborador fields
      const colaboradores = await Usuario.findAll({
        where: {
          disciplina_colaborador: disciplina.trim(),
          role: 'colaborador',
        },
        attributes: ['id', 'nome', 'email', 'disciplina_colaborador'],
        order: [['nome', 'ASC']],
      });

      // Return empty array if no collaborators (no error needed)
      return res.status(200).json({
        message: 'Colaboradores listados com sucesso',
        data: colaboradores,
        total: colaboradores.length,
      });
    } catch (error) {
      console.error('Erro ao listar colaboradores por disciplina:', error);
      return res.status(500).json({
        message: 'Erro ao listar colaboradores',
        error: error.message,
      });
    }
  },

  /**
   * Task 13.1: Delete a Disciplina
   * Admin only
   */
  deleteDisciplina: async (req, res) => {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Acesso negado. Apenas administradores podem deletar disciplinas.',
        });
      }

      const { id } = req.params;

      // Validate id parameter
      if (!id) {
        return res.status(400).json({
          message: 'ID da disciplina é obrigatório',
          field: 'id',
        });
      }

      // Find the disciplina
      const disciplina = await Disciplina.findByPk(id);

      if (!disciplina) {
        return res.status(404).json({
          message: 'Disciplina não encontrada',
        });
      }

      // Delete the disciplina
      await disciplina.destroy();

      return res.status(200).json({
        message: 'Disciplina deletada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar disciplina:', error);
      return res.status(500).json({
        message: 'Erro ao deletar disciplina',
        error: error.message,
      });
    }
  },
};
