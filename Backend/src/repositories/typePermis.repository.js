const pool = require('../config/database');

class TypePermisRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM types_permis ORDER BY nom');
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM types_permis WHERE id = $1', [id]);
    return result.rows[0];
  }

  async create(data) {
    const { nom, description } = data;
    const result = await pool.query(
      'INSERT INTO types_permis (nom, description) VALUES ($1, $2) RETURNING *',
      [nom, description]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { nom, description } = data;
    const result = await pool.query(
      'UPDATE types_permis SET nom = $1, description = $2 WHERE id = $3 RETURNING *',
      [nom, description, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM types_permis WHERE id = $1', [id]);
  }

  async getPermitCount(typeId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM permis WHERE type_permis_id = $1 AND supprime = false',
      [typeId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = new TypePermisRepository();
