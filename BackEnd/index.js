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
import Nivel from "./models/Nivel.js";
import SequenciaAprendizagem from "./models/SequenciaAprendizagem.js";
import Missao from "./models/Missao.js";
import MissaoUsuario from "./models/MissaoUsuario.js";
import Ranking from "./models/Ranking.js";
import BlocoQuestoes from "./models/BlocoQuestoes.js";
import BlocoQuestaoItem from "./models/BlocoQuestaoItem.js";
import Disciplina from "./models/Disciplina.js";

// ===== CONFIGURAR ASSOCIA��ES ANTES DE IMPORTAR ROTAS =====
// CR�TICO: Este import deve vir ANTES das rotas para garantir que
// as associa��es estejam dispon�veis quando os controllers forem carregados
import './models/associations.js';

// ===== IMPORTAR SERVIÇOS E ROTAS =====
import iaEvaluators from './services/iaEvaluators.js';
import adminPanelRoutes from './routes/adminPanelRoutes.js';
import certificatesRoutes from './routes/certificatesRoutes.js';
import certificadosRoutes from './routes/certificadosRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import tournamentsRoutes from './routes/tournamentsRoutes.js';
import notificacoesRoutes from './routes/notificacoesRoutes.js';
import questoesRoutes from './routes/questoesRoutes.js';
import tentativasRoutes from './routes/tentativasRoutes.js';
import testeConhecimentoRoutes from './routes/testeConhecimentoRoutes.js';
import resultadosTesteRoutes from './routes/resultadosTesteRoutes.js';
import colaboradorRoutes from './routes/colaboradorRoutes.js';
import blocosRoutes, { torneiBlocosRouter } from './routes/blocosRoutes.js';
import colaboradorBlocosQuestoesRoutes from './routes/colaboradorBlocosQuestoesRoutes.js';
import nivelRoutes from './routes/nivelRoutes.js';
import streakRoutes from './routes/streakRoutes.js';
import { missoesRouter, dashboardGamificacaoRouter } from './routes/missoesRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import disciplinasRoutes from './routes/disciplinasRoutes.js';
import questoesColaboradorRoutes from './routes/questoesColaboradorRoutes.js';
import questoesAdminRoutes from './routes/questoesAdminRoutes.js';
import disciplinasAdminRoutes from './routes/disciplinasAdminRoutes.js';
import usuariosAdminRoutes from './routes/usuariosAdminRoutes.js';
import { sendResetEmail, sendWelcomeEmail } from './services/emailService.js';
import { setIO } from './services/socketService.js';
import { setupEncerramentoScheduler } from './jobs/verificarEncerramentosScheduler.js';
import auth from './middlewares/auth.js';
import isAdmin from './middlewares/isAdmin.js';
import isNotColaborador from './middlewares/isNotColaborador.js';
import { baseSanitizer } from './middlewares/security/sanitizer.js';
import validate, { rules } from './middlewares/validate.js';
import { startTorneioCron } from './services/torneioCron.js';
import { registrarColaborador, suspenderColaborador, getDocumentosColaborador } from './controllers/colaboradorRegistroController.js';
import { uploadColaboradorDocs, handleColaboradorUploadErrors } from './middlewares/security/colaboradorUpload.js';
import { validateRegistrationPayload } from './validation/registerValidation.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
let io = null; // inicializado no startServer

// ===== MIDDLEWARES CORRIGIDOS =====
// Force UTF-8 encoding for JSON responses only (não sobrescreve outros content-types)
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === 'object') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    return originalJson(body);
  };
  next();
});

app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// ⚠️ IMPORTANTE: baseSanitizer não é aplicado aqui para rotas de multipart/form-data
// Será aplicado seletivamente apenas após multer processar

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

// Registrar rotas específicas para colaboradores
app.use('/api/colaborador', colaboradorRoutes);

// REGISTRO PÚBLICO DE COLABORADORES (com upload de documentos)
// Endpoint separado do /auth/registro de estudantes para manter arquitetura limpa
app.post(
  '/auth/registro-colaborador',
  uploadColaboradorDocs.array('documentos', 5),
  handleColaboradorUploadErrors,
  registrarColaborador
);

// ✅ Aplicar sanitizer APÓS as rotas de multipart (que processam o body)
// Isto garante que multer processa os campos ANTES do sanitizer
app.use(baseSanitizer);

// ADMIN — documentos e suspensão de colaboradores
app.get('/api/admin/colaboradores/:id/documentos', isAdmin, getDocumentosColaborador);
app.patch('/api/admin/colaboradores/:id/suspender', isAdmin, suspenderColaborador);

// Registrar rotas de certificados
app.use('/api/certificates', certificatesRoutes);
app.use('/api/certificados', certificadosRoutes);

// Registrar rotas de torneios e ranking
app.use('/api/tournaments', tournamentsRoutes);

// Registrar rotas de questões (especializado - REFATORADO para Questao.js)
app.use('/api/questoes', questoesRoutes);

// ─── Task 8.1: Registrar rotas de questões para colaboradores ───
app.use('/api/questoes', questoesColaboradorRoutes);

// ─── Task 8.2: Registrar rotas de questões para admin (aprovação/rejeição) ───
app.use('/api/questoes', questoesAdminRoutes);

// ─── Task 8.2: Registrar rotas de disciplinas para admin ───
app.use('/api/disciplinas', disciplinasAdminRoutes);

// ─── Task 8.2: Registrar rotas de usuários para admin (atribuir colaborador) ───
app.use('/api/usuarios', usuariosAdminRoutes);

// Registrar rotas de Blocos de Questões
app.use('/api/blocos', blocosRoutes);

// ALIAS para blocos de colaboradores (compatibilidade com frontend)
// O frontend chama /api/blocos-colaboradores, mapear para /api/blocos
app.use('/api/blocos-colaboradores', blocosRoutes);

// Registrar rotas de Colaborador - Blocos e Questões (com aprovação)
app.use('/api/colaborador', colaboradorBlocosQuestoesRoutes);
app.use('/api/admin', colaboradorBlocosQuestoesRoutes);

// Registrar rotas de associação Torneio ↔ Bloco
app.use('/api/torneios/:id/blocos', torneiBlocosRouter);

// Registrar rotas de tentativas (persistência de respostas)
app.use('/api/tentativas', tentativasRoutes);

// Registrar rotas do Teste de Conhecimento (sistema independente)
app.use('/api/teste-conhecimento', testeConhecimentoRoutes);

// Registrar rotas de resultados do Teste de Conhecimento
app.use('/api/resultados', resultadosTesteRoutes);
// Alias para o endpoint de melhores desempenhos
app.use('/api/usuarios', resultadosTesteRoutes);

// Registrar rotas de notificações
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/usuarios/:usuarioId/notificacoes', notificacoesRoutes);

// Registrar rotas de nível e XP
app.use('/api/usuarios', nivelRoutes);

// Registrar rotas de streak (sequência de aprendizagem)
app.use('/api/usuarios', streakRoutes);

// Registrar rotas de missões e dashboard agregado de gamificação
app.use('/api/missoes', missoesRouter);
app.use('/api/usuarios', dashboardGamificacaoRouter);

// Registrar rotas de rankings educacionais gamificados
app.use('/api/rankings', rankingRoutes);

// Registrar rotas de disciplinas (admin only)
app.use('/api/disciplinas', disciplinasRoutes);

// Registrar rotas de suporte (chat IA + tickets)
app.use('/api/support', supportRoutes);
app.use('/suporte', supportRoutes); // alias para compatibilidade com Suporte.jsx

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

    // Buscar usuario por email OU telefone - usando query SQL direta
    let user;
    try {
      // Query SQL direta para evitar problemas com o modelo
      const [results] = await sequelize.query(
        `SELECT id, nome, telefone, email, nascimento, sexo, password, escola, imagem, biografia, isAdmin, role, disciplina_colaborador, status_colaborador, createdAt, updatedAt, funcao_id 
         FROM usuarios 
         WHERE email = :email OR telefone = :telefone 
         LIMIT 1`,
        {
          replacements: {
            email: usuario.toLowerCase(),
            telefone: usuario
          },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      user = results ? { 
        id: results.id,
        nome: results.nome,
        telefone: results.telefone,
        email: results.email,
        nascimento: results.nascimento,
        sexo: results.sexo,
        password: results.password,
        escola: results.escola,
        imagem: results.imagem,
        biografia: results.biografia,
        isAdmin: results.isAdmin,
        role: results.role || (results.isAdmin ? 'admin' : 'estudante'),
        disciplina_colaborador: results.disciplina_colaborador || null,
        status_colaborador: results.status_colaborador || 'aprovado',
        createdAt: results.createdAt,
        updatedAt: results.updatedAt,
        funcao_id: results.funcao_id,
        // Métodos simulados para compatibilidade
        get: (options) => ({ 
          plain: options?.plain ? {
            id: results.id,
            nome: results.nome,
            telefone: results.telefone,
            email: results.email,
            nascimento: results.nascimento,
            sexo: results.sexo,
            escola: results.escola,
            imagem: results.imagem,
            biografia: results.biografia,
            isAdmin: results.isAdmin,
            role: results.role || (results.isAdmin ? 'admin' : 'estudante'),
            disciplina_colaborador: results.disciplina_colaborador || null,
            status_colaborador: results.status_colaborador || 'aprovado',
            createdAt: results.createdAt,
            updatedAt: results.updatedAt,
            funcao_id: results.funcao_id
          } : this
        })
      } : null;
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

    // Verificar status do colaborador
    const userStatus = user.status_colaborador || 'aprovado';
    
    // Para colaboradores, verificar se estão aprovados
    if (user.role === 'colaborador' && userStatus !== 'aprovado') {
      if (userStatus === 'pendente') {
        return res.status(403).json({
          success: false,
          error: 'Aguardando aprovação do administrador.',
          userStatus: 'pendente'
        });
      } else if (userStatus === 'rejeitado') {
        return res.status(403).json({
          success: false,
          error: 'Solicitação de colaborador rejeitada.',
          userStatus: 'rejeitado'
        });
      }
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || (user.isAdmin ? 'admin' : 'estudante'),
        disciplina_colaborador: user.disciplina_colaborador || null
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Extrair dados do utilizador sem a password
    // user.get({ plain: true }) devolve o objecto interno - extrair correctamente
    const userPlain = user.get({ plain: true });
    // userPlain pode ser { plain: {...} } (objeto simulado) ou directamente o objeto
    const userRaw = userPlain?.plain || userPlain;
    const { password: _pw, ...userSafe } = userRaw;

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

// REGISTRO DE ESTUDANTES (mantido intacto)
app.post('/auth/registro', validate(rules.register), async (req, res) => {
  try {
    const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
    const telefone = typeof req.body.telefone === 'string' ? req.body.telefone.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const nascimento = req.body.nascimento;
    const sexo = req.body.sexo;
    const escola = typeof req.body.escola === 'string' ? req.body.escola.trim() : '';
    const password = req.body.password;
    const role = req.body.role || 'estudante'; // Default para estudante
    const disciplina_colaborador = req.body.disciplina_colaborador;

    console.log('📝 Tentativa de registro:', { nome, email, telefone, role, disciplina_colaborador });

    const fieldErrors = validateRegistrationPayload({ 
      nome, 
      telefone, 
      email, 
      nascimento, 
      sexo, 
      password, 
      role,
      disciplina_colaborador 
    });
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(422).json({
        success: false,
        error: 'Verifique os campos do cadastro.',
        fieldErrors
      });
    }

    // Verificar permissões: apenas admin pode criar colaboradores diretamente aprovados
    const isPublicRegistration = !req.user; // Registro público (sem token)
    if (role === 'colaborador' && isPublicRegistration) {
      // Registro público de colaborador - não pode definir disciplina diretamente
      // A disciplina será atribuída após aprovação pelo admin
      if (disciplina_colaborador) {
        return res.status(422).json({
          success: false,
          error: 'Disciplina não pode ser definida no registro público.',
          fieldErrors: { disciplina_colaborador: 'A disciplina será atribuída após aprovação pelo administrador.' }
        });
      }
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
    
    // Determinar status e role
    const finalRole = role === 'colaborador' && isPublicRegistration ? 'colaborador' : 'estudante';
    
    // Determinar status do colaborador
    const statusColaborador = finalRole === 'colaborador' ? 'pendente' : 'aprovado';
    
    // Determinar disciplina
    const finalDisciplina = finalRole === 'colaborador' && req.user ? disciplina_colaborador : null;

    const novoUsuario = await Usuario.create({
      nome,
      telefone,
      email,
      nascimento,
      sexo,
      escola: escola || null,
      password: hash_senha,
      isAdmin: false,
      role: finalRole,
      disciplina_colaborador: finalDisciplina,
      status_colaborador: statusColaborador,
      pontos_totais: 0,
      nivel: 1
    });

    // Se for colaborador pendente, não gerar token automaticamente
    if (finalRole === 'colaborador' && statusColaborador === 'pendente') {
      console.log('✅ Colaborador criado com sucesso (pendente de aprovação):', novoUsuario.email);

      // Notificar administradores sobre novo colaborador pendente
      if (io) {
        io.emit('novo_colaborador_pendente', {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          createdAt: novoUsuario.createdAt
        });
      }

      res.status(201).json({
        success: true,
        message: 'Solicitação de colaborador enviada com sucesso. Aguarde aprovação do administrador.',
        data: { ...novoUsuario.get({ plain: true }), password: undefined },
        requiresApproval: true
      });
    } else {
      // Gerar token automaticamente após registro (para estudantes e colaboradores criados por admin)
      const token = jwt.sign(
        {
          id: novoUsuario.id,
          email: novoUsuario.email,
          role: novoUsuario.role,
          disciplina_colaborador: novoUsuario.disciplina_colaborador
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
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
    }
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

    console.log('📅 Período do torneio:', {
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      agora: agora.toISOString()
    });

    // ✅ NOVO: Verificar expiração automática
    if (agora > fim) {
      console.log('⏰ Torneio expirou automaticamente. Finalizando...');
      await torneio.update({ status: 'finalizado' });
      
      // Congelar rankings de todas as disciplinas
      const disciplinas = ['Matemática', 'Inglês', 'Programação'];
      for (const disciplina of disciplinas) {
        try {
          await ParticipanteTorneio.congelarRanking(torneio.id, disciplina);
        } catch (e) {
          console.warn(`Aviso ao congelar ${disciplina}:`, e.message);
        }
      }

      return res.json({
        success: true,
        ativo: false,
        expirou_automaticamente: true,
        message: 'Torneio expirou e foi finalizado automaticamente'
      });
    }

    const dentroDoPeriodo = agora >= inicio && agora <= fim;

    // ✅ CORRIGIDO: Serializar manualmente em vez de usar toJSON()
    const torneioData = {
      id: torneio.id,
      titulo: torneio.titulo,
      descricao: torneio.descricao,
      slug: torneio.slug,
      inicia_em: torneio.inicia_em ? new Date(torneio.inicia_em).toISOString() : null,
      termina_em: torneio.termina_em ? new Date(torneio.termina_em).toISOString() : null,
      status: torneio.status,
      criado_por: torneio.criado_por,
      tipo_torneio: torneio.tipo_torneio,
      disciplina_especifica: torneio.disciplina_especifica
    };

    res.json({
      success: true,
      ativo: dentroDoPeriodo,
      dentroDoPeriodo,
      torneio: torneioData,
      mensagem: dentroDoPeriodo ?
        'Torneio ativo e em andamento' :
        'Torneio marcado como ativo mas fora do período programado'
    });
  } catch (error) {
    console.error('❌ Erro ao verificar torneio ativo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ NOVO: 1.5 Obter disciplinas disponíveis do torneio ativo
app.get('/api/torneios/ativo/disciplinas', async (req, res) => {
  try {
    const agora = new Date();

    // Buscar torneio ativo
    const torneio = await Torneio.findOne({
      where: { status: 'ativo' },
      order: [['inicia_em', 'DESC']]
    });

    if (!torneio) {
      console.log('ℹ️  Nenhum torneio ativo encontrado');
      return res.json({
        success: true,
        disciplinas: [],
        tipo_torneio: null,
        message: 'Nenhum torneio ativo'
      });
    }

    console.log('🔍 Torneio ativo:', {
      id: torneio.id,
      titulo: torneio.titulo,
      tipo: torneio.tipo_torneio,
      disciplina_especifica: torneio.disciplina_especifica
    });

    // Verificar expiração
    const inicio = new Date(torneio.inicia_em);
    const fim = new Date(torneio.termina_em);
    
    console.log('📅 Verificando período:', {
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      agora: agora.toISOString(),
      expirou: agora > fim
    });

    if (agora > fim) {
      console.log('⏰ Torneio expirou');
      return res.json({
        success: true,
        disciplinas: [],
        tipo_torneio: torneio.tipo_torneio,
        expirou: true,
        message: 'Torneio expirou'
      });
    }

    if (agora < inicio) {
      console.log('⏰ Torneio ainda não iniciou');
      return res.json({
        success: true,
        disciplinas: [],
        tipo_torneio: torneio.tipo_torneio,
        ainda_nao_iniciou: true,
        message: 'Torneio ainda não iniciou'
      });
    }

    // ✅ CORRIGIDO: Determinar disciplinas baseado no tipo
    let disciplinasParaVerificar = [];

    if (torneio.tipo_torneio === 'especifico' && torneio.disciplina_especifica) {
      // Apenas disciplina específica
      disciplinasParaVerificar = [torneio.disciplina_especifica];
      console.log('🔒 Torneio específico para:', torneio.disciplina_especifica);
    } else {
      // Genérico: todas as disciplinas
      disciplinasParaVerificar = ['Matemática', 'Inglês', 'Programação'];
      console.log('🌐 Torneio genérico: verificando todas as disciplinas');
    }

    // ✅ CORRIGIDO: Verificar quais disciplinas têm blocos de questões
    const disciplinasComBlocos = [];

    for (const disciplina of disciplinasParaVerificar) {
      const mapeoDisciplina = {
        'Matemática': 'matematica',
        'Inglês': 'ingles',
        'Programação': 'programacao'
      };

      const disciplinaBloco = mapeoDisciplina[disciplina];
      
      // ✅ CORRIGIDO: NÃO filtrar por torneio_id (blocos não estão vinculados a torneio no BD)
      const blocos = await BlocoQuestoes.findAll({
        where: {
          disciplina: disciplinaBloco,
          status: 'publicado'
        },
        limit: 1
      });

      console.log(`  📋 Disciplina "${disciplina}": ${blocos.length} bloco(s) publicado(s)`);

      if (blocos.length > 0) {
        disciplinasComBlocos.push(disciplina);
      }
    }

    console.log('✅ Disciplinas com blocos:', disciplinasComBlocos);

    res.json({
      success: true,
      torneio_id: torneio.id,
      tipo_torneio: torneio.tipo_torneio,
      disciplina_especifica: torneio.disciplina_especifica || null,
      disciplinas: disciplinasComBlocos,
      message: `${disciplinasComBlocos.length} disciplina(s) disponível(eis)`
    });
  } catch (error) {
    console.error('❌ Erro ao obter disciplinas:', error);
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
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email', 'nivel_atual', 'xp_total'] }]
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
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email', 'nivel_atual', 'xp_total'] }],
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
      const stats = { 'Matemática': 0, 'Inglês': 0, 'Programação': 0 };
      counts.forEach(c => {
        const d = c.getDataValue('disciplina_competida');
        const n = parseInt(c.getDataValue('total')) || 0;
        if (d && stats[d] !== undefined) stats[d] = n;
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
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email', 'nivel_atual', 'xp_total'] }],
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
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email', 'nivel_atual', 'xp_total'] }],
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
// Configurações do usuário — GET
app.get('/usuarios/:id/configuracao', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const configuracao = await ConfiguracaoUsuario.findOne({
      where: { usuario_id: usuarioId }
    });

    // Defaults completos para todas as secções
    const defaults = {
      seguranca:    { twoFactor: false, loginAlerts: true },
      tema:         'light',
      idioma:       'pt-PT',
      privacidade:  { perfilPublico: true, mostrarRanking: true, mostrarCertificados: true, mostrarAtividade: true },
      notificacoes: { email: true, competicoes: true, certificados: true, novidades: false },
    };

    let preferencias = defaults;
    if (configuracao?.preferencias) {
      // Merge profundo: defaults + dados guardados
      const saved = typeof configuracao.preferencias === 'string'
        ? JSON.parse(configuracao.preferencias)
        : configuracao.preferencias;
      preferencias = {
        seguranca:    { ...defaults.seguranca,    ...(saved.seguranca    || {}) },
        tema:         saved.tema    || defaults.tema,
        idioma:       saved.idioma  || defaults.idioma,
        privacidade:  { ...defaults.privacidade,  ...(saved.privacidade  || {}) },
        notificacoes: { ...defaults.notificacoes, ...(saved.notificacoes || {}) },
      };
    }

    res.json({ success: true, data: preferencias });
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configurações do usuário — PUT
app.put('/usuarios/:id/configuracao', async (req, res) => {
  try {
    const usuarioId = req.params.id;

    // Aceita tanto { preferencias: {...} } (legado) como o objecto directo
    const payload = req.body.preferencias || req.body;

    // Carregar configuração existente para merge
    const existente = await ConfiguracaoUsuario.findOne({ where: { usuario_id: usuarioId } });
    let atual = {};
    if (existente?.preferencias) {
      atual = typeof existente.preferencias === 'string'
        ? JSON.parse(existente.preferencias)
        : existente.preferencias;
    }

    // Merge profundo para evitar sobrescrever secções não enviadas
    const merged = { ...atual };
    for (const [key, val] of Object.entries(payload)) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        merged[key] = { ...(atual[key] || {}), ...val };
      } else {
        merged[key] = val;
      }
    }

    await ConfiguracaoUsuario.upsert({
      usuario_id: usuarioId,
      preferencias: merged,
      atualizado_em: new Date(),
    });

    res.json({ success: true, data: merged });
  } catch (error) {
    console.error('Erro ao guardar configurações:', error);
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
app.post('/torneios/:id/join', isNotColaborador, async (req, res) => {
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
        disciplina: 'matematica',
        status_aprovacao: 'aprovada' // Apenas questões aprovadas
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
        disciplina: 'programacao',
        status_aprovacao: 'aprovada' // Apenas questões aprovadas
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
        disciplina: 'ingles',
        status_aprovacao: 'aprovada' // Apenas questões aprovadas
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
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'imagem', 'email', 'nivel_atual', 'xp_total'] }],
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

// Incrementar visualizações de uma notícia (chamado quando o utilizador entra na aba Notícias)
app.post('/noticias/:id/visualizar', async (req, res) => {
  try {
    const { id } = req.params;
    const noticia = await Noticia.findByPk(id);
    if (!noticia) {
      return res.status(404).json({ success: false, error: 'Notícia não encontrada.' });
    }
    await noticia.increment('visualizacoes', { by: 1 });
    res.json({ success: true, visualizacoes: (noticia.visualizacoes || 0) + 1 });
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

    // Gerar certificados para cada disciplina usando o gerador correto
    const certificados = [];
    const { generateCertificatesForTournament } = await import('./certificates/generator/generateCertificado.js');

    if (disciplinas && Array.isArray(disciplinas)) {
      for (const disciplina of disciplinas) {
        try {
          console.log(`📝 Gerando certificados para ${disciplina}...`);
          const result = await generateCertificatesForTournament(id, disciplina);
          
          if (result.success) {
            certificados.push(...(result.details || []));
            console.log(`✅ Certificados gerados para ${disciplina}: ${result.certificatesGenerated} certificados`);
          } else {
            console.warn(`⚠️ Falha ao gerar certificados para ${disciplina}:`, result.message || result.error);
          }
        } catch (err) {
          console.error(`❌ Erro ao gerar certificados para ${disciplina}:`, err.message);
        }
      }
    }

    res.json({
      success: true,
      message: 'Torneio finalizado com sucesso',
      torneio: torneio.toJSON(),
      certificados: certificados,
      totalCertificados: certificados.length
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

        // Garantir coluna visualizacoes na tabela noticias (migração segura)
        try {
          const [cols] = await sequelize.query("SHOW COLUMNS FROM `noticias` LIKE 'visualizacoes'");
          if (cols.length === 0) {
            await sequelize.query("ALTER TABLE `noticias` ADD COLUMN `visualizacoes` INT NOT NULL DEFAULT 0");
            console.log("✅ Coluna 'visualizacoes' adicionada à tabela noticias");
          }
        } catch (migErr) {
          console.warn("⚠️ Não foi possível verificar/adicionar coluna visualizacoes:", migErr?.message);
        }

        // Garantir colunas do sistema de níveis na tabela usuarios (migração segura)
        try {
          const [xpCol] = await sequelize.query("SHOW COLUMNS FROM `usuarios` LIKE 'xp_total'");
          if (xpCol.length === 0) {
            await sequelize.query("ALTER TABLE `usuarios` ADD COLUMN `xp_total` INT NOT NULL DEFAULT 0 COMMENT 'XP acumulado por desempenho académico'");
            console.log("✅ Coluna 'xp_total' adicionada à tabela usuarios");
          }
          const [nivelCol] = await sequelize.query("SHOW COLUMNS FROM `usuarios` LIKE 'nivel_atual'");
          if (nivelCol.length === 0) {
            await sequelize.query("ALTER TABLE `usuarios` ADD COLUMN `nivel_atual` INT NOT NULL DEFAULT 1 COMMENT 'Nível actual do utilizador (1-10)'");
            console.log("✅ Coluna 'nivel_atual' adicionada à tabela usuarios");
          }
        } catch (migErr) {
          console.warn("⚠️ Não foi possível verificar/adicionar colunas de nível:", migErr?.message);
        }

        // Garantir tabela sequencias_aprendizagem para o sistema de streak
        try {
          const [streakTable] = await sequelize.query("SHOW TABLES LIKE 'sequencias_aprendizagem'");
          if (streakTable.length === 0) {
            await sequelize.query(`CREATE TABLE IF NOT EXISTS \`sequencias_aprendizagem\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`usuario_id\` INT NOT NULL UNIQUE,
              \`streak_atual\` INT NOT NULL DEFAULT 0,
              \`streak_maximo\` INT NOT NULL DEFAULT 0,
              \`ultima_data_atividade\` DATE DEFAULT NULL,
              \`criado_em\` DATETIME DEFAULT CURRENT_TIMESTAMP,
              \`atualizado_em\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              CONSTRAINT \`fk_seq_usuario\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
            console.log("✅ Tabela 'sequencias_aprendizagem' criada com sucesso");
          }
        } catch (migErr) {
          console.warn("⚠️ Não foi possível verificar/criar tabela sequencias_aprendizagem:", migErr?.message);
        }
        try {
          const [nivelRows] = await sequelize.query("SHOW TABLES LIKE 'niveis'");
          if (nivelRows.length === 0) {
            await sequelize.query(`CREATE TABLE IF NOT EXISTS \`niveis\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`numero\` INT NOT NULL UNIQUE,
              \`titulo\` VARCHAR(100) NOT NULL,
              \`xp_minimo\` INT NOT NULL DEFAULT 0,
              \`icone\` VARCHAR(10),
              \`descricao\` TEXT,
              \`cor\` VARCHAR(20),
              \`criado_em\` DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
            // Inserir os 10 níveis
            await sequelize.query(`INSERT INTO \`niveis\` (numero,titulo,xp_minimo,icone,descricao,cor) VALUES
              (1,'Filhote de Coruja',0,'🐣','Cada grande jornada começa com um primeiro passo. Bem-vindo à COMAES!','#94A3B8'),
              (2,'Coruja Curiosa',200,'🦉','A curiosidade é o motor do conhecimento.','#64748B'),
              (3,'Coruja Aprendiz',500,'📚','O aprendizado consistente está a moldar a tua mente académica.','#3B82F6'),
              (4,'Coruja Estudiosa',1000,'✏️','A disciplina e o esforço estão a produzir resultados visíveis.','#6366F1'),
              (5,'Coruja Estrategista',2000,'🎯','Resolves problemas com método e raciocínio estratégico.','#8B5CF6'),
              (6,'Coruja Competidora',3500,'🏅','O espírito competitivo eleva o teu desempenho a novos patamares.','#EC4899'),
              (7,'Coruja Especialista',5500,'🔬','O domínio técnico distingue-te no campo académico.','#14B8A6'),
              (8,'Coruja Sábia',8000,'🌟','A sabedoria acumulada transforma conhecimento em excelência.','#F59E0B'),
              (9,'Coruja Mestre',12000,'👑','Atingiste um domínio raro que poucos alcançam. És uma referência.','#EF4444'),
              (10,'Coruja Lendária',18000,'🔥','O topo da excelência académica COMAES. A tua jornada inspira outros.','#7C3AED')`);
            console.log("✅ Tabela 'niveis' criada e populada com os 10 níveis COMAES");
          }
        } catch (migErr) {
          console.warn("⚠️ Não foi possível verificar/criar tabela niveis:", migErr?.message);
        }
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

    // Iniciar cron jobs do sistema de rankings
    try {
      const { iniciarCronJobsRanking } = await import('./scripts/rankingCron.js');
      iniciarCronJobsRanking();
      console.log('✅ Cron jobs do sistema de rankings iniciados');
    } catch (error) {
      console.warn('⚠️ Não foi possível iniciar cron jobs de ranking:', error.message);
    }

    // Configurar hooks automáticos de ranking
    try {
      const { setupRankingHooks } = await import('./middlewares/rankingEvents.js');
      setupRankingHooks(app);
      console.log('✅ Hooks automáticos de ranking configurados');
    } catch (error) {
      console.warn('⚠️ Não foi possível configurar hooks de ranking:', error.message);
    }

    // Iniciar scheduler de encerramentos de torneios
    try {
      setupEncerramentoScheduler();
      console.log('✅ Scheduler de encerramentos de torneios iniciado');
    } catch (error) {
      console.warn('⚠️ Não foi possível iniciar scheduler de encerramentos:', error.message);
    }

    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando: http://0.0.0.0:${port}`);
      console.log(`📡 Health: http://localhost:${port}/health`);
      console.log(`🏆 Torneio Ativo: http://localhost:${port}/api/torneios/ativo`);
      console.log(`📊 Dashboard: http://localhost:${port}/api/torneios/dashboard`);
      console.log(`🏅 Rankings: http://localhost:${port}/api/rankings/public`);
      console.log(`🐛 Debug Torneios: http://localhost:${port}/api/debug/torneios`);
    });
  } catch (error) {
    console.error("❌ Erro na inicialização:", error?.message || error);
    console.error('O servidor não será finalizado automaticamente — verifique logs.');
  }
}

startServer();

// ✅ TRIGGER RELOAD: Backend fixes applied successfully
// - Fixed SQL order clause: changed createdAt to created_at
// - Updated minhasQuestoes method with proper error logging
// - Verified routes are registered in colaboradorRoutes.js







