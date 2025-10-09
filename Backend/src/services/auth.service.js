const jwt = require('jsonwebtoken');
const utilisateurRepository = require('../repositories/utilisateur.repository');
const auditLogRepository = require('../repositories/auditLog.repository');
const emailService = require('./email.service');
const pool = require('../config/database');
const { generateToken } = require('../utils/crypto');

class AuthService {
  async inscription(data, ipClient) {
    const existingUser = await utilisateurRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const utilisateur = await utilisateurRepository.create(data);
    
    // AJOUT : Générer les tokens comme dans la fonction connexion
    const accessToken = this.generateAccessToken(utilisateur);
    const refreshToken = await this.generateRefreshToken(utilisateur.id);
    
    await auditLogRepository.create({
      action: 'INSCRIPTION',
      utilisateur_id: utilisateur.id,
      cible_table: 'utilisateurs',
      cible_id: utilisateur.id,
      ip_client: ipClient
    });

    delete utilisateur.mot_de_passe_hash;
    
    // CHANGEMENT : Retourner les tokens (avant c'était juste "return utilisateur")
    return { utilisateur, accessToken, refreshToken };
  }

  async connexion(email, motDePasse, ipClient) {
    const utilisateur = await utilisateurRepository.findByEmail(email);
    
    if (!utilisateur || !utilisateur.actif) {
      await auditLogRepository.create({
        action: 'CONNEXION_ECHEC',
        cible_table: 'utilisateurs',
        payload: { email },
        ip_client: ipClient
      });
      throw new Error('Email ou mot de passe incorrect');
    }

    const isValidPassword = await utilisateurRepository.comparePassword(motDePasse, utilisateur.mot_de_passe_hash);
    
    if (!isValidPassword) {
      await auditLogRepository.create({
        action: 'CONNEXION_ECHEC',
        utilisateur_id: utilisateur.id,
        cible_table: 'utilisateurs',
        cible_id: utilisateur.id,
        ip_client: ipClient
      });
      throw new Error('Email ou mot de passe incorrect');
    }

    const accessToken = this.generateAccessToken(utilisateur);
    const refreshToken = await this.generateRefreshToken(utilisateur.id);

    await auditLogRepository.create({
      action: 'CONNEXION',
      utilisateur_id: utilisateur.id,
      cible_table: 'utilisateurs',
      cible_id: utilisateur.id,
      ip_client: ipClient
    });

    delete utilisateur.mot_de_passe_hash;
    return { utilisateur, accessToken, refreshToken };
  }

  generateAccessToken(utilisateur) {
    return jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
    );
  }

  async generateRefreshToken(utilisateurId) {
    const token = generateToken(64);
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

    await pool.query(
      'INSERT INTO refresh_tokens (utilisateur_id, token, date_expiration) VALUES ($1, $2, $3)',
      [utilisateurId, token, expiresAt]
    );

    return token;
  }

  async refreshAccessToken(refreshToken) {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND actif = true AND date_expiration > NOW()',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Refresh token invalide ou expiré');
    }

    const utilisateur = await utilisateurRepository.findById(result.rows[0].utilisateur_id);
    if (!utilisateur || !utilisateur.actif) {
      throw new Error('Utilisateur non autorisé');
    }

    const accessToken = this.generateAccessToken(utilisateur);
    return { accessToken };
  }

  async deconnexion(refreshToken, utilisateurId, ipClient) {
    await pool.query(
      'UPDATE refresh_tokens SET actif = false WHERE token = $1',
      [refreshToken]
    );

    await auditLogRepository.create({
      action: 'DECONNEXION',
      utilisateur_id: utilisateurId,
      cible_table: 'utilisateurs',
      cible_id: utilisateurId,
      ip_client: ipClient
    });
  }

  async demandeResetMotDePasse(email, ipClient) {
    const utilisateur = await utilisateurRepository.findByEmail(email);
    if (!utilisateur) {
      return; // Ne pas révéler si l'utilisateur existe
    }

    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + parseInt(process.env.RESET_TOKEN_EXPIRATION || 3600000));

    await pool.query(
      'INSERT INTO tokens_reset_mdp (utilisateur_id, token, date_expiration) VALUES ($1, $2, $3)',
      [utilisateur.id, token, expiresAt]
    );

    await emailService.sendPasswordResetEmail(utilisateur.email, token);

    await auditLogRepository.create({
      action: 'DEMANDE_RESET_MDP',
      utilisateur_id: utilisateur.id,
      cible_table: 'utilisateurs',
      cible_id: utilisateur.id,
      ip_client: ipClient
    });
  }

  async confirmerResetMotDePasse(token, nouveauMotDePasse, ipClient) {
    const result = await pool.query(
      'SELECT * FROM tokens_reset_mdp WHERE token = $1 AND utilise = false AND date_expiration > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Token invalide ou expiré');
    }

    const resetToken = result.rows[0];
    await utilisateurRepository.updatePassword(resetToken.utilisateur_id, nouveauMotDePasse);

    await pool.query(
      'UPDATE tokens_reset_mdp SET utilise = true WHERE id = $1',
      [resetToken.id]
    );

    await auditLogRepository.create({
      action: 'RESET_MDP',
      utilisateur_id: resetToken.utilisateur_id,
      cible_table: 'utilisateurs',
      cible_id: resetToken.utilisateur_id,
      ip_client: ipClient
    });
  }
}

module.exports = new AuthService();