import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy, Medal, Crown, ArrowLeft, Users, Calendar,
  Clock, Filter, RefreshCw, ChevronUp, ChevronDown,
  CheckCircle, AlertCircle, Minus
} from 'lucide-react';
import Layout from './Layout';
import socket from '../../socket';

/* â”€â”€â”€ Tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const tk = {
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
  success:     '#059669',
  successSoft: '#ECFDF5',
  warn:        '#D97706',
  warnSoft:    '#FFFBEB',
};

const card = {
  background: tk.surface,
  borderRadius: 14,
  border: `1px solid ${tk.border}`,
  boxShadow: '0 1px 4px rgba(15,17,23,0.06)',
};

const POLL_MS = 12_000;

/* â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : 'â€”';

const fmtTime = (secs) => {
  if (!secs || secs === 0) return 'â€”';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const disciplinaColor = (d) => ({
  'MatemÃ¡tica':  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'InglÃªs':      { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  'ProgramaÃ§Ã£o': { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' },
}[d] || { bg: tk.bg, text: tk.muted, border: tk.border });

/* â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PosBadge({ pos }) {
  if (pos === 1) return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: tk.goldSoft, border: '2px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Crown size={16} color={tk.gold} />
    </div>
  );
  if (pos === 2) return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: tk.silverSoft, border: '2px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Medal size={16} color={tk.silver} />
    </div>
  );
  if (pos === 3) return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: tk.bronzeSoft, border: '2px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Trophy size={16} color={tk.bronze} />
    </div>
  );
  if (!pos) return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F9FAFB', border: `1px solid ${tk.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Minus size={14} color={tk.subtle} />
    </div>
  );
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: tk.bg, border: `1px solid ${tk.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: tk.muted }}>#{pos}</span>
    </div>
  );
}

function Avatar({ nome, imagem, size = 38, ring = false }) {
  const initials = (nome || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: tk.primary,
      overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff',
      boxShadow: ring ? `0 0 0 3px ${tk.primary}, 0 0 0 5px ${tk.primarySoft}` : 'none',
    }}>
      {imagem
        ? <img src={imagem} alt={nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        : initials}
    </div>
  );
}

function LiveBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 999, padding: '3px 10px' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'livePulse 1.4s ease-in-out infinite' }} />
      Ao vivo
      <style>{`@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}`}</style>
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    ativo:       { label: 'Em andamento', bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
    finalizado:  { label: 'Finalizado',   bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
    encerrando:  { label: 'Processando',  bg: '#FFFBEB', color: '#92400E', border: '#FCD34D' },
    agendado:    { label: 'Agendado',     bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    rascunho:    { label: 'Rascunho',     bg: tk.bg,     color: tk.muted,  border: tk.border  },
    cancelado:   { label: 'Cancelado',    bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  };
  const s = map[status] || map.rascunho;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

function SortBtn({ field, current, dir, onClick }) {
  const active = current === field;
  return (
    <button onClick={() => onClick(field)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: active ? tk.primary : tk.muted, background: active ? tk.primarySoft : 'transparent', border: `1px solid ${active ? '#C7D2FE' : tk.border}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', transition: 'all .15s' }}
    >
      {field === 'posicao' ? 'PosiÃ§Ã£o' : field === 'pontuacao' ? 'PontuaÃ§Ã£o' : field === 'casos_resolvidos' ? 'Respostas' : 'Tempo'}
      {active ? (dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : <ChevronDown size={11} color={tk.subtle} />}
    </button>
  );
}

/* â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function RankingCompleto() {
  const { tournamentId } = useParams();
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const { user }         = useAuth();

  // Suporta tambÃ©m ?tournament=ID (vindo do modal antigo)
  const effectiveId = tournamentId || searchParams.get('tournament') || '';

  const [ranking,    setRanking]    = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLive,     setIsLive]     = useState(false);

  // Filtros
  const [disciplinaFilter, setDisciplinaFilter] = useState(searchParams.get('disciplina') || '');
  const [sortField,  setSortField]  = useState('posicao');
  const [sortDir,    setSortDir]    = useState('asc');
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const idRef         = useRef(effectiveId);
  const discRef       = useRef(disciplinaFilter);
  useEffect(() => { idRef.current = effectiveId; },       [effectiveId]);
  useEffect(() => { discRef.current = disciplinaFilter; }, [disciplinaFilter]);

  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

  /* â”€â”€ Load ranking â”€â”€ */
  const load = useCallback(async (silent = false) => {
    if (!effectiveId) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      const disc = discRef.current;
      const url  = disc
        ? `${apiBase}/api/tournaments/${effectiveId}/ranking/${encodeURIComponent(disc)}?includeInactive=true`
        : `${apiBase}/api/tournaments/${effectiveId}/ranking?includeInactive=true`;

      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar ranking.');

      setRanking(data.ranking || []);
      setTournament(data.tournament || null);
      setLastUpdate(new Date());
    } catch (err) {
      if (!silent) setError(err.message || 'Erro ao carregar ranking.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [effectiveId, apiBase]);

  useEffect(() => { load(); }, [load, disciplinaFilter]);

  /* â”€â”€ Polling (active tournaments only) â”€â”€ */
  useEffect(() => {
    if (!effectiveId || tournament?.status !== 'ativo') return;
    const t = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(t);
  }, [effectiveId, tournament?.status, load]);

  /* â”€â”€ Socket real-time â”€â”€ */
  useEffect(() => {
    const handler = (data) => {
      if (!idRef.current || String(data.torneio_id) !== String(idRef.current)) return;
      const disc = discRef.current;
      if (disc && data.disciplina && data.disciplina !== disc) return;
      if (data.ranking && Array.isArray(data.ranking)) {
        const filtered = disc ? data.ranking.filter(p => p.disciplina_competida === disc) : data.ranking;
        setRanking(filtered);
        setLastUpdate(new Date());
        setIsLive(true);
        setTimeout(() => setIsLive(false), 3000);
      } else {
        load(true);
      }
    };
    socket.on('ranking_update', handler);
    return () => socket.off('ranking_update', handler);
  }, [load]);

  /* â”€â”€ Derived data â”€â”€ */
  const disciplinas = [...new Set(ranking.map(p => p.disciplina_competida).filter(Boolean))];

  const algumPontuou = ranking.some(p => parseFloat(p.pontuacao || 0) > 0);

  // CampeÃ£o: primeiro do ranking com pontuaÃ§Ã£o real
  const campiao = algumPontuou
    ? ranking.find(p => p.posicao === 1 && parseFloat(p.pontuacao || 0) > 0)
    : null;

  // Filtrar + ordenar
  let display = disciplinaFilter
    ? ranking.filter(p => p.disciplina_competida === disciplinaFilter)
    : [...ranking];

  if (showOnlyActive) {
    display = display.filter(p => (p.casos_resolvidos || 0) > 0 || parseFloat(p.pontuacao || 0) > 0);
  }

  display.sort((a, b) => {
    let va, vb;
    if (sortField === 'posicao')          { va = a.posicao ?? 9999;          vb = b.posicao ?? 9999; }
    else if (sortField === 'pontuacao')   { va = parseFloat(a.pontuacao || 0); vb = parseFloat(b.pontuacao || 0); }
    else if (sortField === 'casos_resolvidos') { va = a.casos_resolvidos || 0; vb = b.casos_resolvidos || 0; }
    else                                  { va = a.tempo_total || 0;          vb = b.tempo_total || 0; }
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const myEntry = user ? display.find(p => p.usuario_id === user.id || p.usuario?.id === user.id) : null;

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir(field === 'posicao' || field === 'tempo_total' ? 'asc' : 'desc'); }
  };

  /* â”€â”€ Render â”€â”€ */
  return (
    <Layout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .rk-row { animation: fadeIn .2s ease both; }
        .rk-row:hover { background: #F8FAFF !important; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* â”€â”€ Back â”€â”€ */}
        <button onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: tk.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content' }}
        >
          <ArrowLeft size={15} /> Voltar
        </button>

        {/* â”€â”€ Page title â”€â”€ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: tk.text, margin: 0, letterSpacing: '-0.3px' }}>
              Ranking Completo
            </h1>
            <p style={{ fontSize: 14, color: tk.muted, margin: '3px 0 0' }}>
              ClassificaÃ§Ã£o oficial de todos os participantes
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isLive && <LiveBadge />}
            {lastUpdate && (
              <span style={{ fontSize: 11, color: tk.subtle }}>
                Atualizado {lastUpdate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button onClick={() => load(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: tk.primary, background: tk.primarySoft, border: `1px solid #C7D2FE`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}
            >
              <RefreshCw size={12} /> Atualizar
            </button>
          </div>
        </div>

        {/* â”€â”€ Loading â”€â”€ */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: tk.muted, fontSize: 14 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${tk.border}`, borderTopColor: tk.primary, animation: 'spin .7s linear infinite' }} />
            Carregando rankingâ€¦
          </div>
        )}

        {/* â”€â”€ Error â”€â”€ */}
        {!loading && error && (
          <div style={{ padding: '14px 18px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!loading && !error && tournament && (
          <>
            {/* â”€â”€ Tournament info card â”€â”€ */}
            <div style={{ ...card, padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Trophy size={20} color={tk.gold} />
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: tk.text, margin: 0 }}>{tournament.titulo}</h2>
                  </div>
                  {tournament.descricao && (
                    <p style={{ fontSize: 13, color: tk.muted, margin: '0 0 10px', lineHeight: 1.5 }}>{tournament.descricao}</p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <StatusBadge status={tournament.status} />
                    {disciplinas.map(d => {
                      const dc = disciplinaColor(d);
                      return (
                        <span key={d} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                          {d}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {[
                    { icon: <Users size={14} />, label: 'Participantes', value: ranking.length },
                    { icon: <Calendar size={14} />, label: 'InÃ­cio', value: fmtDate(tournament.inicia_em) },
                    { icon: <Clock size={14} />, label: 'Encerramento', value: fmtDate(tournament.termina_em) },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ background: tk.bg, borderRadius: 10, padding: '10px 14px', minWidth: 110, border: `1px solid ${tk.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: tk.muted, fontSize: 11, fontWeight: 600, marginBottom: 3 }}>
                        {icon} {label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CampeÃ£o banner */}
              {campiao && (
                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: tk.goldSoft, border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>ðŸ¥‡</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: tk.gold, textTransform: 'uppercase', letterSpacing: '.05em' }}>CampeÃ£o Oficial</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#92400E' }}>
                      {campiao.usuario?.nome || 'Participante'}
                      {campiao.disciplina_competida && <span style={{ fontSize: 12, fontWeight: 500, color: tk.gold, marginLeft: 8 }}>Â· {campiao.disciplina_competida}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#B45309' }}>{parseFloat(campiao.pontuacao).toLocaleString('pt-BR')} pontos</div>
                  </div>
                </div>
              )}

              {/* Sem pontuaÃ§Ã£o vÃ¡lida */}
              {!algumPontuou && ranking.length > 0 && (
                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: '#F8FAFC', border: `1px solid ${tk.border}`, display: 'flex', alignItems: 'center', gap: 10, color: tk.muted, fontSize: 13 }}>
                  <AlertCircle size={16} color={tk.subtle} />
                  Nenhum participante registrou pontuaÃ§Ã£o vÃ¡lida neste torneio. NÃ£o hÃ¡ vencedores oficiais.
                </div>
              )}
            </div>

            {/* â”€â”€ My position banner â”€â”€ */}
            {myEntry && (
              <div style={{ padding: '14px 20px', borderRadius: 12, background: tk.primarySoft, border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: 12 }}>
                <PosBadge pos={myEntry.posicao} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tk.primary }}>
                    VocÃª estÃ¡ em {myEntry.posicao ? `${myEntry.posicao}Âº lugar` : 'posiÃ§Ã£o nÃ£o definida'}
                  </div>
                  <div style={{ fontSize: 12, color: tk.muted }}>
                    {parseFloat(myEntry.pontuacao || 0).toLocaleString('pt-BR')} pts
                    {myEntry.casos_resolvidos > 0 && ` Â· ${myEntry.casos_resolvidos} respostas`}
                    {myEntry.disciplina_competida && ` Â· ${myEntry.disciplina_competida}`}
                  </div>
                </div>
              </div>
            )}

            {/* â”€â”€ Filters & sort â”€â”€ */}
            <div style={{ ...card, padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: tk.muted, fontSize: 12, fontWeight: 600 }}>
                <Filter size={13} /> Filtros
              </div>

              {/* Discipline filter */}
              {disciplinas.length > 1 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => setDisciplinaFilter('')}
                    style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${disciplinaFilter === '' ? tk.primary : tk.border}`, background: disciplinaFilter === '' ? tk.primarySoft : 'transparent', color: disciplinaFilter === '' ? tk.primary : tk.muted, transition: 'all .15s' }}
                  >Todas</button>
                  {disciplinas.map(d => {
                    const dc = disciplinaColor(d);
                    const active = disciplinaFilter === d;
                    return (
                      <button key={d} onClick={() => setDisciplinaFilter(d)}
                        style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${active ? dc.text : tk.border}`, background: active ? dc.bg : 'transparent', color: active ? dc.text : tk.muted, transition: 'all .15s' }}
                      >{d}</button>
                    );
                  })}
                </div>
              )}

              {/* Active only toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: tk.muted, cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={showOnlyActive} onChange={e => setShowOnlyActive(e.target.checked)}
                  style={{ accentColor: tk.primary, width: 14, height: 14 }} />
                Apenas com atividade
              </label>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['posicao', 'pontuacao', 'casos_resolvidos', 'tempo_total'].map(f => (
                  <SortBtn key={f} field={f} current={sortField} dir={sortDir} onClick={handleSort} />
                ))}
              </div>
            </div>

            {/* â”€â”€ Empty state â”€â”€ */}
            {display.length === 0 && (
              <div style={{ ...card, padding: 56, textAlign: 'center' }}>
                <Trophy size={36} color={tk.subtle} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: tk.muted, margin: 0 }}>
                  {showOnlyActive ? 'Nenhum participante com atividade registrada.' : 'Nenhum participante encontrado.'}
                </p>
              </div>
            )}

            {/* â”€â”€ Ranking table â”€â”€ */}
            {display.length > 0 && (
              <div style={{ ...card, overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 90px 80px 70px 80px', gap: 0, padding: '10px 20px', background: tk.bg, borderBottom: `1px solid ${tk.border}`, fontSize: 11, fontWeight: 700, color: tk.subtle, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  <span>Pos</span>
                  <span>Participante</span>
                  <span style={{ textAlign: 'right' }}>Pontos</span>
                  <span style={{ textAlign: 'right' }}>Respostas</span>
                  <span style={{ textAlign: 'right' }}>Tempo</span>
                  <span style={{ textAlign: 'right' }}>Status</span>
                </div>

                {display.map((p, i) => {
                  const isMe   = user && (p.usuario_id === user.id || p.usuario?.id === user.id);
                  const nome   = p.usuario?.nome || 'Participante';
                  const pts    = parseFloat(p.pontuacao || 0);
                  const ativo  = pts > 0 || (p.casos_resolvidos || 0) > 0;
                  const dc     = p.disciplina_competida ? disciplinaColor(p.disciplina_competida) : null;

                  return (
                    <div key={p.id || i} className="rk-row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '52px 1fr 90px 80px 70px 80px',
                        gap: 0,
                        padding: '13px 20px',
                        borderBottom: i < display.length - 1 ? `1px solid ${tk.border}` : 'none',
                        alignItems: 'center',
                        background: isMe
                          ? 'linear-gradient(90deg,#EEF1FE 0%,#F5F7FF 100%)'
                          : 'transparent',
                        boxShadow: isMe ? 'inset 4px 0 0 #4F6EF7' : 'none',
                        transition: 'background .15s',
                        cursor: 'default',
                      }}
                    >
                      {/* Position */}
                      <div><PosBadge pos={p.posicao} /></div>

                      {/* Participant */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <Avatar nome={nome} imagem={p.usuario?.imagem} ring={isMe} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: isMe ? 700 : 500, color: isMe ? tk.primary : tk.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                              {nome}
                            </span>
                            {isMe && (
                              <span style={{ fontSize: 10, fontWeight: 700, background: tk.primary, color: '#fff', borderRadius: 999, padding: '1px 6px', flexShrink: 0 }}>
                                vocÃª
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                            {dc && (
                              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 999, background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                                {p.disciplina_competida}
                              </span>
                            )}
                            {p.entrou_em && (
                              <span style={{ fontSize: 10, color: tk.subtle }}>
                                {new Date(p.entrou_em).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Points */}
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: isMe ? tk.primary : pts > 0 ? tk.text : tk.subtle }}>
                          {pts > 0 ? pts.toLocaleString('pt-BR') : 'â€”'}
                        </span>
                        {pts > 0 && <span style={{ fontSize: 10, color: tk.muted, display: 'block' }}>pts</span>}
                      </div>

                      {/* Cases */}
                      <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: (p.casos_resolvidos || 0) > 0 ? tk.success : tk.subtle }}>
                        {(p.casos_resolvidos || 0) > 0 ? p.casos_resolvidos : 'â€”'}
                      </div>

                      {/* Time */}
                      <div style={{ textAlign: 'right', fontSize: 12, color: tk.muted }}>
                        {fmtTime(p.tempo_total)}
                      </div>

                      {/* Status */}
                      <div style={{ textAlign: 'right' }}>
                        {ativo ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: tk.success, background: tk.successSoft, border: '1px solid #A7F3D0', borderRadius: 999, padding: '2px 8px' }}>
                            <CheckCircle size={10} /> Ativo
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: tk.subtle, background: tk.bg, border: `1px solid ${tk.border}`, borderRadius: 999, padding: '2px 8px' }}>
                            <Minus size={10} /> Sem ativ.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Footer summary */}
                <div style={{ padding: '12px 20px', background: tk.bg, borderTop: `1px solid ${tk.border}`, display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: tk.muted }}>
                  <span><strong style={{ color: tk.text }}>{display.length}</strong> participante{display.length !== 1 ? 's' : ''}</span>
                  {algumPontuou && (
                    <span><strong style={{ color: tk.text }}>{display.filter(p => parseFloat(p.pontuacao || 0) > 0).length}</strong> com pontuaÃ§Ã£o</span>
                  )}
                  {disciplinaFilter && <span>Filtrado por: <strong style={{ color: tk.text }}>{disciplinaFilter}</strong></span>}
                </div>
              </div>
            )}
          </>
        )}

        {/* â”€â”€ No tournament found â”€â”€ */}
        {!loading && !error && !tournament && (
          <div style={{ ...card, padding: 56, textAlign: 'center' }}>
            <Trophy size={36} color={tk.subtle} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: tk.muted, margin: 0 }}>Torneio nÃ£o encontrado.</p>
            <button onClick={() => navigate('/ranking')}
              style={{ marginTop: 16, fontSize: 13, color: tk.primary, background: tk.primarySoft, border: `1px solid #C7D2FE`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
            >
              Ver todos os torneios
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
