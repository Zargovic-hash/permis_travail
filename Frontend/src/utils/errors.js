/**
 * Gestion des erreurs
 */

/**
 * Extraire le message d'erreur d'une réponse API
 * @param {Error} error - Erreur
 * @returns {string} Message d'erreur
 */
export const getErrorMessage = (error) => {
  // Erreur réseau
  if (!error.response) {
    return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
  }
  
  const { status, data } = error.response;
  
  // Erreurs par code HTTP
  switch (status) {
    case 400:
      return data?.message || 'Requête invalide';
    case 401:
      return 'Vous devez être connecté pour effectuer cette action';
    case 403:
      return data?.message || 'Vous n\'avez pas les permissions nécessaires';
    case 404:
      return data?.message || 'Ressource non trouvée';
    case 409:
      return data?.message || 'Conflit de données';
    case 422:
      return data?.message || 'Données invalides';
    case 429:
      return 'Trop de requêtes. Veuillez réessayer plus tard.';
    case 500:
      return 'Erreur serveur. Veuillez réessayer.';
    case 503:
      return 'Service temporairement indisponible';
    default:
      return data?.message || 'Une erreur est survenue';
  }
};

/**
 * Logger une erreur
 * @param {Error} error - Erreur à logger
 * @param {string} context - Contexte de l'erreur
 */
export const logError = (error, context = '') => {
  if (import.meta.env.DEV) {
    console.error(`[${context}] Error:`, error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
  
  // En production, envoyer à un service de monitoring (Sentry, LogRocket, etc.)
  // sentry.captureException(error);
};

/**
 * Créer une erreur personnalisée
 * @param {string} message - Message d'erreur
 * @param {number} code - Code d'erreur
 * @returns {Error} Erreur
 */
export const createError = (message, code = 500) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

/**
 * Vérifier si c'est une erreur réseau
 * @param {Error} error - Erreur
 * @returns {boolean} True si erreur réseau
 */
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

/**
 * Vérifier si c'est une erreur d'authentification
 * @param {Error} error - Erreur
 * @returns {boolean} True si erreur auth
 */
export const isAuthError = (error) => {
  return error.response && [401, 403].includes(error.response.status);
};

/**
 * Vérifier si c'est une erreur de validation
 * @param {Error} error - Erreur
 * @returns {boolean} True si erreur validation
 */
export const isValidationError = (error) => {
  return error.response && [400, 422].includes(error.response.status);
};