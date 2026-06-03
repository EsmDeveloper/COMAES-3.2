import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedAdminRoute
 * Garante que apenas administradores acedam às rotas /administrador/*.
 * - Não autenticado       → /login
 * - Autenticado, não admin → /403 (ou fallback para o seu destino correto)
 * - Admin                  → renderiza children
 */
// eslint-disable-next-line react/prop-types
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Não autenticado — redireciona para login
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = (u) => {
    if (!u) return false;
    if (u.isAdmin === true || u.isAdmin === 1 || u.isAdmin === '1') return true;
    if (u.is_admin === 1 || u.is_admin === '1' || u.is_admin === true) return true;
    if (String(u.isAdmin).toLowerCase() === 'true') return true;
    if (u.role && String(u.role).toLowerCase() === 'admin') return true;
    if (u.funcao_id === 3) return true;
    if (u.funcao && String(u.funcao.nome).toLowerCase().includes('admin')) return true;
    return false;
  };

  // Autenticado mas sem papel de admin — redireciona para o destino correto do seu papel
  // (colaborador → painel colaborador; estudante → painel estudante; nunca para rota admin)
  if (!isAdmin(user)) {
    if (user.role === 'colaborador') return <Navigate to="/colaborador/dashboard" replace />;
    return <Navigate to="/painel" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
