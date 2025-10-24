/**
 * Formater une date selon différents formats
 * @param {string|Date} date - Date à formater
 * @param {string} format - Format souhaité ('full', 'date', 'time', 'relative')
 * @returns {string} Date formatée
 */
export const formatDate = (date, format = 'full') => {
  if (!date) return '-';
  
  const d = new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(d.getTime())) return '-';
  
  switch (format) {
    case 'full':
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    
    case 'date':
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    
    case 'time':
      return d.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    
    case 'relative':
      return getRelativeTime(d);
    
    case 'datetime-local':
      // Format pour input datetime-local (YYYY-MM-DDTHH:MM)
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    
    default:
      return d.toLocaleDateString('fr-FR');
  }
};

/**
 * Obtenir le temps relatif (il y a X minutes/heures/jours)
 * @param {Date} date - Date à comparer
 * @returns {string} Temps relatif
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `il y a ${years} an${years > 1 ? 's' : ''}`;
  if (months > 0) return `il y a ${months} mois`;
  if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'à l\'instant';
};

/**
 * Formater une taille de fichier
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Tronquer un texte
 * @param {string} str - Texte à tronquer
 * @param {number} length - Longueur maximale
 * @returns {string} Texte tronqué
 */
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

/**
 * Obtenir le label d'un statut de permis
 * @param {string} status - Statut du permis
 * @returns {string} Label du statut
 */
export const getStatusLabel = (status) => {
  const labels = {
    BROUILLON: 'Brouillon',
    EN_ATTENTE: 'En attente',
    VALIDE: 'Validé',
    EN_COURS: 'En cours',
    SUSPENDU: 'Suspendu',
    CLOTURE: 'Clôturé'
  };
  return labels[status] || status;
};

/**
 * Obtenir la couleur d'un statut de permis
 * @param {string} status - Statut du permis
 * @returns {string} Classe Tailwind pour la couleur
 */
export const getStatusColor = (status) => {
  const colors = {
    BROUILLON: 'gray',
    EN_ATTENTE: 'yellow',
    VALIDE: 'blue',
    EN_COURS: 'green',
    SUSPENDU: 'red',
    CLOTURE: 'gray'
  };
  return colors[status] || 'gray';
};

/**
 * Obtenir le label d'un rôle utilisateur
 * @param {string} role - Rôle de l'utilisateur
 * @returns {string} Label du rôle
 */
export const getRoleLabel = (role) => {
  const labels = {
    DEMANDEUR: 'Demandeur',
    SUPERVISEUR: 'Superviseur',
    RESP_ZONE: 'Responsable de Zone',
    HSE: 'HSE',
    ADMIN: 'Administrateur'
  };
  return labels[role] || role;
};

/**
 * Obtenir la couleur d'un rôle utilisateur
 * @param {string} role - Rôle de l'utilisateur
 * @returns {string} Classes Tailwind pour la couleur
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    DEMANDEUR: 'bg-gray-100 text-gray-800',
    SUPERVISEUR: 'bg-blue-100 text-blue-800',
    RESP_ZONE: 'bg-purple-100 text-purple-800',
    HSE: 'bg-green-100 text-green-800',
    ADMIN: 'bg-red-100 text-red-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

/**
 * Formater un nombre avec séparateur de milliers
 * @param {number} num - Nombre à formater
 * @returns {string} Nombre formaté
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Formater un pourcentage
 * @param {number} value - Valeur
 * @param {number} total - Total
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Pourcentage formaté
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (!total || total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Capitaliser la première lettre d'une chaîne
 * @param {string} str - Chaîne à capitaliser
 * @returns {string} Chaîne capitalisée
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Obtenir les initiales d'un nom complet
 * @param {string} prenom - Prénom
 * @param {string} nom - Nom
 * @returns {string} Initiales
 */
export const getInitials = (prenom, nom) => {
  if (!prenom && !nom) return '?';
  const prenomInitial = prenom ? prenom.charAt(0).toUpperCase() : '';
  const nomInitial = nom ? nom.charAt(0).toUpperCase() : '';
  return prenomInitial + nomInitial;
};

/**
 * Formater un numéro de téléphone
 * @param {string} phone - Numéro de téléphone
 * @returns {string} Numéro formaté
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  // Formater selon le format français (06 12 34 56 78)
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  }
  return phone;
};