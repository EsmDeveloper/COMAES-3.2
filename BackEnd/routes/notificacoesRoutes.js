import express from 'express';
import Notificacao from '../models/Notificacao.js';
import Usuario from '../models/User.js';
import { auth, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

/**
 * GET /notificacoes/usuario/:usuarioId
 * Buscar todas as notificações de um usuário
 */
router.get('/usuario/:usuarioId', auth, async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    // Validar que o usuário só pode ver suas próprias notificações
    if (String(req.user.id) !== String(usuarioId) && req.user.tipo !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    const notificacoes = await Notificacao.findAll({
      where: { usuario_id: usuarioId },
      order: [['criado_em', 'DESC']],
      limit: 100
    });

    res.json({ success: true, data: notificacoes });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /notificacoes/usuario/:usuarioId/nao-lidas
 * Buscar notificações não lidas de um usuário
 */
router.get('/usuario/:usuarioId/nao-lidas', auth, async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    if (String(req.user.id) !== String(usuarioId) && req.user.tipo !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    const notificacoes = await Notificacao.findAll({
      where: { usuario_id: usuarioId, lido: false },
      order: [['criado_em', 'DESC']],
      limit: 50
    });

    res.json({ success: true, data: notificacoes });
  } catch (error) {
    console.error('Erro ao buscar notificações não lidas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /notificacoes/usuario/:usuarioId/nao-lidas/count
 * Contar notificações não lidas
 */
router.get('/usuario/:usuarioId/nao-lidas/count', auth, async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    if (String(req.user.id) !== String(usuarioId) && req.user.tipo !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    const count = await Notificacao.count({
      where: { usuario_id: usuarioId, lido: false }
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error('Erro ao contar notificações:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /notificacoes/:id/lido
 * Marcar uma notificação como lida
 */
router.patch('/:id/lido', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const notificacao = await Notificacao.findByPk(id);

    if (!notificacao) {
      return res.status(404).json({ success: false, error: 'Notificação não encontrada.' });
    }

    // Validar propriedade
    if (String(notificacao.usuario_id) !== String(req.user.id) && req.user.tipo !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    await notificacao.update({ 
      lido: true, 
      lido_em: new Date() 
    });

    res.json({ success: true, message: 'Notificação marcada como lida.', data: notificacao });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /notificacoes/:id/nao-lido
 * Marcar uma notificação como não lida
 */
router.patch('/:id/nao-lido', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const notificacao = await Notificacao.findByPk(id);

    if (!notificacao) {
      return res.status(404).json({ success: false, error: 'Notificação não encontrada.' });
    }

    if (String(notificacao.usuario_id) !== String(req.user.id) && req.user.tipo !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    await notificacao.update({ 
      lido: false, 
      lido_em: null 
    });

    res.json({ success: true, message: 'Notificação marcada como não lida.', data: notificacao });
  } catch (error) {
    console.error('Erro ao marcar notificação como não lida:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /notificacoes/usuario/:usuarioId/lido-todas
 * Marcar todas as notificações como lidas
 */
router.patch('/usuario/:usuarioId/lido-todas', auth, async (req, res) => {
  try {
    const { usuarioId } = req.params;

    if (String(req.user.id) !== String(usuarioId) && req.user.tipo !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    await Notificacao.update(
      { lido: true, lido_em: new Date() },
      { where: { usuario_id: usuarioId, lido: false } }
    );

    res.json({ success: true, message: 'Todas as notificações foram marcadas como lidas.' });
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /notificacoes
 * Criar notificação (admin)
 */
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { usuario_id, usuarios_ids, tipo = 'geral', titulo, mensagem, todos = false, extras = {} } = req.body;

    // Validações
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ success: false, error: 'Título é obrigatório.' });
    }

    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({ success: false, error: 'Mensagem é obrigatória.' });
    }

    // Criar para todos os usuários
    if (todos) {
      const users = await Usuario.findAll({ attributes: ['id'] });
      if (!users.length) {
        return res.status(400).json({ success: false, error: 'Nenhum usuário encontrado.' });
      }

      const payload = users.map(user => ({
        usuario_id: user.id,
        tipo,
        conteudo: JSON.stringify({
          titulo: titulo.trim(),
          mensagem: mensagem.trim(),
          ...extras
        }),
        lido: false
      }));

      await Notificacao.bulkCreate(payload);
      return res.status(201).json({ 
        success: true, 
        message: `${payload.length} notificações criadas com sucesso.`,
        count: payload.length
      });
    }

    // Criar para usuários específicos
    if (usuarios_ids && Array.isArray(usuarios_ids) && usuarios_ids.length > 0) {
      const payload = usuarios_ids.map(uid => ({
        usuario_id: uid,
        tipo,
        conteudo: JSON.stringify({
          titulo: titulo.trim(),
          mensagem: mensagem.trim(),
          ...extras
        }),
        lido: false
      }));

      await Notificacao.bulkCreate(payload);
      return res.status(201).json({ 
        success: true, 
        message: `${payload.length} notificações criadas com sucesso.`,
        count: payload.length
      });
    }

    // Criar para um usuário específico
    if (usuario_id) {
      const usuario = await Usuario.findByPk(usuario_id);
      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
      }

      const notificacao = await Notificacao.create({
        usuario_id,
        tipo,
        conteudo: JSON.stringify({
          titulo: titulo.trim(),
          mensagem: mensagem.trim(),
          ...extras
        }),
        lido: false
      });

      return res.status(201).json({ 
        success: true, 
        message: 'Notificação criada com sucesso.',
        data: notificacao 
      });
    }

    res.status(400).json({ 
      success: false, 
      error: 'Especifique usuario_id, usuarios_ids ou todos=true.' 
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /notificacoes/:id
 * Deletar uma notificação
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const notificacao = await Notificacao.findByPk(id);

    if (!notificacao) {
      return res.status(404).json({ success: false, error: 'Notificação não encontrada.' });
    }

    // Apenas admin ou o próprio usuário pode deletar
    if (String(notificacao.usuario_id) !== String(req.user.id) && req.user.tipo !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    await notificacao.destroy();
    res.json({ success: true, message: 'Notificação deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /notificacoes/usuario/:usuarioId/todas
 * Deletar todas as notificações de um usuário
 */
router.delete('/usuario/:usuarioId/todas', auth, async (req, res) => {
  try {
    const { usuarioId } = req.params;

    if (String(req.user.id) !== String(usuarioId) && req.user.tipo !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    const result = await Notificacao.destroy({
      where: { usuario_id: usuarioId }
    });

    res.json({ 
      success: true, 
      message: `${result} notificações deletadas com sucesso.`,
      count: result
    });
  } catch (error) {
    console.error('Erro ao deletar notificações:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /notificacoes/stats
 * Estatísticas de notificações (admin)
 */
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const total = await Notificacao.count();
    const naoLidas = await Notificacao.count({ where: { lido: false } });
    const lidas = await Notificacao.count({ where: { lido: true } });

    const porTipo = await Notificacao.findAll({
      attributes: ['tipo', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['tipo'],
      raw: true
    });

    res.json({ 
      success: true, 
      data: {
        total,
        naoLidas,
        lidas,
        porTipo
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
