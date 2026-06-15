/**
 * useSocketColaboradores.js
 *
 * Hook customizado para escutar eventos de Socket.IO relacionados a colaboradores
 * Permite que o admin receba atualizaÃ§Ãµes em tempo real sem fazer polling
 *
 * Eventos:
 * - novo_colaborador_pendente: Um novo colaborador se registou
 * - colaborador_aprovado: Um colaborador foi aprovado
 * - colaborador_rejeitado: Um colaborador foi rejeitado
 * - atualizacao_colaboradores: Lista de colaboradores foi atualizada
 */

import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 
                   import.meta.env.VITE_API_BASE_URL || 
                   `http://${window.location.hostname}:3001`;

let socket = null;

export const useSocketColaboradores = ({
  onNovoColaborador = null,
  onAprovado = null,
  onRejeitado = null,
  onSuspenso = null,
  onAtualizacao = null,
  enabled = true
}) => {
  
  const connect = useCallback(() => {
    if (!enabled || socket?.connected) return;
    
    try {
      if (!socket) {
        socket = io(SOCKET_URL, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling']
        });

        // Eventos de conexÃ£o
        socket.on('connect', () => {
          console.log('âœ… Socket.IO conectado (colaboradores)');
        });

        socket.on('disconnect', () => {
          console.log('âŒ Socket.IO desconectado');
        });

        // Evento: Novo colaborador pendente
        socket.on('novo_colaborador_pendente', (data) => {
          console.log('ðŸ“¢ Novo colaborador pendente:', data);
          if (onNovoColaborador) {
            onNovoColaborador(data);
          }
        });

        // Evento: Colaborador aprovado
        socket.on('colaborador_aprovado', (data) => {
          console.log('âœ… Colaborador aprovado:', data);
          if (onAprovado) {
            onAprovado(data);
          }
        });

        // Evento: Colaborador rejeitado
        socket.on('colaborador_rejeitado', (data) => {
          console.log('âŒ Colaborador rejeitado:', data);
          if (onRejeitado) {
            onRejeitado(data);
          }
        });

        // Evento: Colaborador suspenso
        socket.on('colaborador_suspenso', (data) => {
          console.log('ðŸš« Colaborador suspenso:', data);
          if (onSuspenso) {
            onSuspenso(data);
          }
        });

        // Evento: AtualizaÃ§Ã£o geral de colaboradores
        socket.on('atualizacao_colaboradores', (data) => {
          console.log('ðŸ”„ AtualizaÃ§Ã£o de colaboradores:', data);
          if (onAtualizacao) {
            onAtualizacao(data);
          }
        });

        // Tratamento de erros
        socket.on('error', (error) => {
          console.error('âŒ Erro Socket.IO:', error);
        });
      }
    } catch (err) {
      console.error('Erro ao conectar Socket.IO:', err);
    }
  }, [enabled, onNovoColaborador, onAprovado, onRejeitado, onSuspenso, onAtualizacao]);

  const disconnect = useCallback(() => {
    if (socket?.connected) {
      socket.disconnect();
      socket = null;
      console.log('ðŸ”Œ Socket.IO desconectado');
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      // NÃ£o desconectar ao unmount para evitar reconexÃµes contÃ­nuas
      // A desconexÃ£o manual pode ser chamada quando necessÃ¡rio
    };
  }, [enabled, connect]);

  return {
    connected: socket?.connected || false,
    disconnect,
    reconnect: connect
  };
};

export default useSocketColaboradores;
