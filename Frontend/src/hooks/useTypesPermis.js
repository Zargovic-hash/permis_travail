import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { toast } from 'react-toastify';

// Liste tous les types de permis
export const useTypesPermis = () => {
  return useQuery({
    queryKey: ['types-permis'],
    queryFn: () => apiClient.get('/types-permis'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Détails d'un type de permis
export const useTypePermisDetail = (id) => {
  return useQuery({
    queryKey: ['types-permis', id],
    queryFn: () => apiClient.get(`/types-permis/${id}`),
    enabled: !!id,
  });
};

// Créer un type de permis
export const useCreateTypePermis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.post('/types-permis', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['types-permis']);
      toast.success('Type de permis créé avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la création du type';
      toast.error(message);
      throw error;
    }
  });
};

// Modifier un type de permis
export const useUpdateTypePermis = (id) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.put(`/types-permis/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['types-permis', id]);
      queryClient.invalidateQueries(['types-permis']);
      toast.success('Type de permis modifié avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la modification du type';
      toast.error(message);
      throw error;
    }
  });
};

// Supprimer un type de permis
export const useDeleteTypePermis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/types-permis/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['types-permis']);
      toast.success('Type de permis supprimé avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression du type';
      toast.error(message);
      throw error;
    }
  });
};