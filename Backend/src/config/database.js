const { Pool } = require('pg');
const logger = require('../utils/logger');

// Utiliser DATABASE_URL si disponible, sinon les variables séparées
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT) || 5432,
        database: process.env.DATABASE_NAME || 'hse_permits',
        user: process.env.DATABASE_USER || 'postgres',
        password: String(process.env.DATABASE_PASSWORD || ''),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

pool.on('connect', () => {
  logger.info('Connexion à la base de données établie');
});

pool.on('error', (err) => {
  logger.error('Erreur inattendue sur la connexion PostgreSQL', err);
});

// Test de connexion au démarrage
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('❌ Impossible de se connecter à la base de données:', err.message);
  } else {
    logger.info('✓ Base de données connectée:', res.rows[0].now);
  }
});

module.exports = pool;