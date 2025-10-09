const jwt = require('jsonwebtoken');
const utilisateurRepository = require('../repositories/utilisateur.repository');
const logger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const utilisateur = await utilisateurRepository.findById(decoded.id);

    if (!utilisateur || !utilisateur.actif || utilisateur.supprime) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non autorisé'
      });
    }

    req.user = utilisateur;
    next();
  } catch (error) {
    logger.error('Erreur d\'authentification:', error);
    return res.status(403).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
}

/**
 * Check if user has required role
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - rôle insuffisant'
      });
    }

    next();
  };
}

/**
 * Check if user is HSE (superuser)
 */
function requireHSE(req, res, next) {
  return requireRole('HSE', 'ADMIN')(req, res, next);
}

module.exports = {
  authenticateToken,
  requireRole,
  requireHSE
};