import React, { useState, useEffect } from 'react';
import { Award, Trophy, Download, CheckCircle, AlertCircle, Loader, Shield } from 'lucide-react';
import './Certificacoes.css';

export default function Certificacoes() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('tournament'); // 'tournament' or 'other'
  const [userId, setUserId] = useState(null);

  const medalIcons = {
    'Ouro': '🥇',
    'Prata': '🥈',
    'Bronze': '🥉',
    '1': '🥇',
    '2': '🥈',
    '3': '🥉',
  };

  const medalColors = {
    'Ouro': '#fbbf24',
    'Prata': '#c0c0c0',
    'Bronze': '#cd7f32',
    '1': '#fbbf24',
    '2': '#c0c0c0',
    '3': '#cd7f32',
  };

  useEffect(() => {
    const id = localStorage.getItem('user_id');
    setUserId(id);
    if (id) {
      fetchUserCertificates(id);
    }
  }, []);

  const fetchUserCertificates = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tournaments/certificados/usuario/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar certificados');
      }

      const data = await response.json();
      setCertificates(data.certificados || []);
    } catch (err) {
      console.error('Erro:', err);
      setError('Não foi possível carregar seus certificados');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificate) => {
    // This would trigger certificate download/printing
    // For now, we'll show a message
    alert(`Certificado de ${certificate.posicao}º lugar em "${certificate.torneio?.titulo}" será baixado`);
  };

  const getMedalDisplay = (posicao) => {
    if (posicao === 1) return { icon: '🥇', color: '#fbbf24', label: '1º Lugar' };
    if (posicao === 2) return { icon: '🥈', color: '#c0c0c0', label: '2º Lugar' };
    if (posicao === 3) return { icon: '🥉', color: '#cd7f32', label: '3º Lugar' };
    return { icon: '📜', color: '#667eea', label: 'Certificado' };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'validado':
        return { label: 'Validado', className: 'badge-validated', icon: <CheckCircle size={16} /> };
      case 'pendente':
        return { label: 'Pendente', className: 'badge-pending', icon: <AlertCircle size={16} /> };
      case 'cancelado':
        return { label: 'Cancelado', className: 'badge-cancelled', icon: <AlertCircle size={16} /> };
      default:
        return { label: status, className: 'badge-default', icon: null };
    }
  };

  const tournamentCertificates = certificates.filter(c => c.torneio);
  const otherCertificates = certificates.filter(c => !c.torneio);

  const displayedCertificates =
    selectedTab === 'tournament' ? tournamentCertificates : otherCertificates;

  if (loading) {
    return (
      <div className="certificacoes">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Carregando seus certificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="certificacoes">
      {/* HEADER */}
      <div className="header">
        <div className="header-content">
          <Award size={48} className="header-icon" />
          <div>
            <h1>Meus Certificados</h1>
            <p>Visualize e gerencie seus certificados de sucesso</p>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && !loading && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* TABS */}
      {(tournamentCertificates.length > 0 || otherCertificates.length > 0) && (
        <div className="tabs-section">
          <button
            className={`tab-btn ${selectedTab === 'tournament' ? 'active' : ''}`}
            onClick={() => setSelectedTab('tournament')}
          >
            <Trophy size={18} />
            <span>Torneios ({tournamentCertificates.length})</span>
          </button>
          {otherCertificates.length > 0 && (
            <button
              className={`tab-btn ${selectedTab === 'other' ? 'active' : ''}`}
              onClick={() => setSelectedTab('other')}
            >
              <Award size={18} />
              <span>Outros ({otherCertificates.length})</span>
            </button>
          )}
        </div>
      )}

      {/* EMPTY STATE */}
      {displayedCertificates.length === 0 && (
        <div className="empty-state">
          <Award size={64} className="empty-icon" />
          <h2>Nenhum Certificado</h2>
          <p>
            {selectedTab === 'tournament'
              ? 'Você ainda não tem certificados de torneios. Participe em torneios e termine no top 3 para ganhar!'
              : 'Você ainda não tem outros certificados'}
          </p>
        </div>
      )}

      {/* CERTIFICATES GRID */}
      {displayedCertificates.length > 0 && (
        <div className="certificates-grid">
          {displayedCertificates.map((certificate, index) => {
            const medalDisplay = getMedalDisplay(certificate.posicao);
            const statusBadge = getStatusBadge(certificate.status);
            const isAutoGenerated = certificate.auto_gerado;

            return (
              <div key={certificate.id || index} className="certificate-card">
                {/* MEDAL */}
                <div className="card-medal" style={{ '--medal-color': medalDisplay.color }}>
                  <span className="medal-icon">{medalDisplay.icon}</span>
                </div>

                {/* BADGE */}
                <div className={`status-badge ${statusBadge.className}`}>
                  {statusBadge.icon}
                  <span>{statusBadge.label}</span>
                </div>

                {/* AUTO-GENERATED BADGE */}
                {isAutoGenerated && (
                  <div className="auto-badge">
                    <Shield size={14} />
                    Auto-gerado
                  </div>
                )}

                {/* TOURNAMENT INFO */}
                <div className="card-content">
                  {certificate.torneio && (
                    <>
                      <h3 className="tournament-title">{certificate.torneio.titulo}</h3>
                      <div className="tournament-type">
                        {certificate.torneio.tipo_torneio === 'especifico' && (
                          <span className="type-label">
                            Disciplina: {certificate.torneio.disciplina_especifica}
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {/* POSITION */}
                  <div className="medal-label">
                    <span className="position-text">{medalDisplay.label}</span>
                  </div>

                  {/* DISCIPLINE */}
                  {certificate.disciplina && (
                    <div className="certificate-discipline">
                      <span className="discipline-badge">{certificate.disciplina}</span>
                    </div>
                  )}

                  {/* DATES */}
                  <div className="certificate-dates">
                    {certificate.torneio?.termina_em && (
                      <div className="date-item">
                        <small>Término</small>
                        <p>{new Date(certificate.torneio.termina_em).toLocaleDateString('pt-PT')}</p>
                      </div>
                    )}
                    {certificate.data_geracao && (
                      <div className="date-item">
                        <small>Gerado</small>
                        <p>{new Date(certificate.data_geracao).toLocaleDateString('pt-PT')}</p>
                      </div>
                    )}
                  </div>

                  {/* VERIFICATION CODE */}
                  {certificate.codigo_verificacao && (
                    <div className="verification-code">
                      <small>Código de Verificação</small>
                      <code>{certificate.codigo_verificacao}</code>
                      <button
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(certificate.codigo_verificacao);
                          alert('Código copiado!');
                        }}
                        title="Copiar código"
                      >
                        📋
                      </button>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="card-actions">
                  <button
                    className="action-btn download-btn"
                    onClick={() => handleDownload(certificate)}
                    title="Baixar certificado"
                  >
                    <Download size={18} />
                    <span>Baixar</span>
                  </button>
                  {certificate.status === 'validado' && (
                    <button
                      className="action-btn validate-btn"
                      disabled
                      title="Certificado validado"
                    >
                      <CheckCircle size={18} />
                      <span>Validado</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INFO SECTION */}
      <div className="info-section">
        <h3>💡 Sobre Certificados</h3>
        <ul className="info-list">
          <li>
            <strong>Certificados de Torneio:</strong> São gerados automaticamente ao terminar o torneio para os 3 primeiros
            lugares.
          </li>
          <li>
            <strong>Validação:</strong> Todos os certificados podem ser verificados usando o código de verificação.
          </li>
          <li>
            <strong>Download:</strong> Você pode baixar seus certificados para imprimir ou compartilhar.
          </li>
          <li>
            <strong>Compartilhamento:</strong> Use o código de verificação para comprovar a autenticidade do certificado.
          </li>
        </ul>
      </div>
    </div>
  );
}
