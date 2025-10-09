const pool = require('../config/database');

class ZoneRepository {
  async findAll() {
    const result = await pool.query(`
      SELECT z.*, 
             u.nom as responsable_nom, 
             u.prenom as responsable_prenom
      FROM zones z
      LEFT JOIN utilisateurs u ON z.responsable_id = u.id
      ORDER BY z.nom
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(`
      SELECT z.*, 
             u.nom as responsable_nom, 
             u.prenom as responsable_prenom
      FROM zones z
      LEFT JOIN utilisateurs u ON z.responsable_id = u.id
      WHERE z.id = $1
    `, [id]);
    return result.rows[0];
  }

  async create(data) {
    const { nom, description, responsable_id } = data;
    const result = await pool.query(
      'INSERT INTO zones (nom, description, responsable_id) VALUES ($1, $2, $3) RETURNING *',
      [nom, description, responsable_id]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { nom, description, responsable_id } = data;
    const result = await pool.query(
      'UPDATE zones SET nom = $1, description = $2, responsable_id = $3 WHERE id = $4 RETURNING *',
      [nom, description, responsable_id, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM zones WHERE id = $1', [id]);
  }

  async getPermitCount(zoneId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM permis WHERE zone_id = $1 AND supprime = false',
      [zoneId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = new ZoneRepository();
