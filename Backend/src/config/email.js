const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  from: process.env.EMAIL_FROM || 'noreply@hse-system.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  resetTokenExpiration: parseInt(process.env.RESET_TOKEN_EXPIRATION) || 3600000
};

module.exports = emailConfig;
