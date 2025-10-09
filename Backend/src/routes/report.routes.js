const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticateToken);
router.use(requireRole('HSE', 'ADMIN', 'SUPERVISEUR'));

router.get('/statistiques', async (req, res, next) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_permis,
        COUNT(*) FILTER (WHERE statut = 'EN_COURS') as permis_actifs,
        COUNT(*) FILTER (WHERE statut = 'VALIDE') as permis_valides,
        COUNT(*) FILTER (WHERE statut = 'SUSPENDU') as permis_suspendus,
        COUNT(*) FILTER (WHERE statut = 'CLOTURE') as permis_clotures
      FROM permis
      WHERE supprime = false
    `);

    const parZone = await pool.query(`
      SELECT z.nom, COUNT(p.id) as nombre_permis
      FROM zones z
      LEFT JOIN permis p ON z.id = p.zone_id AND p.supprime = false
      GROUP BY z.id, z.nom
      ORDER BY nombre_permis DESC
    `);

    const parType = await pool.query(`
      SELECT tp.nom, COUNT(p.id) as nombre_permis
      FROM types_permis tp
      LEFT JOIN permis p ON tp.id = p.type_permis_id AND p.supprime = false
      GROUP BY tp.id, tp.nom
      ORDER BY nombre_permis DESC
    `);

    res.json({
      success: true,
      data: {
        statistiques_globales: stats.rows[0],
        par_zone: parZone.rows,
        par_type: parType.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
