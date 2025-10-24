/**
 * Constantes de l'application
 */

// Statuts des permis
export const PERMIS_STATUS = {
  BROUILLON: 'BROUILLON',
  EN_ATTENTE: 'EN_ATTENTE',
  VALIDE: 'VALIDE',
  EN_COURS: 'EN_COURS',
  SUSPENDU: 'SUSPENDU',
  CLOTURE: 'CLOTURE'
};

// Rôles utilisateurs
export const USER_ROLES = {
  DEMANDEUR: 'DEMANDEUR',
  SUPERVISEUR: 'SUPERVISEUR',
  RESP_ZONE: 'RESP_ZONE',
  HSE: 'HSE',
  ADMIN: 'ADMIN'
};

// Types de fichiers acceptés
export const ACCEPTED_FILE_TYPES = {
  PDF: 'application/pdf',
  JPEG: 'image/jpeg',
  PNG: 'image/png'
};

// Taille maximale des fichiers (10 MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Durée de cache par défaut (5 minutes)
export const DEFAULT_STALE_TIME = 5 * 60 * 1000;

// Actions d'audit
export const AUDIT_ACTIONS = {
  INSCRIPTION: 'INSCRIPTION',
  CONNEXION: 'CONNEXION',
  CONNEXION_ECHEC: 'CONNEXION_ECHEC',
  DECONNEXION: 'DECONNEXION',
  CREATION_PERMIS: 'CREATION_PERMIS',
  MODIFICATION_PERMIS: 'MODIFICATION_PERMIS',
  VALIDATION_PERMIS: 'VALIDATION_PERMIS',
  SUSPENSION_PERMIS: 'SUSPENSION_PERMIS',
  CLOTURE_PERMIS: 'CLOTURE_PERMIS',
  SUPPRESSION_UTILISATEUR: 'SUPPRESSION_UTILISATEUR',
  ANONYMISATION_UTILISATEUR: 'ANONYMISATION_UTILISATEUR',
  RESET_MDP: 'RESET_MDP',
  DEMANDE_RESET_MDP: 'DEMANDE_RESET_MDP',
  EXPORT_PDF_PERMIS: 'EXPORT_PDF_PERMIS',
  AJOUT_FICHIER_PERMIS: 'AJOUT_FICHIER_PERMIS'
};

// Options de pagination
export const PAGINATION_OPTIONS = [10, 25, 50, 100];

// Couleurs des statuts
export const STATUS_COLORS = {
  BROUILLON: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  },
  EN_ATTENTE: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  VALIDE: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  EN_COURS: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  SUSPENDU: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  CLOTURE: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
};

// Messages d'erreur par défaut
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
  FORBIDDEN: 'Accès refusé',
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur',
  VALIDATION_ERROR: 'Erreur de validation des données'
};

// Configuration des toasts
export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_FR: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
};