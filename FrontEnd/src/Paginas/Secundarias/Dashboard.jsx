import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import NivelBadge, { getNivelMeta } from '../../components/NivelBadge';
import useNivel from '../../hooks/useNivel';
import StreakBadge from '../../components/StreakBadge';
import useStreak from '../../hooks/useStreak';
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
  Sparkles,
  TrendingDown,
  Activity,
  Zap,
  Brain
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart as RechartsPieChart, Pie, Cell, 
  AreaChart, Area,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
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
        {label && <p style={{ marginBottom: 4, opacity: 0.6, fontSize: 11 }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i}><strong>{p.value}</strong> {p.name}</p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ title, value, icon, accent, accentSoft, badge, trend, trendValue }) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
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
      <div style={{ fontSize: 30, fontWeight: 700, color: tokens.text, lineHeight: 1.1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 14, color: tokens.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}
        {trend && (
          <span style={{ 
            display: 'flex', alignItems: 'center', gap: 2,
            color: trend > 0 ? tokens.success : tokens.red,
            fontSize: 12, fontWeight: 500
          }}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHeader({ title, subtitle, icon, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 2 }}>{title}</h3>
        <p style={{ fontSize: 13, color: tokens.muted }}>{subtitle}</p>
      </div>
      <div style={{ color: tokens.subtle, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        {action}
      </div>
    </div>
  );
}

/* ─── Progress goal card ─────────────────────────────────────── */
function GoalCard({ title, subtitle, progress, current, target, accent, accentSoft }) {
  const pct = Math.min(Math.max(progress, 0), 100);
  return (
    <div style={{
      background: accentSoft,
      borderRadius: 14,
      padding: '16px 18px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: tokens.text }}>{title}</div>
          <div style={{ fontSize: 12, color: tokens.muted, marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{pct.toFixed(0)}%</div>
      </div>
      <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: accent,
          borderRadius: 999,
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: tokens.muted }}>
        <span>{current} atual</span>
        <span>{target} meta</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { nivel, xpTotal, progresso } = useNivel();
  const { streak, maximo, ativa, mensagem: streakMsg } = useStreak();
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showAllTournaments, setShowAllTournaments] = useState(false);
  
  useEffect(() => {
    if (!user) {
      setIsRedirecting(true);
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const [userData, setUserData] = useState({
    id: user?.id,
    username: user?.fullName || user?.nome || user?.username || "Usuário COMAES",
    email: user?.email || "",
    joinDate: user?.createdAt || user?.registrationDate || new Date().toISOString(),
    totalPoints: 0,
    currentRank: 0,
    previousRank: 0,
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    prizesWon: 0,
    totalTimeSpent: 0,
    averageAccuracy: 0,
    bestDiscipline: "",
    currentLevel: user?.nivel || 1
  });

  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [areaParticipation, setAreaParticipation] = useState([]);
  const [rankingHistory, setRankingHistory] = useState([]);
  const [pointsByCategory, setPointsByCategory] = useState([]);
  const [performanceByDiscipline, setPerformanceByDiscipline] = useState([]);
  const [prizesDistribution, setPrizesDistribution] = useState([
    { position: '1º Lugar', quantidade: 0, color: tokens.amber },
    { position: '2º Lugar', quantidade: 0, color: '#94A3B8' },
    { position: '3º Lugar', quantidade: 0, color: '#CD7F32' },
  ]);
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [disciplineStats, setDisciplineStats] = useState({
    matematica: { points: 0, accuracy: 0, time: 0, tournaments: 0, bestPosition: null },
    ingles: { points: 0, accuracy: 0, time: 0, tournaments: 0, bestPosition: null },
    programacao: { points: 0, accuracy: 0, time: 0, tournaments: 0, bestPosition: null }
  });
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para calcular métricas avançadas
  const calculateAdvancedMetrics = (participacoes) => {
    // Estatísticas por disciplina
    const stats = {
      matematica: { points: 0, accuracy: 0, time: 0, tournaments: 0, bestPosition: null, positions: [] },
      ingles: { points: 0, accuracy: 0, time: 0, tournaments: 0, bestPosition: null, positions: [] },
      programacao: { points: 0, accuracy: 0, time: 0, tournaments: 0, bestPosition: null, positions: [] }
    };

    let totalTime = 0;
    let totalAccuracy = 0;
    let accuracyCount = 0;

    participacoes.forEach(p => {
      const disciplina = p.disciplina_competida?.toLowerCase() || 'geral';
      if (stats[disciplina]) {
        stats[disciplina].points += Number(p.pontuacao) || 0;
        stats[disciplina].time += Number(p.tempo_total) || 0;
        stats[disciplina].tournaments += 1;
        
        if (p.posicao && p.posicao > 0) {
          if (stats[disciplina].bestPosition === null || p.posicao < stats[disciplina].bestPosition) {
            stats[disciplina].bestPosition = p.posicao;
          }
        }
        
        if (p.posicao && p.posicao <= 3) {
          stats[disciplina].positions.push(p.posicao);
        }

        if (p.precisao) {
          stats[disciplina].accuracy += Number(p.precisao);
          accuracyCount++;
        }

        totalTime += Number(p.tempo_total) || 0;
        if (p.precisao) totalAccuracy += Number(p.precisao);
      }
    });

    // Calcular médias
    Object.keys(stats).forEach(key => {
      if (stats[key].tournaments > 0) {
        stats[key].accuracy = stats[key].accuracy / stats[key].tournaments;
      }
    });

    // Determinar melhor disciplina
    let bestDiscipline = '';
    let maxPoints = -1;
    Object.entries(stats).forEach(([key, value]) => {
      if (value.points > maxPoints) {
        maxPoints = value.points;
        bestDiscipline = key;
      }
    });

    return {
      disciplineStats: stats,
      totalTimeSpent: totalTime,
      averageAccuracy: accuracyCount > 0 ? totalAccuracy / accuracyCount : 0,
      bestDiscipline: bestDiscipline.charAt(0).toUpperCase() + bestDiscipline.slice(1)
    };
  };

  // Função para gerar histórico de ranking mensal
  const generateRankingHistory = (participacoes) => {
    const monthlyData = {};
    
    participacoes.forEach(p => {
      const date = new Date(p.entrou_em || p.criado_em);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { 
          month: monthYear, 
          positions: [], 
          points: [],
          bestPosition: null
        };
      }
      
      if (p.posicao && p.posicao > 0) {
        monthlyData[monthYear].positions.push(p.posicao);
        if (p.posicao < monthlyData[monthYear].bestPosition) {
          monthlyData[monthYear].bestPosition = p.posicao;
        }
      }
      monthlyData[monthYear].points.push(Number(p.pontuacao) || 0);
    });

    return Object.keys(monthlyData)
      .sort((a, b) => {
        const [mA, yA] = a.split('/');
        const [mB, yB] = b.split('/');
        return new Date(yA, mA - 1) - new Date(yB, mB - 1);
      })
      .map(key => ({
        month: key,
        rank: monthlyData[key].bestPosition,
        points: monthlyData[key].points.reduce((a, b) => a + b, 0)
      }))
      .slice(-6); // Últimos 6 meses
  };

  // Função para gerar progresso mensal
  const generateMonthlyProgress = (participacoes) => {
    const monthly = {};
    
    participacoes.forEach(p => {
      const date = new Date(p.entrou_em || p.criado_em);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthly[monthYear]) {
        monthly[monthYear] = { 
          month: monthYear, 
          points: 0, 
          tournaments: 0,
          positions: []
        };
      }
      
      monthly[monthYear].points += Number(p.pontuacao) || 0;
      monthly[monthYear].tournaments += 1;
      if (p.posicao && p.posicao > 0) {
        monthly[monthYear].positions.push(p.posicao);
      }
    });

    return Object.keys(monthly)
      .sort((a, b) => {
        const [mA, yA] = a.split('/');
        const [mB, yB] = b.split('/');
        return new Date(yA, mA - 1) - new Date(yB, mB - 1);
      })
      .map(key => ({
        month: key,
        points: monthly[key].points,
        tournaments: monthly[key].tournaments,
        avgPosition: monthly[key].positions.length > 0 
          ? Math.round(monthly[key].positions.reduce((a, b) => a + b, 0) / monthly[key].positions.length) 
          : null
      }));
  };

  // Função para gerar dados de performance por disciplina para radar chart
  const generatePerformanceByDiscipline = (stats) => {
    return Object.keys(stats).map(key => ({
      discipline: key.charAt(0).toUpperCase() + key.slice(1),
      points: Math.min(100, (stats[key].points / 1000) * 100), // Normalizado para 0-100
      accuracy: stats[key].accuracy,
      tournaments: stats[key].tournaments * 20, // Normalizado
      time: Math.min(100, (stats[key].time / 3600) * 10) // Normalizado
    }));
  };

  // Buscar dados do ranking global
  const fetchGlobalRanking = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/participantes/ranking/global`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const userRanking = result.data.find(r => r.usuario_id === userId);
          return userRanking ? userRanking.posicao : 0;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar ranking global:", error);
    }
    return 0;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Buscar participações do usuário
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/usuarios/${user.id}/participacoes`);
        const result = await response.json();
        
        // Buscar ranking global
        const globalRank = await fetchGlobalRanking(user.id);
        
        if (result.success) {
          const participacoes = result.data;
          
          // Calcular métricas básicas
          const totalPoints = participacoes.reduce((acc, p) => acc + Number(p.pontuacao || 0), 0);
          const tournamentsPlayed = participacoes.length;
          const tournamentsWon = participacoes.filter(p => p.posicao === 1).length;
          const prizesWon = participacoes.filter(p => p.posicao && p.posicao <= 3).length;
          
          // Calcular métricas avançadas
          const { disciplineStats, totalTimeSpent, averageAccuracy, bestDiscipline } = calculateAdvancedMetrics(participacoes);
          
          setUserData(prev => ({
            ...prev,
            id: user.id,
            username: user?.nome || user?.fullName || user?.username || prev.username,
            email: user?.email || "",
            joinDate: user?.createdAt || user?.registrationDate || prev.joinDate,
            totalPoints,
            currentRank: globalRank,
            tournamentsPlayed,
            tournamentsWon,
            prizesWon,
            totalTimeSpent,
            averageAccuracy: averageAccuracy.toFixed(1),
            bestDiscipline,
            currentLevel: user?.nivel || 1
          }));

          setDisciplineStats(disciplineStats);

          // Histórico de torneios
          const history = participacoes.map(p => ({
            id: p.id,
            torneio_id: p.torneio_id,
            name: p.torneio?.titulo || "Torneio COMAES",
            date: p.entrou_em || p.torneio?.inicia_em || p.criado_em || new Date().toISOString(),
            position: p.posicao || "-",
            points: Number(p.pontuacao || 0),
            category: p.disciplina_competida || "Geral",
            timeSpent: p.tempo_total || 0,
            accuracy: p.precisao || 0,
            level: p.nivel_atual || "iniciante",
            casesResolved: p.casos_resolvidos || 0
          })).sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setTournamentHistory(history);

          // Participação por área
          const areas = {};
          participacoes.forEach(p => {
            const area = p.disciplina_competida || "Geral";
            areas[area] = (areas[area] || 0) + 1;
          });
          
          const areaColors = {
            'Matemática': tokens.primary,
            'Inglês': tokens.success,
            'Programação': tokens.purple,
            'Geral': tokens.amber
          };
          
          setAreaParticipation(Object.keys(areas).map(name => ({
            name, 
            value: areas[name], 
            color: areaColors[name] || tokens.amber
          })));

          // Pontos por categoria
          const pointsCat = {};
          participacoes.forEach(p => {
            const area = p.disciplina_competida || "Geral";
            pointsCat[area] = (pointsCat[area] || 0) + Number(p.pontuacao || 0);
          });
          
          setPointsByCategory(Object.keys(pointsCat).map(category => ({ 
            category, 
            pontos: pointsCat[category] 
          })));

          // Performance por disciplina (radar)
          setPerformanceByDiscipline(generatePerformanceByDiscipline(disciplineStats));

          // Distribuição de prêmios
          setPrizesDistribution([
            { position: '1º Lugar', quantidade: participacoes.filter(p => p.posicao === 1).length, color: tokens.amber },
            { position: '2º Lugar', quantidade: participacoes.filter(p => p.posicao === 2).length, color: '#94A3B8' },
            { position: '3º Lugar', quantidade: participacoes.filter(p => p.posicao === 3).length, color: '#CD7F32' },
          ]);

          // Histórico de ranking
          setRankingHistory(generateRankingHistory(participacoes));

          // Progresso mensal
          setMonthlyProgress(generateMonthlyProgress(participacoes));

          // Conquistas recentes (dos metadados ou conquistas)
          const allAchievements = participacoes
            .filter(p => p.conquistas && p.conquistas.length > 0)
            .flatMap(p => p.conquistas)
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);
          
          setRecentAchievements(allAchievements);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setError("Não foi possível carregar seus dados. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Formatar tempo
  const formatTime = (seconds) => {
    if (!seconds) return "0min";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  // Cards de estatísticas
  const statCards = [
    { 
      title: "Torneios Participados", 
      value: userData.tournamentsPlayed, 
      icon: <Trophy size={20}/>, 
      accent: tokens.primary, 
      accentSoft: tokens.primarySoft, 
      badge: "Total",
      trend: userData.tournamentsPlayed > 0 ? 12 : 0
    },
    { 
      title: "Posição no Ranking", 
      value: userData.currentRank > 0 ? `#${userData.currentRank}` : "—", 
      icon: <TrendingUp size={20}/>, 
      accent: '#10B981', 
      accentSoft: tokens.successSoft, 
      badge: "Global",
      trend: userData.currentRank > 0 && userData.previousRank > 0 ? 
        Math.round(((userData.previousRank - userData.currentRank) / userData.previousRank) * 100) : 0
    },
    { 
      title: "Pontos Acumulados", 
      value: userData.totalPoints.toLocaleString(), 
      icon: <Star size={20}/>, 
      accent: tokens.purple, 
      accentSoft: tokens.purpleSoft, 
      badge: "Carreira",
      trend: userData.totalPoints > 0 ? 8 : 0
    },
    { 
      title: "Prêmios no Pódio", 
      value: userData.prizesWon, 
      icon: <Award size={20}/>, 
      accent: '#D97706', 
      accentSoft: tokens.amberSoft, 
      badge: "Top 3",
      trend: userData.prizesWon > 0 ? 5 : 0
    },
    { 
      title: "Tempo Total", 
      value: formatTime(userData.totalTimeSpent), 
      icon: <Clock size={20}/>, 
      accent: tokens.red, 
      accentSoft: tokens.redSoft, 
      badge: "Dedicado",
      trend: userData.totalTimeSpent > 0 ? 15 : 0
    },
    { 
      title: "Precisão Média", 
      value: `${userData.averageAccuracy || 0}%`, 
      icon: <Target size={20}/>, 
      accent: tokens.success, 
      accentSoft: tokens.successSoft, 
      badge: "Acertos",
      trend: userData.averageAccuracy > 0 ? 3 : 0
    }
  ];

  // Estilos de posição
  const positionStyle = (pos) => {
    if (pos === 1) return { background: '#FEF9C3', color: '#92400E' };
    if (pos === 2) return { background: '#F1F5F9', color: '#475569' };
    if (pos === 3) return { background: '#FFF7ED', color: '#9A3412' };
    return { background: tokens.primarySoft, color: tokens.primary };
  };

  // Ícone por categoria
  const categoryIcon = (cat) => {
    const map = { 
      'Matemática': 'M', 
      'Programação': 'P', 
      'Inglês': 'I',
      'Geral': 'G'
    };
    return map[cat] || cat?.[0] || '?';
  };

  // Cores por categoria
  const categoryColors = (cat) => {
    const map = {
      'Matemática': { bg: tokens.primarySoft, color: tokens.primary },
      'Programação': { bg: tokens.successSoft, color: '#059669' },
      'Inglês': { bg: tokens.purpleSoft, color: tokens.purple },
      'Geral': { bg: tokens.amberSoft, color: '#92400E' }
    };
    return map[cat] || { bg: tokens.amberSoft, color: '#92400E' };
  };

  if (loading && user) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: `3px solid ${tokens.border}`,
            borderTopColor: tokens.primary,
            animation: 'spin 0.8s linear infinite',
          }}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: tokens.muted, fontSize: 15 }}>Carregando seu dashboard…</span>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div style={{ maxWidth: 560, margin: '60px auto', padding: '0 24px' }}>
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
            <h2 style={{ fontSize: 22, fontWeight: 700, color: tokens.text, marginBottom: 12 }}>
              Acesso Restrito ao Dashboard
            </h2>
            <p style={{ fontSize: 15, color: tokens.muted, lineHeight: 1.6, marginBottom: 28 }}>
              Seu dashboard COMAES está disponível apenas para usuários autenticados.
              Faça login ou cadastre-se para acompanhar suas estatísticas e progresso.
            </p>

            {isRedirecting ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `2px solid ${tokens.border}`, borderTopColor: tokens.primary,
                  animation: 'spin 0.8s linear infinite',
                }}/>
                <span style={{ color: tokens.primary, fontSize: 14 }}>Redirecionando para login…</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
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
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ maxWidth: 560, margin: '60px auto', padding: '0 24px' }}>
          <div style={{
            ...cardStyle,
            textAlign: 'center',
            background: tokens.redSoft,
            border: `1px solid ${tokens.red}`,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: tokens.redSoft, margin: '0 auto 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LayoutDashboard size={32} color={tokens.red} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: tokens.text, marginBottom: 12 }}>
              Ops! Algo deu errado
            </h2>
            <p style={{ fontSize: 15, color: tokens.muted, lineHeight: 1.6, marginBottom: 28 }}>
              {error}
            </p>
            <button onClick={() => window.location.reload()} style={{
              padding: '12px 28px', background: tokens.primary, color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
              Tentar novamente
            </button>
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

      {/* ── Hero Section ── */}
      <div className="dash-anim" style={{ marginBottom: 36, animationDelay: '0ms' }}>
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

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Sparkles size={14} style={{ opacity: 0.7 }}/>
              <span style={{ fontSize: 13, opacity: 0.75, fontWeight: 500, letterSpacing: '0.04em' }}>
                Dashboard COMAES
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              Bem-vindo de volta, {userData.username}! 👋
            </h1>
            <p style={{ fontSize: 14, opacity: 0.75 }}>
              Acompanhe seu progresso e estatísticas das competições.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} />
                <span>Nível {nivel?.numero || userData.currentLevel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={14} />
                <span>{userData.bestDiscipline || "Geral"} Specialist</span>
              </div>
              {/* Streak inline no Hero */}
              {streak > 0 && (
                <StreakBadge streak={streak} ativa={ativa} compact />
              )}
            </div>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
            position: 'relative',
          }}>
            {/* Card de nível com barra — exibido no hero do dashboard */}
            {nivel && (
              <div style={{ marginBottom: 4 }}>
                <NivelBadge nivelObj={nivel} xpTotal={xpTotal} showBar />
              </div>
            )}
            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '10px 16px', backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2, textAlign: 'right' }}>
                ID do Usuário
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {user.id ? user.id.toString().slice(-8).padStart(8, '0') : 'COMAES-USER'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.75 }}>
              <Calendar size={13}/>
              Membro desde {new Date(userData.joinDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              {userData.email}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards grid ── */}
      <div className="dash-anim" style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px', 
        marginBottom: 28, 
        animationDelay: '60ms',
      }}>
        {statCards.map((card, i) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="dash-anim" style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
        gap: 20, 
        marginBottom: 20, 
        animationDelay: '120ms',
      }}>
        {/* Radar Chart - Performance por Disciplina */}
        <div style={cardStyle}>
          <SectionHeader 
            title="Performance por Disciplina" 
            subtitle="Comparativo de métricas por área" 
            icon={<Activity size={18}/>}
          />
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceByDiscipline}>
                <PolarGrid stroke={tokens.border} />
                <PolarAngleAxis dataKey="discipline" tick={{ fill: tokens.muted, fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: tokens.muted, fontSize: 10 }} />
                <Radar name="Pontos" dataKey="points" stroke={tokens.primary} fill={tokens.primary} fillOpacity={0.3} />
                <Radar name="Precisão" dataKey="accuracy" stroke={tokens.success} fill={tokens.success} fillOpacity={0.3} />
                <Radar name="Participação" dataKey="tournaments" stroke={tokens.purple} fill={tokens.purple} fillOpacity={0.3} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart - Progresso Mensal */}
        <div style={cardStyle}>
          <SectionHeader 
            title="Progresso Mensal" 
            subtitle="Evolução de pontos nos últimos meses" 
            icon={<TrendingUp size={18}/>}
          />
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyProgress} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tokens.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={tokens.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: tokens.subtle }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 12, fill: tokens.subtle }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area 
                  type="monotone" 
                  dataKey="points" 
                  stroke={tokens.primary} 
                  strokeWidth={2.5}
                  fill="url(#progressGrad)" 
                  dot={{ r: 4, fill: tokens.primary, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Pontos"
                />
                <Area 
                  type="monotone" 
                  dataKey="tournaments" 
                  stroke={tokens.success} 
                  strokeWidth={2}
                  fill="none"
                  dot={{ r: 3, fill: tokens.success }}
                  name="Torneios"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="dash-anim" style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 20, 
        marginBottom: 28, 
        animationDelay: '160ms',
      }}>
        {/* Bar Chart - Pontos por Categoria */}
        <div style={cardStyle}>
          <SectionHeader 
            title="Pontos por Categoria" 
            subtitle="Distribuição de pontos conquistados" 
            icon={<BarChart3 size={18}/>}
          />
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsByCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tokens.purple} stopOpacity={1}/>
                    <stop offset="100%" stopColor={tokens.primary} stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} vertical={false}/>
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: tokens.subtle }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 12, fill: tokens.subtle }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="pontos" fill="url(#barGrad)" radius={[6,6,0,0]} maxBarSize={52} name="Pontos"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Participação por Área */}
        <div style={cardStyle}>
          <SectionHeader 
            title="Participação por Área" 
            subtitle="Número de torneios por categoria" 
            icon={<PieChart size={18}/>}
          />
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={areaParticipation} 
                  cx="50%" 
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90} 
                  innerRadius={42} 
                  dataKey="value" 
                  paddingAngle={3}
                >
                  {areaParticipation.map((e, i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }}/>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Distribuição de Prêmios */}
        <div style={cardStyle}>
          <SectionHeader 
            title="Distribuição de Prêmios" 
            subtitle="Posições conquistadas nos pódios" 
            icon={<Medal size={18}/>}
          />
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={prizesDistribution} 
                  cx="50%" 
                  cy="50%"
                  labelLine={false}
                  label={({ position, quantidade }) => `${position}: ${quantidade}`}
                  outerRadius={90} 
                  innerRadius={42} 
                  dataKey="quantidade" 
                  paddingAngle={3}
                >
                  {prizesDistribution.map((e, i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }}/>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Charts Row 3 ── */}
      <div className="dash-anim" style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 20, 
        marginBottom: 28, 
        animationDelay: '200ms',
      }}>
        {/* Line Chart - Evolução do Ranking */}
        <div style={cardStyle}>
          <SectionHeader 
            title="Evolução do Ranking" 
            subtitle="Melhor posição por mês" 
            icon={<TrendingUp size={18}/>}
          />
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rankingHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: tokens.subtle }} axisLine={false} tickLine={false}/>
                <YAxis reversed domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 12, fill: tokens.subtle }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Line 
                  type="monotone" 
                  dataKey="rank" 
                  stroke={tokens.primary} 
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: tokens.primary, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Posição"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discipline Stats Cards */}
        <div style={cardStyle}>
          <SectionHeader 
            title="Estatísticas por Disciplina" 
            subtitle="Detalhamento de performance" 
            icon={<Brain size={18}/>}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.keys(disciplineStats).map(discipline => {
              const stats = disciplineStats[discipline];
              const colors = categoryColors(discipline.charAt(0).toUpperCase() + discipline.slice(1));
              return (
                <div key={discipline} style={{
                  padding: 12,
                  background: tokens.bg,
                  borderRadius: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28,
                      borderRadius: 8,
                      background: colors.bg,
                      color: colors.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 12,
                    }}>
                      {categoryIcon(discipline.charAt(0).toUpperCase() + discipline.slice(1))}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: tokens.text }}>
                      {discipline.charAt(0).toUpperCase() + discipline.slice(1)}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 8,
                    fontSize: 12
                  }}>
                    <div>
                      <div style={{ color: tokens.muted }}>Pontos</div>
                      <div style={{ fontWeight: 600, color: tokens.text }}>{stats.points}</div>
                    </div>
                    <div>
                      <div style={{ color: tokens.muted }}>Precisão</div>
                      <div style={{ fontWeight: 600, color: tokens.text }}>{stats.accuracy.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div style={{ color: tokens.muted }}>Melhor Pos.</div>
                      <div style={{ fontWeight: 600, color: tokens.text }}>
                        {stats.bestPosition !== null ? `#${stats.bestPosition}` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Tournaments & Goals ── */}
      <div className="dash-anim dashboard-bottom-grid" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '28px',
        animationDelay: '240ms',
      }}>

        {/* Recent tournaments */}
        <div style={{ ...cardStyle, flex: '1 1 500px', minWidth: 'min(100%, 500px)' }}>
          <SectionHeader 
            title="Torneios Recentes" 
            subtitle="Últimas competições participadas" 
            icon={<Clock size={18}/>}
            action={
              <span 
                onClick={() => setShowAllTournaments(!showAllTournaments)} 
                style={{ fontSize: 12, color: tokens.primary, cursor: 'pointer', fontWeight: 600 }}
              >
                {showAllTournaments ? 'Ver menos' : 'Ver todos'}
              </span>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tournamentHistory.length > 0 ? (
              (showAllTournaments ? tournamentHistory : tournamentHistory.slice(0, 5)).map(t => {
                const cc = categoryColors(t.category);
                const ps = positionStyle(t.position);
                return (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: tokens.bg,
                    borderRadius: 14,
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='#EDEEF5'}
                  onMouseLeave={e=>e.currentTarget.style.background=tokens.bg}
                  onClick={() => navigate(`/torneios/${t.torneio_id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: cc.bg, color: cc.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14,
                      }}>
                        {categoryIcon(t.category)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: tokens.text }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: tokens.subtle }}>
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          ...ps,
                          borderRadius: 8, padding: '3px 10px',
                          fontSize: 13, fontWeight: 700,
                        }}>
                          {t.position}º
                        </div>
                        <div style={{ fontSize: 11, color: tokens.subtle, marginTop: 3 }}>Posição</div>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: 60 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>{t.points}</div>
                        <div style={{ fontSize: 11, color: tokens.subtle }}>pts</div>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: 50 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: tokens.text }}>{t.casesResolved}</div>
                        <div style={{ fontSize: 10, color: tokens.subtle }}>casos</div>
                      </div>
                      <ChevronRight size={16} color={tokens.subtle}/>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: tokens.subtle }}>
                <Trophy size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }}/>
                <p style={{ fontSize: 14 }}>Você ainda não participou de nenhum torneio.</p>
                <button onClick={() => navigate('/torneios')} style={{
                  marginTop: 16, background: 'none', border: 'none',
                  color: tokens.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  textDecoration: 'underline',
                }}>
                  Ver torneios disponíveis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Goals & Achievements */}
        <div style={{ ...cardStyle, flex: '1 1 300px', minWidth: 'min(100%, 300px)' }}>
          <SectionHeader 
            title="Metas e Conquistas" 
            subtitle="Seu progresso para os próximos objetivos" 
            icon={<Target size={18}/>}
          />
          
          <GoalCard
            title="Top 25 no Ranking Global"
            subtitle={`Posição atual: ${userData.currentRank || '—'}`}
            progress={userData.currentRank > 0 ? Math.max(0, 100 - (userData.currentRank / 25) * 100) : 0}
            current={userData.currentRank || 0}
            target={25}
            accent={tokens.primary}
            accentSoft={tokens.primarySoft}
          />
          
          <GoalCard
            title="10 Torneios Vencidos"
            subtitle={`${userData.tournamentsWon} de 10`}
            progress={(userData.tournamentsWon / 10) * 100}
            current={userData.tournamentsWon}
            target={10}
            accent="#10B981"
            accentSoft={tokens.successSoft}
          />
          
          <GoalCard
            title="5.000 Pontos Totais"
            subtitle={`${userData.totalPoints.toLocaleString()} de 5.000`}
            progress={(userData.totalPoints / 5000) * 100}
            current={userData.totalPoints.toLocaleString()}
            target="5.000"
            accent={tokens.purple}
            accentSoft={tokens.purpleSoft}
          />
          
          <GoalCard
            title="Prêmio Diamante"
            subtitle={`${prizesDistribution[0].quantidade} de 5 primeiros lugares`}
            progress={(prizesDistribution[0].quantidade / 5) * 100}
            current={prizesDistribution[0].quantidade}
            target={5}
            accent="#D97706"
            accentSoft={tokens.amberSoft}
          />

          {/* ── Card de Streak ── */}
          <div style={{ marginTop: 4 }}>
            <StreakBadge
              streak={streak}
              maximo={maximo}
              ativa={ativa}
              mensagem={streakMsg}
              card
            />
          </div>

          {recentAchievements.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text, marginBottom: 8 }}>
                Conquistas Recentes
              </div>
              {recentAchievements.map((ach, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', background: tokens.bg,
                  borderRadius: 8, marginBottom: 4
                }}>
                  <Medal size={14} color={tokens.amber} />
                  <span style={{ fontSize: 12 }}>{ach.nome}</span>
                  <span style={{ fontSize: 10, color: tokens.muted, marginLeft: 'auto' }}>
                    {new Date(ach.data).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Strip ── */}
      <div className="dash-anim" style={{
        ...cardStyle,
        background: `linear-gradient(135deg, ${tokens.primarySoft} 0%, #F5F3FF 100%)`,
        border: `1px solid #DDE1F7`,
        animationDelay: '280ms',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: tokens.text }}>
            Resumo de Desempenho COMAES
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
            {[
              { label: 'Total Participações', value: userData.tournamentsPlayed, color: tokens.primary },
              { label: 'Prêmios no Pódio', value: prizesDistribution.reduce((a,b) => a + b.quantidade, 0), color: '#10B981' },
              { label: 'Pontos Totais', value: userData.totalPoints.toLocaleString(), color: tokens.purple },
              { label: 'Precisão Média', value: `${userData.averageAccuracy || 0}%`, color: tokens.success },
              { label: 'Melhor Disciplina', value: userData.bestDiscipline || '-', color: tokens.amber },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: tokens.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
