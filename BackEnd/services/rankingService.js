/**
 * rankingService.js — Rankings educacionais COMAES
 *
 * Fonte de verdade: tabela participantes_torneios
 * Agrega pontuacao acumulada de todos os torneios finalizados por estudante.
 *
 * Regras:
 * - Apenas usuários com role = 'estudante'
 * - Apenas participações com status = 'confirmado'
 * - Apenas em torneios com status = 'finalizado'
 * - Pontuação = soma de participante.pontuacao em todos os torneios válidos
 * - Disciplina extraída de participante.disciplina_competida (normalizada)
 * - Cache de 5 minutos em memória
 */

import { Op, fn, col, literal } from 'sequelize';
import cache from '../config/cache.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import Torneio from '../models/Torneio.js';
import Usuario from '../models/User.js';
import Ranking from '../models/Ranking.js';

// Mapa de normalização disciplina_competida -> chave interna
const DISCIPLINA_MAP = {
  'Matemática': 'matematica',
  'Inglês':     'ingles',
  'Programação': 'programacao',
  // fallbacks sem acento
  'matematica': 'matematica',
  'ingles':     'ingles',
  'programacao': 'programacao',
};

// Normalizar para chave interna
function normalizarDisciplina(raw) {
  return DISCIPLINA_MAP[raw] || 'geral';
}

// Obter conexão sequelize
function getSequelize() {
  return ParticipanteTorneio.sequelize;
}

/**
 * Calcular ranking em tempo real diretamente da base de dados.
 * Retorna array de estudantes ordenado por pontuacao_total DESC.
 *
 * @param {'geral'|'matematica'|'ingles'|'programacao'} disciplina
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function calcularRankingReal(disciplina = 'geral', limit = 100) {
  const sequelize = getSequelize();

  // Filtro de disciplina_competida para WHERE
  let disciplinaWhere = {};
  if (disciplina !== 'geral') {
    // Mapear chave interna -> valor real no banco
    const REVERSE_MAP = { matematica: 'Matemática', ingles: 'Inglês', programacao: 'Programação' };
    const valorBanco = REVERSE_MAP[disciplina];
    if (valorBanco) {
      disciplinaWhere = { disciplina_competida: valorBanco };
    }
  }

  // Query: agregar pontuação de torneios finalizados por estudante
  const rows = await ParticipanteTorneio.findAll({
    attributes: [
      'usuario_id',
      [fn('SUM', col('ParticipanteTorneio.pontuacao')), 'pontuacao_total'],
      [fn('COUNT', col('ParticipanteTorneio.id')), 'total_torneios'],
      [fn('AVG', col('ParticipanteTorneio.pontuacao')), 'media_pontuacao'],
      [fn('MAX', col('ParticipanteTorneio.atualizado_em')), 'ultima_atividade'],
    ],
    where: {
      status: 'confirmado',
      ...disciplinaWhere,
    },
    include: [
      {
        model: Torneio,
        as: 'torneio',
        attributes: [],
        where: { status: 'finalizado' },
        required: true,
      },
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nome', 'imagem', 'nivel_atual', 'xp_total', 'role'],
        where: { role: 'estudante' },
        required: true,
      },
    ],
    group: ['usuario_id', 'usuario.id'],
    order: [[fn('SUM', col('ParticipanteTorneio.pontuacao')), 'DESC']],
    limit,
    subQuery: false,
  });

  return rows.map((row, index) => ({
    position: index + 1,
    usuario_id: row.usuario_id,
    nome: row.usuario?.nome || 'Estudante',
    imagem: row.usuario?.imagem || null,
    nivel_atual: row.usuario?.nivel_atual || 1,
    xp_total: row.usuario?.xp_total || 0,
    pontuacao_total: parseFloat(row.dataValues.pontuacao_total) || 0,
    total_torneios: parseInt(row.dataValues.total_torneios) || 0,
    media_pontuacao: parseFloat(row.dataValues.media_pontuacao) || 0,
    ultima_atividade: row.dataValues.ultima_atividade || null,
    disciplina,
  }));
}

/**
 * Obter ranking com cache de 5 minutos.
 */
export async function getRanking(disciplina = 'geral', limit = 100, forceRefresh = false) {
  const CACHE_KEY = `ranking_real:${disciplina}:${limit}`;
  const CACHE_TTL = 300; // 5 min

  if (!forceRefresh) {
    const cached = await cache.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const dados = await calcularRankingReal(disciplina, limit);
  await cache.set(CACHE_KEY, JSON.stringify(dados), CACHE_TTL);
  return dados;
}

/**
 * Ranking público — top 10 geral, dados reduzidos.
 */
export async function getRankingPublico() {
  const CACHE_KEY = 'ranking_real:publico:top10';
  const CACHE_TTL = 300;

  const cached = await cache.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const dados = await calcularRankingReal('geral', 10);
  const publico = dados.map(item => ({
    position: item.position,
    nome: item.nome,
    pontuacao_total: item.pontuacao_total,
    nivel_atual: item.nivel_atual,
    total_torneios: item.total_torneios,
    disciplina: 'geral',
  }));

  await cache.set(CACHE_KEY, JSON.stringify(publico), CACHE_TTL);
  return publico;
}

/**
 * Posição do usuário em todas as disciplinas.
 */
export async function getPosicaoUsuario(usuarioId) {
  const disciplinas = ['geral', 'matematica', 'programacao', 'ingles'];
  const posicoes = {};

  await Promise.all(disciplinas.map(async (disc) => {
    const ranking = await getRanking(disc, 200);
    const idx = ranking.findIndex(r => r.usuario_id === usuarioId);
    const meuDado = ranking[idx];

    posicoes[disc] = {
      disciplina: disc,
      posicao: idx >= 0 ? idx + 1 : null,
      pontuacao_total: meuDado?.pontuacao_total || 0,
      total_torneios: meuDado?.total_torneios || 0,
      total_participantes: ranking.length,
    };
  }));

  return posicoes;
}

/**
 * Estatísticas gerais.
 */
export async function getEstatisticasGerais() {
  const sequelize = getSequelize();

  const [totalEstudantes, totalTorneiosFinalizados, ranking] = await Promise.all([
    Usuario.count({ where: { role: 'estudante' } }),
    Torneio.count({ where: { status: 'finalizado' } }),
    getRanking('geral', 3),
  ]);

  return {
    total_estudantes: totalEstudantes,
    total_torneios_finalizados: totalTorneiosFinalizados,
    top_3: ranking,
    ultima_atualizacao: new Date(),
  };
}

/**
 * Invalidar todo o cache de rankings.
 */
export async function invalidarCacheRankings() {
  const keys = [
    'ranking_real:geral:100',
    'ranking_real:matematica:100',
    'ranking_real:programacao:100',
    'ranking_real:ingles:100',
    'ranking_real:publico:top10',
    'ranking_real:geral:200',
    'ranking_real:matematica:200',
    'ranking_real:programacao:200',
    'ranking_real:ingles:200',
  ];
  await Promise.all(keys.map(k => cache.del(k)));
}
