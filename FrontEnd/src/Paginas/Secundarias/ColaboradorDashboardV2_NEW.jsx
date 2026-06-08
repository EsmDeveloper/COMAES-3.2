/**
 * ColaboradorDashboardV2.jsx - FASE 2 Implementation
 * 
 * Dashboard do Colaborador com design estilo Admin Panel
 * Features:
 * - Profile management (view/edit)
 * - Blocos management (CRUD with status)
 * - Questões management (CRUD with status)
 * - Statistics dashboard
 * - Responsive design
 * - Full API integration with FASE 1 backend
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, X, LogOut, UserCircle, Settings, BarChart3, BookOpen, 
  FileText, Plus, Edit, Trash2, Eye, Check, AlertCircle, 
  TrendingUp, Clock, CheckCircle, ChevronDown, Search, Loader,
  Save, ArrowLeft, AlertTriangle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

// ════════════════════════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const StatusBadge = ({ status, type = 'bloco' }) => {
  const statusKey = type === 'questao' ? 'status_aprovacao' : 'status';
  
  if (type === 'questao') {
    switch (status) {
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock size={14} /> Pendente
          </span>
        );
      case 'aprovada':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle size={14} /> Aprovada
          </span>
        );
      case 'rejeitada':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <AlertCircle size={14} /> Rejeitada
          </span>
        );
      default:
        return null;
    }
  }

  // For blocos
  switch (status) {
    case 'pendente':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <Clock size={14} /> Pendente
        </span>
      );
    case 'aprovado':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle size={14} /> Aprovado
        </span>
      );
    case 'rejeitado':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          <AlertCircle size={14} /> Rejeitado
        </span>
      );
    default:
      return null;
  }
};

// ════════════════════════════════════════════════════════════════════════════
// STATISTICS CARD
// ════════════════════════════════════════════════════════════════════════════

const StatsCard = ({ icon: Icon, title, value, color = 'from-blue-500 to-indigo-600' }) => (
  <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <Icon size={40} className="opacity-20" />
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ════════════════════════════════════════════════════════════════════════════

const DashboardTab = ({ stats, user }) => (
  <div className="space-y-8">
    {/* Header */}
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        Bem-vindo, {user?.name || user?.nome || 'Colaborador'}!
      </h2>
      <p className="text-gray-600">
        Disciplina: <span className="font-semibold capitalize">{user?.disciplina_colaborador || 'N/A'}</span>
      </p>
    </div>

    {/* Statistics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard 
        icon={BookOpen}
        title="Blocos Criados"
        value={stats?.total_blocos || 0}
        color="from-blue-500 to-indigo-600"
      />
      <StatsCard 
        icon={FileText}
        title="Questões Criadas"
        value={stats?.total_questoes || 0}
        color="from-purple-500 to-pink-600"
      />
      <StatsCard 
        icon={Clock}
        title="Aguardando Revisão"
        value={stats?.pendentes || 0}
        color="from-yellow-500 to-orange-600"
      />
      <StatsCard 
        icon={CheckCircle}
        title="Aprovados"
        value={stats?.aprovados || 0}
        color="from-green-500 to-emerald-600"
      />
    </div>

    {/* Content Summary */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">📋 Resumo de Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 font-medium">Pendentes de Revisão</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats?.pendentes || 0}</p>
          <p className="text-xs text-yellow-700 mt-2">Aguardando aprovação do admin</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-medium">Aprovados</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats?.aprovados || 0}</p>
          <p className="text-xs text-green-700 mt-2">Pronto para uso em torneios</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-800 font-medium">Rejeitados</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats?.rejeitados || 0}</p>
          <p className="text-xs text-red-700 mt-2">Requer revisão</p>
        </div>
      </div>
    </div>

    {/* Info Box */}
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <p className="text-blue-900 font-medium">💡 Como Funciona</p>
      <p className="text-blue-800 text-sm mt-2">
        Todo conteúdo que você cria começa como <strong>"Pendente"</strong> (aguardando revisão do administrador).
        Após aprovação, seu conteúdo fica <strong>"Aprovado"</strong> e pronto para uso em torneios e testes.
        Você pode editar apenas conteúdo pendente. Conteúdo rejeitado pode ser deletado para recomeçar.
      </p>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// MEUS DADOS TAB (PROFILE)
// ════════════════════════════════════════════════════════════════════════════

const MeusDadosTab = ({ user, token, onUpdate }) => {
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [dados, setDados] = useState({
    nome: user?.name || user?.nome || '',
    email: user?.email || '',
    disciplina: user?.disciplina_colaborador || '',
    nivel_academico: user?.nivel_academico || '',
    biografia: user?.biografia || '',
    telefone: user?.telefone || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const response = await fetch(`${API_BASE}/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: dados.nome,
          nivel_academico: dados.nivel_academico,
          biografia: dados.biografia,
          telefone: dados.telefone
        })
      });

      if (!response.ok) throw new Error('Falha ao salvar dados');
      
      setEditando(false);
      onUpdate?.(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Meus Dados</h2>
        <p className="text-gray-600">Visualize e edite seu perfil de colaborador</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {erro && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded">
            {erro}
          </div>
        )}

        <div className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
            {editando ? (
              <input
                type="text"
                name="nome"
                value={dados.nome}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 py-2">{dados.nome}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <p className="text-gray-800 py-2">{dados.email}</p>
          </div>

          {/* Disciplina (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Disciplina</label>
            <p className="text-gray-800 py-2 capitalize">{dados.disciplina}</p>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
            {editando ? (
              <input
                type="tel"
                name="telefone"
                value={dados.telefone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 py-2">{dados.telefone || '-'}</p>
            )}
          </div>

          {/* Nível Acadêmico */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nível Acadêmico</label>
            {editando ? (
              <select
                name="nivel_academico"
                value={dados.nivel_academico}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecionar...</option>
                <option value="estudante_universitario">Estudante Universitário</option>
                <option value="tecnico">Técnico</option>
                <option value="licenciado">Licenciado</option>
                <option value="mestre">Mestre</option>
                <option value="doutor">Doutor</option>
                <option value="professor">Professor</option>
                <option value="profissional">Profissional</option>
              </select>
            ) : (
              <p className="text-gray-800 py-2">{dados.nivel_academico || '-'}</p>
            )}
          </div>

          {/* Biografia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Biografia</label>
            {editando ? (
              <textarea
                name="biografia"
                value={dados.biografia}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 py-2">{dados.biografia || '-'}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            {editando ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={carregando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  {carregando ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                  Salvar
                </button>
                <button
                  onClick={() => setEditando(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditando(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Edit size={18} /> Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// BLOCOS TAB
// ════════════════════════════════════════════════════════════════════════════

const BlocosTab = ({ token, disciplina }) => {
  const [blocos, setBlocos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [stats, setStats] = useState({ pendentes: 0, aprovados: 0, rejeitados: 0 });
  const [formData, setFormData] = useState({ titulo: '', descricao: '', dificuldade: 'medio' });

  // Carregar blocos
  useEffect(() => {
    fetchBlocos();
  }, []);

  const fetchBlocos = async () => {
    try {
      setCarregando(true);
      const params = new URLSearchParams({ pagina: 1, limite: 100 });
      if (filtroStatus !== 'todos') params.append('status', filtroStatus);
      
      const response = await fetch(`${API_BASE}/api/colaborador/blocos?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Falha ao carregar blocos');
      const data = await response.json();
      
      setBlocos(data.dados?.blocos || []);
      setStats(data.dados?.estatisticas || {});
      setErro(null);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleCriar = async () => {
    if (!formData.titulo.trim() || !formData.descricao.trim()) {
      setErro('Título e descrição são obrigatórios');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/colaborador/blocos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Falha ao criar bloco');
      
      setFormData({ titulo: '', descricao: '', dificuldade: 'medio' });
      setMostrarForm(false);
      fetchBlocos();
    } catch (err) {
      setErro(err.message);
    }
  };

  const handleEditar = async (id) => {
    if (!editando?.titulo.trim() || !editando?.descricao.trim()) {
      setErro('Título e descrição são obrigatórios');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/colaborador/blocos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: editando.titulo,
          descricao: editando.descricao,
          dificuldade: editando.dificuldade
        })
      });

      if (!response.ok) throw new Error('Falha ao atualizar bloco');
      
      setEditando(null);
      fetchBlocos();
    } catch (err) {
      setErro(err.message);
    }
  };

  const handleDeletar = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este bloco?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/colaborador/blocos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Falha ao deletar bloco');
      fetchBlocos();
    } catch (err) {
      setErro(err.message);
    }
  };

  const blocosFilterados = blocos.filter(b => 
    b.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Meus Blocos de Questões</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Novo Bloco
        </button>
      </div>

      {erro && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded">
          {erro}
        </div>
      )}

      {/* Create Form */}
      {mostrarForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Criar Novo Bloco</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Título"
              value={formData.titulo}
              onChange={e => setFormData({...formData, titulo: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Descrição"
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={formData.dificuldade}
              onChange={e => setFormData({...formData, dificuldade: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCriar}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg"
              >
                Criar Bloco
              </button>
              <button
                onClick={() => setMostrarForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm font-medium">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pendentes || 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 text-sm font-medium">Aprovados</p>
          <p className="text-2xl font-bold text-green-900">{stats.aprovados || 0}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 text-sm font-medium">Rejeitados</p>
          <p className="text-2xl font-bold text-red-900">{stats.rejeitados || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar blocos..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={filtroStatus}
          onChange={e => {
            setFiltroStatus(e.target.value);
            fetchBlocos();
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="todos">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
        </select>
      </div>

      {/* List */}
      {carregando ? (
        <div className="text-center py-8">
          <Loader className="animate-spin mx-auto" />
        </div>
      ) : blocosFilterados.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          Nenhum bloco encontrado
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Título</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Dificuldade</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {blocosFilterados.map((bloco, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-800">{bloco.titulo}</td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={bloco.status} />
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">{bloco.dificuldade}</td>
                  <td className="px-6 py-4 text-right text-sm flex gap-2 justify-end">
                    {bloco.status === 'pendente' && (
                      <button
                        onClick={() => setEditando(bloco)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {['pendente', 'rejeitado'].includes(bloco.status) && (
                      <button
                        onClick={() => handleDeletar(bloco.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    {bloco.status !== 'pendente' && (
                      <span className="text-gray-500 text-xs">Sem ações</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Editar Bloco</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editando.titulo}
                onChange={e => setEditando({...editando, titulo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                value={editando.descricao}
                onChange={e => setEditando({...editando, descricao: e.target.value})}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(editando.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditando(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const ColaboradorDashboardV2 = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!user || user.role !== 'colaborador') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      section: 'Visão Geral'
    },
    {
      id: 'meus-dados',
      label: 'Meus Dados',
      icon: UserCircle,
      section: 'Perfil'
    },
    {
      id: 'blocos',
      label: 'Blocos de Questões',
      icon: BookOpen,
      section: 'Conteúdo'
    },
    {
      id: 'questoes',
      label: 'Questões',
      icon: FileText,
      section: 'Conteúdo'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <div className={`${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed lg:static lg:translate-x-0 transition-transform z-40 w-64 bg-slate-900 text-white h-screen overflow-y-auto`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              COMAES
            </h1>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name || user.nome}</p>
              <p className="text-xs text-gray-600">Colaborador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              {(user.name || user.nome || 'C')[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {activeTab === 'dashboard' && <DashboardTab stats={stats} user={user} />}
            {activeTab === 'meus-dados' && <MeusDadosTab user={user} token={token} />}
            {activeTab === 'blocos' && <BlocosTab token={token} disciplina={user.disciplina_colaborador} />}
            {activeTab === 'questoes' && (
              <div className="text-center py-8 text-gray-600">
                Tab de Questões - Ainda implementando...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Desconectar</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja sair?</p>
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg"
              >
                Sim, sair
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColaboradorDashboardV2;
