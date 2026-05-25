/**
 * QuestoesControllerRefactored.js
 * Controller refatorado para gerenciar questões usando modelo único Questao.js
 * 
 * Endpoints:
 * POST   /api/questoes                          - Criar questão (NOVO - Modelo único)
 * GET    /api/questoes/:id                      - Obter questão
 * PUT    /api/questoes/:id                      - Atualizar questão
 * DELETE /api/questoes/:id                      - Deletar questão
 * GET    /api/questoes/torneio/:torneioId       - Listar questões do torneio
 * GET    /api/questoes/quiz/:area               - Carregar questões para quiz
 */

import Questao from '../models/Questao.js';
import Torneio from '../models/Torneio.js';
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

// ─── VALIDAÇÕES ───────────────────────────────────────────────────

const validarQuestao = (dados) => {
  const erros = [];

  if (!dados.torneio_id) erros.push('torneio_id é obrigatório');
  if (!dados.titulo) erros.push('titulo é obrigatório');
  if (!dados.descricao) erros.push('descricao é obrigatória');
  if (!dados.disciplina) erros.push('disciplina é obrigatória');
  if (!dados.tipo) erros.push('tipo é obrigatório');
  if (!dados.dificuldade) erros.push('dificuldade é obrigatória');
  if (!dados.resposta_correta) erros.push('resposta_correta é obrigatória');

  // Validar valores de enum
  const disciplinasValidas = ['matematica', 'ingles', 'programacao'];
  if (dados.disciplina && !disciplinasValidas.includes(dados.disciplina)) {
    erros.push(`disciplina deve ser uma de: ${disciplinasValidas.join(', ')}`);
  }

  const tiposValidos = ['multipla_escolha', 'texto', 'codigo'];
  if (dados.tipo && !tiposValidos.includes(dados.tipo)) {
    erros.push(`tipo deve ser um de: ${tiposValidos.join(', ')}`);
  }

  const dificuldadesValidas = ['facil', 'medio', 'dificil'];
  if (dados.dificuldade && !dificuldadesValidas.includes(dados.dificuldade)) {
    erros.push(`dificuldade deve ser uma de: ${dificuldadesValidas.join(', ')}`);
  }

  return erros;
};

// ─── CONTROLLER ───────────────────────────────────────────────────

export const QuestoesControllerRefactored = {
  /**
   * POST /api/questoes
   * Criar questão (NOVO - Modelo único Questao.js)
   */
  criar: async (req, res) => {
    try {
      const dados = req.body;

      console.log(`📝 Criando questão:`, { 
        titulo: dados.titulo, 
        disciplina: dados.disciplina,
        torneio_id: dados.torneio_id 
      });

      // Validar dados
      const erros = validarQuestao(dados);
      if (erros.length > 0) {
        return respostaErro(res, 422, 'Erro de validação', erros);
      }

      // Verificar se torneio existe
      const torneio = await Torneio.findByPk(dados.torneio_id);
      if (!torneio) {
        return respostaErro(res, 404, `Torneio com ID ${dados.torneio_id} não encontrado`);
      }

      // Criar questão
      const questao = await Questao.create({
        torneio_id: dados.torneio_id,
        titulo: dados.titulo,
        descricao: dados.descricao,
        disciplina: dados.disciplina,
        tipo: dados.tipo,
        dificuldade: dados.dificuldade,
        opcoes: dados.opcoes || null,
        resposta_correta: dados.resposta_correta,
        explicacao: dados.explicacao || null,
        pontos: dados.pontos || 10,
        linguagem: dados.linguagem || null,
        midia: dados.midia || null
      });

      console.log(`✅ Questão criada com sucesso - ID: ${questao.id}`);

      respostaSucesso(res, 201, questao, 'Questão criada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar questão:', error);
      respostaErro(res, 500, 'Erro ao criar questão', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/:id
   * Obter questão por ID
   */
  obter: async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`🔍 Obtendo questão ID ${id}`);

      const questao = await Questao.findByPk(id);
      if (!questao) {
        return respostaErro(res, 404, `Questão com ID ${id} não encontrada`);
      }

      respostaSucesso(res, 200, questao, 'Questão obtida com sucesso');
    } catch (error) {
      console.error('❌ Erro ao obter questão:', error);
      respostaErro(res, 500, 'Erro ao obter questão', { detalhes: error.message });
    }
  },

  /**
   * PUT /api/questoes/:id
   * Atualizar questão
   */
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const dados = req.body;

      console.log(`✏️ Atualizando questão ID ${id}`);

      const questao = await Questao.findByPk(id);
      if (!questao) {
        return respostaErro(res, 404, `Questão com ID ${id} não encontrada`);
      }

      // Se mudar torneio, verificar se existe
      if (dados.torneio_id && dados.torneio_id !== questao.torneio_id) {
        const torneio = await Torneio.findByPk(dados.torneio_id);
        if (!torneio) {
          return respostaErro(res, 404, `Torneio com ID ${dados.torneio_id} não encontrado`);
        }
      }

      // Atualizar apenas campos fornecidos
      const camposAtualizaveis = [
        'titulo', 'descricao', 'disciplina', 'tipo', 'dificuldade',
        'opcoes', 'resposta_correta', 'explicacao', 'pontos', 'linguagem', 'midia', 'torneio_id'
      ];

      for (const campo of camposAtualizaveis) {
        if (dados[campo] !== undefined) {
          questao[campo] = dados[campo];
        }
      }

      await questao.save();

      console.log(`✅ Questão atualizada com sucesso - ID: ${questao.id}`);

      respostaSucesso(res, 200, questao, 'Questão atualizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar questão:', error);
      respostaErro(res, 500, 'Erro ao atualizar questão', { detalhes: error.message });
    }
  },

  /**
   * DELETE /api/questoes/:id
   * Deletar questão
   */
  deletar: async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`🗑️ Deletando questão ID ${id}`);

      const questao = await Questao.findByPk(id);
      if (!questao) {
        return respostaErro(res, 404, `Questão com ID ${id} não encontrada`);
      }

      const torneioId = questao.torneio_id;
      await questao.destroy();

      console.log(`✅ Questão deletada com sucesso - ID: ${id}`);

      respostaSucesso(res, 200, { torneioId }, 'Questão deletada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar questão:', error);
      respostaErro(res, 500, 'Erro ao deletar questão', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/torneio/:torneioId
   * Listar questões de um torneio com filtros
   */
  listarPorTorneio: async (req, res) => {
    try {
      const { torneioId } = req.params;
      const { disciplina, tipo, dificuldade, pagina = 1, limite = 20, busca = '' } = req.query;

      console.log(`📋 Listando questões do torneio ${torneioId}`, { 
        disciplina, 
        tipo, 
        dificuldade, 
        pagina, 
        busca 
      });

      // Verificar se torneio existe
      const torneio = await Torneio.findByPk(torneioId);
      if (!torneio) {
        return respostaErro(res, 404, `Torneio com ID ${torneioId} não encontrado`);
      }

      // Construir filtros
      const where = { torneio_id: torneioId };

      if (disciplina) {
        where.disciplina = disciplina;
      }

      if (tipo) {
        where.tipo = tipo;
      }

      if (dificuldade) {
        where.dificuldade = dificuldade;
      }

      if (busca) {
        where[Op.or] = [
          { titulo: { [Op.like]: `%${busca}%` } },
          { descricao: { [Op.like]: `%${busca}%` } }
        ];
      }

      // Paginar
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const { count, rows } = await Questao.findAndCountAll({
        where,
        limit: parseInt(limite),
        offset,
        order: [['created_at', 'DESC']]
      });

      console.log(`✅ ${rows.length} questões encontradas`);

      respostaSucesso(res, 200, {
        questoes: rows,
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(count / parseInt(limite))
      }, 'Questões listadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao listar questões:', error);
      respostaErro(res, 500, 'Erro ao listar questões', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/quiz/:area
   * Carregar questões para quiz
   */
  carregarQuiz: async (req, res) => {
    try {
      const { area } = req.params;
      const { limit = 10 } = req.query;

      console.log(`🎯 Carregando questões para quiz - Área: ${area}, Limite: ${limit}`);

      // Mapear área para tipo (tabela perguntas usa 'tipo' não 'disciplina')
      const areaMap = {
        'matematica': 'matematica',
        'ingles': 'ingles',
        'programacao': 'programacao'
      };

      const tipo = areaMap[area?.toLowerCase()];
      if (!tipo) {
        return respostaErro(res, 400, 'Área inválida. Use: matematica, ingles ou programacao');
      }

      // CORREÇÃO: Buscar da tabela 'perguntas' (tabela legada onde as questões realmente estão)
      const questoes = await Questao.sequelize.query(
        `SELECT * FROM perguntas WHERE tipo = :tipo ORDER BY RAND() LIMIT :limite`,
        {
          replacements: { tipo, limite: Math.min(parseInt(limit), 20) },
          type: Questao.sequelize.QueryTypes.SELECT
        }
      );

      console.log(`✅ ${questoes.length} questões carregadas para quiz`);

      // Formatar resposta compatível com frontend (formato esperado pelo Teste.jsx)
      const questoesFormatadas = questoes.map(q => ({
        id: q.id,
        texto_pergunta: q.texto_pergunta,
        opcao_a: q.opcao_a,
        opcao_b: q.opcao_b,
        opcao_c: q.opcao_c,
        opcao_d: q.opcao_d,
        resposta_correta: q.resposta_correta,
        pontos: q.pontos || 10,
        tipo: q.tipo
      }));

      res.json({
        success: true,
        area: tipo,
        total: questoesFormatadas.length,
        data: questoesFormatadas
      });
    } catch (error) {
      console.error('❌ Erro ao carregar quiz:', error);

      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao carregar questões para quiz'
      });
    }
  },

  /**
   * GET /api/questoes
   * Listar todas as questões (com paginação)
   */
  listarTodas: async (req, res) => {
    try {
      const { pagina = 1, limite = 20, disciplina, tipo, dificuldade } = req.query;

      console.log(`📋 Listando todas as questões`, { pagina, limite, disciplina, tipo, dificuldade });

      const where = {};

      if (disciplina) where.disciplina = disciplina;
      if (tipo) where.tipo = tipo;
      if (dificuldade) where.dificuldade = dificuldade;

      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const { count, rows } = await Questao.findAndCountAll({
        where,
        limit: parseInt(limite),
        offset,
        order: [['created_at', 'DESC']]
      });

      respostaSucesso(res, 200, {
        questoes: rows,
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(count / parseInt(limite))
      }, 'Questões listadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao listar questões:', error);
      respostaErro(res, 500, 'Erro ao listar questões', { detalhes: error.message });
    }
  }
};

export default QuestoesControllerRefactored;
