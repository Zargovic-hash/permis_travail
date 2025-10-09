import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/api';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'DEMANDEUR' | 'SUPERVISEUR' | 'RESP_ZONE' | 'HSE' | 'ADMIN';
  habilitations?: Record<string, any>;
  signature_image_path?: string | null;
  actif: boolean;
  supprime: boolean;
  anonymise: boolean;
  date_creation: string;
  date_modification: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
  isHSE: () => boolean;
  isAdmin: () => boolean;
  isSuperUser: () => boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response: any = await apiClient.get('/auth/me');
      setUser(response.utilisateur);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response: any = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken || response.refresh_token);
    setUser(response.utilisateur);
  };

  const register = async (userData: any) => {
    const response: any = await apiClient.post('/auth/register', userData);
    localStorage.setItem('accessToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken || response.refresh_token);
    setUser(response.utilisateur);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    } finally {
      localStorage.clear();
      setUser(null);
      window.location.href = '/login';
    }
  };

  const hasRole = (...roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const isHSE = () => hasRole('HSE');
  const isAdmin = () => hasRole('ADMIN');
  const isSuperUser = () => hasRole('HSE', 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        hasRole,
        isHSE,
        isAdmin,
        isSuperUser,
        refetchUser: fetchCurrentUser,
      }}
    >
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
