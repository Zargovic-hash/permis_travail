import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { toast } from 'react-toastify';

// Health check
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      // ✅ FIX: apiClient.interceptor retourne déjà response.data
      const data = await apiClient.get('/health');
      return data;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
};

// Charger les données de test (seed)
export const useSeedData = () => {
  return useMutation({
    mutationFn: () => apiClient.post('/admin/seed'),
    onSuccess: () => {
      toast.success('Données de test chargées avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors du chargement des données';
      toast.error(message);
      throw error;
    }
  });
};