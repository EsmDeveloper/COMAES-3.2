import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { X, Save, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

/**
 * CreateQuestaoForm
 * Formulário único para criar questões usando modelo Questao.js
 * 
 * FIXES IMPLEMENTADOS:
 * - ✅ Normalizar opções: converter de array de objetos para array de strings antes de enviar
 * - ✅ resposta_correta agora sincroniza com a opção marcada como correta
 * - ✅ Validação frontend alinhada com backend
 * - ✅ Disciplina agora é campo obrigatório
 * - ✅ Timeout de 10 segundos em axios
 * - ✅ Tratamento de erro melhorado
 * - ✅ Pontos automáticos baseados na dificuldade (Fácil=5, Médio=10, Difícil=20)
 */

const CreateQuestaoForm = ({ torneioId, disciplinaFixa, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [torneios, setTorneios] = useState([]);

  // Mapeamento de pontos por dificuldade
  const PONTOS_POR_DIFICULDADE = {
    'facil': 5,
    'medio': 10,
    'dificil': 20
  };

  const [formData, setFormData] = useState({
    torneio_id: torneioId || '',
    titulo: '',
    descricao: '',
    disciplina: disciplinaFixa || 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    resposta_correta: '',
    pontos: 5, // Começa com 5 (Fácil)
    opcoes: [
      { texto: 'Opção A', correta: true, explicacao: '' },
      { texto: 'Opção B', correta: false, explicacao: '' }
    ],
    explicacao: '',
    linguagem: 'javascript'
  });

  // Carregar torneios
  useEffect(() => {
    const carregarTorneios = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
        const res = await axios.get(`${apiBase}/api/admin/torneio`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 5000
        });
        setTorneios(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar torneios:', err);
        setError('Erro ao carregar lista de torneios');
      }
    };
    carregarTorneios();
  }, [token]);

  // Inicializar resposta_correta com primeira opção correta
  useEffect(() => {
    if (formData.tipo === 'multipla_escolha') {
      const opcaoCorreta = formData.opcoes.find(o => o.correta);
      if (opcaoCorreta && opcaoCorreta.texto && !formData.resposta_correta) {
        setFormData(prev => ({ ...prev, resposta_correta: opcaoCorreta.texto }));
      }
    }
  }, [formData.opcoes, formData.tipo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Se mudou dificuldade, atualizar pontos automaticamente
    if (name === 'dificuldade') {
      const pontos = PONTOS_POR_DIFICULDADE[value] || 5;
      setFormData(prev => ({
        ...prev,
        [name]: value,
        pontos: pontos // Atualiza os pontos automaticamente
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
    
    // Se marcando como correta, desmarcar as outras
    if (field === 'correta' && value === true) {
      newOpcoes.forEach((o, i) => {
        if (i !== index) o.correta = false;
      });
    }
    
    setFormData(prev => ({ ...prev, opcoes: newOpcoes }));
    
    // Atualizar resposta_correta com o texto da opção correta
    const opcaoCorreta = newOpcoes.find(o => o.correta);
    if (opcaoCorreta && opcaoCorreta.texto) {
      setFormData(prev => ({ ...prev, resposta_correta: opcaoCorreta.texto }));
    }
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
      const novasOpcoes = formData.opcoes.filter((_, i) => i !== index);
      
      // Se removeu a opção correta, marcar a primeira como correta
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
    const erros = [];

    if (!formData.titulo.trim()) {
      erros.push('Título é obrigatório');
    }

    if (!formData.descricao.trim()) {
      erros.push('Descrição é obrigatória');
    }

    if (!formData.disciplina) {
      erros.push('Disciplina é obrigatória');
    }

    if (!formData.tipo) {
      erros.push('Tipo é obrigatório');
    }

    if (!formData.dificuldade) {
      erros.push('Dificuldade é obrigatória');
    }

    if (!formData.resposta_correta || !formData.resposta_correta.trim()) {
      erros.push('Resposta correta é obrigatória');
    }

    if (formData.tipo === 'multipla_escolha') {
      const opcoesComTexto = formData.opcoes.filter(o => o.texto.trim());
      if (opcoesComTexto.length < 2) {
        erros.push('Mínimo 2 opções preenchidas para múltipla escolha');
      }
      if (!formData.opcoes.some(o => o.correta)) {
        erros.push('Marque uma opção como correta');
      }
    }

    return erros;
  };

  const handleSave = async () => {
    const validacaoErros = validarForm();
    if (validacaoErros.length > 0) {
      setError(validacaoErros.join(' | '));
      return;
    }

    setLoading(true);
    try {
      // Preparar dados para enviar ao backend
      const dadosParaEnviar = {
        torneio_id: formData.torneio_id ? parseInt(formData.torneio_id) : null,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        disciplina: formData.disciplina,
        tipo: formData.tipo,
        dificuldade: formData.dificuldade,
        resposta_correta: formData.resposta_correta.trim(),
        pontos: formData.pontos, // Usa os pontos automáticos
        explicacao: formData.explicacao.trim() || null,
        // Para múltipla escolha, enviar apenas os textos das opções (array de strings)
        opcoes: formData.tipo === 'multipla_escolha' 
          ? formData.opcoes.filter(o => o.texto.trim()).map(o => o.texto)
          : null,
        linguagem: formData.tipo === 'codigo' ? formData.linguagem : null
      };

      console.log('Enviando questão:', dadosParaEnviar);

      // Enviar para API
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
      const res = await axios.post(`${apiBase}/api/questoes`, dadosParaEnviar, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      });

      console.log('Resposta da API:', res.data);

      setSuccess('Questão criada com sucesso!');
      
      // Chamar callback após 1.5s
      if (onSuccess) {
        setTimeout(() => onSuccess(res.data?.dados || res.data), 1500);
      } else {
        // Fechar modal após sucesso
        setTimeout(() => onClose?.(), 2000);
      }
    } catch (err) {
      console.error('Erro ao criar questão:', err);
      
      // Tratamento melhorado de erros
      let mensagem = 'Erro ao criar questão';
      
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
    } finally {
      setLoading(false);
    }
  };

  // Função para obter a cor do badge de pontos
  const getPontosBadgeColor = (dificuldade) => {
    const colors = {
      'facil': 'bg-green-100 text-green-800',
      'medio': 'bg-yellow-100 text-yellow-800',
      'dificil': 'bg-red-100 text-red-800'
    };
    return colors[dificuldade] || 'bg-gray-100 text-gray-800';
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-blue-700 z-10">
          <h2 className="text-2xl font-bold text-white">Criar Nova Questão</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro na validação:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold">{success}</p>
            </div>
          )}

          {/* Torneio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Torneio
            </label>
            <select
              name="torneio_id"
              value={formData.torneio_id}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition"
            >
              <option value="">Nenhum torneio (opcional)</option>
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
                disabled={!!disciplinaFixa || loading}
                className={`w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${disciplinaFixa ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              >
                <option value="matematica">Matemática</option>
                <option value="ingles">Inglês</option>
                <option value="programacao">Programação</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition"
              >
                <option value="multipla_escolha">Múltipla Escolha</option>
                <option value="texto">Texto/Aberta</option>
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
              disabled={loading}
              placeholder="Ex: Resolva a equação quadrática"
              maxLength={255}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.titulo.length}/255</p>
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
              disabled={loading}
              placeholder="Descreva a questão em detalhes"
              rows={4}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition resize-none"
            />
          </div>

          {/* Dificuldade e Pontos (agora é um badge informativo) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nível de Dificuldade *
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dificuldade"
                    value="facil"
                    checked={formData.dificuldade === 'facil'}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-green-700">Fácil</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dificuldade"
                    value="medio"
                    checked={formData.dificuldade === 'medio'}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-yellow-700">Médio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dificuldade"
                    value="dificil"
                    checked={formData.dificuldade === 'dificil'}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-red-700">Difícil</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Pontos (Automático)
              </label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${getPontosBadgeColor(formData.dificuldade)}`}>
                <span>{formData.pontos}</span>
                <span className="text-xs font-normal opacity-75">pontos</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Definido automaticamente baseado no nível: Fácil=5, Médio=10, Difícil=20
              </p>
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
                disabled={loading}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition"
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
            <div className="border-2 border-slate-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Opções * ({formData.opcoes.filter(o => o.texto.trim()).length}/10 preenchidas)
              </label>
              <div className="space-y-3">
                {formData.opcoes.map((opcao, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex gap-3 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="resposta_correta_radio"
                          checked={opcao.correta}
                          onChange={() => handleOpcaoChange(index, 'correta', true)}
                          disabled={loading}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-700">Correta</span>
                      </label>
                      {formData.opcoes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOpcao(index)}
                          disabled={loading}
                          className="ml-auto text-red-600 hover:text-red-700 disabled:opacity-50 transition"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition text-sm mb-2"
                    />
                  </div>
                ))}
              </div>
              {formData.opcoes.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddOpcao}
                  disabled={loading}
                  className="mt-3 w-full py-2 border-2 border-dashed border-blue-400 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Opção
                </button>
              )}
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
              disabled={loading || formData.tipo === 'multipla_escolha'}
              placeholder={formData.tipo === 'multipla_escolha' ? 'Auto-preenchida ao marcar opção' : 'Digite a resposta correta'}
              className={`w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${loading || formData.tipo === 'multipla_escolha' ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
            {formData.tipo === 'multipla_escolha' && (
              <p className="text-xs text-slate-500 mt-1">Preenchida automaticamente quando você marca uma opção como correta</p>
            )}
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
              disabled={loading}
              placeholder="Explique por que essa é a resposta correta"
              rows={3}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition resize-none"
            />
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Informação:</strong> A questão será criada como <strong>"Pendente"</strong> se você for colaborador, 
              ou <strong>"Aprovada"</strong> se for administrador. Colaboradores precisam que um administrador revise antes de usar em torneios.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Criar Questão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  , document.body);
};

export default CreateQuestaoForm;