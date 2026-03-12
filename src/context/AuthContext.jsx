// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega usuário e token do localStorage
    const savedUser = localStorage.getItem('comaes_user');
    const savedToken = localStorage.getItem('comaes_token');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken) setToken(savedToken);
    setLoading(false);
  }, []);

  const normalize = (raw) => {
    if (!raw) return null;
    const id = raw.id || raw.ID || raw.userId;
    const name = raw.nome || raw.name || raw.fullName || raw.username || '';
    const email = raw.email || '';
    const phone = raw.telefone || raw.phone || '';
    const biography = raw.biografia || raw.bio || '';
    const avatar = raw.imagem || raw.avatar || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=blue&color=white` : null);
    const username = raw.username || (email ? email.split('@')[0] : name);
    return { ...raw, id, name, fullName: name, email, phone, avatar, username, biografia: biography, bio: biography };
  };

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