// routes/supportRoutes.js
import express from 'express';
import auth from '../middlewares/auth.js';
import { askSupportAI } from '../services/supportChatService.js';
import TicketSuporte from '../models/TicketSuporte.js';

const router = express.Router();

// Rate limiting simples em memória (por utilizador, por minuto)
const rateLimitMap = new Map();
const RATE_LIMIT = 10;       // máx. requisições por janela
const WINDOW_MS = 60 * 1000; // janela de 1 minuto

function checkRateLimit(userId) {
  const now = Date.now();
  const key = String(userId);
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Limpeza periódica do mapa para evitar memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, WINDOW_MS * 5);

/**
 * POST /api/support/chat
 * Envia uma mensagem ao assistente de IA da COMAES
 * Body: { message: string, history: [{role, parts}] }
 */
router.post('/chat', auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições. Aguarde um momento antes de enviar outra mensagem.',
      });
    }

    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem inválida.',
      });
    }

    if (message.trim().length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem muito longa. Máximo de 500 caracteres.',
      });
    }

    // Validar estrutura do histórico
    const safeHistory = Array.isArray(history)
      ? history
          .filter(h => h && (h.role === 'user' || h.role === 'model') && Array.isArray(h.parts))
          .slice(-6) // máx. 3 trocas
      : [];

    // Chamar IA
    const aiResponse = await askSupportAI(message.trim(), safeHistory);

    // Log anónimo para análise futura (sem dados pessoais)
    console.log(`[SUPPORT_CHAT] user=${userId} | msg_len=${message.length} | resp_len=${aiResponse.length}`);

    return res.json({
      success: true,
      response: aiResponse,
    });

  } catch (error) {
    console.error('[SUPPORT_CHAT] Erro:', error.message);

    // Mensagem padrão em caso de falha da API
    return res.status(503).json({
      success: false,
      error: 'Serviço indisponível. Tente novamente mais tarde.',
    });
  }
});

/**
 * POST /api/support/tickets
 * Cria um ticket de suporte (formulário de contacto)
 * Body: { assunto, mensagem, tipo?, categoria?, gravidade? }
 */
router.post('/tickets', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded?.id || null;
      } catch {
        // token inválido — aceitar ticket anónimo
      }
    }

    const { assunto, mensagem } = req.body;

    if (!assunto || !mensagem) {
      return res.status(400).json({ success: false, error: 'Assunto e mensagem são obrigatórios.' });
    }

    const ticket = await TicketSuporte.create({
      usuario_id: userId,
      assunto: String(assunto).slice(0, 255),
      mensagem: String(mensagem).slice(0, 5000),
      status: 'aberto',
      prioridade: 'media',
    });

    return res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error('[SUPPORT_TICKET] Erro:', error.message);
    return res.status(500).json({ success: false, error: 'Erro ao criar ticket.' });
  }
});

export default router;
