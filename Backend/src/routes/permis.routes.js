const express = require('express');
const router = express.Router();
const permisController = require('../controllers/permis.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const upload = require('../middlewares/upload.middleware');
const { createPermisSchema, updatePermisSchema, validerPermisSchema } = require('../validators/permis.validator');

router.use(authenticateToken);

router.post('/', validate(createPermisSchema), permisController.creer);
router.get('/', permisController.liste);
router.get('/:id', permisController.obtenir);
router.put('/:id', validate(updatePermisSchema), permisController.modifier);
router.post('/:id/valider', validate(validerPermisSchema), permisController.valider);
router.post('/:id/suspendre', requireRole('HSE', 'RESP_ZONE'), permisController.suspendre);
router.post('/:id/cloturer', permisController.cloturer);
router.post('/:id/ajouter-fichier', upload.single('fichier'), permisController.ajouterFichier);
router.get('/:id/export/pdf', permisController.exportPDF);
router.post('/:id/verify-pdf', permisController.verifierPDF);

module.exports = router;