const auditLogRepository = require('../repositories/auditLog.repository');

class AuditLogService {
  async creerLog(data) {
    return auditLogRepository.create(data);
  }

  async listerLogs(filters, pagination) {
    return auditLogRepository.findAll(filters, pagination);
  }

  async exporterLogs(filters, format = 'json') {
    const { data } = await auditLogRepository.findAll(filters, { page: 1, limit: 10000 });
    
    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return data;
  }

  convertToCSV(logs) {
    const headers = ['ID', 'Action', 'Utilisateur', 'Table Cible', 'ID Cible', 'Date', 'IP Client'];
    const rows = logs.map(log => [
      log.id,
      log.action,
      log.utilisateur_id || 'Système',
      log.cible_table || '',
      log.cible_id || '',
      new Date(log.date_action).toISOString(),
      log.ip_client || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

module.exports = new AuditLogService();
