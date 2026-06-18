import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateQuestaoTesteForm from './CreateQuestaoTesteForm';
import EditQuestaoTesteForm from './EditQuestaoTesteForm';
import { Plus, Edit, Trash2, Search, Filter, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

/**
 * TesteConhecimentoManager
 * Gerenciador de questÃµes do Teste de Conhecimento
 * Sistema independente dos torneios
 */

const TesteConhecimentoManager = () => {
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
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterDificuldade, setFilterDificuldade] = useState('');

  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

  // Carregar questÃµes
  const carregarQuestoes = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterCategoria) params.append('categoria', filterCategoria);
      if (filterDificuldade) params.append('dificuldade', filterDificuldade);

      const res = await axios.get(`${apiBase}/api/teste-conhecimento/questoes?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setQuestoes(res.data.data || []);
    } catch (err) {
      setError('Erro ao carregar questÃµes');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar questÃµes ao montar
  useEffect(() => {
    carregarQuestoes();
  }, [filterCategoria, filterDificuldade]);

  // Deletar questÃ£o
  const handleDeleteClick = (questao) => {
    setQuestionToDelete(questao);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;

    try {
      await axios.delete(`${apiBase}/api/teste-conhecimento/questoes/${questionToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess('QuestÃ£o deletada com sucesso');
      setTimeout(() => setSuccess(''), 3000);
      carregarQuestoes();
    } catch (err) {
      setError('Erro ao deletar questÃ£o');
      console.error('Erro:', err);
    }
  };

  // Editar questÃ£o
  const handleEdit = (questao) => {
    setSelectedQuestion(questao);
    setShowEditForm(true);
  };

  // Filtrar questÃµes
  const questoesFiltradas = questoes.filter(q =>
    q.enunciado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoriaLabels = {
    matematica: 'MatemÃ¡tica',
    programacao: 'ProgramaÃ§Ã£o',
    ingles: 'InglÃªs',
    cultura_geral: 'Cultura Geral'
  };

  const dificuldadeLabels = {
    facil: 'FÃ¡cil',
    medio: 'MÃ©dio',
    dificil: 'DifÃ­cil'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-slate-800">
                Teste de Conhecimento
              </h2>
            </div>
            <p className="text-slate-600">
              Gerencie questÃµes do teste de conhecimento (independente dos torneios)
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Nova QuestÃ£o</span>
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
              placeholder="Buscar por enunciado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Categoria
            </label>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas</option>
              <option value="matematica">MatemÃ¡tica</option>
              <option value="programacao">ProgramaÃ§Ã£o</option>
              <option value="ingles">InglÃªs</option>
              <option value="cultura_geral">Cultura Geral</option>
            </select>
          </div>

          {/* Dificuldade */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Dificuldade
            </label>
            <select
              value={filterDificuldade}
              onChange={(e) => setFilterDificuldade(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas</option>
              <option value="facil">FÃ¡cil</option>
              <option value="medio">MÃ©dio</option>
              <option value="dificil">DifÃ­cil</option>
            </select>
          </div>
        </div>
      </div>

      {/* QuestÃµes Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando questÃµes...</p>
          </div>
        ) : questoesFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhuma questÃ£o encontrada</p>
            <p className="text-slate-400 text-sm">Crie uma nova questÃ£o para comeÃ§ar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Enunciado</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Categoria</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Dificuldade</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Pontos</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">OpÃ§Ãµes</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-700">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questoesFiltradas.map(questao => (
                  <tr key={questao.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      <div className="max-w-md truncate" title={questao.enunciado}>
                        {questao.enunciado}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        {categoriaLabels[questao.categoria] || questao.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        questao.dificuldade === 'facil' ? 'bg-green-100 text-green-800' :
                        questao.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {dificuldadeLabels[questao.dificuldade] || questao.dificuldade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-semibold">
                      {questao.pontos}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {Array.isArray(questao.opcoes) ? questao.opcoes.length : 0} opÃ§Ãµes
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
        <CreateQuestaoTesteForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            setSuccess('QuestÃ£o criada com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
            carregarQuestoes();
          }}
        />
      )}

      {/* Edit Form Modal */}
      {showEditForm && selectedQuestion && (
        <EditQuestaoTesteForm
          questao={selectedQuestion}
          onClose={() => {
            setShowEditForm(false);
            setSelectedQuestion(null);
          }}
          onSuccess={() => {
            setShowEditForm(false);
            setSelectedQuestion(null);
            setSuccess('QuestÃ£o atualizada com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
            carregarQuestoes();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setQuestionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirmar ExclusÃ£o"
        message={`Tem certeza que deseja deletar a questÃ£o "${questionToDelete?.enunciado?.substring(0, 50)}..."? Esta aÃ§Ã£o nÃ£o pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default TesteConhecimentoManager;
