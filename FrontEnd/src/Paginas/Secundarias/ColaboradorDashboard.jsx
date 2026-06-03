/**
 * ColaboradorDashboard.jsx
 * Dashboard completo para colaboradores com estatísticas e gestão de questões
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Nota: CRUD de questões usa questoesService diretamente em MinhasQuestoes.jsx
// Aqui usamos apenas colaboradorService para estatísticas e perfil específicos do colaborador
import colaboradorService from '../../services/colaboradorService';
import {
  BarChart3, PieChart, CheckCircle, Clock, XCircle, FileText,
  Plus, Search, Filter, TrendingUp, BookOpen, Award
} from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { Link } from 'react-router-dom';

// Componente de cartão de estatística
function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Icon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500 font-medium">{label}</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-green-600">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Badge de status
function StatusBadge({ status }) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    aprovada: 'bg-green-100 text-green-800 border border-green-200',
    rejeitada: 'bg-red-100 text-red-800 border border-red-200',
  };
  const labels = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pendente}`}>
      {labels[status] || status}
    </span>
  );
}

export default function ColaboradorDashboard() {
  const { user } = useAuth();
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
  const [activeTab, setActiveTab] = useState('todas'); // 'todas', 'aprovadas', 'pendentes', 'rejeitadas'

  // Verificar se usuário é colaborador — redirecionar para o destino correto do seu papel
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
        // Carregar estatísticas usando o serviço específico do colaborador
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
        
        // Carregar questões recentes
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

  // Função para filtrar questões por status
  const questoesFiltradas = () => {
    switch (activeTab) {
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

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando dashboard...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <XCircle className="w-5 h-5" />
              Erro ao carregar dashboard
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
      <div className="min-h-screen bg-slate-50 pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-10 h-10" />
                  <div>
                    <h1 className="text-2xl font-bold">Painel do Colaborador</h1>
                    <p className="text-teal-100">
                      {user?.nome} - {user?.disciplina_colaborador}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/colaborador/questoes"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Ver Todas as Questões
                </Link>
                <Link
                  to="/colaborador/questoes"
                  onClick={(e) => {
                    e.preventDefault();
                    // Simular clique no botão de nova questão
                    navigate('/colaborador/questoes');
                    // Em uma implementação real, abriria o modal diretamente
                  }}
                  className="px-4 py-2 bg-white text-teal-700 rounded-xl font-medium hover:bg-teal-50 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Questão
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="container mx-auto px-4 -mt-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={FileText}
              label="Total de Questões"
              value={estatisticas.total}
              color="border-l-4 border-l-blue-500"
            />
            <StatCard
              icon={CheckCircle}
              label="Aprovadas"
              value={estatisticas.aprovadas}
              color="border-l-4 border-l-green-500"
              trend={`${estatisticas.taxaAprovacao}% de aceitação`}
            />
            <StatCard
              icon={Clock}
              label="Pendentes"
              value={estatisticas.pendentes}
              color="border-l-4 border-l-yellow-500"
            />
            <StatCard
              icon={XCircle}
              label="Rejeitadas"
              value={estatisticas.rejeitadas}
              color="border-l-4 border-l-red-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Gráfico de Dificuldade */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Distribuição por Dificuldade</h2>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Fácil', value: estatisticas.porDificuldade.facil, color: 'bg-green-500', width: (estatisticas.porDificuldade.facil / estatisticas.total) * 100 || 0 },
                  { label: 'Médio', value: estatisticas.porDificuldade.medio, color: 'bg-yellow-500', width: (estatisticas.porDificuldade.medio / estatisticas.total) * 100 || 0 },
                  { label: 'Difícil', value: estatisticas.porDificuldade.dificil, color: 'bg-red-500', width: (estatisticas.porDificuldade.dificil / estatisticas.total) * 100 || 0 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-medium text-slate-800">{item.value}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.width}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status das Questões */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Status das Questões</h2>
                <PieChart className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-4">
                {[
                  { status: 'aprovada', label: 'Aprovadas', value: estatisticas.aprovadas, color: 'bg-green-500' },
                  { status: 'pendente', label: 'Pendentes', value: estatisticas.pendentes, color: 'bg-yellow-500' },
                  { status: 'rejeitada', label: 'Rejeitadas', value: estatisticas.rejeitadas, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{item.value}</span>
                      <span className="text-xs text-slate-500">
                        ({estatisticas.total > 0 ? Math.round((item.value / estatisticas.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Questões Recentes */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Questões Recentes</h2>
                  <p className="text-sm text-slate-500">Suas questões mais recentes</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    {['todas', 'aprovadas', 'pendentes', 'rejeitadas'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab
                            ? 'bg-white text-teal-700 shadow-sm'
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
            </div>

            {questoesFiltradas().length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  {activeTab === 'todas' ? 'Nenhuma questão encontrada' : `Nenhuma questão ${activeTab} encontrada`}
                </h3>
                <p className="text-slate-500 mb-6">
                  {activeTab === 'todas'
                    ? 'Comece criando sua primeira questão!'
                    : `Você não tem questões ${activeTab === 'aprovadas' ? 'aprovadas' : 
                       activeTab === 'pendentes' ? 'pendentes' : 'rejeitadas'}`}
                </p>
                <Link
                  to="/colaborador/questoes"
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Criar Primeira Questão
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Título</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Dificuldade</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Pontos</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Status</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questoesFiltradas().map((questao) => (
                      <tr key={questao.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-800 line-clamp-1">{questao.titulo}</p>
                            <p className="text-sm text-slate-500 line-clamp-1">{questao.descricao?.substring(0, 60)}...</p>
                          </div>
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
                        <td className="px-6 py-4 text-slate-600">{questao.pontos}</td>
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
                <Link
                  to="/colaborador/questoes"
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Ver todas as questões →
                </Link>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-800">Criar Questão</h3>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                Crie uma nova questão para sua disciplina ({user?.disciplina_colaborador}).
              </p>
              <Link
                to="/colaborador/questoes"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/colaborador/questoes');
                  // Em uma implementação real, abriria o modal diretamente
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Nova Questão
              </Link>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-teal-800">Gerenciar Questões</h3>
              </div>
              <p className="text-sm text-teal-700 mb-4">
                Veja e edite todas as suas questões em uma única página.
              </p>
              <Link
                to="/colaborador/questoes"
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                <Search className="w-4 h-4" />
                Ver Todas as Questões
              </Link>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-800">Seu Progresso</h3>
              </div>
              <p className="text-sm text-purple-700 mb-2">
                Taxa de aprovação: <span className="font-bold">{estatisticas.taxaAprovacao}%</span>
              </p>
              <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${estatisticas.taxaAprovacao}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}