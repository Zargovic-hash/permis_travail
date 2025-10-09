const pool = require('../config/database');

class PermisRepository {
  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10, zone_id, type_permis_id, statut, demandeur_id, date_debut, date_fin } = { ...filters, ...pagination };
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, 
             tp.nom as type_permis_nom,
             z.nom as zone_nom,
             u.nom as demandeur_nom,
             u.prenom as demandeur_prenom
      FROM permis p
      LEFT JOIN types_permis tp ON p.type_permis_id = tp.id
      LEFT JOIN zones z ON p.zone_id = z.id
      LEFT JOIN utilisateurs u ON p.demandeur_id = u.id
      WHERE p.supprime = false
    `;
    const params = [];
    let paramCount = 0;

    if (zone_id) {
      paramCount++;
      query += ` AND p.zone_id = ${paramCount}`;
      params.push(zone_id);
    }

    if (type_permis_id) {
      paramCount++;
      query += ` AND p.type_permis_id = ${paramCount}`;
      params.push(type_permis_id);
    }

    if (statut) {
      paramCount++;
      query += ` AND p.statut = ${paramCount}`;
      params.push(statut);
    }

    if (demandeur_id) {
      paramCount++;
      query += ` AND p.demandeur_id = ${paramCount}`;
      params.push(demandeur_id);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND p.date_debut >= ${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND p.date_fin <= ${paramCount}`;
      params.push(date_fin);
    }

    const countQuery = query.replace(/SELECT p\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    query += ` ORDER BY p.date_creation DESC LIMIT ${paramCount + 1} OFFSET ${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return { data: result.rows, totalCount };
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT p.*, 
              tp.nom as type_permis_nom,
              z.nom as zone_nom,
              u.nom as demandeur_nom,
              u.prenom as demandeur_prenom
       FROM permis p
       LEFT JOIN types_permis tp ON p.type_permis_id = tp.id
       LEFT JOIN zones z ON p.zone_id = z.id
       LEFT JOIN utilisateurs u ON p.demandeur_id = u.id
       WHERE p.id = $1 AND p.supprime = false`,
      [id]
    );
    return result.rows[0];
  }

  async create(data) {
    const {
      numero_permis, type_permis_id, zone_id, titre, description,
      date_debut, date_fin, demandeur_id, conditions_prealables,
      mesures_prevention, resultat_tests_atmos
    } = data;

    const result = await pool.query(
      `INSERT INTO permis (
        numero_permis, type_permis_id, zone_id, titre, description,
        date_debut, date_fin, demandeur_id, conditions_prealables,
        mesures_prevention, resultat_tests_atmos, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'BROUILLON')
      RETURNING *`,
      [
        numero_permis, type_permis_id, zone_id, titre, description,
        date_debut, date_fin, demandeur_id,
        JSON.stringify(conditions_prealables || {}),
        JSON.stringify(mesures_prevention || {}),
        JSON.stringify(resultat_tests_atmos || {})
      ]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(data).forEach(key => {
      if (key !== 'id' && data[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = ${paramCount}`);
        const value = ['conditions_prealables', 'mesures_prevention', 'resultat_tests_atmos', 'justificatifs'].includes(key)
          ? JSON.stringify(data[key])
          : data[key];
        values.push(value);
      }
    });

    if (fields.length === 0) return this.findById(id);

    paramCount++;
    fields.push(`date_modification = ${paramCount}`);
    values.push(new Date());

    values.push(id);
    const query = `UPDATE permis SET ${fields.join(', ')} WHERE id = ${paramCount + 1} RETURNING *`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateStatus(id, statut) {
    const result = await pool.query(
      'UPDATE permis SET statut = $1, date_modification = NOW() WHERE id = $2 RETURNING *',
      [statut, id]
    );
    return result.rows[0];
  }

  async createApproval(data) {
    const { permis_id, utilisateur_id, role_app, statut, commentaire, signature_image_path, signature_hash } = data;
    const result = await pool.query(
      `INSERT INTO approbations (permis_id, utilisateur_id, role_app, statut, commentaire, signature_image_path, signature_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [permis_id, utilisateur_id, role_app, statut, commentaire, signature_image_path, signature_hash]
    );
    return result.rows[0];
  }

  async getApprovals(permisId) {
    const result = await pool.query(
      `SELECT a.*, u.nom, u.prenom, u.role
       FROM approbations a
       JOIN utilisateurs u ON a.utilisateur_id = u.id
       WHERE a.permis_id = $1
       ORDER BY a.date_action ASC`,
      [permisId]
    );
    return result.rows;
  }

  async generateNumeroPermis() {
    const year = new Date().getFullYear();
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM permis WHERE EXTRACT(YEAR FROM date_creation) = $1`,
      [year]
    );
    const count = parseInt(result.rows[0].count) + 1;
    return `PT-${year}-${String(count).padStart(5, '0')}`;
  }
}

module.exports = new PermisRepository();