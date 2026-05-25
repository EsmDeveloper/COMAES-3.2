import React, { useState, useEffect } from 'react';
import logotipo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TableManager from './TableManager';
import AdminStats from './AdminStats';
import { STATIC_TABLE_DEFS } from './TableManager';
import adminService from './adminService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [loadError, setLoadError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const formatLabel = (model) => {
        return model
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    useEffect(() => {
        if (!user || !token) return;
        setLoadError(null);
        setIsLoading(true);
        adminService(token)
                .getModels()
                .then((models) => {
                    const items = (Array.isArray(models) ? models : []).map((m) => {
                        const def = STATIC_TABLE_DEFS[m];
                        const label = def ? def.title : formatLabel(m) + (m.endsWith('s') ? '' : 's');
                        const icon = def ? def.icon || '­ƒôä' : '­ƒôä';
                        return { id: m, label, icon };
                    });
                    setMenuItems(items);
                    setLoadError(null);
                    if (items.length && (!activeTab || !items.find((i) => i.id === activeTab))) {
                        setActiveTab(items[0].id);
                    }
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error('Erro ao carregar modelos:', err);
                    setLoadError(err?.message || 'Erro ao carregar painel. Verifique a conex├úo com o servidor.');
                    // fallback b├ísico com todos os modelos dispon├¡veis
                    setMenuItems([
                        { id: 'user', label: 'Usu├írios', icon: '­ƒæÑ' },
                        { id: 'torneio', label: 'Torneios', icon: '­ƒÅå' },
                        { id: 'noticia', label: 'Not├¡cias', icon: '­ƒô░' },
                        { id: 'ticketsuporte', label: 'Suporte', icon: '­ƒÄ½' },
                        { id: 'funcao', label: 'Fun├º├Áes', icon: '­ƒæö' },
                        { id: 'pergunta', label: 'Perguntas', icon: 'ÔØô' },
                        { id: 'questaomatematica', label: 'Matem├ítica', icon: '­ƒöó' },
                        { id: 'questoes_programacao', label: 'Programa├º├úo', icon: '­ƒÆ╗' },
                        { id: 'questaoingles', label: 'Ingl├¬s', icon: '­ƒç║­ƒç©' },
                        { id: 'tentativateste', label: 'Tentativas', icon: '­ƒôØ' },
                        { id: 'participante_torneio', label: 'Participantes', icon: '­ƒÄ»' },
                        { id: 'notificacao', label: 'Notifica├º├Áes', icon: '­ƒöö' },
                        { id: 'conquista', label: 'Conquistas', icon: '­ƒÅà' },
                        { id: 'conquistausuario', label: 'Conquistas Usu├írio', icon: '­ƒÄû´©Å' },
                        { id: 'redefinicaosenha', label: 'Redefini├º├Áes', icon: '­ƒöæ' },
                        { id: 'configuracaousuario', label: 'Configura├º├Áes', icon: 'ÔÜÖ´©Å' }
                    ]);
                    setIsLoading(false);
                });
    }, [user, token]);

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Altera├º├úo 5: sair do painel admin SEM destruir a sess├úo do usu├írio
    // Apenas navega de volta para a ├írea p├║blica, preservando token e estado
    const handleLogout = () => {
        navigate('/');
    };

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
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-12 bg-slate-200 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        menuItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`px-4 py-3 cursor-pointer rounded-xl mb-2 transition-all duration-200 transform hover:scale-105 ${
                                    activeTab === item.id
                                        ? 'bg-blue-600 text-white shadow-lg border-l-4 border-blue-400'
                                        : 'hover:bg-white hover:shadow-md text-slate-700 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-semibold">{item.label}</span>
                                </div>
                            </div>
                        ))
                    )}
                </nav>

                {/* Sidebar Footer - Dados din├ómicos do usu├írio */}
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
                                Ô£ò
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto bg-slate-50 p-4">
                            {menuItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                                    className={`px-4 py-3 cursor-pointer rounded-xl mb-2 transition-all duration-200 ${
                                        activeTab === item.id 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'hover:bg-white hover:shadow-md text-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
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
                                <span className="text-xl">Ôÿ░</span>
                            </button>
                            <div className="hidden md:block">
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {menuItems.find(m => m.id === activeTab)?.label || 'Painel Administrativo'}
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
                                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
                            >
                                <span className="flex items-center gap-2">
                                    ÔåÉ Voltar ao site
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="max-w-7xl mx-auto w-full px-6 py-8">
                        {loadError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <span className="text-red-500 text-xl">ÔÜá´©Å</span>
                                    <div>
                                        <p className="font-semibold">Erro ao carregar painel</p>
                                        <p className="text-sm">{loadError}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="animate-fade-in">
                            <AdminStats />
                            <TableManager table={activeTab} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
