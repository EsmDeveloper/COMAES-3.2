/**
 * useSocketColaboradorStatus.js
 *
 * Hook customizado para escutar eventos de status do colaborador
 * Permite que o colaborador receba notificaÃ§Ã£o instantÃ¢nea quando:
 * - Sua solicitaÃ§Ã£o Ã© aprovada
 * - Sua solicitaÃ§Ã£o Ã© rejeitada
 *
 * Evento especÃ­fico: `colaborador_status_${userId}`
 */

import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 
                   import.meta.env.VITE_API_BASE_URL || 
                   `http://${window.location.hostname}:3001`;

let socket = null;

export const useSocketColaboradorStatus = ({
  userId = null,
  onAprovado = null,
  onRejeitado = null,
  enabled = true
}) => {
  
  const connect = useCallback(() => {
    if (!enabled || !userId || socket?.connected) return;
    
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
          console.log('âœ… Socket.IO conectado (status colaborador)');
        });

        socket.on('disconnect', () => {
          console.log('âŒ Socket.IO desconectado');
        });

        // Evento especÃ­fico para este colaborador
        socket.on(`colaborador_status_${userId}`, (data) => {
          console.log('ðŸ“¢ Status do colaborador atualizado:', data);
          
          if (data.status === 'aprovado') {
            console.log('âœ… Colaborador aprovado!');
            if (onAprovado) {
              onAprovado(data);
            }
          } else if (data.status === 'rejeitado') {
            console.log('âŒ Colaborador rejeitado!');
            if (onRejeitado) {
              onRejeitado(data);
            }
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
  }, [enabled, userId, onAprovado, onRejeitado]);

  const disconnect = useCallback(() => {
    if (socket?.connected) {
      socket.disconnect();
      socket = null;
      console.log('ðŸ”Œ Socket.IO desconectado');
    }
  }, []);

  useEffect(() => {
    if (enabled && userId) {
      connect();
    }
    return () => {
      // NÃ£o desconectar ao unmount para evitar reconexÃµes contÃ­nuas
    };
  }, [enabled, userId, connect]);

  return {
    connected: socket?.connected || false,
    disconnect,
    reconnect: connect
  };
};

export default useSocketColaboradorStatus;
