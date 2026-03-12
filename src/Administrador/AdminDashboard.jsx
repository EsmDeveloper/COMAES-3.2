import React, { useState, useEffect } from 'react';
import logotipo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TableManager from './TableManager';
import adminService from './adminService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [menuItems, setMenuItems] = useState([]);
    const [loadError, setLoadError] = useState(null);

    const formatLabel = (model) => {
        return model
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    useEffect(() => {
        if (!user || !token) return;
        setLoadError(null);
        adminService(token)
                .getModels()
                .then((models) => {
                    const items = (Array.isArray(models) ? models : []).map((m) => ({
                        id: m,
                        label: formatLabel(m),
                        icon: '📄'
                    }));
                    setMenuItems(items);
                    setLoadError(null);
                    if (items.length && !items.find((i) => i.id === activeTab)) {
                        setActiveTab(items[0].id);
                    }
                })
                .catch((err) => {
                    console.error('Erro ao carregar modelos:', err);
                    setLoadError(err?.message || 'Erro ao carregar painel. Verifique a conexão com o servidor.');
                    setMenuItems([{ id: 'users', label: 'Usuários', icon: '👥' }]);
                });
    }, [user, token]);

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Desktop Sidebar (hidden on small screens) */}
            <div className="hidden md:flex w-64 bg-gray-900 text-white shadow-lg flex-col h-screen overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex-shrink-0">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-sm text-gray-400 mt-2">COMAES Platform</p>
                </div>

                <nav className="flex-1 overflow-y-auto">
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`px-6 py-3 cursor-pointer transition text-sm ${
                                activeTab === item.id
                                    ? 'bg-blue-600 border-r-4 border-blue-400'
                                    : 'hover:bg-gray-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-semibold">{item.label}</span>
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer - Dados dinâmicos do usuário */}
                <div className="border-t border-gray-700 p-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold truncate">{user?.name || 'Administrador'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@comaes.com'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <img src={logotipo} alt="Comaes" className="h-8 w-auto object-contain" />
                                <h1 className="text-lg font-bold">Admin</h1>
                            </div>
                            <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-300 px-2">Fechar</button>
                        </div>
                        <nav className="flex-1 overflow-y-auto px-3 py-4">
                            {menuItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                                    className={`px-4 py-3 cursor-pointer rounded-lg mb-1 ${
                                        activeTab === item.id 
                                            ? 'bg-blue-600' 
                                            : 'hover:bg-gray-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span>{item.icon}</span>
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
                <header className="bg-blue-600 shadow-sm border-b flex-shrink-0">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-white hover:text-blue-200" 
                                onClick={() => setMobileSidebarOpen(true)}
                            >
                                <span className="text-xl">☰</span>
                            </button>
                            <img src={logotipo} alt="Comaes" className="h-10 w-auto object-contain" />
                            <div className="hidden md:block">
                                <h2 className="text-2xl font-bold text-white">{menuItems.find(m => m.id === activeTab)?.label || 'Painel'}</h2>
                                <p className="text-sm text-white/80">Gerencie todos os aspectos da plataforma COMAES</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* User info for mobile */}
                            <div className="md:hidden flex items-center gap-2 text-white">
                                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <span className="text-sm truncate max-w-[100px]">{user?.name?.split(' ')[0] || 'Admin'}</span>
                            </div>
                            
                            {/* Logout button - Always visible */}
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium shadow-md whitespace-nowrap"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full px-4 py-6">
                        {loadError && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                                {loadError}
                            </div>
                        )}
                        <TableManager table={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;