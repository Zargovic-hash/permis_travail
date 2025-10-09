const authService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
  async inscription(req, res, next) {
    try {
      logger.info('Registration attempt:', { email: req.body.email });
      
      // AJOUT : Support pour "password" ET "mot_de_passe"
      const userData = {
        ...req.body,
        mot_de_passe: req.body.password || req.body.mot_de_passe
      };
      
      const result = await authService.inscription(userData, req.ip);
      
      // Frontend expects: { token, utilisateur }
      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        token: result.accessToken,
        utilisateur: result.utilisateur
      });
    } catch (error) {
      logger.error('Erreur inscription:', error);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }

  async connexion(req, res, next) {
    try {
      // Support both 'password' and 'mot_de_passe' fields
      const { email, mot_de_passe, password } = req.body;
      const pwd = password || mot_de_passe;
      
      logger.info('Login attempt:', { email });
      
      const result = await authService.connexion(email, pwd, req.ip);
      
      // Frontend expects: { token, utilisateur }
      res.json({
        success: true,
        message: 'Connexion réussie',
        token: result.accessToken,
        utilisateur: result.utilisateur
      });
    } catch (error) {
      logger.error('Erreur connexion:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async refresh(req, res, next) {
    try {
      const { refresh_token } = req.body;
      const result = await authService.refreshAccessToken(refresh_token);
      
      res.json({
        success: true,
        token: result.accessToken
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async deconnexion(req, res, next) {
    try {
      const { refresh_token } = req.body;
      await authService.deconnexion(refresh_token, req.user?.id, req.ip);
      
      res.json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      // This is called by AuthContext on initialization
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
      }
      
      res.json({
        success: true,
        utilisateur: req.user
      });
    } catch (error) {
      next(error);
    }
  }

  async demandeResetMotDePasse(req, res, next) {
    try {
      const { email } = req.body;
      await authService.demandeResetMotDePasse(email, req.ip);
      
      res.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé'
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmerResetMotDePasse(req, res, next) {
    try {
      const { token, nouveau_mot_de_passe } = req.body;
      await authService.confirmerResetMotDePasse(token, nouveau_mot_de_passe, req.ip);
      
      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();