import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Trophy, BookOpen, FileText, TrendingUp, 
  Clock, CheckCircle, AlertCircle, Calendar, Activity, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const AdminStats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Ler a resposta como texto primeiro
      const responseText = await response.text();
      
      // Tentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // Se não conseguir parsear, verificar se é HTML
        if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
          throw new Error(`Servidor retornou página HTML (status ${response.status}). Verifique se o backend está rodando corretamente.`);
        }
        throw new Error(`Falha ao processar resposta do servidor`);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Erro ${response.status}: ${data?.error || 'Falha ao carregar estatísticas'}`);
      }

      if (data.success && data.data) {
        setStats(data.data);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Formato de resposta inválido do servidor');
      }
    } catch (err) {
      setError(err.message || 'Erro desconhecido ao carregar estatísticas');
      setDebugInfo({
        message: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    } else {
      setLoading(false);
      setError('Token não disponível. Faça login novamente.');
    }
  }, [token]);

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar estatísticas</h3>
        <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
        
        {/* Botão de retry */}
        <button
          onClick={() => { setRetrying(true); fetchStats(); }}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 mb-4"
        >
          <RefreshCw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Tentando novamente...' : 'Tentar novamente'}
        </button>
        
        {/* Debug info - expandir para ver detalhes */}
        {debugInfo && (
          <details className="text-left mt-4 p-4 bg-white rounded-lg border border-red-200">
            <summary className="text-sm font-medium text-red-700 cursor-pointer">
              Ver detalhes técnicos (para debug)
            </summary>
            <pre className="text-xs text-gray-600 mt-2 overflow-auto p-2 bg-gray-100 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
        
        {/* Link para testar endpoint diretamente */}
        <div className="mt-4 text-sm text-gray-500">
          <p>Backend rodando em: <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:3000</code></p>
          <p>Endpoint: <code className="bg-gray-200 px-2 py-1 rounded">/api/admin/stats</code></p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { usuarios, torneios, questoes, testesConhecimento, evolucaoUsuarios, ultimasAtividades } = stats;

  const formatVariation = (variacao) => {
    if (variacao === 0) return { text: '0%', color: 'text-gray-500' };
    const prefix = variacao > 0 ? '+' : '';
    return { text: `${prefix}${variacao}%`, color: variacao > 0 ? 'text-green-500' : 'text-red-500' };
  };

  const variacao7 = formatVariation(usuarios.novos.variacao7Dias);
  const variacao30 = formatVariation(usuarios.novos.variacao30Dias);

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuários"
          value={usuarios.total}
          subtitle={`${usuarios.administradores} administradores`}
          icon={Users}
          gradient="from-blue-500 to-indigo-600"
          variation={variacao7.text}
          variationColor={variacao7.color}
        />
        <StatCard
          title="Torneios Ativos"
          value={torneios.ativos}
          subtitle={`${torneios.total} total (${torneios.finalizados} finalizados)`}
          icon={Trophy}
          gradient="from-yellow-500 to-orange-600"
        />
        <StatCard
          title="Questões Cadastradas"
          value={questoes.total}
          subtitle={`${questoes.torneios} torneios | ${questoes.testeConhecimento} teste`}
          icon={BookOpen}
          gradient="from-purple-500 to-pink-600"
        />
        <StatCard
          title="Testes Realizados (30d)"
          value={testesConhecimento.realizados30Dias}
          subtitle={`Média: ${testesConhecimento.mediaAcertos}% acertos`}
          icon={FileText}
          gradient="from-green-500 to-emerald-600"
          variation={variacao30.text}
          variationColor={variacao30.color}
        />
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Inscrições Ativas"
          value={torneios.inscricoesAtivas}
          subtitle="Em torneios ativos"
          icon={Activity}
          gradient="from-cyan-500 to-blue-600"
        />
        <StatCard
          title="Novos (7 dias)"
          value={usuarios.novos.dias7}
          subtitle="Usuários novos"
          icon={TrendingUp}
          gradient="from-indigo-500 to-purple-600"
        />
        <StatCard
          title="Novos (30 dias)"
          value={usuarios.novos.dias30}
          subtitle="Usuários novos"
          icon={Calendar}
          gradient="from-pink-500 to-rose-600"
        />
        <StatCard
          title="Novos (90 dias)"
          value={usuarios.novos.dias90}
          subtitle="Usuários novos"
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Gráfico de Evolução */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Evolução de Usuários (Últimos 30 dias)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucaoUsuarios}>
              <defs>
                <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="data" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit',
                    year: 'numeric'
                  });
                }}
              />
              <Area 
                type="monotone" 
                dataKey="usuarios" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorUsuarios)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Últimas Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Testes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            Últimos Testes Concluídos
          </h3>
          <div className="space-y-3">
            {ultimasAtividades.ultimosTestes.length > 0 ? (
              ultimasAtividades.ultimosTestes.map((teste) => (
                <div key={teste.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      teste.percentual >= 70 ? 'bg-green-100' : 
                      teste.percentual >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <span className={`font-bold text-sm ${
                        teste.percentual >= 70 ? 'text-green-600' : 
                        teste.percentual >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {teste.percentual}%
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{teste.usuario}</p>
                      <p className="text-sm text-gray-500 capitalize">{teste.area}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{teste.pontos} pts</p>
                    <p className="text-xs text-gray-500">
                      {new Date(teste.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum teste encontrado</p>
            )}
          </div>
        </div>

        {/* Últimos Torneios */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Últimos Torneios Criados
          </h3>
          <div className="space-y-3">
            {ultimasAtividades.ultimosTorneios.length > 0 ? (
              ultimasAtividades.ultimosTorneios.map((torneio) => (
                <div key={torneio.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      torneio.status === 'ativo' ? 'bg-green-100' :
                      torneio.status === 'finalizado' ? 'bg-gray-100' :
                      'bg-blue-100'
                    }`}>
                      <Trophy className={`w-5 h-5 ${
                        torneio.status === 'ativo' ? 'text-green-600' :
                        torneio.status === 'finalizado' ? 'text-gray-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{torneio.titulo}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(torneio.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    torneio.status === 'ativo' ? 'bg-green-100 text-green-700' :
                    torneio.status === 'finalizado' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {torneio.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum torneio encontrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Card de Estatística
const StatCard = ({ title, value, subtitle, icon: Icon, gradient, variation, variationColor }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{value}</p>
          {variation && (
            <span className={`text-sm font-medium ${variationColor} bg-white/20 px-2 py-0.5 rounded-full`}>
              {variation}
            </span>
          )}
        </div>
        {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
      </div>
      <Icon className="w-12 h-12 opacity-80" />
    </div>
  </div>
);

export default AdminStats;