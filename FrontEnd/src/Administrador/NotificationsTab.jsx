import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Send, Search, Users, CheckCircle, Clock,
  AlertCircle, Trash2, Eye, EyeOff, ChevronDown, X,
} from 'lucide-react';
import adminService from './adminService';

const NotificationsTab = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({ titulo: '', mensagem: '', tipo: 'geral' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('send');
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');

  const notificationTypes = [
    { value: 'geral',     label: 'Geral',     color: 'bg-gray-500'   },
    { value: 'torneio',   label: 'Torneio',   color: 'bg-yellow-500' },
    { value: 'resultado', label: 'Resultado', color: 'bg-blue-500'   },
    { value: 'sistema',   label: 'Sistema',   color: 'bg-red-500'    },
    { value: 'conquista', label: 'Conquista', color: 'bg-green-500'  },
    { value: 'lembrete',  label: 'Lembrete',  color: 'bg-purple-500' },
  ];

  // Carregar usuários
  useEffect(() => {
    if (!token) return;
    const fetch_ = async () => {
      try {
        setLoading(true);
        const service = adminService(token);
        const data = await service.user.getAll();
        const list = data?.data || data;
        setUsers(Array.isArray(list) ? list : []);
        setError(null);
      } catch (err) {
        setError(`Erro ao carregar usuários: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [token]);

  // Carregar histórico de notificações
  useEffect(() => {
    if (!token || activeTab !== 'history') return;
    const fetch_ = async () => {
      try {
        const service = adminService(token);
        const data = await service.notificacao.getAll();
        const list = data?.data || data;
        setNotifications(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
      }
    };
    fetch_();
  }, [token, activeTab]);

  // Filtrar e ordenar usuários
  const filteredUsers = useCallback(() => {
    let filtered = users.filter(u => {
      const s = searchTerm.toLowerCase();
      return (
        (u.nome?.toLowerCase().includes(s) ||
         u.email?.toLowerCase().includes(s) ||
         u.id?.toString().includes(s)) &&
        (filterType === 'all' || u.tipo === filterType)
      );
    });
    filtered.sort((a, b) => {
      let av = (a[sortBy] || '').toString().toLowerCase();
      let bv = (b[sortBy] || '').toString().toLowerCase();
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return filtered;
  }, [users, searchTerm, filterType, sortBy, sortOrder]);

  // Filtrar notificações do histórico
  const filteredNotifications = useCallback(() => {
    return notifications.filter(n => {
      const matchType = filterType === 'all' || n.tipo === filterType;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'lido' && n.lido) ||
        (filterStatus === 'nao-lido' && !n.lido);
      return matchType && matchStatus;
    });
  }, [notifications, filterType, filterStatus]);

  const toggleUserSelection = (userId) => {
    const next = new Set(selectedUsers);
    next.has(userId) ? next.delete(userId) : next.add(userId);
    setSelectedUsers(next);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      setSelectedUsers(new Set(filteredUsers().map(u => u.id)));
      setSelectAll(true);
    }
  };

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
      const API_BASE = import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        '';
      const res = await fetch(`${API_BASE}/api/notificacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          usuarios_ids: Array.from(selectedUsers),
          titulo: formData.titulo,
          mensagem: formData.mensagem,
          tipo: formData.tipo,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao enviar notificações');
      setSuccess(`Notificações enviadas para ${selectedUsers.size} usuário(s)`);
      setFormData({ titulo: '', mensagem: '', tipo: 'geral' });
      setSelectedUsers(new Set());
      setSelectAll(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao enviar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta notificação?')) return;
    try {
      const service = adminService(token);
      await service.notificacao.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setSuccess('Notificação deletada com sucesso');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Erro ao deletar notificação: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleToggleReadStatus = async (id, current) => {
    try {
      const service = adminService(token);
      await service.notificacao.update(id, { lido: !current });
      setNotifications(notifications.map(n => n.id === id ? { ...n, lido: !current } : n));
    } catch (err) {
      setError(`Erro ao atualizar status: ${err.response?.data?.message || err.message}`);
    }
  };

  const getTypeColor = (type) => notificationTypes.find(t => t.value === type)?.color || 'bg-gray-500';
  const getTypeLabel = (type) => notificationTypes.find(t => t.value === type)?.label || type;
  const formatDate  = (d) => new Date(d).toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

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

      {/* Alerta de erro */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700 flex-1">{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-600" /></button>
        </div>
      )}

      {/* Alerta de sucesso */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-700 flex-1">{success}</span>
          <button onClick={() => setSuccess(null)}><X className="w-4 h-4 text-green-600" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {[
          { key: 'send',    label: 'Enviar Notificações', icon: <Send    className="w-4 h-4" /> },
          { key: 'history', label: 'Histórico',           icon: <Clock   className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: ENVIAR ── */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Compor Mensagem</h2>
              <form onSubmit={handleSendNotifications} className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Notificação</label>
                  <select
                    value={formData.tipo}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {notificationTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Novo Torneio Disponível"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.titulo.length}/100</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
                  <textarea
                    value={formData.mensagem}
                    onChange={e => setFormData({ ...formData, mensagem: e.target.value })}
                    placeholder="Digite a mensagem aqui..."
                    rows={6}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.mensagem.length}/500</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>{selectedUsers.size}</strong> usuário(s) selecionado(s)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || selectedUsers.size === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Enviando...' : 'Enviar Notificações'}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de utilizadores */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> Selecionar Usuários
              </h2>

              <div className="space-y-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email ou ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuário</label>
                    <select
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos</option>
                      <option value="admin">Admin</option>
                      <option value="user">Usuário</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="nome">Nome</option>
                      <option value="email">Email</option>
                      <option value="id">ID</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="w-4 h-4 rounded" />
                  <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={toggleSelectAll}>
                    Selecionar todos ({filteredUsers().length})
                  </label>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Carregando usuários...</p>
                ) : filteredUsers().length === 0 ? (
                  <p className="text-center py-8 text-gray-500">Nenhum usuário encontrado</p>
                ) : (
                  filteredUsers().map(u => (
                    <div key={u.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleUserSelection(u.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(u.id)}
                        onChange={() => toggleUserSelection(u.id)}
                        className="w-4 h-4 rounded"
                        onClick={e => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{u.nome}</p>
                        <p className="text-sm text-gray-500 truncate">{u.email}</p>
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded flex-shrink-0">
                        {u.role || u.tipo || 'user'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: HISTÓRICO ── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Histórico de Notificações
          </h2>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                {notificationTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="lido">Lido</option>
                <option value="nao-lido">Não Lido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar título..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-center py-8 text-gray-500">Carregando notificações...</p>
            ) : filteredNotifications().length === 0 ? (
              <p className="text-center py-8 text-gray-500">Nenhuma notificação encontrada</p>
            ) : (
              filteredNotifications().map(notif => (
                <div key={notif.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedNotification(expandedNotification === notif.id ? null : notif.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${getTypeColor(notif.tipo)} text-white px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 mt-0.5`}>
                        {getTypeLabel(notif.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800 truncate">{notif.titulo || 'Sem título'}</h3>
                          {notif.lido
                            ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            : <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                          }
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{notif.mensagem || 'Sem mensagem'}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Usuário ID: {notif.usuario_id}</span>
                          <span>{formatDate(notif.criado_em)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); handleToggleReadStatus(notif.id, notif.lido); }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title={notif.lido ? 'Marcar como não lida' : 'Marcar como lida'}
                        >
                          {notif.lido
                            ? <EyeOff className="w-4 h-4 text-gray-500" />
                            : <Eye className="w-4 h-4 text-blue-600" />
                          }
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteNotification(notif.id); }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedNotification === notif.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expandido */}
                    {expandedNotification === notif.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Mensagem completa:</span>
                            <p className="text-gray-600 mt-1 whitespace-pre-wrap">{notif.mensagem}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <span className="font-semibold text-gray-700">Criado em:</span>
                              <p className="text-gray-600">{formatDate(notif.criado_em)}</p>
                            </div>
                            {notif.lido_em && (
                              <div>
                                <span className="font-semibold text-gray-700">Lido em:</span>
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
