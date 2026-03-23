const { pool } = require('./db');

const parseGreenhouseRow = (row) => ({
  id: row.id,
  name: row.name,
  crop: row.crop,
  variety: row.variety,
  cropEmoji: row.crop_emoji,
  plants: row.plants,
  area: row.area,
  location: row.location,
  plantedDate: row.planted_date,
  expectedHarvest: row.expected_harvest,
  status: row.status,
  environment: typeof row.environment === 'string' ? JSON.parse(row.environment) : row.environment,
  notes: row.notes,
  tasks: typeof row.tasks === 'string' ? JSON.parse(row.tasks) : row.tasks,
  sensors: typeof row.sensors === 'string' ? JSON.parse(row.sensors) : row.sensors,
  gradePrices: typeof row.grade_prices === 'string' ? JSON.parse(row.grade_prices) : row.grade_prices,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

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

  const pathParts = req.url.split('/').filter(Boolean);
  const id = pathParts[0];

  try {
    if (req.method === 'GET') {
      if (id) {
        const result = await pool.query('SELECT * FROM greenhouses WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Greenhouse not found' });
        }
        return res.json(parseGreenhouseRow(result.rows[0]));
      }
      const result = await pool.query('SELECT * FROM greenhouses ORDER BY created_at');
      return res.json(result.rows.map(parseGreenhouseRow));
    }

    if (req.method === 'POST' && (user.role === 'supervisor' || user.role === 'agronomist' || user.role === 'admin')) {
      const { name, crop, variety, plants, area, location } = req.body;
      const ghId = `gh_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO greenhouses (id, name, crop, variety, crop_emoji, plants, area, location, status, environment, tasks, sensors, grade_prices)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [ghId, name, crop || '', variety || '', '🏡', plants || 0, area || '', location || '', 'active', '{"temp": "", "humidity": "", "ph": "", "ec": ""}', '[]', '[]', '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}']
      );
      return res.status(201).json(parseGreenhouseRow(result.rows[0]));
    }

    if (req.method === 'PUT' && id && (user.role === 'supervisor' || user.role === 'agronomist' || user.role === 'admin')) {
      const updates = { ...req.body, updated_at: new Date() };
      const result = await pool.query(
        `UPDATE greenhouses SET name = COALESCE($2, name), crop = COALESCE($3, crop), variety = COALESCE($4, variety), plants = COALESCE($5, plants), area = COALESCE($6, area), location = COALESCE($7, location), status = COALESCE($8, status), notes = COALESCE($9, notes), tasks = COALESCE($10, tasks), updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id, updates.name, updates.crop, updates.variety, updates.plants, updates.area, updates.location, updates.status, updates.notes, updates.tasks ? JSON.stringify(updates.tasks) : null]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Greenhouse not found' });
      }
      return res.json(parseGreenhouseRow(result.rows[0]));
    }

    if (req.method === 'DELETE' && id && user.role === 'admin') {
      const result = await pool.query('DELETE FROM greenhouses WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Greenhouse not found' });
      }
      return res.json({ message: 'Greenhouse deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Greenhouses API error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
