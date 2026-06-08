/**
 * CreateBlocoForm.jsx
 * Form for creating/editing blocos (question blocks)
 * Used by Colaborador to create blocks in their area of expertise
 */

import { useState, useEffect } from 'react';
import { Save, X, AlertCircle, Loader } from 'lucide-react';

export default function CreateBlocoForm({ onSave, onCancel, initialData, isLoading = false }) {
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    ordem: initialData?.ordem || 0,
    ativo: initialData?.ativo !== false
  });

  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Validate form data
  const validateForm = () => {
    const newErrors = [];

    if (!formData.titulo.trim()) {
      newErrors.push('Título é obrigatório');
    } else if (formData.titulo.trim().length > 255) {
      newErrors.push('Título não pode ter mais de 255 caracteres');
    }

    if (formData.descricao && formData.descricao.trim().length > 1000) {
      newErrors.push('Descrição não pode ter mais de 1000 caracteres');
    }

    if (typeof formData.ordem !== 'number' || formData.ordem < 0) {
      newErrors.push('Ordem deve ser um número não-negativo');
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts editing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSave = async () => {
    // Validate
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      setErrors(['Erro ao salvar. Tente novamente.']);
      console.error('Error saving bloco:', error);
    } finally {
      setSaving(false);
    }
  };

  const isLoading2 = isLoading || saving;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {initialData ? 'Editar Bloco' : 'Criar Novo Bloco'}
        </h2>
        <button
          onClick={onCancel}
          disabled={isLoading2}
          className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          title="Cancelar"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 mb-2">Erros no formulário:</p>
              <ul className="space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-5 mb-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Título do Bloco *
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            disabled={isLoading2}
            placeholder="Ex: Operações com Matrizes"
            maxLength={255}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.titulo.length}/255 caracteres
          </p>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            disabled={isLoading2}
            placeholder="Descreva o conteúdo do bloco e o que o usuário aprenderá..."
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.descricao.length}/1000 caracteres
          </p>
        </div>

        {/* Ordem */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ordem (Opcional)
            </label>
            <input
              type="number"
              name="ordem"
              value={formData.ordem}
              onChange={handleInputChange}
              disabled={isLoading2}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Posição na lista</p>
          </div>

          {/* Ativo */}
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleInputChange}
                disabled={isLoading2}
                className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-sm font-semibold text-slate-700">Ativo</span>
            </label>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Dica:</strong> O bloco será criado como <strong>"Rascunho"</strong> e poderá ser editado até ser publicado. 
          Adicione questões após criar o bloco.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={isLoading2}
          className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading2}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading2 && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading2 ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Bloco'}
        </button>
      </div>
    </div>
  );
}
