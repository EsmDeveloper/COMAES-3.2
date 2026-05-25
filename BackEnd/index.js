import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sequelize, { testConnection } from "./config/db.js";
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import http from 'http';

// ===== IMPORTAR TODOS OS MODELS =====
import Usuario from "./models/User.js";
import Funcao from "./models/Funcao.js";
import RedefinicaoSenha from "./models/RedefinicaoSenha.js";
import ConfiguracaoUsuario from "./models/ConfiguracaoUsuario.js";
import Torneio from "./models/Torneio.js";
import ParticipanteTorneio from "./models/ParticipanteTorneio.js";
import Noticia from "./models/Noticia.js";
import Questao from "./models/Questao.js";
import TentativaTeste from "./models/TentativaTeste.js";
import TentativaResposta from "./models/TentativaResposta.js";
import TicketSuporte from "./models/TicketSuporte.js";
import Notificacao from "./models/Notificacao.js";
import Conquista from "./models/Conquista.js";
import ConquistaUsuario from "./models/ConquistaUsuario.js";
import Certificate from "./models/Certificate.js";
import Certificado from "./models/Certificado.js";

// ===== CONFIGURAR ASSOCIA��ES ANTES DE IMPORTAR ROTAS =====
// CR�TICO: Este import deve vir ANTES das rotas para garantir que
// as associa��es estejam dispon�veis quando os controllers forem carregados
import './models/associations.js';

// ===== IMPORTAR SERVIÇOS E ROTAS =====
import iaEvaluators from './services/iaEvaluators.js';
import adminPanelRoutes from './routes/adminPanelRoutes.js';
import certificatesRoutes from './routes/certificatesRoutes.js';
import tournamentsRoutes from './routes/tournamentsRoutes.js';
import notificacoesRoutes from './routes/notificacoesRoutes.js';
import questoesRoutesRefactored from './routes/questoesRoutesRefactored.js';
import tentativasRoutes from './routes/tentativasRoutes.js';
import testeConhecimentoRoutes from './routes/testeConhecimentoRoutes.js';
import { sendResetEmail, sendWelcomeEmail } from './services/emailService.js';
import { setIO } from './services/socketService.js';
import auth from './middlewares/auth.js';
import isAdmin from './middlewares/isAdmin.js';
import { baseSanitizer } from './middlewares/security/sanitizer.js';
import validate, { rules } from './middlewares/validate.js';
import { startTorneioCron } from './services/torneioCron.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
let io = null; // inicializado no startServer

// ===== MIDDLEWARES CORRIGIDOS =====
// Force UTF-8 encoding for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Global sanitizer - strips NoSQL injection keys and normalizes strings
app.use(baseSanitizer);

// Configuracao CORS completa para permitir requisicoes do frontend
app.use(cors({
  origin: true, // Permitir todas as origens na rede local
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// ===== UPLOAD & STORAGE ESM =====
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Helper para normalizar nome da disciplina (URL/Parâmetro -> Banco de Dados)
const normalizeDisciplina = (name) => {
  if (!name) return '';
  const normalized = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (normalized === 'matematica') return 'Matem\u00e1tica';
  if (normalized === 'programacao') return 'Programa\u00e7\u00e3o';
  if (normalized === 'ingles' || normalized === 'lingua inglesa') return 'Ingl\u00eas';
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const NAME_REGEX = /^[\p{L} ]+$/u;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const ANGOLA_PHONE_LOCAL_REGEX = /^9[1-9]\d{7}$/;

const validateRegistrationPayload = ({ nome, telefone, email, nascimento, sexo, password }) => {
  const fieldErrors = {};

  if (!nome || !nome.trim()) {
    fieldErrors.nome = 'O nome é obrigatório.';
  } else {
    const trimmedName = nome.trim();
    if (trimmedName.length < 2) {
      fieldErrors.nome = 'O nome deve ter pelo menos 2 caracteres.';
    } else if (!NAME_REGEX.test(trimmedName)) {
      fieldErrors.nome = 'O nome deve conter apenas letras e espaços.';
    }
  }

  if (!telefone || !telefone.trim()) {
    fieldErrors.telefone = 'O telefone é obrigatório.';
  } else if (!ANGOLA_PHONE_LOCAL_REGEX.test(telefone.trim())) {
    fieldErrors.telefone = 'O telefone deve ter 9 dígitos válidos e começar com 9.';
  }

  if (!email || !email.trim()) {
    fieldErrors.email = 'O email é obrigatório.';
  } else {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail) || /@{2,}|^@|@$/.test(normalizedEmail)) {
      fieldErrors.email = 'Digite um email válido.';
    }
  }

  if (!nascimento) {
    fieldErrors.nascimento = 'A data de nascimento é obrigatória.';
  } else {
    const birthDate = new Date(nascimento);
    const today = new Date();
    if (Number.isNaN(birthDate.getTime())) {
      fieldErrors.nascimento = 'Data de nascimento inválida.';
    } else if (birthDate > today) {
      fieldErrors.nascimento = 'A data de nascimento não pode estar no futuro.';
    }
  }

  if (!sexo) {
    fieldErrors.sexo = 'O sexo é obrigatório.';
  }

  if (!password) {
    fieldErrors.senha = 'A senha é obrigatória.';
  } else if (!STRONG_PASSWORD_REGEX.test(password)) {
    fieldErrors.senha = 'A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.';
  }

  return fieldErrors;
};


const buildSlug = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 120);

const createNotificationForUser = async ({ usuarioId, tipo = 'geral', titulo, mensagem, extras = {} }) => {
  if (!usuarioId) return null;

  return Notificacao.create({
    usuario_id: usuarioId,
    tipo,
    conteudo: {
      titulo,
      mensagem,
      ...extras
    },
    lido: false
  });
};

const createNotificationForAllUsers = async ({ tipo = 'geral', titulo, mensagem, extras = {} }) => {
  const users = await Usuario.findAll({ attributes: ['id'] });
  if (!users.length) return 0;

  const payload = users.map((user) => ({
    usuario_id: user.id,
    tipo,
    conteudo: { titulo, mensagem, ...extras },
    lido: false
  }));

  await Notificacao.bulkCreate(payload);
  return payload.length;
};

// ?? FUN��O LEGADA REMOVIDA EM FASE 3 (2026-05-22):
// ensureQuizQuestions() - usava modelo Pergunta descontinuado
// Substitu�da por: QuestoesController.carregarQuiz() que usa Questao.js


// ===== ASSOCIA��ES DO SEQUELIZE =====
// ===== ASSOCIA��ES DO SEQUELIZE =====
// MOVIDAS PARA: models/associations.js
// As associa��es s�o configuradas automaticamente quando o arquivo � importado
// no topo deste arquivo, ANTES das rotas serem carregadas.


// ===== ROTAS PÚBLICAS =====
app.get("/", async (req, res) => {
  res.json({
    message: "API Comaes funcionando!",
    status: "online",
    version: "2.0",
    timestamp: new Date().toISOString(),
    totalUsers: await Usuario.count().catch(() => 0)
  });
});

// Registrar rotas administrativas do painel (CRUD genérico + rotas específicas)
app.use('/api/admin', adminPanelRoutes);

// Registrar rotas de certificados
app.use('/api/certificates', certificatesRoutes);

// Registrar rotas de torneios e ranking
app.use('/api/tournaments', tournamentsRoutes);

// Registrar rotas de questões (especializado - REFATORADO para Questao.js)
app.use('/api/questoes', questoesRoutesRefactored);

// Registrar rotas de tentativas (persistência de respostas)
app.use('/api/tentativas', tentativasRoutes);

// Registrar rotas do Teste de Conhecimento (sistema independente)
app.use('/api/teste-conhecimento', testeConhecimentoRoutes);

// Registrar rotas de notificações
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/usuarios/:usuarioId/notificacoes', notificacoesRoutes);

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message
    });
  }
});

// Endpoint para testar email (apenas para debug)
app.get("/api/test-email", async (req, res) => {
  try {
    console.log('🧪 Testando configuração de email...');
    
    // Verificar variáveis de ambiente
    const config = {
      EMAIL_HOST: process.env.EMAIL_HOST || 'não configurado',
      EMAIL_PORT: process.env.EMAIL_PORT || 'não configurado',
      EMAIL_USER: process.env.EMAIL_USER ? '***' : 'não configurado',
      EMAIL_PASS: process.env.EMAIL_PASS ? '***' : 'não configurado',
      FRONTEND_URL: process.env.FRONTEND_URL || 'não configurado'
    };

    console.log('📋 Configuração de email:', config);

    // Tentar enviar email de teste
    try {
      const { sendResetEmail } = await import('./services/emailService.js');
      const testToken = 'test-token-12345';
      await sendResetEmail(process.env.EMAIL_USER, testToken);
      
      res.json({
        success: true,
        message: 'Email de teste enviado com sucesso',
        config
      });
    } catch (sendError) {
      console.error('❌ Erro ao enviar email de teste:', sendError);
      
      res.json({
        success: false,
        message: 'Erro ao enviar email de teste',
        error: sendError.message,
        code: sendError.code,
        config
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== AUTENTICAÇÃO CORRIGIDA =====

// LOGIN
app.post('/auth/login', validate(rules.login), async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    console.log('Login attempt:', { usuario, senha: '***' });

    if (!usuario || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Usuario e senha sao obrigatorios.'
      });
    }

    // Buscar usuario por email OU telefone
    let user;
    try {
      user = await Usuario.unscoped().findOne({
        where: {
          [Op.or]: [
            { email: usuario.toLowerCase() },
            { telefone: usuario }
          ]
        }
      });
    } catch (dbError) {
      console.error('Erro de banco de dados no login:', dbError.message);
      return res.status(503).json({
        success: false,
        error: 'Servico temporariamente indisponivel. Tente novamente.'
      });
    }

    if (!user) {
      console.log('Usuario nao encontrado:', usuario);
      return res.status(401).json({
        success: false,
        error: 'Usuario ou senha invalidos.'
      });
    }

    const match = await bcrypt.compare(senha, user.password);
    if (!match) {
      console.log('Senha invalida para usuario:', usuario);
      return res.status(401).json({
        success: false,
        error: 'Usuario ou senha invalidos.'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Remover senha do objeto de retorno
    const { password, ...userSafe } = user.get({ plain: true });

    console.log('Login bem-sucedido para:', user.email);

    // Emitir estatisticas de login e atualizar total
    if (io) {
      try {
        const totalUsuarios = await Usuario.count();
        io.emit('stats_update', { totalUsuarios });
        io.emit('login_update', { userId: user.id, username: user.nome });
      } catch (socketError) {
        console.warn('Erro ao emitir evento socket (nao afeta login):', socketError.message);
      }
    }

    // Enviar e-mail de boas-vindas de forma assincrona (nao bloqueia o login)
    setImmediate(async () => {
      try {
        await sendWelcomeEmail(user.email, user.nome);
        console.log('Email de boas-vindas enviado para:', user.email);
      } catch (emailError) {
        console.warn('Erro ao enviar email de boas-vindas (nao afeta login):', emailError.message);
      }
    });

    res.json({
      success: true,
      data: userSafe,
      token
    });
  } catch (error) {
    console.error('Erro inesperado no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor.'
    });
  }
});

// REGISTRO
app.post('/auth/registro', validate(rules.register), async (req, res) => {
  try {
    const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
    const telefone = typeof req.body.telefone === 'string' ? req.body.telefone.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const nascimento = req.body.nascimento;
    const sexo = req.body.sexo;
    const escola = typeof req.body.escola === 'string' ? req.body.escola.trim() : '';
    const password = req.body.password;

    console.log('📝 Tentativa de registro:', { nome, email, telefone });

    const fieldErrors = validateRegistrationPayload({ nome, telefone, email, nascimento, sexo, password });
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(422).json({
        success: false,
        error: 'Verifique os campos do cadastro.',
        fieldErrors
      });
    }

    // Verificar se usuário já existe
    const exists = await Usuario.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { telefone: telefone }
        ]
      }
    });

    if (exists) {
      const duplicateFieldErrors = {};
      if (exists.email === email) duplicateFieldErrors.email = 'Este email j� est� registado.';
      if (exists.telefone === telefone) duplicateFieldErrors.telefone = 'Este telefone j� est� registado.';

      return res.status(409).json({
        success: false,
        error: 'Email ou telefone j� registado.',
        fieldErrors: duplicateFieldErrors
      });
    }

    // Criar usuário
    const hash_senha = await bcrypt.hash(password, 10);
    const novoUsuario = await Usuario.create({
      nome,
      telefone,
      email,
      nascimento,
      sexo,
      escola: escola || null,
      password: hash_senha,
      isAdmin: false,
      pontos_totais: 0,
      nivel: 1
    });

    // Gerar token automaticamente após registro
    const token = jwt.sign(
      {
        id: novoUsuario.id,
        email: novoUsuario.email,
        isAdmin: novoUsuario.isAdmin
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Remover senha do retorno
    const { password: _, ...userSafe } = novoUsuario.get({ plain: true });

    console.log('✅ Usuário criado com sucesso:', novoUsuario.email);

    // Emitir atualização de total de usuários
    if (io) {
      const totalUsuarios = await Usuario.count();
      io.emit('stats_update', { totalUsuarios });
    }

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: userSafe,
      token
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor.'
    });
  }
});

// ===== RECUPERAÇÃO DE SENHA =====

// Iniciar recupera��o de senha
app.post('/auth/recover', validate(rules.passwordRecover), async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔄 Solicitação de recuperação recebida para:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório.'
      });
    }

    // Procurar usuário
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(404).json({
        success: false,
        error: 'Conta não encontrada.'
      });
    }

    console.log('✅ Usuário encontrado:', user.email, '| ID:', user.id);

    // Gerar token de reset
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const hashedToken = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await RedefinicaoSenha.create({
      usuario_id: user.id,
      hash_token: hashedToken,
      expira_em: expiresAt
    });

    console.log('✅ Token de reset criado e salvo no banco');

    // Enviar email com token
    try {
      console.log('📧 Iniciando envio de email...');
      const result = await sendResetEmail(email, token);
      console.log('✅ Email de recuperação enviado para:', email, '| Result:', result);
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        stack: emailError.stack
      });
      
      // Retornar erro detalhado apenas em desenvolvimento
      const isDev = process.env.NODE_ENV !== 'production';
      return res.status(500).json({
        success: false,
        error: 'Erro ao enviar email de recuperação.',
        ...(isDev && { details: emailError.message })
      });
    }

    res.json({
      success: true,
      message: 'Enviámos um código de confirmação para o seu email.'
    });
  } catch (error) {
    console.error('❌ Erro na recuperação:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Erro ao processar recuperação. Tente novamente.'
    });
  }
});

// Verificar token de reset
app.get('/auth/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório.'
      });
    }

    // Procurar tokens válidos (não expirados, não usados)
    const resetTokens = await RedefinicaoSenha.findAll({
      where: {
        expira_em: { [Op.gt]: new Date() },
        usado_em: null
      }
    });

    // Verificar contra cada token
    let validToken = null;
    for (const rt of resetTokens) {
      const isMatch = await bcrypt.compare(token, rt.hash_token);
      if (isMatch) {
        validToken = rt;
        break;
      }
    }

    if (!validToken) {
      console.log('❌ Token inválido ou expirado:', token.substring(0, 10) + '...');
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado.'
      });
    }

    console.log('✅ Token válido para usuário ID:', validToken.usuario_id);
    res.json({
      success: true,
      message: 'Token válido'
    });
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar token.'
    });
  }
});

// Redefinir senha
app.post('/auth/reset-password', validate(rules.passwordReset), async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({
        success: false,
        error: 'Token e nova senha são obrigatórios.'
      });
    }

    // Procurar tokens válidos
    const resetTokens = await RedefinicaoSenha.findAll({
      where: {
        expira_em: { [Op.gt]: new Date() },
        usado_em: null
      }
    });

    // Verificar contra cada token
    let validToken = null;
    for (const rt of resetTokens) {
      const isMatch = await bcrypt.compare(token, rt.hash_token);
      if (isMatch) {
        validToken = rt;
        break;
      }
    }

    if (!validToken) {
      console.log('❌ Token inválido ou expirado para reset');
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado.'
      });
    }

    // Atualizar senha do usuário
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    await Usuario.update(
      { password: hashedPassword },
      { where: { id: validToken.usuario_id } }
    );

    // Marcar token como usado
    await validToken.update({ usado_em: new Date() });

    console.log('✅ Senha redefinida para usuário ID:', validToken.usuario_id);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso.'
    });
  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao redefinir senha.'
    });
  }
});

// ===== NOVOS ENDPOINTS PARA TORNEIO ÚNICO COM 3 DISCIPLINAS =====

// 1. Verificar torneio ativo
app.get('/api/torneios/ativo', async (req, res) => {
  try {
    const agora = new Date();

    console.log('🔍 Verificando torneio ativo...');
    console.log('📅 Data atual:', agora.toISOString());

    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      },
      order: [['inicia_em', 'DESC']]
    });

    console.log('🏆 Torneio encontrado:', torneio ?
      `ID: ${torneio.id}, Título: "${torneio.titulo}", Status: ${torneio.status}` :
      'Nenhum');

    if (!torneio) {
      return res.json({
        success: true,
        ativo: false,
        message: 'Nenhum torneio ativo encontrado'
      });
    }

    const inicio = new Date(torneio.inicia_em);
    const fim = new Date(torneio.termina_em);

    const dentroDoPeriodo = agora >= inicio && agora <= fim;

    res.json({
      success: true,
      ativo: true,
      dentroDoPeriodo,
      torneio,
      mensagem: dentroDoPeriodo ?
        'Torneio ativo e em andamento' :
        'Torneio marcado como ativo mas fora do período programado'
    });
  } catch (error) {
    console.error('❌ Erro ao verificar torneio ativo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Registrar participante
app.post('/api/participantes/registrar', async (req, res) => {
  try {
    const { id_usuario, disciplina_competida } = req.body;

    if (!id_usuario || !disciplina_competida) {
      return res.status(400).json({ success: false, error: 'id_usuario e disciplina_competida sao obrigatorios' });
    }

    const torneio = await Torneio.findOne({ where: { status: 'ativo' } });
    if (!torneio) {
      return res.status(404).json({ success: false, error: 'Nenhum torneio ativo encontrado' });
    }

    // Normalizar disciplina de forma robusta (suporta acentos e variantes)
    const disciplinaFormatada = normalizeDisciplina(disciplina_competida);

    // Helper: buscar participante com dados do usuario incluidos
    const buscarComUsuario = (where) => ParticipanteTorneio.findOne({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }]
    });

    // Verificar se ja existe
    let participante = await buscarComUsuario({
      usuario_id: id_usuario,
      torneio_id: torneio.id,
      disciplina_competida: disciplinaFormatada
    });

    if (participante) {
      // Ja registado � devolver com dados do usuario para o frontend poder mostrar no ranking
      return res.json({
        success: true,
        data: participante.toJSON(),
        message: 'Participante ja registado nesta disciplina'
      });
    }

    // Criar novo participante
    await ParticipanteTorneio.create({
      torneio_id: torneio.id,
      usuario_id: id_usuario,
      disciplina_competida: disciplinaFormatada,
      entrou_em: new Date(),
      status: 'confirmado',
      pontuacao: 0,
      casos_resolvidos: 0
    });

    // Recalcular ranking (atribui posicoes a todos, incluindo o novo com 0 pontos)
    await ParticipanteTorneio.calcularRanking(torneio.id, disciplinaFormatada);

    // Buscar o participante recem criado com dados do usuario
    participante = await buscarComUsuario({
      usuario_id: id_usuario,
      torneio_id: torneio.id,
      disciplina_competida: disciplinaFormatada
    });

    // Emitir ranking completo atualizado via socket
    if (io) {
      const rankingAtualizado = await ParticipanteTorneio.findAll({
        where: { torneio_id: torneio.id, disciplina_competida: disciplinaFormatada, status: 'confirmado' },
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }],
        order: [['pontuacao', 'DESC'], ['entrou_em', 'ASC']]
      });
      io.emit('ranking_update', {
        torneio_id: torneio.id,
        disciplina: disciplinaFormatada,
        ranking: rankingAtualizado.map(p => p.toJSON())
      });

      // Atualizar contagens de participantes
      const counts = await ParticipanteTorneio.findAll({
        where: { torneio_id: torneio.id, status: 'confirmado' },
        attributes: ['disciplina_competida', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
        group: ['disciplina_competida']
      });
      const stats = { 'Matematica': 0, 'Ingles': 0, 'Programacao': 0 };
      counts.forEach(c => {
        const d = c.getDataValue('disciplina_competida');
        const n = parseInt(c.getDataValue('total')) || 0;
        if (d) stats[d] = n;
      });
      io.emit('tournament_stats_update', { stats, totalParticipants: Object.values(stats).reduce((a, b) => a + b, 0) });
    }

    res.status(201).json({
      success: true,
      data: participante ? participante.toJSON() : { usuario_id: id_usuario, torneio_id: torneio.id, disciplina_competida: disciplinaFormatada, pontuacao: 0, status: 'confirmado' },
      message: 'Participante registado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registar participante:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Buscar ranking por disciplina
app.get('/api/participantes/ranking/:disciplina', async (req, res) => {
  try {
    const { disciplina } = req.params;
    const disciplinaFormatada = normalizeDisciplina(disciplina);

    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      }
    });

    if (!torneio) {
      return res.json({ success: true, data: [] });
    }

    // Inclui TODOS os participantes confirmados, mesmo com pontuacao zero
    const participantes = await ParticipanteTorneio.findAll({
      where: {
        torneio_id: torneio.id,
        disciplina_competida: disciplinaFormatada,
        status: 'confirmado'
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nome', 'imagem']
      }],
      order: [
        ['pontuacao', 'DESC'],
        ['entrou_em', 'ASC']
      ]
    });

    // Se algum participante n�o tem posi��o calculada, recalcular o ranking
    const temPosicaoNula = participantes.some(p => p.posicao === null || p.posicao === undefined);
    if (temPosicaoNula) {
      console.log('⚠️ Detectadas posi��es nulas, recalculando ranking...');
      await ParticipanteTorneio.calcularRanking(torneio.id, disciplinaFormatada);
      
      // Buscar novamente com posi��es atualizadas
      const participantesAtualizados = await ParticipanteTorneio.findAll({
        where: {
          torneio_id: torneio.id,
          disciplina_competida: disciplinaFormatada,
          status: 'confirmado'
        },
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nome', 'imagem']
        }],
        order: [
          ['pontuacao', 'DESC'],
          ['entrou_em', 'ASC']
        ]
      });
      
      return res.json({ success: true, data: participantesAtualizados.map(p => p.toJSON()) });
    }

    // Usar posi��es j� calculadas e persistidas
    res.json({ success: true, data: participantes.map(p => p.toJSON()) });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// 4. Buscar dados do usuario no torneio por disciplina
// Suporta torneios 'ativo' e 'finalizado' para exibir posicao correta no modal de encerramento
app.get('/api/participantes/usuario/:userId/:disciplina', async (req, res) => {
  try {
    const { userId, disciplina } = req.params;
    const disciplinaFormatada = normalizeDisciplina(disciplina);

    // Procurar primeiro torneio ativo; se nao existir, procurar o mais recente finalizado
    let torneio = await Torneio.findOne({ where: { status: 'ativo' } });
    let torneioFinalizado = false;

    if (!torneio) {
      torneio = await Torneio.findOne({
        where: { status: 'finalizado' },
        order: [['termina_em', 'DESC']]
      });
      if (torneio) torneioFinalizado = true;
    }

    if (!torneio) {
      return res.status(404).json({ success: false, error: 'Nenhum torneio encontrado' });
    }

    const participante = await ParticipanteTorneio.findOne({
      where: {
        usuario_id: userId,
        torneio_id: torneio.id,
        disciplina_competida: disciplinaFormatada
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nome', 'imagem', 'email']
      }]
    });

    if (!participante) {
      return res.status(404).json({ success: false, error: 'Participante nao encontrado' });
    }

    // Buscar todos os participantes confirmados ordenados por pontuacao
    const todosParticipantes = await ParticipanteTorneio.findAll({
      where: {
        torneio_id: torneio.id,
        disciplina_competida: disciplinaFormatada,
        status: 'confirmado'
      },
      order: [['pontuacao', 'DESC'], ['entrou_em', 'ASC']]
    });

    const totalParticipantes = todosParticipantes.length;

    // Determinar se o utilizador entrou depois do torneio ter terminado
    let entrouDepoisDoFim = false;
    if (torneioFinalizado && torneio.termina_em) {
      const entrou = new Date(participante.entrou_em);
      const fim = new Date(torneio.termina_em);
      entrouDepoisDoFim = entrou > fim;
    }

    // Se entrou depois do fim, nao tem posicao competitiva
    if (entrouDepoisDoFim) {
      return res.json({
        success: true,
        data: {
          ...participante.toJSON(),
          posicao: null,
          total_participantes: totalParticipantes,
          entrou_depois_do_fim: true
        }
      });
    }

    // Torneio sem participantes que competiram
    if (totalParticipantes === 0) {
      return res.json({
        success: true,
        data: {
          ...participante.toJSON(),
          posicao: null,
          total_participantes: 0,
          torneio_vazio: true
        }
      });
    }

    // Para torneio finalizado: usar posicao_congelada persistida se disponivel
    if (torneioFinalizado && participante.posicao_congelada && participante.posicao) {
      const todosComZeroFrozen = todosParticipantes.every(p => parseFloat(p.pontuacao || 0) === 0);
      const semRespostasValidasFrozen = todosComZeroFrozen && todosParticipantes.every(p => (p.casos_resolvidos || 0) === 0);
      const participanteSemPontuacaoFrozen =
        parseFloat(participante.pontuacao || 0) === 0 &&
        (participante.casos_resolvidos || 0) === 0;

      return res.json({
        success: true,
        data: {
          ...participante.toJSON(),
          total_participantes: totalParticipantes,
          sem_pontuacao_valida: semRespostasValidasFrozen,
          participante_sem_pontuacao: participanteSemPontuacaoFrozen
        }
      });
    }

    // Calcular posicao real pelo ranking em tempo real
    const posicaoReal = todosParticipantes.findIndex(p => p.usuario_id == userId) + 1;
    // posicaoReal === 0 significa que o participante nao esta na lista de confirmados
    const posicaoFinal = posicaoReal > 0 ? posicaoReal : null;

    // Verificar se todos os participantes t�m pontua��o zero (torneio sem atividade real)
    const todosComZero = todosParticipantes.every(p => parseFloat(p.pontuacao || 0) === 0);
    const semRespostasValidas = todosComZero && todosParticipantes.every(p => (p.casos_resolvidos || 0) === 0);

    // Verificar se este participante espec�fico n�o pontuou
    const participanteSemPontuacao =
      parseFloat(participante.pontuacao || 0) === 0 &&
      (participante.casos_resolvidos || 0) === 0;

    res.json({
      success: true,
      data: {
        ...participante.toJSON(),
        posicao: posicaoFinal,
        total_participantes: totalParticipantes,
        // Flags de cen�rio para o frontend
        sem_pontuacao_valida: semRespostasValidas,   // ningu�m pontuou no torneio
        participante_sem_pontuacao: participanteSemPontuacao  // este user n�o pontuou
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuario:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Atualizar pontuação do participante
app.post('/api/participantes/atualizar-pontuacao', async (req, res) => {
  try {
    const { usuario_id, disciplina_competida, pontuacao_adicionada, casos_adicionados } = req.body;

    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      }
    });

    if (!torneio) {
      return res.status(404).json({ success: false, error: 'Torneio não encontrado' });
    }

    const participante = await ParticipanteTorneio.findOne({
      where: {
        usuario_id,
        torneio_id: torneio.id,
        disciplina_competida
      }
    });

    if (!participante) {
      return res.status(404).json({ success: false, error: 'Participante não encontrado' });
    }

    const novaPontuacao = (Number(participante.pontuacao) || 0) + (Number(pontuacao_adicionada) || 0);
    const novosCasos = (Number(participante.casos_resolvidos) || 0) + (Number(casos_adicionados) || 0);

    participante.pontuacao = novaPontuacao;
    participante.casos_resolvidos = novosCasos;

    await participante.save();

    // Emitir atualização de ranking via Socket.IO (se disponível)
    try {
      if (io) {
        const participantes = await ParticipanteTorneio.findAll({
          where: { torneio_id: torneio.id, disciplina_competida: participante.disciplina_competida, status: 'confirmado' },
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }],
          order: [['pontuacao', 'DESC']],
          limit: 20
        });

        const ranking = participantes.map((p, i) => ({ ...p.toJSON(), posicao: i + 1 }));
        io.emit('ranking_update', { torneio_id: torneio.id, disciplina: participante.disciplina_competida, ranking });
        io.emit('participant_update', { participante: participante.toJSON() });
      }
    } catch (e) {
      console.warn('Não foi possível emitir evento Socket.IO:', e.message || e);
    }

    res.json({
      success: true,
      data: participante,
      message: 'Pontuação atualizada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar pontuação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5a. Obter estatísticas do torneio (contagem de participantes)
app.get('/api/torneios/estatisticas', async (req, res) => {
  try {
    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      }
    });

    if (!torneio) {
      return res.json({
        success: true,
        stats: {
          'Matem\u00e1tica': 0,
          'Ingl\u00eas': 0,
          'Programa\u00e7\u00e3o': 0
        }
      });
    }

    const counts = await ParticipanteTorneio.findAll({
      where: {
        torneio_id: torneio.id,
        status: 'confirmado'
      },
      attributes: [
        'disciplina_competida',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['disciplina_competida']
    });

    const stats = {
      'Matem\u00e1tica': 0,
      'Ingl\u00eas': 0,
      'Programa\u00e7\u00e3o': 0
    };

    counts.forEach(c => {
      const disciplina = c.getDataValue('disciplina_competida');
      const total = parseInt(c.getDataValue('total')) || 0;
      if (disciplina) {
        stats[disciplina] = total;
      }
    });

    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas do torneio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5c. Buscar total de usuários cadastrados
app.get('/api/stats/global', async (req, res) => {
  try {
    const totalUsers = await Usuario.count();
    res.json({ success: true, totalUsers: totalUsers || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5b. Avaliar respostas via IA (Matemática / Programação / Inglês)
app.post('/api/avaliar', async (req, res) => {
  try {
    const { usuario_id, disciplina, respostas } = req.body;

    if (!usuario_id || !disciplina || !Array.isArray(respostas)) {
      return res.status(400).json({ success: false, error: 'Parâmetros inválidos' });
    }

    // Encontrar torneio ativo
    const torneio = await Torneio.findOne({ where: { status: 'ativo' } });
    if (!torneio) return res.status(404).json({ success: false, error: 'Nenhum torneio ativo' });

    // Buscar participante
    const participante = await ParticipanteTorneio.findOne({ where: { torneio_id: torneio.id, usuario_id, disciplina_competida: disciplina } });
    if (!participante) return res.status(404).json({ success: false, error: 'Participante não encontrado' });

    // Preparar itens para IA
    const items = respostas.map(r => ({ pergunta_id: r.pergunta_id, texto: r.texto || r.enunciado || '', resposta: r.resposta || r.codigo || r.texto_resposta || '', nivel: r.nivel || 'facil' }));

    // Chamar serviço IA
    let feedbacks = [];
    try {
      feedbacks = await iaEvaluators.evaluate(disciplina, items);
    } catch (err) {
      console.error('Erro IA:', err.message || err);
      return res.status(500).json({ success: false, error: 'Erro ao avaliar com IA', details: err.message });
    }

    const totalPontos = feedbacks.reduce((s, f) => s + (Number(f.pontos) || 0), 0);

    // Persistir: adicionar pontos e incrementar casos_resolvidos
    participante.pontuacao = Number(participante.pontuacao) + Number(totalPontos || 0);
    participante.casos_resolvidos = Number(participante.casos_resolvidos || 0) + (respostas.length || 0);

    // Atualizar histórico e metadados simples (normalizar se não for array)
    let hist = participante.historico_pontuacao;
    if (!Array.isArray(hist)) {
      try {
        hist = hist ? JSON.parse(JSON.stringify(hist)) : [];
      } catch (e) {
        hist = [];
      }
      if (!Array.isArray(hist)) hist = [];
    }

    hist.push({ pontos: Number(totalPontos || 0), descricao: `Avaliação IA (${disciplina})`, data: new Date().toISOString() });
    participante.historico_pontuacao = hist.slice(-50);

    await participante.save();

    // Emitir atualização de ranking via Socket.IO (se disponível)
    try {
      if (io) {
        const participantes = await ParticipanteTorneio.findAll({
          where: { torneio_id: torneio.id, disciplina_competida: disciplina, status: 'confirmado' },
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }],
          order: [['pontuacao', 'DESC']],
          limit: 20
        });

        const ranking = participantes.map((p, i) => ({ ...p.toJSON(), posicao: i + 1 }));
        io.emit('ranking_update', { torneio_id: torneio.id, disciplina, ranking });
        io.emit('participant_update', { participante: participante.toJSON() });
      }
    } catch (e) {
      console.warn('Não foi possível emitir evento Socket.IO (avaliar):', e.message || e);
    }

    // Retornar detalhamento
    return res.json({ success: true, data: { participante, feedbacks, totalPontos } });
  } catch (error) {
    console.error('Erro endpoint /api/avaliar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Buscar todos torneios ativos
app.get('/api/torneios/ativos', async (req, res) => {
  try {
    const torneios = await Torneio.findAll({
      where: {
        status: 'ativo'
      },
      order: [['inicia_em', 'DESC']]
    });

    res.json({ success: true, data: torneios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Dashboard de estatísticas
app.get('/api/torneios/dashboard', async (req, res) => {
  try {
    const torneioAtivo = await Torneio.findOne({
      where: {
        status: 'ativo'
      }
    });

    if (!torneioAtivo) {
      return res.json({
        success: true,
        data: {
          torneio_ativo: false,
          mensagem: 'Nenhum torneio ativo no momento'
        }
      });
    }

    const agora = new Date();
    const inicio = new Date(torneioAtivo.inicia_em);
    const fim = new Date(torneioAtivo.termina_em);

    const dentroDoPeriodo = agora >= inicio && agora <= fim;

    const participantesMatematica = await ParticipanteTorneio.count({
      where: {
        torneio_id: torneioAtivo.id,
        disciplina_competida: 'Matem\u00e1tica',
        status: 'confirmado'
      }
    });

    const participantesIngles = await ParticipanteTorneio.count({
      where: {
        torneio_id: torneioAtivo.id,
        disciplina_competida: 'Ingl\u00eas',
        status: 'confirmado'
      }
    });

    const participantesProgramacao = await ParticipanteTorneio.count({
      where: {
        torneio_id: torneioAtivo.id,
        disciplina_competida: 'Programa\u00e7\u00e3o',
        status: 'confirmado'
      }
    });

    let progresso = 0;
    if (dentroDoPeriodo) {
      const inicioMs = inicio.getTime();
      const fimMs = fim.getTime();
      const agoraMs = agora.getTime();
      const duracaoTotal = fimMs - inicioMs;
      const tempoRestanteMs = fimMs - agoraMs;
      progresso = Math.min(100, Math.max(0, (tempoRestanteMs / duracaoTotal) * 100));
    }

    res.json({
      success: true,
      data: {
        torneio_ativo: true,
        dentro_do_periodo: dentroDoPeriodo,
        torneio: {
          id: torneioAtivo.id,
          titulo: torneioAtivo.titulo,
          inicio: torneioAtivo.inicia_em,
          termino: torneioAtivo.termina_em,
          progresso: parseFloat(progresso.toFixed(2))
        },
        estatisticas: {
          total_participantes: participantesMatematica + participantesIngles + participantesProgramacao,
          por_disciplina: {
            matematica: participantesMatematica,
            ingles: participantesIngles,
            programacao: participantesProgramacao
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Endpoint DEBUG: Mostrar todos torneios com detalhes
app.get('/api/debug/torneios', async (req, res) => {
  try {
    const agora = new Date();

    const torneios = await Torneio.findAll({
      order: [['id', 'ASC']]
    });

    const torneiosComDetalhes = torneios.map(t => {
      const torneioObj = t.toJSON();
      const inicio = new Date(torneioObj.inicia_em);
      const fim = new Date(torneioObj.termina_em);

      return {
        ...torneioObj,
        inicio_iso: inicio.toISOString(),
        fim_iso: fim.toISOString(),
        agora_iso: agora.toISOString(),
        dentro_periodo: agora >= inicio && agora <= fim
      };
    });

    res.json({
      success: true,
      agora: agora.toISOString(),
      data: torneiosComDetalhes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== UPLOAD AVATAR =====
app.post('/usuarios/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = String(req.params.id);
    const auth = req.headers.authorization || '';
    const token = auth.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, error: 'Token ausente.' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Token inválido.' });
    }

    if (String(payload.id) !== userId) return res.status(403).json({ success: false, error: 'Permissão negada.' });
    if (!req.file) return res.status(400).json({ success: false, error: 'Arquivo não enviado.' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    await Usuario.update({ imagem: fileUrl }, { where: { id: userId } });

    const updated = await Usuario.findByPk(userId);
    const { password, ...safe } = updated.get({ plain: true });

    res.json({ success: true, data: safe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  try {
    const userId = String(req.params.id);
    const auth = req.headers.authorization || '';
    const token = auth.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, error: 'Token ausente.' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Token inválido.' });
    }

    if (String(payload.id) !== userId) return res.status(403).json({ success: false, error: 'Permissão negada.' });

    const { nome, email, biografia } = req.body;
    const updates = {};

    if (typeof nome === 'string') {
      const trimmed = nome.trim();
      if (!trimmed) return res.status(400).json({ success: false, error: 'Nome inválido.' });
      updates.nome = trimmed;
    }

    if (typeof email === 'string') {
      const trimmed = email.trim();
      if (!trimmed) return res.status(400).json({ success: false, error: 'Email inválido.' });
      updates.email = trimmed;
    }

    if (biografia !== undefined) {
      updates.biografia = biografia;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, error: 'Nenhum dado para atualizar.' });
    }

    if (updates.email) {
      const numericId = Number(userId);
      const conflict = await Usuario.findOne({
        where: { email: updates.email, id: { [Op.ne]: numericId } }
      });
      if (conflict) {
        return res.status(409).json({ success: false, error: 'Email já em uso.' });
      }
    }

    await Usuario.update(updates, { where: { id: userId } });

    const updated = await Usuario.findByPk(userId);
    if (!updated) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    const { password, ...safe } = updated.get({ plain: true });

    res.json({ success: true, data: safe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== CRUD USUARIOS =====
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json({ success: true, count: usuarios.length, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    res.json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notificações do usuário
app.get('/usuarios/:id/notificacoes', auth, async (req, res) => {
  try {
    const usuarioId = String(req.params.id);
    if (String(req.user.id) !== usuarioId) {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    const notificacoes = await Notificacao.findAll({
      where: { usuario_id: usuarioId },
      order: [['criado_em', 'DESC']],
      limit: 50
    });
    res.json({ success: true, data: notificacoes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/notificacoes/:id/lido', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const notificacao = await Notificacao.findByPk(id);
    if (!notificacao) {
      return res.status(404).json({ success: false, error: 'Notifica��o n�o encontrada.' });
    }
    if (String(notificacao.usuario_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    await notificacao.update({ lido: true, lido_em: new Date() });
    res.json({ success: true, message: 'Notifica��o marcada como lida.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/usuarios/:id/notificacoes/lido-todas', auth, async (req, res) => {
  try {
    const usuarioId = String(req.params.id);
    if (String(req.user.id) !== usuarioId) {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    await Notificacao.update(
      { lido: true, lido_em: new Date() },
      { where: { usuario_id: usuarioId, lido: false } }
    );
    res.json({ success: true, message: 'Todas as notifica��es foram marcadas como lidas.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/usuarios/:id/notificacoes/nao-lidas/count', auth, async (req, res) => {
  try {
    const usuarioId = String(req.params.id);
    if (String(req.user.id) !== usuarioId) {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    const count = await Notificacao.count({
      where: { usuario_id: usuarioId, lido: false }
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configurações do usuário
app.get('/usuarios/:id/configuracao', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const configuracao = await ConfiguracaoUsuario.findOne({
      where: { usuario_id: usuarioId }
    });
    res.json({ success: true, data: configuracao || { usuario_id: usuarioId, preferencias: {} } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/usuarios/:id/configuracao', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const { preferencias } = req.body;

    const [config, created] = await ConfiguracaoUsuario.upsert({
      usuario_id: usuarioId,
      preferencias: preferencias,
      atualizado_em: new Date()
    });

    res.json({ success: true, data: config, created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alterar senha do usuário logado
app.post('/auth/alterar-senha', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, error: 'Token ausente.' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Token inválido.' });
    }

    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ success: false, error: 'Senha atual e nova senha são obrigatórias.' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const usuario = await Usuario.findByPk(payload.id);
    if (!usuario) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });

    const match = await bcrypt.compare(senhaAtual, usuario.password);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Senha atual incorreta.' });
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    await Usuario.update({ password: hashedPassword }, { where: { id: payload.id } });

    res.json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ success: false, error: 'Erro ao alterar senha.' });
  }
});

// Participações do usuário em torneios
app.get('/usuarios/:id/participacoes', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const participacoes = await ParticipanteTorneio.findAll({
      where: { usuario_id: usuarioId },
      include: [{
        model: Torneio,
        as: 'torneio',
        attributes: ['id', 'titulo', 'descricao', 'inicia_em', 'termina_em', 'status']
      }]
    });
    res.json({ success: true, data: participacoes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== CRUD TORNEIOS =====
app.get('/torneios', async (req, res) => {
  try {
    const torneios = await Torneio.findAll({ include: [{ model: Usuario, as: 'criador' }, { model: ParticipanteTorneio, as: 'participantes' }] });
    res.json({ success: true, data: torneios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id', async (req, res) => {
  try {
    const torneio = await Torneio.findByPk(req.params.id, { include: [{ model: Usuario, as: 'criador' }, { model: ParticipanteTorneio, as: 'participantes' }] });
    if (!torneio) return res.status(404).json({ success: false, error: 'Torneio não encontrado.' });
    res.json({ success: true, data: torneio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== TORNEIOS: JOIN, PARTICIPANTES, RANKING, SUBMIT respostas =====
app.post('/torneios/:id/join', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const { usuario_id, disciplina_competida } = req.body;
    if (!usuario_id) return res.status(400).json({ success: false, error: 'usuario_id é obrigatório.' });

    const torneio = await Torneio.findByPk(torneioId);
    if (!torneio) return res.status(404).json({ success: false, error: 'Torneio não encontrado.' });

    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });

    const count = await ParticipanteTorneio.count({ where: { torneio_id: torneioId, status: 'confirmado' } });
    if (torneio.maximo_participantes && count >= torneio.maximo_participantes) {
      return res.status(400).json({ success: false, error: 'Torneio atingiu o limite de participantes.' });
    }

    const exists = await ParticipanteTorneio.findOne({ where: { torneio_id: torneioId, usuario_id } });
    if (exists) {
      const existsWithUser = await ParticipanteTorneio.findOne({
        where: { torneio_id: torneioId, usuario_id },
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }]
      });
      return res.json({ success: true, data: existsWithUser, message: 'Já inscrito.' });
    }

    const participante = await ParticipanteTorneio.create({
      torneio_id: torneioId,
      usuario_id,
      status: 'confirmado',
      disciplina_competida: disciplina_competida || null,
      pontuacao: 0,
      casos_resolvidos: 0
    });

    const participanteWithUser = await ParticipanteTorneio.findByPk(participante.id, {
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }]
    });

    res.status(201).json({ success: true, data: participanteWithUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/participantes', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const participantes = await ParticipanteTorneio.findAll({ where: { torneio_id: torneioId }, include: [{ model: Usuario, as: 'usuario' }] });
    res.json({ success: true, data: participantes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/questoes/matematica', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const questoes = await Questao.findAll({
      where: { 
        torneio_id: torneioId,
        disciplina: 'matematica'
      },
      attributes: ['id', 'titulo', 'descricao', 'dificuldade', 'pontos', 'opcoes', 'midia', 'tipo', 'resposta_correta', 'explicacao']
    });
    res.json({ success: true, data: questoes });
  } catch (error) {
    console.error('Erro ao buscar questões de matemática:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/questoes/programacao', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const questoes = await Questao.findAll({
      where: { 
        torneio_id: torneioId,
        disciplina: 'programacao'
      },
      attributes: ['id', 'titulo', 'descricao', 'dificuldade', 'pontos', 'opcoes', 'midia', 'linguagem', 'tipo', 'resposta_correta', 'explicacao']
    });
    res.json({ success: true, data: questoes });
  } catch (error) {
    console.error('Erro ao buscar questões de programação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/questoes/ingles', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const questoes = await Questao.findAll({
      where: { 
        torneio_id: torneioId,
        disciplina: 'ingles'
      },
      attributes: ['id', 'titulo', 'descricao', 'dificuldade', 'pontos', 'opcoes', 'midia', 'tipo', 'resposta_correta', 'explicacao']
    });
    res.json({ success: true, data: questoes });
  } catch (error) {
    console.error('Erro ao buscar questões de inglês:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter top 3 vencedores de uma disciplina específica
app.get('/torneios/:id/top3/:disciplina', async (req, res) => {
  try {
    const { id, disciplina } = req.params;

    const top3 = await ParticipanteTorneio.findAll({
      where: {
        torneio_id: id,
        disciplina_competida: disciplina,
        status: 'confirmado'
      },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nome', 'imagem', 'email']
        }
      ],
      order: [
        ['pontuacao', 'DESC'],
        ['tempo_total', 'ASC']
      ],
      limit: 3
    });

    const vencedores = top3.map((p, index) => ({
      posicao: index + 1,
      usuario_id: p.usuario_id,
      nome: p.usuario?.nome || 'Participante',
      imagem: p.usuario?.imagem,
      pontuacao: p.pontuacao,
      tempo: p.tempo_total,
      disciplina: disciplina,
      medal: ['🥇', '🥈', '🥉'][index]
    }));

    res.json({ success: true, data: vencedores });
  } catch (error) {
    console.error('❌ Erro ao buscar top 3:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/torneios/:id/ranking', async (req, res) => {
  try {
    const torneioId = req.params.id;
    const participantes = await ParticipanteTorneio.findAll({
      where: { torneio_id: torneioId, status: 'confirmado' },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email'] }],
      order: [['pontuacao', 'DESC']]
    });

    let pos = 1;
    const ranked = participantes.map(p => ({
      ...p.toJSON(),
      posicao: pos++
    }));
    res.json({ success: true, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// ⚠️ ROTAS LEGADAS REMOVIDAS EM FASE 3 (2026-05-22):
// - GET /perguntas/:area (usava modelo Pergunta descontinuado)
// - GET /api/quiz/:area (usava modelo Pergunta descontinuado)
// Substituídas por: GET /api/questoes/quiz/:area (usa Questao.js)

app.post('/noticias', auth, isAdmin, async (req, res) => {
  try {
    const { titulo, resumo, conteudo, tags, url_capa, publicado = true } = req.body;

    if (!titulo || !conteudo) {
      return res.status(400).json({ success: false, error: 'T�tulo e conte�do s�o obrigat�rios.' });
    }

    let slug = buildSlug(req.body.slug || titulo);
    if (!slug) slug = `noticia-${Date.now()}`;

    const existingSlug = await Noticia.findOne({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const noticia = await Noticia.create({
      titulo: titulo.trim(),
      slug,
      resumo: resumo?.trim() || null,
      conteudo: conteudo.trim(),
      autor_id: req.user.id,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.trim() ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : []),
      url_capa: url_capa?.trim() || null,
      publicado: Boolean(publicado),
      publicado_em: publicado ? new Date() : null,
      criado_em: new Date(),
      atualizado_em: new Date()
    });

    const noticiaCompleta = await Noticia.findByPk(noticia.id, {
      include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nome', 'imagem'] }]
    });

    if (noticia.publicado) {
      await createNotificationForAllUsers({
        tipo: 'noticia',
        titulo: 'Nova not�cia publicada',
        mensagem: noticia.titulo,
        extras: { noticiaId: noticia.id, slug: noticia.slug }
      });
    }

    if (io) {
      io.emit('news_created', noticiaCompleta);
    }

    res.status(201).json({ success: true, data: noticiaCompleta });
  } catch (error) {
    console.error('Erro ao criar not�cia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/notificacoes', auth, isAdmin, async (req, res) => {
  try {
    const { usuario_id, tipo = 'geral', titulo, mensagem, todos = false, extras = {} } = req.body;

    if (!titulo || !mensagem) {
      return res.status(400).json({ success: false, error: 'T�tulo e mensagem s�o obrigat�rios.' });
    }

    if (todos) {
      const total = await createNotificationForAllUsers({ tipo, titulo, mensagem, extras });
      return res.status(201).json({ success: true, message: `${total} notifica��es criadas.` });
    }

    if (!usuario_id) {
      return res.status(400).json({ success: false, error: 'usuario_id � obrigat�rio quando todos=false.' });
    }

    const notificacao = await createNotificationForUser({ usuarioId: usuario_id, tipo, titulo, mensagem, extras });
    res.status(201).json({ success: true, data: notificacao });
  } catch (error) {
    console.error('Erro ao criar notifica��o:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// ===== NOTICIAS =====
app.get('/noticias', async (req, res) => {
  try {
    const isPreview = String(req.query.preview || '').toLowerCase() === 'true';
    const where = isPreview ? {} : { publicado: true };

    const noticias = await Noticia.findAll({
      where,
      include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nome', 'imagem'] }],
      order: [['publicado_em', 'DESC'], ['criado_em', 'DESC']]
    });
    res.json({ success: true, data: noticias });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== ROTAS DE FINALIZAÇÃO DE TORNEIO E GERAÇÃO DE CERTIFICADOS =====
app.post('/api/torneios/:id/finalizar', async (req, res) => {
  try {
    const { id } = req.params;
    const { disciplinas } = req.body; // Array de disciplinas a finalizar

    const torneio = await Torneio.findByPk(id);
    if (!torneio) {
      return res.status(404).json({ success: false, error: 'Torneio não encontrado' });
    }

    // Marcar torneio como finalizado
    torneio.status = 'finalizado';
    torneio.ativo = false;
    await torneio.save();

    console.log(`🏆 Torneio ${torneio.titulo} (ID: ${id}) marcado como finalizado`);

    // Gerar certificados para cada disciplina
    const certificados = [];
    const { generateCertificate } = await import('./certificates/generator/index.js');

    if (disciplinas && Array.isArray(disciplinas)) {
      for (const disciplina of disciplinas) {
        try {
          const top3 = await ParticipanteTorneio.findAll({
            where: { torneio_id: id, disciplina_competida: disciplina, status: 'confirmado' },
            order: [['pontuacao', 'DESC'], ['tempo_total', 'ASC']],
            limit: 3,
          });

          for (const p of top3) {
            const cert = await generateCertificate({
              userId: p.usuario_id,
              tournamentId: id,
              disciplina,
            });
            certificados.push(cert);
          }
          console.log(`✅ Certificados gerados para ${disciplina}: ${top3.length} certificados`);
        } catch (err) {
          console.error(`❌ Erro ao gerar certificados para ${disciplina}:`, err.message);
        }
      }
    }

    res.json({
      success: true,
      message: 'Torneio finalizado com sucesso',
      torneio: torneio.toJSON(),
      certificados: certificados
    });
  } catch (error) {
    console.error('Erro ao finalizar torneio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== INICIALIZAÇÃO =====
async function startServer() {
  try {
    console.log("Inicializando servidor...");

    // Associations are configured in models/associations.js (imported at top of file)
    // No need to call setupAssociations() here anymore

    // Testar conexao com banco (nao fatal)
    let dbConnected = false;
    try {
      dbConnected = await testConnection();
      if (dbConnected) {
        console.log("Banco de dados conectado!");
        // Sincronizar modelos
        await sequelize.sync({ alter: false });
        console.log("Modelos sincronizados!");
      } else {
        console.warn("Banco de dados indisponivel - iniciando em modo degradado (sem sincronizacao)");
      }
    } catch (dbErr) {
      console.warn("Falha ao testar/sincronizar banco - iniciando em modo degradado", dbErr?.message || dbErr);
      dbConnected = false;
    }

    // Criar servidor HTTP
    const server = http.createServer(app);

    // Tentar inicializar Socket.IO dinamicamente (opcional)
    try {
      const socketMod = await import('socket.io');
      const IOServerDynamic = socketMod.Server || socketMod.default?.Server || socketMod;
      io = new IOServerDynamic(server, {
        cors: {
          origin: true,
          methods: ['GET', 'POST'],
          credentials: true
        }
      });

      io.on('connection', (socket) => {
        console.log('📡 Socket conectado:', socket.id);
        socket.on('disconnect', (reason) => {
          console.log('📴 Socket desconectado:', socket.id, reason);
        });
      });
      
      // Registrar instância no socketService
      setIO(io);
      
      console.log('✅ Socket.IO inicializado (realtime habilitado)');
    } catch (e) {
      console.warn('⚠️ Socket.IO não disponível — realtime desativado. Instale "socket.io" para habilitar.');
      io = null;
    }

    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando: http://0.0.0.0:${port}`);
      console.log(`📡 Health: http://localhost:${port}/health`);
      console.log(`🏆 Torneio Ativo: http://localhost:${port}/api/torneios/ativo`);
      console.log(`📊 Dashboard: http://localhost:${port}/api/torneios/dashboard`);
      console.log(`🐛 Debug Torneios: http://localhost:${port}/api/debug/torneios`);
    });
  } catch (error) {
    console.error("❌ Erro na inicialização:", error?.message || error);
    console.error('O servidor não será finalizado automaticamente — verifique logs.');
  }
}

startServer();











