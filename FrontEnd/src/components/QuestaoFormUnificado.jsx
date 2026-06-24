import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';

/**
 * QuestaoFormUnificado
 * Componente único de criação/edição de questões usado em:
 *  - Admin: QuestoesTorneiosTab, QuestoesTestesTab, QuestoesPendentesTab
 *  - Colaborador: MinhasQuestoes, ColaboradorDashboard
 *
 * Props:
 *   questao         — objeto questão existente (edição) ou null (criação)
 *   isOpen          — boolean
 *   onClose         — () => void
 *   onSave          — async (payload) => void  — chamado com os dados formatados
 *   disciplinaFixa  — string opcional — bloqueia o select de disciplina
 *   titulo          — string opcional — título do modal (padrão automático)
 *   mostrarTorneio  — boolean (default false) — exibe select de torneio (admin)
 *   torneios        — array de torneios (usado quando mostrarTorneio=true)
 *   saving          — boolean externo opcional (loading vindo de fora)
 */

const PONTOS_POR_DIFICULDADE = { facil: 5, medio: 10, dificil: 20 };

const PONTOS_BADGE_COLOR = {
  facil:   'bg-green-100 text-green-800 border-green-300',
  medio:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  dificil: 'bg-red-100 text-red-800 border-red-300',
};

/**
 * Normaliza as opções que vêm da API para o formato interno usado pelo form:
 * Aceita:
 *   - array de strings: ['texto A', 'texto B']
 *   - array de objetos: [{texto:'A', correta:true}, ...]
 * Retorna sempre: [{texto: string, correta: boolean}]
 */
function normalizarOpcoes(opcoes, respostaCorreta = '') {
  if (!Array.isArray(opcoes) || opcoes.length === 0) {
    return [
      { texto: '', correta: false },
      { texto: '', correta: false },
      { texto: '', correta: false },
      { texto: '', correta: false },
    ];
  }

  return opcoes.map(o => {
    if (typeof o === 'string') {
      return { texto: o, correta: o === respostaCorreta };
    }
    if (typeof o === 'object' && o !== null) {
      return {
        texto: o.texto || o.text || '',
        correta: Boolean(o.correta || o.correta === true),
      };
    }
    return { texto: '', correta: false };
  });
}

const QuestaoFormUnificado = ({
  questao = null,
  isOpen = false,
  onClose,
  onSave,
  disciplinaFixa = null,
  titulo: tituloProp = null,
  mostrarTorneio = false,
  torneios = [],
  saving: externalSaving = false,
}) => {
  const [formData, setFormData] = useState({
    torneio_id: '',
    titulo: '',
    descricao: '',
    disciplina: disciplinaFixa || 'matematica',
    tipo: 'multipla_escolha',
    dificuldade: 'facil',
    resposta_correta: '',
    pontos: 5,
    opcoes: [
      { texto: '', correta: true },
      { texto: '', correta: false },
      { texto: '', correta: false },
      { texto: '', correta: false },
    ],
    explicacao: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isLoading = saving || externalSaving;
  const isEdit = Boolean(questao);
  const tituloModal = tituloProp || (isEdit ? 'Editar Questão' : 'Criar Nova Questão');

  // ── Inicializar/reset form ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');

    if (questao) {
      const opcoes = normalizarOpcoes(questao.opcoes, questao.resposta_correta);

      // Garantir que pelo menos uma está marcada como correta
      const temCorreta = opcoes.some(o => o.correta);
      if (!temCorreta && opcoes.length > 0) opcoes[0].correta = true;

      const respostaCorreta =
        questao.resposta_correta ||
        opcoes.find(o => o.correta)?.texto ||
        '';

      setFormData({
        torneio_id: questao.torneio_id || '',
        titulo: questao.titulo || '',
        descricao: questao.descricao || questao.enunciado || '',
        disciplina: disciplinaFixa || questao.disciplina || 'matematica',
        tipo: questao.tipo || 'multipla_escolha',
        dificuldade: questao.dificuldade || 'facil',
        resposta_correta: respostaCorreta,
        pontos: questao.pontos || PONTOS_POR_DIFICULDADE[questao.dificuldade] || 5,
        opcoes,
        explicacao: questao.explicacao || '',
      });
    } else {
      setFormData({
        torneio_id: '',
        titulo: '',
        descricao: '',
        disciplina: disciplinaFixa || 'matematica',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        resposta_correta: '',
        pontos: 5,
        opcoes: [
          { texto: '', correta: true },
          { texto: '', correta: false },
          { texto: '', correta: false },
          { texto: '', correta: false },
        ],
        explicacao: '',
      });
    }
  }, [questao, isOpen, disciplinaFixa]);

  // ── Handlers ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dificuldade') {
      setFormData(prev => ({
        ...prev,
        dificuldade: value,
        pontos: PONTOS_POR_DIFICULDADE[value] || 5,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleOpcaoTextoChange = (index, value) => {
    const novas = formData.opcoes.map((o, i) => {
      if (i !== index) return o;
      const eraCorreta = o.correta;
      return { ...o, texto: value };
    });
    // Se a opção que mudou era a correta, actualizar resposta_correta
    if (novas[index].correta) {
      setFormData(prev => ({ ...prev, opcoes: novas, resposta_correta: value }));
    } else {
      setFormData(prev => ({ ...prev, opcoes: novas }));
    }
  };

  const handleMarcarCorreta = (index) => {
    const novas = formData.opcoes.map((o, i) => ({
      ...o,
      correta: i === index,
    }));
    setFormData(prev => ({
      ...prev,
      opcoes: novas,
      resposta_correta: novas[index].texto,
    }));
  };

  const handleAddOpcao = () => {
    if (formData.opcoes.length < 10) {
      setFormData(prev => ({
        ...prev,
        opcoes: [...prev.opcoes, { texto: '', correta: false }],
      }));
    }
  };

  const handleRemoveOpcao = (index) => {
    if (formData.opcoes.length <= 2) return;
    const novas = formData.opcoes.filter((_, i) => i !== index);
    // Se removeu a correta, marcar a primeira como correta
    if (formData.opcoes[index]?.correta) {
      novas[0].correta = true;
      setFormData(prev => ({
        ...prev,
        opcoes: novas,
        resposta_correta: novas[0].texto,
      }));
    } else {
      setFormData(prev => ({ ...prev, opcoes: novas }));
    }
  };

  // ── Validação ──────────────────────────────────────────────────
  const validar = () => {
    if (!formData.titulo.trim()) return 'Título é obrigatório';
    if (!formData.descricao.trim()) return 'Descrição/Enunciado é obrigatório';
    if (!formData.disciplina) return 'Disciplina é obrigatória';
    if (!formData.dificuldade) return 'Dificuldade é obrigatória';
    if (!formData.resposta_correta?.trim()) return 'Resposta correta é obrigatória';

    if (formData.tipo === 'multipla_escolha') {
      const validas = formData.opcoes.filter(o => o.texto.trim());
      if (validas.length < 2) return 'Preencha pelo menos 2 alternativas';
      const textos = validas.map(o => o.texto.trim().toLowerCase());
      if (new Set(textos).size !== textos.length) return 'Alternativas duplicadas não são permitidas';
      if (!formData.opcoes.some(o => o.correta)) return 'Marque uma opção como correta';
      if (!validas.map(o => o.texto).includes(formData.resposta_correta)) {
        return 'A resposta correta deve ser uma das alternativas preenchidas';
      }
    }
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    const erroValidacao = validar();
    if (erroValidacao) {
      setError(erroValidacao);
      return;
    }

    setSaving(true);
    try {
      const opcoesValidas = formData.opcoes.filter(o => o.texto.trim());

      const payload = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        enunciado: formData.descricao.trim(),      // compatibilidade com controller antigo
        disciplina: formData.disciplina,
        tipo: formData.tipo,
        dificuldade: formData.dificuldade,
        resposta_correta: formData.resposta_correta.trim(),
        pontos: formData.pontos,
        explicacao: formData.explicacao.trim() || null,
        // Enviar AMBOS os formatos para máxima compatibilidade
        opcoes: opcoesValidas.map(o => ({ texto: o.texto.trim(), correta: o.correta })),
        ...(mostrarTorneio && formData.torneio_id && {
          torneio_id: parseInt(formData.torneio_id),
        }),
      };

      await onSave(payload);
      setSuccess(isEdit ? 'Questão actualizada com sucesso!' : 'Questão criada com sucesso!');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err.message || 'Erro ao salvar questão');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-blue-700 z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{tituloModal}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Feedback */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {/* Torneio (opcional, só admin) */}
          {mostrarTorneio && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Torneio</label>
              <select
                name="torneio_id"
                value={formData.torneio_id}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 transition"
              >
                <option value="">Nenhum torneio (opcional)</option>
                {torneios.map(t => (
                  <option key={t.id} value={t.id}>{t.titulo}</option>
                ))}
              </select>
            </div>
          )}

          {/* Disciplina + Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Disciplina *</label>
              <select
                name="disciplina"
                value={formData.disciplina}
                onChange={handleChange}
                disabled={!!disciplinaFixa || isLoading}
                className={`w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${disciplinaFixa ? 'bg-slate-100 cursor-not-allowed opacity-75' : ''}`}
              >
                <option value="matematica">Matemática</option>
                <option value="ingles">Inglês</option>
                <option value="programacao">Programação</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 transition"
              >
                <option value="multipla_escolha">Múltipla Escolha</option>
                <option value="texto">Texto / Aberta</option>
                <option value="codigo">Código</option>
              </select>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Título * <span className="text-xs font-normal text-slate-400">({formData.titulo.length}/255)</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ex: Qual é a capital de Angola?"
              maxLength={255}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 transition"
            />
          </div>

          {/* Descrição / Enunciado */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Descrição / Enunciado *
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Descreva a questão em detalhes..."
              rows={4}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 transition resize-none"
            />
          </div>

          {/* Dificuldade + Pontos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nível de Dificuldade *</label>
              <div className="flex gap-4">
                {['facil', 'medio', 'dificil'].map(nv => (
                  <label key={nv} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dificuldade"
                      value={nv}
                      checked={formData.dificuldade === nv}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm font-medium ${
                      nv === 'facil' ? 'text-green-700' :
                      nv === 'medio' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {nv === 'facil' ? 'Fácil' : nv === 'medio' ? 'Médio' : 'Difícil'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pontos (automático)</label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 ${PONTOS_BADGE_COLOR[formData.dificuldade] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                <span className="text-lg">{formData.pontos}</span>
                <span className="text-xs font-normal opacity-70">pontos</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Fácil=5 · Médio=10 · Difícil=20</p>
            </div>
          </div>

          {/* Opções — apenas para múltipla escolha */}
          {formData.tipo === 'multipla_escolha' && (
            <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Alternativas * ({formData.opcoes.filter(o => o.texto.trim()).length} preenchidas)
              </label>
              <div className="space-y-2">
                {formData.opcoes.map((opcao, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    {/* Radio — marcar como correta */}
                    <input
                      type="radio"
                      name="opcao_correta_radio"
                      checked={opcao.correta}
                      onChange={() => handleMarcarCorreta(idx)}
                      disabled={isLoading}
                      className="w-4 h-4 cursor-pointer flex-shrink-0"
                      title="Marcar como correta"
                    />
                    {/* Letra */}
                    <span className="text-sm font-bold text-slate-500 w-5 flex-shrink-0">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {/* Input do texto */}
                    <input
                      type="text"
                      value={opcao.texto}
                      onChange={e => handleOpcaoTextoChange(idx, e.target.value)}
                      disabled={isLoading}
                      placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-100 transition"
                    />
                    {/* Badge correta */}
                    {opcao.correta && (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                        ✓ Correta
                      </span>
                    )}
                    {/* Remover */}
                    {formData.opcoes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOpcao(idx)}
                        disabled={isLoading}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50 flex-shrink-0 transition"
                        title="Remover alternativa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formData.opcoes.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddOpcao}
                  disabled={isLoading}
                  className="mt-3 w-full py-2 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Alternativa
                </button>
              )}
              <p className="text-xs text-slate-400 mt-2">
                Clique no botão de rádio ao lado da alternativa correcta para a assinalar.
              </p>
            </div>
          )}

          {/* Resposta correta (texto livre para tipo texto/código) */}
          {formData.tipo !== 'multipla_escolha' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Resposta Correta *</label>
              <input
                type="text"
                name="resposta_correta"
                value={formData.resposta_correta}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Digite a resposta correta"
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 transition"
              />
            </div>
          )}

          {/* Explicação */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Explicação (opcional)</label>
            <textarea
              name="explicacao"
              value={formData.explicacao}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Explique por que esta é a resposta correcta..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 transition resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'A guardar...' : isEdit ? 'Guardar Alterações' : 'Criar Questão'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default QuestaoFormUnificado;
