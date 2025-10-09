const zoneService = require('../services/zone.service');

class ZoneController {
  async creer(req, res, next) {
    try {
      const zone = await zoneService.creerZone(req.body, req.user, req.ip);
      res.status(201).json({
        success: true,
        message: 'Zone créée avec succès',
        data: zone
      });
    } catch (error) {
      next(error);
    }
  }

  async liste(req, res, next) {
    try {
      const zones = await zoneService.listerZones();
      res.json({
        success: true,
        data: zones
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenir(req, res, next) {
    try {
      const zone = await zoneService.obtenirZone(req.params.id);
      res.json({
        success: true,
        data: zone
      });
    } catch (error) {
      next(error);
    }
  }

  async modifier(req, res, next) {
    try {
      const zone = await zoneService.modifierZone(req.params.id, req.body, req.user, req.ip);
      res.json({
        success: true,
        message: 'Zone modifiée avec succès',
        data: zone
      });
    } catch (error) {
      next(error);
    }
  }

  async supprimer(req, res, next) {
    try {
      await zoneService.supprimerZone(req.params.id, req.user, req.ip);
      res.json({
        success: true,
        message: 'Zone supprimée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ZoneController();

