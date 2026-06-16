/**
 * ColaboradorBlocosQuestoesControllerV2.js
 * 
 * Controller refatorado para gerenciar blocos e questões criadas por colaboradores
 * com fluxo completo de aprovação administrada por admins
 * 
 * IMPORTANTE: Colaboradores trabalham APENAS na disciplina que se inscreveram
 */

import Questao from '../models/Questao.js';
import BlocoQuestoes from '../models/BlocoQuestoes.js';
import Usuario from '../models/User.js';
import { Op } from 'sequelize';

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

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
 * Validar se colaborador está na disciplina correta
 */
const validarDisciplinaColaborador = (userDisciplina, dadosDisciplina) => {
  // Se dados tiverem disciplina, deve bater com a do colaborador
  if (dadosDisciplina && dadosDisciplina !== userDisciplina) {
    return {
      valido: false,
      mensagem: `Você só pode criar conteúdo para a disciplina: ${userDisciplina}`
    };
  }
  return { valido: true };
};

/**
 * Validar se as opções da questão estão corretas (múltipla escolha)
 */
const validarOpcoes = (opcoes) => {
  if (!Array.isArray(opcoes) || opcoes.length === 0) {
    return {
      valido: false,
      mensagem: 'Questão de múltipla escolha deve ter pelo menos uma opção'
    };
  }

  if (opcoes.length < 2) {
    return {
      valido: false,
      mensagem: 'Questão deve ter no mínimo 2 opções'
    };
  }

  if (opcoes.length > 10) {
    return {
      valido: false,
      mensagem: 'Questão pode ter no máximo 10 opções'
    };
  }

  const temCorreta = opcoes.some(o => o.correta === true);
  if (!temCorreta) {
    return {
      valido: false,
      mensagem: 'Deve haver pelo menos uma opção marcada como correta'
    };
  }

  if (opcoes.some(o => !o.texto || typeof o.texto !== 'string')) {
    return {
      valido: false,
      mensagem: 'Todas as opções devem ter um texto válido'
    };
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

  if (dados.descricao && typeof dados.descricao !== 'string') {
    erros.push('Descrição deve ser uma string');
  }

  return erros;
};

// ════════════════════════════════════════════════════════════════════════════
// BLOCOS - ENDPOINTS DO COLABORADOR
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/colaborador/blocos
 * Criar novo bloco (colaborador)
 */
export const criarBlocoColaborador = async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    const colaboradorDisciplina = req.user.disciplina_colaborador;

    if (!colaboradorDisciplina) {
      return respostaErro(res, 403, 'Seu perfil de colaborador não tem uma disciplina atribuída');
    }

    // Validar dados
    const erros = validarDadosBloco(req.body);
    if (erros.length > 0) {
      return respostaErro(res, 400, 'Dados inválidos', erros);
    }

    // Criar bloco com status 'pendente' (aguardando aprovação)
    const novoBloco = await BlocoQuestoes.create({
      titulo: titulo.trim(),
      descricao: descricao ? descricao.trim() : null,
      disciplina: colaboradorDisciplina,
      dificuldade: req.body.dificuldade || 'medio',
      criado_por: req.user.id,
      status: 'pendente', // 🔴 NOVO STATUS: pendente (aguardando revisão do admin)
    });

    respostaSucesso(res, 201, novoBloco, 
      'Bloco criado com sucesso e aguardando aprovação do administrador');
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
      criado_por: req.user.id,
      disciplina: req.user.disciplina_colaborador // 🔴 GARANTIR DISCIPLINA
    };

    // Filtrar por status (pendente, aprovado, rejeitado)
    if (status && ['pendente', 'aprovado', 'rejeitado'].includes(status)) {
      where.status = status;
    }

    // Busca por título ou descrição
    if (busca.trim()) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${busca}%` } },
        { descricao: { [Op.like]: `%${busca}%` } }
      ];
    }

    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // Ordenação
    let order = [['created_at', 'DESC']];
    if (ordenar === 'titulo') {
      order = [['titulo', 'ASC']];
    }

    const { count, rows } = await BlocoQuestoes.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset,
      order,
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    // Estatísticas
    const pendentes = await BlocoQuestoes.count({
      where: { criado_por: req.user.id, status: 'pendente' }
    });
    const aprovados = await BlocoQuestoes.count({
      where: { criado_por: req.user.id, status: 'aprovado' }
    });
    const rejeitados = await BlocoQuestoes.count({
      where: { criado_por: req.user.id, status: 'rejeitado' }
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
        pendentes,
        aprovados,
        rejeitados
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
        criado_por: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      },
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'nome', 'email']
        },
        {
          model: Usuario,
          as: 'aprovadorAdmin',
          attributes: ['id', 'nome', 'email'],
          foreignKey: 'aprovado_por_id'
        }
      ]
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
 * Atualizar bloco próprio (apenas se status = 'pendente')
 */
export const atualizarBlocoColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao } = req.body;

    // Validar dados
    const erros = validarDadosBloco(req.body, true);
    if (erros.length > 0) {
      return respostaErro(res, 400, 'Dados inválidos', erros);
    }

    const bloco = await BlocoQuestoes.findOne({
      where: {
        id,
        criado_por: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!bloco) {
      return respostaErro(res, 404, 'Bloco não encontrado');
    }

    // ⚠️ IMPORTANTE: Pode editar apenas se status = 'pendente'
    if (bloco.status !== 'pendente') {
      return respostaErro(res, 403, 
        `Bloco com status '${bloco.status}' não pode ser editado. Apenas blocos pendentes podem ser editados.`);
    }

    // Atualizar campos
    if (titulo) bloco.titulo = titulo.trim();
    if (descricao !== undefined) bloco.descricao = descricao ? descricao.trim() : null;

    await bloco.save();

    respostaSucesso(res, 200, bloco, 'Bloco atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar bloco:', error);
    respostaErro(res, 500, 'Erro ao atualizar bloco', { detalhes: error.message });
  }
};

/**
 * DELETE /api/colaborador/blocos/:id
 * Deletar bloco próprio (apenas se status = 'pendente' ou 'rejeitado')
 */
export const deletarBlocoColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    const bloco = await BlocoQuestoes.findOne({
      where: {
        id,
        criado_por: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!bloco) {
      return respostaErro(res, 404, 'Bloco não encontrado');
    }

    // ⚠️ IMPORTANTE: Pode deletar apenas se status = 'pendente' ou 'rejeitado'
    if (!['pendente', 'rejeitado'].includes(bloco.status)) {
      return respostaErro(res, 403, 
        `Bloco com status '${bloco.status}' não pode ser deletado. Apenas blocos pendentes ou rejeitados podem ser deletados.`);
    }

    await bloco.destroy();

    respostaSucesso(res, 200, null, 'Bloco deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar bloco:', error);
    respostaErro(res, 500, 'Erro ao deletar bloco', { detalhes: error.message });
  }
};

/**
 * POST /api/colaborador/blocos/:id/submeter
 * Colaborador submete bloco para aprovação do admin
 * Mantém status 'pendente' que significa "aguardando aprovação do admin"
 */
export const submeterBlocoColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    const bloco = await BlocoQuestoes.findOne({
      where: {
        id,
        criado_por: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!bloco) {
      return respostaErro(res, 404, 'Bloco não encontrado');
    }

    // ⚠️ IMPORTANTE: Pode submeter apenas blocos com status 'pendente'
    if (bloco.status !== 'pendente') {
      return respostaErro(res, 403, 
        `Bloco com status '${bloco.status}' não pode ser submetido. Apenas blocos pendentes podem ser submetidos.`);
    }

    // Validar que o bloco tem pelo menos 1 questão
    const totalQuestoes = await Questao.count({
      where: { bloco_id: id }
    });

    if (totalQuestoes === 0) {
      return respostaErro(res, 400, 
        'Bloco deve ter pelo menos uma questão antes de ser submetido para aprovação.');
    }

    // Bloco já está em status 'pendente' (aguardando aprovação)
    // Apenas confirmar que foi submetido
    await bloco.save();

    respostaSucesso(res, 200, bloco, 
      'Bloco submetido com sucesso! Um administrador irá revisar em breve.');
  } catch (error) {
    console.error('Erro ao submeter bloco:', error);
    respostaErro(res, 500, 'Erro ao submeter bloco', { detalhes: error.message });
  }
};

/**
 * POST /api/colaborador/blocos/:id/questoes
 * Adicionar questão existente a um bloco (colaborador)
 */
export const adicionarQuestaoAoBlocoColaborador = async (req, res) => {
  try {
    const { id, questaoId } = req.params; // bloco_id e questao_id
    
    console.log(`📝 Tentando adicionar questão ao bloco:`, { blocoId: id, questaoId, userId: req.user.id });
    
    if (!questaoId) {
      return respostaErro(res, 400, 'questaoId é obrigatório');
    }

    // Verificar se bloco existe e pertence ao colaborador
    const bloco = await BlocoQuestoes.findOne({
      where: {
        id,
        criado_por: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!bloco) {
      console.error(`❌ Bloco não encontrado: id=${id}, criado_por=${req.user.id}, disciplina=${req.user.disciplina_colaborador}`);
      return respostaErro(res, 404, 'Bloco não encontrado');
    }

    console.log(`✅ Bloco encontrado: ${bloco.id}, status: ${bloco.status}`);

    // ⚠️ Pode adicionar questões apenas se bloco está em 'pendente'
    if (bloco.status !== 'pendente') {
      return respostaErro(res, 403, 
        `Não é possível adicionar questões a um bloco com status '${bloco.status}'.`);
    }

    // Verificar se questão existe e pertence ao colaborador
    const questao = await Questao.findOne({
      where: {
        id: questaoId,
        autor_id: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!questao) {
      console.error(`❌ Questão não encontrada: id=${questaoId}, autor_id=${req.user.id}, disciplina=${req.user.disciplina_colaborador}`);
      return respostaErro(res, 404, 'Questão não encontrada ou não pertence a você');
    }

    console.log(`✅ Questão encontrada: ${questao.id}`);

    // ⚠️ Questão já está em um bloco?
    if (questao.bloco_id && questao.bloco_id !== id) {
      console.warn(`⚠️ Questão já associada a outro bloco: ${questao.bloco_id}`);
      return respostaErro(res, 400, 
        'Questão já está associada a outro bloco. Remova dela primeiro.');
    }

    // Contar quantas questões já existem no bloco
    const totalQuestoes = await Questao.count({
      where: { bloco_id: id }
    });

    if (totalQuestoes >= 30) {
      return respostaErro(res, 400, 
        'Bloco atingiu o limite máximo de 30 questões.');
    }

    // Associar questão ao bloco
    questao.bloco_id = id;
    await questao.save();

    console.log(`✅ Questão adicionada ao bloco com sucesso: questão_id=${questao.id}, bloco_id=${id}`);
    respostaSucesso(res, 200, questao, 'Questão adicionada ao bloco com sucesso');
  } catch (error) {
    console.error('❌ Erro ao adicionar questão ao bloco:', error);
    respostaErro(res, 500, 'Erro ao adicionar questão', { detalhes: error.message });
  }
};

/**
 * DELETE /api/colaborador/blocos/:id/questoes/:questaoId
 * Remover questão de um bloco (colaborador)
 */
export const removerQuestaoDoBlocoColaborador = async (req, res) => {
  try {
    const { id: blocoId, questaoId } = req.params;

    // Verificar se bloco existe e pertence ao colaborador
    const bloco = await BlocoQuestoes.findOne({
      where: {
        id: blocoId,
        criado_por: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!bloco) {
      return respostaErro(res, 404, 'Bloco não encontrado');
    }

    // ⚠️ Pode remover questões apenas se bloco está em 'pendente'
    if (bloco.status !== 'pendente') {
      return respostaErro(res, 403, 
        `Não é possível remover questões de um bloco com status '${bloco.status}'.`);
    }

    // Verificar se questão existe, pertence ao colaborador, e está no bloco
    const questao = await Questao.findOne({
      where: {
        id: questaoId,
        autor_id: req.user.id,
        bloco_id: blocoId,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!questao) {
      return respostaErro(res, 404, 
        'Questão não encontrada neste bloco ou não pertence a você');
    }

    // Desassociar questão do bloco (não deleta a questão, apenas remove a associação)
    questao.bloco_id = null;
    await questao.save();

    respostaSucesso(res, 200, questao, 'Questão removida do bloco com sucesso');
  } catch (error) {
    console.error('Erro ao remover questão do bloco:', error);
    respostaErro(res, 500, 'Erro ao remover questão', { detalhes: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// QUESTÕES - ENDPOINTS DO COLABORADOR
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/colaborador/questoes
 * Criar nova questão (colaborador)
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
      resposta_correta,
      resposta_esperada,
      explicacao
    } = req.body;

    const colaboradorDisciplina = req.user.disciplina_colaborador;

    if (!colaboradorDisciplina) {
      return respostaErro(res, 403, 'Seu perfil de colaborador não tem uma disciplina atribuída');
    }

    // Validar dados
    const erros = validarDadosQuestao(req.body);
    if (erros.length > 0) {
      return respostaErro(res, 400, 'Dados inválidos', erros);
    }

    // Se tiver bloco_id, verificar se pertence ao colaborador
    if (bloco_id) {
      const bloco = await BlocoQuestoes.findOne({
        where: {
          id: bloco_id,
          criado_por: req.user.id,
          disciplina: colaboradorDisciplina // 🔴 VALIDAR DISCIPLINA
        }
      });

      if (!bloco) {
        return respostaErro(res, 403, 
          'Bloco não encontrado ou não pertence a você');
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
      disciplina: colaboradorDisciplina,
      status_aprovacao: 'pendente', // 🔴 NOVO: questão colaborador começa com status 'pendente'
      bloco_id: bloco_id || null
    };

    // Adicionar campos específicos do tipo
    if (tipo === 'multipla_escolha') {
      dadosQuestao.opcoes = opcoes;
      dadosQuestao.resposta_correta = resposta_correta || resposta_esperada;
    } else if (tipo === 'texto' || tipo === 'codigo') {
      dadosQuestao.resposta_correta = resposta_correta || resposta_esperada;
      dadosQuestao.explicacao = explicacao;
    }

    const novaQuestao = await Questao.create(dadosQuestao);

    respostaSucesso(res, 201, novaQuestao, 
      'Questão criada com sucesso e aguardando aprovação do administrador');
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
      autor_id: req.user.id,
      disciplina: req.user.disciplina_colaborador // 🔴 GARANTIR DISCIPLINA
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

    // Busca
    if (busca.trim()) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${busca}%` } },
        { descricao: { [Op.like]: `%${busca}%` } }
      ];
    }

    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // Ordenação
    let order = [['created_at', 'DESC']];
    if (ordenar === 'titulo') {
      order = [['titulo', 'ASC']];
    }

    const { count, rows } = await Questao.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset,
      order,
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nome', 'email']
        },
        {
          model: Usuario,
          as: 'revisadoPor',
          attributes: ['id', 'nome', 'email'],
          foreignKey: 'revisado_por'
        }
      ]
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
        autor_id: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      },
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nome', 'email']
        },
        {
          model: Usuario,
          as: 'revisadoPor',
          attributes: ['id', 'nome', 'email'],
          foreignKey: 'revisado_por'
        }
      ]
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
 * Atualizar questão própria (apenas se status = 'pendente')
 */
export const atualizarQuestaoColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar dados
    const erros = validarDadosQuestao(req.body, true);
    if (erros.length > 0) {
      return respostaErro(res, 400, 'Dados inválidos', erros);
    }

    const questao = await Questao.findOne({
      where: {
        id,
        autor_id: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!questao) {
      return respostaErro(res, 404, 'Questão não encontrada');
    }

    // ⚠️ IMPORTANTE: Pode editar apenas se status = 'pendente'
    if (questao.status_aprovacao !== 'pendente') {
      return respostaErro(res, 403, 
        `Questão com status '${questao.status_aprovacao}' não pode ser editada. Apenas questões pendentes podem ser editadas.`);
    }

    // Atualizar campos
    const { titulo, descricao, tipo, dificuldade, pontos, opcoes, resposta_correta, resposta_esperada, explicacao } = req.body;

    if (titulo) questao.titulo = titulo.trim();
    if (descricao !== undefined) questao.descricao = descricao.trim();
    if (tipo) questao.tipo = tipo;
    if (dificuldade) questao.dificuldade = dificuldade;
    if (pontos) questao.pontos = pontos;

    if (tipo === 'multipla_escolha' && opcoes) {
      questao.opcoes = opcoes;
      questao.resposta_correta = resposta_correta || resposta_esperada;
    } else if ((tipo === 'texto' || tipo === 'codigo') && (resposta_correta || resposta_esperada)) {
      questao.resposta_correta = resposta_correta || resposta_esperada;
      questao.explicacao = explicacao;
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
 * Deletar questão própria (apenas se status = 'pendente' ou 'rejeitada')
 */
export const deletarQuestaoColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    const questao = await Questao.findOne({
      where: {
        id,
        autor_id: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!questao) {
      return respostaErro(res, 404, 'Questão não encontrada');
    }

    // ⚠️ IMPORTANTE: Pode deletar apenas se status = 'pendente' ou 'rejeitada'
    if (!['pendente', 'rejeitada'].includes(questao.status_aprovacao)) {
      return respostaErro(res, 403, 
        `Questão com status '${questao.status_aprovacao}' não pode ser deletada. Apenas questões pendentes ou rejeitadas podem ser deletadas.`);
    }

    await questao.destroy();

    respostaSucesso(res, 200, null, 'Questão deletada com sucesso');
  } catch (error) {
    console.error('Erro ao deletar questão:', error);
    respostaErro(res, 500, 'Erro ao deletar questão', { detalhes: error.message });
  }
};

/**
 * POST /api/colaborador/questoes/:id/submeter
 * Colaborador submete questão para aprovação do admin
 * Mantém status 'pendente' que significa "aguardando aprovação do admin"
 */
export const submeterQuestaoColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    const questao = await Questao.findOne({
      where: {
        id,
        autor_id: req.user.id,
        disciplina: req.user.disciplina_colaborador // 🔴 VALIDAR DISCIPLINA
      }
    });

    if (!questao) {
      return respostaErro(res, 404, 'Questão não encontrada');
    }

    // ⚠️ IMPORTANTE: Pode submeter apenas questões com status 'pendente'
    if (questao.status_aprovacao !== 'pendente') {
      return respostaErro(res, 403, 
        `Questão com status '${questao.status_aprovacao}' não pode ser submetida. Apenas questões pendentes podem ser submetidas.`);
    }

    // Questão já está em status 'pendente' (aguardando aprovação)
    // Apenas confirmar que foi submetida
    await questao.save();

    respostaSucesso(res, 200, questao, 
      'Questão submetida com sucesso! Um administrador irá revisar em breve.');
  } catch (error) {
    console.error('Erro ao submeter questão:', error);
    respostaErro(res, 500, 'Erro ao submeter questão', { detalhes: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// ADMIN - ENDPOINTS DE APROVAÇÃO
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/admin/blocos-colaboradores-pendentes
 * Listar blocos de colaboradores pendentes de aprovação (admin)
 */
export const listarBlocosPendentesAdmin = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 20,
      status = 'pendente',
      disciplina,
      colaborador_id,
      busca = '',
      ordenar = 'data'
    } = req.query;

    const where = {};

    // Status (padrão: pendente)
    if (status && ['pendente', 'aprovado', 'rejeitado'].includes(status)) {
      where.status = status;
    }

    // Filtro por disciplina
    if (disciplina && ['matematica', 'ingles', 'programacao'].includes(disciplina)) {
      where.disciplina = disciplina;
    }

    // Filtro por colaborador
    if (colaborador_id) {
      where.criado_por = colaborador_id;
    }

    // Busca
    if (busca.trim()) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${busca}%` } },
        { descricao: { [Op.like]: `%${busca}%` } }
      ];
    }

    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // Ordenação
    let order = [['created_at', 'DESC']];
    if (ordenar === 'titulo') {
      order = [['titulo', 'ASC']];
    } else if (ordenar === 'colaborador') {
      order = [['criado_por', 'ASC']];
    }

    const { count, rows } = await BlocoQuestoes.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset,
      order,
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'nome', 'email', 'disciplina_colaborador']
        },
        {
          model: Usuario,
          as: 'aprovadorAdmin',
          attributes: ['id', 'nome', 'email'],
          foreignKey: 'aprovado_por_id'
        }
      ]
    });

    // Estatísticas
    const totalPendentes = await BlocoQuestoes.count({ where: { status: 'pendente' } });
    const totalAprovados = await BlocoQuestoes.count({ where: { status: 'aprovado' } });
    const totalRejeitados = await BlocoQuestoes.count({ where: { status: 'rejeitado' } });

    respostaSucesso(res, 200, {
      blocos: rows,
      paginacao: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total: count,
        totalPaginas: Math.ceil(count / parseInt(limite))
      },
      estatisticas: {
        pendentes: totalPendentes,
        aprovados: totalAprovados,
        rejeitados: totalRejeitados
      }
    }, 'Blocos pendentes listados com sucesso');
  } catch (error) {
    console.error('Erro ao listar blocos pendentes:', error);
    respostaErro(res, 500, 'Erro ao listar blocos', { detalhes: error.message });
  }
};

/**
 * POST /api/admin/blocos/:id/aprovar
 * Aprovar bloco de colaborador (admin)
 */
export const aprovarBlocoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const bloco = await BlocoQuestoes.findByPk(id);

    if (!bloco) {
      return respostaErro(res, 404, 'Bloco não encontrado');
    }

    // Verificar se já foi aprovado/rejeitado
    if (bloco.status !== 'pendente') {
      return respostaErro(res, 400, 
        `Bloco já foi ${bloco.status}. Não é possível aprovar novamente.`);
    }

    // Atualizar status
    bloco.status = 'aprovado';
    bloco.aprovado_por_id = req.user.id;
    bloco.data_aprovacao = new Date();
    bloco.observacoes_admin = observacoes || null;

    await bloco.save();

    respostaSucesso(res, 200, bloco, 'Bloco aprovado com sucesso!');
  } catch (error) {
    console.error('Erro ao aprovar bloco:', error);
    respostaErro(res, 500, 'Erro ao aprovar bloco', { detalhes: error.message });
  }
};

/**
 * POST /api/admin/blocos/:id/rejeitar
 * Rejeitar bloco de colaborador (admin)
 */
export const rejeitarBlocoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_rejeicao, observacoes } = req.body;

    if (!motivo_rejeicao || motivo_rejeicao.trim().length === 0) {
      return respostaErro(res, 400, 'Motivo da rejeição é obrigatório');
    }

    const bloco = await BlocoQuestoes.findByPk(id);

    if (!bloco) {
      return respostaErro(res, 404, 'Bloco não encontrado');
    }

    // Verificar se já foi aprovado/rejeitado
    if (bloco.status !== 'pendente') {
      return respostaErro(res, 400, 
        `Bloco já foi ${bloco.status}. Não é possível rejeitar novamente.`);
    }

    // Atualizar status
    bloco.status = 'rejeitado';
    bloco.motivo_rejeicao = motivo_rejeicao.trim();
    bloco.observacoes_admin = observacoes || null;

    await bloco.save();

    respostaSucesso(res, 200, bloco, 'Bloco rejeitado. Colaborador foi notificado.');
  } catch (error) {
    console.error('Erro ao rejeitar bloco:', error);
    respostaErro(res, 500, 'Erro ao rejeitar bloco', { detalhes: error.message });
  }
};

/**
 * GET /api/admin/questoes-colaborador-pendentes
 * Listar questões de colaboradores pendentes de aprovação (admin)
 */
export const listarQuestoesPendentesAdmin = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 20,
      status = 'pendente',
      dificuldade,
      tipo,
      disciplina,
      colaborador_id,
      bloco_id,
      busca = '',
      ordenar = 'data'
    } = req.query;

    const where = {};

    // Status (padrão: pendente)
    if (status && ['pendente', 'aprovada', 'rejeitada'].includes(status)) {
      where.status_aprovacao = status;
    }

    // Filtros adicionais
    if (dificuldade && ['facil', 'medio', 'dificil'].includes(dificuldade)) {
      where.dificuldade = dificuldade;
    }

    if (tipo && ['multipla_escolha', 'texto', 'codigo'].includes(tipo)) {
      where.tipo = tipo;
    }

    if (disciplina && ['matematica', 'ingles', 'programacao'].includes(disciplina)) {
      where.disciplina = disciplina;
    }

    if (colaborador_id) {
      where.autor_id = colaborador_id;
    }

    if (bloco_id) {
      where.bloco_id = bloco_id;
    }

    // Busca
    if (busca.trim()) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${busca}%` } },
        { descricao: { [Op.like]: `%${busca}%` } }
      ];
    }

    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // Ordenação
    let order = [['created_at', 'DESC']];
    if (ordenar === 'titulo') {
      order = [['titulo', 'ASC']];
    } else if (ordenar === 'dificuldade') {
      order = [['dificuldade', 'ASC']];
    } else if (ordenar === 'colaborador') {
      order = [['autor_id', 'ASC']];
    }

    const { count, rows } = await Questao.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset,
      order,
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nome', 'email', 'disciplina_colaborador']
        },
        {
          model: Usuario,
          as: 'revisadoPor',
          attributes: ['id', 'nome', 'email'],
          foreignKey: 'revisado_por'
        }
      ]
    });

    // Estatísticas
    const totalPendentes = await Questao.count({ where: { status_aprovacao: 'pendente' } });
    const totalAprovadas = await Questao.count({ where: { status_aprovacao: 'aprovada' } });
    const totalRejeitadas = await Questao.count({ where: { status_aprovacao: 'rejeitada' } });

    respostaSucesso(res, 200, {
      questoes: rows,
      paginacao: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total: count,
        totalPaginas: Math.ceil(count / parseInt(limite))
      },
      estatisticas: {
        pendentes: totalPendentes,
        aprovadas: totalAprovadas,
        rejeitadas: totalRejeitadas,
        por_disciplina: {
          matematica: await Questao.count({ where: { disciplina: 'matematica', status_aprovacao: 'pendente' } }),
          ingles: await Questao.count({ where: { disciplina: 'ingles', status_aprovacao: 'pendente' } }),
          programacao: await Questao.count({ where: { disciplina: 'programacao', status_aprovacao: 'pendente' } })
        }
      }
    }, 'Questões pendentes listadas com sucesso');
  } catch (error) {
    console.error('Erro ao listar questões pendentes:', error);
    respostaErro(res, 500, 'Erro ao listar questões', { detalhes: error.message });
  }
};

/**
 * POST /api/admin/questoes/:id/aprovar
 * Aprovar questão de colaborador (admin)
 */
export const aprovarQuestaoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const questao = await Questao.findByPk(id);

    if (!questao) {
      return respostaErro(res, 404, 'Questão não encontrada');
    }

    // Verificar se já foi revisada
    if (questao.status_aprovacao !== 'pendente') {
      return respostaErro(res, 400, 
        `Questão já foi ${questao.status_aprovacao}. Não é possível aprovar novamente.`);
    }

    // Atualizar status
    questao.status_aprovacao = 'aprovada';
    questao.revisado_por = req.user.id;
    questao.revisado_em = new Date();
    questao.motivo_rejeicao = null; // Limpar motivo se houver

    await questao.save();

    respostaSucesso(res, 200, questao, 'Questão aprovada com sucesso!');
  } catch (error) {
    console.error('Erro ao aprovar questão:', error);
    respostaErro(res, 500, 'Erro ao aprovar questão', { detalhes: error.message });
  }
};

/**
 * POST /api/admin/questoes/:id/rejeitar
 * Rejeitar questão de colaborador (admin)
 */
export const rejeitarQuestaoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_rejeicao, observacoes } = req.body;

    if (!motivo_rejeicao || motivo_rejeicao.trim().length === 0) {
      return respostaErro(res, 400, 'Motivo da rejeição é obrigatório');
    }

    const questao = await Questao.findByPk(id);

    if (!questao) {
      return respostaErro(res, 404, 'Questão não encontrada');
    }

    // Verificar se já foi revisada
    if (questao.status_aprovacao !== 'pendente') {
      return respostaErro(res, 400, 
        `Questão já foi ${questao.status_aprovacao}. Não é possível rejeitar novamente.`);
    }

    // Atualizar status
    questao.status_aprovacao = 'rejeitada';
    questao.revisado_por = req.user.id;
    questao.revisado_em = new Date();
    questao.motivo_rejeicao = motivo_rejeicao.trim();

    await questao.save();

    respostaSucesso(res, 200, questao, 'Questão rejeitada. Colaborador foi notificado.');
  } catch (error) {
    console.error('Erro ao rejeitar questão:', error);
    respostaErro(res, 500, 'Erro ao rejeitar questão', { detalhes: error.message });
  }
};

/**
 * GET /api/admin/colaboradores/:colaboradorId/questoes
 * Admin: Listar todas as questões criadas por um colaborador específico
 * 
 * Query params:
 *   - status: 'pendente', 'aprovada', 'rejeitada' (filtrar por status)
 *   - tipo: tipo de questão
 *   - dificuldade: fácil, média, difícil
 *   - pagina: número da página (default: 1)
 *   - limite: itens por página (default: 20)
 */
export const listarQuestoesColaboradorAdmin = async (req, res) => {
  try {
    const { colaboradorId } = req.params;
    const { status, tipo, dificuldade, pagina = 1, limite = 20 } = req.query;

    if (!colaboradorId) {
      return respostaErro(res, 400, 'ID do colaborador é obrigatório');
    }

    // Validar que colaborador existe
    const colaborador = await Usuario.findByPk(colaboradorId);
    if (!colaborador) {
      return respostaErro(res, 404, 'Colaborador não encontrado');
    }

    // Construir filtro
    const filtro = {
      usuario_id: colaboradorId
    };

    if (status) {
      filtro.status_aprovacao = status;
    }

    if (tipo) {
      filtro.tipo = tipo;
    }

    if (dificuldade) {
      filtro.dificuldade = dificuldade;
    }

    // Paginação
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // Buscar questões com associações
    const { count, rows } = await Questao.findAndCountAll({
      where: filtro,
      include: [
        {
          model: Bloco,
          as: 'bloco',
          attributes: ['id', 'titulo', 'descricao'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limite),
      offset: offset,
      raw: false,
      subQuery: false
    });

    const totalPaginas = Math.ceil(count / parseInt(limite));

    return respostaSucesso(
      res,
      200,
      {
        questoes: rows,
        paginacao: {
          total: count,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: totalPaginas
        }
      },
      'Questões do colaborador listadas com sucesso'
    );
  } catch (error) {
    console.error('❌ Erro ao listar questões do colaborador:', error);
    return respostaErro(res, 500, 'Erro ao listar questões do colaborador', { detalhes: error.message });
  }
};
