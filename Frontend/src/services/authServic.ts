// ============================================
// AUTH SERVICE - HSE PERMIT SYSTEM
// ============================================

import apiClient from '../lib/api';
import { LoginCredentials, RegisterData, AuthResponse, Utilisateur } from '../types';
import { AUTH_CONSTANTS } from '../utils/constants';

// ========== LOCAL STORAGE ==========

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
};

export const clearTokens = (): void => {
  localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);
};

export const setUser = (user: Utilisateur): void => {
  localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(user));
};

export const getUser = (): Utilisateur | null => {
  const userStr = localStorage.getItem(AUTH_CONSTANTS.USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// ========== AUTHENTICATION ==========

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', credentials);
  
  if (response.success) {
    setTokens(response.token, response.refreshToken);
    setUser(response.utilisateur);
  }
  
  return response;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  
  if (response.success) {
    setTokens(response.token, response.refreshToken);
    setUser(response.utilisateur);
  }
  
  return response;
};

export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  
  try {
    await apiClient.post('/auth/logout', { refresh_token: refreshToken });
  } finally {
    clearTokens();
  }
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
  
  if (response.token) {
    localStorage.setItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, response.token);
    return response.token;
  }
  
  throw new Error('Failed to refresh token');
};

export const getCurrentUser = async (): Promise<Utilisateur> => {
  const response = await apiClient.get('/auth/me');
  setUser(response.utilisateur);
  return response.utilisateur;
};

// ========== PASSWORD RESET ==========

export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await apiClient.post('/auth/reset-password', {
    token,
    nouveau_mot_de_passe: newPassword
  });
};

// ========== HELPERS ==========

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const shouldRefreshToken = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();
    
    return exp - now < AUTH_CONSTANTS.REFRESH_BUFFER;
  } catch {
    return false;
  }
};

export default {
  login,
  register,
  logout,
  refreshAccessToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  setUser,
  getUser,
  isAuthenticated,
  shouldRefreshToken
};