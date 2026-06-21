/**
 * QuestoesColaboradoresTab.jsx - VERSÃO FUNCIONAL COM DATA SAFETY LAYER
 * Aba simples e robusta para questões aprovadas de colaboradores
 * ✅ DATA SAFETY: safeArray, safeMap, safeGet, safeString aplicados
 */

import { useState, useEffect } from 'react';
import {
  Search, BookOpen, Trash2, Eye,
  AlertCircle, RefreshCw, FileText, Layers, Loader
} from 'lucide-react';
import { safeGet, safeArray, safeString, safeMap } from '../utils/dataSafety';
import { api } from '../utils/safeApi';

// Badge simples com DATA SAFETY
const DisciplinaBadge = ({ disciplina }) => {
  const colors = {
    matematica: 'bg-blue-100 text-blue-800',
    programacao: 'bg-purple-100 text-purple-800',
    ingles: 'bg-green-100 text-green-800',
  };
  const labels = {
    matematica: 'Matemática',
    programacao: 'Programação',
    ingles: 'Inglês',
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

export default function QuestoesColaboradoresTab() {
  const [blocos, setBlocos] = useState([]);
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [disciplina, setDisciplina] = useState('');

  const token = localStorage.getItem('comaes_token');

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

      // ✅ DATA SAFETY: Carregar blocos com api client seguro
      let blocosData = [];
      try {
        const response = await api.get('/api/blocos-colaboradores', { 
          token,
          params: { status_aprovacao: 'aprovada' }
        });
        
        if (response.success) {
          blocosData = safeArray(safeGet(response, 'data.dados.blocos', safeGet(response, 'data.blocos', [])));
        }
        console.log('[QuestoesColaboradores] Blocos:', blocosData.length);
      } catch (e1) {
        console.log('[QuestoesColaboradores] Fallback /api/blocos');
        try {
          const response = await api.get('/api/blocos', { token });
          if (response.success) {
            const allBlocos = safeArray(safeGet(response, 'data.blocos', []));
            blocosData = allBlocos.filter(b => safeGet(b, 'status_aprovacao') === 'aprovada');
          }
          console.log('[QuestoesColaboradores] Blocos (fallback):', blocosData.length);
        } catch (e2) {
          console.log('[QuestoesColaboradores] Blocos falha:', e2.message);
        }
      }

      // ✅ DATA SAFETY: Carregar questões com api client seguro
      let questoesData = [];
      try {
        const response = await api.get('/api/questoes', { 
          token,
          params: { status_aprovacao: 'aprovada' }
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

  // ✅ DATA SAFETY: Filtragem segura com safeGet e safeString
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

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-slate-50 rounded-xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Questões Aprovadas dos Colaboradores</h2>
        </div>
        <p className="text-slate-600">Visualize questões e blocos aprovados</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={carregarDados} className="text-sm text-red-600 font-semibold hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Todas</option>
          <option value="matematica">Matemática</option>
          <option value="programacao">Programação</option>
          <option value="ingles">Inglês</option>
        </select>

        <button onClick={carregarDados} className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blocos */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Blocos</h3>
            <span className="ml-auto text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">{blocosFiltrados.length}</span>
          </div>

          {blocosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Nenhum bloco</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* ✅ DATA SAFETY: safeMap com keys automáticas */}
              {safeMap(blocosFiltrados, (b, i, key) => (
                <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-1 flex-wrap">
                        <DisciplinaBadge disciplina={safeGet(b, 'disciplina')} />
                        <DificuldadeBadge dificuldade={safeGet(b, 'dificuldade', 'medio')} />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">
                        {safeString(safeGet(b, 'titulo'), `Bloco ${i + 1}`)}
                      </h4>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Ver
                    </button>
                    <button className="ml-auto text-xs text-red-600 hover:text-red-800 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Questões */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800">Questões</h3>
            <span className="ml-auto text-sm font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">{questoesFiltradas.length}</span>
          </div>

          {questoesFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Nenhuma questão</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* ✅ DATA SAFETY: safeMap com keys automáticas */}
              {safeMap(questoesFiltradas, (q, i, key) => (
                <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-1 flex-wrap">
                        <DisciplinaBadge disciplina={safeGet(q, 'disciplina')} />
                        <DificuldadeBadge dificuldade={safeGet(q, 'dificuldade')} />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">
                        {safeString(safeGet(q, 'titulo'), `Questão ${i + 1}`)}
                      </h4>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Ver
                    </button>
                    <button className="ml-auto text-xs text-red-600 hover:text-red-800 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}