import React, { useState, useEffect } from 'react';

const TableModal = ({ mode, item, tableInfo, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(item ? { ...item } : {});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    useEffect(() => {
        setFormData(item ? { ...item } : {});
    }, [item]);

    const validateForm = () => {
        const requiredFields = tableInfo.fields.filter(f => f.required);
        for (const field of requiredFields) {
            if (!formData[field.name] || formData[field.name].trim() === '') {
                setError(`${field.label} é obrigatório`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            setError('Erro ao processar requisição');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getModalTitle = () => {
        switch (mode) {
            case 'create': return `Adicionar novo(a) ${tableInfo.title.slice(0, -1)}`;
            case 'edit': return `Editar ${tableInfo.title.slice(0, -1)}`;
            case 'delete': return 'Confirmar Exclusão';
            default: return 'Modal';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b px-6 py-4 sticky top-0 bg-white">
                    <h3 className="text-xl font-bold">{getModalTitle()}</h3>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {mode === 'delete' ? (
                        <div>
                            <p className="text-gray-700 mb-4">
                                Tem certeza que deseja deletar este registro?
                            </p>
                            <p className="text-red-600 text-sm">
                                Esta ação não pode ser desfeita.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} id="tableForm">
                            {tableInfo.fields.map(field => (
                                <div key={field.name} className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Digite ${field.label.toLowerCase()}`}
                                            rows="3"
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Selecione uma opção</option>
                                            {field.options.map(opt => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Digite ${field.label.toLowerCase()}`}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                                    {error}
                                </div>
                            )}
                        </form>
                    )}

                    {/* Error for delete mode */}
                    {mode === 'delete' && error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={mode === 'delete' ? handleSubmit : undefined}
                        type={mode === 'delete' ? 'button' : 'submit'}
                        form={mode === 'delete' ? undefined : 'tableForm'}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-white font-semibold transition disabled:opacity-50 ${
                            mode === 'delete'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Processando...' : mode === 'create' ? 'Criar' : mode === 'edit' ? 'Atualizar' : 'Deletar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableModal;
