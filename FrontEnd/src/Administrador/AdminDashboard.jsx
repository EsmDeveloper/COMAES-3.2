import { useState } from 'react';
import logotipo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TableManager from './TableManager';
import AdminStats from './AdminStats';
import TorneiosTab from './TorneiosTab';
import NotificationsTab from './NotificationsTab';
import QuestoesManager from './QuestoesManager';
import TesteConhecimentoManager from './TesteConhecimentoManager';
import { 
  BarChart3, Trophy, BookOpen, Users, Award, Bell, Settings, 
  Zap, FileText, Shield, Database, X, Menu, ArrowLeft
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
        { id: 'participante_torneio', label: 'Participantes', icon: Users },
        { id: 'tentativateste', label: 'Tentativas de Teste', icon: FileText }
      ]
    },
    {
      id: 'content',
      title: 'Questões & Conteúdo',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-600',
      items: [
        { id: 'questoes', label: 'Questões (Torneios)', icon: BookOpen },
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
        { id: 'funcao', label: 'Permissões/Funções', icon: Shield }
      ]
    },
    {
      id: 'gamification',
      title: 'Gamificação',
      icon: Award,
      color: 'from-red-500 to-pink-600',
      items: [
        { id: 'conquista', label: 'Gerenciar Conquistas', icon: Award },
        { id: 'conquistausuario', label: 'Conquistas de Usuários', icon: Award }
      ]
    },
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
        { id: 'ticketsuporte', label: 'Tickets de Suporte', icon: Zap }
      ]
    },
    {
      id: 'system',
      title: 'Sistema',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      items: [
        { id: 'configuracaousuario', label: 'Configurações', icon: Settings },
        { id: 'redefinicaosenha', label: 'Redefinições de Senha', icon: Database }
      ]
    }
  ];

  const handleLogout = () => {
    navigate('/');
  };

  // Get all items flattened for navigation
  const allItems = menuSections.flatMap(section => section.items);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Desktop Sidebar (hidden on small screens) */}
      <div className="hidden md:flex w-72 bg-white shadow-xl border-r border-slate-200 flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <img src={logotipo} alt="Comaes" className="h-10 w-auto object-contain drop-shadow-sm" />
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-blue-100">COMAES Platform</p>
            </div>
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800">{user?.name || 'Administrador'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@comaes.com'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <img src={logotipo} alt="Comaes" className="h-8 w-auto object-contain drop-shadow-sm" />
                <h1 className="text-lg font-bold text-white">Admin</h1>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)} 
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
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
              {/* User info for mobile */}
              <div className="md:hidden flex items-center gap-3 text-slate-700">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {user?.name?.split(' ')[0] || 'Admin'}
                </span>
              </div>
              
              {/* Logout button - Always visible */}
              <button
                onClick={handleLogout}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao site</span>
              </button>
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
              ) : activeTab === 'notificacao' ? (
                <NotificationsTab token={token} />
              ) : activeTab === 'questoes' ? (
                <QuestoesManager />
              ) : activeTab === 'teste-conhecimento' ? (
                <TesteConhecimentoManager />
              ) : (
                <TableManager table={activeTab} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
