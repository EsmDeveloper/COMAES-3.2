import express from 'express';
import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import Usuario from '../models/User.js';
import TorneoController from '../controllers/TorneioController.js';
import CertificateController from '../controllers/CertificateController.js';
import sequelize from '../config/db.js';

const router = express.Router();

// Helper para normalizar disciplina (URL/Parâmetro -> Banco de Dados)
const normalizeDisciplina = (name) => {
  if (!name) return '';
  const normalized = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (normalized === 'matematica') return 'Matemática';
  if (normalized === 'programacao') return 'Programação';
  if (normalized === 'ingles' || normalized === 'lingua inglesa') return 'Inglês';
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// Helper: busca participantes com dados de usuário e calcula posição dinamicamente
const fetchRanking = async (where) => {
  const participantes = await ParticipanteTorneio.findAll({
    where,
    include: [{
      model: Usuario,
      as: 'usuario',
      attributes: ['id', 'nome', 'imagem', 'email', 'nivel_atual', 'xp_total'],
    }],
    order: [
      ['pontuacao', 'DESC'],
      ['tempo_total', 'ASC'],
      ['entrou_em', 'ASC'],
    ],
  });
  return participantes.map((p, i) => ({ ...p.toJSON(), posicao: i + 1 }));
};

// ── Listar todos os torneios 
router.get('/', async (req, res) => {
  try {
    const torneios = await Torneio.findAll({
      attributes: ['id', 'titulo', 'descricao', 'inicia_em', 'termina_em', 'status', 'criado_em', 'tipo_torneio', 'disciplina_especifica'],
      order: [['criado_em', 'DESC']],
      limit: 50,
    });
    res.json({ success: true, tournaments: torneios });
  } catch (error) {
    console.error('Erro ao listar torneios:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✨ ── Criar novo torneio (ADMIN) 
router.post('/', TorneoController.createTorneo);

// ✨ IMPORTANT: Specific routes BEFORE generic /:id routes!

// ✨ 1. Verificar participação ativa do usuário (ESPECÍFICA: /usuario/:usuario_id/...)
router.get('/usuario/:usuario_id/participacao-ativa', TorneoController.verificarParticipacaoAtiva);

// ✨ 2. Obter torneio ativo (ESPECÍFICA: /ativo)
router.get('/ativo', async (req, res) => {
  try {
    const agora = new Date();
    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo',
        inicia_em: { [sequelize.Sequelize.Op.lte]: agora },
        termina_em: { [sequelize.Sequelize.Op.gte]: agora }
      },
      attributes: ['id', 'titulo', 'descricao', 'inicia_em', 'termina_em', 'status', 'criado_em', 'tipo_torneio', 'disciplina_especifica'],
      order: [['criado_em', 'DESC']],
      limit: 1
    });

    if (torneio) {
      res.json({ success: true, ativo: true, torneio: torneio.toJSON() });
    } else {
      res.json({ success: true, ativo: false, torneio: null });
    }
  } catch (error) {
    console.error('Erro ao obter torneio ativo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✨ 3. Obter disciplinas do torneio ativo (ESPECÍFICA: /ativo/disciplinas)
router.get('/ativo/disciplinas', async (req, res) => {
  try {
    const agora = new Date();
    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo',
        inicia_em: { [sequelize.Sequelize.Op.lte]: agora },
        termina_em: { [sequelize.Sequelize.Op.gte]: agora }
      },
      attributes: ['id', 'tipo_torneio', 'disciplina_especifica']
    });

    if (!torneio) {
      return res.status(404).json({ success: false, error: 'Nenhum torneio ativo encontrado' });
    }

    // Se for específico, retorna apenas a disciplina específica
    if (torneio.tipo_torneio === 'especifico') {
      return res.json({ success: true, disciplinas: [torneio.disciplina_especifica] });
    }

    // Se for genérico, busca todas as disciplinas com blocos de questões
    const disciplinas = await ParticipanteTorneio.findAll({
      where: { torneio_id: torneio.id, status: 'confirmado' },
      attributes: [[sequelize.Sequelize.fn('DISTINCT', sequelize.Sequelize.col('disciplina_competida')), 'disciplina']],
      raw: true
    });

    const disciplinasUnicas = disciplinas.map(d => d.disciplina || d.disciplina_competida).filter(d => d);
    res.json({ success: true, disciplinas: disciplinasUnicas.length > 0 ? disciplinasUnicas : ['Matemática', 'Inglês', 'Programação'] });
  } catch (error) {
    console.error('Erro ao obter disciplinas do torneio ativo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✨ 4. CERTIFICADOS - Certificados endpoints (ESPECÍFICAS: /certificados/...)
router.post('/certificados/gerar-automaticos', CertificateController.gerarAutomaticosParaTorneio);
router.get('/certificados/torneio/:torneio_id', CertificateController.listarPorTorneio);
router.get('/certificados/validar/:codigo', CertificateController.validarCertificado);
router.get('/certificados/contar-automaticos/:torneio_id', CertificateController.contarAutomaticos);
router.get('/certificados/usuario/:usuario_id', CertificateController.obterPorUsuario);
router.put('/certificados/:id/validar', CertificateController.validarCertificadoAdmin);
router.put('/certificados/:id/cancelar', CertificateController.cancelarCertificado);

// ✨ GENERIC routes AFTER specific ones

// ── Contagem de participantes por disciplina 
router.get('/:tournamentId/participant-counts', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { sequelize } = await import('../config/db.js');

    const counts = await ParticipanteTorneio.findAll({
      where: { torneio_id: tournamentId, status: 'confirmado' },
      attributes: [
        'disciplina_competida',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      ],
      group: ['disciplina_competida'],
      raw: true,
    });

    const result = { 'Matemática': 0, 'Inglês': 0, 'Programação': 0, total: 0 };
    counts.forEach(c => {
      const disc = c.disciplina_competida;
      const n = parseInt(c.total) || 0;
      if (disc && result[disc] !== undefined) result[disc] = n;
      result.total += n;
    });

    res.json({ success: true, counts: result });
  } catch (error) {
    console.error('Erro ao contar participantes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Ranking completo de um torneio (todas as disciplinas) 
router.get('/:tournamentId/ranking', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { includeInactive } = req.query;

    const torneio = await Torneio.findByPk(tournamentId);
    if (!torneio) {
      return res.status(404).json({ success: false, error: 'Torneio não encontrado' });
    }

    const where = { torneio_id: tournamentId };
    if (includeInactive !== 'true') where.status = 'confirmado';

    const ranking = await fetchRanking(where);

    res.json({
      success: true,
      tournament: torneio.toJSON(),
      totalParticipants: ranking.length,
      ranking,
    });
  } catch (error) {
    console.error('Erro ao obter ranking do torneio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Ranking filtrado por disciplina 
router.get('/:tournamentId/ranking/:disciplina', async (req, res) => {
  try {
    const { tournamentId, disciplina } = req.params;
    const { includeInactive } = req.query;
    const disciplinaFormatada = normalizeDisciplina(disciplina);

    const torneio = await Torneio.findByPk(tournamentId);
    if (!torneio) {
      return res.status(404).json({ success: false, error: 'Torneio não encontrado' });
    }

    const where = { torneio_id: tournamentId, disciplina_competida: disciplinaFormatada };
    if (includeInactive !== 'true') where.status = 'confirmado';

    const ranking = await fetchRanking(where);

    res.json({
      success: true,
      tournament: torneio.toJSON(),
      disciplina: disciplinaFormatada,
      totalParticipants: ranking.length,
      ranking,
    });
  } catch (error) {
    console.error('Erro ao obter ranking por disciplina:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
