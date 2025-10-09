export enum Role {
  HSE = 'HSE',
  ADMIN = 'ADMIN',
  RESP_ZONE = 'RESP_ZONE',
  SUPERVISEUR = 'SUPERVISEUR',
  DEMANDEUR = 'DEMANDEUR'
}

export enum PermitStatus {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REJETE = 'REJETE',
  EN_COURS = 'EN_COURS',
  SUSPENDU = 'SUSPENDU',
  CLOTURE = 'CLOTURE'
}

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  telephone?: string;
  zone_id?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: string;
  nom: string;
  description?: string;
  responsable_id?: string;
  actif: boolean;
}

export interface TypePermis {
  id: string;
  nom: string;
  description?: string;
  couleur?: string;
  duree_validite_defaut?: number;
  actif: boolean;
}

export interface Permis {
  id: string;
  numero: string;
  titre: string;
  description?: string;
  type_permis_id: string;
  zone_id: string;
  demandeur_id: string;
  statut: PermitStatus;
  date_debut: string;
  date_fin: string;
  date_debut_effectif?: string;
  date_fin_effectif?: string;
  created_at: string;
  updated_at: string;
  type_permis?: TypePermis;
  zone?: Zone;
  demandeur?: Utilisateur;
  risques?: Risque[];
  approbations?: Approbation[];
  participants?: PermisParticipant[];
}

export interface Risque {
  id: string;
  permis_id: string;
  description: string;
  mesure_prevention: string;
  niveau_risque: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
  ordre: number;
}

export interface Approbation {
  id: string;
  permis_id: string;
  approbateur_id: string;
  role_approbateur: Role;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  commentaire?: string;
  signature_image_url?: string;
  signature_hash?: string;
  date_action?: string;
  approbateur?: Utilisateur;
}

export interface PermisParticipant {
  id: string;
  permis_id: string;
  utilisateur_id: string;
  role_participant: string;
  habilitations?: string[];
  utilisateur?: Utilisateur;
}

export interface DashboardStats {
  total_permis: number;
  permis_actifs: number;
  permis_en_attente: number;
  permis_expires_7j: number;
  permis_par_type: Array<{ type: string; count: number }>;
  permis_par_statut: Array<{ statut: string; count: number }>;
}
