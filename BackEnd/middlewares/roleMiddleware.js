/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEPRECATED - Este arquivo foi substituído
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Use os novos middlewares:
 * - BackEnd/middlewares/auth.js (autenticação)
 * - BackEnd/middlewares/authorize.js (autorização)
 * 
 * Este arquivo mantém exports por compatibilidade mas delega para o novo sistema
 */

import { requireRole, requireAdmin, requireColaboradorOrAdmin, requireColaborador } from './authorize.js';

// Exports para compatibilidade retroativa
export const createRoleMiddleware = requireRole;
export const isAdminRole = requireAdmin;
export const isColaboradorRole = requireColaborador;
export const isColaboradorOrAdmin = requireColaboradorOrAdmin;

export default requireRole;
