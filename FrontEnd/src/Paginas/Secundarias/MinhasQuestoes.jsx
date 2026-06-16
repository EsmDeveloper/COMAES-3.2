/**
 * MinhasQuestoes.jsx - Aba para Colaborador gerenciar suas questões
 * Task 11.2: Create MinhasQuestoes page
 * Funcionalidades:
 * 1. List questions created by collaborator
 * 2. Filter by status (pendente, aprovada, rejeitada)
 * 3. Filter by difficulty (fácil, médio, difícil)
 * 4. Show status badges
 * 5. Edit/Delete buttons
 * 6. Pagination support
 * 7. Show rejection reasons
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, AlertCircle, BookOpen, CheckCircle, XCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import PageTransition from '../../components/PageTransition';

// ── Constantes ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const ITEMS_PER_PAGE = 10;

// ── Serviço de Questões do Colaborador ────────────────────────────────────────
class ColaboradorQuestoesService {
  constructor(token) {
    this.token = token;
    this.baseUrl = `${API_BASE}/api/questoes/colaborador`;
  }

  async request(endpoint, options = {}) {
    const url = endpoint ? `${this.baseUrl}/${endpoint}` : this.baseUrl;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensagem || data.error || `Erro ${response.status}`);
    }

    return data;
  }

  async listar(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.dificuldade) queryParams.append('dificuldade', filters.dificuldade);
    if (filters.status_aprovacao) queryParams.append('status_aprovacao', filters.status_aprovacao);
    if (filters.pagina) queryParams.append('pagina', filters.pagina);
    if (filters.limite) queryParams.append('limite', filters.limite);
    
    const endpoint = 'minhas' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    const data = await this.request(endpoint);
    return data.dados || data;
  }

  async criar(dados) {
    const data = await this.request('criar', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
    return data;
  }

  async editar(id, dados) {
    const data = await this.request(id, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
    return data;
  }

  async deletar(id) {
    const data = await this.request(id, {
      method: 'DELETE',
    });
    return data;
  }
}

// ── Badge de Status ──────────────────────────────────────────────────────────
function StatusBadge({ status, motivo_rejeicao, onShowRejection }) {
  const config = {
    pendente: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      icon: <AlertCircle className="w-3 h-3" />,
      label: 'Pendente' 
    },
    aprovada: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      icon: <CheckCircle className="w-3 h-3" />,
      label: 'Aprovada' 
    },
    rejeitada: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      icon: <XCircle className="w-3 h-3" />,
      label: 'Rejeitada' 
    }
  };
  
  const c = config[status] || config.pendente;
  const hasRejectionReason = status === 'rejeitada' && motivo_rejeicao;
  
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        {c.icon}
        {c.label}
      </span>
      {hasRejectionReason && (
        <button
          onClick={onShowRejection}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-50 ${c.text} hover:bg-red-100 transition-colors`}
          title="Ver motivo da rejeição"
        >
          <Info className="w-3 h-3" />
          Motivo
        </button>
      )}
    </div>
  );
}

// ── Modal de Formulário da Questão ───────────────────────────────────────────
function QuestaoForm({ questao, isOpen, onClose, onSave, disciplina, saving: externalSaving }) {
  const [formData, setFormData] = useState({
    titulo: '',
    enunciado: '',
    dificuldade: 'medio',
    pontos: 10,
    opcoes: ['', '', '', ''],
    resposta_correta: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset form quando abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (questao) {
        setFormData({
          titulo: questao.titulo || '',
          enunciado: questao.enunciado || questao.descricao || '',
          dificuldade: questao.dificuldade || 'medio',
          pontos: questao.pontos || 10,
          opcoes: Array.isArray(questao.opcoes) ? [...questao.opcoes.slice(0, 4)] : ['', '', '', ''],
          resposta_correta: questao.resposta_correta || ''
        });
      } else {
        setFormData({
          titulo: '',
          enunciado: '',
          dificuldade: 'medio',
          pontos: 10,
          opcoes: ['', '', '', ''],
          resposta_correta: ''
        });
      }
      setError(null);
    }
  }, [questao, isOpen]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpcaoChange = (index, value) => {
    const novasOpcoes = [...formData.opcoes];
    novasOpcoes[index] = value;
    setFormData(prev => ({ ...prev, opcoes: novasOpcoes }));
    
    // Se a resposta correta for a opção que mudou, atualizar também
    if (formData.resposta_correta === formData.opcoes[index]) {
      setFormData(prev => ({ ...prev, resposta_correta: value }));
    }
  };

  const validateForm = () => {
    // Validar título
    if (!formData.titulo.trim()) {
      setError('Título é obrigatório');
      return false;
    }

    // Validar enunciado
    if (!formData.enunciado.trim()) {
      setError('Enunciado é obrigatório');
      return false;
    }

    // Validar opções
    const opcoesValidas = formData.opcoes.filter(o => o.trim());
    if (opcoesValidas.length < 2) {
      setError('Preencha pelo menos 2 alternativas');
      return false;
    }

    // Validar opções duplicadas
    const uniqueOpcoes = new Set(opcoesValidas.map(o => o.trim().toLowerCase()));
    if (uniqueOpcoes.size !== opcoesValidas.length) {
      setError('Alternativas duplicadas não são permitidas');
      return false;
    }

    // Validar resposta correta
    if (!formData.resposta_correta) {
      setError('Selecione a resposta correta');
      return false;
    }

    if (!opcoesValidas.includes(formData.resposta_correta)) {
      setError('A resposta correta deve ser uma das alternativas');
      return false;
    }

    // Validar pontos
    if (formData.pontos < 1 || formData.pontos > 100) {
      setError('Pontos devem estar entre 1 e 100');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const dadosParaSalvar = {
        titulo: formData.titulo,
        enunciado: formData.enunciado,
        disciplina: disciplina.toLowerCase(),
        dificuldade: formData.dificuldade,
        tipo: 'multipla_escolha',
        opcoes: formData.opcoes.filter(o => o.trim()),
        resposta_correta: formData.resposta_correta,
        pontos: formData.pontos
      };
      
      await onSave(dadosParaSalvar);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar questão');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold">{questao ? 'Editar' : 'Nova'} Questão</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Info disciplina */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
            <span className="text-slate-600">Disciplina: </span>
            <span className="font-semibold text-slate-800 capitalize">{disciplina}</span>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleFieldChange('titulo', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Qual é a capital de Portugal?"
              maxLength={200}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Enunciado <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.enunciado}
              onChange={(e) => handleFieldChange('enunciado', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o enunciado completo da questão..."
              maxLength={1000}
            />
          </div>

          {/* Dificuldade e Pontos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Dificuldade</label>
              <select
                value={formData.dificuldade}
                onChange={(e) => handleFieldChange('dificuldade', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Pontos</label>
              <input
                type="number"
                value={formData.pontos}
                onChange={(e) => handleFieldChange('pontos', parseInt(e.target.value) || 0)}
                min={1}
                max={100}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Alternativas */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Alternativas <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.opcoes.map((opcao, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="resposta_correta"
                    checked={formData.resposta_correta === opcao}
                    onChange={() => handleFieldChange('resposta_correta', opcao)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-600 w-6">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    value={opcao}
                    onChange={(e) => handleOpcaoChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                    maxLength={500}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Selecione o botão de rádio ao lado da alternativa correta.
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || externalSaving}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || externalSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {(saving || externalSaving) && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {saving || externalSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal de Confirmação de Deleção ──────────────────────────────────────────
function DeleteConfirmModal({ isOpen, onClose, onConfirm, titulo }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">Confirmar exclusão?</h3>
        <p className="text-slate-600 mb-2">
          Tem certeza que deseja excluir a questão "{titulo?.substring(0, 50)}..."?
        </p>
        <p className="text-red-600 text-sm mb-6">Esta ação não pode ser desfeita.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de Motivo de Rejeição ─────────────────────────────────────────────
function RejectionReasonModal({ isOpen, onClose, motivo, titulo }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Motivo da Rejeição</h3>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">Questão: <span className="font-semibold">{titulo}</span></p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-slate-700 whitespace-pre-wrap">{motivo || 'Sem motivo especificado'}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function MinhasQuestoes() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [questaoEdit, setQuestaoEdit] = useState(null);
  const [questaoParaDeletar, setQuestaoParaDeletar] = useState(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState({ titulo: '', motivo: '' });
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [dificuldadeFilter, setDificuldadeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Criar instância do serviço
  const service = new ColaboradorQuestoesService(token);

  // Proteger rota
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    if (user.role === 'admin' || user.isAdmin) {
      navigate('/administrador', { replace: true });
      return;
    }
    
    if (user.role !== 'colaborador') {
      navigate('/painel', { replace: true });
      return;
    }
  }, [user, navigate]);

  // Carregar questões
  const carregarQuestoes = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const filters = {
        dificuldade: dificuldadeFilter,
        status_aprovacao: statusFilter,
        pagina: currentPage,
        limite: ITEMS_PER_PAGE
      };
      
      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key] || key === 'pagina' && filters[key] === 1 || key === 'limite') {
          delete filters[key];
        }
      });
      
      const resultado = await service.listar(filters);
      
      // Handle different response formats
      const questoesList = Array.isArray(resultado) ? resultado : (resultado.questoes || resultado.dados || []);
      setQuestoes(questoesList);
    } catch (err) {
      console.error('Erro ao carregar questões:', err);
      setError(err.message || 'Erro ao carregar questões');
      setQuestoes([]);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, dificuldadeFilter, currentPage]);

  useEffect(() => {
    carregarQuestoes();
  }, [carregarQuestoes]);

  // Criar questão
  const handleCreate = async (dados) => {
    setSaving(true);
    try {
      await service.criar(dados);
      setCurrentPage(1);
      await carregarQuestoes();
    } finally {
      setSaving(false);
    }
  };

  // Editar questão
  const handleEdit = async (id, dados) => {
    setSaving(true);
    try {
      await service.editar(id, dados);
      await carregarQuestoes();
    } finally {
      setSaving(false);
    }
  };

  // Deletar questão
  const handleDelete = async () => {
    if (!questaoParaDeletar) return;
    
    try {
      await service.deletar(questaoParaDeletar);
      await carregarQuestoes();
      setQuestaoParaDeletar(null);
    } catch (err) {
      setError('Erro ao deletar: ' + err.message);
    }
  };

  // Handle save (create ou edit)
  const handleSave = async (dados) => {
    if (questaoEdit) {
      await handleEdit(questaoEdit.id, dados);
    } else {
      await handleCreate(dados);
    }
  };

  // Filtros aplicados (questões filtramos no frontend também como backup)
  const questoesFiltradas = useMemo(() => {
    return questoes;
  }, [questoes]);

  // Pagination
  const totalPages = Math.ceil(questoesFiltradas.length / ITEMS_PER_PAGE);

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Carregando questões...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Error state
  if (error && questoes.length === 0) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center p-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl">
            <div className="flex items-center gap-2 font-semibold mb-3">
              <AlertCircle className="w-5 h-5" />
              Erro ao carregar questões
            </div>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={carregarQuestoes}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Minhas Questões</h1>
            <p className="text-slate-600 mt-1">Gerencie suas questões para revisão</p>
          </div>
          <button
            onClick={() => {
              setQuestaoEdit(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nova Questão
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Filtro de Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="aprovada">Aprovada</option>
                <option value="rejeitada">Rejeitada</option>
              </select>
            </div>

            {/* Filtro de Dificuldade */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Dificuldade
              </label>
              <select
                value={dificuldadeFilter}
                onChange={(e) => {
                  setDificuldadeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Todas as dificuldades</option>
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>

            {/* Botão de Limpar Filtros */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setDificuldadeFilter('');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Error message (non-critical) */}
        {error && questoes.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Lista ou vazio */}
        {questoes.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma questão encontrada</h3>
            <p className="text-slate-500 mb-6">
              {statusFilter || dificuldadeFilter 
                ? 'Nenhuma questão corresponde aos filtros aplicados' 
                : 'Comece criando sua primeira questão!'}
            </p>
            {!statusFilter && !dificuldadeFilter && (
              <button
                onClick={() => {
                  setQuestaoEdit(null);
                  setModalOpen(true);
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Questão
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">Título</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">Dificuldade</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">Pontos</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-blue-900">Status</th>
                      <th className="text-right px-6 py-3 text-sm font-semibold text-blue-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questoesFiltradas.map((q) => (
                      <tr key={q.id} className="hover:bg-blue-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-800 line-clamp-1">{q.titulo}</p>
                            <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{q.descricao}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm capitalize px-2 py-1 rounded-full font-semibold ${
                            q.dificuldade === 'facil' ? 'bg-green-100 text-green-700' :
                            q.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {q.dificuldade === 'facil' ? 'Fácil' : q.dificuldade === 'medio' ? 'Médio' : 'Difícil'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700">{q.pontos} pts</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge 
                            status={q.status_aprovacao} 
                            motivo_rejeicao={q.motivo_rejeicao}
                            onShowRejection={() => {
                              setSelectedRejection({
                                titulo: q.titulo,
                                motivo: q.motivo_rejeicao
                              });
                              setRejectionModalOpen(true);
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {['pendente', 'rejeitada'].includes(q.status_aprovacao) && (
                              <>
                                <button
                                  onClick={() => {
                                    setQuestaoEdit(q);
                                    setModalOpen(true);
                                  }}
                                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar questão"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setQuestaoParaDeletar(q.id)}
                                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Deletar questão"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {q.status_aprovacao === 'aprovada' && (
                              <span className="text-xs text-slate-400 italic">Aprovada - não editável</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">
                  Página {currentPage} de {totalPages} • Total: {questoesFiltradas.length} questões
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal do Formulário */}
        <QuestaoForm
          questao={questaoEdit}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setQuestaoEdit(null);
          }}
          onSave={handleSave}
          disciplina={user?.disciplina_colaborador || 'matematica'}
          saving={saving}
        />

        {/* Modal de Confirmação de Deleção */}
        <DeleteConfirmModal
          isOpen={!!questaoParaDeletar}
          onClose={() => setQuestaoParaDeletar(null)}
          onConfirm={handleDelete}
          titulo={questoes.find(q => q.id === questaoParaDeletar)?.titulo}
        />

        {/* Modal de Motivo de Rejeição */}
        <RejectionReasonModal
          isOpen={rejectionModalOpen}
          onClose={() => setRejectionModalOpen(false)}
          motivo={selectedRejection.motivo}
          titulo={selectedRejection.titulo}
        />
      </div>
    </PageTransition>
  );
}