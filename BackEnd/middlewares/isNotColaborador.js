/**
 * Middleware para bloquear colaboradores de acessar rotas restritas
 * (torneios, quizzes, ranking, competições)
 */

import jwt from 'jsonwebtoken';
import Usuario from '../models/User.js';

const isNotColaborador = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  // Se não houver token, permite (algumas rotas podem ser públicas)
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Buscar usuário no banco para verificar role atualizada
    const user = await Usuario.findByPk(decoded.id, {
      attributes: ['id', 'role', 'status_colaborador']
    });

    if (!user) {
      return next(); // Usuário não encontrado, deixar outras validações tratarem
    }

    // Bloquear se for colaborador aprovado
    if (user.role === 'colaborador' && user.status_colaborador === 'aprovado') {
      return res.status(403).json({
        success: false,
        error: 'Colaboradores não podem participar de competições (torneios, quizzes, ranking).',
        code: 'COLABORADOR_NOT_ALLOWED'
      });
    }

    // Adicionar informações do usuário ao request
    req.user = {
      ...decoded,
      role: user.role,
      status_colaborador: user.status_colaborador
    };

    next();
  } catch (err) {
    // Token inválido - deixar outras validações tratarem
    next();
  }
};

export default isNotColaborador;