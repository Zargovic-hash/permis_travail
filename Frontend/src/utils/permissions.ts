// ============================================
// PERMISSIONS - HSE PERMIT SYSTEM
// ============================================

import { Role, StatutPermis, Utilisateur } from '../types';
import { PERMISSIONS } from './constants';

// ========== PERMISSION CHECKER ==========

/**
 * Vérifie si l'utilisateur a la permission spécifiée
 */
export const hasPermission = (user: Utilisateur | null, permission: string): boolean => {
  if (!user) return false;
  
  const allowedRoles = PERMISSIONS[permission as keyof typeof PERMISSIONS];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(user.role);
};

// ========== ROLE CHECKS ==========

export const isAdmin = (user: Utilisateur | null): boolean => {
  return user?.role === Role.ADMIN;
};

export const isHSE = (user: Utilisateur | null): boolean => {
  return user?.role === Role.HSE || isAdmin(user);
};

export const isRespZone = (user: Utilisateur | null): boolean => {
  return user?.role === Role.RESP_ZONE || isHSE(user);
};

export const isSuperviseur = (user: Utilisateur | null): boolean => {
  return user?.role === Role.SUPERVISEUR || isRespZone(user);
};

export const isDemandeur = (user: Utilisateur | null): boolean => {
  return user?.role === Role.DEMANDEUR;
};

// ========== PERMIS PERMISSIONS ==========

/**
 * Vérifie si l'utilisateur peut créer des permis
 */
export const canCreatePermis = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'CREATE_PERMIS');
};

/**
 * Vérifie si l'utilisateur peut voir tous les permis
 */
export const canViewAllPermis = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'VIEW_ALL_PERMIS');
};

/**
 * Vérifie si l'utilisateur peut modifier un permis spécifique
 */
export const canEditPermis = (
  user: Utilisateur | null,
  permis: { demandeur_id: string; statut: StatutPermis }
): boolean => {
  if (!user) return false;
  
  // HSE et ADMIN peuvent toujours modifier
  if (isHSE(user)) return true;
  
  // Le propriétaire peut modifier uniquement en BROUILLON ou EN_ATTENTE
  const isOwner = user.id === permis.demandeur_id;
  const editableStatuses = [StatutPermis.BROUILLON, StatutPermis.EN_ATTENTE];
  
  return isOwner && editableStatuses.includes(permis.statut);
};

/**
 * Vérifie si l'utilisateur peut valider un permis
 */
export const canValidatePermis = (
  user: Utilisateur | null,
  permis: { statut: StatutPermis }
): boolean => {
  if (!user) return false;
  
  // EN_ATTENTE -> VALIDE : SUPERVISEUR, HSE, ADMIN
  if (permis.statut === StatutPermis.EN_ATTENTE) {
    return [Role.SUPERVISEUR, Role.HSE, Role.ADMIN].includes(user.role);
  }
  
  // VALIDE -> EN_COURS : RESP_ZONE, HSE, ADMIN
  if (permis.statut === StatutPermis.VALIDE) {
    return [Role.RESP_ZONE, Role.HSE, Role.ADMIN].includes(user.role);
  }
  
  return false;
};

/**
 * Vérifie si l'utilisateur peut suspendre un permis
 */
export const canSuspendPermis = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'SUSPEND_PERMIS');
};

/**
 * Vérifie si l'utilisateur peut clôturer un permis
 */
export const canClosePermis = (
  user: Utilisateur | null,
  permis: { demandeur_id: string; statut: StatutPermis }
): boolean => {
  if (!user) return false;
  
  // Ne peut pas clôturer un permis déjà clôturé
  if (permis.statut === StatutPermis.CLOTURE) return false;
  
  // HSE, SUPERVISEUR et ADMIN peuvent toujours clôturer
  if ([Role.HSE, Role.SUPERVISEUR, Role.ADMIN].includes(user.role)) {
    return true;
  }
  
  // Le demandeur peut clôturer son propre permis
  return user.id === permis.demandeur_id;
};

/**
 * Vérifie si l'utilisateur peut supprimer un permis
 */
export const canDeletePermis = (user: Utilisateur | null): boolean => {
  return isHSE(user);
};

/**
 * Vérifie si l'utilisateur peut exporter un permis en PDF
 */
export const canExportPermis = (user: Utilisateur | null): boolean => {
  return !!user; // Tous les utilisateurs authentifiés
};

/**
 * Vérifie si l'utilisateur peut ajouter des fichiers à un permis
 */
export const canAddFiles = (
  user: Utilisateur | null,
  permis: { demandeur_id: string; statut: StatutPermis }
): boolean => {
  if (!user) return false;
  
  // HSE peut toujours ajouter des fichiers
  if (isHSE(user)) return true;
  
  // Le propriétaire peut ajouter des fichiers si le permis n'est pas clôturé
  const isOwner = user.id === permis.demandeur_id;
  return isOwner && permis.statut !== StatutPermis.CLOTURE;
};

// ========== ZONE PERMISSIONS ==========

/**
 * Vérifie si l'utilisateur peut gérer les zones
 */
export const canManageZones = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'MANAGE_ZONES');
};

/**
 * Vérifie si l'utilisateur peut voir les zones
 */
export const canViewZones = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'VIEW_ZONES');
};

// ========== TYPE PERMISSIONS ==========

/**
 * Vérifie si l'utilisateur peut gérer les types de permis
 */
export const canManageTypes = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'MANAGE_TYPES');
};

/**
 * Vérifie si l'utilisateur peut voir les types
 */
export const canViewTypes = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'VIEW_TYPES');
};

// ========== USER PERMISSIONS ==========

/**
 * Vérifie si l'utilisateur peut gérer les utilisateurs
 */
export const canManageUsers = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'MANAGE_USERS');
};

/**
 * Vérifie si l'utilisateur peut voir la liste des utilisateurs
 */
export const canViewUsers = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'VIEW_USERS');
};

/**
 * Vérifie si l'utilisateur peut modifier un autre utilisateur
 */
export const canEditUser = (
  currentUser: Utilisateur | null,
  targetUser: Utilisateur
): boolean => {
  if (!currentUser) return false;
  
  // Admin peut tout faire
  if (isAdmin(currentUser)) return true;
  
  // HSE peut modifier les utilisateurs non-admin
  if (isHSE(currentUser) && targetUser.role !== Role.ADMIN) {
    return true;
  }
  
  // Un utilisateur peut modifier son propre profil
  return currentUser.id === targetUser.id;
};

/**
 * Vérifie si l'utilisateur peut supprimer un autre utilisateur
 */
export const canDeleteUser = (
  currentUser: Utilisateur | null,
  targetUser: Utilisateur
): boolean => {
  if (!currentUser) return false;
  
  // Ne peut pas se supprimer soi-même
  if (currentUser.id === targetUser.id) return false;
  
  // Admin peut supprimer tout le monde sauf autres admins
  if (isAdmin(currentUser)) {
    return targetUser.role !== Role.ADMIN;
  }
  
  // HSE peut supprimer les utilisateurs non-admin et non-HSE
  if (isHSE(currentUser)) {
    return ![Role.ADMIN, Role.HSE].includes(targetUser.role);
  }
  
  return false;
};

// ========== REPORT PERMISSIONS ==========

/**
 * Vérifie si l'utilisateur peut voir les rapports
 */
export const canViewReports = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'VIEW_REPORTS');
};

/**
 * Vérifie si l'utilisateur peut exporter les rapports
 */
export const canExportReports = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'EXPORT_REPORTS');
};

// ========== AUDIT PERMISSIONS ==========

/**
 * Vérifie si l'utilisateur peut voir les logs d'audit
 */
export const canViewAudit = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'VIEW_AUDIT');
};

// ========== ADMIN PERMISSIONS ==========

/**
 * Vérifie si l'utilisateur peut accéder au panel admin
 */
export const canAccessAdminPanel = (user: Utilisateur | null): boolean => {
  return hasPermission(user, 'ADMIN_PANEL');
};

// ========== WORKFLOW HELPERS ==========

/**
 * Obtient les actions disponibles pour un permis
 */
export const getAvailablePermisActions = (
  user: Utilisateur | null,
  permis: { demandeur_id: string; statut: StatutPermis }
): string[] => {
  if (!user) return [];
  
  const actions: string[] = [];
  
  // Voir les détails
  actions.push('view');
  
  // Modifier
  if (canEditPermis(user, permis)) {
    actions.push('edit');
  }
  
  // Valider
  if (canValidatePermis(user, permis)) {
    actions.push('validate');
  }
  
  // Suspendre
  if (canSuspendPermis(user) && ![StatutPermis.CLOTURE, StatutPermis.SUSPENDU].includes(permis.statut)) {
    actions.push('suspend');
  }
  
  // Clôturer
  if (canClosePermis(user, permis)) {
    actions.push('close');
  }
  
  // Exporter PDF
  if (canExportPermis(user)) {
    actions.push('export');
  }
  
  // Ajouter fichiers
  if (canAddFiles(user, permis)) {
    actions.push('addFiles');
  }
  
  return actions;
};

/**
 * Obtient le prochain statut possible pour un permis selon le rôle
 */
export const getNextPermisStatus = (
  user: Utilisateur | null,
  currentStatus: StatutPermis
): StatutPermis | null => {
  if (!user) return null;
  
  switch (currentStatus) {
    case StatutPermis.BROUILLON:
      // Le demandeur peut soumettre
      return StatutPermis.EN_ATTENTE;
      
    case StatutPermis.EN_ATTENTE:
      // SUPERVISEUR, HSE, ADMIN peuvent valider
      if ([Role.SUPERVISEUR, Role.HSE, Role.ADMIN].includes(user.role)) {
        return StatutPermis.VALIDE;
      }
      return null;
      
    case StatutPermis.VALIDE:
      // RESP_ZONE, HSE, ADMIN peuvent activer
      if ([Role.RESP_ZONE, Role.HSE, Role.ADMIN].includes(user.role)) {
        return StatutPermis.EN_COURS;
      }
      return null;
      
    case StatutPermis.EN_COURS:
      // Peut être clôturé
      return StatutPermis.CLOTURE;
      
    default:
      return null;
  }
};

/**
 * Vérifie si l'utilisateur peut changer le statut d'un permis
 */
export const canChangePermisStatus = (
  user: Utilisateur | null,
  fromStatus: StatutPermis,
  toStatus: StatutPermis
): boolean => {
  if (!user) return false;
  
  // HSE et ADMIN peuvent tout changer (sauf revenir d'un statut clôturé)
  if (isHSE(user) && fromStatus !== StatutPermis.CLOTURE) {
    return true;
  }
  
  // Vérifier les transitions autorisées
  const allowedTransitions: Record<StatutPermis, Partial<Record<StatutPermis, Role[]>>> = {
    [StatutPermis.BROUILLON]: {
      [StatutPermis.EN_ATTENTE]: [Role.DEMANDEUR, Role.SUPERVISEUR, Role.RESP_ZONE, Role.HSE, Role.ADMIN]
    },
    [StatutPermis.EN_ATTENTE]: {
      [StatutPermis.VALIDE]: [Role.SUPERVISEUR, Role.HSE, Role.ADMIN]
    },
    [StatutPermis.VALIDE]: {
      [StatutPermis.EN_COURS]: [Role.RESP_ZONE, Role.HSE, Role.ADMIN]
    },
    [StatutPermis.EN_COURS]: {
      [StatutPermis.CLOTURE]: [Role.DEMANDEUR, Role.SUPERVISEUR, Role.RESP_ZONE, Role.HSE, Role.ADMIN]
    },
    [StatutPermis.SUSPENDU]: {
      [StatutPermis.EN_COURS]: [Role.RESP_ZONE, Role.HSE, Role.ADMIN]
    },
    [StatutPermis.CLOTURE]: {}
  };
  
  const allowedRoles = allowedTransitions[fromStatus]?.[toStatus];
  return allowedRoles ? allowedRoles.includes(user.role) : false;
};

// ========== NOTIFICATION PERMISSIONS ==========

/**
 * Détermine si l'utilisateur doit recevoir une notification pour un permis
 */
export const shouldNotifyUser = (
  user: Utilisateur,
  permis: { demandeur_id: string; statut: StatutPermis; zone_id?: string },
  notificationType: string
): boolean => {
  switch (notificationType) {
    case 'PERMIS_EN_ATTENTE':
      // Notifier les validateurs
      return [Role.SUPERVISEUR, Role.HSE, Role.ADMIN].includes(user.role);
      
    case 'PERMIS_APPROUVE':
    case 'PERMIS_REFUSE':
      // Notifier le demandeur
      return user.id === permis.demandeur_id;
      
    case 'PERMIS_SUSPENDU':
      // Notifier le demandeur et les HSE
      return user.id === permis.demandeur_id || isHSE(user);
      
    case 'PERMIS_EXPIRE_BIENTOT':
    case 'PERMIS_EXPIRE':
      // Notifier le demandeur et les responsables
      return user.id === permis.demandeur_id || isHSE(user);
      
    default:
      return false;
  }
};

// ========== BATCH OPERATIONS ==========

/**
 * Vérifie si l'utilisateur peut effectuer des opérations par lot
 */
export const canBatchOperations = (user: Utilisateur | null): boolean => {
  return isHSE(user);
};

// ========== EXPORT PERMISSIONS ==========

/**
 * Vérifie si l'utilisateur peut exporter des données
 */
export const canExportData = (user: Utilisateur | null, dataType: string): boolean => {
  if (!user) return false;
  
  switch (dataType) {
    case 'permis':
      return true; // Tous les utilisateurs authentifiés
      
    case 'rapports':
      return canExportReports(user);
      
    case 'audit':
      return canViewAudit(user);
      
    case 'utilisateurs':
      return canViewUsers(user);
      
    default:
      return false;
  }
};

// ========== FIELD-LEVEL PERMISSIONS ==========

/**
 * Obtient les champs modifiables pour un utilisateur sur un permis
 */
export const getEditablePermisFields = (
  user: Utilisateur | null,
  permis: { demandeur_id: string; statut: StatutPermis }
): string[] => {
  if (!user) return [];
  
  const allFields = [
    'type_permis_id',
    'zone_id',
    'titre',
    'description',
    'date_debut',
    'date_fin',
    'conditions_prealables',
    'mesures_prevention',
    'resultat_tests_atmos'
  ];
  
  // HSE peut tout modifier sauf si clôturé
  if (isHSE(user) && permis.statut !== StatutPermis.CLOTURE) {
    return allFields;
  }
  
  // Le propriétaire peut modifier en BROUILLON ou EN_ATTENTE
  const isOwner = user.id === permis.demandeur_id;
  if (isOwner && [StatutPermis.BROUILLON, StatutPermis.EN_ATTENTE].includes(permis.statut)) {
    return allFields;
  }
  
  return [];
};

/**
 * Vérifie si un champ spécifique est modifiable
 */
export const isFieldEditable = (
  user: Utilisateur | null,
  permis: { demandeur_id: string; statut: StatutPermis },
  fieldName: string
): boolean => {
  const editableFields = getEditablePermisFields(user, permis);
  return editableFields.includes(fieldName);
};

// ========== DEFAULT EXPORT ==========
export default {
  hasPermission,
  isAdmin,
  isHSE,
  isRespZone,
  isSuperviseur,
  isDemandeur,
  canCreatePermis,
  canViewAllPermis,
  canEditPermis,
  canValidatePermis,
  canSuspendPermis,
  canClosePermis,
  canDeletePermis,
  canExportPermis,
  canAddFiles,
  canManageZones,
  canViewZones,
  canManageTypes,
  canViewTypes,
  canManageUsers,
  canViewUsers,
  canEditUser,
  canDeleteUser,
  canViewReports,
  canExportReports,
  canViewAudit,
  canAccessAdminPanel,
  getAvailablePermisActions,
  getNextPermisStatus,
  canChangePermisStatus,
  shouldNotifyUser,
  canBatchOperations,
  canExportData,
  getEditablePermisFields,
  isFieldEditable
};