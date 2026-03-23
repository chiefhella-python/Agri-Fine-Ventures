const { pool } = require('../db');

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

  try {
    const result = await pool.query('SELECT uid, email, display_name, role, avatar, image_url, assigned_gh, created_at FROM users ORDER BY created_at');
    const users = result.rows.map(row => ({
      uid: row.uid,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      avatar: row.avatar,
      imageUrl: row.image_url,
      assignedGH: row.assigned_gh,
      createdAt: row.created_at
    }));
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
