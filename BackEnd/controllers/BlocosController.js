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
import Questao from '../models/Questao.js';
import Torneio from '../models/Torneio.js';
import User from '../models/User.js';

const MAX_QUESTOES_POR_BLOCO = 30;

// ── Helpers 

const ok = (res, data, msg = '', status = 200) =>
  res.status(status).json({ success: true, message: msg, data });

const err = (res, msg, status = 400, details = null) =>
  res.status(status).json({ success: false, error: msg, ...(details && { details }) });

// ── CRUD de Blocos 

/**
 * GET /api/blocos
 * Lista blocos. Admin vê todos; colaborador vê apenas da sua disciplina.
 * Suporta filtro por contexto (torneio/teste)
 * ✅ NOVO: Retorna as questões dentro de cada bloco
 */
export const listarBlocos = async (req, res) => {
  try {
    const { disciplina, dificuldade, status, contexto, page = 1, limit = 50 } = req.query;
    const where = {};

    // Filtrar por contexto se fornecido
    if (contexto) {
      where.contexto = contexto;  // ✅ NOVO: Filtrar por contexto
    }

    // ✅ IMPORTANTE: Separar blocos do Admin vs Colaborador
    // Admin: vê blocos DELE ou blocos APROVADOS de colaboradores (para gerenciar torneios)
    // Colaborador: vê apenas seus próprios blocos
    if (req.user?.isColaborador) {
      console.log(`🔎 Usuário COLABORADOR ${req.user.id} (${req.user.nome}) solicitou blocos`);
      // Colaborador vê apenas SEUS blocos e sua disciplina
      where.disciplina = req.user.disciplina_colaborador;
      where.criado_por = req.user.id;  // ✅ Filtrar para ver apenas seus blocos
      console.log(`[SUCCESS] Filtro aplicado: disciplina = "${req.user.disciplina_colaborador}", criado_por = ${req.user.id}`);
    } else {
      console.log(`🔎 Usuário ADMIN ${req.user.id} (${req.user.nome}) solicitou blocos`);
      // Admin vê:
      // 1. Blocos criados por admin (role = 'admin') - SEM FILTRO DE STATUS (rascunho, aprovado, etc)
      // 2. Blocos APROVADOS de colaboradores (status = 'aprovado')
      // Não vê: blocos PENDENTES de colaboradores
      const admins = await User.findAll({
        attributes: ['id'],
        where: { role: 'admin' }  // ✅ Usar role = 'admin', não is_colaborador
      });
      const adminIds = admins.map(u => u.id);
      console.log(`[SUCCESS] Admin IDs encontrados: ${adminIds.join(', ')}`);
      
      // Usar OR: (criado por admin - qualquer status) OU (aprovado de colaborador)
      where[Op.or] = [
        { criado_por: { [Op.in]: adminIds } },  // Blocos do admin (todos os status)
        { status: 'aprovado' }  // Blocos aprovados (de colaboradores)
      ];
      console.log(`[SUCCESS] Filtro aplicado: (criado_por IN (${adminIds.join(', ')}) OR status = 'aprovado')`);
    }

    if (disciplina && req.user?.isColaborador) {
      // Colaborador não pode ver outras disciplinas, então ignorar filtro
    } else if (disciplina) {
      where.disciplina = disciplina;
    }

    if (dificuldade) where.dificuldade = dificuldade;
    if (status) {
      // Aceitar aliases: 'publicado' = 'aprovado' (vocabulário usado pelo frontend do admin)
      where.status = status === 'publicado' ? 'aprovado' : status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await BlocoQuestoes.findAndCountAll({
      where,
      limit: Math.min(parseInt(limit), 100),
      offset,
      order: [['created_at', 'DESC']],
    });

    // ✅ NOVO: Carregar questões e retornar dentro de cada bloco
    const blocosComQuestoes = await Promise.all(
      rows.map(async (bloco) => {
        const blocoJSON = bloco.toJSON();
        
        // Carregar questões do novo modelo (Questao com bloco_id)
        const questoesNovo = await Questao.findAll({
          where: { bloco_id: bloco.id },
          attributes: ['id', 'titulo', 'descricao', 'disciplina', 'tipo', 'dificuldade', 'pontos', 'status_aprovacao']
        });

        // Carregar questões do modelo antigo (via BlocoQuestaoItem)
        const questoesAntigas = await BlocoQuestaoItem.findAll({
          where: { bloco_id: bloco.id },
          include: [{
            model: QuestaoTesteConhecimento,
            as: 'questaoAntiga',  // ✅ Usar o alias correto definido nas associations
            attributes: ['id', 'enunciado', 'dificuldade', 'pontos']
          }]
        });

        // Combinar questões de ambos os modelos
        const questoesFormat = [
          ...questoesNovo.map(q => ({
            id: q.id,
            titulo: q.titulo,
            enunciado: q.descricao,
            disciplina: q.disciplina,
            tipo: q.tipo,
            dificuldade: q.dificuldade,
            pontos: q.pontos,
            status_aprovacao: q.status_aprovacao,
            modelo: 'novo'
          })),
          ...questoesAntigas.map(item => ({
            id: item.questaoAntiga?.id || item.questao_id,  // ✅ Usar questaoAntiga
            titulo: item.questaoAntiga?.enunciado?.substring(0, 100) || 'Sem título',
            enunciado: item.questaoAntiga?.enunciado,
            dificuldade: item.questaoAntiga?.dificuldade,
            pontos: item.questaoAntiga?.pontos,
            modelo: 'antigo'
          }))
        ];

        const totalQuestoes = questoesFormat.length;
        
        console.log(`📦 Bloco ${bloco.id} (${bloco.titulo}): ${questoesNovo.length} questões novo modelo + ${questoesAntigas.length} questões modelo antigo = ${totalQuestoes} total`);

        return {
          ...blocoJSON,
          questoes: questoesFormat,
          total_questoes: totalQuestoes
        };
      })
    );

    return ok(res, {
      blocos: blocosComQuestoes,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error('[ERROR] Erro ao listar blocos:', error);
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
    // status aceita vocabulário do admin (rascunho/publicado) e do modelo (pendente/aprovado)
    const statusValidos = ['rascunho', 'publicado', 'pendente', 'aprovado'];

    if (!disciplinasValidas.includes(disciplina))
      return err(res, `Disciplina inválida. Use: ${disciplinasValidas.join(', ')}`);
    if (!dificuldadesValidas.includes(dificuldade))
      return err(res, `Dificuldade inválida. Use: ${dificuldadesValidas.join(', ')}`);
    if (status && !statusValidos.includes(status))
      return err(res, `Status inválido. Use: rascunho ou publicado`);

    // Mapear vocabulário admin → modelo
    const statusModel = { rascunho: 'pendente', publicado: 'aprovado' };
    const statusFinal = statusModel[status] || status || 'pendente';

    const bloco = await BlocoQuestoes.create({
      titulo: titulo.trim(),
      descricao: descricao?.trim() || null,
      disciplina,
      dificuldade,
      status: statusFinal,
      contexto: contexto || 'torneio',
      criado_por: req.user.id,
    });

    console.log(`[SUCCESS] Bloco criado: ID ${bloco.id} — "${bloco.titulo}" (contexto: ${contexto}, status: ${bloco.status})`);
    return ok(res, { ...bloco.toJSON(), total_questoes: 0 }, 'Bloco criado com sucesso', 201);
  } catch (error) {
    console.error('[ERROR] Erro ao criar bloco:', error);
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
    console.error('[ERROR] Erro ao obter bloco:', error);
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
    if (status && !['rascunho', 'publicado', 'pendente', 'aprovado', 'rejeitado'].includes(status))
      return err(res, 'Status inválido');

    const statusModel = { rascunho: 'pendente', publicado: 'aprovado' };

    const campos = {};
    if (titulo !== undefined) campos.titulo = titulo.trim();
    if (descricao !== undefined) campos.descricao = descricao?.trim() || null;
    if (disciplina !== undefined) campos.disciplina = disciplina;
    if (dificuldade !== undefined) campos.dificuldade = dificuldade;
    // Mapear vocabulário admin → modelo
    if (status !== undefined) campos.status = statusModel[status] || status;

    await bloco.update(campos);

    const totalQuestoes = await BlocoQuestaoItem.count({ where: { bloco_id: id } });
    console.log(`[SUCCESS] Bloco atualizado: ID ${id}`);
    return ok(res, { ...bloco.toJSON(), total_questoes: totalQuestoes }, 'Bloco atualizado com sucesso');
  } catch (error) {
    console.error('[ERROR] Erro ao editar bloco:', error);
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
    console.log(`[SUCCESS] Bloco deletado: ID ${id}`);
    return ok(res, null, 'Bloco deletado com sucesso');
  } catch (error) {
    console.error('[ERROR] Erro ao deletar bloco:', error);
    return err(res, 'Erro ao deletar bloco', 500, error.message);
  }
};

// ── Questões dentro de um bloco 

/**
 * POST /api/blocos/:id/questoes
 * Adiciona uma questão ao bloco.
 * 
 * Suporta dois tipos:
 * 1. Questao (novo modelo unificado) - usa campo bloco_id diretamente
 * 2. QuestaoTesteConhecimento (modelo antigo) - usa BlocoQuestaoItem
 */
export const adicionarQuestao = async (req, res) => {
  try {
    const { id } = req.params;
    const { questao_id, ordem } = req.body;

    console.log(`\n🔗 [adicionarQuestao] Iniciando...`);
    console.log(`   - blocoId: ${id}`);
    console.log(`   - questaoId RECEBIDO DO FRONTEND: ${questao_id}`);

    if (!questao_id) {
      console.error(`[ERROR] questao_id ausente`);
      return err(res, 'questao_id é obrigatório');
    }

    const bloco = await BlocoQuestoes.findByPk(id);
    if (!bloco) {
      console.error(`[ERROR] Bloco ${id} não encontrado`);
      return err(res, 'Bloco não encontrado', 404);
    }
    console.log(`[SUCCESS] Bloco encontrado:`, { id: bloco.id, titulo: bloco.titulo, disciplina: bloco.disciplina });

    // ✅ PRIORIZAR: Tentar PRIMEIRO com QuestaoTesteConhecimento (modelo mais novo para testes)
    // Porque o frontend chamou /api/teste-conhecimento/questoes, então a questão é desse modelo
    let questao = await QuestaoTesteConhecimento.findByPk(questao_id);
    
    if (questao) {
      console.log(`[SUCCESS] Questão encontrada no modelo QuestaoTesteConhecimento (PRIORIDADE)`);
      console.log(`   - ID: ${questao.id}, Categoria: ${questao.categoria}, Ativo: ${questao.ativo}`);
      console.log(`   - Enunciado: ${questao.enunciado?.substring(0, 50)}...`);
      console.log(`   - Bloco disciplina: ${bloco.disciplina}`);

      // Validar para QuestaoTesteConhecimento
      if (!questao.ativo) {
        console.error(`[ERROR] Questão inativa`);
        return err(res, 'Questão inativa não pode ser adicionada ao bloco', 422);
      }
      
      console.log(`🔍 VALIDAÇÃO: questao.categoria="${questao.categoria}" vs bloco.disciplina="${bloco.disciplina}"`);
      if (questao.categoria !== bloco.disciplina) {
        const msg = `Questão de categoria "${questao.categoria}" não pode ser adicionada a bloco de disciplina "${bloco.disciplina}"`;
        console.error(`[ERROR] ${msg}`);
        return err(res, msg, 422);
      }

      // Verificar limite
      const count = await BlocoQuestaoItem.count({ where: { bloco_id: id } });
      console.log(`[CHART] Bloco tem ${count} questões (modelo antigo)`);
      
      if (count >= MAX_QUESTOES_POR_BLOCO) {
        const msg = `Limite de ${MAX_QUESTOES_POR_BLOCO} questões por bloco atingido`;
        console.error(`[ERROR] ${msg}`);
        return err(res, msg, 422);
      }

      // Verificar se já está no bloco
      const jaExiste = await BlocoQuestaoItem.findOne({
        where: { bloco_id: id, questao_id },
      });
      if (jaExiste) {
        console.error(`[ERROR] Questão já está neste bloco`);
        return err(res, 'Questão já está neste bloco', 409);
      }

      const item = await BlocoQuestaoItem.create({
        bloco_id: parseInt(id),
        questao_id: parseInt(questao_id),
        ordem: ordem ?? count,
      });

      console.log(`[SUCCESS] Questão ${questao_id} adicionada ao bloco ${id} (modelo QuestaoTesteConhecimento)`);
      return ok(res, item, 'Questão adicionada ao bloco', 201);
    } else {
      console.log(`[WARNING] Questão não encontrada no modelo QuestaoTesteConhecimento, tentando modelo Questao (novo)...`);
    }

    // ❌ Fallback: Tentar modelo antigo Questao se não encontrou em QuestaoTesteConhecimento
    questao = await Questao.findByPk(questao_id);
    
    if (!questao) {
      console.error(`[ERROR] Questão ${questao_id} não encontrada em nenhum modelo`);
      return err(res, 'Questão não encontrada', 404);
    }

    // ✅ Questão do novo modelo unificado
    console.log(`[SUCCESS] Questão encontrada no modelo Questao`);
    console.log(`   - ID: ${questao.id}, Titulo: ${questao.titulo}, Disciplina ENCONTRADA: ${questao.disciplina}, BlocoID: ${questao.bloco_id}`);
    
    // Validar disciplina
    if (questao.disciplina !== bloco.disciplina) {
      const msg = `Questão de disciplina "${questao.disciplina}" não pode ser adicionada a bloco de disciplina "${bloco.disciplina}"`;
      console.error(`[ERROR] ${msg}`);
      return err(res, msg, 422);
    }

    // Verificar se já está no bloco
    if (questao.bloco_id === parseInt(id)) {
      console.error(`[ERROR] Questão já está neste bloco`);
      return err(res, 'Questão já está neste bloco', 409);
    }

    // Contar questões existentes
    const count = await Questao.count({ where: { bloco_id: id } });
    console.log(`[CHART] Bloco tem ${count} questões (modelo novo)`);
    
    if (count >= MAX_QUESTOES_POR_BLOCO) {
      const msg = `Limite de ${MAX_QUESTOES_POR_BLOCO} questões por bloco atingido`;
      console.error(`[ERROR] ${msg}`);
      return err(res, msg, 422);
    }

    // Atualizar questão para apontar ao bloco
    await questao.update({ bloco_id: id });
    console.log(`[SUCCESS] Questão ${questao_id} adicionada ao bloco ${id} (modelo Questao novo)`);
    
    return ok(res, questao, 'Questão adicionada ao bloco', 201);
  } catch (error) {
    console.error(`\n[ERROR] ERRO em adicionarQuestao:`, error);
    console.error(`   Stack:`, error.stack);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return err(res, 'Questão já está neste bloco', 409);
    }
    return err(res, 'Erro ao adicionar questão', 500, error.message);
  }
};

/**
 * DELETE /api/blocos/:id/questoes/:qid
 * Remove uma questão do bloco (não deleta a questão).
 * Suporta ambos os modelos: Questao (novo) e QuestaoTesteConhecimento (antigo)
 */
export const removerQuestao = async (req, res) => {
  try {
    const { id, qid } = req.params;

    // Tentar primeiro com Questao (novo modelo)
    let questao = await Questao.findOne({
      where: { id: qid, bloco_id: id }
    });

    if (questao) {
      // ✅ Removeu do novo modelo
      await questao.update({ bloco_id: null });
      console.log(`[SUCCESS] Questão ${qid} removida do bloco ${id} (novo modelo)`);
      return ok(res, null, 'Questão removida do bloco');
    }

    // Se não encontrou no novo modelo, tentar no antigo
    const item = await BlocoQuestaoItem.findOne({
      where: { bloco_id: id, questao_id: qid },
    });
    
    if (!item) return err(res, 'Questão não encontrada neste bloco', 404);

    await item.destroy();
    console.log(`[SUCCESS] Questão ${qid} removida do bloco ${id} (modelo antigo)`);
    return ok(res, null, 'Questão removida do bloco');
  } catch (error) {
    console.error('[ERROR] Erro ao remover questão do bloco:', error);
    return err(res, 'Erro ao remover questão', 500, error.message);
  }
};

// ── Associação Torneio ↔ Bloco 

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
    console.error('[ERROR] Erro ao listar blocos do torneio:', error);
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

    // ✅ Aceitar tanto 'publicado' (criados pelo admin) como 'aprovado' (aprovados pelo fluxo colaborador)
    if (!['publicado', 'aprovado'].includes(bloco.status)) {
      return err(res, 'Apenas blocos publicados ou aprovados podem ser associados a torneios', 422);
    }

    // ✅ NOVA: Contar questões no bloco - mínimo 5 obrigatório
    const totalQuestoes = await BlocoQuestaoItem.count({
      where: { bloco_id: bloco_id }
    });

    if (totalQuestoes < 5) {
      return err(res, `Bloco deve ter mínimo 5 questões. Este tem apenas ${totalQuestoes}.`, 422);
    }

    // ✅ NOVA: Validar correspondência de disciplina para torneios específicos
    if (torneio.tipo_torneio === 'especifico') {
      const mapDisciplina = {
        'Matemática': 'matematica',
        'Programação': 'programacao',
        'Inglês': 'ingles'
      };
      const disciplinaBlocoEsperada = mapDisciplina[torneio.disciplina_especifica];
      
      if (bloco.disciplina !== disciplinaBlocoEsperada) {
        return err(res, `Torneio específico para ${torneio.disciplina_especifica}. Bloco é de ${bloco.disciplina}.`, 422);
      }
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

    console.log(`[SUCCESS] Bloco ${bloco_id} associado ao torneio ${id} (${totalQuestoes} questões)`);
    return ok(res, assoc, 'Bloco associado ao torneio com sucesso', 201);
  } catch (error) {
    console.error('[ERROR] Erro ao associar bloco ao torneio:', error);
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
    console.log(`[SUCCESS] Bloco ${bid} desassociado do torneio ${id}`);
    return ok(res, null, 'Bloco desassociado do torneio');
  } catch (error) {
    console.error('[ERROR] Erro ao desassociar bloco do torneio:', error);
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
    console.error('[ERROR] Erro ao carregar quiz:', error);
    return res.status(500).json({ success: false, error: error.message || 'Erro ao carregar questões' });
  }
};
