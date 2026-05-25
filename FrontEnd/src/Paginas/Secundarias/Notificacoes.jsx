import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IoClose, 
  IoNotifications, 
  IoCheckmarkDone,
  IoTime,
  IoAlertCircle,
  IoSparkles,
  IoMedal,
  IoRefresh
} from "react-icons/io5";
import { FaTrophy, FaUsers, FaCalendarAlt, FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function NotificacoesModal({ isOpen, onClose, onNotificationRead, onAllRead }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const pollIntervalRef = useRef(null);
  const lastFetchRef = useRef(null);

  const normalizeConteudo = (conteudo) => {
    if (!conteudo) return {};
    if (typeof conteudo === "string") {
      try {
        const parsed = JSON.parse(conteudo);
        return parsed && typeof parsed === "object" ? parsed : { mensagem: conteudo };
      } catch {
        return { mensagem: conteudo };
      }
    }
    if (typeof conteudo === "object") return conteudo;
    return {};
  };

  const fetchNotifications = useCallback(async () => {
    if (!user || !user.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/notificacoes/usuario/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Formatar notificações vindas do banco
        const formatted = data.data.map((n) => {
          const conteudo = normalizeConteudo(n.conteudo);
          const title = conteudo.titulo || conteudo.title || n.tipo || "";
          const message = conteudo.mensagem || conteudo.message || conteudo.texto || "";

          return {
            id: n.id,
            title,
            message,
            read: Boolean(n.lido),
            type: n.tipo || "geral",
            time: n.criado_em,
            criado_em: n.criado_em
          };
        });
        setNotifications(formatted);
        setUnreadCount(formatted.filter(n => !n.read).length);
        lastFetchRef.current = Date.now();
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Polling automático quando modal está aberto
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchNotifications();
      
      // Polling a cada 10 segundos
      pollIntervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 10000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen, user?.id, fetchNotifications]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Agora mesmo";
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 172800) return "Ontem";
    return date.toLocaleDateString('pt-PT');
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'torneio': return <FaTrophy className="text-yellow-500" />;
      case 'ranking': return <IoMedal className="text-blue-500" />;
      case 'lembrete': return <IoTime className="text-purple-500" />;
      case 'conquista': return <IoSparkles className="text-green-500" />;
      case 'social': return <FaUsers className="text-pink-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  const marcarComoLida = async (id) => {
    // Verificar se já está lida para não decrementar o contador desnecessariamente
    const notif = notifications.find(n => n.id === id);
    if (notif && notif.read) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/notificacoes/${id}/lido`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Notificar o Layout para atualizar o contador
        if (onNotificationRead) {
          onNotificationRead();
        }
      }
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/notificacoes/usuario/${user.id}/lido-todas`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
        
        // Notificar o Layout para zerar o contador
        if (onAllRead) {
          onAllRead();
        }
      }
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'torneio': return 'bg-yellow-100 text-yellow-800';
      case 'ranking': return 'bg-blue-100 text-blue-800';
      case 'lembrete': return 'bg-purple-100 text-purple-800';
      case 'conquista': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type) => {
    switch(type) {
      case 'torneio': return 'Torneio';
      case 'ranking': return 'Ranking';
      case 'lembrete': return 'Lembrete';
      case 'conquista': return 'Conquista';
      case 'social': return 'Social';
      default: return 'Geral';
    }
  };

  // Filtrar notificações
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  if (!user) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                  <FaBell className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Acesso Restrito
                </h3>
                <p className="text-gray-600 mb-6">
                  Faça login para visualizar suas notificações
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4 pt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <IoNotifications className="text-2xl text-blue-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Notificações</h2>
                    <p className="text-xs md:text-sm text-gray-500">
                      {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => fetchNotifications()}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    title="Atualizar"
                  >
                    <IoRefresh className={loading ? 'animate-spin' : ''} size={18} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <IoClose size={20} />
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {['all', 'unread', 'read'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {f === 'all' ? 'Todas' : f === 'unread' ? 'Não Lidas' : 'Lidas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <IoNotifications className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {filter === 'unread' ? 'Nenhuma notificação não lida' : 
                     filter === 'read' ? 'Nenhuma notificação lida' : 
                     'Nenhuma notificação'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 md:p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                        notification.read 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200 shadow-sm'
                      }`}
                      onClick={() => marcarComoLida(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {notification.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`font-semibold text-sm md:text-base truncate ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(notification.type)}`}>
                              {getTypeText(notification.type)}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs md:text-sm text-gray-600">
              <span>COMAES Notificações</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={marcarTodasComoLidas}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <span>{filteredNotifications.length} itens</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

