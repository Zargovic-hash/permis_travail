// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      console.log('Fetching current user...');
      
      const response = await apiClient.get('/auth/me');
      
      console.log('User fetched:', response);
      
      if (response.success && response.utilisateur) {
        setUser(response.utilisateur);
      } else if (response.utilisateur) {
        setUser(response.utilisateur);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      
      // ✅ CORRECTED: Vérifier spécifiquement le statut 401
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        navigate('/login');  // ✅ Redirection ajoutée
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt:', { email });
      
      const response = await apiClient.post('/auth/login', { email, password });
      
      console.log('Login response:', response);
      
      if (response.success) {
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        setUser(response.utilisateur);
        return response;
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Register attempt:', { email: userData.email });
      
      const response = await apiClient.post('/auth/register', userData);
      
      console.log('Register response:', response);
      
      if (response.success) {
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        setUser(response.utilisateur);
        return response;
      } else {
        throw new Error(response.message || 'Erreur d\'inscription');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      navigate('/login');  // ✅ Redirection après logout
    }
  };

  const hasRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  const isHSE = useCallback(() => {
    return hasRole('HSE', 'ADMIN');
  }, [hasRole]);

  const canEditPermis = useCallback((permis) => {
    if (!user || !permis) return false;
    if (isHSE()) return true;
    if (permis.demandeur_id === user.id && ['BROUILLON', 'EN_ATTENTE'].includes(permis.statut)) {
      return true;
    }
    return false;
  }, [user, isHSE]);

  const canValidatePermis = useCallback((permis) => {
    if (!user || !permis) return false;
    if (user.role === 'HSE') return true;
    const workflows = {
      EN_ATTENTE: ['SUPERVISEUR'],
      VALIDE: ['RESP_ZONE', 'HSE']
    };
    const allowedRoles = workflows[permis.statut] || [];
    return allowedRoles.includes(user.role);
  }, [user]);

  const canSuspendPermis = useCallback((permis) => {
    if (!user || !permis) return false;
    return ['HSE', 'RESP_ZONE'].includes(user.role);
  }, [user]);

  const canClosePermis = useCallback((permis) => {
    if (!user || !permis) return false;
    if (['HSE', 'SUPERVISEUR'].includes(user.role)) return true;
    if (permis.demandeur_id === user.id) return true;
    return false;
  }, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    isHSE,
    canEditPermis,
    canValidatePermis,
    canSuspendPermis,
    canClosePermis,
    refetchUser: fetchCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};