/**
 * TorneiosTab.jsx
 * Gerenciamento completo de torneios
 * Implementa: carregamento correto de dados, feedback visual, tratamento de erros
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Trash2,
  Eye,
  Search,
  Plus,
  Edit,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  BookOpen,
  Globe,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TournamentForm from './components/TournamentForm';
import { ModalOverlay, DeleteConfirmationModal, ViewDetailsModal } from './components/TournamentModal';
import { TournamentService } from './services/TournamentService';
import BlocosService from './services/BlocosService';

// Mapeamento de status para configuraÃ§Ã£o visual
const STATUS_CONFIG = {
  rascunho: {
    label: 'Rascunho',
    className: 'bg-amber-100 text-amber-700',
    icon: 'FileText',
  },
  ativo: {
    label: 'Ativo',
    className: 'bg-emerald-100 text-emerald-700',
    icon: 'Zap',
  },
  finalizado: {
    label: 'Finalizado',
    className: 'bg-blue-100 text-blue-700',
    icon: 'CheckCircle',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-rose-100 text-rose-700',
    icon: 'AlertCircle',
  },
};

export default function TorneiosTab() {
  const { token, user } = useAuth();

  // Estado de dados
  const [torneios, setTorneios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de modais
  const [modalForm, setModalForm] = useState({ open: false, mode: 'create', data: null });
  const [modalDelete, setModalDelete] = useState({ open: false, id: null, title: '' });
  const [modalView, setModalView] = useState({ open: false, data: null });

  // Estado de processamento
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // ============================================
  // CARREGAR LISTA DE TORNEIOS
  // ============================================
  const fetchTorneios = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[TorneiosTab] Carregando torneios...');
      const data = await TournamentService.fetchAll(token);
      console.log('[TorneiosTab] Torneios carregados:', data?.length || 0);
      
      // Garantir que Ã© array (nÃ£o Ã© erro)
      const torneiosData = Array.isArray(data) ? data : [];
      setTorneios(torneiosData);
    } catch (err) {
      console.error('[TorneiosTab] Erro ao carregar torneios:', err);
      // Apenas mostrar erro se for falha real de rede/servidor
      // NÃ£o mostrar erro se a lista estiver vazia (isso Ã© normal)
      setTorneios([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Carregar torneios ao montar
  useEffect(() => {
    if (token) {
      fetchTorneios();
    }
  }, [token, fetchTorneios]);

  // ============================================
  // NOTIFICAÃ‡Ã•ES
  // ============================================
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // ============================================
  // HANDLERS DE MODAL
  // ============================================
  const handleOpenCreate = useCallback(() => {
    console.log('[TorneiosTab] Abrindo modal de criaÃ§Ã£o');
    setModalForm({ open: true, mode: 'create', data: null });
  }, []);

  const handleOpenEdit = useCallback((torneio) => {
    console.log('[TorneiosTab] Abrindo modal de ediÃ§Ã£o para:', {
      id: torneio.id,
      titulo: torneio.titulo,
      status: torneio.status,
      inicia_em: torneio.inicia_em,
      termina_em: torneio.termina_em,
    });
    setModalForm({ open: true, mode: 'edit', data: { ...torneio } });
  }, []);

  const handleCloseForm = useCallback(() => {
    setModalForm({ open: false, mode: 'create', data: null });
  }, []);

  // ============================================
  // SALVAR TORNEIO
  // ============================================
  const handleSaveTorneio = useCallback(
    async (payload) => {
      setIsProcessing(true);
      try {
        console.log('[TorneiosTab] Salvando torneio:', { mode: modalForm.mode, payload });

        // Validar: se tentando ativar um torneio, verificar se jÃ¡ existe outro ativo
        if (payload.status === 'ativo' && modalForm.mode === 'create') {
          const torneioAtivoExistente = torneios.some(t => t.status === 'ativo');
          if (torneioAtivoExistente) {
            showToast('âŒ JÃ¡ existe um torneio ativo! Finalize-o antes de criar outro.', 'error');
            setIsProcessing(false);
            return;
          }
        }

        if (modalForm.mode === 'edit' && payload.status === 'ativo') {
          const outroTorneioAtivo = torneios.some(t => t.id !== modalForm.data.id && t.status === 'ativo');
          if (outroTorneioAtivo) {
            showToast('âŒ JÃ¡ existe outro torneio ativo! Finalize-o antes de ativar este.', 'error');
            setIsProcessing(false);
            return;
          }
        }

        if (modalForm.mode === 'create') {
          // Adicionar criador
          payload.criado_por = user?.id;

          // Extrair blocos antes de enviar ao backend (campo interno do form)
          const blocosParaAssociar = payload._blocosParaAssociar || [];
          delete payload._blocosParaAssociar;

          // Criar torneio
          const novoTorneio = await TournamentService.create(payload, token);
          console.log('[TorneiosTab] Torneio criado:', novoTorneio);

          // Associar blocos selecionados (se houver e o torneio foi criado com sucesso)
          const torneioId = novoTorneio?.torneio?.id || novoTorneio?.id;
          if (torneioId && blocosParaAssociar.length > 0) {
            const resultados = await Promise.allSettled(
              blocosParaAssociar.map(blocoId =>
                BlocosService.associar(token, torneioId, blocoId)
              )
            );
            const falhas = resultados.filter(r => r.status === 'rejected');
            if (falhas.length > 0) {
              console.warn('[TorneiosTab] Alguns blocos nÃ£o foram associados:', falhas);
              showToast(`Torneio criado, mas ${falhas.length} bloco(s) nÃ£o foram associados.`, 'warning');
            } else {
              showToast(`Torneio criado com ${blocosParaAssociar.length} bloco(s) associado(s)!`);
            }
          } else {
            showToast('Torneio criado com sucesso!');
          }

          // Atualizar lista completa
          await fetchTorneios();
        } else {
          // Atualizar torneio existente
          const updatedTorneio = await TournamentService.update(
            modalForm.data.id,
            payload,
            token
          );
          console.log('[TorneiosTab] Torneio atualizado:', updatedTorneio);

          // Atualizar na lista local
          setTorneios(prev =>
            prev.map(t =>
              t.id === (updatedTorneio.id || modalForm.data.id)
                ? { ...t, ...updatedTorneio }
                : t
            )
          );

          showToast('AlteraÃ§Ãµes salvas com sucesso!');
        }

        handleCloseForm();
      } catch (err) {
        console.error('[TorneiosTab] Erro ao salvar:', err);
        
        // âœ… Tratamento especial para erro de concorrÃªncia
        if (err.message && err.message.includes('TOURNAMENT_CONFLICT')) {
          showToast('âŒ NÃ£o Ã© possÃ­vel criar/ativar dois torneios ao mesmo tempo. Finalize o torneio anterior.', 'error');
        } else {
          showToast(err.message || 'Erro ao salvar torneio', 'error');
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [modalForm.mode, modalForm.data, token, user, handleCloseForm, fetchTorneios, showToast, torneios]
  );

  // ============================================
  // FINALIZAR TORNEIO
  // ============================================
  const handleFinalizeTorneio = useCallback(async (torneioId) => {
    if (!window.confirm('Tem certeza que deseja finalizar este torneio? Esta aÃ§Ã£o irÃ¡ gerar certificados para os vencedores.')) {
      return;
    }

    setIsProcessing(true);
    try {
      console.log('[TorneiosTab] Finalizando torneio:', torneioId);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`}/api/torneios/${torneioId}/finalizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          disciplinas: ['MatemÃ¡tica', 'ProgramaÃ§Ã£o', 'InglÃªs']
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao finalizar torneio');
      }

      console.log('[TorneiosTab] Torneio finalizado:', data);

      // Atualizar lista
      await fetchTorneios();
      
      showToast(`Torneio finalizado! ${data.certificados?.length || 0} certificados gerados.`);
    } catch (err) {
      console.error('[TorneiosTab] Erro ao finalizar:', err);
      showToast(err.message || 'Erro ao finalizar torneio', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [token, fetchTorneios, showToast]);

  // ============================================
  // EXCLUIR TORNEIO
  // ============================================
  const handleConfirmDelete = useCallback(async () => {
    if (!modalDelete.id) return;

    setIsProcessing(true);
    try {
      console.log('[TorneiosTab] Excluindo torneio:', modalDelete.id);
      await TournamentService.delete(modalDelete.id, token);

      // Remover da lista
      setTorneios(prev => prev.filter(t => t.id !== modalDelete.id));

      // Fechar modal de visualizaÃ§Ã£o se estava aberto
      if (modalView.data?.id === modalDelete.id) {
        setModalView({ open: false, data: null });
      }

      showToast('Torneio excluÃ­do com sucesso!');
      setModalDelete({ open: false, id: null, title: '' });
    } catch (err) {
      console.error('[TorneiosTab] Erro ao excluir:', err);
      showToast(err.message || 'Erro ao excluir torneio', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [modalDelete.id, token, modalView.data?.id, showToast]);

  // ============================================
  // FILTRAR TORNEIOS
  // ============================================
  const filteredTorneios = torneios.filter(t => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      t.titulo?.toLowerCase().includes(query) ||
      t.status?.toLowerCase().includes(query) ||
      t.descricao?.toLowerCase().includes(query)
    );
  });

  // ============================================
  // FORMATAR DATA PARA EXIBIÃ‡ÃƒO
  // ============================================
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  // ============================================
  // RENDERIZAÃ‡ÃƒO
  // ============================================
  return (
    <div className="p-2 sm:p-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar torneios por tÃ­tulo, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus size={18} /> Criar Torneio
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Torneio</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">PerÃ­odo</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">AÃ§Ãµes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Carregando torneios...
                  </div>
                </td>
              </tr>
            ) : filteredTorneios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'Nenhum torneio encontrado.' : 'Nenhum torneio criado ainda.'}
                </td>
              </tr>
            ) : (
              filteredTorneios.map(t => {
                const statusConfig = STATUS_CONFIG[t.status] || STATUS_CONFIG.rascunho;
                return (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{t.titulo}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        Criado em {formatDate(t.criado_em)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 w-fit ${
                        t.tipo_torneio === 'especifico'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {t.tipo_torneio === 'especifico' ? (
                          <>
                            <BookOpen size={14} />
                            EspecÃ­fico {t.disciplina_especifica && `(${t.disciplina_especifica})`}
                          </>
                        ) : (
                          <>
                            <Globe size={14} />
                            GenÃ©rico
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">InÃ­cio:</span>
                          <span className="font-medium">{formatDate(t.inicia_em)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-400">Fim:</span>
                          <span className="font-medium">{formatDate(t.termina_em)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit ${statusConfig.className}`}>
                        {statusConfig.icon === 'FileText' && <FileText size={12} />}
                        {statusConfig.icon === 'Zap' && <Zap size={12} />}
                        {statusConfig.icon === 'CheckCircle' && <CheckCircle size={12} />}
                        {statusConfig.icon === 'AlertCircle' && <AlertCircle size={12} />}
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status === 'ativo' && (
                          <button
                            onClick={() => handleFinalizeTorneio(t.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Finalizar torneio"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                          title="Editar torneio"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setModalView({ open: true, data: t })}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Visualizar detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => setModalDelete({ open: true, id: t.id, title: t.titulo })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Deletar torneio"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg z-50 flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-amber-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={18} />
          ) : toast.type === 'error' ? (
            <XCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {toast.message}
        </div>
      )}

      {/* Modal de FormulÃ¡rio */}
      <ModalOverlay
        isOpen={modalForm.open}
        onClose={handleCloseForm}
        maxWidth="600px"
      >
        <TournamentForm
          mode={modalForm.mode}
          initialData={modalForm.data}
          onSubmit={handleSaveTorneio}
          onCancel={handleCloseForm}
          isLoading={isProcessing}
        />
      </ModalOverlay>

      {/* Modal de ExclusÃ£o */}
      <DeleteConfirmationModal
        isOpen={modalDelete.open}
        onClose={() => setModalDelete({ open: false, id: null, title: '' })}
        onConfirm={handleConfirmDelete}
        title={modalDelete.title}
        isLoading={isProcessing}
      />

      {/* Modal de VisualizaÃ§Ã£o */}
      <ViewDetailsModal
        isOpen={modalView.open}
        onClose={() => setModalView({ open: false, data: null })}
        tournament={modalView.data}
      />
    </div>
  );
}