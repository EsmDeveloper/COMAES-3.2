import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

/**
 * Controller para gerenciar questões do Teste de Conhecimento
 * Sistema independente dos torneios
 */

class TesteConhecimentoController {
  // Criar nova questão
  async criar(req, res) {
    try {
      const { enunciado, opcoes, resposta_correta, dificuldade, categoria, pontos } = req.body;

      // Validações
      if (!enunciado || !enunciado.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Enunciado é obrigatório'
        });
      }

      if (!opcoes || !Array.isArray(opcoes) || opcoes.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Deve haver pelo menos 2 opções'
        });
      }

      if (!resposta_correta || !resposta_correta.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Resposta correta é obrigatória'
        });
      }

      if (!['facil', 'medio', 'dificil'].includes(dificuldade)) {
        return res.status(400).json({
          success: false,
          error: 'Dificuldade inválida'
        });
      }

      if (!['matematica', 'programacao', 'ingles', 'cultura_geral'].includes(categoria)) {
        return res.status(400).json({
          success: false,
          error: 'Categoria inválida'
        });
      }

      // Criar questão
      const questao = await QuestaoTesteConhecimento.create({
        enunciado: enunciado.trim(),
        opcoes,
        resposta_correta: resposta_correta.trim(),
        dificuldade,
        categoria,
        pontos: pontos || 10,
        ativo: true
      });

      res.status(201).json({
        success: true,
        data: questao,
        message: 'Questão criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar questão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar questão'
      });
    }
  }

  // Listar questões
  async listar(req, res) {
    try {
      const { categoria, dificuldade, ativo } = req.query;

      const where = {};

      if (categoria) {
        where.categoria = categoria;
      }

      if (dificuldade) {
        where.dificuldade = dificuldade;
      }

      if (ativo !== undefined) {
        where.ativo = ativo === 'true';
      }

      const questoes = await QuestaoTesteConhecimento.findAll({
        where,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: questoes,
        total: questoes.length
      });
    } catch (error) {
      console.error('Erro ao listar questões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar questões'
      });
    }
  }

  // Buscar questão por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const questao = await QuestaoTesteConhecimento.findByPk(id);

      if (!questao) {
        return res.status(404).json({
          success: false,
          error: 'Questão não encontrada'
        });
      }

      res.json({
        success: true,
        data: questao
      });
    } catch (error) {
      console.error('Erro ao buscar questão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar questão'
      });
    }
  }

  // Atualizar questão
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { enunciado, opcoes, resposta_correta, dificuldade, categoria, pontos, ativo } = req.body;

      const questao = await QuestaoTesteConhecimento.findByPk(id);

      if (!questao) {
        return res.status(404).json({
          success: false,
          error: 'Questão não encontrada'
        });
      }

      // Validações
      if (enunciado !== undefined && (!enunciado || !enunciado.trim())) {
        return res.status(400).json({
          success: false,
          error: 'Enunciado não pode ser vazio'
        });
      }

      if (opcoes !== undefined && (!Array.isArray(opcoes) || opcoes.length < 2)) {
        return res.status(400).json({
          success: false,
          error: 'Deve haver pelo menos 2 opções'
        });
      }

      if (dificuldade !== undefined && !['facil', 'medio', 'dificil'].includes(dificuldade)) {
        return res.status(400).json({
          success: false,
          error: 'Dificuldade inválida'
        });
      }

      if (categoria !== undefined && !['matematica', 'programacao', 'ingles', 'cultura_geral'].includes(categoria)) {
        return res.status(400).json({
          success: false,
          error: 'Categoria inválida'
        });
      }

      // Atualizar
      await questao.update({
        ...(enunciado !== undefined && { enunciado: enunciado.trim() }),
        ...(opcoes !== undefined && { opcoes }),
        ...(resposta_correta !== undefined && { resposta_correta: resposta_correta.trim() }),
        ...(dificuldade !== undefined && { dificuldade }),
        ...(categoria !== undefined && { categoria }),
        ...(pontos !== undefined && { pontos }),
        ...(ativo !== undefined && { ativo })
      });

      res.json({
        success: true,
        data: questao,
        message: 'Questão atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar questão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar questão'
      });
    }
  }

  // Deletar questão
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const questao = await QuestaoTesteConhecimento.findByPk(id);

      if (!questao) {
        return res.status(404).json({
          success: false,
          error: 'Questão não encontrada'
        });
      }

      await questao.destroy();

      res.json({
        success: true,
        message: 'Questão deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar questão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar questão'
      });
    }
  }

  // Buscar questões para o teste (usuário)
  async buscarParaTeste(req, res) {
    try {
      const { categoria, quantidade } = req.query;

      const where = {
        ativo: true
      };

      if (categoria) {
        where.categoria = categoria;
      }

      const limit = quantidade ? parseInt(quantidade) : undefined;

      const questoes = await QuestaoTesteConhecimento.findAll({
        where,
        order: sequelize.random(),
        limit,
        attributes: ['id', 'enunciado', 'opcoes', 'dificuldade', 'categoria', 'pontos']
      });

      res.json({
        success: true,
        data: questoes
      });
    } catch (error) {
      console.error('Erro ao buscar questões para teste:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar questões'
      });
    }
  }

  // Validar resposta
  async validarResposta(req, res) {
    try {
      const { id } = req.params;
      const { resposta } = req.body;

      const questao = await QuestaoTesteConhecimento.findByPk(id);

      if (!questao) {
        return res.status(404).json({
          success: false,
          error: 'Questão não encontrada'
        });
      }

      const correta = questao.resposta_correta.trim().toLowerCase() === resposta.trim().toLowerCase();

      res.json({
        success: true,
        data: {
          correta,
          pontos: correta ? questao.pontos : 0,
          resposta_correta: questao.resposta_correta
        }
      });
    } catch (error) {
      console.error('Erro ao validar resposta:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao validar resposta'
      });
    }
  }
}

export default new TesteConhecimentoController();
