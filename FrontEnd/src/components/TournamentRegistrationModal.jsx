import React, { useState } from 'react';
import { X, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import './TournamentRegistrationModal.css';

export default function TournamentRegistrationModal({ tournament, onClose, onSuccess }) {
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const disciplines = ['Matemática', 'Inglês', 'Programação'];

  // If tournament has specific discipline, pre-select it
  React.useEffect(() => {
    if (tournament.tipo_torneio === 'especifico') {
      setSelectedDiscipline(tournament.disciplina_especifica);
    }
  }, [tournament]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedDiscipline) {
      setError('Selecione uma disciplina para continuar');
      return;
    }

    try {
      setLoading(true);

      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('Você não está autenticado');
        return;
      }

      const response = await fetch(`/api/tournaments/${tournament.id}/inscrever`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          torneio_id: tournament.id,
          usuario_id: userId,
          disciplina_competida: selectedDiscipline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erro ao se inscrever no torneio');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao se inscrever. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <h2>Participar no Torneio</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {success ? (
            <div className="success-state">
              <CheckCircle size={64} className="success-icon" />
              <h3>Inscrição Confirmada!</h3>
              <p>Você foi inscrito com sucesso em "{tournament.titulo}"</p>
              <p className="success-discipline">Disciplina: <strong>{selectedDiscipline}</strong></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* TOURNAMENT INFO */}
              <div className="tournament-info-box">
                <h3>{tournament.titulo}</h3>
                <p>{tournament.descricao}</p>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              {/* DISCIPLINE SELECTION */}
              <div className="form-group">
                <label htmlFor="discipline">
                  Selecione a Disciplina
                  {tournament.tipo_torneio === 'especifico' && (
                    <span className="required">(Este torneio é específico)</span>
                  )}
                </label>
                {tournament.tipo_torneio === 'especifico' ? (
                  <div className="discipline-display">
                    <div className="discipline-option selected">
                      <span className="discipline-name">{tournament.disciplina_especifica}</span>
                      <span className="discipline-badge">Única disponível</span>
                    </div>
                  </div>
                ) : (
                  <div className="discipline-options">
                    {disciplines.map(discipline => (
                      <label key={discipline} className="discipline-option">
                        <input
                          type="radio"
                          name="discipline"
                          value={discipline}
                          checked={selectedDiscipline === discipline}
                          onChange={e => setSelectedDiscipline(e.target.value)}
                          disabled={loading}
                        />
                        <span className="discipline-name">{discipline}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* INFO BOX */}
              <div className="info-box">
                <p>
                  <strong>Importante:</strong> Ao participar neste torneio, você não poderá se inscrever em outro torneio ativo.
                  Complete ou termine este torneio primeiro.
                </p>
              </div>

              {/* BUTTONS */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !selectedDiscipline}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="spinner" />
                      Inscrevendo...
                    </>
                  ) : (
                    'Confirmar Inscrição'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
