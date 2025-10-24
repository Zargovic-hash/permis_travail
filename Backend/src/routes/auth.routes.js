const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  inscriptionSchema,
  connexionSchema,
  resetMotDePasseSchema,
  confirmResetSchema
} = require('../validators/auth.validator');

// ✅ FIX: Ajouter routes /register et /login (attendues par frontend)
router.post('/register', authLimiter, validate(inscriptionSchema), authController.inscription);
router.post('/login', authLimiter, validate(connexionSchema), authController.connexion);

// Garder aussi les routes françaises pour rétrocompatibilité
router.post('/inscription', authLimiter, validate(inscriptionSchema), authController.inscription);
router.post('/connexion', authLimiter, validate(connexionSchema), authController.connexion);

// Refresh token
router.post('/refresh', authController.refresh);

// Logout (nécessite auth)
router.post('/logout', authenticateToken, authController.deconnexion);
router.post('/deconnexion', authenticateToken, authController.deconnexion);

// Current user (CRITIQUE: doit avoir authenticateToken)
router.get('/me', authenticateToken, authController.getCurrentUser);

// Password reset
router.post('/forgot-password', validate(resetMotDePasseSchema), authController.demandeResetMotDePasse);
router.post('/reset-password', validate(confirmResetSchema), authController.confirmerResetMotDePasse);

module.exports = router;