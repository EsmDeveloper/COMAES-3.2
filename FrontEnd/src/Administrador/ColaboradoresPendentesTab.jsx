/**
 * ColaboradoresPendentesTab.jsx
 * Aba para gestão de pedidos de colaboradores pendentes
 * 
 * Funcionalidades:
 * - Listar colaboradores com status pendente
 * - Visualizar dados do candidato
 * - Aprovar ou rejeitar pedidos
 * - Incluir motivo de rejeição
 */

import React, { useState, useEffect } from 'react';
import adminService from './adminService';
import { useAuth } from '../context/AuthContext';
import { 
  Users, CheckCircle, XCircle, AlertCircle, Search, 
  Clock, Mail, GraduationCap, User, Eye
} from 'lucide-react';

const ColaboradoresPendentesTab = () => {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [modalRejeitar, setModalRejeitar] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  // Feedback inline (substitui react-hot-toast — o projeto usa alert/estado)
  const [feedback, setFeedback] = useState(null); // { tipo: 'success'|'error', msg: '...' }

  const showFeedback = (tipo, msg) => {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Instância do adminService com token (padrão do projeto)
  const svc = adminService(token);

  // Carregar pedidos pendentes
  const carregarPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await svc.listarColaboradoresPendentes();
      setPedidos(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Erro ao carregar pedidos de colaboradores');
      showFeedback('error', 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Aprovar colaborador
  const aprovarColaborador = async (id, disciplina) => {
    try {
      setLoadingAction(id);
      await svc.aprovarColaborador(id, disciplina);
      showFeedback('success', 'Colaborador aprovado com sucesso!');
      await carregarPedidos();
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      showFeedback('error', 'Erro ao aprovar colaborador');
    } finally {
      setLoadingAction(null);
    }
  };

  // Rejeitar colaborador
  const rejeitarColaborador = async (id) => {
    try {
      setLoadingAction(id);
      await svc.rejeitarColaborador(id, { motivo: motivoRejeicao });
      showFeedback('success', 'Colaborador rejeitado.');
      setModalRejeitar(null);
      setMotivoRejeicao('');
      await carregarPedidos();
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
      showFeedback('error', 'Erro ao rejeitar colaborador');
    } finally {
      setLoadingAction(null);
    }
  };

  // Filtrar pedidos pela busca
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (!busca.trim()) return true;
    const buscaLower = busca.toLowerCase();
    return (
      pedido.nome?.toLowerCase().includes(buscaLower) ||
      pedido.email?.toLowerCase().includes(buscaLower) ||
      pedido.disciplina_colaborador?.toLowerCase().includes(buscaLower)
    );
  });

  // Carregar pedidos na montagem
  useEffect(() => {
    carregarPedidos();
  }, []);

  // Ver detalhes do pedido
  const verDetalhes = (pedido) => {
    setSelectedPedido(pedido);
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const config = {
      pendente: { label: 'Pendente', cor: 'bg-yellow-100 text-yellow-800' },
      aprovado: { label: 'Aprovado', cor: 'bg-green-100 text-green-800' },
      rejeitado: { label: 'Rejeitado', cor: 'bg-red-100 text-red-800' }
    }[status] || { label: status, cor: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.cor}`}>
        {config.label}
      </span>
    );
  };

  // Modal de rejeição
  const ModalRejeitar = () => {
    if (!modalRejeitar) return null;

    const pedido = pedidos.find(p => p.id === modalRejeitar);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Rejeitar Colaborador</h3>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <p className="text-slate-600">
                Tem certeza que deseja rejeitar o pedido de <strong>{pedido?.nome}</strong>?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Email: {pedido?.email}<br />
                Disciplina: {pedido?.disciplina_colaborador}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Motivo da rejeição (opcional)
              </label>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Explique o motivo da rejeição..."
              />
              <p className="text-xs text-slate-500 mt-1">
                Este motivo será registrado e pode ser útil para o candidato.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalRejeitar(null);
                  setMotivoRejeicao('');
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => rejeitarColaborador(modalRejeitar)}
                disabled={loadingAction === modalRejeitar}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingAction === modalRejeitar ? (
                  <>Processando...</>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Rejeitar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de detalhes
  const ModalDetalhes = () => {
    if (!selectedPedido) return null;

    const [documentos, setDocumentos] = React.useState(null);
    const [loadingDocs, setLoadingDocs] = React.useState(false);
    const [errorDocs, setErrorDocs] = React.useState(null);

    React.useEffect(() => {
      const carregarDocumentos = async () => {
        setLoadingDocs(true);
        setErrorDocs(null);
        try {
          const res = await svc.getDocumentosColaborador(selectedPedido.id);
          // Normalizar sempre para array, independente do formato da resposta
          let raw = res?.data ?? res;
          // Se vier como string JSON (double-encoded), fazer parse
          if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); } catch { raw = []; }
          }
          const lista = Array.isArray(raw) ? raw : (raw ? [raw] : []);
          setDocumentos(lista);
        } catch (err) {
          console.error('Erro ao carregar documentos:', err);
          setErrorDocs('Não foi possível carregar os documentos.');
        } finally {
          setLoadingDocs(false);
        }
      };
      carregarDocumentos();
    }, []);

    const formatDate = (dateString) => {
      if (!dateString) return 'Não informada';
      return new Date(dateString).toLocaleDateString('pt-PT');
    };

    // Base URL para servir os ficheiros
    const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

    // Normalizar a URL do documento para garantir que é acessível
    const resolveUrl = (doc) => {
      if (!doc) return null;
      if (typeof doc === 'string') return doc.startsWith('http') ? doc : `${API_BASE}${doc}`;
      // Preferir url completa; se não, construir a partir do caminho relativo
      const raw = doc.url || doc.caminho || doc.path || doc.filename;
      if (!raw) return null;
      if (raw.startsWith('http')) return raw;
      return `${API_BASE}${raw}`;
    };

    // Determinar ícone/etiqueta por extensão
    const getFileInfo = (nomeOuUrl) => {
      if (!nomeOuUrl) return { label: 'Ficheiro', color: 'bg-slate-100 text-slate-600' };
      const ext = nomeOuUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
        return { label: 'Imagem', color: 'bg-blue-100 text-blue-700', isImage: true };
      if (ext === 'pdf')
        return { label: 'PDF', color: 'bg-red-100 text-red-700' };
      if (['doc', 'docx'].includes(ext))
        return { label: 'Word', color: 'bg-blue-100 text-blue-800' };
      return { label: ext?.toUpperCase() || 'Ficheiro', color: 'bg-slate-100 text-slate-600' };
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Detalhes do Pedido</h3>
            <button 
              onClick={() => setSelectedPedido(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-800">{selectedPedido.nome}</h4>
                <p className="text-slate-500 text-sm">{selectedPedido.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Telefone</p>
                <p className="font-medium">{selectedPedido.telefone || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Data de Nascimento</p>
                <p className="font-medium">{formatDate(selectedPedido.nascimento)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Sexo</p>
                <p className="font-medium">{selectedPedido.sexo || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Escola</p>
                <p className="font-medium">{selectedPedido.escola || 'Não informada'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Disciplina Pretendida</p>
              <div className="mt-1">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  <GraduationCap className="w-4 h-4" />
                  <span className="capitalize">{selectedPedido.disciplina_colaborador}</span>
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Status do Pedido</p>
              <div className="mt-1">
                <StatusBadge status={selectedPedido.status_colaborador || 'pendente'} />
              </div>
            </div>

            {selectedPedido.biografia && (
              <div>
                <p className="text-sm text-slate-500">Biografia/Justificativa</p>
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {selectedPedido.biografia}
                  </p>
                </div>
              </div>
            )}

            {/* Documentos enviados pelo colaborador */}
            <div>
              <p className="text-sm text-slate-500 mb-2">Documentos Enviados</p>
              {loadingDocs ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                  A carregar documentos...
                </div>
              ) : errorDocs ? (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {errorDocs}
                </p>
              ) : !Array.isArray(documentos) || documentos.length === 0 ? (
                <p className="text-sm text-slate-400 italic bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  Nenhum documento enviado.
                </p>
              ) : (
                <div className="space-y-2">
                  {documentos.map((doc, idx) => {
                    const url = resolveUrl(doc);
                    const nome = typeof doc === 'string'
                      ? url?.split('/').pop()
                      : doc?.nome_original || doc?.nome || doc?.originalname || url?.split('/').pop() || `Documento ${idx + 1}`;
                    const info = getFileInfo(nome || url);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${info.color}`}>
                          {info.label}
                        </span>
                        <span className="text-sm text-slate-700 flex-1 truncate" title={nome}>
                          {nome}
                        </span>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Ver
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setSelectedPedido(null);
                  aprovarColaborador(selectedPedido.id, selectedPedido.disciplina_colaborador);
                }}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                disabled={loadingAction === selectedPedido.id}
              >
                {loadingAction === selectedPedido.id ? (
                  'Processando...'
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Aprovar
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedPedido(null);
                  setModalRejeitar(selectedPedido.id);
                }}
                className="flex-1 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center gap-2"
                disabled={loadingAction === selectedPedido.id}
              >
                <XCircle className="w-4 h-4" />
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderização principal
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Banner de feedback inline */}
      {feedback && (
        <div className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
          feedback.tipo === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedback.tipo === 'success'
            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {feedback.msg}
        </div>
      )}
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pedidos de Colaboradores
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Gerencie pedidos de registo como colaborador
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou disciplina..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando pedidos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <AlertCircle className="w-5 h-5" />
                Erro ao carregar pedidos
              </div>
              <p className="text-sm">{error}</p>
              <button
                onClick={carregarPedidos}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 max-w-sm mx-auto">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Sem pedidos pendentes</h3>
              <p className="text-slate-500 text-sm">
                Todos os pedidos de colaboradores foram processados.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Contadores */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-800">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {pedidos.filter(p => !p.status_colaborador || p.status_colaborador === 'pendente').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-800">Aprovados (total)</p>
                    <p className="text-2xl font-bold text-green-900">
                      {pedidos.filter(p => p.status_colaborador === 'aprovado').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-800">Rejeitados (total)</p>
                    <p className="text-2xl font-bold text-red-900">
                      {pedidos.filter(p => p.status_colaborador === 'rejeitado').length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Nome</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Email</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Disciplina</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Data Registo</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{pedido.nome}</p>
                            <p className="text-xs text-slate-500">{pedido.telefone || 'Sem telefone'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{pedido.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                          <span className="text-sm capitalize">{pedido.disciplina_colaborador}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={pedido.status_colaborador || 'pendente'} />
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(pedido.createdAt || pedido.created_at).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => verDetalhes(pedido)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => aprovarColaborador(pedido.id, pedido.disciplina_colaborador)}
                            disabled={loadingAction === pedido.id}
                            className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Aprovar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setModalRejeitar(pedido.id)}
                            disabled={loadingAction === pedido.id}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rejeitar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-slate-500">
              Total: {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      {/* Modais */}
      <ModalRejeitar />
      <ModalDetalhes />
    </div>
  );
};

export default ColaboradoresPendentesTab;