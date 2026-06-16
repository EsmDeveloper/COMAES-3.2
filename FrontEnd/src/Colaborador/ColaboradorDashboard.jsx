import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Clock, AlertCircle, CheckCircle, LogOut, Menu, X, Settings, UserCircle, Layers } from 'lucide-react';
import './ColaboradorDashboard.css';

// ============================================
// COMPONENTE: Card de Estatística
// ============================================
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
      </div>
      <Icon className="w-10 h-10 text-slate-400" />
    </div>
  </div>
);

// ============================================
// COMPONENTE: Aba Padrão (Content)
// ============================================
const TabContent = ({ children }) => (
  <div className="animate-fade-in">
    {children}
  </div>
);

// ============================================
// COMPONENTE: Aba Criar Blocos
// ============================================
const CriarBlocosTab = ({ token, apiBase }) => {
  const [blocos, setBlocos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    disciplina: '',
    dificuldade: 'facil',
    status: 'rascunho'
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const disciplinas = [
    { id: 'matematica', label: 'Matemática' },
    { id: 'ingles', label: 'Inglês' },
    { id: 'programacao', label: 'Programação' }
  ];

  const dificuldades = [
    { id: 'facil', label: 'Fácil' },
    { id: 'medio', label: 'Médio' },
    { id: 'dificil', label: 'Difícil' }
  ];

  const carregarBlocos = useCallback(async () => {
    console.log('🔄 Iniciando carregamento de blocos...');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    console.log('API Base:', apiBase);
    
    setLoading(true);
    try {
      const url = `${apiBase}/api/colaborador/blocos`;
      console.log('📡 Fazendo requisição para:', url);
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Status da resposta:', response.status);
      console.log('📊 Headers da resposta:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        console.error(`❌ API retornou status ${response.status}`);
        const errorText = await response.text();
        console.error('Erro:', errorText);
        setBlocos([]);
        return;
      }
      
      const data = await response.json();
      console.log('✅ Resposta completa:', JSON.stringify(data, null, 2));
      
      // Extrair blocos com debug
      let blocosList = [];
      console.log('🔍 Procurando blocos em:');
      console.log('  - data.dados?.blocos:', data.dados?.blocos);
      console.log('  - data.blocos:', data.blocos);
      console.log('  - data.dados:', data.dados);
      
      if (data.dados && Array.isArray(data.dados.blocos)) {
        blocosList = data.dados.blocos;
        console.log('✅ Blocos encontrados em data.dados.blocos:', blocosList.length);
      } else if (Array.isArray(data.blocos)) {
        blocosList = data.blocos;
        console.log('✅ Blocos encontrados em data.blocos:', blocosList.length);
      } else if (Array.isArray(data.dados)) {
        blocosList = data.dados;
        console.log('✅ Blocos encontrados em data.dados:', blocosList.length);
      }
      
      console.log('📦 Blocos finais a setar:', blocosList);
      setBlocos(blocosList);
      console.log('✅ Estado de blocos atualizado');
      
    } catch (error) {
      console.error('❌ Erro ao carregar blocos:', error);
      console.error('Stack:', error.stack);
      setBlocos([]);
    } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => {
    // Por enquanto, não carregamos blocos automaticamente devido a erro no backend
    // Após criar, recarregamos manualmente
    console.log('✅ Componente CriarBlocosTab montado');
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.disciplina) {
      showMessage('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/colaborador/blocos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          descricao: formData.descricao,
          disciplina: formData.disciplina,
          dificuldade: formData.dificuldade,
          status: formData.status
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar bloco');
      }

      showMessage('Bloco criado com sucesso!', 'success');
      setFormData({ titulo: '', descricao: '', disciplina: '', dificuldade: 'facil', status: 'rascunho' });
      // Recarregar blocos após criar com um pequeno delay
      setTimeout(() => carregarBlocos(), 500);
    } catch (error) {
      console.error('Erro:', error);
      showMessage('Erro ao criar bloco: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blocoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este bloco?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/colaborador/blocos/${blocoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar');
      }

      showMessage('Bloco excluído com sucesso', 'success');
      setTimeout(() => carregarBlocos(), 500);
    } catch (error) {
      console.error('Erro:', error);
      showMessage('Erro ao excluir bloco: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabContent>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Criar Novo Bloco
            </h3>

            {message.text && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Algebra Básica"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do bloco..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Disciplina *
                </label>
                <select
                  value={formData.disciplina}
                  onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                >
                  <option value="">Selecione uma disciplina</option>
                  {disciplinas.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dificuldade
                </label>
                <select
                  value={formData.dificuldade}
                  onChange={(e) => setFormData({ ...formData, dificuldade: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                >
                  {dificuldades.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="publicado">Publicado</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Criar Bloco'}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Blocos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Meus Blocos</h3>
              <button
                onClick={() => carregarBlocos()}
                disabled={loading}
                className="px-3 py-1 text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Recarregando...' : 'Recarregar'}
              </button>
            </div>

            {loading && blocos.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="text-slate-500">Carregando blocos...</p>
              </div>
            ) : blocos.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Nenhum bloco criado ainda</p>
                <p className="text-slate-400 text-sm">Crie seu primeiro bloco usando o formulário ao lado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blocos.map(bloco => (
                  <div key={bloco.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">{bloco.titulo}</h4>
                        {bloco.descricao && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{bloco.descricao}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {disciplinas.find(d => d.id === bloco.disciplina)?.label || bloco.disciplina}
                          </span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                            {dificuldades.find(d => d.id === bloco.dificuldade)?.label || bloco.dificuldade}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            bloco.status === 'publicado'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {bloco.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(bloco.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TabContent>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: ColaboradorDashboard
// ============================================
const ColaboradorDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [questoes, setQuestoes] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingQuestoes, setLoadingQuestoes] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

  useEffect(() => {
    if (token) {
      fetchQuestoes();
    }
  }, [token]);

  const fetchQuestoes = async () => {
    if (!token) {
      setLoadingQuestoes(false);
      return;
    }
    setLoadingQuestoes(true);
    try {
      const response = await fetch(`${API_BASE}/api/questoes/colaborador/minhas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        console.warn(`API retornou status ${response.status}, usando dados padrão`);
        setQuestoes([]);
        return;
      }
      const data = await response.json();
      const questoesList = data.questoes || data.dados?.questoes || [];
      setQuestoes(questoesList);
    } catch (error) {
      console.error('Erro ao buscar questões:', error.message);
      // Usar dados padrão em caso de erro
      setQuestoes([]);
    } finally {
      setLoadingQuestoes(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || user?.nome || 'Colaborador';
  const disciplinaField = user?.disciplina_colaborador || 'Não informado';
  const userEmail = user?.email || 'Email não disponível';
  
  const getDisciplinaDisplay = (disc) => {
    const disciplinaMap = {
      'matematica': 'Matemática',
      'ingles': 'Inglês',
      'programacao': 'Programação'
    };
    return disciplinaMap[disc] || disc;
  };
  
  const disciplinaDisplay = getDisciplinaDisplay(disciplinaField);
  const initials = displayName.split(' ').slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('') || 'C';

  const questoesPendentes = questoes.filter(q => q.status_aprovacao === 'pendente');
  const questoesAprovadas = questoes.filter(q => q.status_aprovacao === 'aprovada');
  const questoesRejeitadas = questoes.filter(q => q.status_aprovacao === 'rejeitada');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText, hidden: false },
    { id: 'minhas-questoes', label: 'Minhas Questões', icon: FileText, hidden: false },
    { id: 'criar-blocos', label: 'Criar Blocos', icon: Layers, hidden: false },
    { id: 'perfil', label: 'Meu Perfil', icon: UserCircle, hidden: false },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, hidden: true }
  ];

  const handleMenuClick = (item) => {
    if (item.id === 'dashboard' || item.id === 'criar-blocos') {
      setActiveTab(item.id);
      setMobileSidebarOpen(false);
    } else if (item.id === 'minhas-questoes') {
      navigate('/colaborador/questoes');
    } else if (item.id === 'perfil') {
      navigate('/perfil');
    } else if (item.id === 'configuracoes') {
      navigate('/configuracoes');
    }
  };

  const renderAvatarButton = (compact = false) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        className={`w-full flex items-center gap-3 rounded-xl text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 ${
          compact ? 'p-1.5' : 'p-2'
        }`}
      >
        <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}>
          {initials}
        </div>
        {!compact && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold truncate text-gray-800">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        )}
      </button>

      {profileMenuOpen && (
        <div className={`absolute ${compact ? 'right-0 top-12' : 'left-0 bottom-16'} z-50 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl`}>
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
            onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 bg-white shadow-xl border-r border-slate-200 flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex-shrink-0 bg-white">
          <h1 className="text-xl font-bold text-gray-800">Colaborador</h1>
          <p className="text-xs text-slate-500 mt-1">{disciplinaDisplay}</p>
        </div>

        <nav className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">Menu</h3>
            <div className="space-y-2">
              {menuItems.map(item => (
                !item.hidden && (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg font-semibold'
                        : 'text-slate-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              ))}
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Colaborador</h1>
                <p className="text-xs text-slate-500 mt-1">{disciplinaDisplay}</p>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)} 
                className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto bg-slate-50 p-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">Menu</h3>
                <div className="space-y-2">
                  {menuItems.map(item => (
                    !item.hidden && (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item)}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                          activeTab === item.id
                            ? 'bg-blue-600 text-white shadow-lg font-semibold'
                            : 'text-slate-700 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  ))}
                </div>
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
                className="md:hidden w-12 h-12 flex items-center justify-center rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200" 
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:block">
                <h2 className="text-2xl font-bold text-slate-800">
                  {activeTab === 'dashboard' && 'Painel do Colaborador'}
                  {activeTab === 'criar-blocos' && 'Gerenciar Blocos de Questões'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {activeTab === 'dashboard' && 'Gerencie suas questões e conteúdo'}
                  {activeTab === 'criar-blocos' && 'Crie e organize seus blocos de questões'}
                </p>
              </div>
            </div>

            <div className="md:hidden">
              {renderAvatarButton(true)}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto w-full px-6 py-8">
            {activeTab === 'dashboard' && (
              <TabContent>
                {loadingQuestoes ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Carregando estatísticas...</p>
                    <p className="text-slate-400 text-sm mt-2">Tentando conectar a {API_BASE}</p>
                    <button
                      onClick={fetchQuestoes}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : (
                  <>
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Questões Aprovadas"
                    value={questoesAprovadas.length}
                    icon={CheckCircle}
                    color="border-green-500"
                  />
                  <StatCard
                    title="Em Revisão"
                    value={questoesPendentes.length}
                    icon={Clock}
                    color="border-yellow-500"
                  />
                  <StatCard
                    title="Rejeitadas"
                    value={questoesRejeitadas.length}
                    icon={AlertCircle}
                    color="border-red-500"
                  />
                  <StatCard
                    title="Total"
                    value={questoes.length}
                    icon={FileText}
                    color="border-blue-500"
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Ações Rápidas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => navigate('/colaborador/questoes')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Questão
                    </button>
                    <button
                      onClick={() => setActiveTab('criar-blocos')}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Layers className="w-5 h-5" />
                      Criar Blocos
                    </button>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Discipline Info */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Informações da Disciplina</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                        <span className="text-slate-600 font-medium">Disciplina</span>
                        <span className="text-slate-800 font-semibold">{disciplinaDisplay}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                        <span className="text-slate-600 font-medium">Email</span>
                        <span className="text-slate-800 font-semibold text-sm">{userEmail}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                        <span className="text-slate-600 font-medium">Total Submetidas</span>
                        <span className="text-slate-800 font-semibold">{questoes.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Taxa de Aprovação</span>
                        <span className="text-slate-800 font-semibold">
                          {questoes.length > 0 
                            ? `${Math.round((questoesAprovadas.length / questoes.length) * 100)}%`
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Dicas Importantes</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <p className="text-slate-700 text-sm">Revise cuidadosamente cada questão antes de submeter</p>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <p className="text-slate-700 text-sm">Certifique-se de que a resposta correta está nas opções</p>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <p className="text-slate-700 text-sm">Adicione uma explicação para melhorar a aprovação</p>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                        <p className="text-slate-700 text-sm">Organize suas questões em blocos por dificuldade</p>
                      </div>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </TabContent>
            )}

            {activeTab === 'criar-blocos' && (
              <CriarBlocosTab token={token} apiBase={API_BASE} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColaboradorDashboard;
