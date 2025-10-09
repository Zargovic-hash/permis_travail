// ============================================
// VALIDATORS - HSE PERMIT SYSTEM
// ============================================

import { REGEX_PATTERNS, VALIDATION_MESSAGES, FILE_UPLOAD } from './constants';
import { parseISO, isBefore, isAfter } from 'date-fns';

// ========== STRING VALIDATORS ==========

/**
 * Valide si une chaîne n'est pas vide
 */
export const isRequired = (value: string | null | undefined): boolean => {
  return !!value && value.trim().length > 0;
};

/**
 * Valide un email
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return REGEX_PATTERNS.EMAIL.test(email);
};

/**
 * Valide un mot de passe (8+ chars, 1 maj, 1 min, 1 chiffre)
 */
export const isValidPassword = (password: string): boolean => {
  if (!password) return false;
  return REGEX_PATTERNS.PASSWORD.test(password);
};

/**
 * Vérifie si deux mots de passe correspondent
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};

/**
 * Valide un numéro de téléphone français
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Optionnel
  return REGEX_PATTERNS.PHONE.test(phone);
};

/**
 * Valide la longueur minimale
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value && value.length >= minLength;
};

/**
 * Valide la longueur maximale
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return !value || value.length <= maxLength;
};

// ========== DATE VALIDATORS ==========

/**
 * Valide si une date est valide
 */
export const isValidDate = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
};

/**
 * Valide si date1 est avant date2
 */
export const isDateBefore = (date1: string | Date, date2: string | Date): boolean => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isBefore(d1, d2);
  } catch {
    return false;
  }
};

/**
 * Valide si date1 est après date2
 */
export const isDateAfter = (date1: string | Date, date2: string | Date): boolean => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isAfter(d1, d2);
  } catch {
    return false;
  }
};

/**
 * Valide une plage de dates (date_fin > date_debut)
 */
export const isValidDateRange = (dateDebut: string | Date, dateFin: string | Date): boolean => {
  if (!isValidDate(dateDebut) || !isValidDate(dateFin)) return false;
  return isDateAfter(dateFin, dateDebut);
};

// ========== FILE VALIDATORS ==========

/**
 * Valide la taille d'un fichier
 */
export const isValidFileSize = (file: File, maxSize: number = FILE_UPLOAD.MAX_SIZE): boolean => {
  return file.size <= maxSize;
};

/**
 * Valide le type MIME d'un fichier
 */
export const isValidFileType = (file: File, acceptedTypes: string[] = FILE_UPLOAD.ACCEPTED_TYPES.all): boolean => {
  return acceptedTypes.includes(file.type);
};

/**
 * Valide l'extension d'un fichier
 */
export const isValidFileExtension = (fileName: string, acceptedExtensions: string[] = FILE_UPLOAD.ACCEPTED_EXTENSIONS): boolean => {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return acceptedExtensions.includes(extension);
};

/**
 * Validation complète d'un fichier
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!isValidFileSize(file)) {
    return { valid: false, error: VALIDATION_MESSAGES.FILE_SIZE };
  }
  
  if (!isValidFileType(file)) {
    return { valid: false, error: VALIDATION_MESSAGES.FILE_TYPE };
  }
  
  return { valid: true };
};

// ========== FORM VALIDATORS ==========

/**
 * Valide les données de connexion
 */
export const validateLoginForm = (email: string, password: string): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!isRequired(email)) {
    errors.email = VALIDATION_MESSAGES.REQUIRED;
  } else if (!isValidEmail(email)) {
    errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
  }
  
  if (!isRequired(password)) {
    errors.password = VALIDATION_MESSAGES.REQUIRED;
  }
  
  return errors;
};

/**
 * Valide les données d'inscription
 */
export const validateRegisterForm = (data: {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!isRequired(data.nom)) {
    errors.nom = VALIDATION_MESSAGES.REQUIRED;
  }
  
  if (!isRequired(data.prenom)) {
    errors.prenom = VALIDATION_MESSAGES.REQUIRED;
  }
  
  if (!isRequired(data.email)) {
    errors.email = VALIDATION_MESSAGES.REQUIRED;
  } else if (!isValidEmail(data.email)) {
    errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
  }
  
  if (!isRequired(data.password)) {
    errors.password = VALIDATION_MESSAGES.REQUIRED;
  } else if (!isValidPassword(data.password)) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_PATTERN;
  }
  
  if (!isRequired(data.confirmPassword)) {
    errors.confirmPassword = VALIDATION_MESSAGES.REQUIRED;
  } else if (!passwordsMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = VALIDATION_MESSAGES.PASSWORD_MISMATCH;
  }
  
  return errors;
};

/**
 * Valide les données de création de permis
 */
export const validatePermisForm = (data: {
  type_permis_id: string;
  zone_id: string;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!isRequired(data.type_permis_id)) {
    errors.type_permis_id = VALIDATION_MESSAGES.REQUIRED;
  }
  
  if (!isRequired(data.zone_id)) {
    errors.zone_id = VALIDATION_MESSAGES.REQUIRED;
  }
  
  if (!isRequired(data.titre)) {
    errors.titre = VALIDATION_MESSAGES.REQUIRED;
  } else if (!hasMinLength(data.titre, 5)) {
    errors.titre = 'Le titre doit contenir au moins 5 caractères';
  }
  
  if (!isRequired(data.description)) {
    errors.description = VALIDATION_MESSAGES.REQUIRED;
  }
  
  if (!isRequired(data.date_debut)) {
    errors.date_debut = VALIDATION_MESSAGES.REQUIRED;
  } else if (!isValidDate(data.date_debut)) {
    errors.date_debut = VALIDATION_MESSAGES.DATE_INVALID;
  }
  
  if (!isRequired(data.date_fin)) {
    errors.date_fin = VALIDATION_MESSAGES.REQUIRED;
  } else if (!isValidDate(data.date_fin)) {
    errors.date_fin = VALIDATION_MESSAGES.DATE_INVALID;
  } else if (data.date_debut && !isValidDateRange(data.date_debut, data.date_fin)) {
    errors.date_fin = VALIDATION_MESSAGES.DATE_RANGE;
  }
  
  return errors;
};

// ========== PERMISSION VALIDATORS ==========

/**
 * Vérifie si un utilisateur a un rôle spécifique
 */
export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole);
};

/**
 * Vérifie si un utilisateur peut modifier un permis
 */
export const canEditPermis = (userRole: string, permisStatut: string, isOwner: boolean): boolean => {
  // HSE et ADMIN peuvent toujours modifier
  if (['HSE', 'ADMIN'].includes(userRole)) return true;
  
  // Le propriétaire peut modifier seulement en BROUILLON ou EN_ATTENTE
  if (isOwner && ['BROUILLON', 'EN_ATTENTE'].includes(permisStatut)) return true;
  
  return false;
};

/**
 * Vérifie si un utilisateur peut valider un permis
 */
export const canValidatePermis = (userRole: string, permisStatut: string): boolean => {
  if (permisStatut === 'EN_ATTENTE' && ['SUPERVISEUR', 'HSE', 'ADMIN'].includes(userRole)) {
    return true;
  }
  
  if (permisStatut === 'VALIDE' && ['RESP_ZONE', 'HSE', 'ADMIN'].includes(userRole)) {
    return true;
  }
  
  return false;
};

/**
 * Vérifie si un utilisateur peut suspendre un permis
 */
export const canSuspendPermis = (userRole: string): boolean => {
  return ['RESP_ZONE', 'HSE', 'ADMIN'].includes(userRole);
};

/**
 * Vérifie si un utilisateur peut clôturer un permis
 */
export const canClosePermis = (userRole: string, isOwner: boolean): boolean => {
  // HSE, SUPERVISEUR et le propriétaire peuvent clôturer
  return ['HSE', 'SUPERVISEUR', 'ADMIN'].includes(userRole) || isOwner;
};

// ========== UTILITY VALIDATORS ==========

/**
 * Valide un UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Valide un numéro de permis
 */
export const isValidNumeroPermis = (numero: string): boolean => {
  return REGEX_PATTERNS.NUMERO_PERMIS.test(numero);
};

/**
 * Vérifie si un objet est vide
 */
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Nettoie et valide un objet de formulaire
 */
export const cleanFormData = <T extends Record<string, any>>(data: T): T => {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = typeof value === 'string' ? value.trim() : value;
    }
  }
  
  return cleaned as T;
};

// ========== DEFAULT EXPORT ==========
export default {
  isRequired,
  isValidEmail,
  isValidPassword,
  passwordsMatch,
  isValidPhone,
  hasMinLength,
  hasMaxLength,
  isValidDate,
  isDateBefore,
  isDateAfter,
  isValidDateRange,
  isValidFileSize,
  isValidFileType,
  isValidFileExtension,
  validateFile,
  validateLoginForm,
  validateRegisterForm,
  validatePermisForm,
  hasRole,
  canEditPermis,
  canValidatePermis,
  canSuspendPermis,
  canClosePermis,
  isValidUUID,
  isValidNumeroPermis,
  isEmptyObject,
  cleanFormData
};