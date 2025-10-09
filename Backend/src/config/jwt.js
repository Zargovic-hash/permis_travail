const jwt = require('jsonwebtoken');

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  
  signAccessToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.accessExpiration
    });
  },
  
  signRefreshToken(payload) {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiration
    });
  },
  
  verifyAccessToken(token) {
    return jwt.verify(token, this.secret);
  },
  
  verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshSecret);
  }
};

module.exports = jwtConfig;
