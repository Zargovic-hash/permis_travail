const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.post('/seed', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Seed non autorisé en production'
      });
    }

    // FIX: Utiliser pool.query au lieu de execSync (sécurité)
    const seedPath = path.join(__dirname, '../../migrations/002_seed_data.sql');
    const seedSQL = await fs.readFile(seedPath, 'utf8');
    
    // Exécuter le SQL directement via PostgreSQL
    await pool.query(seedSQL);

    res.json({
      success: true,
      message: 'Données de seed chargées avec succès'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;