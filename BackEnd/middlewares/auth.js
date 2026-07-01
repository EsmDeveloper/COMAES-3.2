/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMAES 3.2 - SISTEMA UNIFICADO DE AUTENTICAÇÃO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * PRINCÍPIOS FUNDAMENTAIS:
 * 1. JWT serve APENAS para AUTENTICAÇÃO (identidade)
 * 2. Database é SEMPRE a fonte de verdade para AUTORIZAÇÃO
 * 3. role ∈ { 'estudante', 'colaborador', 'admin' } - ÚNICA fonte de permissões
 * 4. isAdmin foi ELIMINADO completamente do sistema
 * 
 * Este middleware substitui:
 * - isAdmin.js (REMOVIDO)
 * - Parte de roleMiddleware.js (refatorado)
 * - auth.js anterior (se existia)
 */

import jwt from 'jsonwebtoken';
import Usuario from '../models/User.js';

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e extrai o ID do usuário
 * NÃO verifica permissões (isso é feito pelo roleMiddleware)
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido.',
      code: 'NO_TOKEN'
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Token expirado. Faça login novamente.' : 'Token inválido.',
      code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    });
  }

  // JWT só carrega ID - buscar usuário completo do DB
  try {
    const user = await Usuario.unscoped().findByPk(decoded.id, {
      attributes: [
        'id',
        'nome',
        'email',
        'role',
        'status_colaborador',
        'disciplina_colaborador'
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar status de usuários especiais
    if (user.role === 'colaborador') {
      if (user.status_colaborador === 'pendente') {
        return res.status(403).json({
          success: false,
          message: 'Sua solicitação de colaborador está aguardando aprovação.',
          code: 'COLABORADOR_PENDENTE',
          status_colaborador: 'pendente'
        });
      }
      if (user.status_colaborador === 'rejeitado') {
        return res.status(403).json({
          success: false,
          message: 'Sua solicitação de colaborador foi rejeitada.',
          code: 'COLABORADOR_REJEITADO',
          status_colaborador: 'rejeitado'
        });
      }
      if (user.status_colaborador === 'suspenso') {
        return res.status(403).json({
          success: false,
          message: 'Sua conta de colaborador está suspensa.',
          code: 'COLABORADOR_SUSPENSO',
          status_colaborador: 'suspenso'
        });
      }
    }

    // Anexar usuário completo do DB ao request
    req.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      status_colaborador: user.status_colaborador,
      disciplina_colaborador: user.disciplina_colaborador
    };

    next();
  } catch (dbErr) {
    console.error('[AUTH] Erro crítico ao buscar usuário:', {
      userId: decoded.id,
      error: dbErr.message,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      success: false,
      message: 'Erro ao validar autenticação. Tente novamente.',
      code: 'AUTH_DB_ERROR'
    });
  }
};

/**
 * Middleware de autenticação SEM bloqueio por status de colaborador.
 * Usar em endpoints de consulta pessoal (streak, nivel, dashboard)
 * que qualquer utilizador autenticado deve poder aceder independentemente
 * do status_colaborador.
 */
export const authenticateAny = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido.',
      code: 'NO_TOKEN'
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Token expirado. Faça login novamente.' : 'Token inválido.',
      code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    });
  }

  try {
    const user = await Usuario.unscoped().findByPk(decoded.id, {
      attributes: ['id', 'nome', 'email', 'role', 'status_colaborador', 'disciplina_colaborador']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado.',
        code: 'USER_NOT_FOUND'
      });
    }

    // ✅ Sem bloqueio por status — qualquer utilizador autenticado passa
    req.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      status_colaborador: user.status_colaborador,
      disciplina_colaborador: user.disciplina_colaborador
    };

    next();
  } catch (dbErr) {
    console.error('[AUTH] Erro ao buscar usuário (authenticateAny):', dbErr.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar autenticação.',
      code: 'AUTH_DB_ERROR'
    });
  }
};

/**
 * Middleware opcional para rotas públicas
 * Tenta autenticar mas não bloqueia se falhar
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await Usuario.unscoped().findByPk(decoded.id, {
      attributes: [
        'id',
        'nome',
        'email',
        'role',
        'status_colaborador',
        'disciplina_colaborador'
      ]
    });

    req.user = user ? {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      status_colaborador: user.status_colaborador,
      disciplina_colaborador: user.disciplina_colaborador
    } : null;
  } catch (err) {
    req.user = null;
  }

  next();
};

export default authenticate;
