/**
 * RejectModal.jsx
 * Modal component for rejecting questions (admin feature)
 * 
 * Task 12.2: Create RejectModal component
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 * 
 * Features:
 * - Question preview display
 * - Textarea for rejection reason (motivo_rejeicao)
 * - Validation: motivo_rejeicao is required
 * - Confirm/Cancel buttons with proper states
 * - Red theme for rejection
 * - Smooth animations
 * - Professional typography matching AdminStats design
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, XCircle, Loader } from 'lucide-react';

/**
 * RejectModal Component
 * 
 * Props:
 * - isOpen (boolean): Controls modal visibility
 * - questaoTitle (string): Title of question being rejected
 * - questaoDescription (string): Optional description/preview of question
 * - questaoId (number): ID of the question
 * - onClose (function): Callback when modal closes
 * - onConfirm (function): Callback with rejection reason - receives motivo parameter
 * - loading (boolean): Optional loading state while submitting
 */
export default function RejectModal({
  isOpen,
  questaoTitle,
  questaoDescription,
  questaoId,
  onClose,
  onConfirm,
  loading = false
}) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation: motivo is required
    if (!motivo.trim()) {
      setError('O motivo da rejeição é obrigatório');
      return;
    }

    if (motivo.trim().length < 5) {
      setError('O motivo deve ter no mínimo 5 caracteres');
      return;
    }

    // Call parent handler with motivo
    onConfirm(motivo.trim());
  };

  const handleTextareaChange = (e) => {
    setMotivo(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleClose = () => {
    if (!loading) {
      setMotivo('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all duration-300 animate-in fade-in-50 zoom-in-95">
        
        {/* Header with red gradient */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <XCircle className="w-6 h-6 text-red-100 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">Rejeitar Questão</h2>
              <p className="text-red-100 text-sm mt-0.5">Forneça um motivo para a rejeição</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-red-100 hover:text-white transition disabled:opacity-50 ml-2 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Question preview */}
          {questaoTitle && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Questão</p>
              <h3 className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2">
                {questaoTitle}
              </h3>
              {questaoDescription && (
                <p className="text-sm text-slate-600 line-clamp-2">
                  {questaoDescription}
                </p>
              )}
            </div>
          )}

          {/* Motivo field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              Motivo da Rejeição
              <span className="text-red-600">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={handleTextareaChange}
              placeholder="Explique o motivo pelo qual esta questão está sendo rejeitada. Seja claro e construtivo para ajudar o colaborador a melhorar..."
              maxLength={500}
              rows={5}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none text-sm leading-relaxed focus:outline-none ${
                error
                  ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-red-50'
                  : 'border-slate-200 focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-white hover:border-slate-300'
              } ${loading ? 'opacity-60' : ''}`}
            />
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs font-medium ${
                motivo.length > 450 ? 'text-orange-600' : 'text-slate-500'
              }`}>
                {motivo.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Info message */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              O colaborador receberá notificação sobre a rejeição com o motivo fornecido.
            </p>
          </div>
        </form>

        {/* Footer with buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !motivo.trim()}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || !motivo.trim()
                ? 'bg-red-400 cursor-not-allowed opacity-50'
                : 'bg-red-600 hover:bg-red-700 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Rejeitando...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>Rejeitar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
