import React, { useState, useEffect, useMemo, useCallback } from 'react';
import adminService from './adminService';
import TableModal from './TableModal';
import { useAuth } from '../context/AuthContext';

const TableManager = ({ table }) => {
    const { token } = useAuth();
    const services = useMemo(() => adminService(token), [token]);
    const tableService = useMemo(() => services.getService(table), [services, table]);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tableInfo, setTableInfo] = useState(null);

    // Static table definitions - keys must match backend model names exactly
    const staticTableDefs = {
        users: {
            title: 'Usuários',
            columns: ['id', 'nome', 'email', 'telefone', 'isAdmin'],
            displayColumns: ['ID', 'Nome', 'Email', 'Telefone', 'Admin'],
            fields: [
                { name: 'nome', label: 'Nome', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'telefone', label: 'Telefone', type: 'text' },
                { name: 'nascimento', label: 'Data de Nascimento', type: 'date' },
                { name: 'sexo', label: 'Sexo', type: 'select', options: ['Masculino', 'Feminino'] },
                { name: 'escola', label: 'Escola', type: 'text' },
                { name: 'biografia', label: 'Biografia', type: 'textarea' },
                { name: 'isAdmin', label: 'Administrador', type: 'checkbox' }
            ]
        },
        torneos: {
            title: 'Torneios',
            columns: ['id', 'titulo', 'slug', 'status'],
            displayColumns: ['ID', 'Título', 'Slug', 'Status'],
            fields: [
                { name: 'titulo', label: 'Título', type: 'text', required: true },
                { name: 'slug', label: 'Slug', type: 'text' },
                { name: 'descricao', label: 'Descrição', type: 'textarea' },
                { name: 'inicia_em', label: 'Data de Início', type: 'datetime-local' },
                { name: 'termina_em', label: 'Data de Término', type: 'datetime-local' },
                { name: 'maximo_participantes', label: 'Máximo de Participantes', type: 'number' },
                { name: 'status', label: 'Status', type: 'select', options: ['rascunho', 'agendado', 'ativo', 'finalizado', 'cancelado'] },
                { name: 'publico', label: 'Público', type: 'checkbox' }
            ]
        },
        noticias: {
            title: 'Notícias',
            columns: ['id', 'titulo', 'slug', 'publicado_em'],
            displayColumns: ['ID', 'Título', 'Slug', 'Publicado em'],
            fields: [
                { name: 'titulo', label: 'Título', type: 'text', required: true },
                { name: 'slug', label: 'Slug', type: 'text', required: true },
                { name: 'resumo', label: 'Resumo', type: 'textarea' },
                { name: 'conteudo', label: 'Conteúdo', type: 'textarea', required: true },
                { name: 'autor_id', label: 'ID do Autor', type: 'number', required: true },
                { name: 'url_capa', label: 'URL da Capa', type: 'text' },
                { name: 'publicado_em', label: 'Data de Publicação', type: 'datetime-local' },
                { name: 'publicado', label: 'Publicado', type: 'checkbox' }
            ]
        },
        funcoes: {
            title: 'Funções',
            columns: ['id', 'nome'],
            displayColumns: ['ID', 'Nome'],
            fields: [
                { name: 'nome', label: 'Nome', type: 'text', required: true },
                { name: 'permissoes', label: 'Permissões (JSON)', type: 'textarea' }
            ]
        },
        tickets: {
            title: 'Tickets de Suporte',
            columns: ['id', 'assunto', 'status', 'prioridade'],
            displayColumns: ['ID', 'Assunto', 'Status', 'Prioridade'],
            fields: [
                { name: 'usuario_id', label: 'ID do Usuário', type: 'number' },
                { name: 'assunto', label: 'Assunto', type: 'text', required: true },
                { name: 'mensagem', label: 'Mensagem', type: 'textarea', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['aberto', 'pendente', 'fechado'] },
                { name: 'prioridade', label: 'Prioridade', type: 'select', options: ['baixa', 'media', 'alta'] },
                { name: 'atribuido_para', label: 'Atribuído Para (ID)', type: 'number' }
            ]
        },
        conquistas: {
            title: 'Conquistas',
            columns: ['id', 'nome'],
            displayColumns: ['ID', 'Nome'],
            fields: [
                { name: 'nome', label: 'Nome', type: 'text', required: true },
                { name: 'descricao', label: 'Descrição', type: 'textarea' },
                { name: 'criterios', label: 'Critérios (JSON)', type: 'textarea' },
                { name: 'url_icone', label: 'URL do Ícone', type: 'text' }
            ]
        },
        configuracoes_usuario: {
            title: 'Configurações de Usuário',
            columns: ['usuario_id'],
            displayColumns: ['ID Usuário'],
            fields: [
                { name: 'usuario_id', label: 'ID do Usuário', type: 'number', required: true },
                { name: 'preferencias', label: 'Preferências (JSON)', type: 'textarea' }
            ]
        },
        conquistas_usuario: {
            title: 'Conquistas de Usuário',
            columns: ['id', 'usuario_id', 'conquista_id'],
            displayColumns: ['ID', 'Usuário ID', 'Conquista ID'],
            fields: [
                { name: 'usuario_id', label: 'ID do Usuário', type: 'number', required: true },
                { name: 'conquista_id', label: 'ID da Conquista', type: 'number', required: true },
                { name: 'concedido_por', label: 'Concedido Por (ID)', type: 'number' }
            ]
        },
        notificacoes: {
            title: 'Notificações',
            columns: ['id', 'usuario_id', 'tipo', 'lido'],
            displayColumns: ['ID', 'Usuário ID', 'Tipo', 'Lido'],
            fields: [
                { name: 'usuario_id', label: 'ID do Usuário', type: 'number', required: true },
                { name: 'tipo', label: 'Tipo', type: 'text', required: true },
                { name: 'conteudo', label: 'Conteúdo (JSON)', type: 'textarea', required: true },
                { name: 'lido', label: 'Lido', type: 'checkbox' }
            ]
        },
        perguntas: {
            title: 'Perguntas',
            columns: ['id', 'texto_pergunta', 'tipo', 'pontos'],
            displayColumns: ['ID', 'Pergunta', 'Tipo', 'Pontos'],
            fields: [
                { name: 'ordem_indice', label: 'Ordem', type: 'number', required: true },
                { name: 'tipo', label: 'Tipo', type: 'select', options: ['matematica', 'ingles', 'programacao', 'multipla_escolha', 'texto'], required: true },
                { name: 'texto_pergunta', label: 'Texto da Pergunta', type: 'textarea', required: true },
                { name: 'opcao_a', label: 'Opção A', type: 'text' },
                { name: 'opcao_b', label: 'Opção B', type: 'text' },
                { name: 'opcao_c', label: 'Opção C', type: 'text' },
                { name: 'opcao_d', label: 'Opção D', type: 'text' },
                { name: 'resposta_correta', label: 'Resposta Correta (JSON)', type: 'textarea' },
                { name: 'pontos', label: 'Pontos', type: 'number' },
                { name: 'midia', label: 'Mídia (JSON)', type: 'textarea' }
            ]
        },
        questoes_ingles: {
            title: 'Questões de Inglês',
            columns: ['id', 'titulo', 'dificuldade', 'pontos'],
            displayColumns: ['ID', 'Título', 'Dificuldade', 'Pontos'],
            fields: [
                { name: 'titulo', label: 'Título', type: 'text', required: true },
                { name: 'descricao', label: 'Descrição', type: 'textarea', required: true },
                { name: 'dificuldade', label: 'Dificuldade', type: 'select', options: ['facil', 'medio', 'dificil'], required: true },
                { name: 'torneio_id', label: 'ID do Torneio', type: 'number', required: true },
                { name: 'resposta_correta', label: 'Resposta Correta', type: 'textarea', required: true },
                { name: 'opcoes', label: 'Opções (JSON)', type: 'textarea' },
                { name: 'pontos', label: 'Pontos', type: 'number' },
                { name: 'midia', label: 'Mídia (JSON)', type: 'textarea' }
            ]
        },
        questoes_matematica: {
            title: 'Questões de Matemática',
            columns: ['id', 'titulo', 'dificuldade', 'pontos'],
            displayColumns: ['ID', 'Título', 'Dificuldade', 'Pontos'],
            fields: [
                { name: 'titulo', label: 'Título', type: 'text', required: true },
                { name: 'enunciado', label: 'Enunciado', type: 'textarea', required: true },
                { name: 'dificuldade', label: 'Dificuldade', type: 'select', options: ['facil', 'medio', 'dificil'], required: true },
                { name: 'torneio_id', label: 'ID do Torneio', type: 'number', required: true },
                { name: 'correta', label: 'Correta (JSON)', type: 'textarea' },
                { name: 'opcoes', label: 'Opções (JSON)', type: 'textarea' },
                { name: 'pontos', label: 'Pontos', type: 'number' },
                { name: 'midia', label: 'Mídia (JSON)', type: 'textarea' }
            ]
        },
        questoes_programacao: {
            title: 'Questões de Programação',
            columns: ['id', 'titulo', 'dificuldade', 'pontos', 'linguagem'],
            displayColumns: ['ID', 'Título', 'Dificuldade', 'Pontos', 'Linguagem'],
            fields: [
                { name: 'titulo', label: 'Título', type: 'text', required: true },
                { name: 'descricao', label: 'Descrição', type: 'textarea', required: true },
                { name: 'dificuldade', label: 'Dificuldade', type: 'select', options: ['facil', 'medio', 'dificil'], required: true },
                { name: 'torneio_id', label: 'ID do Torneio', type: 'number', required: true },
                { name: 'resposta_correta', label: 'Resposta Correta', type: 'textarea', required: true },
                { name: 'opcoes', label: 'Opções (JSON)', type: 'textarea' },
                { name: 'pontos', label: 'Pontos', type: 'number' },
                { name: 'midia', label: 'Mídia (JSON)', type: 'textarea' },
                { name: 'linguagem', label: 'Linguagem', type: 'text' }
            ]
        },
        redefinicoes_senha: {
            title: 'Redefinições de Senha',
            columns: ['id', 'usuario_id', 'expira_em', 'usado_em'],
            displayColumns: ['ID', 'Usuário ID', 'Expira em', 'Usado em'],
            fields: [
                { name: 'usuario_id', label: 'ID do Usuário', type: 'number', required: true },
                { name: 'hash_token', label: 'Hash do Token', type: 'text', required: true },
                { name: 'expira_em', label: 'Expira em', type: 'datetime-local', required: true },
                { name: 'usado_em', label: 'Usado em', type: 'datetime-local' }
            ]
        },
        tentativas_teste: {
            title: 'Tentativas de Teste',
            columns: ['id', 'usuario_id', 'pontuacao', 'status'],
            displayColumns: ['ID', 'Usuário ID', 'Pontos', 'Status'],
            fields: [
                { name: 'usuario_id', label: 'ID do Usuário', type: 'number', required: true },
                { name: 'iniciado_em', label: 'Iniciado em', type: 'datetime-local' },
                { name: 'concluido_em', label: 'Concluído em', type: 'datetime-local' },
                { name: 'respostas', label: 'Respostas (JSON)', type: 'textarea' },
                { name: 'pontuacao', label: 'Pontuação', type: 'number' },
                { name: 'status', label: 'Status', type: 'select', options: ['em_progresso', 'concluida', 'cancelada'] },
                { name: 'duracao_segundos', label: 'Duração (s)', type: 'number' }
            ]
        }
    };

    // Build a generic tableInfo from fetched data
    const buildTableInfoFromData = (rows) => {
        const first = Array.isArray(rows) && rows.length > 0 ? rows[0] : {};
        const cols = Object.keys(first);
        const displayColumns = cols.map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        const fields = cols.filter(c => c !== 'id').map(c => {
            const sample = first[c];
            let type = 'text';
            if (typeof sample === 'number') type = 'number';
            else if (typeof sample === 'string') {
                // ISO datetime heuristic ESM3
                if (/^\d{4}-\d{2}-\d{2}T?/.test(sample)) type = 'datetime-local';
                else if (sample.length > 200) type = 'textarea';
            }
            return { name: c, label: c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), type };
        });

        return {
            title: table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            columns: cols,
            displayColumns,
            fields
        };
    };

    // Fetch data (stable function so other handlers can call it)
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

            if (staticTableDefs[table]) {
                setTableInfo(staticTableDefs[table]);
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
        // reset modal state when switching tables to avoid stale state and re-renders
        setShowModal(false);
        setSelectedItem(null);
        setModalMode('create');
        fetchData();
    }, [table, fetchData]);

    const handleAdd = () => {
        setModalMode('create');
        setSelectedItem(null);
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
        try {
            if (modalMode === 'create') {
                await tableService.create(formData);
            } else if (modalMode === 'edit') {
                await tableService.update(selectedItem.id, formData);
            } else if (modalMode === 'delete') {
                await tableService.delete(selectedItem.id);
            }
            handleModalClose();
            await fetchData();
        } catch (err) {
            setError('Erro ao processar operação');
            console.error(err);
        }
    };

    if (!tableService && table) {
        return <div className="p-8 text-center text-gray-500">Tabela não disponível. Selecione outro item no menu.</div>;
    }

    if (loading && (!tableInfo || data.length === 0)) {
        return <div className="p-8 text-center">Carregando...</div>;
    }

    const info = tableInfo || { title: 'Tabela', columns: [], displayColumns: [], fields: [] };

    // Filter data
    const filteredData = data.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Gerenciamento de {info.title}</h2>
                <button
                    onClick={handleAdd}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                    + Adicionar {info.title.slice(0, -1)}
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-max w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                {info.displayColumns.map((col, idx) => (
                                    <th key={idx} className="px-6 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-right font-semibold text-gray-700 whitespace-nowrap">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={info.displayColumns.length + 1} className="px-6 py-8 text-center text-gray-500">
                                        Nenhum registro encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map(item => (
                                    <tr key={item.id || JSON.stringify(item)} className="border-b hover:bg-gray-50 transition">
                                        {info.columns.map((col, idx) => (
                                            <td key={idx} className="px-6 py-4 text-sm align-top">
                                                {String(item[col] ?? 'N/A')}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition text-sm font-medium"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-sm font-medium"
                                                >
                                                    Deletar
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

            {/* Modal */}
            {showModal && (
                <TableModal
                    mode={modalMode}
                    item={selectedItem}
                    tableInfo={tableInfo}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

export default TableManager;