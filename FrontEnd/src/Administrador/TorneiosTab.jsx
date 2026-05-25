/**
 * TorneiosTab.jsx - RECONSTRUÍDO
 * Gerenciamento de torneios com arquitetura limpa
 * Responsabilidade: Orquestração de estado e fluxo de dados
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
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TournamentForm from './components/TournamentForm';
import { ModalOverlay, DeleteConfirmationModal, ViewDetailsModal } from './components/TournamentModal';
import { TournamentService } from './services/TournamentService';

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

  /**
   * Carregar lista de torneios
   */
  const fetchTorneios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TournamentService.fetchAll(token);
      setTorneios(data);
    } catch (err) {
      showToast(err.message || 'Erro ao carregar torneios', 'error');
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

  /**
   * Mostrar notificação
   */
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  /**
   * Abrir modal de criação
   */
  const handleOpenCreate = useCallback(() => {
    setModalForm({ open: true, mode: 'create', data: null });
  }, []);

  /**
   * Abrir modal de edição
   */
  const handleOpenEdit = useCallback((torneio) => {
    setModalForm({ open: true, mode: 'edit', data: torneio });
  }, []);

  /**
   * Fechar modal de formulário
   */
  const handleCloseForm = useCallback(() => {
    setModalForm({ open: false, mode: 'create', data: null });
  }, []);

  /**
   * Salvar torneio (criar ou editar)
   */
  const handleSaveTorneio = useCallback(
    async (payload) => {
      setIsProcessing(true);
      try {
        if (modalForm.mode === 'create') {
          payload.criado_por = user?.id;
          await TournamentService.create(payload, token);
          // Refresh full list to get server-side data (includes, etc.)
          await fetchTorneios();
          showToast('Torneio criado com sucesso!');
        } else {
          const result = await TournamentService.update(modalForm.data.id, payload, token);
          setTorneios(prev => prev.map(t => (t.id === (result.id || modalForm.data.id) ? { ...t, ...result } : t)));
          showToast('Torneio atualizado com sucesso!');
        }

        handleCloseForm();
      } catch (err) {
        showToast(err.message || 'Erro ao salvar torneio', 'error');
      } finally {
        setIsProcessing(false);
      }
    },
    [modalForm.mode, modalForm.data, token, user, handleCloseForm, fetchTorneios]
  );

  /**
   * Confirmar exclusão
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!modalDelete.id) return;

    setIsProcessing(true);
    try {
      await TournamentService.delete(modalDelete.id, token);

      // Remover da lista
      setTorneios(prev => prev.filter(t => t.id !== modalDelete.id));

      // Fechar modal de visualização se estava aberto
      if (modalView.data?.id === modalDelete.id) {
        setModalView({ open: false, data: null });
      }

      showToast('Torneio excluído com sucesso!');
      setModalDelete({ open: false, id: null, title: '' });
    } catch (err) {
      showToast(err.message || 'Erro ao excluir torneio', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [modalDelete.id, token, modalView.data?.id]);

  /**
   * Filtrar torneios por busca
   */
  const filteredTorneios = torneios.filter(t => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      t.titulo?.toLowerCase().includes(query) ||
      t.disciplina?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-2 sm:p-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar torneios..."
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
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Disciplina</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
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
              filteredTorneios.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{t.titulo}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {new Date(t.inicia_em).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.disciplina || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        t.status === 'ativo'
                          ? 'bg-green-100 text-green-700'
                          : t.status === 'finalizado'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg z-50 ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Modal de Formulário */}
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

      {/* Modal de Exclusão */}
      <DeleteConfirmationModal
        isOpen={modalDelete.open}
        onClose={() => setModalDelete({ open: false, id: null, title: '' })}
        onConfirm={handleConfirmDelete}
        title={modalDelete.title}
        isLoading={isProcessing}
      />

      {/* Modal de Visualização */}
      <ViewDetailsModal
        isOpen={modalView.open}
        onClose={() => setModalView({ open: false, data: null })}
        tournament={modalView.data}
      />
    </div>
  );
}
