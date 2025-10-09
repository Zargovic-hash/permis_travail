import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { QUERY_KEYS, CACHE_TIMES } from '@/utils/constants';
import { Utilisateur, UtilisateurFilters, PaginatedResponse } from '@/types';

export const useUtilisateurs = (filters: UtilisateurFilters = {}) => {
  return useQuery<PaginatedResponse<Utilisateur>>({
    queryKey: [QUERY_KEYS.USERS, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      return apiClient.get(`/utilisateurs?${params.toString()}`);
    },
    staleTime: CACHE_TIMES.MEDIUM
  });
};

export const useUtilisateurDetail = (id: string) => {
  return useQuery<Utilisateur>({
    queryKey: QUERY_KEYS.USER_DETAIL(id),
    queryFn: async () => {
      const response = await apiClient.get(`/utilisateurs/${id}`);
      return response.utilisateur;
    },
    enabled: !!id,
    staleTime: CACHE_TIMES.MEDIUM
  });
};

export const useUpdateUtilisateur = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Utilisateur>) => apiClient.put(`/utilisateurs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_DETAIL(id) });
      toast.success('Utilisateur modifié avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la modification');
    }
  });
};

export const useDeleteUtilisateur = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, anonymiser }: { id: string; anonymiser: boolean }) =>
      apiClient.post(`/utilisateurs/${id}/supprimer`, { anonymiser }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast.success('Utilisateur supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });
};

export const useAnonymiserUtilisateur = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/utilisateurs/${id}/anonymiser`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast.success('Utilisateur anonymisé');
    },
    onError: () => {
      toast.error('Erreur lors de l\'anonymisation');
    }
  });
};