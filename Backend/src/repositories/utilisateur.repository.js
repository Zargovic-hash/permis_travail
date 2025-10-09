const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UtilisateurRepository {
  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10, role, actif, search } = { ...filters, ...pagination };
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM utilisateurs WHERE supprime = false';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND role = ${paramCount}`;
      params.push(role);
    }

    if (actif !== undefined) {
      paramCount++;
      query += ` AND actif = ${paramCount}`;
      params.push(actif);
    }

    if (search) {
      paramCount++;
      query += ` AND (nom ILIKE ${paramCount} OR prenom ILIKE ${paramCount} OR email ILIKE ${paramCount})`;
      params.push(`%${search}%`);
    }

    const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const totalCount = parseInt(countResult.rows[0].count);

    query += ` ORDER BY date_creation DESC LIMIT ${paramCount + 1} OFFSET ${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return { data: result.rows, totalCount };
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM utilisateurs WHERE id = $1 AND supprime = false',
      [id]
    );
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1 AND supprime = false',
      [email]
    );
    return result.rows[0];
  }

  async create(data) {
    const { nom, prenom, email, mot_de_passe, role = 'DEMANDEUR', habilitations } = data;
    const hashedPassword = await bcrypt.hash(mot_de_passe, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    const result = await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe_hash, role, habilitations)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nom, prenom, email, hashedPassword, role, JSON.stringify(habilitations || {})]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(data).forEach(key => {
      if (key !== 'id' && key !== 'mot_de_passe' && data[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = ${paramCount}`);
        values.push(typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
    });

    if (fields.length === 0) return this.findById(id);

    paramCount++;
    fields.push(`date_modification = ${paramCount}`);
    values.push(new Date());

    values.push(id);
    const query = `UPDATE utilisateurs SET ${fields.join(', ')} WHERE id = ${paramCount + 1} RETURNING *`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async softDelete(id) {
    const result = await pool.query(
      'UPDATE utilisateurs SET supprime = true, date_modification = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  async anonymize(id) {
    const uuid = require('uuid').v4();
    const result = await pool.query(
      `UPDATE utilisateurs 
       SET nom = $1, prenom = $1, email = $2, anonymise = true, date_modification = NOW()
       WHERE id = $3 RETURNING *`,
      [`SUPPRIME-${uuid}`, `supprime-${uuid}@anonyme.local`, id]
    );
    return result.rows[0];
  }

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    await pool.query(
      'UPDATE utilisateurs SET mot_de_passe_hash = $1, date_modification = NOW() WHERE id = $2',
      [hashedPassword, id]
    );
  }
}

module.exports = new UtilisateurRepository();