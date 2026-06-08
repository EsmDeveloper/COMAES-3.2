/**
 * ColaboradorDashboard.jsx
 * Dashboard para colaboradores com design estrutural do Admin Panel
 * Funcionalidades: estatísticas e gestão de questões
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import colaboradorService from '../../services/colaboradorService';
import shortLogo from '../../assets/short.png';
import {
  BarChart3, CheckCircle, Clock, XCircle, FileText,
  Plus, Menu, X, UserCircle, Settings, LogOut, BookOpen,
  TrendingUp, Layers
} from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { Link } from 'react-router-dom';
import ColaboradorBlocosTab from './ColaboradorBlocosTab';
import MinhasQuestoes from './MinhasQuestoes';

// Componente de cartão de estatística
function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs opacity-75 mt-2">{trend}</p>
          )}
        </div>
        <Icon size={40} className="opacity-20" />
      </div>
    </div>
  );
}

// Badge de status
function StatusBadge({ status }) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aprovada: 'bg-green-100 text-green-800',
    rejeitada: 'bg-red-100 text-red-800',
  };
  const labels = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
  };
  const icons = {
    pendente: Clock,
    aprovada: CheckCircle,
    rejeitada: XCircle,
  };
  const Icon = icons[status] || Clock;

  return (
    <div className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 w-fit ${styles[status] || styles.pendente}`}>
      <Icon className="w-3.5 h-3.5" />
      {labels[status] || status}
    </div>
  );
}

export default function ColaboradorDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    aprovadas: 0,
    pendentes: 0,
    rejeitadas: 0,
    porDificuldade: { facil: 0, medio: 0, dificil: 0 },
    taxaAprovacao: 0
  });
  
  const [questoesRecentes, setQuestoesRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modoQuestoes, setModoQuestoes] = useState('todas');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const displayName = user?.name || user?.nome || 'Colaborador';
  const displayEmail = user?.email || 'colaborador@comaes.ao';
  const disciplina = user?.disciplina_colaborador || user?.disciplina || 'Sem disciplina';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'C';

  // Verificar se usuário é colaborador
  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return; }
    if (user.role === 'admin' || user.isAdmin) { navigate('/administrador', { replace: true }); return; }
    if (user.role !== 'colaborador' || user.status_colaborador !== 'aprovado') {
      navigate('/painel', { replace: true });
    }
  }, [user, navigate]);

  // Carregar dados
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      setError(null);
      try {
        const statsResponse = await colaboradorService.obterEstatisticas();
        const dados = statsResponse.dados;
        
        setEstatisticas({
          total: dados.total || 0,
          aprovadas: dados.aprovadas || 0,
          pendentes: dados.pendentes || 0,
          rejeitadas: dados.rejeitadas || 0,
          porDificuldade: dados.porDificuldade || { facil: 0, medio: 0, dificil: 0 },
          taxaAprovacao: dados.taxaAprovacao || 0
        });
        
        setQuestoesRecentes(dados.ultimasQuestoes || []);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, []);

  // Filtrar questões
  const questoesFiltradas = () => {
    switch (modoQuestoes) {
      case 'aprovadas':
        return questoesRecentes.filter(q => q.status_aprovacao === 'aprovada');
      case 'pendentes':
        return questoesRecentes.filter(q => q.status_aprovacao === 'pendente');
      case 'rejeitadas':
        return questoesRecentes.filter(q => q.status_aprovacao === 'rejeitada');
      default:
        return questoesRecentes;
    }
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    setMobileSidebarOpen(false);
    logout();
    navigate('/login');
  };

  const renderAvatarButton = (compact = false) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setProfileMenuOpen(prev => !prev)}
        className={`w-full flex items-center gap-3 rounded-xl text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 ${
          compact ? 'p-1.5' : 'p-2'
        }`}
        aria-expanded={profileMenuOpen}
        aria-haspopup="menu"
      >
        <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md overflow-hidden flex-shrink-0`}>
          <span className={compact ? 'text-sm' : 'text-base'}>{initials}</span>
        </div>
        {!compact && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold truncate text-gray-800">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
          </div>
        )}
      </button>

      {profileMenuOpen && (
        <div
          role="menu"
          className={`absolute ${compact ? 'right-0 top-12' : 'left-0 bottom-16'} z-50 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl`}
        >
          <button
            type="button"
            onClick={() => { setProfileMenuOpen(false); navigate('/perfil'); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <UserCircle className="w-4 h-4" />
            Meu perfil
          </button>
          <button
            type="button"
            onClick={() => { setProfileMenuOpen(false); navigate('/configuracoes'); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando painel...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <XCircle className="w-5 h-5" />
              Erro ao carregar painel
            </div>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-72 bg-white shadow-xl border-r border-slate-200 flex-col h-screen overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex-shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <img src={shortLogo} alt="COMAES" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-lg font-bold text-gray-800">Colaborador</h1>
                <p className="text-xs text-gray-500">Painel de Questões</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto bg-slate-50 p-4">
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">
                Menu Principal
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Visão Geral</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">
                Conteúdo
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('blocos')}
                  className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'blocos'
                      ? 'bg-blue-600 text-white shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span>Blocos de Questões</span>
                </button>
                <button
                  onClick={() => setActiveTab('questoes')}
                  className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'questoes'
                      ? 'bg-blue-600 text-white shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Minhas Questões</span>
                </button>
              </div>
            </div>
          </nav>

          <div className="border-t border-slate-200 p-6 flex-shrink-0 bg-white">
            {renderAvatarButton()}
          </div>
        </div>

        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <h1 className="text-lg font-bold">Colaborador</h1>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-500 hover:text-blue-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
                    Menu Principal
                  </p>
                  <button
                    onClick={() => { setActiveTab('dashboard'); setMobileSidebarOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-blue-50 font-medium flex items-center gap-3"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Visão Geral
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
                    Conteúdo
                  </p>
                  <button
                    onClick={() => { setActiveTab('blocos'); setMobileSidebarOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-blue-50 font-medium flex items-center gap-3 mb-2"
                  >
                    <Layers className="w-5 h-5" />
                    Blocos de Questões
                  </button>
                  <button
                    onClick={() => { setActiveTab('questoes'); setMobileSidebarOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-blue-50 font-medium flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5" />
                    Minhas Questões
                  </button>
                </div>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-lg border-b border-slate-200 flex-shrink-0">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  className="md:hidden w-12 h-12 flex items-center justify-center rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:block">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {activeTab === 'dashboard' ? 'Painel do Colaborador' :
                     activeTab === 'blocos' ? 'Meus Blocos de Questões' :
                     'Minhas Questões'}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {activeTab === 'dashboard' ? 'Acompanhe suas estatísticas e atividades' :
                     activeTab === 'blocos' ? 'Organize suas questões em blocos' :
                     'Gerencie suas questões de ensino'} ({disciplina})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="md:hidden">
                  {renderAvatarButton(true)}
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full px-6 py-8">
              {activeTab === 'dashboard' ? (
                <>
                  {/* Estatísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                      icon={FileText}
                      label="Total de Questões"
                      value={estatisticas.total}
                      color="from-blue-500 to-blue-600"
                    />
                    <StatCard
                      icon={CheckCircle}
                      label="Aprovadas"
                      value={estatisticas.aprovadas}
                      color="from-green-500 to-green-600"
                      trend={`${estatisticas.taxaAprovacao}% de aceitação`}
                    />
                    <StatCard
                      icon={Clock}
                      label="Pendentes"
                      value={estatisticas.pendentes}
                      color="from-yellow-500 to-yellow-600"
                    />
                    <StatCard
                      icon={XCircle}
                      label="Rejeitadas"
                      value={estatisticas.rejeitadas}
                      color="from-red-500 to-red-600"
                    />
                  </div>

                  {/* Questões Recentes */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="border-b border-slate-200">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-800">Questões Recentes</h2>
                          <p className="text-sm text-slate-500">Suas questões mais recentes</p>
                        </div>
                        
                        <div className="flex bg-slate-100 rounded-lg p-1">
                          {['todas', 'aprovadas', 'pendentes', 'rejeitadas'].map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setModoQuestoes(tab)}
                              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                modoQuestoes === tab
                                  ? 'bg-white text-blue-700 shadow-sm'
                                  : 'text-slate-600 hover:text-slate-800'
                              }`}
                            >
                              {tab === 'todas' ? 'Todas' :
                               tab === 'aprovadas' ? 'Aprovadas' :
                               tab === 'pendentes' ? 'Pendentes' : 'Rejeitadas'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {questoesFiltradas().length === 0 ? (
                      <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                          {modoQuestoes === 'todas' ? 'Nenhuma questão encontrada' : `Nenhuma questão ${modoQuestoes} encontrada`}
                        </h3>
                        <p className="text-slate-500 mb-6">
                          {modoQuestoes === 'todas'
                            ? 'Comece criando sua primeira questão!'
                            : `Você não tem questões ${modoQuestoes === 'aprovadas' ? 'aprovadas' : 
                               modoQuestoes === 'pendentes' ? 'pendentes' : 'rejeitadas'}`}
                        </p>
                        <button
                          onClick={() => setActiveTab('questoes')}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 inline-flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Criar Questão
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Título</th>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Dificuldade</th>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Status</th>
                              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Data</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {questoesFiltradas().map((questao) => (
                              <tr key={questao.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-medium text-slate-800 line-clamp-1">{questao.titulo}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    questao.dificuldade === 'facil' ? 'bg-green-100 text-green-700' :
                                    questao.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {questao.dificuldade === 'facil' ? 'Fácil' :
                                     questao.dificuldade === 'medio' ? 'Médio' : 'Difícil'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={questao.status_aprovacao} />
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                  {new Date(questao.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600">
                          Mostrando {questoesFiltradas().length} questão{questoesFiltradas().length !== 1 ? 's' : ''}
                        </p>
                        <button
                          onClick={() => setActiveTab('questoes')}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Ver todas as questões →
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeTab === 'blocos' ? (
                <ColaboradorBlocosTab token={token} />
              ) : (
                <MinhasQuestoes />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
