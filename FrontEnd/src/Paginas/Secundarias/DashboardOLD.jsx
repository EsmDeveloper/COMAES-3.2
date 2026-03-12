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
  Lock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart as RechartsPieChart, Pie, Cell, 
  AreaChart, Area,
  ResponsiveContainer
} from 'recharts';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Verificar se usuário está autenticado
  useEffect(() => {
    if (!user) {
      setIsRedirecting(true);
      // Redirecionar para login após 2 segundos
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Estado inicial com dados do usuário
  const [userData, setUserData] = useState({
    username: user?.fullName || user?.username || "Usuário COMAES",
    joinDate: user?.registrationDate || "2024-01-15",
    totalPoints: user?.points || 2450,
    currentRank: 45,
    previousRank: 52,
    tournamentsPlayed: 18,
    tournamentsWon: 7,
    prizesWon: 3
  });

  // Dados de participação em torneios
  const [tournamentHistory, setTournamentHistory] = useState([
    { id: 1, name: "Math Olympiad 2024", date: "2024-03-15", position: 1, points: 300, category: "Matemática" },
    { id: 2, name: "Code Challenge Pro", date: "2024-02-28", position: 3, points: 200, category: "Programação" },
    { id: 3, name: "English Master Cup", date: "2024-02-10", position: 2, points: 250, category: "Inglês" },
    { id: 4, name: "Math Sprint 2024", date: "2024-01-20", position: 1, points: 350, category: "Matemática" },
    { id: 5, name: "Programming Hackathon", date: "2023-12-05", position: 4, points: 150, category: "Programação" },
  ]);

  // Dados para gráfico de áreas
  const [areaParticipation, setAreaParticipation] = useState([
    { name: 'Matemática', value: 8, color: '#3B82F6' },
    { name: 'Programação', value: 6, color: '#10B981' },
    { name: 'Inglês', value: 4, color: '#F59E0B' },
  ]);

  // Dados para gráfico de progresso do ranking
  const [rankingHistory, setRankingHistory] = useState([
    { month: 'Jan', rank: 85 },
    { month: 'Fev', rank: 72 },
    { month: 'Mar', rank: 68 },
    { month: 'Abr', rank: 52 },
    { month: 'Mai', rank: 45 },
  ]);

  // Dados para gráfico de pontos por categoria
  const [pointsByCategory, setPointsByCategory] = useState([
    { category: 'Matemática', pontos: 1250 },
    { category: 'Programação', pontos: 750 },
    { category: 'Inglês', pontos: 450 },
  ]);

  // Dados para gráfico de premiações
  const [prizesDistribution, setPrizesDistribution] = useState([
    { position: '1º Lugar', quantidade: 3, color: '#FFD700' },
    { position: '2º Lugar', quantidade: 2, color: '#C0C0C0' },
    { position: '3º Lugar', quantidade: 2, color: '#CD7F32' },
  ]);

  // Cards de estatísticas
  const statCards = [
    {
      id: 1,
      title: "Torneios Participados",
      value: userData.tournamentsPlayed,
      icon: <Trophy className="h-6 w-6" />,
      color: "bg-blue-500",
      change: "+3 este mês"
    },
    {
      id: 2,
      title: "Posição Atual",
      value: `#${userData.currentRank}`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-green-500",
      change: `Subiu ${userData.previousRank - userData.currentRank} posições`
    },
    {
      id: 3,
      title: "Total de Pontos",
      value: userData.totalPoints.toLocaleString(),
      icon: <Star className="h-6 w-6" />,
      color: "bg-purple-500",
      change: "+450 este mês"
    },
    {
      id: 4,
      title: "Prêmios Conquistados",
      value: userData.prizesWon,
      icon: <Award className="h-6 w-6" />,
      color: "bg-yellow-500",
      change: "2 de ouro"
    }
  ];

  // Recent tournaments
  const recentTournaments = [
    {
      id: 1,
      name: "Math Challenge 2024",
      date: "2024-03-20",
      category: "Matemática",
      position: 1,
      points: 300
    },
    {
      id: 2,
      name: "Python Masters",
      date: "2024-03-18",
      category: "Programação",
      position: 2,
      points: 250
    },
    {
      id: 3,
      name: "English Debate",
      date: "2024-03-15",
      category: "Inglês",
      position: 3,
      points: 200
    }
  ];

  // Se usuário não está autenticado, mostrar tela de login
  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-red-100 to-orange-100">
                <LayoutDashboard className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Restrito ao Dashboard
            </h2>
            
            <p className="text-gray-700 mb-6">
              Seu dashboard COMAES está disponível apenas para usuários autenticados.
              <br />
              Faça login ou cadastre-se para acompanhar suas estatísticas e progresso.
            </p>
            
            {isRedirecting ? (
              <div className="mb-6">
                <div className="inline-flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 font-medium">Redirecionando para login...</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">Você será redirecionado automaticamente em instantes</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Fazer Login
                </button>
                <button
                  onClick={() => navigate('/cadastro')}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all"
                >
                  Cadastrar-se
                </button>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">O que você verá no Dashboard COMAES:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Estatísticas detalhadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Gráficos de progresso</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Histórico de torneios</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Metas e conquistas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Usuário autenticado - mostrar dashboard normal
  return (
    <Layout>
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard COMAES</h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo de volta, <span className="font-semibold text-blue-600">{userData.username}</span>!
              Veja suas estatísticas e progresso.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">ID do Usuário</div>
              <div className="text-sm font-medium text-gray-900">{user.id ? user.id.toString().slice(-8) : 'COMAES-USER'}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Membro desde {new Date(userData.joinDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div 
            key={card.id} 
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div className={`${card.color} p-3 rounded-xl`}>
                {card.icon}
              </div>
              <span className="text-sm font-medium text-gray-600">{card.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mt-4">{card.value}</h3>
            <p className="text-gray-600">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de Participação por Área */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Participação por Área</h3>
              <p className="text-gray-600">Número de torneios por categoria</p>
            </div>
            <BookOpen className="h-6 w-6 text-blue-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={areaParticipation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {areaParticipation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Progresso do Ranking */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Evolução do Ranking</h3>
              <p className="text-gray-600">Histórico de posições nos últimos meses</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rankingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis reversed domain={[100, 0]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="rank" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pontos por Categoria */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Pontos por Categoria</h3>
              <p className="text-gray-600">Distribuição de pontos conquistados</p>
            </div>
            <BarChart3 className="h-6 w-6 text-purple-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pontos" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Premiações */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Distribuição de Prêmios</h3>
              <p className="text-gray-600">Posições conquistadas nos pódios</p>
            </div>
            <Medal className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={prizesDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ position, quantidade }) => `${position}: ${quantidade}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {prizesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tournaments & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Torneios Recentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Torneios Recentes COMAES</h3>
              <p className="text-gray-600">Últimas competições participadas</p>
            </div>
            <Clock className="h-6 w-6 text-gray-500" />
          </div>
          <div className="space-y-4">
            {recentTournaments.map((tournament) => (
              <div 
                key={tournament.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    tournament.category === 'Matemática' ? 'bg-blue-100 text-blue-600' :
                    tournament.category === 'Programação' ? 'bg-green-100 text-green-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {tournament.category === 'Matemática' ? 'M' :
                     tournament.category === 'Programação' ? 'P' : 'I'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{tournament.name}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(tournament.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className={`px-3 py-1 rounded-full ${
                      tournament.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                      tournament.position === 2 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      <span className="font-bold">{tournament.position}º</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Posição</p>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{tournament.points} pts</div>
                    <p className="text-xs text-gray-600">Pontos</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conquistas e Metas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Conquistas COMAES</h3>
              <p className="text-gray-600">Metas e realizações</p>
            </div>
            <Target className="h-6 w-6 text-red-500" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Top 25 no Ranking</h4>
                  <p className="text-sm text-gray-600">Faltam 20 posições</p>
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(userData.currentRank / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">10 Torneios Vencidos</h4>
                  <p className="text-sm text-gray-600">Faltam {10 - userData.tournamentsWon}</p>
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(userData.tournamentsWon / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">5.000 Pontos Totais</h4>
                  <p className="text-sm text-gray-600">Faltam {5000 - userData.totalPoints}</p>
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(userData.totalPoints / 5000) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Prêmio Diamante</h4>
                  <p className="text-sm text-gray-600">5 prêmios de ouro</p>
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${(prizesDistribution[0].quantidade / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de Dados */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo de Desempenho COMAES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {areaParticipation.reduce((acc, area) => acc + area.value, 0)}
            </div>
            <p className="text-gray-600">Total de Participações</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {prizesDistribution.reduce((acc, prize) => acc + prize.quantidade, 0)}
            </div>
            <p className="text-gray-600">Premiações no Pódio</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {pointsByCategory.reduce((acc, cat) => acc + cat.pontos, 0).toLocaleString()}
            </div>
            <p className="text-gray-600">Pontos Totais</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {rankingHistory[rankingHistory.length - 1].rank - userData.currentRank}
            </div>
            <p className="text-gray-600">Posições Subidas</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
