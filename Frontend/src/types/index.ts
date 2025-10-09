// ============================================
// TYPES & INTERFACES - HSE PERMIT SYSTEM
// ============================================

// ========== ENUMS ==========
export enum Role {
  DEMANDEUR = 'DEMANDEUR',
  SUPERVISEUR = 'SUPERVISEUR',
  RESP_ZONE = 'RESP_ZONE',
  HSE = 'HSE',
  ADMIN = 'ADMIN'
}

export enum StatutPermis {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  EN_COURS = 'EN_COURS',
  SUSPENDU = 'SUSPENDU',
  CLOTURE = 'CLOTURE'
}

export enum StatutApprobation {
  APPROUVE = 'APPROUVE',
  REFUSE = 'REFUSE',
  SUSPENDU = 'SUSPENDU'
}

export enum ActionAudit {
  INSCRIPTION = 'INSCRIPTION',
  CONNEXION = 'CONNEXION',
  CONNEXION_ECHEC = 'CONNEXION_ECHEC',
  DECONNEXION = 'DECONNEXION',
  CREATION_PERMIS = 'CREATION_PERMIS',
  MODIFICATION_PERMIS = 'MODIFICATION_PERMIS',
  VALIDATION_PERMIS = 'VALIDATION_PERMIS',
  SUSPENSION_PERMIS = 'SUSPENSION_PERMIS',
  CLOTURE_PERMIS = 'CLOTURE_PERMIS',
  SUPPRESSION_UTILISATEUR = 'SUPPRESSION_UTILISATEUR',
  ANONYMISATION_UTILISATEUR = 'ANONYMISATION_UTILISATEUR',
  RESET_MDP = 'RESET_MDP',
  DEMANDE_RESET_MDP = 'DEMANDE_RESET_MDP',
  EXPORT_PDF_PERMIS = 'EXPORT_PDF_PERMIS',
  AJOUT_FICHIER_PERMIS = 'AJOUT_FICHIER_PERMIS'
}

// ========== USER TYPES ==========
export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  habilitations?: Record<string, any>;
  signature_image_path?: string | null;
  actif: boolean;
  supprime: boolean;
  anonymise: boolean;
  date_creation: string;
  date_modification: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  role?: Role;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  utilisateur: Utilisateur;
}

// ========== PERMIT TYPES ==========
export interface Permis {
  id: string;
  numero_permis: string;
  type_permis_id: string;
  type_permis_nom: string;
  zone_id: string;
  zone_nom: string;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  demandeur_id: string;
  demandeur_nom: string;
  demandeur_prenom: string;
  statut: StatutPermis;
  conditions_prealables?: Record<string, any>;
  mesures_prevention?: Record<string, any>;
  resultat_tests_atmos?: Record<string, any>;
  justificatifs?: Record<string, any>;
  supprime: boolean;
  date_creation: string;
  date_modification: string;
  approbations?: Approbation[];
}

export interface CreatePermisData {
  type_permis_id: string;
  zone_id: string;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  conditions_prealables?: Record<string, any>;
  mesures_prevention?: Record<string, any>;
  resultat_tests_atmos?: Record<string, any>;
}

export interface UpdatePermisData extends Partial<CreatePermisData> {}

export interface ValidationData {
  commentaire: string;
  signature_image?: File | string;
}

export interface SuspensionData {
  raison: string;
}

// ========== APPROBATION TYPES ==========
export interface Approbation {
  id: string;
  permis_id: string;
  utilisateur_id: string;
  nom: string;
  prenom: string;
  role: string;
  role_app: Role;
  statut: StatutApprobation;
  commentaire: string;
  date_action: string;
  signature_image_path?: string | null;
  signature_hash: string;
}

// ========== ZONE & TYPE TYPES ==========
export interface Zone {
  id: string;
  nom: string;
  description: string;
  responsable_id: string;
  responsable_nom: string;
  responsable_prenom: string;
}

export interface CreateZoneData {
  nom: string;
  description: string;
  responsable_id: string;
}

export interface TypePermis {
  id: string;
  nom: string;
  description: string;
}

export interface CreateTypePermisData {
  nom: string;
  description: string;
}

// ========== STATISTICS TYPES ==========
export interface StatistiquesGlobales {
  total_permis: number;
  permis_actifs: number;
  permis_valides: number;
  permis_suspendus: number;
  permis_clotures: number;
  permis_brouillons: number;
  permis_en_attente: number;
}

export interface StatistiqueParZone {
  zone: string;
  zone_id: string;
  nombre_permis: number;
  actifs: number;
  clotures: number;
}

export interface StatistiqueParType {
  type: string;
  type_id: string;
  nombre_permis: number;
  actifs: number;
  clotures: number;
}

export interface StatistiqueParMois {
  mois: string;
  nombre_permis: number;
}

export interface Statistiques {
  statistiques_globales: StatistiquesGlobales;
  par_zone: StatistiqueParZone[];
  par_type: StatistiqueParType[];
  par_mois: StatistiqueParMois[];
  temps_approbation_moyen: number;
}

// ========== AUDIT LOG TYPES ==========
export interface AuditLog {
  id: number;
  action: ActionAudit;
  utilisateur_id?: string | null;
  cible_table: string;
  cible_id: string;
  payload: Record<string, any>;
  ip_client: string;
  date_action: string;
}

export interface AuditLogFilters {
  utilisateur_id?: string;
  action?: ActionAudit;
  cible_table?: string;
  date_debut?: string;
  date_fin?: string;
  page?: number;
  limit?: number;
}

// ========== API RESPONSE TYPES ==========
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ========== FILTER TYPES ==========
export interface PermisFilters {
  zone_id?: string;
  type_permis_id?: string;
  statut?: StatutPermis;
  demandeur_id?: string;
  date_debut?: string;
  date_fin?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UtilisateurFilters {
  role?: Role;
  actif?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// ========== FILE UPLOAD TYPES ==========
export interface FileUploadResponse {
  success: boolean;
  file_path: string;
  file_name: string;
  file_size: number;
}

// ========== NOTIFICATION TYPES ==========
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  date: string;
  action_url?: string;
}

// ========== FORM STEP TYPES ==========
export interface FormStep {
  id: number;
  label: string;
  description: string;
  isValid: boolean;
  isCompleted: boolean;
}

// ========== EXPORT ==========
export type { };