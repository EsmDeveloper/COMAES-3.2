import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  AlertCircle,
  Loader,
  Trophy,
  Calendar,
  Users,
  Settings,
} from 'lucide-react';
import './TorneioPanelAdmin.css';

export default function TorneioPanelAdmin() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTournamentsCount, setActiveTournamentsCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    inicia_em: '',
    termina_em: '',
    tipo_torneio: 'generico',
    disciplina_especifica: '',
  });

  useEffect(() => {
    fetchTournaments();
    checkActiveTournaments();
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
      setTournaments(data.tournaments || []);
    } catch (err) {
      console.error('Erro:', err);
      setError('Não foi possível carregar os torneios');
    } finally {
      setLoading(false);
    }
  };

  const checkActiveTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments/admin/torneios-ativos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setActiveTournamentsCount(data.quantidade || 0);
      }
    } catch (err) {
      console.error('Erro ao verificar torneios ativos:', err);
    }
  };

  const handleActivateTournament = async (tournamentId) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/ativar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Erro ao ativar torneio');
        return;
      }

      // Refresh data
      fetchTournaments();
      checkActiveTournaments();
      setError(null);
      alert('Torneio ativado com sucesso!');
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao ativar torneio');
    }
  };

  const handleFinalizeTournament = async (tournamentId) => {
    if (!window.confirm('Tem certeza que deseja finalizar este torneio? Certificados serão gerados para os top 3.')) {
      return;
    }

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Erro ao finalizar torneio');
        return;
      }

      const data = await response.json();

      // Show summary
      let summary = `Torneio finalizado com sucesso!\n\n`;
      if (data.resultados) {
        data.resultados.forEach(result => {
          summary += `${result.disciplina}: ${result.certificados_gerados} certificados gerados\n`;
        });
      }

      alert(summary);

      // Refresh data
      fetchTournaments();
      checkActiveTournaments();
      setError(null);
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao finalizar torneio');
    }
  };

  const getTournamentStatusBadge = (status) => {
    const statusMap = {
      rascunho: { label: 'Rascunho', className: 'status-draft' },
      agendado: { label: 'Agendado', className: 'status-scheduled' },
      ativo: { label: 'Ativo', className: 'status-active' },
      finalizado: { label: 'Finalizado', className: 'status-finished' },
      cancelado: { label: 'Cancelado', className: 'status-cancelled' },
    };
    const info = statusMap[status] || { label: status, className: 'status-default' };
    return info;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canActivateMore = activeTournamentsCount < 1;

  // ✅ NOVO: Função para criar torneio
  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      // ✅ DEBUG: Log what we're sending
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        inicia_em: formData.inicia_em,
        termina_em: formData.termina_em,
        tipo_torneio: formData.tipo_torneio,
        disciplina_especifica: formData.tipo_torneio === 'especifico' ? formData.disciplina_especifica : null,
      };
      console.log('📤 Enviando para backend:', payload);

      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('📥 Resposta do backend:', responseData);

      if (!response.ok) {
        setError(responseData.message || 'Erro ao criar torneio');
        return;
      }

      alert('Torneio criado com sucesso!');
      setShowCreateModal(false);
      setFormData({
        titulo: '',
        descricao: '',
        inicia_em: '',
        termina_em: '',
        tipo_torneio: 'generico',
        disciplina_especifica: '',
      });
      fetchTournaments();
    } catch (err) {
      console.error('❌ Erro ao criar torneio:', err);
      setError('Erro ao criar torneio');
    }
  };

  if (loading) {
    return (
      <div className="torneioPanelAdmin">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Carregando painel de torneios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="torneioPanelAdmin">
      {/* HEADER */}
      <div className="panel-header">
        <div className="header-content">
          <Trophy size={40} />
          <h1>Gerenciamento de Torneios</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Novo Torneio
        </button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ef4444' }}>
            <Trophy size={24} />
          </div>
          <div>
            <p className="stat-label">Torneios Ativos</p>
            <p className="stat-value">{activeTournamentsCount}/1</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f6' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="stat-label">Total de Torneios</p>
            <p className="stat-value">{tournaments.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="stat-label">Finalizados</p>
            <p className="stat-value">{tournaments.filter(t => t.status === 'finalizado').length}</p>
          </div>
        </div>
      </div>

      {/* TOURNAMENTS TABLE */}
      <div className="tournaments-section">
        <h2>Todos os Torneios</h2>

        {tournaments.length === 0 ? (
          <div className="empty-state">
            <Trophy size={48} />
            <p>Nenhum torneio criado ainda</p>
            <button className="btn-secondary" onClick={() => setShowCreateModal(true)}>
              Criar Primeiro Torneio
            </button>
          </div>
        ) : (
          <div className="tournaments-table">
            <div className="table-header">
              <div className="col-title">Título</div>
              <div className="col-type">Tipo</div>
              <div className="col-status">Status</div>
              <div className="col-dates">Datas</div>
              <div className="col-actions">Ações</div>
            </div>

            {tournaments.map(tournament => {
              const statusBadge = getTournamentStatusBadge(tournament.status);
              const isActive = tournament.status === 'ativo';
              const isFinished = tournament.status === 'finalizado';

              return (
                <div key={tournament.id} className="table-row">
                  <div className="col-title">
                    <div>
                      <p className="tournament-name">{tournament.titulo}</p>
                      <small className="tournament-desc">{tournament.descricao}</small>
                    </div>
                  </div>
                  <div className="col-type">
                    {tournament.tipo_torneio === 'especifico' ? (
                      <span className="type-badge">{tournament.disciplina_especifica}</span>
                    ) : (
                      <span className="type-badge generic">Genérico</span>
                    )}
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="col-dates">
                    <small>
                      {formatDate(tournament.inicia_em)} até{' '}
                      {formatDate(tournament.termina_em)}
                    </small>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-btn edit-btn"
                      title="Editar"
                      onClick={() => setSelectedTournament(tournament)}
                    >
                      <Edit size={18} />
                    </button>

                    {!isActive && !isFinished && canActivateMore && (
                      <button
                        className="action-btn activate-btn"
                        title="Ativar"
                        onClick={() => handleActivateTournament(tournament.id)}
                      >
                        <Play size={18} />
                      </button>
                    )}

                    {isActive && (
                      <button
                        className="action-btn finalize-btn"
                        title="Finalizar"
                        onClick={() => handleFinalizeTournament(tournament.id)}
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}

                    {isFinished && (
                      <button
                        className="action-btn info-btn"
                        title="Ver Certificados"
                        onClick={() => alert('Certificados do torneio')}
                      >
                        <Trophy size={18} />
                      </button>
                    )}

                    <button className="action-btn delete-btn" title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INFO BOX */}
      <div className="info-box">
        <h3>💡 Dicas de Gerenciamento</h3>
        <ul>
          <li>Apenas 1 torneio pode estar ativo por vez</li>
          <li>Ao finalizar um torneio, certificados são gerados automaticamente para os top 3</li>
          <li>Torneios específicos são restritos a uma disciplina</li>
          <li>Torneios genéricos permitem inscrição em qualquer disciplina</li>
        </ul>
      </div>

      {/* CREATE/EDIT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Torneio</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form className="tournament-form" onSubmit={handleCreateTournament}>
              {/* Título */}
              <div className="form-group">
                <label htmlFor="titulo">Título do Torneio *</label>
                <input
                  type="text"
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Ex: Torneio de Matemática 2024"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descreva o torneio"
                  rows="3"
                />
              </div>

              {/* Tipo de Torneio */}
              <div className="form-group">
                <label htmlFor="tipo_torneio">Tipo de Torneio *</label>
                <select
                  id="tipo_torneio"
                  value={formData.tipo_torneio}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      tipo_torneio: e.target.value,
                      disciplina_especifica: e.target.value === 'generico' ? '' : formData.disciplina_especifica
                    });
                  }}
                  required
                >
                  <option value="generico">Genérico (Múltiplas Disciplinas)</option>
                  <option value="especifico">Específico (Uma Disciplina)</option>
                </select>
              </div>

              {/* Disciplina Específica (aparece apenas se tipo for específico) */}
              {formData.tipo_torneio === 'especifico' && (
                <div className="form-group">
                  <label htmlFor="disciplina_especifica">Disciplina *</label>
                  <select
                    id="disciplina_especifica"
                    value={formData.disciplina_especifica}
                    onChange={(e) => setFormData({...formData, disciplina_especifica: e.target.value})}
                    required
                  >
                    <option value="">Selecione uma disciplina</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Inglês">Inglês</option>
                    <option value="Programação">Programação</option>
                  </select>
                </div>
              )}

              {/* Data Inicial */}
              <div className="form-group">
                <label htmlFor="inicia_em">Inicia em *</label>
                <input
                  type="datetime-local"
                  id="inicia_em"
                  value={formData.inicia_em}
                  onChange={(e) => setFormData({...formData, inicia_em: e.target.value})}
                  required
                />
              </div>

              {/* Data Final */}
              <div className="form-group">
                <label htmlFor="termina_em">Termina em *</label>
                <input
                  type="datetime-local"
                  id="termina_em"
                  value={formData.termina_em}
                  onChange={(e) => setFormData({...formData, termina_em: e.target.value})}
                  required
                />
              </div>

              {/* Botões */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Torneio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
