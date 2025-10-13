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
  const [needsProfileSelection, setNeedsProfileSelection] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      // Configurar header de autorização para futuras requisições
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      if (response.data.access_token) {
        const { access_token, user } = response.data;
        
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Configurar header de autorização para futuras requisições
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        setUser(user);
        
        // Verificar se o usuário tem múltiplos tipos e precisa selecionar perfil
        if (user.tipos && user.tipos.length > 1) {
          setNeedsProfileSelection(true);
          return { success: true, needsProfileSelection: true };
        }
        
        return { success: true };
      } else {
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error) {
      if (error.response?.data?.detail) {
        return { success: false, error: error.response.data.detail };
      } else if (error.response?.status === 401) {
        return { success: false, error: 'E-mail ou senha incorretos' };
      } else if (error.response?.status === 422) {
        return { success: false, error: 'Dados inválidos. Verifique o formato do e-mail.' };
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return { success: false, error: 'Erro de conexão. Verifique se o backend está rodando.' };
      } else {
        return { success: false, error: 'Erro de conexão. Tente novamente.' };
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);

      if (response.data.user) {
        const { user } = response.data;
        
        // Para registro, não temos token ainda, então não salvamos no localStorage
        // O usuário precisará fazer login após o registro
        setUser(user);
        return { success: true, user: user };
      } else {
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error) {
      if (error.response?.data?.detail) {
        return { success: false, error: error.response.data.detail };
      } else if (error.response?.status === 400) {
        return { success: false, error: 'Dados inválidos. Verifique os campos preenchidos.' };
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return { success: false, error: 'Erro de conexão. Verifique se o backend está rodando.' };
      } else {
        return { success: false, error: 'Erro de conexão. Tente novamente.' };
      }
    }
  };

  const finishProfileSelection = (selectedUser) => {
    setUser(selectedUser);
    setNeedsProfileSelection(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setNeedsProfileSelection(false);
  };

  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    loading,
    needsProfileSelection,
    finishProfileSelection
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
