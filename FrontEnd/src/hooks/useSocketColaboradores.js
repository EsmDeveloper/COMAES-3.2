/**
 * useSocketColaboradores.js
 *
 * Hook customizado para escutar eventos de Socket.IO relacionados a colaboradores
 * Permite que o admin receba atualizaçÃµes em tempo real sem fazer polling
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
                   `http://${window.location.hostname}:3002`;

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

        // Eventos de conexão
        socket.on('connect', () => {
          console.log('âœ… Socket.IO conectado (colaboradores)');
        });

        socket.on('disconnect', () => {
          console.log('âŒ Socket.IO desconectado');
        });

        // Evento: Novo colaborador pendente
        socket.on('novo_colaborador_pendente', (data) => {
          console.log(' Novo colaborador pendente:', data);
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
          console.log('âŒ Colaborador rejeitado:', data);
          if (onRejeitado) {
            onRejeitado(data);
          }
        });

        // Evento: Colaborador suspenso
        socket.on('colaborador_suspenso', (data) => {
          console.log(' Colaborador suspenso:', data);
          if (onSuspenso) {
            onSuspenso(data);
          }
        });

        // Evento: Atualização geral de colaboradores
        socket.on('atualizacao_colaboradores', (data) => {
          console.log(' Atualização de colaboradores:', data);
          if (onAtualizacao) {
            onAtualizacao(data);
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
  }, [enabled, onNovoColaborador, onAprovado, onRejeitado, onSuspenso, onAtualizacao]);

  const disconnect = useCallback(() => {
    if (socket?.connected) {
      socket.disconnect();
      socket = null;
      console.log(' Socket.IO desconectado');
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      // Não desconectar ao unmount para evitar reconexÃµes contínuas
      // A desconexão manual pode ser chamada quando necessário
    };
  }, [enabled, connect]);

  return {
    connected: socket?.connected || false,
    disconnect,
    reconnect: connect
  };
};

export default useSocketColaboradores;

