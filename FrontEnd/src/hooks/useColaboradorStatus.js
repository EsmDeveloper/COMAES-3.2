import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para gerenciar o status de colaborador
 * Retorna o status atual e monitoriza mudanças
 */
export const useColaboradorStatus = () => {
  const { user, token } = useAuth();
  const [status, setStatus] = useState(user?.status_colaborador || null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [error, setError] = useState(null);

  // Função para verificar o status atual
  const checkStatus = async () => {
    if (!token || !user) return;

    try {
      setIsLoadingStatus(true);
      setError(null);

      const response = await fetch('/api/usuarios/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setStatus(userData.status_colaborador || null);
        return userData.status_colaborador;
      } else {
        throw new Error('Erro ao verificar status');
      }
    } catch (err) {
      setError(err.message);
      console.error('Erro ao verificar status do colaborador:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Monitorizar status ao inicializar
  useEffect(() => {
    checkStatus();
  }, [user, token]);

  return {
    status,
    isLoadingStatus,
    error,
    checkStatus,
    isPending: status === 'pendente',
    isApproved: status === 'aprovado',
    isRejected: status === 'rejeitado'
  };
};
