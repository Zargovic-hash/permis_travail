// auditLog.controller.js
const auditLogService = require('../services/auditLog.service');

exports.listerLogs = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      action: req.query.action,
      cible_table: req.query.cible_table,
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const result = await auditLogService.listerLogs(filters, pagination);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Erreur audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs'
    });
  }
};