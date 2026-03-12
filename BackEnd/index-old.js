import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Usuario from "./models/User.js"; // Importe o modelo

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Preparar diretório de uploads e servir estático
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// Rota principal
app.get("/", (req, res) => {
  res.json({
    message: "API Comaes funcionando!",
    status: "online",
    database: "conectado",
    timestamp: new Date().toISOString()
  });
});

// Rota de saúde da API
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

// Rota para listar usuários (exemplo)
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json({
      success: true,
      count: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para criar usuário (exemplo)
app.post("/usuarios", async (req, res) => {
  try {
    const { nome, telefone, email, nascimento, sexo, escola, password } = req.body;

    // Validações básicas
    if (!nome || !telefone || !email || !nascimento || !sexo || !password) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios em falta.' });
    }

    // Verifica duplicados
    const exists = await Usuario.findOne({ where: { [Op.or]: [{ email }, { telefone }] } });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email ou telefone já registado.' });
    }

    // Hash da senha
    const hash = await bcrypt.hash(password, 10);

    const novo = await Usuario.create({
      nome,
      telefone,
      email,
      nascimento,
      sexo,
      escola: escola || null,
      password: hash
    });

    // Retornar sem password (defaultScope já omite)
    res.status(201).json({ success: true, message: 'Usuário criado com sucesso', data: novo });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) return res.status(400).json({ success: false, error: 'Dados incompletos.' });

    // Procura por email ou telefone
    const user = await Usuario.unscoped().findOne({ where: { [Op.or]: [{ email: usuario }, { telefone: usuario }] } });
    if (!user) return res.status(401).json({ success: false, error: 'Usuário não encontrado.' });

    const match = await bcrypt.compare(senha, user.password);
    if (!match) return res.status(401).json({ success: false, error: 'Senha inválida.' });

    // Gera token simples
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    // Retornar usuário sem password
    const { password, ...userSafe } = user.get({ plain: true });
    res.json({ success: true, data: userSafe, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recuperação (localiza conta)
app.post('/auth/recover', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email é obrigatório.' });

    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, error: 'Conta não encontrada.' });

    // Aqui idealmente envia-se um email com token; por agora apenas respondemos sucesso
    res.json({ success: true, message: 'Verificámos a conta. Envie um email com instruções (simulado).' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload de avatar do usuário
app.post('/usuarios/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = String(req.params.id);

    // Verificar token
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
    console.error('Erro upload avatar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Função de inicialização
async function startServer() {
  try {
    console.log("🔄 Inicializando servidor...");
    
    // Testar conexão com banco
    await sequelize.authenticate();
    console.log("✅ Banco de dados conectado!");
    
    // Sincronizar modelos (cuidado com alter:true em produção)
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados!");
    
    // Listar tabelas
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log("📊 Tabelas no banco:");
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    // Iniciar servidor
    app.listen(port, () => {
      console.log(`🚀 Servidor rodando: http://localhost:${port}`);
      console.log(`📡 Health check: http://localhost:${port}/health`);
      console.log(`👥 Usuários API: http://localhost:${port}/usuarios`);
    });
    
  } catch (error) {
    console.error("❌ Erro na inicialização:", error.message);
    process.exit(1);
  }
}

// Iniciar tudo
startServer();