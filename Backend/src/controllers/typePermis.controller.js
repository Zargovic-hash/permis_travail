const typePermisService = require('../services/typePermis.service');

class TypePermisController {
  async creer(req, res, next) {
    try {
      const type = await typePermisService.creerType(req.body, req.user, req.ip);
      res.status(201).json({
        success: true,
        message: 'Type de permis créé avec succès',
        data: type
      });
    } catch (error) {
      next(error);
    }
  }

  async liste(req, res, next) {
    try {
      const types = await typePermisService.listerTypes();
      res.json({
        success: true,
        data: types
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenir(req, res, next) {
    try {
      const type = await typePermisService.obtenirType(req.params.id);
      res.json({
        success: true,
        data: type
      });
    } catch (error) {
      next(error);
    }
  }

  async modifier(req, res, next) {
    try {
      const type = await typePermisService.modifierType(req.params.id, req.body, req.user, req.ip);
      res.json({
        success: true,
        message: 'Type de permis modifié avec succès',
        data: type
      });
    } catch (error) {
      next(error);
    }
  }

  async supprimer(req, res, next) {
    try {
      await typePermisService.supprimerType(req.params.id, req.user, req.ip);
      res.json({
        success: true,
        message: 'Type de permis supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TypePermisController();
