import apiClient from '../api/client';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    
    if (response.success) {
      localStorage.setItem('accessToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    
    if (response.success) {
      localStorage.setItem('accessToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async getCurrentUser() {
    return apiClient.get('/auth/me');
  },

  async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token, nouveau_mot_de_passe) {
    return apiClient.post('/auth/reset-password', { token, nouveau_mot_de_passe });
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    
    if (response.success) {
      localStorage.setItem('accessToken', response.token);
    }
    
    return response;
  }
};