// ============================================
// SERVICES HSE - RAPPORTS ET STATISTIQUES
// ============================================

import apiClient from '@/lib/api';
import { Statistiques } from '@/types';

export class RapportService {
  // Obtenir les statistiques globales
  static async obtenirStatistiques(filters: any = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/reports/statistiques?${params.toString()}`);
    return response.data;
  }

  // Exporter les données en CSV
  static async exporterCSV(filters: any = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/reports/export-csv?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Créer un blob et télécharger le fichier
    const blob = new Blob([response], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_permis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Obtenir les KPIs pour le dashboard
  static async obtenirKPIs() {
    const stats = await this.obtenirStatistiques();
    
    return {
      totalPermis: stats.statistiques_globales?.total_permis || 0,
      permisActifs: stats.statistiques_globales?.permis_actifs || 0,
      permisEnAttente: stats.statistiques_globales?.permis_en_attente || 0,
      permisValides: stats.statistiques_globales?.permis_valides || 0,
      permisSuspendus: stats.statistiques_globales?.permis_suspendus || 0,
      permisClotures: stats.statistiques_globales?.permis_clotures || 0,
      tempsApproMoyen: stats.temps_approbation_moyen || 0
    };
  }

  // Obtenir les données pour les graphiques
  static async obtenirDonneesGraphiques() {
    const stats = await this.obtenirStatistiques();
    
    return {
      parZone: stats.par_zone || [],
      parType: stats.par_type || [],
      parMois: stats.par_mois || []
    };
  }

  // Calculer le taux d'approbation
  static calculerTauxApprobation(stats: Statistiques): number {
    const total = stats.statistiques_globales.total_permis;
    const valides = stats.statistiques_globales.permis_valides;
    
    if (total === 0) return 0;
    return Math.round((valides / total) * 100);
  }

  // Calculer le taux de conformité
  static calculerTauxConformite(stats: Statistiques): number {
    const total = stats.statistiques_globales.total_permis;
    const clotures = stats.statistiques_globales.permis_clotures;
    
    if (total === 0) return 0;
    return Math.round((clotures / total) * 100);
  }

  // Obtenir les alertes
  static obtenirAlertes(stats: Statistiques): Array<{type: string, message: string, severity: 'info' | 'warning' | 'error'}> {
    const alertes = [];
    
    // Permis en attente depuis longtemps
    if (stats.statistiques_globales.permis_en_attente > 10) {
      alertes.push({
        type: 'permis_en_attente',
        message: `${stats.statistiques_globales.permis_en_attente} permis en attente de validation`,
        severity: 'warning' as const
      });
    }
    
    // Permis suspendus
    if (stats.statistiques_globales.permis_suspendus > 0) {
      alertes.push({
        type: 'permis_suspendus',
        message: `${stats.statistiques_globales.permis_suspendus} permis suspendus`,
        severity: 'error' as const
      });
    }
    
    // Temps d'approbation élevé
    if (stats.temps_approbation_moyen > 24) {
      alertes.push({
        type: 'temps_approbation',
        message: `Temps d'approbation moyen: ${stats.temps_approbation_moyen}h`,
        severity: 'warning' as const
      });
    }
    
    return alertes;
  }

  // Formater les données pour les graphiques Recharts
  static formaterPourRecharts(data: any[], type: 'zone' | 'type' | 'mois') {
    switch (type) {
      case 'zone':
        return data.map(item => ({
          zone: item.zone,
          total: item.nombre_permis,
          actifs: item.actifs,
          clotures: item.clotures
        }));
      
      case 'type':
        return data.map(item => ({
          type: item.type,
          total: item.nombre_permis,
          actifs: item.actifs,
          clotures: item.clotures
        }));
      
      case 'mois':
        return data.map(item => ({
          mois: item.mois,
          nombre: item.nombre_permis
        }));
      
      default:
        return data;
    }
  }

  // Générer un rapport PDF (côté client)
  static genererRapportPDF(stats: Statistiques, titre: string = 'Rapport HSE') {
    // TODO: Implémenter la génération PDF côté client avec jsPDF
    console.log('Génération du rapport PDF:', { stats, titre });
  }
}

export default RapportService;
