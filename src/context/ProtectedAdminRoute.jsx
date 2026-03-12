import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;

  const checkIsAdmin = (u) => {
    if (!u) return false;
    // common variants
    if (u.isAdmin === true) return true;
    if (u.isAdmin === 1) return true;
    if (u.isAdmin === '1') return true;
    if (u.is_admin === 1 || u.is_admin === '1' || u.is_admin === true) return true;
    if (String(u.isAdmin).toLowerCase() === 'true') return true;
    if (u.role && String(u.role).toLowerCase() === 'admin') return true;
    if (u.funcao_id === 3) return true;
    if (u.funcao && String(u.funcao.nome).toLowerCase().includes('admin')) return true;
    return false;
  };

  const isAdmin = checkIsAdmin(user);
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedAdminRoute;
