import jwt from 'jsonwebtoken';
import Usuario from '../models/User.js';

/**
 * Permission mapping for different roles
 * Defines which actions/routes each role can access
 * 
 * - 'estudante': Basic user access (view tournaments, participate, view ranking)
 * - 'colaborador': Question management access (create, edit, delete own questions)
 * - 'admin': All access (manage everything)
 */
const permissionMap = {
  'estudante': ['ver_torneios', 'participar_torneios', 'ver_ranking'],
  'colaborador': ['criar_questao', 'editar_questao', 'deletar_questao', 'ver_minhas_questoes', 'ver_torneios', 'participar_torneios'],
  'admin': ['*']  // Admin has all permissions
};

/**
 * Check if a user's role has permission for an action
 * Implements Algorithm 2 from design: checkRolePermission
 * 
 * @param {Object} user - User object from JWT or database
 * @param {string|string[]} requiredPermissions - Permission(s) needed
 * @returns {boolean} - true if user has permission, false otherwise
 */
const checkRolePermission = (user, requiredPermissions) => {
  // Verify user is authenticated
  if (!user) {
    return false;
  }

  // Get user's role
  const userRole = user.role || 'estudante';
  
  // Get user's permissions
  const userPermissions = permissionMap[userRole] || [];
  
  // Check if user has admin role (all permissions)
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // Normalize requiredPermissions to array
  const requiredArray = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  // Check if user has all required permissions
  return requiredArray.every(permission => userPermissions.includes(permission));
};

/**
 * Creates a role middleware for Express
 * Supports both JWT payload and database lookup for immediate role changes
 * 
 * @param {string|string[]} requiredRoles - Role(s) required to access route
 * @returns {Function} - Express middleware function
 */
export const createRoleMiddleware = (requiredRoles) => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({ 
        message: 'Token não fornecido.',
        success: false
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(401).json({ 
        message: 'Token inválido.',
        success: false
      });
    }

    // Normalize requiredRoles to array
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Fast path: check JWT payload role
    if (rolesArray.includes(decoded.role)) {
      req.user = decoded;
      return next();
    }

    // Slow path: check database for role changes after token issuance
    try {
      const user = await Usuario.unscoped().findByPk(decoded.id).catch(() => null);

      if (!user) {
        return res.status(401).json({ 
          message: 'Usuário não encontrado.',
          success: false
        });
      }

      const userRole = user.role || 'estudante';
      
      if (rolesArray.includes(userRole)) {
        req.user = { ...decoded, role: userRole, disciplina_colaborador: user.disciplina_colaborador };
        return next();
      }
    } catch (dbErr) {
      console.error('Error checking role in database:', dbErr);
      // proceed to deny access below
    }

    return res.status(403).json({ 
      message: 'Acesso negado. Você não tem permissão para acessar este recurso.',
      success: false,
      requiredRole: rolesArray
    });
  };
};

/**
 * Middleware to check if user is 'admin' role
 * Returns 403 for non-admin users
 */
export const isAdminRole = createRoleMiddleware(['admin']);

/**
 * Middleware to check if user is 'colaborador' role
 * Returns 403 for non-collaborator users
 */
export const isColaboradorRole = createRoleMiddleware(['colaborador']);

/**
 * Middleware to check if user is 'colaborador' or 'admin' role
 * Returns 403 for estudante users
 */
export const isColaboradorOrAdmin = createRoleMiddleware(['colaborador', 'admin']);

/**
 * Export the permission checking function for use in controllers
 */
export { checkRolePermission };

export default createRoleMiddleware;
