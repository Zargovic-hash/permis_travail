import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export const useZones = () => {
  return useQuery({
    queryKey: ['zones'],
    queryFn: () => apiClient.get('/zones'),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCreateZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/zones', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Zone créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  });
};

export const useUpdateZone = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.put(`/zones/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Zone modifiée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  });
};

export const useDeleteZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Zone supprimée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  });
};
