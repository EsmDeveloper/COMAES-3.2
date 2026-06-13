/**
 * socketService.js
 * Serviço centralizado para gerenciar Socket.IO
 */

let io = null;

/**
 * Inicializar instância do Socket.IO
 */
export const setIO = (ioInstance) => {
  io = ioInstance;
  console.log('✅ Socket.IO registrado no socketService');
};

/**
 * Obter instância do Socket.IO
 */
export const getIO = () => {
  return io;
};

/**
 * Emitir notificação para um usuário específico
 */
export const emitNotificacao = (usuarioId, notificacao) => {
  if (io) {
    io.emit(`notificacao:${usuarioId}`, notificacao);
    console.log(`📡 Notificação emitida via Socket.IO para usuário ${usuarioId}`);
    return true;
  }
  console.warn('⚠️ Socket.IO não disponível - notificação não emitida');
  return false;
};

/**
 * Emitir notificações para múltiplos usuários
 */
export const emitNotificacoes = (notificacoes) => {
  if (!io) {
    console.warn('⚠️ Socket.IO não disponível - notificações não emitidas');
    return false;
  }

  let count = 0;
  notificacoes.forEach(notif => {
    // conteudo já é objeto (DataTypes.JSON), não precisa de JSON.parse
    const conteudo = typeof notif.conteudo === 'string' 
      ? (() => { try { return JSON.parse(notif.conteudo); } catch { return { mensagem: notif.conteudo }; } })()
      : notif.conteudo;

    io.emit(`notificacao:${notif.usuario_id}`, {
      id: notif.id,
      tipo: notif.tipo,
      conteudo,
      lido: notif.lido,
      criado_em: notif.criado_em
    });
    count++;
  });

  console.log(`📡 ${count} notificações emitidas via Socket.IO`);
  return true;
};

/**
 * Emitir evento de novo colaborador pendente para todos os admins
 * Usado quando um colaborador envia uma nova candidatura
 */
export const emitNovoColaboradorPendente = (colaboradorData) => {
  if (io) {
    io.emit('novo_colaborador_pendente', {
      id: colaboradorData.id,
      nome: colaboradorData.nome,
      email: colaboradorData.email,
      username: colaboradorData.username,
      timestamp: new Date().toISOString()
    });
    console.log(`📡 Evento 'novo_colaborador_pendente' emitido para ${colaboradorData.nome}`);
    return true;
  }
  console.warn('⚠️ Socket.IO não disponível - evento não emitido');
  return false;
};

/**
 * Emitir evento de atualização de lista de colaboradores para admins
 * Usado quando status de colaborador muda (aprovado/rejeitado)
 */
export const emitAtualizacaoColaboradores = (dados) => {
  if (io) {
    io.emit('atualizacao_colaboradores', {
      ...dados,
      timestamp: new Date().toISOString()
    });
    console.log(`📡 Evento 'atualizacao_colaboradores' emitido`);
    return true;
  }
  console.warn('⚠️ Socket.IO não disponível - evento não emitido');
  return false;
};
