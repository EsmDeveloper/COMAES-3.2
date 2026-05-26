/**
 * TournamentModal.jsx — padronizado com ComaesModal
 * Responsabilidade: Modais de torneio (criar/editar/excluir/detalhes)
 */

import { AlertTriangle, Loader2, Trophy, Eye } from 'lucide-react';
import ComaesModal, { ModalBtnCancel, ModalBtnDanger } from '../../components/ComaesModal';

// ─── ModalOverlay (wrapper genérico) ─────────────────────────────

export function ModalOverlay({ isOpen, onClose, children, maxWidth = '600px' }) {
  // Converte px string para classe Tailwind aproximada
  const widthClass = maxWidth === '450px' ? 'max-w-md'
    : maxWidth === '650px' ? 'max-w-2xl'
    : 'max-w-xl';

  if (!isOpen) return null;

  return (
    <ComaesModal isOpen={isOpen} onClose={onClose} title="" maxWidth={widthClass} hideClose>
      {children}
    </ComaesModal>
  );
}

// ─── DeleteConfirmationModal ──────────────────────────────────────

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title = '', isLoading = false }) {
  return (
    <ComaesModal
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Torneio?"
      icon={<AlertTriangle size={18} />}
      iconBg="bg-red-100"
      iconColor="text-red-600"
      maxWidth="max-w-md"
      footer={
        <>
          <ModalBtnCancel onClick={onClose} disabled={isLoading}>Cancelar</ModalBtnCancel>
          <ModalBtnDanger onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="animate-spin w-4 h-4" /> Excluindo...</>
            ) : 'Sim, Excluir'}
          </ModalBtnDanger>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={24} />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed pt-2">
          Você está prestes a excluir <strong className="text-slate-800">{title}</strong>.
          <br />
          Esta ação não pode ser desfeita e removerá todos os rankings associados.
        </p>
      </div>
    </ComaesModal>
  );
}

// ─── ViewDetailsModal ─────────────────────────────────────────────

export function ViewDetailsModal({ isOpen, onClose, tournament }) {
  return (
    <ComaesModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Torneio"
      icon={<Eye size={18} />}
      iconBg="bg-blue-100"
      iconColor="text-blue-600"
      maxWidth="max-w-2xl"
    >
      {!tournament ? (
        <p className="text-gray-400 text-sm text-center py-6">Nenhum torneio selecionado.</p>
      ) : (
        <div className="space-y-5 py-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Título</span>
              <p className="font-bold text-slate-800">{tournament.titulo}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block mb-1">Disciplina</span>
              <p className="font-bold text-slate-800">{tournament.disciplina || '—'}</p>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Descrição</span>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {tournament.descricao || 'Sem descrição disponível.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Data de Início</span>
              <p className="text-sm font-bold text-slate-800">
                {tournament.inicia_em
                  ? new Date(tournament.inicia_em).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Data de Término</span>
              <p className="text-sm font-bold text-slate-800">
                {tournament.termina_em
                  ? new Date(tournament.termina_em).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Status</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                tournament.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {tournament.status}
              </span>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Visibilidade</span>
              <p className="text-sm font-bold text-slate-800">{tournament.publico ? 'Público' : 'Privado'}</p>
            </div>
          </div>
        </div>
      )}
    </ComaesModal>
  );
}
