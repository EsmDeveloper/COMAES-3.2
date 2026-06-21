import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Layout from './Layout';
import {
  Trophy, Medal, Award, Star, RefreshCw, AlertCircle,
  Users, Shield, BookOpen, Code, Calculator, Clock,
  TrendingUp, Crown, ChevronRight, Search, Loader2,
} from 'lucide-react';

/*  helpers  */
const API_BASE = () =>
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:3002`;

const authHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('comaes_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function timeSince(date) {
  if (!date) return null;
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s atrs`;
  if (s < 3600) return `${Math.floor(s / 60)}min atrs`;
  if (s < 86400) return `${Math.floor(s / 3600)}h atrs`;
  return `${Math.floor(s / 86400)}d atrs`;
}

/*  Skeleton  */
function RowSkeleton({ count = 8 }) {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

/*  Pdio Top 3  */
function Podio({ top3 }) {
  if (!top3 || top3.length === 0) return null;

  const PODIO = [
    { ordem: 1, bg: 'from-amber-400 to-yellow-500', ring: 'ring-amber-400', label: '1º lugar', icon: <Crown size={20} className="text-amber-100" />, height: 'h-28' },
    { ordem: 2, bg: 'from-slate-400 to-gray-500',   ring: 'ring-slate-400', label: '2º lugar', icon: <Medal size={18} className="text-slate-100" />, height: 'h-20' },
    { ordem: 3, bg: 'from-orange-400 to-amber-600', ring: 'ring-orange-400', label: '3º lugar', icon: <Award size={18} className="text-orange-100" />, height: 'h-16' },
  ];

  // Reordenar visualmente: 2° | 1° | 3°
  const visual = [top3[1], top3[0], top3[2]].filter(Boolean);
  const visualConfig = [PODIO[1], PODIO[0], PODIO[2]];

  return (
    <div className="flex items-end justify-center gap-3 mb-8 pt-4">
      {visual.map((item, i) => {
        const cfg = visualConfig[i];
        const initials = (item.nome || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div key={item.usuario_id} className="flex flex-col items-center gap-2 w-28 sm:w-32">
            {/* Avatar */}
            <div className="relative">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cfg.bg} ring-4 ${cfg.ring} flex items-center justify-center overflow-hidden shadow-lg`}>
                {item.imagem ? (
                  <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">{initials}</span>
                )}
              </div>
              <div className={`absolute -top-2 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center shadow`}>
                {cfg.icon}
              </div>
            </div>
            {/* Nome */}
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-800 truncate w-full">{item.nome}</p>
              <p className="text-xs text-gray-500">Nvel {item.nivel_atual}</p>
            </div>
            {/* Plataforma */}
            <div className={`w-full ${cfg.height} rounded-t-xl bg-gradient-to-b ${cfg.bg} flex flex-col items-center justify-center gap-1 shadow-md`}>
              <span className="text-white font-bold text-base">{cfg.ordem}°</span>
              <span className="text-white/90 text-[11px] font-medium">
                {item.pontuacao_total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/*  Linha da tabela  */
function RankRow({ item, isMe }) {
  const pos = item.position;
  const initials = (item.nome || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const medalColor =
    pos === 1 ? 'text-amber-500 bg-amber-50 border-amber-200' :
    pos === 2 ? 'text-slate-500 bg-slate-50 border-slate-200' :
    pos === 3 ? 'text-orange-500 bg-orange-50 border-orange-200' :
    'text-gray-400 bg-gray-50 border-gray-200';

  return (
    <tr className={`transition-colors hover:bg-blue-50/40 ${isMe ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
      {/* Posio */}
      <td className="py-3 px-4 w-14 text-center">
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold ${medalColor}`}>
          {pos <= 3 ? (pos === 1 ? '' : pos === 2 ? '' : '') : `#${pos}`}
        </span>
      </td>
      {/* Usurio */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
            {item.imagem
              ? <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
              : initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">{item.nome}</span>
              {isMe && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">vocª</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{item.total_torneios} torneio{item.total_torneios !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </td>
      {/* Nvel */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
          Nvel {item.nivel_atual}
        </span>
      </td>
      {/* Pontuao */}
      <td className="py-3 px-4 text-right">
        <span className="text-sm font-bold text-gray-900">
          {item.pontuacao_total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          <span className="text-xs font-normal text-gray-400 ml-1">pts</span>
        </span>
      </td>
    </tr>
  );
}

/*  Tab button  */
function TabBtn({ id, label, icon: Icon, active, disabled, onClick }) {
  return (
    <button
      onClick={() => !disabled && onClick(id)}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {disabled && <span className="text-[10px] font-normal opacity-70 hidden sm:inline"> faa login</span>}
    </button>
  );
}

/*  Componente principal  */
export default function RankingGlobal() {
  const { user, loading: authLoading } = useAuth();

  const isAuthenticated = !!user;
  const isAdmin    = user?.isAdmin === true || user?.isAdmin === 1 || user?.role === 'admin';
  const isColaborador = user?.role === 'colaborador';
  const isEstudante   = user?.role === 'estudante';
  const isVisitor     = !isAuthenticated;

  /*  state  */
  const [activeTab, setActiveTab] = useState('geral');
  const [rankingData, setRankingData] = useState({ geral: null, matematica: null, programacao: null, ingles: null });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search, setSearch] = useState('');
  const [minhaPosicao, setMinhaPosicao] = useState(null);
  const pollingRef = useRef(null);

  /*  fetch  */
  const fetchTab = useCallback(async (tab, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const isPublicEndpoint = tab === 'geral' && !isAuthenticated;
      const endpoint = isPublicEndpoint ? '/api/rankings/public' : `/api/rankings/${tab}`;
      const res = await fetch(`${API_BASE()}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.message || 'Erro na API');

      setRankingData(prev => ({ ...prev, [tab]: json.data || [] }));
      setLastUpdate(new Date());
    } catch (e) {
      console.error('[RankingGlobal] fetch:', e);
      setError('No foi possvel carregar os dados do ranking. Tente novamente.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchMinhaPosicao = useCallback(async () => {
    if (!isAuthenticated || isAdmin) return;
    try {
      const res = await fetch(`${API_BASE()}/api/rankings/minha-posicao`, {
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      const json = await res.json();
      if (json.success) setMinhaPosicao(json.data);
    } catch { /* silencioso */ }
  }, [isAuthenticated, isAdmin]);

  /*  efeitos  */
  // Carregar aba ativa ao mudar
  useEffect(() => {
    if (!rankingData[activeTab]) {
      fetchTab(activeTab);
    }
  }, [activeTab]);

  // Buscar minha posio ao autenticar
  useEffect(() => {
    fetchMinhaPosicao();
  }, [fetchMinhaPosicao]);

  // Polling 30s apenas quando autenticado
  useEffect(() => {
    if (!isAuthenticated || isAdmin) return;
    const tick = () => fetchTab(activeTab, true);
    pollingRef.current = setInterval(tick, 30_000);
    return () => clearInterval(pollingRef.current);
  }, [activeTab, isAuthenticated, isAdmin, fetchTab]);

  /*  hooks devem estar antes dos returns condicionais  */
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      </Layout>
    );
  }

  if (isAdmin) return <Navigate to="/admin/rankings-monitor" replace />;

  /*  dados  */
  const currentData = rankingData[activeTab] || [];
  const top3 = currentData.slice(0, 3);

  // Filtro de busca (apenas para autenticados)
  const filtered = isAuthenticated && search.trim()
    ? currentData.filter(r => (r.nome || '').toLowerCase().includes(search.toLowerCase()))
    : currentData;

  // Limitao para visitantes
  const displayData = isVisitor ? currentData.slice(0, 10) : filtered;

  const totalParticipants = currentData.length;

  // Posio do usurio na aba atual
  const meuIndex = isAuthenticated && !isAdmin
    ? currentData.findIndex(r => r.usuario_id === user?.id)
    : -1;

  const TABS = [
    { id: 'geral',       label: 'Geral',        icon: Trophy,      color: 'text-amber-500' },
    { id: 'matematica',  label: 'Matemtica',   icon: Calculator,  color: 'text-blue-500' },
    { id: 'programacao', label: 'Programao',  icon: Code,        color: 'text-green-500' },
    { id: 'ingles',      label: 'Inglªs',       icon: BookOpen,    color: 'text-purple-500' },
  ];

  const tabAtualInfo = TABS.find(t => t.id === activeTab);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/*  Header  */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} className="text-amber-300" />
                <span className="text-blue-200 text-sm font-medium uppercase tracking-widest">Ranking Oficial</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Ranking Global COMAES</h1>
              <p className="text-blue-200 text-sm leading-relaxed max-w-lg">
                O ranking representa o desempenho acumulado dos estudantes nas atividades educativas
                oficiais da plataforma COMAES  calculado a partir de torneios finalizados.
              </p>
            </div>
            <div className="flex flex-col gap-2 items-start sm:items-end flex-shrink-0">
              {/* Badge de role */}
              {isVisitor && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur text-white text-xs rounded-full border border-white/20">
                  <Users size={12} /> Visitante  Top 10 apenas
                </span>
              )}
              {isColaborador && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur text-white text-xs rounded-full border border-white/20">
                  <Shield size={12} /> Colaborador  Modo observador
                </span>
              )}
              {isEstudante && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 backdrop-blur text-amber-200 text-xs rounded-full border border-amber-300/30">
                  <Star size={12} /> Estudante participante
                </span>
              )}
              {/* Refresh */}
              <button
                onClick={() => fetchTab(activeTab)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg border border-white/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
              {lastUpdate && (
                <span className="text-blue-300 text-[11px] flex items-center gap-1">
                  <Clock size={10} /> Atualizado {timeSince(lastUpdate)}
                </span>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <div className="text-xl font-bold">{totalParticipants}</div>
              <div className="text-blue-200 text-xs mt-0.5">Participantes</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <div className="text-xl font-bold">
                {meuIndex >= 0 ? `#${meuIndex + 1}` : isAuthenticated ? '' : '?'}
              </div>
              <div className="text-blue-200 text-xs mt-0.5">Sua posio</div>
            </div>
            <div className="hidden sm:block bg-white/10 rounded-xl px-4 py-3">
              <div className="text-xl font-bold capitalize">{tabAtualInfo?.label || ''}</div>
              <div className="text-blue-200 text-xs mt-0.5">Categoria ativa</div>
            </div>
          </div>
        </div>

        {/*  Minha posio destaque (estudante autenticado)  */}
        {isEstudante && minhaPosicao && minhaPosicao[activeTab]?.posicao && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                Vocª est na posio <span className="text-blue-600 font-bold">#{minhaPosicao[activeTab].posicao}</span> no ranking de{' '}
                <span className="capitalize">{tabAtualInfo?.label}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {minhaPosicao[activeTab].pontuacao_total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts ·{' '}
                {minhaPosicao[activeTab].total_torneios} torneio{minhaPosicao[activeTab].total_torneios !== 1 ? 's' : ''} ·{' '}
                de {minhaPosicao[activeTab].total_participantes} participantes
              </p>
            </div>
            <ChevronRight size={18} className="text-blue-400 flex-shrink-0" />
          </div>
        )}

        {/*  Tabs  */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => (
            <TabBtn
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              disabled={isVisitor && tab.id !== 'geral'}
              onClick={(id) => setActiveTab(id)}
            />
          ))}
        </div>

        {/*  Erro  */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => fetchTab(activeTab)} className="ml-auto text-xs underline">
              Tentar novamente
            </button>
          </div>
        )}

        {/*  Card principal  */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header do card */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                {tabAtualInfo && <tabAtualInfo.icon size={16} className={tabAtualInfo.color} />}
                Ranking {tabAtualInfo?.label}
              </h2>
              {isVisitor && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Exibindo top 10 · <Link to="/login" className="text-blue-600 font-medium">Faa login</Link> para ver o ranking completo
                </p>
              )}
            </div>
            {isAuthenticated && (
              <div className="relative w-full sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar estudante..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Pdio Top 3 (apenas para ranking geral autenticado sem filtro) */}
          {!loading && !error && activeTab === 'geral' && !search && top3.length >= 3 && (
            <div className="px-4 pt-6 pb-2 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
              <p className="text-center text-xs text-gray-400 uppercase tracking-wider mb-4 font-medium">
                 Pdio
              </p>
              <Podio top3={top3} />
            </div>
          )}

          {/* Loading */}
          {loading && <RowSkeleton count={8} />}

          {/* Vazio */}
          {!loading && !error && displayData.length === 0 && (
            <div className="py-20 text-center">
              <Trophy size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Nenhum resultado encontrado</p>
              <p className="text-gray-400 text-sm mt-1">
                {search ? 'Tente outro nome.' : 'Ainda no h estudantes classificados nesta categoria.'}
              </p>
            </div>
          )}

          {/* Tabela */}
          {!loading && !error && displayData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-14">Pos</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Estudante</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Nvel</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Pontos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayData.map((item, i) => {
                    const isMe = isAuthenticated && item.usuario_id === user?.id;
                    return <RankRow key={item.usuario_id} item={item} isMe={isMe} />;
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer do card */}
          {!loading && displayData.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>
                Exibindo {displayData.length} de {totalParticipants} participantes
              </span>
              {isVisitor && totalParticipants > 10 && (
                <Link to="/login" className="text-blue-600 font-medium hover:underline">
                  Ver todos os {totalParticipants} 
                </Link>
              )}
            </div>
          )}
        </div>

        {/*  Legenda de acesso (para visitantes)  */}
        {isVisitor && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-blue-600" />
              Nveis de acesso ao ranking
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Estudantes</p>
                  <p className="text-gray-500 text-xs mt-0.5">Ranking completo (top 100) + posio pessoal</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Visitantes</p>
                  <p className="text-gray-500 text-xs mt-0.5">Top 10 apenas · Categoria Geral</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Colaboradores</p>
                  <p className="text-gray-500 text-xs mt-0.5">Visualizao completa · Sem participao</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link to="/login" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Entrar na plataforma
              </Link>
              <Link to="/cadastro" className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                Criar conta
              </Link>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

