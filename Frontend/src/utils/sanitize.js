/**
 * Fonctions de sanitization pour la sécurité
 */

/**
 * Échapper les caractères HTML
 * @param {string} str - Chaîne à échapper
 * @returns {string} Chaîne échappée
 */
export const escapeHtml = (str) => {
  if (!str) return '';
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Nettoyer une chaîne de caractères
 * @param {string} str - Chaîne à nettoyer
 * @returns {string} Chaîne nettoyée
 */
export const sanitizeString = (str) => {
  if (!str) return '';
  
  // Supprimer les balises HTML
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Nettoyer un input utilisateur
 * @param {string} input - Input à nettoyer
 * @returns {string} Input nettoyé
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Supprimer les caractères dangereux
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Valider et nettoyer une URL
 * @param {string} url - URL à valider
 * @returns {string|null} URL nettoyée ou null si invalide
 */
export const sanitizeUrl = (url) => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    
    // N'autoriser que http et https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    
    return urlObj.href;
  } catch (e) {
    return null;
  }
};

/**
 * Nettoyer un objet JSON
 * @param {object} obj - Objet à nettoyer
 * @returns {object} Objet nettoyé
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const cleaned = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      cleaned[key] = sanitizeInput(value);
    } else if (typeof value === 'object') {
      cleaned[key] = sanitizeObject(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};