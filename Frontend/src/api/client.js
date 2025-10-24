// client.js - API Client Configuration
import axios from 'axios';

// ✅ Déterminer l'URL de base correctement
const getBaseURL = () => {
  if (import.meta.env.VITE_APP_API_URL) {
    return import.meta.env.VITE_APP_API_URL;
  }
  
  if (import.meta.env.MODE === 'production') {
    return 'https://api.example.com/api';
  }
  
  return 'http://localhost:3000/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Gère le refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        // ✅ CORRECT: utiliser apiClient.defaults.baseURL au lieu de construire l'URL
        const baseURL = apiClient.defaults.baseURL || getBaseURL();
        
        const response = await axios.post(
          `${baseURL}/auth/refresh`,  // ✅ Correct: baseURL inclut déjà /api
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        const { token, success } = response.data;
        
        if (success && token) {
          localStorage.setItem('accessToken', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          processQueue(null, token);
          isRefreshing = false;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
        
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;