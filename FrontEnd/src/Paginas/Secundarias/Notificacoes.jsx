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
import ComaesModal, { ModalBtnPrimary } from "../../components/ComaesModal";

export default function NotificacoesModal({ isOpen, onClose, onNotificationRead, onAllRead }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      const token = localStorage.getItem('comaes_token');
      if (!token) {
        console.warn('Token não encontrado');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`}/api/notificacoes/usuario/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Erro ${response.status} ao carregar notificações`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Formatar notificaÃ§Ãµes vindas do banco
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
      console.error("Erro ao carregar notificaÃ§Ãµes:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Polling automÃ¡tico quando modal estÃ¡ aberto
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
    if (diffInSeconds < 3600) return `HÃ¡ ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `HÃ¡ ${Math.floor(diffInSeconds / 3600)} h`;
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
    // Verificar se jÃ¡ estÃ¡ lida para nÃ£o decrementar o contador desnecessariamente
    const notif = notifications.find(n => n.id === id);
    if (notif && notif.read) return;

    try {
      const token = localStorage.getItem('comaes_token');
      if (!token) {
        console.warn('Token não encontrado');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`}/api/notificacoes/${id}/lido`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Erro ${response.status} ao marcar como lida`);
        return;
      }

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
      const token = localStorage.getItem('comaes_token');
      if (!token) {
        console.warn('Token não encontrado');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`}/api/notificacoes/usuario/${user.id}/lido-todas`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Erro ${response.status} ao marcar todas como lidas`);
        return;
      }

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

  const deletarTodasNotificacoes = async () => {
    try {
      const token = localStorage.getItem('comaes_token');
      if (!token) {
        console.warn('Token não encontrado');
        return;
      }

      setIsDeleting(true);

      // Deletar cada notificação
      for (const notif of notifications) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`}/api/notificacoes/${notif.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      // Limpar lista local
      setNotifications([]);
      setUnreadCount(0);
      setShowDeleteConfirm(false);
      
      console.log('✅ Todas as notificações foram deletadas');

      // Notificar o Layout para zerar o contador
      if (onAllRead) {
        onAllRead();
      }
    } catch (error) {
      console.error("Erro ao deletar notificações:", error);
    } finally {
      setIsDeleting(false);
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

  // Filtrar notificaÃ§Ãµes
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  if (!user) {
    return (
      <ComaesModal
        isOpen={isOpen}
        onClose={onClose}
        title="Acesso Restrito"
        icon={<FaBell size={18} />}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        maxWidth="max-w-sm"
        footer={<ModalBtnPrimary onClick={onClose}>Fechar</ModalBtnPrimary>}
      >
        <p className="text-gray-600 text-sm text-center leading-relaxed py-2">
          FaÃ§a login para visualizar suas notificaÃ§Ãµes.
        </p>
      </ComaesModal>
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
            {/* CabeÃ§alho */}
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
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">NotificaÃ§Ãµes</h2>
                    <p className="text-xs md:text-sm text-gray-500">
                      {unreadCount} nÃ£o lida{unreadCount !== 1 ? 's' : ''}
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
                    {f === 'all' ? 'Todas' : f === 'unread' ? 'NÃ£o Lidas' : 'Lidas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de NotificaÃ§Ãµes */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <IoNotifications className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {filter === 'unread' ? 'Nenhuma notificaÃ§Ã£o nÃ£o lida' : 
                     filter === 'read' ? 'Nenhuma notificaÃ§Ã£o lida' : 
                     'Nenhuma notificaÃ§Ã£o'}
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

            {/* RodapÃ© */}
            <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-3">
                <span>COMAES NotificaÃ§Ãµes</span>
                <div className="flex items-center gap-2">
                  <span>{filteredNotifications.length} itens</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Limpar todas as notificações"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* BotÃµes de aÃ§Ã£o */}
              {unreadCount > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="w-full px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  âœ" Marcar todas como lidas
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de Confirmação para Deletar */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ícone */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Texto */}
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                Limpar Todas as Notificações?
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Tem certeza que deseja deletar TODAS as notificações? Esta ação não pode ser desfeita.
              </p>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={deletarTodasNotificacoes}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deletando...
                    </>
                  ) : (
                    'Deletar Tudo'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

