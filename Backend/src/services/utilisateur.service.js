const utilisateurRepository = require('../repositories/utilisateur.repository');
const auditLogRepository = require('../repositories/auditLog.repository');

class UtilisateurService {
  async obtenirUtilisateur(id) {
    const utilisateur = await utilisateurRepository.findById(id);
    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }
    delete utilisateur.mot_de_passe_hash;
    return utilisateur;
  }

  async modifierUtilisateur(id, data, currentUser, ipClient) {
    // Check permissions
    if (currentUser.role !== 'HSE' && currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new Error('Vous n\'êtes pas autorisé à modifier cet utilisateur');
    }

    // Prevent role escalation
    if (data.role && currentUser.role !== 'ADMIN' && currentUser.role !== 'HSE') {
      delete data.role;
    }

    const utilisateur = await utilisateurRepository.update(id, data);
    delete utilisateur.mot_de_passe_hash;

    await auditLogRepository.create({
      action: 'MODIFICATION_UTILISATEUR',
      utilisateur_id: currentUser.id,
      cible_table: 'utilisateurs',
      cible_id: id,
      payload: { modifications: Object.keys(data) },
      ip_client: ipClient
    });

    return utilisateur;
  }

  async supprimerUtilisateur(id, anonymiser, currentUser, ipClient) {
    if (currentUser.role !== 'HSE' && currentUser.role !== 'ADMIN') {
      throw new Error('Vous n\'êtes pas autorisé à supprimer cet utilisateur');
    }

    let utilisateur;
    if (anonymiser) {
      utilisateur = await utilisateurRepository.anonymize(id);
    } else {
      utilisateur = await utilisateurRepository.softDelete(id);
    }

    await auditLogRepository.create({
      action: anonymiser ? 'ANONYMISATION_UTILISATEUR' : 'SUPPRESSION_UTILISATEUR',
      utilisateur_id: currentUser.id,
      cible_table: 'utilisateurs',
      cible_id: id,
      ip_client: ipClient
    });

    return utilisateur;
  }

  async listerUtilisateurs(filters, currentUser) {
    if (currentUser.role !== 'HSE' && currentUser.role !== 'ADMIN') {
      throw new Error('Accès non autorisé');
    }

    return utilisateurRepository.findAll(filters);
  }
}

module.exports = new UtilisateurService();
