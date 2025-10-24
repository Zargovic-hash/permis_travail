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
    const { 
      page = 1, 
      limit = 50, 
      search,
      utilisateur_id, 
      action, 
      cible_table, 
      date_debut, 
      date_fin 
    } = { ...filters, ...pagination };
    
    const offset = (page - 1) * limit;
    
    // ✅ Requête avec JOIN pour récupérer le nom de l'utilisateur
    let query = `
      SELECT 
        al.*,
        u.nom as utilisateur_nom,
        u.prenom as utilisateur_prenom,
        u.email as utilisateur_email
      FROM audit_logs al
      LEFT JOIN utilisateurs u ON al.utilisateur_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    // ✅ Recherche globale incluant le nom de l'utilisateur
    if (search && search.trim() !== '') {
      paramCount++;
      query += ` AND (
        al.action ILIKE $${paramCount} OR 
        CAST(al.utilisateur_id AS TEXT) ILIKE $${paramCount} OR 
        al.cible_table ILIKE $${paramCount} OR 
        CAST(al.cible_id AS TEXT) ILIKE $${paramCount} OR
        al.ip_client ILIKE $${paramCount} OR
        u.nom ILIKE $${paramCount} OR
        u.prenom ILIKE $${paramCount} OR
        u.email ILIKE $${paramCount}
      )`;
      params.push(`%${search.trim()}%`);
    }

    if (utilisateur_id) {
      paramCount++;
      query += ` AND al.utilisateur_id = $${paramCount}`;
      params.push(utilisateur_id);
    }

    if (action) {
      paramCount++;
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
    }

    if (cible_table) {
      paramCount++;
      query += ` AND al.cible_table = $${paramCount}`;
      params.push(cible_table);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND al.date_action >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND al.date_action <= $${paramCount}::date + interval '1 day'`;
      params.push(date_fin);
    }

    // Compter le total
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/i, 
      'SELECT COUNT(DISTINCT al.id) FROM'
    );
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Ajouter ORDER BY, LIMIT et OFFSET
    query += ` ORDER BY al.date_action DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    return { 
      data: result.rows, 
      totalCount 
    };
  }

  // ✅ Méthode pour obtenir les statistiques par utilisateur
  async getStatsByUser(date_debut, date_fin) {
    const query = `
      SELECT 
        u.id,
        u.nom,
        u.prenom,
        u.email,
        COUNT(al.id) as total_actions
      FROM utilisateurs u
      LEFT JOIN audit_logs al ON u.id = al.utilisateur_id
      WHERE al.date_action >= $1 AND al.date_action <= $2
      GROUP BY u.id, u.nom, u.prenom, u.email
      ORDER BY total_actions DESC
      LIMIT 10
    `;
    
    const result = await pool.query(query, [date_debut, date_fin]);
    return result.rows;
  }
}

module.exports = new AuditLogRepository();