import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export const usePermis = (filters = {}, pagination = {}) => {
  return useQuery({
    queryKey: ['permis', filters, pagination],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...filters,
        ...pagination
      } as any);
      return apiClient.get(`/permis?${params}`);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePermisDetail = (id: string) => {
  return useQuery({
    queryKey: ['permis', id],
    queryFn: () => apiClient.get(`/permis/${id}`),
    enabled: !!id,
  });
};

export const useCreatePermis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/permis', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permis'] });
      toast.success('Permis créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  });
};

export const useUpdatePermis = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.put(`/permis/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permis', id] });
      queryClient.invalidateQueries({ queryKey: ['permis'] });
      toast.success('Permis modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  });
};

export const useValiderPermis = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.post(`/permis/${id}/valider`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permis', id] });
      queryClient.invalidateQueries({ queryKey: ['permis'] });
      toast.success('Permis validé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  });
};

export const useSuspendrePermis = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { raison: string }) => apiClient.post(`/permis/${id}/suspendre`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permis', id] });
      queryClient.invalidateQueries({ queryKey: ['permis'] });
      toast.success('Permis suspendu');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suspension');
    }
  });
};

export const useCloturerPermis = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.post(`/permis/${id}/cloturer`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permis', id] });
      queryClient.invalidateQueries({ queryKey: ['permis'] });
      toast.success('Permis clôturé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la clôture');
    }
  });
};
