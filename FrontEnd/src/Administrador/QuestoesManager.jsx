import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateQuestaoForm from './CreateQuestaoForm';
import EditQuestaoForm from './EditQuestaoForm';
import { Plus, Edit, Trash2, Search, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

/**
 * QuestoesManager
 * Gerenciador de questões usando modelo único Questao.js
 */

const QuestoesManager = () => {
  const { token } = useAuth();
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisciplina, setFilterDisciplina] = useState('');
  const [filterTorneio, setFilterTorneio] = useState('');
  const [torneios, setTorneios] = useState([]);

  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  // Carregar questões
  const carregarQuestoes = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterDisciplina) params.append('disciplina', filterDisciplina);
      if (filterTorneio) params.append('torneio_id', filterTorneio);

      const res = await axios.get(`${apiBase}/api/questoes?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setQuestoes(res.data.dados?.questoes || []);
    } catch (err) {
      setError('Erro ao carregar questões');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar torneios
  useEffect(() => {
    const carregarTorneios = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/admin/torneio`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTorneios(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar torneios:', err);
      }
    };

    carregarTorneios();
  }, [token, apiBase]);

  // Carregar questões ao montar
  useEffect(() => {
    carregarQuestoes();
  }, [filterDisciplina, filterTorneio]);

  // Deletar questão
  const handleDeleteClick = (questao) => {
    setQuestionToDelete(questao);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;

    try {
      await axios.delete(`${apiBase}/api/questoes/${questionToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess('Questão deletada com sucesso');
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteModal(false);
      setQuestionToDelete(null);
      carregarQuestoes();
    } catch (err) {
      setError('Erro ao deletar questão');
      console.error('Erro:', err);
      setShowDeleteModal(false);
    }
  };

  // Editar questão
  const handleEdit = (questao) => {
    setSelectedQuestion(questao);
    setShowEditForm(true);
  };

  // Filtrar questões
  const questoesFiltradas = questoes.filter(q =>
    q.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Gerenciar Questões
            </h2>
            <p className="text-slate-600">
              Crie, edite e gerencie questões usando o modelo único Questao.js
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Questão</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Disciplina */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Disciplina
            </label>
            <select
              value={filterDisciplina}
              onChange={(e) => setFilterDisciplina(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="matematica">Matemática</option>
              <option value="ingles">Inglês</option>
              <option value="programacao">Programação</option>
            </select>
          </div>

          {/* Torneio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Torneio
            </label>
            <select
              value={filterTorneio}
              onChange={(e) => setFilterTorneio(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {torneios.map(t => (
                <option key={t.id} value={t.id}>{t.titulo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questões Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando questões...</p>
          </div>
        ) : questoesFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 font-medium">Nenhuma questão encontrada</p>
            <p className="text-slate-400 text-sm">Crie uma nova questão para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Título</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Disciplina</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Tipo</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Dificuldade</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Pontos</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questoesFiltradas.map(questao => (
                  <tr key={questao.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      <div className="max-w-xs truncate" title={questao.titulo}>
                        {questao.titulo}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {questao.disciplina}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        {questao.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        questao.dificuldade === 'facil' ? 'bg-green-100 text-green-800' :
                        questao.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {questao.dificuldade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-semibold">
                      {questao.pontos}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(questao)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(questao)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Deletar</span>
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

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateQuestaoForm
          torneioId={filterTorneio}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            carregarQuestoes();
          }}
        />
      )}

      {/* Edit Form Modal */}
      {showEditForm && selectedQuestion && (
        <EditQuestaoForm
          questao={selectedQuestion}
          onClose={() => {
            setShowEditForm(false);
            setSelectedQuestion(null);
          }}
          onSuccess={() => {
            setShowEditForm(false);
            setSelectedQuestion(null);
            carregarQuestoes();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal && !!questionToDelete}
        onClose={() => { setShowDeleteModal(false); setQuestionToDelete(null); }}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={questionToDelete ? `Tem certeza que deseja deletar a questão "${questionToDelete.titulo}"? Esta ação não pode ser desfeita.` : ''}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default QuestoesManager;
