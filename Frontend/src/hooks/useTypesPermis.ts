import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export const useTypesPermis = () => {
  return useQuery({
    queryKey: ['types-permis'],
    queryFn: () => apiClient.get('/types-permis'),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCreateTypePermis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/types-permis', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types-permis'] });
      toast.success('Type créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  });
};

export const useUpdateTypePermis = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.put(`/types-permis/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types-permis'] });
      toast.success('Type modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  });
};

export const useDeleteTypePermis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/types-permis/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types-permis'] });
      toast.success('Type supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  });
};
