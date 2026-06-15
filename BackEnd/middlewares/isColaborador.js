import jwt from 'jsonwebtoken';
import Usuario from '../models/User.js';

/**
 * ColaboradorMiddleware - Verifies user has role 'colaborador' and disciplina_colaborador defined
 * 
 * Requirements: 14.2, 14.4
 * Algorithm 2 from design.md
 * 
 * This middleware:
 * 1. Verifies user has role 'colaborador'
 * 2. Verifies disciplina_colaborador is defined (not NULL)
 * 3. Returns 403 if verification fails
 * 4. Calls next() if verification succeeds
 */
const isColaborador = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token não fornecido.' 
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Fetch user from database to verify current role and disciplina_colaborador
    const dbUser = await Usuario.unscoped().findByPk(decoded.id, {
      attributes: ['id', 'email', 'role', 'disciplina_colaborador', 'nome']
    });

    // Check if user exists in database
    if (!dbUser) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado.' 
      });
    }

    const user = dbUser.get({ plain: true });

    // Verify user has role 'colaborador' (Requirement 14.2)
    if (user.role !== 'colaborador') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Apenas colaboradores podem acessar esta rota.' 
      });
    }

    // Verify disciplina_colaborador is defined (Requirement 14.4)
    if (!user.disciplina_colaborador) {
      return res.status(403).json({ 
        success: false, 
        message: 'Colaborador sem disciplina atribuída.' 
      });
    }

    // Attach user info to request object
    req.user = {
      ...decoded,
      ...user,
      isColaborador: true
    };

    // Verification successful, proceed to next middleware
    next();
  } catch (err) {
    // Handle JWT verification errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado.' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido.' 
    });
  }
};

export default isColaborador;
