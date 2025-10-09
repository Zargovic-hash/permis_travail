// ============================================
// SERVICES HSE - ZONES
// ============================================

import apiClient from '@/lib/api';
import { Zone, CreateZoneData } from '@/types';

export class ZoneService {
  // Créer une zone
  static async creerZone(data: CreateZoneData) {
    const response = await apiClient.post('/zones', data);
    return response.data;
  }

  // Lister toutes les zones
  static async listerZones() {
    const response = await apiClient.get('/zones');
    return response.data;
  }

  // Obtenir une zone par ID
  static async obtenirZone(id: string) {
    const response = await apiClient.get(`/zones/${id}`);
    return response.data;
  }

  // Modifier une zone
  static async modifierZone(id: string, data: Partial<CreateZoneData>) {
    const response = await apiClient.put(`/zones/${id}`, data);
    return response.data;
  }

  // Supprimer une zone
  static async supprimerZone(id: string) {
    const response = await apiClient.delete(`/zones/${id}`);
    return response.data;
  }

  // Obtenir les zones avec statistiques
  static async obtenirZonesAvecStats() {
    const zones = await this.listerZones();
    // TODO: Ajouter les statistiques de permis par zone
    return zones;
  }

  // Vérifier si une zone peut être supprimée
  static async peutEtreSupprimee(id: string): Promise<boolean> {
    try {
      // Vérifier s'il y a des permis associés à cette zone
      const response = await apiClient.get(`/permis?zone_id=${id}&limit=1`);
      return response.data.length === 0;
    } catch (error) {
      return false;
    }
  }

  // Obtenir le nom complet du responsable
  static obtenirNomResponsable(zone: Zone): string {
    return `${zone.responsable_prenom} ${zone.responsable_nom}`;
  }

  // Formater les données pour les selects
  static formaterPourSelect(zones: Zone[]) {
    return zones.map(zone => ({
      value: zone.id,
      label: zone.nom,
      description: zone.description,
      responsable: this.obtenirNomResponsable(zone)
    }));
  }

  // Rechercher des zones par nom
  static rechercherZones(zones: Zone[], terme: string): Zone[] {
    if (!terme) return zones;
    
    const termeLower = terme.toLowerCase();
    return zones.filter(zone => 
      zone.nom.toLowerCase().includes(termeLower) ||
      zone.description.toLowerCase().includes(termeLower) ||
      zone.responsable_nom.toLowerCase().includes(termeLower) ||
      zone.responsable_prenom.toLowerCase().includes(termeLower)
    );
  }
}

export default ZoneService;
