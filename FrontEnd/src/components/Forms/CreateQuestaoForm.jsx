/**
 * CreateQuestaoForm.jsx
 * Form for creating/editing questions
 * Supports: múltipla_escolha, texto, codigo
 */

import { useState, useEffect } from 'react';
import { Save, X, AlertCircle, Loader, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function CreateQuestaoForm({ 
  onSave, 
  onCancel, 
  initialData, 
  isLoading = false,
  blocos = [] // List of available blocos for dropdown
}) {
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    tipo: initialData?.tipo || 'multipla_escolha',
    dificuldade: initialData?.dificuldade || 'medio',
    pontos: initialData?.pontos || 10,
    bloco_id: initialData?.bloco_id || null,
    opcoes: initialData?.opcoes || [
      { texto: '', correta: true, explicacao: '' },
      { texto: '', correta: false, explicacao: '' }
    ],
    resposta_esperada: initialData?.resposta_esperada || '',
    explicacao: initialData?.explicacao || ''
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

    if (!formData.descricao.trim()) {
      newErrors.push('Descrição é obrigatória');
    }

    if (!formData.tipo) {
      newErrors.push('Tipo de questão é obrigatório');
    }

    if (!formData.dificuldade) {
      newErrors.push('Dificuldade é obrigatória');
    }

    if (typeof formData.pontos !== 'number' || formData.pontos < 1 || formData.pontos > 100) {
      newErrors.push('Pontos deve ser um número entre 1 e 100');
    }

    // Validar opções para múltipla escolha
    if (formData.tipo === 'multipla_escolha') {
      if (!Array.isArray(formData.opcoes) || formData.opcoes.length === 0) {
        newErrors.push('Adicione pelo menos uma opção');
      } else if (formData.opcoes.length < 2) {
        newErrors.push('Questão de múltipla escolha deve ter no mínimo 2 opções');
      } else if (formData.opcoes.length > 10) {
        newErrors.push('Questão pode ter no máximo 10 opções');
      } else {
        // Check all options have text
        if (formData.opcoes.some(o => !o.texto.trim())) {
          newErrors.push('Todas as opções devem ter um texto');
        }
        // Check at least one option is correct
        if (!formData.opcoes.some(o => o.correta === true)) {
          newErrors.push('Deve haver pelo menos uma opção marcada como correta');
        }
      }
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'pontos' ? parseInt(value) || 0 : value
    }));
    if (errors.length > 0) setErrors([]);
  };

  const handleOpcaoChange = (index, field, value) => {
    const newOpcoes = [...formData.opcoes];
    newOpcoes[index][field] = value;
    setFormData(prev => ({ ...prev, opcoes: newOpcoes }));
    if (errors.length > 0) setErrors([]);
  };

  const handleAddOpcao = () => {
    if (formData.opcoes.length < 10) {
      setFormData(prev => ({
        ...prev,
        opcoes: [...prev.opcoes, { texto: '', correta: false, explicacao: '' }]
      }));
    }
  };

  const handleRemoveOpcao = (index) => {
    if (formData.opcoes.length > 2) {
      setFormData(prev => ({
        ...prev,
        opcoes: prev.opcoes.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSave = async () => {
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
      console.error('Error saving questão:', error);
    } finally {
      setSaving(false);
    }
  };

  const isLoading2 = isLoading || saving;
  const isMutiplaEscolha = formData.tipo === 'multipla_escolha';
  const temOpcaoCorreta = formData.opcoes.some(o => o.correta);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {initialData ? 'Editar Questão' : 'Criar Nova Questão'}
        </h2>
        <button
          onClick={onCancel}
          disabled={isLoading2}
          className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
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
      <div className="space-y-6 mb-6">
        
        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Título da Questão *
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            disabled={isLoading2}
            placeholder="Ex: O que é uma matriz?"
            maxLength={255}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.titulo.length}/255</p>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Descrição/Enunciado *
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            disabled={isLoading2}
            placeholder="Descreva a questão em detalhes..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none disabled:bg-gray-100"
          />
        </div>

        {/* Tipo, Dificuldade, Pontos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de Questão *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              disabled={isLoading2}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 outline-none transition disabled:bg-gray-100"
            >
              <option value="multipla_escolha">Múltipla Escolha</option>
              <option value="texto">Texto/Aberta</option>
              <option value="codigo">Código</option>
            </select>
          </div>

          {/* Dificuldade */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Dificuldade *
            </label>
            <select
              name="dificuldade"
              value={formData.dificuldade}
              onChange={handleInputChange}
              disabled={isLoading2}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 outline-none transition disabled:bg-gray-100"
            >
              <option value="facil">⭐ Fácil</option>
              <option value="medio">⭐⭐ Médio</option>
              <option value="dificil">⭐⭐⭐ Difícil</option>
            </select>
          </div>

          {/* Pontos */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Pontos *
            </label>
            <input
              type="number"
              name="pontos"
              value={formData.pontos}
              onChange={handleInputChange}
              disabled={isLoading2}
              min="1"
              max="100"
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 outline-none transition disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">1-100 pontos</p>
          </div>
        </div>

        {/* Bloco (Opcional) */}
        {blocos.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Bloco (Opcional)
            </label>
            <select
              name="bloco_id"
              value={formData.bloco_id || ''}
              onChange={handleInputChange}
              disabled={isLoading2}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 outline-none transition disabled:bg-gray-100"
            >
              <option value="">Nenhum bloco associado</option>
              {blocos.map(bloco => (
                <option key={bloco.id} value={bloco.id}>
                  {bloco.titulo}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Múltipla Escolha - Opções */}
        {isMutiplaEscolha && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-slate-700">
                Opções *
              </label>
              <span className="text-xs text-gray-600">
                {formData.opcoes.length}/10 opções
                {temOpcaoCorreta && <span className="text-green-600 ml-2">✓ Tem resposta correta</span>}
              </span>
            </div>

            <div className="space-y-3">
              {formData.opcoes.map((opcao, idx) => (
                <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition">
                  <div className="flex gap-3 mb-3">
                    {/* Checkbox Correta */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opcao.correta}
                        onChange={(e) => {
                          // Se marcando como correta, desmarcar todas as outras
                          if (e.target.checked) {
                            const newOpcoes = formData.opcoes.map((o, i) => ({
                              ...o,
                              correta: i === idx
                            }));
                            setFormData(prev => ({ ...prev, opcoes: newOpcoes }));
                          }
                        }}
                        disabled={isLoading2}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-400 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-slate-700">Correta</span>
                    </label>

                    {/* Remove Button */}
                    {formData.opcoes.length > 2 && (
                      <button
                        onClick={() => handleRemoveOpcao(idx)}
                        disabled={isLoading2}
                        className="ml-auto text-red-600 hover:text-red-700 disabled:opacity-50 transition"
                        title="Remover opção"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Texto da Opção */}
                  <input
                    type="text"
                    value={opcao.texto}
                    onChange={(e) => handleOpcaoChange(idx, 'texto', e.target.value)}
                    disabled={isLoading2}
                    placeholder={`Opção ${idx + 1}`}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-400 outline-none transition mb-2 disabled:bg-gray-100 text-sm"
                  />

                  {/* Explicação da Opção */}
                  <textarea
                    value={opcao.explicacao}
                    onChange={(e) => handleOpcaoChange(idx, 'explicacao', e.target.value)}
                    disabled={isLoading2}
                    placeholder="Explicação dessa opção (opcional)"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition resize-none disabled:bg-gray-100 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Add Opção Button */}
            {formData.opcoes.length < 10 && (
              <button
                onClick={handleAddOpcao}
                disabled={isLoading2}
                className="mt-3 w-full py-2.5 border-2 border-dashed border-blue-400 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Opção
              </button>
            )}
          </div>
        )}

        {/* Texto/Código - Resposta Esperada */}
        {(formData.tipo === 'texto' || formData.tipo === 'codigo') && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Resposta Esperada (Opcional)
              </label>
              <textarea
                value={formData.resposta_esperada}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, resposta_esperada: e.target.value }));
                  if (errors.length > 0) setErrors([]);
                }}
                disabled={isLoading2}
                placeholder="Modelo de resposta que será mostrado depois..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 outline-none transition resize-none disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Use para questões abertas e de código</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Explicação (Opcional)
              </label>
              <textarea
                value={formData.explicacao}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, explicacao: e.target.value }));
                  if (errors.length > 0) setErrors([]);
                }}
                disabled={isLoading2}
                placeholder="Explicação da resposta correta..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-400 outline-none transition resize-none disabled:bg-gray-100"
              />
            </div>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Dica:</strong> A questão será criada como <strong>"Pendente"</strong> e aguardará aprovação do administrador 
          antes de ser usada nos testes e torneios.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={isLoading2}
          className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading2}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading2 && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading2 ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Questão'}
        </button>
      </div>
    </div>
  );
}
