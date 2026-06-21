/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMAES 3.2 - SISTEMA UNIFICADO DE AUTORIZAÇÃO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * ÚNICO SISTEMA DE PERMISSÕES DO PROJETO
 * 
 * Este arquivo substitui:
 * - roleMiddleware.js (refatorado e simplificado)
 * - isAdmin.js (ELIMINADO)
 * - checkRolePermission (unificado aqui)
 * - permissionMap (centralizado aqui)
 * 
 * REGRAS:
 * - role é a ÚNICA fonte de verdade
 * - Database é authoritative (req.user já vem do middleware auth)
 * - Sem fallbacks, sem JWT checks, sem isAdmin
 */

/**
 * Middleware factory para verificar role
 * @param {string|string[]} allowedRoles - Roles permitidos
 * @returns {Function} Express middleware
 */
export const requireRole = (allowedRoles) => {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // authenticate middleware deve ser executado primeiro
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.role || 'estudante';

    if (rolesArray.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Acesso negado. Requer um dos seguintes roles: ${rolesArray.join(', ')}`,
      code: 'INSUFFICIENT_ROLE',
      required_roles: rolesArray,
      user_role: userRole
    });
  };
};

/**
 * Atalho: apenas administradores
 */
export const requireAdmin = requireRole('admin');

/**
 * Atalho: colaboradores ou admins
 */
export const requireColaboradorOrAdmin = requireRole(['colaborador', 'admin']);

/**
 * Atalho: apenas colaboradores
 */
export const requireColaborador = requireRole('colaborador');

/**
 * Middleware para verificar se o usuário está acessando seus próprios recursos
 * Admins podem acessar qualquer recurso
 * 
 * @param {Function} getResourceOwnerId - Função que retorna o ID do dono do recurso
 *                                         Recebe (req) e retorna Promise<number>
 */
export const requireOwnershipOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Admin pode tudo
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);
      
      if (String(req.user.id) === String(ownerId)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso.',
        code: 'NOT_OWNER'
      });
    } catch (err) {
      console.error('[AUTHORIZE] Erro ao verificar ownership:', err);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar permissões.',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

/**
 * Exportar como default o requireRole para compatibilidade
 */
export default requireRole;
