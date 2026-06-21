import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Plus, Trash2, AlertCircle, CheckCircle,
  Palette, Type, FileText, Users
} from 'lucide-react';

/**
 * DisciplinasAdmin Component
 * Task 13.1: Create DisciplinasAdmin page
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.1, 10.2, 10.3
 * 
 * Features:
 * - List all disciplines with collaborator count
 * - Create new discipline form (nome, descricao, cor)
 * - Form validation (nome is required and unique)
 * - Auto-generate slug from nome
 * - Show active status
 * - Delete functionality
 * - Modern Tailwind CSS styling matching AdminStats pattern
 */
const DisciplinasAdmin = () => {
  const { token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

  // State
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3B82F6' // Default blue
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch disciplinas
  const fetchDisciplinas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/disciplinas?includeCount=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        // Sort by nome (requirement 10.2)
        const sorted = result.data.sort((a, b) => a.nome.localeCompare(b.nome));
        setDisciplinas(sorted);
      } else {
        throw new Error(result.message || 'Erro ao carregar disciplinas');
      }
    } catch (err) {
      console.error('[DisciplinasAdmin] Error fetching:', err);
      setError(err.message || 'Erro ao carregar disciplinas');
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  // Load data on mount
  useEffect(() => {
    fetchDisciplinas();
  }, [fetchDisciplinas]);

  // Clear success/error messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Requirement 9.1: Require nome
    if (!formData.nome || !formData.nome.trim()) {
      errors.nome = 'Nome da disciplina é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Check if nome already exists (requirement 9.3)
    if (formData.nome && formData.nome.trim()) {
      const exists = disciplinas.some(
        d => d.nome.toLowerCase() === formData.nome.toLowerCase()
      );
      if (exists) {
        errors.nome = 'Já existe uma disciplina com este nome';
      }
    }

    // Requirement 9.4: Validar cor (optional but if provided, must be valid hex)
    if (formData.cor && formData.cor.trim()) {
      const hexRegex = /^#[0-9A-F]{6}$/i;
      if (!hexRegex.test(formData.cor)) {
        errors.cor = 'Cor deve estar em formato hexadecimal válido (ex: #3B82F6)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null, // Requirement 9.4: optional
        cor: formData.cor.trim() || null // Requirement 9.4: optional
      };

      const response = await fetch(`${API_BASE}/api/disciplinas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || `Erro ${response.status}`);
      }

      const result = await response.json();

      // Clear form
      setFormData({
        nome: '',
        descricao: '',
        cor: '#3B82F6'
      });
      setFormErrors({});

      // Show success
      setSuccess('Disciplina criada com sucesso!');

      // Refresh list
      await fetchDisciplinas();
    } catch (err) {
      console.error('[DisciplinasAdmin] Error creating:', err);
      setError(err.message || 'Erro ao criar disciplina');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (disciplina) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${disciplina.nome}"?`)) {
      return;
    }

    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/disciplinas/${disciplina.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || `Erro ${response.status}`);
      }

      setSuccess('Disciplina deletada com sucesso!');
      await fetchDisciplinas();
    } catch (err) {
      console.error('[DisciplinasAdmin] Error deleting:', err);
      setError(err.message || 'Erro ao deletar disciplina');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 transform transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Gerenciamento de Disciplinas
            </h2>
            <p className="text-slate-600">
              Crie, visualize e gerencie disciplinas do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-sm animate-fade-in flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold">Sucesso!</p>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm animate-fade-in flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold">Erro</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-6 transform transition-all duration-300 hover:shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-blue-600" />
          Criar Nova Disciplina
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-600" />
              Nome da Disciplina *
            </label>
            <input
              type="text"
              placeholder="Ex: Matemática, Português, Biologia"
              value={formData.nome}
              onChange={(e) => {
                setFormData({ ...formData, nome: e.target.value });
                if (formErrors.nome) {
                  setFormErrors({ ...formErrors, nome: '' });
                }
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md ${
                formErrors.nome ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            />
            {formErrors.nome && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formErrors.nome}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Descrição (opcional)
            </label>
            <textarea
              placeholder="Descrição detalhada da disciplina..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md resize-none"
            />
          </div>

          {/* Color Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              Cor (opcional)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={formData.cor}
                onChange={(e) => {
                  setFormData({ ...formData, cor: e.target.value });
                  if (formErrors.cor) {
                    setFormErrors({ ...formErrors, cor: '' });
                  }
                }}
                className="h-12 w-20 border-2 border-slate-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all"
              />
              <input
                type="text"
                placeholder="#3B82F6"
                value={formData.cor}
                onChange={(e) => {
                  setFormData({ ...formData, cor: e.target.value });
                  if (formErrors.cor) {
                    setFormErrors({ ...formErrors, cor: '' });
                  }
                }}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md font-mono text-sm ${
                  formErrors.cor ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              />
            </div>
            {formErrors.cor && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formErrors.cor}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              {submitting ? 'Criando...' : 'Criar Disciplina'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ nome: '', descricao: '', cor: '#3B82F6' });
                setFormErrors({});
              }}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>

      {/* Disciplinas List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Disciplinas ({disciplinas.length})
          </h3>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-600 font-medium">Carregando disciplinas...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && disciplinas.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma disciplina criada ainda</p>
            <p className="text-slate-400 text-sm mt-1">Crie uma nova disciplina usando o formulário acima</p>
          </div>
        )}

        {/* Disciplinas Grid/List */}
        {!loading && disciplinas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 whitespace-nowrap">Nome</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 whitespace-nowrap">Slug</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 whitespace-nowrap">Descrição</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-700 whitespace-nowrap">
                    <Users className="w-4 h-4 inline mr-1" />
                    Colaboradores
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-700 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-700 whitespace-nowrap">Cor</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-700 whitespace-nowrap">AçÃães</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {disciplinas.map((disciplina, index) => (
                  <tr key={disciplina.id} className="hover:bg-slate-50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="px-6 py-4 text-sm text-slate-800 font-semibold">{disciplina.nome}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{disciplina.slug}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="max-w-xs truncate" title={disciplina.descricao || 'N/A'}>
                        {disciplina.descricao ? (
                          <span>{disciplina.descricao}</span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 text-center font-semibold">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                        <Users className="w-3 h-3" />
                        {disciplina.colaboradores_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full font-semibold text-xs ${
                        disciplina.ativo
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {disciplina.ativo ? 'âœ“ Ativa' : 'â—‹ Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-slate-200 shadow-sm"
                          style={{ backgroundColor: disciplina.cor || '#E5E7EB' }}
                          title={disciplina.cor || 'Sem cor'}
                        />
                        <span className="font-mono text-xs text-slate-600">{disciplina.cor || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(disciplina)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Deletar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisciplinasAdmin;

