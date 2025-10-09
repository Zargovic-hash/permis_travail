const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Système HSE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color: #7f8c8d; font-size: 14px;">
            Ce lien expirera dans ${parseInt(process.env.RESET_TOKEN_EXPIRATION) / 60000} minutes.
          </p>
          <p style="color: #7f8c8d; font-size: 14px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de réinitialisation envoyé à ${email}`);
    } catch (error) {
      logger.error('Erreur envoi email:', error);
      throw new Error('Échec de l\'envoi de l\'email');
    }
  }

  async sendPermitNotification(email, permis, action) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Notification Permis ${permis.numero_permis} - ${action}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Notification de Permis de Travail</h2>
          <p><strong>Action:</strong> ${action}</p>
          <p><strong>Numéro de permis:</strong> ${permis.numero_permis}</p>
          <p><strong>Titre:</strong> ${permis.titre}</p>
          <p><strong>Statut:</strong> ${permis.statut}</p>
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/permis/${permis.id}" 
               style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Voir le permis
            </a>
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Notification envoyée à ${email} pour permis ${permis.numero_permis}`);
    } catch (error) {
      logger.error('Erreur envoi notification:', error);
    }
  }
}

module.exports = new EmailService();