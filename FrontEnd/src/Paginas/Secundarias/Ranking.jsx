import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaTrophy, FaMedal, FaAward, FaCrown, FaArrowLeft, FaFilter } from 'react-icons/fa';
import Layout from './Layout';

export default function Ranking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(searchParams.get('tournament') || '');
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    loadTournaments();
    if (selectedTournament) {
      loadRanking(selectedTournament);
    } else {
      setLoading(false);
    }
  }, [selectedTournament]);

  const loadTournaments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/tournaments`);
      if (response.ok) {
        const data = await response.json();
        setTournaments(data.tournaments || []);
      }
    } catch (error) {
      console.error('Erro ao carregar torneios:', error);
    }
  };

  const loadRanking = async (tournamentId) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/tournaments/${tournamentId}/ranking`);
      if (response.ok) {
        const data = await response.json();
        setRanking(data.ranking || []);
        setTournament(data.tournament);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentChange = (tournamentId) => {
    setSelectedTournament(tournamentId);
    navigate(`/ranking?tournament=${tournamentId}`);
  };

  const getMedalha = (posicao) => {
    switch (posicao) {
      case 1: return { icone: <FaCrown className="text-yellow-500" />, cor: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-100' };
      case 2: return { icone: <FaMedal className="text-gray-400" />, cor: 'from-gray-300 to-gray-500', bg: 'bg-gray-100' };
      case 3: return { icone: <FaAward className="text-amber-600" />, cor: 'from-amber-500 to-amber-700', bg: 'bg-amber-100' };
      default: return { icone: <FaTrophy className="text-blue-500" />, cor: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' };
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
            >
              <FaArrowLeft /> Voltar
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Ranking dos Torneios</h1>
            <p className="text-gray-600">Veja a classificação dos melhores participantes</p>
          </div>

          {/* Seletor de Torneio */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <FaFilter className="text-blue-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">Selecionar Torneio</h2>
            </div>
            <select
              value={selectedTournament}
              onChange={(e) => handleTournamentChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione um torneio...</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.titulo} - {t.status === 'finalizado' ? 'Finalizado' : 'Em andamento'}
                </option>
              ))}
            </select>
          </div>

          {/* Ranking */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando ranking...</p>
            </div>
          ) : selectedTournament && tournament ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Informações do Torneio */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">{tournament.titulo}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                  <span>📚 Disciplina: {tournament.disciplina || 'Geral'}</span>
                  <span>📅 Finalizado em: {new Date(tournament.termina_em).toLocaleDateString('pt-PT')}</span>
                  <span>👥 Total de Participantes: {ranking.length}</span>
                </div>
              </div>

              {/* Lista de Ranking */}
              <div className="divide-y divide-gray-200">
                {ranking.length === 0 ? (
                  <div className="text-center py-12">
                    <FaTrophy className="text-gray-300 text-6xl mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum participante encontrado para este torneio.</p>
                  </div>
                ) : (
                  ranking.map((participante, index) => {
                    const medalha = getMedalha(participante.posicao);
                    const isTop3 = participante.posicao <= 3;

                    return (
                      <div
                        key={participante.id}
                        className={`p-6 hover:bg-gray-50 transition-colors ${isTop3 ? medalha.bg : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Posição */}
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${isTop3 ? `bg-gradient-to-r ${medalha.cor} text-white` : 'bg-gray-200 text-gray-700'} font-bold text-lg`}>
                            {participante.posicao <= 3 ? participante.posicao : `#${participante.posicao}`}
                          </div>

                          {/* Medalha para top 3 */}
                          {isTop3 && (
                            <div className="text-2xl">
                              {medalha.icone}
                            </div>
                          )}

                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {participante.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </div>

                          {/* Informações */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {participante.usuario?.nome || 'Participante'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {participante.disciplina_competida}
                            </p>
                          </div>

                          {/* Estatísticas */}
                          <div className="text-right">
                            <div className="font-bold text-xl text-blue-600">
                              {participante.pontuacao} pts
                            </div>
                            <div className="text-sm text-gray-500">
                              {participante.casos_resolvidos || 0} casos
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaTrophy className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500">Selecione um torneio para ver o ranking.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}