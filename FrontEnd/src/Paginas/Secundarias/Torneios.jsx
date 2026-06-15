// Torneios.jsx - VERSÃƒO ATUALIZADA
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Users, Trophy, Clock, AlertCircle, Play, BookOpen, Code, Calculator, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';
import ComaesModal, { ModalBtnPrimary } from '../../components/ComaesModal';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

const Torneios = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeDiscipline, setActiveDiscipline] = useState('MatemÃ¡tica');
  const [torneios, setTorneios] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTorneio, setSelectedTorneio] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');

  // Refs para socket listener sem closures stale
  const selectedTorneioRef = useRef(null);
  const activeDisciplineRef = useRef(activeDiscipline);
  useEffect(() => { activeDisciplineRef.current = activeDiscipline; }, [activeDiscipline]);
  useEffect(() => { selectedTorneioRef.current = selectedTorneio; }, [selectedTorneio]);

  const disciplinas = [
    { id: 'MatemÃ¡tica',  label: 'MatemÃ¡tica',  color: 'bg-blue-500',   icon: <Calculator className="w-5 h-5" /> },
    { id: 'InglÃªs',      label: 'InglÃªs',      color: 'bg-green-500',  icon: <BookOpen className="w-5 h-5" /> },
    { id: 'ProgramaÃ§Ã£o', label: 'ProgramaÃ§Ã£o', color: 'bg-purple-500', icon: <Code className="w-5 h-5" /> },
  ];

  /* â”€â”€ Carregar torneio activo e ranking â”€â”€ */
  const fetchTorneos = async (disciplina, silent = false) => {
    if (!user?.id) return;
    if (!silent) setLoading(true);
    try {
      // 1. Torneio activo
      const torneioRes  = await fetch(`${API_BASE}/api/torneios/ativo`);
      const torneioData = await torneioRes.json();

      if (!torneioData.ativo || !torneioData.torneio) {
        setTorneios([]);
        setSelectedTorneio(null);
        setRanking([]);
        setUserStats(null);
        return;
      }

      const torneioAtivo = torneioData.torneio;
      setTorneios([torneioAtivo]);
      setSelectedTorneio(torneioAtivo);

      // 2. Ranking da disciplina
      const rankingRes  = await fetch(`${API_BASE}/api/participantes/ranking/${encodeURIComponent(disciplina)}`);
      const rankingData = await rankingRes.json();
      setRanking(rankingData.data || []);

      // 3. ParticipaÃ§Ã£o do utilizador
      try {
        const partRes  = await fetch(`${API_BASE}/api/participantes/usuario/${user.id}/${encodeURIComponent(disciplina)}`);
        const partData = await partRes.json();
        setUserStats(partData.success ? partData.data : null);
      } catch {
        setUserStats(null);
      }
    } catch (error) {
      console.error('Erro ao buscar torneios:', error);
      if (!silent) {
        setModalMessage('Erro ao carregar dados do torneio. Tente novamente.');
        setModalType('error');
        setShowModal(true);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTorneos(activeDiscipline);
  }, [activeDiscipline, user?.id]);

  /* â”€â”€ Socket.io â€” ranking em tempo real â”€â”€ */
  useEffect(() => {
    const handleRankingUpdate = (data) => {
      const torneio = selectedTorneioRef.current;
      if (!torneio || String(data.torneio_id) !== String(torneio.id)) return;
      if (data.disciplina && data.disciplina !== activeDisciplineRef.current) return;

      if (data.ranking && Array.isArray(data.ranking)) {
        setRanking(data.ranking);
      } else {
        fetchTorneos(activeDisciplineRef.current, true);
      }
    };

    const handleParticipantUpdate = (data) => {
      if (!data.participante) return;
      if (data.participante.usuario_id === user?.id) {
        setUserStats(prev => prev ? { ...prev, ...data.participante } : data.participante);
      }
    };

    socket.on('ranking_update', handleRankingUpdate);
    socket.on('participant_update', handleParticipantUpdate);
    return () => {
      socket.off('ranking_update', handleRankingUpdate);
      socket.off('participant_update', handleParticipantUpdate);
    };
  }, [user?.id]);

  const getDisciplinaColor = (disciplina) => {
    switch(disciplina) {
      case 'MatemÃ¡tica': return '#3b82f6';
      case 'InglÃªs': return '#10b981';
      case 'ProgramaÃ§Ã£o': return '#a855f7';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'NÃ£o definida';
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
        <p className="text-gray-300">Participe de torneios e compete com outros usuÃ¡rios</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Disciplinas */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 lg:sticky lg:top-24">
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
        <div className="flex-1 space-y-6 min-w-0">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 rounded p-3 sm:p-4">
                  <Clock className="w-5 h-5 mb-2 text-blue-400" />
                  <p className="text-sm text-gray-400">InÃ­cio</p>
                  <p className="font-semibold">{formatDate(selectedTorneio.inicia_em)}</p>
                </div>
                <div className="bg-gray-900 rounded p-4">
                  <Clock className="w-5 h-5 mb-2 text-green-400" />
                  <p className="text-sm text-gray-400">TÃ©rmino</p>
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
                    'matemÃ¡tica': '/matematica-original',
                    'inglÃªs': '/ingles-original',
                    'programaÃ§Ã£o': '/programacao-original'
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
              <h3 className="text-xl font-bold mb-2">Nenhum Torneio DisponÃ­vel</h3>
              <p className="text-gray-300">
                NÃ£o hÃ¡ torneios ativos de {activeDiscipline} no momento.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Volte mais tarde ou verifique outras disciplinas.
              </p>
            </div>
          )}

          {/* Ranking e Minha EstatÃ­stica */}
          {selectedTorneio && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meus Dados */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="text-yellow-400" />
                  Minha ParticipaÃ§Ã£o
                </h3>
                {userStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                      <span className="text-gray-400 text-sm">Sua PontuaÃ§Ã£o</span>
                      <span className="text-2xl font-bold text-blue-400">{userStats.pontuacao || 0} pts</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                      <span className="text-gray-400 text-sm">Sua PosiÃ§Ã£o</span>
                      <span className="text-xl font-bold text-yellow-400">
                        {userStats.posicao != null ? `#${userStats.posicao}` : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                      <span className="text-gray-400 text-sm">NÃ­vel Atual</span>
                      <span className="capitalize font-semibold text-purple-400">{userStats.nivel_atual || 'Iniciante'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                      <span className="text-gray-400 text-sm">PrecisÃ£o</span>
                      <span className="font-semibold text-green-400">{userStats.precisao || 0}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-900 rounded border border-dashed border-gray-700">
                    <p className="text-gray-400">VocÃª ainda nÃ£o estÃ¡ participando deste torneio.</p>
                    <p className="text-xs text-gray-500 mt-1">Inicie o torneio para comeÃ§ar a competir!</p>
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
                    ranking.slice(0, 5).map((item, index) => {
                      const isMe = item.usuario_id === user?.id || item.usuario?.id === user?.id;
                      return (
                      <div key={item.id || index}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          isMe
                            ? 'bg-blue-600/30 border-l-4 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                            : 'bg-gray-900 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-700 text-white'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex flex-col">
                            <span className={`font-medium ${isMe ? 'text-blue-300 font-bold' : ''}`}>
                              {item.usuario?.nome || 'AnÃ´nimo'}
                            </span>
                            {isMe && (
                              <span className="text-[10px] text-blue-400 font-bold leading-none">â— vocÃª</span>
                            )}
                          </div>
                        </div>
                        <span className={`font-bold ${isMe ? 'text-blue-300' : 'text-blue-400'}`}>
                          {item.pontuacao} pts
                        </span>
                      </div>
                      );
                    })
                  ) : (
                    <p className="text-center py-8 text-gray-500">Nenhum competidor ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Feedback â€” padronizado com ComaesModal */}
      <ComaesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'success' ? 'Sucesso!' : modalType === 'error' ? 'Erro!' : 'InformaÃ§Ã£o'}
        icon={modalType === 'success' ? <CheckCircle2 size={18} /> : modalType === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
        iconBg={modalType === 'success' ? 'bg-green-100' : modalType === 'error' ? 'bg-red-100' : 'bg-blue-100'}
        iconColor={modalType === 'success' ? 'text-green-600' : modalType === 'error' ? 'text-red-600' : 'text-blue-600'}
        maxWidth="max-w-sm"
        footer={<ModalBtnPrimary onClick={() => setShowModal(false)}>OK</ModalBtnPrimary>}
      >
        <p className="text-gray-600 text-sm text-center leading-relaxed py-2">{modalMessage}</p>
      </ComaesModal>
    </div>
  );
};

export default Torneios;