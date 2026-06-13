import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, Trophy, BookOpen, FileText, TrendingUp,
  Clock, CheckCircle, AlertCircle, Calendar, Activity, RefreshCw,
  UserPlus, Clock as ClockIcon
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// ============================================
// COMPONENTE: Gráfico de Novos Usuários
// ============================================
const NovosUsuariosChart = () => {
  const { token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[NovosUsuariosChart] Fetching data...');
      const response = await fetch(`${API_BASE}/api/admin/novos-usuarios-por-dia?dias=30`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[NovosUsuariosChart] Response:', result);

      if (result.success && Array.isArray(result.dados)) {
        setData(result.dados);
      } else {
        throw new Error(result.error || 'Erro ao carregar dados');
      }
    } catch (err) {
      console.error('[NovosUsuariosChart] Error:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Skeleton loader
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-[300px] bg-gray-100 rounded"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Novos usuários (últimos 30 dias)</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          Novos usuários (últimos 30 dias)
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <UserPlus className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum dado disponível</p>
          <p className="text-sm text-gray-400 mt-1">Os dados aparecerão quando houver registros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-blue-600" />
        Novos usuários (últimos 30 dias)
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DBEAFE" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#DBEAFE" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="data"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
              }}
              interval={4}
            />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
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
                  month: 'long',
                  year: 'numeric'
                });
              }}
              formatter={(value) => [value, 'Novos usuários']}
            />
            <Area
              type="monotone"
              dataKey="quantidade"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUsuarios)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: Lista de Atividades Recentes
// ============================================
const AtividadesRecentes = () => {
  const { token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[AtividadesRecentes] Fetching data...');
      const response = await fetch(`${API_BASE}/api/admin/atividades-recentes?limite=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[AtividadesRecentes] Response:', result);

      if (result.success && Array.isArray(result.dados)) {
        setAtividades(result.dados);
      } else {
        throw new Error(result.error || 'Erro ao carregar atividades');
      }
    } catch (err) {
      console.error('[AtividadesRecentes] Error:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Obter ícone baseado na ação
  const getIconeAtividade = (acao) => {
    switch (acao) {
      case 'inscricao_torneio':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'completar_teste':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'finalizar_torneio':
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Formatar data/hora
  const formatarDataHora = (dataStr) => {
    if (!dataStr) return '-';
    try {
      const date = new Date(dataStr);
      const agora = new Date();
      const diffMs = agora - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHoras = Math.floor(diffMs / 3600000);
      const diffDias = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `${diffMins}m atrás`;
      if (diffHoras < 24) return `${diffHoras}h atrás`;
      if (diffDias < 7) return `${diffDias}d atrás`;

      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-gray-600" />
          Atividades recentes
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (atividades.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-gray-600" />
          Atividades recentes
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Activity className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma atividade recente</p>
          <p className="text-sm text-gray-400 mt-1">As atividades aparecerão quando houver registros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <ClockIcon className="w-5 h-5 text-gray-600" />
        Atividades recentes
      </h3>

      <div className="space-y-1">
        {atividades.map((atividade, index) => (
          <div
            key={index}
            className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
              {getIconeAtividade(atividade.acao)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                <span className="font-medium">{atividade.usuario_nome}</span>
                {' '}{atividade.detalhe}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatarDataHora(atividade.data_hora)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: AdminStats
// ============================================
const AdminStats = () => {
  const { token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
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

      const response = await fetch(`${API_BASE}/api/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg animate-pulse">
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

        <button
          onClick={() => { setRetrying(true); fetchStats(); }}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 mb-4"
        >
          <RefreshCw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Tentando novamente...' : 'Tentar novamente'}
        </button>

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

        <div className="mt-4 text-sm text-gray-500">
          <p>Backend rodando em: <code className="bg-gray-200 px-2 py-1 rounded">{API_BASE}</code></p>
          <p>Endpoint: <code className="bg-gray-200 px-2 py-1 rounded">{API_BASE}/api/admin/stats</code></p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Total de Usuários"
          value={usuarios.total}
          subtitle={`${usuarios.administradores} administradores`}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
          variation={variacao7.text}
          variationColor={variacao7.color}
        />
        <StatCard
          title="Torneios Ativos"
          value={torneios.ativos}
          subtitle={`${torneios.total} total (${torneios.finalizados} finalizados)`}
          icon={Trophy}
          gradient="from-blue-600 to-blue-700"
        />
        <StatCard
          title="Questões Cadastradas"
          value={questoes.total}
          subtitle={`${questoes.torneios} torneios | ${questoes.testeConhecimento} teste`}
          icon={BookOpen}
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          title="Testes Realizados (30d)"
          value={testesConhecimento.realizados30Dias}
          subtitle={`Média: ${testesConhecimento.mediaAcertos}% acertos`}
          icon={FileText}
          gradient="from-indigo-600 to-indigo-700"
          variation={variacao30.text}
          variationColor={variacao30.color}
        />
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Inscrições Ativas"
          value={torneios.inscricoesAtivas}
          subtitle="Em torneios ativos"
          icon={Activity}
          gradient="from-cyan-500 to-cyan-600"
        />
        <StatCard
          title="Novos (7 dias)"
          value={usuarios.novos.dias7}
          subtitle="Usuários novos"
          icon={TrendingUp}
          gradient="from-cyan-600 to-cyan-700"
        />
        <StatCard
          title="Novos (30 dias)"
          value={usuarios.novos.dias30}
          subtitle="Usuários novos"
          icon={Calendar}
          gradient="from-blue-400 to-blue-500"
        />
        <StatCard
          title="Novos (90 dias)"
          value={usuarios.novos.dias90}
          subtitle="Usuários novos"
          icon={Clock}
          gradient="from-indigo-400 to-indigo-500"
        />
      </div>

      {/* NOVO: Grid de 2 colunas com Gráfico e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NovosUsuariosChart />
        <AtividadesRecentes />
      </div>

      {/* Gráfico de Evolução (mantido para compatibilidade) */}
      {evolucaoUsuarios && evolucaoUsuarios.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Evolução de Usuários (Últimos 30 dias)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucaoUsuarios}>
                <defs>
                  <linearGradient id="colorUsuariosOld" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                  fill="url(#colorUsuariosOld)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Últimas Atividades (mantido para compatibilidade) */}
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
  <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl min-h-[160px] sm:min-h-[140px] flex flex-col justify-between`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-xs sm:text-sm font-medium mb-1 truncate">{title}</p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-2xl sm:text-3xl font-bold truncate">{value}</p>
          {variation && (
            <span className={`text-xs sm:text-sm font-medium ${variationColor} bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap`}>
              {variation}
            </span>
          )}
        </div>
        {subtitle && <p className="text-white/70 text-xs sm:text-sm mt-1 line-clamp-2">{subtitle}</p>}
      </div>
      <Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 opacity-80 flex-shrink-0" />
    </div>
  </div>
);

export default AdminStats;