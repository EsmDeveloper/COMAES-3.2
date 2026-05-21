import React, { useState, useEffect, useMemo, useCallback } from 'react';
import adminService from './adminService';
import TableModal from './TableModal';
import UserModal from './UserModal';
import { useAuth } from '../context/AuthContext';
import { Users, Trophy, Newspaper, Ticket, Briefcase, HelpCircle, Calculator, Code, Globe, FileText, Target, Bell, Award, Medal, Key, Settings } from 'lucide-react';

// shared static definitions used by both dashboard and table manager
export const STATIC_TABLE_DEFS = {
    user: {
        title: 'Usuários',
        icon: Users,
        columns: ['id', 'nome', 'email', 'telefone', 'isAdmin'],
        displayColumns: ['ID', 'Nome', 'Email', 'Telefone', 'Admin'],
        fields: [
            { name: 'nome',       label: 'Nome',              type: 'text',     required: true },
            { name: 'email',      label: 'Email',             type: 'email',    required: true },
            { name: 'telefone',   label: 'Telefone',          type: 'text',     required: true },
            { name: 'nascimento', label: 'Data de Nascimento',type: 'date',     required: true },
            { name: 'sexo',       label: 'Sexo',              type: 'select',   options: ['Masculino', 'Feminino'], required: true },
            { name: 'escola',     label: 'Escola',            type: 'text' },
            { name: 'biografia',  label: 'Biografia',         type: 'textarea' },
        ]
    },
    torneio: {
        tableName: 'torneio',
        title: 'Torneios',
        icon: Trophy,
        columns: ['id', 'titulo', 'slug', 'status'],
        displayColumns: ['ID', 'Título', 'Slug', 'Status'],
        fields: [
            { name: 'titulo', label: 'Título', type: 'text', required: true },
            { name: 'slug', label: 'Slug', type: 'text', readOnly: true },
            { name: 'descricao', label: 'Descrição', type: 'textarea' },
            { name: 'inicia_em', label: 'Data de Início', type: 'datetime-local' },
            { name: 'termina_em', label: 'Data de Término', type: 'datetime-local' },
            { name: 'maximo_participantes', label: 'Máximo de Participantes', type: 'number' },
            { name: 'status', label: 'Status', type: 'select', options: ['rascunho', 'agendado', 'ativo', 'encerrando', 'finalizado', 'cancelado'] },
            { name: 'publico', label: 'Público', type: 'checkbox' },
            { name: 'criado_por', label: 'Criado por', type: 'number', readOnly: true }
        ]
    },
    noticia: {
        title: 'Notícias',
        icon: Newspaper,
        columns: ['id', 'titulo', 'autor_id', 'publicado_em'],
        displayColumns: ['ID', 'Título', 'Autor', 'Publicado em'],
        fields: [
            { name: 'titulo', label: 'Título', type: 'text', required: true },
            { name: 'conteudo', label: 'Conteúdo', type: 'textarea', required: true },
            { name: 'autor_id', label: 'Autor ID', type: 'number', required: true },
            { name: 'publicado', label: 'Publicado', type: 'checkbox' },
            { name: 'publicado_em', label: 'Data de Publicação', type: 'datetime-local' },
            { name: 'tags', label: 'Tags', type: 'text' }
        ]
    },
    ticketsuporte: {
        title: 'Suporte',
        icon: Ticket,
        columns: ['id', 'titulo', 'status', 'prioridade'],
        displayColumns: ['ID', 'Título', 'Status', 'Prioridade'],
        fields: [
            { name: 'titulo', label: 'Título', type: 'text', required: true },
            { name: 'descricao', label: 'Descrição', type: 'textarea', required: true },
            { name: 'status', label: 'Status', type: 'select', options: ['aberto', 'em_andamento', 'resolvido', 'fechado'] },
            { name: 'prioridade', label: 'Prioridade', type: 'select', options: ['baixa', 'media', 'alta', 'urgente'] },
            { name: 'usuario_id', label: 'Usuário ID', type: 'number', required: true }
        ]
    },
    funcao: {
        title: 'Funções',
        icon: Briefcase,
        columns: ['id', 'nome', 'descricao'],
        displayColumns: ['ID', 'Nome', 'Descrição'],
        fields: [
            { name: 'nome', label: 'Nome', type: 'text', required: true },
            { name: 'descricao', label: 'Descrição', type: 'textarea' }
        ]
    },
    redefinicaosenha: {
        title: 'Redefinições de Senha',
        icon: Key,
        columns: ['id', 'usuario_id', 'token', 'expira_em'],
        displayColumns: ['ID', 'Usuário', 'Token', 'Expira em'],
        fields: [
            { name: 'usuario_id', label: 'Usuário ID', type: 'number', required: true },
            { name: 'token', label: 'Token', type: 'text', required: true },
            { name: 'expira_em', label: 'Expira em', type: 'datetime-local', required: true },
            { name: 'usado', label: 'Usado', type: 'checkbox' }
        ]
    },
    configuracaousuario: {
        title: 'Configurações de Usuário',
        icon: Settings,
        columns: ['id', 'usuario_id', 'chave', 'valor'],
        displayColumns: ['ID', 'Usuário', 'Chave', 'Valor'],
        fields: [
            { name: 'usuario_id', label: 'Usuário ID', type: 'number', required: true },
            { name: 'chave', label: 'Chave', type: 'text', required: true },
            { name: 'valor', label: 'Valor', type: 'text', required: true }
        ]
    },
    pergunta: {
        title: 'Perguntas',
        icon: HelpCircle,
        columns: ['id', 'titulo', 'tipo', 'dificuldade'],
        displayColumns: ['ID', 'Título', 'Tipo', 'Dificuldade'],
        fields: [
            { name: 'titulo', label: 'Título', type: 'text', required: true },
            { name: 'descricao', label: 'Descrição', type: 'textarea' },
            { name: 'tipo', label: 'Tipo', type: 'select', options: ['matematica', 'programacao', 'ingles'] },
            { name: 'dificuldade', label: 'Dificuldade', type: 'select', options: ['facil', 'medio', 'dificil'] },
            { name: 'pontuacao', label: 'Pontuação', type: 'number' },
            { name: 'tempo_limite', label: 'Tempo Limite (min)', type: 'number' }
        ]
    },
    questaomatematica: {
        title: 'Questões de Matemática',
        icon: Calculator,
        columns: ['id', 'pergunta_id', 'enunciado', 'resposta_correta'],
        displayColumns: ['ID', 'Pergunta', 'Enunciado', 'Resposta Correta'],
        fields: [
            { name: 'pergunta_id', label: 'Pergunta ID', type: 'number', required: true },
            { name: 'enunciado', label: 'Enunciado', type: 'textarea', required: true },
            { name: 'resposta_correta', label: 'Resposta Correta', type: 'text', required: true },
            { name: 'opcoes', label: 'Opções (JSON)', type: 'textarea' },
            { name: 'dicas', label: 'Dicas', type: 'textarea' }
        ]
    },
    questoes_programacao: {
        title: 'Questões de Programação',
        icon: Code,
        columns: ['id', 'pergunta_id', 'enunciado', 'linguagem'],
        displayColumns: ['ID', 'Pergunta', 'Enunciado', 'Linguagem'],
        fields: [
            { name: 'pergunta_id', label: 'Pergunta ID', type: 'number', required: true },
            { name: 'enunciado', label: 'Enunciado', type: 'textarea', required: true },
            { name: 'linguagem', label: 'Linguagem', type: 'select', options: ['javascript', 'python', 'java', 'cpp'] },
            { name: 'codigo_inicial', label: 'Código Inicial', type: 'textarea' },
            { name: 'testes', label: 'Testes (JSON)', type: 'textarea' },
            { name: 'solucao', label: 'Solução', type: 'textarea' }
        ]
    },
    questaoingles: {
        title: 'Questões de Inglês',
        icon: Globe,
        columns: ['id', 'pergunta_id', 'enunciado', 'tipo_questao'],
        displayColumns: ['ID', 'Pergunta', 'Enunciado', 'Tipo'],
        fields: [
            { name: 'pergunta_id', label: 'Pergunta ID', type: 'number', required: true },
            { name: 'enunciado', label: 'Enunciado', type: 'textarea', required: true },
            { name: 'tipo_questao', label: 'Tipo de Questão', type: 'select', options: ['tradução', 'gramatica', 'vocabulário', 'compreensão'] },
            { name: 'resposta_correta', label: 'Resposta Correta', type: 'text', required: true },
            { name: 'opcoes', label: 'Opções (JSON)', type: 'textarea' },
            { name: 'explicacao', label: 'Explicação', type: 'textarea' }
        ]
    },
    tentativateste: {
        title: 'Tentativas de Teste',
        icon: FileText,
        columns: ['id', 'usuario_id', 'pergunta_id', 'pontuacao'],
        displayColumns: ['ID', 'Usuário', 'Pergunta', 'Pontuação'],
        fields: [
            { name: 'usuario_id', label: 'Usuário ID', type: 'number', required: true },
            { name: 'pergunta_id', label: 'Pergunta ID', type: 'number', required: true },
            { name: 'resposta', label: 'Resposta', type: 'textarea' },
            { name: 'pontuacao', label: 'Pontuação', type: 'number' },
            { name: 'tempo_gasto', label: 'Tempo Gasto (seg)', type: 'number' },
            { name: 'data_tentativa', label: 'Data da Tentativa', type: 'datetime-local' }
        ]
    },
    participante_torneio: {
        title: 'Participantes de Torneio',
        icon: Target,
        columns: ['id', 'usuario_id', 'torneio_id', 'pontuacao_total'],
        displayColumns: ['ID', 'Usuário', 'Torneio', 'Pontuação Total'],
        fields: [
            { name: 'usuario_id', label: 'Usuário ID', type: 'number', required: true },
            { name: 'torneio_id', label: 'Torneio ID', type: 'number', required: true },
            { name: 'pontuacao_total', label: 'Pontuação Total', type: 'number' },
            { name: 'posicao_final', label: 'Posição Final', type: 'number' },
            { name: 'data_inscricao', label: 'Data de Inscrição', type: 'datetime-local' },
            { name: 'status', label: 'Status', type: 'select', options: ['inscrito', 'ativo', 'desclassificado', 'finalizado'] }
        ]
    },
    notificacao: {
        title: 'Notificações',
        icon: Bell,
        columns: ['id', 'usuario_id', 'titulo', 'lido'],
        displayColumns: ['ID', 'Usuário', 'Título', 'Lido'],
        fields: [
            { name: 'usuario_id', label: 'Usuário ID', type: 'number', required: true },
            { name: 'titulo', label: 'Título', type: 'text', required: true },
            { name: 'mensagem', label: 'Mensagem', type: 'textarea', required: true },
            { name: 'tipo', label: 'Tipo', type: 'select', options: ['geral', 'torneio', 'resultado', 'sistema'] },
            { name: 'lido', label: 'Lido', type: 'checkbox' },
            { name: 'data_envio', label: 'Data de Envio', type: 'datetime-local' }
        ]
    },
    conquista: {
        title: 'Conquistas',
        icon: Award,
        columns: ['id', 'nome', 'descricao', 'pontuacao'],
        displayColumns: ['ID', 'Nome', 'Descrição', 'Pontuação'],
        fields: [
            { name: 'nome', label: 'Nome', type: 'text', required: true },
            { name: 'descricao', label: 'Descrição', type: 'textarea', required: true },
            { name: 'icone', label: 'Ícone', type: 'text' },
            { name: 'pontuacao', label: 'Pontuação', type: 'number', required: true },
            { name: 'categoria', label: 'Categoria', type: 'select', options: ['participacao', 'desempenho', 'conquista', 'especial'] },
            { name: 'criterios', label: 'Critérios (JSON)', type: 'textarea' }
        ]
    },
    conquistausuario: {
        title: 'Conquistas de Usuário',
        icon: Medal,
        columns: ['id', 'usuario_id', 'conquista_id', 'data_conquista'],
        displayColumns: ['ID', 'Usuário', 'Conquista', 'Data'],
        fields: [
            { name: 'usuario_id', label: 'Usuário ID', type: 'number', required: true },
            { name: 'conquista_id', label: 'Conquista ID', type: 'number', required: true },
            { name: 'data_conquista', label: 'Data da Conquista', type: 'datetime-local', required: true },
            { name: 'progresso', label: 'Progresso', type: 'number' }
        ]
    }
    // ... outros modelos podem ser adicionados conforme necessário
};

const TableManager = ({ table }) => {
    const { token, user } = useAuth();
    const services = useMemo(() => adminService(token), [token]);
    const tableService = useMemo(() => services.getService(table), [services, table]);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tableInfo, setTableInfo] = useState(null);
    const pkField = useMemo(() => {
        if (!tableInfo || !tableInfo.columns) return 'id';
        return tableInfo.columns.includes('id') ? 'id' : tableInfo.columns[0];
    }, [tableInfo]);

    const buildTableInfoFromData = (rows) => {
        const first = Array.isArray(rows) && rows.length > 0 ? rows[0] : {};
        const cols = Object.keys(first);
        const displayColumns = cols.map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        const fields = cols.filter(c => c !== 'id').map(c => {
            const sample = first[c];
            let type = 'text';
            if (typeof sample === 'number') type = 'number';
            else if (typeof sample === 'string') {
                if (/^\d{4}-\d{2}-\d{2}T?/.test(sample)) type = 'datetime-local';
                else if (sample.length > 200) type = 'textarea';
            }
            return { name: c, label: c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), type };
        });

        return {
            tableName: table,
            title: table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            columns: cols,
            displayColumns,
            fields
        };
    };

    const fetchData = useCallback(async () => {
        if (!tableService) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await tableService.getAll();
            const rows = Array.isArray(result) ? result : (result ? [result] : []);
            setData(rows);
            setLoading(false);

            if (STATIC_TABLE_DEFS[table]) {
                setTableInfo(STATIC_TABLE_DEFS[table]);
            } else {
                const built = buildTableInfoFromData(rows);
                setTableInfo(built);
            }
        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message;
            setError(`Erro ao carregar dados (${status || 'Network Error'}): ${message}`);
            console.error('Fetch error:', err);
            setLoading(false);
        }
    }, [tableService, table]);

    useEffect(() => {
        setShowModal(false);
        setSelectedItem(null);
        setModalMode('create');
        fetchData();
    }, [table, fetchData]);

    // CORREÇÃO: definir valores padrão para torneio
    const handleAdd = () => {
        setModalMode('create');
        if (table === 'torneio') {
            setSelectedItem({ status: 'agendado', publico: true });
        } else if (table === 'noticia') {
            setSelectedItem({ autor_id: user?.id || '', publicado: true, publicado_em: new Date().toISOString().slice(0, 16), tags: '' });
        } else if (table === 'notificacao') {
            setSelectedItem({ lido: false, tipo: 'geral', conteudo: '{"titulo":"","mensagem":""}' });
        } else {
            setSelectedItem(null);
        }
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setModalMode('edit');
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleDelete = (item) => {
        setModalMode('delete');
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    const handleModalSubmit = async (formData) => {
        if (!tableService) return;
        const isUserTable = table === 'user' || table === 'users';
        try {
            if (modalMode === 'create') {
                await tableService.create(formData);
            } else if (modalMode === 'edit') {
                const idValue = selectedItem ? selectedItem[pkField] : null;
                if (!idValue) { setError('Identificador inválido para operação'); return; }
                await tableService.update(idValue, formData);
            } else if (modalMode === 'delete') {
                const idValue = selectedItem ? selectedItem[pkField] : null;
                if (!idValue) { setError('Identificador inválido para operação'); return; }
                await tableService.delete(idValue);
            } else if (modalMode === 'reset-password' && isUserTable) {
                const idValue = selectedItem ? selectedItem[pkField] : null;
                if (!idValue) { setError('Identificador inválido para operação'); return; }
                const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
                const res = await fetch(`${apiBase}/api/admin/users/${idValue}/reset-password`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    const body = await res.json();
                    const err = new Error(body.message || 'Erro ao redefinir senha');
                    err.response = { data: body };
                    throw err;
                }
            } else if (modalMode === 'toggle-admin' && isUserTable) {
                const idValue = selectedItem ? selectedItem[pkField] : null;
                if (!idValue) { setError('Identificador inválido para operação'); return; }
                const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
                const res = await fetch(`${apiBase}/api/admin/users/${idValue}/toggle-admin`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) {
                    const body = await res.json();
                    const err = new Error(body.message || 'Erro ao alterar privilégios');
                    err.response = { data: body };
                    throw err;
                }
            }
            handleModalClose();
            setSuccess('Operação realizada com sucesso');
            setTimeout(() => setSuccess(''), 5000);
            await fetchData();
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || err.message;
            // Re-throw so UserModal can handle fieldErrors
            if (err.response?.data?.fieldErrors) throw err;
            setError(`Erro ao processar operação: ${message}`);
            console.error('handleModalSubmit error', err);
        }
    };

    if (!tableService && table) {
        return <div className="p-8 text-center text-gray-500">Tabela não disponível. Selecione outro item no menu.</div>;
    }

    if (loading && (!tableInfo || data.length === 0)) {
        return <div className="p-8 text-center">Carregando...</div>;
    }

    const info = tableInfo || { title: 'Tabela', columns: [], displayColumns: [], fields: [] };

    const filteredData = data.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 transform transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">
                            Gerenciamento de {info.title}
                        </h2>
                        <p className="text-slate-600">
                            Gerencie registros, visualize dados e execute operações CRUD
                        </p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                    >
                        <span className="text-lg">+</span>
                        <span>Adicionar {info.title.slice(0, -1)}</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            🔍 Buscar registros
                        </label>
                        <input
                            type="text"
                            placeholder={`Buscar em ${info.title.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                        />
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-sm animate-fade-in flex items-center gap-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <div>
                        <p className="font-semibold">Sucesso!</p>
                        <p className="text-sm">{success}</p>
                    </div>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm animate-fade-in flex items-center gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <div>
                        <p className="font-semibold">Erro</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <div className="flex items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-slate-600 font-medium">Carregando dados...</p>
                    </div>
                </div>
            )}

            {/* Data Table */}
            {!loading && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                                <tr>
                                    {info.displayColumns.map((col, idx) => (
                                        <th key={idx} className="px-6 py-4 text-left font-semibold text-slate-700 whitespace-nowrap border-b border-slate-200">
                                            {col}
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-right font-semibold text-slate-700 whitespace-nowrap border-b border-slate-200">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={info.displayColumns.length + 1} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="text-4xl">📭</span>
                                                <div>
                                                    <p className="text-slate-500 font-medium">Nenhum registro encontrado</p>
                                                    <p className="text-slate-400 text-sm">
                                                        {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece adicionando um novo registro'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, index) => (
                                        <tr key={item.id || JSON.stringify(item)} className="hover:bg-slate-50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                            {info.columns.map((col, idx) => (
                                                <td key={idx} className="px-6 py-4 text-sm text-slate-700 align-top">
                                                    <div className="max-w-xs truncate" title={String(item[col] ?? 'N/A')}>
                                                        {String(item[col] ?? 'N/A')}
                                                    </div>
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium"
                                                    >
                                                        <span>✏️</span>
                                                        <span className="hidden sm:inline">Editar</span>
                                                    </button>
                                                    {(table === 'user' || table === 'users') && (
                                                        <>
                                                            <button
                                                                onClick={() => { setModalMode('reset-password'); setSelectedItem(item); setShowModal(true); }}
                                                                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium"
                                                                title="Redefinir senha"
                                                            >
                                                                <span>🔑</span>
                                                                <span className="hidden sm:inline">Senha</span>
                                                            </button>
                                                            {user?.isAdmin && String(user?.id) !== String(item.id) && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!window.confirm(`${item.isAdmin ? 'Remover' : 'Conceder'} privilégios de administrador para ${item.nome}?`)) return;
                                                                        setModalMode('toggle-admin');
                                                                        setSelectedItem(item);
                                                                        try { await handleModalSubmit({}); }
                                                                        catch { /* error shown in table */ }
                                                                    }}
                                                                    className={`${item.isAdmin ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'} text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium`}
                                                                    title={item.isAdmin ? 'Remover admin' : 'Tornar admin'}
                                                                >
                                                                    <span>{item.isAdmin ? '👑' : '⬆️'}</span>
                                                                    <span className="hidden sm:inline">{item.isAdmin ? 'Remover Admin' : 'Tornar Admin'}</span>
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        disabled={String(user?.id) === String(item.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title={String(user?.id) === String(item.id) ? 'Não pode excluir a própria conta' : 'Excluir'}
                                                    >
                                                        <span>🗑️</span>
                                                        <span className="hidden sm:inline">Excluir</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (table === 'user' || table === 'users') ? (
                <UserModal
                    mode={modalMode}
                    item={selectedItem}
                    currentUser={user}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                />
            ) : showModal ? (
                <TableModal
                    mode={modalMode}
                    item={selectedItem}
                    tableInfo={tableInfo}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                />
            ) : null}
        </div>
    );
};

export default TableManager;