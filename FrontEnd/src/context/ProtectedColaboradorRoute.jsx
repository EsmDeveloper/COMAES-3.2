import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedColaboradorRoute
 * Garante que apenas colaboradores aprovados acedam às rotas /colaborador/*.
 * - Não autenticado          → /login
 * - Admin                    → /administrador  (admin não entra no ambiente de colaborador)
 * - Colaborador pendente      → / (home, com mensagem de estado)
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

  if (user?.status_colaborador === 'pendente') {
    return <Navigate to="/" state={{ message: 'Aguardando aprovação do administrador.', type: 'warning' }} replace />;
  }

  if (user?.status_colaborador !== 'aprovado') {
    return <Navigate to="/404" state={{ forbidden: true }} replace />;
  }

  return children;
};

export default ProtectedColaboradorRoute;