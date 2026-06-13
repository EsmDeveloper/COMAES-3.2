/**
 * TournamentForm.jsx
 * Formulário completo de criação/edição de torneios
 * Implementa: persistência de dados, status dinâmicos, validação de datas, UX melhorada
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Trophy,
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Link,
  Eye,
  Globe,
  Loader2,
  CheckCircle2,
  Info,
  Lock,
  Layers,
  Zap,
  BookOpen,
  Code2,
  Languages,
} from 'lucide-react';
import { TournamentValidation } from '../utils/TournamentValidation';
import BlocosService from '../services/BlocosService';
import { useAuth } from '../../context/AuthContext';

// ============================================
// CONSTANTES
// ============================================

const DISCIPLINAS_DISPONIVEIS = [
  { value: 'Matemática', label: 'Matemática', icon: 'Zap' },
  { value: 'Programação', label: 'Programação', icon: 'Code2' },
  { value: 'Inglês', label: 'Inglês', icon: 'Languages' },
];

// ============================================
// CONFIGURAÇÃO DE STATUS
// ============================================

const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho', icon: 'FileText', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ativo: { label: 'Ativo', icon: 'Zap', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  finalizado: { label: 'Finalizado', icon: 'CheckCircle2', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  cancelado: { label: 'Cancelado', icon: 'AlertCircle', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
};

// Opções de status por modo e estado atual
const STATUS_OPTIONS = {
  create: [
    { value: 'rascunho', label: 'Rascunho', description: 'Torneio em preparação, não visível para usuários' },
    { value: 'ativo', label: 'Ativo', description: 'Torneio publicado e disponível para participação' },
  ],
  edit: {
    rascunho: [
      { value: 'rascunho', label: 'Rascunho', description: 'Manter em preparação' },
      { value: 'ativo', label: 'Ativo', description: 'Publicar o torneio' },
      { value: 'cancelado', label: 'Cancelado', description: 'Cancelar definitivamente' },
    ],
    ativo: [
      { value: 'ativo', label: 'Ativo', description: 'Manter ativo' },
      { value: 'finalizado', label: 'Finalizado', description: 'Encerrar o torneio' },
      { value: 'cancelado', label: 'Cancelado', description: 'Cancelar definitivamente' },
    ],
    finalizado: [
      { value: 'finalizado', label: 'Finalizado', description: 'Torneio encerrado - apenas visualização', disabled: true },
    ],
    cancelado: [
      { value: 'cancelado', label: 'Cancelado', description: 'Torneio cancelado - apenas visualização', disabled: true },
    ],
  },
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function TournamentForm({
  mode = 'create',
  initialData = null,
  onSubmit = () => {},
  onCancel = () => {},
  isLoading = false,
}) {
  const { token } = useAuth();

  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    inicia_em: '',
    termina_em: '',
    status: 'rascunho',
    público: true,
    slug: '',
    tipo_torneio: 'generico',
    disciplina_especifica: '',
  });

  // Estado de erros e campos tocados
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ── Estado de Blocos ──────────────────────────────────────────────────────
  const [blocosDisponiveis, setBlocosDisponiveis] = useState([]);   // todos os blocos publicados
  const [blocosAssociados, setBlocosAssociados] = useState([]);     // IDs dos blocos já no torneio
  const [loadingBlocos, setLoadingBlocos] = useState(false);
  const [blocoError, setBlocoError] = useState('');

  // ✅ NOVO: Filtrar blocos por disciplina se o torneio for específico
  const blocosFiltrados = useMemo(() => {
    if (formData.tipo_torneio !== 'especifico' || !formData.disciplina_especifica) {
      return blocosDisponiveis;
    }
    
    // Mapear disciplina do torneio para a disciplina do bloco
    const disciplinaMapMap = {
      'Matemática': 'matematica',
      'Programação': 'programacao',
      'Inglês': 'ingles',
    };
    
    const disciplinaBloco = disciplinaMapMap[formData.disciplina_especifica];
    console.log(`📋 Filtrando blocos para ${formData.disciplina_especifica} (${disciplinaBloco})`);
    
    return blocosDisponiveis.filter(b => {
      const match = b.disciplina === disciplinaBloco;
      console.log(`   - Bloco "${b.titulo}" (${b.disciplina}): ${match ? '✅' : '❌'}`);
      return match;
    });
  }, [blocosDisponiveis, formData.tipo_torneio, formData.disciplina_especifica]);

  // Calcular data mínima (agora + 1 minuto)
  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  }, []);

  // Obter opções de status disponíveis baseadas no estado atual
  const availableStatusOptions = useMemo(() => {
    if (mode === 'create') {
      return STATUS_OPTIONS.create;
    }
    const currentStatus = initialData?.status || 'rascunho';
    return STATUS_OPTIONS.edit[currentStatus] || STATUS_OPTIONS.edit.rascunho;
  }, [mode, initialData?.status]);

  // Verificar se o formulário está em modo somente leitura
  const isReadOnly = useMemo(() => {
    if (mode !== 'edit' || !initialData) return false;
    return ['finalizado', 'cancelado'].includes(initialData.status);
  }, [mode, initialData]);

  // ── Carregar blocos publicados disponíveis ────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setLoadingBlocos(true);
    BlocosService.listar(token, { status: 'publicado', limit: 100 })
      .then(res => setBlocosDisponiveis(res.data?.blocos || []))
      .catch(() => setBlocoError('Não foi possível carregar os blocos.'))
      .finally(() => setLoadingBlocos(false));
  }, [token]);

  // ── Carregar blocos já associados ao torneio (modo edição) ────────────────
  useEffect(() => {
    if (mode !== 'edit' || !initialData?.id || !token) return;
    BlocosService.listarBlocosDoTorneio(token, initialData.id)
      .then(res => setBlocosAssociados((res.data?.blocos || []).map(b => b.id)))
      .catch(() => {});
  }, [mode, initialData?.id, token]);

  // ── Toggle associação de bloco ────────────────────────────────────────────
  const handleToggleBloco = useCallback(async (blocoId) => {
    if (!initialData?.id) {
      // Modo criação: apenas marcar localmente (associar após criar o torneio)
      setBlocosAssociados(prev =>
        prev.includes(blocoId) ? prev.filter(id => id !== blocoId) : [...prev, blocoId]
      );
      return;
    }
    // Modo edição: persistir imediatamente
    const jaAssociado = blocosAssociados.includes(blocoId);
    try {
      if (jaAssociado) {
        await BlocosService.desassociar(token, initialData.id, blocoId);
      } else {
        await BlocosService.associar(token, initialData.id, blocoId);
      }
      setBlocosAssociados(prev =>
        jaAssociado ? prev.filter(id => id !== blocoId) : [...prev, blocoId]
      );
    } catch (e) {
      setBlocoError(e.message);
      setTimeout(() => setBlocoError(''), 4000);
    }
  }, [blocosAssociados, initialData?.id, token]);

  // ── Carregar dados iniciais (modo edição) ─────────────────────────────────
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      console.log('[TournamentForm] Carregando dados para edição:', {
        id: initialData.id,
        titulo: initialData.titulo,
        inicia_em: initialData.inicia_em,
        termina_em: initialData.termina_em,
        status: initialData.status,
        público: initialData.público,
      });

      // Preservar o status original do torneio
      const originalStatus = initialData.status || 'rascunho';

      // Formatar datas com tratamento robusto
      const iniciaEm = TournamentValidation.formatDateForInput(initialData.inicia_em);
      const terminaEm = TournamentValidation.formatDateForInput(initialData.termina_em);

      console.log('[TournamentForm] Datas formatadas:', { iniciaEm, terminaEm });

      setFormData({
        titulo: initialData.titulo || '',
        descricao: initialData.descricao || '',
        inicia_em: iniciaEm || '',
        termina_em: terminaEm || '',
        status: originalStatus,
        público: initialData.público !== false,
        slug: initialData.slug || '',
        tipo_torneio: initialData.tipo_torneio || 'generico',
        disciplina_especifica: initialData.disciplina_especifica || '',
      });
    } else if (mode === 'create') {
      // Reset para criação
      setFormData({
        titulo: '',
        descricao: '',
        inicia_em: '',
        termina_em: '',
        status: 'rascunho',
        público: true,
        slug: '',
        tipo_torneio: 'generico',
        disciplina_especifica: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [mode, initialData]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'titulo' && mode === 'create') {
        updated.slug = TournamentValidation.generateSlug(value);
      }
      // ✅ DEBUG: Log quando tipo_torneio muda
      if (field === 'tipo_torneio') {
        console.log('[TournamentForm] tipo_torneio alterado:', {
          anterior: prev.tipo_torneio,
          novo: value,
          timestamp: new Date().toISOString()
        });
      }
      return updated;
    });

    // Limpar erro do campo quando modificado
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [mode, errors]);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validar em tempo real após perder foco
    const validationErrors = TournamentValidation.validate(formData, mode, minDateTime);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    }
  }, [formData, mode, minDateTime]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Marcar todos os campos como tocados
    setTouched({
      titulo: true,
      descricao: true,
      inicia_em: true,
      termina_em: true,
      status: true,
      tipo_torneio: true,
      disciplina_especifica: true,
    });

    // Validação adicional para tipo_torneio
    if (formData.tipo_torneio === 'especifico' && !formData.disciplina_especifica) {
      setErrors(prev => ({
        ...prev,
        disciplina_especifica: 'Disciplina é obrigatória para torneios específicos'
      }));
      return;
    }

    // ✅ NOVA VALIDAÇÃO: Se ativar torneio, validar blocos
    if (formData.status === 'ativo' && mode === 'create') {
      if (blocosAssociados.length === 0) {
        setBlocoError('Torneio deve ter pelo menos um bloco de questões com mínimo 5 questões para ser ativado');
        return;
      }

      if (formData.tipo_torneio === 'generico') {
        // Contar disciplinas nos blocos selecionados
        const disciplinasNosBlocos = new Set(
          blocosFiltrados
            .filter(b => blocosAssociados.includes(b.id))
            .map(b => b.disciplina)
        );

        if (disciplinasNosBlocos.size < 3) {
          const disciplinasMapa = { 'matematica': 'Matemática', 'ingles': 'Inglês', 'programacao': 'Programação' };
          const disciplinasFaltantes = ['matematica', 'ingles', 'programacao']
            .filter(d => !disciplinasNosBlocos.has(d))
            .map(d => disciplinasMapa[d])
            .join(', ');
          
          setBlocoError(`Torneio genérico precisa de blocos de TODAS as 3 disciplinas. Faltam: ${disciplinasFaltantes}`);
          return;
        }
      }
    }

    // Validar formulário completo
    const validationErrors = TournamentValidation.validate(formData, mode, minDateTime);

    if (TournamentValidation.hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    // Preparar payload
    const payload = {
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim(),
      inicia_em: formData.inicia_em,
      termina_em: formData.termina_em,
      status: formData.status,
      público: formData.público,
      slug: formData.slug || TournamentValidation.generateSlug(formData.titulo),
      // ✅ IMPORTANTE: tipo_torneio e disciplina_especifica são READ-ONLY após criação
      // Apenas incluir no payload se for modo CREATE
      ...(mode === 'create' && {
        tipo_torneio: formData.tipo_torneio,
        disciplina_especifica: formData.tipo_torneio === 'especifico' ? formData.disciplina_especifica : null,
      }),
      // Blocos selecionados (apenas em modo criação — edição persiste em tempo real)
      _blocosParaAssociar: mode === 'create' ? blocosAssociados : [],
    };

    // ✅ DEBUG: Log detalhado do payload
    console.log('[TournamentForm] ✅ Validação passou! Payload completo:', {
      tipo_torneio_no_formdata: formData.tipo_torneio,
      tipo_torneio_no_payload: payload.tipo_torneio,
      disciplina_no_formdata: formData.disciplina_especifica,
      disciplina_no_payload: payload.disciplina_especifica,
      mode,
      payload
    });

    console.log('[TournamentForm] Enviando payload:', payload);
    onSubmit(payload);
  }, [formData, mode, minDateTime, onSubmit, blocosAssociados]);

  // ============================================
  // RENDERIZAR CAMPO DE INPUT
  // ============================================
  const renderInputField = useCallback(({
    label,
    name,
    type = 'text',
    placeholder,
    icon: Icon,
    required = true,
    rows,
    min,
    max,
  }) => {
    const hasError = touched[name] && errors[name];
    const showError = hasError || (touched[name] && errors[name]);

    return (
      <div className="space-y-1.5 animate-fade-in">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        <div className="relative group">
          {Icon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              showError ? 'text-rose-400' : 'text-gray-400 group-focus-within:text-blue-500'
            }`}>
              <Icon size={18} />
            </div>
          )}
          {type === 'textarea' ? (
            <textarea
              value={formData[name]}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              onBlur={() => handleBlur(name)}
              placeholder={placeholder}
              rows={rows || 3}
              disabled={isLoading || isReadOnly}
              className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl outline-none transition-all duration-200 resize-none
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:bg-gray-50
                ${showError ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500/20' : 'border-gray-200 hover:border-gray-300'}`}
            />
          ) : (
            <input
              type={type}
              value={formData[name]}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              onBlur={() => handleBlur(name)}
              placeholder={placeholder}
              min={min}
              max={max}
              disabled={isLoading || isReadOnly}
              className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl outline-none transition-all duration-200
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:bg-gray-50
                ${showError ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500/20' : 'border-gray-200 hover:border-gray-300'}`}
            />
          )}
        </div>
        {showError && (
          <div className="flex items-center gap-1.5 text-rose-600 text-xs animate-slide-down">
            <AlertCircle size={14} />
            <span>{errors[name]}</span>
          </div>
        )}
      </div>
    );
  }, [formData, errors, touched, isLoading, isReadOnly, handleFieldChange, handleBlur]);

  // ============================================
  // RENDERIZAR SELECT DE STATUS
  // ============================================
  const renderStatusSelect = useCallback(() => {
    const currentStatusConfig = STATUS_CONFIG[formData.status] || STATUS_CONFIG.rascunho;
    const hasError = touched.status && errors.status;

    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Status <span className="text-rose-500">*</span>
        </label>

        {/* Indicador visual do status atual */}
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${currentStatusConfig.bg} ${currentStatusConfig.border}`}>
          <div className={`w-5 h-5 flex items-center justify-center ${currentStatusConfig.color}`}>
            {currentStatusConfig.icon === 'FileText' && <FileText size={18} />}
            {currentStatusConfig.icon === 'Zap' && <Zap size={18} />}
            {currentStatusConfig.icon === 'CheckCircle2' && <CheckCircle2 size={18} />}
            {currentStatusConfig.icon === 'AlertCircle' && <AlertCircle size={18} />}
          </div>
          <span className={`font-medium ${currentStatusConfig.color}`}>
            {currentStatusConfig.label}
          </span>
          {isReadOnly && (
            <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
              <Lock size={12} />
              Somente visualização
            </span>
          )}
        </div>

        {/* Select de status */}
        <div className="relative">
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 ${hasError ? 'text-rose-400' : 'text-gray-400'}`}>
            <Eye size={18} />
          </div>
          <select
            value={formData.status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            onBlur={() => handleBlur('status')}
            disabled={isLoading || isReadOnly || availableStatusOptions.every(o => o.disabled)}
            className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl outline-none transition-all duration-200 cursor-pointer
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed
              ${hasError ? 'border-rose-300' : 'border-gray-200'}
              ${formData.status === 'ativo' ? 'text-emerald-700 font-medium' : ''}
              ${formData.status === 'finalizado' ? 'text-gray-500' : ''}
              ${formData.status === 'cancelado' ? 'text-rose-600' : ''}`}
          >
            {availableStatusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Descrição da opção selecionada */}
        {availableStatusOptions.find(o => o.value === formData.status)?.description && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Info size={12} />
            {availableStatusOptions.find(o => o.value === formData.status)?.description}
          </p>
        )}

        {/* Erro de status */}
        {hasError && (
          <div className="flex items-center gap-1.5 text-rose-600 text-xs animate-slide-down">
            <AlertCircle size={14} />
            <span>{errors.status}</span>
          </div>
        )}
      </div>
    );
  }, [formData.status, errors.status, touched.status, isLoading, isReadOnly, availableStatusOptions, handleFieldChange, handleBlur]);

  // ============================================
  // RENDERIZAÇÃO PRINCIPAL
  // ============================================
  return (
    <>
      <style>{`
        /* Scrollbar personalizada */
        .tournament-form-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .tournament-form-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .tournament-form-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .tournament-form-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        /* Animações customizadas */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out forwards;
        }
        /* Estilização do select */
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 1rem center;
          background-repeat: no-repeat;
          background-size: 1.25rem;
        }
        /* Checkbox estilizado */
        input[type="checkbox"] {
          appearance: none;
          width: 1.2rem;
          height: 1.2rem;
          border: 2px solid #cbd5e1;
          border-radius: 0.375rem;
          background-color: white;
          transition: all 0.15s ease;
          position: relative;
          cursor: pointer;
        }
        input[type="checkbox"]:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        input[type="checkbox"]:checked::after {
          content: "✓";
          position: absolute;
          color: white;
          font-size: 0.8rem;
          font-weight: bold;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        input[type="checkbox"]:focus {
          ring: 2px solid #3b82f6;
        }
        input[type="checkbox"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-0">
        {/* Header com gradiente */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 flex-shrink-0">
          <h3 className="font-bold text-gray-800 flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 rounded-xl">
              <Trophy size={20} className="text-blue-600" />
            </div>
            <span className="text-lg">
              {mode === 'create' ? 'Criar Novo Torneio' : 'Editar Torneio'}
            </span>
            {mode === 'edit' && (
              <span className="ml-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Edição
              </span>
            )}
          </h3>
        </div>

        {/* Body com scroll aprimorado */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0 tournament-form-scroll">
          {/* Título */}
          {renderInputField({
            label: 'Título do Torneio',
            name: 'titulo',
            placeholder: 'Ex: Torneio de Matemática 2026',
            icon: Trophy,
            required: true,
          })}

          {/* Slug (apenas criação) */}
          {mode === 'create' && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                URL Amigável (Slug)
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Link size={18} />
                </div>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleFieldChange('slug', e.target.value)}
                  placeholder="torneio-de-matematica-2026"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                />
              </div>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
                Gerado automaticamente, mas pode ser editado
              </p>
            </div>
          )}

          {/* ── TIPO DE TORNEIO ────────────────────────────────────────────────── */}
          <div className="pt-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tipo de Torneio <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'generico', label: 'Genérico', desc: 'Multidisciplinar', icon: Globe },
                { value: 'especifico', label: 'Específico', desc: 'Uma disciplina', icon: BookOpen },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.tipo_torneio === option.value
                      ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isLoading || isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="tipo_torneio"
                    value={option.value}
                    checked={formData.tipo_torneio === option.value}
                    onChange={(e) => {
                      handleFieldChange('tipo_torneio', e.target.value);
                      // Reset disciplina ao trocar tipo
                      if (e.target.value === 'generico') {
                        handleFieldChange('disciplina_especifica', '');
                      }
                    }}
                    disabled={isLoading || isReadOnly}
                    className="w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <option.icon size={16} className="text-blue-600 flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-800">{option.label}</p>
                    </div>
                    <p className="text-xs text-gray-400 ml-6">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── DISCIPLINA ESPECÍFICA (Apenas se específico) ────────────────────── */}
          {formData.tipo_torneio === 'especifico' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700">
                Disciplina <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <BookOpen size={18} />
                </div>
                <select
                  value={formData.disciplina_especifica}
                  onChange={(e) => handleFieldChange('disciplina_especifica', e.target.value)}
                  disabled={isLoading || isReadOnly}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none transition-all duration-200 cursor-pointer
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed hover:border-gray-300"
                >
                  <option value="">Selecione uma disciplina...</option>
                  {DISCIPLINAS_DISPONIVEIS.map((disciplina) => (
                    <option key={disciplina.value} value={disciplina.value}>
                      {disciplina.label}
                    </option>
                  ))}
                </select>
              </div>
              {!formData.disciplina_especifica && formData.tipo_torneio === 'especifico' && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Selecione uma disciplina para torneios específicos
                </p>
              )}
            </div>
          )}

          {/* Descrição */}
          {renderInputField({
            label: 'Descrição',
            name: 'descricao',
            type: 'textarea',
            placeholder: 'Descreva os detalhes, regras e premiações do torneio...',
            icon: FileText,
            rows: 3,
            required: true,
          })}

          {/* Datas lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderInputField({
              label: 'Data de Início',
              name: 'inicia_em',
              type: 'datetime-local',
              icon: Calendar,
              required: true,
              min: mode === 'create' ? minDateTime : undefined,
            })}
            {renderInputField({
              label: 'Data de Término',
              name: 'termina_em',
              type: 'datetime-local',
              icon: Clock,
              required: true,
              min: formData.inicia_em || minDateTime,
            })}
          </div>

          {/* Status com indicadores visuais */}
          {renderStatusSelect()}

          {/* Checkbox público estilizado */}
          <div className="pt-2">
            <label className={`flex items-start gap-3 p-4 rounded-xl border border-blue-100 cursor-pointer transition-all hover:shadow-sm ${
              formData.público
                ? 'bg-gradient-to-br from-blue-50/40 to-indigo-50/30'
                : 'bg-gray-50'
            }`}>
              <input
                type="checkbox"
                checked={formData.público}
                onChange={(e) => handleFieldChange('público', e.target.checked)}
                disabled={isLoading || isReadOnly}
                className="mt-0.5 focus:ring-2 focus:ring-blue-500/30"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">
                    Torneio Público
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visível para todos os usuários da plataforma. Torneios privados exigem convite.
                </p>
              </div>
              {formData.público && (
                <CheckCircle2 size={18} className="text-blue-500" />
              )}
            </label>
          </div>

          {/* ── Seleção de Blocos de Questões ─────────────────────────────── */}
          <div className="pt-2 space-y-2 border border-amber-200 bg-amber-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-amber-600" />
              <span className="text-sm font-semibold text-gray-700">Blocos de Questões</span>
              {blocosAssociados.length > 0 && (
                <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  {blocosAssociados.length} selecionado(s)
                </span>
              )}
            </div>
            
            {/* Requisitos */}
            <div className="bg-white rounded-lg p-2.5 text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Mínimo 5 questões por bloco</span>
              </div>
              {formData.tipo_torneio === 'generico' && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Todos os 3 tipos de disciplinas (Matemática, Inglês, Programação)</span>
                </div>
              )}
              {formData.tipo_torneio === 'especifico' && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Apenas blocos de {formData.disciplina_especifica}</span>
                </div>
              )}
            </div>

            {blocoError && (
              <div className="flex items-center gap-2 text-rose-600 text-xs bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
                <AlertCircle size={13} /> {blocoError}
              </div>
            )}

            {loadingBlocos ? (
              <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                <Loader2 size={14} className="animate-spin" /> Carregando blocos...
              </div>
            ) : blocosFiltrados.length === 0 ? (
              <div className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
                {formData.tipo_torneio === 'especifico' && formData.disciplina_especifica
                  ? `Nenhum bloco publicado de ${formData.disciplina_especifica} com mínimo 5 questões`
                  : 'Nenhum bloco publicado disponível com mínimo 5 questões'}
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {blocosFiltrados.map(bloco => {
                  const selecionado = blocosAssociados.includes(bloco.id);
                  return (
                    <label
                      key={bloco.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selecionado
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      } ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selecionado}
                        disabled={isLoading || isReadOnly}
                        onChange={() => handleToggleBloco(bloco.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{bloco.titulo}</p>
                        <p className="text-xs text-gray-400">
                          {bloco.disciplina} · {bloco.dificuldade} · {bloco.total_questoes ?? 0} questões
                        </p>
                      </div>
                      {selecionado && <CheckCircle2 size={16} className="text-indigo-500 flex-shrink-0" />}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer com botões e spinner */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end flex-shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || isReadOnly}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 shadow-md shadow-blue-200 flex items-center justify-center gap-2 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processando...</span>
              </>
            ) : mode === 'create' ? (
              'Criar Torneio'
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </>
  );
}

TournamentForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  initialData: PropTypes.shape({
    id: PropTypes.number,
    titulo: PropTypes.string,
    descricao: PropTypes.string,
    inicia_em: PropTypes.string,
    termina_em: PropTypes.string,
    status: PropTypes.string,
    público: PropTypes.bool,
    slug: PropTypes.string,
    tipo_torneio: PropTypes.oneOf(['generico', 'especifico']),
    disciplina_especifica: PropTypes.string,
  }),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool,
};