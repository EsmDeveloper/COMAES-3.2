/**
 * ColaboradorController.js
 * Controller específico para funcionalidades de colaboradores
 */

import Questao from '../models/Questao.js';
import Usuario from '../models/User.js';
import { Op } from 'sequelize';

// ─── HELPERS ──────────────────────────────────────────────────────

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

// ─── CONTROLLER ───────────────────────────────────────────────────

export const ColaboradorController = {
  /**
   * GET /api/colaborador/estatisticas
   * Retorna estatísticas específicas do colaborador logado
   */
  estatisticas: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado. Apenas colaboradores podem acessar este endpoint.');
      }

      // Verificar status do colaborador
      if (req.user.status_colaborador !== 'aprovado') {
        return respostaErro(res, 403, 'Colaborador não aprovado.');
      }

      const where = {
        autor_id: req.user.id,
        disciplina: req.user.disciplina_colaborador
      };

      // Buscar questões do colaborador
      const questoes = await Questao.findAll({ where });
      
      // Calcular estatísticas
      const total = questoes.length;
      const aprovadas = questoes.filter(q => q.status_aprovacao === 'aprovada').length;
      const pendentes = questoes.filter(q => q.status_aprovacao === 'pendente').length;
      const rejeitadas = questoes.filter(q => q.status_aprovacao === 'rejeitada').length;
      
      // Por dificuldade
      const facil = questoes.filter(q => q.dificuldade === 'facil').length;
      const medio = questoes.filter(q => q.dificuldade === 'medio').length;
      const dificil = questoes.filter(q => q.dificuldade === 'dificil').length;
      
      // Por tipo
      const multiplaEscolha = questoes.filter(q => q.tipo === 'multipla_escolha').length;
      const texto = questoes.filter(q => q.tipo === 'texto').length;
      const codigo = questoes.filter(q => q.tipo === 'codigo').length;
      
      // Últimas 5 questões
      const ultimasQuestoes = questoes
        .slice(-5)
        .map(q => ({
          id: q.id,
          titulo: q.titulo,
          descricao: q.descricao,
          dificuldade: q.dificuldade,
          pontos: q.pontos,
          status_aprovacao: q.status_aprovacao,
          createdAt: q.createdAt
        }))
        .reverse();

      respostaSucesso(res, 200, {
        total,
        aprovadas,
        pendentes,
        rejeitadas,
        porDificuldade: { facil, medio, dificil },
        porTipo: { multipla_escolha: multiplaEscolha, texto, codigo },
        ultimasQuestoes,
        taxaAprovacao: total > 0 ? Math.round((aprovadas / total) * 100) : 0,
        taxaRejeicao: total > 0 ? Math.round((rejeitadas / total) * 100) : 0,
        mediaPontos: total > 0 ? Math.round(questoes.reduce((sum, q) => sum + q.pontos, 0) / total) : 0,
        perfil: {
          disciplina: req.user.disciplina_colaborador,
          nome: req.user.nome,
          email: req.user.email,
          dataCadastro: req.user.createdAt
        }
      }, 'Estatísticas do colaborador obtidas com sucesso');
    } catch (error) {
      console.error('Erro ao obter estatísticas do colaborador:', error);
      respostaErro(res, 500, 'Erro ao obter estatísticas', { detalhes: error.message });
    }
  },

  /**
   * GET /api/colaborador/questoes
   * Retorna questões do colaborador com opções de filtro
   */
  minhasQuestoes: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado. Apenas colaboradores podem acessar este endpoint.');
      }

      // Verificar status do colaborador
      if (req.user.status_colaborador !== 'aprovado') {
        return respostaErro(res, 403, 'Colaborador não aprovado.');
      }

      const {
        status_aprovacao,
        dificuldade,
        tipo,
        pagina = 1,
        limite = 20,
        busca = ''
      } = req.query;

      const where = {
        autor_id: req.user.id,
        disciplina: req.user.disciplina_colaborador
      };

      // Aplicar filtros
      if (status_aprovacao) {
        where.status_aprovacao = status_aprovacao;
      }
      
      if (dificuldade) {
        where.dificuldade = dificuldade;
      }
      
      if (tipo) {
        where.tipo = tipo;
      }

      // Busca por título ou descrição
      if (busca) {
        where[Op.or] = [
          { titulo: { [Op.like]: `%${busca}%` } },
          { descricao: { [Op.like]: `%${busca}%` } }
        ];
      }

      const offset = (pagina - 1) * limite;
      const { count, rows } = await Questao.findAndCountAll({
        where,
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      // Calcular estatísticas para os filtros atuais
      const totalFiltrado = rows.length;
      const aprovadasFiltrado = rows.filter(q => q.status_aprovacao === 'aprovada').length;
      const pendentesFiltrado = rows.filter(q => q.status_aprovacao === 'pendente').length;
      const rejeitadasFiltrado = rows.filter(q => q.status_aprovacao === 'rejeitada').length;

      respostaSucesso(res, 200, {
        questoes: rows,
        paginacao: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total: count,
          totalPaginas: Math.ceil(count / limite)
        },
        estatisticas: {
          total: totalFiltrado,
          aprovadas: aprovadasFiltrado,
          pendentes: pendentesFiltrado,
          rejeitadas: rejeitadasFiltrado
        }
      }, 'Questões do colaborador obtidas com sucesso');
    } catch (error) {
      console.error('Erro ao obter questões do colaborador:', error);
      respostaErro(res, 500, 'Erro ao obter questões', { detalhes: error.message });
    }
  },

  /**
   * GET /api/colaborador/perfil
   * Retorna informações do perfil do colaborador
   */
  perfil: async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'colaborador') {
        return respostaErro(res, 403, 'Acesso negado. Apenas colaboradores podem acessar este endpoint.');
      }

      // Verificar status do colaborador
      if (req.user.status_colaborador !== 'aprovado') {
        return respostaErro(res, 403, 'Colaborador não aprovado.');
      }

      // Buscar usuário no banco para obter dados completos
      const usuario = await Usuario.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!usuario) {
        return respostaErro(res, 404, 'Usuário não encontrado.');
      }

      // Buscar estatísticas básicas
      const questoes = await Questao.count({
        where: {
          autor_id: req.user.id,
          disciplina: req.user.disciplina_colaborador
        }
      });

      const questoesAprovadas = await Questao.count({
        where: {
          autor_id: req.user.id,
          disciplina: req.user.disciplina_colaborador,
          status_aprovacao: 'aprovada'
        }
      });

      respostaSucesso(res, 200, {
        perfil: usuario.get({ plain: true }),
        estatisticas: {
          totalQuestoes: questoes,
          questoesAprovadas,
          taxaAprovacao: questoes > 0 ? Math.round((questoesAprovadas / questoes) * 100) : 0,
          disciplina: req.user.disciplina_colaborador,
          dataAprovacao: usuario.updatedAt // Supondo que updatedAt é quando foi aprovado
        }
      }, 'Perfil do colaborador obtido com sucesso');
    } catch (error) {
      console.error('Erro ao obter perfil do colaborador:', error);
      respostaErro(res, 500, 'Erro ao obter perfil', { detalhes: error.message });
    }
  }
};

export default ColaboradorController;