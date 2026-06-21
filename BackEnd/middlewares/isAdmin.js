/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEPRECATED - Este arquivo foi completamente substituído
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * O conceito de "isAdmin" foi ELIMINADO do sistema.
 * 
 * Use os novos middlewares:
 * - authenticate (auth.js) - Valida JWT e carrega usuário do DB
 * - requireAdmin (authorize.js) - Verifica role === 'admin'
 * 
 * Este arquivo mantém export por compatibilidade mas delega para o novo sistema
 */

import { authenticate } from './auth.js';
import { requireAdmin } from './authorize.js';

/**
 * Middleware legacy que combina autenticação + verificação de admin
 * Equivalente a: app.use(authenticate, requireAdmin)
 */
export const isAdmin = [authenticate, requireAdmin];

export default isAdmin;
