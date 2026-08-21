import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('safe_drive_admin_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('safe_drive_admin_user') || 'null'));

  const login = (tokenData, userData) => {
    setToken(tokenData);
    setUser(userData);
    localStorage.setItem('safe_drive_admin_token', tokenData);
    localStorage.setItem('safe_drive_admin_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('safe_drive_admin_token');
    localStorage.removeItem('safe_drive_admin_user');
  };

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
