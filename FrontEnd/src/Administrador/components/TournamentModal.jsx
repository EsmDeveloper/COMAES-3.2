/**
 * TournamentModal.jsx
 * Modal wrapper para formulários e confirmações
 * Responsabilidade única: Gerenciar overlay e animações
 */

import React, { useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Modal genérico com overlay
 */
export function ModalOverlay({ isOpen, onClose, children, maxWidth = '600px' }) {
  // Bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth, height: 'min(90vh, 700px)' }}
      >
        {children}
        <style>{`
          /* Scrollbar styling */
          div::-webkit-scrollbar {
            width: 8px;
          }
          div::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          div::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    </div>
  );
}

/**
 * Modal de confirmação de exclusão
 */
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = '',
  isLoading = false
}) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} maxWidth="450px">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <h3 className="font-bold text-gray-900">Excluir Torneio?</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-center min-h-0">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <p className="text-gray-500 text-sm">
            Você está prestes a excluir <strong>{title}</strong>.
            <br />
            Esta ação não pode ser desfeita e removerá todos os rankings associados.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Excluindo...</span>
              </>
            ) : (
              'Sim, Excluir'
            )}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/**
 * Modal de visualização de detalhes
 */
export function ViewDetailsModal({ isOpen, onClose, tournament }) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} maxWidth="650px">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <h3 className="font-bold text-gray-900">Detalhes do Torneio</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {!tournament ? (
          <div className="flex-1 flex items-center justify-center p-6 text-gray-400">
            Nenhum torneio selecionado.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-[10px] uppercase font-black text-blue-500 block mb-1">
                  Título
                </span>
                <p className="font-bold text-gray-800">{tournament.titulo}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="text-[10px] uppercase font-black text-purple-500 block mb-1">
                  Disciplina
                </span>
                <p className="font-bold text-gray-800">{tournament.disciplina || '-'}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-black text-gray-400 block mb-2">
                Descrição
              </span>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {tournament.descricao || 'Sem descrição disponível.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase font-black text-gray-400 block mb-2">
                  Data de Início
                </span>
                <p className="text-sm font-bold text-gray-800">
                  {tournament.inicia_em
                    ? new Date(tournament.inicia_em).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase font-black text-gray-400 block mb-2">
                  Data de Término
                </span>
                <p className="text-sm font-bold text-gray-800">
                  {tournament.termina_em
                    ? new Date(tournament.termina_em).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase font-black text-gray-400 block mb-2">
                  Status
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                    tournament.status === 'ativo'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tournament.status}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase font-black text-gray-400 block mb-2">
                  Visibilidade
                </span>
                <p className="text-sm font-bold text-gray-800">
                  {tournament.publico ? 'Público' : 'Privado'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
