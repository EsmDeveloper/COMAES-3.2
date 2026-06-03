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
import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';
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

const aplicarEscopoColaborador = (req, where = {}) => {
  // Suporta tanto isColaborador (definido por canManageQuestoes) como role direto do JWT
  if (req.user?.isColaborador || req.user?.role === 'colaborador') {
    where.disciplina = req.user.disciplina_colaborador;
    // Colaborador só vê suas próprias questões
    where.autor_id = req.user.id;
  }
  return where;
};

const aplicarFiltroStatus = (req, where = {}) => {
  // Se for rota pública ou para estudantes, mostrar apenas aprovadas
  const isColaborador = req.user?.isColaborador || req.user?.role === 'colaborador';
  const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';
  if (!req.user || (!isAdmin && !isColaborador)) {
    where.status_aprovacao = 'aprovada';
  }
  // Admin e colaborador podem ver todos os status
  return where;
};

const validarAcessoQuestao = (req, questao) => {
  const isColaborador = req.user?.isColaborador || req.user?.role === 'colaborador';
  if (!isColaborador) return true;
  // Colaborador só pode acessar questões da sua disciplina E que sejam dele
  return questao?.disciplina === req.user.disciplina_colaborador && 
         questao?.autor_id === req.user.id;
};

// ─── CONTROLLER ───────────────────────────────────────────────────

export const QuestoesControllerRefactored = {
  /**
   * POST /api/questoes
   * Criar questão (NOVO - Modelo único Questao.js)
   */
  criar: async (req, res) => {
    try {
      const dados = { ...req.body };

      if (req.user?.isColaborador || req.user?.role === 'colaborador') {
        dados.disciplina = req.user.disciplina_colaborador;
        dados.status_aprovacao = 'pendente';
      }

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
      if (dados.torneio_id) {
        const torneio = await Torneio.findByPk(dados.torneio_id);
        if (!torneio) {
          return respostaErro(res, 404, `Torneio com ID ${dados.torneio_id} não encontrado`);
        }
      }

      // ── Verificar duplicado: mesma descricao + disciplina + dificuldade ──
      const descricaoNorm = dados.descricao.trim().toLowerCase();
      const candidatas = await Questao.findAll({
        where: { disciplina: dados.disciplina, dificuldade: dados.dificuldade },
        attributes: ['id', 'descricao'],
      });
      const duplicado = candidatas.find(
        q => (q.descricao || '').trim().toLowerCase() === descricaoNorm
      );
      if (duplicado) {
        return respostaErro(res, 409,
          `Já existe uma questão com essa descrição em "${dados.disciplina}" nível "${dados.dificuldade}". Altere o texto da pergunta.`
        );
      }

      // Criar questão
      const questao = await Questao.create({
        torneio_id: dados.torneio_id || null,
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
        midia: dados.midia || null,
        autor_id: req.user?.id || null,
        status_aprovacao: dados.status_aprovacao || 'aprovada'
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
      if (!validarAcessoQuestao(req, questao)) {
        return respostaErro(res, 403, 'Colaborador so pode acessar questoes da sua disciplina');
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
      const dados = { ...req.body };

      console.log(`✏️ Atualizando questão ID ${id}`);

      const questao = await Questao.findByPk(id);
      if (!questao) {
        return respostaErro(res, 404, `Questão com ID ${id} não encontrada`);
      }
      if (!validarAcessoQuestao(req, questao)) {
        return respostaErro(res, 403, 'Colaborador só pode atualizar questões da sua disciplina e que sejam suas');
      }
      
      // Regras específicas para colaborador
      if (req.user?.isColaborador) {
        // 1. Colaborador não pode mudar disciplina
        delete dados.disciplina;
        
        // 2. Verificar se pode editar baseado no status atual
        const statusAtual = questao.status_aprovacao;
        const statusAprovado = 'aprovada';
        
        if (statusAtual === statusAprovado) {
          // Questão aprovada: colaborador pode editar mas força nova revisão
          console.log(`📝 Colaborador editando questão aprovada (ID: ${id}). Status voltará para "pendente".`);
          dados.status_aprovacao = 'pendente';
        } else {
          // Questão pendente ou rejeitada: mantém status pendente
          dados.status_aprovacao = 'pendente';
        }
        
        // 3. Limpar campos de revisão anterior
        dados.revisado_por = null;
        dados.revisado_em = null;
        dados.motivo_rejeicao = null;
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
        'opcoes', 'resposta_correta', 'explicacao', 'pontos', 'linguagem', 'midia', 'torneio_id',
        'status_aprovacao', 'revisado_por', 'revisado_em', 'motivo_rejeicao'
      ];

      // ── Verificar duplicado ao actualizar descricao, disciplina ou dificuldade ──
      const novaDescricao = dados.descricao !== undefined ? dados.descricao : questao.descricao;
      const novaDisciplina = dados.disciplina !== undefined ? dados.disciplina : questao.disciplina;
      const novaDificuldade = dados.dificuldade !== undefined ? dados.dificuldade : questao.dificuldade;
      const descNorm = novaDescricao.trim().toLowerCase();

      const candidatas = await Questao.findAll({
        where: { disciplina: novaDisciplina, dificuldade: novaDificuldade },
        attributes: ['id', 'descricao'],
      });
      const duplicado = candidatas.find(
        q => q.id !== questao.id && (q.descricao || '').trim().toLowerCase() === descNorm
      );
      if (duplicado) {
        return respostaErro(res, 409,
          `Já existe outra questão com essa descrição em "${novaDisciplina}" nível "${novaDificuldade}". Altere o texto da pergunta.`
        );
      }

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
      if (!validarAcessoQuestao(req, questao)) {
        return respostaErro(res, 403, 'Colaborador só pode deletar questões da sua disciplina e que sejam suas');
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
      const { disciplina, tipo, dificuldade, pagina = 1, limite = 20, busca = '', status_aprovacao } = req.query;

      console.log(`📋 Listando questões do torneio ${torneioId}`, { 
        disciplina, 
        tipo, 
        dificuldade, 
        pagina, 
        busca,
        status_aprovacao
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
      aplicarEscopoColaborador(req, where);
      aplicarFiltroStatus(req, where);

      if (tipo) {
        where.tipo = tipo;
      }

      if (dificuldade) {
        where.dificuldade = dificuldade;
      }

      if (status_aprovacao) {
        where.status_aprovacao = status_aprovacao;
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
   * Carregar questões para quiz a partir de questoes_teste_conhecimento
   */
  carregarQuiz: async (req, res) => {
    try {
      const { area } = req.params;
      const { limit = 10, dificuldade } = req.query;

      console.log(`🎯 Carregando questões para quiz - Área: ${area}, Limite: ${limit}, Dificuldade: ${dificuldade || 'todas'}`);

      const areaMap = {
        'matematica': 'matematica',
        'ingles': 'ingles',
        'programacao': 'programacao'
      };

      const categoria = areaMap[area?.toLowerCase()];
      if (!categoria) {
        return res.status(400).json({
          success: false,
          error: 'Área inválida. Use: matematica, ingles ou programacao'
        });
      }

      // Construir filtro — dificuldade é opcional
      const where = { categoria, ativo: true };
      const dificuldadesValidas = ['facil', 'medio', 'dificil'];
      if (dificuldade && dificuldadesValidas.includes(dificuldade.toLowerCase())) {
        where.dificuldade = dificuldade.toLowerCase();
      }

      // Buscar da tabela questoes_teste_conhecimento (fonte única de dados do admin)
      const questoes = await QuestaoTesteConhecimento.findAll({
        where,
        order: QuestaoTesteConhecimento.sequelize.random(),
        limit: Math.min(parseInt(limit), 20),
        attributes: ['id', 'enunciado', 'opcoes', 'resposta_correta', 'dificuldade', 'categoria', 'pontos']
      });

      // Contar total de questões disponíveis para esta categoria/dificuldade (sem limite)
      const totalDisponivel = await QuestaoTesteConhecimento.count({ where });

      console.log(`✅ ${questoes.length} questões carregadas para quiz (categoria: ${categoria}, total disponível: ${totalDisponivel})`);

      // Formatar para o frontend: garantir que opcoes é sempre um array
      const questoesFormatadas = questoes.map(q => {
        let opcoes = q.opcoes;
        // Sequelize pode retornar JSON como string em algumas versões do MySQL
        if (typeof opcoes === 'string') {
          try { opcoes = JSON.parse(opcoes); } catch { opcoes = []; }
        }
        if (!Array.isArray(opcoes)) opcoes = [];
        return {
          id: q.id,
          enunciado: q.enunciado,
          opcoes,
          resposta_correta: q.resposta_correta,
          dificuldade: q.dificuldade,
          categoria: q.categoria,
          pontos: q.pontos
        };
      });

      res.json({
        success: true,
        area: categoria,
        total: totalDisponivel,
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
      const { pagina = 1, limite = 20, disciplina, tipo, dificuldade, status_aprovacao } = req.query;

      console.log(`📋 Listando todas as questões`, { pagina, limite, disciplina, tipo, dificuldade, status_aprovacao });

      const where = {};

      if (disciplina) where.disciplina = disciplina;
      if (tipo) where.tipo = tipo;
      if (dificuldade) where.dificuldade = dificuldade;
      if (status_aprovacao) where.status_aprovacao = status_aprovacao;
      
      aplicarEscopoColaborador(req, where);
      aplicarFiltroStatus(req, where);

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
  },

  /**
   * PATCH /api/questoes/:id/aprovacao
   * Admin aprova ou rejeita questao criada por colaborador
   */
  revisar: async (req, res) => {
    try {
      const { id } = req.params;
      const { status_aprovacao, motivo_rejeicao = null } = req.body;

      if (!['aprovada', 'rejeitada', 'pendente'].includes(status_aprovacao)) {
        return respostaErro(res, 422, 'status_aprovacao deve ser aprovada, rejeitada ou pendente');
      }

      const questao = await Questao.findByPk(id);
      if (!questao) {
        return respostaErro(res, 404, `Questão com ID ${id} não encontrada`);
      }

      await questao.update({
        status_aprovacao,
        motivo_rejeicao: status_aprovacao === 'rejeitada' ? motivo_rejeicao : null,
        revisado_por: req.user?.id || null,
        revisado_em: new Date()
      });

      respostaSucesso(res, 200, questao, 'Questão revisada com sucesso');
    } catch (error) {
      console.error('Erro ao revisar questão:', error);
      respostaErro(res, 500, 'Erro ao revisar questão', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/estatisticas
   * Retorna estatísticas das questões do colaborador logado
   */
  estatisticas: async (req, res) => {
    try {
      if (!req.user) {
        return respostaErro(res, 401, 'Usuário não autenticado');
      }

      const where = {};
      
      // Para colaborador, filtrar por suas questões
      if (req.user.isColaborador || req.user.role === 'colaborador') {
        where.autor_id = req.user.id;
      } else if (req.user.isAdmin || req.user.role === 'admin') {
        // Admin pode ver estatísticas de todas as questões
        // Não aplicar filtro de autor
      } else {
        return respostaErro(res, 403, 'Acesso negado');
      }

      // Buscar questões
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
      
      // Por disciplina (para admin)
      const disciplinas = {};
      if (req.user.isAdmin) {
        questoes.forEach(q => {
          disciplinas[q.disciplina] = (disciplinas[q.disciplina] || 0) + 1;
        });
      }

      respostaSucesso(res, 200, {
        total,
        aprovadas,
        pendentes,
        rejeitadas,
        porDificuldade: { facil, medio, dificil },
        ...(req.user.isAdmin && { porDisciplina: disciplinas }),
        taxaAprovacao: total > 0 ? Math.round((aprovadas / total) * 100) : 0
      }, 'Estatísticas obtidas com sucesso');
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      respostaErro(res, 500, 'Erro ao obter estatísticas', { detalhes: error.message });
    }
  }
};

export default QuestoesControllerRefactored;
