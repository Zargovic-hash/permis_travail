const pool = require('../config/database');

class AuditLogRepository {
  async create(data) {
    const { action, utilisateur_id, cible_table, cible_id, payload, ip_client } = data;
    const result = await pool.query(
      `INSERT INTO audit_logs (action, utilisateur_id, cible_table, cible_id, payload, ip_client)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [action, utilisateur_id, cible_table, cible_id, JSON.stringify(payload || {}), ip_client]
    );
    return result.rows[0];
  }

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 50, utilisateur_id, action, cible_table, date_debut, date_fin } = { ...filters, ...pagination };
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (utilisateur_id) {
      paramCount++;
      query += ` AND utilisateur_id = ${paramCount}`;
      params.push(utilisateur_id);
    }

    if (action) {
      paramCount++;
      query += ` AND action = ${paramCount}`;
      params.push(action);
    }

    if (cible_table) {
      paramCount++;
      query += ` AND cible_table = ${paramCount}`;
      params.push(cible_table);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND date_action >= ${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND date_action <= ${paramCount}`;
      params.push(date_fin);
    }

    const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const totalCount = parseInt(countResult.rows[0].count);

    query += ` ORDER BY date_action DESC LIMIT ${paramCount + 1} OFFSET ${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return { data: result.rows, totalCount };
  }
}

module.exports = new AuditLogRepository();