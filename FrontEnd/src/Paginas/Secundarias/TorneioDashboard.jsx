import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy, Filter, AlertCircle, Loader } from 'lucide-react';
import TournamentRegistrationModal from '../../components/TournamentRegistrationModal';
import './TorneioDashboard.css';

export default function TorneioDashboard() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [participantCounts, setParticipantCounts] = useState({});
  const [userActiveParticipation, setUserActiveParticipation] = useState(null);

  const disciplines = [
    { id: 'all', name: 'Todos', color: '#6366f1' },
    { id: 'Matemática', name: 'Matemática', color: '#3b82f6' },
    { id: 'Inglês', name: 'Inglês', color: '#10b981' },
    { id: 'Programação', name: 'Programação', color: '#f59e0b' },
  ];

  // Fetch tournaments on mount
  useEffect(() => {
    fetchTournaments();
    checkUserActiveParticipation();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tournaments', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Erro ao carregar torneios');

      const data = await response.json();
      const activeTournaments = (data.tournaments || []).filter(t => t.status === 'ativo');

      setTournaments(activeTournaments);

      // Fetch participant counts for each tournament
      for (const tournament of activeTournaments) {
        await fetchParticipantCounts(tournament.id);
      }
    } catch (err) {
      console.error('Erro:', err);
      setError('Não foi possível carregar os torneios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantCounts = async (tournamentId) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/participant-counts`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setParticipantCounts(prev => ({
          ...prev,
          [tournamentId]: data.counts || { total: 0 },
        }));
      }
    } catch (err) {
      console.error(`Erro ao buscar contagem para torneio ${tournamentId}:`, err);
    }
  };

  const checkUserActiveParticipation = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;

      const response = await fetch(`/api/tournaments/usuario/${userId}/participacao-ativa`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ativo) {
          setUserActiveParticipation(data);
        }
      }
    } catch (err) {
      console.error('Erro ao verificar participação ativa:', err);
    }
  };

  const handleJoinTournament = (tournament) => {
    if (userActiveParticipation && userActiveParticipation.ativo) {
      setError(
        `Você já está participando do torneio "${userActiveParticipation.torneio.titulo}". Conclua-o antes de se inscrever em outro.`
      );
      return;
    }

    setSelectedTournament(tournament);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    setSelectedTournament(null);
    checkUserActiveParticipation();
    setError(null);
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (selectedDiscipline === 'all') return true;
    if (tournament.tipo_torneio === 'generico') return true;
    return tournament.disciplina_especifica === selectedDiscipline;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTournamentStatus = (tournament) => {
    const now = new Date();
    const endDate = new Date(tournament.termina_em);

    if (endDate < now) {
      return { status: 'encerrado', label: 'Encerrado', className: 'status-ended' };
    }

    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 1) {
      return { status: 'ending', label: `Termina em ${daysLeft}d`, className: 'status-ending' };
    }

    return { status: 'active', label: 'Ativo', className: 'status-active' };
  };

  if (loading) {
    return (
      <div className="torneioDashboard">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Carregando torneios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="torneioDashboard">
      {/* HEADER */}
      <div className="header">
        <div className="header-content">
          <Trophy size={48} className="header-icon" />
          <div>
            <h1>Descobrir Torneios</h1>
            <p>Participe em competições e ganhe certificados</p>
          </div>
        </div>
      </div>

      {/* ACTIVE PARTICIPATION ALERT */}
      {userActiveParticipation && userActiveParticipation.ativo && (
        <div className="active-participation-alert">
          <Trophy size={20} />
          <div>
            <strong>Participação Ativa</strong>
            <p>Você está participando em "{userActiveParticipation.torneio.titulo}" na disciplina de {userActiveParticipation.disciplina}</p>
          </div>
        </div>
      )}

      {/* ERROR ALERT */}
      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* DISCIPLINE FILTER */}
      <div className="filter-section">
        <div className="filter-header">
          <Filter size={20} />
          <h3>Filtrar por Disciplina</h3>
        </div>
        <div className="discipline-filters">
          {disciplines.map(discipline => (
            <button
              key={discipline.id}
              className={`filter-btn ${selectedDiscipline === discipline.id ? 'active' : ''}`}
              style={
                selectedDiscipline === discipline.id
                  ? { backgroundColor: discipline.color, color: 'white' }
                  : {}
              }
              onClick={() => setSelectedDiscipline(discipline.id)}
            >
              {discipline.name}
            </button>
          ))}
        </div>
      </div>

      {/* TOURNAMENTS LIST */}
      <div className="tournaments-section">
        <h2>Torneios Disponíveis</h2>

        {filteredTournaments.length === 0 ? (
          <div className="no-tournaments">
            <Trophy size={48} />
            <p>Nenhum torneio disponível no momento</p>
            <small>Volte em breve para conferir novas competições</small>
          </div>
        ) : (
          <div className="tournaments-grid">
            {filteredTournaments.map(tournament => {
              const tourStatus = getTournamentStatus(tournament);
              const counts = participantCounts[tournament.id] || { total: 0 };

              return (
                <div key={tournament.id} className="tournament-card">
                  <div className="card-header">
                    <div className="tournament-title">
                      <h3>{tournament.titulo}</h3>
                      <span className={`status-badge ${tourStatus.className}`}>
                        {tourStatus.label}
                      </span>
                    </div>
                  </div>

                  <p className="tournament-description">{tournament.descricao}</p>

                  <div className="tournament-info">
                    <div className="info-item">
                      <Calendar size={16} />
                      <div>
                        <small>Início</small>
                        <p>{formatDate(tournament.inicia_em)}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <Calendar size={16} />
                      <div>
                        <small>Término</small>
                        <p>{formatDate(tournament.termina_em)}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <Users size={16} />
                      <div>
                        <small>Participantes</small>
                        <p>{counts.total || 0}</p>
                      </div>
                    </div>
                  </div>

                  {tournament.tipo_torneio === 'especifico' && (
                    <div className="tournament-type">
                      <span className="type-badge">
                        Disciplina: {tournament.disciplina_especifica}
                      </span>
                    </div>
                  )}

                  <button
                    className={`join-btn ${
                      tourStatus.status === 'encerrado' || tourStatus.status === 'ending'
                        ? 'disabled'
                        : ''
                    }`}
                    onClick={() => handleJoinTournament(tournament)}
                    disabled={tourStatus.status === 'encerrado'}
                  >
                    {tourStatus.status === 'encerrado' ? 'Torneio Encerrado' : 'Participar'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REGISTRATION MODAL */}
      {showRegistrationModal && selectedTournament && (
        <TournamentRegistrationModal
          tournament={selectedTournament}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
}
