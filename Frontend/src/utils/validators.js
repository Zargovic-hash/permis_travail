/**
 * Valider une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} True si valide
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Valider un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {object} {isValid: boolean, errors: string[]}
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Le mot de passe est requis');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valider un formulaire de permis
 * @param {object} data - Données du formulaire
 * @returns {object} {isValid: boolean, errors: object}
 */
export const validatePermisForm = (data) => {
  const errors = {};
  
  if (!data.type_permis_id) {
    errors.type_permis_id = 'Le type de permis est requis';
  }
  
  if (!data.zone_id) {
    errors.zone_id = 'La zone est requise';
  }
  
  if (!data.titre || data.titre.trim().length < 5) {
    errors.titre = 'Le titre doit contenir au moins 5 caractères';
  }
  
  if (!data.date_debut) {
    errors.date_debut = 'La date de début est requise';
  }
  
  if (!data.date_fin) {
    errors.date_fin = 'La date de fin est requise';
  }
  
  if (data.date_debut && data.date_fin) {
    const debut = new Date(data.date_debut);
    const fin = new Date(data.date_fin);
    
    if (fin <= debut) {
      errors.date_fin = 'La date de fin doit être après la date de début';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valider un fichier uploadé
 * @param {File} file - Fichier à valider
 * @param {object} options - Options de validation
 * @returns {object} {isValid: boolean, errors: string[]}
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10 MB par défaut
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('Aucun fichier sélectionné');
    return { isValid: false, errors };
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Type de fichier non autorisé: ${file.type}. Types acceptés: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    errors.push(`Fichier trop volumineux: ${fileSizeMB} MB (max: ${maxSizeMB} MB)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valider un numéro de téléphone
 * @param {string} phone - Numéro de téléphone
 * @returns {boolean} True si valide
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  // Format français: 06 12 34 56 78 ou +33 6 12 34 56 78
  const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return re.test(phone);
};

/**
 * Valider une zone
 * @param {object} data - Données de la zone
 * @returns {object} {isValid: boolean, errors: object}
 */
export const validateZoneForm = (data) => {
  const errors = {};
  
  if (!data.nom || data.nom.trim().length < 3) {
    errors.nom = 'Le nom doit contenir au moins 3 caractères';
  }
  
  if (!data.responsable_id) {
    errors.responsable_id = 'Le responsable est requis';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valider un type de permis
 * @param {object} data - Données du type
 * @returns {object} {isValid: boolean, errors: object}
 */
export const validateTypePermisForm = (data) => {
  const errors = {};
  
  if (!data.nom || data.nom.trim().length < 3) {
    errors.nom = 'Le nom doit contenir au moins 3 caractères';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valider un utilisateur
 * @param {object} data - Données de l'utilisateur
 * @returns {object} {isValid: boolean, errors: object}
 */
export const validateUtilisateurForm = (data) => {
  const errors = {};
  
  if (!data.nom || data.nom.trim().length < 2) {
    errors.nom = 'Le nom doit contenir au moins 2 caractères';
  }
  
  if (!data.prenom || data.prenom.trim().length < 2) {
    errors.prenom = 'Le prénom doit contenir au moins 2 caractères';
  }
  
  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Email invalide';
  }
  
  if (data.telephone && !validatePhone(data.telephone)) {
    errors.telephone = 'Numéro de téléphone invalide';
  }
  
  if (!data.role) {
    errors.role = 'Le rôle est requis';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};