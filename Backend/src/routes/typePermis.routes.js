const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.post('/', requireRole('HSE', 'ADMIN'), async (req, res, next) => {
  try {
    const { nom, description } = req.body;
    const result = await pool.query(
      'INSERT INTO types_permis (nom, description) VALUES ($1, $2) RETURNING *',
      [nom, description]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM types_permis ORDER BY nom');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireRole('HSE', 'ADMIN'), async (req, res, next) => {
  try {
    const { nom, description } = req.body;
    const result = await pool.query(
      'UPDATE types_permis SET nom = $1, description = $2 WHERE id = $3 RETURNING *',
      [nom, description, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireRole('HSE', 'ADMIN'), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM types_permis WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Type de permis supprimé' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;