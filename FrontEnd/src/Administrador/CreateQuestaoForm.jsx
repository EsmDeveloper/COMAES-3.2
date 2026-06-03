import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

/**
 * CreateQuestaoForm
 * Formulário único para criar questões usando modelo Questao.js
 * 
 * Suporta:
 * - Disciplina (Matemática, Inglês, Programação)
 * - Tipo (Múltipla Escolha, Texto, Código)
 * - Torneio
 * - Opções (para múltipla escolha)
 * - Resposta correta
 * - Dificuldade
 * - Pontos
 */

const CreateQuestaoForm = ({ torneioId, disciplinaFixa, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [torneios, setTorneios] = useState([]);

  const [formData, setFormData] = useState({
    torneio_id: torneioId || '',
    titulo: '',
    descricao: '',
    disciplina: disciplinaFixa || 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    resposta_correta: '',
    pontos: 10,
    opcoes: [],
    explicacao: '',
    linguagem: 'javascript'
  });

  // Carregar torneios
  useEffect(() => {
    const carregarTorneios = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
        const res = await axios.get(`${apiBase}/api/admin/torneio`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTorneios(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar torneios:', err);
      }
    };

    carregarTorneios();
  }, [token]);

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
    setFormData(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validações
      if (!formData.torneio_id) {
        throw new Error('Selecione um torneio');
      }
      if (!formData.titulo.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.descricao.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      if (!formData.resposta_correta.trim()) {
        throw new Error('Resposta correta é obrigatória');
      }

      // Validar opções para múltipla escolha
      if (formData.tipo === 'multipla_escolha') {
        if (formData.opcoes.length < 2) {
          throw new Error('Adicione pelo menos 2 opções para múltipla escolha');
        }
        if (formData.opcoes.some(o => !o.trim())) {
          throw new Error('Todas as opções devem ser preenchidas');
        }
      }

      // Preparar dados
      const dados = {
        torneio_id: parseInt(formData.torneio_id),
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        disciplina: formData.disciplina,
        tipo: formData.tipo,
        dificuldade: formData.dificuldade,
        resposta_correta: formData.resposta_correta.trim(),
        pontos: parseInt(formData.pontos),
        explicacao: formData.explicacao.trim() || null,
        opcoes: formData.tipo === 'multipla_escolha' ? formData.opcoes : null,
        linguagem: formData.tipo === 'codigo' ? formData.linguagem : null
      };

      // Enviar para API
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
      const res = await axios.post(`${apiBase}/api/questoes`, dados, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess('Questão criada com sucesso!');
      
      // Limpar formulário
      setFormData({
        torneio_id: torneioId || '',
        titulo: '',
        descricao: '',
        disciplina: disciplinaFixa || 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        resposta_correta: '',
        pontos: 10,
        opcoes: [],
        explicacao: '',
        linguagem: 'javascript'
      });

      // Chamar callback
      if (onSuccess) {
        setTimeout(() => onSuccess(res.data.dados), 1500);
      }
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || err.message || 'Erro ao criar questão';
      setError(mensagem);
      console.error('Erro ao criar questão:', err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-blue-700">
          <h2 className="text-2xl font-bold text-white">Criar Nova Questão</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {/* Torneio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Torneio *
            </label>
            <select
              name="torneio_id"
              value={formData.torneio_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um torneio</option>
              {torneios.map(t => (
                <option key={t.id} value={t.id}>{t.titulo}</option>
              ))}
            </select>
          </div>

          {/* Disciplina e Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Disciplina *
              </label>
              <select
                name="disciplina"
                value={formData.disciplina}
                onChange={handleInputChange}
                disabled={!!disciplinaFixa}
                className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${disciplinaFixa ? 'bg-slate-100 cursor-not-allowed opacity-75' : ''}`}
              >
                <option value="matematica">Matemática</option>
                <option value="ingles">Inglês</option>
                <option value="programacao">Programação</option>
              </select>
              {disciplinaFixa && (
                <p className="text-xs text-slate-500 mt-1">
                  Disciplina definida pelo bloco — não pode ser alterada.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="multipla_escolha">Múltipla Escolha</option>
                <option value="texto">Texto</option>
                <option value="codigo">Código</option>
              </select>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ex: Resolva a equação quadrática"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descrição *
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descreva a questão em detalhes"
              required
              rows="4"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dificuldade e Pontos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Dificuldade *
              </label>
              <select
                name="dificuldade"
                value={formData.dificuldade}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>

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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Linguagem (para código) */}
          {formData.tipo === 'codigo' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Linguagem de Programação
              </label>
              <select
                name="linguagem"
                value={formData.linguagem}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Opções *
              </label>
              <div className="space-y-2">
                {formData.opcoes.map((opcao, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={opcao}
                      onChange={(e) => handleOpcaoChange(index, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removerOpcao(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={adicionarOpcao}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                + Adicionar Opção
              </button>
            </div>
          )}

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
              placeholder="Digite a resposta correta"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Explicação */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Explicação (Opcional)
            </label>
            <textarea
              name="explicacao"
              value={formData.explicacao}
              onChange={handleInputChange}
              placeholder="Explique por que essa é a resposta correta"
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Criar Questão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  , document.body);
};

export default CreateQuestaoForm;
