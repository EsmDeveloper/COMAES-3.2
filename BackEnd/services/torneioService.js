// services/torneioService.js
import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import Usuario from '../models/User.js';
import { Op } from 'sequelize';

const torneioService = {
  // Verificar se há torneio ativo para uma disciplina
  verificarTorneioAtivo: async (disciplina) => {
    try {
      const torneioAtivo = await Torneio.findOne({
        where: {
          status: 'ativo',
          disciplinas: {
            [Op.like]: `%${disciplina}%`
          }
        }
      });

      return torneioAtivo;
    } catch (error) {
      console.error('Erro ao verificar torneio ativo:', error);
      return null;
    }
  },

  // Buscar torneios finalizados de um usuário
  buscarTorneiosFinalizadosUsuario: async (userId) => {
    try {
      const torneiosFinalizados = await ParticipanteTorneio.findAll({
        where: {
          usuario_id: userId,
          status: 'confirmado'
        },
        include: [{
          model: Torneio,
          as: 'torneio',
          where: {
            status: 'finalizado'
          }
        }],
        order: [['torneio', 'termina_em', 'DESC']]
      });

      return torneiosFinalizados;
    } catch (error) {
      console.error('Erro ao buscar torneios finalizados:', error);
      return [];
    }
  },

  // Verificar se usuário participou de um torneio específico
  verificarParticipacao: async (userId, torneioId, disciplina) => {
    try {
      const participacao = await ParticipanteTorneio.findOne({
        where: {
          usuario_id: userId,
          torneio_id: torneioId,
          disciplina_competida: disciplina,
          status: 'confirmado'
        }
      });

      return !!participacao;
    } catch (error) {
      console.error('Erro ao verificar participação:', error);
      return false;
    }
  }
};

export default torneioService;
