/**
 * nivelController.js
 *
 * GET  /api/usuarios/me/nivel — Retorna nível, XP e progresso do utilizador autenticado
 * PUT  /api/usuarios/xp       — Incrementa XP manualmente (admin ou sistema interno)
 */

import Usuario from '../models/User.js';
import Nivel from '../models/Nivel.js';
import {
  calcularNivel,
  calcularProgressoParaProximoNivel,
  incrementarXP,
  NIVEIS,
} from '../services/xpService.js';

// ── GET /api/usuarios/me/nivel 
export const getMeuNivel = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Não autenticado.' });
    }

    // Buscar utilizador com colunas XP (sem excluir password apenas para agrupar atributos)
    const usuario = await Usuario.unscoped().findByPk(usuarioId, {
      attributes: ['id', 'nome', 'xp_total', 'nivel_atual'],
    });

    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Utilizador não encontrado.' });
    }

    const xpTotal  = usuario.xp_total  || 0;
    const nivelNum = usuario.nivel_atual || calcularNivel(xpTotal);

    // Buscar metadados do nível actual
    const nivelInfo = await Nivel.findOne({ where: { numero: nivelNum } });

    // Buscar metadados do próximo nível
    const proximoNivelInfo = await Nivel.findOne({ where: { numero: nivelNum + 1 } });

    const progresso = calcularProgressoParaProximoNivel(xpTotal);

    return res.json({
      success: true,
      data: {
        xp_total: xpTotal,
        nivel_atual: nivelNum,
        nivel_info: nivelInfo,
        proximo_nivel: proximoNivelInfo,
        progresso: {
          xp_no_nivel: progresso.xpNoNivel ?? 0,
          xp_para_proximo: progresso.xpParaProximo ?? 0,
          percentual: progresso.percentual,
          maximo: !proximoNivelInfo,
        },
        todos_niveis: NIVEIS,
      },
    });
  } catch (error) {
    console.error('[nivelController] getMeuNivel:', error);
    return res.status(500).json({ success: false, error: 'Erro ao obter nível.' });
  }
};

// ── PUT /api/usuarios/xp 
// Uso administrativo ou por outros serviços internos para conceder XP
export const adicionarXP = async (req, res) => {
  try {
    const { usuario_id, xp, motivo } = req.body;

    if (!usuario_id || !xp || xp <= 0) {
      return res.status(400).json({
        success: false,
        error: 'usuario_id e xp (> 0) são obrigatórios.',
      });
    }

    const resultado = await incrementarXP(usuario_id, xp, motivo || 'manual-admin');

    if (!resultado) {
      return res.status(404).json({ success: false, error: 'Utilizador não encontrado.' });
    }

    return res.json({
      success: true,
      data: resultado,
      message: resultado.subiu
        ? `+${xp} XP concedido. Utilizador subiu para o nível ${resultado.nivelNovo}!`
        : `+${xp} XP concedido.`,
    });
  } catch (error) {
    console.error('[nivelController] adicionarXP:', error);
    return res.status(500).json({ success: false, error: 'Erro ao adicionar XP.' });
  }
};
