import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaMedal, FaAward, FaTimes, FaCrown, FaEye, FaDownload, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CertificateViewer from './certificates/CertificateViewer';
import logotipo from '../assets/logotipo.png';

export default function TournamentFinishedModal({
  isOpen,
  onClose,
  tournament,
  userParticipation,
  onCertificateGenerated
}) {
  const [showModal, setShowModal] = useState(isOpen);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [top3Winners, setTop3Winners] = useState([]);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowModal(isOpen);
    
    // Buscar top 3 vencedores se o modal abrir e não for top 3
    if (isOpen && userParticipation && userParticipation.posicao > 3) {
      fetchTop3Winners();
    }
  }, [isOpen]);

  const fetchTop3Winners = async () => {
    if (!tournament || !userParticipation) return;

    setLoadingWinners(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/torneios/${tournament.id}/top3/${userParticipation.disciplina_competida}`
      );

      if (response.ok) {
        const data = await response.json();
        setTop3Winners(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar vencedores:', error);
    } finally {
      setLoadingWinners(false);
    }
  };

  if (!showModal || !tournament) return null;

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewRanking = () => {
    // Redirecionar para página de ranking com o torneio específico
    navigate(`/ranking?tournament=${tournament.id}`);
    onClose();
  };

  const handleViewCertificate = async () => {
    if (!userParticipation) return;

    setIsGeneratingCertificate(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/certificates/preview/${tournament.id}?userId=${userParticipation.usuario_id}&disciplina=${userParticipation.disciplina_competida}`);

      if (response.ok) {
        const data = await response.json();
        setCertificateData({
          certificateURL: data.certificateURL,
          certificateCode: data.certificateCode,
          userName: userParticipation.usuario?.nome || 'Participante',
          tournamentName: tournament.titulo,
          disciplina: userParticipation.disciplina_competida,
          position: userParticipation.posicao,
          score: userParticipation.pontuacao
        });
        setShowCertificate(true);

        if (onCertificateGenerated) {
          onCertificateGenerated(data);
        }
      } else {
        console.error('Erro ao gerar certificado:', response.statusText);
        alert('Erro ao gerar certificado. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      alert('Erro ao gerar certificado. Tente novamente.');
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const handleCloseCertificate = () => {
    setShowCertificate(false);
    setCertificateData(null);
  };

  // Renderizar modal para vencedores (top 3)
  const isWinner = userParticipation && userParticipation.posicao <= 3;

  return (
    <>
      <AnimatePresence>
        {showModal && !showCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-2xl w-full"
            >
              {/* Botão fechar */}
              <button
                onClick={onClose}
                className="absolute -top-12 right-0 text-white hover:text-blue-300 transition-colors flex items-center gap-2 z-10"
              >
                <FaTimes /> Fechar
              </button>

              {/* Modal PARA VENCEDORES (TOP 3) */}
              {isWinner ? (
                <div className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-500">
                  {/* Cabeçalho para Vencedores */}
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-8 text-center relative overflow-hidden">
                    {/* Elementos decorativos */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20">
                      <div className="absolute top-4 left-4 text-8xl">🏆</div>
                      <div className="absolute top-4 right-4 text-8xl">🎉</div>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-6xl">✨</div>
                    </div>

                    <div className="flex justify-center mb-4 relative z-10 text-6xl">
                      {userParticipation.posicao === 1 && '🥇'}
                      {userParticipation.posicao === 2 && '🥈'}
                      {userParticipation.posicao === 3 && '🥉'}
                    </div>

                    <h1 className="text-5xl font-bold mb-3 relative z-10">
                      {userParticipation.posicao === 1 && 'VOCÊ É CAMPEÃO!'}
                      {userParticipation.posicao === 2 && 'VICE-CAMPEÃO!'}
                      {userParticipation.posicao === 3 && 'TOP 3 - MEDALHISTA!'}
                    </h1>
                    <p className="text-yellow-100 text-lg mb-2">{tournament.titulo}</p>
                    <p className="text-sm text-yellow-200">
                      Finalizado em {formatarData(tournament.termina_em || new Date())}
                    </p>
                  </div>

                  {/* Conteúdo para Vencedores */}
                  <div className="p-8">
                    {/* Resumo dos Resultados */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border-2 border-yellow-300">
                      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        {userParticipation.posicao === 1 && '🏅 Você conquistou o 1º lugar!'}
                        {userParticipation.posicao === 2 && '🎖️ Você conquistou o 2º lugar!'}
                        {userParticipation.posicao === 3 && '🏵️ Você conquistou o 3º lugar!'}
                      </h3>

                      {userParticipation && (
                        <div className="text-center space-y-3">
                          <p className="text-gray-700 text-lg">
                            <span className="font-bold">Sua posição:</span>
                            <span className="text-3xl font-bold text-orange-600 ml-3">
                              {userParticipation.posicao}º lugar
                            </span>
                          </p>
                          <p className="text-gray-700 text-lg">
                            <span className="font-bold">Pontuação final:</span>
                            <span className="text-2xl font-bold text-green-600 ml-3">
                              {userParticipation.pontuacao} pontos
                            </span>
                          </p>
                          <p className="text-gray-700 text-lg">
                            <span className="font-bold">Disciplina:</span>
                            <span className="font-bold text-purple-600 ml-3">
                              {userParticipation.disciplina_competida}
                            </span>
                          </p>
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-white rounded-lg border-2 border-yellow-200">
                        <p className="text-center text-gray-700 font-semibold"></p>
                        {userParticipation.posicao === 1 && (
                          <p className="text-center text-lg">
                            Você é a <span className="font-bold text-orange-600">ESTRELA</span> deste torneio! Seu desempenho foi {' '} 
                            <span className="font-bold text-green-600">EXTRAORDINÁRIO</span>!
                          </p>
                        )}
                        {userParticipation.posicao === 2 && (
                          <p className="text-center text-lg">
                            Você chegou muito perto! Seu esforço foi {' '}
                            <span className="font-bold text-green-600">ADMIRÁVEL</span>!
                          </p>
                        )}
                        {userParticipation.posicao === 3 && (
                          <p className="text-center text-lg">
                            Você foi fantástico! Seu desempenho foi {' '}
                            <span className="font-bold text-green-600">EXCELENTE</span>!
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação para Vencedores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewCertificate}
                        disabled={isGeneratingCertificate}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingCertificate ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Gerando Certificado...
                          </>
                        ) : (
                          <>
                            <FaDownload className="text-xl" />
                            Meu Certificado
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewRanking}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                      >
                        <FaTrophy className="text-xl" />
                        Ver Ranking
                      </motion.button>
                    </div>

                    {/* Mensagem adicional para vencedores */}
                    <div className="mt-6 text-center">
                      <p className="text-gray-600 font-semibold">Compartilhe seu sucesso com seus amigos! 🎉</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Modal PARA NÃO-CLASSIFICADOS */
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-600">
                  {/* Cabeçalho para Não-Classificados */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                      <div className="absolute top-4 left-4 text-6xl">🏆</div>
                      <div className="absolute top-4 right-4 text-6xl">🎯</div>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-4xl">⚡</div>
                    </div>

                    <h1 className="text-4xl font-bold mb-3 relative z-10">TORNEIO FINALIZADO</h1>
                    <p className="text-blue-100 text-lg mb-2">{tournament.titulo}</p>
                    <p className="text-sm text-blue-200">
                      Finalizado em {formatarData(tournament.termina_em || new Date())}
                    </p>
                  </div>

                  {/* Conteúdo para Não-Classificados */}
                  <div className="p-8">
                    {/* Resumo da Posição */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
                      <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Obrigado por Participar!</h3>

                      {userParticipation && (
                        <div className="text-center space-y-4">
                          <p className="text-gray-700 text-lg">
                            <span className="font-semibold">Sua posição final:</span>
                            <span className="text-3xl font-bold text-blue-600 ml-3 block">
                              {userParticipation.posicao}º lugar
                            </span>
                          </p>
                          <p className="text-gray-700 text-lg">
                            <span className="font-semibold">Pontos conquistados:</span>
                            <span className="text-2xl font-bold text-green-600 ml-3">
                              {userParticipation.pontuacao}
                            </span>
                          </p>
                          <p className="text-gray-600">
                            Seu desempenho foi registrado e contribuiu para o sucesso do torneio!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Vencedores */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border-2 border-yellow-300">
                      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        🏆 Nossos Vencedores 🏆
                      </h3>

                      {loadingWinners ? (
                        <div className="text-center py-8">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-gray-600 mt-2">Carregando vencedores...</p>
                        </div>
                      ) : top3Winners.length > 0 ? (
                        <div className="space-y-3">
                          {top3Winners.map((winner, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-white rounded-lg p-4 border-l-4"
                              style={{
                                borderColor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-4xl">{winner.medal}</div>
                                <div className="flex-1">
                                  <p className="font-bold text-lg text-gray-800">{winner.nome}</p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-semibold">{winner.pontuacao}</span> pontos
                                  </p>
                                </div>
                                <div className="text-right">
                                  {idx === 0 && <span className="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold">CAMPEÃO</span>}
                                  {idx === 1 && <span className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-bold">2º LUGAR</span>}
                                  {idx === 2 && <span className="text-xs bg-orange-200 text-orange-800 px-3 py-1 rounded-full font-bold">3º LUGAR</span>}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-600">Vencedores não disponíveis</p>
                      )}
                    </div>

                    {/* Botões de Ação para Não-Classificados */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewRanking}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                      >
                        <FaTrophy className="text-xl" />
                        Ver Ranking Completo
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl"
                      >
                        <FaTimes className="text-xl" />
                        Voltar ao Menu
                      </motion.button>
                    </div>

                    {/* Mensagem de incentivo */}
                    <div className="mt-6 text-center">
                      <p className="text-gray-700 font-semibold mb-2">Não desista! 💪</p>
                      <p className="text-gray-600">
                        Participe de outros torneios para melhorar suas habilidades e competir pelos primeiros lugares!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal do Certificado com preview angular */}
      <AnimatePresence>
        {showCertificate && certificateData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotateY: -15 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotateY: -15 }}
              className="relative max-w-4xl w-full"
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Botão fechar */}
              <button
                onClick={handleCloseCertificate}
                className="absolute -top-12 right-0 text-white hover:text-blue-300 transition-colors flex items-center gap-2 z-10"
              >
                <FaTimes /> Fechar
              </button>

              {/* Container do certificado com leve ângulo */}
              <div
                className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  transform: 'rotateY(-5deg) rotateX(2deg)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
              >
                <CertificateViewer
                  certificateURL={certificateData.certificateURL}
                  certificateCode={certificateData.certificateCode}
                  userName={certificateData.userName}
                  tournamentName={certificateData.tournamentName}
                  disciplina={certificateData.disciplina}
                  position={certificateData.position}
                  score={certificateData.score}
                  onClose={handleCloseCertificate}
                  modalMode={true}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}