import express from 'express';
import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import Usuario from '../models/User.js';
import TorneoController from '../controllers/TorneioController.js';
import CertificateController from '../controllers/CertificateController.js';

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

// ✨ ─────────────────────────────────────────────────────────────────────────
// ✨ SISTEMA DE TORNEIOS - NOVOS ENDPOINTS
// ✨ ─────────────────────────────────────────────────────────────────────────

// ✨ 1. Verificar participação ativa do usuário
router.get('/usuario/:usuario_id/participacao-ativa', TorneoController.verificarParticipacaoAtiva);

// ✨ 2. Verificar torneios ativos (máximo 1)
router.get('/admin/torneios-ativos', TorneoController.verificarTorneiosAtivos);

// ✨ 3. Ativar torneio
router.post('/:id/ativar', TorneoController.ativarTorneio);

// ✨ 4. Verificar encerramentos automáticos (SCHEDULER)
router.post('/admin/verificar-encerramentos', TorneoController.verificarEncerramentos);

// ✨ 5. Finalizar torneio com geração de certificados
router.post('/:id/finalizar', TorneoController.finalizarTorneio);

// ✨ 6. Obter ranking persistido (não recalcula)
router.get('/:id/ranking-persistido', TorneoController.obterRanking);

// ✨ ─────────────────────────────────────────────────────────────────────────
// ✨ CERTIFICADOS - NOVOS ENDPOINTS
// ✨ ─────────────────────────────────────────────────────────────────────────

// ✨ 1. Gerar certificados automáticos para um torneio
router.post('/certificados/gerar-automaticos', CertificateController.gerarAutomaticosParaTorneio);

// ✨ 2. Listar certificados de um torneio
router.get('/certificados/torneio/:torneio_id', CertificateController.listarPorTorneio);

// ✨ 3. Validar certificado por código
router.get('/certificados/validar/:codigo', CertificateController.validarCertificado);

// ✨ 4. Contar certificados automáticos
router.get('/certificados/contar-automaticos/:torneio_id', CertificateController.contarAutomaticos);

// ✨ 5. Obter certificados de um usuário
router.get('/certificados/usuario/:usuario_id', CertificateController.obterPorUsuario);

// ✨ 6. Validar certificado (admin)
router.put('/certificados/:id/validar', CertificateController.validarCertificadoAdmin);

// ✨ 7. Cancelar certificado
router.put('/certificados/:id/cancelar', CertificateController.cancelarCertificado);

export default router;
