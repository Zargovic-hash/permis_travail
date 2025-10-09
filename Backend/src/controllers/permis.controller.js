const permisService = require('../services/permis.service');
const pdfService = require('../services/pdf.service');
const storageService = require('../services/storage.service');
const permisRepository = require('../repositories/permis.repository');
const auditLogRepository = require('../repositories/auditLog.repository');
const { getPaginationMeta, getOffset } = require('../utils/pagination');

class PermisController {
  async creer(req, res, next) {
    try {
      const permis = await permisService.creerPermis(req.body, req.user, req.ip);
      res.status(201).json({
        success: true,
        message: 'Permis créé avec succès',
        data: permis
      });
    } catch (error) {
      next(error);
    }
  }

  async liste(req, res, next) {
    try {
      const { page = 1, limit = 10, zone_id, type_permis_id, statut, demandeur_id, date_debut, date_fin } = req.query;
      
      const filters = { zone_id, type_permis_id, statut, demandeur_id, date_debut, date_fin };
      const { data, totalCount } = await permisRepository.findAll(filters, { page, limit });
      
      res.json({
        success: true,
        data,
        pagination: getPaginationMeta(page, limit, totalCount)
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenir(req, res, next) {
    try {
      const permis = await permisRepository.findById(req.params.id);
      if (!permis) {
        return res.status(404).json({
          success: false,
          message: 'Permis non trouvé'
        });
      }

      const approbations = await permisRepository.getApprovals(req.params.id);
      
      res.json({
        success: true,
        data: {
          ...permis,
          approbations
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async modifier(req, res, next) {
    try {
      const permis = await permisService.modifierPermis(req.params.id, req.body, req.user, req.ip);
      res.json({
        success: true,
        message: 'Permis modifié avec succès',
        data: permis
      });
    } catch (error) {
      next(error);
    }
  }

  async valider(req, res, next) {
    try {
      const { commentaire, signature_image } = req.body;
      const permis = await permisService.validerPermis(
        req.params.id,
        req.user,
        commentaire,
        signature_image,
        req.ip
      );
      
      res.json({
        success: true,
        message: 'Permis validé avec succès',
        data: permis
      });
    } catch (error) {
      next(error);
    }
  }

  async suspendre(req, res, next) {
    try {
      const { raison } = req.body;
      const permis = await permisService.suspendrePermis(req.params.id, req.user, raison, req.ip);
      
      res.json({
        success: true,
        message: 'Permis suspendu',
        data: permis
      });
    } catch (error) {
      next(error);
    }
  }

  async cloturer(req, res, next) {
    try {
      const permis = await permisService.cloturerPermis(req.params.id, req.user, req.ip);
      
      res.json({
        success: true,
        message: 'Permis clôturé',
        data: permis
      });
    } catch (error) {
      next(error);
    }
  }

  async ajouterFichier(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const result = await storageService.uploadFile(req.file, `permis/${req.params.id}`);
      
      const permis = await permisRepository.findById(req.params.id);
      const justificatifs = permis.justificatifs || {};
      justificatifs[req.file.originalname] = result;
      
      await permisRepository.update(req.params.id, { justificatifs });

      await auditLogRepository.create({
        action: 'AJOUT_FICHIER_PERMIS',
        utilisateur_id: req.user.id,
        cible_table: 'permis',
        cible_id: req.params.id,
        payload: { filename: req.file.originalname },
        ip_client: req.ip
      });

      res.json({
        success: true,
        message: 'Fichier ajouté avec succès',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async exportPDF(req, res, next) {
    try {
      const { buffer, path: pdfPath } = await pdfService.genererPDFPermis(req.params.id);
      
      await auditLogRepository.create({
        action: 'EXPORT_PDF_PERMIS',
        utilisateur_id: req.user.id,
        cible_table: 'permis',
        cible_id: req.params.id,
        ip_client: req.ip
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=permis-${req.params.id}.pdf`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async verifierPDF(req, res, next) {
    try {
      const verification = await pdfService.verifierIntegritePDF(req.params.id, null);
      
      res.json({
        success: true,
        data: verification
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermisController();
