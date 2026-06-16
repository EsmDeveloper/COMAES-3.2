import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { X, Save, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

/**
 * CreateQuestaoForm
 * FormulÃ¡rio Ãºnico para criar questÃµes usando modelo Questao.js
 * 
 * FIXES IMPLEMENTADOS:
 * - âœ… Normalizar opÃ§Ãµes: converter de array de objetos para array de strings antes de enviar
 * - âœ… resposta_correta agora sincroniza com a opÃ§Ã£o marcada como correta
 * - âœ… ValidaÃ§Ã£o frontend alinhada com backend
 * - âœ… Disciplina agora Ã© campo obrigatÃ³rio
 * - âœ… Timeout de 10 segundos em axios
 * - âœ… Tratamento de erro melhorado
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
    resposta_correta: '', // Para mÃºltipla escolha serÃ¡ o texto da opÃ§Ã£o marcada como correta
    pontos: 10,
    opcoes: [
      { texto: 'OpÃ§Ã£o A', correta: true, explicacao: '' },
      { texto: 'OpÃ§Ã£o B', correta: false, explicacao: '' }
    ],
    explicacao: '',
    linguagem: 'javascript'
  });

  // Carregar torneios
  useEffect(() => {
    const carregarTorneios = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
        const res = await axios.get(`${apiBase}/api/admin/torneio`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 5000
        });
        setTorneios(res.data || []);
      } catch (err) {
        console.error('âŒ Erro ao carregar torneios:', err);
        setError('Erro ao carregar lista de torneios');
      }
    };
    carregarTorneios();
  }, [token]);

  // Inicializar resposta_correta com primeira opÃ§Ã£o correta
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
      const pontosMap = {
        'facil': 5,
        'medio': 10,
        'dificil': 20
      };
      setFormData(prev => ({
        ...prev,
        [name]: value,
        pontos: pontosMap[value] || 10
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
    
    // Atualizar resposta_correta com o texto da opÃ§Ã£o correta
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
      
      // Se removeu a opÃ§Ã£o correta, marcar a primeira como correta
      const tinhaCoretoRemovida = formData.opcoes[index]?.correta;
      if (tinhaCoretoRemovida && novasOpcoes.length > 0 && !novasOpcoes.some(o => o.correta)) {
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
      erros.push('TÃ­tulo Ã© obrigatÃ³rio');
    }

    if (!formData.descricao.trim()) {
      erros.push('DescriÃ§Ã£o Ã© obrigatÃ³ria');
    }

    if (!formData.disciplina) {
      erros.push('Disciplina Ã© obrigatÃ³ria');
    }

    if (!formData.tipo) {
      erros.push('Tipo Ã© obrigatÃ³rio');
    }

    if (!formData.dificuldade) {
      erros.push('Dificuldade Ã© obrigatÃ³ria');
    }

    if (!formData.resposta_correta || !formData.resposta_correta.trim()) {
      erros.push('Resposta correta Ã© obrigatÃ³ria');
    }

    if (typeof formData.pontos !== 'number' || formData.pontos < 1 || formData.pontos > 100) {
      erros.push('Pontos deve estar entre 1 e 100');
    }

    if (formData.tipo === 'multipla_escolha') {
      const opcoesComTexto = formData.opcoes.filter(o => o.texto.trim());
      if (opcoesComTexto.length < 2) {
        erros.push('MÃ­nimo 2 opÃ§Ãµes preenchidas para mÃºltipla escolha');
      }
      if (!formData.opcoes.some(o => o.correta)) {
        erros.push('Marque uma opÃ§Ã£o como correta');
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
      // âœ… CORREÃ‡ÃƒO: Converter opcoes de objetos para array de strings
      const dadosParaEnviar = {
        torneio_id: formData.torneio_id ? parseInt(formData.torneio_id) : null,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        disciplina: formData.disciplina,
        tipo: formData.tipo,
        dificuldade: formData.dificuldade,
        resposta_correta: formData.resposta_correta.trim(),
        pontos: parseInt(formData.pontos) || 10,
        explicacao: formData.explicacao.trim() || null,
        // âœ… Para mÃºltipla escolha, enviar apenas os textos das opÃ§Ãµes (array de strings)
        opcoes: formData.tipo === 'multipla_escolha' 
          ? formData.opcoes.filter(o => o.texto.trim()).map(o => o.texto)
          : null,
        linguagem: formData.tipo === 'codigo' ? formData.linguagem : null
      };

      console.log('ðŸ“¤ Enviando questÃ£o:', dadosParaEnviar);

      // Enviar para API
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      const res = await axios.post(`${apiBase}/api/questoes`, dadosParaEnviar, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // âœ… 10 segundos timeout
      });

      console.log('âœ… Resposta da API:', res.data);

      setSuccess('QuestÃ£o criada com sucesso!');
      
      // Chamar callback apÃ³s 1.5s
      if (onSuccess) {
        setTimeout(() => onSuccess(res.data?.dados || res.data), 1500);
      } else {
        // Fechar modal apÃ³s sucesso
        setTimeout(() => onClose?.(), 2000);
      }
    } catch (err) {
      console.error('âŒ Erro ao criar questÃ£o:', err);
      
      // Tratamento melhorado de erros
      let mensagem = 'Erro ao criar questÃ£o';
      
      if (err.response?.data?.mensagem) {
        mensagem = err.response.data.mensagem;
      } else if (err.response?.data?.message) {
        mensagem = err.response.data.message;
      } else if (err.response?.data?.erros && Array.isArray(err.response.data.erros)) {
        mensagem = err.response.data.erros.join(' | ');
      } else if (err.message === 'timeout of 10000ms exceeded') {
        mensagem = 'Timeout: servidor nÃ£o respondeu em tempo';
      } else if (err.message) {
        mensagem = err.message;
      }
      
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-blue-700 z-10">
          <h2 className="text-2xl font-bold text-white">Criar Nova QuestÃ£o</h2>
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
                <p className="font-semibold">Erro na validaÃ§Ã£o:</p>
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
                <option value="matematica">MatemÃ¡tica</option>
                <option value="ingles">InglÃªs</option>
                <option value="programacao">ProgramaÃ§Ã£o</option>
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
                <option value="multipla_escolha">MÃºltipla Escolha</option>
                <option value="texto">Texto/Aberta</option>
                <option value="codigo">CÃ³digo</option>
              </select>
            </div>
          </div>

          {/* TÃ­tulo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              TÃ­tulo *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Ex: Resolva a equaÃ§Ã£o quadrÃ¡tica"
              maxLength={255}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.titulo.length}/255</p>
          </div>

          {/* DescriÃ§Ã£o */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              DescriÃ§Ã£o/Enunciado *
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Descreva a questÃ£o em detalhes"
              rows={4}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition resize-none"
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
                disabled={loading}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition"
              >
                <option value="facil">â­ FÃ¡cil</option>
                <option value="medio">â­â­ MÃ©dio</option>
                <option value="dificil">â­â­â­ DifÃ­cil</option>
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
                disabled={loading}
                min="1"
                max="100"
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition"
              />
              <p className="text-xs text-slate-500 mt-1">1-100</p>
            </div>
          </div>

          {/* Linguagem (para cÃ³digo) */}
          {formData.tipo === 'codigo' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Linguagem de ProgramaÃ§Ã£o
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

          {/* OpÃ§Ãµes (para mÃºltipla escolha) */}
          {formData.tipo === 'multipla_escolha' && (
            <div className="border-2 border-slate-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                OpÃ§Ãµes * ({formData.opcoes.filter(o => o.texto.trim()).length}/10 preenchidas)
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
                          title="Remover opÃ§Ã£o"
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
                      placeholder={`OpÃ§Ã£o ${index + 1}`}
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
                  Adicionar OpÃ§Ã£o
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
              placeholder={formData.tipo === 'multipla_escolha' ? 'Auto-preenchida ao marcar opÃ§Ã£o' : 'Digite a resposta correta'}
              className={`w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${loading || formData.tipo === 'multipla_escolha' ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
            {formData.tipo === 'multipla_escolha' && (
              <p className="text-xs text-slate-500 mt-1">ðŸ“Œ Preenchida automaticamente quando vocÃª marca uma opÃ§Ã£o como correta</p>
            )}
          </div>

          {/* ExplicaÃ§Ã£o */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ExplicaÃ§Ã£o (Opcional)
            </label>
            <textarea
              name="explicacao"
              value={formData.explicacao}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Explique por que essa Ã© a resposta correta"
              rows={3}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 transition resize-none"
            />
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>â„¹ï¸ InformaÃ§Ã£o:</strong> A questÃ£o serÃ¡ criada como <strong>"Pendente"</strong> se vocÃª for colaborador, 
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
              {loading ? 'Salvando...' : 'Criar QuestÃ£o'}
            </button>
          </div>
        </div>
      </div>
    </div>
  , document.body);
};

export default CreateQuestaoForm;
