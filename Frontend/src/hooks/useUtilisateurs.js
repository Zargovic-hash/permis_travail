import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { toast } from 'react-toastify';

// Liste des utilisateurs avec filtres et pagination
export const useUtilisateurs = (filters = {}, pagination = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: ['utilisateurs', filters, pagination],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      return apiClient.get(`/utilisateurs?${params.toString()}`);
    },
    keepPreviousData: true,
    staleTime: 60000, // 1 minute
  });
};

// Détails d'un utilisateur
export const useUtilisateurDetail = (id) => {
  return useQuery({
    queryKey: ['utilisateurs', id],
    queryFn: () => apiClient.get(`/utilisateurs/${id}`),
    enabled: !!id,
  });
};

// Modifier un utilisateur
export const useUpdateUtilisateur = (id) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.put(`/utilisateurs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['utilisateurs', id]);
      queryClient.invalidateQueries(['utilisateurs']);
      toast.success('Utilisateur modifié avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la modification de l\'utilisateur';
      toast.error(message);
      throw error;
    }
  });
};

// Supprimer un utilisateur (soft delete)
export const useDeleteUtilisateur = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, anonymiser = false }) => 
      apiClient.post(`/utilisateurs/${id}/supprimer`, { anonymiser }),
    onSuccess: () => {
      queryClient.invalidateQueries(['utilisateurs']);
      toast.success('Utilisateur supprimé avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur';
      toast.error(message);
      throw error;
    }
  });
};

// Anonymiser un utilisateur (RGPD)
export const useAnonymiserUtilisateur = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiClient.post(`/utilisateurs/${id}/anonymiser`),
    onSuccess: () => {
      queryClient.invalidateQueries(['utilisateurs']);
      toast.success('Utilisateur anonymisé avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de l\'anonymisation de l\'utilisateur';
      toast.error(message);
      throw error;
    }
  });
};