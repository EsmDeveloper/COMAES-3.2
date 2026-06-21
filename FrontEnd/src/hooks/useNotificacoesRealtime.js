/**
 * useNotificacoesRealtime.js
 * 
 * Hook customizado para escutar notificações em tempo real via Socket.IO
 * Permite que o colaborador receba notificações instantaneamente
 * 
 * Evento específico: `notificacao:{userId}`
 */

import { useEffect, useCallback, useRef } from 'react';
import socket from '../socket';

export const useNotificacoesRealtime = ({
  userId = null,
  onNovaNotificacao = null,
  enabled = true
}) => {
  
  const listenerSetupRef = useRef(false);
  
  const setupListener = useCallback(() => {
    if (!enabled || !userId) return;
    
    // Evitar configurar listener múltiplas vezes
    if (listenerSetupRef.current) {
      console.log('[INFO] Listener já está configurado, ignorando duplicata');
      return;
    }
    
    try {
      // Evento específico para este usuário
      const eventName = `notificacao:${userId}`;
      
      console.log(`[SETUP] Configurando listener para: ${eventName}`);
      
      // Remover listener anterior se existir (evitar duplicatas)
      socket.off(eventName);
      
      // Configurar novo listener
      socket.on(eventName, (notificacao) => {
        console.log(`[NOTIFICATION] Notificação recebida via Socket.IO:`, notificacao);
        
        if (onNovaNotificacao && typeof onNovaNotificacao === 'function') {
          onNovaNotificacao(notificacao);
        }
      });
      
      listenerSetupRef.current = true;
      console.log(`[SUCCESS] Listener configurado com sucesso para ${eventName}`);
      
      return () => {
        // Cleanup: remover listener
        socket.off(eventName);
        listenerSetupRef.current = false;
      };
    } catch (error) {
      console.error('[ERROR] Erro ao configurar listener de notificações:', error);
    }
  }, [userId, enabled, onNovaNotificacao]);

  useEffect(() => {
    setupListener();
  }, [setupListener]);
};

export default useNotificacoesRealtime;
