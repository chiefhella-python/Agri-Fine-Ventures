const { pool } = require('./db');

const isAuth = (req) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return JSON.parse(Buffer.from(auth.slice(7), 'base64').toString());
  } catch {
    return null;
  }
};

module.exports = async (req, res) => {
  const user = isAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const isSupervisorOrAdmin = user.role === 'supervisor' || user.role === 'agronomist' || user.role === 'admin';
  if (!isSupervisorOrAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const pathParts = req.url.split('/').filter(Boolean);
  const id = pathParts[0] ? parseInt(pathParts[0]) : null;

  try {
    if (req.method === 'GET') {
      if (id) {
        const result = await pool.query('SELECT * FROM workers WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Worker not found' });
        }
        return res.json(result.rows[0]);
      }
      const result = await pool.query('SELECT * FROM workers ORDER BY created_at DESC');
      return res.json(result.rows);
    }

    if (req.method === 'POST' && isSupervisorOrAdmin) {
      const { name, phone, email, salary, salary_paid, transaction_code, role, notes } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Worker name is required' });
      }
      const result = await pool.query(
        `INSERT INTO workers (name, phone, email, salary, salary_paid, transaction_code, role, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, phone || '', email || '', salary || 0, salary_paid || 0, transaction_code || '', role || 'worker', notes || '']
      );
      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT' && id && user.role === 'admin') {
      const { name, phone, email, salary, salary_paid, transaction_code, role, notes } = req.body;
      const result = await pool.query(
        `UPDATE workers SET name = COALESCE($2, name), phone = COALESCE($3, phone), email = COALESCE($4, email), salary = COALESCE($5, salary), salary_paid = COALESCE($6, salary_paid), transaction_code = COALESCE($7, transaction_code), role = COALESCE($8, role), notes = COALESCE($9, notes), updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id, name, phone, email, salary, salary_paid, transaction_code, role, notes]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      return res.json(result.rows[0]);
    }

    if (req.method === 'DELETE' && id && user.role === 'admin') {
      const result = await pool.query('DELETE FROM workers WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      return res.json({ message: 'Worker deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Workers API error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
