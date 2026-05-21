import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Send, 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  X,
  Plus
} from 'lucide-react';
import adminService from './adminService';

const NotificationsTab = ({ token }) => {
  // Estados principais
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'geral'
  });
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('send'); // 'send' ou 'history'
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');

  // Tipos de notificação disponíveis
  const notificationTypes = [
    { value: 'geral', label: 'Geral', color: 'bg-gray-500' },
    { value: 'torneio', label: 'Torneio', color: 'bg-yellow-500' },
    { value: 'resultado', label: 'Resultado', color: 'bg-blue-500' },
    { value: 'sistema', label: 'Sistema', color: 'bg-red-500' },
    { value: 'conquista', label: 'Conquista', color: 'bg-green-500' },
    { value: 'lembrete', label: 'Lembrete', color: 'bg-purple-500' }
  ];

  // Carregar usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const service = adminService(token);
        const data = await service.user.getAll();
        setUsers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
        setError('Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUsers();
  }, [token]);

  // Carregar notificações
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const service = adminService(token);
        const data = await service.notificacao.getAll();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
      }
    };

    if (token && activeTab === 'history') {
      fetchNotifications();
    }
  }, [token, activeTab]);

  // Filtrar e ordenar usuários
  const filteredUsers = useCallback(() => {
    let filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.nome?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.id?.toString().includes(searchLower)) &&
        (filterType === 'all' || user.tipo === filterType)
      );
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchTerm, filterType, sortBy, sortOrder]);

  // Filtrar notificações
  const filteredNotifications = useCallback(() => {
    return notifications.filter(notif => {
      const matchType = filterType === 'all' || notif.tipo === filterType;
      const matchStatus = filterStatus === 'all' || 
        (filterStatus === 'lido' && notif.lido) ||
        (filterStatus === 'nao-lido' && !notif.lido);
      return matchType && matchStatus;
    });
  }, [notifications, filterType, filterStatus]);

  // Selecionar/desselecionar usuário
  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Selecionar/desselecionar todos
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredUsers().map(u => u.id));
      setSelectedUsers(allIds);
      setSelectAll(true);
    }
  };

  // Enviar notificações
  const handleSendNotifications = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.mensagem.trim()) {
      setError('Título e mensagem são obrigatórios');
      return;
    }

    if (selectedUsers.size === 0) {
      setError('Selecione pelo menos um usuário');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const service = adminService(token);

      // Enviar para cada usuário selecionado
      const promises = Array.from(selectedUsers).map(userId =>
        service.notificacao.create({
          usuario_id: userId,
          titulo: formData.titulo,
          mensagem: formData.mensagem,
          tipo: formData.tipo,
          lido: false
        })
      );

      await Promise.all(promises);

      setSuccess(`Notificações enviadas para ${selectedUsers.size} usuário(s)`);
      setFormData({ titulo: '', mensagem: '', tipo: 'geral' });
      setSelectedUsers(new Set());
      setSelectAll(false);

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao enviar notificações:', err);
      setError('Erro ao enviar notificações');
    } finally {
      setLoading(false);
    }
  };

  // Deletar notificação
  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta notificação?')) return;

    try {
      const service = adminService(token);
      await service.notificacao.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setSuccess('Notificação deletada com sucesso');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao deletar notificação:', err);
      setError('Erro ao deletar notificação');
    }
  };

  // Marcar como lida/não lida
  const handleToggleReadStatus = async (id, currentStatus) => {
    try {
      const service = adminService(token);
      await service.notificacao.update(id, { lido: !currentStatus });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, lido: !currentStatus } : n
      ));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status');
    }
  };

  const getTypeColor = (type) => {
    const typeObj = notificationTypes.find(t => t.value === type);
    return typeObj?.color || 'bg-gray-500';
  };

  const getTypeLabel = (type) => {
    const typeObj = notificationTypes.find(t => t.value === type);
    return typeObj?.label || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Centro de Notificações</h1>
        </div>
        <p className="text-gray-600">Gerencie e envie notificações para usuários da plataforma</p>
      </div>

      {/* Mensagens de Erro/Sucesso */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'send'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Enviar Notificações
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Histórico
          </div>
        </button>
      </div>

      {/* TAB: ENVIAR NOTIFICAÇÕES */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Compor Mensagem</h2>
              
              <form onSubmit={handleSendNotifications} className="space-y-4">
                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Notificação
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Novo Torneio Disponível"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.titulo.length}/100</p>
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    placeholder="Digite a mensagem aqui..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.mensagem.length}/500</p>
                </div>

                {/* Info de seleção */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>{selectedUsers.size}</strong> usuário(s) selecionado(s)
                  </p>
                </div>

                {/* Botão Enviar */}
                <button
                  type="submit"
                  disabled={loading || selectedUsers.size === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Enviando...' : 'Enviar Notificações'}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Selecionar Usuários
              </h2>

              {/* Filtros e Busca */}
              <div className="space-y-4 mb-6">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Usuário
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos</option>
                      <option value="admin">Admin</option>
                      <option value="user">Usuário</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="nome">Nome</option>
                      <option value="email">Email</option>
                      <option value="id">ID</option>
                    </select>
                  </div>
                </div>

                {/* Selecionar Todos */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Selecionar todos ({filteredUsers().length})
                  </label>
                </div>
              </div>

              {/* Lista de Usuários */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Carregando usuários...</div>
                ) : filteredUsers().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>
                ) : (
                  filteredUsers().map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{user.nome}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {user.tipo || 'user'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: HISTÓRICO */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Notificações
          </h2>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="lido">Lido</option>
                <option value="nao-lido">Não Lido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando notificações...</div>
            ) : filteredNotifications().length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhuma notificação encontrada</div>
            ) : (
              filteredNotifications().map(notif => (
                <div
                  key={notif.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedNotification(
                      expandedNotification === notif.id ? null : notif.id
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Tipo Badge */}
                      <div className={`${getTypeColor(notif.tipo)} text-white px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 mt-1`}>
                        {getTypeLabel(notif.tipo)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800 truncate">
                            {notif.titulo || 'Sem título'}
                          </h3>
                          {notif.lido ? (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notif.mensagem || 'Sem mensagem'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Usuário ID: {notif.usuario_id}</span>
                          <span>{formatDate(notif.criado_em)}</span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleReadStatus(notif.id, notif.lido);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title={notif.lido ? 'Marcar como não lida' : 'Marcar como lida'}
                        >
                          {notif.lido ? (
                            <EyeOff className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notif.id);
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-600 transition-transform ${
                            expandedNotification === notif.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expandido */}
                    {expandedNotification === notif.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Mensagem Completa:</span>
                            <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                              {notif.mensagem}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <span className="font-medium text-gray-700">Criado em:</span>
                              <p className="text-gray-600">{formatDate(notif.criado_em)}</p>
                            </div>
                            {notif.lido_em && (
                              <div>
                                <span className="font-medium text-gray-700">Lido em:</span>
                                <p className="text-gray-600">{formatDate(notif.lido_em)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
