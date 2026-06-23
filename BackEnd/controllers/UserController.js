/**
 * UserController.js
 * Full-featured admin user management controller.
 * Mirrors all validations from the public registration endpoint.
 */

import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import Usuario from '../models/User.js';
import Disciplina from '../models/Disciplina.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { uploadColaboradorDocs } from '../middlewares/security/colaboradorUpload.js';

// ── Validation helpers (mirrors BackEnd/middlewares/validate.js) 
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
  const rolesValidos = ['estudante', 'colaborador', 'admin'];
  const disciplinasValidas = ['matematica', 'ingles', 'programacao'];
  const niveisAcademicosValidos = [
    'estudante_universitario', 'tecnico', 'licenciado', 'mestre',
    'doutor', 'professor', 'profissional', 'outro'
  ];

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

  // username - obrigatório para colaborador
  const role = data.role || 'estudante';
  if (role === 'colaborador') {
    if (isEmpty(data.username)) {
      errors.username = 'O username é obrigatório para colaborador.';
    } else {
      const v = data.username.trim();
      if (v.length < 3 || v.length > 30) {
        errors.username = 'O username deve ter entre 3 e 30 caracteres.';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(v)) {
        errors.username = 'O username pode conter apenas letras, números, _ e -.';
      }
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

  // biografia - obrigatória para colaborador (30-500 caracteres)
  if (role === 'colaborador') {
    if (isEmpty(data.biografia)) {
      errors.biografia = 'A biografia é obrigatória para colaborador.';
    } else {
      const v = data.biografia.trim();
      if (v.length < 30) {
        errors.biografia = 'A biografia deve ter pelo menos 30 caracteres.';
      } else if (v.length > 500) {
        errors.biografia = 'A biografia não pode ter mais de 500 caracteres.';
      }
    }
  }

  // nivel_academico - obrigatório para colaborador
  if (role === 'colaborador') {
    if (isEmpty(data.nivel_academico)) {
      errors.nivel_academico = 'O nível académico é obrigatório para colaborador.';
    } else if (!niveisAcademicosValidos.includes(data.nivel_academico)) {
      errors.nivel_academico = 'Nível académico inválido.';
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

  if (data.role !== undefined && !rolesValidos.includes(data.role)) {
    errors.role = 'Perfil inválido.';
  }

  if (data.disciplina_colaborador !== undefined && data.disciplina_colaborador !== null && data.disciplina_colaborador !== '') {
    if (!disciplinasValidas.includes(data.disciplina_colaborador)) {
      errors.disciplina_colaborador = 'Disciplina inválida.';
    }
  }
  if (role === 'colaborador' && isEmpty(data.disciplina_colaborador)) {
    errors.disciplina_colaborador = 'A disciplina é obrigatória para colaborador.';
  }

  return errors;
}

// ── GET /api/admin/users 
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

// ── POST /api/admin/users 
const createUser = async (req, res) => {
  try {
    const body = req.body;
    const requestingUser = req.user; // set by authenticate + requireAdmin middleware

    // Validate all fields
    const fieldErrors = validateAdminUserPayload(body, true);
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(422).json({ message: 'Dados inválidos.', fieldErrors });
    }

    // Only super-admin (id=1) can create other admins
    const requestedRole = body.role || 'estudante';
    const isMasterAdmin = String(requestingUser?.id) === '1';
    
    if (requestedRole === 'admin' && !isMasterAdmin) {
      return res.status(403).json({
        message: 'Apenas o Administrador Supremo pode criar outros administradores.',
        fieldErrors: { role: 'Sem permissão para criar administradores.' },
      });
    }

    // Check uniqueness
    const whereConditions = [
      { email: body.email.trim().toLowerCase() },
      { telefone: body.telefone.trim() }
    ];
    
    // Adicionar username à verificação de unicidade se for colaborador
    if (requestedRole === 'colaborador' && body.username) {
      whereConditions.push({ username: body.username.trim() });
    }
    
    const existing = await Usuario.unscoped().findOne({
      where: { [Op.or]: whereConditions },
    });
    if (existing) {
      const dupes = {};
      if (existing.email === body.email.trim().toLowerCase()) dupes.email = 'Este e-mail já está registado.';
      if (existing.telefone === body.telefone.trim()) dupes.telefone = 'Este telefone já está registado.';
      if (existing.username === body.username?.trim()) dupes.username = 'Este username já está em uso.';
      return res.status(409).json({ message: 'Dados já existentes.', fieldErrors: dupes });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Processar documentos se houver (para colaboradores)
    let documentosColaborador = null;
    if (requestedRole === 'colaborador' && req.files && req.files.length > 0) {
      documentosColaborador = req.files.map(f => ({
        nome_original: f.originalname,
        nome_arquivo: f.filename,
        caminho: f.path,
        tamanho: f.size,
        tipo: f.mimetype,
        data_upload: new Date().toISOString(),
      }));
    }

    const newUser = await Usuario.create({
      nome:       body.nome.trim(),
      username:   requestedRole === 'colaborador' ? body.username?.trim() : null,
      email:      body.email.trim().toLowerCase(),
      telefone:   body.telefone.trim(),
      nascimento: body.nascimento,
      sexo:       body.sexo,
      escola:     body.escola?.trim() || null,
      biografia:  body.biografia?.trim() || '',
      nivel_academico: requestedRole === 'colaborador' ? body.nivel_academico : null,
      password:   hashedPassword,
      role:       requestedRole,
      disciplina_colaborador: requestedRole === 'colaborador' ? body.disciplina_colaborador : null,
      documentos_colaborador: documentosColaborador,
      // Admin cria colaboradores diretamente aprovados
      status_colaborador: requestedRole === 'colaborador' ? 'aprovado' : 'aprovado',
    });

    const { password: _, ...userSafe } = newUser.get({ plain: true });

    // Enviar email de boas-vindas em background (não bloqueia resposta)
    setImmediate(async () => {
      try {
        await sendWelcomeEmail(newUser.email, newUser.nome);
        console.log('[email] Boas-vindas enviado (admin criou):', newUser.email);
      } catch (emailErr) {
        console.warn('[email] Falha ao enviar boas-vindas:', emailErr.message);
      }
    });

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

// ── POST /api/admin/users/create-admin 
// Cria um sub-administrador com apenas email + senha.
// Apenas o Administrador Supremo pode usar este endpoint.
const createAdminUser = async (req, res) => {
  try {
    const body = req.body;
    const requestingUser = req.user;

    // Apenas super-admin (id=1) pode criar outros admins
    const isMasterAdmin = String(requestingUser?.id) === '1';
    if (!isMasterAdmin) {
      return res.status(403).json({
        message: 'Apenas o Administrador Supremo pode criar outros administradores.',
      });
    }

    // Validar email
    if (!body.email || !RE.email.test(body.email.trim().toLowerCase())) {
      return res.status(422).json({
        message: 'Dados inválidos.',
        fieldErrors: { email: 'O e-mail informado é inválido.' },
      });
    }

    // Validar senha
    if (!body.password || !RE.password.test(body.password)) {
      return res.status(422).json({
        message: 'Dados inválidos.',
        fieldErrors: { password: 'A senha deve ter no mínimo 8 caracteres, maiúscula, minúscula, número e símbolo.' },
      });
    }

    // Verificar unicidade do email
    const existing = await Usuario.unscoped().findOne({
      where: { email: body.email.trim().toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({
        message: 'E-mail já registado.',
        fieldErrors: { email: 'Este e-mail já está registado.' },
      });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Gerar dados mínimos obrigatórios para o modelo
    const emailLocal = body.email.trim().toLowerCase().split('@')[0];
    const nomeGerado = emailLocal.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Administrador';

    const newAdmin = await Usuario.create({
      nome:       nomeGerado,
      email:      body.email.trim().toLowerCase(),
      telefone:   `9${Math.floor(10000000 + Math.random() * 89999999)}`, // placeholder único
      nascimento: '1990-01-01',
      sexo:       'Masculino',
      escola:     null,
      biografia:  '',
      password:   hashedPassword,
      role:       'admin',
      disciplina_colaborador: null,
    });

    const { password: _, ...adminSafe } = newAdmin.get({ plain: true });
    res.status(201).json({ message: 'Administrador criado com sucesso.', data: adminSafe });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fieldErrors = {};
      error.errors.forEach(e => { fieldErrors[e.path] = 'Este valor já está em uso.'; });
      return res.status(409).json({ message: 'Dados duplicados.', fieldErrors });
    }
    console.error('Erro ao criar administrador:', error);
    res.status(500).json({ message: 'Erro ao criar administrador.', error: error.message });
  }
};

// ── PUT /api/admin/users/:id 
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const requestingUser = req.user;
    const isMasterAdmin = String(requestingUser?.id) === '1';

    // Cannot edit yourself via admin panel (use profile page)
    if (String(requestingUser?.id) === String(id) && body.role !== undefined) {
      return res.status(403).json({
        message: 'Não é possível alterar o próprio perfil administrativo.',
      });
    }

    // Only super-admin (id=1) can change roles
    if ((body.role !== undefined || body.disciplina_colaborador !== undefined) && !isMasterAdmin) {
      return res.status(403).json({
        message: 'Apenas o Administrador Supremo pode alterar privilégios administrativos.',
        fieldErrors: { role: 'Sem permissão para alterar privilégios.' },
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
    if (body.username  !== undefined) updateData.username  = body.username?.trim() || null;
    if (body.nivel_academico !== undefined) updateData.nivel_academico = body.nivel_academico || null;
    
    // Role changes only by master admin
    if (isMasterAdmin && body.role !== undefined) {
      const nextRole = body.role;
      updateData.role = nextRole;
      updateData.disciplina_colaborador = nextRole === 'colaborador' ? (body.disciplina_colaborador || user.disciplina_colaborador) : null;
    } else if (isMasterAdmin && body.disciplina_colaborador !== undefined) {
      updateData.disciplina_colaborador = (user.role === 'colaborador') ? body.disciplina_colaborador : null;
    }

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

// ── DELETE /api/admin/users/:id 
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Cannot delete yourself
    if (String(requestingUser?.id) === String(id)) {
      return res.status(403).json({ message: 'Não é possível excluir a própria conta.' });
    }

    // Admin master (id=1) é intocável
    if (String(id) === '1') {
      return res.status(403).json({ message: 'O Administrador Master não pode ser eliminado.' });
    }

    const user = await Usuario.unscoped().findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // Only super-admin (id=1) can delete other admins
    const isMasterAdmin = String(requestingUser?.id) === '1';
    if (user.role === 'admin' && !isMasterAdmin) {
      return res.status(403).json({ message: 'Apenas o Administrador Supremo pode excluir outros administradores.' });
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro ao deletar usuário.', error: error.message });
  }
};

// ── PATCH /api/admin/users/:id/toggle-admin 
const toggleAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;
    const isMasterAdmin = String(requestingUser?.id) === '1';

    // Only super-admin (id=1) can promote/demote
    if (!isMasterAdmin) {
      return res.status(403).json({ message: 'Apenas o Administrador Supremo pode alterar privilégios administrativos.' });
    }

    // Cannot change own admin status
    if (String(requestingUser?.id) === String(id)) {
      return res.status(403).json({ message: 'Não é possível alterar os próprios privilégios.' });
    }

    const user = await Usuario.unscoped().findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const nextRole = user.role === 'admin' ? 'estudante' : 'admin';
    await user.update({ role: nextRole, disciplina_colaborador: null });

    const { password: _, ...userSafe } = user.get({ plain: true });
    res.status(200).json({
      message: `Privilégios ${userSafe.role === 'admin' ? 'concedidos' : 'removidos'} com sucesso.`,
      data: userSafe,
    });
  } catch (error) {
    console.error('Erro ao alterar privilégios:', error);
    res.status(500).json({ message: 'Erro ao alterar privilégios.', error: error.message });
  }
};

// ── PATCH /api/admin/users/:id/reset-password 
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

// ── GET /api/admin/colaboradores-pendentes 
const getColaboradoresPendentes = async (req, res) => {
  try {
    const colaboradoresPendentes = await Usuario.unscoped().findAll({
      where: {
        role: 'colaborador',
        status_colaborador: 'pendente'
      },
      // ✅ CRITICAL FIX: Incluir explicitamente disciplina_colaborador
      attributes: { 
        exclude: ['password'],
        include: ['disciplina_colaborador', 'nivel_academico', 'biografia', 'documentos_colaborador']
      },
      order: [['createdAt', 'ASC']],
    });
    
    console.log('[SUCCESS] [getColaboradoresPendentes] Colaboradores pendentes retornados:', colaboradoresPendentes.length);
    
    res.status(200).json({
      message: 'Colaboradores pendentes obtidos com sucesso',
      data: colaboradoresPendentes,
      total: colaboradoresPendentes.length
    });
  } catch (error) {
    console.error('Erro ao obter colaboradores pendentes:', error);
    res.status(500).json({ message: 'Erro ao obter colaboradores pendentes.', error: error.message });
  }
};

// ── PATCH /api/admin/users/:id/aprovar-colaborador 
const aprovarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { disciplina_colaborador, motivo } = req.body;
    const requestingUser = req.user;

    console.log('\n🔍 [aprovarColaborador] Iniciado:');
    console.log('   ID do colaborador:', id);
    console.log('   Disciplina recebida:', JSON.stringify(disciplina_colaborador));
    console.log('   Tipo da disciplina:', typeof disciplina_colaborador);
    console.log('   Req.body completo:', JSON.stringify(req.body));

    // Validar que disciplina foi fornecida
    if (!disciplina_colaborador || typeof disciplina_colaborador !== 'string' || disciplina_colaborador.trim() === '') {
      console.log('   [ERROR] Validação falhou: Disciplina vazia ou inválida');
      return res.status(422).json({
        message: 'Disciplina é obrigatória.',
        fieldErrors: { disciplina_colaborador: 'A disciplina deve ser informada.' }
      });
    }

    console.log('   [SUCCESS] Validação disciplina passou');

    const user = await Usuario.unscoped().findByPk(id);
    if (!user) {
      console.log('   [ERROR] Usuário não encontrado:', id);
      return res.status(404).json({ message: 'Colaborador não encontrado.' });
    }

    if (user.role !== 'colaborador') {
      console.log('   [ERROR] Usuário não é colaborador:', user.role);
      return res.status(400).json({ message: 'O usuário não é um colaborador.' });
    }

    if (user.status_colaborador !== 'pendente') {
      console.log('   [ERROR] Status não é pendente:', user.status_colaborador);
      return res.status(400).json({ message: 'Este colaborador já foi processado.' });
    }

    console.log('   [SUCCESS] Todas as validações passaram');

    // Aprovar colaborador
    await user.update({
      status_colaborador: 'aprovado',
      disciplina_colaborador: disciplina_colaborador.toLowerCase().trim(),
      updatedAt: new Date()
    });

    console.log(`   [SUCCESS] Colaborador ${user.email} aprovado com disciplina: ${disciplina_colaborador}\n`);

    // Notificar via socket
    if (req.io) {
      // 1. Notificar admin (para atualizar painel)
      req.io.emit('colaborador_aprovado', {
        id: user.id,
        email: user.email,
        nome: user.nome,
        disciplina_colaborador,
        aprovado_por: requestingUser?.id,
        data_aprovacao: new Date()
      });

      // 2. Notificar o colaborador específico (NOVO)
      req.io.emit(`colaborador_status_${user.id}`, {
        status: 'aprovado',
        id: user.id,
        email: user.email,
        nome: user.nome,
        disciplina_colaborador,
        data_aprovacao: new Date()
      });
    }

    const { password: _, ...userSafe } = user.get({ plain: true });
    
    res.status(200).json({
      message: 'Colaborador aprovado com sucesso',
      data: userSafe
    });
  } catch (error) {
    console.error('[ERROR] [aprovarColaborador] Erro:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ message: 'Erro ao aprovar colaborador.', error: error.message });
  }
};

// ── PATCH /api/admin/users/:id/rejeitar-colaborador 
const rejeitarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const requestingUser = req.user;

    const user = await Usuario.unscoped().findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Colaborador não encontrado.' });
    }

    if (user.role !== 'colaborador') {
      return res.status(400).json({ message: 'O usuário não é um colaborador.' });
    }

    if (user.status_colaborador !== 'pendente') {
      return res.status(400).json({ message: 'Este colaborador já foi processado.' });
    }

    // Rejeitar colaborador
    await user.update({
      status_colaborador: 'rejeitado',
      disciplina_colaborador: null,
      updatedAt: new Date()
    });

    console.log(`[ERROR] Colaborador ${user.email} rejeitado por admin ${requestingUser?.id}`);

    // Notificar via socket
    if (req.io) {
      // 1. Notificar admin (para atualizar painel)
      req.io.emit('colaborador_rejeitado', {
        id: user.id,
        email: user.email,
        nome: user.nome,
        motivo,
        rejeitado_por: requestingUser?.id,
        data_rejeicao: new Date()
      });

      // 2. Notificar o colaborador específico (NOVO)
      req.io.emit(`colaborador_status_${user.id}`, {
        status: 'rejeitado',
        id: user.id,
        email: user.email,
        nome: user.nome,
        motivo,
        data_rejeicao: new Date()
      });
    }

    const { password: _, ...userSafe } = user.get({ plain: true });
    
    res.status(200).json({
      message: 'Colaborador rejeitado com sucesso',
      data: userSafe
    });
  } catch (error) {
    console.error('Erro ao rejeitar colaborador:', error);
    res.status(500).json({ message: 'Erro ao rejeitar colaborador.', error: error.message });
  }
};

// ── GET /api/admin/colaboradores 
const getColaboradores = async (req, res) => {
  try {
    const colaboradores = await Usuario.unscoped().findAll({
      where: {
        role: 'colaborador'
      },
      // ✅ CRITICAL FIX: Incluir explicitamente disciplina_colaborador
      attributes: { 
        exclude: ['password'],
        include: ['disciplina_colaborador', 'nivel_academico', 'biografia', 'documentos_colaborador']
      },
      order: [['createdAt', 'DESC']],
    });
    
    console.log('[SUCCESS] [getColaboradores] Colaboradores retornados:');
    console.log('   Total:', colaboradores.length);
    if (colaboradores.length > 0) {
      console.log('   Primeiro:', {
        id: colaboradores[0].id,
        nome: colaboradores[0].nome,
        status_colaborador: colaboradores[0].status_colaborador,
        disciplina_colaborador: colaboradores[0].disciplina_colaborador,
        nivel_academico: colaboradores[0].nivel_academico
      });
      
      // DEBUG: Mostrar todos os status unicos
      const statuses = [...new Set(colaboradores.map(c => c.status_colaborador))];
      console.log('   Status únicos encontrados:', statuses);
    }
    
    // Estatísticas
    const total = colaboradores.length;
    const aprovados = colaboradores.filter(c => c.status_colaborador === 'aprovado').length;
    const pendentes = colaboradores.filter(c => c.status_colaborador === 'pendente').length;
    const rejeitados = colaboradores.filter(c => c.status_colaborador === 'rejeitado').length;
    const suspensos = colaboradores.filter(c => c.status_colaborador === 'suspenso').length;
    
    console.log('   Estatísticas:', { total, aprovados, pendentes, rejeitados, suspensos });
    
    res.status(200).json({
      message: 'Colaboradores obtidos com sucesso',
      data: colaboradores,
      estatisticas: { total, aprovados, pendentes, rejeitados, suspensos }
    });
  } catch (error) {
    console.error('Erro ao obter colaboradores:', error);
    res.status(500).json({ message: 'Erro ao obter colaboradores.', error: error.message });
  }
};

// ── PUT /api/usuarios/:id/atribuir-disciplina 
// Assign a user as colaborador to a specific disciplina
// Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
const assignColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { disciplina } = req.body;
    const requestingUser = req.user;

    // Verify user is admin
    if (!requestingUser?.isAdmin) {
      return res.status(403).json({ 
        message: 'Apenas administradores podem atribuir disciplinas.' 
      });
    }

    // Validate disciplina is provided
    if (isEmpty(disciplina)) {
      return res.status(400).json({ 
        message: 'Disciplina é obrigatória.' 
      });
    }

    // Validate disciplina is valid (from User model ENUM)
    const validDisciplinas = ['matematica', 'ingles', 'programacao'];
    if (!validDisciplinas.includes(disciplina.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Disciplina inválida. Valores válidos: matematica, ingles, programacao' 
      });
    }

    // Find user
    const user = await Usuario.unscoped().findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado.' 
      });
    }

    // Validate user is not admin
    if (user.isAdmin === true) {
      return res.status(403).json({ 
        message: 'Não é possível atribuir disciplina a admin.' 
      });
    }

    // Validate disciplina exists in database
    const disciplinaExists = await Disciplina.findOne({
      where: { slug: disciplina.toLowerCase() }
    });
    
    if (!disciplinaExists) {
      return res.status(404).json({ 
        message: 'Disciplina não encontrada na base de dados.' 
      });
    }

    // Update user role and disciplina
    await user.update({
      role: 'colaborador',
      disciplina_colaborador: disciplina.toLowerCase()
    });

    // Return updated user (without password)
    const { password: _, ...userSafe } = user.get({ plain: true });
    res.status(200).json({
      message: 'Usuário atribuído como colaborador com sucesso.',
      data: userSafe
    });
  } catch (error) {
    console.error('Erro ao atribuir disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao atribuir disciplina.', 
      error: error.message 
    });
  }
};

export default { 
  getAllUsers, 
  createUser, 
  createAdminUser, 
  updateUser, 
  deleteUser, 
  toggleAdmin, 
  resetPassword,
  getColaboradoresPendentes,
  aprovarColaborador,
  rejeitarColaborador,
  getColaboradores,
  assignColaborador
};
