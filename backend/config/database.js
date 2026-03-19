// ============================================
// POSTGRESQL DATABASE CONFIGURATION (Neon)
// ============================================

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Create connection pool from DATABASE_URL
// Works with Neon, Supabase, Railway, and local PostgreSQL
const getPoolConfig = () => {
  const config = {
    connectionString: process.env.DATABASE_URL,
    // Increase timeouts for cloud databases
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
  };
  
  // Enable SSL for cloud databases (Neon, Supabase, Railway)
  const url = process.env.DATABASE_URL || '';
  if (url.includes('supabase') || url.includes('neon') || url.includes('railway') || url.includes('sslmode') || process.env.NODE_ENV === 'production') {
    config.ssl = { rejectUnauthorized: false };
  }
  
  return config;
};

const pool = new Pool(getPoolConfig());

// Handle pool errors and reconnect
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create users table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL DEFAULT 'Unnamed',
        role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'supervisor', 'agronomist', 'admin')),
        avatar VARCHAR(50),
        image_url TEXT,
        assigned_gh TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_role CHECK (role IN ('user', 'supervisor', 'agronomist', 'admin')),
        CONSTRAINT role_not_null CHECK (role IS NOT NULL)
      )
    `);
    
    // Add index for role-based queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `);
    
    // Add index for email lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    
    // Create admin user if not exists (with hashed password)
    const adminExists = await client.query('SELECT * FROM users WHERE uid = $1', ['admin']);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('1234', SALT_ROUNDS);
      await client.query(
        `INSERT INTO users (uid, email, password, display_name, role, avatar, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['admin', 'agrifineventures@gmail.com', hashedPassword, 'Admin', 'admin', '👑', '']
      );
      console.log('✅ PostgreSQL: Admin user created with hashed password');
    }
    
    console.log('✅ PostgreSQL: Database initialized successfully');
  } catch (err) {
    console.error('❌ PostgreSQL initialization error:', err);
  } finally {
    client.release();
  }
}

// Get all users
async function getAllUsers() {
  const result = await pool.query('SELECT * FROM users ORDER BY created_at');
  return result.rows.map(row => ({
    uid: row.uid,
    email: row.email,
    password: row.password,
    displayName: row.display_name,
    role: row.role,
    avatar: row.avatar,
    imageUrl: row.image_url,
    assignedGH: row.assigned_gh,
    createdAt: row.created_at
  }));
}

// Get user by email
async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    uid: row.uid,
    email: row.email,
    password: row.password,
    displayName: row.display_name,
    role: row.role,
    avatar: row.avatar,
    imageUrl: row.image_url,
    assignedGH: row.assigned_gh,
    createdAt: row.created_at
  };
}

// Create user
async function createUser(user) {
  const result = await pool.query(
    `INSERT INTO users (uid, email, password, display_name, role, avatar, image_url, assigned_gh)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user.uid, user.email, user.password, user.displayName, user.role, user.avatar, user.imageUrl, user.assignedGH]
  );
  return result.rows[0];
}

// Delete user
async function deleteUser(uid) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('DELETE FROM users WHERE uid = $1 RETURNING *', [uid]);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Reset all users (keep only admin)
async function resetUsers() {
  // Delete all non-admin users
  await pool.query('DELETE FROM users WHERE role != $1', ['admin']);
  
  // Ensure admin exists
  const adminExists = await pool.query('SELECT * FROM users WHERE uid = $1', ['admin']);
  if (adminExists.rows.length === 0) {
    await pool.query(
      `INSERT INTO users (uid, email, password, display_name, role, avatar, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['admin', 'agrifineventures@gmail.com', '1234', 'Admin', 'admin', '👑', '']
    );
  }
}

module.exports = {
  pool,
  initializeDatabase,
  getAllUsers,
  getUserByEmail,
  createUser,
  deleteUser,
  resetUsers
};
