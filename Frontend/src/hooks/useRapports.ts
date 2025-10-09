import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { QUERY_KEYS, CACHE_TIMES } from '@/utils/constants';
import { Statistiques } from '@/types';

export const useStatistiques = (filters: any = {}) => {
  return useQuery<Statistiques>({
    queryKey: [QUERY_KEYS.STATS, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      return apiClient.get(`/reports/statistiques?${params.toString()}`);
    },
    staleTime: CACHE_TIMES.SHORT,
    refetchInterval: 60000 // Rafraîchir toutes les minutes
  });
};

export const useExportCSV = () => {
  const exportData = async (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const response = await apiClient.get(`/reports/export-csv?${params.toString()}`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  
  return { exportData };
};