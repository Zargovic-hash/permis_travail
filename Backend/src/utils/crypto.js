const crypto = require('crypto');

/**
 * Generate signature hash for permit approval
 */
function generateSignatureHash(permisId, utilisateurId, timestamp) {
  const secret = process.env.PDF_SERVER_SECRET;
  const data = `${permisId}${utilisateurId}${timestamp}${secret}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate UUID
 */
function generateUUID() {
  return crypto.randomUUID();
}

module.exports = {
  generateSignatureHash,
  generateToken,
  generateUUID
};