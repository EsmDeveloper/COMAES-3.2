/**
 * TournamentForm.jsx
 * Formulário de criação/edição de torneios - Versão com UI melhorada
 * Responsabilidade única: Renderizar e gerenciar estado do formulário
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Trophy,
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Link,
  Eye,
  Globe,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { TournamentValidation } from '../utils/TournamentValidation';

export default function TournamentForm({
  mode = 'create',
  initialData = null,
  onSubmit = () => {},
  onCancel = () => {},
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    inicia_em: '',
    termina_em: '',
    status: 'rascunho',
    publico: true,
    slug: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // No modo edição só existem 3 status válidos; se vier rascunho/agendado, promover para ativo
      const editStatus = ['ativo', 'finalizado', 'cancelado'].includes(initialData.status)
        ? initialData.status
        : 'ativo';
      setFormData({
        titulo: initialData.titulo || '',
        descricao: initialData.descricao || '',
        inicia_em: TournamentValidation.formatDateForInput(initialData.inicia_em),
        termina_em: TournamentValidation.formatDateForInput(initialData.termina_em),
        status: editStatus,
        publico: initialData.publico !== false,
        slug: initialData.slug || '',
      });
    }
    setErrors({});
  }, [mode, initialData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'titulo' && mode === 'create') {
        updated.slug = TournamentValidation.generateSlug(value);
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = TournamentValidation.validate(formData);

    if (TournamentValidation.hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim(),
      inicia_em: formData.inicia_em,
      termina_em: formData.termina_em,
      status: formData.status,
      publico: formData.publico,
      slug: formData.slug || TournamentValidation.generateSlug(formData.titulo),
    };

    onSubmit(payload);
  };

  // Helper para renderizar campo com ícone
  const renderInputField = ({
    label,
    name,
    type = 'text',
    placeholder,
    icon: Icon,
    required = true,
    rows,
  }) => (
    <div className="space-y-1.5 animate-fade-in">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            value={formData[name]}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            placeholder={placeholder}
            rows={rows || 3}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl outline-none transition-all duration-200 resize-none
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:bg-gray-50
              ${errors[name] ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500/20' : 'border-gray-200 hover:border-gray-300'}`}
          />
        ) : (
          <input
            type={type}
            value={formData[name]}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl outline-none transition-all duration-200
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:bg-gray-50
              ${errors[name] ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500/20' : 'border-gray-200 hover:border-gray-300'}`}
          />
        )}
      </div>
      {errors[name] && (
        <div className="flex items-center gap-1.5 text-rose-600 text-xs animate-slide-down">
          <AlertCircle size={14} />
          <span>{errors[name]}</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        /* Scrollbar personalizada */
        .tournament-form-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .tournament-form-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .tournament-form-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .tournament-form-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        /* Animações customizadas */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out forwards;
        }
        /* Estilização do select */
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 1rem center;
          background-repeat: no-repeat;
          background-size: 1.25rem;
        }
        /* Checkbox estilizado */
        input[type="checkbox"] {
          appearance: none;
          width: 1.2rem;
          height: 1.2rem;
          border: 2px solid #cbd5e1;
          border-radius: 0.375rem;
          background-color: white;
          transition: all 0.15s ease;
          position: relative;
          cursor: pointer;
        }
        input[type="checkbox"]:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        input[type="checkbox"]:checked::after {
          content: "✓";
          position: absolute;
          color: white;
          font-size: 0.8rem;
          font-weight: bold;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        input[type="checkbox"]:focus {
          ring: 2px solid #3b82f6;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-0">
        {/* Header com gradiente */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 flex-shrink-0">
          <h3 className="font-bold text-gray-800 flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 rounded-xl">
              <Trophy size={20} className="text-blue-600" />
            </div>
            <span className="text-lg">
              {mode === 'create' ? 'Criar Novo Torneio' : 'Editar Torneio'}
            </span>
            {mode === 'edit' && (
              <span className="ml-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Edição
              </span>
            )}
          </h3>
        </div>

        {/* Body com scroll aprimorado */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0 tournament-form-scroll">
          {/* Título */}
          {renderInputField({
            label: 'Título do Torneio',
            name: 'titulo',
            placeholder: 'Ex: Torneio de Matemática 2026',
            icon: Trophy,
            required: true,
          })}

          {/* Slug (apenas criação) */}
          {mode === 'create' && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                URL Amigável (Slug)
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Link size={18} />
                </div>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleFieldChange('slug', e.target.value)}
                  placeholder="torneio-de-matematica-2026"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                />
              </div>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
                Gerado automaticamente, mas pode ser editado
              </p>
            </div>
          )}

          {/* Descrição */}
          {renderInputField({
            label: 'Descrição',
            name: 'descricao',
            type: 'textarea',
            placeholder: 'Descreva os detalhes, regras e premiações do torneio...',
            icon: FileText,
            rows: 3,
            required: true,
          })}

          {/* Datas lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderInputField({
              label: 'Data de Início',
              name: 'inicia_em',
              type: 'datetime-local',
              icon: Calendar,
              required: true,
            })}
            {renderInputField({
              label: 'Data de Término',
              name: 'termina_em',
              type: 'datetime-local',
              icon: Clock,
              required: true,
            })}
          </div>

          {/* Status com cores personalizadas */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Status <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                <Eye size={18} />
              </div>
              <select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                disabled={isLoading}
                className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl outline-none transition-all duration-200 cursor-pointer
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60
                  ${errors.status ? 'border-rose-300' : 'border-gray-200'}
                  ${formData.status === 'ativo' ? 'text-emerald-700 font-medium' : ''}
                  ${formData.status === 'finalizado' ? 'text-gray-500' : ''}
                  ${formData.status === 'cancelado' ? 'text-rose-600' : ''}`}
              >
                {mode === 'create' ? (
                  <>
                    <option value="rascunho">📝 Rascunho</option>
                    <option value="agendado">📅 Agendado</option>
                    <option value="ativo">🔥 Ativo</option>
                  </>
                ) : (
                  <>
                    <option value="ativo">🔥 Ativo</option>
                    <option value="finalizado">🏁 Finalizado</option>
                    <option value="cancelado">❌ Cancelado</option>
                  </>
                )}
              </select>
            </div>
            {errors.status && (
              <div className="flex items-center gap-1.5 text-rose-600 text-xs animate-slide-down">
                <AlertCircle size={14} />
                {errors.status}
              </div>
            )}
          </div>

          {/* Checkbox público estilizado */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50/40 to-indigo-50/30 rounded-xl border border-blue-100 cursor-pointer transition-all hover:shadow-sm">
              <input
                type="checkbox"
                checked={formData.publico}
                onChange={(e) => handleFieldChange('publico', e.target.checked)}
                disabled={isLoading}
                className="mt-0.5 focus:ring-2 focus:ring-blue-500/30"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">
                    Torneio Público
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visível para todos os usuários da plataforma. Torneios privados exigem convite.
                </p>
              </div>
              {formData.publico && (
                <CheckCircle2 size={18} className="text-blue-500" />
              )}
            </label>
          </div>
        </div>

        {/* Footer com botões e spinner */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end flex-shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 shadow-md shadow-blue-200 flex items-center justify-center gap-2 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processando...</span>
              </>
            ) : mode === 'create' ? (
              'Criar Torneio'
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </>
  );
}

TournamentForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  initialData: PropTypes.shape({
    titulo: PropTypes.string,
    descricao: PropTypes.string,
    inicia_em: PropTypes.string,
    termina_em: PropTypes.string,
    status: PropTypes.string,
    publico: PropTypes.bool,
    slug: PropTypes.string,
  }),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool,
};
