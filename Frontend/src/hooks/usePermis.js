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

export const useExportPermisPDF = () => {
  return useMutation({
    mutationFn: async (id) => {
      try {
        const axios = (await import('axios')).default;
        const token = localStorage.getItem('accessToken');
        
        const response = await axios.get(
          `${apiClient.defaults.baseURL}/permis/${id}/export/pdf`,
          {
            responseType: 'blob',
            timeout: 60000,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // ✅ Récupérer le hash
        const pdfHash = response.headers?.['x-pdf-hash'] || null;
        const blob = response.data;
        
        // ✅ CORRECTION: Créer URL pour téléchargement direct
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // ✅ Extraire le nom du fichier
        const contentDisposition = response.headers?.['content-disposition'];
        let filename = `permis-${id}.pdf`;
        
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '');
          }
        }
        
        // ✅ Configuration pour téléchargement vers le dossier par défaut
        link.setAttribute('download', filename);
        link.style.display = 'none';
        
        // ✅ Déclencher le téléchargement
        document.body.appendChild(link);
        link.click();
        
        // ✅ Nettoyer après un court délai
        setTimeout(() => {
          link.remove();
          window.URL.revokeObjectURL(url);
        }, 100);
        
        return { 
          success: true, 
          filename,
          hash: pdfHash,
          size: blob.size,
          downloaded: true
        };
      } catch (error) {
        console.error('❌ Erreur export PDF:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`✅ PDF téléchargé: ${data.filename}`, { autoClose: 5000 });
      console.log('📥 PDF téléchargé dans le dossier Téléchargements:', {
        fichier: data.filename,
        taille: `${(data.size / 1024).toFixed(2)} KB`,
        hash: data.hash ? data.hash.substring(0, 16) + '...' : 'N/A'
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 
                     error.message || 
                     'Erreur lors de l\'export PDF';
      toast.error(message);
    }
  });
};


export const useVerifyPermisPDF = () => {
  return useMutation({
    mutationFn: async (id) => {
      try {
        const axios = (await import('axios')).default;
        const token = localStorage.getItem('accessToken');
        
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/permis/${id}/verify-pdf`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            // ✅ LA CLÉ: accepter 400 comme réponse valide
            validateStatus: (status) => status < 500
          }
        );
        
        return response.data;
      } catch (error) {
        console.error('Erreur vérification:', error);
        console.error('Response:', error.response?.data);
        
        if (error.response?.data) {
          return {
            success: false,
            isValid: false,
            message: error.response.data.message || 'Vérification échouée',
            data: {
              isValid: false,
              details: error.response.data.data || error.response.data.details || {}
            }
          };
        }
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('🔍 Résultat:', response);
      
      const isValid = response.success !== false && 
                     (response.isValid === true || response.data?.isValid === true);
      
      if (isValid) {
        toast.success('✅ PDF vérifié - Intégrité confirmée', { autoClose: 5000 });
        
        const details = response.data?.details || response.details;
        console.log('📋 Détails:', {
          pdfIntegre: details?.pdfIntegre,
          signaturesValides: details?.signaturesValides,
          nombreApprobations: details?.nombreApprobations
        });
        
        if (details?.verifications) {
          console.table(details.verifications);
        }
      } else {
        const raison = response.message || response.data?.message || 'Vérification échouée';
        toast.warning(`⚠️ ${raison}`, { autoClose: 7000 });
        
        const details = response.data?.details || response.details;
        console.warn('⚠️ Problèmes:', details);
        
        // Afficher des conseils
        if (details?.pdfIntegre === false) {
          console.warn('🔴 Le PDF a été modifié depuis sa génération!');
        }
        if (details?.signaturesValides === false) {
          console.warn('🔴 Au moins une signature est invalide!');
          if (details?.verifications) {
            const invalides = details.verifications.filter(v => !v.valide);
            console.table(invalides);
          }
        }
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Erreur';
      toast.error(`❌ ${message}`);
    }
  });
};
