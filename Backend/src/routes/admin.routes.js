const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { execSync } = require('child_process');
const path = require('path');

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

    const seedPath = path.join(__dirname, '../../migrations/002_seed_data.sql');
    execSync(`psql ${process.env.DATABASE_URL} < ${seedPath}`);

    res.json({
      success: true,
      message: 'Données de seed chargées avec succès'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;