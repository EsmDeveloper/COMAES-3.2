import Certificate from '../models/Certificate.js';
import Torneio from '../models/Torneio.js';
import Usuario from '../models/User.js';
import sequelize from '../config/db.js';

/**
 * CertificateController - Gerenciamento de Certificados
 * 
 * Funcionalidades:
 * - Geração automática de certificados (top 3)
 * - Validação de certificados
 * - Listagem e consulta
 * - Rastreamento de auto-geração
 */

export const CertificateController = {
  
  // ✨ 1. Gerar certificados automáticos para um torneio (chamado ao finalizar)
  gerarAutomaticosParaTorneio: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { torneio_id } = req.body;

      if (!torneio_id) {
        await transaction.rollback();
        return res.status(400).json({ message: 'torneio_id é obrigatório' });
      }

      // Buscar torneio
      const torneio = await Torneio.findByPk(torneio_id, { transaction });
      if (!torneio) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Torneio não encontrado' });
      }

      const disciplinas = ['Matemática', 'Inglês', 'Programação'];
      const resultados = [];

      for (const disciplina of disciplinas) {
        try {
          // Buscar top 3 para esta disciplina
          const top3 = await sequelize.query(
            `SELECT pt.id, pt.usuario_id, pt.posicao, pt.pontuacao 
             FROM participantes_torneios pt 
             WHERE pt.torneio_id = :torneio_id 
             AND pt.disciplina_competida = :disciplina
             AND pt.status = 'confirmado'
             AND pt.posicao_congelada = true
             AND pt.posicao <= 3
             ORDER BY pt.posicao ASC`,
            {
              replacements: { torneio_id, disciplina },
              type: sequelize.QueryTypes.SELECT,
              transaction
            }
          );

          const certificadosGerados = [];

          for (const participante of top3) {
            try {
              // Gerar certificado automático
              const cert = await Certificate.gerarAutomaticamente(
                participante.usuario_id,
                torneio_id,
                participante.posicao,
                parseFloat(participante.pontuacao),
                disciplina
              );

              certificadosGerados.push({
                usuario_id: participante.usuario_id,
                posicao: participante.posicao,
                certificado_id: cert.id,
                medalha: cert.tipo_medalha,
                codigo: cert.codigo_verificacao
              });
            } catch (e) {
              console.error(`[WARNING] Erro ao gerar certificado para ${participante.usuario_id}:`, e.message);
            }
          }

          resultados.push({
            disciplina,
            certificados_gerados: certificadosGerados.length,
            certificados: certificadosGerados
          });
        } catch (e) {
          console.log(`[INFO]  Nenhum participante em ${disciplina}`);
        }
      }

      await transaction.commit();

      res.status(200).json({
        message: 'Certificados automáticos gerados com sucesso!',
        torneio_id,
        total_certificados: resultados.reduce((sum, r) => sum + r.certificados_gerados, 0),
        resultados
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao gerar certificados:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // ✨ 2. Listar certificados de um torneio
  listarPorTorneio: async (req, res) => {
    try {
      const { torneio_id } = req.params;
      const { apenasAutomaticos } = req.query;

      if (!torneio_id) {
        return res.status(400).json({ message: 'torneio_id é obrigatório' });
      }

      // Validar torneio existe
      const torneio = await Torneio.findByPk(torneio_id);
      if (!torneio) {
        return res.status(404).json({ message: 'Torneio não encontrado' });
      }

      // Buscar certificados
      const where = { torneio_id };
      if (apenasAutomaticos === 'true') {
        where.auto_gerado = true;
      }

      const certificados = await Certificate.findAll({
        where,
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nome', 'email', 'imagem']
          }
        ],
        order: [['posicao', 'ASC']],
        attributes: ['id', 'posicao', 'tipo_medalha', 'status', 'data_geracao', 'auto_gerado', 'codigo_verificacao']
      });

      // Formatar resposta
      const certificadosFormatados = certificados.map(c => ({
        id: c.id,
        usuario: c.Usuario,
        posicao: c.posicao,
        medalha: c.tipo_medalha,
        status: c.status,
        auto_gerado: c.auto_gerado,
        data_geracao: c.data_geracao,
        codigo_verificacao: c.codigo_verificacao
      }));

      res.status(200).json({
        torneio: {
          id: torneio.id,
          titulo: torneio.titulo
        },
        total: certificadosFormatados.length,
        certificados: certificadosFormatados
      });
    } catch (error) {
      console.error('Erro ao listar certificados:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // ✨ 3. Validar certificado por código
  validarCertificado: async (req, res) => {
    try {
      const { codigo } = req.params;

      if (!codigo) {
        return res.status(400).json({ message: 'código é obrigatório' });
      }

      // Buscar certificado
      const certificado = await Certificate.findOne({
        where: { codigo_verificacao: codigo },
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nome', 'email', 'imagem', 'nivel_atual', 'xp_total']
          },
          {
            model: Torneio,
            attributes: ['id', 'titulo', 'tipo_torneio', 'termina_em']
          }
        ]
      });

      if (!certificado) {
        return res.status(404).json({
          valido: false,
          mensagem: 'Certificado não encontrado'
        });
      }

      // Retornar dados do certificado
      res.status(200).json({
        valido: true,
        certificado: {
          id: certificado.id,
          codigo: certificado.codigo_verificacao,
          posicao: certificado.posicao,
          medalha: certificado.tipo_medalha,
          status: certificado.status,
          data_geracao: certificado.data_geracao,
          auto_gerado: certificado.auto_gerado,
          usuario: certificado.Usuario,
          torneio: certificado.Torneio,
          url_certificado: certificado.url_certificado
        }
      });
    } catch (error) {
      console.error('Erro ao validar certificado:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // ✨ 4. Contar certificados automáticos de um torneio
  contarAutomaticos: async (req, res) => {
    try {
      const { torneio_id } = req.params;

      if (!torneio_id) {
        return res.status(400).json({ message: 'torneio_id é obrigatório' });
      }

      // Validar torneio existe
      const torneio = await Torneio.findByPk(torneio_id);
      if (!torneio) {
        return res.status(404).json({ message: 'Torneio não encontrado' });
      }

      // Contar certificados automáticos
      const quantidade = await Certificate.countAutomaticosEmTorneio(torneio_id);

      // Contar por status
      const porStatus = await Certificate.findAll({
        where: {
          torneio_id,
          auto_gerado: true
        },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'quantidade']
        ],
        group: ['status'],
        raw: true
      });

      res.status(200).json({
        torneio_id,
        total_automaticos: quantidade,
        por_status: porStatus
      });
    } catch (error) {
      console.error('Erro ao contar certificados:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // ✨ 5. Obter certificados de um usuário
  obterPorUsuario: async (req, res) => {
    try {
      const { usuario_id } = req.params;
      const { apenasValidos } = req.query;

      if (!usuario_id) {
        return res.status(400).json({ message: 'usuario_id é obrigatório' });
      }

      // Validar usuário existe
      const usuario = await Usuario.findByPk(usuario_id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Buscar certificados
      const where = { usuario_id };
      if (apenasValidos === 'true') {
        where.status = 'validado';
      }

      const certificados = await Certificate.findAll({
        where,
        include: [
          {
            model: Torneio,
            attributes: ['id', 'titulo', 'tipo_torneio', 'termina_em']
          }
        ],
        order: [['data_geracao', 'DESC']],
        attributes: ['id', 'posicao', 'tipo_medalha', 'status', 'data_geracao', 'auto_gerado', 'disciplina']
      });

      // Formatar resposta
      const certificadosFormatados = certificados.map(c => ({
        id: c.id,
        torneio: c.Torneio,
        disciplina: c.disciplina,
        posicao: c.posicao,
        medalha: c.tipo_medalha,
        status: c.status,
        auto_gerado: c.auto_gerado,
        data_geracao: c.data_geracao
      }));

      res.status(200).json({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        total: certificadosFormatados.length,
        certificados: certificadosFormatados
      });
    } catch (error) {
      console.error('Erro ao obter certificados do usuário:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // ✨ 6. Validar (marcar como 'validado') um certificado
  validarCertificadoAdmin: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'id é obrigatório' });
      }

      // Buscar certificado
      const certificado = await Certificate.findByPk(id);
      if (!certificado) {
        return res.status(404).json({ message: 'Certificado não encontrado' });
      }

      // Validar certificado
      await certificado.validar();

      res.status(200).json({
        message: 'Certificado validado com sucesso!',
        certificado: {
          id: certificado.id,
          status: certificado.status,
          data_validacao: certificado.data_validacao
        }
      });
    } catch (error) {
      console.error('Erro ao validar certificado:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // ✨ 7. Cancelar um certificado
  cancelarCertificado: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'id é obrigatório' });
      }

      // Buscar certificado
      const certificado = await Certificate.findByPk(id);
      if (!certificado) {
        return res.status(404).json({ message: 'Certificado não encontrado' });
      }

      // Cancelar certificado
      await certificado.cancelar();

      res.status(200).json({
        message: 'Certificado cancelado com sucesso!',
        certificado: {
          id: certificado.id,
          status: certificado.status
        }
      });
    } catch (error) {
      console.error('Erro ao cancelar certificado:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

export default CertificateController;
