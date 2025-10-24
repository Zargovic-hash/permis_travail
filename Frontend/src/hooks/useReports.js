import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { toast } from 'react-toastify';

// Statistiques globales
export const useStatistiques = () => {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: () => apiClient.get('/reports/statistiques'),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch toutes les 5 minutes
  });
};

// Export CSV
export const useExportCSV = () => {
  return useMutation({
    mutationFn: async (filters = {}) => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/reports/export-csv?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `permis-export-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      toast.success('Export CSV téléchargé avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de l\'export CSV';
      toast.error(message);
      throw error;
    }
  });
};