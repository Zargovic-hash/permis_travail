// ============================================
// SERVICES HSE - AUDIT LOGS
// ============================================

import apiClient from '@/lib/api';
import { AuditLog, AuditLogFilters, PaginatedResponse } from '@/types';

export class AuditLogService {
  // Lister les logs d'audit avec filtres et pagination
  static async listerAuditLogs(filters: AuditLogFilters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/audit-logs?${params.toString()}`);
    return response;
  }

  // Obtenir un log d'audit par ID
  static async obtenirAuditLog(id: number) {
    const response = await apiClient.get(`/audit-logs/${id}`);
    return response.data;
  }

  // Exporter les logs d'audit en CSV
  static async exporterAuditLogsCSV(filters: AuditLogFilters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/audit-logs/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Créer un blob et télécharger le fichier
    const blob = new Blob([response], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Obtenir les statistiques des logs d'audit
  static async obtenirStatistiquesAudit() {
    const response = await apiClient.get('/audit-logs/statistiques');
    return response.data;
  }

  // Filtrer les logs par action
  static filtrerParAction(logs: AuditLog[], action: string): AuditLog[] {
    return logs.filter(log => log.action === action);
  }

  // Filtrer les logs par utilisateur
  static filtrerParUtilisateur(logs: AuditLog[], utilisateurId: string): AuditLog[] {
    return logs.filter(log => log.utilisateur_id === utilisateurId);
  }

  // Filtrer les logs par période
  static filtrerParPeriode(logs: AuditLog[], dateDebut: string, dateFin: string): AuditLog[] {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    return logs.filter(log => {
      const dateLog = new Date(log.date_action);
      return dateLog >= debut && dateLog <= fin;
    });
  }

  // Obtenir les actions les plus fréquentes
  static obtenirActionsFrequentes(logs: AuditLog[], limit: number = 10) {
    const actions: Record<string, number> = {};
    
    logs.forEach(log => {
      actions[log.action] = (actions[log.action] || 0) + 1;
    });
    
    return Object.entries(actions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([action, count]) => ({ action, count }));
  }

  // Obtenir les utilisateurs les plus actifs
  static obtenirUtilisateursActifs(logs: AuditLog[], limit: number = 10) {
    const utilisateurs: Record<string, number> = {};
    
    logs.forEach(log => {
      if (log.utilisateur_id) {
        utilisateurs[log.utilisateur_id] = (utilisateurs[log.utilisateur_id] || 0) + 1;
      }
    });
    
    return Object.entries(utilisateurs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([utilisateurId, count]) => ({ utilisateurId, count }));
  }

  // Formater un log pour l'affichage
  static formaterLog(log: AuditLog) {
    return {
      ...log,
      dateFormatee: new Date(log.date_action).toLocaleString('fr-FR'),
      actionFormatee: this.formaterAction(log.action),
      utilisateurFormate: log.utilisateur_id ? `User ${log.utilisateur_id}` : 'Système'
    };
  }

  // Formater le nom de l'action
  static formaterAction(action: string): string {
    const actions: Record<string, string> = {
      'INSCRIPTION': 'Inscription',
      'CONNEXION': 'Connexion',
      'CONNEXION_ECHEC': 'Échec de connexion',
      'DECONNEXION': 'Déconnexion',
      'CREATION_PERMIS': 'Création de permis',
      'MODIFICATION_PERMIS': 'Modification de permis',
      'VALIDATION_PERMIS': 'Validation de permis',
      'SUSPENSION_PERMIS': 'Suspension de permis',
      'CLOTURE_PERMIS': 'Clôture de permis',
      'SUPPRESSION_UTILISATEUR': 'Suppression utilisateur',
      'ANONYMISATION_UTILISATEUR': 'Anonymisation utilisateur',
      'RESET_MDP': 'Réinitialisation mot de passe',
      'DEMANDE_RESET_MDP': 'Demande de réinitialisation',
      'EXPORT_PDF_PERMIS': 'Export PDF',
      'AJOUT_FICHIER_PERMIS': 'Ajout de fichier'
    };
    
    return actions[action] || action;
  }

  // Obtenir la couleur pour une action
  static obtenirCouleurAction(action: string): string {
    const couleurs: Record<string, string> = {
      'CONNEXION': 'bg-blue-100 text-blue-800',
      'CONNEXION_ECHEC': 'bg-red-100 text-red-800',
      'CREATION_PERMIS': 'bg-green-100 text-green-800',
      'MODIFICATION_PERMIS': 'bg-yellow-100 text-yellow-800',
      'VALIDATION_PERMIS': 'bg-green-100 text-green-800',
      'SUSPENSION_PERMIS': 'bg-red-100 text-red-800',
      'CLOTURE_PERMIS': 'bg-gray-100 text-gray-800',
      'SUPPRESSION_UTILISATEUR': 'bg-red-100 text-red-800',
      'ANONYMISATION_UTILISATEUR': 'bg-orange-100 text-orange-800',
      'EXPORT_PDF_PERMIS': 'bg-purple-100 text-purple-800',
      'AJOUT_FICHIER_PERMIS': 'bg-blue-100 text-blue-800'
    };
    
    return couleurs[action] || 'bg-gray-100 text-gray-800';
  }

  // Obtenir l'icône pour une action
  static obtenirIconeAction(action: string): string {
    const icones: Record<string, string> = {
      'CONNEXION': 'LogIn',
      'CONNEXION_ECHEC': 'XCircle',
      'CREATION_PERMIS': 'Plus',
      'MODIFICATION_PERMIS': 'Edit',
      'VALIDATION_PERMIS': 'CheckCircle',
      'SUSPENSION_PERMIS': 'PauseCircle',
      'CLOTURE_PERMIS': 'Archive',
      'SUPPRESSION_UTILISATEUR': 'Trash2',
      'ANONYMISATION_UTILISATEUR': 'UserX',
      'EXPORT_PDF_PERMIS': 'Download',
      'AJOUT_FICHIER_PERMIS': 'Upload'
    };
    
    return icones[action] || 'Activity';
  }
}

export default AuditLogService;
