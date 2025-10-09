const express = require('express');
const router = express.Router();
const auditLogRepository = require('../repositories/auditLog.repository');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { getPaginationMeta } = require('../utils/pagination');

router.use(authenticateToken);
router.use(requireRole('HSE', 'ADMIN'));

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, utilisateur_id, action, cible_table, date_debut, date_fin } = req.query;
    
    const filters = { utilisateur_id, action, cible_table, date_debut, date_fin };
    const { data, totalCount } = await auditLogRepository.findAll(filters, { page, limit });
    
    res.json({
      success: true,
      data,
      pagination: getPaginationMeta(page, limit, totalCount)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
