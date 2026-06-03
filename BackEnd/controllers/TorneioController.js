import Torneio from '../models/Torneio.js';
import Usuario from '../models/User.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import sequelize from '../config/db.js';

// Helper para formatar dados do torneio para o frontend
const formatTorneioForFrontend = (torneio) => {
  const t = typeof torneio.toJSON === 'function' ? torneio.toJSON() : { ...torneio };
  
  // Garantir que as datas são strings ISO formatadas corretamente
  if (t.inicia_em) {
    t.inicia_em = new Date(t.inicia_em).toISOString();
  }
  if (t.termina_em) {
    t.termina_em = new Date(t.termina_em).toISOString();
  }
  
  // CORREÇÃO: created_at pode vir como createdAt ou criado_em
  // O frontend espera criado_em
  if (t.created_at) {
    t.criado_em = new Date(t.created_at).toISOString();
  } else if (t.createdAt) {
    t.criado_em = new Date(t.createdAt).toISOString();
  } else if (t.criado_em && typeof t.criado_em !== 'string') {
    t.criado_em = new Date(t.criado_em).toISOString();
  }
  
  // Garantir que público é booleano
  t.público = t.publico !== false;
  
  return t;
};

export const TorneoController = {
    // Get all tournaments
    getAllTorneos: async (req, res) => {
        try {
            const torneos = await Torneio.findAll({
                attributes: [
                    'id', 'titulo', 'descricao', 'inicia_em', 'termina_em', 
                'status', 'criado_em', 'slug'
                ],
                order: [['criado_em', 'DESC']],
                limit: 100,
            });

            console.log(`[TorneioController] getAllTorneos: ${torneos.length} torneios encontrados`);
            
            // Formatar dados para o frontend
            const formattedTorneios = torneos.map(formatTorneioForFrontend);
            
            console.log('[TorneioController] Torneios formatados:', formattedTorneios.map(t => ({ id: t.id, titulo: t.titulo, criado_em: t.criado_em })));
            
            res.status(200).json(formattedTorneios);
        } catch (error) {
            console.error('Erro ao obter torneios:', error);
            res.status(500).json({ message: 'Erro ao obter torneios', error: error.message });
        }
    },

    // Inscrever usuário em uma disciplina - COM PROTEÇÃO CONTRA RACE CONDITIONS
    inscreverParticipante: async (req, res) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { torneio_id, usuario_id, disciplina_competida } = req.body;

            // Validações de entrada
            if (!torneio_id || !usuario_id || !disciplina_competida) {
                await transaction.rollback();
                return res.status(400).json({ 
                    message: 'Campos obrigatórios faltando: torneio_id, usuario_id, disciplina_competida' 
                });
            }

            // 1. Verificar se torneio existe e está ativo
            const torneio = await Torneio.findByPk(torneio_id, { transaction });
            if (!torneio) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Torneio não encontrado' });
            }

            const agora = new Date();
            if (torneio.status === 'finalizado' || torneio.status === 'cancelado') {
                await transaction.rollback();
                return res.status(400).json({ 
                    message: `Não é possível inscrever-se em um torneio ${torneio.status}` 
                });
            }

            if (torneio.inicia_em && new Date(torneio.inicia_em) > agora) {
                await transaction.rollback();
                return res.status(400).json({ 
                    message: 'O torneio ainda não iniciou' 
                });
            }

            // 2. Verificar se usuário existe
            const usuario = await Usuario.findByPk(usuario_id, { transaction });
            if (!usuario) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            // 3. LOCK PESSIMISTA: Verificar se já existe inscrição (com lock para evitar race condition)
            const inscricaoExistente = await ParticipanteTorneio.findOne({
                where: {
                    torneio_id,
                    usuario_id,
                    disciplina_competida
                },
                lock: transaction.LOCK.UPDATE,  // Lock pessimista
                transaction
            });

            if (inscricaoExistente) {
                await transaction.rollback();
                return res.status(409).json({ 
                    message: 'Usuário já está inscrito neste torneio e disciplina',
                    data: inscricaoExistente
                });
            }

            // 4. Criar inscrição com transação
            const novoParticipante = await ParticipanteTorneio.create({
                torneio_id,
                usuario_id,
                disciplina_competida,
                status: 'confirmado',
                posicao_congelada: false,
                tempo_congelamento: null
            }, { transaction });

            // 5. Sincronizar ranking após nova inscrição
            try {
                await ParticipanteTorneio.calcularRanking(torneio_id, disciplina_competida);
            } catch (err) {
                console.warn('⚠️ Aviso ao sincronizar ranking após inscrição:', err.message);
            }

            await transaction.commit();

            res.status(201).json({
                message: 'Inscrição realizada com sucesso!',
                data: novoParticipante
            });
        } catch (error) {
            await transaction.rollback();
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ 
                    message: 'Usuário já está inscrito neste torneio e disciplina' 
                });
            }

            console.error('Erro ao inscrever participante:', error);
            res.status(400).json({ message: error.message });
        }
    },

    // Obter participantes por torneio e disciplina
    getParticipantes: async (req, res) => {
        try {
            const { id } = req.params;
            const { disciplina, includeInactive } = req.query;

            const where = { torneio_id: id };
            if (disciplina) where.disciplina_competida = disciplina;

            if (includeInactive !== 'true') {
                where.status = 'confirmado';
            }

            const participantes = await ParticipanteTorneio.findAll({
                where,
                include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email', 'nivel_atual', 'xp_total'] }],
                order: [
                    ['pontuacao', 'DESC'],
                    ['tempo_total', 'ASC'],
                    ['entrou_em', 'ASC']
                ]
            });

            const comPosicao = participantes.map((p, index) => ({
                ...p.toJSON(),
                posicao: index + 1
            }));

            res.status(200).json(comPosicao);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao obter participantes', error: error.message });
        }
    },

    // Obter participação do usuário logado
    getMinhaParticipacao: async (req, res) => {
        try {
            const { id } = req.params;
            const { usuario_id, disciplina } = req.query;

            const participante = await ParticipanteTorneio.findOne({
                where: {
                    torneio_id: id,
                    usuario_id,
                    disciplina_competida: disciplina
                }
            });

            if (!participante) return res.status(404).json({ message: 'Participação não encontrada' });
            res.status(200).json(participante);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Atualizar pontuação
    atualizarPontos: async (req, res) => {
        try {
            const { id } = req.params;
            const { pontos, descricao } = req.body;

            const participante = await ParticipanteTorneio.findByPk(id);
            if (!participante) return res.status(404).json({ message: 'Participante não encontrado' });

            await participante.adicionarPontuacao(pontos, descricao);
            res.status(200).json({ message: 'Pontuação atualizada', data: participante });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create tournament
    createTorneo: async (req, res) => {
        try {
            console.log('🔄 Criando torneio com dados:', req.body);
            const { titulo, descricao, inicia_em, termina_em, maximo_participantes, criado_por, status, público } = req.body;

            if (!titulo || !titulo.trim()) {
                return res.status(400).json({ message: 'Título é obrigatório', field: 'titulo' });
            }

            // Validar datas
            const TOLERANCE_MS = 5 * 60 * 1000;
            const now = new Date(Date.now() - TOLERANCE_MS);
            
            if (inicia_em) {
                const inicioDate = new Date(inicia_em);
                if (inicioDate < now) {
                    return res.status(400).json({
                        message: 'A data de início não pode ser anterior ao horário atual.',
                        field: 'inicia_em'
                    });
                }
            }
            
            if (termina_em) {
                const fimDate = new Date(termina_em);
                if (fimDate < now) {
                    return res.status(400).json({
                        message: 'A data de término não pode ser anterior ao horário atual.',
                        field: 'termina_em'
                    });
                }
                if (inicia_em && new Date(termina_em) <= new Date(inicia_em)) {
                    return res.status(400).json({
                        message: 'A data de término deve ser posterior à data de início.',
                        field: 'termina_em'
                    });
                }
            }

            // Validar máximo de participantes
            if (maximo_participantes !== null && maximo_participantes !== undefined && maximo_participantes !== '') {
                const maxPart = Number(maximo_participantes);
                if (isNaN(maxPart) || maxPart < 1 || !Number.isInteger(maxPart)) {
                    return res.status(400).json({
                        message: 'O máximo de participantes deve ser um número inteiro maior que zero.',
                        field: 'maximo_participantes'
                    });
                }
            }

            // Gerar slug
            const slug = titulo
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            
            console.log('🏷️ Slug gerado:', slug);

            const requestingUserId = req.user?.id;
            const createdBy = requestingUserId || criado_por;
            if (!createdBy) {
                return res.status(401).json({ message: 'Usuário autenticado necessário para criar torneio.' });
            }

            // Validar status
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
                público: público !== false
            };

            if (maximo_participantes !== null && maximo_participantes !== undefined && maximo_participantes !== '') {
                torneioData.maximo_participantes = Number(maximo_participantes);
            }

            console.log('💾 Dados para criar torneio:', torneioData);

            const novoTorneio = await Torneio.create(torneioData);
            const formattedTorneio = formatTorneioForFrontend(novoTorneio);

            res.status(201).json({
                message: 'Torneio criado com sucesso!',
                torneio: formattedTorneio
            });
        } catch (error) {
            console.error('❌ Erro ao criar torneio:', error);
            res.status(500).json({ message: 'Erro ao criar torneio', error: error.message });
        }
    },

    // Update tournament
    updateTorneo: async (req, res) => {
        try {
            const { id } = req.params;
            const { titulo, descricao, inicia_em, termina_em, maximo_participantes, status, público } = req.body;

            const existingTorneio = await Torneio.findByPk(id);
            if (!existingTorneio) {
                return res.status(404).json({ message: 'Torneio não encontrado' });
            }

            // Validar status de transição
            const currentStatus = existingTorneio.status;
            const validTransitions = {
                rascunho: ['rascunho', 'ativo', 'cancelado'],
                ativo: ['ativo', 'finalizado', 'cancelado'],
                finalizado: ['finalizado'],
                cancelado: ['cancelado'],
            };

            if (status && !validTransitions[currentStatus]?.includes(status)) {
                return res.status(400).json({
                    message: `Não é possível mudar de "${currentStatus}" para "${status}"`,
                    field: 'status'
                });
            }

            // Validar datas
            const TOLERANCE_MS = 5 * 60 * 1000;
            const now = new Date(Date.now() - TOLERANCE_MS);

            // Validar data de início
            if (inicia_em) {
                const inicioDate = new Date(inicia_em);
                if (inicioDate < now) {
                    return res.status(400).json({
                        message: 'A data de início não pode ser anterior ao horário atual.',
                        field: 'inicia_em'
                    });
                }
            }

            // Validar data de término
            if (termina_em) {
                const fimDate = new Date(termina_em);
                const inicioRef = inicia_em || existingTorneio.inicia_em;
                
                if (fimDate < now) {
                    return res.status(400).json({
                        message: 'A data de término não pode ser anterior ao horário atual.',
                        field: 'termina_em'
                    });
                }
                
                if (inicioRef && new Date(termina_em) <= new Date(inicioRef)) {
                    return res.status(400).json({
                        message: 'A data de término deve ser posterior à data de início.',
                        field: 'termina_em'
                    });
                }
            }

            // Validar máximo de participantes
            if (maximo_participantes !== null && maximo_participantes !== undefined && maximo_participantes !== '') {
                const maxPart = Number(maximo_participantes);
                if (isNaN(maxPart) || maxPart < 1 || !Number.isInteger(maxPart)) {
                    return res.status(400).json({
                        message: 'O máximo de participantes deve ser um número inteiro maior que zero.',
                        field: 'maximo_participantes'
                    });
                }
            }

            // Preparar dados para atualização
            const updateData = {};
            if (titulo !== undefined) updateData.titulo = titulo.trim();
            if (descricao !== undefined) updateData.descricao = descricao?.trim() || null;
            if (inicia_em !== undefined) updateData.inicia_em = inicia_em || null;
            if (termina_em !== undefined) updateData.termina_em = termina_em || null;
            if (status !== undefined) updateData.status = status;
            if (público !== undefined) updateData.publico = público !== false;
            if (maximo_participantes !== null && maximo_participantes !== undefined) {
                updateData.maximo_participantes = Number(maximo_participantes);
            }

            const [updated] = await Torneio.update(updateData, { where: { id } });

            if (updated) {
                const updatedTorneio = await Torneio.findOne({ where: { id } });
                const formattedTorneio = formatTorneioForFrontend(updatedTorneio);
                res.status(200).json(formattedTorneio);
            } else {
                res.status(404).json({ message: 'Torneio não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao atualizar torneio:', error);
            res.status(500).json({ message: 'Erro ao atualizar torneio', error: error.message });
        }
    },

    // Delete tournament
    deleteTorneo: async (req, res) => {
        try {
            const { id } = req.params;
            
            const torneio = await Torneio.findByPk(id);
            if (!torneio) {
                return res.status(404).json({ message: 'Torneio não encontrado' });
            }
            
            const deleted = await Torneio.destroy({ where: { id } });
            
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Torneio não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao deletar torneio:', error);
            
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(409).json({ 
                    message: 'Não é possível deletar este torneio pois existem participantes ou dados associados. Remova-os primeiro.' 
                });
            }
            
            res.status(500).json({ message: 'Erro ao deletar torneio', error: error.message });
        }
    }
};

export default TorneoController;

