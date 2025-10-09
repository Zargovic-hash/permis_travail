// ============================================
// SERVICES HSE - UTILISATEURS
// ============================================

import apiClient from '@/lib/api';
import { Utilisateur, UtilisateurFilters, PaginatedResponse } from '@/types';

export class UtilisateurService {
  // Lister les utilisateurs avec filtres et pagination
  static async listerUtilisateurs(filters: UtilisateurFilters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/utilisateurs?${params.toString()}`);
    return response;
  }

  // Obtenir un utilisateur par ID
  static async obtenirUtilisateur(id: string) {
    const response = await apiClient.get(`/utilisateurs/${id}`);
    return response.data;
  }

  // Modifier un utilisateur
  static async modifierUtilisateur(id: string, data: Partial<Utilisateur>) {
    const response = await apiClient.put(`/utilisateurs/${id}`, data);
    return response.data;
  }

  // Supprimer un utilisateur (soft delete)
  static async supprimerUtilisateur(id: string, anonymiser: boolean = false) {
    const response = await apiClient.post(`/utilisateurs/${id}/supprimer`, { anonymiser });
    return response.data;
  }

  // Anonymiser un utilisateur
  static async anonymiserUtilisateur(id: string) {
    const response = await apiClient.post(`/utilisateurs/${id}/anonymiser`);
    return response.data;
  }

  // Obtenir les utilisateurs par rôle
  static async obtenirUtilisateursParRole(role: string) {
    const response = await this.listerUtilisateurs({ role });
    return response.data;
  }

  // Obtenir les responsables de zone
  static async obtenirResponsablesZone() {
    const response = await this.listerUtilisateurs({ role: 'RESP_ZONE' });
    return response.data;
  }

  // Obtenir les superviseurs
  static async obtenirSuperviseurs() {
    const response = await this.listerUtilisateurs({ role: 'SUPERVISEUR' });
    return response.data;
  }

  // Obtenir les demandeurs
  static async obtenirDemandeurs() {
    const response = await this.listerUtilisateurs({ role: 'DEMANDEUR' });
    return response.data;
  }

  // Vérifier si un utilisateur peut être modifié
  static peutEtreModifie(utilisateur: Utilisateur, currentUser: Utilisateur): boolean {
    // HSE et ADMIN peuvent modifier tous les utilisateurs
    if (['HSE', 'ADMIN'].includes(currentUser.role)) {
      return true;
    }
    
    // Un utilisateur peut modifier son propre profil
    return utilisateur.id === currentUser.id;
  }

  // Vérifier si un utilisateur peut être supprimé
  static peutEtreSupprime(utilisateur: Utilisateur, currentUser: Utilisateur): boolean {
    // Seuls HSE et ADMIN peuvent supprimer
    if (!['HSE', 'ADMIN'].includes(currentUser.role)) {
      return false;
    }
    
    // Ne pas pouvoir se supprimer soi-même
    return utilisateur.id !== currentUser.id;
  }

  // Obtenir le nom complet d'un utilisateur
  static obtenirNomComplet(utilisateur: Utilisateur): string {
    if (utilisateur.anonymise) {
      return 'Utilisateur anonymisé';
    }
    return `${utilisateur.prenom} ${utilisateur.nom}`;
  }

  // Obtenir l'initiales d'un utilisateur
  static obtenirInitiales(utilisateur: Utilisateur): string {
    if (utilisateur.anonymise) {
      return 'UA';
    }
    return `${utilisateur.prenom.charAt(0)}${utilisateur.nom.charAt(0)}`.toUpperCase();
  }

  // Vérifier si un utilisateur est actif
  static estActif(utilisateur: Utilisateur): boolean {
    return utilisateur.actif && !utilisateur.supprime;
  }

  // Obtenir le statut d'un utilisateur
  static obtenirStatut(utilisateur: Utilisateur): string {
    if (utilisateur.supprime) {
      return 'Supprimé';
    }
    if (utilisateur.anonymise) {
      return 'Anonymisé';
    }
    if (!utilisateur.actif) {
      return 'Inactif';
    }
    return 'Actif';
  }
}

export default UtilisateurService;
