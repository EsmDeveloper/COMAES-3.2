/**
 * ColaboradorBlocosController.js
 * Endpoints para colaborador criar e gerenciar blocos de questões
 * Fluxo: Colaborador cria bloco → Status 'rascunho' → Admin aprova/rejeita → Status 'publicado'
 */

import BlocoQuestoes from '../models/BlocoQuestoes.js';
import BlocoQuestaoItem from '../models/BlocoQuestaoItem.js';
import Questao from '../models/Questao.js';
import Usuario from '../models/User.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

const respostaSucesso = (res, statusCode, dados, mensagem = '') => {
  res.status(statusCode).json({
    sucesso: true,
    mensagem,
    dados,
    timestamp: new Date().toISOString()
  });
};

const respostaErro = (res, statusCode, mensagem, erros = null) => {
  res.status(statusCode).json({
    sucesso: false,
    mensagem,
    ...(erros && { erros }),
    timestamp: new Date().toISOString()
  });
};

export const ColaboradorBlocosController = {

  /**
   * POST /api/colaborador/blocos
   * Criar um novo bloco de questões (status: 'rascunho')
   */
  criarBloco: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado. Apenas colaboradores podem criar blocos.');
      }

      if (req.user.status_colaborador !== 'aprovado') {
        return respostaErro(res, 403, 'Colaborador não aprovado.');
      }

      const { titulo, descricao, dificuldade } = req.body;

      // Validações
      if (!titulo || !titulo.trim()) {
        return respostaErro(res, 400, 'Título é obrigatório');
      }

      if (!['facil', 'medio', 'dificil'].includes(dificuldade)) {
        return respostaErro(res, 400, 'Dificuldade inválida. Use: facil, medio, dificil');
      }

      // Bloco do colaborador sempre é da sua disciplina
      const disciplina = req.user.disciplina_colaborador;
      if (!disciplina) {
        return respostaErro(res, 400, 'Colaborador sem disciplina definida');
      }

      const novoBloco = await BlocoQuestoes.create({
        titulo: titulo.trim(),
        descricao: descricao?.trim() || null,
        disciplina,
        dificuldade,
        criado_por: req.user.id,
        status_aprovacao: 'pendente', // Novos blocos do colaborador começam pendentes
        contexto: 'torneio',
        versao: 1
      });

      console.log(`✅ Bloco criado por colaborador ${req.user.email}:`, {
        id: novoBloco.id,
        titulo: novoBloco.titulo,
        disciplina: novoBloco.disciplina
      });

      respostaSucesso(res, 201, {
        id: novoBloco.id,
        titulo: novoBloco.titulo,
        disciplina: novoBloco.disciplina,
        dificuldade: novoBloco.dificuldade,
        status_aprovacao: novoBloco.status_aprovacao,
        questoes: []
      }, 'Bloco criado com sucesso! Agora adicione questões ao bloco.');

    } catch (error) {
      console.error('❌ Erro ao criar bloco do colaborador:', error);
      respostaErro(res, 500, 'Erro ao criar bloco', { detalhes: error.message });
    }
  },

  /**
   * GET /api/colaborador/blocos
   * Listar blocos do colaborador
   */
  listarBlocos: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado.');
      }

      if (req.user.status_colaborador !== 'aprovado') {
        return respostaErro(res, 403, 'Colaborador não aprovado.');
      }

      const { status, pagina = 1, limite = 20 } = req.query;

      const where = {
        criado_por: req.user.id,
        disciplina: req.user.disciplina_colaborador
      };

      if (status) {
        where.status_aprovacao = status;
      }

      const offset = (pagina - 1) * limite;
      const { count, rows } = await BlocoQuestoes.findAndCountAll({
        where,
        include: [
          {
            model: BlocoQuestaoItem,
            as: 'itens',
            attributes: ['id', 'questao_id', 'ordem'],
            include: [
              {
                model: Questao,
                as: 'questao',
                attributes: ['id', 'titulo', 'enunciado', 'dificuldade', 'pontos']
              }
            ]
          },
          {
            model: Usuario,
            as: 'criador',
            attributes: ['id', 'nome', 'email']
          }
        ],
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [['id', 'DESC']]
      });

      const blocos = rows.map(bloco => ({
        ...bloco.get({ plain: true }),
        total_questoes: bloco.itens?.length || 0
      }));

      respostaSucesso(res, 200, {
        blocos,
        paginacao: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total: count,
          totalPaginas: Math.ceil(count / limite)
        }
      }, 'Blocos listados com sucesso');

    } catch (error) {
      console.error('❌ Erro ao listar blocos do colaborador:', error);
      respostaErro(res, 500, 'Erro ao listar blocos', { detalhes: error.message });
    }
  },

  /**
   * GET /api/colaborador/blocos/:id
   * Obter detalhes de um bloco com suas questões
   */
  obterBloco: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado.');
      }

      const { id } = req.params;

      const bloco = await BlocoQuestoes.findOne({
        where: {
          id,
          criado_por: req.user.id
        },
        include: [
          {
            model: BlocoQuestaoItem,
            as: 'itens',
            attributes: ['id', 'questao_id', 'ordem'],
            include: [
              {
                model: Questao,
                as: 'questao',
                attributes: ['id', 'titulo', 'enunciado', 'dificuldade', 'pontos', 'opcoes']
              }
            ]
          }
        ]
      });

      if (!bloco) {
        return respostaErro(res, 404, 'Bloco não encontrado ou não tem permissão');
      }

      const blocoData = bloco.get({ plain: true });
      blocoData.total_questoes = bloco.itens?.length || 0;

      respostaSucesso(res, 200, blocoData, 'Bloco obtido com sucesso');

    } catch (error) {
      console.error('❌ Erro ao obter bloco do colaborador:', error);
      respostaErro(res, 500, 'Erro ao obter bloco', { detalhes: error.message });
    }
  },

  /**
   * PUT /api/colaborador/blocos/:id
   * Editar bloco (apenas rascunho ou rejeitado)
   */
  editarBloco: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado.');
      }

      const { id } = req.params;
      const { titulo, descricao, dificuldade } = req.body;

      const bloco = await BlocoQuestoes.findOne({
        where: {
          id,
          criado_por: req.user.id
        }
      });

      if (!bloco) {
        return respostaErro(res, 404, 'Bloco não encontrado');
      }

      // Apenas pode editar se estiver rascunho ou rejeitado
      if (!['rascunho', 'rejeitado'].includes(bloco.status_aprovacao)) {
        return respostaErro(res, 400, `Não pode editar bloco com status '${bloco.status_aprovacao}'`);
      }

      if (titulo) bloco.titulo = titulo.trim();
      if (descricao !== undefined) bloco.descricao = descricao?.trim() || null;
      if (dificuldade) {
        if (!['facil', 'medio', 'dificil'].includes(dificuldade)) {
          return respostaErro(res, 400, 'Dificuldade inválida');
        }
        bloco.dificuldade = dificuldade;
      }

      await bloco.save();

      console.log(`✅ Bloco editado por colaborador ${req.user.email}:`, {
        id: bloco.id,
        titulo: bloco.titulo
      });

      respostaSucesso(res, 200, bloco.get({ plain: true }), 'Bloco atualizado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao editar bloco do colaborador:', error);
      respostaErro(res, 500, 'Erro ao editar bloco', { detalhes: error.message });
    }
  },

  /**
   * DELETE /api/colaborador/blocos/:id
   * Deletar bloco (apenas rascunho)
   */
  deletarBloco: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado.');
      }

      const { id } = req.params;

      const bloco = await BlocoQuestoes.findOne({
        where: {
          id,
          criado_por: req.user.id
        }
      });

      if (!bloco) {
        return respostaErro(res, 404, 'Bloco não encontrado');
      }

      if (bloco.status_aprovacao !== 'rascunho') {
        return respostaErro(res, 400, `Não pode deletar bloco com status '${bloco.status_aprovacao}'`);
      }

      // Deletar itens do bloco
      await BlocoQuestaoItem.destroy({
        where: { bloco_id: id }
      });

      await bloco.destroy();

      console.log(`✅ Bloco deletado por colaborador ${req.user.email}: ${id}`);

      respostaSucesso(res, 200, {}, 'Bloco deletado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao deletar bloco do colaborador:', error);
      respostaErro(res, 500, 'Erro ao deletar bloco', { detalhes: error.message });
    }
  },

  /**
   * POST /api/colaborador/blocos/:id/questoes
   * Adicionar uma questão ao bloco
   */
  adicionarQuestao: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado.');
      }

      const { id } = req.params;
      const { questao_id, ordem } = req.body;

      if (!questao_id) {
        return respostaErro(res, 400, 'questao_id é obrigatório');
      }

      // Verificar que o bloco pertence ao colaborador
      const bloco = await BlocoQuestoes.findOne({
        where: {
          id,
          criado_por: req.user.id
        }
      });

      if (!bloco) {
        return respostaErro(res, 404, 'Bloco não encontrado');
      }

      // Verificar que a questão pertence ao colaborador
      const questao = await Questao.findOne({
        where: {
          id: questao_id,
          autor_id: req.user.id,
          status_aprovacao: 'aprovada' // Apenas questões aprovadas
        }
      });

      if (!questao) {
        return respostaErro(res, 404, 'Questão não encontrada ou não aprovada');
      }

      // Verificar máximo de questões
      const totalQuestoes = await BlocoQuestaoItem.count({
        where: { bloco_id: id }
      });

      if (totalQuestoes >= 30) {
        return respostaErro(res, 400, 'Máximo de 30 questões por bloco');
      }

      // Verificar se já existe
      const existe = await BlocoQuestaoItem.findOne({
        where: { bloco_id: id, questao_id }
      });

      if (existe) {
        return respostaErro(res, 400, 'Questão já está neste bloco');
      }

      // Calcular ordem
      const proximaOrdem = ordem || (totalQuestoes + 1);

      const item = await BlocoQuestaoItem.create({
        bloco_id: id,
        questao_id,
        ordem: proximaOrdem
      });

      console.log(`✅ Questão ${questao_id} adicionada ao bloco ${id}`);

      respostaSucesso(res, 201, item.get({ plain: true }), 'Questão adicionada com sucesso');

    } catch (error) {
      console.error('❌ Erro ao adicionar questão ao bloco:', error);
      respostaErro(res, 500, 'Erro ao adicionar questão', { detalhes: error.message });
    }
  },

  /**
   * DELETE /api/colaborador/blocos/:id/questoes/:qid
   * Remover uma questão do bloco
   */
  removerQuestao: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado.');
      }

      const { id, qid } = req.params;

      // Verificar que o bloco pertence ao colaborador
      const bloco = await BlocoQuestoes.findOne({
        where: {
          id,
          criado_por: req.user.id
        }
      });

      if (!bloco) {
        return respostaErro(res, 404, 'Bloco não encontrado');
      }

      const deleted = await BlocoQuestaoItem.destroy({
        where: {
          bloco_id: id,
          questao_id: qid
        }
      });

      if (!deleted) {
        return respostaErro(res, 404, 'Questão não encontrada neste bloco');
      }

      console.log(`✅ Questão ${qid} removida do bloco ${id}`);

      respostaSucesso(res, 200, {}, 'Questão removida com sucesso');

    } catch (error) {
      console.error('❌ Erro ao remover questão do bloco:', error);
      respostaErro(res, 500, 'Erro ao remover questão', { detalhes: error.message });
    }
  }
};

export default ColaboradorBlocosController;
