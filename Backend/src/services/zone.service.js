const zoneRepository = require('../repositories/zone.repository');
const auditLogRepository = require('../repositories/auditLog.repository');

class ZoneService {
  async creerZone(data, utilisateur, ipClient) {
    const zone = await zoneRepository.create(data);

    await auditLogRepository.create({
      action: 'CREATION_ZONE',
      utilisateur_id: utilisateur.id,
      cible_table: 'zones',
      cible_id: zone.id,
      payload: { nom: zone.nom },
      ip_client: ipClient
    });

    return zone;
  }

  async modifierZone(id, data, utilisateur, ipClient) {
    const zone = await zoneRepository.update(id, data);

    await auditLogRepository.create({
      action: 'MODIFICATION_ZONE',
      utilisateur_id: utilisateur.id,
      cible_table: 'zones',
      cible_id: id,
      payload: { modifications: Object.keys(data) },
      ip_client: ipClient
    });

    return zone;
  }

  async supprimerZone(id, utilisateur, ipClient) {
    // Check if zone has permits
    const permitCount = await zoneRepository.getPermitCount(id);
    if (permitCount > 0) {
      throw new Error(`Impossible de supprimer la zone: ${permitCount} permis associé(s)`);
    }

    await zoneRepository.delete(id);

    await auditLogRepository.create({
      action: 'SUPPRESSION_ZONE',
      utilisateur_id: utilisateur.id,
      cible_table: 'zones',
      cible_id: id,
      ip_client: ipClient
    });
  }

  async listerZones() {
    return zoneRepository.findAll();
  }

  async obtenirZone(id) {
    const zone = await zoneRepository.findById(id);
    if (!zone) {
      throw new Error('Zone non trouvée');
    }
    return zone;
  }
}

module.exports = new ZoneService();

