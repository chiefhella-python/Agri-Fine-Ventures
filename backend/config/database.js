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
    ssl: { rejectUnauthorized: false },
    // Increase timeouts for cloud databases
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    // Pool configuration for better performance
    max: 20, // Maximum number of clients
    min: 2,  // Minimum number of idle clients
    allowExitOnIdle: false,
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
      CREATE TABLE IF NOT EXISTS public.users (
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
      CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role)
    `);
    
    // Add index for email lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email)
    `);
    
    // Add assigned_gh column if it doesn't exist (for supervisors/agronomists)
    try {
      await client.query(`
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS assigned_gh TEXT[]
      `);
      console.log('✅ PostgreSQL: added assigned_gh column');
    } catch (e) {
      // Column might already exist or be added by another process
    }
    
    // Create supervisor_greenhouses junction table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.supervisor_greenhouses (
        id SERIAL PRIMARY KEY,
        supervisor_id VARCHAR(255) NOT NULL,
        greenhouse_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(supervisor_id, greenhouse_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_supervisor_greenhouses_supervisor ON public.supervisor_greenhouses(supervisor_id)
    `);
    console.log('✅ PostgreSQL: supervisor_greenhouses table ready');
    
    // Create admin user if not exists (with hashed password)
    const adminExists = await client.query('SELECT * FROM public.users WHERE uid = $1', ['admin']);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('1234', SALT_ROUNDS);
      await client.query(
        `INSERT INTO public.users (uid, email, password, display_name, role, avatar, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['admin', 'agrifineventures@gmail.com', hashedPassword, 'Admin', 'admin', '👑', '']
      );
      console.log('✅ PostgreSQL: Admin user created with hashed password');
    }
    
    // Create workers table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.workers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        salary DECIMAL(10,2) DEFAULT 0,
        salary_paid DECIMAL(10,2) DEFAULT 0,
        transaction_code VARCHAR(100),
        role VARCHAR(50) DEFAULT 'worker',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add index for name search
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workers_name ON public.workers(name)
    `);
    
    console.log('✅ PostgreSQL: Database initialized successfully');
  } catch (err) {
    console.error('❌ PostgreSQL initialization error:', err);
  } finally {
    client.release();
  }
}

// Get all users
async function getAllUsers() {
  const result = await pool.query(`
    SELECT
      u.id,
      u.email,
      u.display_name,
      u.role,
      u.avatar,
      u.image_url,
      COALESCE(
        json_agg(
          json_build_object(
            'id', g.id,
            'name', g.name
          )
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS greenhouses
    FROM users u
    LEFT JOIN supervisor_greenhouses sg
      ON sg.supervisor_id = u.id::uuid
    LEFT JOIN greenhouses g
      ON g.id = sg.greenhouse_id
    GROUP BY
      u.id,
      u.email,
      u.display_name,
      u.role,
      u.avatar,
      u.image_url
    ORDER BY u.created_at DESC;
  `);
  return result.rows.map(row => {
    let greenhouses = row.greenhouses;
    if (!greenhouses || !Array.isArray(greenhouses)) {
      greenhouses = [];
    }
    return {
    uid: row.uid,
      email: row.email,
      name: row.display_name,
      displayName: row.display_name,
      role: row.role,
      avatar: row.avatar,
      imageUrl: row.image_url,
      assignedGH: greenhouses,
    };
  });
}

// Get user by email
async function getUserByEmail(email) {
  const query = `
  SELECT
    u.uid,
    u.email,
    u.password,
    u.display_name,
    u.role
  FROM users u
  WHERE u.email = $1
`;
  const result = await pool.query(query, [email]);

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    uid: row.uid,
    name: row.display_name,
    email: row.email,
    password: row.password,
    displayName: row.display_name,
    role: row.role
  };
}

// Create user
async function createUser(user) {
  const assignedGH = user.assignedGH && Array.isArray(user.assignedGH) 
    ? user.assignedGH 
    : [];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO public.users (uid, email, password, display_name, role, avatar, image_url, assigned_gh)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user.email, user.password, user.displayName, user.role, user.avatar || '👤', user.imageUrl || '', assignedGH]
    );
    
    const newUser = result.rows[0];
    
    // Also add to junction table
    if (assignedGH.length > 0) {
      for (const ghId of assignedGH) {
        await client.query(
          'INSERT INTO public.supervisor_greenhouses (supervisor_id, greenhouse_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [newUser.uid, ghId]
        );
      }
    }
    
    await client.query('COMMIT');
    return newUser;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Delete user
async function deleteUser(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('DELETE FROM public.users WHERE id = $1::uuid RETURNING *', [id]);
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
  await pool.query('DELETE FROM public.users WHERE role != $1', ['admin']);
  
  // Ensure admin exists
  const adminExists = await pool.query('SELECT * FROM public.users WHERE uid = $1', ['admin']);
  if (adminExists.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('1234', SALT_ROUNDS);
    await pool.query(
      `INSERT INTO users (uid, email, password, display_name, role, avatar, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['admin', 'agrifineventures@gmail.com', hashedPassword, 'Admin', 'admin', '👑', '']
    );
  }
}

// Reset all workers
async function resetWorkers() {
  await pool.query('DELETE FROM public.workers');
}

// Reset all greenhouses - clear per-greenhouse data but keep greenhouse records
async function resetGreenhouses() {
  await pool.query(`
    UPDATE public.greenhouses 
    SET planted_date = NULL,
        expected_harvest = NULL,
        status = 'inactive',
        crop = '',
        variety = '',
        plants = 0,
        environment = '{"temp": "", "humidity": "", "ph": "", "ec": ""}',
        notes = '',
        tasks = '[]',
        sensors = '[]',
        grade_prices = '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}',
        updated_at = CURRENT_TIMESTAMP
  `);
}

// Full system reset
async function resetAll() {
  await resetUsers();
  await resetWorkers();
  await resetGreenhouses();
}

// Get greenhouse by ID
async function getGreenhouseById(id) {
  const result = await pool.query('SELECT * FROM public.greenhouses WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return parseGreenhouseRow(result.rows[0]);
}

// Get all greenhouses
async function getAllGreenhouses() {
  const result = await pool.query(`
    SELECT 
      g.*,
      EXTRACT(DAY FROM NOW() - g.planted_date)::INTEGER AS age_days,
      EXTRACT(DAY FROM g.expected_harvest - NOW())::INTEGER AS days_to_harvest
    FROM public.greenhouses g
    ORDER BY g.created_at
  `);
  return result.rows.map(parseGreenhouseRow);
}

// Get greenhouses for supervisor
async function getSupervisorGreenhouses(supervisorId) {
  const result = await pool.query(`
    SELECT 
      g.*,
      EXTRACT(DAY FROM NOW() - g.planted_date)::INTEGER AS age_days,
      EXTRACT(DAY FROM g.expected_harvest - NOW())::INTEGER AS days_to_harvest
    FROM public.greenhouses g
    INNER JOIN public.supervisor_greenhouses sg ON sg.greenhouse_id = g.id
    WHERE sg.supervisor_id = $1
    ORDER BY g.created_at
  `, [supervisorId]);
  return result.rows.map(parseGreenhouseRow);
}

// Create greenhouse
async function createGreenhouse(greenhouse) {
  const result = await pool.query(
    `INSERT INTO public.greenhouses (id, name, crop, variety, crop_emoji, plants, area, location, planted_date, expected_harvest, status, environment, notes, tasks, sensors, grade_prices)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING *`,
    [
      greenhouse.id,
      greenhouse.name,
      greenhouse.crop || '',
      greenhouse.variety || '',
      greenhouse.cropEmoji || '🏡',
      greenhouse.plants || 0,
      greenhouse.area || '',
      greenhouse.location || '',
      greenhouse.plantedDate,
      greenhouse.expectedHarvest,
      greenhouse.status || 'active',
      JSON.stringify(greenhouse.environment || { temp: '', humidity: '', ph: '', ec: '' }),
      greenhouse.notes || '',
      JSON.stringify(greenhouse.tasks || []),
      JSON.stringify(greenhouse.sensors || []),
      JSON.stringify(greenhouse.gradePrices || { grade1: 0, grade2: 0, grade3: 0, reject: 0 })
    ]
  );
  return parseGreenhouseRow(result.rows[0]);
}

// Update greenhouse
async function updateGreenhouse(id, updates) {
  const result = await pool.query(
    `UPDATE public.greenhouses SET 
       name = COALESCE($2, name),
       crop = COALESCE($3, crop),
       variety = COALESCE($4, variety),
       crop_emoji = COALESCE($5, crop_emoji),
       plants = COALESCE($6, plants),
       area = COALESCE($7, area),
       location = COALESCE($8, location),
       planted_date = $9,
       expected_harvest = $10,
       status = COALESCE($11, status),
       environment = COALESCE($12, environment),
       notes = COALESCE($13, notes),
       tasks = COALESCE($14, tasks),
       sensors = COALESCE($15, sensors),
       grade_prices = COALESCE($16, grade_prices),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [
      id,
      updates.name,
      updates.crop,
      updates.variety,
      updates.cropEmoji,
      updates.plants,
      updates.area,
      updates.location,
      updates.plantedDate,
      updates.expectedHarvest,
      updates.status,
      updates.environment ? JSON.stringify(updates.environment) : null,
      updates.notes,
      updates.tasks ? JSON.stringify(updates.tasks) : null,
      updates.sensors ? JSON.stringify(updates.sensors) : null,
      updates.gradePrices ? JSON.stringify(updates.gradePrices) : null
    ]
  );
  if (result.rows.length === 0) return null;
  return parseGreenhouseRow(result.rows[0]);
}

// Delete greenhouse
async function deleteGreenhouse(id) {
  const result = await pool.query('DELETE FROM public.greenhouses WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
}

// Initialize greenhouses table
async function initializeGreenhouses() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.greenhouses (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        crop VARCHAR(255) DEFAULT '',
        variety VARCHAR(255) DEFAULT '',
        crop_emoji VARCHAR(50) DEFAULT '🏡',
        plants INTEGER DEFAULT 0,
        area VARCHAR(50) DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        planted_date TIMESTAMP,
        expected_harvest TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        environment JSONB DEFAULT '{"temp": "", "humidity": "", "ph": "", "ec": ""}',
        notes TEXT DEFAULT '',
        tasks JSONB DEFAULT '[]',
        sensors JSONB DEFAULT '[]',
        grade_prices JSONB DEFAULT '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const existing = await client.query('SELECT COUNT(*) FROM public.greenhouses');
    if (parseInt(existing.rows[0].count) === 0) {
      for (let i = 1; i <= 5; i++) {
        await client.query(
          `INSERT INTO public.greenhouses (id, name, crop_emoji, plants, status, environment, tasks, sensors, grade_prices)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [`gh_${i}`, `Greenhouse ${i}`, '🏡', 0, 'active', '{"temp": "", "humidity": "", "ph": "", "ec": ""}', '[]', '[]', '{"grade1": 0, "grade2": 0, "grade3": 0, "reject": 0}']
        );
      }
      console.log('✅ PostgreSQL: 5 default greenhouses created');
    }
    console.log('✅ PostgreSQL: Greenhouses table ready');
  } catch (err) {
    console.error('❌ PostgreSQL greenhouses init error:', err.message);
  } finally {
    client.release();
  }
}

function parseGreenhouseRow(row) {
  return {
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
    ageDays: row.age_days,
    daysToHarvest: row.days_to_harvest,
    status: row.status,
    environment: typeof row.environment === 'string' ? JSON.parse(row.environment) : row.environment,
    notes: row.notes,
    tasks: typeof row.tasks === 'string' ? JSON.parse(row.tasks) : row.tasks,
    sensors: typeof row.sensors === 'string' ? JSON.parse(row.sensors) : row.sensors,
    gradePrices: typeof row.grade_prices === 'string' ? JSON.parse(row.grade_prices) : row.grade_prices,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Workers CRUD
async function getAllWorkers() {
  const result = await pool.query('SELECT * FROM public.workers ORDER BY created_at DESC');
  return result.rows;
}

async function getWorkerById(id) {
  const result = await pool.query('SELECT * FROM public.workers WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function createWorker(worker) {
  const result = await pool.query(
    `INSERT INTO public.workers (name, phone, email, salary, salary_paid, transaction_code, role, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      worker.name,
      worker.phone || '',
      worker.email || '',
      worker.salary || 0,
      worker.salary_paid || 0,
      worker.transaction_code || '',
      worker.role || 'worker',
      worker.notes || ''
    ]
  );
  return result.rows[0];
}

async function updateWorker(id, updates) {
  const result = await pool.query(
    `UPDATE public.workers SET 
       name = COALESCE($2, name),
       phone = COALESCE($3, phone),
       email = COALESCE($4, email),
       salary = COALESCE($5, salary),
       salary_paid = COALESCE($6, salary_paid),
       transaction_code = COALESCE($7, transaction_code),
       role = COALESCE($8, role),
       notes = COALESCE($9, notes),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [
      id,
      updates.name,
      updates.phone,
      updates.email,
      updates.salary,
      updates.salary_paid,
      updates.transaction_code,
      updates.role,
      updates.notes
    ]
  );
  return result.rows[0] || null;
}

async function deleteWorker(id) {
  const result = await pool.query('DELETE FROM public.workers WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
}

// Update supervisor greenhouse assignments
async function updateSupervisorGreenhouses(supervisorId, greenhouseIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Delete existing assignments
    await client.query('DELETE FROM public.supervisor_greenhouses WHERE supervisor_id = $1', [supervisorId]);
    
    // Insert new assignments
    if (greenhouseIds && greenhouseIds.length > 0) {
      for (const ghId of greenhouseIds) {
        await client.query(
          'INSERT INTO public.supervisor_greenhouses (supervisor_id, greenhouse_id) VALUES ($1, $2)',
          [supervisorId, ghId]
        );
      }
    }
    
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating supervisor greenhouses:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initializeDatabase,
  initializeGreenhouses,
  getAllUsers,
  getUserByEmail,
  createUser,
  deleteUser,
  resetUsers,
  resetWorkers,
  resetGreenhouses,
  resetAll,
  getAllGreenhouses,
  getSupervisorGreenhouses,
  getGreenhouseById,
  createGreenhouse,
  updateGreenhouse,
  deleteGreenhouse,
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
  updateSupervisorGreenhouses
};
