/**
 * QuestoesPendentesTab.jsx (REFATORADO)
 * Aba para admin revisar questões pendentes de colaboradores
 * Separado em: Blocos Pendentes + Questões Solo Pendentes
 */
import { useState, useEffect, useCallback, useReducer } from 'react';
import questoesService from '../services/questoesService';
import axios from 'axios';
import {
  Search, Check, X, AlertCircle, BookOpen, Filter,
  ChevronDown, Clock, Info, RefreshCw, Layers, FileText
} from 'lucide-react';
import {
  DificuldadeBadge,
  StatusAprovaçãoBadge,
  DisciplinaBadge,
  ConfirmarComMotivoModal,
  QuestaoDetailModal,
  extrairOpcoes,
  mostrarToast
} from './shared/QuestaoCardsComponents';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

// ─── REDUCER PARA ESTADO ───

const initialState = {
  blocosPendentes: [],
  questoesSoloPendentes: [],
  loadingBlocos: false,
  loadingQuestoes: false,
  error: '',
  success: '',
  filtros: {
    disciplina: '',
    busca: '',
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING_BLOCOS':
      return { ...state, loadingBlocos: action.payload };
    case 'SET_LOADING_QUESTOES':
      return { ...state, loadingQuestoes: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, success: '' };
    case 'SET_SUCCESS':
      return { ...state, success: action.payload, error: '' };
    case 'SET_BLOCOS_PENDENTES':
      return { ...state, blocosPendentes: action.payload };
    case 'SET_QUESTOES_SOLO_PENDENTES':
      return { ...state, questoesSoloPendentes: action.payload };
    case 'REMOVE_BLOCO':
      return { ...state, blocosPendentes: state.blocosPendentes.filter(b => b.id !== action.payload) };
    case 'REMOVE_QUESTAO':
      return { ...state, questoesSoloPendentes: state.questoesSoloPendentes.filter(q => q.id !== action.payload) };
    case 'UPDATE_FILTRO':
      return { ...state, filtros: { ...state.filtros, [action.key]: action.value } };
    default:
      return state;
  }
}

// ─── COMPONENTE PRINCIPAL ───

export default function QuestoesPendentesTab() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuestao, setSelectedQuestao] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const token = localStorage.getItem('comaes_token');

  // Carregar blocos pendentes
  const carregarBlocosPendentes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_BLOCOS', payload: true });
    try {
      const params = { status_aprovacao: 'pendente' };
      if (state.filtros.disciplina) params.disciplina = state.filtros.disciplina;
      
      const response = await axios.get(`${apiBaseUrl}/api/admin/blocos-colaboradores-pendentes`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const blocos = response.data?.dados?.blocos || [];
      dispatch({ type: 'SET_BLOCOS_PENDENTES', payload: blocos });
    } catch (err) {
      console.error('Erro ao carregar blocos pendentes:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar blocos pendentes' });
    } finally {
      dispatch({ type: 'SET_LOADING_BLOCOS', payload: false });
    }
  }, [state.filtros.disciplina, token]);

  // Carregar questões solo pendentes
  const carregarQuestoesSoloPendentes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_QUESTOES', payload: true });
    try {
      const params = { status_aprovacao: 'pendente', sem_bloco: true };
      if (state.filtros.disciplina) params.disciplina = state.filtros.disciplina;
      
      const response = await questoesService.listar(params);
      const questoes = response?.dados?.questoes || response?.questoes || [];
      dispatch({ type: 'SET_QUESTOES_SOLO_PENDENTES', payload: questoes });
    } catch (err) {
      console.error('Erro ao carregar questões:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar questões' });
    } finally {
      dispatch({ type: 'SET_LOADING_QUESTOES', payload: false });
    }
  }, [state.filtros.disciplina]);

  useEffect(() => {
    carregarBlocosPendentes();
    carregarQuestoesSoloPendentes();
  }, [carregarBlocosPendentes, carregarQuestoesSoloPendentes]);

  // Aprovar bloco
  const handleAprovarBloco = async (id) => {
    setActionLoading(id);
    try {
      await axios.post(`${apiBaseUrl}/api/admin/blocos/${id}/aprovar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      mostrarToast('Bloco aprovado!', 'success');
      dispatch({ type: 'REMOVE_BLOCO', payload: id });
    } catch (err) {
      mostrarToast(err.response?.data?.mensagem || 'Erro ao aprovar', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Rejeitar bloco
  const handleRejeitarBloco = async (id, motivo) => {
    setActionLoading(id);
    try {
      await axios.post(`${apiBaseUrl}/api/admin/blocos/${id}/rejeitar`, { motivo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRejectModalOpen(false);
      dispatch({ type: 'REMOVE_BLOCO', payload: id });
      mostrarToast('Bloco rejeitado.', 'success');
    } catch (err) {
      mostrarToast(err.response?.data?.mensagem || 'Erro ao rejeitar', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Aprovar questão solo
  const handleAprovarQuestao = async (id) => {
    setActionLoading(id);
    try {
      await questoesService.aprovar(id);
      mostrarToast('Questão aprovada!', 'success');
      dispatch({ type: 'REMOVE_QUESTAO', payload: id });
    } catch (err) {
      mostrarToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Rejeitar questão solo
  const handleRejeitarQuestao = async (motivo) => {
    if (!questaoSelecionada) return;
    setActionLoading(questaoSelecionada.id);
    try {
      await questoesService.rejeitar(questaoSelecionada.id, motivo);
      setRejectModalOpen(false);
      dispatch({ type: 'REMOVE_QUESTAO', payload: questaoSelecionada.id });
      mostrarToast('Questão rejeitada.', 'success');
    } catch (err) {
      mostrarToast(err.message, 'error');
    } finally {
      setActionLoading(null);
      setQuestaoSelecionada(null);
    }
  };

  const openRejectModal = (item, tipo) => {
    setQuestaoSelecionada({ ...item, tipo });
    setRejectModalOpen(true);
  };

  const openDetails = (questao) => {
    setSelectedQuestao(questao);
    setDetailModalOpen(true);
  };

  // Filtrar questões solo
  const questoesFiltradas = state.questoesSoloPendentes.filter(q => {
    if (!state.filtros.busca) return true;
    const buscaLower = state.filtros.busca.toLowerCase();
    return (
      q?.titulo?.toLowerCase().includes(buscaLower) ||
      q?.descricao?.toLowerCase().includes(buscaLower)
    );
  });

  // Filtrar blocos
  const blocosFiltrados = state.blocosPendentes.filter(b => {
    if (!state.filtros.busca) return true;
    const buscaLower = state.filtros.busca.toLowerCase();
    return (
      b?.titulo?.toLowerCase().includes(buscaLower) ||
      b?.descricao?.toLowerCase().includes(buscaLower)
    );
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Revisão de Questões Colaboradores
        </h2>
        <p className="text-slate-600">
          Revise e aprove blocos e questões criadas pelos colaboradores
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={state.filtros.busca}
              onChange={(e) => dispatch({ type: 'UPDATE_FILTRO', key: 'busca', value: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={state.filtros.disciplina}
              onChange={(e) => dispatch({ type: 'UPDATE_FILTRO', key: 'disciplina', value: e.target.value })}
              className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Todas as disciplinas</option>
              <option value="matematica">Matemática</option>
              <option value="ingles">Inglês</option>
              <option value="programacao">Programação</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>

          <button
            onClick={() => {
              carregarBlocosPendentes();
              carregarQuestoesSoloPendentes();
            }}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* DUAS COLUNAS: BLOCOS E QUESTÕES LADO A LADO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SEÇÃO 1: BLOCOS PENDENTES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 sticky top-0 z-10 bg-white pb-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Blocos Pendentes</h3>
            <span className="ml-auto text-sm font-semibold text-slate-600 bg-blue-50 px-3 py-1 rounded-lg">
              {blocosFiltrados.length}
            </span>
          </div>

        {state.loadingBlocos && state.blocosPendentes.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando blocos...</p>
          </div>
        )}

        {!state.loadingBlocos && blocosFiltrados.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Nenhum bloco pendente</p>
          </div>
        )}

        {blocosFiltrados.length > 0 && (
          <div className="space-y-3">
            {blocosFiltrados.map((bloco) => (
              <div key={bloco.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DisciplinaBadge disciplina={bloco.disciplina} />
                      <DificuldadeBadge dificuldade={bloco.dificuldade || 'medio'} />
                      <span className="text-xs text-slate-500">({bloco.total_questoes || 0} questões)</span>
                    </div>
                    <h4 className="font-semibold text-slate-800">{bloco.titulo}</h4>
                    {bloco.descricao && <p className="text-xs text-slate-600 mt-1">{bloco.descricao}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <div className="flex-1" />
                  <button
                    onClick={() => openRejectModal(bloco, 'bloco')}
                    disabled={actionLoading === bloco.id}
                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Rejeitar
                  </button>
                  <button
                    onClick={() => handleAprovarBloco(bloco.id)}
                    disabled={actionLoading === bloco.id}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Aprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* SEÇÃO 2: QUESTÕES SOLO PENDENTES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 sticky top-0 z-10 bg-white pb-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800">Questões Solo Pendentes</h3>
            <span className="ml-auto text-sm font-semibold text-slate-600 bg-indigo-50 px-3 py-1 rounded-lg">
              {questoesFiltradas.length}
            </span>
          </div>

        {state.loadingQuestoes && state.questoesSoloPendentes.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando questões...</p>
          </div>
        )}

        {!state.loadingQuestoes && questoesFiltradas.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Nenhuma questão solo pendente</p>
          </div>
        )}

        {questoesFiltradas.length > 0 && (
          <div className="space-y-3">
            {questoesFiltradas.map((questao) => {
              const opcoes = extrairOpcoes(questao);
              return (
                <div key={questao.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DisciplinaBadge disciplina={questao.disciplina} />
                      <DificuldadeBadge dificuldade={questao.dificuldade} />
                      <span className="text-xs text-slate-500">{questao.pontos} pts</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(questao.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-800 mb-1">{questao.titulo}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{questao.descricao}</p>

                  <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Alternativas:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {opcoes.slice(0, 4).map((opcao, idx) => (
                        <div
                          key={idx}
                          className={`text-sm px-2 py-1 rounded ${
                            opcao === questao.resposta_correta
                              ? 'bg-green-100 text-green-800 font-medium'
                              : 'bg-white text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}. {opcao}
                          {opcao === questao.resposta_correta && ' ✓'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openDetails(questao)}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Ver detalhes
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => openRejectModal(questao, 'questao')}
                      disabled={actionLoading === questao.id}
                      className="px-3 py-1.5 text-sm border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Rejeitar
                    </button>
                    <button
                      onClick={() => handleAprovarQuestao(questao.id)}
                      disabled={actionLoading === questao.id}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Aprovar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Modal de rejeição */}
      <ConfirmarComMotivoModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setQuestaoSelecionada(null);
        }}
        onConfirm={(motivo) => {
          if (questaoSelecionada?.tipo === 'bloco') {
            handleRejeitarBloco(questaoSelecionada.id, motivo);
          } else {
            handleRejeitarQuestao(motivo);
          }
        }}
        titulo={questaoSelecionada?.tipo === 'bloco' ? 'Rejeitar Bloco' : 'Rejeitar Questão'}
        itemNome={questaoSelecionada?.titulo}
        buttonText="Rejeitar"
        buttonVariant="red"
        loading={actionLoading === questaoSelecionada?.id}
      />

      {/* Modal de detalhes */}
      <QuestaoDetailModal
        questao={selectedQuestao}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedQuestao(null);
        }}
        extrairOpcoes={extrairOpcoes}
      />
    </div>
  );
}