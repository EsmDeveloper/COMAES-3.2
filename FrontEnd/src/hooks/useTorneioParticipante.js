/**
 * useTorneioParticipante
 *
 * Hook partilhado pelas trÃªs pÃ¡ginas de torneio (MatemÃ¡tica, InglÃªs, ProgramaÃ§Ã£o).
 *
 * Garante:
 *  1. Registo imediato do participante ao entrar (mesmo com 0 pontos)
 *  2. Aparecimento instantÃ¢neo no ranking local antes da resposta do servidor
 *  3. SincronizaÃ§Ã£o via socket (ranking_update) com fallback de polling a 15 s
 *  4. PosiÃ§Ãµes sempre calculadas localmente â€” nunca null/0/9999
 *  5. Compatibilidade com disciplinas acentuadas (MatemÃ¡tica, InglÃªs, ProgramaÃ§Ã£o)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../socket';

const API = () =>
  import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

// ---------------------------------------------------------------------------
// NormalizaÃ§Ã£o de disciplina â€” espelha o normalizeDisciplina do backend
// ---------------------------------------------------------------------------
function normalizarDisciplina(raw) {
  if (!raw) return '';
  const s = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (s === 'matematica') return 'MatemÃ¡tica';
  if (s === 'programacao') return 'ProgramaÃ§Ã£o';
  if (s === 'ingles' || s === 'lingua inglesa') return 'InglÃªs';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ---------------------------------------------------------------------------
// CÃ¡lculo de posiÃ§Ãµes locais â€” nunca devolve null/0/9999
// ---------------------------------------------------------------------------
export function calcularPosicoesLocais(lista) {
  if (!lista || lista.length === 0) return [];
  const resultado = [];
  let posAtual = 1;
  for (let i = 0; i < lista.length; i++) {
    if (i > 0 && parseFloat(lista[i].pontuacao || 0) === parseFloat(lista[i - 1].pontuacao || 0)) {
      resultado.push({ ...lista[i], posicao: resultado[i - 1].posicao });
    } else {
      resultado.push({ ...lista[i], posicao: posAtual });
    }
    posAtual++;
  }
  return resultado;
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------
export default function useTorneioParticipante({ disciplina, disciplinaSlug, user, token }) {
  const [torneio, setTorneio]               = useState(null);
  const [participante, setParticipante]     = useState(null);
  const [ranking, setRanking]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [torneioFinalizado, setTorneioFinalizado] = useState(false);
  const [dentroDoPeriodo, setDentroDoPeriodo]     = useState(false);

  const torneioRef    = useRef(null);
  const pollingRef    = useRef(null);
  const registradoRef = useRef(false); // evita duplo registo em StrictMode

  // â”€â”€ disciplina normalizada (usada para comparar eventos do socket) â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const disciplinaNorm = normalizarDisciplina(disciplina);

  // â”€â”€ ordenar + calcular posiÃ§Ãµes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const normalizarRanking = useCallback((lista) => {
    if (!Array.isArray(lista) || lista.length === 0) return [];
    const ordenada = [...lista].sort((a, b) => {
      const diff = parseFloat(b.pontuacao || 0) - parseFloat(a.pontuacao || 0);
      return diff !== 0 ? diff : new Date(a.entrou_em) - new Date(b.entrou_em);
    });
    return calcularPosicoesLocais(ordenada);
  }, []);

  // â”€â”€ buscar ranking do servidor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const buscarRanking = useCallback(async () => {
    const tid = torneioRef.current?.id;
    if (!tid) return;
    try {
      const res  = await fetch(`${API()}/api/participantes/ranking/${disciplinaSlug}`);
      const data = await res.json();
      if (data.success) {
        setRanking(normalizarRanking(data.data || []));
      }
    } catch (err) {
      console.error(`[useTorneioParticipante] buscarRanking (${disciplina}):`, err);
    }
  }, [disciplina, disciplinaSlug, normalizarRanking]);

  // â”€â”€ adicionar participante ao ranking local imediatamente â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const adicionarAoRankingLocal = useCallback((dadosParticipante, dadosUsuario) => {
    setRanking(prev => {
      // NÃ£o duplicar
      const jaExiste = prev.some(
        p => p.usuario_id === dadosParticipante.usuario_id || p.id === dadosParticipante.id
      );
      if (jaExiste) return prev;

      const novoItem = {
        ...dadosParticipante,
        pontuacao: dadosParticipante.pontuacao ?? 0,
        usuario: dadosUsuario || dadosParticipante.usuario || { id: dadosParticipante.usuario_id, nome: '...' },
      };
      return normalizarRanking([...prev, novoItem]);
    });
  }, [normalizarRanking]);

  // â”€â”€ registar participante â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const registrarParticipante = useCallback(async (userId, torneioId) => {
    if (registradoRef.current) return;
    registradoRef.current = true;

    try {
      // InserÃ§Ã£o optimista: adicionar ao ranking local antes da resposta
      const placeholderUsuario = {
        id: userId,
        nome: user?.nome || user?.displayName || '...',
        imagem: user?.imagem || null,
        email: user?.email || null,
      };
      const placeholderParticipante = {
        id: `temp-${userId}`,
        usuario_id: userId,
        torneio_id: torneioId,
        disciplina_competida: disciplinaNorm,
        pontuacao: 0,
        casos_resolvidos: 0,
        status: 'confirmado',
        entrou_em: new Date().toISOString(),
        usuario: placeholderUsuario,
      };
      adicionarAoRankingLocal(placeholderParticipante, placeholderUsuario);

      const res  = await fetch(`${API()}/api/participantes/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ id_usuario: userId, disciplina_competida: disciplina }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setParticipante(data.data);
        // Substituir placeholder pelo registo real
        setRanking(prev => {
          const semPlaceholder = prev.filter(p => p.id !== `temp-${userId}`);
          const jaReal = semPlaceholder.some(p => p.usuario_id === userId || p.id === data.data.id);
          if (jaReal) return normalizarRanking(semPlaceholder);
          return normalizarRanking([...semPlaceholder, { ...data.data, pontuacao: data.data.pontuacao ?? 0 }]);
        });
      } else {
        // Remover placeholder em caso de erro
        setRanking(prev => normalizarRanking(prev.filter(p => p.id !== `temp-${userId}`)));
        registradoRef.current = false;
      }

      // Rebuscar ranking do servidor para garantir consistÃªncia
      await buscarRanking();
    } catch (err) {
      console.error(`[useTorneioParticipante] registrarParticipante:`, err);
      setRanking(prev => normalizarRanking(prev.filter(p => p.id !== `temp-${userId}`)));
      registradoRef.current = false;
    }
  }, [disciplina, disciplinaNorm, token, user, adicionarAoRankingLocal, normalizarRanking, buscarRanking]);

  // â”€â”€ buscar dados do utilizador (ou registar se nÃ£o existir) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const buscarDadosUsuario = useCallback(async (torneioId, userId) => {
    try {
      const res  = await fetch(`${API()}/api/participantes/usuario/${userId}/${disciplinaSlug}`);
      const data = await res.json();

      if (data.success && data.data) {
        setParticipante(data.data);
        // Garantir que estÃ¡ no ranking local
        adicionarAoRankingLocal(data.data, data.data.usuario);
      } else if (res.status === 404) {
        await registrarParticipante(userId, torneioId);
      }
    } catch (err) {
      console.error(`[useTorneioParticipante] buscarDadosUsuario:`, err);
    }
  }, [disciplinaSlug, registrarParticipante, adicionarAoRankingLocal]);

  // â”€â”€ inicializaÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let cancelled = false;
    registradoRef.current = false;

    const init = async () => {
      try {
        const res  = await fetch(`${API()}/api/torneios/ativo`);
        const data = await res.json();
        if (cancelled) return;

        if (data.ativo && data.torneio) {
          const t = data.torneio;
          setTorneio(t);
          torneioRef.current = t;

          const agora  = new Date();
          const fim    = new Date(t.termina_em);
          const inicio = new Date(t.inicia_em);
          if (agora > fim) {
            setTorneioFinalizado(true);
            setDentroDoPeriodo(false);
          } else if (agora >= inicio) {
            setDentroDoPeriodo(true);
          }

          // 1. Ranking existente primeiro (mostra participantes actuais imediatamente)
          await buscarRanking();

          // 2. Registar/verificar o utilizador actual
          if (user?.id) {
            await buscarDadosUsuario(t.id, user.id);
          }
        } else {
          setError(data.message || 'Nenhum torneio ativo no momento.');
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`[useTorneioParticipante] init:`, err);
          setError('Erro ao conectar com o servidor. Tente novamente.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // â”€â”€ socket + polling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!torneio) return;

    const handleRankingUpdate = (payload) => {
      try {
        if (payload?.torneio_id !== torneio.id) return;
        // Comparar disciplinas normalizadas para evitar problemas de encoding
        const payloadDisc = normalizarDisciplina(payload?.disciplina || '');
        if (payloadDisc !== disciplinaNorm) return;
        setRanking(normalizarRanking(payload.ranking || []));
      } catch (e) {
        console.warn('[useTorneioParticipante] ranking_update error', e);
      }
    };

    const handleTournamentFinished = (payload) => {
      if (payload?.id !== torneio?.id) return;
      if (payload?.status === 'encerrando') {
        setTorneio(prev => ({ ...prev, status: 'encerrando' }));
        setDentroDoPeriodo(false);
      } else {
        setTorneio(prev => ({ ...prev, status: 'finalizado' }));
        setDentroDoPeriodo(false);
        setTorneioFinalizado(true);
      }
    };

    socket.on('ranking_update', handleRankingUpdate);
    socket.on('tournament_finished', handleTournamentFinished);

    // Polling a cada 15 s â€” garante sincronizaÃ§Ã£o mesmo sem socket
    pollingRef.current = setInterval(buscarRanking, 15_000);

    return () => {
      socket.off('ranking_update', handleRankingUpdate);
      socket.off('tournament_finished', handleTournamentFinished);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [torneio, disciplinaNorm, normalizarRanking, buscarRanking]);

  // â”€â”€ actualizar participante apÃ³s avaliaÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const actualizarParticipante = useCallback((novoParticipante) => {
    if (!novoParticipante) return;
    setParticipante(novoParticipante);
    setRanking(prev => {
      const lista = prev.map(p =>
        (p.usuario_id === novoParticipante.usuario_id || p.id === novoParticipante.id)
          ? { ...p, ...novoParticipante }
          : p
      );
      return normalizarRanking(lista);
    });
  }, [normalizarRanking]);

  return {
    torneio,
    participante,
    ranking,
    loading,
    error,
    torneioFinalizado,
    dentroDoPeriodo,
    buscarRanking,
    actualizarParticipante,
    setTorneio,
    setDentroDoPeriodo,
    setTorneioFinalizado,
  };
}

