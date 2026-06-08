import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import './WaitingScreen.css';

const WaitingScreen = ({ userEmail, onApproved, onRejected }) => {
  const [status, setStatus] = useState('waiting'); // waiting, approved, rejected
  const [message, setMessage] = useState('');
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    // Verificar status a cada 5 segundos
    const interval = setInterval(() => {
      checkCollaboratorStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkCollaboratorStatus = async () => {
    try {
      const token = localStorage.getItem('comaes_token');
      const response = await fetch('/api/usuarios/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        
        if (userData.status_colaborador === 'aprovado') {
          setStatus('approved');
          setTimeout(() => {
            onApproved?.();
          }, 2000); // Mostrar mensagem de sucesso por 2 segundos antes de redirecionar
        } else if (userData.status_colaborador === 'rejeitado') {
          setStatus('rejected');
          setMessage('Sua solicitação foi rejeitada. Entre em contato com o administrador.');
        }
      }

      setCheckCount(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  return (
    <div className="waiting-screen">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="float float-1"></div>
        <div className="float float-2"></div>
        <div className="float float-3"></div>
      </div>

      {/* Content */}
      <div className="waiting-content">
        {status === 'waiting' && (
          <>
            {/* Spinner Animation */}
            <div className="spinner-container">
              <div className="spinner">
                <Clock className="spinner-icon" />
              </div>
            </div>

            {/* Main Message */}
            <h1 className="waiting-title">Seu pedido está em análise</h1>
            <p className="waiting-subtitle">
              Obrigado por se registrar como colaborador!
            </p>

            {/* Status Box */}
            <div className="status-box">
              <div className="status-item">
                <div className="status-dot waiting"></div>
                <div className="status-text">
                  <p className="status-label">Status Atual</p>
                  <p className="status-value">⏳ Pendente de Aprovação</p>
                </div>
              </div>
              <p className="status-info">
                Email registrado: <strong>{userEmail}</strong>
              </p>
            </div>

            {/* Information Box */}
            <div className="info-box">
              <h3 className="info-title">O que acontece agora?</h3>
              <ul className="info-list">
                <li className="info-item">
                  <span className="info-number">1</span>
                  <span>Um administrador revisará seus dados</span>
                </li>
                <li className="info-item">
                  <span className="info-number">2</span>
                  <span>Você será notificado quando sua solicitação for aprovada</span>
                </li>
                <li className="info-item">
                  <span className="info-number">3</span>
                  <span>Terá acesso completo ao painel de colaborador</span>
                </li>
              </ul>
            </div>

            {/* Timer */}
            <div className="timer-info">
              <Clock className="timer-icon" size={16} />
              <span>Verificando status... ({checkCount} verificações)</span>
            </div>

            {/* Tips */}
            <div className="tips-box">
              <p className="tips-title">💡 Dica</p>
              <p className="tips-text">
                Mantenha esta página aberta. Você será redirecionado automaticamente
                assim que sua solicitação for aprovada.
              </p>
            </div>
          </>
        )}

        {status === 'approved' && (
          <>
            <div className="success-container">
              <CheckCircle className="success-icon" />
            </div>

            <h1 className="success-title">🎉 Parabéns!</h1>
            <p className="success-subtitle">
              Sua solicitação foi aprovada pelo administrador
            </p>

            <div className="success-box">
              <p className="success-message">
                Você agora tem acesso completo ao painel de colaborador.
              </p>
              <p className="success-redirect">
                Redirecionando para seu painel...
              </p>
            </div>

            <div className="spinner-container small">
              <div className="spinner small">
                <div></div>
              </div>
            </div>
          </>
        )}

        {status === 'rejected' && (
          <>
            <div className="error-container">
              <AlertCircle className="error-icon" />
            </div>

            <h1 className="error-title">Solicitação Rejeitada</h1>
            <p className="error-subtitle">
              Sua solicitação de colaborador foi rejeitada
            </p>

            <div className="error-box">
              <p className="error-message">{message}</p>
              <p className="error-info">
                Se tiver dúvidas, por favor entre em contato conosco.
              </p>
            </div>

            <button className="back-button">
              Voltar para o início
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WaitingScreen;
