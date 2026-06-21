/**
 * AprovarQuestÃães.jsx
 * Admin page for reviewing and approving/rejecting pending questions
 * 
 * Task 12.1: Create AprovarQuestÃães page (admin)
 * Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search, Check, X, AlertCircle, BookOpen, Filter,
  ChevronDown, RefreshCw, Eye, Clock, User, Award,
  Loader, ArrowRight
} from 'lucide-react';
import {
  DificuldadeBadge,
  DisciplinaBadge,
  ConfirmarComMotivoModal,
  extrairOpcoes,
  mostrarToast
} from './shared/QuestaoCardsComponents';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 
  `http://${window.location.hostname}:3002`;

// â”€â”€â”€ SKELETON LOADER â”€â”€â”€
const SkeletonLoader = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 animate-pulse">
    <div className="space-y-3">
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-slate-200 rounded w-20"></div>
        <div className="h-8 bg-slate-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// â”€â”€â”€ DETAIL MODAL â”€â”€â”€
const QuestionDetailModal = ({ isOpen, questao, onClose }) => {
  if (!isOpen || !questao) return null;

  const opcoes = extrairOpcoes(questao);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-slate-800">Detalhes da Questão</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Título */}
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{questao.titulo}</h3>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <DisciplinaBadge disciplina={questao.disciplina} />
            <DificuldadeBadge dificuldade={questao.dificuldade} />
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {questao.pontos} pontos
            </span>
          </div>

          {/* Autor Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-slate-600 mb-1">Autor</p>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{questao.autor?.nome || 'Desconhecido'}</p>
                <p className="text-sm text-slate-600">{questao.autor?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Descrição</h4>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {questao.descricao}
            </p>
          </div>

          {/* Alternativas */}
          {opcoes.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-700 mb-3">Alternativas</h4>
              <div className="space-y-2">
                {opcoes.map((opcao, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-2 transition ${
                      opcao === questao.resposta_correta
                        ? 'bg-green-50 border-green-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700 min-w-fit">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span className="text-slate-700">
                        {opcao}
                      </span>
                      {opcao === questao.resposta_correta && (
                        <span className="ml-auto text-green-700 font-semibold text-sm">
                          âœ“ Correta
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explicação */}
          {questao.explicacao && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2">Explicação</h4>
              <p className="text-amber-800 text-sm leading-relaxed whitespace-pre-wrap">
                {questao.explicacao}
              </p>
            </div>
          )}

          {/* Tipo e Linguagem */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Tipo</p>
              <p className="font-semibold text-slate-800">
                {questao.tipo === 'multipla_escolha' ? 'MÃºltipla Escolha' : 
                 questao.tipo === 'texto' ? 'Texto' :
                 questao.tipo === 'codigo' ? 'Código' : questao.tipo}
              </p>
            </div>
            {questao.linguagem && (
              <div>
                <p className="text-sm text-slate-600 mb-1">Linguagem</p>
                <p className="font-semibold text-slate-800">{questao.linguagem}</p>
              </div>
            )}
          </div>

          {/* Data de Criação */}
          <div className="text-xs text-slate-500 pt-4 border-t border-slate-200">
            Criada em {new Date(questao.created_at).toLocaleDateString('pt-BR')} Ã s {new Date(questao.created_at).toLocaleTimeString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
};

// â”€â”€â”€ QUESTÃO CARD â”€â”€â”€
const QuestionCard = ({ questao, onApprove, onReject, onViewDetails, loading }) => {
  const opcoes = extrairOpcoes(questao);
  const primeiraOpcao = opcoes[0] || '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Header com info do autor */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {questao.autor?.nome || 'Desconhecido'}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {questao.autor?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">
              {new Date(questao.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* ConteÃºdo */}
      <div className="p-6 space-y-4">
        {/* Título */}
        <h3 className="text-lg font-semibold text-slate-800 line-clamp-2">
          {questao.titulo}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <DisciplinaBadge disciplina={questao.disciplina} />
          <DificuldadeBadge dificuldade={questao.dificuldade} />
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {questao.pontos} pts
          </span>
        </div>

        {/* Descrição */}
        <p className="text-sm text-slate-600 line-clamp-2">
          {questao.descricao}
        </p>

        {/* Preview de alternativa */}
        {primeiraOpcao && (
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-2 font-medium">Primeira alternativa</p>
            <p className="text-sm text-slate-700 line-clamp-1">
              A. {primeiraOpcao}
            </p>
          </div>
        )}
      </div>

      {/* Footer com açÃães */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <button
          onClick={onViewDetails}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Visualizar</span>
        </button>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={onReject}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-lg transition duration-200"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Rejeitar
          </button>

          <button
            onClick={onApprove}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-lg transition duration-200"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Aprovar
          </button>
        </div>
      </div>
    </div>
  );
};

// â”€â”€â”€ COMPONENTE PRINCIPAL â”€â”€â”€
export default function AprovarQuestÃães() {
  const { token } = useAuth();

  // Estado
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplinaFilter, setDisciplinaFilter] = useState('');
  const [dificuldadeFilter, setDificuldadeFilter] = useState('');

  // Modais
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuestao, setSelectedQuestao] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [questaoParaRejeitar, setQuestaoParaRejeitar] = useState(null);

  // Carregar questÃães pendentes
  const carregarQuestoes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (disciplinaFilter) params.append('disciplina', disciplinaFilter);
      if (dificuldadeFilter) params.append('dificuldade', dificuldadeFilter);

      const response = await fetch(
        `${API_BASE_URL}/api/questoes/pendentes?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('QuestÃães pendentes:', result);

      if (result.sucesso || result.success) {
        const questoesList = result.dados?.questoes || result.dados || result.questoes || [];
        setQuestoes(Array.isArray(questoesList) ? questoesList : []);
      } else {
        throw new Error(result.mensagem || result.error || 'Erro ao carregar questÃães');
      }
    } catch (err) {
      console.error('Erro ao carregar questÃães:', err);
      setError(err.message || 'Erro desconhecido');
      setQuestoes([]);
    } finally {
      setLoading(false);
    }
  }, [token, disciplinaFilter, dificuldadeFilter]);

  // Carregar ao montar
  useEffect(() => {
    carregarQuestoes();
  }, [carregarQuestoes]);

  // Aprovar questão
  const handleApprove = async (questaoId) => {
    setActionLoading(questaoId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/questoes/${questaoId}/aprovar`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao aprovar: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.sucesso || result.success) {
        mostrarToast('Questão aprovada com sucesso!', 'success');
        setQuestoes(questoes.filter(q => q.id !== questaoId));
      } else {
        throw new Error(result.mensagem || 'Erro ao aprovar questão');
      }
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      mostrarToast(err.message || 'Erro ao aprovar questão', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Rejeitar questão
  const handleReject = async (motivo) => {
    if (!questaoParaRejeitar) return;

    setActionLoading(questaoParaRejeitar.id);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/questoes/${questaoParaRejeitar.id}/rejeitar`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ motivo_rejeicao: motivo })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao rejeitar: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.sucesso || result.success) {
        mostrarToast('Questão rejeitada com sucesso!', 'success');
        setQuestoes(questoes.filter(q => q.id !== questaoParaRejeitar.id));
        setRejectModalOpen(false);
        setQuestaoParaRejeitar(null);
      } else {
        throw new Error(result.mensagem || 'Erro ao rejeitar questão');
      }
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
      mostrarToast(err.message || 'Erro ao rejeitar questão', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtrar questÃães
  const questoesFiltradas = questoes.filter(q => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      q.titulo?.toLowerCase().includes(searchLower) ||
      q.descricao?.toLowerCase().includes(searchLower) ||
      q.autor?.nome?.toLowerCase().includes(searchLower) ||
      q.autor?.email?.toLowerCase().includes(searchLower);

    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Aprovar QuestÃães</h1>
          </div>
          <p className="text-slate-600">
            Revise e aprove questÃães pendentes de colaboradores
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative col-span-1 md:col-span-2 lg:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Filtro Disciplina */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <select
                value={disciplinaFilter}
                onChange={(e) => setDisciplinaFilter(e.target.value)}
                className="w-full pl-12 pr-8 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
              >
                <option value="">Todas as disciplinas</option>
                <option value="matematica">Matemática</option>
                <option value="ingles">Inglês</option>
                <option value="programacao">Programação</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Filtro Dificuldade */}
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <select
                value={dificuldadeFilter}
                onChange={(e) => setDificuldadeFilter(e.target.value)}
                className="w-full pl-12 pr-8 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
              >
                <option value="">Todas as dificuldades</option>
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Botão Atualizar */}
            <button
              onClick={carregarQuestoes}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition duration-200 col-span-1 md:col-span-2 lg:col-span-1"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Contador de questÃães */}
        {!loading && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">QuestÃães Pendentes</p>
                <p className="text-4xl font-bold">{questoesFiltradas.length}</p>
              </div>
              <Clock className="w-16 h-16 text-blue-300 opacity-50" />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar questÃães</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
              <button
                onClick={carregarQuestoes}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition whitespace-nowrap"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && questoesFiltradas.length === 0 && questoes.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhuma questão pendente</h3>
            <p className="text-slate-600">
              Todas as questÃães foram revisadas. Ã“timo trabalho! 
            </p>
          </div>
        )}

        {/* Filtered Results Empty */}
        {!loading && !error && questoesFiltradas.length === 0 && questoes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-slate-600">
              Tente ajustar seus filtros ou termos de busca
            </p>
          </div>
        )}

        {/* Lista de QuestÃães */}
        {!loading && questoesFiltradas.length > 0 && (
          <div className="space-y-4">
            {questoesFiltradas.map((questao) => (
              <QuestionCard
                key={questao.id}
                questao={questao}
                loading={actionLoading === questao.id}
                onApprove={() => handleApprove(questao.id)}
                onReject={() => {
                  setQuestaoParaRejeitar(questao);
                  setRejectModalOpen(true);
                }}
                onViewDetails={() => {
                  setSelectedQuestao(questao);
                  setDetailModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <QuestionDetailModal
        isOpen={detailModalOpen}
        questao={selectedQuestao}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedQuestao(null);
        }}
      />

      {/* Modal de Rejeição */}
      <ConfirmarComMotivoModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setQuestaoParaRejeitar(null);
        }}
        onConfirm={handleReject}
        titulo="Rejeitar Questão"
        subtitulo="Explique o motivo da rejeição:"
        itemNome={questaoParaRejeitar?.titulo}
        loading={actionLoading === questaoParaRejeitar?.id}
        buttonText="Rejeitar"
        buttonVariant="red"
      />
    </div>
  );
}

