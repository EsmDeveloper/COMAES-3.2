// Torneios.jsx - VERSÃO ATUALIZADA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ChevronDown, Users, Trophy, Clock, AlertCircle, Play, BookOpen, Code, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import torneioService from '../../../../BackEnd/services/torneioService';

const Torneios = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeDiscipline, setActiveDiscipline] = useState('matemática');
  const [torneios, setTorneios] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTorneio, setSelectedTorneio] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'
  const [joining, setJoining] = useState(false);

  const disciplinas = [
    { 
      id: 'matemática', 
      label: 'Matemática', 
      color: 'bg-blue-500',
      icon: <Calculator className="w-5 h-5" />
    },
    { 
      id: 'inglês', 
      label: 'Inglês', 
      color: 'bg-green-500',
      icon: <BookOpen className="w-5 h-5" />
    },
    { 
      id: 'programação', 
      label: 'Programação', 
      color: 'bg-purple-500',
      icon: <Code className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    const fetchTorneos = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // 1. Verificar torneios ativos para a disciplina selecionada
        const torneioData = await torneioService.verificarTorneioAtivo(
          activeDiscipline.charAt(0).toUpperCase() + activeDiscipline.slice(1)
        );
        
        if (!torneioData) {
          setTorneios([]);
          setSelectedTorneio(null);
          setRanking([]);
          setUserStats(null);
          setLoading(false);
          return;
        }

        // 2. Configurar dados do torneio
        const torneioAtivo = torneioData.torneio;
        setTorneios([torneioAtivo]);
        setSelectedTorneio(torneioAtivo);

        // 3. Buscar ranking e participação do usuário
        const rankingData = await torneioService.obterRanking(torneioAtivo.id, activeDiscipline.charAt(0).toUpperCase() + activeDiscipline.slice(1));
        setRanking(rankingData);

        const participacao = await torneioService.obterMinhaParticipacao(torneioAtivo.id, user.id, activeDiscipline.charAt(0).toUpperCase() + activeDiscipline.slice(1));
        setUserStats(participacao);

      } catch (error) {
        console.error('Erro ao buscar torneios:', error);
        setModalMessage('Erro ao carregar dados do torneio. Tente novamente.');
        setModalType('error');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTorneos();
  }, [activeDiscipline, user?.id]);

  const calculateProgress = () => {
    return 0;
  };

  const getDisciplinaColor = (disciplina) => {
    switch(disciplina) {
      case 'Matemática': return '#3b82f6';
      case 'Inglês': return '#10b981';
      case 'Programação': return '#a855f7';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Torneios COMAES</h1>
        <p className="text-gray-300">Participe de torneios e compete com outros usuários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Disciplinas */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Disciplinas</h2>
            <div className="space-y-3">
              {disciplinas.map(disciplina => (
                <button
                  key={disciplina.id}
                  onClick={() => setActiveDiscipline(disciplina.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeDiscipline === disciplina.id
                      ? `${disciplina.color} text-white font-semibold`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {disciplina.icon}
                  {disciplina.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Torneio Info */}
          {selectedTorneio ? (
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedTorneio.titulo}</h3>
                  <p className="text-gray-300 text-sm mt-1">{selectedTorneio.descricao}</p>
                </div>
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 rounded p-4">
                  <Clock className="w-5 h-5 mb-2 text-blue-400" />
                  <p className="text-sm text-gray-400">Início</p>
                  <p className="font-semibold">{formatDate(selectedTorneio.inicia_em)}</p>
                </div>
                <div className="bg-gray-900 rounded p-4">
                  <Clock className="w-5 h-5 mb-2 text-green-400" />
                  <p className="text-sm text-gray-400">Término</p>
                  <p className="font-semibold">{formatDate(selectedTorneio.termina_em)}</p>
                </div>
                <div className="bg-gray-900 rounded p-4">
                  <Users className="w-5 h-5 mb-2 text-purple-400" />
                  <p className="text-sm text-gray-400">Torneio</p>
                  <p className="font-semibold">{selectedTorneio.status}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const routeMap = {
                    'matemática': '/matematica-original',
                    'inglês': '/ingles-original',
                    'programação': '/programacao-original'
                  };
                  
                  const route = routeMap[activeDiscipline];
                  if (route) {
                    navigate(`${route}/${user?.nome || 'usuario'}`);
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Iniciar Torneio
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Nenhum Torneio Disponível</h3>
              <p className="text-gray-300">
                Não há torneios ativos de {activeDiscipline} no momento.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Volte mais tarde ou verifique outras disciplinas.
              </p>
            </div>
          )}

          {/* Ranking e Minha Estatística */}
          {selectedTorneio && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meus Dados */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="text-yellow-400" />
                  Minha Participação
                </h3>
                {userStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                      <span className="text-gray-400 text-sm">Sua Pontuação</span>
                      <span className="text-2xl font-bold text-blue-400">{userStats.pontuacao || 0} pts</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                      <span className="text-gray-400 text-sm">Sua Posição</span>
                      <span className="text-xl font-bold text-yellow-400">#{userStats.posicao || '---'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                      <span className="text-gray-400 text-sm">Nível Atual</span>
                      <span className="capitalize font-semibold text-purple-400">{userStats.nivel_atual || 'Iniciante'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                      <span className="text-gray-400 text-sm">Precisão</span>
                      <span className="font-semibold text-green-400">{userStats.precisao || 0}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-900 rounded border border-dashed border-gray-700">
                    <p className="text-gray-400">Você ainda não está participando deste torneio.</p>
                    <p className="text-xs text-gray-500 mt-1">Inicie o torneio para começar a competir!</p>
                  </div>
                )}
              </div>

              {/* Ranking Top 5 */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="text-blue-400" />
                  Top Competidores
                </h3>
                <div className="space-y-2">
                  {ranking && ranking.length > 0 ? (
                    ranking.slice(0, 5).map((item, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded ${item.usuario_id === user?.id ? 'bg-blue-900/40 border border-blue-700' : 'bg-gray-900'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-700'}`}>
                            {index + 1}
                          </span>
                          <span className="font-medium">{item.usuario?.nome || 'Anônimo'}</span>
                        </div>
                        <span className="font-bold text-blue-400">{item.pontuacao} pts</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">Nenhum competidor ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Feedback */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                modalType === 'success' ? 'bg-green-900' :
                modalType === 'error' ? 'bg-red-900' :
                'bg-blue-900'
              }`}>
                {modalType === 'success' ? (
                  <Trophy className="w-6 h-6 text-green-300" />
                ) : modalType === 'error' ? (
                  <AlertCircle className="w-6 h-6 text-red-300" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-blue-300" />
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">
              {modalType === 'success' ? 'Sucesso!' :
               modalType === 'error' ? 'Erro!' :
               'Informação'}
            </h3>
            
            <p className="text-gray-300 text-center mb-6">
              {modalMessage}
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  modalType === 'success' ? 'bg-green-600 hover:bg-green-700' :
                  modalType === 'error' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Torneios;