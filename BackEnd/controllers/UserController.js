/**
 * UserController.js
 * Full-featured admin user management controller.
 * Mirrors all validations from the public registration endpoint.
 */

import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import Usuario from '../models/User.js';

// ── Validation helpers (mirrors BackEnd/middlewares/validate.js) ──────────
const RE = {
  name:      /^[A-Za-zÀ-ÖØ-öø-ÿ'\s]{2,100}$/,
  email:     /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password:  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/,
  phoneLocal:/^9[1-9]\d{7}$/,
  phoneIntl: /^\+2449[1-9]\d{7}$/,
};

const isEmpty = (v) => v === undefined || v === null || String(v).trim() === '';

function validateAdminUserPayload(data, isCreate = true) {
  const errors = {};

  // nome
  if (isCreate || data.nome !== undefined) {
    if (isEmpty(data.nome)) {
      errors.nome = 'O nome é obrigatório.';
    } else {
      const v = data.nome.trim();
      if (v.length < 2 || v.length > 100) errors.nome = 'O nome deve ter entre 2 e 100 caracteres.';
      else if (/\d/.test(v)) errors.nome = 'O nome não pode conter números.';
      else if (!RE.name.test(v)) errors.nome = 'O nome deve conter apenas letras e espaços.';
    }
  }

  // email
  if (isCreate || data.email !== undefined) {
    if (isEmpty(data.email)) {
      errors.email = 'O e-mail é obrigatório.';
    } else {
      const v = data.email.trim().toLowerCase();
      if (v.length > 254) errors.email = 'O e-mail é demasiado longo.';
      else if (!RE.email.test(v)) errors.email = 'O e-mail informado é inválido.';
      else if (/@(gmai|gmal|gmial|hotmal|hotmial|outlok|yaho|yhoo)\.com$/i.test(v))
        errors.email = 'Verifique o domínio do e-mail.';
    }
  }

  // telefone
  if (isCreate || data.telefone !== undefined) {
    if (isCreate && isEmpty(data.telefone)) {
      errors.telefone = 'O telefone é obrigatório.';
    } else if (!isEmpty(data.telefone)) {
      const v = data.telefone.trim();
      if (!RE.phoneLocal.test(v) && !RE.phoneIntl.test(v))
        errors.telefone = 'O telefone deve ter 9 dígitos válidos começando com 9.';
    }
  }

  // nascimento
  if (isCreate || data.nascimento !== undefined) {
    if (isCreate && isEmpty(data.nascimento)) {
      errors.nascimento = 'A data de nascimento é obrigatória.';
    } else if (!isEmpty(data.nascimento)) {
      const d = new Date(data.nascimento);
      if (isNaN(d.getTime())) errors.nascimento = 'Data de nascimento inválida.';
      else if (d > new Date()) errors.nascimento = 'A data de nascimento não pode estar no futuro.';
    }
  }

  // sexo
  if (isCreate || data.sexo !== undefined) {
    if (isCreate && isEmpty(data.sexo)) {
      errors.sexo = 'O sexo é obrigatório.';
    } else if (!isEmpty(data.sexo) && !['Masculino', 'Feminino'].includes(data.sexo)) {
      errors.sexo = 'Sexo inválido.';
    }
  }

  // password (required on create, optional on update)
  if (isCreate) {
    if (isEmpty(data.password)) {
      errors.password = 'A senha é obrigatória.';
    } else if (!RE.password.test(data.password)) {
      errors.password = 'A senha deve ter no mínimo 8 caracteres, maiúscula, minúscula, número e símbolo.';
    }
    // confirmPassword
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem.';
    }
  } else if (!isEmpty(data.password)) {
    if (!RE.password.test(data.password)) {
      errors.password = 'A senha deve ter no mínimo 8 caracteres, maiúscula, minúscula, número e símbolo.';
    }
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem.';
    }
  }

  return errors;
}

// ── GET /api/admin/users ──────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await Usuario.unscoped().findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ message: 'Erro ao obter usuários', error: error.message });
  }
};

// ── POST /api/admin/users ─────────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const body = req.body;
    const requestingUser = req.user; // set by isAdmin middleware

    // Validate all fields
    const fieldErrors = validateAdminUserPayload(body, true);
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(422).json({ message: 'Dados inválidos.', fieldErrors });
    }

    // Only super-admin (first admin / isAdmin from DB) can create other admins
    if (body.isAdmin && !requestingUser?.isAdmin) {
      return res.status(403).json({
        message: 'Apenas o Administrador Supremo pode criar outros administradores.',
        fieldErrors: { isAdmin: 'Sem permissão para criar administradores.' },
      });
    }

    // Check uniqueness
    const existing = await Usuario.unscoped().findOne({
      where: { [Op.or]: [{ email: body.email.trim().toLowerCase() }, { telefone: body.telefone.trim() }] },
    });
    if (existing) {
      const dupes = {};
      if (existing.email === body.email.trim().toLowerCase()) dupes.email = 'Este e-mail já está registado.';
      if (existing.telefone === body.telefone.trim()) dupes.telefone = 'Este telefone já está registado.';
      return res.status(409).json({ message: 'Dados já existentes.', fieldErrors: dupes });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await Usuario.create({
      nome:       body.nome.trim(),
      email:      body.email.trim().toLowerCase(),
      telefone:   body.telefone.trim(),
      nascimento: body.nascimento,
      sexo:       body.sexo,
      escola:     body.escola?.trim() || null,
      biografia:  body.biografia?.trim() || '',
      password:   hashedPassword,
      isAdmin:    requestingUser?.isAdmin ? Boolean(body.isAdmin) : false,
    });

    const { password: _, ...userSafe } = newUser.get({ plain: true });
    res.status(201).json({ message: 'Usuário criado com sucesso.', data: userSafe });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const fieldErrors = {};
      error.errors.forEach(e => { fieldErrors[e.path] = e.message; });
      return res.status(422).json({ message: 'Erro de validação.', fieldErrors });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fieldErrors = {};
      error.errors.forEach(e => { fieldErrors[e.path] = 'Este valor já está em uso.'; });
      return res.status(409).json({ message: 'Dados duplicados.', fieldErrors });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário.', error: error.message });
  }
};

// ── PUT /api/admin/users/:id ──────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const requestingUser = req.user;

    // Cannot edit yourself via admin panel (use profile page)
    if (String(requestingUser?.id) === String(id) && body.isAdmin !== undefined) {
      return res.status(403).json({
        message: 'Não é possível alterar os próprios privilégios administrativos.',
      });
    }

    // Only super-admin can change isAdmin flag
    if (body.isAdmin !== undefined && !requestingUser?.isAdmin) {
      return res.status(403).json({
        message: 'Apenas o Administrador Supremo pode alterar privilégios administrativos.',
        fieldErrors: { isAdmin: 'Sem permissão para alterar privilégios.' },
      });
    }

    // Validate only provided fields
    const fieldErrors = validateAdminUserPayload(body, false);
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(422).json({ message: 'Dados inválidos.', fieldErrors });
    }

    const user = await Usuario.unscoped().findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // Check uniqueness for changed fields
    if (body.email || body.telefone) {
      const orConditions = [];
      if (body.email) orConditions.push({ email: body.email.trim().toLowerCase() });
      if (body.telefone) orConditions.push({ telefone: body.telefone.trim() });

      const existing = await Usuario.unscoped().findOne({
        where: { [Op.or]: orConditions, id: { [Op.ne]: id } },
      });
      if (existing) {
        const dupes = {};
        if (body.email && existing.email === body.email.trim().toLowerCase()) dupes.email = 'Este e-mail já está em uso.';
        if (body.telefone && existing.telefone === body.telefone.trim()) dupes.telefone = 'Este telefone já está em uso.';
        return res.status(409).json({ message: 'Dados já existentes.', fieldErrors: dupes });
      }
    }

    // Build update payload
    const updateData = {};
    if (body.nome      !== undefined) updateData.nome      = body.nome.trim();
    if (body.email     !== undefined) updateData.email     = body.email.trim().toLowerCase();
    if (body.telefone  !== undefined) updateData.telefone  = body.telefone.trim();
    if (body.nascimento!== undefined) updateData.nascimento= body.nascimento;
    if (body.sexo      !== undefined) updateData.sexo      = body.sexo;
    if (body.escola    !== undefined) updateData.escola    = body.escola?.trim() || null;
    if (body.biografia !== undefined) updateData.biografia = body.biografia?.trim() || '';
    if (body.isAdmin   !== undefined && requestingUser?.isAdmin) updateData.isAdmin = Boolean(body.isAdmin);

    // Hash new password if provided
    if (!isEmpty(body.password)) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    await user.update(updateData);

    const { password: _, ...userSafe } = user.get({ plain: true });
    res.status(200).json({ message: 'Usuário atualizado com sucesso.', data: userSafe });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const fieldErrors = {};
      error.errors.forEach(e => { fieldErrors[e.path] = e.message; });
      return res.status(422).json({ message: 'Erro de validação.', fieldErrors });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fieldErrors = {};
      error.errors.forEach(e => { fieldErrors[e.path] = 'Este valor já está em uso.'; });
      return res.status(409).json({ message: 'Dados duplicados.', fieldErrors });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário.', error: error.message });
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Cannot delete yourself
    if (String(requestingUser?.id) === String(id)) {
      return res.status(403).json({ message: 'Não é possível excluir a própria conta.' });
    }

    const user = await Usuario.unscoped().findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // Only super-admin can delete other admins
    if (user.isAdmin && !requestingUser?.isAdmin) {
      return res.status(403).json({ message: 'Apenas o Administrador Supremo pode excluir outros administradores.' });
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro ao deletar usuário.', error: error.message });
  }
};

// ── PATCH /api/admin/users/:id/toggle-admin ───────────────────────────────
const toggleAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Only super-admin can promote/demote
    if (!requestingUser?.isAdmin) {
      return res.status(403).json({ message: 'Apenas o Administrador Supremo pode alterar privilégios administrativos.' });
    }

    // Cannot change own admin status
    if (String(requestingUser?.id) === String(id)) {
      return res.status(403).json({ message: 'Não é possível alterar os próprios privilégios.' });
    }

    const user = await Usuario.unscoped().findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    await user.update({ isAdmin: !user.isAdmin });

    const { password: _, ...userSafe } = user.get({ plain: true });
    res.status(200).json({
      message: `Privilégios ${userSafe.isAdmin ? 'concedidos' : 'removidos'} com sucesso.`,
      data: userSafe,
    });
  } catch (error) {
    console.error('Erro ao alterar privilégios:', error);
    res.status(500).json({ message: 'Erro ao alterar privilégios.', error: error.message });
  }
};

// ── PATCH /api/admin/users/:id/reset-password ─────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (isEmpty(newPassword)) {
      return res.status(422).json({ message: 'A nova senha é obrigatória.', fieldErrors: { newPassword: 'Campo obrigatório.' } });
    }
    if (!RE.password.test(newPassword)) {
      return res.status(422).json({
        message: 'Senha inválida.',
        fieldErrors: { newPassword: 'A senha deve ter no mínimo 8 caracteres, maiúscula, minúscula, número e símbolo.' },
      });
    }
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(422).json({ message: 'As senhas não coincidem.', fieldErrors: { confirmPassword: 'As senhas não coincidem.' } });
    }

    const user = await Usuario.unscoped().findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro ao redefinir senha.', error: error.message });
  }
};

export default { getAllUsers, createUser, updateUser, deleteUser, toggleAdmin, resetPassword };
