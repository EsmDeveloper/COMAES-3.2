// BackEnd/routes/certificadosRoutes.js
import express from 'express';
import Certificado from '../models/Certificado.js';
import Usuario from '../models/User.js';
import Torneio from '../models/Torneio.js';
// generateCertificado importado lazily para não bloquear o arranque do servidor
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/certificados/:usuarioId/:torneioId/:disciplina
 * Obter certificado de um utilizador
 */
router.get('/:usuarioId/:torneioId/:disciplina', async (req, res) => {
  try {
    const { usuarioId, torneioId, disciplina } = req.params;

    const certificado = await Certificado.findOne({
      where: {
        usuario_id: usuarioId,
        torneio_id: torneioId,
        disciplina: disciplina
      },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Torneio, as: 'torneio', attributes: ['id', 'titulo'] }
      ]
    });

    if (!certificado) {
      return res.status(404).json({ success: false, error: 'Certificado não encontrado' });
    }

    // Marcar como validado
    if (certificado.status === 'gerado') {
      certificado.data_validacao = new Date();
      certificado.status = 'validado';
      await certificado.save();
    }

    res.json({ success: true, data: certificado.toJSON() });
  } catch (error) {
    console.error('Erro ao buscar certificado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/certificados/gerar/:torneioId/:disciplina
 * Gerar certificados para os 3 primeiros colocados
 */
router.post('/gerar/:torneioId/:disciplina', async (req, res) => {
  try {
    const { torneioId, disciplina } = req.params;

    // Lazy import para não bloquear arranque do servidor
    const { generateCertificatesForTournament } = await import('../certificates/generator/generateCertificado.js');
    const result = await generateCertificatesForTournament(torneioId, disciplina);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erro ao gerar certificados:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/certificados/meus-certificados/:usuarioId
 * Listar todos os certificados de um utilizador
 */
router.get('/meus-certificados/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const certificados = await Certificado.findAll({
      where: { usuario_id: usuarioId },
      include: [
        { model: Torneio, as: 'torneio', attributes: ['id', 'titulo', 'termina_em'] }
      ],
      order: [['data_geracao', 'DESC']]
    });

    res.json({ success: true, data: certificados });
  } catch (error) {
    console.error('Erro ao listar certificados:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/certificados/verificar/:codigo
 * Verificar autenticidade de um certificado
 */
router.get('/verificar/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    const certificado = await Certificado.findOne({
      where: { codigo_certificado: codigo },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Torneio, as: 'torneio', attributes: ['id', 'titulo'] }
      ]
    });

    if (!certificado) {
      return res.status(404).json({ success: false, error: 'Certificado inválido ou não encontrado' });
    }

    res.json({ 
      success: true, 
      data: {
        valido: true,
        usuario: certificado.usuario?.nome,
        torneio: certificado.torneio?.titulo,
        disciplina: certificado.disciplina,
        posicao: certificado.posicao,
        pontuacao: certificado.pontuacao,
        dataGeracao: certificado.data_geracao,
        status: certificado.status
      }
    });
  } catch (error) {
    console.error('Erro ao verificar certificado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/certificados/download/:codigo
 * Descarregar ficheiro do certificado
 */
router.get('/download/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    const certificado = await Certificado.findOne({
      where: { codigo_certificado: codigo }
    });

    if (!certificado || !certificado.url_certificado) {
      return res.status(404).json({ success: false, error: 'Certificado não encontrado' });
    }

    const filePath = path.join(__dirname, '../uploads', certificado.url_certificado);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Ficheiro do certificado não encontrado' });
    }

    res.download(filePath, `Certificado_${certificado.codigo_certificado}.pdf`);
  } catch (error) {
    console.error('Erro ao descarregar certificado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/certificados/:id
 * Cancelar/Remover um certificado
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const certificado = await Certificado.findByPk(id);

    if (!certificado) {
      return res.status(404).json({ success: false, error: 'Certificado não encontrado' });
    }

    certificado.status = 'cancelado';
    await certificado.save();

    res.json({ success: true, message: 'Certificado cancelado com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar certificado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/certificados/admin/todos
 * Listar todos os certificados (admin only)
 */
router.get('/admin/todos', async (req, res) => {
  try {
    // Verificar autenticação via token
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }

    // Tentar include com associações; se falhar, devolver sem include
    let certificados;
    try {
      certificados = await Certificado.findAll({
        include: [
          { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
          { model: Torneio, as: 'torneio', attributes: ['id', 'titulo', 'termina_em'] }
        ],
        order: [['data_geracao', 'DESC']]
      });
    } catch (assocErr) {
      // Fallback: sem include se associações não estiverem carregadas
      console.warn('[certificadosRoutes] Include falhou, usando fallback:', assocErr.message);
      certificados = await Certificado.findAll({ order: [['data_geracao', 'DESC']] });
    }

    res.json({ success: true, data: certificados });
  } catch (error) {
    console.error('Erro ao listar todos os certificados:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
