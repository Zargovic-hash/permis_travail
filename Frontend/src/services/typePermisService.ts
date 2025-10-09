// ============================================
// SERVICES HSE - TYPES DE PERMIS
// ============================================

import apiClient from '@/lib/api';
import { TypePermis, CreateTypePermisData } from '@/types';

export class TypePermisService {
  // Créer un type de permis
  static async creerTypePermis(data: CreateTypePermisData) {
    const response = await apiClient.post('/types-permis', data);
    return response.data;
  }

  // Lister tous les types de permis
  static async listerTypesPermis() {
    const response = await apiClient.get('/types-permis');
    return response.data;
  }

  // Obtenir un type de permis par ID
  static async obtenirTypePermis(id: string) {
    const response = await apiClient.get(`/types-permis/${id}`);
    return response.data;
  }

  // Modifier un type de permis
  static async modifierTypePermis(id: string, data: Partial<CreateTypePermisData>) {
    const response = await apiClient.put(`/types-permis/${id}`, data);
    return response.data;
  }

  // Supprimer un type de permis
  static async supprimerTypePermis(id: string) {
    const response = await apiClient.delete(`/types-permis/${id}`);
    return response.data;
  }

  // Obtenir les types avec statistiques
  static async obtenirTypesAvecStats() {
    const types = await this.listerTypesPermis();
    // TODO: Ajouter les statistiques de permis par type
    return types;
  }

  // Vérifier si un type peut être supprimé
  static async peutEtreSupprime(id: string): Promise<boolean> {
    try {
      // Vérifier s'il y a des permis associés à ce type
      const response = await apiClient.get(`/permis?type_permis_id=${id}&limit=1`);
      return response.data.length === 0;
    } catch (error) {
      return false;
    }
  }

  // Formater les données pour les selects
  static formaterPourSelect(types: TypePermis[]) {
    return types.map(type => ({
      value: type.id,
      label: type.nom,
      description: type.description
    }));
  }

  // Rechercher des types par nom
  static rechercherTypes(types: TypePermis[], terme: string): TypePermis[] {
    if (!terme) return types;
    
    const termeLower = terme.toLowerCase();
    return types.filter(type => 
      type.nom.toLowerCase().includes(termeLower) ||
      type.description.toLowerCase().includes(termeLower)
    );
  }

  // Obtenir les types de permis courants
  static obtenirTypesCourants(): TypePermis[] {
    return [
      {
        id: 'permis-feu',
        nom: 'Permis Feu',
        description: 'Autorisation pour travaux par points chauds'
      },
      {
        id: 'permis-espace-confine',
        nom: 'Permis Espace Confiné',
        description: 'Autorisation pour travaux en espace confiné'
      },
      {
        id: 'permis-electrique',
        nom: 'Permis Électrique',
        description: 'Autorisation pour travaux électriques'
      },
      {
        id: 'permis-hauteur',
        nom: 'Permis Travaux en Hauteur',
        description: 'Autorisation pour travaux en hauteur'
      },
      {
        id: 'permis-excavation',
        nom: 'Permis Excavation',
        description: 'Autorisation pour travaux d\'excavation'
      },
      {
        id: 'permis-loto',
        nom: 'Permis LOTO',
        description: 'Autorisation pour travaux sous LOTO (Lock Out Tag Out)'
      }
    ];
  }

  // Obtenir les conditions préalables par défaut pour un type
  static obtenirConditionsPrealables(typeId: string): Record<string, string> {
    const conditions: Record<string, Record<string, string>> = {
      'permis-feu': {
        'isolation': 'Zone isolée et balisée',
        'extincteur': 'Extincteur disponible et vérifié',
        'surveillance': 'Surveillant désigné présent'
      },
      'permis-electrique': {
        'isolation': 'Installation isolée et mise à la terre',
        'verification': 'Absence de tension vérifiée',
        'epi': 'EPI électriques conformes'
      },
      'permis-hauteur': {
        'epi': 'Harnais et ligne de vie vérifiés',
        'formation': 'Personnel formé aux travaux en hauteur',
        'zone': 'Zone de chute balisée'
      }
    };

    return conditions[typeId] || {};
  }

  // Obtenir les mesures de prévention par défaut pour un type
  static obtenirMesuresPrevention(typeId: string): Record<string, string> {
    const mesures: Record<string, Record<string, string>> = {
      'permis-feu': {
        'epi': 'Casque, gants, chaussures de sécurité',
        'signalisation': 'Panneaux d\'interdiction et d\'avertissement',
        'communication': 'Radio de communication disponible'
      },
      'permis-electrique': {
        'epi': 'Gants isolants, casque, chaussures diélectriques',
        'outils': 'Outils isolés et vérifiés',
        'verification': 'Vérification continue de l\'absence de tension'
      },
      'permis-hauteur': {
        'epi': 'Harnais, casque, chaussures antidérapantes',
        'ancrage': 'Point d\'ancrage certifié',
        'rescue': 'Plan de secours défini'
      }
    };

    return mesures[typeId] || {};
  }
}

export default TypePermisService;
