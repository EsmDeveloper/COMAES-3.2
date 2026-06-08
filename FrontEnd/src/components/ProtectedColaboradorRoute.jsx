import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useColaboradorStatus } from '../hooks/useColaboradorStatus';
import WaitingScreen from './WaitingScreen';
import ColaboradorDashboard from '../Colaborador/ColaboradorDashboard';

/**
 * Componente que protege rotas de colaborador
 * - Se pendente: mostra tela de espera
 * - Se aprovado: mostra painel do colaborador
 * - Se rejeitado: mostra mensagem de erro
 * - Se não for colaborador: redireciona para login
 */
const ProtectedColaboradorRoute = ({ children }) => {
  const { user, token } = useAuth();
  const { status, isPending, isApproved, isRejected, checkStatus } = useColaboradorStatus();

  // Sem autenticação
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Não é colaborador
  if (user.role !== 'colaborador') {
    return <Navigate to="/dashboard" replace />;
  }

  // Em espera de aprovação
  if (isPending) {
    return (
      <WaitingScreen
        userEmail={user.email}
        onApproved={() => {
          // Redirecionar para painel do colaborador após aprovação
          window.location.href = '/colaborador/dashboard';
        }}
        onRejected={() => {
          // Redirecionar para login se rejeitado
          window.location.href = '/login';
        }}
      />
    );
  }

  // Rejeitado
  if (isRejected) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h1>Solicitação Rejeitada</h1>
          <p>Sua solicitação de colaborador foi rejeitada.</p>
          <p>Entre em contato com o administrador para mais informações.</p>
          <button onClick={() => window.location.href = '/login'}>
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  // Aprovado - mostrar dashboard
  if (isApproved) {
    return children || <ColaboradorDashboard />;
  }

  // Status desconhecido
  return (
    <div className="loading-screen">
      <p>Carregando...</p>
    </div>
  );
};

export default ProtectedColaboradorRoute;
