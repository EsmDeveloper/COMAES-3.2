/**
 * QuestionsColaboradorPendentesTab.jsx
 * Aba para admin revisar questÃµes pendentes de colaboradores
 * Permite filtrar por colaborador, disciplina e status
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Check, X, AlertCircle, BookOpen, Filter,
  ChevronDown, User, Calendar, Clock, Eye, FileText,
  Loader, AlertTriangle, CheckCircle, XCircle, Code
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

// Badge de status
function StatusBadge({ status }) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aprovada: 'bg-green-100 text-green-800',
    rejeitada: 'bg-red-100 text-red-800',
  };
  const labels = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
  };
  const icons = {
    pendente: Clock,
    aprovada: CheckCircle,
    rejeitada: XCircle,
  };
  const Icon = icons[status] || Clock;

  return (
    <div className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 w-fit ${styles[status] || styles.pendente}`}>
      <Icon className="w-3.5 h-3.5" />
      {labels[status] || status}
    </div>
  );
}

// Badge de tipo de questÃ£o
function TipoBadge({ tipo }) {
  const styles = {
    multipla_escolha: 'bg-purple-100 text-purple-700',
    texto: 'bg-blue-100 text-blue-700',
    codigo: 'bg-green-100 text-green-700',
  };
  const labels = {
    multipla_escolha: 'MÃºltipla Escolha',
    texto: 'Texto',
    codigo: 'CÃ³digo',
  };
  const icons = {
    multipla_escolha: BookOpen,
    texto: FileText,
    codigo: Code,
  };
  const Icon = icons[tipo] || BookOpen;

  return (
    <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 w-fit ${styles[tipo] || styles.multipla_escolha}`}>
      <Icon className="w-3.5 h-3.5" />
      {labels[tipo] || tipo}
    </div>
  );
}

// Badge de dificuldade
function DificuldadeBadge({ dificuldade }) {
  const styles = {
    facil: 'bg-green-100 text-green-700',
    medio: 'bg-yellow-100 text-yellow-700',
    dificil: 'bg-red-100 text-red-700',
  };
  const labels = {
    facil: 'FÃ¡cil',
    medio: 'MÃ©dio',
    dificil: 'DifÃ­cil',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${styles[dificuldade] || styles.medio}`}>
      {labels[dificuldade] || dificuldade}
    </span>
  );
}

// Modal de rejeiÃ§Ã£o
function RejectQuestionModal({ isOpen, onClose, onConfirm, question }) {
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
      setError('O motivo da rejeiÃ§Ã£o Ã© obrigatÃ³rio');
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-slate-800">Rejeitar QuestÃ£o</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-3">VocÃª estÃ¡ rejeitando a questÃ£o:</p>
            <p className="font-semibold text-slate-800 bg-slate-50 p-3.5 rounded-xl line-clamp-2 border-l-4 border-red-500">
              {question?.titulo}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Motivo da RejeiÃ§Ã£o *
            </label>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError('');
              }}
              placeholder="Explique por que esta questÃ£o estÃ¡ sendo rejeitada..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-slate-500 mt-1.5">{motivo.length}/500 caracteres</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Rejeitar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de visualizaÃ§Ã£o detalhada
function QuestionDetailModal({ isOpen, onClose, question, onApprove, onReject }) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(
        `${apiBaseUrl}/api/admin/questoes/${question.id}/aprovar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const json = await res.json();
      if (json.sucesso) {
        onApprove();
        onClose();
      } else {
        alert('Erro ao aprovar: ' + json.mensagem);
      }
    } catch (err) {
      alert('Erro ao conectar: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleRejectSubmit = async (motivo) => {
    setRejecting(true);
    try {
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(
        `${apiBaseUrl}/api/admin/questoes/${question.id}/rejeitar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ motivo_rejeicao: motivo })
        }
      );
      const json = await res.json();
      if (json.sucesso) {
        onReject();
        setShowRejectModal(false);
        onClose();
      } else {
        throw new Error(json.mensagem);
      }
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setRejecting(false);
    }
  };

  if (!isOpen || !question) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <h2 className="text-lg font-bold text-slate-800 truncate">{question.titulo}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status & Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Status</p>
                <StatusBadge status={question.status_aprovacao} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Tipo</p>
                <TipoBadge tipo={question.tipo} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Dificuldade</p>
                <DificuldadeBadge dificuldade={question.dificuldade} />
              </div>
            </div>

            {/* Pontos */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Pontos</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                <p className="text-2xl font-bold text-blue-700">{question.pontos}</p>
              </div>
            </div>

            {/* Enunciado */}
            {question.descricao && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Enunciado</h3>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3.5 rounded-xl whitespace-pre-wrap">
                  {question.descricao}
                </p>
              </div>
            )}

            {/* ConteÃºdo por tipo */}
            {question.tipo === 'multipla_escolha' && question.opcoes && question.opcoes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">OpÃ§Ãµes</h3>
                <div className="space-y-2">
                  {question.opcoes.map((opcao, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border-2 ${
                        opcao.correta
                          ? 'bg-green-50 border-green-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          opcao.correta
                            ? 'border-green-500 bg-green-100'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {opcao.correta && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{opcao.texto}</p>
                          {opcao.correta && (
                            <p className="text-xs text-green-700 font-semibold mt-1">Resposta Correta</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(question.tipo === 'texto' || question.tipo === 'codigo') && (
              <>
                {question.resposta_esperada && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Resposta Esperada</h3>
                    <p className="text-slate-600 text-sm bg-slate-50 p-3.5 rounded-xl whitespace-pre-wrap font-mono">
                      {question.resposta_esperada}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ExplicaÃ§Ã£o */}
            {question.explicacao && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">ExplicaÃ§Ã£o</h3>
                <p className="text-slate-600 text-sm bg-blue-50 border border-blue-200 p-3.5 rounded-xl leading-relaxed">
                  {question.explicacao}
                </p>
              </div>
            )}

            {/* Autor */}
            {question.autor && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-center gap-3">
                <User className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-purple-700">Criado por</p>
                  <p className="text-sm text-purple-900">{question.autor.nome || question.autor}</p>
                </div>
              </div>
            )}

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-600">Criado em</p>
                  <p className="font-medium text-slate-800">
                    {question.createdAt ? new Date(question.createdAt).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-600">Atualizado em</p>
                  <p className="font-medium text-slate-800">
                    {question.updatedAt ? new Date(question.updatedAt).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Motivo da rejeiÃ§Ã£o (se rejeitado) */}
            {question.motivo_rejeicao && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Motivo da RejeiÃ§Ã£o
                </p>
                <p className="text-sm text-red-900">{question.motivo_rejeicao}</p>
              </div>
            )}

            {/* Actions */}
            {question.status_aprovacao === 'pendente' && (
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {approving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Aprovando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Aprovar QuestÃ£o
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={rejecting}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <RejectQuestionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectSubmit}
        question={question}
      />
    </>
  );
}

// Component principal
export default function QuestionsColaboradorPendentesTab() {
  const [questions, setQuestions] = useState([]);
  const [filtros, setFiltros] = useState({
    status: 'pendente',
    busca: '',
    colaborador: '',
    tipo: '',
    ordenacao: 'recentes'
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const token = localStorage.getItem('comaes_token');

  // Fetch questÃµes
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limite: 20,
        pagina,
        ...(filtros.status !== 'todas' && { status: filtros.status }),
        ...(filtros.busca && { busca: filtros.busca }),
        ...(filtros.colaborador && { colaborador_id: filtros.colaborador }),
        ...(filtros.tipo && { tipo: filtros.tipo }),
        ordenacao: filtros.ordenacao
      });

      const res = await fetch(`${apiBaseUrl}/api/admin/questoes-colaborador?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (json.sucesso) {
        setQuestions(json.dados.questoes || []);
        setTotalPaginas(json.dados.paginacao?.totalPaginas || 1);
      } else {
        setError(json.mensagem || 'Erro ao carregar questÃµes');
      }
    } catch (err) {
      setError('Erro de conexÃ£o: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [token, pagina, filtros]);

  // Fetch colaboradores para dropdown
  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/admin/colaboradores?limite=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (json.sucesso) {
          setColaboradores(json.dados.colaboradores || []);
        }
      } catch (err) {
        console.error('Erro ao carregar colaboradores:', err);
      }
    };

    if (token) fetchColaboradores();
  }, [token]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleApproveSuccess = () => {
    setPagina(1);
    fetchQuestions();
  };

  const handleRejectSuccess = () => {
    setPagina(1);
    fetchQuestions();
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-slate-800">QuestÃµes de Colaboradores</h2>
        </div>
        <p className="text-slate-600">Revise e aprove questÃµes criadas por colaboradores</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por tÃ­tulo..."
              value={filtros.busca}
              onChange={(e) => {
                setFiltros({ ...filtros, busca: e.target.value });
                setPagina(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={filtros.status}
              onChange={(e) => {
                setFiltros({ ...filtros, status: e.target.value });
                setPagina(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition font-medium"
            >
              <option value="pendente">Pendentes</option>
              <option value="aprovada">Aprovadas</option>
              <option value="rejeitada">Rejeitadas</option>
              <option value="todas">Todas</option>
            </select>
          </div>

          {/* Colaborador */}
          <div>
            <select
              value={filtros.colaborador}
              onChange={(e) => {
                setFiltros({ ...filtros, colaborador: e.target.value });
                setPagina(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition font-medium"
            >
              <option value="">Todos Colaboradores</option>
              {colaboradores.map(col => (
                <option key={col.id} value={col.id}>
                  {col.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <select
              value={filtros.tipo}
              onChange={(e) => {
                setFiltros({ ...filtros, tipo: e.target.value });
                setPagina(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition font-medium"
            >
              <option value="">Todos Tipos</option>
              <option value="multipla_escolha">MÃºltipla Escolha</option>
              <option value="texto">Texto</option>
              <option value="codigo">CÃ³digo</option>
            </select>
          </div>

          {/* OrdenaÃ§Ã£o */}
          <div>
            <select
              value={filtros.ordenacao}
              onChange={(e) => setFiltros({ ...filtros, ordenacao: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition font-medium"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="antigos">Mais Antigos</option>
              <option value="titulo">Por TÃ­tulo (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ConteÃºdo */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-slate-600 font-medium">Carregando questÃµes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Erro</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Nenhuma questÃ£o para revisar</p>
          <p className="text-slate-500 text-sm mt-2">Todas as questÃµes foram revisadas ou nÃ£o hÃ¡ questÃµes aguardando revisÃ£o</p>
        </div>
      ) : (
        <>
          {/* Tabela */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">TÃ­tulo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Autor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Criado em</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {questions.map((question) => (
                    <tr key={question.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800 line-clamp-2">{question.titulo}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-700">
                            {question.autor?.nome?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{question.autor?.nome || 'Desconhecido'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <TipoBadge tipo={question.tipo} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={question.status_aprovacao} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(question.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedQuestion(question);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition font-medium text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Revisar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PaginaÃ§Ã£o */}
          {totalPaginas > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPagina(Math.max(1, pagina - 1))}
                disabled={pagina === 1}
                className="px-3 py-2 rounded-lg border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Anterior
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`w-10 h-10 rounded-lg font-medium transition ${
                    p === pagina
                      ? 'bg-purple-600 text-white'
                      : 'border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina === totalPaginas}
                className="px-3 py-2 rounded-lg border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                PrÃ³xima
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <QuestionDetailModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedQuestion(null);
        }}
        question={selectedQuestion}
        onApprove={handleApproveSuccess}
        onReject={handleRejectSuccess}
      />
    </div>
  );
}

