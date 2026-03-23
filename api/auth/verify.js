module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    res.json({ valid: true, user: decoded });
  } catch (decodeError) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
