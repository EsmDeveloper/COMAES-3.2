/**
 * QuestoesPendentesTab.jsx (REFATORADO COM VISUAL UNIFICADO)
 * Aba para admin revisar questões pendentes de colaboradores
 * Agora com a mesma estrutura visual do QuestoesColaboradoresTab
 * ✅ DATA SAFETY: safeArray, safeMap, safeGet, safeString aplicados
 */

import { useState, useEffect, useCallback, useReducer } from 'react';
import questoesService from '../services/questoesService';
import axios from 'axios';
import {
  Search, Check, X, AlertCircle, BookOpen, Filter,
  ChevronDown, Clock, Info, RefreshCw, Layers, FileText,
  Eye, Trash2, Package, User, Calendar, Star
} from 'lucide-react';
import { safeGet, safeArray, safeString, safeMap } from '../utils/dataSafety';
import {
  DificuldadeBadge,
  StatusAprovaçãoBadge,
  DisciplinaBadge,
  ConfirmarComMotivoModal,
  QuestaoDetailModal,
  extrairOpcoes,
  mostrarToast
} from './shared/QuestaoCardsComponents';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

// ============================================
// REDUCER PARA ESTADO
// ============================================
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

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function QuestoesPendentesTab() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuestao, setSelectedQuestao] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('blocos');
  const token = localStorage.getItem('comaes_token');

  // ========== FUNÇÕES DE CARREGAMENTO ==========
  const carregarBlocosPendentes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_BLOCOS', payload: true });
    try {
      const params = { status_aprovacao: 'pendente' };
      if (state.filtros.disciplina) params.disciplina = state.filtros.disciplina;
      
      console.log('[DEBUG] Buscando blocos pendentes com params:', params);
      
      const response = await axios.get(`${apiBaseUrl}/api/admin/blocos-colaboradores-pendentes`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // A resposta vem de respostaSucesso(), que tem a estrutura: { sucesso, mensagem, dados }
      const blocos = response.data?.dados?.blocos || [];
      
      dispatch({ type: 'SET_BLOCOS_PENDENTES', payload: blocos });
    } catch (err) {
      console.error('Erro ao carregar blocos pendentes:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar blocos pendentes' });
    } finally {
      dispatch({ type: 'SET_LOADING_BLOCOS', payload: false });
    }
  }, [state.filtros.disciplina, token]);

  const carregarQuestoesSoloPendentes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_QUESTOES', payload: true });
    try {
      const params = { status_aprovacao: 'pendente', sem_bloco: true };
      if (state.filtros.disciplina) params.disciplina = state.filtros.disciplina;
      
      console.log('[DEBUG] Buscando questões pendentes com params:', params);
      
      const response = await questoesService.listar(params);
      console.log('[DEBUG] Resposta questões:', response);
      
      const questoes = response?.dados?.questoes || 
                       response?.questoes || 
                       response?.data?.questoes ||
                       [];
      
      console.log('[DEBUG] Questões extraídas:', questoes);
      console.log('[DEBUG] Quantidade de questões:', questoes.length);
      
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

  // ========== FUNÇÕES DE AÇÃO ==========
  const handleAprovarBloco = async (id) => {
    setActionLoading(id);
    try {
      await axios.post(`${apiBaseUrl}/api/admin/blocos/${id}/aprovar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      mostrarToast('Bloco aprovado com sucesso!', 'success');
      dispatch({ type: 'REMOVE_BLOCO', payload: id });
    } catch (err) {
      mostrarToast(err.response?.data?.mensagem || 'Erro ao aprovar', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejeitarBloco = async (id, motivo) => {
    setActionLoading(id);
    try {
      await axios.post(`${apiBaseUrl}/api/admin/blocos/${id}/rejeitar`, { motivo_rejeicao: motivo }, {
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

  const handleAprovarQuestao = async (id) => {
    setActionLoading(id);
    try {
      await questoesService.aprovar(id);
      mostrarToast('Questão aprovada com sucesso!', 'success');
      dispatch({ type: 'REMOVE_QUESTAO', payload: id });
    } catch (err) {
      mostrarToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

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

  // ========== FILTRAGEM ==========
  const questoesFiltradas = safeArray(state.questoesSoloPendentes).filter(q => {
    if (!state.filtros.busca) return true;
    const buscaLower = state.filtros.busca.toLowerCase();
    return (
      safeString(safeGet(q, 'titulo'), '').toLowerCase().includes(buscaLower) ||
      safeString(safeGet(q, 'descricao'), '').toLowerCase().includes(buscaLower)
    );
  });

  const blocosFiltrados = safeArray(state.blocosPendentes).filter(b => {
    if (!state.filtros.busca) return true;
    const buscaLower = state.filtros.busca.toLowerCase();
    return (
      safeString(safeGet(b, 'titulo'), '').toLowerCase().includes(buscaLower) ||
      safeString(safeGet(b, 'descricao'), '').toLowerCase().includes(buscaLower)
    );
  });

  // ========== RENDERIZAÇÃO ==========
  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Revisão de Questões
          </h1>
          <p className="text-gray-600 mt-2">
            Revise e aprove blocos e questões criadas pelos colaboradores
          </p>
        </div>
        <button
          onClick={() => {
            carregarBlocosPendentes();
            carregarQuestoesSoloPendentes();
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Atualizar
        </button>
      </div>

      {/* ===== SEARCH + FILTROS ===== */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar blocos ou questões..."
            value={state.filtros.busca}
            onChange={(e) => dispatch({ type: 'UPDATE_FILTRO', key: 'busca', value: e.target.value })}
            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={state.filtros.disciplina}
          onChange={(e) => dispatch({ type: 'UPDATE_FILTRO', key: 'disciplina', value: e.target.value })}
        >
          <option value="">Todas as disciplinas</option>
          <option value="matematica">Matemática</option>
          <option value="programacao">Programação</option>
          <option value="ingles">Inglês</option>
          <option value="portugues">Português</option>
          <option value="historia">História</option>
        </select>
      </div>

      {/* ===== SUB-ABAS ===== */}
      <div className="flex gap-3 border-b border-gray-200">
        <button
          onClick={() => setAbaAtiva('blocos')}
          className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
            abaAtiva === 'blocos'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <Package className="w-5 h-5" />
          Blocos Pendentes
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {blocosFiltrados.length}
          </span>
        </button>
        <button
          onClick={() => setAbaAtiva('questoes')}
          className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
            abaAtiva === 'questoes'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <FileText className="w-5 h-5" />
          Questões Pendentes
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {questoesFiltradas.length}
          </span>
        </button>
      </div>

      {/* ===== CONTEÚDO DAS ABAS ===== */}
      <div>
        {/* ABA 1: BLOCOS PENDENTES */}
        {abaAtiva === 'blocos' && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <Layers className="w-7 h-7" />
                Blocos Pendentes
              </h2>
              <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold">
                Total: {blocosFiltrados.length}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Blocos de questões aguardando revisão e aprovação.
            </p>

            {/* Cards de Blocos */}
            <div className="bg-white rounded-lg border border-blue-200 p-4">
              {state.loadingBlocos && blocosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Carregando blocos...</p>
                </div>
              ) : blocosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold">Nenhum bloco pendente</p>
                  <p className="text-sm text-gray-500 mt-2">Todos os blocos já foram revisados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {safeMap(blocosFiltrados, (b, i, key) => {
                    const numQuestoes = safeArray(safeGet(b, 'questoes', [])).length || safeGet(b, 'total_questoes', 0);
                    return (
                      <div key={key} className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-xl shadow-sm border border-blue-200 p-5 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex gap-2 mb-2 flex-wrap">
                              <DisciplinaBadge disciplina={safeGet(b, 'disciplina')} />
                              <DificuldadeBadge dificuldade={safeGet(b, 'dificuldade', 'medio')} />
                              <StatusAprovaçãoBadge status="pendente" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-base mb-1">
                              {safeString(safeGet(b, 'titulo'), `Bloco ${i + 1}`)}
                            </h4>
                            {safeGet(b, 'descricao') && (
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                                {safeString(safeGet(b, 'descricao'), '')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 py-2 px-3 bg-blue-100/50 rounded-lg mb-3">
                          <div className="flex items-center gap-2 text-blue-700">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-semibold">{numQuestoes} questões</span>
                          </div>
                          {safeGet(b, 'autor_nome') && (
                            <div className="flex items-center gap-1 text-slate-600 text-xs">
                              <User className="w-3 h-3" />
                              <span>{safeString(safeGet(b, 'autor_nome'), 'Desconhecido')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-slate-400 text-xs ml-auto">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(safeGet(b, 'created_at')).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>

                        {/* BOTÕES CORRIGIDOS - APENAS ÍCONES */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-200 mt-3">
                          <button 
                            onClick={() => openDetails(b)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                            title="Visualizar detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="flex gap-2 sm:flex-1">
                            <button 
                              onClick={() => openRejectModal(b, 'bloco')}
                              disabled={actionLoading === b.id}
                              className="flex-1 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" /> Rejeitar
                            </button>
                            <button 
                              onClick={() => handleAprovarBloco(b.id)}
                              disabled={actionLoading === b.id}
                              className="flex-1 px-3 py-2 text-xs text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Aprovar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-blue-100 rounded p-3">
                <p className="text-xs font-semibold text-blue-700">Total de Blocos</p>
                <p className="text-2xl font-bold text-blue-900">{blocosFiltrados.length}</p>
              </div>
              <div className="bg-blue-200 rounded p-3">
                <p className="text-xs font-semibold text-blue-800">Disciplinas</p>
                <p className="text-2xl font-bold text-blue-900">
                  {new Set(blocosFiltrados.map(b => safeGet(b, 'disciplina'))).size}
                </p>
              </div>
              <div className="bg-blue-300 rounded p-3">
                <p className="text-xs font-semibold text-blue-900">Total de Questões</p>
                <p className="text-2xl font-bold text-blue-900">
                  {blocosFiltrados.reduce((acc, b) => acc + safeArray(safeGet(b, 'questoes', [])).length, 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: QUESTÕES PENDENTES - EM TABELA */}
        {abaAtiva === 'questoes' && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <FileText className="w-7 h-7" />
                Questões Pendentes
              </h2>
              <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold">
                Total: {questoesFiltradas.length}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Questões individuais aguardando revisão e aprovação.
            </p>

            {/* TABELA de Questões */}
            <div className="overflow-x-auto bg-white rounded-lg border border-blue-200">
              {state.loadingQuestoes && questoesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Carregando questões...</p>
                </div>
              ) : questoesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold">Nenhuma questão pendente</p>
                  <p className="text-sm text-gray-500 mt-2">Todas as questões já foram revisadas</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-blue-100 border-b-2 border-blue-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Título</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Disciplina</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Dificuldade</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Autor</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {safeMap(questoesFiltradas, (q, i, key) => (
                      <tr key={key} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">
                          {safeString(safeGet(q, 'titulo'), `Questão ${i + 1}`)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <DisciplinaBadge disciplina={safeGet(q, 'disciplina')} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <DificuldadeBadge dificuldade={safeGet(q, 'dificuldade')} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {safeGet(q, 'autor_nome') ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {safeString(safeGet(q, 'autor_nome'), 'Desconhecido')}
                            </span>
                          ) : safeGet(q, 'criado_por') ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {safeString(safeGet(q, 'criado_por'), 'Sistema')}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Sistema
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <StatusAprovaçãoBadge status="pendente" />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openDetails(q)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openRejectModal(q, 'questao')}
                              disabled={actionLoading === q.id}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50" 
                              title="Rejeitar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleAprovarQuestao(q.id)}
                              disabled={actionLoading === q.id}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50" 
                              title="Aprovar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-blue-100 rounded p-3">
                <p className="text-xs font-semibold text-blue-700">Total de Questões</p>
                <p className="text-2xl font-bold text-blue-900">{questoesFiltradas.length}</p>
              </div>
              <div className="bg-blue-200 rounded p-3">
                <p className="text-xs font-semibold text-blue-800">Disciplinas</p>
                <p className="text-2xl font-bold text-blue-900">
                  {new Set(questoesFiltradas.map(q => safeGet(q, 'disciplina'))).size}
                </p>
              </div>
              <div className="bg-blue-300 rounded p-3">
                <p className="text-xs font-semibold text-blue-900">Autores</p>
                <p className="text-2xl font-bold text-blue-900">
                  {new Set(questoesFiltradas.map(q => safeGet(q, 'autor_nome') || safeGet(q, 'criado_por') || 'Sistema')).size}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL: REJEITAR ===== */}
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

      {/* ===== MODAL: DETALHES ===== */}
      <QuestaoDetailModal
        questao={selectedQuestao}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedQuestao(null);
        }}
        extrairOpcoesFunc={extrairOpcoes}
      />
    </div>
  );
}