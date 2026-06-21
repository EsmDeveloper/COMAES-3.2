import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { X, Save, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

/**
 * CreateQuestaoTesteForm
 * Formulário para criar questÃµes do Teste de Conhecimento
 * 
 * Props:
 * - onClose: função para fechar o modal
 * - onSuccess: função chamada quando a questão é criada
 * - categoriaFixa: (opcional) fixa a categoria se fornecida
 * - dificuldadeFixa: (opcional) fixa a dificuldade se fornecida
 */

const CreateQuestaoTesteForm = ({ onClose, onSuccess, categoriaFixa, dificuldadeFixa }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    enunciado: '',
    opcoes: ['', '', '', ''],
    resposta_correta: '',
    dificuldade: dificuldadeFixa || 'medio',
    categoria: categoriaFixa || 'matematica',
    pontos: 10
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpcaoChange = (index, value) => {
    const novasOpcoes = [...formData.opcoes];
    novasOpcoes[index] = value;
    setFormData(prev => ({
      ...prev,
      opcoes: novasOpcoes
    }));
  };

  const adicionarOpcao = () => {
    setFormData(prev => ({
      ...prev,
      opcoes: [...prev.opcoes, '']
    }));
  };

  const removerOpcao = (index) => {
    if (formData.opcoes.length <= 2) {
      setError('Deve haver pelo menos 2 opçÃµes');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setFormData(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ValidaçÃµes
      if (!formData.enunciado.trim()) {
        throw new Error('Enunciado é obrigatório');
      }

      const opcoesValidas = formData.opcoes.filter(o => o.trim());
      if (opcoesValidas.length < 2) {
        throw new Error('Adicione pelo menos 2 opçÃµes válidas');
      }

      if (!formData.resposta_correta.trim()) {
        throw new Error('Resposta correta é obrigatória');
      }

      // Preparar dados
      const dados = {
        enunciado: formData.enunciado.trim(),
        opcoes: opcoesValidas,
        resposta_correta: formData.resposta_correta.trim(),
        dificuldade: formData.dificuldade,
        categoria: formData.categoria,
        pontos: parseInt(formData.pontos)
      };

      // Enviar para API
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;
      const res = await axios.post(`${apiBase}/api/teste-conhecimento/questoes`, dados, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Chamar callback â€” passa a questão criada para que o BlocoQuestoesManager possa associá-la
      if (onSuccess) {
        const questaoCriada = res.data?.data || res.data?.dados || res.data || null;
        onSuccess(questaoCriada);
      }
    } catch (err) {
      const mensagem = err.response?.data?.error || err.message || 'Erro ao criar questão';
      setError(mensagem);
      console.error('Erro ao criar questão:', err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-purple-700 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Nova Questão - Teste de Conhecimento</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Categoria e Dificuldade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Categoria * {categoriaFixa && <span className="text-xs text-green-600 ml-2">(Fixa para este bloco)</span>}
              </label>
              {categoriaFixa ? (
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">
                  {formData.categoria === 'matematica' ? 'Matemática' :
                   formData.categoria === 'programacao' ? 'Programação' :
                   formData.categoria === 'ingles' ? 'InglÃªs' : 'Cultura Geral'}
                  <input type="hidden" name="categoria" value={formData.categoria} />
                </div>
              ) : (
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="matematica">Matemática</option>
                  <option value="programacao">Programação</option>
                  <option value="ingles">InglÃªs</option>
                  <option value="cultura_geral">Cultura Geral</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Dificuldade * {dificuldadeFixa && <span className="text-xs text-green-600 ml-2">(Fixa para este bloco)</span>}
              </label>
              {dificuldadeFixa ? (
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">
                  {formData.dificuldade === 'facil' ? 'Fácil' :
                   formData.dificuldade === 'medio' ? 'Médio' : 'Difícil'}
                  <input type="hidden" name="dificuldade" value={formData.dificuldade} />
                </div>
              ) : (
                <select
                  name="dificuldade"
                  value={formData.dificuldade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>
              )}
            </div>
          </div>

          {/* Enunciado */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Enunciado *
            </label>
            <textarea
              name="enunciado"
              value={formData.enunciado}
              onChange={handleInputChange}
              placeholder="Digite o enunciado da questão"
              required
              rows="4"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* OpçÃµes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              OpçÃµes de Resposta *
            </label>
            <div className="space-y-2">
              {formData.opcoes.map((opcao, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-700 font-bold rounded-lg flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <input
                    type="text"
                    value={opcao}
                    onChange={(e) => handleOpcaoChange(index, e.target.value)}
                    placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {formData.opcoes.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removerOpcao(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={adicionarOpcao}
              className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Opção
            </button>
          </div>

          {/* Resposta Correta */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Resposta Correta *
            </label>
            <input
              type="text"
              name="resposta_correta"
              value={formData.resposta_correta}
              onChange={handleInputChange}
              placeholder="Digite a resposta correta (exatamente como aparece nas opçÃµes)"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dica: Copie e cole a opção correta para evitar erros
            </p>
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
              min="1"
              max="100"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Criando...' : 'Criar Questão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  , document.body);
};

export default CreateQuestaoTesteForm;

