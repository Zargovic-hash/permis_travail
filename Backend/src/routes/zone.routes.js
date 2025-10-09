const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.post('/', requireRole('HSE', 'ADMIN'), async (req, res, next) => {
  try {
    const { nom, description, responsable_id } = req.body;
    const result = await pool.query(
      'INSERT INTO zones (nom, description, responsable_id) VALUES ($1, $2, $3) RETURNING *',
      [nom, description, responsable_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM zones ORDER BY nom');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireRole('HSE', 'ADMIN'), async (req, res, next) => {
  try {
    const { nom, description, responsable_id } = req.body;
    const result = await pool.query(
      'UPDATE zones SET nom = $1, description = $2, responsable_id = $3 WHERE id = $4 RETURNING *',
      [nom, description, responsable_id, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireRole('HSE', 'ADMIN'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM zones WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Zone supprimée' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;