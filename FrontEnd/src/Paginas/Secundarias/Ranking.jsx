import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Medal, Crown, ArrowLeft } from 'lucide-react';
import Layout from './Layout';
import socket from '../../socket';
import NivelBadge, { getNivelMeta } from '../../components/NivelBadge';

/* ─── Design tokens ──────────────────────────────────────────── */
const c = {
  primary:     '#4F6EF7',
  primarySoft: '#EEF1FE',
  surface:     '#FFFFFF',
  bg:          '#F7F8FC',
  border:      '#E8EAEF',
  text:        '#0F1117',
  muted:       '#6B7280',
  subtle:      '#9CA3AF',
  gold:        '#D97706',
  goldSoft:    '#FFFBEB',
  silver:      '#64748B',
  silverSoft:  '#F1F5F9',
  bronze:      '#92400E',
  bronzeSoft:  '#FFF7ED',
};

const card = {
  background: c.surface,
  borderRadius: 14,
  border: `1px solid ${c.border}`,
  boxShadow: '0 1px 3px rgba(15,17,23,0.05)',
};

/* ─── Position badge ─────────────────────────────────────────── */
function PosBadge({ pos }) {
  if (pos === 1) return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.goldSoft, border: '1.5px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Crown size={14} color={c.gold} />
    </div>
  );
  if (pos === 2) return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.silverSoft, border: '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Medal size={14} color={c.silver} />
    </div>
  );
  if (pos === 3) return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.bronzeSoft, border: '1.5px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Trophy size={14} color={c.bronze} />
    </div>
  );
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: c.muted }}>#{pos}</span>
    </div>
  );
}

/* ─── Avatar ─────────────────────────────────────────────────── */
function UserAvatar({ nome, imagem, size = 36 }) {
  const initials = (nome || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: c.primary, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
      {imagem
        ? <img src={imagem} alt={nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        : initials}
    </div>
  );
}

/* ─── Pulse indicator (live) ─────────────────────────────────── */
function LiveBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 999, padding: '2px 8px' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
      Ao vivo
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </span>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
const POLL_INTERVAL_MS = 15_000; // recarrega a cada 15 segundos

export default function Ranking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ranking, setRanking]                     = useState([]);
  const [tournament, setTournament]               = useState(null);
  const [loading, setLoading]                     = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(searchParams.get('tournament') || '');
  const [tournaments, setTournaments]             = useState([]);
  const [disciplinaFilter, setDisciplinaFilter]   = useState('');
  const [error, setError]                         = useState('');
  const [lastUpdated, setLastUpdated]             = useState(null);
  const [isLive, setIsLive]                       = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  // Refs para evitar closures stale no socket listener
  const selectedTournamentRef = useRef(selectedTournament);
  const disciplinaFilterRef   = useRef(disciplinaFilter);
  useEffect(() => { selectedTournamentRef.current = selectedTournament; }, [selectedTournament]);
  useEffect(() => { disciplinaFilterRef.current = disciplinaFilter; }, [disciplinaFilter]);

  /* ── Carregar lista de torneios ── */
  useEffect(() => {
    const load = async () => {
      setLoadingTournaments(true);
      try {
        const res  = await fetch(`${apiBase}/api/tournaments`);
        const data = await res.json();
        setTournaments(data.tournaments || []);
      } catch {
        setError('Não foi possível carregar a lista de torneios.');
      } finally {
        setLoadingTournaments(false);
      }
    };
    load();
  }, [apiBase]);

  /* ── Função de carregamento do ranking ── */
  const loadRanking = useCallback(async (tournamentId, disciplina, silent = false) => {
    if (!tournamentId) { setRanking([]); setTournament(null); return; }
    if (!silent) setLoading(true);
    setError('');
    try {
      const url = disciplina
        ? `${apiBase}/api/tournaments/${tournamentId}/ranking/${encodeURIComponent(disciplina)}?includeInactive=false`
        : `${apiBase}/api/tournaments/${tournamentId}/ranking?includeInactive=false`;

      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar ranking.');

      setRanking(data.ranking || []);
      setTournament(data.tournament || null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!silent) {
        setError(err.message || 'Erro ao carregar ranking.');
        setRanking([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [apiBase]);

  /* ── Carregar ranking quando torneio ou disciplina mudam ── */
  useEffect(() => {
    loadRanking(selectedTournament, disciplinaFilter);
  }, [selectedTournament, disciplinaFilter, loadRanking]);

  /* ── Polling automático a cada 15s ── */
  useEffect(() => {
    if (!selectedTournament) return;
    const interval = setInterval(() => {
      loadRanking(selectedTournamentRef.current, disciplinaFilterRef.current, true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selectedTournament, loadRanking]);

  /* ── Socket.io — atualização em tempo real ── */
  useEffect(() => {
    const handleRankingUpdate = (data) => {
      const currentTournament = selectedTournamentRef.current;
      const currentDisciplina = disciplinaFilterRef.current;

      // Só atualiza se for o torneio que está a ver
      if (!currentTournament || String(data.torneio_id) !== String(currentTournament)) return;

      // Se há filtro de disciplina, só atualiza se for a mesma disciplina
      if (currentDisciplina && data.disciplina && data.disciplina !== currentDisciplina) return;

      // Se o evento tem ranking completo, usa-o directamente (SEM recalcular posição)
      if (data.ranking && Array.isArray(data.ranking)) {
        // Usar as posições oficiais da API, nunca recalcular
        const filtered = currentDisciplina
          ? data.ranking.filter(p => p.disciplina_competida === currentDisciplina)
          : data.ranking;
        setRanking(filtered);  // ✅ Usar dados da API como estão
        setLastUpdated(new Date());
        setIsLive(true);
        setTimeout(() => setIsLive(false), 3000);
      } else {
        // Fallback: recarregar do servidor
        loadRanking(currentTournament, currentDisciplina, true);
      }
    };

    socket.on('ranking_update', handleRankingUpdate);
    return () => socket.off('ranking_update', handleRankingUpdate);
  }, [loadRanking]);

  const handleTournamentChange = (id) => {
    setSelectedTournament(id);
    setDisciplinaFilter('');
    navigate(`/ranking?tournament=${id}`);
  };

  /* ── Disciplinas únicas do ranking actual ── */
  const disciplinas = [...new Set(ranking.map(p => p.disciplina_competida).filter(Boolean))];

  /* ── Ranking filtrado (usa posições oficiais da API) ── */
  const filtered = disciplinaFilter
    ? ranking.filter(p => p.disciplina_competida === disciplinaFilter)
    : ranking;
  // ✅ NÃO recalcular posição — usar os dados exatos da API

  /* ── Posição do utilizador autenticado ── */
  const myEntry = user ? filtered.find(p => p.usuario_id === user.id || p.usuario?.id === user.id) : null;

  const inputStyle = {
    padding: '10px 14px', borderRadius: 9,
    border: `1px solid ${c.border}`, background: c.surface,
    color: c.text, fontSize: 14, outline: 'none',
    width: '100%', boxSizing: 'border-box', cursor: 'pointer',
  };

  return (
    <Layout>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 72px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: c.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={15} /> Voltar
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Ranking</h1>
            <p style={{ fontSize: 14, color: c.muted, margin: '4px 0 0' }}>Classificação dos participantes por torneio.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isLive && <LiveBadge />}
            {lastUpdated && (
              <span style={{ fontSize: 11, color: c.subtle }}>
                Atualizado às {lastUpdated.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* ── Seletor de torneio ── */}
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 220px' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Torneio</label>
              <select style={inputStyle} value={selectedTournament} onChange={e => handleTournamentChange(e.target.value)} disabled={loadingTournaments}>
                <option value="">
                  {loadingTournaments ? 'Carregando…' : 'Selecione um torneio'}
                </option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.titulo} — {t.status === 'finalizado' ? 'Finalizado' : t.status === 'ativo' ? 'Em andamento' : t.status === 'encerrando' ? 'Processando resultados' : t.status}
                  </option>
                ))}
              </select>
            </div>

            {disciplinas.length > 1 && (
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Disciplina</label>
                <select style={inputStyle} value={disciplinaFilter} onChange={e => setDisciplinaFilter(e.target.value)}>
                  <option value="">Todas</option>
                  {disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── Banner da posição do utilizador ── */}
        {myEntry && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 20px', borderRadius: 12,
            background: c.primarySoft, border: '1px solid #C7D2FE',
            fontSize: 14,
          }}>
            <PosBadge pos={myEntry.posicao} />
            <span style={{ color: c.primary, fontWeight: 600 }}>
              Você está em {myEntry.posicao}º lugar com {Number(myEntry.pontuacao || 0).toLocaleString('pt-BR')} pontos
            </span>
          </div>
        )}

        {/* ── Erro ── */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* ── Lista de ranking ── */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, gap: 12, color: c.muted, fontSize: 14 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${c.border}`, borderTopColor: c.primary, animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Carregando ranking…
          </div>
        ) : !selectedTournament ? (
          <div style={{ ...card, padding: 48, textAlign: 'center' }}>
            <Trophy size={32} color={c.subtle} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: c.muted }}>Selecione um torneio para ver o ranking.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...card, padding: 48, textAlign: 'center' }}>
            <Trophy size={32} color={c.subtle} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: c.muted }}>Nenhum participante encontrado para este torneio.</p>
          </div>
        ) : (
          <div style={{ ...card, overflow: 'hidden' }}>
            {/* Cabeçalho do torneio */}
            {tournament && (
              <div style={{ padding: '16px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>{tournament.titulo}</h2>
                  <p style={{ fontSize: 13, color: c.muted, margin: '2px 0 0' }}>
                    {filtered.length} participante{filtered.length !== 1 ? 's' : ''}
                    {disciplinaFilter ? ` · ${disciplinaFilter}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {tournament.status === 'ativo' && <LiveBadge />}
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                    background: tournament.status === 'ativo' ? '#ECFDF5' : c.bg,
                    color: tournament.status === 'ativo' ? '#065F46' : c.muted,
                    border: `1px solid ${tournament.status === 'ativo' ? '#A7F3D0' : c.border}`,
                  }}>
                    {tournament.status === 'ativo' ? 'Em andamento'
                      : tournament.status === 'finalizado' ? 'Finalizado'
                      : tournament.status === 'encerrando' ? 'Processando resultados'
                      : tournament.status}
                  </span>
                </div>
              </div>
            )}

            {/* Linhas do ranking */}
            {filtered.map((p, i) => {
              const isMe = user && (p.usuario_id === user.id || p.usuario?.id === user.id);
              const nome = p.usuario?.nome || 'Participante';

              return (
                <div
                  key={p.id || i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 24px',
                    borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none',
                    /* ── Destaque visual do utilizador autenticado ── */
                    background: isMe
                      ? 'linear-gradient(90deg, #EEF1FE 0%, #F5F7FF 100%)'
                      : i % 2 === 0 ? 'transparent' : '#FAFAFA',
                    boxShadow: isMe ? 'inset 4px 0 0 #4F6EF7' : 'none',
                    borderRadius: isMe ? 4 : 0,
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                >
                  <PosBadge pos={p.posicao} />

                  <UserAvatar nome={nome} imagem={p.usuario?.imagem} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14,
                      fontWeight: isMe ? 700 : 500,
                      color: isMe ? c.primary : c.text,
                      margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {nome}
                      {isMe && (
                        <span style={{
                          marginLeft: 8, fontSize: 11, fontWeight: 700,
                          background: c.primary, color: '#fff',
                          borderRadius: 999, padding: '1px 7px',
                          verticalAlign: 'middle',
                        }}>
                          você
                        </span>
                      )}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                      {p.disciplina_competida && !disciplinaFilter && (
                        <p style={{ fontSize: 12, color: c.muted, margin: 0 }}>{p.disciplina_competida}</p>
                      )}
                      {/* Badge de nível do participante */}
                      {p.usuario?.nivel_atual && (
                        <NivelBadge
                          nivelNumero={p.usuario.nivel_atual}
                          xpTotal={p.usuario.xp_total || 0}
                          compact
                        />
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: isMe ? c.primary : c.text }}>
                      {Number(p.pontuacao || 0).toLocaleString('pt-BR')} pts
                    </div>
                    {p.casos_resolvidos > 0 && (
                      <div style={{ fontSize: 12, color: c.muted }}>{p.casos_resolvidos} casos</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
