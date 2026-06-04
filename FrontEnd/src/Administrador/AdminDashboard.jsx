import { useState } from 'react';
import shortLogo from '../assets/short.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TableManager from './TableManager';
import AdminStats from './AdminStats';
import TorneiosTab from './TorneiosTab';
import NotificationsTab from './NotificationsTab';
import BlocoQuestoesManager from './BlocoQuestoesManager';
import CertificadosTab from './CertificadosTab';
import QuestoesPendentesTab from './QuestoesPendentesTab';
import ColaboradoresPendentesTab from './ColaboradoresPendentesTab';
import LogoutModal from '../components/LogoutModal';
import { 
  BarChart3, Trophy, BookOpen, Users, Bell, Settings, 
  Zap, FileText, X, Menu, UserCircle, LogOut, Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const displayName = user?.name || user?.nome || 'Administrador';
  const displayEmail = user?.email || 'admin@comaes.ao';
  const fallbackAvatar = user?.avatar && !String(user.avatar).includes('ui-avatars.com') ? user.avatar : null;
  const avatarUrl = user?.foto_url || user?.photo_url || user?.imagem || fallbackAvatar;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'A';

  // Estrutura reorganizada em seções
  const menuSections = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600',
      items: [
        { id: 'dashboard', label: 'Visão Geral', icon: BarChart3 }
      ]
    },
    {
      id: 'tournaments',
      title: 'Torneios & Competições',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-600',
      items: [
        { id: 'torneio', label: 'Gerenciar Torneios', icon: Trophy },
        { id: 'certificados', label: 'Gerenciar Certificados', icon: FileText }
        // REMOVIDO por alinhamento - 2026-05-26: participante_torneio - UI quebrada, já existe gestão em TorneiosTab
        // REMOVIDO por alinhamento - 2026-05-26: tentativateste - campos não batem com model real
      ]
    },
    {
      id: 'content',
      title: 'Questões & Conteúdo',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-600',
      items: [
        { id: 'questoes', label: 'Questões (Torneios)', icon: BookOpen },
        { id: 'questoes-pendentes', label: 'Revisar Questões', icon: FileText },
        { id: 'teste-conhecimento', label: 'Teste de Conhecimento', icon: FileText }
      ]
    },
    {
      id: 'users',
      title: 'Usuários & Comunidade',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      items: [
        { id: 'user', label: 'Gerenciar Usuários', icon: Users },
        { id: 'colaboradores-pendentes', label: 'Pedidos de Colaboradores', icon: Clock }
        // REMOVIDO por alinhamento - 2026-05-26: funcao - CRUD genérico muito cru, sem matriz de permissões
      ]
    },
    // REMOVIDO por alinhamento - 2026-05-26: seção gamificação inteira - conquista/conquistausuario não batem com model
    // {
    //   id: 'gamification',
    //   title: 'Gamificação',
    //   icon: Award,
    //   color: 'from-red-500 to-pink-600',
    //   items: [
    //     { id: 'conquista', label: 'Gerenciar Conquistas', icon: Award },
    //     { id: 'conquistausuario', label: 'Conquistas de Usuários', icon: Award }
    //   ]
    // },
    {
      id: 'communication',
      title: 'Comunicação',
      icon: Bell,
      color: 'from-cyan-500 to-blue-600',
      items: [
        { id: 'noticia', label: 'Gerenciar Notícias', icon: FileText },
        { id: 'notificacao', label: 'Centro de Notificações', icon: Bell }
      ]
    },
    {
      id: 'support',
      title: 'Suporte & Operações',
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      items: [
        // REMOVIDO por alinhamento - 2026-05-26: ticketsuporte - campos não batem com model real
      ]
    },
    {
      id: 'system',
      title: 'Sistema',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      items: [
        // REMOVIDO por alinhamento - 2026-05-26: configuracaousuario - campos não batem (espera id/chave/valor, model tem usuario_id/preferencias)
        // REMOVIDO por alinhamento - 2026-05-26: redefinicaosenha - expõe tokens internos de reset (risco de segurança)
      ]
    }
  ];

  const handleLogout = () => {
    setProfileMenuOpen(false);
    setMobileSidebarOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    // Após logout, sempre para a página de login — nunca para a Home de estudante
    navigate('/login');
  };

  const renderAvatarButton = (compact = false) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setProfileMenuOpen(prev => !prev)}
        className={`w-full flex items-center gap-3 rounded-xl text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 ${
          compact ? 'p-1.5' : 'p-2'
        }`}
        aria-expanded={profileMenuOpen}
        aria-haspopup="menu"
      >
        <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md overflow-hidden flex-shrink-0`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : initials ? (
            <span className={compact ? 'text-sm' : 'text-base'}>{initials}</span>
          ) : (
            <UserCircle className="w-6 h-6" />
          )}
        </div>
        {!compact && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold truncate text-gray-800">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
          </div>
        )}
      </button>

      {profileMenuOpen && (
        <div
          role="menu"
          className={`absolute ${compact ? 'right-0 top-12' : 'left-0 bottom-16'} z-50 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl`}
        >
          <button
            type="button"
            onClick={() => { setProfileMenuOpen(false); navigate('/perfil'); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <UserCircle className="w-4 h-4" />
            Meu perfil
          </button>
          <button
            type="button"
            onClick={() => { setProfileMenuOpen(false); navigate('/configuracoes'); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );

  // Get all items flattened for navigation
  const allItems = menuSections.flatMap(section => section.items);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
      {/* Desktop Sidebar (hidden on small screens) */}
      <div className="hidden md:flex w-72 bg-white shadow-xl border-r border-slate-200 flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <img src={shortLogo} alt="COMAES" className="h-10 w-auto object-contain" />
            <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto bg-slate-50 p-4">
          {menuSections.map(section => (
            <div key={section.id} className="mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg font-semibold'
                        : 'text-slate-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer - Dados dinâmicos do usuário */}
        <div className="border-t border-slate-200 p-6 flex-shrink-0 bg-white">
          {renderAvatarButton()}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <img src={shortLogo} alt="COMAES" className="h-10 w-auto object-contain" />
                <h1 className="text-xl font-bold text-gray-800">Painel do ADM</h1>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)} 
                className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto bg-slate-50 p-4">
              {menuSections.map(section => (
                <div key={section.id} className="mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                          activeTab === item.id
                            ? 'bg-blue-600 text-white shadow-lg font-semibold'
                            : 'text-slate-700 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Fixed at top */}
        <header className="bg-white shadow-lg border-b border-slate-200 flex-shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden w-12 h-12 flex items-center justify-center rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200" 
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:block">
                <h2 className="text-2xl font-bold text-slate-800">
                  {allItems.find(m => m.id === activeTab)?.label || 'Painel Administrativo'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Gerencie todos os aspectos da plataforma COMAES
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="md:hidden">
                {renderAvatarButton(true)}
              </div>
              
              {/* O admin não navega para o ambiente do estudante — botão removido intencionalmente.
                  Toda a saída do painel é feita via logout (botão no sidebar/avatar menu). */}
            </div>
          </div>
        </header>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto w-full px-6 py-8">
            <div className="animate-fade-in">
              {activeTab === 'dashboard' ? (
                <AdminStats />
              ) : activeTab === 'torneio' ? (
                <TorneiosTab />
              ) : activeTab === 'certificados' ? (
                <CertificadosTab />
              ) : activeTab === 'notificacao' ? (
                <NotificationsTab token={token} />
              ) : activeTab === 'questoes' ? (
                <BlocoQuestoesManager />
              ) : activeTab === 'questoes-pendentes' ? (
                <QuestoesPendentesTab />
              ) : activeTab === 'teste-conhecimento' ? (
                <BlocoQuestoesManager />
              ) : activeTab === 'colaboradores-pendentes' ? (
                <ColaboradoresPendentesTab />
              ) : activeTab === 'user' || activeTab === 'noticia' ? (
                <TableManager table={activeTab} />
              ) : (
                // REMOVIDO por alinhamento - 2026-05-26: IDs problemáticos redirecionam para 404
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p className="text-xl font-semibold">Página não disponível</p>
                  <p className="text-sm mt-2">Esta funcionalidade foi removida do painel administrativo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
