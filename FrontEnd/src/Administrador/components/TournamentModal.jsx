/**
 * TournamentModal.jsx
 * Modais de torneio com indicadores visuais de status
 */

import { AlertTriangle, Loader2, Trophy, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import ComaesModal, { ModalBtnCancel, ModalBtnDanger } from '../../components/ComaesModal';

// Mapeamento de status para configuração visual
const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho', emoji: '📝', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ativo: { label: 'Ativo', emoji: '🔥', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  finalizado: { label: 'Finalizado', emoji: '🏁', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  cancelado: { label: 'Cancelado', emoji: '❌', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
};

// ============================================
// ModalOverlay (wrapper genérico)
// ============================================
export function ModalOverlay({ isOpen, onClose, children, maxWidth = '600px' }) {
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

// ============================================
// DeleteConfirmationModal
// ============================================
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

// ============================================
// ViewDetailsModal
// ============================================
export function ViewDetailsModal({ isOpen, onClose, tournament }) {
  // Formatar data para exibição
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não definida';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  };

  // Obter configuração do status
  const statusConfig = STATUS_CONFIG[tournament?.status] || STATUS_CONFIG.rascunho;

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
          {/* Título e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Título</span>
              <p className="font-bold text-slate-800">{tournament.titulo}</p>
            </div>
            <div className={`p-4 rounded-xl border ${statusConfig.bg} ${statusConfig.border}`}>
              <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${statusConfig.color}`}>Status</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">{statusConfig.emoji}</span>
                <span className={`font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Descrição</span>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {tournament.descricao || 'Sem descrição disponível.'}
            </p>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data de Início</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {formatDate(tournament.inicia_em)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-rose-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data de Término</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {formatDate(tournament.termina_em)}
              </p>
            </div>
          </div>

          {/* Visibilidade e Criação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Visibilidade</span>
              <div className="flex items-center gap-2">
                {tournament.público ? (
                  <>
                    <CheckCircle size={16} className="text-emerald-500" />
                    <p className="text-sm font-bold text-slate-800">Público</p>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-amber-500" />
                    <p className="text-sm font-bold text-slate-800">Privado</p>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Criado em</span>
              <p className="text-sm font-bold text-slate-800">
                {formatDate(tournament.criado_em)}
              </p>
            </div>
          </div>

          {/* Slug */}
          {tournament.slug && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">URL Amigável</span>
              <code className="text-sm text-blue-600 font-mono bg-white px-2 py-1 rounded border border-gray-200">
                /torneio/{tournament.slug}
              </code>
            </div>
          )}
        </div>
      )}
    </ComaesModal>
  );
}