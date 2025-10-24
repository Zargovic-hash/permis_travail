const permisService = require('../services/permis.service');
const pdfService = require('../services/pdf.service');
const storageService = require('../services/storage.service');
const permisRepository = require('../repositories/permis.repository');
const auditLogRepository = require('../repositories/auditLog.repository');

class PermisController {
  async creer(req, res, next) {
    try {
      console.log('📝 Création permis - User:', req.user?.id, req.user?.role);
      console.log('📝 Body:', JSON.stringify(req.body, null, 2));
      
      const permis = await permisService.creerPermis(req.body, req.user, req.ip);
      
      res.status(201).json({
        success: true,
        message: 'Permis créé avec succès',
        data: permis
      });
    } catch (error) {
      console.error('❌ Erreur création permis:', error.message);
      console.error('Stack:', error.stack);
      next(error);
    }
  }

  async liste(req, res, next) {
    try {
      const { page = 1, limit = 10, zone_id, type_permis_id, statut, demandeur_id, date_debut, date_fin, search } = req.query;
      
      const filters = { zone_id, type_permis_id, statut, demandeur_id, date_debut, date_fin, search };
      const pagination = { page: parseInt(page), limit: parseInt(limit) };
      
      const { data, totalCount } = await permisRepository.findAll(filters, pagination);
      
      res.json({
        success: true,
        data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / pagination.limit),
          hasNextPage: pagination.page < Math.ceil(totalCount / pagination.limit),
          hasPrevPage: pagination.page > 1
        }
      });
    } catch (error) {
      console.error('❌ Erreur liste permis:', error.message);
      next(error);
    }
  }

  async obtenir(req, res, next) {
    try {
      console.log('🔍 Récupération permis:', req.params.id);
      
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
      console.error('❌ Erreur obtenir permis:', error.message);
      next(error);
    }
  }

  async modifier(req, res, next) {
    try {
      console.log('✏️  Modification permis:', req.params.id, '- User:', req.user?.id);
      
      const permis = await permisService.modifierPermis(req.params.id, req.body, req.user, req.ip);
      
      res.json({
        success: true,
        message: 'Permis modifié avec succès',
        data: permis
      });
    } catch (error) {
      console.error('❌ Erreur modification permis:', error.message);
      next(error);
    }
  }

  // ⭐ MÉTHODE CRITIQUE: Validation
  async valider(req, res, next) {
    try {
      const { commentaire, signature_image } = req.body;
      
      console.log('✅ VALIDATION PERMIS - Début');
      console.log('   - ID Permis:', req.params.id);
      console.log('   - Utilisateur:', req.user?.id, req.user?.prenom, req.user?.nom);
      console.log('   - Rôle:', req.user?.role);
      console.log('   - Commentaire:', commentaire?.substring(0, 50));
      console.log('   - Signature présente:', !!signature_image);
      
      // Récupérer le permis actuel pour debug
      const permisActuel = await permisRepository.findById(req.params.id);
      console.log('   - Statut actuel:', permisActuel?.statut);
      
      const permis = await permisService.validerPermis(
        req.params.id,
        req.user,
        commentaire,
        signature_image,
        req.ip
      );
      
      console.log('✅ VALIDATION RÉUSSIE - Nouveau statut:', permis.statut);
      
      res.json({
        success: true,
        message: 'Permis validé avec succès',
        data: permis
      });
    } catch (error) {
      console.error('❌ ERREUR VALIDATION PERMIS:', error.message);
      console.error('Stack:', error.stack);
      
      // Retourner une erreur plus explicite
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la validation du permis',
        details: {
          permisId: req.params.id,
          userId: req.user?.id,
          userRole: req.user?.role,
          error: error.message
        }
      });
    }
  }

  async suspendre(req, res, next) {
    try {
      const { raison } = req.body;
      
      if (!raison || !raison.trim()) {
        return res.status(400).json({
          success: false,
          message: 'La raison de la suspension est requise'
        });
      }
      
      console.log('⚠️  Suspension permis:', req.params.id, '- Raison:', raison);
      
      const permis = await permisService.suspendrePermis(req.params.id, req.user, raison, req.ip);
      
      res.json({
        success: true,
        message: 'Permis suspendu avec succès',
        data: permis
      });
    } catch (error) {
      console.error('❌ Erreur suspension permis:', error.message);
      next(error);
    }
  }

  async cloturer(req, res, next) {
    try {
      console.log('🔒 Clôture permis:', req.params.id);
      
      const permis = await permisService.cloturerPermis(req.params.id, req.user, req.ip);
      
      res.json({
        success: true,
        message: 'Permis clôturé avec succès',
        data: permis
      });
    } catch (error) {
      console.error('❌ Erreur clôture permis:', error.message);
      next(error);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Réactiver un permis suspendu
  async reactiver(req, res, next) {
    try {
      const { commentaire } = req.body;
      
      console.log('🔄 Réactivation permis:', req.params.id);
      
      const permis = await permisService.reactiverPermis(req.params.id, req.user, commentaire, req.ip);
      
      res.json({
        success: true,
        message: 'Permis réactivé avec succès',
        data: permis
      });
    } catch (error) {
      console.error('❌ Erreur réactivation permis:', error.message);
      next(error);
    }
  }

  async supprimer(req, res, next) {
    try {
      console.log('🗑️  Suppression permis:', req.params.id);
      
      await permisRepository.update(req.params.id, { supprime: true });
      
      await auditLogRepository.create({
        action: 'SUPPRESSION_PERMIS',
        utilisateur_id: req.user.id,
        cible_table: 'permis',
        cible_id: req.params.id,
        ip_client: req.ip
      });
      
      res.json({
        success: true,
        message: 'Permis supprimé avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur suppression permis:', error.message);
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

      console.log('📎 Ajout fichier au permis:', req.params.id, '- Fichier:', req.file.originalname);

      const result = await storageService.uploadFile(req.file, `permis/${req.params.id}`);
      
      const permis = await permisRepository.findById(req.params.id);
      const justificatifs = permis.justificatifs || {};
      justificatifs[req.file.originalname] = result.path;
      
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
      console.error('❌ Erreur ajout fichier:', error.message);
      next(error);
    }
  }

  async exportPDF(req, res, next) {
    try {
      console.log('📄 Export PDF permis:', req.params.id);
      
      const { buffer } = await pdfService.genererPDFPermis(req.params.id);
      
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
      console.error('❌ Erreur export PDF:', error.message);
      next(error);
    }
  }

  async verifierPDF(req, res, next) {
    try {
      console.log('🔐 Vérification PDF permis:', req.params.id);
      
      const verification = await pdfService.verifierIntegritePDF(req.params.id);
      
      res.json({
        success: verification.isValid,
        message: verification.isValid ? 'Signature PDF valide' : 'Signature PDF invalide',
        data: verification
      });
    } catch (error) {
      console.error('❌ Erreur vérification PDF:', error.message);
      next(error);
    }
  }
  async getAvailableActions(req, res, next) {
  try {
    const permis = await permisRepository.findById(req.params.id);
    if (!permis) {
      return res.status(404).json({
        success: false,
        message: 'Permis non trouvé'
      });
    }

    // Exemple basique (à adapter selon tes règles)
    const actions = permisService.getAvailableActions(permis, req.user);

    res.json({
      success: true,
      actions
    });
  } catch (error) {
    console.error('❌ Erreur getAvailableActions:', error.message);
    next(error);
  }
}

}

module.exports = new PermisController();