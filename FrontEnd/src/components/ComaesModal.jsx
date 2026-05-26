/**
 * ComaesModal.jsx
 * Componente base universal para todos os modais da plataforma COMAES.
 *
 * Uso:
 *   <ComaesModal isOpen={bool} onClose={fn} title="Título" icon={<Icon />} iconBg="bg-blue-100" iconColor="text-blue-600">
 *     {children}
 *   </ComaesModal>
 *
 * Variantes de botão exportadas:
 *   <ModalBtnPrimary>   — bg-blue-600 text-white
 *   <ModalBtnSecondary> — bg-white text-blue-600 border border-blue-600
 *   <ModalBtnCancel>    — bg-white text-gray-700 border border-gray-200
 *   <ModalBtnDanger>    — bg-red-600 text-white
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';

// ─── Overlay + container ──────────────────────────────────────────

export default function ComaesModal({
  isOpen,
  onClose,
  title,
  icon,
  iconBg = 'bg-blue-100',
  iconColor = 'text-blue-600',
  maxWidth = 'max-w-md',
  children,
  footer,
  hideClose = false,
}) {
  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4`}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: 'comaes-fade 0.2s ease' }}
        onClick={onClose}
      />

      {/* Modal box */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full ${maxWidth} z-10 overflow-hidden`}
        style={{ animation: 'comaes-slide-up 0.25s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <span className={iconColor}>{icon}</span>
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          </div>
          {!hideClose && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1.5 hover:bg-gray-100 flex-shrink-0"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes comaes-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes comaes-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

// ─── Button variants ──────────────────────────────────────────────

export function ModalBtnPrimary({ children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function ModalBtnSecondary({ children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-5 py-2.5 bg-white text-blue-600 border border-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function ModalBtnCancel({ children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function ModalBtnDanger({ children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}
