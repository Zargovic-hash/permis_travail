const permisRepository = require('../repositories/permis.repository');
const auditLogRepository = require('../repositories/auditLog.repository');
const { generateSignatureHash } = require('../utils/crypto');

class PermisService {
  async creerPermis(data, utilisateur, ipClient) {
    const numeroPermis = await permisRepository.generateNumeroPermis();
    const permis = await permisRepository.create({
      ...data,
      numero_permis: numeroPermis,
      demandeur_id: utilisateur.id
    });

    await auditLogRepository.create({
      action: 'CREATION_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: permis.id,
      payload: { numero_permis: numeroPermis },
      ip_client: ipClient
    });

    return permis;
  }

  async modifierPermis(id, data, utilisateur, ipClient) {
    const permis = await permisRepository.findById(id);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    // Check permissions
    if (utilisateur.role !== 'HSE' && utilisateur.role !== 'ADMIN' && permis.demandeur_id !== utilisateur.id) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce permis');
    }

    // Cannot modify if already validated
    if (['VALIDE', 'EN_COURS', 'CLOTURE'].includes(permis.statut) && utilisateur.role !== 'HSE') {
      throw new Error('Ce permis ne peut plus être modifié');
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

  async validerPermis(id, utilisateur, commentaire, signatureImage, ipClient) {
    const permis = await permisRepository.findById(id);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    // Workflow validation logic
    const roleApprobation = this.determineRoleApprobation(permis.statut, utilisateur.role);
    if (!roleApprobation) {
      throw new Error('Vous n\'êtes pas autorisé à valider ce permis à cette étape');
    }

    const timestamp = new Date().toISOString();
    const signatureHash = generateSignatureHash(permis.id, utilisateur.id, timestamp);

    await permisRepository.createApproval({
      permis_id: id,
      utilisateur_id: utilisateur.id,
      role_app: roleApprobation,
      statut: 'APPROUVE',
      commentaire,
      signature_image_path: signatureImage,
      signature_hash: signatureHash
    });

    // Update permit status
    const nouveauStatut = this.determineNouveauStatut(permis.statut, roleApprobation);
    await permisRepository.updateStatus(id, nouveauStatut);

    await auditLogRepository.create({
      action: 'VALIDATION_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: id,
      payload: { role: roleApprobation, nouveau_statut: nouveauStatut },
      ip_client: ipClient
    });

    return permisRepository.findById(id);
  }

  determineRoleApprobation(statutActuel, roleUtilisateur) {
    // HSE can approve at any stage
    if (roleUtilisateur === 'HSE') return 'HSE';

    const workflow = {
      'BROUILLON': null,
      'EN_ATTENTE': 'SUPERVISEUR',
      'VALIDE': 'RESP_ZONE',
      'EN_COURS': 'HSE'
    };

    const roleRequis = workflow[statutActuel];
    return roleUtilisateur === roleRequis ? roleRequis : null;
  }

  determineNouveauStatut(statutActuel, roleApprobation) {
    const transitions = {
      'EN_ATTENTE-SUPERVISEUR': 'VALIDE',
      'VALIDE-RESP_ZONE': 'VALIDE',
      'VALIDE-HSE': 'EN_COURS',
      'EN_COURS-HSE': 'CLOTURE'
    };

    return transitions[`${statutActuel}-${roleApprobation}`] || statutActuel;
  }

  async suspendrePermis(id, utilisateur, raison, ipClient) {
    const permis = await permisRepository.findById(id);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    if (!['HSE', 'RESP_ZONE'].includes(utilisateur.role)) {
      throw new Error('Vous n\'êtes pas autorisé à suspendre ce permis');
    }

    await permisRepository.updateStatus(id, 'SUSPENDU');

    await auditLogRepository.create({
      action: 'SUSPENSION_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: id,
      payload: { raison },
      ip_client: ipClient
    });

    return permisRepository.findById(id);
  }

  async cloturerPermis(id, utilisateur, ipClient) {
    const permis = await permisRepository.findById(id);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    if (!['HSE', 'SUPERVISEUR'].includes(utilisateur.role) && permis.demandeur_id !== utilisateur.id) {
      throw new Error('Vous n\'êtes pas autorisé à clôturer ce permis');
    }

    await permisRepository.updateStatus(id, 'CLOTURE');

    await auditLogRepository.create({
      action: 'CLOTURE_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'permis',
      cible_id: id,
      ip_client: ipClient
    });

    return permisRepository.findById(id);
  }
}

module.exports = new PermisService();