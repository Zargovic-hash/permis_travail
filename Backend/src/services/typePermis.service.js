const typePermisRepository = require('../repositories/typePermis.repository');
const auditLogRepository = require('../repositories/auditLog.repository');

class TypePermisService {
  async creerType(data, utilisateur, ipClient) {
    const type = await typePermisRepository.create(data);

    await auditLogRepository.create({
      action: 'CREATION_TYPE_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'types_permis',
      cible_id: type.id,
      payload: { nom: type.nom },
      ip_client: ipClient
    });

    return type;
  }

  async modifierType(id, data, utilisateur, ipClient) {
    const type = await typePermisRepository.update(id, data);

    await auditLogRepository.create({
      action: 'MODIFICATION_TYPE_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'types_permis',
      cible_id: id,
      payload: { modifications: Object.keys(data) },
      ip_client: ipClient
    });

    return type;
  }

  async supprimerType(id, utilisateur, ipClient) {
    // Check if type has permits
    const permitCount = await typePermisRepository.getPermitCount(id);
    if (permitCount > 0) {
      throw new Error(`Impossible de supprimer le type: ${permitCount} permis associé(s)`);
    }

    await typePermisRepository.delete(id);

    await auditLogRepository.create({
      action: 'SUPPRESSION_TYPE_PERMIS',
      utilisateur_id: utilisateur.id,
      cible_table: 'types_permis',
      cible_id: id,
      ip_client: ipClient
    });
  }

  async listerTypes() {
    return typePermisRepository.findAll();
  }

  async obtenirType(id) {
    const type = await typePermisRepository.findById(id);
    if (!type) {
      throw new Error('Type de permis non trouvé');
    }
    return type;
  }
}

module.exports = new TypePermisService();
