import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

// Liste des audit logs avec filtres et pagination
export const useAuditLogs = (filters = {}, pagination = { page: 1, limit: 50 }) => {
  return useQuery({
    queryKey: ['audit-logs', filters, pagination],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Ajouter tous les paramètres non vides
      Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/audit-logs?${params.toString()}`);
      
      // Log pour débugger
      console.log('Audit Logs Response:', response);
      
      return response;
    },
    // ✅ Remplacer keepPreviousData par placeholderData
    placeholderData: (previousData) => previousData,
    staleTime: 30000, // 30 secondes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};