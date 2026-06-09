/**
 * BlocosController.js
 * Controller para gestão de Blocos de Questões.
 *
 * Endpoints:
 *   GET    /api/blocos                    — listar blocos
 *   POST   /api/blocos                    — criar bloco (admin)
 *   GET    /api/blocos/:id                — detalhe do bloco
 *   PUT    /api/blocos/:id                — editar bloco (admin)
 *   DELETE /api/blocos/:id                — deletar bloco (admin)
 *   POST   /api/blocos/:id/questoes       — adicionar questão ao bloco
 *   DELETE /api/blocos/:id/questoes/:qid  — remover questão do bloco
 *   GET    /api/torneios/:id/blocos       — blocos de um torneio
 *   POST   /api/torneios/:id/blocos       — associar bloco ao torneio
 *   DELETE /api/torneios/:id/blocos/:bid  — desassociar bloco do torneio
 */

import { Op } from 'sequelize';
import BlocoQuestoes from '../models/BlocoQuestoes.js';
import BlocoQuestaoItem from '../models/BlocoQuestaoItem.js';
import TorneioBloco from '../models/TorneioBloco.js';
import QuestaoTesteConhecimento from '../models/QuestaoTesteConhecimento.js';
import Torneio from '../models/Torneio.js';

const MAX_QUESTOES_POR_BLOCO = 30;

// ── Helpers ───────────────────────────────────────────────────────────────────

const ok = (res, data, msg = '', status = 200) =>
  res.status(status).json({ success: true, message: msg, data });

const err = (res, msg, status = 400, details = null) =>
  res.status(status).json({ success: false, error: msg, ...(details && { details }) });

// ── CRUD de Blocos ────────────────────────────────────────────────────────────

/**
 * GET /api/blocos
 * Lista blocos. Admin vê todos; colaborador vê apenas da sua disciplina.
 * Suporta filtro por contexto (torneio/teste)
 */
export const listarBlocos = async (req, res) => {
  try {
    const { disciplina, dificuldade, status, contexto, page = 1, limit = 50 } = req.query;
    const where = {};

    // Filtrar por contexto se fornecido
    if (contexto) {
      where.contexto = contexto;  // ✅ NOVO: Filtrar por contexto
    }

    // Colaborador só vê sua disciplina
    if (req.user?.isColaborador) {
      where.disciplina = req.user.disciplina_colaborador;
    } else if (disciplina) {
      where.disciplina = disciplina;
    }

    if (dificuldade) where.dificuldade = dificuldade;
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await BlocoQuestoes.findAndCountAll({
      where,
      limit: Math.min(parseInt(limit), 100),
      offset,
      order: [['created_at', 'DESC']],
    });

    // Contar questões de cada bloco
    const blocosComContagem = await Promise.all(
      rows.map(async (bloco) => {
        const totalQuestoes = await BlocoQuestaoItem.count({
          where: { bloco_id: bloco.id },
        });
        return { ...bloco.toJSON(), total_questoes: totalQuestoes };
      })
    );

    return ok(res, {
      blocos: blocosComContagem,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error('❌ Erro ao listar blocos:', error);
    return err(res, 'Erro ao listar blocos', 500, error.message);
  }
};

/**
 * POST /api/blocos
 * Cria um novo bloco. Admin only.
 * Suporta contexto (torneio/teste) para organizar blocos
 */
export const criarBloco = async (req, res) => {
  try {
    const { titulo, descricao, disciplina, dificuldade, status, contexto = 'torneio' } = req.body;

    if (!titulo?.trim()) return err(res, 'Título é obrigatório');
    if (!disciplina) return err(res, 'Disciplina é obrigatória');
    if (!dificuldade) return err(res, 'Dificuldade é obrigatória');

    const disciplinasValidas = ['matematica', 'ingles', 'programacao'];
    const dificuldadesValidas = ['facil', 'medio', 'dificil'];
    const statusValidos = ['rascunho', 'publicado'];

    if (!disciplinasValidas.includes(disciplina))
      return err(res, `Disciplina inválida. Use: ${disciplinasValidas.join(', ')}`);
    if (!dificuldadesValidas.includes(dificuldade))
      return err(res, `Dificuldade inválida. Use: ${dificuldadesValidas.join(', ')}`);
    if (status && !statusValidos.includes(status))
      return err(res, `Status inválido. Use: ${statusValidos.join(', ')}`);

    const bloco = await BlocoQuestoes.create({
      titulo: titulo.trim(),
      descricao: descricao?.trim() || null,
      disciplina,
      dificuldade,
      status: status || 'rascunho',
      contexto: contexto || 'torneio',  // ✅ NOVO: Armazenar contexto
      criado_por: req.user.id,
    });

    console.log(`✅ Bloco criado: ID ${bloco.id} — "${bloco.titulo}" (contexto: ${contexto}, status: ${bloco.status})`);
    return ok(res, { ...bloco.toJSON(), total_questoes: 0 }, 'Bloco criado com sucesso', 201);
  } catch (error) {
    console.error('❌ Erro ao criar bloco:', error);
    return err(res, 'Erro ao criar bloco', 500, error.message);
  }
};

/**
 * GET /api/blocos/:id
 * Detalhe do bloco com lista de questões.
 */
export const obterBloco = async (req, res) => {
  try {
    const { id } = req.params;

    const bloco = await BlocoQuestoes.findByPk(id);
    if (!bloco) return err(res, 'Bloco não encontrado', 404);

    // Colaborador só acessa sua disciplina
    if (req.user?.isColaborador && bloco.disciplina !== req.user.disciplina_colaborador) {
      return err(res, 'Acesso negado', 403);
    }

    // Buscar questões do bloco com dados completos
    const items = await BlocoQuestaoItem.findAll({
      where: { bloco_id: id },
      include: [{
        model: QuestaoTesteConhecimento,
        as: 'questao',
        attributes: ['id', 'enunciado', 'opcoes', 'resposta_correta', 'dificuldade', 'categoria', 'pontos', 'ativo'],
      }],
      order: [['ordem', 'ASC']],
    });

    // ✅ Normalizar opcoes antes de retornar
    const questoes = items.map(item => {
      const questaoData = item.questao.toJSON();
      
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
        item_id: item.id,
        ordem: item.ordem,
        ...questaoData,
      };
    });

    return ok(res, { ...bloco.toJSON(), questoes, total_questoes: questoes.length });
  } catch (error) {
    console.error('❌ Erro ao obter bloco:', error);
    return err(res, 'Erro ao obter bloco', 500, error.message);
  }
};

/**
 * PUT /api/blocos/:id
 * Edita um bloco. Admin only.
 */
export const editarBloco = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, disciplina, dificuldade, status } = req.body;

    const bloco = await BlocoQuestoes.findByPk(id);
    if (!bloco) return err(res, 'Bloco não encontrado', 404);

    // Validar disciplina/dificuldade se fornecidos
    if (disciplina && !['matematica', 'ingles', 'programacao'].includes(disciplina))
      return err(res, 'Disciplina inválida');
    if (dificuldade && !['facil', 'medio', 'dificil'].includes(dificuldade))
      return err(res, 'Dificuldade inválida');
    if (status && !['rascunho', 'publicado'].includes(status))
      return err(res, 'Status inválido');

    const campos = {};
    if (titulo !== undefined) campos.titulo = titulo.trim();
    if (descricao !== undefined) campos.descricao = descricao?.trim() || null;
    if (disciplina !== undefined) campos.disciplina = disciplina;
    if (dificuldade !== undefined) campos.dificuldade = dificuldade;
    if (status !== undefined) campos.status = status;

    await bloco.update(campos);

    const totalQuestoes = await BlocoQuestaoItem.count({ where: { bloco_id: id } });
    console.log(`✅ Bloco atualizado: ID ${id}`);
    return ok(res, { ...bloco.toJSON(), total_questoes: totalQuestoes }, 'Bloco atualizado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao editar bloco:', error);
    return err(res, 'Erro ao editar bloco', 500, error.message);
  }
};

/**
 * DELETE /api/blocos/:id
 * Deleta um bloco. Admin only.
 * Bloqueado se o bloco estiver associado a algum torneio.
 */
export const deletarBloco = async (req, res) => {
  try {
    const { id } = req.params;

    const bloco = await BlocoQuestoes.findByPk(id);
    if (!bloco) return err(res, 'Bloco não encontrado', 404);

    // Verificar se está associado a algum torneio
    const associacoes = await TorneioBloco.count({ where: { bloco_id: id } });
    if (associacoes > 0) {
      return err(
        res,
        `Não é possível deletar este bloco pois está associado a ${associacoes} torneio(s). Desassocie primeiro.`,
        409
      );
    }

    await bloco.destroy();
    console.log(`✅ Bloco deletado: ID ${id}`);
    return ok(res, null, 'Bloco deletado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao deletar bloco:', error);
    return err(res, 'Erro ao deletar bloco', 500, error.message);
  }
};

// ── Questões dentro de um bloco ───────────────────────────────────────────────

/**
 * POST /api/blocos/:id/questoes
 * Adiciona uma questão ao bloco.
 */
export const adicionarQuestao = async (req, res) => {
  try {
    const { id } = req.params;
    const { questao_id, ordem } = req.body;

    if (!questao_id) return err(res, 'questao_id é obrigatório');

    const bloco = await BlocoQuestoes.findByPk(id);
    if (!bloco) return err(res, 'Bloco não encontrado', 404);

    // Verificar limite
    const count = await BlocoQuestaoItem.count({ where: { bloco_id: id } });
    if (count >= MAX_QUESTOES_POR_BLOCO) {
      return err(res, `Limite de ${MAX_QUESTOES_POR_BLOCO} questões por bloco atingido`, 422);
    }

    // Verificar se questão existe e pertence à mesma disciplina/categoria do bloco
    const questao = await QuestaoTesteConhecimento.findByPk(questao_id);
    if (!questao) return err(res, 'Questão não encontrada', 404);
    if (!questao.ativo) return err(res, 'Questão inativa não pode ser adicionada ao bloco', 422);
    if (questao.categoria !== bloco.disciplina) {
      return err(
        res,
        `Questão de categoria "${questao.categoria}" não pode ser adicionada a bloco de disciplina "${bloco.disciplina}"`,
        422
      );
    }

    // Verificar se já está no bloco
    const jaExiste = await BlocoQuestaoItem.findOne({
      where: { bloco_id: id, questao_id },
    });
    if (jaExiste) return err(res, 'Questão já está neste bloco', 409);

    const item = await BlocoQuestaoItem.create({
      bloco_id: parseInt(id),
      questao_id: parseInt(questao_id),
      ordem: ordem ?? count,
    });

    console.log(`✅ Questão ${questao_id} adicionada ao bloco ${id}`);
    return ok(res, item, 'Questão adicionada ao bloco', 201);
  } catch (error) {
    console.error('❌ Erro ao adicionar questão ao bloco:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return err(res, 'Questão já está neste bloco', 409);
    }
    return err(res, 'Erro ao adicionar questão', 500, error.message);
  }
};

/**
 * DELETE /api/blocos/:id/questoes/:qid
 * Remove uma questão do bloco (não deleta a questão).
 */
export const removerQuestao = async (req, res) => {
  try {
    const { id, qid } = req.params;

    const item = await BlocoQuestaoItem.findOne({
      where: { bloco_id: id, questao_id: qid },
    });
    if (!item) return err(res, 'Questão não encontrada neste bloco', 404);

    await item.destroy();
    console.log(`✅ Questão ${qid} removida do bloco ${id}`);
    return ok(res, null, 'Questão removida do bloco');
  } catch (error) {
    console.error('❌ Erro ao remover questão do bloco:', error);
    return err(res, 'Erro ao remover questão', 500, error.message);
  }
};

// ── Associação Torneio ↔ Bloco ────────────────────────────────────────────────

/**
 * GET /api/torneios/:id/blocos
 * Lista blocos associados a um torneio, com contagem de questões.
 */
export const listarBlocosDoTorneio = async (req, res) => {
  try {
    const { id } = req.params;

    const torneio = await Torneio.findByPk(id);
    if (!torneio) return err(res, 'Torneio não encontrado', 404);

    const associacoes = await TorneioBloco.findAll({
      where: { torneio_id: id },
      include: [{
        model: BlocoQuestoes,
        as: 'bloco',
      }],
      order: [['ordem', 'ASC']],
    });

    const blocos = await Promise.all(
      associacoes.map(async (assoc) => {
        // ✅ NOVO: Carregar questões do bloco
        const items = await BlocoQuestaoItem.findAll({
          where: { bloco_id: assoc.bloco_id },
          include: [{
            model: QuestaoTesteConhecimento,
            as: 'questao',
            attributes: ['id', 'enunciado', 'opcoes', 'resposta_correta', 'dificuldade', 'categoria', 'pontos', 'ativo'],
          }],
          order: [['ordem', 'ASC']],
        });

        // ✅ Normalizar questões
        const questoes = items.map(item => {
          const questaoData = item.questao.toJSON();
          
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
            item_id: item.id,
            ordem: item.ordem,
            ...questaoData,
          };
        });

        return {
          associacao_id: assoc.id,
          ordem: assoc.ordem,
          ...assoc.bloco.toJSON(),
          total_questoes: questoes.length,
          questoes, // ✅ NOVO: Incluir questões
        };
      })
    );

    return ok(res, { torneio_id: parseInt(id), blocos, total: blocos.length });
  } catch (error) {
    console.error('❌ Erro ao listar blocos do torneio:', error);
    return err(res, 'Erro ao listar blocos do torneio', 500, error.message);
  }
};

/**
 * POST /api/torneios/:id/blocos
 * Associa um bloco a um torneio. Admin only.
 */
export const associarBlocoAoTorneio = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloco_id, ordem } = req.body;

    if (!bloco_id) return err(res, 'bloco_id é obrigatório');

    const torneio = await Torneio.findByPk(id);
    if (!torneio) return err(res, 'Torneio não encontrado', 404);

    // Apenas torneios em rascunho ou ativos podem receber blocos
    if (['finalizado', 'cancelado'].includes(torneio.status)) {
      return err(res, `Não é possível associar blocos a um torneio ${torneio.status}`, 422);
    }

    const bloco = await BlocoQuestoes.findByPk(bloco_id);
    if (!bloco) return err(res, 'Bloco não encontrado', 404);

    // Verificar se bloco está publicado
    if (bloco.status !== 'publicado') {
      return err(res, 'Apenas blocos publicados podem ser associados a torneios', 422);
    }

    // Verificar se já está associado
    const jaAssociado = await TorneioBloco.findOne({
      where: { torneio_id: id, bloco_id },
    });
    if (jaAssociado) return err(res, 'Bloco já está associado a este torneio', 409);

    // Calcular ordem automática se não fornecida
    const totalBlocos = await TorneioBloco.count({ where: { torneio_id: id } });

    const assoc = await TorneioBloco.create({
      torneio_id: parseInt(id),
      bloco_id: parseInt(bloco_id),
      ordem: ordem ?? totalBlocos,
    });

    console.log(`✅ Bloco ${bloco_id} associado ao torneio ${id}`);
    return ok(res, assoc, 'Bloco associado ao torneio com sucesso', 201);
  } catch (error) {
    console.error('❌ Erro ao associar bloco ao torneio:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return err(res, 'Bloco já está associado a este torneio', 409);
    }
    return err(res, 'Erro ao associar bloco', 500, error.message);
  }
};

/**
 * DELETE /api/torneios/:id/blocos/:bid
 * Desassocia um bloco de um torneio. Admin only.
 */
export const desassociarBlocoDoTorneio = async (req, res) => {
  try {
    const { id, bid } = req.params;

    const torneio = await Torneio.findByPk(id);
    if (!torneio) return err(res, 'Torneio não encontrado', 404);

    // Apenas torneios em rascunho permitem desassociação
    if (!['rascunho', 'cancelado'].includes(torneio.status)) {
      return err(
        res,
        `Não é possível desassociar blocos de um torneio ${torneio.status}. Coloque o torneio em rascunho primeiro.`,
        422
      );
    }

    const assoc = await TorneioBloco.findOne({
      where: { torneio_id: id, bloco_id: bid },
    });
    if (!assoc) return err(res, 'Associação não encontrada', 404);

    await assoc.destroy();
    console.log(`✅ Bloco ${bid} desassociado do torneio ${id}`);
    return ok(res, null, 'Bloco desassociado do torneio');
  } catch (error) {
    console.error('❌ Erro ao desassociar bloco do torneio:', error);
    return err(res, 'Erro ao desassociar bloco', 500, error.message);
  }
};

/**
 * GET /api/questoes/quiz/:area?torneio_id=X
 * Carrega questões para o quiz.
 * Se torneio_id fornecido: busca questões dos blocos publicados do torneio.
 * Se não: comportamento atual (por categoria).
 * Usado pelo Teste.jsx — retrocompatível.
 */
export const carregarQuizComBlocos = async (req, res) => {
  try {
    const { area } = req.params;
    const { limit = 10, dificuldade, torneio_id } = req.query;

    const areaMap = {
      matematica: 'matematica',
      ingles: 'ingles',
      programacao: 'programacao',
    };

    const categoria = areaMap[area?.toLowerCase()];
    if (!categoria) {
      return res.status(400).json({ success: false, error: 'Área inválida. Use: matematica, ingles ou programacao' });
    }

    let questoes;
    let totalDisponivel;

    if (torneio_id) {
      // Modo torneio: buscar questões dos blocos associados ao torneio
      const torneio = await Torneio.findByPk(torneio_id);
      if (!torneio || torneio.status !== 'ativo') {
        return res.status(400).json({ success: false, error: 'Torneio não encontrado ou não está ativo' });
      }

      // Buscar IDs dos blocos publicados do torneio para esta disciplina
      const blocoIds = await TorneioBloco.findAll({
        where: { torneio_id },
        include: [{
          model: BlocoQuestoes,
          as: 'bloco',
          where: { disciplina: categoria, status: 'publicado' },
          attributes: ['id'],
        }],
        attributes: ['bloco_id'],
      });

      if (blocoIds.length === 0) {
        return res.json({ success: true, area: categoria, total: 0, data: [] });
      }

      const ids = blocoIds.map(b => b.bloco_id);

      // Buscar questões dos blocos
      const where = { bloco_id: { [Op.in]: ids } };
      const items = await BlocoQuestaoItem.findAll({
        where,
        include: [{
          model: QuestaoTesteConhecimento,
          as: 'questao',
          where: {
            ativo: true,
            ...(dificuldade && ['facil', 'medio', 'dificil'].includes(dificuldade) ? { dificuldade } : {}),
          },
          attributes: ['id', 'enunciado', 'opcoes', 'resposta_correta', 'dificuldade', 'categoria', 'pontos'],
        }],
      });

      totalDisponivel = items.length;

      // Embaralhar e limitar
      const shuffled = items.sort(() => Math.random() - 0.5).slice(0, Math.min(parseInt(limit), 20));
      questoes = shuffled.map(item => {
        let opcoes = item.questao.opcoes;
        if (typeof opcoes === 'string') { try { opcoes = JSON.parse(opcoes); } catch { opcoes = []; } }
        if (!Array.isArray(opcoes)) opcoes = [];
        return {
          id: item.questao.id,
          enunciado: item.questao.enunciado,
          opcoes,
          resposta_correta: item.questao.resposta_correta,
          dificuldade: item.questao.dificuldade,
          categoria: item.questao.categoria,
          pontos: item.questao.pontos,
        };
      });
    } else {
      // Modo padrão (retrocompatível): buscar por categoria
      const where = {
        categoria,
        ativo: true,
        ...(dificuldade && ['facil', 'medio', 'dificil'].includes(dificuldade) ? { dificuldade } : {}),
      };

      totalDisponivel = await QuestaoTesteConhecimento.count({ where });

      const rows = await QuestaoTesteConhecimento.findAll({
        where,
        order: QuestaoTesteConhecimento.sequelize.random(),
        limit: Math.min(parseInt(limit), 20),
        attributes: ['id', 'enunciado', 'opcoes', 'resposta_correta', 'dificuldade', 'categoria', 'pontos'],
      });

      questoes = rows.map(q => {
        let opcoes = q.opcoes;
        if (typeof opcoes === 'string') { try { opcoes = JSON.parse(opcoes); } catch { opcoes = []; } }
        if (!Array.isArray(opcoes)) opcoes = [];
        return {
          id: q.id,
          enunciado: q.enunciado,
          opcoes,
          resposta_correta: q.resposta_correta,
          dificuldade: q.dificuldade,
          categoria: q.categoria,
          pontos: q.pontos,
        };
      });
    }

    return res.json({ success: true, area: categoria, total: totalDisponivel, data: questoes });
  } catch (error) {
    console.error('❌ Erro ao carregar quiz:', error);
    return res.status(500).json({ success: false, error: error.message || 'Erro ao carregar questões' });
  }
};
