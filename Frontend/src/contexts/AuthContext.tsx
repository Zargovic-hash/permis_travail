import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Utilisateur } from '@/types';
import api from '@/lib/api';

interface AuthContextType {
  user: Utilisateur | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Set token in axios defaults before making the request
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const { data } = await api.get('/auth/me');
          setUser(data.utilisateur);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Store token
      localStorage.setItem('token', data.token);
      
      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setToken(data.token);
      setUser(data.utilisateur);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const { data } = await api.post('/auth/register', registerData);
      
      // Store token
      localStorage.setItem('token', data.token);
      
      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setToken(data.token);
      setUser(data.utilisateur);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};