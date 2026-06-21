/**
 * colaboradorRegistroController.js
 *
 * Endpoints públicos para registo de colaboradores/professores.
 * Separado do AuthContainer de estudantes para manter arquitetura limpa.
 */

import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import Usuario from '../models/User.js';
import { formatarDocumentos } from '../middlewares/security/colaboradorUpload.js';
import { emitNovoColaboradorPendente } from '../services/socketService.js';

const RE_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/;
const RE_EMAIL    = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const RE_USERNAME = /^[a-zA-Z0-9_-]{3,30}$/;

const NIVEIS_VALIDOS = [
  'estudante_universitario', 'tecnico', 'licenciado', 'mestre',
  'doutor', 'professor', 'profissional', 'outro',
];

const DISCIPLINAS_VALIDAS = ['matematica', 'ingles', 'programacao'];

function isEmpty(v) {
  return v === undefined || v === null || String(v).trim() === '';
}

function validarPayload(body) {
  const errors = {};

  if (isEmpty(body.nome))         errors.nome = 'O nome completo é obrigatório.';
  else if (body.nome.trim().length < 2) errors.nome = 'O nome deve ter pelo menos 2 caracteres.';
  else if (/\d/.test(body.nome))  errors.nome = 'O nome não pode conter números.';
  else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'\s]+$/.test(body.nome.trim())) errors.nome = 'O nome deve conter apenas letras e espaços.';

  if (isEmpty(body.username)) errors.username = 'O username público é obrigatório.';
  else if (!RE_USERNAME.test(body.username.trim())) errors.username = 'O username pode conter apenas letras, números, _ e - (3-30 caracteres).';

  if (isEmpty(body.email))        errors.email = 'O e-mail é obrigatório.';
  else if (!RE_EMAIL.test(body.email.trim().toLowerCase())) errors.email = 'O e-mail informado é inválido.';
  else if (/@(gmai|gmal|gmial|hotmal|hotmial|outlok|yaho|yhoo)\.com$/i.test(body.email))
    errors.email = 'Verifique o domínio do e-mail.';

  if (isEmpty(body.password))     errors.password = 'A palavra-passe é obrigatória.';
  else if (!RE_PASSWORD.test(body.password)) errors.password = 'A senha deve ter no mínimo 8 caracteres, maiúscula, minúscula, número e símbolo.';

  if (!isEmpty(body.password) && !isEmpty(body.confirmPassword) && body.password !== body.confirmPassword)
    errors.confirmPassword = 'As palavras-passe não coincidem.';
  else if (isEmpty(body.confirmPassword)) errors.confirmPassword = 'A confirmação da palavra-passe é obrigatória.';

  if (isEmpty(body.area_especialidade))      errors.area_especialidade = 'A área de especialidade é obrigatória.';
  else if (!DISCIPLINAS_VALIDAS.includes(body.area_especialidade)) errors.area_especialidade = 'Área de especialidade inválida.';

  if (isEmpty(body.nivel_academico))         errors.nivel_academico = 'O nível académico é obrigatório.';
  else if (!NIVEIS_VALIDOS.includes(body.nivel_academico)) errors.nivel_academico = 'Nível académico inválido.';

  if (isEmpty(body.sexo))         errors.sexo = 'O género é obrigatório.';
  else if (!['Masculino', 'Feminino', 'Outro'].includes(body.sexo)) errors.sexo = 'Género inválido.';

  if (isEmpty(body.nascimento))   errors.nascimento = 'A data de nascimento é obrigatória.';
  else {
    const nascData = new Date(body.nascimento);
    if (isNaN(nascData.getTime())) errors.nascimento = 'Data inválida.';
    else {
      const now = new Date();
      if (nascData > now) errors.nascimento = 'A data não pode estar no futuro.';
      const age = (now - nascData) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 5) errors.nascimento = 'Deve ter no mínimo 5 anos.';
      if (age > 120) errors.nascimento = 'Data de nascimento inválida.';
    }
  }

  if (!isEmpty(body.biografia)) {
    const bio = body.biografia.trim();
    if (bio.length < 30) errors.biografia = 'A biografia deve ter pelo menos 30 caracteres.';
    if (bio.length > 500) errors.biografia = 'A biografia não pode ter mais de 500 caracteres.';
  }

  return errors;
}

// ── POST /auth/registro-colaborador 
export const registrarColaborador = async (req, res) => {
  try {
    const body = req.body;
    const files = req.files || [];

    // DEBUG: Log EXACTO do que está chegando
    console.log('\n🚨 ');
    console.log('📥 REGISTO COLABORADOR - DUMP COMPLETO DO req.body:');
    console.log('🔍 Todas as chaves:', Object.keys(body));
    console.log('🔍 area_especialidade recebida:', body.area_especialidade, `(tipo: ${typeof body.area_especialidade})`);
    console.log('🔍 Conteúdo completo:', JSON.stringify(body, null, 2));
    console.log('\n');

    const errors = validarPayload(body);
    
    // DEBUG: Mostrar erros de validação
    if (Object.keys(errors).length > 0) {
      console.log('❌ VALIDAÇÃO FALHOU:');
      console.log('   Erros:', JSON.stringify(errors, null, 2));
      console.log('   Especificamente, area_especialidade:', errors.area_especialidade || 'OK');
      return res.status(422).json({ success: false, error: 'Verifique os campos do formulário.', fieldErrors: errors });
    }
    
    console.log('✅ Validação passou!');

    const email    = body.email.trim().toLowerCase();
    const username = body.username.trim();
    const nome     = body.nome.trim();

    // Unicidade de email, telefone (se fornecido) e username
    const orConditions = [{ email }, { username }];
    if (!isEmpty(body.telefone)) orConditions.push({ telefone: body.telefone.trim() });

    const exists = await Usuario.unscoped().findOne({ where: { [Op.or]: orConditions } });
    if (exists) {
      const dupes = {};
      if (exists.email === email)         dupes.email = 'Este e-mail já está registado.';
      if (exists.username === username)   dupes.username = 'Este username já está em uso.';
      if (!isEmpty(body.telefone) && exists.telefone === body.telefone.trim()) dupes.telefone = 'Este telefone já está registado.';
      return res.status(409).json({ success: false, error: 'Dados já existentes.', fieldErrors: dupes });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const documentos = files.length > 0 ? formatarDocumentos(files, baseUrl) : null;

    const novoColaborador = await Usuario.create({
      nome,
      username,
      email,
      telefone:              isEmpty(body.telefone) ? `9${Date.now().toString().slice(-8)}` : body.telefone.trim(),
      nascimento:            body.nascimento || '1990-01-01',
      sexo:                  body.sexo || 'Masculino',
      escola:                body.escola?.trim() || null,
      biografia:             body.biografia?.trim() || '',
      password:              hashedPassword,
      imagem:                null,
      isAdmin:               false,
      role:                  'colaborador',
      disciplina_colaborador: body.area_especialidade,  // Salvar área do formulário no campo correto da DB
      nivel_academico:       body.nivel_academico,
      documentos_colaborador: documentos,
      status_colaborador:    'pendente',
    });

    // DEBUG: Log o que foi salvo
    console.log('✅ REGISTO COLABORADOR - Dados salvos:');
    console.log('   id:', novoColaborador.id);
    console.log('   email:', novoColaborador.email);
    console.log('   disciplina_colaborador:', novoColaborador.disciplina_colaborador);

    // Notificar admin via socket (se disponível)
    const io = req.app.get('io');
    if (io) {
      io.emit('novo_colaborador_pendente', {
        id:        novoColaborador.id,
        nome:      novoColaborador.nome,
        email:     novoColaborador.email,
        username:  novoColaborador.username,
        createdAt: novoColaborador.createdAt,
      });
    }

    const { password: _, ...userSafe } = novoColaborador.get({ plain: true });

    console.log(`✅ Colaborador registado (pendente): ${email}`);

    return res.status(201).json({
      success: true,
      requiresApproval: true,
      message: 'Registo enviado com sucesso. A sua candidatura será analisada pelo administrador. Receberá uma notificação após a decisão.',
      data: userSafe,
    });

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const fieldErrors = {};
      error.errors.forEach(e => { fieldErrors[e.path] = e.message; });
      return res.status(422).json({ success: false, error: 'Erro de validação.', fieldErrors });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fieldErrors = {};
      error.errors.forEach(e => { fieldErrors[e.path] = 'Este valor já está em uso.'; });
      return res.status(409).json({ success: false, error: 'Dados duplicados.', fieldErrors });
    }
    console.error('Erro ao registar colaborador:', error);
    return res.status(500).json({ success: false, error: 'Erro interno no servidor.' });
  }
};

// ── PATCH /api/admin/colaboradores/:id/suspender 
export const suspenderColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    const user = await Usuario.unscoped().findByPk(id);
    if (!user) return res.status(404).json({ message: 'Colaborador não encontrado.' });
    if (user.role !== 'colaborador') return res.status(400).json({ message: 'O utilizador não é um colaborador.' });

    await user.update({ status_colaborador: 'suspenso' });
    
    console.log(`🚫 Colaborador ${user.email} suspenso por admin ${requestingUser?.id}`);

    // Notificar via socket
    if (req.io) {
      req.io.emit('colaborador_suspenso', {
        id: user.id,
        email: user.email,
        nome: user.nome,
        suspenso_por: requestingUser?.id,
        data_suspensao: new Date()
      });

      req.io.emit(`colaborador_status_${user.id}`, {
        status: 'suspenso',
        id: user.id,
        email: user.email,
        nome: user.nome,
        data_suspensao: new Date()
      });
    }

    const { password: _, ...safe } = user.get({ plain: true });
    res.json({ success: true, message: 'Colaborador suspenso com sucesso.', data: safe });
  } catch (e) {
    console.error('❌ Erro ao suspender colaborador:', e.message);
    res.status(500).json({ message: 'Erro ao suspender colaborador.' });
  }
};

// ── GET /api/admin/colaboradores/:id/documentos 
export const getDocumentosColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Usuario.unscoped().findByPk(id, {
      attributes: ['id', 'nome', 'email', 'documentos_colaborador'],
    });
    if (!user) return res.status(404).json({ message: 'Colaborador não encontrado.' });
    res.json({ success: true, data: user.documentos_colaborador || [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erro ao obter documentos.' });
  }
};
