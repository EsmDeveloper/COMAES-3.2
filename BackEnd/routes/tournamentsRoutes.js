import express from 'express';
import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import Usuario from '../models/User.js';

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
      attributes: ['id', 'nome', 'imagem', 'email'],
    }],
    order: [
      ['pontuacao', 'DESC'],
      ['tempo_total', 'ASC'],
      ['entrou_em', 'ASC'],
    ],
  });
  return participantes.map((p, i) => ({ ...p.toJSON(), posicao: i + 1 }));
};

// ── Listar todos os torneios ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const torneios = await Torneio.findAll({
      attributes: ['id', 'titulo', 'descricao', 'inicia_em', 'termina_em', 'status', 'criado_em'],
      order: [['criado_em', 'DESC']],
      limit: 50,
    });
    res.json({ success: true, tournaments: torneios });
  } catch (error) {
    console.error('Erro ao listar torneios:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Contagem de participantes por disciplina ──────────────────────────────
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

// ── Ranking completo de um torneio (todas as disciplinas) ─────────────────
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

// ── Ranking filtrado por disciplina ───────────────────────────────────────
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
