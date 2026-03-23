const bcrypt = require('bcrypt');
const { pool } = require('../db');

const generateToken = (user) => {
  const payload = { uid: user.uid, email: user.email, role: user.role };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, role, displayName, assignedGH } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  const validRoles = ['user', 'supervisor', 'agronomist', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = `user_${Date.now()}`;
    const avatar = role === 'supervisor' ? '👨‍🌾' : role === 'agronomist' ? '🔬' : '👤';

    const result = await pool.query(
      `INSERT INTO users (uid, email, password, display_name, role, avatar, image_url, assigned_gh)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [uid, email, hashedPassword, displayName || email.split('@')[0], role, avatar, '', assignedGH || []]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ user: userWithoutPassword, token, expiresIn: 3600 });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
