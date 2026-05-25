/**
 * QuestoesController.js
 * Controller especializado para gerenciar questões de todas as modalidades
 * 
 * Responsabilidades:
 * - Validar entrada
 * - Chamar serviço de questões
 * - Tratar erros
 * - Retornar respostas formatadas
 * - Logging
 */

import questoesService from '../services/questoesService.js';

// ─── HELPERS ──────────────────────────────────────────────────────

/**
 * Formatar resposta de sucesso
 */
const respostaSucesso = (res, statusCode, dados, mensagem = '') => {
  res.status(statusCode).json({
    sucesso: true,
    mensagem,
    dados,
    timestamp: new Date().toISOString()
  });
};

/**
 * Formatar resposta de erro
 */
const respostaErro = (res, statusCode, mensagem, erros = null) => {
  res.status(statusCode).json({
    sucesso: false,
    mensagem,
    ...(erros && { erros }),
    timestamp: new Date().toISOString()
  });
};

// ─── CONTROLLER ───────────────────────────────────────────────────

export const QuestoesController = {
  /**
   * POST /api/questoes/:modalidade
   * Criar questão
   */
  criar: async (req, res) => {
    try {
      const { modalidade } = req.params;
      const dados = req.body;

      console.log(`📝 Criando questão de ${modalidade}:`, { titulo: dados.titulo, torneio_id: dados.torneio_id });

      // Validar modalidade
      if (!['matematica', 'ingles', 'programacao'].includes(modalidade)) {
        return respostaErro(res, 400, 'Modalidade inválida. Use: matematica, ingles, programacao');
      }

      // Chamar serviço
      const resultado = await questoesService.criar(modalidade, dados);
      respostaSucesso(res, 201, resultado.questao, resultado.mensagem);
    } catch (error) {
      console.error('❌ Erro ao criar questão:', error);

      // Erro de validação
      if (error.name === 'ValidationError') {
        return respostaErro(res, 422, 'Erro de validação', error.errors);
      }

      // Erro de constraint (ex: torneio não existe)
      if (error.message.includes('não encontrado')) {
        return respostaErro(res, 404, error.message);
      }

      // Erro genérico
      respostaErro(res, 500, 'Erro ao criar questão', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/:modalidade/:id
   * Obter questão por ID
   */
  obter: async (req, res) => {
    try {
      const { modalidade, id } = req.params;

      console.log(`🔍 Obtendo questão de ${modalidade} ID ${id}`);

      // Validar modalidade
      if (!['matematica', 'ingles', 'programacao'].includes(modalidade)) {
        return respostaErro(res, 400, 'Modalidade inválida. Use: matematica, ingles, programacao');
      }

      // Chamar serviço
      const questao = await questoesService.obter(modalidade, id);
      respostaSucesso(res, 200, questao, 'Questão obtida com sucesso');
    } catch (error) {
      console.error('❌ Erro ao obter questão:', error);

      if (error.message.includes('não encontrada')) {
        return respostaErro(res, 404, error.message);
      }

      respostaErro(res, 500, 'Erro ao obter questão', { detalhes: error.message });
    }
  },

  /**
   * PUT /api/questoes/:modalidade/:id
   * Atualizar questão
   */
  atualizar: async (req, res) => {
    try {
      const { modalidade, id } = req.params;
      const dados = req.body;

      console.log(`✏️ Atualizando questão de ${modalidade} ID ${id}`);

      // Validar modalidade
      if (!['matematica', 'ingles', 'programacao'].includes(modalidade)) {
        return respostaErro(res, 400, 'Modalidade inválida. Use: matematica, ingles, programacao');
      }

      // Chamar serviço
      const resultado = await questoesService.atualizar(modalidade, id, dados);
      respostaSucesso(res, 200, resultado.questao, resultado.mensagem);
    } catch (error) {
      console.error('❌ Erro ao atualizar questão:', error);

      // Erro de validação
      if (error.name === 'ValidationError') {
        return respostaErro(res, 422, 'Erro de validação', error.errors);
      }

      if (error.message.includes('não encontrada')) {
        return respostaErro(res, 404, error.message);
      }

      respostaErro(res, 500, 'Erro ao atualizar questão', { detalhes: error.message });
    }
  },

  /**
   * DELETE /api/questoes/:modalidade/:id
   * Deletar questão
   */
  deletar: async (req, res) => {
    try {
      const { modalidade, id } = req.params;

      console.log(`🗑️ Deletando questão de ${modalidade} ID ${id}`);

      // Validar modalidade
      if (!['matematica', 'ingles', 'programacao'].includes(modalidade)) {
        return respostaErro(res, 400, 'Modalidade inválida. Use: matematica, ingles, programacao');
      }

      // Chamar serviço
      const resultado = await questoesService.deletar(modalidade, id);
      respostaSucesso(res, 200, { torneioId: resultado.torneioId }, resultado.mensagem);
    } catch (error) {
      console.error('❌ Erro ao deletar questão:', error);

      if (error.message.includes('não encontrada')) {
        return respostaErro(res, 404, error.message);
      }

      respostaErro(res, 500, 'Erro ao deletar questão', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/torneio/:torneioId
   * Listar questões de um torneio
   */
  listarPorTorneio: async (req, res) => {
    try {
      const { torneioId } = req.params;
      const { modalidade, pagina = 1, limite = 20, busca = '', dificuldade } = req.query;

      console.log(`📋 Listando questões do torneio ${torneioId}`, { modalidade, pagina, busca });

      // Chamar serviço
      const resultado = await questoesService.listarPorTorneio(
        torneioId,
        modalidade || null,
        { pagina: parseInt(pagina), limite: parseInt(limite), busca, dificuldade }
      );

      respostaSucesso(res, 200, resultado.resultado, 'Questões listadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao listar questões:', error);

      if (error.message.includes('não encontrado')) {
        return respostaErro(res, 404, error.message);
      }

      respostaErro(res, 500, 'Erro ao listar questões', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/torneio/:torneioId/contar
   * Contar questões de um torneio
   */
  contarPorTorneio: async (req, res) => {
    try {
      const { torneioId } = req.params;

      console.log(`📊 Contando questões do torneio ${torneioId}`);

      // Chamar serviço
      const resultado = await questoesService.contarPorTorneio(torneioId);
      respostaSucesso(res, 200, resultado.contagem, 'Questões contadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao contar questões:', error);

      respostaErro(res, 500, 'Erro ao contar questões', { detalhes: error.message });
    }
  },

  /**
   * POST /api/questoes/:modalidade/:id/duplicar
   * Duplicar questão
   */
  duplicar: async (req, res) => {
    try {
      const { modalidade, id } = req.params;

      console.log(`📋 Duplicando questão de ${modalidade} ID ${id}`);

      // Validar modalidade
      if (!['matematica', 'ingles', 'programacao'].includes(modalidade)) {
        return respostaErro(res, 400, 'Modalidade inválida. Use: matematica, ingles, programacao');
      }

      // Chamar serviço
      const resultado = await questoesService.duplicar(modalidade, id);
      respostaSucesso(res, 201, resultado.questaoNova, resultado.mensagem);
    } catch (error) {
      console.error('❌ Erro ao duplicar questão:', error);

      if (error.message.includes('não encontrada')) {
        return respostaErro(res, 404, error.message);
      }

      respostaErro(res, 500, 'Erro ao duplicar questão', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/auditoria/orfas
   * Buscar questões órfãs (admin only)
   */
  buscarOrfas: async (req, res) => {
    try {
      console.log(`🔍 Buscando questões órfãs`);

      // Chamar serviço
      const resultado = await questoesService.buscarOrfas();
      respostaSucesso(res, 200, resultado.orfas, `${resultado.totalOrfas} questões órfãs encontradas`);
    } catch (error) {
      console.error('❌ Erro ao buscar questões órfãs:', error);

      respostaErro(res, 500, 'Erro ao buscar questões órfãs', { detalhes: error.message });
    }
  },

  /**
   * DELETE /api/questoes/auditoria/orfas
   * Deletar questões órfãs (admin only)
   */
  deletarOrfas: async (req, res) => {
    try {
      console.log(`🗑️ Deletando questões órfãs`);

      // Chamar serviço
      const resultado = await questoesService.deletarOrfas();
      respostaSucesso(res, 200, { totalDeletadas: resultado.totalDeletadas }, resultado.mensagem);
    } catch (error) {
      console.error('❌ Erro ao deletar questões órfãs:', error);

      respostaErro(res, 500, 'Erro ao deletar questões órfãs', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/auditoria/integridade
   * Validar integridade de questões (admin only)
   */
  validarIntegridade: async (req, res) => {
    try {
      console.log(`✅ Validando integridade de questões`);

      // Chamar serviço
      const resultado = await questoesService.validarIntegridade();
      respostaSucesso(res, 200, resultado.relatorio, 'Integridade validada');
    } catch (error) {
      console.error('❌ Erro ao validar integridade:', error);

      respostaErro(res, 500, 'Erro ao validar integridade', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/quiz/:area
   * Carregar questões para quiz (NOVO - Fase 3)
   * Substitui as rotas legadas: GET /perguntas/:area e GET /api/quiz/:area
   */
  carregarQuiz: async (req, res) => {
    try {
      const { area } = req.params;
      const { limit = 10 } = req.query;

      console.log(`🎯 Carregando questões para quiz - Área: ${area}, Limite: ${limit}`);

      // Mapear área
      const areaMap = {
        'matematica': 'matematica',
        'ingles': 'ingles',
        'programacao': 'programacao',
        'cultura-geral': 'multipla_escolha',
        'cultura_geral': 'multipla_escolha',
        'culturaGeral': 'multipla_escolha'
      };

      const tipo = areaMap[area?.toLowerCase()];
      if (!tipo) {
        return respostaErro(res, 400, 'Área inválida. Use: matematica, ingles, programacao ou cultura-geral');
      }

      // Chamar serviço
      const resultado = await questoesService.carregarQuiz(tipo, Math.min(parseInt(limit), 20));
      
      // Formatar resposta compatível com frontend
      res.json({
        success: true,
        area: tipo,
        total: resultado.questoes.length,
        data: resultado.questoes
      });
    } catch (error) {
      console.error('❌ Erro ao carregar quiz:', error);

      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao carregar questões para quiz'
      });
    }
  }
};

export default QuestoesController;
