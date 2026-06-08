import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import WaitingScreen from '../components/WaitingScreen';

/**
 * ProtectedColaboradorRoute
 * Garante que apenas colaboradores aprovados acedam às rotas /colaborador/*.
 * - Não autenticado          → /login
 * - Admin                    → /administrador  (admin não entra no ambiente de colaborador)
 * - Colaborador pendente      → WaitingScreen (tela de espera com verificação automática)
 * - Colaborador rejeitado     → /404
 * - Colaborador aprovado      → renderiza children
 */
const ProtectedColaboradorRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Admin nunca acede ao ambiente de colaborador — tem o seu próprio painel
  const isAdmin = user?.isAdmin === true || user?.isAdmin === 1 || user?.role === 'admin';
  if (isAdmin) return <Navigate to="/administrador" replace />;

  const isColaborador = user?.role === 'colaborador';

  if (!isColaborador) {
    // Estudante tenta aceder a rota de colaborador → painel de estudante
    return <Navigate to="/painel" replace />;
  }

  // ✅ COLABORADOR PENDENTE → WAITING SCREEN (tela de espera com verificação automática)
  if (user?.status_colaborador === 'pendente') {
    return (
      <WaitingScreen
        userEmail={user?.email}
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

  if (user?.status_colaborador !== 'aprovado') {
    return <Navigate to="/404" state={{ forbidden: true }} replace />;
  }

  return children;
};

export default ProtectedColaboradorRoute;