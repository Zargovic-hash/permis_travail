// ============================================
// FORMATTERS - HSE PERMIT SYSTEM
// ============================================

import { format, formatDistance, formatRelative, parseISO, differenceInDays, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DATE_FORMATS } from './constants';

// ========== DATE FORMATTERS ==========

/**
 * Formate une date en format d'affichage (dd/MM/yyyy)
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.DISPLAY, { locale: fr });
  } catch (error) {
    return '-';
  }
};

/**
 * Formate une date avec heure (dd/MM/yyyy HH:mm)
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.DISPLAY_TIME, { locale: fr });
  } catch (error) {
    return '-';
  }
};

/**
 * Formate une date de manière relative (il y a 2 heures, hier, etc.)
 */
export const formatRelativeDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr });
  } catch (error) {
    return '-';
  }
};

/**
 * Formate une date de manière contextuelle (aujourd'hui à 15h, hier à 10h, etc.)
 */
export const formatContextualDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatRelative(dateObj, new Date(), { locale: fr });
  } catch (error) {
    return '-';
  }
};

/**
 * Calcule la durée entre deux dates en jours
 */
export const calculateDurationDays = (start: string | Date, end: string | Date): number => {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return differenceInDays(endDate, startDate);
};

/**
 * Calcule la durée entre deux dates en heures
 */
export const calculateDurationHours = (start: string | Date, end: string | Date): number => {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return differenceInHours(endDate, startDate);
};

/**
 * Formate une durée en texte lisible
 */
export const formatDuration = (hours: number): string => {
  if (hours < 1) return '< 1 heure';
  if (hours < 24) return `${Math.round(hours)} heure${hours > 1 ? 's' : ''}`;
  
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  
  if (remainingHours === 0) return `${days} jour${days > 1 ? 's' : ''}`;
  return `${days} jour${days > 1 ? 's' : ''} ${remainingHours}h`;
};

// ========== NUMBER FORMATTERS ==========

/**
 * Formate un nombre avec séparateurs de milliers
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formate une taille de fichier en format lisible
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// ========== STRING FORMATTERS ==========

/**
 * Tronque un texte avec ellipses
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalise la première lettre
 */
export const capitalize = (text: string | null | undefined): string => {
  if (!text) return '-';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formate un nom complet
 */
export const formatFullName = (prenom: string | null | undefined, nom: string | null | undefined): string => {
  if (!prenom && !nom) return '-';
  if (!prenom) return nom || '-';
  if (!nom) return prenom || '-';
  return `${prenom} ${nom}`;
};

/**
 * Formate des initiales à partir du nom et prénom
 */
export const formatInitials = (prenom: string | null | undefined, nom: string | null | undefined): string => {
  if (!prenom && !nom) return '??';
  const firstInitial = prenom ? prenom.charAt(0).toUpperCase() : '';
  const lastInitial = nom ? nom.charAt(0).toUpperCase() : '';
  return `${firstInitial}${lastInitial}` || '?';
};

/**
 * Formate un email en masquant une partie
 */
export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return '-';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length > 3 
    ? `${local.substring(0, 2)}${'*'.repeat(local.length - 2)}`
    : local;
  return `${maskedLocal}@${domain}`;
};

/**
 * Formate un numéro de téléphone
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
  }
  return phone;
};

// ========== ROLE & STATUS FORMATTERS ==========

/**
 * Obtient les initiales d'un rôle
 */
export const getRoleInitials = (role: string): string => {
  const roleMap: Record<string, string> = {
    'DEMANDEUR': 'DEM',
    'SUPERVISEUR': 'SUP',
    'RESP_ZONE': 'RZ',
    'HSE': 'HSE',
    'ADMIN': 'ADM'
  };
  return roleMap[role] || role.substring(0, 3).toUpperCase();
};

// ========== CURRENCY FORMATTERS ==========

/**
 * Formate un montant en devise
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = 'EUR'): string => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// ========== ARRAY FORMATTERS ==========

/**
 * Formate une liste en texte avec virgules et "et"
 */
export const formatList = (items: string[], conjunction: string = 'et'): string => {
  if (!items || items.length === 0) return '-';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(` ${conjunction} `);
  
  const allButLast = items.slice(0, -1);
  const last = items[items.length - 1];
  return `${allButLast.join(', ')} ${conjunction} ${last}`;
};

// ========== JSON FORMATTERS ==========

/**
 * Formate un objet JSON de manière lisible
 */
export const formatJSON = (obj: any): string => {
  if (!obj) return '-';
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
};

/**
 * Extrait les valeurs clés d'un objet conditions/mesures
 */
export const formatConditions = (conditions: Record<string, any> | null | undefined): string => {
  if (!conditions || Object.keys(conditions).length === 0) return 'Aucune';
  
  const keys = Object.keys(conditions);
  if (keys.length <= 3) {
    return keys.join(', ');
  }
  
  return `${keys.slice(0, 3).join(', ')} et ${keys.length - 3} autre(s)`;
};

// ========== COLOR FORMATTERS ==========

/**
 * Obtient une couleur basée sur un pourcentage (gradient rouge -> vert)
 */
export const getColorFromPercentage = (percentage: number): string => {
  if (percentage < 30) return 'text-red-600';
  if (percentage < 70) return 'text-yellow-600';
  return 'text-green-600';
};

/**
 * Obtient une couleur de fond basée sur un indice
 */
export const getBackgroundColor = (index: number): string => {
  const colors = [
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-red-100',
    'bg-purple-100',
    'bg-pink-100',
    'bg-indigo-100',
    'bg-teal-100'
  ];
  return colors[index % colors.length];
};

// ========== EXPORT FORMATTERS ==========

/**
 * Formate une date pour les noms de fichiers
 */
export const formatFileDate = (date: Date = new Date()): string => {
  return format(date, 'yyyyMMdd_HHmmss');
};

/**
 * Génère un nom de fichier d'export
 */
export const generateExportFileName = (prefix: string, extension: string = 'csv'): string => {
  const timestamp = formatFileDate();
  return `${prefix}_${timestamp}.${extension}`;
};

// ========== DEFAULT EXPORT ==========
export default {
  formatDate,
  formatDateTime,
  formatRelativeDate,
  formatContextualDate,
  calculateDurationDays,
  calculateDurationHours,
  formatDuration,
  formatNumber,
  formatPercentage,
  formatFileSize,
  truncateText,
  capitalize,
  formatFullName,
  formatInitials,
  maskEmail,
  formatPhone,
  getRoleInitials,
  formatCurrency,
  formatList,
  formatJSON,
  formatConditions,
  getColorFromPercentage,
  getBackgroundColor,
  formatFileDate,
  generateExportFileName
};