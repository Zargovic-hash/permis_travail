const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class AdminController {
  async seed(req, res, next) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Seed non autorisé en production'
        });
      }

      const seedPath = path.join(__dirname, '../../migrations/002_seed_data.sql');
      const seedSQL = await fs.readFile(seedPath, 'utf8');
      
      await pool.query(seedSQL);

      res.json({
        success: true,
        message: 'Données de seed chargées avec succès'
      });
    } catch (error) {
      next(error);
    }
  }

  async healthCheck(req, res, next) {
    try {
      // Check database connection
      await pool.query('SELECT 1');
      
      // Check uploads directory
      const uploadsDir = process.env.UPLOAD_DIR || './uploads';
      await fs.access(uploadsDir);

      res.json({
        success: true,
        data: {
          status: 'healthy',
          database: 'connected',
          storage: 'accessible',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Service dégradé',
        error: error.message
      });
    }
  }

  async systemInfo(req, res, next) {
    try {
      const dbStats = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM utilisateurs WHERE supprime = false) as total_utilisateurs,
          (SELECT COUNT(*) FROM permis WHERE supprime = false) as total_permis,
          (SELECT COUNT(*) FROM zones) as total_zones,
          (SELECT COUNT(*) FROM types_permis) as total_types,
          (SELECT COUNT(*) FROM audit_logs) as total_logs
      `);

      res.json({
        success: true,
        data: {
          version: '1.0.0',
          environment: process.env.NODE_ENV,
          nodejs_version: process.version,
          ...dbStats.rows[0]
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
