// Layout.jsx - header fixo corrigido
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaBars, FaUserCircle, FaChartLine, FaBell, FaBook, FaTrophy, FaBullhorn,
  FaHeadset, FaCogs, FaInfoCircle, FaFacebook, FaInstagram,
  FaWhatsapp, FaLinkedin, FaHome, FaTimes
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import NotificacoesModal from "./Notificacoes";
import logotipo from "../../assets/logotipo.png";
import logo from "../../assets/logo.png";
import logoShort from "../../assets/iso_icon.png";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { icon: <FaHome />, text: "Home", link: "/" },
    { icon: <FaTrophy />, text: "Entrar no Torneio", link: "/entrar-no-torneio" },
    { icon: <FaBook />, text: "Teste seu Conhecimento", link: "/teste-seu-conhecimento" },
    { icon: <FaBullhorn />, text: "Portal de Notícias", link: "/portal-de-noticias" },
    { icon: <FaChartLine />, text: "Dashboard", link: "/painel" },
    { icon: <FaUserCircle />, text: "Perfil do Usuário", link: "/perfil" },
    { icon: <FaCogs />, text: "Configurações", link: "/configuracoes" },
    { icon: <FaInfoCircle />, text: "Sobre nós", link: "/sobre-nos" },
    { icon: <FaHeadset />, text: "Suporte", link: "/suporte" },
  ];

  const desktopNavItems = [
    { icon: <FaTrophy />, text: "Entrar no Torneio", link: "/entrar-no-torneio" },
    { icon: <FaBook />, text: "Teste seu Conhecimento", link: "/teste-seu-conhecimento" },
    { icon: <FaChartLine />, text: "Dashboard", link: "/painel" },
    { icon: <FaBullhorn />, text: "Notícias", link: "/portal-de-noticias" },
    { icon: <FaInfoCircle />, text: "Sobre nós", link: "/sobre-nos" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const index = menuItems.findIndex(i => i.link === location.pathname);
    setActiveItem(index);
  }, [location.pathname]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/usuarios/${user.id}/notificacoes/nao-lidas/count`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('comaes_token')}` }
          });
          const data = await response.json();
          if (data.success) setNotificationCount(data.count);
        } catch (error) {
          console.error("Erro ao buscar contagem de notificações:", error);
        }
      } else {
        setNotificationCount(0);
      }
    };
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-gray-900 overflow-x-hidden">
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-[60] md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 left-0 h-full z-[70] flex flex-col w-72 bg-black text-white shadow-lg md:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <img src={logotipo} alt="Comaes" className="h-10 w-auto object-contain" />
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-blue-700/70 transition-all duration-150"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
              {menuItems.map((item, index) => {
                const isActive = activeItem === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.035, duration: 0.18 }}
                  >
                    <Link
                      to={item.link}
                      onClick={() => { setActiveItem(index); setMenuOpen(false); }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150
                        ${isActive ? 'bg-blue-600 text-white' : 'text-white hover:bg-blue-700/70 hover:text-white'}`}
                    >
                      <span className="text-base flex-shrink-0">{item.icon}</span>
                      {item.text}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            {user && (
              <div className="px-4 py-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  {user.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
                    : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(user.name || user.username || "U")[0].toUpperCase()}
                      </div>
                    )
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name || user.username || "Usuário"}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email || ""}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors duration-150 px-1 flex-shrink-0"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <NotificacoesModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* HEADER FIXO - sticky top-0 */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-blue-600 text-white ${scrolled ? 'shadow-lg' : ''}`}
      >
        <div className="flex items-center justify-between px-3 py-2 sm:px-6 max-w-7xl mx-auto">
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white hover:text-blue-300 transition-all duration-150 outline-none focus:outline-none cursor-pointer"
            >
              <FaBars className="text-lg" />
            </button>
            <Link to="/" className="flex items-center">
              {/* Desktop: full logo | Mobile: compact icon */}
              <img src={logo} alt="Comaes" className="hidden md:block h-10 w-auto object-contain cursor-pointer" />
              <img src={logoShort} alt="Comaes" className="block md:hidden h-9 w-9 object-contain cursor-pointer rounded-md" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-2 lg:gap-3 mx-auto">
            {desktopNavItems.map((item, idx) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={idx}
                  to={item.link}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-sm' 
                      : 'text-white/90 hover:bg-white/10 hover:shadow-md hover:text-white'
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.text}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
              <Link
                to="/teste-seu-conhecimento"
                title="Teste seu Conhecimento"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-white hover:text-blue-600 transition-all duration-150"
              >
                <FaBook className="text-sm" />
              </Link>
              <Link
                to="/entrar-no-torneio"
                title="Entrar no Torneio"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-white hover:text-blue-600 transition-all duration-150"
              >
                <FaTrophy className="text-sm" />
              </Link>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(true)}
                title="Notificações"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-white hover:text-blue-600 transition-all duration-150"
              >
                <FaBell className="text-sm sm:text-base" />
              </button>
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 pointer-events-none">
                  {notificationCount}
                </span>
              )}
            </div>

            <div className="w-px h-5 bg-white/30 md:hidden" />

            {!user ? (
              <div className="flex gap-1.5">
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-150"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate("/cadastro")}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 transition-all duration-150"
                >
                  Cadastre-se
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-all duration-150"
                >
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name || user.username || "Usuário"}
                  </span>
                  {user.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                    : <FaUserCircle className="text-xl" />
                  }
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-lg overflow-hidden z-[60] bg-white border border-gray-200 shadow-lg"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user.name || user.fullName || user.username}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-0.5">{user.email || ""}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/perfil" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Meu Perfil</Link>
                        <Link to="/configuracoes" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Configurações</Link>
                        {(user.isAdmin || user.role === 'admin') && (
                          <Link to="/administrador" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Painel Admin</Link>
                        )}
                        <div className="mx-3 my-1 h-px bg-gray-200" />
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sair</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full pb-12"
      >
        {children}
      </motion.main>

      <Link
        to="/suporte"
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 animate-pulse outline-none focus:outline-none"
        style={{ boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.5)' }}
      >
        <FaHeadset className="text-xl sm:text-2xl md:text-3xl" />
      </Link>

      <footer className="bg-gray-900 text-gray-300 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 flex flex-col items-center gap-5">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <Link to="/sobre-nos" className="text-gray-400 hover:text-blue-500 transition-colors duration-150">Sobre Nós</Link>
            <Link to="/suporte" className="text-gray-400 hover:text-blue-500 transition-colors duration-150">Suporte</Link>
            <Link to="/privacidade" className="text-gray-400 hover:text-blue-500 transition-colors duration-150">Privacidade</Link>
          </div>
          <div className="flex justify-center gap-5 text-lg">
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors duration-150"><FaFacebook /></a>
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors duration-150"><FaInstagram /></a>
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors duration-150"><FaWhatsapp /></a>
            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors duration-150"><FaLinkedin /></a>
          </div>
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} COMAES Education. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .animate-pulse { animation: pulse-ring 1.5s infinite; }
      `}</style>
    </div>
  );
}