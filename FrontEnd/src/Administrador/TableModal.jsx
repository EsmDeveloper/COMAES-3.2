import React, { useState, useEffect, useRef } from 'react';
import { validateNome, validateEmail, validatePassword } from '../utils/validators.js';
import { Plus, Edit, Trash2, AlertCircle, X, Save } from 'lucide-react';

const TableModal = ({ mode, item, tableInfo, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(item ? { ...item } : {});
    const originalDataRef = useRef(item ? { ...item } : {}); // snapshot dos dados originais para comparação
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Identifica se a tabela é torneio
    const isTorneio = tableInfo?.title === 'Torneios' || tableInfo?.tableName === 'torneio';

    const getStatusOptions = (field) => {
        return field.options || [];
    };

    // Função para gerar slug a partir do título
    const generateSlug = (text) => {
        if (!text) return '';
        return text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 120);
    };

    // Efeito para atualizar slug automaticamente quando o título mudar (apenas no modo criação)
    useEffect(() => {
        if (isTorneio && mode === 'create' && formData.titulo) {
            const newSlug = generateSlug(formData.titulo);
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    }, [formData.titulo, isTorneio, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    useEffect(() => {
        const newData = item ? { ...item } : {};
        setFormData(newData);
        originalDataRef.current = newData; // atualiza o snapshot quando o item muda
    }, [item]);

    const validateUserFields = () => {
        const errors = {};
        let isValid = true;
        
        if (formData.nome) {
            const nomeResult = validateNome(formData.nome);
            if (!nomeResult.valid) {
                errors.nome = nomeResult.error;
                isValid = false;
            }
        }
        
        if (formData.email) {
            const emailResult = validateEmail(formData.email);
            if (!emailResult.valid) {
                errors.email = emailResult.error;
                isValid = false;
            }
        }
        
        if (formData.password && mode !== 'edit') {
            const passwordResult = validatePassword(formData.password);
            if (!passwordResult.valid) {
                errors.password = passwordResult.error;
                isValid = false;
            }
        }
        
        setFieldErrors(errors);
        return isValid;
    };

    const validateForm = () => {
        if (tableInfo?.tableName === 'user' || tableInfo?.tableName === 'users') {
            if (!validateUserFields()) {
                return false;
            }
        }

        // Validar datas de torneio no frontend
        // Em modo de edição, só valida datas que foram efetivamente alteradas pelo usuário
        if (isTorneio) {
            // Tolerância de 2 horas para evitar problemas de timezone
            const TOLERANCE_MS = 2 * 60 * 60 * 1000;
            const originalData = originalDataRef.current;
            
            // Converte datetime-local string para Date UTC
            const parseLocalDate = (str) => {
                if (!str) return null;
                // datetime-local format: "YYYY-MM-DDTHH:MM"
                // Interpreta como hora local do usuário
                const normalized = str.includes(':') && str.split(':').length === 2 ? `${str}:00` : str;
                return new Date(normalized);
            };

            // Normaliza datas para comparação (formato datetime-local)
            const normalizeForComparison = (date) => {
                if (!date) return null;
                if (typeof date === 'string') {
                    // Remove segundos e milissegundos
                    return date.slice(0, 16);
                }
                if (date instanceof Date && !isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                }
                return null;
            };

            // Tolerância de 2 horas para evitar problemas de timezone
            const nowWithTolerance = new Date(Date.now() - TOLERANCE_MS);

            const inicioOriginal = normalizeForComparison(originalData.inicia_em);
            const fimOriginal = normalizeForComparison(originalData.termina_em);
            const inicioAtual = normalizeForComparison(formData.inicia_em);
            const fimAtual = normalizeForComparison(formData.termina_em);

            const inicioAlterado = inicioAtual !== inicioOriginal;
            const fimAlterado = fimAtual !== fimOriginal;

            // Validar data de início (apenas se for criação ou se foi alterada)
            if (formData.inicia_em && (mode === 'create' || inicioAlterado)) {
                const inicioDate = parseLocalDate(formData.inicia_em);
                if (inicioDate < nowWithTolerance) {
                    setError('A data de início não pode ser anterior ao horário atual.');
                    setFieldErrors(prev => ({ ...prev, inicia_em: 'Data de início inválida.' }));
                    return false;
                }
            }

            // Validar data de término (apenas se for criação ou se foi alterada)
            if (formData.termina_em && (mode === 'create' || fimAlterado)) {
                const fimDate = parseLocalDate(formData.termina_em);
                if (fimDate < nowWithTolerance) {
                    setError('A data de término não pode ser anterior ao horário atual.');
                    setFieldErrors(prev => ({ ...prev, termina_em: 'Data de término inválida.' }));
                    return false;
                }
            }

            // Validar que término > início (sempre, independente de alteração)
            if (formData.inicia_em && formData.termina_em) {
                const inicioDate = parseLocalDate(formData.inicia_em);
                const fimDate = parseLocalDate(formData.termina_em);
                if (fimDate <= inicioDate) {
                    setError('A data de término deve ser posterior à data de início.');
                    setFieldErrors(prev => ({ ...prev, termina_em: 'Deve ser posterior ao início.' }));
                    return false;
                }
            }

            // Validar máximo de participantes
            if (formData.maximo_participantes !== undefined && formData.maximo_participantes !== null && formData.maximo_participantes !== '') {
                const maxPart = Number(formData.maximo_participantes);
                if (isNaN(maxPart) || maxPart < 1 || !Number.isInteger(maxPart)) {
                    setError('O máximo de participantes deve ser um número inteiro maior que zero.');
                    setFieldErrors(prev => ({ ...prev, maximo_participantes: 'Deve ser um número inteiro maior que zero.' }));
                    return false;
                }
            }
        }

        const requiredFields = tableInfo?.fields?.filter(f => f.required) || [];
        for (const field of requiredFields) {
            if (!formData[field.name] || (typeof formData[field.name] === 'string' && formData[field.name].trim() === '')) {
                setError(`${field.label} é obrigatório`);
                return false;
            }
        }
        return true;
    };

    const normalizeFormData = (data) => {
        const normalized = { ...data };

        tableInfo?.fields?.forEach(field => {
            const value = normalized[field.name];

            if (field.type === 'number') {
                if (value === '' || value === null || value === undefined) {
                    delete normalized[field.name];
                } else if (typeof value === 'string') {
                    const parsed = Number(value);
                    if (!Number.isNaN(parsed)) {
                        normalized[field.name] = parsed;
                    }
                }
            }

            if (field.type === 'datetime-local' && (value === '' || value === null || value === undefined)) {
                delete normalized[field.name];
            }

            if (field.type === 'checkbox') {
                normalized[field.name] = Boolean(value);
            }
        });

        return normalized;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Exclusão não precisa de validação de formulário
        if (mode !== 'delete' && !validateForm()) return;

        // Prepara os dados para envio
        let dataToSubmit = normalizeFormData(formData);
        
        // Remove campos que devem ser preenchidos automaticamente pelo backend
        if (isTorneio) {
            delete dataToSubmit.criado_por;   // o backend define baseado no token JWT
            // Garante que o slug existe (se ainda estiver vazio, gera a partir do título)
            if (!dataToSubmit.slug && dataToSubmit.titulo) {
                dataToSubmit.slug = generateSlug(dataToSubmit.titulo);
            }
            // Converte datas datetime-local para ISO com offset da timezone local
            // Sem isso, o backend (Node/UTC) interpreta "2026-05-15T10:30" como UTC
            const toISOWithOffset = (str) => {
                if (!str) return str;
                const d = new Date(str);
                if (isNaN(d.getTime())) return str;
                const pad = (n) => String(n).padStart(2, '0');
                const offset = -d.getTimezoneOffset();
                const sign = offset >= 0 ? '+' : '-';
                const absOffset = Math.abs(offset);
                const hh = pad(Math.floor(absOffset / 60));
                const mm = pad(absOffset % 60);
                return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${hh}:${mm}`;
            };
            if (dataToSubmit.inicia_em) dataToSubmit.inicia_em = toISOWithOffset(dataToSubmit.inicia_em);
            if (dataToSubmit.termina_em) dataToSubmit.termina_em = toISOWithOffset(dataToSubmit.termina_em);
        }

        setLoading(true);
        try {
            await onSubmit(dataToSubmit);
        } catch (err) {
            setError('Erro ao processar requisição');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getModalTitle = () => {
        switch (mode) {
            case 'create': return `Adicionar novo(a) ${tableInfo?.title?.slice(0, -1) || 'registro'}`;
            case 'edit': return `Editar ${tableInfo?.title?.slice(0, -1) || 'registro'}`;
            case 'delete': return 'Confirmar Exclusão';
            default: return 'Modal';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 animate-modal-appear">
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-5 bg-gradient-to-r from-slate-50 to-blue-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            {mode === 'create' && <Plus className="w-6 h-6 text-green-500" />}
                            {mode === 'edit' && <Edit className="w-6 h-6 text-blue-500" />}
                            {mode === 'delete' && <Trash2 className="w-6 h-6 text-red-500" />}
                            {getModalTitle()}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                    {mode === 'delete' ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="text-red-800 font-semibold">Atenção: Ação irreversível</p>
                                    <p className="text-red-700 text-sm">Esta operação não pode ser desfeita.</p>
                                </div>
                            </div>
                            <p className="text-slate-600">
                                Tem certeza que deseja excluir este registro permanentemente?
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} id="tableForm" className="space-y-6">
                            {tableInfo?.fields?.map(field => (
                                <div key={field.name} className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        {field.label}
                                        {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md resize-vertical min-h-[100px] ${
                                                fieldErrors[field.name] ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                                            }`}
                                            placeholder={`Digite ${field.label.toLowerCase()}`}
                                            rows="4"
                                            disabled={field.readOnly}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                                                fieldErrors[field.name] ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                                            }`}
                                            disabled={field.readOnly}
                                        >
                                            <option value="">Selecione uma opção</option>
                                            {getStatusOptions(field).map(opt => (
                                                <option key={opt} value={opt}>
                                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === 'checkbox' ? (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                name={field.name}
                                                checked={formData[field.name] || false}
                                                onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.checked }))}
                                                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-all duration-200"
                                                disabled={field.readOnly}
                                            />
                                            <span className="text-slate-600">{field.label}</span>
                                        </div>
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                                                fieldErrors[field.name] ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                                            }`}
                                            placeholder={`Digite ${field.label.toLowerCase()}`}
                                            disabled={field.readOnly}
                                            {...(field.type === 'number' && isTorneio && field.name === 'maximo_participantes'
                                                ? { min: '1', step: '1' }
                                                : {})}
                                        />
                                    )}
                                    {fieldErrors[field.name] && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {fieldErrors[field.name]}
                                        </p>
                                    )}
                                </div>
                            ))}

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Erro de validação</p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={mode === 'delete' ? handleSubmit : undefined}
                        type={mode === 'delete' ? 'button' : 'submit'}
                        form={mode === 'delete' ? undefined : 'tableForm'}
                        disabled={loading}
                        className={`px-6 py-2 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                            mode === 'delete'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Processando...</span>
                            </>
                        ) : mode === 'create' ? (
                            <>
                                <Plus className="w-4 h-4" />
                                <span>Criar</span>
                            </>
                        ) : mode === 'edit' ? (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Atualizar</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                <span>Deletar</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableModal;