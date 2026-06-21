/**
 * useSocketColaboradorStatus.js
 *
 * Hook customizado para escutar eventos de status do colaborador
 * Permite que o colaborador receba notificação instantânea quando:
 * - Sua solicitação é aprovada
 * - Sua solicitação é rejeitada
 *
 * Evento específico: `colaborador_status_${userId}`
 */

import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 
                   import.meta.env.VITE_API_BASE_URL || 
                   `http://${window.location.hostname}:3002`;

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

        // Eventos de conexão
        socket.on('connect', () => {
          console.log('âœ… Socket.IO conectado (status colaborador)');
        });

        socket.on('disconnect', () => {
          console.log('âŒ Socket.IO desconectado');
        });

        // Evento específico para este colaborador
        socket.on(`colaborador_status_${userId}`, (data) => {
          console.log(' Status do colaborador atualizado:', data);
          
          if (data.status === 'aprovado') {
            console.log('âœ… Colaborador aprovado!');
            if (onAprovado) {
              onAprovado(data);
            }
          } else if (data.status === 'rejeitado') {
            console.log('âŒ Colaborador rejeitado!');
            if (onRejeitado) {
              onRejeitado(data);
            }
          }
        });

        // Tratamento de erros
        socket.on('error', (error) => {
          console.error('âŒ Erro Socket.IO:', error);
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
      console.log(' Socket.IO desconectado');
    }
  }, []);

  useEffect(() => {
    if (enabled && userId) {
      connect();
    }
    return () => {
      // Não desconectar ao unmount para evitar reconexÃµes contínuas
    };
  }, [enabled, userId, connect]);

  return {
    connected: socket?.connected || false,
    disconnect,
    reconnect: connect
  };
};

export default useSocketColaboradorStatus;

