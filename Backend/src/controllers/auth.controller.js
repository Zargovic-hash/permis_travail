// auth.controller.js
const authService = require('../services/auth.service');
const logger = require('../utils/logger');
const axios = require('axios');

class AuthController {
  async inscription(req, res, next) {
    try {
      logger.info('Registration attempt:', { email: req.body.email });
      
      const userData = {
        ...req.body,
        mot_de_passe: req.body.password || req.body.mot_de_passe
      };
      
      const result = await authService.inscription(userData, req.ip);
      
      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        token: result.accessToken,
        refreshToken: result.refreshToken,
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
      const { email, mot_de_passe, password } = req.body;
      const pwd = password || mot_de_passe;
      
      logger.info('Login attempt:', { email });
      
      const result = await authService.connexion(email, pwd, req.ip);
      
      res.json({
        success: true,
        message: 'Connexion réussie',
        token: result.accessToken,
        refreshToken: result.refreshToken,
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
      
      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token manquant'
        });
      }
      
      const result = await authService.refreshAccessToken(refresh_token);
      
      res.json({
        success: true,
        token: result.accessToken
      });
    } catch (error) {
      logger.error('Erreur refresh token:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Refresh token invalide'
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
      logger.error('Erreur déconnexion:', error);
      res.json({
        success: true,
        message: 'Déconnexion réussie'
      });
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      if (!req.user) {
        logger.warn('getCurrentUser called without authenticated user');
        return res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
      }
      
      const { mot_de_passe_hash, ...safeUser } = req.user;
      
      res.json({
        success: true,
        utilisateur: safeUser
      });
    } catch (error) {
      logger.error('Erreur getCurrentUser:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
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