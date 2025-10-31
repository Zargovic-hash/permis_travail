import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { toast } from 'react-toastify';
import axios from 'axios';

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

// ========== FIX: Export PDF & Verification ==========

export const useExportPermisPDF = () => {
  return useMutation({
    mutationFn: async (id) => {
      try {
        console.log('📥 Export PDF - Début pour permis:', id);
        
        const token = localStorage.getItem('accessToken');
        
        // ✅ CORRECTION: Utiliser axios directement avec la bonne config
        const response = await axios.get(
          `${apiClient.defaults.baseURL}/permis/${id}/export/pdf`,
          {
            responseType: 'blob', // TRÈS IMPORTANT
            timeout: 60000,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/pdf'
            },
            // ✅ Ne pas valider le status - on accepte tous les 2xx et 3xx
            validateStatus: (status) => status >= 200 && status < 400
          }
        );

        console.log('✅ Réponse reçue:', {
          status: response.status,
          contentType: response.headers['content-type'],
          contentLength: response.headers['content-length'],
          blobSize: response.data.size,
          headers: Object.fromEntries(
            Object.entries(response.headers).filter(([k]) => 
              ['content-type', 'content-disposition', 'x-pdf-hash'].includes(k.toLowerCase())
            )
          )
        });

        // ✅ Vérifier que le blob est valide
        if (!response.data || response.data.size === 0) {
          throw new Error('Le PDF reçu est vide - taille: 0 bytes');
        }

        // ✅ Vérifier le type MIME
        if (response.data.type !== 'application/pdf') {
          console.warn('⚠️ Type MIME inattendu:', response.data.type);
          // On continue quand même, ce peut être un problème de serveur
        }

        // ✅ Récupérer le hash depuis les headers
        const pdfHash = response.headers['x-pdf-hash'] || null;

        // ✅ Récupérer le nom du fichier
        const contentDisposition = response.headers['content-disposition'];
        let filename = `permis-${id}.pdf`;
        
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '');
          }
        }

        console.log('📋 Informations du fichier:', {
          filename,
          size: `${(response.data.size / 1024).toFixed(2)} KB`,
          type: response.data.type,
          hash: pdfHash ? pdfHash.substring(0, 16) + '...' : 'N/A'
        });

        // ✅ CORRECTION: Créer l'URL blob CORRECTEMENT
        const url = window.URL.createObjectURL(response.data);
        
        console.log('🔗 URL Blob créée:', url.substring(0, 50) + '...');

        // ✅ Créer l'élément anchor
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        link.style.display = 'none';

        // ✅ CRITIQUE: Ajouter au DOM avant de cliquer
        document.body.appendChild(link);
        console.log('✅ Élément <a> ajouté au DOM');

        // ✅ Déclencher le clic
        link.click();
        console.log('✅ Click déclenché');

        // ✅ Nettoyer APRÈS un délai pour permettre le téléchargement
        setTimeout(() => {
          link.remove();
          console.log('✅ Élément <a> supprimé du DOM');
        }, 100);

        // ✅ Nettoyer l'URL blob APRÈS un délai plus long
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          console.log('✅ URL Blob révoquée');
        }, 500);

        return { 
          success: true, 
          filename,
          hash: pdfHash,
          size: response.data.size,
          downloaded: true,
          sizeKB: (response.data.size / 1024).toFixed(2)
        };
        
      } catch (error) {
        console.error('❌ Erreur export PDF:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ SUCCESS - Mutation réussie:', data);
      toast.success(
        `✅ PDF téléchargé: ${data.filename} (${data.sizeKB} KB)`,
        { autoClose: 5000 }
      );
    },
    onError: (error) => {
      console.error('❌ ERROR - Mutation échouée:', error);
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de l\'export PDF';
      toast.error(message, { autoClose: 5000 });
    }
  });
};


export const useVerifyPermisPDF = () => {
  return useMutation({
    mutationFn: async (id) => {
      try {
        console.log('');
        console.log('┌─────────────────────────────────────────────────────┐');
        console.log('│   🔍 HOOK: useVerifyPermisPDF                       │');
        console.log('└─────────────────────────────────────────────────────┘');
        console.log('📨 Envoi vérification pour permis:', id);

        const token = localStorage.getItem('accessToken');
        
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/permis/${id}/verify-pdf`,
          {}, // Body vide
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            // ✅ CRITIQUE: Accepter TOUS les status (200, 400, 500, etc.)
            // Car la vérification peut retourner des infos d'erreur en 200
            validateStatus: () => true
          }
        );

        console.log('📥 Réponse reçue:', {
          status: response.status,
          data: response.data
        });

        return response.data;
        
      } catch (error) {
        console.error('❌ Erreur réseau:', {
          message: error.message,
          code: error.code
        });
        
        // Retourner une erreur structurée
        return {
          success: false,
          isValid: false,
          message: error.message,
          data: {
            isValid: false,
            details: { error: error.message }
          }
        };
      }
    },
    onSuccess: (response) => {
      console.log('');
      console.log('┌─────────────────────────────────────────────────────┐');
      console.log('│   📊 RÉSULTAT VÉRIFICATION                          │');
      console.log('└─────────────────────────────────────────────────────┘');
      console.log('Response:', JSON.stringify(response, null, 2));

      // ✅ Vérifier si c'est valide
      const isValid = response.success !== false && 
                     (response.isValid === true || response.data?.isValid === true);

      if (isValid) {
        console.log('✅ PDF VALIDE - Intégrité confirmée');
        toast.success('✅ PDF vérifié - Intégrité confirmée', { autoClose: 5000 });
        
        const details = response.data?.details || response.details || {};
        console.log('📋 Détails:', {
          pdfIntegre: details.pdfIntegre,
          signaturesValides: details.signaturesValides,
          nombreApprobations: details.nombreApprobations
        });

        if (details.verifications) {
          console.table(details.verifications);
        }
      } else {
        console.log('⚠️ PROBLÈMES DÉTECTÉS');
        const raison = response.message || response.data?.message || 'Vérification échouée';
        toast.warning(`⚠️ ${raison}`, { autoClose: 7000 });

        const details = response.data?.details || response.details || {};
        console.warn('🔴 Problèmes:', details);

        if (details.pdfIntegre === false) {
          console.warn('🔴 Le PDF a été modifié depuis sa génération!');
        }
        if (details.signaturesValides === false) {
          console.warn('🔴 Au moins une signature est invalide!');
          if (details.verifications) {
            const invalides = details.verifications.filter(v => !v.valide);
            console.table(invalides);
          }
        }
      }
      console.log('');
    },
    onError: (error) => {
      console.error('❌ MUTATION ERROR:', error.message);
      toast.error(`❌ Erreur: ${error.message}`, { autoClose: 5000 });
    }
  });
};