import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedEstudanteRoute
 * Garante que apenas estudantes (e ninguém mais) acedam ao ambiente competitivo.
 * - Não autenticado  → /login
 * - Admin            → /administrador  (admin não entra no ambiente de estudante)
 * - Colaborador      → /colaborador/dashboard
 * - Estudante        → renderiza children
 */
const ProtectedEstudanteRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Admin nunca acede ao ambiente competitivo/educacional — redireciona para o seu painel
  const isAdmin = user?.isAdmin === true || user?.isAdmin === 1 || user?.role === 'admin';
  if (isAdmin) return <Navigate to="/administrador" replace />;

  // Colaborador redireciona para o seu painel
  if (user?.role === 'colaborador') return <Navigate to="/colaborador/dashboard" replace />;

  // Estudante — acesso permitido
  return children;
};

export default ProtectedEstudanteRoute;