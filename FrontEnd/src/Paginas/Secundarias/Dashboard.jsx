import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import NivelBadge from '../../components/NivelBadge';
import useNivel from '../../hooks/useNivel';
import StreakBadge from '../../components/StreakBadge';
import useStreak from '../../hooks/useStreak';
import { 
  LayoutDashboard, 
  Trophy, 
  TrendingUp, 
  Target, 
  BarChart3,
  Calendar,
  Star,
  ChevronRight,
  Clock,
  Activity,
  Zap,
  Brain,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area,
  ResponsiveContainer,
  LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';

/* --------------------------------------------------------------------- */
const tokens = {
  primary: '#4F6EF7',
  primarySoft: '#EEF1FE',
  success: '#34D399',
  successSoft: '#ECFDF5',
  purple: '#A78BFA',
  purpleSoft: '#F5F3FF',
  amber: '#FBBF24',
  amberSoft: '#FFFBEB',
  red: '#F87171',
  redSoft: '#FEF2F2',
  surface: '#FFFFFF',
  bg: '#F7F8FC',
  border: '#E8EAEF',
  text: '#0F1117',
  muted: '#6B7280',
  subtle: '#9CA3AF',
};

/* --------------------------------------------------------------------- */
const cardStyle = {
  background: tokens.surface,
  borderRadius: '16px',
  border: `1px solid ${tokens.border}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  padding: 'max(12px, min(3vw, 20px))',
  transition: 'all 0.2s ease',
};

/* --------------------------------------------------------------------- */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: tokens.text,
        color: '#fff',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
      }}>
        {label && <p style={{ marginBottom: 2, opacity: 0.8 }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i}><strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

/* --------------------------------------------------------------------- */
function StatCard({ title, value, icon, accent, accentSoft, subtext }) {
  return (
    <div
      style={cardStyle}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: tokens.muted, marginBottom: 6, fontWeight: 500 }}>
            {title}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: tokens.text, lineHeight: 1 }}>
            {value}
          </div>
          {subtext && (
            <div style={{ fontSize: 11, color: tokens.subtle, marginTop: 6 }}>
              {subtext}
            </div>
          )}
        </div>
        <div style={{
          width: 40, height: 40,
          borderRadius: 10,
          background: accentSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
          flexShrink: 0
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */
function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 2 }}>
        {title}
      </h3>
      {subtitle && <p style={{ fontSize: 13, color: tokens.muted }}>
        {subtitle}
      </p>}
    </div>
  );
}

/* --------------------------------------------------------------------- */
function TournamentItem({ tournament, onClick }) {
  const getPositionStyle = (pos) => {
    if (pos === 1) return { bg: '#FEF9C3', text: '#92400E', label: '1º' };
    if (pos === 2) return { bg: '#F1F5F9', text: '#475569', label: '2º' };
    if (pos === 3) return { bg: '#FFF7ED', text: '#9A3412', label: '3º' };
    return { bg: tokens.primarySoft, text: tokens.primary, label: 'Finalizou' };
  };

  const getCategoryColor = (cat) => {
    const colors = {
      'Matemática': { bg: tokens.primarySoft, text: tokens.primary },
      'Programação': { bg: tokens.successSoft, text: '#059669' },
      'Inglês': { bg: tokens.purpleSoft, text: tokens.purple },
    };
    return colors[cat] || { bg: tokens.amberSoft, text: '#92400E' };
  };

  const pos = getPositionStyle(tournament.position);
  const cat = getCategoryColor(tournament.category);
  const date = new Date(tournament.date);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: tokens.bg,
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'background 0.2s',
        border: `1px solid ${tokens.border}`,
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#EDEEF5'}
      onMouseLeave={e => e.currentTarget.style.background = tokens.bg}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: 8,
          background: cat.bg,
          color: cat.text,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 11
        }}>
          {tournament.category[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>
            {tournament.name}
          </div>
          <div style={{ fontSize: 11, color: tokens.subtle, marginTop: 2 }}>
            {date.toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: pos.bg,
            color: pos.text,
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700
          }}>
            {pos.label}
          </div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 50 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>{tournament.points}</div>
          <div style={{ fontSize: 10, color: tokens.subtle }}>pontos</div>
        </div>
        <ChevronRight size={16} color={tokens.subtle} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */
function GoalCard({ title, current, target, accent, accentSoft }) {
  const pct = Math.min(Math.max((current / target) * 100, 0), 100);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{title}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{pct.toFixed(0)}%</div>
      </div>
      <div style={{
        height: 6,
        background: tokens.border,
        borderRadius: 999,
        overflow: 'hidden',
        border: `1px solid ${tokens.border}`
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: accent,
          borderRadius: 999,
          transition: 'width 0.6s ease',
        }} />
      </div>
      <div style={{ fontSize: 11, color: tokens.subtle, marginTop: 6, textAlign: 'right' }}>
        {current} de {target}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */
function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { nivel } = useNivel();
  const { streak, ativa } = useStreak();

  const [userData, setUserData] = useState({
    username: user?.fullName || user?.nome || user?.username || 'Usuário COMAES',
    joinDate: user?.createdAt || user?.registrationDate || new Date().toISOString(),
    totalPoints: 0,
    currentRank: 0,
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    prizesWon: 0,
    averageAccuracy: 0,
    bestDiscipline: '',
  });

  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !token) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/usuarios/${user.id}/participacoes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await response.json();

        if (result.success) {
          const participacoes = result.data;

          const totalPoints = participacoes.reduce((acc, p) => acc + Number(p.pontuacao || 0), 0);
          const tournamentsPlayed = participacoes.length;
          const tournamentsWon = participacoes.filter(p => p.posicao === 1).length;
          const prizesWon = participacoes.filter(p => p.posicao && p.posicao <= 3).length;

          let totalAccuracy = 0;
          let accuracyCount = 0;
          const disciplinePoints = {};

          participacoes.forEach(p => {
            if (p.precisao) {
              totalAccuracy += Number(p.precisao);
              accuracyCount++;
            }
            const disc = p.disciplina_competida || 'Geral';
            disciplinePoints[disc] = (disciplinePoints[disc] || 0) + Number(p.pontuacao || 0);
          });

          let bestDiscipline = '';
          let maxPoints = -1;
          Object.entries(disciplinePoints).forEach(([key, value]) => {
            if (value > maxPoints) {
              maxPoints = value;
              bestDiscipline = key;
            }
          });

          setUserData(prev => ({
            ...prev,
            username: user?.nome || user?.fullName || prev.username,
            totalPoints,
            tournamentsPlayed,
            tournamentsWon,
            prizesWon,
            averageAccuracy: accuracyCount > 0 ? Math.round((totalAccuracy / accuracyCount) * 10) / 10 : 0,
            bestDiscipline: bestDiscipline || 'Geral'
          }));

          const history = participacoes
            .map(p => ({
              id: p.id,
              torneio_id: p.torneio_id,
              name: p.torneio?.titulo || 'Torneio COMAES',
              date: p.entrou_em || p.criado_em || new Date().toISOString(),
              position: p.posicao || '-',
              points: Number(p.pontuacao || 0),
              category: p.disciplina_competida || 'Geral'
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          setTournamentHistory(history);

          const monthly = {};
          participacoes.forEach(p => {
            const date = new Date(p.entrou_em || p.criado_em);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

            if (!monthly[monthYear]) {
              monthly[monthYear] = { month: monthYear, points: 0, tournaments: 0 };
            }
            monthly[monthYear].points += Number(p.pontuacao || 0);
            monthly[monthYear].tournaments += 1;
          });

          const progressData = Object.keys(monthly)
            .sort((a, b) => {
              const [mA, yA] = a.split('/');
              const [mB, yB] = b.split('/');
              return new Date(yA, mA - 1) - new Date(yB, mB - 1);
            })
            .map(key => monthly[key])
            .slice(-4);

          setMonthlyProgress(progressData);
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Não foi possível carregar os dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, token]);

  if (loading && user) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `2px solid ${tokens.border}`,
            borderTopColor: tokens.primary,
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ color: tokens.muted, fontSize: 14 }}>Carregando dashboard…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div style={{ maxWidth: 500, margin: '80px auto', padding: '0 20px' }}>
          <div style={{
            ...cardStyle,
            textAlign: 'center',
            background: tokens.primarySoft,
            padding: 40
          }}>
            <LayoutDashboard size={48} color={tokens.primary} style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: tokens.text, marginBottom: 10 }}>
              Faça login para acessar seu dashboard
            </h2>
            <p style={{ fontSize: 14, color: tokens.muted, marginBottom: 28 }}>
              Conecte-se para acompanhar seu progresso e desempenho.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 32px',
                background: tokens.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Fazer Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !loading) {
    return (
      <Layout>
        <div style={{ maxWidth: 500, margin: '80px auto', padding: '0 20px' }}>
          <div style={{ ...cardStyle, textAlign: 'center', background: tokens.redSoft, padding: 40 }}>
            <AlertCircle size={48} color={tokens.red} style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: tokens.text, marginBottom: 10 }}>
              Erro ao carregar dados
            </h2>
            <p style={{ fontSize: 14, color: tokens.muted, marginBottom: 28 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px',
                background: tokens.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dash-fade {
          animation: fadeIn 0.3s ease both;
        }
        @media (max-width: 768px) {
          .dash-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .dashboard-hero-content {
            flex-direction: column;
            gap: 18px;
          }
          .dashboard-hero-meta {
            width: 100%;
            text-align: left !important;
          }
          .dashboard-shell {
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="dashboard-shell" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Hero Section */}
        <div className="dash-fade" style={{ marginBottom: 32 }}>
          <div style={{
            background: `linear-gradient(135deg, ${tokens.primary} 0%, #6B8BF5 100%)`,
            borderRadius: 20,
            padding: '36px 32px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }} />

            <div className="dashboard-hero-content" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6, fontWeight: 500 }}>
                  Dashboard COMAES
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                  Bem-vindo, {userData.username}
                </h1>
                <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>
                  Acompanhe seu progresso nos torneios e melhore seu desempenho.
                </p>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <Zap size={16} />
                    Nível {nivel?.numero || 1}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <Brain size={16} />
                    {userData.bestDiscipline}
                  </div>
                  {streak > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <Activity size={16} />
                      Sequência: {streak} dias
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-hero-meta" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                  Membro desde
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {new Date(userData.joinDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="dash-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px 16px', marginBottom: 32 }}>
          <StatCard
            title="Torneios"
            value={userData.tournamentsPlayed}
            icon={<Trophy size={20} />}
            accent="#2563EB"
            accentSoft="#DBEAFE"
            subtext="Total de participações"
          />
          <StatCard
            title="Vitórias"
            value={userData.tournamentsWon}
            icon={<CheckCircle2 size={20} />}
            accent="#4F46E5"
            accentSoft="#E0E7FF"
            subtext="Primeiros lugares"
          />
          <StatCard
            title="Pontos"
            value={userData.totalPoints.toLocaleString()}
            icon={<Star size={20} />}
            accent="#0891B2"
            accentSoft="#CFFAFE"
            subtext="Pontos acumulados"
          />
          <StatCard
            title="Precisão"
            value={`${userData.averageAccuracy}%`}
            icon={<Target size={20} />}
            accent="#1E40AF"
            accentSoft="#EFF6FF"
            subtext="Média geral"
          />
        </div>

        {/* Main Content Grid */}
        <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px 24px', marginBottom: 32 }}>
          {/* Left Column - Charts and Recent Tournaments */}
          <div className="dash-fade">
            {/* Progress Chart */}
            {monthlyProgress.length > 0 && (
              <div style={{ ...cardStyle, marginBottom: 24 }}>
                <SectionTitle title="Progresso Mensal" subtitle="Pontos conquistados por mês" />
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyProgress}>
                      <defs>
                        <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={tokens.primary} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={tokens.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: tokens.subtle }} />
                      <YAxis tick={{ fontSize: 11, fill: tokens.subtle }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="points"
                        stroke={tokens.primary}
                        strokeWidth={2}
                        fill="url(#progGrad)"
                        dot={{ r: 4, fill: tokens.primary }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent Tournaments */}
            <div style={cardStyle}>
              <SectionTitle title="Torneios Recentes" subtitle="Seus últimos 5 torneios" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tournamentHistory.length > 0 ? (
                  tournamentHistory.slice(0, 5).map(t => (
                    <TournamentItem
                      key={t.id}
                      tournament={t}
                      onClick={() => navigate(`/torneios/${t.torneio_id}`)}
                    />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: tokens.subtle }}>
                    <Trophy size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ fontSize: 13 }}>Sem torneios ainda</p>
                    <button
                      onClick={() => navigate('/torneios')}
                      style={{
                        marginTop: 12,
                        background: 'none',
                        border: 'none',
                        color: tokens.primary,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      Explorar torneios <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Goals and Achievements */}
          <div className="dash-fade">
            {/* Goals */}
            <div style={cardStyle}>
              <SectionTitle title="Metas" subtitle="Seus objetivos" />

              <GoalCard
                title="Top 25 Global"
                current={Math.max(0, 25 - (userData.currentRank || 0))}
                target={25}
                accent={tokens.primary}
                accentSoft={tokens.primarySoft}
              />

              <GoalCard
                title="10 Vitórias"
                current={userData.tournamentsWon}
                target={10}
                accent={tokens.success}
                accentSoft={tokens.successSoft}
              />

              <GoalCard
                title="5K Pontos"
                current={userData.totalPoints}
                target={5000}
                accent={tokens.purple}
                accentSoft={tokens.purpleSoft}
              />
            </div>

            {/* Streak */}
            {streak > 0 && (
              <div style={{ marginTop: 16 }}>
                <StreakBadge streak={streak} ativa={ativa} card />
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ ...cardStyle, marginTop: 16 }}>
              <SectionTitle title="Ações" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => navigate('/torneios')}
                  style={{
                    padding: '12px 16px',
                    background: tokens.primarySoft,
                    color: tokens.primary,
                    border: `1px solid ${tokens.primary}`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = tokens.primary;
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = tokens.primarySoft;
                    e.target.style.color = tokens.primary;
                  }}
                >
                  Ver Torneios
                </button>
                <button
                  onClick={() => navigate('/teste-conhecimento')}
                  style={{
                    padding: '12px 16px',
                    background: tokens.successSoft,
                    color: tokens.success,
                    border: `1px solid ${tokens.success}`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = tokens.success;
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = tokens.successSoft;
                    e.target.style.color = tokens.success;
                  }}
                >
                  Fazer Teste
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
