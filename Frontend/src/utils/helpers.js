/**
 * Fonctions helpers diverses
 */

/**
 * Générer un ID unique
 * @returns {string} ID unique
 */
export const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Télécharger un fichier blob
 * @param {Blob} blob - Le blob à télécharger
 * @param {string} filename - Nom du fichier
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Copier du texte dans le presse-papier
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} True si succès
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    return false;
  }
};

/**
 * Grouper un tableau par clé
 * @param {Array} array - Tableau à grouper
 * @param {string} key - Clé de groupement
 * @returns {object} Objet groupé
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Trier un tableau par clé
 * @param {Array} array - Tableau à trier
 * @param {string} key - Clé de tri
 * @param {string} order - Ordre ('asc' ou 'desc')
 * @returns {Array} Tableau trié
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Supprimer les doublons d'un tableau
 * @param {Array} array - Tableau
 * @param {string} key - Clé unique (optionnel)
 * @returns {Array} Tableau sans doublons
 */
export const removeDuplicates = (array, key = null) => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const k = item[key];
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  return [...new Set(array)];
};

/**
 * Convertir un objet en query string
 * @param {object} obj - Objet à convertir
 * @returns {string} Query string
 */
export const objectToQueryString = (obj) => {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  return params.toString();
};

/**
 * Parser un query string en objet
 * @param {string} queryString - Query string
 * @returns {object} Objet parsé
 */
export const queryStringToObject = (queryString) => {
  const params = new URLSearchParams(queryString);
  const obj = {};

  for (const [key, value] of params) {
    obj[key] = value;
  }
  return obj;
};

/**
 * Vérifier si deux objets sont égaux (shallow comparison)
 * @param {object} obj1 - Premier objet
 * @param {object} obj2 - Deuxième objet
 * @returns {boolean} True si égaux
 */
export const shallowEqual = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => obj1[key] === obj2[key]);
};

/**
 * Créer un délai (pour tests ou animations)
 * @param {number} ms - Millisecondes
 * @returns {Promise} Promise qui se résout après le délai
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Extraire l'extension d'un fichier
 * @param {string} filename - Nom du fichier
 * @returns {string} Extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

/**
 * Vérifier si une valeur est vide
 * @param {*} value - Valeur à vérifier
 * @returns {boolean} True si vide
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Nettoyer un objet (supprimer les valeurs null/undefined)
 * @param {object} obj - Objet à nettoyer
 * @returns {object} Objet nettoyé
 */
export const cleanObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Calculer la durée entre deux dates
 * @param {Date|string} start - Date de début
 * @param {Date|string} end - Date de fin
 * @returns {object} {days, hours, minutes}
 */
export const calculateDuration = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate - startDate;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
};

/**
 * Formater une durée en texte lisible
 * @param {object} duration - {days, hours, minutes}
 * @returns {string} Durée formatée
 */
export const formatDuration = (duration) => {
  const parts = [];

  if (duration.days > 0) {
    parts.push(`${duration.days} jour${duration.days > 1 ? 's' : ''}`);
  }
  if (duration.hours > 0) {
    parts.push(`${duration.hours} heure${duration.hours > 1 ? 's' : ''}`);
  }
  if (duration.minutes > 0 && duration.days === 0) {
    parts.push(`${duration.minutes} minute${duration.minutes > 1 ? 's' : ''}`);
  }
  return parts.join(' ') || '0 minute';
};

/**
 * Générer une couleur aléatoire
 * @returns {string} Couleur hexadécimale
 */
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Convertir une image en base64
 * @param {File} file - Fichier image
 * @returns {Promise<string>} Image en base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Détecter si on est sur mobile
 * @returns {boolean} True si mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Détecter le type de navigateur
 * @returns {string} Nom du navigateur
 */
export const getBrowserName = () => {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
};

/**
 * Sauvegarder en localStorage avec expiration
 * @param {string} key - Clé
 * @param {*} value - Valeur
 * @param {number} ttl - Durée de vie en millisecondes
 */
export const setLocalStorageWithExpiry = (key, value, ttl) => {
  const now = new Date();

  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Récupérer depuis localStorage avec vérification expiration
 * @param {string} key - Clé
 * @returns {*} Valeur ou null si expiré
 */
export const getLocalStorageWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) return null;
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (e) {
    return null;
  }
};

/**
 * Générer un nom de fichier unique
 * @param {string} originalName - Nom original
 * @returns {string} Nom unique
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(new RegExp(`\\.${extension}$`), '');
  const sanitized = nameWithoutExt.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return `${sanitized}_${timestamp}.${extension}`;
};

/**
 * Obtenir le MIME type depuis l'extension
 * @param {string} extension - Extension du fichier
 * @returns {string} MIME type
 */
export const getMimeType = (extension) => {
  const mimeTypes = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain'
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};