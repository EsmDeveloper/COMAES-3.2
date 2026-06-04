// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * Devolve a rota de destino após login com base no papel do utilizador.
 * Admin → /administrador  |  colaborador → /colaborador/dashboard  |  estudante → /
 */
export const getPostLoginRoute = (user) => {
  if (!user) return '/login';
  const role = user.role || (user.isAdmin ? 'admin' : 'estudante');
  if (role === 'admin' || user.isAdmin === true || user.isAdmin === 1) return '/administrador';
  if (role === 'colaborador') return '/colaborador/dashboard';
  return '/';
};

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// normalize fora do componente para poder ser usada no useEffect de forma segura
const normalize = (raw) => {
  if (!raw) return null;
  const id = raw.id || raw.ID || raw.userId;
  const name = raw.nome || raw.name || raw.fullName || raw.username || '';
  const email = raw.email || '';
  const phone = raw.telefone || raw.phone || '';
  const biography = raw.biografia || raw.bio || '';
  const avatar = raw.imagem || raw.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=blue&color=white` : null);
  const username = raw.username || (email ? email.split('@')[0] : name);
  const role = raw.role || (raw.isAdmin ? 'admin' : 'estudante');
  const disciplina_colaborador = raw.disciplina_colaborador || null;
  const status_colaborador = raw.status_colaborador || (role === 'colaborador' ? 'pendente' : 'aprovado');
  return {
    ...raw,
    id, name, fullName: name, email, phone,
    avatar, username, biografia: biography, bio: biography,
    role, disciplina_colaborador, status_colaborador,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser  = localStorage.getItem('comaes_user');
    const savedToken = localStorage.getItem('comaes_token');

    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);

        // Dados inválidos/corrompidos: se não tiver id ou nome real, forçar novo login
        if (!parsed.id || (!parsed.nome && !parsed.name && !parsed.fullName)) {
          console.warn('[Auth] Dados de sessão incompletos — a limpar localStorage');
          localStorage.removeItem('comaes_user');
          localStorage.removeItem('comaes_token');
        } else {
          // Re-normalizar sempre para garantir que todos os aliases estão presentes
          // e que role/status_colaborador são derivados correctamente
          const fresh = normalize(parsed);
          setUser(fresh);
          setToken(savedToken);
          // Actualizar localStorage com dados normalizados
          localStorage.setItem('comaes_user', JSON.stringify(fresh));
        }
      } catch {
        localStorage.removeItem('comaes_user');
        localStorage.removeItem('comaes_token');
      }
    } else {
      // Limpar qualquer vestígio parcial
      if (savedUser && !savedToken) localStorage.removeItem('comaes_user');
      if (!savedUser && savedToken) localStorage.removeItem('comaes_token');
    }

    setLoading(false);
  }, []);

  // login(userObj, token?) - aceita usuário bruto do backend e token opcional
  const login = (userObj, jwtToken = null) => {
    const normalized = normalize(userObj || {});
    setUser(normalized);
    if (jwtToken) {
      setToken(jwtToken);
      localStorage.setItem('comaes_token', jwtToken);
    }
    localStorage.setItem('comaes_user', JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('comaes_user');
    localStorage.removeItem('comaes_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};