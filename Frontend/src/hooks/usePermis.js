import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { toast } from 'react-toastify';

// Liste des permis avec filtres et pagination
export const usePermis = (filters = {}, pagination = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: ['permis', filters, pagination],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Ajouter les filtres
      Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      return apiClient.get(`/permis?${params.toString()}`);
    },
    keepPreviousData: true,
    staleTime: 30000, // 30 secondes
  });
};

// Détails d'un permis
export const usePermisDetail = (id) => {
  return useQuery({
    queryKey: ['permis', id],
    queryFn: () => apiClient.get(`/permis/${id}`),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
};

// Créer un permis
export const useCreatePermis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.post('/permis', data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['permis']);
      toast.success('Permis créé avec succès');
      return response;
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la création du permis';
      toast.error(message);
      throw error;
    }
  });
};

// Modifier un permis
export const useUpdatePermis = (id) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.put(`/permis/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['permis', id]);
      queryClient.invalidateQueries(['permis']);
      toast.success('Permis modifié avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la modification du permis';
      toast.error(message);
      throw error;
    }
  });
};

// Valider/Approuver un permis
export const useValiderPermis = (id) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.post(`/permis/${id}/valider`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['permis', id]);
      queryClient.invalidateQueries(['permis']);
      toast.success('Permis validé avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la validation du permis';
      toast.error(message);
      throw error;
    }
  });
};

// Suspendre un permis
export const useSuspendPermis = (id) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.post(`/permis/${id}/suspendre`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['permis', id]);
      queryClient.invalidateQueries(['permis']);
      toast.success('Permis suspendu');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la suspension du permis';
      toast.error(message);
      throw error;
    }
  });
};

// Clôturer un permis
export const useClosePermis = (id) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.post(`/permis/${id}/cloturer`),
    onSuccess: () => {
      queryClient.invalidateQueries(['permis', id]);
      queryClient.invalidateQueries(['permis']);
      toast.success('Permis clôturé');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la clôture du permis';
      toast.error(message);
      throw error;
    }
  });
};

// Ajouter un fichier à un permis
export const useAddFileToPermis = (id) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('fichier', file);
      
      return apiClient.post(`/permis/${id}/ajouter-fichier`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['permis', id]);
      toast.success('Fichier ajouté avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de l\'ajout du fichier';
      toast.error(message);
      throw error;
    }
  });
};

// Exporter un permis en PDF
export const useExportPermisPDF = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.get(`/permis/${id}/export/pdf`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `permis-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      toast.success('PDF téléchargé avec succès');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de l\'export PDF';
      toast.error(message);
      throw error;
    }
  });
};

// Vérifier l'intégrité du PDF
export const useVerifyPermisPDF = () => {
  return useMutation({
    mutationFn: (id) => apiClient.post(`/permis/${id}/verify-pdf`),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Signature PDF vérifiée avec succès');
      } else {
        toast.warning('La vérification du PDF a échoué');
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la vérification du PDF';
      toast.error(message);
      throw error;
    }
  });
};