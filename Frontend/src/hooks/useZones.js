import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { toast } from 'react-toastify';

// Liste toutes les zones
export const useZones = () => {
  return useQuery({
    queryKey: ['zones'],
    queryFn: () => apiClient.get('/zones'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Détails d'une zone
export const useZoneDetail = (id) => {
  return useQuery({
    queryKey: ['zones', id],
    queryFn: () => apiClient.get(`/zones/${id}`),
    enabled: !!id,
  });
};

// Créer une zone
export const useCreateZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.post('/zones', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['zones']);
      toast.success('Zone créée avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la création de la zone';
      toast.error(message);
      throw error;
    }
  });
};

// Modifier une zone
export const useUpdateZone = (id) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.put(`/zones/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['zones', id]);
      queryClient.invalidateQueries(['zones']);
      toast.success('Zone modifiée avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la modification de la zone';
      toast.error(message);
      throw error;
    }
  });
};

// Supprimer une zone
export const useDeleteZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['zones']);
      toast.success('Zone supprimée avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression de la zone';
      toast.error(message);
      throw error;
    }
  });
};