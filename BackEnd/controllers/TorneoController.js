import Torneio from '../models/Torneio.js';
import Usuario from '../models/User.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import sequelize from '../config/db.js';

export const TorneoController = {
    // Get all tournaments
    getAllTorneos: async (req, res) => {
        try {
            const torneos = await Torneio.findAll({
                include: [
                    { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
                    { model: ParticipanteTorneio, as: 'participantes', attributes: ['id', 'usuario_id', 'disciplina_competida', 'status'] }
                ],
                raw: false,
                subQuery: false
            });
            res.status(200).json(torneos);
        } catch (error) {
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
            // Isto garante que a nova posição do participante seja calculada e persistida
            try {
                await ParticipanteTorneio.calcularRanking(torneio_id, disciplina_competida);
            } catch (err) {
                console.warn('⚠️ Aviso ao sincronizar ranking após inscrição:', err.message);
                // Não falha a inscrição se o ranking não sincronizar
            }

            await transaction.commit();

            res.status(201).json({
                message: 'Inscrição realizada com sucesso!',
                data: novoParticipante
            });
        } catch (error) {
            await transaction.rollback();
            
            // Tratar erro de constraint única (fallback para casos raros)
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

            // Filtrar por status se não especificar includeInactive
            if (includeInactive !== 'true') {
                where.status = 'confirmado';
            }

            const participantes = await ParticipanteTorneio.findAll({
                where,
                include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }],
                order: [
                    ['pontuacao', 'DESC'],
                    ['tempo_total', 'ASC'],
                    ['entrou_em', 'ASC']
                ]
            });

            // Adicionar posição a cada participante
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
            const { id } = req.params; // torneio_id
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

    // Atualizar pontuação (exemplo de uso do método de instância)
    atualizarPontos: async (req, res) => {
        try {
            const { id } = req.params; // id do participante_torneio
            const { pontos, descricao } = req.body;

            const participante = await ParticipanteTorneio.findByPk(id);
            if (!participante) return res.status(404).json({ message: 'Participante não encontrado' });

            await participante.adicionarPontuacao(pontos, descricao);
            res.status(200).json({ message: 'Pontuação atualizada', data: participante });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create tournament with 3 disciplines
    createTorneo: async (req, res) => {
        try {
            console.log('🔄 Criando torneio com dados:', req.body);
            const { titulo, descricao, inicia_em, termina_em, maximo_participantes, criado_por, status, publico } = req.body;

            if (!titulo) {
                return res.status(400).json({ message: 'Título é obrigatório' });
            }

            // Validar datas — não permitir datas passadas
            // Tolerância de 5 minutos para cobrir pequenas diferenças de sincronização
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

            // Create main tournament
            const slug = titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            console.log('🏷️ Slug gerado:', slug);

            const requestingUserId = req.user?.id;
            const createdBy = requestingUserId || criado_por;
            if (!createdBy) {
                return res.status(401).json({ message: 'Usuário autenticado necessário para criar torneio.' });
            }

            const torneioData = {
                titulo,
                slug,
                descricao,
                inicia_em,
                termina_em,
                criado_por: createdBy,
                status: status || 'rascunho',
                publico: publico !== false
            };

            // Só adiciona maximo_participantes se foi validado acima
            if (maximo_participantes !== null && maximo_participantes !== undefined && maximo_participantes !== '') {
                torneioData.maximo_participantes = Number(maximo_participantes);
            }

            console.log('💾 Dados para criar torneio:', torneioData);

            const novoTorneo = await Torneio.create(torneioData);

            res.status(201).json({
                message: 'Torneio criado com sucesso! As 3 disciplinas (Matemática, Inglês e Programação) foram ativadas automaticamente.',
                torneio: novoTorneo
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
            const { titulo, descricao, inicia_em, termina_em, maximo_participantes, status, publico } = req.body;

            const existingTorneo = await Torneio.findByPk(id);
            if (!existingTorneo) {
                return res.status(404).json({ message: 'Torneio não encontrado' });
            }

            // Só valida datas que foram efetivamente alteradas (diferentes das existentes no banco)
            // Tolerância de 5 minutos para cobrir pequenas diferenças de sincronização
            const TOLERANCE_MS = 5 * 60 * 1000;
            const now = new Date(Date.now() - TOLERANCE_MS);
            const inicioAlterado = inicia_em && inicia_em !== existingTorneo.inicia_em?.toISOString?.()?.slice(0, 16) &&
                                   inicia_em !== existingTorneo.inicia_em;
            const fimAlterado = termina_em && termina_em !== existingTorneo.termina_em?.toISOString?.()?.slice(0, 16) &&
                                termina_em !== existingTorneo.termina_em;

            if (inicia_em && inicioAlterado) {
                const inicioDate = new Date(inicia_em);
                if (inicioDate < now) {
                    return res.status(400).json({
                        message: 'A data de início não pode ser anterior ao horário atual.',
                        field: 'inicia_em'
                    });
                }
            }
            if (termina_em && fimAlterado) {
                const fimDate = new Date(termina_em);
                if (fimDate < now) {
                    return res.status(400).json({
                        message: 'A data de término não pode ser anterior ao horário atual.',
                        field: 'termina_em'
                    });
                }
                const inicioRef = inicia_em || existingTorneo.inicia_em;
                if (inicioRef && new Date(termina_em) <= new Date(inicioRef)) {
                    return res.status(400).json({
                        message: 'A data de término deve ser posterior à data de início.',
                        field: 'termina_em'
                    });
                }
            }

            const [updated] = await Torneio.update(
                { titulo, descricao, inicia_em, termina_em, maximo_participantes, status, publico },
                { where: { id } }
            );

            if (updated) {
                const torneo = await Torneio.findOne({ where: { id } });
                res.status(200).json(torneo);
            } else {
                res.status(404).json({ message: 'Torneio não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao atualizar torneio', error: error.message });
        }
    },

    // Delete tournament
    deleteTorneo: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar se torneio existe
            const torneio = await Torneio.findByPk(id);
            if (!torneio) {
                return res.status(404).json({ message: 'Torneio não encontrado' });
            }
            
            // Deletar com cascade (sem force, deixar o banco fazer o cascade)
            const deleted = await Torneio.destroy({ 
                where: { id }
            });
            
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Torneio não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao deletar torneio:', error);
            
            // Tratamento específico para erros de constraint
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
