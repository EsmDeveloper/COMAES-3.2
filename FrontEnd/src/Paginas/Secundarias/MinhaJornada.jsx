/**
 * MinhaJornada.jsx - PÃ¡gina de GamificaÃ§Ã£o COMAES
 * 
 * Blocos implementados:
 * 1. Card do nÃ­vel atual com barra de XP para o prÃ³ximo nÃ­vel
 * 2. Card da sequÃªncia de aprendizagem com Ã­cone de chama e dias consecutivos
 * 3. Lista das Ãºltimas 5 conquistas desbloqueadas (com Ã­cones)
 * 4. PosiÃ§Ã£o nos rankings (global e por categoria) com link para pÃ¡gina de rankings
 * 5. MissÃµes ativas do dia/semana (mÃ¡ximo 3) com progresso
 * 6. Mini grÃ¡fico de evoluÃ§Ã£o de XP nos Ãºltimos 30 dias (opcional)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NivelBadge from '../../components/NivelBadge';
import StreakBadge from '../../components/StreakBadge';
import { 
  FaTrophy, 
  FaFire, 
  FaMedal, 
  FaChartLine, 
  FaStar, 
  FaCheckCircle, 
  FaListAlt, 
  FaArrowRight,
  FaCrown,
  FaChartBar,
  FaCalendarDay,
  FaCalendarWeek,
  FaRegCalendarAlt,
  FaSpinner
} from 'react-icons/fa';

const MinhaJornada = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gamificacaoData, setGamificacaoData] = useState(null);

  useEffect(() => {
    fetchDashboardGamificacao();
  }, []);

  const fetchDashboardGamificacao = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;
      const token = localStorage.getItem('comaes_token');
      
      if (!token) {
        throw new Error('UsuÃ¡rio nÃ£o autenticado. FaÃ§a login novamente.');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/usuarios/me/dashboard-gamificacao`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        
        // Formatar os dados para o componente baseado na estrutura real do endpoint
        const formattedData = {
          nivel: data.nivel?.info || {
            numero: data.nivel?.numero || 1,
            titulo: data.nivel?.info?.nome || 'Iniciante',
            xp_minimo: data.nivel?.info?.xp_minimo || 0
          },
          xpTotal: data.nivel?.xp_total || 0,
          progresso: data.nivel?.progresso || 0,
          proximoNivel: data.nivel?.proximo,
          streak: {
            atual: data.streak?.streak_atual || 0,
            maximo: data.streak?.streak_maximo || 0,
            ativa: data.streak?.ativa || false
          },
          conquistas: data.conquistas?.map(c => ({
            id: c.id,
            titulo: c.nome,
            descricao: c.descricao,
            icone: c.url_icone || 'ðŸ†',
            data: c.concedido_em
          })) || [],
          rankings: {
            global: { 
              posicao: data.ranking?.melhor_posicao || 0,
              total: 1000 // valor padrÃ£o, poderia vir da API
            },
            categorias: Object.entries(data.ranking?.por_disciplina || {}).map(([categoria, posicao]) => ({
              categoria: categoria,
              posicao: posicao,
              total: 100 // valor padrÃ£o
            }))
          },
          missoes: data.missoes?.map(m => ({
            id: m.id,
            titulo: m.nome,
            descricao: m.descricao,
            progresso: m.progresso_atual || 0,
            total: m.meta,
            tipo: m.ciclo === 'daily' ? 'diaria' : 'semanal'
          })) || [],
          evolucaoXP: data.xp_grafico?.map(item => ({
            data: item.semana,
            xp: item.xp
          })) || Array.from({ length: 30 }, (_, i) => ({
            data: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT'),
            xp: Math.floor(Math.random() * 100) + 600 + i * 5
          }))
        };
        
        setGamificacaoData(formattedData);
      } else {
        throw new Error(result.error || 'Erro ao carregar dados de gamificaÃ§Ã£o');
      }
    } catch (err) {
      console.error('Erro ao buscar dados de gamificaÃ§Ã£o:', err);
      setError(err.message || 'NÃ£o foi possÃ­vel carregar os dados da sua jornada');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando sua jornada de aprendizagem...</p>
        </div>
      </div>
    );
  }

  // Renderizar error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Erro ao carregar</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardGamificacao}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dados de exemplo (substituir pelos dados reais da API)
  const data = gamificacaoData || {
    nivel: {
      numero: 3,
      titulo: "Coruja Aprendiz",
      icone: "ðŸ“š",
      cor: "#3B82F6",
      xp_minimo: 500
    },
    xpTotal: 720,
    streak: {
      atual: 5,
      maximo: 12,
      ativa: true
    },
    conquistas: [
      { id: 1, titulo: "Primeira QuestÃ£o", descricao: "Acertou sua primeira questÃ£o", icone: "ðŸŽ¯", data: "2024-01-15" },
      { id: 2, titulo: "SÃ©rie de 3 Dias", descricao: "3 dias consecutivos de aprendizado", icone: "ðŸ”¥", data: "2024-01-18" },
      { id: 3, titulo: "NÃ­vel 3 AlcanÃ§ado", descricao: "Evoluiu para Coruja Aprendiz", icone: "ðŸ“š", data: "2024-01-20" },
      { id: 4, titulo: "Participante Ativo", descricao: "10 questÃµes respondidas", icone: "âœ…", data: "2024-01-22" },
      { id: 5, titulo: "Primeiro Torneio", descricao: "Participou de um torneio", icone: "ðŸ†", data: "2024-01-25" }
    ],
    rankings: {
      global: { posicao: 42, total: 1500 },
      categorias: [
        { categoria: "MatemÃ¡tica", posicao: 15, total: 300 },
        { categoria: "ProgramaÃ§Ã£o", posicao: 8, total: 200 },
        { categoria: "InglÃªs", posicao: 25, total: 400 }
      ]
    },
    missoes: [
      { id: 1, titulo: "Dia de Desafio", descricao: "Responda 5 questÃµes hoje", progresso: 3, total: 5, tipo: "diaria" },
      { id: 2, titulo: "Explorador", descricao: "Complete 1 torneio esta semana", progresso: 0, total: 1, tipo: "semanal" },
      { id: 3, titulo: "Mestre do ConteÃºdo", descricao: "Alcance 1000 XP", progresso: 720, total: 1000, tipo: "longo_prazo" }
    ],
    evolucaoXP: Array.from({ length: 30 }, (_, i) => ({
      data: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT'),
      xp: Math.floor(Math.random() * 100) + 600 + i * 5
    }))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CabeÃ§alho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Minha Jornada</h1>
          <p className="text-gray-600 text-lg">
            Acompanhe seu progresso, conquistas e evoluÃ§Ã£o na COMAES
          </p>
        </motion.div>

        {/* Grid de Blocos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna 1 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bloco 1: Card do NÃ­vel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaTrophy className="text-yellow-500" />
                    Seu NÃ­vel Atual
                  </h2>
                  <p className="text-gray-600 mt-1">Continue aprendendo para evoluir!</p>
                </div>
                <div className="text-sm text-gray-500">
                  XP Total: <span className="font-bold text-blue-600">{data.xpTotal.toLocaleString('pt-PT')}</span>
                </div>
              </div>
              
              <div className="max-w-lg">
                <div className="space-y-4">
                  {/* NÃ­vel atual */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {data.nivel.numero}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{data.nivel.titulo}</h3>
                        <p className="text-sm text-gray-600">NÃ­vel {data.nivel.numero}</p>
                      </div>
                    </div>
                    {data.proximoNivel && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">PrÃ³ximo nÃ­vel:</p>
                        <p className="font-bold text-blue-600">NÃ­vel {data.proximoNivel.numero} - {data.proximoNivel.nome}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Barra de progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progresso para o prÃ³ximo nÃ­vel</span>
                      <span>{Math.round(data.progresso || 0)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${data.progresso || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{data.xpTotal} XP</span>
                      <span>{data.proximoNivel ? `${data.proximoNivel.xp_minimo} XP` : 'NÃ­vel mÃ¡ximo'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bloco 2: SequÃªncia de Aprendizagem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaFire className="text-orange-500" />
                    SequÃªncia de Aprendizagem
                  </h2>
                  <p className="text-gray-600 mt-1">Mantenha o hÃ¡bito de estudar todos os dias!</p>
                </div>
                {data.streak.maximo > 0 && (
                  <div className="text-sm text-gray-500">
                    Recorde: <span className="font-bold text-orange-600">{data.streak.maximo} dias</span>
                  </div>
                )}
              </div>
              
              <div className="max-w-lg">
                <div className={`p-6 rounded-xl border-2 ${data.streak.ativa ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${data.streak.ativa ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gray-300'}`}>
                      <FaFire className="text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {data.streak.atual} {data.streak.atual === 1 ? 'dia' : 'dias'} consecutivos
                      </h3>
                      <p className="text-gray-600">
                        {data.streak.ativa ? 'ðŸ”¥ Seu hÃ¡bito estÃ¡ ativo!' : 'Recomece sua sequÃªncia hoje!'}
                      </p>
                    </div>
                  </div>
                  
                  {data.streak.atual > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progresso</span>
                        <span>{Math.min(data.streak.atual, 7)}/7 dias</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${data.streak.ativa ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-400'}`}
                          style={{ width: `${Math.min((data.streak.atual / 7) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Bloco 3: Conquistas Recentes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaMedal className="text-purple-500" />
                    Conquistas Recentes
                  </h2>
                  <p className="text-gray-600 mt-1">Ãšltimas 5 conquistas desbloqueadas</p>
                </div>
                <Link 
                  to="/conquistas" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  Ver todas <FaArrowRight className="text-xs" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {data.conquistas.map((conquista, index) => (
                  <motion.div
                    key={conquista.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-2xl">{conquista.icone}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{conquista.titulo}</h3>
                      <p className="text-sm text-gray-600">{conquista.descricao}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Conquistado em {new Date(conquista.data).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <FaCheckCircle className="text-green-500 text-lg" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-6">
            
            {/* Bloco 4: PosiÃ§Ã£o nos Rankings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaCrown className="text-yellow-500" />
                    PosiÃ§Ã£o nos Rankings
                  </h2>
                  <p className="text-gray-600 mt-1">Veja como estÃ¡ em relaÃ§Ã£o Ã  comunidade</p>
                </div>
                <Link 
                  to="/ranking" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  Ver ranking completo <FaArrowRight className="text-xs" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {/* Ranking Global */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Ranking Global</h3>
                      <p className="text-sm text-gray-600">PosiÃ§Ã£o entre todos os usuÃ¡rios</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {data.rankings.global.posicao}Âº
                      </div>
                      <div className="text-xs text-gray-500">
                        de {data.rankings.global.total}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rankings por Categoria */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 text-sm">Por Categoria</h4>
                  {data.rankings.categorias.map((cat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-800">{cat.categoria}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{cat.posicao}Âº</span>
                        <span className="text-xs text-gray-500">/ {cat.total}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bloco 5: MissÃµes Ativas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaListAlt className="text-green-500" />
                    MissÃµes Ativas
                  </h2>
                  <p className="text-gray-600 mt-1">Complete missÃµes para ganhar XP</p>
                </div>
                <Link 
                  to="/missoes" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  Ver todas <FaArrowRight className="text-xs" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {data.missoes.map((missao, index) => (
                  <motion.div
                    key={missao.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 border border-gray-200 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {missao.tipo === 'diaria' && <FaCalendarDay className="text-blue-500" />}
                        {missao.tipo === 'semanal' && <FaCalendarWeek className="text-green-500" />}
                        {missao.tipo === 'longo_prazo' && <FaRegCalendarAlt className="text-purple-500" />}
                        <h3 className="font-semibold text-gray-900">{missao.titulo}</h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {missao.progresso}/{missao.total}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{missao.descricao}</p>
                    
                    {/* Barra de Progresso */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                        style={{ width: `${(missao.progresso / missao.total) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Progresso</span>
                      <span>{Math.round((missao.progresso / missao.total) * 100)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Bloco 6: EvoluÃ§Ã£o de XP */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaChartBar className="text-indigo-500" />
                    EvoluÃ§Ã£o de XP
                  </h2>
                  <p className="text-gray-600 mt-1">Ãšltimos 30 dias de aprendizado</p>
                </div>
                <span className="text-sm text-gray-500">
                  <FaChartLine className="inline mr-1" />
                  TendÃªncia: <span className="font-bold text-green-600">+{Math.floor(data.xpTotal / 30)} XP/dia</span>
                </span>
              </div>
              
              {/* Mini grÃ¡fico */}
              <div className="h-48 flex items-end gap-1">
                {data.evolucaoXP.slice(-15).map((dia, index) => {
                  const maxXP = Math.max(...data.evolucaoXP.map(d => d.xp));
                  const altura = (dia.xp / maxXP) * 100;
                  
                  return (
                    <div key={index} className="flex-1 group relative">
                      <div
                        className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                        style={{ height: `${altura}%` }}
                      />
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap -translate-y-2">
                          <div className="font-bold">{dia.xp} XP</div>
                          <div className="text-gray-300">{dia.data}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Linha do tempo */}
              <div className="flex justify-between text-xs text-gray-500 mt-3">
                <span>15 dias atrÃ¡s</span>
                <span>7 dias atrÃ¡s</span>
                <span>Hoje</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RodapÃ© motivacional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
            <FaStar className="text-4xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Continue sua jornada!</h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Cada questÃ£o respondida, cada torneio completado e cada dia de estudo contam 
              para sua evoluÃ§Ã£o. O aprendizado contÃ­nuo Ã© o caminho para o sucesso.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Link
                to="/teste-seu-conhecimento"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Responder QuestÃµes
              </Link>
              <Link
                to="/entrar-no-torneio"
                className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
              >
                Participar de Torneios
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MinhaJornada;
