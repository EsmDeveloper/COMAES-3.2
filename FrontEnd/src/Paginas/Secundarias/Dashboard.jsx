import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import { 
  LayoutDashboard, 
  Trophy, 
  TrendingUp, 
  Award, 
  Target, 
  BarChart3, 
  PieChart, 
  Calendar,
  Star,
  Medal,
  ChevronRight,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart as RechartsPieChart, Pie, Cell, 
  AreaChart, Area,
  ResponsiveContainer
} from 'recharts';

/* ─── Design tokens ─────────────────────────────────────────── */
const tokens = {
  primary:   '#4F6EF7',
  primarySoft: '#EEF1FE',
  success:   '#34D399',
  successSoft: '#ECFDF5',
  purple:    '#A78BFA',
  purpleSoft: '#F5F3FF',
  amber:     '#FBBF24',
  amberSoft: '#FFFBEB',
  red:       '#F87171',
  redSoft:   '#FEF2F2',
  surface:   '#FFFFFF',
  bg:        '#F7F8FC',
  border:    '#E8EAEF',
  text:      '#0F1117',
  muted:     '#6B7280',
  subtle:    '#9CA3AF',
};

/* ─── Shared card style ──────────────────────────────────────── */
const cardStyle = {
  background: tokens.surface,
  borderRadius: '20px',
  border: `1px solid ${tokens.border}`,
  boxShadow: '0 2px 12px rgba(15,17,23,0.05)',
  padding: '28px',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
};

/* ─── Custom tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ 
        background: tokens.text,
        color: '#fff',
        borderRadius: '10px',
        padding: '10px 16px',
        fontSize: '13px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
       }}>
        {label && <p style={{  marginBottom: 4, opacity: 0.6, fontSize: 11  }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i}><strong>{p.value}</strong> {p.name}</p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ title, value, icon, accent, accentSoft, badge }) {
  return (
    <div
      style={cardStyle}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(15,17,23,0.10)';
        e.currentTarget.style.transform = 'translateY(-2px)';
       }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,17,23,0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
       }}
    >
      <div style={{  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20  }}>
        <div style={{ 
          width: 44, height: 44,
          borderRadius: 12,
          background: accentSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
         }}>
          {icon}
        </div>
        <span style={{ 
          fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
          textTransform: 'uppercase', color: tokens.subtle,
          background: tokens.bg, borderRadius: 6, padding: '3px 8px',
         }}>
          {badge}
        </span>
      </div>
      <div style={{  fontSize: 30, fontWeight: 700, color: tokens.text, lineHeight: 1.1, marginBottom: 4  }}>
        {value}
      </div>
      <div style={{  fontSize: 14, color: tokens.muted  }}>{title}</div>
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHeader({ title, subtitle, icon }) {
  return (
    <div style={{  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24  }}>
      <div>
        <h3 style={{  fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 2  }}>{title}</h3>
        <p style={{  fontSize: 13, color: tokens.muted  }}>{subtitle}</p>
      </div>
      <div style={{  color: tokens.subtle  }}>{icon}</div>
    </div>
  );
}

/* ─── Progress goal card ─────────────────────────────────────── */
function GoalCard({ title, subtitle, progress, accent, accentSoft }) {
  const pct = Math.min(Math.max(progress, 0), 100);
  return (
    <div style={{ 
      background: accentSoft,
      borderRadius: 14,
      padding: '16px 18px',
      marginBottom: 12,
     }}>
      <div style={{  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10  }}>
        <div>
          <div style={{  fontSize: 14, fontWeight: 600, color: tokens.text  }}>{title}</div>
          <div style={{  fontSize: 12, color: tokens.muted, marginTop: 2  }}>{subtitle}</div>
        </div>
        <div style={{  fontSize: 13, fontWeight: 700, color: accent  }}>{pct.toFixed(0)}%</div>
      </div>
      <div style={{  height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 999, overflow: 'hidden'  }}>
        <div style={{ 
          height: '100%',
          width: `${pct}%`,
          background: accent,
          borderRadius: 999,
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
         }} />
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    if (!user) {
      setIsRedirecting(true);
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const [userData, setUserData] = useState({
    username: user?.fullName || user?.username || "Usuário COMAES",
    joinDate: user?.registrationDate || new Date().toISOString(),
    totalPoints: user?.points || 0,
    currentRank: 0,
    previousRank: 0,
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    prizesWon: 0
  });

  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [areaParticipation, setAreaParticipation] = useState([]);
  const [rankingHistory, setRankingHistory] = useState([
    { month: 'Jan', rank: 100 },
    { month: 'Fev', rank: 90 },
    { month: 'Mar', rank: 80 },
    { month: 'Abr', rank: 70 },
    { month: 'Mai', rank: 60 },
  ]);
  const [pointsByCategory, setPointsByCategory] = useState([]);
  const [prizesDistribution, setPrizesDistribution] = useState([
    { position: '1º Lugar', quantidade: 0, color: tokens.amber },
    { position: '2º Lugar', quantidade: 0, color: tokens.subtle },
    { position: '3º Lugar', quantidade: 0, color: '#CD7F32' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/usuarios/${user.id}/participacoes`);
        const result = await response.json();
        const rankingResponse = await fetch(`http://localhost:3000/usuarios/${user.id}/ranking-global`);
        const rankingResult = await rankingResponse.json();
        
        if (result.success) {
          const participacoes = result.data;
          const totalPoints = participacoes.reduce((acc, p) => acc + Number(p.pontuacao), 0);
          const tournamentsPlayed = participacoes.length;
          const tournamentsWon = participacoes.filter(p => p.posicao === 1).length;
          const prizesWon = participacoes.filter(p => p.posicao && p.posicao <= 3).length;
          
          setUserData(prev => ({
            ...prev,
            totalPoints,
            tournamentsPlayed,
            tournamentsWon,
            prizesWon,
            currentRank: rankingResult.success ? rankingResult.data.posicao : 0,
            username: user?.fullName || user?.username || prev.username,
            joinDate: user?.registrationDate || prev.joinDate
          }));

          const history = participacoes.map(p => ({
            id: p.id,
            name: p.torneio?.titulo || "Torneio COMAES",
            date: p.entrou_em || p.torneio?.inicia_em || new Date().toISOString(),
            position: p.posicao || "-",
            points: Number(p.pontuacao),
            category: p.disciplina_competida || "Geral"
          })).sort((a, b) => new Date(b.date) - new Date(a.date));
          setTournamentHistory(history);

          const areas = {};
          participacoes.forEach(p => {
            const area = p.disciplina_competida || "Geral";
            areas[area] = (areas[area] || 0) + 1;
          });
          const areaColors = [tokens.primary, tokens.success, tokens.amber, tokens.red];
          setAreaParticipation(Object.keys(areas).map((name, i) => ({
            name, value: areas[name], color: areaColors[i % 4]
          })));

          const pointsCat = {};
          participacoes.forEach(p => {
            const area = p.disciplina_competida || "Geral";
            pointsCat[area] = (pointsCat[area] || 0) + Number(p.pontuacao);
          });
          setPointsByCategory(Object.keys(pointsCat).map(category => ({ category, pontos: pointsCat[category] })));

          setPrizesDistribution([
            { position: '1º Lugar', quantidade: participacoes.filter(p => p.posicao === 1).length, color: tokens.amber },
            { position: '2º Lugar', quantidade: participacoes.filter(p => p.posicao === 2).length, color: '#94A3B8' },
            { position: '3º Lugar', quantidade: participacoes.filter(p => p.posicao === 3).length, color: '#CD7F32' },
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.id]);

  const statCards = [
    { title: "Torneios Participados", value: userData.tournamentsPlayed, icon: <Trophy size={20}/>, accent: tokens.primary, accentSoft: tokens.primarySoft, badge: "Total" },
    { title: "Posição no Ranking", value: userData.currentRank > 0 ? `#${userData.currentRank}` : "—", icon: <TrendingUp size={20}/>, accent: '#10B981', accentSoft: tokens.successSoft, badge: "Global" },
    { title: "Pontos Acumulados", value: userData.totalPoints.toLocaleString(), icon: <Star size={20}/>, accent: tokens.purple, accentSoft: tokens.purpleSoft, badge: "Carreira" },
    { title: "Prêmios no Pódio", value: userData.prizesWon, icon: <Award size={20}/>, accent: '#D97706', accentSoft: tokens.amberSoft, badge: "Top 3" },
  ];

  const positionStyle = (pos) => {
    if (pos === 1) return { background: '#FEF9C3', color: '#92400E' };
    if (pos === 2) return { background: '#F1F5F9', color: '#475569' };
    if (pos === 3) return { background: '#FFF7ED', color: '#9A3412' };
    return { background: tokens.primarySoft, color: tokens.primary };
  };

  const categoryIcon = (cat) => {
    const map = { 'Matemática': 'M', 'Programação': 'P', 'Inglês': 'I' };
    return map[cat] || cat?.[0] || '?';
  };
  const categoryColors = (cat) => {
    const map = {
      'Matemática': { bg: tokens.primarySoft, color: tokens.primary },
      'Programação': { bg: tokens.successSoft, color: '#059669' },
    };
    return map[cat] || { bg: tokens.amberSoft, color: '#92400E' };
  };

  if (loading && user) {
    return (
      <Layout>
        <div style={{  display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16  }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: '50%',
            border: `3px solid ${tokens.border}`,
            borderTopColor: tokens.primary,
            animation: 'spin 0.8s linear infinite',
           }}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{  color: tokens.muted, fontSize: 15  }}>Carregando seu dashboard…</span>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div style={{  maxWidth: 560, margin: '60px auto', padding: '0 24px'  }}>
          <div style={{ 
            ...cardStyle,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 100%)',
            border: `1px solid #FECACA`,
           }}>
            <div style={{ 
              width: 72, height: 72, borderRadius: '50%',
              background: '#FEE2E2', margin: '0 auto 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
             }}>
              <LayoutDashboard size={32} color={tokens.red} />
            </div>
            <h2 style={{  fontSize: 22, fontWeight: 700, color: tokens.text, marginBottom: 12  }}>
              Acesso Restrito ao Dashboard
            </h2>
            <p style={{  fontSize: 15, color: tokens.muted, lineHeight: 1.6, marginBottom: 28  }}>
              Seu dashboard COMAES está disponível apenas para usuários autenticados.
              Faça login ou cadastre-se para acompanhar suas estatísticas e progresso.
            </p>

            {isRedirecting ? (
              <div style={{  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10  }}>
                <div style={{ 
                  width: 18, height: 18, borderRadius: '50%',
                  border: `2px solid ${tokens.border}`, borderTopColor: tokens.primary,
                  animation: 'spin 0.8s linear infinite',
                 }}/>
                <span style={{  color: tokens.primary, fontSize: 14  }}>Redirecionando para login…</span>
              </div>
            ) : (
              <div style={{  display: 'flex', gap: 12, justifyContent: 'center'  }}>
                <button onClick={() => navigate('/login')} style={{ 
                  padding: '12px 28px', background: tokens.primary, color: '#fff',
                  border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  transition: 'opacity 0.15s',
                 }} onMouseEnter={e=>e.target.style.opacity=0.88} onMouseLeave={e=>e.target.style.opacity=1}>
                  Fazer Login
                </button>
                <button onClick={() => navigate('/cadastro')} style={{ 
                  padding: '12px 28px', background: 'transparent', color: tokens.primary,
                  border: `1.5px solid ${tokens.primary}`, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.15s',
                 }} onMouseEnter={e=>e.target.style.background=tokens.primarySoft} onMouseLeave={e=>e.target.style.background='transparent'}>
                  Cadastrar-se
                </button>
              </div>
            )}

            <div style={{  marginTop: 36, paddingTop: 24, borderTop: `1px solid #FECACA`  }}>
              <p style={{  fontSize: 13, color: tokens.muted, marginBottom: 16  }}>O que você verá no Dashboard COMAES:</p>
              <div style={{  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'left'  }}>
                {['Estatísticas detalhadas','Gráficos de progresso','Histórico de torneios','Metas e conquistas'].map(f => (
                  <div key={f} style={{  display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: tokens.muted  }}>
                    <CheckCircle size={14} color="#34D399" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Authenticated dashboard ── */
  return (
    <Layout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-anim { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* ── Hero ── */}
      <div className="dash-anim" style={{  marginBottom: 36, animationDelay: '0ms'  }}>
        <div style={{ 
          background: `linear-gradient(135deg, ${tokens.primary} 0%, #6B8BF5 100%)`,
          borderRadius: 24,
          padding: '32px 36px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          position: 'relative',
          overflow: 'hidden',
         }}>
          {/* decorative circles */}
          <div style={{ 
            position: 'absolute', top: -40, right: -40,
            width: 220, height: 220, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
           }}/>
          <div style={{ 
            position: 'absolute', bottom: -60, right: 80,
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
           }}/>

          <div style={{  position: 'relative'  }}>
            <div style={{  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6  }}>
              <Sparkles size={14} style={{  opacity: 0.7  }}/>
              <span style={{  fontSize: 13, opacity: 0.75, fontWeight: 500, letterSpacing: '0.04em'  }}>
                Dashboard COMAES
              </span>
            </div>
            <h1 style={{  fontSize: 26, fontWeight: 700, marginBottom: 4  }}>
              Bem-vindo de volta, {userData.username}! 👋
            </h1>
            <p style={{  fontSize: 14, opacity: 0.75  }}>
              Acompanhe seu progresso e estatísticas das competições.
            </p>
          </div>

          <div style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
            position: 'relative',
           }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '8px 16px'
            }}>
              <p style={{ fontSize: 13, fontWeight: 700 }}>Online</p>
            </div>
          </div>
        </div>
      </div>
     {/* ── Stat cards ── */}
      <div className="dash-anim grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7" style={{ animationDelay: '60ms' }}>
        {statCards.map((card, i) => (
          <div key={card.title} className="w-full">
            <StatCard {...card} />
          </div>
        ))}
      </div>

      {/* ── Charts row 1 ── */}
      <div className="dash-anim grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5" style={{ animationDelay: '120ms' }}>
        {/* Pie – Participação por Área */}
        <div style={cardStyle} className="overflow-hidden">
          <SectionHeader title="Participação por Área" subtitle="Número de torneios por categoria" icon={<BookOpen size={18}/>}/>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={areaParticipation} cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90} innerRadius={42} dataKey="value" paddingAngle={3}
                >
                  {areaParticipation.map((e, i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13  }}/>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area – Evolução do Ranking */}
        <div style={cardStyle} className="overflow-hidden">
          <SectionHeader title="Evolução do Ranking" subtitle="Histórico de posições" icon={<TrendingUp size={18}/>}/>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rankingHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0  }}>
                <defs>
                  <linearGradient id="rankGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tokens.primary} stopOpacity={0.18}/>
                    <stop offset="95%" stopColor={tokens.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: tokens.subtle  }} axisLine={false} tickLine={false}/>
                <YAxis reversed domain={[100, 0]} tick={{ fontSize: 12, fill: tokens.subtle  }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="rank" stroke={tokens.primary} strokeWidth={2.5}
                  fill="url(#rankGrad)" dot={{ r: 4, fill: tokens.primary, strokeWidth: 2, stroke: '#fff'  }}
                  activeDot={{ r: 6  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="dash-anim grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7" style={{ animationDelay: '160ms' }}>
        {/* Bar – Pontos por Categoria */}
        <div style={cardStyle} className="overflow-hidden">
          <SectionHeader title="Pontos por Categoria" subtitle="Distribuição de pontos" icon={<BarChart3 size={18}/>}/>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsByCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0  }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tokens.purple} stopOpacity={1}/>
                    <stop offset="100%" stopColor={tokens.primary} stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} vertical={false}/>
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: tokens.subtle  }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 12, fill: tokens.subtle  }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="pontos" fill="url(#barGrad)" radius={[6,6,0,0]} maxBarSize={52}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie – Premiações */}
        <div style={cardStyle} className="overflow-hidden">
          <SectionHeader title="Distribuição de Prêmios" subtitle="Posições conquistadas" icon={<Medal size={18}/>}/>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={prizesDistribution} cx="50%" cy="50%"
                  labelLine={false}
                  label={({ position, quantidade }) => `${position}: ${quantidade}`}
                  outerRadius={90} innerRadius={42} dataKey="quantidade" paddingAngle={3}
                >
                  {prizesDistribution.map((e, i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13  }}/>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Tournaments & Goals ── */}
      <div className="dash-anim grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7" style={{ animationDelay: '200ms' }}>
        {/* Recent tournaments */}
        <div style={cardStyle} className="xl:col-span-2">
          <SectionHeader title="Torneios Recentes COMAES" subtitle="Últimas competições" icon={<Clock size={18}/>}/>
          <div className="flex flex-col gap-3">
            {tournamentHistory.slice(0, 5).length > 0 ? (
              tournamentHistory.slice(0, 5).map(t => {
                const cc = categoryColors(t.category);
                const ps = positionStyle(t.position);
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-default">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm" style={{ background: cc.bg, color: cc.color }}>
                        {categoryIcon(t.category)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 truncate max-w-[120px] sm:max-w-none">{t.name}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-10">
                      <div className="text-center">
                        <div className="px-3 py-1 rounded-lg text-xs font-bold" style={{ ...ps }}>
                          {t.position}º
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-gray-900">{t.points}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pontos</div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 hidden sm:block"/>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Trophy size={40} className="mx-auto mb-3 opacity-20"/>
                <p className="text-sm">Nenhum torneio encontrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Goals */}
        <div style={cardStyle}>
          <SectionHeader title="Conquistas" subtitle="Metas atingidas" icon={<Target size={18}/>}/>
          <div className="space-y-4">
            <GoalCard title="Top 25 no Ranking" subtitle={`Posição: ${userData.currentRank || '—'}`} progress={(userData.currentRank > 0 ? (25 / userData.currentRank) * 100 : 0)} accent={tokens.primary} accentSoft={tokens.primarySoft} />
            <GoalCard title="10 Vitórias" subtitle={`${userData.tournamentsWon} conquistadas`} progress={(userData.tournamentsWon / 10) * 100} accent="#10B981" accentSoft={tokens.successSoft} />
            <GoalCard title="5.000 Pontos" subtitle={`${userData.totalPoints.toLocaleString()} acumulados`} progress={(userData.totalPoints / 5000) * 100} accent={tokens.purple} accentSoft={tokens.purpleSoft} />
          </div>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="dash-anim p-6 sm:p-8 rounded-[32px] border border-blue-100 mb-7" style={{ 
        background: `linear-gradient(135deg, ${tokens.primarySoft} 0%, #F5F3FF 100%)`,
        animationDelay: '240ms'
       }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <h3 className="text-xl font-bold text-gray-900 text-center md:text-left">
            Resumo de Desempenho
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full md:w-auto">
            {[
              { label: 'Participações', value: areaParticipation.reduce((a,b) => a + b.value, 0), color: tokens.primary },
              { label: 'Pódios', value: prizesDistribution.reduce((a,b) => a + b.quantidade, 0), color: '#10B981' },
              { label: 'Pontos', value: pointsByCategory.reduce((a,b) => a + b.pontos, 0).toLocaleString(), color: tokens.purple },
              { label: 'Evolução', value: rankingHistory.length > 0 ? rankingHistory[rankingHistory.length-1].rank - userData.currentRank : 0, color: '#D97706' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;