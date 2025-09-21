import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/config';

const API = `${API_URL}/api`;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      // Não configurar header de autorização para evitar chamadas de API
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login - simular autenticação
      const mockUser = {
        id: 1,
        nome: "LEANDRO XAVIER DE PINHO",
        email: email,
        tipo: "morador",
        cpf: "123.456.789-00",
        telefone: "(11) 99999-9999"
      };
      
      const mockToken = "mock_token_" + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const register = async (userData) => {
    try {
      // Mock register - simular cadastro
      const mockUser = {
        id: Date.now(),
        nome: userData.nome,
        email: userData.email,
        tipo: userData.tipo || "morador",
        cpf: userData.cpf,
        telefone: userData.telefone
      };
      
      const mockToken = "mock_token_" + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer cadastro' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
