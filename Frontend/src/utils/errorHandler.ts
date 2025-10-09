// ============================================
// ERROR HANDLER - HSE PERMIT SYSTEM
// ============================================

import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

// ========== ERROR TYPES ==========

export interface ApiError {
  status?: number;
  message: string;
  code?: string;
  details?: any;
}

// ========== ERROR MESSAGES ==========

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Requête invalide. Veuillez vérifier vos données.',
  401: 'Non authentifié. Veuillez vous reconnecter.',
  403: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
  404: 'Ressource non trouvée.',
  409: 'Conflit. Cette ressource existe déjà ou est en cours d\'utilisation.',
  422: 'Données invalides. Veuillez vérifier vos informations.',
  429: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
  500: 'Erreur serveur. Veuillez réessayer plus tard.',
  502: 'Service temporairement indisponible.',
  503: 'Service en maintenance. Veuillez réessayer plus tard.'
};

const DEFAULT_ERROR_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.';

// ========== PARSE ERROR ==========

/**
 * Parse une erreur Axios en objet ApiError
 */
export const parseError = (error: unknown): ApiError => {
  // Erreur Axios
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<any>;
    
    return {
      status: axiosError.response?.status,
      message: axiosError.response?.data?.message || 
               axiosError.response?.data?.error ||
               ERROR_MESSAGES[axiosError.response?.status || 500] ||
               DEFAULT_ERROR_MESSAGE,
      code: axiosError.code,
      details: axiosError.response?.data
    };
  }
  
  // Erreur standard
  if (error instanceof Error) {
    return {
      message: error.message || DEFAULT_ERROR_MESSAGE
    };
  }
  
  // Erreur inconnue
  return {
    message: DEFAULT_ERROR_MESSAGE
  };
};

// ========== GET ERROR MESSAGE ==========

/**
 * Extrait un message d'erreur lisible
 */
export const getErrorMessage = (error: unknown): string => {
  const apiError = parseError(error);
  return apiError.message;
};

/**
 * Obtient un message d'erreur spécifique au contexte
 */
export const getContextualErrorMessage = (error: unknown, context: string): string => {
  const apiError = parseError(error);
  
  // Messages spécifiques selon le contexte
  const contextMessages: Record<string, Record<number, string>> = {
    login: {
      401: 'Email ou mot de passe incorrect.',
      429: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.'
    },
    register: {
      409: 'Un compte avec cet email existe déjà.',
      422: 'Les informations fournies sont invalides.'
    },
    permis: {
      403: 'Vous n\'avez pas les permissions pour effectuer cette action sur ce permis.',
      404: 'Permis non trouvé.',
      409: 'Ce permis ne peut pas être modifié dans son état actuel.'
    },
    upload: {
      413: 'Le fichier est trop volumineux (maximum 10 MB).',
      415: 'Type de fichier non supporté.',
      422: 'Le fichier ne respecte pas les critères requis.'
    }
  };
  
  const statusCode = apiError.status || 500;
  return contextMessages[context]?.[statusCode] || apiError.message;
};

// ========== HANDLE ERROR ==========

/**
 * Gère une erreur en affichant un toast
 */
export const handleError = (error: unknown, context?: string): void => {
  const message = context 
    ? getContextualErrorMessage(error, context)
    : getErrorMessage(error);
  
  toast.error(message);
  
  // Log en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', parseError(error));
  }
};

/**
 * Gère une erreur avec callback personnalisé
 */
export const handleErrorWithCallback = (
  error: unknown,
  callback: (error: ApiError) => void
): void => {
  const apiError = parseError(error);
  callback(apiError);
};

// ========== NETWORK ERRORS ==========

/**
 * Vérifie si c'est une erreur réseau
 */
export const isNetworkError = (error: unknown): boolean => {
  const apiError = parseError(error);
  return apiError.code === 'ERR_NETWORK' || !navigator.onLine;
};

/**
 * Gère les erreurs réseau
 */
export const handleNetworkError = (): void => {
  toast.error('Pas de connexion internet. Veuillez vérifier votre connexion.');
};

// ========== TIMEOUT ERRORS ==========

/**
 * Vérifie si c'est une erreur de timeout
 */
export const isTimeoutError = (error: unknown): boolean => {
  const apiError = parseError(error);
  return apiError.code === 'ECONNABORTED';
};

/**
 * Gère les erreurs de timeout
 */
export const handleTimeoutError = (): void => {
  toast.error('La requête a pris trop de temps. Veuillez réessayer.');
};

// ========== VALIDATION ERRORS ==========

/**
 * Parse les erreurs de validation du backend
 */
export const parseValidationErrors = (error: unknown): Record<string, string> => {
  const apiError = parseError(error);
  
  if (apiError.status === 422 && apiError.details?.errors) {
    const errors: Record<string, string> = {};
    
    // Si c'est un tableau d'erreurs
    if (Array.isArray(apiError.details.errors)) {
      apiError.details.errors.forEach((err: any) => {
        if (err.field && err.message) {
          errors[err.field] = err.message;
        }
      });
    }
    
    // Si c'est un objet d'erreurs
    if (typeof apiError.details.errors === 'object') {
      Object.entries(apiError.details.errors).forEach(([field, message]) => {
        errors[field] = String(message);
      });
    }
    
    return errors;
  }
  
  return {};
};

// ========== AUTH ERRORS ==========

/**
 * Vérifie si c'est une erreur d'authentification
 */
export const isAuthError = (error: unknown): boolean => {
  const apiError = parseError(error);
  return apiError.status === 401;
};

/**
 * Gère les erreurs d'authentification (déconnexion)
 */
export const handleAuthError = (): void => {
  localStorage.clear();
  toast.error('Session expirée. Veuillez vous reconnecter.');
  
  // Rediriger vers la page de login après un délai
  setTimeout(() => {
    window.location.href = '/login';
  }, 2000);
};

// ========== PERMISSION ERRORS ==========

/**
 * Vérifie si c'est une erreur de permission
 */
export const isPermissionError = (error: unknown): boolean => {
  const apiError = parseError(error);
  return apiError.status === 403;
};

/**
 * Gère les erreurs de permission
 */
export const handlePermissionError = (): void => {
  toast.error('Vous n\'avez pas les permissions nécessaires pour cette action.');
};

// ========== NOT FOUND ERRORS ==========

/**
 * Vérifie si c'est une erreur 404
 */
export const isNotFoundError = (error: unknown): boolean => {
  const apiError = parseError(error);
  return apiError.status === 404;
};

/**
 * Gère les erreurs 404
 */
export const handleNotFoundError = (resourceType: string = 'ressource'): void => {
  toast.error(`Cette ${resourceType} n'existe pas ou a été supprimée.`);
};

// ========== CONFLICT ERRORS ==========

/**
 * Vérifie si c'est une erreur de conflit
 */
export const isConflictError = (error: unknown): boolean => {
  const apiError = parseError(error);
  return apiError.status === 409;
};

/**
 * Gère les erreurs de conflit
 */
export const handleConflictError = (message?: string): void => {
  toast.error(message || 'Un conflit est survenu. Cette ressource existe déjà ou est verrouillée.');
};

// ========== ERROR RETRY ==========

/**
 * Vérifie si l'erreur est récupérable (peut être retry)
 */
export const isRetryableError = (error: unknown): boolean => {
  const apiError = parseError(error);
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(apiError.status || 0) || isNetworkError(error);
};

/**
 * Calcule le délai de retry avec backoff exponentiel
 */
export const calculateRetryDelay = (attemptNumber: number): number => {
  const baseDelay = 1000; // 1 seconde
  const maxDelay = 30000; // 30 secondes
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
  return delay;
};

// ========== GLOBAL ERROR HANDLER ==========

/**
 * Handler global pour toutes les erreurs
 */
export const globalErrorHandler = (error: unknown, context?: string): void => {
  // Erreur réseau
  if (isNetworkError(error)) {
    handleNetworkError();
    return;
  }
  
  // Erreur timeout
  if (isTimeoutError(error)) {
    handleTimeoutError();
    return;
  }
  
  // Erreur d'authentification
  if (isAuthError(error)) {
    handleAuthError();
    return;
  }
  
  // Erreur de permission
  if (isPermissionError(error)) {
    handlePermissionError();
    return;
  }
  
  // Erreur 404
  if (isNotFoundError(error)) {
    handleNotFoundError();
    return;
  }
  
  // Erreur générique
  handleError(error, context);
};

// ========== ERROR BOUNDARY HELPER ==========

/**
 * Formate une erreur pour l'Error Boundary
 */
export const formatErrorForBoundary = (error: Error, errorInfo: any): string => {
  return `
    Erreur: ${error.message}
    Stack: ${error.stack}
    Component Stack: ${errorInfo.componentStack}
  `;
};

// ========== DEFAULT EXPORT ==========
export default {
  parseError,
  getErrorMessage,
  getContextualErrorMessage,
  handleError,
  handleErrorWithCallback,
  isNetworkError,
  handleNetworkError,
  isTimeoutError,
  handleTimeoutError,
  parseValidationErrors,
  isAuthError,
  handleAuthError,
  isPermissionError,
  handlePermissionError,
  isNotFoundError,
  handleNotFoundError,
  isConflictError,
  handleConflictError,
  isRetryableError,
  calculateRetryDelay,
  globalErrorHandler,
  formatErrorForBoundary
};