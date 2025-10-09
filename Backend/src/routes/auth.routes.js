const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validation.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  inscriptionSchema,
  connexionSchema,
  resetMotDePasseSchema,
  confirmResetSchema
} = require('../validators/auth.validator');

// IMPORTANT: Match frontend endpoints exactly
// Frontend calls /api/auth/register and /api/auth/login

// Register endpoint (frontend expects /register)
router.post('/register', validate(inscriptionSchema), authController.inscription);

// Login endpoint (frontend expects /login)
router.post('/login', authLimiter, validate(connexionSchema), authController.connexion);

// Refresh token
router.post('/refresh', authController.refresh);

// Logout
router.post('/logout', authController.deconnexion);

// Get current user (for auth initialization)
router.get('/me', authController.getCurrentUser || ((req, res) => {
  res.json({
    success: true,
    utilisateur: req.user
  });
}));

// Password reset
router.post('/forgot-password', validate(resetMotDePasseSchema), authController.demandeResetMotDePasse);
router.post('/reset-password', validate(confirmResetSchema), authController.confirmerResetMotDePasse);

// Keep old French endpoints for backward compatibility (optional)
router.post('/inscription', validate(inscriptionSchema), authController.inscription);
router.post('/connexion', authLimiter, validate(connexionSchema), authController.connexion);
router.post('/deconnexion', authController.deconnexion);

module.exports = router;