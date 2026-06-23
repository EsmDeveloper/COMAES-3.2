/**
 * QuestoesColaboradoresTab.jsx - VERSÃO REFATORADA COM TABELA UNIFICADA
 * Agora com a mesma estrutura visual do QuestoesTestesTab
 * ✅ DATA SAFETY: safeArray, safeMap, safeGet, safeString aplicados
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Search, BookOpen, Trash2, Eye, Layers, X,
  AlertCircle, RefreshCw, FileText, Loader,
  CheckCircle, Package, Edit2, Plus, Send
} from 'lucide-react';
import { safeGet, safeArray, safeString, safeMap } from '../utils/dataSafety';
import { api } from '../utils/safeApi';

// ============================================
// COMPONENTES DE BADGE (mantidos iguais)
// ============================================
const DisciplinaBadge = ({ disciplina }) => {
  const colors = {
    matematica: 'bg-blue-100 text-blue-800',
    programacao: 'bg-purple-100 text-purple-800',
    ingles: 'bg-green-100 text-green-800',
    portugues: 'bg-amber-100 text-amber-800',
    historia: 'bg-violet-100 text-violet-800',
  };
  const labels = {
    matematica: 'Matemática',
    programacao: 'Programação',
    ingles: 'Inglês',
    portugues: 'Português',
    historia: 'História',
  };
  const safeDisciplina = safeString(disciplina, 'matematica');
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${colors[safeDisciplina] || 'bg-gray-100 text-gray-800'}`}>
      {safeString(labels[safeDisciplina] || safeDisciplina, 'N/A')}
    </span>
  );
};

const DificuldadeBadge = ({ dificuldade }) => {
  const colors = {
    facil: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    dificil: 'bg-red-100 text-red-800',
  };
  const labels = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
  };
  const safeDificuldade = safeString(dificuldade, 'medio');
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${colors[safeDificuldade] || 'bg-gray-100 text-gray-800'}`}>
      {safeString(labels[safeDificuldade] || safeDificuldade, 'N/A')}
    </span>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function QuestoesColaboradoresTab() {
  // ========== ESTADOS ==========
  const [blocos, setBlocos] = useState([]);
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [disciplina, setDisciplina] = useState('');
  
  // Estados para ações
  const [abaAtiva, setAbaAtiva] = useState('blocos'); // 'blocos' | 'questoes'
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [tipoItem, setTipoItem] = useState(''); // 'bloco' | 'questao'
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [modalAtribuirAberto, setModalAtribuirAberto] = useState(false);
  const [destinoSelecionado, setDestinoSelecionado] = useState(''); // 'torneio' | 'teste'
  const [feedback, setFeedback] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const token = localStorage.getItem('comaes_token');

  // ========== FUNÇÕES DE CARREGAMENTO ==========
  const carregarDados = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!token) {
        setError('Token não encontrado. Por favor, faça login novamente.');
        setBlocos([]);
        setQuestoes([]);
        setLoading(false);
        return;
      }

      console.log('[QuestoesColaboradores] Iniciando carregamento...');

      // Carregar blocos aprovados de colaboradores
      // ✅ CORREÇÃO: Blocos usam campo 'status' (não 'status_aprovacao')
      // ✅ CORREÇÃO: Valor correto é 'aprovado' (não 'aprovada')
      let blocosData = [];
      try {
        const response = await api.get('/api/blocos-colaboradores', { 
          token,
          params: { 
            status: 'aprovado',  // ✅ CORRIGIDO: usar 'status' para blocos
            contexto: 'colaborador'
          }
        });
        
        if (response.success) {
          blocosData = safeArray(safeGet(response, 'data.dados.blocos', safeGet(response, 'data.blocos', [])));
        }
        console.log('[QuestoesColaboradores] Blocos:', blocosData.length);
      } catch (e1) {
        console.log('[QuestoesColaboradores] Fallback /api/blocos');
        try {
          const response = await api.get('/api/blocos', { 
            token,
            params: {
              status: 'aprovado',
              contexto: 'colaborador'
            }
          });
          if (response.success) {
            const allBlocos = safeArray(safeGet(response, 'data.blocos', []));
            blocosData = allBlocos.filter(b => safeGet(b, 'status') === 'aprovado');
          }
          console.log('[QuestoesColaboradores] Blocos (fallback):', blocosData.length);
        } catch (e2) {
          console.log('[QuestoesColaboradores] Blocos falha:', e2.message);
        }
      }

      // Carregar questões aprovadas de colaboradores (contexto='colaborador' ou NULL)
      let questoesData = [];
      try {
        const response = await api.get('/api/questoes', { 
          token,
          params: { 
            status_aprovacao: 'aprovada',
            contexto: 'colaborador'
          }
        });
        
        if (response.success) {
          questoesData = safeArray(
            safeGet(response, 'data.questoes', safeGet(response, 'data.dados.questoes', []))
          );
        }
        console.log('[QuestoesColaboradores] Questões:', questoesData.length);
      } catch (e1) {
        console.log('[QuestoesColaboradores] Fallback /api/questoes/colaborador/minhas');
        try {
          const response = await api.get('/api/questoes/colaborador/minhas', { token });
          if (response.success) {
            const allQuestoes = safeArray(
              safeGet(response, 'data.questoes', safeGet(response, 'data.dados.questoes', []))
            );
            questoesData = allQuestoes.filter(q => 
              safeGet(q, 'status_aprovacao') === 'aprovada' && 
              !safeGet(q, 'bloco_id')
            );
          }
          console.log('[QuestoesColaboradores] Questões (fallback):', questoesData.length);
        } catch (e2) {
          console.log('[QuestoesColaboradores] Questões falha:', e2.message);
        }
      }

      setBlocos(blocosData);
      setQuestoes(questoesData);

    } catch (err) {
      console.error('[QuestoesColaboradores] Erro:', err.message);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // ========== FUNÇÕES DE FILTRAGEM ==========
  const blocosFiltrados = safeArray(blocos).filter(b => {
    const bDisciplina = safeString(safeGet(b, 'disciplina'), '');
    const bTitulo = safeString(safeGet(b, 'titulo'), '').toLowerCase();
    const bDescricao = safeString(safeGet(b, 'descricao'), '').toLowerCase();
    const buscaLower = safeString(busca, '').toLowerCase();
    
    if (disciplina && bDisciplina !== disciplina) return false;
    if (busca && !bTitulo.includes(buscaLower) && !bDescricao.includes(buscaLower)) return false;
    return true;
  });

  const questoesFiltradas = safeArray(questoes).filter(q => {
    const qDisciplina = safeString(safeGet(q, 'disciplina'), '');
    const qTitulo = safeString(safeGet(q, 'titulo'), '').toLowerCase();
    const qDescricao = safeString(safeGet(q, 'descricao'), '').toLowerCase();
    const buscaLower = safeString(busca, '').toLowerCase();
    
    if (disciplina && qDisciplina !== disciplina) return false;
    if (busca && !qTitulo.includes(buscaLower) && !qDescricao.includes(buscaLower)) return false;
    return true;
  });

  // ========== FUNÇÕES DE AÇÃO ==========
  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const abrirVisualizacao = (item, tipo) => {
    setItemSelecionado(item);
    setTipoItem(tipo);
    setModalVisualizarAberto(true);
  };

  const abrirConfirmacaoDeletar = (item, tipo) => {
    setItemSelecionado(item);
    setTipoItem(tipo);
    setModalDeletarAberto(true);
  };

  const abrirModalAtribuir = (item, tipo) => {
    setItemSelecionado(item);
    setTipoItem(tipo);
    setDestinoSelecionado('');
    setModalAtribuirAberto(true);
  };

  const handleAtribuirItem = async () => {
    if (!itemSelecionado || !destinoSelecionado) {
      showFeedback('error', '❌ Por favor, selecione um destino');
      return;
    }
    
    setSalvando(true);
    try {
      // API endpoint para atribuir bloco/questão a torneio ou teste
      const endpoint = tipoItem === 'bloco'
        ? `/api/admin/blocos/${safeGet(itemSelecionado, 'id')}/atribuir`
        : `/api/admin/questoes/${safeGet(itemSelecionado, 'id')}/atribuir`;
      
      const response = await api.patch(endpoint, {
        destino: destinoSelecionado // 'torneio' ou 'teste'
      }, { token });

      if (response.success) {
        showFeedback('success', `✅ ${tipoItem === 'bloco' ? 'Bloco' : 'Questão'} atribuído a ${destinoSelecionado === 'torneio' ? 'Torneios' : 'Testes'} com sucesso!`);
        setModalAtribuirAberto(false);
        setItemSelecionado(null);
        setDestinoSelecionado('');
        
        // Remover item da lista atual (foi movido para outra categoria)
        if (tipoItem === 'bloco') {
          setBlocos(prev => prev.filter(b => safeGet(b, 'id') !== safeGet(itemSelecionado, 'id')));
        } else {
          setQuestoes(prev => prev.filter(q => safeGet(q, 'id') !== safeGet(itemSelecionado, 'id')));
        }
      } else {
        showFeedback('error', `❌ Erro ao atribuir: ${response.message || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error(`Erro ao atribuir ${tipoItem}:`, err);
      showFeedback('error', `❌ Erro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletarItem = async () => {
    if (!itemSelecionado) return;
    
    setSalvando(true);
    try {
      const endpoint = tipoItem === 'bloco' 
        ? `/api/blocos/${safeGet(itemSelecionado, 'id')}` 
        : `/api/questoes/${safeGet(itemSelecionado, 'id')}`;
      
      const response = await api.delete(endpoint, { token });

      if (response.success) {
        showFeedback('success', `✅ ${tipoItem === 'bloco' ? 'Bloco' : 'Questão'} deletado com sucesso!`);
        setModalDeletarAberto(false);
        setItemSelecionado(null);
        
        // Atualiza listas
        if (tipoItem === 'bloco') {
          setBlocos(prev => prev.filter(b => safeGet(b, 'id') !== safeGet(itemSelecionado, 'id')));
          // Recarregar questões que podem estar vinculadas
          await carregarDados();
        } else {
          setQuestoes(prev => prev.filter(q => safeGet(q, 'id') !== safeGet(itemSelecionado, 'id')));
        }
      } else {
        showFeedback('error', `❌ Erro ao deletar: ${response.message || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error(`Erro ao deletar ${tipoItem}:`, err);
      showFeedback('error', `❌ Erro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };

  // ========== RENDERIZAÇÃO ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== FEEDBACK ===== */}
      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 border ${
          feedback.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Questões dos Colaboradores
          </h1>
          <p className="text-gray-600 mt-2">
            Visualize questões e blocos aprovados enviados pelos colaboradores
          </p>
        </div>
        <button
          onClick={carregarDados}
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
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
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
          Blocos Aprovados
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
          Questões Aprovadas
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {questoesFiltradas.length}
          </span>
        </button>
      </div>

      {/* ===== CONTEÚDO DAS ABAS ===== */}
      <div>
        {/* ABA 1: BLOCOS */}
        {abaAtiva === 'blocos' && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <Layers className="w-7 h-7" />
                Blocos Aprovados
              </h2>
              <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold">
                Total: {blocosFiltrados.length}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Blocos de questões criados por colaboradores e aprovados para uso.
            </p>

            {/* Cards de Blocos */}
            <div className="bg-white rounded-lg border border-blue-200 p-4">
              {blocosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold">Nenhum bloco aprovado</p>
                  <p className="text-sm text-gray-500 mt-2">Aguardando colaboradores enviarem blocos</p>
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
                              <span>📝 {safeString(safeGet(b, 'autor_nome'), 'Desconhecido')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-200 mt-3">
  <button 
    onClick={() => abrirVisualizacao(b, 'bloco')}
    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
    title="Visualizar detalhes"
  >
    <Eye className="w-4 h-4" />
  </button>
  <div className="flex gap-2 sm:flex-1">
    <button 
      onClick={() => abrirModalAtribuir(b, 'bloco')}
      className="flex-1 px-3 py-2 text-xs text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
    >
      <Send className="w-3.5 h-3.5" /> Atribuir
    </button>
    <button 
      onClick={() => abrirConfirmacaoDeletar(b, 'bloco')}
      className="flex-1 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
    >
      <Trash2 className="w-3.5 h-3.5" /> Deletar
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
                <p className="text-xs font-semibold text-blue-800">Disciplinas Representadas</p>
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

        {/* ABA 2: QUESTÕES */}
        {abaAtiva === 'questoes' && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
                <FileText className="w-7 h-7" />
                Questões Aprovadas
              </h2>
              <span className="text-sm bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                Total: {questoesFiltradas.length}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Questões individuais criadas por colaboradores e aprovadas para uso.
            </p>

            {/* Tabela de Questões */}
            <div className="overflow-x-auto bg-white rounded-lg border border-indigo-200">
              {questoesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold">Nenhuma questão aprovada</p>
                  <p className="text-sm text-gray-500 mt-2">Aguardando colaboradores enviarem questões</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-indigo-100 border-b-2 border-indigo-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900">Título</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900">Disciplina</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900">Dificuldade</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900">Origem</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100">
                    {safeMap(questoesFiltradas, (q, i, key) => (
                      <tr key={key} className="hover:bg-indigo-50 transition-colors">
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
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">
                              {safeString(safeGet(q, 'autor_nome'), 'Desconhecido')}
                            </span>
                          ) : safeGet(q, 'criado_por') ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                              {safeString(safeGet(q, 'criado_por'), 'Sistema')}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                              Administrador Master
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => abrirVisualizacao(q, 'questao')}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors" 
                              title="Agrupar"
                            >
                              <Layers className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => abrirVisualizacao(q, 'questao')}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => abrirModalAtribuir(q, 'questao')}
                              className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors" 
                              title="Atribuir a Torneio/Teste"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => abrirConfirmacaoDeletar(q, 'questao')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors" 
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <div className="bg-indigo-100 rounded p-3">
                <p className="text-xs font-semibold text-indigo-700">Total de Questões</p>
                <p className="text-2xl font-bold text-indigo-900">{questoesFiltradas.length}</p>
              </div>
              <div className="bg-indigo-200 rounded p-3">
                <p className="text-xs font-semibold text-indigo-800">Disciplinas Representadas</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {new Set(questoesFiltradas.map(q => safeGet(q, 'disciplina'))).size}
                </p>
              </div>
              <div className="bg-indigo-300 rounded p-3">
                <p className="text-xs font-semibold text-indigo-900">Questões por Autor</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {new Set(questoesFiltradas.map(q => safeGet(q, 'autor_nome') || safeGet(q, 'criado_por') || 'Sistema')).size}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL: VISUALIZAR ===== */}
      {modalVisualizarAberto && itemSelecionado && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                {tipoItem === 'bloco' ? 'Detalhes do Bloco' : 'Detalhes da Questão'}
              </h2>
              <button
                onClick={() => {
                  setModalVisualizarAberto(false);
                  setItemSelecionado(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Título</label>
                <p className="mt-1 text-gray-900 font-medium">
                  {safeString(safeGet(itemSelecionado, 'titulo'), 'Sem título')}
                </p>
              </div>

              {/* Disciplina e Dificuldade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Disciplina</label>
                  <div className="mt-1">
                    <DisciplinaBadge disciplina={safeGet(itemSelecionado, 'disciplina')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Dificuldade</label>
                  <div className="mt-1">
                    <DificuldadeBadge dificuldade={safeGet(itemSelecionado, 'dificuldade', 'medio')} />
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Descrição</label>
                <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {safeString(safeGet(itemSelecionado, 'descricao'), 'Sem descrição')}
                </p>
              </div>

              {/* Se for bloco, mostrar questões */}
              {tipoItem === 'bloco' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Questões do Bloco ({safeArray(safeGet(itemSelecionado, 'questoes', [])).length})
                  </label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {safeArray(safeGet(itemSelecionado, 'questoes', [])).length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhuma questão neste bloco</p>
                    ) : (
                      safeMap(safeGet(itemSelecionado, 'questoes'), (q, i, key) => (
                        <div key={key} className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {i + 1}. {safeString(safeGet(q, 'titulo'), 'Questão sem título')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Criado em */}
              {safeGet(itemSelecionado, 'created_at') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Criado em</label>
                  <p className="mt-1 text-gray-700 text-sm">
                    {new Date(safeGet(itemSelecionado, 'created_at')).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setModalVisualizarAberto(false);
                  setItemSelecionado(null);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: DELETAR ===== */}
      {modalDeletarAberto && itemSelecionado && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Confirmar Deleção
            </h2>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar {tipoItem === 'bloco' ? 'o bloco' : 'a questão'} <strong>
                "{safeString(safeGet(itemSelecionado, 'titulo'), 'item')}"
              </strong>?
              {tipoItem === 'bloco' && (
                <span className="block mt-2 text-sm text-red-600 font-semibold">
                  ⚠️ Isso também deletará todas as questões vinculadas a este bloco!
                </span>
              )}
              <span className="block mt-2 text-sm text-gray-500">Esta ação não pode ser desfeita.</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalDeletarAberto(false);
                  setItemSelecionado(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletarItem}
                disabled={salvando}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {salvando ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: ATRIBUIR A TORNEIO/TESTE ===== */}
      {modalAtribuirAberto && itemSelecionado && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Atribuir {tipoItem === 'bloco' ? 'Bloco' : 'Questão'}
            </h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Selecione para onde deseja atribuir {tipoItem === 'bloco' ? 'o bloco' : 'a questão'} <strong>
                  "{safeString(safeGet(itemSelecionado, 'titulo'), 'item')}"
                </strong>:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setDestinoSelecionado('torneio')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    destinoSelecionado === 'torneio'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      destinoSelecionado === 'torneio'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {destinoSelecionado === 'torneio' && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Torneios</p>
                      <p className="text-sm text-gray-600">Será usado em competições e torneios</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDestinoSelecionado('teste')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    destinoSelecionado === 'teste'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      destinoSelecionado === 'teste'
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}>
                      {destinoSelecionado === 'teste' && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Testes de Conhecimento</p>
                      <p className="text-sm text-gray-600">Será usado em testes públicos e avaliações</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalAtribuirAberto(false);
                  setItemSelecionado(null);
                  setDestinoSelecionado('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAtribuirItem}
                disabled={salvando || !destinoSelecionado}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {salvando ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Atribuindo...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Atribuir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}