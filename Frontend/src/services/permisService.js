import apiClient from '../api/client';

export const permisService = {
  // Liste des permis avec filtres
  async getPermis(filters = {}, pagination = {}) {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    return apiClient.get(`/permis?${params.toString()}`);
  },

  // Détails d'un permis
  async getPermisById(id) {
    return apiClient.get(`/permis/${id}`);
  },

  // Créer un permis
  async createPermis(data) {
    return apiClient.post('/permis', data);
  },

  // Modifier un permis
  async updatePermis(id, data) {
    return apiClient.put(`/permis/${id}`, data);
  },

  // Valider un permis
  async validatePermis(id, data) {
    return apiClient.post(`/permis/${id}/valider`, data);
  },

  // Suspendre un permis
  async suspendPermis(id, raison) {
    return apiClient.post(`/permis/${id}/suspendre`, { raison });
  },

  // Clôturer un permis
  async closePermis(id) {
    return apiClient.post(`/permis/${id}/cloturer`);
  },

  // Ajouter un fichier
  async addFile(id, file) {
    const formData = new FormData();
    formData.append('fichier', file);
    
    return apiClient.post(`/permis/${id}/ajouter-fichier`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Export PDF
  async exportPDF(id) {
    return apiClient.get(`/permis/${id}/export/pdf`, {
      responseType: 'blob'
    });
  },

  // Vérifier intégrité PDF
  async verifyPDF(id) {
    return apiClient.post(`/permis/${id}/verify-pdf`);
  }
};