/**
 * useNivel.js â€” Hook para carregar e cache do nível do utilizador autenticado
 *
 * Uso:
 *   const { nivel, loading, xpTotal, progresso, refetch } = useNivel();
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_BASE_URL || '';

export default function useNivel() {
  const { user, token } = useAuth();

  const [nivel, setNivel]         = useState(null);   // objeto do nível actual da API
  const [xpTotal, setXpTotal]     = useState(0);
  const [progresso, setProgresso] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchNivel = useCallback(async () => {
    if (!user?.id || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res  = await fetch(`${API}/api/usuarios/me/nivel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao obter nível');
      }

      setNivel(data.data.nivel_info);
      setXpTotal(data.data.xp_total || 0);
      setProgresso(data.data.progresso);
    } catch (err) {
      setError(err.message);
      // Fallback silencioso â€” usa dados do user local se disponíveis
      if (user?.nivel_atual) {
        setNivel({ numero: user.nivel_atual });
        setXpTotal(user.xp_total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    fetchNivel();
  }, [fetchNivel]);

  return { nivel, xpTotal, progresso, loading, error, refetch: fetchNivel };
}

