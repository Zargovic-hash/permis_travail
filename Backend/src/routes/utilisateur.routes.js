const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticateToken);
router.use(requireRole('HSE', 'ADMIN'));

router.get('/', utilisateurController.liste);
router.get('/:id', utilisateurController.obtenir);
router.put('/:id', utilisateurController.modifier);
router.post('/:id/supprimer', utilisateurController.supprimer);
router.post('/:id/anonymiser', utilisateurController.anonymiser);

module.exports = router;