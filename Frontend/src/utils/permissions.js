/**
 * ✅ SYSTÈME DE PERMISSIONS COHÉRENT AVEC LE WORKFLOW
 * 
 * Workflow:
 * 1. BROUILLON → EN_ATTENTE (Demandeur soumet avec signature)
 * 2. EN_ATTENTE → VALIDE (Superviseur/HSE valide avec signature)
 * 3. VALIDE → EN_COURS (Resp Zone/HSE autorise avec signature)
 * 4. EN_COURS → CLOTURE (Demandeur/Superviseur/HSE clôture avec signature)
 */

/**
 * Vérifier si un utilisateur peut éditer un permis
 */
export const canEditPermis = (permis, user) => {
  if (!user || !permis) return false;
  
  // HSE et ADMIN peuvent tout modifier
  if (['HSE', 'ADMIN'].includes(user.role)) return true;
  
  // Le demandeur peut modifier ses permis en BROUILLON ou EN_ATTENTE
  if (permis.demandeur_id === user.id && ['BROUILLON', 'EN_ATTENTE'].includes(permis.statut)) {
    return true;
  }
  
  return false;
};

/**
 * ✅ Vérifier si un utilisateur peut valider/faire progresser un permis
 */
export const canValidatePermis = (permis, user) => {
  if (!user || !permis) return false;
  
  // Selon le statut actuel, déterminer qui peut valider
  switch (permis.statut) {
    case 'BROUILLON':
      // ✅ Le demandeur peut soumettre (BROUILLON → EN_ATTENTE)
      if (permis.demandeur_id === user.id) return true;
      // Superviseur/HSE peuvent valider directement (BROUILLON → VALIDE)
      if (['SUPERVISEUR', 'HSE', 'ADMIN'].includes(user.role)) return true;
      return false;

    case 'EN_ATTENTE':
      // Seuls Superviseur/HSE peuvent valider (EN_ATTENTE → VALIDE)
      return ['SUPERVISEUR', 'HSE', 'ADMIN'].includes(user.role);

    case 'VALIDE':
      // Seuls Resp Zone/HSE peuvent autoriser démarrage (VALIDE → EN_COURS)
      return ['RESP_ZONE', 'HSE', 'ADMIN'].includes(user.role);

    case 'EN_COURS':
      // ✅ Demandeur, Superviseur ou HSE peuvent clôturer (EN_COURS → CLOTURE)
      if (permis.demandeur_id === user.id) return true;
      return ['SUPERVISEUR', 'HSE', 'ADMIN'].includes(user.role);

    case 'SUSPENDU':
    case 'CLOTURE':
      // Aucune validation possible
      return false;

    default:
      return false;
  }
};

/**
 * ✅ Obtenir le libellé de l'action de validation selon le statut
 */
export const getValidationActionLabel = (permis, user) => {
  if (!canValidatePermis(permis, user)) return null;

  switch (permis.statut) {
    case 'BROUILLON':
      if (permis.demandeur_id === user.id) {
        // ✅ LE DEMANDEUR SIGNE LORS DE LA SOUMISSION
        return 'Signer et soumettre pour validation';
      }
      return 'Valider et signer le permis';

    case 'EN_ATTENTE':
      return 'Valider et signer le permis';

    case 'VALIDE':
      return 'Autoriser le démarrage et signer';

    case 'EN_COURS':
      return 'Clôturer et signer le permis';

    default:
      return null;
  }
};

/**
 * ✅ Obtenir le prochain statut après validation
 */
export const getNextStatusAfterValidation = (permis, user) => {
  if (!canValidatePermis(permis, user)) return null;

  switch (permis.statut) {
    case 'BROUILLON':
      if (permis.demandeur_id === user.id) {
        return 'EN_ATTENTE';
      }
      return 'VALIDE';

    case 'EN_ATTENTE':
      return 'VALIDE';

    case 'VALIDE':
      return 'EN_COURS';

    case 'EN_COURS':
      return 'CLOTURE';

    default:
      return null;
  }
};

/**
 * Vérifier si un utilisateur peut suspendre un permis
 */
export const canSuspendPermis = (permis, user) => {
  if (!user || !permis) return false;
  
  // Seuls HSE, RESP_ZONE et ADMIN peuvent suspendre
  if (!['HSE', 'RESP_ZONE', 'ADMIN'].includes(user.role)) return false;
  
  // On ne peut suspendre que les permis EN_COURS ou VALIDE
  return ['EN_COURS', 'VALIDE'].includes(permis.statut);
};

/**
 * Vérifier si un utilisateur peut réactiver un permis suspendu
 */
export const canReactivatePermis = (permis, user) => {
  if (!user || !permis) return false;
  
  // Seuls HSE et ADMIN peuvent réactiver
  if (!['HSE', 'ADMIN'].includes(user.role)) return false;
  
  // On ne peut réactiver que les permis SUSPENDU
  return permis.statut === 'SUSPENDU';
};

/**
 * Vérifier si un utilisateur peut clôturer un permis
 */
export const canClosePermis = (permis, user) => {
  if (!user || !permis) return false;
  
  // HSE, SUPERVISEUR et ADMIN peuvent toujours clôturer
  if (['HSE', 'SUPERVISEUR', 'ADMIN'].includes(user.role)) return true;
  
  // Le demandeur peut clôturer son propre permis
  if (permis.demandeur_id === user.id) return true;
  
  return false;
};

/**
 * Vérifier si un utilisateur peut supprimer un permis
 */
export const canDeletePermis = (permis, user) => {
  if (!user || !permis) return false;
  
  // Seuls HSE et ADMIN peuvent supprimer
  return ['HSE', 'ADMIN'].includes(user.role);
};

/**
 * Vérifier si un utilisateur peut voir les audit logs
 */
export const canViewAuditLogs = (user) => {
  return user && ['HSE', 'ADMIN'].includes(user.role);
};

/**
 * Vérifier si un utilisateur peut gérer les utilisateurs
 */
export const canManageUsers = (user) => {
  return user && ['HSE', 'ADMIN'].includes(user.role);
};

/**
 * Vérifier si un utilisateur peut gérer les zones
 */
export const canManageZones = (user) => {
  return user && ['HSE', 'ADMIN'].includes(user.role);
};

/**
 * Vérifier si un utilisateur peut gérer les types de permis
 */
export const canManageTypes = (user) => {
  return user && ['HSE', 'ADMIN'].includes(user.role);
};

/**
 * Vérifier si un utilisateur peut voir les rapports
 */
export const canViewReports = (user) => {
  return user && ['HSE', 'ADMIN', 'SUPERVISEUR'].includes(user.role);
};

/**
 * Vérifier si un utilisateur peut créer un permis
 */
export const canCreatePermis = (user) => {
  // Tous les utilisateurs authentifiés peuvent créer un permis
  return !!user;
};

/**
 * ✅ Obtenir toutes les actions disponibles pour un permis
 */
export const getAvailableActions = (permis, user) => {
  if (!user || !permis) {
    return {
      canEdit: false,
      canValidate: false,
      canSuspend: false,
      canReactivate: false,
      canClose: false,
      canDelete: false,
      canExportPDF: false,
      canAddFile: false,
      validationLabel: null,
      nextStatus: null
    };
  }

  return {
    canEdit: canEditPermis(permis, user),
    canValidate: canValidatePermis(permis, user),
    canSuspend: canSuspendPermis(permis, user),
    canReactivate: canReactivatePermis(permis, user),
    canClose: canClosePermis(permis, user),
    canDelete: canDeletePermis(permis, user),
    canExportPDF: true, // Tous peuvent exporter
    canAddFile: canEditPermis(permis, user),
    validationLabel: getValidationActionLabel(permis, user),
    nextStatus: getNextStatusAfterValidation(permis, user)
  };
};

/**
 * ✅ Obtenir les statuts possibles en fonction du rôle et du statut actuel
 */
export const getPossibleStatuses = (currentStatus, user) => {
  if (!user) return [];
  
  const transitions = {
    BROUILLON: {
      // ✅ LE DEMANDEUR PEUT SOUMETTRE (AVEC SIGNATURE)
      DEMANDEUR: ['EN_ATTENTE'],
      SUPERVISEUR: ['EN_ATTENTE', 'VALIDE'],
      RESP_ZONE: ['EN_ATTENTE'],
      HSE: ['EN_ATTENTE', 'VALIDE'],
      ADMIN: ['EN_ATTENTE', 'VALIDE']
    },
    EN_ATTENTE: {
      SUPERVISEUR: ['BROUILLON', 'VALIDE'],
      HSE: ['BROUILLON', 'VALIDE'],
      ADMIN: ['BROUILLON', 'VALIDE']
    },
    VALIDE: {
      RESP_ZONE: ['EN_COURS'],
      HSE: ['EN_COURS'],
      ADMIN: ['EN_COURS']
    },
    EN_COURS: {
      // ✅ LE DEMANDEUR PEUT CLÔTURER (AVEC SIGNATURE)
      DEMANDEUR: ['CLOTURE'],
      SUPERVISEUR: ['CLOTURE'],
      HSE: ['CLOTURE'],
      ADMIN: ['CLOTURE']
    },
    SUSPENDU: {
      HSE: ['EN_COURS'],
      ADMIN: ['EN_COURS']
    },
    CLOTURE: {
      // État final, aucune transition
    }
  };
  
  return transitions[currentStatus]?.[user.role] || [];
};

/**
 * ✅ Obtenir une description du workflow pour l'utilisateur
 */
export const getWorkflowDescription = (permis, user) => {
  if (!user || !permis) return null;

  const descriptions = {
    BROUILLON: {
      // ✅ LE DEMANDEUR DOIT SIGNER POUR SOUMETTRE
      DEMANDEUR: 'Vous devez signer ce permis et le soumettre pour validation par un superviseur. Votre signature engage votre responsabilité.',
      SUPERVISEUR: 'Vous pouvez valider et signer directement ce permis, ou attendre que le demandeur le soumette.',
      HSE: 'Vous pouvez valider et signer directement ce permis.',
      ADMIN: 'Vous pouvez valider et signer directement ce permis.',
      DEFAULT: 'Ce permis est en cours de rédaction.'
    },
    EN_ATTENTE: {
      SUPERVISEUR: 'Vous devez valider et signer ce permis pour autoriser les travaux.',
      HSE: 'Vous devez valider et signer ce permis pour autoriser les travaux.',
      ADMIN: 'Vous devez valider et signer ce permis pour autoriser les travaux.',
      DEFAULT: 'Ce permis est en attente de validation par un superviseur.'
    },
    VALIDE: {
      RESP_ZONE: 'Vous devez autoriser le démarrage des travaux en signant ce permis.',
      HSE: 'Vous devez autoriser le démarrage des travaux en signant ce permis.',
      ADMIN: 'Vous devez autoriser le démarrage des travaux en signant ce permis.',
      DEFAULT: 'Ce permis est validé et attend l\'autorisation de démarrage.'
    },
    EN_COURS: {
      // ✅ LE DEMANDEUR DOIT SIGNER LA CLÔTURE
      DEMANDEUR: 'Les travaux sont en cours. Vous devez signer la clôture une fois les travaux terminés.',
      SUPERVISEUR: 'Les travaux sont en cours. Vous pouvez les clôturer en signant.',
      HSE: 'Les travaux sont en cours. Vous pouvez les clôturer en signant.',
      ADMIN: 'Les travaux sont en cours. Vous pouvez les clôturer en signant.',
      DEFAULT: 'Les travaux sont en cours.'
    },
    SUSPENDU: {
      HSE: 'Vous pouvez réactiver ce permis.',
      ADMIN: 'Vous pouvez réactiver ce permis.',
      DEFAULT: 'Ce permis est suspendu. Les travaux doivent être arrêtés immédiatement.'
    },
    CLOTURE: {
      DEFAULT: 'Ce permis est clôturé. Aucune modification n\'est possible.'
    }
  };

  const statusDescriptions = descriptions[permis.statut];
  if (!statusDescriptions) return null;

  return statusDescriptions[user.role] || statusDescriptions.DEFAULT;
};