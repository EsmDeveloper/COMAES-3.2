/**
 * useStreak.js — Hook para carregar e atualizar a sequência de aprendizagem
 *
 * Uso:
 *   const { streak, maximo, ativa, loading, registar } = useStreak();
 *   // Chamar registar() após qualquer atividade educativa para atualizar o streak
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

export default function useStreak() {
  const { user, token } = useAuth();

  const [streak, setStreak]   = useState(0);
  const [maximo, setMaximo]   = useState(0);
  const [ativa, setAtiva]     = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /* ── Buscar streak atual ── */
  const fetchStreak = useCallback(async () => {
    if (!user?.id || !token) return;

    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/api/usuarios/me/streak`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao obter streak');

      setStreak(data.data.streak_atual  || 0);
      setMaximo(data.data.streak_maximo || 0);
      setAtiva(data.data.ativa          || false);
      setMensagem(data.data.mensagem    || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  /* ── Registar atividade e obter streak actualizado ── */
  const registar = useCallback(async () => {
    if (!user?.id || !token) return null;

    try {
      const res  = await fetch(`${API}/api/usuarios/atividade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) return null;

      // Atualizar estado local imediatamente
      setStreak(data.data.streak_atual  || 0);
      setMaximo(data.data.streak_maximo || 0);
      setAtiva(true);
      setMensagem(data.message || '');

      return data;
    } catch {
      return null;
    }
  }, [user?.id, token]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { streak, maximo, ativa, mensagem, loading, error, fetchStreak, registar };
}
