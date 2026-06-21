/**
 * AdminBlocosColaboradoresPendentesTab.jsx - FASE 3
 * 
 * Admin interface for reviewing and approving/rejecting blocos created by colaboradores
 * Features:
 * - List all pending blocos from colaboradores
 * - Approve with optional notes
 * - Reject with mandatory reason
 * - Filter, search, paginate
 * - Real-time status updates
 */

import { useState, useEffect } from 'react';
import {
  Loader, Check, X, Eye, AlertCircle, CheckCircle, Clock,
  Search, Filter, ChevronDown, Trash2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STATUS BADGE COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'pendente':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <Clock size={14} /> Pendente
        </span>
      );
    case 'aprovado':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle size={14} /> Aprovado
        </span>
      );
    case 'rejeitado':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          <AlertCircle size={14} /> Rejeitado
        </span>
      );
    default:
      return null;
  }
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// APPROVAL MODAL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const ApprovalModal = ({ bloco, onApprove, onCancel, carregando }) => {
  const [observacoes, setObservacoes] = useState('');

  const handleApprove = () => {
    onApprove(bloco.id, observacoes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Aprovar Bloco</h3>

          {/* Bloco Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">{bloco.titulo}</p>
            <p className="text-xs text-blue-800 line-clamp-2">{bloco.descricao}</p>
            <p className="text-xs text-blue-700 mt-2">
              Por: <span className="font-semibold">{bloco.criador?.name}</span>
            </p>
          </div>

          {/* Observations Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ObservaçÃµes (Opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Digite suas observaçÃµes sobre este bloco..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={carregando}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {carregando ? <Loader size={18} className="animate-spin" /> : <Check size={18} />}
              Aprovar
            </button>
            <button
              onClick={onCancel}
              disabled={carregando}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// REJECTION MODAL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const RejectionModal = ({ bloco, onReject, onCancel, carregando }) => {
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState(null);

  const handleReject = () => {
    if (!motivo.trim()) {
      setErro('O motivo da rejeição é obrigatório');
      return;
    }
    onReject(bloco.id, motivo, observacoes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Rejeitar Bloco</h3>

          {/* Bloco Info */}
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-900 mb-2">{bloco.titulo}</p>
            <p className="text-xs text-red-800 line-clamp-2">{bloco.descricao}</p>
            <p className="text-xs text-red-700 mt-2">
              Por: <span className="font-semibold">{bloco.criador?.name}</span>
            </p>
          </div>

          {/* Error Message */}
          {erro && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded text-sm">
              {erro}
            </div>
          )}

          {/* Motivo Field (Required) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Motivo da Rejeição <span className="text-red-600">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => {
                setMotivo(e.target.value);
                setErro(null);
              }}
              placeholder="Explique por que este bloco está sendo rejeitado..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* ObservaçÃµes Field (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ObservaçÃµes Adicionais (Opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Deixe sugestÃµes ou comentários adicionais..."
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={carregando}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {carregando ? <Loader size={18} className="animate-spin" /> : <X size={18} />}
              Rejeitar
            </button>
            <button
              onClick={onCancel}
              disabled={carregando}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DETAILS MODAL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const DetailsModal = ({ bloco, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Detalhes do Bloco</h3>

          <div className="space-y-4">
            {/* Título */}
            <div>
              <p className="text-sm font-medium text-slate-700">Título</p>
              <p className="text-slate-900">{bloco.titulo}</p>
            </div>

            {/* Descrição */}
            <div>
              <p className="text-sm font-medium text-slate-700">Descrição</p>
              <p className="text-slate-900 whitespace-pre-wrap">{bloco.descricao}</p>
            </div>

            {/* Disciplina */}
            <div>
              <p className="text-sm font-medium text-slate-700">Disciplina</p>
              <p className="text-slate-900 capitalize">{bloco.disciplina}</p>
            </div>

            {/* Dificuldade */}
            <div>
              <p className="text-sm font-medium text-slate-700">Dificuldade</p>
              <p className="text-slate-900 capitalize">{bloco.dificuldade}</p>
            </div>

            {/* Colaborador */}
            <div>
              <p className="text-sm font-medium text-slate-700">Colaborador</p>
              <p className="text-slate-900">{bloco.criador?.name} ({bloco.criador?.email})</p>
            </div>

            {/* Data Criação */}
            <div>
              <p className="text-sm font-medium text-slate-700">Data de Criação</p>
              <p className="text-slate-900">{new Date(bloco.created_at).toLocaleString('pt-BR')}</p>
            </div>

            {/* Status */}
            <div>
              <p className="text-sm font-medium text-slate-700">Status</p>
              <StatusBadge status={bloco.status} />
            </div>

            {/* Motivo de Rejeição */}
            {bloco.motivo_rejeicao && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-900 mb-1">Motivo da Rejeição</p>
                <p className="text-sm text-red-800">{bloco.motivo_rejeicao}</p>
              </div>
            )}

            {/* ObservaçÃµes Admin */}
            {bloco.observacoes_admin && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-1">ObservaçÃµes do Admin</p>
                <p className="text-sm text-blue-800">{bloco.observacoes_admin}</p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const AdminBlocosColaboradoresPendentesTab = ({ token }) => {
  const [blocos, setBlocos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [stats, setStats] = useState({ pendentes: 0, aprovados: 0, rejeitados: 0 });

  // Filters
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const LIMITE = 20;

  // Modals
  const [modalAprovacao, setModalAprovacao] = useState(null);
  const [modalRejeicao, setModalRejeicao] = useState(null);
  const [modalDetalhes, setModalDetalhes] = useState(null);
  const [processando, setProcessando] = useState(false);

  // Fetch blocos
  useEffect(() => {
    fetchBlocos();
  }, [filtroStatus, filtroDisciplina, busca, pagina]);

  const fetchBlocos = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const params = new URLSearchParams({
        pagina,
        limite: LIMITE,
        status: filtroStatus
      });

      if (filtroDisciplina) params.append('disciplina', filtroDisciplina);
      if (busca) params.append('busca', busca);

      const response = await fetch(
        `${API_BASE}/api/admin/blocos-colaboradores-pendentes?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Falha ao carregar blocos');

      const data = await response.json();
      setBlocos(data.dados?.blocos || []);
      setStats(data.dados?.estatisticas || {});
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleApprove = async (blocoId, observacoes) => {
    try {
      setProcessando(true);

      const response = await fetch(`${API_BASE}/api/admin/blocos/${blocoId}/aprovar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ observacoes: observacoes || undefined })
      });

      if (!response.ok) throw new Error('Falha ao aprovar bloco');

      setModalAprovacao(null);
      fetchBlocos();
    } catch (err) {
      setErro(err.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleReject = async (blocoId, motivo, observacoes) => {
    try {
      setProcessando(true);

      const response = await fetch(`${API_BASE}/api/admin/blocos/${blocoId}/rejeitar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motivo_rejeicao: motivo,
          observacoes: observacoes || undefined
        })
      });

      if (!response.ok) throw new Error('Falha ao rejeitar bloco');

      setModalRejeicao(null);
      fetchBlocos();
    } catch (err) {
      setErro(err.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Blocos de Colaboradores - Revisão</h2>
        <p className="text-gray-600">Revise e aprove/rejeite blocos criados por colaboradores</p>
      </div>

      {/* Error Alert */}
      {erro && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
          {erro}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm font-medium">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pendentes || 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 text-sm font-medium">Aprovados</p>
          <p className="text-2xl font-bold text-green-900">{stats.aprovados || 0}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 text-sm font-medium">Rejeitados</p>
          <p className="text-2xl font-bold text-red-900">{stats.rejeitados || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <select
          value={filtroStatus}
          onChange={e => {
            setFiltroStatus(e.target.value);
            setPagina(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
        </select>

        {/* Discipline Filter */}
        <select
          value={filtroDisciplina}
          onChange={e => {
            setFiltroDisciplina(e.target.value);
            setPagina(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as Disciplinas</option>
          <option value="matematica">Matemática</option>
          <option value="ingles">InglÃªs</option>
          <option value="programacao">Programação</option>
        </select>

        {/* Search */}
        <div className="flex-1 min-w-64 relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={busca}
            onChange={e => {
              setBusca(e.target.value);
              setPagina(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      {carregando ? (
        <div className="text-center py-12">
          <Loader className="animate-spin mx-auto" size={32} />
        </div>
      ) : blocos.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          Nenhum bloco encontrado
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Título</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Colaborador</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Disciplina</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Data</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">AçÃµes</th>
              </tr>
            </thead>
            <tbody>
              {blocos.map((bloco, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-800">{bloco.titulo}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{bloco.criador?.name}</td>
                  <td className="px-6 py-4 text-sm capitalize text-gray-800">{bloco.disciplina}</td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={bloco.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {new Date(bloco.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setModalDetalhes(bloco)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Ver detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      {bloco.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => setModalAprovacao(bloco)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Aprovar"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setModalRejeicao(bloco)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Rejeitar"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modalAprovacao && (
        <ApprovalModal
          bloco={modalAprovacao}
          onApprove={handleApprove}
          onCancel={() => setModalAprovacao(null)}
          carregando={processando}
        />
      )}

      {modalRejeicao && (
        <RejectionModal
          bloco={modalRejeicao}
          onReject={handleReject}
          onCancel={() => setModalRejeicao(null)}
          carregando={processando}
        />
      )}

      {modalDetalhes && (
        <DetailsModal
          bloco={modalDetalhes}
          onClose={() => setModalDetalhes(null)}
        />
      )}
    </div>
  );
};

export default AdminBlocosColaboradoresPendentesTab;

