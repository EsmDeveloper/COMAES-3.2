/**
 * QuestaoCardsComponents.jsx
 * Componentes reutilizáveis para questões e blocos
 * Evita duplicação de código entre QuestoesPendentesTab, QuestoesColaboradoresTab, etc
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader, Check } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Badge de Status de Aprovação
 * status: 'pendente' | 'aprovada' | 'rejeitada'
 */
export function StatusAprovaçãoBadge({ status }) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aprovada: 'bg-green-100 text-green-800',
    rejeitada: 'bg-red-100 text-red-800',
  };
  const labels = {
    pendente: '⏳ Pendente',
    aprovada: '✅ Aprovada',
    rejeitada: '❌ Rejeitada',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pendente}`}>
      {labels[status] || status}
    </span>
  );
}

/**
 * Badge de Dificuldade
 * dificuldade: 'facil' | 'medio' | 'dificil'
 */
export function DificuldadeBadge({ dificuldade }) {
  const styles = {
    facil: 'bg-green-100 text-green-700',
    medio: 'bg-yellow-100 text-yellow-700',
    dificil: 'bg-red-100 text-red-700',
  };
  const labels = {
    facil: '🟢 Fácil',
    medio: '🟡 Médio',
    dificil: '🔴 Difícil',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[dificuldade] || styles.medio}`}>
      {labels[dificuldade] || dificuldade}
    </span>
  );
}

/**
 * Badge de Status de Bloco
 * status: 'rascunho' | 'publicado'
 */
export function StatusBlocoBadge({ status }) {
  const styles = {
    rascunho: 'bg-blue-100 text-blue-800',
    publicado: 'bg-green-100 text-green-800',
  };
  const labels = {
    rascunho: '📝 Rascunho',
    publicado: '✅ Publicado',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.rascunho}`}>
      {labels[status] || status}
    </span>
  );
}

/**
 * Badge de Disciplina
 * disciplina: string (ex: 'matematica', 'ingles', 'programacao')
 */
export function DisciplinaBadge({ disciplina }) {
  const styles = {
    matematica: 'bg-blue-100 text-blue-800',
    ingles: 'bg-purple-100 text-purple-800',
    programacao: 'bg-indigo-100 text-indigo-800',
  };
  const labels = {
    matematica: '📐 Matemática',
    ingles: '🌍 Inglês',
    programacao: '💻 Programação',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[disciplina] || 'bg-slate-100 text-slate-800'}`}>
      {labels[disciplina] || disciplina}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Modal genérico de confirmação com motivo
 * Usado para rejeição de questões/blocos
 */
export function ConfirmarComMotivoModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo = 'Confirmar Ação',
  subtitulo = 'Por favor, forneça um motivo:',
  itemNome = '',
  loading = false,
  buttonText = 'Confirmar',
  buttonVariant = 'red' // 'red', 'orange', 'blue'
}) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo.trim()) {
      setError('O motivo é obrigatório');
      return;
    }
    try {
      await onConfirm(motivo);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao processar');
    }
  };

  if (!isOpen) return null;

  const buttonColors = {
    red: 'bg-red-600 hover:bg-red-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{titulo}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">{subtitulo}</p>
            {itemNome && (
              <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-lg line-clamp-2 border-l-4 border-blue-500">
                {itemNome}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Motivo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError('');
              }}
              placeholder="Explique o motivo..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-slate-500 mt-1.5">{motivo.length}/500 caracteres</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${buttonColors[buttonVariant]}`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                buttonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal de detalhes de questão
 */
export function QuestaoDetailModal({ questao, isOpen, onClose, extrairOpcoes = null }) {
  if (!isOpen || !questao) return null;

  // Se não passar função de extrair, usar padrão
  const opcoes = extrairOpcoes ? extrairOpcoes(questao) : (questao.opcoes || []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Detalhes da Questão</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {questao.disciplina && <DisciplinaBadge disciplina={questao.disciplina} />}
            {questao.dificuldade && <DificuldadeBadge dificuldade={questao.dificuldade} />}
            {questao.status_aprovacao && <StatusAprovaçãoBadge status={questao.status_aprovacao} />}
            {questao.pontos && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{questao.pontos} pts</span>}
          </div>

          {/* Título */}
          {questao.titulo && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">Título</h3>
              <p className="text-slate-800 font-medium">{questao.titulo}</p>
            </div>
          )}

          {/* Descrição */}
          {questao.descricao && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">Descrição/Enunciado</h3>
              <p className="text-slate-700">{questao.descricao}</p>
            </div>
          )}

          {/* Alternativas */}
          {opcoes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-2">Alternativas</h3>
              <div className="space-y-2">
                {opcoes.map((opcao, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      opcao === questao.resposta_correta
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <span className="font-medium text-slate-500 mr-2">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opcao}
                    {opcao === questao.resposta_correta && (
                      <span className="ml-2 text-green-600 text-xs font-semibold">✓ Correta</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explicação */}
          {questao.explicacao && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">Explicação</h3>
              <p className="text-slate-700 bg-blue-50 p-3 rounded-lg">{questao.explicacao}</p>
            </div>
          )}

          {/* Motivo rejeição (se houver) */}
          {questao.motivo_rejeicao && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">Motivo da Rejeição</h3>
              <p className="text-red-700 bg-red-50 p-3 rounded-lg">{questao.motivo_rejeicao}</p>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-sm">
            {questao.created_at && (
              <div>
                <p className="text-xs text-slate-500">Criado em</p>
                <p className="font-medium text-slate-800">
                  {new Date(questao.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            {questao.autor_id && (
              <div>
                <p className="text-xs text-slate-500">Autor ID</p>
                <p className="font-medium text-slate-800">{questao.autor_id}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal de confirmação simples
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  titulo = 'Confirmar',
  mensagem = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'blue', // 'blue', 'red', 'orange'
  loading = false,
}) {
  if (!isOpen) return null;

  const buttonColors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{titulo}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {mensagem && <p className="text-slate-700 mb-6">{mensagem}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${buttonColors[variant]}`}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrair opções de questão (suporta múltiplos formatos)
 */
export function extrairOpcoes(questao) {
  if (!questao) return [];

  try {
    if (Array.isArray(questao.opcoes)) {
      return questao.opcoes;
    }
    if (typeof questao.opcoes === 'string') {
      const parsed = JSON.parse(questao.opcoes);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (e) {
    console.warn(`⚠️ Erro ao parsear opções da questão ${questao.id}:`, e);
    return [];
  }
}

/**
 * Toast de sucesso/erro (renderizado em DOM)
 */
export function mostrarToast(mensagem, tipo = 'success', duracao = 5000) {
  const bgColor = tipo === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';
  const icon = tipo === 'success' ? '✓' : '✕';

  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 ${bgColor} border px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50`;
  toast.innerHTML = `
    <span class="font-bold text-lg">${icon}</span>
    <span><strong>${tipo === 'success' ? 'Sucesso!' : 'Erro'}</strong> ${mensagem}</span>
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duracao);
}
