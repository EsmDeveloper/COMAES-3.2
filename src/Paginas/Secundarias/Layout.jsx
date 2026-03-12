// Layout.jsx - com cores do primeiro layout
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaBars, FaUserCircle, FaChartLine, FaBell, FaBook, FaTrophy, FaBullhorn,
  FaHeadset, FaCogs, FaInfoCircle, FaFacebook, FaInstagram,
  FaWhatsapp, FaLinkedin, FaPhone, FaHome, FaTimes
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import NotificacoesModal from "./Notificacoes";
import logotipo from "../../assets/logotipo.png";
import logo from "../../assets/logo.png";

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
          const response = await fetch(`http://localhost:3000/usuarios/${user.id}/notificacoes/nao-lidas/count`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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

  // Bloqueia scroll quando menu aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      {/* OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <AnimatePresence>
        {menuOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 left-0 h-full z-50 flex flex-col w-72 bg-black text-white shadow-lg"
          >
            {/* Header da sidebar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <img src={logotipo} alt="Comaes" className="h-10 w-auto object-contain" />
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-blue-700/70 transition-all duration-150"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Navegação */}
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
                      <span className={`text-base flex-shrink-0 ${isActive ? 'text-white' : 'text-white'}`}>
                        {item.icon}
                      </span>
                      {item.text}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Rodapé da sidebar - info do usuário */}
            {user && (
              <div className="px-4 py-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  {user.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
                    : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(user.username || user.name || "U")[0].toUpperCase()}
                      </div>
                    )
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.username || user.name || "Usuário"}</p>
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

      {/* MODAL NOTIFICAÇÕES */}
      <NotificacoesModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`sticky top-0 z-30 w-full transition-all duration-300 bg-blue-600 text-white shadow-md`}
        style={{
          boxShadow: scrolled ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 max-w-7xl mx-auto">

          {/* Esquerda: hamburguer + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:text-blue-300 transition-all duration-150"
            >
              <FaBars className="text-lg" />
            </button>
            <img src={logo} alt="Comaes" className="h-9 sm:h-11 w-auto object-contain" />
          </div>

          {/* Direita */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Ícone: Teste */}
            <Link
              to="/teste-seu-conhecimento"
              title="Teste seu Conhecimento"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-white hover:text-blue-600 transition-all duration-150"
            >
              <FaBook className="text-base" />
            </Link>

            {/* Ícone: Notificações */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(true)}
                title="Notificações"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-white hover:text-blue-600 transition-all duration-150"
              >
                <FaBell className="text-base" />
              </button>
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 pointer-events-none">
                  {notificationCount}
                </span>
              )}
            </div>

            {/* Ícone: Torneio */}
            <Link
              to="/entrar-no-torneio"
              title="Entrar no Torneio"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-white hover:text-blue-600 transition-all duration-150"
            >
              <FaTrophy className="text-base" />
            </Link>

            {/* Divisor */}
            <div className="w-px h-5 mx-1 bg-white/30" />

            {/* Auth */}
            {!user ? (
              <div className="flex gap-1.5">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-150"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate("/cadastro")}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 transition-all duration-150"
                >
                  Cadastre-se
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-all duration-150"
                >
                  <span className="hidden sm:block text-sm font-medium">
                    {user.username || user.name || "Usuário"}
                  </span>
                  {user.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                    : <FaUserCircle className="text-xl" />
                  }
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-lg overflow-hidden z-50 bg-white border border-gray-200 shadow-lg"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user.fullName || user.name || user.username}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-0.5">{user.email || ""}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/perfil"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-100"
                        >
                          Meu Perfil
                        </Link>
                        {/* Painel administrativo removido */}
                        <Link
                          to="/configuracoes"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-100"
                        >
                          Configurações
                        </Link>
                        {
                          user && (
                            user.isAdmin === true || user.isAdmin === 1 || user.isAdmin === '1' ||
                            user.is_admin === 1 || String(user.isAdmin).toLowerCase() === 'true' ||
                            (user.role && String(user.role).toLowerCase() === 'admin') ||
                            user.funcao_id === 3 || (user.funcao && String(user.funcao.nome).toLowerCase().includes('admin'))
                          ) && (
                            <Link
                              to="/administrador"
                              onClick={() => setProfileOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-100"
                            >
                             Painel do Administrador
                            </Link>
                          )
                        }
                        <div className="mx-3 my-1 h-px bg-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-100"
                        >
                          Terminar Sessão
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* MAIN */}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full"
      >
        {children}
      </motion.main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 flex flex-col items-center gap-5">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            {menuItems.map((item, index) => (
              <Link key={index} to={item.link} className="text-gray-400 hover:text-blue-500 transition-colors duration-150">
                {item.text}
              </Link>
            ))}
            <Link to="/politica-de-uso" className="text-gray-400 hover:text-blue-500 transition-colors duration-150">Política de Uso</Link>
            <Link to="/privacidade" className="text-gray-400 hover:text-blue-500 transition-colors duration-150">Privacidade</Link>
            <Link to="/seguranca" className="text-gray-400 hover:text-blue-500 transition-colors duration-150">Segurança</Link>
          </div>

          <div className="flex justify-center gap-5 text-lg">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors duration-150"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors duration-150"><FaInstagram /></a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors duration-150"><FaWhatsapp /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors duration-150"><FaLinkedin /></a>
            <a href="tel:+244000000000" className="text-gray-400 hover:text-blue-500 transition-colors duration-150"><FaPhone /></a>
          </div>

          <p className="text-xs text-gray-500 text-center">
            &copy; 2025 Comaes — Plataforma de Competições Educativas Online. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}