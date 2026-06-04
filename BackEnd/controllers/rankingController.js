/**
 * rankingController.js — Controller dos rankings educacionais COMAES
 *
 * Endpoints:
 *   GET /api/rankings            → documentação
 *   GET /api/rankings/public     → top 10 público
 *   GET /api/rankings/geral      → top 100 (autenticado)
 *   GET /api/rankings/matematica → top 100 (autenticado)
 *   GET /api/rankings/programacao→ top 100 (autenticado)
 *   GET /api/rankings/ingles     → top 100 (autenticado)
 *   GET /api/rankings/minha-posicao → posição do usuário logado
 *   GET /api/rankings/estatisticas  → admin
 *   POST /api/rankings/atualizar    → admin — força invalidação cache
 */

import {
  getRanking,
  getRankingPublico,
  getPosicaoUsuario,
  getEstatisticasGerais,
  invalidarCacheRankings,
} from '../services/rankingService.js';

// Helper para resposta de erro
const erro = (res, status, message, detail) =>
  res.status(status).json({ success: false, message, error: detail || message, data: [] });

export const getRankingPublicoCtrl = async (req, res) => {
  try {
    const data = await getRankingPublico();
    res.json({
      success: true,
      message: 'Ranking público retornado com sucesso',
      data,
      metadata: { total: data.length, limit: 10, disciplina: 'geral', access: 'public', timestamp: new Date().toISOString() },
    });
  } catch (e) {
    console.error('[ranking] public:', e);
    erro(res, 500, 'Erro ao buscar ranking público', e.message);
  }
};

export const getRankingGeralCtrl = async (req, res) => {
  if (!req.user) return erro(res, 401, 'Autenticação necessária');
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const data = await getRanking('geral', limit);
    res.json({ success: true, message: 'Ranking geral retornado', data, metadata: { total: data.length, disciplina: 'geral', timestamp: new Date().toISOString() } });
  } catch (e) {
    console.error('[ranking] geral:', e);
    erro(res, 500, 'Erro ao buscar ranking geral', e.message);
  }
};

export const getRankingMatematicaCtrl = async (req, res) => {
  if (!req.user) return erro(res, 401, 'Autenticação necessária');
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const data = await getRanking('matematica', limit);
    res.json({ success: true, message: 'Ranking de matemática retornado', data, metadata: { total: data.length, disciplina: 'matematica', timestamp: new Date().toISOString() } });
  } catch (e) {
    console.error('[ranking] matematica:', e);
    erro(res, 500, 'Erro ao buscar ranking de matemática', e.message);
  }
};

export const getRankingProgramacaoCtrl = async (req, res) => {
  if (!req.user) return erro(res, 401, 'Autenticação necessária');
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const data = await getRanking('programacao', limit);
    res.json({ success: true, message: 'Ranking de programação retornado', data, metadata: { total: data.length, disciplina: 'programacao', timestamp: new Date().toISOString() } });
  } catch (e) {
    console.error('[ranking] programacao:', e);
    erro(res, 500, 'Erro ao buscar ranking de programação', e.message);
  }
};

export const getRankingInglesCtrl = async (req, res) => {
  if (!req.user) return erro(res, 401, 'Autenticação necessária');
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const data = await getRanking('ingles', limit);
    res.json({ success: true, message: 'Ranking de inglês retornado', data, metadata: { total: data.length, disciplina: 'ingles', timestamp: new Date().toISOString() } });
  } catch (e) {
    console.error('[ranking] ingles:', e);
    erro(res, 500, 'Erro ao buscar ranking de inglês', e.message);
  }
};

export const getMinhaPosicaoCtrl = async (req, res) => {
  if (!req.user) return erro(res, 401, 'Autenticação necessária');
  try {
    const data = await getPosicaoUsuario(req.user.id);
    res.json({ success: true, message: 'Posição retornada', data, metadata: { usuario_id: req.user.id, timestamp: new Date().toISOString() } });
  } catch (e) {
    console.error('[ranking] minha-posicao:', e);
    erro(res, 500, 'Erro ao buscar posição', e.message);
  }
};

export const getEstatisticasCtrl = async (req, res) => {
  if (!req.user?.isAdmin) return erro(res, 403, 'Acesso restrito a administradores');
  try {
    const data = await getEstatisticasGerais();
    res.json({ success: true, data, metadata: { timestamp: new Date().toISOString() } });
  } catch (e) {
    console.error('[ranking] estatisticas:', e);
    erro(res, 500, 'Erro ao buscar estatísticas', e.message);
  }
};

export const postAtualizarCtrl = async (req, res) => {
  if (!req.user?.isAdmin) return erro(res, 403, 'Acesso restrito a administradores');
  try {
    await invalidarCacheRankings();
    res.json({ success: true, message: 'Cache de rankings invalidado com sucesso', data: { atualizado_em: new Date() } });
  } catch (e) {
    console.error('[ranking] atualizar:', e);
    erro(res, 500, 'Erro ao atualizar rankings', e.message);
  }
};
