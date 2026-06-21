/**
 * ColaboradorBlocosQuestoesController.js
 * 
 * Controller para gerenciar blocos e questões criadas por colaboradores
 * com fluxo de aprovação administrada por admins
 */

import Questao from '../models/Questao.js';
import BlocoQuestoes from '../models/BlocoQuestoes.js';
import Usuario from '../models/User.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

// 
// HELPER FUNCTIONS
// 

/**
 * Resposta padrão de sucesso
 */
const respostaSucesso = (res, statusCode = 200, dados = null, mensagem = '') => {
  res.status(statusCode).json({
    sucesso: true,
    mensagem,
    dados,
    timestamp: new Date().toISOString()
  });
};

/**
 * Resposta padrão de erro
 */
const respostaErro = (res, statusCode = 400, mensagem = '', erros = null) => {
  res.status(statusCode).json({
    sucesso: false,
    mensagem,
    ...(erros && { erros }),
    timestamp: new Date().toISOString()
  });
};

/**
 * Validar se as opções da questão estão corretas
 * Para questões de múltipla escolha
 */
const validarOpcoes = (opcoes) => {
  if (!Array.isArray(opcoes) || opcoes.length === 0) {
    return { valido: false, mensagem: 'Questão de múltipla escolha deve ter pelo menos uma opção' };
  }

  if (opcoes.length < 2) {
    return { valido: false, mensagem: 'Questão deve ter no mínimo 2 opções' };
  }

  if (opcoes.length > 10) {
    return { valido: false, mensagem: 'Questão pode ter no máximo 10 opções' };
  }

  const temCorreta = opcoes.some(o => o.correta === true);
  if (!temCorreta) {
    return { valido: false, mensagem: 'Deve haver pelo menos uma opção marcada como correta' };
  }

  // Verificar que cada opção tem texto
  if (opcoes.some(o => !o.texto || typeof o.texto !== 'string')) {
    return { valido: false, mensagem: 'Todas as opções devem ter um texto válido' };
  }

  return { valido: true };
};

/**
 * Validar dados de entrada para questão
 */
const validarDadosQuestao = (dados, isEdicao = false) => {
  const erros = [];

  if (!isEdicao && !dados.titulo) {
    erros.push('Título é obrigatório');
  }

  if (dados.titulo && (typeof dados.titulo !== 'string' || dados.titulo.trim().length === 0)) {
    erros.push('Título deve ser uma string válida');
  }

  if (dados.titulo && dados.titulo.length > 255) {
    erros.push('Título não pode ter mais de 255 caracteres');
  }

  if (!isEdicao && !dados.descricao) {
    erros.push('Descrição é obrigatória');
  }

  if (dados.descricao && (typeof dados.descricao !== 'string' || dados.descricao.trim().length === 0)) {
    erros.push('Descrição deve ser uma string válida');
  }

  if (!isEdicao && !dados.tipo) {
    erros.push('Tipo é obrigatório (multipla_escolha, texto, codigo)');
  }

  if (dados.tipo && !['multipla_escolha', 'texto', 'codigo'].includes(dados.tipo)) {
    erros.push('Tipo deve ser: multipla_escolha, texto ou codigo');
  }

  if (!isEdicao && !dados.dificuldade) {
    erros.push('Dificuldade é obrigatória (facil, medio, dificil)');
  }

  if (dados.dificuldade && !['facil', 'medio', 'dificil'].includes(dados.dificuldade)) {
    erros.push('Dificuldade deve ser: facil, medio ou dificil');
  }

  if (dados.pontos) {
    if (typeof dados.pontos !== 'number' || dados.pontos < 1 || dados.pontos > 100) {
      erros.push('Pontos deve ser um número entre 1 e 100');
    }
  }

  // Validar opções se é múltipla escolha
  if (dados.tipo === 'multipla_escolha' && dados.opcoes) {
    const validacao = validarOpcoes(dados.opcoes);
    if (!validacao.valido) {
      erros.push(validacao.mensagem);
    }
  }

  return erros;
};

/**
 * Validar dados de entrada para bloco
 */
const validarDadosBloco = (dados, isEdicao = false) => {
  const erros = [];

  if (!isEdicao && !dados.titulo) {
    erros.push('Título é obrigatório');
  }

  if (dados.titulo && (typeof dados.titulo !== 'string' || dados.titulo.trim().length === 0)) {
    erros.push('Título deve ser uma string válida');
  }

  if (dados.titulo && dados.titulo.length > 255) {
    erros.push('Título não pode ter mais de 255 caracteres');
  }

  if (dados.categoria && typeof dados.categoria !== 'string') {
    erros.push('Categoria deve ser uma string');
  }

  if (dados.ordem !== undefined && typeof dados.ordem !== 'number') {
    erros.push('Ordem deve ser um número');
  }

  if (dados.ativo !== undefined && typeof dados.ativo !== 'boolean') {
    erros.push('Ativo deve ser um booleano');
  }

  return erros;
};

// 
// BLOCOS - COLABORADOR
// 

/**
 * POST /api/colaborador/blocos
 * Criar novo bloco
 */
export const criarBlocoColaborador = async (req, res) => {
  try {
    const { titulo, descricao, categoria, ordem = 0, ativo = true } = req.body;

    // Validar dados
    const erros = validarDadosBloco(req.body);
    if (erros.length > 0) {
      return respostaErro(res, 400, 'Dados inválidos', erros);
    }

    // Criar bloco
    const novoBloco = await BlocoQuestoes.create({
      titulo: titulo.trim(),
      descricao: descricao ? descricao.trim() : null,
      categoria: categoria ? categoria.trim() : null,
      ordem,
      ativo,
      criado_por: req.user.id,
      status: 'rascunho', // Blocos de colaboradores começam como rascunho
      disciplina: req.user.disciplina_colaborador || 'matematica'
    });

    respostaSucesso(res, 201, novoBloco, 'Bloco criado com sucesso e aguardando aprovação');
  } catch (error) {
    console.error('Erro ao criar bloco:', error);
    respostaErro(res, 500, 'Erro ao criar bloco', { detalhes: error.message });
  }
};

/**
 * GET /api/colaborador/blocos
 * Listar blocos do colaborador com filtros e paginação
 */
export const listarBlocosColaborador = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 20,
      status,
      busca = '',
      ordenar = 'data'
    } = req.query;

    const where = {
      criado_por: req.user.id
    };

    // Filtrar por status
    if (status && ['rascunho', 'publicado'].includes(status)) {
      where.status = status;
    }

    // Busca por título ou descrição
    if (busca.trim()) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${busca}%` } },
        { descricao: { [Op.iLike]: `%${busca}%` } }
      ];
    }

    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // Definir ordenação
    let order = [['created_at', 'DESC']];
    if (ordenar === 'titulo') {
      order = [['titulo', 'ASC']];
    } else if (ordenar === 'data') {
      order = [['created_at', 'DESC']];
    }

    const { count, rows } = await BlocoQuestoes.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset,
      order,
      attributes: ['id', 'titulo', 'descricao', 'disciplina', 'dificuldade', 'status', 'criado_por', 'created_at', 'updated_at']
    });

    // Estatísticas
    const rascunhos = await BlocoQuestoes.count({
      where: { criado_por: req.user.id, status: 'rascunho' }
    });
    const publicados = await BlocoQuestoes.count({
      where: { criado_por: req.user.id, status: 'publicado' }
    });

    respostaSucesso(res, 200, {
      blocos: rows,
      paginacao: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total: count,
        totalPaginas: Math.ceil(count / parseInt(limite))
      },
      estatisticas: {
        total: count,
        rascunhos,
        publicados
      }
    }, 'Blocos listados com sucesso');
  } catch (error) {
    console.error('Erro ao listar blocos:', error);
    respostaErro(res, 500, 'Erro ao listar blocos', { detalhes: error.message });
  }
};

/**
 * GET /api/colaborador/blocos/:id
 * Obter detalhes de um bloco específico
 */
export const obterBlocoColaborador = async (req, res) => {
  try {
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

    respostaSucesso(res, 200, { bloco }, 'Bloco obtido com sucesso');
  } catch (error) {
    console.error('Erro ao obter bloco:', error);
    respostaErro(res, 500, 'Erro ao obter bloco', { detalhes: error.message });
  }
};

/**
 * PUT /api/colaborador/blocos/:id
 * Atualizar bloco próprio (apenas se rascunho)
 */
export const atualizarBlocoColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, categoria, ordem, ativo } = req.body;

    // Validar dados
    const erros = validarDadosBloco(req.body, true);
    if (erros.length > 0) {
      return respostaErro(res, 400, 'Dados inválidos', erros);
    }

    const bloco = await BlocoQuestoes.findOne({
      where: {
        id,
        criado_por: req.user.id
      }
    });

    if (!bloco) {
      return respostaErro(res, 404, 'Bloco não encontrado');
    }

    // Verificar se pode ser atualizado (apenas se rascunho)
    if (bloco.status !== 'rascunho') {
      return respostaErro(res, 403, 'Apenas blocos em rascunho podem ser atualizados');
    }

    // Atualizar campos
    if (titulo) bloco.titulo = titulo.trim();
    if (descricao !== undefined) bloco.descricao = descricao ? descricao.trim() : null;
    if (categoria !== undefined) bloco.categoria = categoria ? categoria.trim() : null;
    if (ordem !== undefined) bloco.ordem = ordem;
    if (ativo !== undefined) bloco.ativo = ativo;

    await bloco.save();

    respostaSucesso(res, 200, bloco, 'Bloco atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar bloco:', error);
    respostaErro(res, 500, 'Erro ao atualizar bloco', { detalhes: error.message });
  }
};

/**
 * DELETE /api/colaborador/blocos/:id
 * Deletar bloco próprio (apenas se rascunho)
 */
export const deletarBlocoColaborador = async (req, res) => {
  try {
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

    // Verificar se pode ser deletado
    if (bloco.status !== 'rascunho') {
      return respostaErro(res, 403, 'Apenas blocos em rascunho podem ser deletados');
    }

    await bloco.destroy();

    respostaSucesso(res, 200, null, 'Bloco deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar bloco:', error);
    respostaErro(res, 500, 'Erro ao deletar bloco', { detalhes: error.message });
  }
};

// 
// QUESTÕES - COLABORADOR
// 

/**
 * POST /api/colaborador/questoes
 * Criar nova questão
 */
export const criarQuestaoColaborador = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      tipo,
      dificuldade,
      pontos = 10,
      bloco_id,
      opcoes,
      resposta_esperada,
      explicacao
    } = req.body;

    // Validar dados
    const erros = validarDadosQuestao(req.body);
    if (erros.length > 0) {
      return respostaErro(res, 400, 'Dados inválidos', erros);
    }

    // Se tiver bloco_id, verificar se pertence ao colaborador
    if (bloco_id) {
      const bloco = await BlocoQuestoes.findOne({
        where: { id: bloco_id, criado_por: req.user.id }
      });

      if (!bloco) {
        return respostaErro(res, 403, 'Bloco não encontrado ou não pertence a você');
      }
    }

    // Preparar dados da questão
    const dadosQuestao = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipo,
      dificuldade,
      pontos,
      autor_id: req.user.id,
      disciplina: req.user.disciplina_colaborador || 'matematica',
      status_aprovacao: 'pendente', // Questões de colaboradores começam pendentes
      bloco_id: bloco_id || null
    };

    // Adicionar campos específicos do tipo
    if (tipo === 'multipla_escolha') {
      dadosQuestao.opcoes = opcoes;
    } else if (tipo === 'texto' || tipo === 'codigo') {
      dadosQuestao.resposta_correta = resposta_esperada;
      dadosQuestao.explicacao = explicacao;
    }

    const novaQuestao = await Questao.create(dadosQuestao);

    respostaSucesso(res, 201, novaQuestao, 'Questão criada com sucesso e aguardando aprovação');
  } catch (error) {
    console.error('Erro ao criar questão:', error);
    respostaErro(res, 500, 'Erro ao criar questão', { detalhes: error.message });
  }
};

/**
 * GET /api/colaborador/questoes
 * Listar questões do colaborador com filtros e paginação
 */
export const listarQuestoesColaborador = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 20,
      status,
      dificuldade,
      tipo,
      bloco_id,
      busca = '',
      ordenar = 'data'
    } = req.query;

    const where = {
      autor_id: req.user.id
    };

    // Filtros
    if (status && ['pendente', 'aprovada', 'rejeitada'].includes(status)) {
      where.status_aprovacao = status;
    }

    if (dificuldade && ['facil', 'medio', 'dificil'].includes(dificuldade)) {
      where.dificuldade = dificuldade;
    }

    if (tipo && ['multipla_escolha', 'texto', 'codigo'].includes(tipo)) {
      where.tipo = tipo;
    }

    if (bloco_id) {
      where.bloco_id = bloco_id;
    }

    // Busca por título
    if (busca.trim()) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${busca}%` } },
        { descricao: { [Op.iLike]: `%${busca}%` } }
      ];
    }

    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // Ordenação
    let order = [['created_at', 'DESC']];
    if (ordenar === 'titulo') {
      order = [['titulo', 'ASC']];
    } else if (ordenar === 'dificuldade') {
      order = [
        [sequelize.literal("CASE WHEN dificuldade = 'facil' THEN 1 WHEN dificuldade = 'medio' THEN 2 ELSE 3 END"), 'ASC']
      ];
    } else if (ordenar === 'pontos') {
      order = [['pontos', 'DESC']];
    }

    const { count, rows } = await Questao.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset,
      order
    });

    // Estatísticas
    const pendentes = await Questao.count({
      where: { autor_id: req.user.id, status_aprovacao: 'pendente' }
    });
    const aprovadas = await Questao.count({
      where: { autor_id: req.user.id, status_aprovacao: 'aprovada' }
    });
    const rejeitadas = await Questao.count({
      where: { autor_id: req.user.id, status_aprovacao: 'rejeitada' }
    });

    respostaSucesso(res, 200, {
      questoes: rows,
      paginacao: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total: count,
        totalPaginas: Math.ceil(count / parseInt(limite))
      },
      estatisticas: {
        total: count,
        pendentes,
        aprovadas,
        rejeitadas
      }
    }, 'Questões listadas com sucesso');
  } catch (error) {
    console.error('Erro ao listar questões:', error);
    respostaErro(res, 500, 'Erro ao listar questões', { detalhes: error.message });
  }
};

/**
 * GET /api/colaborador/questoes/:id
 * Obter detalhes de uma questão específica
 */
export const obterQuestaoColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    const questao = await Questao.findOne({
      where: {
        id,
        autor_id: req.user.id
      }
    });

    if (!questao) {
      return respostaErro(res, 404, 'Questão não encontrada');
    }

    respostaSucesso(res, 200, { questao }, 'Questão obtida com sucesso');
  } catch (error) {
    console.error('Erro ao obter questão:', error);
    respostaErro(res, 500, 'Erro ao obter questão', { detalhes: error.message });
  }
};

/**
 * PUT /api/colaborador/questoes/:id
 * Atualizar questão própria (apenas se pendente)
 */
export const atualizarQuestaoColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, dificuldade, pontos, opcoes, resposta_esperada, explicacao } = req.body;

    // Validar dados
    const erros = validarDadosQuestao(req.body, true);
    if (erros.length > 0) {
      return respostaErro(res, 400, 'Dados inválidos', erros);
    }

    const questao = await Questao.findOne({
      where: {
        id,
        autor_id: req.user.id
      }
    });

    if (!questao) {
      return respostaErro(res, 404, 'Questão não encontrada');
    }

    // Verificar se pode ser atualizada (apenas se pendente)
    if (questao.status_aprovacao !== 'pendente') {
      return respostaErro(res, 403, 'Apenas questões pendentes podem ser atualizadas');
    }

    // Atualizar campos
    if (titulo) questao.titulo = titulo.trim();
    if (descricao) questao.descricao = descricao.trim();
    if (dificuldade) questao.dificuldade = dificuldade;
    if (pontos) questao.pontos = pontos;

    if (questao.tipo === 'multipla_escolha' && opcoes) {
      questao.opcoes = opcoes;
    } else if ((questao.tipo === 'texto' || questao.tipo === 'codigo')) {
      if (resposta_esperada !== undefined) questao.resposta_correta = resposta_esperada;
      if (explicacao !== undefined) questao.explicacao = explicacao;
    }

    await questao.save();

    respostaSucesso(res, 200, questao, 'Questão atualizada com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    respostaErro(res, 500, 'Erro ao atualizar questão', { detalhes: error.message });
  }
};

/**
 * DELETE /api/colaborador/questoes/:id
 * Deletar questão própria (apenas se pendente ou rejeitada)
 */
export const deletarQuestaoColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    const questao = await Questao.findOne({
      where: {
        id,
        autor_id: req.user.id
      }
    });

    if (!questao) {
      return respostaErro(res, 404, 'Questão não encontrada');
    }

    // Verificar se pode ser deletada
    if (!['pendente', 'rejeitada'].includes(questao.status_aprovacao)) {
      return respostaErro(res, 403, 'Apenas questões pendentes ou rejeitadas podem ser deletadas');
    }

    await questao.destroy();

    respostaSucesso(res, 200, null, 'Questão deletada com sucesso');
  } catch (error) {
    console.error('Erro ao deletar questão:', error);
    respostaErro(res, 500, 'Erro ao deletar questão', { detalhes: error.message });
  }
};

// 
// ADMIN - APROVAÇÃO (STUBS FOR NOW - To be implemented in next iteration)
// 

export const listarBlocosPendentes = async (req, res) => {
  try {
    const { pagina = 1, limite = 20 } = req.query;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const { count, rows } = await BlocoQuestoes.findAndCountAll({
      where: { status: 'rascunho' },
      limit: parseInt(limite),
      offset,
      order: [['created_at', 'DESC']]
    });

    respostaSucesso(res, 200, {
      blocos: rows,
      paginacao: { pagina: parseInt(pagina), limite: parseInt(limite), total: count, totalPaginas: Math.ceil(count / parseInt(limite)) }
    }, 'Blocos pendentes listados');
  } catch (error) {
    respostaErro(res, 500, 'Erro ao listar blocos pendentes', { detalhes: error.message });
  }
};

export const aprovarBloco = async (req, res) => {
  try {
    const { id } = req.params;
    const bloco = await BlocoQuestoes.findByPk(id);
    if (!bloco) return respostaErro(res, 404, 'Bloco não encontrado');
    
    bloco.status = 'publicado';
    await bloco.save();
    
    respostaSucesso(res, 200, bloco, 'Bloco aprovado com sucesso');
  } catch (error) {
    respostaErro(res, 500, 'Erro ao aprovar bloco', { detalhes: error.message });
  }
};

export const rejeitarBloco = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const bloco = await BlocoQuestoes.findByPk(id);
    if (!bloco) return respostaErro(res, 404, 'Bloco não encontrado');
    
    bloco.status = 'rascunho';
    await bloco.save();
    
    respostaSucesso(res, 200, bloco, 'Bloco rejeitado');
  } catch (error) {
    respostaErro(res, 500, 'Erro ao rejeitar bloco', { detalhes: error.message });
  }
};

export const listarQuestoesColaboradorPendentes = async (req, res) => {
  try {
    const { pagina = 1, limite = 20 } = req.query;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const { count, rows } = await Questao.findAndCountAll({
      where: { status_aprovacao: 'pendente' },
      limit: parseInt(limite),
      offset,
      order: [['created_at', 'DESC']]
    });

    respostaSucesso(res, 200, {
      questoes: rows,
      paginacao: { pagina: parseInt(pagina), limite: parseInt(limite), total: count, totalPaginas: Math.ceil(count / parseInt(limite)) }
    }, 'Questões pendentes listadas');
  } catch (error) {
    respostaErro(res, 500, 'Erro ao listar questões pendentes', { detalhes: error.message });
  }
};

export const aprovarQuestaoColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const questao = await Questao.findByPk(id);
    if (!questao) return respostaErro(res, 404, 'Questão não encontrada');
    
    questao.status_aprovacao = 'aprovada';
    questao.aprovado_por_id = req.user.id;
    questao.revisado_em = new Date();
    await questao.save();
    
    respostaSucesso(res, 200, questao, 'Questão aprovada com sucesso');
  } catch (error) {
    respostaErro(res, 500, 'Erro ao aprovar questão', { detalhes: error.message });
  }
};

export const rejeitarQuestaoColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const questao = await Questao.findByPk(id);
    if (!questao) return respostaErro(res, 404, 'Questão não encontrada');
    
    questao.status_aprovacao = 'rejeitada';
    questao.revisado_por_id = req.user.id;
    questao.motivo_rejeicao = motivo;
    questao.revisado_em = new Date();
    await questao.save();
    
    respostaSucesso(res, 200, questao, 'Questão rejeitada');
  } catch (error) {
    respostaErro(res, 500, 'Erro ao rejeitar questão', { detalhes: error.message });
  }
};
