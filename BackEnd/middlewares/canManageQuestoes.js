import jwt from 'jsonwebtoken';
import Usuario from '../models/User.js';

const isCollaborator = (user) => user?.role === 'colaborador';
const isAdminUser = (user) => Boolean(user?.isAdmin) || user?.role === 'admin';

const canManageQuestoes = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token nao fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const dbUser = await Usuario.unscoped().findByPk(decoded.id, {
      attributes: ['id', 'email', 'isAdmin', 'role', 'disciplina_colaborador', 'status_colaborador']
    });

    if (!dbUser) {
      return res.status(401).json({ message: 'Usuario nao encontrado.' });
    }

    const user = dbUser.get({ plain: true });
    if (!isAdminUser(user) && !isCollaborator(user)) {
      return res.status(403).json({ message: 'Acesso negado. Apenas admin ou colaborador podem gerir questoes.' });
    }

    if (isCollaborator(user) && !user.disciplina_colaborador) {
      return res.status(403).json({ message: 'Colaborador sem disciplina atribuida.' });
    }

    if (isCollaborator(user) && user.status_colaborador !== 'aprovado') {
      return res.status(403).json({ message: 'Colaborador ainda nao aprovado.' });
    }

    req.user = {
      ...decoded,
      ...user,
      isAdmin: isAdminUser(user),
      isColaborador: isCollaborator(user)
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalido.' });
  }
};

export default canManageQuestoes;
