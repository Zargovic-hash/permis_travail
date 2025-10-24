const utilisateurRepository = require('../repositories/utilisateur.repository');
const auditLogRepository = require('../repositories/auditLog.repository');
const { getPaginationMeta } = require('../utils/pagination');

class UtilisateurController {
  async liste(req, res, next) {
    try {
      const { page = 1, limit = 10, role, actif, search } = req.query;
      
      const filters = {};
      if (role) filters.role = role;
      if (actif !== undefined && actif !== '') filters.actif = actif === 'true';
      if (search) filters.search = search;
      
      const { data, totalCount } = await utilisateurRepository.findAll(filters, { page: parseInt(page), limit: parseInt(limit) });
      
      // Remove password hashes
      data.forEach(u => delete u.mot_de_passe_hash);
      
      res.json({
        success: true,
        data: {
          data,
          pagination: getPaginationMeta(parseInt(page), parseInt(limit), totalCount)
        }
      });
    } catch (error) {
      console.error('Erreur liste utilisateurs:', error);
      next(error);
    }
  }

  async obtenir(req, res, next) {
    try {
      const utilisateur = await utilisateurRepository.findById(req.params.id);
      if (!utilisateur) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      delete utilisateur.mot_de_passe_hash;
      
      res.json({
        success: true,
        data: utilisateur
      });
    } catch (error) {
      next(error);
    }
  }

  async modifier(req, res, next) {
    try {
      const utilisateur = await utilisateurRepository.update(req.params.id, req.body);
      delete utilisateur.mot_de_passe_hash;

      await auditLogRepository.create({
        action: 'MODIFICATION_UTILISATEUR',
        utilisateur_id: req.user.id,
        cible_table: 'utilisateurs',
        cible_id: req.params.id,
        payload: { modifications: Object.keys(req.body) },
        ip_client: req.ip
      });
      
      res.json({
        success: true,
        message: 'Utilisateur modifié avec succès',
        data: utilisateur
      });
    } catch (error) {
      next(error);
    }
  }

  async supprimer(req, res, next) {
    try {
      const { anonymiser } = req.body;
      
      let utilisateur;
      if (anonymiser) {
        utilisateur = await utilisateurRepository.anonymize(req.params.id);
      } else {
        utilisateur = await utilisateurRepository.softDelete(req.params.id);
      }

      await auditLogRepository.create({
        action: anonymiser ? 'ANONYMISATION_UTILISATEUR' : 'SUPPRESSION_UTILISATEUR',
        utilisateur_id: req.user.id,
        cible_table: 'utilisateurs',
        cible_id: req.params.id,
        ip_client: req.ip
      });

      res.json({
        success: true,
        message: anonymiser ? 'Utilisateur anonymisé' : 'Utilisateur supprimé',
        data: utilisateur
      });
    } catch (error) {
      next(error);
    }
  }

  async anonymiser(req, res, next) {
    try {
      const utilisateur = await utilisateurRepository.anonymize(req.params.id);

      await auditLogRepository.create({
        action: 'ANONYMISATION_UTILISATEUR',
        utilisateur_id: req.user.id,
        cible_table: 'utilisateurs',
        cible_id: req.params.id,
        ip_client: req.ip
      });

      res.json({
        success: true,
        message: 'Utilisateur anonymisé avec succès',
        data: utilisateur
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UtilisateurController();