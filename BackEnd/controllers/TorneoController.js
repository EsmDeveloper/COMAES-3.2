import Torneio from '../models/Torneio.js';
import Usuario from '../models/User.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';

export const TorneoController = {
    // Get all tournaments
    getAllTorneos: async (req, res) => {
        try {
            const torneos = await Torneio.findAll({
                include: [
                    { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
                    { model: ParticipanteTorneio, as: 'participantes', attributes: ['id', 'usuario_id', 'disciplina_competida', 'status'] }
                ]
            });
            res.status(200).json(torneos);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao obter torneios', error: error.message });
        }
    },

    // Inscrever usuário em uma disciplina
    inscreverParticipante: async (req, res) => {
        try {
            const { torneio_id, usuario_id, disciplina_competida } = req.body;

            const novoParticipante = await ParticipanteTorneio.create({
                torneio_id,
                usuario_id,
                disciplina_competida,
                status: 'confirmado' // Auto-confirmar por enquanto
            });

            res.status(201).json({
                message: 'Inscrição realizada com sucesso!',
                data: novoParticipante
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Obter participantes por torneio e disciplina
    getParticipantes: async (req, res) => {
        try {
            const { id } = req.params;
            const { disciplina } = req.query;

            const where = { torneio_id: id };
            if (disciplina) where.disciplina_competida = disciplina;

            const participantes = await ParticipanteTorneio.findAll({
                where,
                include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem'] }],
                order: [['pontuacao', 'DESC']]
            });

            res.status(200).json(participantes);
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
            const { titulo, descricao, inicia_em, termina_em, maximo_participantes, criado_por, status, publico } = req.body;

            if (!titulo) {
                return res.status(400).json({ message: 'Título é obrigatório' });
            }

            // Create main tournament
            const slug = titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            
            const novoTorneo = await Torneio.create({
                titulo,
                slug,
                descricao,
                inicia_em,
                termina_em,
                maximo_participantes,
                criado_por: criado_por || 1,
                status: status || 'rascunho',
                publico: publico !== false
            });

            res.status(201).json({
                message: 'Torneio criado com sucesso! As 3 disciplinas (Matemática, Inglês e Programação) foram ativadas automaticamente.',
                torneio: novoTorneo
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao criar torneio', error: error.message });
        }
    },

    // Update tournament
    updateTorneo: async (req, res) => {
        try {
            const { id } = req.params;
            const { titulo, descricao, inicia_em, termina_em, maximo_participantes, status, publico } = req.body;

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
            
            const deleted = await Torneio.destroy({ where: { id } });
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Torneio não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao deletar torneio', error: error.message });
        }
    }
};

export default TorneoController;
