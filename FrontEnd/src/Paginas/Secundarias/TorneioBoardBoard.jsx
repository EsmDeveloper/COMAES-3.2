import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Loader, AlertCircle, Filter } from 'lucide-react';
import './TorneioBoardBoard.css';

export default function TorneioBoardBoard({ tournamentId }) {
  const [ranking, setRanking] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState('Matemática');
  const [disciplines, setDisciplines] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const medalIcons = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentData();
      fetchRanking();
      
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchRanking, 10000);
      setRefreshInterval(interval);

      return () => clearInterval(interval);
    }
  }, [tournamentId]);

  useEffect(() => {
    if (tournamentId && selectedDiscipline) {
      fetchRanking();
    }
  }, [selectedDiscipline]);

  const fetchTournamentData = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTournament(data.tournament || data);

        // Extract disciplines from the response
        if (data.disciplines) {
          setDisciplines(data.disciplines);
          if (data.disciplines.length > 0) {
            setSelectedDiscipline(data.disciplines[0]);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do torneio:', err);
    }
  };

  const fetchRanking = async () => {
    try {
      setError(null);
      const url = selectedDiscipline
        ? `/api/tournaments/${tournamentId}/ranking/${selectedDiscipline}`
        : `/api/tournaments/${tournamentId}/ranking?includeInactive=false`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar ranking');
      }

      const data = await response.json();
      const rankingData = data.ranking || [];

      // Add position to each participant
      const rankedData = rankingData.map((participant, index) => ({
        ...participant,
        posicao: participant.posicao || index + 1,
      }));

      setRanking(rankedData);
      setTournament(data.tournament || tournament);
    } catch (err) {
      console.error('Erro ao buscar ranking:', err);
      setError('Não foi possível carregar o ranking');
    } finally {
      setLoading(false);
    }
  };

  const formatPoints = (points) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(points || 0);
  };

  const getMedalClass = (position) => {
    if (position === 1) return 'medal-1';
    if (position === 2) return 'medal-2';
    if (position === 3) return 'medal-3';
    return '';
  };

  if (!tournamentId) {
    return (
      <div className="torneioBoardBoard">
        <div className="no-tournament">
          <AlertCircle size={48} />
          <p>Nenhum torneio selecionado</p>
        </div>
      </div>
    );
  }

  if (loading && ranking.length === 0) {
    return (
      <div className="torneioBoardBoard">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="torneioBoardBoard">
      {/* HEADER */}
      <div className="boardBoard-header">
        <div className="header-content">
          <Trophy size={40} className="header-icon" />
          <div>
            <h1>Ranking ao Vivo</h1>
            {tournament && <p>{tournament.titulo}</p>}
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* DISCIPLINE FILTER */}
      {disciplines.length > 0 && (
        <div className="filter-section">
          <div className="filter-label">
            <Filter size={18} />
            <span>Filtrar por Disciplina:</span>
          </div>
          <div className="filter-buttons">
            {disciplines.map(discipline => (
              <button
                key={discipline}
                className={`filter-btn ${selectedDiscipline === discipline ? 'active' : ''}`}
                onClick={() => setSelectedDiscipline(discipline)}
              >
                {discipline}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LEADERBOARD */}
      <div className="leaderboard-container">
        {ranking.length === 0 ? (
          <div className="empty-ranking">
            <Trophy size={48} />
            <p>Ainda não há participantes neste torneio</p>
          </div>
        ) : (
          <div className="leaderboard">
            {/* TOP 3 PODIUM */}
            {ranking.length >= 1 && (
              <div className="podium">
                {ranking[1] && (
                  <div className="podium-position podium-2">
                    <div className="podium-medal">🥈</div>
                    <div className="podium-info">
                      <p className="podium-position-number">2º</p>
                      <div className="podium-avatar">
                        {ranking[1].usuario?.imagem ? (
                          <img src={ranking[1].usuario.imagem} alt={ranking[1].usuario?.nome} />
                        ) : (
                          <div className="avatar-placeholder">👤</div>
                        )}
                      </div>
                      <p className="podium-name">{ranking[1].usuario?.nome || 'Participante'}</p>
                      <p className="podium-points">{formatPoints(ranking[1].pontuacao)} pontos</p>
                    </div>
                  </div>
                )}

                {ranking[0] && (
                  <div className="podium-position podium-1">
                    <div className="podium-medal">🥇</div>
                    <div className="podium-info">
                      <p className="podium-position-number">1º</p>
                      <div className="podium-avatar">
                        {ranking[0].usuario?.imagem ? (
                          <img src={ranking[0].usuario.imagem} alt={ranking[0].usuario?.nome} />
                        ) : (
                          <div className="avatar-placeholder">👤</div>
                        )}
                      </div>
                      <p className="podium-name">{ranking[0].usuario?.nome || 'Participante'}</p>
                      <p className="podium-points">{formatPoints(ranking[0].pontuacao)} pontos</p>
                    </div>
                  </div>
                )}

                {ranking[2] && (
                  <div className="podium-position podium-3">
                    <div className="podium-medal">🥉</div>
                    <div className="podium-info">
                      <p className="podium-position-number">3º</p>
                      <div className="podium-avatar">
                        {ranking[2].usuario?.imagem ? (
                          <img src={ranking[2].usuario.imagem} alt={ranking[2].usuario?.nome} />
                        ) : (
                          <div className="avatar-placeholder">👤</div>
                        )}
                      </div>
                      <p className="podium-name">{ranking[2].usuario?.nome || 'Participante'}</p>
                      <p className="podium-points">{formatPoints(ranking[2].pontuacao)} pontos</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TABLE FOR REMAINING PARTICIPANTS */}
            {ranking.length > 3 && (
              <div className="ranking-table">
                <div className="table-header">
                  <div className="col-position">Posição</div>
                  <div className="col-participant">Participante</div>
                  <div className="col-level">Nível</div>
                  <div className="col-xp">XP</div>
                  <div className="col-points">Pontos</div>
                </div>

                {ranking.slice(3).map((participant, index) => (
                  <div
                    key={participant.id || index}
                    className={`table-row ${getMedalClass(participant.posicao)}`}
                  >
                    <div className="col-position">
                      <span className="position-number">#{participant.posicao}</span>
                    </div>
                    <div className="col-participant">
                      <div className="participant-info">
                        {participant.usuario?.imagem ? (
                          <img
                            src={participant.usuario.imagem}
                            alt={participant.usuario?.nome}
                            className="participant-avatar"
                          />
                        ) : (
                          <div className="participant-avatar placeholder">👤</div>
                        )}
                        <span className="participant-name">
                          {participant.usuario?.nome || 'Participante'}
                        </span>
                      </div>
                    </div>
                    <div className="col-level">
                      <span className="level-badge">
                        Nível {participant.usuario?.nivel_atual || 1}
                      </span>
                    </div>
                    <div className="col-xp">
                      <div className="xp-display">
                        <Zap size={14} />
                        {formatPoints(participant.usuario?.xp_total || 0)}
                      </div>
                    </div>
                    <div className="col-points">
                      <span className="points-value">{formatPoints(participant.pontuacao)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* INFO BOX */}
      <div className="info-section">
        <p>
          <strong>💡 Dica:</strong> O ranking é atualizado automaticamente a cada 10 segundos. Resova
          mais questões para melhorar sua posição!
        </p>
      </div>
    </div>
  );
}
