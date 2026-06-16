/**
 * QuestoesController.js
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
  if (!dados.descricao && !dados.enunciado) erros.push('descricao ou enunciado é obrigatório');
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

  // Validação específica para múltipla escolha
  if (dados.tipo === 'multipla_escolha') {
    // Normalizar opcoes: pode vir como array de strings ou array de objetos
    let opcoesTextos = [];
    if (Array.isArray(dados.opcoes)) {
      opcoesTextos = dados.opcoes
        .map(o => typeof o === 'object' ? o.texto : o)
        .filter(t => t && t.trim());
    }

    if (opcoesTextos.length < 2) {
      erros.push('Questão de múltipla escolha deve ter no mínimo 2 opções');
    } else if (opcoesTextos.length > 10) {
      erros.push('Questão pode ter no máximo 10 opções');
    } else if (!opcoesTextos.includes(dados.resposta_correta)) {
      erros.push(`resposta_correta "${dados.resposta_correta}" deve estar entre as opções disponíveis: ${opcoesTextos.join(', ')}`);
    }
  }

  // Validação para tipos texto e código
  if (['texto', 'codigo'].includes(dados.tipo)) {
    if (typeof dados.resposta_correta !== 'string' || dados.resposta_correta.trim().length === 0) {
      erros.push(`resposta_correta deve ser um texto válido para tipo ${dados.tipo}`);
    }
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
  // Se já tem status_aprovacao definido (vindo do query params), não sobrescreve
  if (where.status_aprovacao) {
    return where;
  }
  
  const isColaborador = req.user?.isColaborador || req.user?.role === 'colaborador';
  const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';
  
  // Se não for autenticado ou for estudante: mostrar apenas aprovadas
  if (!req.user || (!isAdmin && !isColaborador)) {
    where.status_aprovacao = 'aprovada';
  }
  // Nota: Admin sem filtro explícito pode ver tudo
  // Se quiser filtrar por status, o admin passa ?status_aprovacao=aprovada
  
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

export const QuestoesController = {
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

      // ── NORMALIZAR OPÇÕES ──
      // Se opcoes vem como array de objetos { texto, correta, explicacao }
      // Converter para array de strings para armazenar
      if (dados.tipo === 'multipla_escolha' && Array.isArray(dados.opcoes)) {
        dados.opcoes = dados.opcoes
          .map(o => typeof o === 'object' ? o.texto : o)
          .filter(t => t && t.trim());
      }

      // Validar dados
      const erros = validarQuestao(dados);
      if (erros.length > 0) {
        return respostaErro(res, 422, 'Erro de validação', erros);
      }

      // Verificar se torneio existe (se for fornecido)
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
        bloco_id: dados.bloco_id || null,
        titulo: dados.titulo,
        descricao: dados.descricao,
        disciplina: dados.disciplina,
        tipo: dados.tipo,
        dificuldade: dados.dificuldade,
        opcoes: (dados.tipo === 'multipla_escolha' && dados.opcoes) ? dados.opcoes : null,
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

      // ✅ Normalizar opcoes antes de retornar
      const questaoData = questao.toJSON();
      if (questaoData.opcoes) {
        if (typeof questaoData.opcoes === 'string') {
          try {
            questaoData.opcoes = JSON.parse(questaoData.opcoes);
          } catch (e) {
            questaoData.opcoes = [];
          }
        }
        if (!Array.isArray(questaoData.opcoes)) {
          questaoData.opcoes = [];
        }
      }

      respostaSucesso(res, 200, questaoData, 'Questão obtida com sucesso');
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
      
      // ✅ Normalizar opcoes ao receber
      if (dados.tipo === 'multipla_escolha' && Array.isArray(dados.opcoes)) {
        dados.opcoes = dados.opcoes
          .map(o => typeof o === 'object' ? o.texto : o)
          .filter(t => t && t.trim());
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

      // ✅ Normalizar opcoes ao retornar
      const questaoData = questao.toJSON();
      if (questaoData.opcoes) {
        if (typeof questaoData.opcoes === 'string') {
          try {
            questaoData.opcoes = JSON.parse(questaoData.opcoes);
          } catch (e) {
            questaoData.opcoes = [];
          }
        }
        if (!Array.isArray(questaoData.opcoes)) {
          questaoData.opcoes = [];
        }
      }

      console.log(`✅ Questão atualizada com sucesso - ID: ${questao.id}`);

      respostaSucesso(res, 200, questaoData, 'Questão atualizada com sucesso');
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

      // ✅ Normalizar opcoes antes de retornar
      const questoesNormalizadas = rows.map(questao => {
        const questaoData = questao.toJSON();
        
        if (questaoData.opcoes) {
          if (typeof questaoData.opcoes === 'string') {
            try {
              questaoData.opcoes = JSON.parse(questaoData.opcoes);
            } catch (e) {
              questaoData.opcoes = [];
            }
          }
          if (!Array.isArray(questaoData.opcoes)) {
            questaoData.opcoes = [];
          }
        }

        return questaoData;
      });

      respostaSucesso(res, 200, {
        questoes: questoesNormalizadas,
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
        order: [['created_at', 'DESC']],
        include: [
          {
            association: 'autor',
            attributes: ['id', 'nome', 'email']
          }
        ]
      });

      // ✅ Normalizar opcoes antes de retornar
      const questoesComAutor = rows.map(questao => {
        const questaoData = questao.toJSON();
        
        // Normalizar opcoes
        if (questaoData.opcoes) {
          if (typeof questaoData.opcoes === 'string') {
            try {
              questaoData.opcoes = JSON.parse(questaoData.opcoes);
            } catch (e) {
              questaoData.opcoes = [];
            }
          }
          if (!Array.isArray(questaoData.opcoes)) {
            questaoData.opcoes = [];
          }
        }

        return {
          ...questaoData,
          autor_nome: questao.autor?.nome || 'Sem informação'
        };
      });

      respostaSucesso(res, 200, {
        questoes: questoesComAutor,
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
  },

  /**
   * POST /api/questoes/colaborador/criar
   * TASK 4.1: Criar questão como colaborador
   * - Validar dados da questão
   * - Verificar disciplina corresponde a disciplina_colaborador
   * - Definir status_aprovacao como 'pendente'
   * - Definir autor_id como id do colaborador
   */
  createQuestao: async (req, res) => {
    try {
      const dados = { ...req.body };

      // Normalizar enunciado → descricao
      if (dados.enunciado && !dados.descricao) {
        dados.descricao = dados.enunciado;
      }

      // Verificar se é colaborador
      const isColaborador = req.user?.isColaborador || req.user?.role === 'colaborador';
      if (!isColaborador) {
        return respostaErro(res, 403, 'Apenas colaboradores podem criar questões');
      }

      // Verificar se disciplina_colaborador está definido
      if (!req.user?.disciplina_colaborador) {
        return respostaErro(res, 400, 'Colaborador não possui disciplina atribuída');
      }

      // Validar que disciplina fornecida corresponde à do colaborador (Requisito 2.2)
      if (dados.disciplina !== req.user.disciplina_colaborador) {
        return respostaErro(res, 403, 'Você só pode criar questões para sua disciplina');
      }

      console.log(`📝 Colaborador criando questão:`, { 
        colaboradorId: req.user.id,
        titulo: dados.titulo, 
        disciplina: dados.disciplina
      });

      // Normalizar opções se tipo for múltipla escolha
      if (dados.tipo === 'multipla_escolha' && Array.isArray(dados.opcoes)) {
        dados.opcoes = dados.opcoes
          .map(o => typeof o === 'object' ? o.texto : o)
          .filter(t => t && t.trim());
      }

      // Validar dados da questão
      const erros = validarQuestao(dados);
      if (erros.length > 0) {
        return respostaErro(res, 422, 'Erro de validação', erros);
      }

      // Criar questão com status pendente e autor definido
      const questao = await Questao.create({
        torneio_id: dados.torneio_id || null,
        bloco_id: dados.bloco_id || null,
        titulo: dados.titulo,
        descricao: dados.descricao,
        disciplina: dados.disciplina,
        tipo: dados.tipo,
        dificuldade: dados.dificuldade,
        opcoes: (dados.tipo === 'multipla_escolha' && dados.opcoes) ? dados.opcoes : null,
        resposta_correta: dados.resposta_correta,
        explicacao: dados.explicacao || null,
        pontos: dados.pontos || 10,
        linguagem: dados.linguagem || null,
        midia: dados.midia || null,
        autor_id: req.user.id,  // Definir autor_id (Requisito 2.3)
        status_aprovacao: 'pendente'  // Definir status como pendente (Requisito 2.1)
      });

      console.log(`✅ Questão criada com sucesso - ID: ${questao.id}, Status: pendente, Autor: ${req.user.id}`);

      // Retornar questão criada (Requisito 2.6)
      const questaoData = questao.toJSON();
      respostaSucesso(res, 201, questaoData, 'Questão criada com sucesso e aguardando aprovação');
    } catch (error) {
      console.error('❌ Erro ao criar questão:', error);
      respostaErro(res, 500, 'Erro ao criar questão', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/colaborador/minhas
   * TASK 4.2: Listar questões do colaborador
   * - Filtrar por autor_id (colaborador logado)
   * - Filtrar por disciplina_colaborador
   * - Aplicar filtros opcionais (dificuldade, status_aprovacao)
   * - Retornar array vazio se nenhuma questão
   */
  getMinhasQuestoes: async (req, res) => {
    try {
      // Verificar se é colaborador
      const isColaborador = req.user?.isColaborador || req.user?.role === 'colaborador';
      if (!isColaborador) {
        return respostaErro(res, 403, 'Apenas colaboradores podem acessar este endpoint');
      }

      // Verificar se disciplina_colaborador está definido
      if (!req.user?.disciplina_colaborador) {
        return respostaErro(res, 400, 'Colaborador não possui disciplina atribuída');
      }

      const { dificuldade, status_aprovacao, pagina = 1, limite = 20 } = req.query;

      console.log(`📋 Listando questões do colaborador ${req.user.id}`, { 
        dificuldade, 
        status_aprovacao,
        pagina,
        limite
      });

      // Construir filtro (Requisito 3.1 e 3.2)
      const where = {
        autor_id: req.user.id,  // Filtro por autor (Requisito 3.1)
        disciplina: req.user.disciplina_colaborador  // Filtro por disciplina (Requisito 3.2)
      };

      // Se filtro de disciplina fornecido, verificar se é a disciplina do colaborador (Requisito 3.3)
      if (req.query.disciplina && req.query.disciplina !== req.user.disciplina_colaborador) {
        return respostaErro(res, 403, 'Você só pode ver questões da sua disciplina');
      }

      // Aplicar filtros opcionais (Requisito 3.4)
      if (dificuldade) {
        where.dificuldade = dificuldade;
      }

      if (status_aprovacao) {
        where.status_aprovacao = status_aprovacao;
      }

      // Implementar paginação
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      // Buscar questões ordenadas por data de criação
      const { count, rows } = await Questao.findAndCountAll({
        where,
        limit: parseInt(limite),
        offset,
        order: [['created_at', 'DESC']]  // Ordenar por createdAt conforme design
      });

      console.log(`✅ ${rows.length} questões encontradas para colaborador ${req.user.id}`);

      // Normalizar opções antes de retornar
      const questoesNormalizadas = rows.map(questao => {
        const questaoData = questao.toJSON();
        
        if (questaoData.opcoes) {
          if (typeof questaoData.opcoes === 'string') {
            try {
              questaoData.opcoes = JSON.parse(questaoData.opcoes);
            } catch (e) {
              questaoData.opcoes = [];
            }
          }
          if (!Array.isArray(questaoData.opcoes)) {
            questaoData.opcoes = [];
          }
        }

        return questaoData;
      });

      // Retornar array vazio se nenhuma questão (Requisito 3.5)
      respostaSucesso(res, 200, {
        questoes: questoesNormalizadas,
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(count / parseInt(limite))
      }, count === 0 ? 'Você não possui questões criadas' : 'Questões listadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao listar minhas questões:', error);
      respostaErro(res, 500, 'Erro ao listar questões', { detalhes: error.message });
    }
  },

  /**
   * PUT /api/questoes/colaborador/:id
   * TASK 4.3: Atualizar questão do colaborador
   * - Verificar que questão pertence ao colaborador (autor_id)
   * - Evitar edição de questões aprovadas (set back to 'pendente')
   * - Validar disciplina se mudada (deve corresponder à disciplina_colaborador)
   * - Atualizar apenas campos fornecidos
   */
  updateQuestao: async (req, res) => {
    try {
      const { id } = req.params;
      const dados = { ...req.body };

      // Verificar se é colaborador
      const isColaborador = req.user?.isColaborador || req.user?.role === 'colaborador';
      if (!isColaborador) {
        return respostaErro(res, 403, 'Apenas colaboradores podem editar suas questões');
      }

      // Buscar questão
      const questao = await Questao.findByPk(id);
      if (!questao) {
        return respostaErro(res, 404, `Questão com ID ${id} não encontrada`);
      }

      // Verificar se questão pertence ao colaborador (Requisito 4.1)
      if (questao.autor_id !== req.user.id) {
        return respostaErro(res, 403, 'Acesso negado');  // Requisito 4.2
      }

      console.log(`✏️ Colaborador atualizando questão ID ${id}`, { 
        statusAtual: questao.status_aprovacao,
        colaboradorId: req.user.id
      });

      // Normalizar opções se tipo for múltipla escolha
      if (dados.tipo === 'multipla_escolha' && Array.isArray(dados.opcoes)) {
        dados.opcoes = dados.opcoes
          .map(o => typeof o === 'object' ? o.texto : o)
          .filter(t => t && t.trim());
      }

      // Regra: Não é possível editar questões já aprovadas (Requisito 4.3)
      // Se questão foi aprovada e está sendo editada, voltar ao status pendente
      if (questao.status_aprovacao === 'aprovada') {
        console.log(`📝 Questão aprovada será revisada. Status voltará para pendente.`);
        dados.status_aprovacao = 'pendente';
        dados.revisado_por = null;
        dados.revisado_em = null;
        dados.motivo_rejeicao = null;
      } else {
        // Para questões pendentes/rejeitadas, manter como pendente
        dados.status_aprovacao = 'pendente';
        dados.revisado_por = null;
        dados.revisado_em = null;
        dados.motivo_rejeicao = null;
      }

      // Se disciplina for mudada, validar se corresponde à disciplina do colaborador (Requisito 4.5)
      if (dados.disciplina && dados.disciplina !== req.user.disciplina_colaborador) {
        return respostaErro(res, 403, 'Você só pode criar questões para sua disciplina');
      }

      // Não permitir que colaborador mude disciplina (por segurança)
      delete dados.disciplina;

      // Atualizar apenas campos fornecidos (Requisito 4.4)
      const camposAtualizaveis = [
        'titulo', 'descricao', 'tipo', 'dificuldade',
        'opcoes', 'resposta_correta', 'explicacao', 'pontos', 'linguagem', 'midia',
        'status_aprovacao', 'revisado_por', 'revisado_em', 'motivo_rejeicao'
      ];

      for (const campo of camposAtualizaveis) {
        if (dados[campo] !== undefined) {
          questao[campo] = dados[campo];
        }
      }

      await questao.save();

      console.log(`✅ Questão atualizada com sucesso - ID: ${questao.id}, Novo status: ${questao.status_aprovacao}`);

      // Normalizar opções antes de retornar
      const questaoData = questao.toJSON();
      if (questaoData.opcoes) {
        if (typeof questaoData.opcoes === 'string') {
          try {
            questaoData.opcoes = JSON.parse(questaoData.opcoes);
          } catch (e) {
            questaoData.opcoes = [];
          }
        }
        if (!Array.isArray(questaoData.opcoes)) {
          questaoData.opcoes = [];
        }
      }

      // Retornar questão atualizada
      respostaSucesso(res, 200, questaoData, 'Questão atualizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar questão:', error);
      respostaErro(res, 500, 'Erro ao atualizar questão', { detalhes: error.message });
    }
  },

  /**
   * DELETE /api/questoes/colaborador/:id
   * TASK 4.4: Deletar questão do colaborador
   * - Verificar que questão pertence ao colaborador (autor_id)
   * - Deletar permanentemente
   * - Cascade delete respostas associadas
   */
  deleteQuestao: async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar se é colaborador
      const isColaborador = req.user?.isColaborador || req.user?.role === 'colaborador';
      if (!isColaborador) {
        return respostaErro(res, 403, 'Apenas colaboradores podem deletar suas questões');
      }

      // Buscar questão
      const questao = await Questao.findByPk(id);
      if (!questao) {
        return respostaErro(res, 404, `Questão com ID ${id} não encontrada`);
      }

      // Verificar se questão pertence ao colaborador (Requisito 5.1)
      if (questao.autor_id !== req.user.id) {
        return respostaErro(res, 403, 'Acesso negado');  // Requisito 5.2
      }

      console.log(`🗑️ Colaborador deletando questão ID ${id}`, { 
        colaboradorId: req.user.id,
        disciplina: questao.disciplina
      });

      // Deletar permanentemente (Requisito 5.3)
      // Cascade delete é automático conforme configurado no modelo (onDelete: 'CASCADE' em bloco_id)
      await questao.destroy();

      console.log(`✅ Questão deletada com sucesso - ID: ${id}`);

      // Retornar mensagem de sucesso (Requisito 5.4 - cascade handles respostas)
      respostaSucesso(res, 200, { deletedId: id }, 'Questão deletada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar questão:', error);
      respostaErro(res, 500, 'Erro ao deletar questão', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/admin/pendentes
   * TASK 5.1: Listar questões pendentes de aprovação (admin)
   * - Retornar todas as questões onde status_aprovacao = 'pendente' (Requisito 6.1)
   * - Incluir questões de todas as disciplinas e todos os colaboradores (Requisito 6.2)
   * - Ordenar por createdAt descendente (newest first) (Requisito 6.3)
   * - Incluir informação do autor (nome, email) com cada questão (Requisito 6.4)
   * - Suportar paginação
   * - Apenas admin pode acessar
   */
  getPendingQuestoes: async (req, res) => {
    try {
      // Verificar se é admin
      const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';
      if (!isAdmin) {
        return respostaErro(res, 403, 'Apenas administradores podem listar questões pendentes');
      }

      const { pagina = 1, limite = 20, disciplina, dificuldade } = req.query;

      console.log(`📋 Admin listando questões pendentes`, { 
        pagina, 
        limite, 
        disciplina,
        dificuldade
      });

      // Construir filtro - sempre buscar pendentes (Requisito 6.1)
      const where = {
        status_aprovacao: 'pendente'
      };

      // Filtros opcionais
      if (disciplina) {
        where.disciplina = disciplina;
      }

      if (dificuldade) {
        where.dificuldade = dificuldade;
      }

      // Implementar paginação
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      // Buscar questões com informações do autor (Requisito 6.4)
      const { count, rows } = await Questao.findAndCountAll({
        where,
        limit: parseInt(limite),
        offset,
        order: [['created_at', 'DESC']],  // Ordenar por createdAt DESC (Requisito 6.3)
        include: [
          {
            association: 'autor',
            attributes: ['id', 'nome', 'email']
          }
        ]
      });

      console.log(`✅ ${rows.length} questões pendentes encontradas (total: ${count})`);

      // Normalizar opções e incluir informações do autor
      const questoesComAutor = rows.map(questao => {
        const questaoData = questao.toJSON();
        
        // Normalizar opções
        if (questaoData.opcoes) {
          if (typeof questaoData.opcoes === 'string') {
            try {
              questaoData.opcoes = JSON.parse(questaoData.opcoes);
            } catch (e) {
              questaoData.opcoes = [];
            }
          }
          if (!Array.isArray(questaoData.opcoes)) {
            questaoData.opcoes = [];
          }
        }

        // Incluir informações do autor
        return {
          ...questaoData,
          autor_nome: questao.autor?.nome || 'Sem informação',
          autor_email: questao.autor?.email || 'Sem informação'
        };
      });

      respostaSucesso(res, 200, {
        questoes: questoesComAutor,
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(count / parseInt(limite))
      }, count === 0 ? 'Nenhuma questão pendente' : 'Questões pendentes listadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao listar questões pendentes:', error);
      respostaErro(res, 500, 'Erro ao listar questões pendentes', { detalhes: error.message });
    }
  },

  /**
   * PUT /api/questoes/:id/aprovar
   * TASK 5.2: Aprovar questão (admin)
   * - Definir status_aprovacao como 'aprovada' (Requisito 7.1)
   * - Definir revisado_por como id do admin (Requisito 7.2)
   * - Definir revisado_em como timestamp atual (Requisito 7.3)
   * - Retornar erro se questão não encontrada (Requisito 7.4)
   * - Retornar erro se já está aprovada (Requisito 7.5)
   * - Retornar questão atualizada com todos os campos de revisão (Requisito 7.6)
   * - Apenas admin pode aprovar
   */
  approveQuestao: async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar se é admin
      const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';
      if (!isAdmin) {
        return respostaErro(res, 403, 'Apenas administradores podem aprovar questões');
      }

      console.log(`✅ Admin aprovando questão ID ${id}`, { adminId: req.user.id });

      // Buscar questão (Requisito 7.4 - validar existência)
      const questao = await Questao.findByPk(id, {
        include: [
          {
            association: 'autor',
            attributes: ['id', 'nome', 'email']
          }
        ]
      });

      if (!questao) {
        return respostaErro(res, 404, 'Questão não encontrada');  // Requisito 7.4
      }

      // Verificar se já está aprovada (Requisito 7.5)
      if (questao.status_aprovacao === 'aprovada') {
        return respostaErro(res, 400, 'Questão já está aprovada');  // Requisito 7.5
      }

      // Atualizar status da questão (Requisito 7.1, 7.2, 7.3)
      questao.status_aprovacao = 'aprovada';
      questao.revisado_por = req.user.id;
      questao.revisado_em = new Date();

      await questao.save();

      console.log(`✅ Questão aprovada com sucesso - ID: ${questao.id}, Revisado por: ${req.user.id}`);

      // Normalizar opções antes de retornar
      const questaoData = questao.toJSON();
      if (questaoData.opcoes) {
        if (typeof questaoData.opcoes === 'string') {
          try {
            questaoData.opcoes = JSON.parse(questaoData.opcoes);
          } catch (e) {
            questaoData.opcoes = [];
          }
        }
        if (!Array.isArray(questaoData.opcoes)) {
          questaoData.opcoes = [];
        }
      }

      // Incluir informações do autor
      const questaoComAutor = {
        ...questaoData,
        autor_nome: questao.autor?.nome || 'Sem informação',
        autor_email: questao.autor?.email || 'Sem informação'
      };

      // Retornar questão atualizada (Requisito 7.6 - com todos os campos de revisão)
      respostaSucesso(res, 200, questaoComAutor, 'Questão aprovada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao aprovar questão:', error);
      respostaErro(res, 500, 'Erro ao aprovar questão', { detalhes: error.message });
    }
  },

  /**
   * PUT /api/questoes/:id/rejeitar
   * TASK 5.3: Rejeitar questão (admin)
   * - Exigir parâmetro motivo_rejeicao (Requisito 8.1)
   * - Retornar erro se não houver motivo (Requisito 8.2)
   * - Definir status_aprovacao como 'rejeitada' (Requisito 8.3)
   * - Definir motivo_rejeicao com o motivo fornecido (Requisito 8.4)
   * - Definir revisado_por como id do admin e revisado_em como timestamp (Requisito 8.5)
   * - Retornar questão atualizada com todos os campos (Requisito 8.6)
   * - Apenas admin pode rejeitar
   */
  rejectQuestao: async (req, res) => {
    try {
      const { id } = req.params;
      const { motivo_rejeicao } = req.body;

      // Verificar se é admin
      const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';
      if (!isAdmin) {
        return respostaErro(res, 403, 'Apenas administradores podem rejeitar questões');
      }

      // Validar motivo_rejeicao (Requisito 8.1 e 8.2)
      if (!motivo_rejeicao || typeof motivo_rejeicao !== 'string' || motivo_rejeicao.trim().length === 0) {
        return respostaErro(res, 400, 'Motivo da rejeição é obrigatório');  // Requisito 8.2
      }

      console.log(`❌ Admin rejeitando questão ID ${id}`, { 
        adminId: req.user.id,
        motivo: motivo_rejeicao.substring(0, 50) + '...'
      });

      // Buscar questão
      const questao = await Questao.findByPk(id, {
        include: [
          {
            association: 'autor',
            attributes: ['id', 'nome', 'email']
          }
        ]
      });

      if (!questao) {
        return respostaErro(res, 404, 'Questão não encontrada');
      }

      // Atualizar status da questão (Requisito 8.3, 8.4, 8.5)
      questao.status_aprovacao = 'rejeitada';
      questao.motivo_rejeicao = motivo_rejeicao.trim();
      questao.revisado_por = req.user.id;
      questao.revisado_em = new Date();

      await questao.save();

      console.log(`✅ Questão rejeitada com sucesso - ID: ${questao.id}, Revisado por: ${req.user.id}`);

      // Normalizar opções antes de retornar
      const questaoData = questao.toJSON();
      if (questaoData.opcoes) {
        if (typeof questaoData.opcoes === 'string') {
          try {
            questaoData.opcoes = JSON.parse(questaoData.opcoes);
          } catch (e) {
            questaoData.opcoes = [];
          }
        }
        if (!Array.isArray(questaoData.opcoes)) {
          questaoData.opcoes = [];
        }
      }

      // Incluir informações do autor
      const questaoComAutor = {
        ...questaoData,
        autor_nome: questao.autor?.nome || 'Sem informação',
        autor_email: questao.autor?.email || 'Sem informação'
      };

      // Retornar questão atualizada (Requisito 8.6 - com todos os campos)
      respostaSucesso(res, 200, questaoComAutor, 'Questão rejeitada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao rejeitar questão:', error);
      respostaErro(res, 500, 'Erro ao rejeitar questão', { detalhes: error.message });
    }
  },

  /**
   * GET /api/questoes/colaborador/stats
   * Obter estatísticas de questões para um colaborador
   * 
   * Retorna:
   * {
   *   questoes_totais: number,
   *   pendentes: number,
   *   aprovadas: number,
   *   rejeitadas: number,
   *   disciplina: string
   * }
   */
  getColaboradorStats: async (req, res) => {
    try {
      const isColaborador = req.user?.isColaborador || req.user?.role === 'colaborador';
      
      if (!isColaborador) {
        return respostaErro(res, 403, 'Acesso negado. Apenas colaboradores podem acessar suas estatísticas.');
      }

      const userId = req.user.id;
      const disciplina = req.user.disciplina_colaborador;

      console.log(`📊 Obtendo estatísticas para colaborador ${userId} (disciplina: ${disciplina})`);

      // Contar questões por status
      const questoes_totais = await Questao.count({
        where: {
          autor_id: userId,
          disciplina: disciplina
        }
      });

      const pendentes = await Questao.count({
        where: {
          autor_id: userId,
          disciplina: disciplina,
          status_aprovacao: 'pendente'
        }
      });

      const aprovadas = await Questao.count({
        where: {
          autor_id: userId,
          disciplina: disciplina,
          status_aprovacao: 'aprovada'
        }
      });

      const rejeitadas = await Questao.count({
        where: {
          autor_id: userId,
          disciplina: disciplina,
          status_aprovacao: 'rejeitada'
        }
      });

      console.log(`📊 Estatísticas obtidas:`, { questoes_totais, pendentes, aprovadas, rejeitadas });

      const responseData = {
        success: true,
        data: {
          questoes_totais,
          pendentes,
          aprovadas,
          rejeitadas,
          disciplina
        }
      };

      res.json(responseData);
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do colaborador:', error);
      respostaErro(res, 500, 'Erro ao obter estatísticas', { detalhes: error.message });
    }
  }
};

export default QuestoesController;
