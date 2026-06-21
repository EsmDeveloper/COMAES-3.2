/**
 * BlocosColaboradoresTab.jsx
 * Aba para admin revisar blocos de questões criados por colaboradores
 * Permite aprovar/rejeitar blocos antes de ficarem disponíveis nos testes
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Check, X, AlertCircle, BookOpen, Filter,
  ChevronDown, User, Calendar, Clock, Eye, FileText,
  Loader, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

// Badge de status
function StatusBadge({ status }) {
  const styles = {
    rascunho: 'bg-blue-100 text-blue-800',
    aguardando_revisao: 'bg-yellow-100 text-yellow-800',
    aprovado: 'bg-green-100 text-green-800',
    rejeitado: 'bg-red-100 text-red-800',
  };
  const labels = {
    rascunho: 'Rascunho',
    aguardando_revisao: 'Aguardando Revisão',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
  };
  const icons = {
    rascunho: AlertTriangle,
    aguardando_revisao: Clock,
    aprovado: CheckCircle,
    rejeitado: XCircle,
  };
  const Icon = icons[status] || Clock;
  
  return (
    <div className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 w-fit ${styles[status] || styles.rascunho}`}>
      <Icon className="w-3.5 h-3.5" />
      {labels[status] || status}
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
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${styles[dificuldade] || styles.medio}`}>
      {labels[dificuldade] || dificuldade}
    </span>
  );
}

// Modal de rejeição
function RejeitarBlocoModal({ isOpen, onClose, onConfirm, bloco }) {
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-slate-800">Rejeitar Bloco</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-3">Você está rejeitando o bloco:</p>
            <p className="font-semibold text-slate-800 bg-slate-50 p-3.5 rounded-xl line-clamp-2 border-l-4 border-red-500">
              {bloco?.titulo}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Motivo da Rejeição *
            </label>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError('');
              }}
              placeholder="Explique por que este bloco está sendo rejeitado..."
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

// Modal de visualização detalhada
function BlocoDetailModal({ isOpen, onClose, bloco, onApprove, onReject }) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(
        `${apiBaseUrl}/api/admin/blocos/${bloco.id}/aprovar`,
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
        `${apiBaseUrl}/api/admin/blocos/${bloco.id}/rejeitar`,
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

  if (!isOpen || !bloco) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <h2 className="text-lg font-bold text-slate-800 truncate">{bloco.titulo}</h2>
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
                <StatusBadge status={bloco.status} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Dificuldade</p>
                <DificuldadeBadge dificuldade={bloco.dificuldade || 'medio'} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Ativo</p>
                <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${bloco.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {bloco.ativo ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>

            {/* Descrição */}
            {bloco.descricao && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Descrição</h3>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3.5 rounded-xl">
                  {bloco.descricao}
                </p>
              </div>
            )}

            {/* Criador */}
            {bloco.criadoPor && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-700">Criado por</p>
                  <p className="text-sm text-blue-900">{bloco.criadoPor.nome || bloco.criadoPor}</p>
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
                    {bloco.createdAt ? new Date(bloco.createdAt).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-600">Atualizado em</p>
                  <p className="font-medium text-slate-800">
                    {bloco.updatedAt ? new Date(bloco.updatedAt).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Motivo da rejeição (se rejeitado) */}
            {bloco.motivo_rejeicao && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Motivo da Rejeição
                </p>
                <p className="text-sm text-red-900">{bloco.motivo_rejeicao}</p>
              </div>
            )}

            {/* Actions */}
            {bloco.status === 'aguardando_revisao' && (
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
                      Aprovar Bloco
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

      <RejeitarBlocoModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectSubmit}
        bloco={bloco}
      />
    </>
  );
}

// Component principal
export default function BlocosColaboradoresTab() {
  const [blocos, setBlocos] = useState([]);
  const [filtros, setFiltros] = useState({
    status: 'aguardando_revisao',
    busca: '',
    ordenacao: 'recentes'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBloco, setSelectedBloco] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const token = localStorage.getItem('comaes_token');

  // Fetch blocos
  const fetchBlocos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limite: 20,
        pagina,
        ...(filtros.status !== 'todos' && { status: filtros.status }),
        ...(filtros.busca && { busca: filtros.busca }),
        ordenacao: filtros.ordenacao
      });

      const res = await fetch(`${apiBaseUrl}/api/admin/blocos-pendentes?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (json.sucesso) {
        setBlocos(json.dados.blocos || []);
        setTotalPaginas(json.dados.paginacao?.totalPaginas || 1);
      } else {
        setError(json.mensagem || 'Erro ao carregar blocos');
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [token, pagina, filtros]);

  useEffect(() => {
    fetchBlocos();
  }, [fetchBlocos]);

  const handleApproveSuccess = () => {
    setPagina(1);
    fetchBlocos();
  };

  const handleRejectSuccess = () => {
    setPagina(1);
    fetchBlocos();
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Blocos de Colaboradores</h2>
        </div>
        <p className="text-slate-600">Revise e aprove blocos de questões criados por colaboradores</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={filtros.busca}
              onChange={(e) => {
                setFiltros({ ...filtros, busca: e.target.value });
                setPagina(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition font-medium"
            >
              <option value="aguardando_revisao">Aguardando Revisão</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <select
              value={filtros.ordenacao}
              onChange={(e) => setFiltros({ ...filtros, ordenacao: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition font-medium"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="antigos">Mais Antigos</option>
              <option value="titulo">Por Título (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ConteÃºdo */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium">Carregando blocos...</p>
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
      ) : blocos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Nenhum bloco para revisar</p>
          <p className="text-slate-500 text-sm mt-2">Todos os blocos foram revisados ou não há blocos aguardando revisão</p>
        </div>
      ) : (
        <>
          {/* Tabela */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Título</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Criador</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Dificuldade</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Criado em</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">AçÃães</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {blocos.map((bloco) => (
                    <tr key={bloco.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800 line-clamp-2">{bloco.titulo}</p>
                        {bloco.descricao && (
                          <p className="text-sm text-slate-500 line-clamp-1 mt-1">{bloco.descricao}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                            {bloco.criadoPor?.nome?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{bloco.criadoPor?.nome || 'Desconhecido'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={bloco.status} />
                      </td>
                      <td className="px-6 py-4">
                        <DificuldadeBadge dificuldade={bloco.dificuldade || 'medio'} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(bloco.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedBloco(bloco);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-medium text-sm"
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

          {/* Paginação */}
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
                      ? 'bg-blue-600 text-white'
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
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <BlocoDetailModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBloco(null);
        }}
        bloco={selectedBloco}
        onApprove={handleApproveSuccess}
        onReject={handleRejectSuccess}
      />
    </div>
  );
}

