// ============================================
// CONSTANTS HSE - PERMIS DE TRAVAIL
// ============================================

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Authentication
export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'user',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.webp'],
  SIGNATURE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Role Labels (HSE Vocabulary)
export const ROLE_LABELS = {
  DEMANDEUR: 'Demandeur',
  SUPERVISEUR: 'Superviseur',
  RESP_ZONE: 'Responsable de Zone',
  HSE: 'HSE (Superutilisateur)',
  ADMIN: 'Administrateur IT',
} as const;

// Role Colors (HSE Theme)
export const ROLE_COLORS = {
  DEMANDEUR: 'bg-blue-100 text-blue-800',
  SUPERVISEUR: 'bg-green-100 text-green-800',
  RESP_ZONE: 'bg-purple-100 text-purple-800',
  HSE: 'bg-red-100 text-red-800',
  ADMIN: 'bg-gray-100 text-gray-800',
} as const;

// Status Labels (HSE Vocabulary)
export const STATUT_LABELS = {
  BROUILLON: 'Brouillon',
  EN_ATTENTE: 'En Attente de Validation',
  VALIDE: 'Validé',
  EN_COURS: 'En Cours d\'Exécution',
  SUSPENDU: 'Suspendu',
  CLOTURE: 'Clôturé',
} as const;

// Status Colors (HSE Theme)
export const STATUT_COLORS = {
  BROUILLON: 'bg-gray-100 text-gray-800 border-gray-200',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  VALIDE: 'bg-green-100 text-green-800 border-green-200',
  EN_COURS: 'bg-blue-100 text-blue-800 border-blue-200',
  SUSPENDU: 'bg-orange-100 text-orange-800 border-orange-200',
  CLOTURE: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

// Approval Status Labels
export const APPROBATION_LABELS = {
  APPROUVE: 'Approuvé',
  REFUSE: 'Refusé',
  SUSPENDU: 'Suspendu',
} as const;

// Approval Status Colors
export const APPROBATION_COLORS = {
  APPROUVE: 'bg-green-100 text-green-800',
  REFUSE: 'bg-red-100 text-red-800',
  SUSPENDU: 'bg-orange-100 text-orange-800',
} as const;

// Audit Action Labels
export const ACTION_AUDIT_LABELS = {
  INSCRIPTION: 'Inscription',
  CONNEXION: 'Connexion',
  CONNEXION_ECHEC: 'Échec de connexion',
  DECONNEXION: 'Déconnexion',
  CREATION_PERMIS: 'Création de permis',
  MODIFICATION_PERMIS: 'Modification de permis',
  VALIDATION_PERMIS: 'Validation de permis',
  SUSPENSION_PERMIS: 'Suspension de permis',
  CLOTURE_PERMIS: 'Clôture de permis',
  SUPPRESSION_UTILISATEUR: 'Suppression d\'utilisateur',
  ANONYMISATION_UTILISATEUR: 'Anonymisation d\'utilisateur',
  RESET_MDP: 'Réinitialisation de mot de passe',
  DEMANDE_RESET_MDP: 'Demande de réinitialisation',
  EXPORT_PDF_PERMIS: 'Export PDF de permis',
  AJOUT_FICHIER_PERMIS: 'Ajout de fichier',
} as const;

// Audit Action Colors
export const ACTION_AUDIT_COLORS = {
  INSCRIPTION: 'bg-green-100 text-green-800',
  CONNEXION: 'bg-blue-100 text-blue-800',
  CONNEXION_ECHEC: 'bg-red-100 text-red-800',
  DECONNEXION: 'bg-gray-100 text-gray-800',
  CREATION_PERMIS: 'bg-green-100 text-green-800',
  MODIFICATION_PERMIS: 'bg-yellow-100 text-yellow-800',
  VALIDATION_PERMIS: 'bg-green-100 text-green-800',
  SUSPENSION_PERMIS: 'bg-orange-100 text-orange-800',
  CLOTURE_PERMIS: 'bg-gray-100 text-gray-800',
  SUPPRESSION_UTILISATEUR: 'bg-red-100 text-red-800',
  ANONYMISATION_UTILISATEUR: 'bg-red-100 text-red-800',
  RESET_MDP: 'bg-blue-100 text-blue-800',
  DEMANDE_RESET_MDP: 'bg-blue-100 text-blue-800',
  EXPORT_PDF_PERMIS: 'bg-purple-100 text-purple-800',
  AJOUT_FICHIER_PERMIS: 'bg-blue-100 text-blue-800',
} as const;

// Permissions (HSE Business Rules)
export const PERMISSIONS = {
  PERMIS: {
    CREATE: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN'],
    READ: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN'],
    UPDATE: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN'],
    DELETE: ['HSE', 'ADMIN'],
    VALIDATE_SUPERVISEUR: ['SUPERVISEUR', 'HSE'],
    VALIDATE_RESP_ZONE: ['RESP_ZONE', 'HSE'],
    VALIDATE_HSE: ['HSE'],
    SUSPEND: ['RESP_ZONE', 'HSE'],
    CLOSE: ['SUPERVISEUR', 'HSE'],
    EXPORT_PDF: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN'],
  },
  UTILISATEURS: {
    CREATE: ['HSE', 'ADMIN'],
    READ: ['HSE', 'ADMIN'],
    UPDATE: ['HSE', 'ADMIN'],
    DELETE: ['HSE', 'ADMIN'],
    ANONYMIZE: ['HSE', 'ADMIN'],
  },
  ZONES: {
    CREATE: ['HSE', 'ADMIN'],
    READ: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN'],
    UPDATE: ['HSE', 'ADMIN'],
    DELETE: ['HSE', 'ADMIN'],
  },
  TYPES_PERMIS: {
    CREATE: ['HSE', 'ADMIN'],
    READ: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN'],
    UPDATE: ['HSE', 'ADMIN'],
    DELETE: ['HSE', 'ADMIN'],
  },
  AUDIT_LOGS: {
    READ: ['HSE', 'ADMIN'],
    EXPORT: ['HSE', 'ADMIN'],
  },
  RAPPORTS: {
    READ: ['SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN'],
    EXPORT: ['SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN'],
  },
} as const;

// Date Formats (French)
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  DISPLAY_FULL: 'dd/MM/yyyy HH:mm:ss',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
  FRENCH_LONG: 'dd MMMM yyyy',
  FRENCH_SHORT: 'dd MMM yyyy',
} as const;

// Validation Messages (French)
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Ce champ est obligatoire',
  EMAIL_INVALID: 'Adresse email invalide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
  PASSWORD_PATTERN: 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre',
  PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
  DATE_INVALID: 'Date invalide',
  DATE_PAST: 'La date ne peut pas être dans le passé',
  DATE_FUTURE: 'La date ne peut pas être dans le futur',
  DATE_RANGE_INVALID: 'La date de fin doit être après la date de début',
  DATE_RANGE: 'La date de fin doit être après la date de début',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux (max 10MB)',
  FILE_SIZE: 'Le fichier est trop volumineux (max 10MB)',
  FILE_TYPE_INVALID: 'Type de fichier non autorisé',
  FILE_TYPE: 'Type de fichier non autorisé',
  PERMIT_NUMBER_INVALID: 'Format de numéro de permis invalide',
  PHONE_INVALID: 'Numéro de téléphone invalide',
  SIGNATURE_REQUIRED: 'Signature requise pour la validation',
  COMMENT_REQUIRED: 'Commentaire requis pour la validation',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Query Keys
export const QUERY_KEYS = {
  PERMIS: 'permis',
  PERMIS_DETAIL: 'permis-detail',
  PERMIS_FILTERS: 'permis-filters',
  UTILISATEURS: 'utilisateurs',
  UTILISATEURS_BY_ROLE: 'utilisateurs-by-role',
  ZONES: 'zones',
  TYPES_PERMIS: 'types-permis',
  AUDIT_LOGS: 'audit-logs',
  STATISTIQUES: 'statistiques',
  CURRENT_USER: 'current-user',
  APPROBATIONS: 'approbations',
} as const;

// Cache Times
export const CACHE_TIMES = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  STATIC_DATA: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s\-\(\)]+$/,
  PERMIT_NUMBER: /^PT-\d{4}-\d{5}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  FRENCH_POSTAL_CODE: /^\d{5}$/,
  FRENCH_SIRET: /^\d{14}$/,
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 5000,
  POSITION: 'top-right',
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 7000,
} as const;

// Chart Colors (HSE Theme)
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
  HSE_BLUE: '#1e40af',
  HSE_GREEN: '#059669',
  HSE_ORANGE: '#ea580c',
  HSE_RED: '#dc2626',
} as const;

// Breadcrumb Names (French HSE)
export const BREADCRUMB_NAMES = {
  '/': 'Tableau de bord',
  '/permis': 'Permis de travail',
  '/permis/create': 'Nouveau permis',
  '/permis/:id': 'Détails du permis',
  '/permis/:id/edit': 'Modifier le permis',
  '/zones': 'Zones d\'intervention',
  '/types-permis': 'Types de permis',
  '/utilisateurs': 'Gestion des utilisateurs',
  '/rapports': 'Rapports et statistiques',
  '/audit-logs': 'Logs d\'audit',
  '/admin': 'Administration système',
  '/profil': 'Mon profil',
  '/parametres': 'Paramètres',
} as const;

// HSE Specific Constants
export const HSE_CONSTANTS = {
  PERMIT_VALIDATION_WORKFLOW: {
    BROUILLON: 'Brouillon',
    EN_ATTENTE_SUPERVISEUR: 'En attente validation superviseur',
    EN_ATTENTE_RESP_ZONE: 'En attente validation responsable zone',
    EN_ATTENTE_HSE: 'En attente validation HSE',
    VALIDE: 'Validé et prêt',
  },
  DEFAULT_PERMIT_DURATION_HOURS: 8,
  MAX_PERMIT_DURATION_HOURS: 24,
  SIGNATURE_HASH_ALGORITHM: 'SHA256',
  PDF_METADATA: {
    TITLE: 'Permis de Travail HSE',
    AUTHOR: 'Système HSE',
    SUBJECT: 'Permis de travail sécurisé',
    KEYWORDS: 'HSE, Sécurité, Permis, Travail',
  },
  AUDIT_ACTIONS: {
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
    AJOUT_FICHIER_PERMIS: 'AJOUT_FICHIER_PERMIS',
  },
} as const;

// File Types for HSE
export const HSE_FILE_TYPES = {
  SIGNATURE: {
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_SIZE: 2 * 1024 * 1024, // 2MB
    DIMENSIONS: { width: 300, height: 150 },
  },
  JUSTIFICATIFS: {
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
  },
  DOCUMENTS: {
    ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MAX_SIZE: 20 * 1024 * 1024, // 20MB
  },
} as const;