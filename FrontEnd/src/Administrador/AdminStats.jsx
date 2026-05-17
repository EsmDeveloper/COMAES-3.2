import React, { useState, useEffect } from 'react';
import adminService from './adminService';
import { useAuth } from '../context/AuthContext';

const AdminStats = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        users: { total: 0, admins: 0, recent: 0 },
        torneios: { total: 0, ativos: 0, finalizados: 0 },
        tickets: { total: 0, abertos: 0, resolvidos: 0 },
        certificados: { total: 0, emitidos: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;

            try {
                const services = adminService(token);

                // Buscar estatísticas básicas
                const [users, torneios, tickets] = await Promise.all([
                    services.getService('user').getAll().catch(() => []),
                    services.getService('torneio').getAll().catch(() => []),
                    services.getService('ticketsuporte').getAll().catch(() => [])
                ]);

                // Calcular estatísticas
                const userStats = {
                    total: users.length,
                    admins: users.filter(u => u.isAdmin).length,
                    recent: users.filter(u => {
                        const createdAt = new Date(u.createdAt || u.criado_em);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return createdAt > weekAgo;
                    }).length
                };

                const torneioStats = {
                    total: torneios.length,
                    ativos: torneios.filter(t => t.status === 'ativo').length,
                    finalizados: torneios.filter(t => t.status === 'finalizado').length
                };

                const ticketStats = {
                    total: tickets.length,
                    abertos: tickets.filter(t => t.status === 'aberto').length,
                    resolvidos: tickets.filter(t => t.status === 'resolvido' || t.status === 'fechado').length
                };

                setStats({
                    users: userStats,
                    torneios: torneioStats,
                    tickets: ticketStats,
                    certificados: { total: 0, emitidos: 0 } // Placeholder
                });
            } catch (error) {
                console.error('Erro ao carregar estatísticas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
        const colorClasses = {
            blue: 'from-blue-500 to-indigo-600',
            green: 'from-green-500 to-emerald-600',
            purple: 'from-purple-500 to-violet-600',
            orange: 'from-orange-500 to-red-600'
        };

        return (
            <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
                        <p className="text-3xl font-bold mb-1">{loading ? '...' : value}</p>
                        {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
                    </div>
                    <div className="text-4xl opacity-80">{icon}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Total de Usuários"
                value={stats.users.total}
                subtitle={`${stats.users.admins} administradores`}
                icon="👥"
                color="blue"
            />
            <StatCard
                title="Torneios Ativos"
                value={stats.torneios.ativos}
                subtitle={`${stats.torneios.total} total`}
                icon="🏆"
                color="green"
            />
            <StatCard
                title="Tickets de Suporte"
                value={stats.tickets.abertos}
                subtitle={`${stats.tickets.resolvidos} resolvidos`}
                icon="🎫"
                color="orange"
            />
            <StatCard
                title="Novos Usuários"
                value={stats.users.recent}
                subtitle="Últimos 7 dias"
                icon="📈"
                color="purple"
            />
        </div>
    );
};

export default AdminStats;