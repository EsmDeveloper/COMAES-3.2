import jwt from 'jsonwebtoken';
import Usuario from '../models/User.js';
import Funcao from '../models/Funcao.js';

// Middleware para verificar se o usuário é um administrador
// The logic first tries to rely on the jwt payload (fast path) and
// then falls back to a database lookup so that role/flag changes
// take effect immediately without requiring the user to re‑login.
const isAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' });
  }

  // fast path: jwt includes explicit flag
  if (decoded.isAdmin) {
    req.user = decoded;
    return next();
  }

  // slow path: check database in case the flag was added/removed after
  // the token was issued or the project uses a role table instead of
  // the boolean flag.
  try {
    const user = await Usuario.findByPk(decoded.id, {
      include: [{ model: Funcao, as: 'funcao' }]
    });

    if (user && (user.isAdmin || user.funcao?.nome === 'Administrador' || user.role === 'admin')) {
      // attach resolved information to request
      req.user = {
        ...decoded,
        isAdmin: true,
        funcao: user.funcao,
        role: user.role
      };
      return next();
    }
  } catch (dbErr) {
    console.error('Error checking admin role in database:', dbErr);
    // proceed to deny access below
  }

  return res.status(403).json({ message: 'Acesso negado. Somente administradores podem acessar esta rota.' });
};

export default isAdmin;
