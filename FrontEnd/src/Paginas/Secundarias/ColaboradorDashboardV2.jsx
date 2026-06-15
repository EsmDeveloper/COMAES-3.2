/**
 * ColaboradorDashboardV2.jsx
 * Dashboard do Colaborador com design estilo Admin
 * Permite: Ver/editar perfil, gerenciar blocos, questÃµes e ver estatÃ­sticas
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import CreateBlocoForm from '../../components/Forms/CreateBlocoForm';
import CreateQuestaoForm from '../../components/Forms/CreateQuestaoForm';
import {
  Menu, X, LogOut, UserCircle, Settings,
  BarChart3, BookOpen, FileText, Plus, Edit, Trash2,
  Eye, Check, AlertCircle, TrendingUp, Clock, CheckCircle,
  ArrowRight, ChevronDown, Search, Filter, Loader
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

// Abas do Dashboard
function MeusDadosTab({ user, onUpdate }) {
  const [editando, setEditando] = useState(false);
  const [dados, setDados] = useState({
    nome: user?.nome || user?.name || '',
    email: user?.email || '',
    disciplina: user?.disciplina_colaborador || '',
    nivel_academico: user?.nivel_academico || '',
    biografia: user?.biografia || '',
    telefone: user?.telefone || '',
  });

  const handleSave = async () => {
    // TODO: Implementar API para salvar dados
    console.log('Salvando dados:', dados);
    setEditando(false);
    onUpdate(dados);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Meus Dados</h2>
        <p className="text-gray-600">Visualize e edite seu perfil de colaborador</p>
      </div>

      {/* ConteÃºdo */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
              {(user?.nome || 'U')[0]}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{dados.nome}</h3>
            <p className="text-gray-600 text-sm">{dados.email}</p>
          </div>
          <button
            onClick={() => setEditando(!editando)}
            className={`px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition ${
              editando
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <Edit className="w-4 h-4" />
            {editando ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {/* Campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Nome Completo</label>
            <input
              type="text"
              value={dados.nome}
              onChange={(e) => setDados({ ...dados, nome: e.target.value })}
              disabled={!editando}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition ${
                editando
                  ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label>
            <input
              type="email"
              value={dados.email}
              disabled={true}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600"
            />
          </div>

          {/* Disciplina */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Disciplina</label>
            <select
              value={dados.disciplina}
              onChange={(e) => setDados({ ...dados, disciplina: e.target.value })}
              disabled={!editando}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition ${
                editando
                  ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              <option value="">Selecione uma disciplina</option>
              <option value="matematica">MatemÃ¡tica</option>
              <option value="programacao">ProgramaÃ§Ã£o</option>
              <option value="ingles">InglÃªs</option>
            </select>
          </div>

          {/* NÃ­vel AcadÃªmico */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">NÃ­vel AcadÃªmico</label>
            <select
              value={dados.nivel_academico}
              onChange={(e) => setDados({ ...dados, nivel_academico: e.target.value })}
              disabled={!editando}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition ${
                editando
                  ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              <option value="">Selecione nÃ­vel</option>
              <option value="estudante_universitario">Estudante UniversitÃ¡rio</option>
              <option value="tecnico">TÃ©cnico</option>
              <option value="licenciado">Licenciado</option>
              <option value="mestre">Mestre</option>
              <option value="doutor">Doutor</option>
              <option value="professor">Professor</option>
              <option value="profissional">Profissional</option>
            </select>
          </div>

          {/* Telefone */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Telefone</label>
            <input
              type="tel"
              value={dados.telefone}
              onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
              disabled={!editando}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition ${
                editando
                  ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            />
          </div>
        </div>

        {/* Biografia */}
        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Biografia</label>
          <textarea
            value={dados.biografia}
            onChange={(e) => setDados({ ...dados, biografia: e.target.value })}
            disabled={!editando}
            rows={4}
            className={`w-full px-4 py-2.5 rounded-xl border-2 transition ${
              editando
                ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
            placeholder="Descreva sua experiÃªncia e especialidades..."
          />
        </div>

        {/* BotÃ£o Salvar */}
        {editando && (
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => setEditando(false)}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              Salvar AlteraÃ§Ãµes
            </button>
          </div>
        )}
      </div>

      {/* Status do Colaborador */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-slate-800 mb-4">Status do Colaborador</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <div className="text-green-700 font-semibold">âœ… Aprovado</div>
            <div className="text-sm text-green-600">Status atual</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="text-blue-700 font-bold text-lg">3</div>
            <div className="text-sm text-blue-600">Blocos Criados</div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200">
            <div className="text-indigo-700 font-bold text-lg">12</div>
            <div className="text-sm text-indigo-600">QuestÃµes Criadas</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeusBlocosTab() {
  const { user } = useAuth();
  const [blocos, setBlocos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBloco, setEditingBloco] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlocos();
  }, []);

  const fetchBlocos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(
        `${API_BASE}/api/colaborador/blocos?limite=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (json.sucesso) {
        setBlocos(json.dados.blocos || []);
      } else {
        setError(json.mensagem || 'Erro ao carregar blocos');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blocos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBloco = async (formData) => {
    try {
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(`${API_BASE}/api/colaborador/blocos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.sucesso) {
        setBlocos([json.dados, ...blocos]);
        setShowForm(false);
        // TODO: Show toast notification "Bloco criado com sucesso!"
      } else {
        setError(json.mensagem || 'Erro ao criar bloco');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating bloco:', err);
    }
  };

  const handleDeleteBloco = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este bloco?')) return;

    try {
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(`${API_BASE}/api/colaborador/blocos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.sucesso) {
        setBlocos(blocos.filter(b => b.id !== id));
        // TODO: Show toast "Bloco deletado com sucesso!"
      } else {
        setError(json.mensagem || 'Erro ao deletar bloco');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting bloco:', err);
    }
  };

  if (showForm) {
    return (
      <div className="max-w-6xl mx-auto">
        <CreateBlocoForm
          onSave={handleCreateBloco}
          onCancel={() => setShowForm(false)}
          initialData={editingBloco}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meus Blocos de QuestÃµes</h2>
          <p className="text-gray-600">Crie e gerencie seus blocos de questÃµes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Criar Bloco
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-700 mt-1"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && blocos.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Ainda nÃ£o tem blocos criados</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Criar Primeiro Bloco
          </button>
        </div>
      )}

      {/* Cards de Blocos */}
      {!loading && blocos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blocos.map(bloco => (
            <div key={bloco.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{bloco.titulo}</h3>
                  <p className="text-sm text-gray-600 mt-1">{bloco.descricao}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  bloco.status === 'publicado'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {bloco.status === 'publicado' ? 'âœ… Publicado' : 'ðŸ“ Rascunho'}
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg">
                  ðŸ”¢ {bloco.disciplina || 'NÃ£o definida'}
                </span>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Criado em: {new Date(bloco.created_at).toLocaleDateString('pt-PT')}
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 text-sm font-semibold border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1"
                  title="Visualizar"
                >
                  <Eye className="w-4 h-4" /> Ver
                </button>
                <button
                  onClick={() => {
                    setEditingBloco(bloco);
                    setShowForm(true);
                  }}
                  disabled={bloco.status !== 'rascunho'}
                  className="flex-1 px-4 py-2 text-sm font-semibold border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={bloco.status !== 'rascunho' ? 'Apenas blocos em rascunho podem ser editados' : 'Editar'}
                >
                  <Edit className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => handleDeleteBloco(bloco.id)}
                  disabled={bloco.status !== 'rascunho'}
                  className="flex-1 px-4 py-2 text-sm font-semibold border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={bloco.status !== 'rascunho' ? 'Apenas blocos em rascunho podem ser deletados' : 'Deletar'}
                >
                  <Trash2 className="w-4 h-4" /> Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MinhasQuestoesTab() {
  const { user } = useAuth();
  const [questoes, setQuestoes] = useState([]);
  const [blocos, setBlocos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestao, setEditingQuestao] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('comaes_token');

      // Fetch questÃµes
      const resQ = await fetch(`${API_BASE}/api/colaborador/questoes?limite=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jsonQ = await resQ.json();
      if (jsonQ.sucesso) setQuestoes(jsonQ.dados.questoes || []);

      // Fetch blocos for form dropdown
      const resB = await fetch(`${API_BASE}/api/colaborador/blocos?limite=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jsonB = await resB.json();
      if (jsonB.sucesso) setBlocos(jsonB.dados.blocos || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestao = async (formData) => {
    try {
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(`${API_BASE}/api/colaborador/questoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.sucesso) {
        setQuestoes([json.dados, ...questoes]);
        setShowForm(false);
        // TODO: Show toast "QuestÃ£o criada com sucesso!"
      } else {
        setError(json.mensagem || 'Erro ao criar questÃ£o');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating questao:', err);
    }
  };

  const handleDeleteQuestao = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta questÃ£o?')) return;

    try {
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(`${API_BASE}/api/colaborador/questoes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.sucesso) {
        setQuestoes(questoes.filter(q => q.id !== id));
        // TODO: Show toast "QuestÃ£o deletada com sucesso!"
      } else {
        setError(json.mensagem || 'Erro ao deletar questÃ£o');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting questao:', err);
    }
  };

  if (showForm) {
    return (
      <div className="max-w-6xl mx-auto">
        <CreateQuestaoForm
          onSave={handleCreateQuestao}
          onCancel={() => {
            setShowForm(false);
            setEditingQuestao(null);
          }}
          initialData={editingQuestao}
          blocos={blocos}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Minhas QuestÃµes</h2>
          <p className="text-gray-600">Crie questÃµes para adicionar aos blocos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Criar QuestÃ£o
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-700 mt-1"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && questoes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Ainda nÃ£o tem questÃµes criadas</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Criar Primeira QuestÃ£o
          </button>
        </div>
      )}

      {/* Tabela */}
      {!loading && questoes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">TÃ­tulo</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">Tipo</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">Dificuldade</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">Status</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">Data</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody>
              {questoes.map((questao, idx) => (
                <tr key={questao.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-6 py-3 text-sm text-slate-800">{questao.titulo}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {questao.tipo === 'multipla_escolha' ? 'MÃºltipla' : questao.tipo === 'texto' ? 'Texto' : 'CÃ³digo'}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {questao.dificuldade === 'facil' ? 'â­ FÃ¡cil' : questao.dificuldade === 'medio' ? 'â­â­ MÃ©dio' : 'â­â­â­ DifÃ­cil'}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      questao.status_aprovacao === 'aprovada'
                        ? 'bg-green-100 text-green-700'
                        : questao.status_aprovacao === 'rejeitada'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {questao.status_aprovacao === 'aprovada' ? 'âœ… Aprovada' : questao.status_aprovacao === 'rejeitada' ? 'âŒ Rejeitada' : 'â³ Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(questao.created_at).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestao(questao);
                          setShowForm(true);
                        }}
                        disabled={questao.status_aprovacao !== 'pendente'}
                        className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title={questao.status_aprovacao !== 'pendente' ? 'Apenas questÃµes pendentes podem ser editadas' : 'Editar'}
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestao(questao.id)}
                        disabled={questao.status_aprovacao === 'aprovada'}
                        className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title={questao.status_aprovacao === 'aprovada' ? 'QuestÃµes aprovadas nÃ£o podem ser deletadas' : 'Deletar'}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EstatisticasTab() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">EstatÃ­sticas</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Total de Blocos</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">3</div>
          <div className="text-xs text-gray-500 mt-2">+1 este mÃªs</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
          <div className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">QuestÃµes Aprovadas</div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">8</div>
          <div className="text-xs text-gray-500 mt-2">100% aprovaÃ§Ã£o</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border-l-4 border-cyan-500 hover:shadow-xl transition-shadow">
          <div className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">QuestÃµes Pendentes</div>
          <div className="text-2xl sm:text-3xl font-bold text-cyan-600">2</div>
          <div className="text-xs text-gray-500 mt-2">Aguardando revisÃ£o</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border-l-4 border-blue-400 hover:shadow-xl transition-shadow">
          <div className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Total de QuestÃµes</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400">12</div>
          <div className="text-xs text-gray-500 mt-2">3 disciplinas</div>
        </div>
      </div>
    </div>
  );
}

// Componente Principal
export default function ColaboradorDashboardV2() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dados');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'dados', label: 'Meus Dados', icon: UserCircle },
    { id: 'blocos', label: 'Meus Blocos', icon: BookOpen },
    { id: 'questoes', label: 'Minhas QuestÃµes', icon: FileText },
    { id: 'estatisticas', label: 'EstatÃ­sticas', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dados':
        return <MeusDadosTab user={user} onUpdate={() => {}} />;
      case 'blocos':
        return <MeusBlocosTab />;
      case 'questoes':
        return <MinhasQuestoesTab />;
      case 'estatisticas':
        return <EstatisticasTab />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`w-64 bg-white shadow-lg fixed md:relative z-50 h-screen flex flex-col transition-all ${
          sidebarOpen ? 'left-0' : '-left-64 md:left-0'
        }`}>
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-slate-800">Colaborador</h3>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full px-4 py-2 rounded-lg flex items-center gap-2 text-red-600 hover:bg-red-50 font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header MÃ³vel */}
          <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="font-bold text-slate-800">Colaborador</span>
            <div />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gray-50 p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </Layout>
  );
}
