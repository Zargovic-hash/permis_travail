const express = require('express');
const router = express.Router();
const permisController = require('../controllers/permis.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const upload = require('../middlewares/upload.middleware');
const { createPermisSchema, updatePermisSchema, validerPermisSchema } = require('../validators/permis.validator');

// ✅ IMPORTANT: Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// ========== ROUTES SPÉCIFIQUES (AVANT les génériques) ==========
// Ces routes doivent être AVANT GET /:id sinon elles seront interprétées comme GET /:id

// CREATE - Créer un nouveau permis
router.post('/', validate(createPermisSchema), permisController.creer);

// LIST - Lister tous les permis avec filtres
router.get('/', permisController.liste);

// ========== ACTIONS SPÉCIFIQUES (AVANT /:id) ==========

// ✅ VALIDER - Valider/Approuver/Faire progresser un permis ⭐ ROUTE CRITIQUE
router.post('/:id/valider', 
  requireRole('SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN', 'DEMANDEUR'), // Tous les rôles peuvent valider selon le contexte
  validate(validerPermisSchema), 
  permisController.valider
);

// SUSPENDRE - Suspendre un permis
router.post('/:id/suspendre', 
  requireRole('HSE', 'RESP_ZONE', 'ADMIN'), 
  permisController.suspendre
);

// ✅ REACTIVER - Réactiver un permis suspendu
router.post('/:id/reactiver', 
  requireRole('HSE', 'ADMIN'), 
  permisController.reactiver
);

// CLOTURER - Clôturer un permis
router.post('/:id/cloturer', 
  requireRole('HSE', 'SUPERVISEUR', 'ADMIN', 'DEMANDEUR'),
  permisController.cloturer
);

// FICHIER - Ajouter un fichier justificatif
router.post('/:id/ajouter-fichier', 
  upload.single('fichier'), 
  permisController.ajouterFichier
);

// EXPORT PDF - Exporter en PDF
router.get('/:id/export/pdf', 
  permisController.exportPDF
);

// VERIFY PDF - Vérifier l'intégrité du PDF
router.post('/:id/verify-pdf', 
  permisController.verifierPDF
);

// ✅ NOUVELLE ROUTE: Obtenir les actions disponibles pour un permis
router.get('/:id/actions', 
  permisController.getAvailableActions
);

// ========== ROUTES GÉNÉRIQUES (APRÈS les spécifiques) ==========

// GET BY ID - Obtenir les détails d'un permis
router.get('/:id', 
  permisController.obtenir
);

// UPDATE - Modifier un permis
router.put('/:id', 
  validate(updatePermisSchema), 
  permisController.modifier
);

// DELETE - Supprimer un permis (soft delete)
router.delete('/:id', 
  requireRole('HSE', 'ADMIN'), 
  permisController.supprimer
);

module.exports = router;