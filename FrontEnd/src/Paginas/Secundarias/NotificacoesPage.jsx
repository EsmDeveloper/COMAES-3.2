import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Trash2, 
  CheckCircle, 
  Circle,
  Search,
  Filter,
  RefreshCw,
  Archive,
  AlertCircle
} from 'lucide-react';
import { FaTrophy, FaUsers, FaCalendarAlt, FaBell } from 'react-icons/fa';
import { IoSparkles, IoMedal, IoTime } from 'react-icons/io5';
import ConfirmModal from '../../components/ConfirmModal';

export default function NotificacoesPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  const notificationTypes = [
    { value: 'geral', label: 'Geral', color: 'bg-gray-500', icon: FaBell },
    { value: 'torneio', label: 'Torneio', color: 'bg-yellow-500', icon: FaTrophy },
    { value: 'resultado', label: 'Resultado', color: 'bg-blue-500', icon: CheckCircle },
    { value: 'sistema', label: 'Sistema', color: 'bg-red-500', icon: AlertCircle },
    { value: 'conquista', label: 'Conquista', color: 'bg-green-500', icon: IoSparkles },
    { value: 'lembrete', label: 'Lembrete', color: 'bg-purple-500', icon: IoTime }
  ];

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ''}/usuarios/${user.id}/notificacoes`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data || []);
      } else {
        setError('Erro ao carregar notificaçÃµes');
      }
    } catch (err) {
      console.error('Erro ao carregar notificaçÃµes:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const normalizeConteudo = (conteudo) => {
    if (!conteudo) return {};
    if (typeof conteudo === 'string') {
      try {
        return JSON.parse(conteudo);
      } catch {
        return { mensagem: conteudo };
      }
    }
    return conteudo;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Há ${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTypeInfo = (type) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  const markAsRead = async (id, currentStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ''}/notificacoes/${id}/lido`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, lido: !currentStatus } : n)
        );
      }
    } catch (err) {
      console.error('Erro ao atualizar notificação:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/admin/notificacao/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Erro ao deletar notificação:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ''}/usuarios/${user.id}/notificacoes/lido-todas`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, lido: true })));
      }
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  // Filtrar e ordenar notificaçÃµes
  const filteredNotifications = notifications
    .filter(notif => {
      const conteudo = normalizeConteudo(notif.conteudo);
      const titulo = conteudo.titulo || '';
      const mensagem = conteudo.mensagem || '';
      const searchLower = searchTerm.toLowerCase();

      const matchSearch = titulo.toLowerCase().includes(searchLower) ||
                         mensagem.toLowerCase().includes(searchLower);
      const matchType = filterType === 'all' || notif.tipo === filterType;
      const matchStatus = filterStatus === 'all' ||
                         (filterStatus === 'lido' && notif.lido) ||
                         (filterStatus === 'nao-lido' && !notif.lido);

      return matchSearch && matchType && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.criado_em) - new Date(a.criado_em);
      } else if (sortBy === 'oldest') {
        return new Date(a.criado_em) - new Date(b.criado_em);
      } else if (sortBy === 'unread') {
        return (a.lido ? 1 : 0) - (b.lido ? 1 : 0);
      }
      return 0;
    });

  const unreadCount = notifications.filter(n => !n.lido).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">NotificaçÃµes</h1>
          </div>
          <p className="text-gray-600">
            VocÃª tem <strong>{unreadCount}</strong> notificação{unreadCount !== 1 ? 's' : ''} não lida{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Busca */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar notificaçÃµes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtro de Tipo */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os tipos</option>
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os status</option>
                <option value="nao-lido">Não lidas</option>
                <option value="lido">Lidas</option>
              </select>
            </div>
          </div>

          {/* AçÃµes */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchNotifications()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar todas como lidas
              </button>
            )}

            <div className="w-full sm:w-auto sm:ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="unread">Não lidas primeiro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de NotificaçÃµes */}
        <div className="space-y-3">
          {loading && !notifications.length ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <RefreshCw className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 mt-4">Carregando notificaçÃµes...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Nenhuma notificação encontrada'
                  : 'VocÃª não tem notificaçÃµes'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => {
              const conteudo = normalizeConteudo(notif.conteudo);
              const typeInfo = getTypeInfo(notif.tipo);
              const TypeIcon = typeInfo.icon;

              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 md:p-6 border-l-4 ${
                    notif.lido ? 'border-gray-300' : 'border-blue-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Ãcone */}
                    <div className={`${typeInfo.color} text-white p-3 rounded-lg flex-shrink-0`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    {/* ConteÃºdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                        <div>
                          <h3 className={`font-bold text-lg ${
                            notif.lido ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {conteudo.titulo || 'Sem título'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(notif.criado_em)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          notif.lido
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {notif.lido ? 'Lida' : 'Não lida'}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                        {conteudo.mensagem || 'Sem mensagem'}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          typeInfo.color.replace('bg-', 'bg-opacity-20 text-')
                        }`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* AçÃµes */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start">
                      <button
                        onClick={() => markAsRead(notif.id, notif.lido)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={notif.lido ? 'Marcar como não lida' : 'Marcar como lida'}
                      >
                        {notif.lido ? (
                          <Circle className="w-5 h-5 text-gray-400" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setNotificationToDelete(notif);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal de Confirmação */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setNotificationToDelete(null);
          }}
          onConfirm={() => {
            if (notificationToDelete) {
              deleteNotification(notificationToDelete.id);
            }
          }}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja deletar esta notificação? Esta ação não pode ser desfeita."
          confirmText="Deletar"
          cancelText="Cancelar"
          type="danger"
        />
      </div>
    </div>
  );
}

