/**
 * LogoutModal.jsx
 * Modal de confirmação de logout — componente partilhado por toda a plataforma
 */
import { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';

export default function LogoutModal({ isOpen, onConfirm, onCancel }) {
  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  // Bloquear scroll do body quando aberto
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease' }}
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
        style={{ animation: 'slideUp 0.25s ease' }}
      >
        {/* Botão X */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* Ícone */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <LogOut size={26} className="text-red-500" />
          </div>
        </div>

        {/* Título */}
        <h2
          id="logout-modal-title"
          className="text-xl font-bold text-gray-900 text-center mb-2"
        >
          Terminar Sessão
        </h2>

        {/* Mensagem */}
        <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
          Tem certeza que deseja terminar a sua sessão?
        </p>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all shadow-md shadow-red-200 flex items-center justify-center gap-2"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
