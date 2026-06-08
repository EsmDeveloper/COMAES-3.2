/**
 * QuestoesPendentesTab.jsx
 * Aba para admin revisar questões pendentes de colaboradores
 */
import { useState, useEffect, useCallback } from 'react';
import questoesService from '../services/questoesService';
import {
  Search, Check, X, AlertCircle, BookOpen, Filter,
  ChevronDown, User, Calendar, Clock, Info
} from 'lucide-react';

// ─── HELPER FUNCTIONS ───

/**
 * Extrair array de opcoes de diferentes formatos
 */
function extrairOpcoes(questao) {
  if (!questao) return [];
  
  try {
    if (Array.isArray(questao.opcoes)) {
      return questao.opcoes;
    }
    if (typeof questao.opcoes === 'string') {
      const parsed = JSON.parse(questao.opcoes);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (e) {
    console.warn(`⚠️ Erro ao parsear opcoes da questão ${questao.id}:`, e);
    return [];
  }
}

// Badge de status
function StatusBadge({ status }) {
  const styles = {
    pendente: 'bg-blue-100 text-blue-800',
    aprovada: 'bg-blue-200 text-blue-900',
    rejeitada: 'bg-blue-300 text-blue-900',
  };
  const labels = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pendente}`}>
      {labels[status] || status}
    </span>
  );
}

// Badge de dificuldade
function DificuldadeBadge({ dificuldade }) {
  const styles = {
    facil: 'bg-blue-100 text-blue-700',
    medio: 'bg-blue-200 text-blue-800',
    dificil: 'bg-blue-300 text-blue-900',
  };
  const labels = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[dificuldade] || styles.medio}`}>
      {labels[dificuldade] || dificuldade}
    </span>
  );
}

// Modal de rejeição
function RejeitarModal({ isOpen, onClose, onConfirm, questao }) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo.trim()) {
      setError('O motivo da rejeição é obrigatório');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(motivo);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Rejeitar Questão</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">
              Você está rechazando a questão:
            </p>
            <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-lg line-clamp-2">
              {questao?.titulo}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Motivo da Rejeição <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Explique o motivo da rejeição..."
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Rejeitando...' : (
                <>
                  <X className="w-4 h-4" />
                  Confirmar Rejeição
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Detalhes da questão em modal
function QuestaoDetailModal({ questao, isOpen, onClose }) {
  if (!isOpen || !questao) return null;

  const opcoes = extrairOpcoes(questao);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Detalhes da Questão</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Disciplina e Status */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
              {questao.disciplina}
            </span>
            <StatusBadge status={questao.status_aprovacao} />
            <DificuldadeBadge dificuldade={questao.dificuldade} />
          </div>

          {/* Título */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 mb-1">Título</h3>
            <p className="text-slate-800 font-medium">{questao.titulo}</p>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 mb-1">Descrição/Enunciado</h3>
            <p className="text-slate-800">{questao.descricao}</p>
          </div>

          {/* Alternativas */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 mb-2">Alternativas</h3>
            <div className="space-y-2">
              {opcoes.map((opcao, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    opcao === questao.resposta_correta
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  <span className="font-medium text-slate-500 mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opcao}
                  {opcao === questao.resposta_correta && (
                    <span className="ml-2 text-blue-600 text-xs font-semibold">✓ Correta</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explicação */}
          {questao.explicacao && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">Explicação</h3>
              <p className="text-slate-700">{questao.explicacao}</p>
            </div>
          )}

          {/* Pontos */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 mb-1">Pontos</h3>
            <p className="text-slate-800">{questao.pontos}</p>
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User className="w-4 h-4" />
              <span>Autor ID: {questao.autor_id || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>Criado em: {new Date(questao.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal
export default function QuestoesPendentesTab() {
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [busca, setBusca] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuestao, setSelectedQuestao] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Carregar questões pendentes
  const carregarQuestoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { status_aprovacao: 'pendente' };
      if (filtroDisciplina) params.disciplina = filtroDisciplina;
      
      const response = await questoesService.listar(params);
      
      // Backend returns: { sucesso: true, dados: { questoes: [], total, ... } }
      // Extract questões array safely
      let questoesData = [];
      if (response?.dados?.questoes && Array.isArray(response.dados.questoes)) {
        questoesData = response.dados.questoes;
      } else if (response?.questoes && Array.isArray(response.questoes)) {
        questoesData = response.questoes;
      }
      
      // Ensure each item is valid before displaying
      questoesData = questoesData.filter(q => q && q.id);
      
      console.log('✅ Questões pendentes carregadas:', questoesData.length);
      setQuestoes(questoesData);
    } catch (err) {
      const errorMsg = err?.message || 'Erro ao carregar questões pendentes';
      setError(errorMsg);
      console.error('❌ Erro ao carregar questões pendentes:', err);
    } finally {
      setLoading(false);
    }
  }, [filtroDisciplina]);

  useEffect(() => {
    carregarQuestoes();
  }, [carregarQuestoes]);

  // Aprovar questão
  const handleAprovar = async (id) => {
    setActionLoading(id);
    try {
      await questoesService.aprovar(id);
      // Mensagem visual de sucesso
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50';
      toast.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        <span><strong>Questão aprovada!</strong> Ela agora está disponível em "Questões dos Colaboradores" e pode ser adicionada a Torneios ou Testes.</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
      
      await carregarQuestoes();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Rejeitar questão
  const handleRejeitar = async (motivo) => {
    if (!questaoSelecionada) return;
    setActionLoading(questaoSelecionada.id);
    try {
      await questoesService.rejeitar(questaoSelecionada.id, motivo);
      setRejectModalOpen(false);
      setQuestaoSelecionada(null);
      await carregarQuestoes();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Abrir modal de rejeição
  const openRejectModal = (questao) => {
    setQuestaoSelecionada(questao);
    setRejectModalOpen(true);
  };

  // Abrir detalhes
  const openDetails = (questao) => {
    setSelectedQuestao(questao);
    setDetailModalOpen(true);
  };

  // Filtrar por busca
  const questoesFiltradas = questoes.filter(q => {
    if (!busca) return true;
    const buscaLower = busca.toLowerCase();
    return (
      q?.titulo?.toLowerCase().includes(buscaLower) ||
      q?.descricao?.toLowerCase().includes(buscaLower)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Revisão de Questões
        </h2>
        <p className="text-slate-600 mt-1">
          Revise e aprove as questões criadas pelos colaboradores
        </p>
        
        {/* Info do fluxo */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 text-sm text-blue-800">
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">📋 Fluxo de aprovação:</p>
            <p className="text-xs mt-1">Colaborador cria questão → Você aprova aqui → Questão fica disponível na aba "Questões dos Colaboradores" → Admin/Colaborador adiciona a Torneios ou Testes</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro disciplina */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={filtroDisciplina}
              onChange={(e) => setFiltroDisciplina(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Todas as disciplinas</option>
              <option value="matematica">Matemática</option>
              <option value="ingles">Inglês</option>
              <option value="programacao">Programação</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Atualizar */}
          <button
            onClick={carregarQuestoes}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && questoes.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando questões pendentes...</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button onClick={carregarQuestoes} className="ml-auto text-sm underline">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Lista vazia */}
      {!loading && !error && questoesFiltradas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma questão pendente</h3>
          <p className="text-slate-500">
            {filtroDisciplina || busca
              ? 'Tente ajustar os filtros de busca.'
              : 'Não há questões aguardando revisão no momento.'}
          </p>
        </div>
      )}

      {/* Lista de questões */}
      {!loading && !error && questoesFiltradas.length > 0 && (
        <div className="space-y-4">
          {questoesFiltradas.map((questao) => {
            if (!questao) return null;
            const opcoes = extrairOpcoes(questao);
            
            return (
              <div
                key={questao.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                      {questao.disciplina}
                    </span>
                    <DificuldadeBadge dificuldade={questao.dificuldade} />
                    <span className="text-xs text-slate-500">{questao.pontos} pts</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(questao.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Título e descrição */}
                <h3 className="font-semibold text-slate-800 mb-1">{questao.titulo}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{questao.descricao}</p>

                {/* Alternativas */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Alternativas:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {opcoes.slice(0, 4).map((opcao, idx) => (
                      <div
                        key={idx}
                        className={`text-sm px-2 py-1 rounded ${
                          opcao === questao.resposta_correta
                            ? 'bg-blue-100 text-blue-800 font-medium'
                            : 'bg-white text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}. {opcao}
                        {opcao === questao.resposta_correta && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openDetails(questao)}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Ver detalhes
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => openRejectModal(questao)}
                    disabled={actionLoading === questao.id}
                    className="px-4 py-1.5 text-sm border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Rejeitar
                  </button>
                  <button
                    onClick={() => handleAprovar(questao.id)}
                    disabled={actionLoading === questao.id}
                    className="px-4 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
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

      {/* Contador */}
      {!loading && !error && questoesFiltradas.length > 0 && (
        <div className="mt-4 text-center text-sm text-slate-500">
          Total: {questoesFiltradas.length} questão{questoesFiltradas.length !== 1 ? 's' : ''} pendente{questoesFiltradas.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Modal de rejeição */}
      <RejeitarModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setQuestaoSelecionada(null);
        }}
        onConfirm={handleRejeitar}
        questao={questaoSelecionada}
      />

      {/* Modal de detalhes */}
      <QuestaoDetailModal
        questao={selectedQuestao}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedQuestao(null);
        }}
      />
    </div>
  );
}