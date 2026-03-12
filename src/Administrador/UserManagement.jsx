import React, { useState, useEffect } from 'react';
import adminService from './adminService';
import UserModal from './UserModal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'delete'
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminService.users.getAll();
            setUsers(Array.isArray(data) ? data : [data]);
        } catch (err) {
            setError('Erro ao carregar usuários');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        setModalMode('create');
        setSelectedUser(null);
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleDeleteUser = (user) => {
        setModalMode('delete');
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (modalMode === 'create') {
                await adminService.users.create(formData);
            } else if (modalMode === 'edit') {
                await adminService.users.update(selectedUser.id, formData);
            } else if (modalMode === 'delete') {
                await adminService.users.delete(selectedUser.id);
            }
            handleModalClose();
            await fetchUsers();
        } catch (err) {
            setError('Erro ao processar operação');
            console.error(err);
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && users.length === 0) {
        return <div className="p-8 text-center">Carregando usuários...</div>;
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Gerenciamento de Usuários</h2>
                <button
                    onClick={handleAddUser}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                    + Adicionar Usuário
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
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

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-gray-700">Nome</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-700">Função</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-700">Data de Criação</th>
                            <th className="px-6 py-4 text-right font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    Nenhum usuário encontrado
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">{user.nome || 'N/A'}</td>
                                    <td className="px-6 py-4">{user.email || 'N/A'}</td>
                                    <td className="px-6 py-4">{user.funcao?.nome || user.funcao_id || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.criado_em ? new Date(user.criado_em).toLocaleDateString('pt-BR') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 transition text-sm"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-sm"
                                        >
                                            Deletar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <UserModal
                    mode={modalMode}
                    user={selectedUser}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

export default UserManagement;
