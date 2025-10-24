/**
 * Gestion du stockage local (wrapper autour de localStorage)
 */

const STORAGE_PREFIX = 'hse_';

/**
 * Sauvegarder une valeur
 * @param {string} key - Clé
 * @param {*} value - Valeur
 */
export const setItem = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Récupérer une valeur
 * @param {string} key - Clé
 * @param {*} defaultValue - Valeur par défaut
 * @returns {*} Valeur
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Supprimer une valeur
 * @param {string} key - Clé
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Vider tout le stockage
 */
export const clear = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Vérifier si une clé existe
 * @param {string} key - Clé
 * @returns {boolean} True si existe
 */
export const hasItem = (key) => {
  return localStorage.getItem(STORAGE_PREFIX + key) !== null;
};

/**
 * Obtenir toutes les clés
 * @returns {string[]} Liste des clés
 */
export const getAllKeys = () => {
  const keys = Object.keys(localStorage);
  return keys
    .filter(key => key.startsWith(STORAGE_PREFIX))
    .map(key => key.replace(STORAGE_PREFIX, ''));
};