const permisRepository = require('../repositories/permis.repository');
const auditLogRepository = require('../repositories/auditLog.repository');
const { generateSignatureHash } = require('../utils/crypto');

/**
 * ✅ WORKFLOW COMPLET ET COHÉRENT
 * 
 * 1. BROUILLON → EN_ATTENTE (Demandeur soumet)
 * 2. EN_ATTENTE → VALIDE (Superviseur valide)
 * 3. VALIDE → EN_COURS (Responsable Zone autorise le démarrage)
 * 4. EN_COURS → CLOTURE (Demandeur/Superviseur/HSE clôture)
 * 
 * États spéciaux:
 * - SUSPENDU: Peut être réactivé vers EN_COURS
 * - CLOTURE: État final, aucune transition possible
 */

class PermisService {
  async creerPermis(data, utilisateur, ipClient) {
    const numeroPermis = await permisRepository.generateNumeroPermis();
    
    const statutInitial = data.statut || 'BROUILLON';
    
    const permis = await permisRepository.create({
      ...data,
      numero_permis: numeroPermis,
      demandeur_id: utilisateur.id,
      statut: statutInitial
    });

    await auditLogRepository.create({
      action: 'CREATION_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: permis.id,
      payload: { numero_permis: numeroPermis, statut: statutInitial },
      ip_client: ipClient
    });

    return permis;
  }

  async modifierPermis(id, data, utilisateur, ipClient) {
    const permis = await permisRepository.findById(id);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    // ✅ Vérification des permissions de modification
    const canEdit = this.canEditPermis(permis, utilisateur);
    if (!canEdit) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce permis');
    }

    const updated = await permisRepository.update(id, data);

    await auditLogRepository.create({
      action: 'MODIFICATION_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: id,
      payload: { modifications: Object.keys(data) },
      ip_client: ipClient
    });

    return updated;
  }

  /**
   * ✅ VALIDATION AVEC WORKFLOW STRICT
   * Cette méthode gère TOUTES les transitions d'état du permis
   */
  async validerPermis(id, utilisateur, commentaire, signatureImage, ipClient) {
    const permis = await permisRepository.findById(id);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    // ✅ Vérifier états invalides
    if (permis.statut === 'CLOTURE') {
      throw new Error('Ce permis est déjà clôturé - impossible de le modifier');
    }

    if (permis.statut === 'SUSPENDU') {
      throw new Error('Ce permis est suspendu - il doit être réactivé avant validation');
    }

    // ✅ Déterminer la transition autorisée
    const transition = this.determineTransition(
      permis.statut, 
      utilisateur.role, 
      permis.demandeur_id === utilisateur.id
    );
    
    if (!transition) {
      throw new Error(
        `Transition non autorisée. ` +
        `Statut actuel: ${permis.statut}, ` +
        `Votre rôle: ${utilisateur.role}, ` +
        `Transitions disponibles: ${this.getAvailableTransitions(permis.statut)}`
      );
    }

    const { roleApprobation, nouveauStatut, requiresSignature } = transition;

    // ✅ Vérifier la signature si requise
    if (requiresSignature && !signatureImage) {
      throw new Error('Une signature électronique est requise pour cette validation');
    }

    // Générer signature hash
    let signatureHash = null;
    if (signatureImage) {
      const timestamp = new Date().toISOString();
      signatureHash = generateSignatureHash(permis.id, utilisateur.id, timestamp);
    }

    // ✅ Enregistrer l'approbation
    await permisRepository.createApproval({
      permis_id: id,
      utilisateur_id: utilisateur.id,
      role_app: roleApprobation,
      statut: 'APPROUVE',
      commentaire: commentaire || null,
      signature_image_path: signatureImage || null,
      signature_hash: signatureHash
    });

    // ✅ Mettre à jour le statut
    await permisRepository.updateStatus(id, nouveauStatut);

    await auditLogRepository.create({
      action: 'VALIDATION_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: id,
      payload: { 
        role: roleApprobation, 
        ancien_statut: permis.statut,
        nouveau_statut: nouveauStatut,
        avec_signature: !!signatureImage
      },
      ip_client: ipClient
    });

    return permisRepository.findById(id);
  }

  /**
   * ✅ LOGIQUE DE TRANSITION COMPLÈTE ET STRICTE
   * Retourne: { roleApprobation, nouveauStatut, requiresSignature } ou null
   */
  determineTransition(statutActuel, roleUtilisateur, estDemandeur) {
    // Matrice de transition complète
    const transitions = {
      'BROUILLON': {
        // Le demandeur peut soumettre son brouillon
        'DEMANDEUR': {
          condition: (isDem) => isDem,
          roleApprobation: 'DEMANDEUR',
          nouveauStatut: 'EN_ATTENTE',
          requiresSignature: false
        },
        // Les superviseurs/HSE peuvent directement valider
        'SUPERVISEUR': {
          condition: () => true,
          roleApprobation: 'SUPERVISEUR',
          nouveauStatut: 'VALIDE',
          requiresSignature: true
        },
        'HSE': {
          condition: () => true,
          roleApprobation: 'HSE',
          nouveauStatut: 'VALIDE',
          requiresSignature: true
        },
        'ADMIN': {
          condition: () => true,
          roleApprobation: 'ADMIN',
          nouveauStatut: 'VALIDE',
          requiresSignature: true
        }
      },
      'EN_ATTENTE': {
        // Seuls les superviseurs et HSE peuvent valider une demande
        'SUPERVISEUR': {
          condition: () => true,
          roleApprobation: 'SUPERVISEUR',
          nouveauStatut: 'VALIDE',
          requiresSignature: true
        },
        'HSE': {
          condition: () => true,
          roleApprobation: 'HSE',
          nouveauStatut: 'VALIDE',
          requiresSignature: true
        },
        'ADMIN': {
          condition: () => true,
          roleApprobation: 'ADMIN',
          nouveauStatut: 'VALIDE',
          requiresSignature: true
        }
      },
      'VALIDE': {
        // Seuls les responsables de zone et HSE peuvent autoriser le démarrage
        'RESP_ZONE': {
          condition: () => true,
          roleApprobation: 'RESP_ZONE',
          nouveauStatut: 'EN_COURS',
          requiresSignature: true
        },
        'HSE': {
          condition: () => true,
          roleApprobation: 'HSE',
          nouveauStatut: 'EN_COURS',
          requiresSignature: true
        },
        'ADMIN': {
          condition: () => true,
          roleApprobation: 'ADMIN',
          nouveauStatut: 'EN_COURS',
          requiresSignature: true
        }
      },
      'EN_COURS': {
        // Clôture possible par le demandeur, superviseur ou HSE
        'DEMANDEUR': {
          condition: (isDem) => isDem,
          roleApprobation: 'DEMANDEUR',
          nouveauStatut: 'CLOTURE',
          requiresSignature: false
        },
        'SUPERVISEUR': {
          condition: () => true,
          roleApprobation: 'SUPERVISEUR',
          nouveauStatut: 'CLOTURE',
          requiresSignature: true
        },
        'HSE': {
          condition: () => true,
          roleApprobation: 'HSE',
          nouveauStatut: 'CLOTURE',
          requiresSignature: true
        },
        'ADMIN': {
          condition: () => true,
          roleApprobation: 'ADMIN',
          nouveauStatut: 'CLOTURE',
          requiresSignature: true
        }
      }
    };

    const roleTransitions = transitions[statutActuel];
    if (!roleTransitions) {
      return null; // Aucune transition possible depuis ce statut
    }

    const transition = roleTransitions[roleUtilisateur];
    if (!transition || !transition.condition(estDemandeur)) {
      return null; // Transition non autorisée pour ce rôle
    }

    return {
      roleApprobation: transition.roleApprobation,
      nouveauStatut: transition.nouveauStatut,
      requiresSignature: transition.requiresSignature
    };
  }

  /**
   * ✅ Obtenir les transitions disponibles pour un statut (pour messages d'erreur)
   */
  getAvailableTransitions(statutActuel) {
    const map = {
      'BROUILLON': 'EN_ATTENTE (Demandeur), VALIDE (Superviseur/HSE)',
      'EN_ATTENTE': 'VALIDE (Superviseur/HSE)',
      'VALIDE': 'EN_COURS (Responsable Zone/HSE)',
      'EN_COURS': 'CLOTURE (Demandeur/Superviseur/HSE)',
      'SUSPENDU': 'Utiliser l\'endpoint de réactivation',
      'CLOTURE': 'Aucune transition possible (état final)'
    };
    return map[statutActuel] || 'Aucune';
  }

  /**
   * ✅ Vérifier si un utilisateur peut modifier un permis
   */
  canEditPermis(permis, utilisateur) {
    // HSE et ADMIN peuvent tout modifier
    if (['HSE', 'ADMIN'].includes(utilisateur.role)) {
      return true;
    }
    
    // Le demandeur peut modifier ses permis en BROUILLON ou EN_ATTENTE uniquement
    if (permis.demandeur_id === utilisateur.id && 
        ['BROUILLON', 'EN_ATTENTE'].includes(permis.statut)) {
      return true;
    }
    
    return false;
  }

  async suspendrePermis(id, utilisateur, raison, ipClient) {
    const permis = await permisRepository.findById(id);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    if (!['HSE', 'RESP_ZONE', 'ADMIN'].includes(utilisateur.role)) {
      throw new Error('Vous n\'êtes pas autorisé à suspendre ce permis');
    }

    // ✅ Vérifier que le permis est dans un état suspendable
    if (!['EN_COURS', 'VALIDE'].includes(permis.statut)) {
      throw new Error(`Un permis avec le statut ${permis.statut} ne peut pas être suspendu`);
    }

    const ancienStatut = permis.statut;
    
    // ✅ Sauvegarder l'ancien statut pour la réactivation
    await permisRepository.update(id, { 
      statut_avant_suspension: ancienStatut 
    });
    
    await permisRepository.updateStatus(id, 'SUSPENDU');

    await auditLogRepository.create({
      action: 'SUSPENSION_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: id,
      payload: { raison, ancien_statut: ancienStatut },
      ip_client: ipClient
    });

    return permisRepository.findById(id);
  }

  async cloturerPermis(id, utilisateur, ipClient) {
    const permis = await permisRepository.findById(id);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    // ✅ Permissions de clôture
    const canClose = 
      ['HSE', 'SUPERVISEUR', 'ADMIN'].includes(utilisateur.role) ||
      permis.demandeur_id === utilisateur.id;

    if (!canClose) {
      throw new Error('Vous n\'êtes pas autorisé à clôturer ce permis');
    }

    // ✅ Vérifier que le permis peut être clôturé
    if (!['VALIDE', 'EN_COURS'].includes(permis.statut)) {
      throw new Error(`Un permis avec le statut ${permis.statut} ne peut pas être clôturé directement`);
    }

    const ancienStatut = permis.statut;
    await permisRepository.updateStatus(id, 'CLOTURE');

    await auditLogRepository.create({
      action: 'CLOTURE_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: id,
      payload: { ancien_statut: ancienStatut },
      ip_client: ipClient
    });

    return permisRepository.findById(id);
  }

  async reactiverPermis(id, utilisateur, commentaire, ipClient) {
    const permis = await permisRepository.findById(id);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    if (permis.statut !== 'SUSPENDU') {
      throw new Error('Seul un permis suspendu peut être réactivé');
    }

    if (!['HSE', 'ADMIN'].includes(utilisateur.role)) {
      throw new Error('Vous n\'êtes pas autorisé à réactiver ce permis');
    }

    // ✅ Restaurer le statut d'avant suspension
    const statutRestaure = permis.statut_avant_suspension || 'EN_COURS';
    await permisRepository.updateStatus(id, statutRestaure);

    await auditLogRepository.create({
      action: 'REACTIVATION_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: id,
      payload: { 
        commentaire, 
        ancien_statut: 'SUSPENDU',
        nouveau_statut: statutRestaure
      },
      ip_client: ipClient
    });

    return permisRepository.findById(id);
  }

  // ✅ Validation des tests atmosphériques
  validateAtmosphericTests(resultat_tests_atmos) {
    if (!resultat_tests_atmos) return true;

    if (resultat_tests_atmos.o2) {
      const o2 = parseFloat(resultat_tests_atmos.o2);
      if (o2 < 19.5 || o2 > 23.5) {
        throw new Error('O2 hors plage de sécurité (19.5-23.5%)');
      }
    }

    if (resultat_tests_atmos.lel) {
      const lel = parseFloat(resultat_tests_atmos.lel);
      if (lel >= 10) {
        throw new Error('LEL trop élevé (doit être < 10%)');
      }
    }

    if (resultat_tests_atmos.h2s) {
      const h2s = parseFloat(resultat_tests_atmos.h2s);
      if (h2s >= 10) {
        throw new Error('H2S dangereux (doit être < 10 ppm)');
      }
    }

    return true;
  }
}

module.exports = new PermisService();