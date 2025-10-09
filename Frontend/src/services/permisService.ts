// ============================================
// SERVICES HSE - PERMIS DE TRAVAIL
// ============================================

import apiClient from '@/lib/api';
import { Permis, CreatePermisData, UpdatePermisData, ValidationData, SuspensionData } from '@/types';

export class PermisService {
  // Créer un permis
  static async creerPermis(data: CreatePermisData) {
    const response = await apiClient.post('/permis', data);
    return response.data;
  }

  // Lister les permis avec filtres
  static async listerPermis(filters: any = {}, pagination: any = {}) {
    const params = new URLSearchParams();
    
    // Ajouter les filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    // Ajouter la pagination
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/permis?${params.toString()}`);
    return response;
  }

  // Obtenir un permis par ID
  static async obtenirPermis(id: string) {
    const response = await apiClient.get(`/permis/${id}`);
    return response.data;
  }

  // Modifier un permis
  static async modifierPermis(id: string, data: UpdatePermisData) {
    const response = await apiClient.put(`/permis/${id}`, data);
    return response.data;
  }

  // Valider un permis
  static async validerPermis(id: string, data: ValidationData) {
    const response = await apiClient.post(`/permis/${id}/valider`, data);
    return response.data;
  }

  // Suspendre un permis
  static async suspendrePermis(id: string, data: SuspensionData) {
    const response = await apiClient.post(`/permis/${id}/suspendre`, data);
    return response.data;
  }

  // Clôturer un permis
  static async cloturerPermis(id: string) {
    const response = await apiClient.post(`/permis/${id}/cloturer`);
    return response.data;
  }

  // Ajouter un fichier à un permis
  static async ajouterFichier(id: string, file: File) {
    const formData = new FormData();
    formData.append('fichier', file);
    
    const response = await apiClient.post(`/permis/${id}/ajouter-fichier`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Exporter le PDF d'un permis
  static async exporterPDF(id: string) {
    const response = await apiClient.get(`/permis/${id}/export/pdf`, {
      responseType: 'blob',
    });
    
    // Créer un blob et télécharger le fichier
    const blob = new Blob([response], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permis-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Vérifier l'intégrité d'un PDF
  static async verifierPDF(id: string) {
    const response = await apiClient.post(`/permis/${id}/verify-pdf`);
    return response.data;
  }

  // Générer le numéro de permis suivant
  static genererNumeroPermis(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `PT-${year}-${random}`;
  }

  // Vérifier si un permis peut être modifié
  static peutEtreModifie(permis: Permis): boolean {
    return ['BROUILLON', 'EN_ATTENTE'].includes(permis.statut);
  }

  // Vérifier si un permis peut être validé
  static peutEtreValide(permis: Permis, userRole: string): boolean {
    switch (permis.statut) {
      case 'EN_ATTENTE':
        return ['SUPERVISEUR', 'HSE'].includes(userRole);
      case 'VALIDE':
        return ['RESP_ZONE', 'HSE'].includes(userRole);
      default:
        return false;
    }
  }

  // Vérifier si un permis peut être suspendu
  static peutEtreSuspendu(permis: Permis, userRole: string): boolean {
    return ['RESP_ZONE', 'HSE'].includes(userRole) && 
           ['VALIDE', 'EN_COURS'].includes(permis.statut);
  }

  // Vérifier si un permis peut être clôturé
  static peutEtreCloture(permis: Permis, userRole: string, userId: string): boolean {
    return ['HSE', 'SUPERVISEUR'].includes(userRole) || 
           (userRole === 'DEMANDEUR' && permis.demandeur_id === userId);
  }
}

export default PermisService;