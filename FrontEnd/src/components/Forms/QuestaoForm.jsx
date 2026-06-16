/**
 * QuestaoForm.jsx - Componente reutilizável para criar/editar questões
 * 
 * Features:
 * 1. Suporta criação e edição de questões
 * 2. Disciplina bloqueada (apenas leitura da disciplina_colaborador do usuário)
 * 3. Tipos de questão: múltipla_escolha, texto, código
 * 4. Dificuldades: fácil, médio, difícil
 * 5. Validação completa de campos
 * 6. Feedback visual de erros
 * 7. Suporta campos opcionais (explicação, pontos, linguagem)
 * 8. Status "Pendente de aprovação" após criação
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.4
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, X, ChevronDown, Copy, Trash2 } from 'lucide-react';

// ── Tipos de Questão ──────────────────────────────────────────────────────────
const TIPOS_QUESTAO = [
  { value: 'multipla_escolha', label: 'Múltipla Escolha' },
  { value: 'texto', label: 'Texto Livre' },
  { value: 'codigo', label: 'Código' },
];

const DIFICULDADES = [
  { value: 'facil', label: 'Fácil' },
  { value: 'medio', label: 'Médio' },
  { value: 'dificil', label: 'Difícil' },
];

const LINGUAGENS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
];

// ── Validação ─────────────────────────────────────────────────────────────────
const validarCamposComuns = (formData) => {
  const erros = [];

  // Título
  if (!formData.titulo || !formData.titulo.trim()) {
    erros.push('Título é obrigatório');
  } else if (formData.titulo.length > 255) {
    erros.push('Título não pode exceder 255 caracteres');
  }

  // Descrição
  if (!formData.descricao || !formData.descricao.trim()) {
    erros.push('Descrição/Enunciado é obrigatório');
  } else if (formData.descricao.length > 5000) {
    erros.push('Descrição não pode exceder 5000 caracteres');
  }

  // Dificuldade
  if (!formData.dificuldade) {
    erros.push('Dificuldade é obrigatória');
  }

  // Pontos (se fornecido)
  if (formData.pontos !== null && formData.pontos !== undefined) {
    const pontos = parseInt(formData.pontos);
    if (isNaN(pontos) || pontos < 1 || pontos > 1000) {
      erros.push('Pontos devem estar entre 1 e 1000');
    }
  }

  return erros;
};

const validarMultiplaEscolha = (formData) => {
  const erros = [];

  // Validar opções
  const opcoesValidas = formData.opcoes.filter((o) => o && o.trim());
  if (opcoesValidas.length < 2) {
    erros.push('Mínimo 2 opções/alternativas são necessárias');
  }

  // Verificar duplicatas
  const opcoesTrimmed = opcoesValidas.map((o) => o.trim().toLowerCase());
  const uniqueOpcoes = new Set(opcoesTrimmed);
  if (uniqueOpcoes.size !== opcoesTrimmed.length) {
    erros.push('Opções duplicadas não são permitidas');
  }

  // Resposta correta
  if (!formData.resposta_correta) {
    erros.push('Selecione a resposta correta');
  } else if (!opcoesValidas.includes(formData.resposta_correta)) {
    erros.push('A resposta correta deve ser uma das opções fornecidas');
  }

  // Limite de opções
  if (formData.opcoes.length > 10) {
    erros.push('Máximo 10 opções permitidas');
  }

  return erros;
};

const validarTexto = (formData) => {
  const erros = [];

  if (!formData.resposta_correta || !formData.resposta_correta.trim()) {
    erros.push('Resposta correta é obrigatória para questões de texto');
  } else if (formData.resposta_correta.length > 2000) {
    erros.push('Resposta correta não pode exceder 2000 caracteres');
  }

  return erros;
};

const validarCodigo = (formData) => {
  const erros = [];

  if (!formData.linguagem) {
    erros.push('Linguagem é obrigatória para questões de código');
  }

  if (!formData.resposta_correta || !formData.resposta_correta.trim()) {
    erros.push('Código de resposta é obrigatório');
  } else if (formData.resposta_correta.length > 10000) {
    erros.push('Código não pode exceder 10000 caracteres');
  }

  return erros;
};

// ── Componente Principal ──────────────────────────────────────────────────────
export default function QuestaoForm({
  questao = null, // null para criar, objeto para editar
  disciplina = 'matematica', // disciplina do usuário (bloqueada)
  onSubmit = async () => {}, // Callback ao salvar
  onCancel = () => {}, // Callback ao cancelar
  loading = false, // Estado de carregamento
  showStatusMessage = true, // Mostrar mensagem de status após criação
}) {
  // ── Constantes para cálculo de pontos ────────────────────────────────────
  const calcularPontosParaDificuldade = (dificuldade) => {
    const pontosPorDificuldade = {
      'facil': 5,
      'medio': 10,
      'dificil': 20,
    };
    return pontosPorDificuldade[dificuldade] || 10;
  };

  // ── Estados ───────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    opcoes: ['', '', '', ''],
    resposta_correta: '',
    explicacao: '',
    pontos: 10,
    linguagem: '',
  });

  const [erros, setErros] = useState([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // ── Effects ───────────────────────────────────────────────────────────────
  // Carregar dados da questão ao editar
  useEffect(() => {
    if (questao) {
      setFormData({
        titulo: questao.titulo || '',
        descricao: questao.descricao || questao.enunciado || '',
        tipo: questao.tipo || 'multipla_escolha',
        dificuldade: questao.dificuldade || 'medio',
        opcoes: questao.opcoes && Array.isArray(questao.opcoes)
          ? questao.opcoes.length > 0
            ? questao.opcoes
            : ['', '', '', '']
          : ['', '', '', ''],
        resposta_correta: questao.resposta_correta || '',
        explicacao: questao.explicacao || '',
        pontos: questao.pontos || calcularPontosParaDificuldade(questao.dificuldade || 'medio'),
        linguagem: questao.linguagem || '',
      });
      setStatusMessage('');
    } else {
      // Reset para novo
      setFormData({
        titulo: '',
        descricao: '',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        opcoes: ['', '', '', ''],
        resposta_correta: '',
        explicacao: '',
        pontos: calcularPontosParaDificuldade('medio'),
        linguagem: '',
      });
      setStatusMessage('');
    }
    setErros([]);
  }, [questao]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFieldChange = (field, value) => {
    // Se mudar dificuldade, auto-atualizar pontos
    if (field === 'dificuldade' && !questao) {
      const novosPontos = calcularPontosParaDificuldade(value);
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        pontos: novosPontos,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    // Limpar erro relacionado ao campo
    if (erros.length > 0) {
      setErros([]);
    }
  };

  const handleOpcaoChange = (index, value) => {
    const novasOpcoes = [...formData.opcoes];
    novasOpcoes[index] = value;
    setFormData((prev) => ({
      ...prev,
      opcoes: novasOpcoes,
    }));
  };

  const handleAddOpcao = () => {
    if (formData.opcoes.length < 10) {
      setFormData((prev) => ({
        ...prev,
        opcoes: [...prev.opcoes, ''],
      }));
    }
  };

  const handleRemoveOpcao = (index) => {
    if (formData.opcoes.length > 2) {
      const novasOpcoes = formData.opcoes.filter((_, i) => i !== index);
      
      // Se a opção removida era a resposta correta, limpar
      if (formData.resposta_correta === formData.opcoes[index]) {
        setFormData((prev) => ({
          ...prev,
          opcoes: novasOpcoes,
          resposta_correta: '',
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          opcoes: novasOpcoes,
        }));
      }
    }
  };

  const handleDuplicarOpcao = (index) => {
    if (formData.opcoes.length < 10) {
      const novasOpcoes = [...formData.opcoes];
      novasOpcoes.splice(index + 1, 0, formData.opcoes[index]);
      setFormData((prev) => ({
        ...prev,
        opcoes: novasOpcoes,
      }));
    }
  };

  const validarFormulario = () => {
    const errosValidacao = [];

    // Validar campos comuns
    errosValidacao.push(...validarCamposComuns(formData));

    // Validar por tipo
    if (formData.tipo === 'multipla_escolha') {
      errosValidacao.push(...validarMultiplaEscolha(formData));
    } else if (formData.tipo === 'texto') {
      errosValidacao.push(...validarTexto(formData));
    } else if (formData.tipo === 'codigo') {
      errosValidacao.push(...validarCodigo(formData));
    }

    return errosValidacao;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar
    const errosValidacao = validarFormulario();
    if (errosValidacao.length > 0) {
      setErros(errosValidacao);
      return;
    }

    setSaving(true);
    try {
      // Preparar dados para envio
      const dadosParaEnviar = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        disciplina: disciplina.toLowerCase(),
        tipo: formData.tipo,
        dificuldade: formData.dificuldade,
        resposta_correta: formData.resposta_correta.trim(),
      };

      // Campos opcionais
      if (formData.explicacao && formData.explicacao.trim()) {
        dadosParaEnviar.explicacao = formData.explicacao.trim();
      }

      if (formData.pontos) {
        dadosParaEnviar.pontos = parseInt(formData.pontos);
      }

      // Por tipo
      if (formData.tipo === 'multipla_escolha') {
        dadosParaEnviar.opcoes = formData.opcoes.filter((o) => o && o.trim());
      } else if (formData.tipo === 'codigo' && formData.linguagem) {
        dadosParaEnviar.linguagem = formData.linguagem;
      }

      // Chamar callback
      const resultado = await onSubmit(dadosParaEnviar);

      // Mostrar mensagem de sucesso
      if (!questao) {
        // Criação
        setStatusMessage('✓ Questão criada com sucesso! Aguardando aprovação do administrador.');
        // Reset form
        setFormData({
          titulo: '',
          descricao: '',
          tipo: 'multipla_escolha',
          dificuldade: 'medio',
          opcoes: ['', '', '', ''],
          resposta_correta: '',
          explicacao: '',
          pontos: 10,
          linguagem: '',
        });
      } else {
        // Edição
        setStatusMessage('✓ Questão atualizada com sucesso!');
      }

      setErros([]);
    } catch (erro) {
      const mensagem =
        erro?.response?.data?.mensagem ||
        erro?.response?.data?.error ||
        erro.message ||
        'Erro ao salvar questão';
      setErros([mensagem]);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {questao ? 'Editar Questão' : 'Criar Nova Questão'}
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          {questao
            ? 'Atualize os dados da questão. Após edição, será necessária nova aprovação.'
            : 'Preencha os campos abaixo e envie para aprovação'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensagens de Erro */}
        {erros.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Erros encontrados:</h3>
                <ul className="space-y-1">
                  {erros.map((erro, idx) => (
                    <li key={idx} className="text-sm text-red-800">
                      • {erro}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Status */}
        {statusMessage && showStatusMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium text-sm">{statusMessage}</p>
          </div>
        )}

        {/* Seção: Informações Básicas */}
        <fieldset className="border border-slate-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-slate-700 px-2">
            Informações Básicas
          </legend>

          {/* Disciplina (Bloqueada) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Disciplina <span className="text-red-500">*</span>
            </label>
            <div className="bg-slate-100 px-3 py-2.5 rounded-lg border border-slate-300 text-slate-700 capitalize font-medium">
              {disciplina}
              <span className="text-xs text-slate-500 ml-2 font-normal">
                (Bloqueada - sua disciplina atribuída)
              </span>
            </div>
          </div>

          {/* Título */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleFieldChange('titulo', e.target.value)}
              maxLength={255}
              placeholder="Ex: Qual é a capital de Portugal?"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={loading || saving}
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.titulo.length}/255 caracteres
            </p>
          </div>

          {/* Descrição */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descrição/Enunciado <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleFieldChange('descricao', e.target.value)}
              maxLength={5000}
              rows={5}
              placeholder="Digite o enunciado completo da questão. Inclua contexto, dados e instruções necessárias."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-sans"
              disabled={loading || saving}
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.descricao.length}/5000 caracteres
            </p>
          </div>
        </fieldset>

        {/* Seção: Configuração */}
        <fieldset className="border border-slate-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-slate-700 px-2">
            Configuração
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de Questão */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Questão <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => {
                  handleFieldChange('tipo', e.target.value);
                  // Reset resposta e opções ao mudar tipo
                  if (e.target.value !== 'multipla_escolha') {
                    setFormData((prev) => ({
                      ...prev,
                      resposta_correta: '',
                      opcoes: ['', '', '', ''],
                    }));
                  }
                }}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={loading || saving}
              >
                {TIPOS_QUESTAO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dificuldade */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dificuldade <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.dificuldade}
                onChange={(e) => handleFieldChange('dificuldade', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={loading || saving}
              >
                {DIFICULDADES.map((dif) => (
                  <option key={dif.value} value={dif.value}>
                    {dif.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pontos (Auto-calculado) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pontos <span className="text-xs text-slate-500">(Auto-calculado)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.pontos}
                  readOnly
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm cursor-not-allowed"
                  title="Pontos são calculados automaticamente baseado na dificuldade"
                />
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  {formData.dificuldade === 'facil' && '(Fácil: 5 pts)'}
                  {formData.dificuldade === 'medio' && '(Médio: 10 pts)'}
                  {formData.dificuldade === 'dificil' && '(Difícil: 20 pts)'}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Valor calculado automaticamente conforme a dificuldade
              </p>
            </div>
          </div>
        </fieldset>

        {/* Seção: Resposta (dinâmica por tipo) */}
        <fieldset className="border border-slate-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-slate-700 px-2">
            {formData.tipo === 'multipla_escolha'
              ? 'Opções e Resposta Correta'
              : formData.tipo === 'codigo'
              ? 'Código e Linguagem'
              : 'Resposta'}
          </legend>

          {/* Múltipla Escolha */}
          {formData.tipo === 'multipla_escolha' && (
            <div className="space-y-3">
              {formData.opcoes.map((opcao, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {/* Radio button para resposta correta */}
                  <input
                    type="radio"
                    id={`opcao-${idx}`}
                    name="resposta_correta"
                    checked={formData.resposta_correta === opcao}
                    onChange={() => handleFieldChange('resposta_correta', opcao)}
                    className="w-4 h-4 cursor-pointer accent-blue-500"
                    disabled={loading || saving}
                  />

                  {/* Rótulo da opção */}
                  <label
                    htmlFor={`opcao-${idx}`}
                    className="text-sm font-medium text-slate-600 min-w-6"
                  >
                    {String.fromCharCode(65 + idx)}.
                  </label>

                  {/* Campo de entrada */}
                  <input
                    type="text"
                    value={opcao}
                    onChange={(e) => handleOpcaoChange(idx, e.target.value)}
                    maxLength={500}
                    placeholder={`Opção ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={loading || saving}
                  />

                  {/* Botões de ação */}
                  <div className="flex items-center gap-1">
                    {formData.opcoes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOpcao(idx)}
                        title="Remover opção"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        disabled={loading || saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {formData.opcoes.length < 10 && (
                      <button
                        type="button"
                        onClick={() => handleDuplicarOpcao(idx)}
                        title="Duplicar opção"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        disabled={loading || saving}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Botão adicionar opção */}
              {formData.opcoes.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddOpcao}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  disabled={loading || saving}
                >
                  + Adicionar Opção
                </button>
              )}

              <p className="text-xs text-slate-500 mt-2">
                {formData.opcoes.length}/10 opções | Selecione o rádio da resposta correta
              </p>
            </div>
          )}

          {/* Texto Livre */}
          {formData.tipo === 'texto' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resposta Correta <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.resposta_correta}
                  onChange={(e) => handleFieldChange('resposta_correta', e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="Digite a resposta correta esperada..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={loading || saving}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.resposta_correta.length}/2000 caracteres
                </p>
              </div>
            </div>
          )}

          {/* Código */}
          {formData.tipo === 'codigo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Linguagem <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.linguagem}
                  onChange={(e) => handleFieldChange('linguagem', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={loading || saving}
                >
                  <option value="">Selecione uma linguagem...</option>
                  {LINGUAGENS.map((lng) => (
                    <option key={lng.value} value={lng.value}>
                      {lng.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Código de Resposta/Solução <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.resposta_correta}
                  onChange={(e) => handleFieldChange('resposta_correta', e.target.value)}
                  maxLength={10000}
                  rows={8}
                  placeholder="Digite o código da solução esperada..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono bg-slate-50"
                  disabled={loading || saving}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.resposta_correta.length}/10000 caracteres
                </p>
              </div>
            </div>
          )}
        </fieldset>

        {/* Seção: Explicação Adicional */}
        <fieldset className="border border-slate-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-slate-700 px-2">
            Explicação (Opcional)
          </legend>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Explicação da Resposta
            </label>
            <textarea
              value={formData.explicacao}
              onChange={(e) => handleFieldChange('explicacao', e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Explique por que essa é a resposta correta. Isso ajuda os estudantes a aprender."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={loading || saving}
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.explicacao.length}/2000 caracteres
            </p>
          </div>
        </fieldset>

        {/* Status Pendente (Informativo) */}
        {!questao && showStatusMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📋</div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Pendente de Aprovação
                </h3>
                <p className="text-sm text-blue-800 mt-1">
                  Após a criação, sua questão será revisada pelos administradores
                  antes de ser utilizada nos torneios.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || saving}
            className="px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || saving}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? 'Salvando...' : questao ? 'Atualizar' : 'Criar Questão'}
          </button>
        </div>
      </form>
    </div>
  );
}
