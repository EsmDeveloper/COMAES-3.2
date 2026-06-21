import Torneio from '../models/Torneio.js';
import Usuario from '../models/User.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import sequelize from '../config/db.js';

// Helper para formatar dados do torneio para o frontend
const formatTorneioForFrontend = (torneio) => {
  const t = typeof torneio.toJSON === 'function' ? torneio.toJSON() : { ...torneio };

  if (t.inicia_em) t.inicia_em = new Date(t.inicia_em).toISOString();
  if (t.termina_em) t.termina_em = new Date(t.termina_em).toISOString();

  if (t.created_at) {
    t.criado_em = new Date(t.created_at).toISOString();
  } else if (t.createdAt) {
    t.criado_em = new Date(t.createdAt).toISOString();
  } else if (t.criado_em && typeof t.criado_em !== 'string') {
    t.criado_em = new Date(t.criado_em).toISOString();
  }

  return t;
};

export const TorneoController = {

  // ── GET ALL 
  getAllTorneos: async (req, res) => {
    try {
      const torneos = await Torneio.findAll({
        attributes: ['id', 'titulo', 'descricao', 'inicia_em', 'termina_em', 'status', 'criado_em', 'slug', 'tipo_torneio', 'disciplina_especifica'],
        order: [['criado_em', 'DESC']],
        limit: 100,
      });

      console.log(`[TorneioController] getAllTorneos: ${torneos.length} torneios encontrados`);
      res.status(200).json(torneos.map(formatTorneioForFrontend));
    } catch (error) {
      console.error('Erro ao obter torneios:', error);
      res.status(500).json({ message: 'Erro ao obter torneios', error: error.message });
    }
  },

  // ── CREATE 
  createTorneo: async (req, res) => {
    try {
      console.log('[TorneioController] Criando torneio com dados:', req.body);
      const { titulo, descricao, inicia_em, termina_em, maximo_participantes, criado_por, status, tipo_torneio, disciplina_especifica } = req.body;

      if (!titulo || !titulo.trim()) {
        return res.status(400).json({ message: 'Titulo e obrigatorio', field: 'titulo' });
      }

      // ✅ Validar tipo_torneio
      if (tipo_torneio && !['generico', 'especifico'].includes(tipo_torneio)) {
        return res.status(400).json({ message: 'tipo_torneio deve ser generico ou especifico', field: 'tipo_torneio' });
      }

      // ✅ Validar disciplina_especifica se tipo_torneio = especifico
      if (tipo_torneio === 'especifico' && !disciplina_especifica) {
        return res.status(400).json({ message: 'disciplina_especifica é obrigatória para torneios específicos', field: 'disciplina_especifica' });
      }

      // ✅ NOVO: Validar concorrência de torneios
      // Não permitir criar torneio ativo se já existe outro ativo
      if (status === 'ativo') {
        const torneioAtivoExistente = await Torneio.count({
          where: { status: 'ativo' }
        });
        
        if (torneioAtivoExistente > 0) {
          console.log('[TorneioController] ❌ Tentativa de criar segundo torneio ativo');
          return res.status(409).json({ 
            message: 'Não é possível criar dois torneios ativos ao mesmo tempo. Finalize o torneio ativo anterior.',
            error: 'TOURNAMENT_CONFLICT',
            existingTournament: true
          });
        }
      }

      const TOLERANCE_MS = 5 * 60 * 1000; // 5 minutos de tolerância
      const now = new Date(Date.now() - TOLERANCE_MS);

      if (inicia_em && new Date(inicia_em) < now) {
        return res.status(400).json({ 
          message: 'A data de início deve ser diferente da hora atual. Escolha uma data posterior.',
          field: 'inicia_em',
          suggestedMinTime: new Date(Date.now() + 60000).toISOString() // +1 minuto
        });
      }
      if (termina_em) {
        if (new Date(termina_em) < now) {
          return res.status(400).json({ message: 'A data de termino nao pode ser anterior ao horario atual.', field: 'termina_em' });
        }
        if (inicia_em && new Date(termina_em) <= new Date(inicia_em)) {
          return res.status(400).json({ message: 'A data de termino deve ser posterior a data de inicio.', field: 'termina_em' });
        }
      }

      if (maximo_participantes !== null && maximo_participantes !== undefined && maximo_participantes !== '') {
        const maxPart = Number(maximo_participantes);
        if (isNaN(maxPart) || maxPart < 1 || !Number.isInteger(maxPart)) {
          return res.status(400).json({ message: 'O maximo de participantes deve ser um numero inteiro maior que zero.', field: 'maximo_participantes' });
        }
      }

      const slug = titulo.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      const createdBy = req.user?.id || criado_por;
      if (!createdBy) {
        return res.status(401).json({ message: 'Usuario autenticado necessario para criar torneio.' });
      }

      const validStatuses = ['rascunho', 'ativo'];
      const finalStatus = validStatuses.includes(status) ? status : 'rascunho';

      const torneioData = {
        titulo: titulo.trim(),
        slug,
        descricao: descricao?.trim() || null,
        inicia_em: inicia_em || null,
        termina_em: termina_em || null,
        criado_por: createdBy,
        status: finalStatus,
        tipo_torneio: tipo_torneio || 'generico',
        disciplina_especifica: tipo_torneio === 'especifico' ? (disciplina_especifica || null) : null,
      };

      if (maximo_participantes !== null && maximo_participantes !== undefined && maximo_participantes !== '') {
        torneioData.maximo_participantes = Number(maximo_participantes);
      }

      console.log('[TorneioController] Dados formatados para criar torneio:', {
        titulo: torneioData.titulo,
        tipo_torneio: torneioData.tipo_torneio,
        disciplina_especifica: torneioData.disciplina_especifica,
        status: torneioData.status,
      });

      const novoTorneio = await Torneio.create(torneioData);
      console.log('[TorneioController] Torneio criado com sucesso:', {
        id: novoTorneio.id,
        tipo_torneio: novoTorneio.tipo_torneio,
        disciplina_especifica: novoTorneio.disciplina_especifica,
      });
      
      res.status(201).json({ message: 'Torneio criado com sucesso!', torneio: formatTorneioForFrontend(novoTorneio) });
    } catch (error) {
      console.error('Erro ao criar torneio:', error);
      res.status(500).json({ message: 'Erro ao criar torneio', error: error.message });
    }
  },

  // ── UPDATE 
  updateTorneo: async (req, res) => {
    try {
      const { id } = req.params;
      const { titulo, descricao, inicia_em, termina_em, maximo_participantes, status, tipo_torneio, disciplina_especifica } = req.body;

      const existingTorneio = await Torneio.findByPk(id);
      if (!existingTorneio) {
        return res.status(404).json({ message: 'Torneio nao encontrado' });
      }

      // ✅ NOVO: Validar concorrência ao ativar torneio
      // Se tentando ativar este torneio, verificar que não há outro ativo
      if (status === 'ativo' && existingTorneio.status !== 'ativo') {
        const outroTorneioAtivo = await Torneio.count({
          where: { 
            status: 'ativo',
            id: { [require('sequelize').Op.ne]: id } // Excluir este torneio
          }
        });
        
        if (outroTorneioAtivo > 0) {
          console.log('[TorneioController] ❌ Tentativa de ativar segundo torneio');
          return res.status(409).json({ 
            message: 'Não é possível ativar dois torneios ao mesmo tempo. Finalize o torneio ativo anterior.',
            error: 'TOURNAMENT_CONFLICT',
            existingTournament: true
          });
        }
      }

      // Validar tipo_torneio
      if (tipo_torneio && !['generico', 'especifico'].includes(tipo_torneio)) {
        return res.status(400).json({ message: 'tipo_torneio deve ser generico ou especifico', field: 'tipo_torneio' });
      }

      // Validar disciplina_especifica se tipo_torneio = especifico
      if (tipo_torneio === 'especifico' && !disciplina_especifica) {
        return res.status(400).json({ message: 'disciplina_especifica é obrigatória para torneios específicos', field: 'disciplina_especifica' });
      }

      // Validar transicao de status
      const currentStatus = existingTorneio.status;
      const validTransitions = {
        rascunho: ['rascunho', 'ativo', 'cancelado'],
        ativo: ['ativo', 'finalizado', 'cancelado'],
        finalizado: ['finalizado'],
        cancelado: ['cancelado'],
      };

      if (status && !validTransitions[currentStatus]?.includes(status)) {
        return res.status(400).json({
          message: `Nao e possivel mudar de "${currentStatus}" para "${status}"`,
          field: 'status'
        });
      }

      // ✅ NOVA: Validar blocos se tentando ativar o torneio
      if (status === 'ativo' && currentStatus !== 'ativo') {
        const TorneioBloco = (await import('../models/TorneioBloco.js')).default;
        const BlocoQuestoes = (await import('../models/BlocoQuestoes.js')).default;
        const BlocoQuestaoItem = (await import('../models/BlocoQuestaoItem.js')).default;

        // Buscar blocos associados
        const blocosAssociados = await TorneioBloco.findAll({
          where: { torneio_id: existingTorneio.id },
          include: [{ model: BlocoQuestoes, attributes: ['id', 'disciplina', 'titulo'] }]
        });

        if (blocosAssociados.length === 0) {
          return res.status(400).json({
            message: 'Torneio deve ter pelo menos um bloco de questões para ser ativado',
            field: 'blocos'
          });
        }

        // Se genérico, validar que tem blocos de todas as 3 disciplinas
        if (existingTorneio.tipo_torneio === 'generico') {
          const disciplinas = new Set(blocosAssociados.map(tb => tb.BlocoQuestoes.disciplina));
          
          if (disciplinas.size < 3) {
            const disciplinasFaltantes = ['matematica', 'ingles', 'programacao'].filter(d => !disciplinas.has(d));
            const disciplinasNomes = {
              'matematica': 'Matemática',
              'ingles': 'Inglês',
              'programacao': 'Programação'
            };
            const nomesFaltantes = disciplinasFaltantes.map(d => disciplinasNomes[d]).join(', ');
            
            return res.status(400).json({
              message: `Torneio genérico deve ter blocos de todas as 3 disciplinas. Faltam: ${nomesFaltantes}`,
              field: 'blocos'
            });
          }
        }

        // Validar que cada bloco tem mínimo 5 questões
        for (const tb of blocosAssociados) {
          const totalQuestoes = await BlocoQuestaoItem.count({
            where: { bloco_id: tb.bloco_id }
          });
          
          if (totalQuestoes < 5) {
            return res.status(400).json({
              message: `Bloco "${tb.BlocoQuestoes.titulo}" tem apenas ${totalQuestoes} questões. Mínimo: 5`,
              field: 'blocos'
            });
          }
        }
      }

      // Validar datas — só revalida se a data foi ALTERADA em relação ao valor atual
      const TOLERANCE_MS = 5 * 60 * 1000;
      const now = new Date(Date.now() - TOLERANCE_MS);

      const iniciaEmAtual = existingTorneio.inicia_em ? new Date(existingTorneio.inicia_em).toISOString() : null;
      const terminaEmAtual = existingTorneio.termina_em ? new Date(existingTorneio.termina_em).toISOString() : null;
      const iniciaEmNova = inicia_em ? new Date(inicia_em).toISOString() : null;
      const terminaEmNova = termina_em ? new Date(termina_em).toISOString() : null;

      const iniciaEmMudou = iniciaEmNova && iniciaEmNova !== iniciaEmAtual;
      const terminaEmMudou = terminaEmNova && terminaEmNova !== terminaEmAtual;

      if (iniciaEmMudou && new Date(inicia_em) < now) {
        return res.status(400).json({ message: 'A data de inicio nao pode ser anterior ao horario atual.', field: 'inicia_em' });
      }

      if (terminaEmMudou) {
        const inicioRef = inicia_em || existingTorneio.inicia_em;
        if (new Date(termina_em) < now) {
          return res.status(400).json({ message: 'A data de termino nao pode ser anterior ao horario atual.', field: 'termina_em' });
        }
        if (inicioRef && new Date(termina_em) <= new Date(inicioRef)) {
          return res.status(400).json({ message: 'A data de termino deve ser posterior a data de inicio.', field: 'termina_em' });
        }
      }

      if (maximo_participantes !== null && maximo_participantes !== undefined && maximo_participantes !== '') {
        const maxPart = Number(maximo_participantes);
        if (isNaN(maxPart) || maxPart < 1 || !Number.isInteger(maxPart)) {
          return res.status(400).json({ message: 'O maximo de participantes deve ser um numero inteiro maior que zero.', field: 'maximo_participantes' });
        }
      }

      // Montar objeto de update — SEM coluna "publico" (nao existe no banco)
      const updateData = {};
      if (titulo !== undefined) updateData.titulo = titulo.trim();
      if (descricao !== undefined) updateData.descricao = descricao?.trim() || null;
      if (inicia_em !== undefined) updateData.inicia_em = inicia_em || null;
      if (termina_em !== undefined) updateData.termina_em = termina_em || null;
      if (status !== undefined) updateData.status = status;
      
      // ✅ IMPORTANTE: tipo_torneio e disciplina_especifica são READ-ONLY após criação
      // Não permitir alteração destes campos durante update
      if (tipo_torneio !== undefined && tipo_torneio !== existingTorneio.tipo_torneio) {
        return res.status(400).json({ 
          message: 'tipo_torneio não pode ser alterado após a criação do torneio',
          field: 'tipo_torneio'
        });
      }
      
      if (maximo_participantes !== null && maximo_participantes !== undefined) {
        updateData.maximo_participantes = Number(maximo_participantes);
      }

      console.log('[TorneioController] updateData:', updateData);

      const [updated] = await Torneio.update(updateData, { where: { id } });

      if (updated) {
        const updatedTorneio = await Torneio.findOne({ where: { id } });
        console.log('[TorneioController] Torneio atualizado:', {
          id: updatedTorneio.id,
          tipo_torneio: updatedTorneio.tipo_torneio,
          disciplina_especifica: updatedTorneio.disciplina_especifica,
        });
        res.status(200).json(formatTorneioForFrontend(updatedTorneio));
      } else {
        res.status(404).json({ message: 'Torneio nao encontrado' });
      }
    } catch (error) {
      console.error('Erro ao atualizar torneio:', error);
      res.status(500).json({ message: 'Erro ao atualizar torneio', error: error.message });
    }
  },

  // ── DELETE 
  deleteTorneo: async (req, res) => {
    try {
      const { id } = req.params;
      const torneio = await Torneio.findByPk(id);
      if (!torneio) return res.status(404).json({ message: 'Torneio nao encontrado' });

      const deleted = await Torneio.destroy({ where: { id } });
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Torneio nao encontrado' });
      }
    } catch (error) {
      console.error('Erro ao deletar torneio:', error);
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ message: 'Nao e possivel deletar este torneio pois existem participantes ou dados associados. Remova-os primeiro.' });
      }
      res.status(500).json({ message: 'Erro ao deletar torneio', error: error.message });
    }
  },

  // ── INSCREVER PARTICIPANTE 
  inscreverParticipante: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { torneio_id, usuario_id, disciplina_competida } = req.body;

      if (!torneio_id || !usuario_id || !disciplina_competida) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Campos obrigatorios faltando: torneio_id, usuario_id, disciplina_competida' });
      }

      const torneio = await Torneio.findByPk(torneio_id, { transaction });
      if (!torneio) { await transaction.rollback(); return res.status(404).json({ message: 'Torneio nao encontrado' }); }

      const agora = new Date();

      // ✅ NOVO: Verificar se torneio expirou automaticamente
      if (torneio.termina_em && new Date(torneio.termina_em) < agora) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'Este torneio expirou e nao aceita mais inscricoes',
          field: 'torneio_expirado'
        });
      }

      if (torneio.status === 'finalizado' || torneio.status === 'cancelado') {
        await transaction.rollback();
        return res.status(400).json({ message: `Nao e possivel inscrever-se em um torneio ${torneio.status}` });
      }
      if (torneio.inicia_em && new Date(torneio.inicia_em) > agora) {
        await transaction.rollback();
        return res.status(400).json({ message: 'O torneio ainda nao iniciou' });
      }

      const usuario = await Usuario.findByPk(usuario_id, { transaction });
      if (!usuario) { await transaction.rollback(); return res.status(404).json({ message: 'Usuario nao encontrado' }); }

      // ✅ NOVO: Validar disciplina conforme tipo de torneio
      if (torneio.tipo_torneio === 'especifico' && disciplina_competida !== torneio.disciplina_especifica) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Este torneio e especifico apenas para ${torneio.disciplina_especifica}`,
          disciplina_esperada: torneio.disciplina_especifica,
          field: 'disciplina_incompativel'
        });
      }

      // ✅ NOVO: Verificar participacao simultanea em outro torneio
      const participacaoAtiva = await ParticipanteTorneio.findOne({
        where: {
          usuario_id,
          status: 'confirmado',
          posicao_congelada: false
        },
        include: [{
          model: Torneio,
          attributes: ['id', 'titulo', 'termina_em'],
          where: {
            id: { [sequelize.Sequelize.Op.ne]: torneio_id }
          }
        }],
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (participacaoAtiva) {
        await transaction.rollback();
        return res.status(409).json({ 
          message: `Usuario ja esta participando de outro torneio: "${participacaoAtiva.Torneio.titulo}". Termine esse primeiro.`,
          torneio_ativo: participacaoAtiva.Torneio,
          field: 'participacao_simultanea'
        });
      }

      const inscricaoExistente = await ParticipanteTorneio.findOne({
        where: { torneio_id, usuario_id, disciplina_competida },
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (inscricaoExistente) {
        await transaction.rollback();
        return res.status(409).json({ message: 'Usuario ja esta inscrito neste torneio e disciplina', data: inscricaoExistente });
      }

      const novoParticipante = await ParticipanteTorneio.create({
        torneio_id, usuario_id, disciplina_competida,
        status: 'confirmado', posicao_congelada: false, tempo_congelamento: null
      }, { transaction });

      try {
        await ParticipanteTorneio.calcularRanking(torneio_id, disciplina_competida);
      } catch (err) {
        console.warn('Aviso ao sincronizar ranking apos inscricao:', err.message);
      }

      await transaction.commit();
      res.status(201).json({ message: 'Inscricao realizada com sucesso!', data: novoParticipante });
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Usuario ja esta inscrito neste torneio e disciplina' });
      }
      console.error('Erro ao inscrever participante:', error);
      res.status(400).json({ message: error.message });
    }
  },

  // ── GET PARTICIPANTES 
  getParticipantes: async (req, res) => {
    try {
      const { id } = req.params;
      const { disciplina, includeInactive } = req.query;

      const where = { torneio_id: id };
      if (disciplina) where.disciplina_competida = disciplina;
      if (includeInactive !== 'true') where.status = 'confirmado';

      const participantes = await ParticipanteTorneio.findAll({
        where,
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email', 'nivel_atual', 'xp_total'] }],
        order: [['pontuacao', 'DESC'], ['tempo_total', 'ASC'], ['entrou_em', 'ASC']]
      });

      res.status(200).json(participantes.map((p, index) => ({ ...p.toJSON(), posicao: index + 1 })));
    } catch (error) {
      res.status(500).json({ message: 'Erro ao obter participantes', error: error.message });
    }
  },

  // ── MINHA PARTICIPACAO 
  getMinhaParticipacao: async (req, res) => {
    try {
      const { id } = req.params;
      const { usuario_id, disciplina } = req.query;

      const participante = await ParticipanteTorneio.findOne({
        where: { torneio_id: id, usuario_id, disciplina_competida: disciplina }
      });

      if (!participante) return res.status(404).json({ message: 'Participacao nao encontrada' });
      res.status(200).json(participante);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ── ATUALIZAR PONTOS 
  atualizarPontos: async (req, res) => {
    try {
      const { id } = req.params;
      const { pontos, descricao } = req.body;

      const participante = await ParticipanteTorneio.findByPk(id);
      if (!participante) return res.status(404).json({ message: 'Participante nao encontrado' });

      await participante.adicionarPontuacao(pontos, descricao);
      res.status(200).json({ message: 'Pontuacao atualizada', data: participante });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ── VERIFICAR PARTICIPAÇÃO ATIVA 
  verificarParticipacaoAtiva: async (req, res) => {
    try {
      const { usuario_id } = req.params;

      // 🔍 Buscar participações ativas do usuário
      // Ativa = status confirmado E posição não congelada
      const participacaoAtiva = await ParticipanteTorneio.findOne({
        where: {
          usuario_id: usuario_id,
          status: 'confirmado',
          posicao_congelada: false
        },
        include: [{
          model: Torneio,
          as: 'torneio',
          attributes: ['id', 'titulo', 'tipo_torneio', 'disciplina_especifica']
        }]
      });

      if (!participacaoAtiva) {
        // Usuário não tem participação ativa
        return res.status(200).json({
          ativo: false,
          torneio: null,
          disciplina: null
        });
      }

      // ✅ Usuário tem participação ativa
      res.status(200).json({
        ativo: true,
        torneio: {
          id: participacaoAtiva.torneio.id,
          titulo: participacaoAtiva.torneio.titulo,
          tipo_torneio: participacaoAtiva.torneio.tipo_torneio,
          disciplina_especifica: participacaoAtiva.torneio.disciplina_especifica
        },
        disciplina: participacaoAtiva.disciplina_competida
      });
    } catch (error) {
      console.error('Erro ao verificar participação ativa:', error);
      res.status(500).json({ message: 'Erro ao verificar participação', error: error.message });
    }
  },
};

export default TorneoController;
