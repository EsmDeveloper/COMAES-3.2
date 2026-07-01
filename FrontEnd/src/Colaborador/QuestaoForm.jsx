import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
  X, Save, AlertCircle, CheckCircle, Plus, Trash2, FileText,
  Lock, Zap, BookOpen, Code as CodeIcon, HelpCircle,
  Check, Sparkles, Layers, ArrowRight, Star
} from 'lucide-react';
import axios from 'axios';

/**
 * QuestaoForm - Formulário para criação/edição de questões para colaboradores
 * 
 * Modern Design (Matches AdminStats.jsx):
 * - Professional Tailwind CSS with rounded-2xl cards
 * - Lucide-react icons for visual hierarchy
 * - Responsive grid layout
 * - Gradient header with shadow
 * - Clear validation messages with color coding
 * - Status badges and auto-calculated fields with lock icons
 * 
 * Key Features:
 * - Disciplina is READ-ONLY (pre-selected from user's disciplina_colaborador)
 * - Points are auto-calculated based on difficulty (fácil=5, médio=10, difícil=20)
 * - After creation, shows "Pendente de aprovação" status message
 * - Validates that disciplina matches collaborator's disciplina_colaborador
 * - Dynamic option fields for multiple choice with smooth animations
 * - Language selection for code questions
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.4
 */
const QuestaoForm = ({ questaoId, onClose, onSuccess }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(!!questaoId);
  const [validationErrors, setValidationErrors] = useState({});

  // Pre-fill collaborator's discipline as READ-ONLY
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    disciplina: user?.disciplina_colaborador || '', // READ-ONLY from context
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    resposta_correta: '',
    pontos: 5, // Auto-calculated based on difficulty
    opcoes: [
      { texto: 'Opção A', correta: true },
      { texto: 'Opção B', correta: false }
    ],
    explicacao: '',
    linguagem: 'javascript'
  });

  // Load question data if in edit mode
  useEffect(() => {
    if (isEditMode && questaoId) {
      loadQuestion();
    }
  }, [questaoId, isEditMode]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
      const res = await axios.get(`${apiBase}/api/questoes/${questaoId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });

      const questao = res.data?.dados || res.data;
      
      // Validate that collaborator owns this question
      if (questao.autor_id !== user?.id) {
        setError('Você não tem permissão para editar esta questão');
        setTimeout(() => onClose?.(), 2000);
        return;
      }

      // Validate that question is not already approved (Requirements 4.3)
      if (questao.status_aprovacao === 'aprovada') {
        setError('Questões aprovadas não podem ser editadas');
        setTimeout(() => onClose?.(), 2000);
        return;
      }

      // Populate form with loaded data
      setFormData({
        titulo: questao.titulo || '',
        descricao: questao.descricao || '',
        disciplina: questao.disciplina || user?.disciplina_colaborador || '',
        tipo: questao.tipo || 'multipla_escolha',
        dificuldade: questao.dificuldade || 'facil',
        resposta_correta: questao.resposta_correta || '',
        pontos: questao.pontos || 5,
        opcoes: questao.opcoes && Array.isArray(questao.opcoes)
          ? questao.opcoes.map(texto => ({
              texto,
              correta: texto === questao.resposta_correta
            }))
          : [
              { texto: 'Opção A', correta: true },
              { texto: 'Opção B', correta: false }
            ],
        explicacao: questao.explicacao || '',
        linguagem: questao.linguagem || 'javascript'
      });
    } catch (err) {
      console.error('Erro ao carregar questão:', err);
      setError('Erro ao carregar questão');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If difficulty changed, auto-calculate points (Requirement 2.5)
    if (name === 'dificuldade') {
      const pontosMap = {
        'facil': 5,
        'medio': 10,
        'dificil': 20
      };
      setFormData(prev => ({
        ...prev,
        [name]: value,
        pontos: pontosMap[value] || 5
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleOpcaoChange = (index, field, value) => {
    const newOpcoes = [...formData.opcoes];
    newOpcoes[index] = { ...newOpcoes[index], [field]: value };

    // If marking as correct, unmark others
    if (field === 'correta' && value === true) {
      newOpcoes.forEach((o, i) => {
        if (i !== index) o.correta = false;
      });
    }

    setFormData(prev => ({ ...prev, opcoes: newOpcoes }));

    // Update resposta_correta with correct option text
    const opcaoCorreta = newOpcoes.find(o => o.correta);
    if (opcaoCorreta && opcaoCorreta.texto) {
      setFormData(prev => ({ ...prev, resposta_correta: opcaoCorreta.texto }));
    }
  };

  const handleAddOpcao = () => {
    if (formData.opcoes.length < 10) {
      setFormData(prev => ({
        ...prev,
        opcoes: [...prev.opcoes, { texto: '', correta: false }]
      }));
    }
  };

  const handleRemoveOpcao = (index) => {
    if (formData.opcoes.length > 2) {
      const novasOpcoes = formData.opcoes.filter((_, i) => i !== index);

      // If removed correct option, mark first as correct
      const tinhaCorretaRemovida = formData.opcoes[index]?.correta;
      if (tinhaCorretaRemovida && novasOpcoes.length > 0 && !novasOpcoes.some(o => o.correta)) {
        novasOpcoes[0].correta = true;
        setFormData(prev => ({
          ...prev,
          opcoes: novasOpcoes,
          resposta_correta: novasOpcoes[0].texto
        }));
      } else {
        setFormData(prev => ({ ...prev, opcoes: novasOpcoes }));
      }
    }
  };

  const validarForm = () => {
    const erros = {};
    let temErro = false;

    // Validate title
    if (!formData.titulo.trim()) {
      erros.titulo = 'Título é obrigatório';
      temErro = true;
    } else if (formData.titulo.length > 255) {
      erros.titulo = 'Título não pode exceder 255 caracteres';
      temErro = true;
    }

    // Validate description
    if (!formData.descricao.trim()) {
      erros.descricao = 'Descrição é obrigatória';
      temErro = true;
    }

    // Requirement 2.2: Validate discipline matches user's disciplina_colaborador
    if (formData.disciplina !== user?.disciplina_colaborador) {
      erros.disciplina = 'Você só pode criar questões para sua disciplina';
      temErro = true;
    }

    // Validate type
    if (!formData.tipo) {
      erros.tipo = 'Tipo é obrigatório';
      temErro = true;
    }

    // Validate difficulty
    if (!formData.dificuldade) {
      erros.dificuldade = 'Dificuldade é obrigatória';
      temErro = true;
    }

    // Validate answer
    if (!formData.resposta_correta || !formData.resposta_correta.trim()) {
      erros.resposta_correta = 'Resposta correta é obrigatória';
      temErro = true;
    }

    // Validate points (should always be valid due to auto-calculation, but check anyway)
    if (typeof formData.pontos !== 'number' || formData.pontos < 1 || formData.pontos > 100) {
      erros.pontos = 'Pontos deve estar entre 1 e 100';
      temErro = true;
    }

    // Requirement 2.3: Multiple choice validation
    if (formData.tipo === 'multipla_escolha') {
      const opcoesComTexto = formData.opcoes.filter(o => o.texto.trim());
      if (opcoesComTexto.length < 2) {
        erros.opcoes = 'Mínimo 2 opções preenchidas para múltipla escolha';
        temErro = true;
      } else if (!formData.opcoes.some(o => o.correta)) {
        erros.opcoes = 'Marque uma opção como correta';
        temErro = true;
      } else if (!opcoesComTexto.map(o => o.texto).includes(formData.resposta_correta)) {
        erros.opcoes = 'Resposta correta deve ser uma das opções';
        temErro = true;
      }
    }

    setValidationErrors(erros);
    return !temErro;
  };

  const handleSave = async () => {
    if (!validarForm()) {
      setError('Por favor, corrija os erros do formulário');
      return;
    }

    setLoading(true);
    try {
      // Prepare data to send to backend
      const dadosParaEnviar = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        disciplina: formData.disciplina,
        tipo: formData.tipo,
        dificuldade: formData.dificuldade,
        resposta_correta: formData.resposta_correta.trim(),
        pontos: parseInt(formData.pontos) || 5,
        explicacao: formData.explicacao.trim() || null,
        // For multiple choice, send only option texts (array of strings)
        opcoes: formData.tipo === 'multipla_escolha'
          ? formData.opcoes.filter(o => o.texto.trim()).map(o => o.texto)
          : null,
        linguagem: formData.tipo === 'codigo' ? formData.linguagem : null
      };

      console.log('Enviando questão:', dadosParaEnviar);

      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
      
      const endpoint = isEditMode && questaoId
        ? `${apiBase}/api/questoes/${questaoId}`
        : `${apiBase}/api/questoes/colaborador/criar`;

      const method = isEditMode && questaoId ? 'PUT' : 'POST';

      const res = await axios({
        method,
        url: endpoint,
        data: dadosParaEnviar,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('Resposta da API:', res.data);

      // Requirement 2.6: Show "Pendente de aprovação" status message
      setSuccess(
        isEditMode
          ? 'Questão atualizada com sucesso! Aguarde a revisão do administrador.'
          : 'Questão criada com sucesso! Status: Pendente de aprovação'
      );
      setError('');

      // Call callback after 1.5s
      if (onSuccess) {
        setTimeout(() => onSuccess(res.data?.dados || res.data), 1500);
      } else {
        // Close modal after success
        setTimeout(() => onClose?.(), 2000);
      }
    } catch (err) {
      console.error('Erro ao salvar questão:', err);

      // Improved error handling
      let mensagem = 'Erro ao salvar questão';

      if (err.response?.data?.mensagem) {
        mensagem = err.response.data.mensagem;
      } else if (err.response?.data?.message) {
        mensagem = err.response.data.message;
      } else if (err.response?.data?.erros && Array.isArray(err.response.data.erros)) {
        mensagem = err.response.data.erros.join(' | ');
      } else if (err.message === 'timeout of 10000ms exceeded') {
        mensagem = 'Timeout: servidor não respondeu em tempo';
      } else if (err.message) {
        mensagem = err.message;
      }

      setError(mensagem);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const disciplinaLabel = {
    'matematica': 'Matemática',
    'ingles': 'Inglês',
    'programacao': 'Programação'
  }[formData.disciplina] || formData.disciplina;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header with Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 md:px-8 py-6 flex items-center justify-between border-b border-blue-700/50 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isEditMode ? 'Editar Questão' : 'Criar Nova Questão'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold text-sm md:text-base">Erro na validação</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-xl flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
              <p className="font-semibold text-sm md:text-base">{success}</p>
            </div>
          )}

          {/* Info Box - Pending Approval Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-5 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                <strong>Informação:</strong> Após a criação, sua questão será marcada como <strong>"Pendente de aprovação"</strong>. Um administrador precisará revisar antes de usar em torneios.
              </p>
            </div>
          </div>

          {/* Grid Layout - Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Tipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition"
              >
                <option value="multipla_escolha">Múltipla Escolha</option>
                <option value="texto">Texto/Aberta</option>
                <option value="codigo">Código</option>
              </select>
            </div>

            {/* Disciplina (READ-ONLY) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600" />
                Disciplina
              </label>
              <div className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  {disciplinaLabel}
                </span>
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" /> Sua disciplina (não pode ser alterada)
              </p>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título * {formData.titulo.length > 0 && <span className="text-xs text-gray-500">({formData.titulo.length}/255)</span>}
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Ex: Resolva a equação quadrática"
              maxLength={255}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition ${
                validationErrors.titulo ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {validationErrors.titulo && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {validationErrors.titulo}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição/Enunciado *
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Descreva a questão em detalhes..."
              rows={4}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition resize-none ${
                validationErrors.descricao ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {validationErrors.descricao && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {validationErrors.descricao}
              </p>
            )}
          </div>

          {/* Dificuldade e Pontos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                Dificuldade *
              </label>
              <select
                name="dificuldade"
                value={formData.dificuldade}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition ${
                  validationErrors.dificuldade ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="facil">Fácil (5 pontos)</option>
                <option value="medio">Médio (10 pontos)</option>
                <option value="dificil">Difícil (20 pontos)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-600" />
                Pontos
              </label>
              <div className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-bold text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold">{formData.pontos}</span>
                  <span className="text-sm font-normal text-gray-500">pontos</span>
                </span>
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Auto-calculado: fácil=5, médio=10, difícil=20
              </p>
            </div>
          </div>

          {/* Linguagem (para código) */}
          {formData.tipo === 'codigo' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CodeIcon className="w-4 h-4 text-purple-600" />
                Linguagem de Programação
              </label>
              <select
                name="linguagem"
                value={formData.linguagem}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
          )}

          {/* Opções (para múltipla escolha) */}
          {formData.tipo === 'multipla_escolha' && (
            <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50/50">
              <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Opções * ({formData.opcoes.filter(o => o.texto.trim()).length} preenchidas)
              </label>
              <div className="space-y-3">
                {formData.opcoes.map((opcao, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
                    <div className="flex gap-3 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="resposta_correta_radio"
                          checked={opcao.correta}
                          onChange={() => handleOpcaoChange(index, 'correta', true)}
                          disabled={loading}
                          className="w-4 h-4 cursor-pointer accent-green-600"
                        />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          opcao.correta 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {opcao.correta ? 'Correta' : 'Marcar como correta'}
                        </span>
                      </label>
                      {formData.opcoes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOpcao(index)}
                          disabled={loading}
                          className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded disabled:opacity-50 transition"
                          title="Remover opção"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={opcao.texto}
                      onChange={(e) => handleOpcaoChange(index, 'texto', e.target.value)}
                      disabled={loading}
                      placeholder={`Opção ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition text-sm"
                    />
                  </div>
                ))}
              </div>
              {validationErrors.opcoes && (
                <p className="text-xs text-red-600 mt-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.opcoes}
                </p>
              )}
              {formData.opcoes.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddOpcao}
                  disabled={loading}
                  className="mt-3 w-full py-2.5 border-2 border-dashed border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Opção
                </button>
              )}
            </div>
          )}

          {/* Resposta Correta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Resposta Correta *
            </label>
            <input
              type="text"
              name="resposta_correta"
              value={formData.resposta_correta}
              onChange={handleInputChange}
              disabled={loading || formData.tipo === 'multipla_escolha'}
              placeholder={formData.tipo === 'multipla_escolha' ? 'Auto-preenchida ao marcar opção' : 'Digite a resposta correta'}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                loading || formData.tipo === 'multipla_escolha'
                  ? 'bg-gray-50 cursor-not-allowed border-gray-200'
                  : 'border-gray-200'
              } ${validationErrors.resposta_correta ? 'border-red-300' : ''}`}
            />
            {formData.tipo === 'multipla_escolha' && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" /> Preenchida automaticamente quando você marca uma opção como correta
              </p>
            )}
            {validationErrors.resposta_correta && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {validationErrors.resposta_correta}
              </p>
            )}
          </div>

          {/* Explicação */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Explicação (Opcional)
            </label>
            <textarea
              name="explicacao"
              value={formData.explicacao}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Explique por que essa é a resposta correta (ajuda no aprendizado)..."
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            >
              <Save className="w-5 h-5" />
              {loading ? (isEditMode ? 'Atualizando...' : 'Salvando...') : (isEditMode ? 'Atualizar Questão' : 'Criar Questão')}
            </button>
          </div>
        </div>
      </div>
    </div>
    , document.body);
};

export default QuestaoForm;